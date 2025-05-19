import {
  CasSystem, ClockEvents, FacilityWaypoint, FSComponent, HEvent, IntersectionFacility, MappedSubject, NdbFacility,
  PluginSystem, Subject, UserFacility, VNode, VorFacility, Wait, XPDRSimVarPublisher,
} from '@microsoft/msfs-sdk';

import {
  DefaultObsSuspDataProvider, DefaultVNavDataProvider, Fms, GarminExistingUserWaypointsArray,
  GarminFacilityWaypointCache, TrafficSystemType
} from '@microsoft/msfs-garminsdk';

import {
  AvionicsConfig, AvionicsStatus, AvionicsStatusChangeEvent, DefaultFmsSpeedTargetDataProvider, DisplayOverlayLayer,
  FlightPlanListManager, FlightPlanStore, G3000FacilityUtils, G3000FilePaths, G3000NearestContext, G3000Plugin,
  InstrumentBackplaneNames, WTG3000BaseInstrument, WTG3000FsInstrument
} from '@microsoft/msfs-wtg3000-common';

import { LabelBarPluginHandlers } from './Components';
import { GtcConfig } from './Config';
import {
  GtcAirwaySelectionDialog, GtcAltitudeDialog, GtcBaroPressureDialog, GtcBaroTransitionAlertAltitudeDialog,
  GtcCourseDialog, GtcDistanceDialog, GtcDuplicateWaypointDialog, GtcDurationDialog, GtcDurationDialogMSS,
  GtcFindWaypointDialog, GtcFmsSpeedDialog, GtcFrequencyDialog, GtcIntegerDialog, GtcLatLonDialog, GtcListDialog,
  GtcLoadFrequencyDialog, GtcLocalTimeOffsetDialog, GtcMessageDialog, GtcMinimumsSourceDialog, GtcMinuteDurationDialog,
  GtcMomentArmDialog, GtcRunwayLengthDialog, GtcSpeedConstraintDialog, GtcSpeedDialog, GtcTemperatureDialog,
  GtcTextDialog, GtcUserWaypointDialog, GtcVnavAltitudeDialog, GtcVnavFlightPathAngleDialog, GtcWaypointDialog,
  GtcWeightDialog
} from './Dialog';
import { G3000GtcPlugin, G3000GtcPluginBinder } from './G3000GTCPlugin';
import { G3000GtcViewContext } from './G3000GtcViewContext';
import {
  GtcContainer, GtcInteractionEvent, GtcInteractionEventUtils, GtcInteractionHandler, GtcKnobStatePluginOverrides, GtcService, GtcViewKeys,
  GtcViewLifecyclePolicy
} from './GtcService';
import { GtcDefaultPositionHeadingDataProvider, GtcUserWaypointEditController } from './Navigation';
import {
  GtcAdvancedVnavProfilePage, GtcAirportInfoPage, GtcApproachPage, GtcArrivalPage, GtcAudioRadiosPopup,
  GtcAvionicsSettingsPage, GtcChartsPage, GtcChecklistPage, GtcConnextWeatherSettingsPage, GtcDeparturePage,
  GtcDirectToPage, GtcFlapSpeedsPage, GtcFlightPlanPage, GtcHoldPage, GtcInitialFuelPage, GtcInitializationPage,
  GtcIntersectionInfoPage, GtcLandingDataPage, GtcMapSettingsPage, GtcMfdHomePage, GtcMinimumsPage, GtcNavComHome,
  GtcNdbInfoPage, GtcNearestAirportPage, GtcNearestDirectoryPage, GtcNearestIntersectionPage, GtcNearestNdbPage,
  GtcNearestUserWaypointPage, GtcNearestVorPage, GtcNearestWeatherPage, GtcPerfPage, GtcPfdHomePage,
  GtcPfdMapSettingsPage, GtcPfdSettingsPage, GtcProceduresPage, GtcSetupPage, GtcSpeedBugsPage, GtcTakeoffDataPage,
  GtcTerrainSettingsPage, GtcTimerPage, GtcToldFactorDialog, GtcTrafficSettingsPage, GtcTransponderDialog,
  GtcTransponderModePopup, GtcUserWaypointInfoPage, GtcUtilitiesPage, GtcVnavProfilePage, GtcVorInfoPage,
  GtcWaypointInfoDirectoryPage, GtcWeatherRadarSettingsPage, GtcWeatherSelectionPage, GtcWeightBalanceConfigPage,
  GtcWeightBalancePage, GtcWeightFuelPage,
} from './Pages';
import { GtcChartsOptionsPopup, GtcChartsPanZoomControlPopup, GtcMapPointerControlPopup } from './Popups';

