/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ClockEvents, FacilityWaypoint, FSComponent, IntersectionFacility, NdbFacility,
  PluginSystem, SetSubject, Subject, UserFacility, VNode, VorFacility, Wait, XPDRSimVarPublisher,
} from '@microsoft/msfs-sdk';
import {
  DefaultObsSuspDataProvider, DefaultVNavDataProvider, Fms, GarminFacilityWaypointCache, TrafficSystemType,
} from '@microsoft/msfs-garminsdk';
import {
  AvionicsConfig, AvionicsStatus, AvionicsStatusChangeEvent, DefaultFmsSpeedTargetDataProvider, ExistingUserWaypointsArray, FlightPlanListManager,
  FlightPlanStore, G3000ActiveSourceNavIndicator, G3000FilePaths, G3000NavIndicator, G3000NavIndicatorName, G3000NavIndicators, G3000NavSourceName,
  G3000NavSources, G3000NearestContext, G3000Plugin, GpsSource, InstrumentBackplaneNames, NavIndicatorsCollection, NavRadioNavSource, NavSource, NavSources,
  WTG3000BaseInstrument, WTG3000FsInstrument,
} from '@microsoft/msfs-wtg3000-common';

import { LabelBarPluginHandlers } from './Components';
import { GtcConfig } from './Config';
import {
  GtcAirwaySelectionDialog, GtcAltitudeDialog, GtcBaroPressureDialog, GtcCourseDialog, GtcDistanceDialog, GtcDurationDialog,
  GtcDurationDialogMSS, GtcFindWaypointDialog, GtcFmsSpeedDialog, GtcFrequencyDialog, GtcIntegerDialog, GtcKeyboardDialog, GtcLatLonDialog, GtcListDialog,
  GtcLoadFrequencyDialog, GtcLocalTimeOffsetDialog, GtcMessageDialog, GtcMinimumsSourceDialog, GtcMinuteDurationDialog, GtcRunwayLengthDialog,
  GtcSpeedConstraintDialog, GtcSpeedDialog, GtcTemperatureDialog, GtcUserWaypointDialog, GtcVnavAltitudeDialog, GtcVnavFlightPathAngleDialog, GtcWeightDialog,
} from './Dialog';
import { G3000GtcPlugin, G3000GtcPluginBinder } from './G3000GTCPlugin';
import { G3000GtcViewContext } from './G3000GtcViewContext';
import { GtcContainer, GtcInteractionHandler, GtcKnobStatePluginOverrides, GtcService, GtcViewKeys, GtcViewLifecyclePolicy } from './GtcService';
import { GtcDefaultPositionHeadingDataProvider, GtcUserWaypointEditController } from './Navigation';
import {
  GtcAdvancedVnavProfilePage, GtcAirportInfoPage, GtcApproachPage, GtcArrivalPage, GtcAudioRadiosPopup,
  GtcAvionicsSettingsPage, GtcConnextWeatherSettingsPage, GtcDeparturePage, GtcDirectToPage, GtcFlapSpeedsPage, GtcFlightPlanPage, GtcHoldPage,
  GtcIntersectionInfoPage, GtcLandingDataPage, GtcMapSettingsPage, GtcMfdHomePage, GtcMinimumsPage, GtcNavComHome, GtcNdbInfoPage, GtcNearestAirportPage,
  GtcNearestDirectoryPage, GtcNearestIntersectionPage, GtcNearestNdbPage, GtcNearestUserWaypointPage, GtcNearestVorPage,
  GtcNearestWeatherPage, GtcPerfPage, GtcPfdHomePage, GtcPfdMapSettingsPage, GtcPfdSettingsPage, GtcProceduresPage, GtcSetupPage,
  GtcSpeedBugsPage, GtcTakeoffDataPage, GtcTimerPage, GtcToldFactorDialog, GtcTrafficSettingsPage, GtcTransponderDialog, GtcTransponderModePopup,
  GtcUserWaypointInfoPage, GtcUtilitiesPage, GtcVnavProfilePage, GtcVorInfoPage, GtcWaypointInfoDirectoryPage, GtcWeatherRadarSettingsPage,
  GtcWeatherSelectionPage, GtcWeightFuelPage,
} from './Pages';
import { GtcMapPointerControlPopup } from './Popups';

import './WTG3000_GTC.css';

