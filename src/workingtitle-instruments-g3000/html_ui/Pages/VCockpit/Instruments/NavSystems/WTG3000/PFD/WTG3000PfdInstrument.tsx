import { CasSystem, CompositeLogicXMLHost, FSComponent, PluginSystem, SetSubject, Subject, TrafficInstrument, Vec2Math, VNode, Wait } from '@microsoft/msfs-sdk';

import {
  AdfRadioNavSource, DefaultAltimeterDataProvider, DefaultGpsIntegrityDataProvider, DefaultRadarAltimeterDataProvider,
  DefaultVNavDataProvider, DefaultWindDataProvider, Fms, GpsNavSource,
  NavRadioNavSource,
  NavReferenceIndicatorsCollection,
  NavReferenceSource, NavReferenceSourceCollection
} from '@microsoft/msfs-garminsdk';

import {
  AvionicsConfig, AvionicsStatus, AvionicsStatusChangeEvent, ConnextWeatherPaneView, DisplayPaneContainer, DisplayPaneIndex, DisplayPaneViewFactory,
  DisplayPaneViewKeys, FlightPlanListManager, FlightPlanStore, G3000ActiveSourceNavIndicator, G3000ApproachPreviewDataProvider, G3000ApproachPreviewNavIndicator,
  G3000BearingPointerNavIndicator, G3000DmeInfoNavIndicator, G3000FilePaths, G3000NavIndicator, G3000NavIndicatorName, G3000NavIndicators, G3000NavInfoNavIndicator,
  G3000NavSourceName, G3000NavSources, InstrumentBackplaneNames, NavigationMapPaneView, NearestPaneView, ObsAutoSlew, PfdIndex, PfdUserSettings,
  ProcedurePreviewPaneView, TrafficMapPaneView, WaypointInfoPaneView, WeatherRadarPaneView, WTG3000BaseInstrument, WTG3000FsInstrument
} from '@microsoft/msfs-wtg3000-common';

import { PfdInstrumentContainer } from './Components/InstrumentContainer/PfdInstrumentContainer';
import { PfdConfig } from './Config/PfdConfig';
import { G3000PfdPlugin, G3000PfdPluginBinder } from './G3000PFDPlugin';
import { PfdBaroKnobInputHandler } from './Input/PfdBaroKnobInputHandler';
import { PfdCourseKnobInputHandler } from './Input/PfdCourseKnobInputHandler';
import { PfdMapJoystickInputHandler } from './Input/PfdMapJoystickInputHandler';
import { TrafficAuralAlertManager } from './Traffic/TrafficAuralAlertManager';

import './WTG3000_PFD.css';

/**
 * A G3000/5000 PFD instrument.
 * Primary Flight Display showing the the basic flight instruments.
 */
export class WTG3000PfdInstrument extends WTG3000FsInstrument {

  /** @inheritdoc */
  protected readonly iauIndex = this.instrumentConfig.iauIndex;

  private readonly iauAliasedSettingManager = this.iauSettingManager.getAliasedManager(this.iauIndex);

  private readonly highlightRef = FSComponent.createRef<HTMLElement>();
  private readonly displayPaneContainerRef = FSComponent.createRef<DisplayPaneContainer>();

  private readonly bootSplashCssClass = SetSubject.create(['pfd-boot-splash']);

  private readonly flightPlanStore = new FlightPlanStore(this.bus, this.fms, Fms.PRIMARY_PLAN_INDEX, this.config.vnav.advanced);

  private readonly flightPlanListManager = new FlightPlanListManager(this.bus, this.flightPlanStore, this.fms, Fms.PRIMARY_PLAN_INDEX, Subject.create(false));

  private readonly navSources: G3000NavSources;
  private readonly navIndicators: G3000NavIndicators;
  private readonly obsAutoSlew = [] as ObsAutoSlew[];

  private readonly trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
  private readonly trafficAvionicsSystem = this.config.traffic.resolve()(this.bus, this.trafficInstrument, 10000);
  private readonly trafficSystem = this.trafficAvionicsSystem.trafficSystem;

  // We are running the traffic aural alert manager on the PFD instead of the MFD because the instruments all run their
  // own independent traffic computations. Therefore, the advisories between different instruments can be desynced.
  // Since the PFD is the location where most visual traffic alerts are displayed, we want to sync the aurals with the
  // PFD visuals.
  private readonly trafficAuralAlertManager = this.instrument.instrumentIndex === 1 ? new TrafficAuralAlertManager(this.bus, this.trafficSystem) : undefined;

