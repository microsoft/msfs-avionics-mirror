import {
  CasSystem, CompositeLogicXMLHost, FSComponent, HEvent, MappedSubject, PluginSystem, Subject, TrafficInstrument,
  Vec2Math, VNode, Wait
} from '@microsoft/msfs-sdk';

import {
  AdfRadioNavSource, DefaultAltimeterDataProvider, DefaultGpsIntegrityDataProvider, DefaultRadarAltimeterDataProvider,
  DefaultVNavDataProvider, DefaultWindDataProvider, Fms, NavRadioNavSource
} from '@microsoft/msfs-garminsdk';

import {
  AvionicsConfig, AvionicsStatus, ChecklistPaneView, ConnextWeatherPaneView, DisplayOverlayLayer, DisplayPaneContainer,
  DisplayPaneIndex, DisplayPaneViewFactory, DisplayPaneViewKeys, FlightPlanListManager, FlightPlanStore,
  G3000ApproachPreviewDataProvider, G3000ApproachPreviewNavIndicator, G3000BearingPointerNavIndicator,
  G3000DmeInfoNavIndicator, G3000FilePaths, G3000NavIndicator, G3000NavIndicatorName, G3000NavIndicators,
  G3000NavInfoNavIndicator, G3000NavSource, G3000NavSourceName, G3000NavSources, GduInteractionEventUtils,
  InstrumentBackplaneNames, NavigationMapPaneView, NearestPaneView, ObsAutoSlew, PfdIndex, PfdUserSettings,
  ProcedurePreviewPaneView, TrafficMapPaneView, WaypointInfoPaneView, WeatherRadarPaneView, WeightBalancePaneView,
  WeightBalancePaneViewModule, WTG3000BaseInstrument, WTG3000FsInstrument
} from '@microsoft/msfs-wtg3000-common';

import { PfdInstrumentContainer } from './Components/InstrumentContainer/PfdInstrumentContainer';
import { PfdConfig } from './Config/PfdConfig';
import { G3000PfdPlugin, G3000PfdPluginBinder } from './G3000PFDPlugin';
import { PfdBaroKnobInputHandler } from './Input/PfdBaroKnobInputHandler';
import { PfdCourseKnobInputHandler } from './Input/PfdCourseKnobInputHandler';
import { TrafficAuralAlertManager } from './Traffic/TrafficAuralAlertManager';

import './WTG3000_PFD.css';

/**
 * A G3000/5000 PFD instrument.
 * Primary Flight Display showing the the basic flight instruments.
 */
export class WTG3000PfdInstrument extends WTG3000FsInstrument {

  private readonly pfdIndex = this.instrument.instrumentIndex as PfdIndex;

  private readonly pfdSensorsAliasedSettingManager = this.pfdSensorsSettingManager.getAliasedManager(this.pfdIndex);

  private readonly displayOverlayLayerRef = FSComponent.createRef<DisplayOverlayLayer>();
  private readonly highlightRef = FSComponent.createRef<HTMLElement>();
  private readonly displayPaneContainerRef = FSComponent.createRef<DisplayPaneContainer>();

  private readonly mainContentHidden = MappedSubject.create(
    ([avionicsStatus, hide]) => hide || avionicsStatus === undefined || avionicsStatus.current !== AvionicsStatus.On,
    this.avionicsStatus,
    this.displayOverlayController.hideMainContent
  );
  private readonly displayOverlayShow = MappedSubject.create(
    ([avionicsStatus, show]) => show && avionicsStatus !== undefined && avionicsStatus.current === AvionicsStatus.On,
    this.avionicsStatus,
    this.displayOverlayController.showOverlay
  );
  private readonly bootSplashHidden = this.avionicsStatus.map(status => {
    return status === undefined
      || (status.current !== AvionicsStatus.Off && status.current !== AvionicsStatus.Booting);
  });

  private readonly hEventMap = GduInteractionEventUtils.pfdHEventMap(this.pfdIndex);

  protected readonly navSources: G3000NavSources;
  protected readonly navIndicators: G3000NavIndicators;

  private readonly flightPlanStore = new FlightPlanStore(this.bus, this.fms, Fms.PRIMARY_PLAN_INDEX, this.config.vnav.advanced);

  private readonly flightPlanListManager = new FlightPlanListManager(this.bus, this.flightPlanStore, this.fms, Fms.PRIMARY_PLAN_INDEX, Subject.create(false));

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

  private readonly pfdSettingManager = PfdUserSettings.getAliasedManager(this.bus, this.pfdIndex);

  private readonly gpsIntegrityDataProvider = new DefaultGpsIntegrityDataProvider(this.bus, this.pfdIndex);

  private readonly radarAltimeterDataProvider = this.config.sensors.hasRadarAltimeter
    ? new DefaultRadarAltimeterDataProvider(this.bus)
    : undefined;