import './WTG3000_GTC.css';

/**
 * A G3000/5000 GTC instrument.
 */
export class WTG3000GtcInstrument extends WTG3000FsInstrument {

  private readonly displayOverlayLayerRef = FSComponent.createRef<DisplayOverlayLayer>();
  private readonly highlightRef = FSComponent.createRef<HTMLElement>();

  private readonly mainContentHidden = MappedSubject.create(
    ([avionicsStatus, hide]) => hide || avionicsStatus === undefined || avionicsStatus.current !== AvionicsStatus.On,
    this.avionicsStatus,
    this.displayOverlayController.hideMainContent
  );
  private readonly displayOverlayShow = MappedSubject.create(
    ([avionicsStatus, show]) => show && avionicsStatus !== undefined && avionicsStatus.current == AvionicsStatus.On,
    this.avionicsStatus,
    this.displayOverlayController.showOverlay
  );
  private readonly bootSplashHidden = this.avionicsStatus.map(status => {
    return status === undefined
      || (status.current !== AvionicsStatus.Off && status.current !== AvionicsStatus.Booting);
  });

  private readonly hEventMap = GtcInteractionEventUtils.hEventMap(this.instrumentConfig.orientation, this.instrument.instrumentIndex);

  private readonly xpdrSimVarPublisher = new XPDRSimVarPublisher(this.bus);

  protected readonly navSources = this.createNavReferenceSourceCollection();
  protected readonly navIndicators = this.createNavReferenceIndicatorCollection();

  private readonly casSystem = this.config.message.includeCas
    ? new CasSystem(this.bus, false)
    : undefined;

  private readonly obsSuspDataProvider = new DefaultObsSuspDataProvider(this.bus);

  private readonly gtcService = new GtcService(
    this.bus,
    this.instrument.instrumentIndex,
    this.config,
    this.instrumentConfig,
    this.obsSuspDataProvider
  );

  private readonly posHeadingDataProvider = new GtcDefaultPositionHeadingDataProvider(
    this.bus,
    this.gtcService.pfdControlIndex,
    this.pfdSensorsSettingManager.getAliasedManager(this.gtcService.pfdControlIndex).getSetting('pfdAhrsIndex'),
    30
  );
  private readonly posHeadingDataProvider1Hz = new GtcDefaultPositionHeadingDataProvider(
    this.bus,
    this.gtcService.pfdControlIndex,
    this.pfdSensorsSettingManager.getAliasedManager(this.gtcService.pfdControlIndex).getSetting('pfdAhrsIndex'),
    1
  );

  private readonly existingUserWaypointsArray = new GarminExistingUserWaypointsArray(
    this.facRepo,
    this.bus,
    GarminFacilityWaypointCache.getCache(this.bus),
    { scope: G3000FacilityUtils.USER_FACILITY_SCOPE }
  );

  private readonly vnavDataProvider = new DefaultVNavDataProvider(
    this.bus,
    this.fms,
    this.pfdSensorsSettingManager.getAliasedManager(this.gtcService.pfdControlIndex).getSetting('pfdAdcIndex')
  );

  private readonly fmsSpeedTargetDataProvider = this.fmsSpeedsSettingManager === undefined
    ? undefined
    : new DefaultFmsSpeedTargetDataProvider(this.bus, this.fmsSpeedsSettingManager);