  private readonly casSystem = new CasSystem(this.bus);

  private readonly displayPaneViewFactory = new DisplayPaneViewFactory();

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.bus, this.instrument.instrumentIndex as PfdIndex);

  private readonly gpsIntegrityDataProvider = new DefaultGpsIntegrityDataProvider(this.bus, this.instrument.instrumentIndex as PfdIndex);

  private readonly radarAltimeterDataProvider = this.config.sensors.hasRadarAltimeter
    ? new DefaultRadarAltimeterDataProvider(this.bus)
    : undefined;

  private readonly altimeterDataProvider = new DefaultAltimeterDataProvider(
    this.bus,
    this.iauAliasedSettingManager.getSetting('iauAdcIndex'),
    { trendLookahead: this.instrumentConfig.altimeter.dataProviderOptions.trendLookahead ?? 6 },
    this.radarAltimeterDataProvider
  );

  private readonly windDataProvider = new DefaultWindDataProvider(
    this.bus,
    this.iauAliasedSettingManager.getSetting('iauAdcIndex'),
    this.iauAliasedSettingManager.getSetting('iauAhrsIndex'),
    this.instrument.instrumentIndex
  );

  private readonly vnavDataProvider = new DefaultVNavDataProvider(
    this.bus,
    this.fms,
    this.iauAliasedSettingManager.getSetting('iauAdcIndex')
  );

  private readonly approachPreviewDataProvider: G3000ApproachPreviewDataProvider;

  private readonly courseKnobHandler: PfdCourseKnobInputHandler;
  private readonly baroKnobHandler: PfdBaroKnobInputHandler;
  private readonly mapJoystickHandler: PfdMapJoystickInputHandler;

  private readonly logicHost = new CompositeLogicXMLHost();

  private readonly pluginSystem = new PluginSystem<G3000PfdPlugin, G3000PfdPluginBinder>();

  /**
   * Constructor.
   * @param instrument This instrument's parent BaseInstrument.
   * @param config This instrument's general configuration object.
   * @param instrumentConfig This instrument's instrument-specific configuration object.
   */
  constructor(instrument: BaseInstrument, config: AvionicsConfig, private readonly instrumentConfig: PfdConfig) {
    super('PFD', instrument, config);

    this.flightPlanStore.init();

    this.createSystems();

    const navSources: NavReferenceSource<G3000NavSourceName>[] = [
      new NavRadioNavSource<G3000NavSourceName>(this.bus, 'NAV1', 1),
      new NavRadioNavSource<G3000NavSourceName>(this.bus, 'NAV2', 2),
      new GpsNavSource<G3000NavSourceName>(this.bus, 'FMS1', 1),
      new GpsNavSource<G3000NavSourceName>(this.bus, 'FMS2', 2)
    ];

    for (let i = 1; i <= config.radios.dmeCount; i++) {
      navSources.push(new NavRadioNavSource<G3000NavSourceName>(this.bus, `DME${i as 1 | 2}`, i + 2 as 3 | 4));
    }

    for (let i = 1; i <= config.radios.adfCount; i++) {
      navSources.push(new AdfRadioNavSource<G3000NavSourceName>(this.bus, `ADF${i as 1 | 2}`, i as 1 | 2));
    }

    this.navSources = new NavReferenceSourceCollection<G3000NavSourceName>(...navSources);

    this.approachPreviewDataProvider = new G3000ApproachPreviewDataProvider(this.navSources, this.bus);

    this.navIndicators = new NavReferenceIndicatorsCollection(new Map<G3000NavIndicatorName, G3000NavIndicator>([
      ['activeSource', new G3000ActiveSourceNavIndicator(this.navSources, this.bus, 1)],
      ['bearingPointer1', new G3000BearingPointerNavIndicator(this.navSources, this.bus, 1, this.pfdSettingManager)],
      ['bearingPointer2', new G3000BearingPointerNavIndicator(this.navSources, this.bus, 2, this.pfdSettingManager)],
      ['approachPreview', new G3000ApproachPreviewNavIndicator(this.navSources, this.approachPreviewDataProvider)],
      ['navInfo', new G3000NavInfoNavIndicator(this.navSources, this.bus, 1, this.approachPreviewDataProvider)],
      ['dmeInfo', new G3000DmeInfoNavIndicator(this.navSources, this.bus, 1, config.radios.dmeCount, this.approachPreviewDataProvider)]
    ]));

    this.obsAutoSlew[0] = new ObsAutoSlew(this.navSources.get('NAV1'));
    this.obsAutoSlew[1] = new ObsAutoSlew(this.navSources.get('NAV2'));

    this.courseKnobHandler = new PfdCourseKnobInputHandler(
      this.instrument.instrumentIndex as PfdIndex,
      this.bus,
      this.navIndicators.get('activeSource')
    );

    this.baroKnobHandler = new PfdBaroKnobInputHandler(
      this.instrument.instrumentIndex as PfdIndex,
      this.bus,
      this.config.iauDefs.definitions[this.iauIndex].altimeterIndex,
      this.altimeterDataProvider,
      this.config.iauDefs.definitions[this.iauIndex].supportBaroPreselect
    );

    this.mapJoystickHandler = new PfdMapJoystickInputHandler(
      this.instrument.instrumentIndex as PfdIndex,
      this.bus
    );

    this.backplane.addInstrument(InstrumentBackplaneNames.Traffic, this.trafficInstrument);

    this.doInit().catch(e => {
      console.error(e);
    });
  }

  /** @inheritdoc */
  protected createSystems(): void {
    super.createSystems();

    this.systems.push(this.trafficAvionicsSystem);
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });
    const pluginBinder: G3000PfdPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      config: this.config,
      instrumentConfig: this.instrumentConfig,
      facLoader: this.facLoader,
      flightPathCalculator: this.flightPathCalculator,
      navIndicators: this.navIndicators,
      fms: this.fms,
      iauSettingManager: this.iauSettingManager,
      vSpeedSettingManager: this.vSpeedSettingManager,
      fmsSpeedsSettingManager: this.fmsSpeedsSettingManager,
      flightPlanStore: this.flightPlanStore,
      casSystem: this.casSystem
    };

    await this.pluginSystem.startSystem(pluginBinder);

    this.pluginSystem.callPlugins((plugin: G3000PfdPlugin) => {
      plugin.onInit();
    });

    this.backplane.init();

    this.initFlightPlan();

    this.trafficSystem.init();
    this.trafficAuralAlertManager?.init();

    this.minimumsDataProvider.init();
    this.gpsIntegrityDataProvider.init();
    this.radarAltimeterDataProvider?.init();
    this.altimeterDataProvider.init();
    this.windDataProvider.init();
    this.vnavDataProvider.init();

    this.courseKnobHandler.init();
    this.baroKnobHandler.init();
    this.mapJoystickHandler.init();

    this.casPowerStateManager.init();

    this.registerDisplayPaneViews();
    this.pluginSystem.callPlugins((plugin: G3000PfdPlugin) => {
      plugin.registerDisplayPaneViews(this.displayPaneViewFactory);
    });

    FSComponent.render(
      this.renderComponents(),
      document.getElementById('Electricity'),
    );

    (this.instrument as WTG3000BaseInstrument<this>).setHighlightElement(this.highlightRef.instance);

    this.initAvionicsStatusListener();

    this.doDelayedInit();
  }

  /**
   * Performs initialization tasks after a 500-millisecond wait.
   */
  private async doDelayedInit(): Promise<void> {
    await Wait.awaitDelay(500);

    // noop
  }

  /**
   * Registers display pane views with this instrument's display pane view factory.
   */
  private registerDisplayPaneViews(): void {
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.PfdInstrument, index => {
      return (
        <PfdInstrumentContainer
          bus={this.bus}
          fms={this.fms}
          trafficSystem={this.trafficSystem}
          index={index}
          config={this.config}
          instrumentConfig={this.instrumentConfig}
          navIndicators={this.navIndicators}
          gpsIntegrityDataProvider={this.gpsIntegrityDataProvider}
          altimeterDataProvider={this.altimeterDataProvider}
          radarAltimeterDataProvider={this.radarAltimeterDataProvider}
          minimumsDataProvider={this.minimumsDataProvider}
          windDataProvider={this.windDataProvider}
          vnavDataProvider={this.vnavDataProvider}
          casSystem={this.casSystem}
          iauSettingManager={this.iauSettingManager}
          pfdSettingManager={this.pfdSettingManager}
          vSpeedSettingManager={this.vSpeedSettingManager}
          pluginSystem={this.pluginSystem}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.NavigationMap, index => {
      return (
        <NavigationMapPaneView
          index={index} bus={this.bus}
          facLoader={this.facLoader}
          flightPlanner={this.flightPlanner}
          trafficSystem={this.trafficSystem}
          flightPlanStore={this.flightPlanStore}
          windDataProvider={this.windDataProvider}
          vnavDataProvider={this.vnavDataProvider}
          fms={this.fms}
          flightPlanListManager={this.flightPlanListManager}
          iauSettingManager={this.iauSettingManager}
          config={this.config.map}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.TrafficMap, index => {
      return (
        <TrafficMapPaneView
          index={index}
          bus={this.bus}
          flightPlanner={this.flightPlanner}
          trafficSystem={this.trafficSystem}
          iauSettingManager={this.iauSettingManager}
          config={this.config.map}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.WeatherMap, index => {
      return (
        <ConnextWeatherPaneView
          index={index}
          bus={this.bus}
          flightPlanner={this.flightPlanner}
          windDataProvider={this.windDataProvider}
          iauSettingManager={this.iauSettingManager}
          config={this.config.map}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.ProcedurePreview, index => {
      return (
        <ProcedurePreviewPaneView
          index={index}
          bus={this.bus}
          fms={this.fms}
          flightPathCalculator={this.flightPathCalculator}
          iauSettingManager={this.iauSettingManager}
          config={this.config.map}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.WaypointInfo, index => {
      return <WaypointInfoPaneView index={index} bus={this.bus} facLoader={this.facLoader} iauSettingManager={this.iauSettingManager} config={this.config.map} />;
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.Nearest, index => {
      return (
        <NearestPaneView
          index={index}
          bus={this.bus}
          facLoader={this.facLoader}
          flightPlanner={this.flightPlanner}
          trafficSystem={this.trafficSystem}
          windDataProvider={this.windDataProvider}
          iauSettingManager={this.iauSettingManager}
          config={this.config.map}
        />
      );
    });

    if (this.config.sensors.hasWeatherRadar) {
      this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.WeatherRadar, index => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return <WeatherRadarPaneView index={index} bus={this.bus} config={this.config.sensors.weatherRadarDefinition!} />;
      });
    }
  }

  /**
   * Renders this instrument's components.
   * @returns This instrument's rendered components, as a VNode.
   */
  private renderComponents(): VNode {
    const isLeftPfd = this.instrument.instrumentIndex === 1;
    const splitModeInstrumentSide = this.instrumentConfig.layout.splitModeInstrumentSide === 'auto'
      ? (isLeftPfd ? 'left' : 'right')
      : this.instrumentConfig.layout.splitModeInstrumentSide;

    return (
      <>
        <DisplayPaneContainer
          ref={this.displayPaneContainerRef}
          bus={this.bus}
          leftIndex={isLeftPfd ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument}
          rightIndex={isLeftPfd ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd}
          leftPaneFullSize={Vec2Math.create(1280, 800)}
          leftPaneHalfSize={Vec2Math.create(768, 800)}
          rightPaneFullSize={Vec2Math.create(1276, 778)}
          rightPaneHalfSize={Vec2Math.create(508, 778)}
          displayPaneViewFactory={this.displayPaneViewFactory}
          updateFreq={30}
          alternateUpdatesInSplitMode
          class={`display-pane-container-pfd display-pane-container-pfd-${splitModeInstrumentSide}`}
        />
        <glasscockpit-highlight ref={this.highlightRef} id="highlight"></glasscockpit-highlight>
        <div class={this.bootSplashCssClass}>
          <img src={`${G3000FilePaths.ASSETS_PATH}/Images/Common/garmin_logo.png`} />
        </div>
      </>
    );
  }

  /** Makes sure that we have the flight plan, requesting sync if needed. */
  private async initFlightPlan(): Promise<void> {
    await Wait.awaitDelay(2000);
    if (!this.fms.flightPlanner.hasActiveFlightPlan()) {
      // If there still is no flight plan, then this instrument was reloaded
      this.fms.flightPlanner.requestSync();
    }
  }

  /** @inheritdoc */
  protected getBootDuration(): number {
    return 4500 + Math.random() * 1000;
  }

  /** @inheritdoc */
  public Update(): void {
    super.Update();
    this.logicHost.update(this.instrument.deltaTime);
  }

  /** @inheritdoc */
  protected onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    super.onAvionicsStatusChanged(event);

    this.bootSplashCssClass.toggle('hidden', event.current !== AvionicsStatus.Off && event.current !== AvionicsStatus.Booting);

    if (event.current === AvionicsStatus.Off || event.current === AvionicsStatus.Booting) {
      this.displayPaneContainerRef.instance.sleep();
    } else {
      this.displayPaneContainerRef.instance.wake();
    }
  }
}