/**
 * A G3000/5000 GTC instrument.
 */
export class WTG3000GtcInstrument extends WTG3000FsInstrument {

  /** @inheritdoc */
  protected readonly iauIndex = this.instrumentConfig.iauIndex;

  private readonly iauAliasedSettingManager = this.iauSettingManager.getAliasedManager(this.iauIndex);

  private readonly highlightRef = FSComponent.createRef<HTMLElement>();

  private readonly bootSplashCssClass = SetSubject.create(['gtc-boot-splash', `gtc-boot-splash-${this.instrumentConfig.orientation}`]);

  private readonly xpdrSimVarPublisher = new XPDRSimVarPublisher(this.bus);

  private readonly navSources: G3000NavSources;
  private readonly navIndicators: G3000NavIndicators;

  private readonly orientation = this.instrumentConfig.orientation;
  private readonly gtcService: GtcService = new GtcService(
    this.bus,
    this.instrument.instrumentIndex,
    this.orientation,
    this.instrumentConfig.controlSetup,
    this.instrumentConfig.pfdControlIndex,
    this.instrumentConfig.paneControlIndex,
    this.config.vnav.advanced
  );

  private readonly loadNewAirwaysCollapsed = this.gtcService.gtcSettings.getSetting('loadNewAirwaysCollapsed');

  private readonly flightPlanStore = this.gtcService.hasMfdMode
    ? new FlightPlanStore(this.bus, this.fms, Fms.PRIMARY_PLAN_INDEX, this.config.vnav.advanced)
    : undefined;

  private readonly flightPlanListManager = this.gtcService.hasMfdMode
    ? new FlightPlanListManager(this.bus, this.flightPlanStore!, this.fms, Fms.PRIMARY_PLAN_INDEX, this.loadNewAirwaysCollapsed)
    : undefined;

  private readonly obsSuspDataProvider = new DefaultObsSuspDataProvider(this.bus);

  private readonly posHeadingDataProvider = new GtcDefaultPositionHeadingDataProvider(
    this.bus,
    this.iauIndex,
    this.iauAliasedSettingManager.getSetting('iauAhrsIndex'),
    30
  );
  private readonly posHeadingDataProvider1Hz = new GtcDefaultPositionHeadingDataProvider(
    this.bus,
    this.iauIndex,
    this.iauAliasedSettingManager.getSetting('iauAhrsIndex'),
    1
  );

  private readonly existingUserWaypointsArray = new ExistingUserWaypointsArray(this.facRepo, this.bus, GarminFacilityWaypointCache.getCache(this.bus));

  private readonly vnavDataProvider = new DefaultVNavDataProvider(
    this.bus,
    this.fms,
    this.iauAliasedSettingManager.getSetting('iauAdcIndex')
  );

  private readonly fmsSpeedTargetDataProvider = this.fmsSpeedsSettingManager === undefined
    ? undefined
    : new DefaultFmsSpeedTargetDataProvider(this.bus, this.fmsSpeedsSettingManager);

  private readonly userWaypointEditController = new GtcUserWaypointEditController(this.facRepo, this.fms);

  private readonly pluginSystem = new PluginSystem<G3000GtcPlugin, G3000GtcPluginBinder>();