  private readonly userWaypointEditController = new GtcUserWaypointEditController(this.facRepo, this.fms, this.existingUserWaypointsArray);

  private readonly flightPlanStore = this.gtcService.hasMfdMode
    ? new FlightPlanStore(this.bus, this.fms, Fms.PRIMARY_PLAN_INDEX, this.config.vnav.advanced)
    : undefined;

  private readonly flightPlanListManager = this.gtcService.hasMfdMode
    ? new FlightPlanListManager(
      this.bus,
      this.flightPlanStore!,
      this.fms,
      Fms.PRIMARY_PLAN_INDEX,
      this.gtcService.gtcSettings.getSetting('loadNewAirwaysCollapsed')
    )
    : undefined;

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

    this.backplane.addPublisher(InstrumentBackplaneNames.Xpdr, this.xpdrSimVarPublisher);

    this.doInit().catch(e => {
      console.error(e);
    });
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.initPlugins();

    this.initChartSources(this.pluginSystem);

    await this.initChecklist(this.pluginSystem);

    this.backplane.init();

    this.minimumsDataProvider.init();
    this.terrainSystemStateDataProvider.init();
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
      existingUserWptArray: this.existingUserWaypointsArray,
      chartsSources: this.chartsSources
    };

    this.registerViews(context);
    this.pluginSystem.callPlugins((plugin: G3000GtcPlugin) => {
      plugin.registerGtcViews(this.gtcService, context);
    });

    this.gtcService.initialize();
    this.initFlightPlan();

    this.initAvionicsStatusListener();
    this.displayOverlayController.hideMainContent.sub(this.onHideMainContentChanged.bind(this), true);

    this.bus.getSubscriber<HEvent>().on('hEvent').handle(this.onHEvent.bind(this));
  }

  /**
   * Initializes this instrument's plugins.
   */
  private async initPlugins(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === 'WTG3000v2_GTC';
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
      displayOverlayController: this.displayOverlayController,
      pfdSensorsSettingManager: this.pfdSensorsSettingManager,
      vSpeedSettingManager: this.vSpeedSettingManager,
      fmsSpeedsSettingManager: this.fmsSpeedsSettingManager,
      weightBalanceSettingManager: this.weightBalanceSettingManager,
      gtcService: this.gtcService,
      flightPlanStore: this.flightPlanStore,
      casSystem: this.casSystem
    };

    await this.pluginSystem.startSystem(pluginBinder);

    this.pluginSystem.callPlugins((plugin: G3000Plugin) => {
      plugin.onInit();
    });
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

    const overlayVNodes: VNode[] = [];
    this.pluginSystem.callPlugins(plugin => {
      const node = plugin.renderToDisplayOverlay?.();
      if (node) {
        overlayVNodes.push(node);
      }
    });

    return (
      <>
        <div class={{ 'gtc-main-content': true, 'hidden': this.mainContentHidden }}>
          <GtcContainer gtcService={this.gtcService} config={this.config} pluginLabelBarHandlers={labelBarHandlers} />
        </div>
        <DisplayOverlayLayer ref={this.displayOverlayLayerRef} show={this.displayOverlayShow} class='gtc-display-overlay'>
          {overlayVNodes}
        </DisplayOverlayLayer>
        <glasscockpit-highlight ref={this.highlightRef} id="highlight"></glasscockpit-highlight>
        <div class={{ 'gtc-boot-splash': true, [`gtc-boot-splash-${this.instrumentConfig.orientation}`]: true, 'hidden': this.bootSplashHidden }}>
          <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/garmin_logo_gtc.png`} class="gtc-boot-splash-icon" />
        </div>
        <div class="left-edge-border-fix" />
      </>
    );
  }

  /**
   * Registers all default GTC views with the GTC service.
   * @param context A context containing references to items used to create the default GTC views.
   */
  private registerViews(context: Readonly<G3000GtcViewContext>): void {

    const supportPerfPage
      = this.config.vnav.advanced
      || this.config.performance.isSurfaceWatchSupported
      || this.config.performance.isToldSupported;

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
            fmsConfig={this.config.fms}
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
          <GtcMfdHomePage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            config={this.config}
            supportChecklist={this.checkListDef !== undefined}
          />
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
            config={this.config}
            terrainSystemStateDataProvider={this.terrainSystemStateDataProvider}
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
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcWeatherRadarSettingsPage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              weatherRadarConfig={this.config.sensors.weatherRadarDefinition!}
            />
          );
        }
      );
    }

    if (this.config.terrain.type !== null) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.TerrainSettings, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcTerrainSettingsPage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              terrainConfig={this.config.terrain}
              terrainSystemStateDataProvider={this.terrainSystemStateDataProvider}
            />
          );
        }
      );
    }

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Initialization, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcInitializationPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

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
            chartsSources={context.chartsSources}
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
            chartsSources={context.chartsSources}
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
            chartsSources={context.chartsSources}
            allowRnpAr={this.config.fms.approach.supportRnpAr}
            minimumsDataProvider={context.minimumsDataProvider}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Charts, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcChartsPage
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
            flightPlanStore={this.flightPlanStore!}
            positionDataProvider={context.posHeadingDataProvider}
            chartsSources={context.chartsSources}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.ChartsOptions, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcChartsOptionsPopup
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            chartsSources={context.chartsSources}
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
            config={this.config}
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
            touchdownCalloutsConfig={this.config.terrain.touchdownCallouts}
            espConfig={this.config.esp}
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

    if (this.config.performance.isWeightBalanceSupported) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.WeightAndBalance, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcWeightBalancePage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              weightBalanceConfig={this.config.performance.weightBalanceConfig!}
              weightBalanceSettingManager={this.weightBalanceSettingManager!}
            />
          );
        }
      );
      if (this.config.performance.weightBalanceConfig!.areLoadStationsEditable) {
        this.gtcService.registerView(
          GtcViewLifecyclePolicy.Transient,
          GtcViewKeys.WeightAndBalanceConfig, 'MFD',
          (gtcService, controlMode, displayPaneIndex) => {
            return (
              <GtcWeightBalanceConfigPage
                gtcService={gtcService}
                controlMode={controlMode}
                displayPaneIndex={displayPaneIndex}
                weightBalanceConfig={this.config.performance.weightBalanceConfig!}
                weightBalanceSettingManager={this.weightBalanceSettingManager!}
              />
            );
          }
        );
      }
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.InitialFuel, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcInitialFuelPage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
            />
          );
        }
      );
    } else {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.WeightAndFuel, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcWeightFuelPage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              destinationFacility={this.flightPlanStore!.destinationFacility}
              weightLimits={this.config.performance.weightLimits}
              gpsHasFailed={context.posHeadingDataProvider.isGpsDataFailed}
            />
          );
        }
      );
    }

    if (this.checkListDef) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.Checklist, 'MFD',
        (gtcService, controlMode, displayPaneIndex) => {
          return (
            <GtcChecklistPage
              gtcService={gtcService}
              controlMode={controlMode}
              displayPaneIndex={displayPaneIndex}
              checklistDef={this.checkListDef!}
            />
          );
        }
      );
    }

    if (supportPerfPage) {
      const includeFlapSpeeds
        = this.config.vnav.fmsSpeeds !== undefined
        && this.config.vnav.fmsSpeeds.configurationSpeeds.length > 0
        && this.fmsSpeedsSettingManager !== undefined;

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

      if (this.config.performance.isSurfaceWatchSupported || this.config.performance.isToldSupported) {
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
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.ChartsPanZoomControl, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => <GtcChartsPanZoomControlPopup gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />
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
      (gtcService, controlMode, displayPaneIndex, isInOverlayStack) => {
        return (
          <GtcAudioRadiosPopup
            gtcService={gtcService}
            controlMode={controlMode}
            isInOverlayStack={isInOverlayStack}
            radiosConfig={this.config.radios}
            activeNavIndicator={this.navIndicators.get('activeSource')}
          />
        );
      }
    );
    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.Transponder, 'NAV_COM',
      (gtcService, controlMode, displayPaneIndex, isInOverlayStack) => {
        return (
          <GtcTransponderDialog
            gtcService={gtcService}
            controlMode={controlMode}
            isInOverlayStack={isInOverlayStack}
            layout={this.config.traffic.type === TrafficSystemType.TcasII ? 'CODE_ONLY' : 'MODE_AND_CODE'}
          />
        );
      }
    );
    if (this.config.traffic.type === TrafficSystemType.TcasII) {
      this.gtcService.registerView(
        GtcViewLifecyclePolicy.Transient,
        GtcViewKeys.TransponderMode, 'NAV_COM',
        (gtcService, controlMode, displayPaneIndex, isInOverlayStack) => {
          return (
            <GtcTransponderModePopup
              gtcService={gtcService}
              controlMode={controlMode}
              isInOverlayStack={isInOverlayStack}
            />
          );
        }
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
      (gtcService, controlMode, displayPaneIndex, isInOverlayStack) => {
        return (
          <GtcMessageDialog
            gtcService={gtcService}
            controlMode={controlMode}
            isInOverlayStack={isInOverlayStack}
          />
        );
      }
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
      (gtcService, controlMode, displayPaneIndex, isInOverlayStack) => {
        return (
          <GtcListDialog
            gtcService={gtcService}
            controlMode={controlMode}
            isInOverlayStack={isInOverlayStack}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.TextDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcTextDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.WaypointDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcWaypointDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.fms}
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
      GtcViewKeys.DuplicateWaypointDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcDuplicateWaypointDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            posHeadingDataProvider={context.posHeadingDataProvider1Hz}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.FrequencyDialog, 'NAV_COM',
      (gtcService, controlMode, displayPaneIndex, isInOverlayStack) => {
        return (
          <GtcFrequencyDialog
            gtcService={gtcService}
            controlMode={controlMode}
            isInOverlayStack={isInOverlayStack}
          />
        );
      }
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

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.BaroTransitionAlertAltitudeDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcBaroTransitionAlertAltitudeDialog
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
          />
        );
      }
    );

    this.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcViewKeys.MomentArmDialog, 'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcMomentArmDialog
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

    const context = G3000NearestContext.initializeInstance(this.facLoader, this.bus, this.gtcService.pfdControlIndex);

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

    if (event.previous === AvionicsStatus.Off && event.current !== AvionicsStatus.Off) {
      this.gtcService.reset();
    } else if (event.previous === AvionicsStatus.On && event.current !== AvionicsStatus.On) {
      this.gtcService.sleep();
    }

    if (event.current === AvionicsStatus.On && !this.displayOverlayController.hideMainContent.get()) {
      this.gtcService.wake();
    }
  }

  /**
   * Responds to changes in whether the display overlay controller is attempting to hide this instrument's main
   * content.
   * @param hide Whether the display overlay controller is attempting to hide this isntrument's main content.
   */
  private onHideMainContentChanged(hide: boolean): void {
    if (this.avionicsStatus.get()?.current === AvionicsStatus.On) {
      if (hide) {
        this.gtcService.sleep();
      } else {
        this.gtcService.wake();
      }
    }
  }

  /**
   * Responds to when an H event is received.
   * @param hEvent The event that was received.
   */
  private onHEvent(hEvent: string): void {
    const interactionEvent = this.hEventMap(hEvent);
    if (interactionEvent !== undefined) {
      this.onGtcInteractionEvent(interactionEvent);
    }
  }

  /**
   * Handles a GTC interaction event.
   * @param event The event to handle.
   */
  private onGtcInteractionEvent(event: GtcInteractionEvent): void {
    this.displayOverlayLayerRef.instance.onInteractionEvent(event)
      || this.gtcService.onInteractionEvent(event);
  }
}