  private readonly altimeterDataProvider = new DefaultAltimeterDataProvider(
    this.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex'),
    this.instrumentConfig.altimeter.dataProviderOptions,
    this.radarAltimeterDataProvider
  );

  private readonly windDataProvider = new DefaultWindDataProvider(
    this.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex'),
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAhrsIndex'),
    this.instrument.instrumentIndex
  );

  private readonly vnavDataProvider = new DefaultVNavDataProvider(
    this.bus,
    this.fms,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex')
  );

  private readonly approachPreviewDataProvider: G3000ApproachPreviewDataProvider;

  private readonly courseKnobHandler: PfdCourseKnobInputHandler;
  private readonly baroKnobHandler: PfdBaroKnobInputHandler;

  private readonly logicHost = new CompositeLogicXMLHost();

  private readonly pluginSystem = new PluginSystem<G3000PfdPlugin, G3000PfdPluginBinder>();

  /**
   * Constructor.
   * @param instrument This instrument's parent BaseInstrument.
   * @param config This instrument's general configuration object.
   * @param instrumentConfig This instrument's instrument-specific configuration object.
   */
  constructor(instrument: BaseInstrument, config: AvionicsConfig, private readonly instrumentConfig: PfdConfig) {
    if (instrument.instrumentIndex !== 1 && instrument.instrumentIndex !== 2) {
      throw new Error(`WTG3000PfdInstrument: invalid PFD index ${instrument.instrumentIndex} (must be 1 or 2)`);
    }

    if (instrument.instrumentIndex > config.gduDefs.pfdCount) {
      throw new Error(`WTG3000PfdInstrument: attempted to instantiate a PFD with index ${instrument.instrumentIndex} when the number of configured PFDs is only ${config.gduDefs.pfdCount}`);
    }

    super('PFD', instrument, config);

    this.flightPlanStore.init();

    this.createSystems();

    this.navSources = this.createNavReferenceSourceCollection();

    this.approachPreviewDataProvider = new G3000ApproachPreviewDataProvider(this.navSources, this.bus);

    this.navIndicators = this.createNavReferenceIndicatorCollection();

    this.obsAutoSlew[0] = new ObsAutoSlew(this.navSources.get('NAV1'));
    this.obsAutoSlew[1] = new ObsAutoSlew(this.navSources.get('NAV2'));

    this.courseKnobHandler = new PfdCourseKnobInputHandler(
      this.pfdIndex,
      this.bus,
      this.navIndicators.get('activeSource')
    );

    this.baroKnobHandler = new PfdBaroKnobInputHandler(
      this.pfdIndex,
      this.bus,
      this.config.gduDefs.pfds[this.pfdIndex].altimeterIndex,
      this.altimeterDataProvider,
      this.config.gduDefs.pfds[this.pfdIndex].supportBaroPreselect
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

  /** @inheritDoc */
  protected createNavReferenceSources(): G3000NavSource[] {
    const sources = super.createNavReferenceSources();

    for (let i = 1; i <= this.config.radios.dmeCount; i++) {
      sources.push(new NavRadioNavSource<G3000NavSourceName>(this.bus, `DME${i as 1 | 2}`, i + 2 as 3 | 4));
    }

    for (let i = 1; i <= this.config.radios.adfCount; i++) {
      sources.push(new AdfRadioNavSource<G3000NavSourceName>(this.bus, `ADF${i as 1 | 2}`, i as 1 | 2));
    }

    return sources;
  }

  /** @inheritDoc */
  protected createNavReferenceIndicators(): [G3000NavIndicatorName, G3000NavIndicator][] {
    const indicators = super.createNavReferenceIndicators();

    indicators.push(
      ['bearingPointer1', new G3000BearingPointerNavIndicator(this.navSources, this.bus, 1, this.pfdSettingManager)],
      ['bearingPointer2', new G3000BearingPointerNavIndicator(this.navSources, this.bus, 2, this.pfdSettingManager)],
      ['approachPreview', new G3000ApproachPreviewNavIndicator(this.navSources, this.approachPreviewDataProvider)],
      ['navInfo', new G3000NavInfoNavIndicator(this.navSources, this.bus, 1, this.approachPreviewDataProvider)],
      ['dmeInfo', new G3000DmeInfoNavIndicator(this.navSources, this.bus, 1, this.config.radios.dmeCount, this.approachPreviewDataProvider)]
    );

    return indicators;
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.initPlugins();

    await this.initChecklist(this.pluginSystem);

    this.backplane.init();

    this.initFlightPlan();

    this.trafficSystem.init();
    this.trafficAuralAlertManager?.init();

    this.minimumsDataProvider.init();
    this.terrainSystemStateDataProvider.init();
    this.gpsIntegrityDataProvider.init();
    this.radarAltimeterDataProvider?.init();
    this.altimeterDataProvider.init();
    this.windDataProvider.init();
    this.vnavDataProvider.init();

    this.courseKnobHandler.init();
    this.baroKnobHandler.init();

    this.casPowerStateManager.init();

    this.checklistStateProvider?.init();

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
    this.mainContentHidden.sub(this.onMainContentHiddenChanged.bind(this), true);

    this.bus.getSubscriber<HEvent>().on('hEvent').handle(this.onHEvent.bind(this));

    this.doDelayedInit();
  }

  /**
   * Initializes this instrument's plugins.
   */
  private async initPlugins(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === 'WTG3000v2_PFD';
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
      displayOverlayController: this.displayOverlayController,
      pfdSensorsSettingManager: this.pfdSensorsSettingManager,
      vSpeedSettingManager: this.vSpeedSettingManager,
      fmsSpeedsSettingManager: this.fmsSpeedsSettingManager,
      weightBalanceSettingManager: this.weightBalanceSettingManager,
      flightPlanStore: this.flightPlanStore,
      casSystem: this.casSystem
    };

    await this.pluginSystem.startSystem(pluginBinder);

    this.pluginSystem.callPlugins((plugin: G3000PfdPlugin) => {
      plugin.onInit();
    });
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
          terrainSystemStateDataProvider={this.terrainSystemStateDataProvider}
          casSystem={this.casSystem}
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
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
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
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
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
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
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
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
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
          config={this.config.map}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.WaypointInfo, index => {
      return (
        <WaypointInfoPaneView
          index={index}
          bus={this.bus}
          facLoader={this.facLoader}
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
          config={this.config.map}
        />
      );
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
          pfdSensorsSettingManager={this.pfdSensorsSettingManager}
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

    if (this.checkListDef && this.checklistStateProvider) {
      this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.Checklist, index => {
        return (
          <ChecklistPaneView
            index={index}
            halfSizeOnly
            bus={this.bus}
            checklistDef={this.checkListDef!}
            checklistStateProvider={this.checklistStateProvider!}
          />
        );
      });
    }

    if (this.config.performance.isWeightBalanceSupported) {
      let module: WeightBalancePaneViewModule | undefined;
      this.pluginSystem.callPlugins((plugin: G3000PfdPlugin) => {
        module ??= plugin.getWeightBalancePaneViewModule?.();
      }, true);

      this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.WeightBalance, index => {
        return (
          <WeightBalancePaneView
            index={index}
            bus={this.bus}
            weightLimits={this.config.performance.weightLimits}
            weightBalanceConfig={this.config.performance.weightBalanceConfig!}
            weightBalanceSettingManager={this.weightBalanceSettingManager!}
            module={module}
          />
        );
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

    const overlayVNodes: VNode[] = [];
    this.pluginSystem.callPlugins(plugin => {
      const node = plugin.renderToDisplayOverlay?.();
      if (node) {
        overlayVNodes.push(node);
      }
    });

    return (
      <>
        <div class={{ 'pfd-main-content': true, 'hidden': this.mainContentHidden }}>
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
        </div>
        <DisplayOverlayLayer ref={this.displayOverlayLayerRef} show={this.displayOverlayShow} class='pfd-display-overlay'>
          {overlayVNodes}
        </DisplayOverlayLayer>
        <glasscockpit-highlight ref={this.highlightRef} id="highlight"></glasscockpit-highlight>
        <div class={{ 'pfd-boot-splash': true, 'hidden': this.bootSplashHidden }}>
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

  /**
   * Responds to changes in whether this instrument's main content is hidden.
   * @param hidden Whether this instrument's main content is hidden.
   */
  private onMainContentHiddenChanged(hidden: boolean): void {
    if (hidden) {
      this.displayPaneContainerRef.instance.sleep();
    } else {
      this.displayPaneContainerRef.instance.wake();
    }
  }

  /**
   * Responds to when an H event is received.
   * @param hEvent The event that was received.
   */
  private onHEvent(hEvent: string): void {
    const interactionEvent = this.hEventMap(hEvent);
    if (interactionEvent !== undefined) {
      this.onGduInteractionEvent(interactionEvent);
    }
  }

  /**
   * Handles a GDU interaction event.
   * @param event The event to handle.
   */
  private onGduInteractionEvent(event: string): void {
    if (this.displayOverlayLayerRef.instance.onInteractionEvent(event)) {
      return;
    }

    // PFD instruments pane gets priority to handle events. The instruments pane is always the "left" pane.
    this.displayPaneContainerRef.instance.routeInteractionEvent('left', event)
      || this.displayPaneContainerRef.instance.routeInteractionEvent('right', event);
  }
}