  /**
   * Constructs a new WTG3000GtcInstrument.
   * @param instrument This instrument's parent BaseInstrument.
   * @param config This instrument's general configuration object.
   * @param instrumentConfig This instrument's instrument-specific configuration object.
   */
  constructor(instrument: BaseInstrument, config: AvionicsConfig, private readonly instrumentConfig: GtcConfig) {
    super('GTC', instrument, config);

    this.flightPlanStore?.init();

    this.createSystems();

    const navSources: NavSource<G3000NavSourceName>[] = [
      new NavRadioNavSource<G3000NavSourceName>(this.bus, 'NAV1', 1),
      new NavRadioNavSource<G3000NavSourceName>(this.bus, 'NAV2', 2),
      new GpsSource<G3000NavSourceName>(this.bus, 'FMS1', 1),
      new GpsSource<G3000NavSourceName>(this.bus, 'FMS2', 2)
    ];

    this.navSources = new NavSources<G3000NavSourceName>(...navSources);

    this.navIndicators = new NavIndicatorsCollection(new Map<G3000NavIndicatorName, G3000NavIndicator>([
      ['activeSource', new G3000ActiveSourceNavIndicator(this.navSources, this.bus, 1)]
    ]));

    this.backplane.addPublisher(InstrumentBackplaneNames.Xpdr, this.xpdrSimVarPublisher);

    this.doInit();
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });
    const pluginBinder: G3000GtcPluginBinder = {
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
      gtcService: this.gtcService,
      flightPlanStore: this.flightPlanStore,
    };

    await this.pluginSystem.startSystem(pluginBinder);

    this.pluginSystem.callPlugins((plugin: G3000Plugin) => {
      plugin.onInit();
    });

    this.backplane.init();

    this.minimumsDataProvider.init();
    this.obsSuspDataProvider.init();
    this.posHeadingDataProvider.init();
    this.posHeadingDataProvider1Hz.init();
    this.vnavDataProvider.init();
    this.fmsSpeedTargetDataProvider?.init();

    this.casPowerStateManager.init();

    this.initNearestContext();

    FSComponent.render(
      this.renderComponents(),
      document.getElementById('Electricity')
    );

    (this.instrument as WTG3000BaseInstrument<this>).setHighlightElement(this.highlightRef.instance);

    // ---- Attach plugin knob state overrides ----
    const knobStateOverrides: GtcKnobStatePluginOverrides[] = [];
    this.pluginSystem.callPlugins((plugin: G3000GtcPlugin) => {
      const overrides = plugin.getKnobStateOverrides(this.gtcService);
      if (overrides) {
        knobStateOverrides.push(overrides);
      }
    });
    this.gtcService.attachPluginKnobStateOverrides(knobStateOverrides);

    // ---- Attach plugin interaction event handler ----
    const interactionEventHandlers: GtcInteractionHandler[] = [];
    this.pluginSystem.callPlugins((plugin: G3000GtcPlugin) => {
      interactionEventHandlers.push(plugin);
    });
    this.gtcService.attachPluginInteractionhandler({
      /** @inheritdoc */
      onGtcInteractionEvent(event) {
        for (let i = interactionEventHandlers.length - 1; i >= 0; i--) {
          if (interactionEventHandlers[i].onGtcInteractionEvent(event)) {
            return true;
          }
        }

        return false;
      }
    });

    // ---- Register GTC views ----
    // Must be called *after* GtcContainer has rendered, since it's the parent
    // element of the views which are about to be registered and rendered.

    const context: G3000GtcViewContext = {
      posHeadingDataProvider: this.posHeadingDataProvider,
      posHeadingDataProvider1Hz: this.posHeadingDataProvider1Hz,
      minimumsDataProvider: this.minimumsDataProvider,
      vnavDataProvider: this.vnavDataProvider,
      obsSuspDataProvider: this.obsSuspDataProvider,
      fmsSpeedTargetDataProvider: this.fmsSpeedTargetDataProvider,
      flightPlanListManager: this.flightPlanListManager,
      wptInfoSelectedIntersection: Subject.create<FacilityWaypoint<IntersectionFacility> | null>(null),
      wptInfoSelectedVor: Subject.create<FacilityWaypoint<VorFacility> | null>(null),
      wptInfoSelectedNdb: Subject.create<FacilityWaypoint<NdbFacility> | null>(null),
      wptInfoSelectedUserWpt: Subject.create<FacilityWaypoint<UserFacility> | null>(null),
      userWptEditController: this.userWaypointEditController,
      existingUserWptArray: this.existingUserWaypointsArray
    };

    this.registerViews(context);
    this.pluginSystem.callPlugins((plugin: G3000GtcPlugin) => {
      plugin.registerGtcViews(this.gtcService, context);
    });

    this.gtcService.initialize();
    this.initFlightPlan();

    this.initAvionicsStatusListener();
  }

  /**
   * Renders this instrument's components.
   * @returns This instrument's rendered components, as a VNode.
   */
  private renderComponents(): VNode {
    // ---- Get plugin label bar handlers ----
    const labelBarHandlers: LabelBarPluginHandlers[] = [];
    this.pluginSystem.callPlugins((plugin: G3000GtcPlugin) => {
      const handlers = plugin.getLabelBarHandlers();
      if (handlers) {
        labelBarHandlers.push(handlers);
      }
    });

    return (
      <>
        <GtcContainer gtcService={this.gtcService} config={this.config} pluginLabelBarHandlers={labelBarHandlers} />
        <div class={this.bootSplashCssClass}>
          <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/garmin_logo_gtc.png`} class="gtc-boot-splash-icon" />
        </div>
        <div class="left-edge-border-fix" />
        <glasscockpit-highlight ref={this.highlightRef} id="highlight"></glasscockpit-highlight>
      </>
    );
  }

  /**
   * Registers all default GTC views with the GTC service.
   * @param context A context containing references to items used to create the default GTC views.
   */
  private registerViews(context: Readonly<G3000GtcViewContext>): void {

    const supportPerfPage = this.config.vnav.advanced || this.config.performance.isToldSupported;

    // ---- PFD ----

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.PfdHome, 'PFD',
      (gtcService, controlMode) => {
        return (
          <GtcPfdHomePage
            gtcService={gtcService}
            controlMode={controlMode}
            radiosConfig={this.config.radios}
            activeNavIndicator={this.navIndicators.get('activeSource')}
            obsSuspDataProvider={context.obsSuspDataProvider}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.SpeedBugs, 'PFD',
      (gtcService, controlMode) => {
        return (
          <GtcSpeedBugsPage
            gtcService={gtcService}
            controlMode={controlMode}
            vSpeedGroups={this.vSpeedSettingManager.vSpeedGroups}
            vSpeedSettingManager={this.vSpeedSettingManager}
            isToldSupported={this.config.performance.isToldSupported}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Timer, 'PFD',
      (gtcService, controlMode) => <GtcTimerPage gtcService={gtcService} controlMode={controlMode} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Minimums, 'PFD',
      (gtcService, controlMode) => <GtcMinimumsPage gtcService={gtcService} controlMode={controlMode} minimumsDataProvider={context.minimumsDataProvider} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.PfdMapSettings, 'PFD',
      (gtcService, controlMode) => {
        return (
          <GtcPfdMapSettingsPage
            gtcService={gtcService}
            controlMode={controlMode}
            trafficSystemType={this.config.traffic.type}
            adsb={this.config.traffic.supportAdsb}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.PfdSettings, 'PFD',
      (gtcService, controlMode) => <GtcPfdSettingsPage gtcService={gtcService} controlMode={controlMode} horizonConfig={this.config.horizon} />
    );

    // ---- MFD ----

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.MfdHome, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcMfdHomePage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} supportPerfPage={supportPerfPage} />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MapSettings, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcMapSettingsPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            trafficSystemType={this.config.traffic.type}
            adsb={this.config.traffic.supportAdsb}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.TrafficSettings, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcTrafficSettingsPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            trafficSystemType={this.config.traffic.type}
            adsb={this.config.traffic.supportAdsb}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.WeatherSelection, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcWeatherSelectionPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            hasWeatherRadar={this.config.sensors.hasWeatherRadar}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.ConnextWeatherSettings, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcConnextWeatherSettingsPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    if (this.config.sensors.weatherRadarDefinition !== undefined) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.WeatherRadarSettings, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => <GtcWeatherRadarSettingsPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
      );
    }

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.DirectTo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcDirectToPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
            flightPlanStore={this.flightPlanStore!}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.FlightPlan, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcFlightPlanPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex!}
            fms={this.fms}
            planIndex={Fms.PRIMARY_PLAN_INDEX}
            store={this.flightPlanStore!}
            listManager={context.flightPlanListManager!}
          />
        );
      }
    );
    if (this.config.vnav.advanced) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.AdvancedVnavProfile, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcAdvancedVnavProfilePage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex!}
              fms={this.fms}
              flightPlanStore={this.flightPlanStore!}
              vnavDataProvider={context.vnavDataProvider}
              fmsSpeedSettingManager={this.fmsSpeedsSettingManager!}
              fmsSpeedTargetDataProvider={context.fmsSpeedTargetDataProvider!}
            />
          );
        }
      );
    } else {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.VnavProfile, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcVnavProfilePage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex!}
              fms={this.fms}
              store={this.flightPlanStore!}
              vnavDataProvider={context.vnavDataProvider}
            />
          );
        }
      );
    }

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Hold, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => (
        <GtcHoldPage
          gtcService={gtcService}
          controlMode={controlMode}
          displayPaneIndex={displayPaneIndex}
          fms={this.fms}
        />
      )
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Procedures, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcProceduresPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            planIndex={Fms.PRIMARY_PLAN_INDEX}
            store={this.flightPlanStore!}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.Departure, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcDeparturePage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            planIndex={Fms.PRIMARY_PLAN_INDEX}
            store={this.flightPlanStore!}
            calculator={this.flightPathCalculator}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.Arrival, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcArrivalPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            planIndex={Fms.PRIMARY_PLAN_INDEX}
            store={this.flightPlanStore!}
            calculator={this.flightPathCalculator}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.Approach, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcApproachPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            planIndex={Fms.PRIMARY_PLAN_INDEX}
            store={this.flightPlanStore!}
            calculator={this.flightPathCalculator}
            allowRnpAr={this.config.fms.approach.supportRnpAr}
            minimumsDataProvider={context.minimumsDataProvider}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Utilities, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcUtilitiesPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            minimumsDataProvider={context.minimumsDataProvider}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Timer, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcTimerPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Setup, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcSetupPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.AvionicsSettings, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcAvionicsSettingsPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            horizonDirectorCueOption={this.config.horizon.directorCue}
            auralAlertsConfig={this.config.auralAlerts}
            touchdownCalloutsConfig={this.config.taws.touchdownCallouts}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.SpeedBugs, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcSpeedBugsPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            vSpeedGroups={this.vSpeedSettingManager.vSpeedGroups}
            vSpeedSettingManager={this.vSpeedSettingManager}
            isToldSupported={this.config.performance.isToldSupported}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.WeightAndFuel, 'MFD',
      (gtcService, controlMode, displayPaneIndex) =>
        <GtcWeightFuelPage
          gtcService={gtcService}
          controlMode={controlMode}
          displayPaneIndex={displayPaneIndex}
          destinationFacility={this.flightPlanStore!.destinationFacility}
          weightLimits={this.config.performance.weightLimits}
          gpsHasFailed={context.posHeadingDataProvider.isGpsDataFailed}
        />
    );

    if (supportPerfPage) {
      const includeFlapSpeeds = this.config.vnav.fmsSpeeds !== undefined && this.fmsSpeedsSettingManager !== undefined;

      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.Perf, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcPerfPage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              perfConfig={this.config.performance}
              includeFlapSpeeds={includeFlapSpeeds}
            />
          );
        }
      );

      if (this.config.performance.isToldSupported) {
        this.gtcService.registerView(
          GtcViewLifecyclePolicy.Static,
          GtcViewKeys.TakeoffData, 'MFD',
          (gtcService, controlMode, displayPaneIndex) => {
            return (
              <GtcTakeoffDataPage
                gtcService={gtcService}
                controlMode={controlMode}
                displayPaneIndex={displayPaneIndex}
                facLoader={this.facLoader}
                perfConfig={this.config.performance}
                vSpeedGroups={this.config.vSpeedGroups}
                flightPlanStore={this.flightPlanStore!}
                vSpeedSettingManager={this.vSpeedSettingManager}
              />
            );
          }
        );

        this.gtcService.registerView(
          GtcViewLifecyclePolicy.Static,
          GtcViewKeys.LandingData, 'MFD',
          (gtcService, controlMode, displayPaneIndex) => {
            return (
              <GtcLandingDataPage
                gtcService={gtcService}
                controlMode={controlMode}
                displayPaneIndex={displayPaneIndex}
                facLoader={this.facLoader}
                perfConfig={this.config.performance}
                vSpeedGroups={this.config.vSpeedGroups}
                flightPlanStore={this.flightPlanStore!}
                posHeadingDataProvider={context.posHeadingDataProvider}
              />
            );
          }
        );
      }

      if (includeFlapSpeeds) {
        this.gtcService.registerView(
          GtcViewLifecyclePolicy.Transient,
          GtcViewKeys.FlapSpeeds, 'MFD',
          (gtcService, controlMode, displayPaneIndex) => {
            return (
              <GtcFlapSpeedsPage
                gtcService={gtcService}
                controlMode={controlMode}
                displayPaneIndex={displayPaneIndex}
                fmsSpeedsConfig={this.config.vnav.fmsSpeeds!}
                fmsSpeedsSettingManager={this.fmsSpeedsSettingManager!}
              />
            );
          }
        );
      }
    }

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.WaypointInfo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcWaypointInfoDirectoryPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.AirportInfo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcAirportInfoPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            facLoader={this.facLoader}
            posHeadingDataProvider={context.posHeadingDataProvider}
            fms={this.fms}
            flightPlanStore={this.flightPlanStore!}
            allowRnpAr={this.config.fms.approach.supportRnpAr}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.IntersectionInfo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcIntersectionInfoPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            facLoader={this.facLoader}
            posHeadingDataProvider={context.posHeadingDataProvider}
            selectedIntersection={context.wptInfoSelectedIntersection}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.VorInfo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcVorInfoPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            facLoader={this.facLoader}
            posHeadingDataProvider={context.posHeadingDataProvider}
            selectedVor={context.wptInfoSelectedVor}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NdbInfo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNdbInfoPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            facLoader={this.facLoader}
            posHeadingDataProvider={context.posHeadingDataProvider}
            selectedNdb={context.wptInfoSelectedNdb}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.UserWaypointInfo, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcUserWaypointInfoPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            facLoader={this.facLoader}
            posHeadingDataProvider={context.posHeadingDataProvider}
            controller={context.userWptEditController}
            userWaypoints={context.existingUserWptArray}
            selectedUserWaypoint={context.wptInfoSelectedUserWpt}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Nearest, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcNearestDirectoryPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NearestAirport, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNearestAirportPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
            allowRnpAr={this.config.fms.approach.supportRnpAr}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NearestIntersection, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNearestIntersectionPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NearestVor, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNearestVorPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NearestNdb, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNearestNdbPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NearestUserWaypoint, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNearestUserWaypointPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.NearestWeather, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcNearestWeatherPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.MapPointerControl, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcMapPointerControlPopup gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    // ---- NAV/COM ----

    if (this.gtcService.isHorizontal) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Static,
        GtcViewKeys.NavComHome, 'NAV_COM',
        (gtcService, controlMode) =>
          <GtcNavComHome
            gtcService={gtcService}
            controlMode={controlMode}
            tcasIsSupported={this.config.traffic.type === TrafficSystemType.TcasII} />
      );
    }
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.AudioRadios, 'NAV_COM',
      (gtcService, controlMode) => {
        return (
          <GtcAudioRadiosPopup
            gtcService={gtcService}
            controlMode={controlMode}
            radiosConfig={this.config.radios}
            activeNavIndicator={this.navIndicators.get('activeSource')}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Transponder, 'NAV_COM',
      (gtcService, controlMode) => {
        return (
          <GtcTransponderDialog
            gtcService={gtcService}
            controlMode={controlMode}
            layout={this.config.traffic.type === TrafficSystemType.TcasII ? 'CODE_ONLY' : 'MODE_AND_CODE'}
          />
        );
      }
    );
    if (this.config.traffic.type === TrafficSystemType.TcasII) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.TransponderMode, 'NAV_COM',
        (gtcService, controlMode) => <GtcTransponderModePopup gtcService={gtcService} controlMode={controlMode} />
      );
    }

    // ---- Popups and Dialogs ----

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MessageDialog1, 'PFD',
      (gtcService, controlMode) => <GtcMessageDialog gtcService={gtcService} controlMode={controlMode} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MessageDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcMessageDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MessageDialog1, 'NAV_COM',
      (gtcService, controlMode) => <GtcMessageDialog gtcService={gtcService} controlMode={controlMode} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.ListDialog1, 'PFD',
      (gtcService, controlMode) => <GtcListDialog gtcService={gtcService} controlMode={controlMode} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.ListDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcListDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.ListDialog1, 'NAV_COM',
      (gtcService, controlMode) => <GtcListDialog gtcService={gtcService} controlMode={controlMode} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.KeyboardDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcKeyboardDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      GtcViewKeys.FindWaypointDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => (
        <GtcFindWaypointDialog
          gtcService={gtcService}
          controlMode={controlMode}
          displayPaneIndex={displayPaneIndex}
          posHeadingDataProvider={context.posHeadingDataProvider1Hz}
        />
      )
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.FrequencyDialog, 'NAV_COM',
      (gtcService, controlMode) => <GtcFrequencyDialog gtcService={gtcService} controlMode={controlMode} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.LoadFrequencyDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcLoadFrequencyDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.DurationDialog1, 'PFD',
      (gtcService, controlMode) => <GtcDurationDialog gtcService={gtcService} controlMode={controlMode} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.DurationDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcDurationDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.DurationDialogMSS1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcDurationDialogMSS gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.DistanceDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcDistanceDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.AltitudeDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcAltitudeDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.SpeedDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcSpeedDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.TemperatureDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcTemperatureDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.WeightDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcWeightDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.IntegerDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcIntegerDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.LocalTimeOffsetDialog, 'PFD',
      (gtcService, controlMode) => <GtcLocalTimeOffsetDialog gtcService={gtcService} controlMode={controlMode} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.LocalTimeOffsetDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcLocalTimeOffsetDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MinimumsSourceDialog, 'PFD',
      (gtcService, controlMode) => <GtcMinimumsSourceDialog gtcService={gtcService} controlMode={controlMode} supportRadarMins={this.config.sensors.hasRadarAltimeter} />
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MinimumsSourceDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcMinimumsSourceDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            supportRadarMins={this.config.sensors.hasRadarAltimeter}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.VnavAltitudeDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcVnavAltitudeDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.VnavFlightPathAngleDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcVnavFlightPathAngleDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    if (this.config.vnav.advanced) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.SpeedConstraintDialog, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcSpeedConstraintDialog
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              generalSpeedLimits={this.config.vnav.fmsSpeeds!.generalLimits}
            />
          );
        }
      );
    }

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.AirwaySelectionDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcAirwaySelectionDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            calculator={this.flightPathCalculator}
            fms={this.fms}
            store={this.flightPlanStore!}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.RunwayLengthDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcRunwayLengthDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.CourseDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcCourseDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.BaroPressureDialog1, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcBaroPressureDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.LatLonDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcLatLonDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MinuteDurationDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) =>
        <GtcMinuteDurationDialog gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
    );

    if (this.config.vnav.advanced) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.FmsSpeedDialog, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcFmsSpeedDialog
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              generalSpeedLimits={this.config.vnav.fmsSpeeds!.generalLimits}
            />
          );
        }
      );
    }

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Static,
      GtcViewKeys.UserWaypointDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcUserWaypointDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            facRepo={this.facRepo}
            facLoader={this.facLoader}
            controller={context.userWptEditController}
            posHeadingDataProvider={context.posHeadingDataProvider}
          />
        );
      }
    );

    if (this.config.performance.isToldSupported) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.ToldFactorDialog, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcToldFactorDialog
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
            />
          );
        }
      );
    }
  }

  /**
   * Initializes this instrument's nearest context.
   */
  private async initNearestContext(): Promise<void> {
    await this.facLoader.awaitInitialization();

    const context = G3000NearestContext.initializeInstance(this.facLoader, this.bus, this.iauIndex);

    this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(0.5).handle(() => {
      context.update();
    });
  }

  /** Makes sure that we have the flight plan, requesting sync if needed. */
  private async initFlightPlan(): Promise<void> {
    await Wait.awaitDelay(3000);
    if (!this.fms.flightPlanner.hasActiveFlightPlan()) {
      // If there still is no flight plan, then this instrument was reloaded
      this.fms.flightPlanner.requestSync();
    } else {
      // TODO Remove before flight, this is temp code used to make testing easier
      if (this.gtcService.displayPaneControlIndex === 1 && this.gtcService.hasMfdMode) {
        // DevPlan.setupDevPlan(this.fms).catch(error => console.error(error));
      }
    }
  }

  /** @inheritdoc */
  protected getBootDuration(): number {
    return 2250 + Math.random() * 500;
  }

  /** @inheritdoc */
  protected onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    super.onAvionicsStatusChanged(event);

    this.bootSplashCssClass.toggle('hidden', event.current !== AvionicsStatus.Off && event.current !== AvionicsStatus.Booting);

    if (event.previous === AvionicsStatus.Off && event.current !== AvionicsStatus.Off) {
      this.gtcService.reset();
    } else if (event.previous === AvionicsStatus.On && event.current !== AvionicsStatus.On) {
      this.gtcService.sleep();
    }

    if (event.current === AvionicsStatus.On) {
      this.gtcService.wake();
    }
  }
}