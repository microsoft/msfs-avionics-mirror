import {
  APRadioNavInstrument, ArrayUtils, AuralAlertSystem, AuralAlertSystemWarningAdapter, AuralAlertSystemXmlAdapter,
  CasSystem, CasSystemLegacyAdapter, ChecklistManager, ClockEvents, CompositeLogicXMLHost, ControlEvents,
  DefaultLNavComputerDataProvider, DefaultXmlAuralAlertParser, FlightPlanCalculatedEvent, FlightPlanRouteManager,
  FlightTimerInstrument, FlightTimerMode, FSComponent, GameStateProvider, GpsSynchronizer, HEvent, LNavComputer,
  LNavObsManager, MappedSubject, MappedValue, MinimumsManager, NavComInstrument, NavSourceType, PluginSystem,
  SimVarValueType, SoundServer, Subject, TrafficInstrument, UserSetting, Vec2Math, VNavControlEvents, VNode, Wait,
  XMLWarningFactory, XPDRInstrument
} from '@microsoft/msfs-sdk';

import {
  AdcSystemSelector, ComRadioSpacingManager, DateTimeUserSettings, DefaultGpsIntegrityDataProvider,
  DefaultRadarAltimeterDataProvider, DefaultTerrainSystemDataProvider, DefaultVNavDataProvider,
  DefaultWindDataProvider, DmeUserSettings, FlightPathCalculatorManager, Fms, FmsPositionMode, GarminAPStateManager,
  GarminAPUtils, GarminFlightPlanRouteSyncManager, GarminGoAroundManager, GarminHeadingSyncManager,
  GarminNavToNavComputer, GarminObsLNavModule, GarminPrimaryFlightPlanRouteLoader,
  GarminPrimaryFlightPlanRouteProvider, GarminTimerControlEvents, GarminTimerManager, GarminXpdrTcasManager,
  MapTerrainWxSettingCompatManager, MinimumsUnitsManager, NavdataComputer, TrafficOperatingModeManager,
  TrafficOperatingModeSetting, TrafficSystemType, TrafficUserSettings, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, AvionicsConfig, AvionicsStatus, AvionicsStatusChangeEvent,
  AvionicsStatusEvents, AvionicsStatusGlobalPowerEvent, AvionicsStatusManager, ChartsPaneView, ChecklistPaneView,
  ConnextWeatherPaneView, DefaultChartsPaneViewDataProvider, DisplayOverlayLayer, DisplayPaneContainer,
  DisplayPaneIndex, DisplayPaneViewFactory, DisplayPaneViewKeys, EspUserSettings, FlightPlanListManager,
  FlightPlanStore, FuelTotalizer, G3000ComRadioUserSettings, G3000EspDefinition, G3000FacilityUtils, G3000FilePaths,
  G3000UserSettingSaveManager, GduInteractionEventUtils, GpsStatusDataProvider, GpsStatusPane, InitializationProcess,
  InstrumentBackplaneNames, MapUserSettings, MfdNavDataBarUserSettings, NavigationMapPaneView,
  NavRadioMonitorUserSettings, NearestPaneView, PfdUserSettings, ProcedurePreviewPaneView, ToldModule, ToldResetType,
  TouchdownCalloutUserSettings, TrafficMapPaneView, WaypointInfoPaneView, WeatherRadarPaneView, WeightBalancePaneView,
  WeightBalancePaneViewModule, WTG3000BaseInstrument, WTG3000FsInstrument
} from '@microsoft/msfs-wtg3000-common';

import { G3000BaroTransitionAlertManager } from './Alerts/G3000BaroTransitionAlertManager';
import { G3000APConfig } from './Autopilot/G3000APConfig';
import { G3000Autopilot } from './Autopilot/G3000Autopilot';
import { G3000AutopilotPluginOptions } from './Autopilot/G3000AutopilotPluginOptions';
import { CasMasterAuralAlertManager } from './CAS/CasMasterAuralAlertManager';
import { G3000ChartsManager } from './Charts/G3000ChartsManager';
import { MfdNavDataBar } from './Components/NavDataBar/MfdNavDataBar';
import { StartupScreen } from './Components/Startup/StartupScreen';
import { StartupScreenPrebuiltRow, StartupScreenRowFactory } from './Components/Startup/StartupScreenRow';
import { MfdConfig } from './Config/MfdConfig';
import { DisplayPanePowerOnOptions } from './DisplayPanes/DisplayPanePowerOnOptions';
import { DisplayPanesController } from './DisplayPanes/DisplayPanesController';
import { G3000Esp } from './ESP/G3000Esp';
import { G3000EspDataProvider } from './ESP/G3000EspDataProvider';
import { FmsSpeedManager } from './FmsSpeed/FmsSpeedManager';
import { G3000MfdPlugin, G3000MfdPluginBinder } from './G3000MFDPlugin';
import { InitializationManager } from './Initialization/InitializationManager';
import { AltimeterBaroKeyEventHandler } from './Input/AltimeterBaroKeyEventHandler';
import { ActiveNavSourceManager } from './Navigation/ActiveNavSourceManager';
import { FmsVSpeedManager } from './Performance/TOLD/FmsVSpeedManager';
import { ToldComputer } from './Performance/TOLD/ToldComputer';
import { ToldManager } from './Performance/TOLD/ToldManager';
import { WeightBalanceComputer } from './Performance/WeightBalance/WeightBalanceComputer';
import { WeightFuelComputer } from './Performance/WeightFuel/WeightFuelComputer';
import { ComRadioTxRxManager } from './Radio/ComRadioTxRxManager';
import { DmeTuneManager } from './Radio/DmeTuneManager';
import { NavRadioMonitorManager } from './Radio/NavRadioMonitorManager';
import { TerrainSystemAuralManager } from './Terrain/TerrainSystemAuralManager';
import { TouchdownCalloutAuralManager } from './Terrain/TouchdownCalloutAuralManager';
import { VNavAuralManager } from './VNAV/VNavAuralManager';
import { VSpeedBugManager } from './VSpeed/VSpeedBugManager';
import { WeatherRadarManager } from './WeatherRadar/WeatherRadarManager';

import './WTG3000_MFD.css';

/**
 * A G3000/5000 MFD instrument.
 */
export class WTG3000MfdInstrument extends WTG3000FsInstrument {
  /** The amount of time between periodic active flight plan calculations, in milliseconds. */
  private static readonly ACTIVE_FLIGHT_PLAN_CALC_PERIOD = 3000;

  private readonly logicHost = new CompositeLogicXMLHost();

  private readonly soundServer2 = new SoundServer(this.bus);
  private readonly auralAlertSystem = new AuralAlertSystem(this.bus);

  private readonly displayOverlayLayerRef = FSComponent.createRef<DisplayOverlayLayer>();
  private readonly highlightRef = FSComponent.createRef<HTMLElement>();
  private readonly startupScreenRef = FSComponent.createRef<StartupScreen>();
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

  private readonly hEventMap = GduInteractionEventUtils.mfdHEventMap();

  private readonly avionicsStatusManager = new AvionicsStatusManager(this.bus);

  private readonly obsManager = new LNavObsManager(this.bus, 0, true);

  private readonly navComInstrument = new NavComInstrument(this.bus, undefined, 2, 2);
  private readonly apRadioNavInstrument = new APRadioNavInstrument(this.bus);
  private readonly timerInstrument = new FlightTimerInstrument(this.bus, 2);
  private readonly fuelTotalizerInstrument: FuelTotalizer = new FuelTotalizer(this.bus);

  protected readonly navSources = this.createNavReferenceSourceCollection();
  protected readonly navIndicators = this.createNavReferenceIndicatorCollection();

  private readonly flightPlanStore = new FlightPlanStore(this.bus, this.fms, Fms.PRIMARY_PLAN_INDEX, this.config.vnav.advanced);

  private readonly flightPlanListManagers = {
    [DisplayPaneIndex.LeftMfd]: new FlightPlanListManager(this.bus, this.flightPlanStore, this.fms, Fms.PRIMARY_PLAN_INDEX, Subject.create(false)),
    [DisplayPaneIndex.RightMfd]: new FlightPlanListManager(this.bus, this.flightPlanStore, this.fms, Fms.PRIMARY_PLAN_INDEX, Subject.create(false)),
  } as Record<DisplayPaneIndex, FlightPlanListManager>;

  private readonly casSystem = new CasSystem(this.bus, true);
  private readonly casLegacyAdapter = new CasSystemLegacyAdapter(this.bus, this.logicHost, this.config.annunciations);
  private readonly casMasterAuralAlertManager = new CasMasterAuralAlertManager(this.bus);

  private readonly auralAlertXmlAdapter = new AuralAlertSystemXmlAdapter(
    this.bus,
    this.logicHost,
    this.casSystem,
    this.instrument.xmlConfig.getElementsByTagName('PlaneHTMLConfig')[0].querySelector(':scope>AuralAlerts'),
    new DefaultXmlAuralAlertParser(this.instrument, 'g3000-aural-$$xml-default$$')
  );
  private readonly auralAlertWarningAdapter = new AuralAlertSystemWarningAdapter(
    this.bus,
    this.logicHost,
    new XMLWarningFactory(this.instrument).parseConfig(this.instrument.xmlConfig),
    'g3000-aural-$$warning-default$$'
  );

  private readonly flightPathCalcManager = new FlightPathCalculatorManager(
    this.bus,
    {
      isAdcDataValid: Subject.create(true),
      isGpsDataValid: Subject.create(true),
      maxBankAngle: this.config.fms.flightPathOptions.maxBankAngle,
      lowBankAngle: this.config.fms.flightPathOptions.lowBankAngle
    }
  );

  private readonly comRadioSpacingManager = new ComRadioSpacingManager(this.bus, G3000ComRadioUserSettings.getManager(this.bus));
  private readonly comRadioTxRxManager = new ComRadioTxRxManager(this.bus);

  private readonly activeNavSourceManager = new ActiveNavSourceManager(this.bus);
  private readonly navRadioMonitorManager = new NavRadioMonitorManager(this.bus, NavRadioMonitorUserSettings.getManager(this.bus));
  private readonly dmeTuneManager = new DmeTuneManager(this.bus, DmeUserSettings.getManager(this.bus), this.config.radios.dmeCount);

  // TODO: Figure out how many generic timers the G3000 can actually support (i.e. whether the pilot/copilot each gets their own timer)
  private readonly timerManager = new GarminTimerManager(this.bus, 1);

  private readonly gpsSynchronizer = new GpsSynchronizer(this.bus, this.flightPlanner, this.facLoader);

  private readonly navdataComputer = new NavdataComputer(this.bus, this.flightPlanner, this.facLoader, { lnavIndex: 0 });

  private readonly radarAltimeterDataProvider = new DefaultRadarAltimeterDataProvider(this.bus);

  private readonly gps1DataProvider = new GpsStatusDataProvider(this.bus, 1);
  private readonly gps2DataProvider = new GpsStatusDataProvider(this.bus, 2);

  private readonly navToNavComputer = new GarminNavToNavComputer(this.bus, this.fms, {
    navRadioIndexes: [1, 2]
  });

  private autopilot?: G3000Autopilot;

  private readonly goAroundManager = new GarminGoAroundManager(this.bus, this.fms);
  private readonly headingSyncManager = new GarminHeadingSyncManager(this.bus, 1, {
    supportTurnHeadingAdjust: true,
    supportHeadingSyncMode: this.config.autopilot.isHdgSyncModeSupported
  });

  private espDataProvider?: G3000EspDataProvider;
  private esp?: G3000Esp;

  private readonly fmsSpeedManager = this.config.vnav.fmsSpeeds !== undefined && this.fmsSpeedsSettingManager !== undefined
    ? new FmsSpeedManager(this.bus, this.facLoader, this.flightPlanner, this.speedConstraintStore, this.config.vnav.fmsSpeeds, this.fmsSpeedsSettingManager, 1, 1)
    : undefined;

  private readonly windDataProvider = new DefaultWindDataProvider(
    this.bus,
    this.pfdSensorsSettingManager.getAliasedManager(1).getSetting('pfdAdcIndex'),
    this.pfdSensorsSettingManager.getAliasedManager(1).getSetting('pfdAhrsIndex'),
    this.instrument.instrumentIndex
  );

  private readonly vnavDataProvider = new DefaultVNavDataProvider(
    this.bus,
    this.fms,
    this.pfdSensorsSettingManager.getAliasedManager(1).getSetting('pfdAdcIndex')
  );
  private readonly vnavAuralManager = new VNavAuralManager(this.bus, this.vnavDataProvider);

  private readonly minimumsManager = new MinimumsManager(this.bus);
  private readonly minimumsUnitsManager = new MinimumsUnitsManager(this.bus);

  private readonly baroTransitionAlertManager = new G3000BaroTransitionAlertManager(
    this.bus,
    this.config,
    this.pfdSensorsSettingManager,
    this.flightPlanStore
  );

  private readonly trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
  private readonly xpdrInstrument = new XPDRInstrument(this.bus);
  private readonly trafficAvionicsSystem = this.config.traffic.resolve()(this.bus, this.trafficInstrument, 10000);
  private readonly trafficSystem = this.trafficAvionicsSystem.trafficSystem;
  private readonly trafficOperatingModeManager = this.trafficSystem.type === TrafficSystemType.Tas || this.trafficSystem.type === TrafficSystemType.Tis
    ? new TrafficOperatingModeManager(this.bus)
    : undefined;

  private readonly terrainSystemAdcSelector = new AdcSystemSelector(
    this.bus,
    ArrayUtils.range(this.config.sensors.adcCount, 1),
    {
      systemPriorities: ArrayUtils.range(this.config.sensors.adcCount, 1),
      desirabilityComparator: (a, b) => {
        const [aAltitudeDataValid, aAirspeedDataValid, aTemperatureDataValid] = a;
        const [bAltitudeDataValid, bAirspeedDataValid, bTemperatureDataValid] = b;

        if (aAltitudeDataValid && !bAltitudeDataValid) {
          return -1;
        } else if (!aAltitudeDataValid && bAltitudeDataValid) {
          return 1;
        } else {
          return (bAirspeedDataValid && bTemperatureDataValid ? 1 : 0)
            - (aAirspeedDataValid && aTemperatureDataValid ? 1 : 0);
        }
      }
    }
  );
  private readonly terrainSystemAhrsSelector = new AdcSystemSelector(
    this.bus,
    ArrayUtils.range(this.config.sensors.ahrsCount, 1),
    {
      systemPriorities: ArrayUtils.range(this.config.sensors.ahrsCount, 1)
    }
  );
  private readonly terrainSystemDataProvider = new DefaultTerrainSystemDataProvider(this.bus, this.fms, this.navIndicators.get('activeSource'), {
    fmsPosIndex: this.fmsPositionSystemSelector.selectedIndex,
    radarAltIndex: this.config.sensors.hasRadarAltimeter ? 1 : -1,
    adcIndex: this.terrainSystemAdcSelector.selectedIndex,
    ahrsIndex: this.terrainSystemAhrsSelector.selectedIndex
  });
  private readonly terrainSystem = this.config.terrain.resolve()(this.bus, this.fms, this.terrainSystemDataProvider);
  private readonly terrainSystemAuralManager = new TerrainSystemAuralManager(this.bus, this.terrainSystemStateDataProvider);
  private readonly touchdownCalloutAuralManager = new TouchdownCalloutAuralManager(this.bus);

  private readonly xpdrTcasManager?: GarminXpdrTcasManager;

  private readonly weatherRadarManager?: WeatherRadarManager;

  private readonly gpsIntegrityDataProvider = new DefaultGpsIntegrityDataProvider(this.bus, this.fmsPositionSystemSelector.selectedIndex);

  private readonly vSpeedBugManager = new VSpeedBugManager(this.bus, this.vSpeedSettingManager, this.config.sensors.adcCount);

  private readonly weightFuelComputer = new WeightFuelComputer(this.bus, this.fms, this.fmsPositionSystemSelector.selectedIndex, !this.config.performance.isWeightBalanceSupported);
  private readonly weightBalanceComputer = this.config.performance.isWeightBalanceSupported
    ? new WeightBalanceComputer(this.bus, this.config.performance.weightBalanceConfig!, this.weightBalanceSettingManager!)
    : undefined;

  private readonly fmsVSpeedManager = this.config.performance.isToldSupported
    ? new FmsVSpeedManager(this.vSpeedSettingManager)
    : undefined;

  private readonly toldManager = new ToldManager(this.bus, this.fms);
  private readonly toldComputer = this.config.performance.toldConfig !== undefined
    ? new ToldComputer(
      this.bus,
      this.toldManager,
      this.fms,
      this.config.sensors.adcCount,
      this.config.performance.toldConfig,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.fmsVSpeedManager!,
      this.vSpeedSettingManager
    )
    : undefined;
  private toldModule?: ToldModule;

  private readonly mapTerrainWxCompatManagers = [
    new MapTerrainWxSettingCompatManager(MapUserSettings.getPfdManager(this.bus, 1)),
    new MapTerrainWxSettingCompatManager(MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.LeftPfd)),
    new MapTerrainWxSettingCompatManager(MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.LeftMfd)),
    new MapTerrainWxSettingCompatManager(MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.RightMfd)),
    new MapTerrainWxSettingCompatManager(MapUserSettings.getDisplayPaneManager(this.bus, DisplayPaneIndex.RightPfd)),
    new MapTerrainWxSettingCompatManager(MapUserSettings.getPfdManager(this.bus, 2))
  ];

  private readonly altimeterBaroKeyEventHandler = new AltimeterBaroKeyEventHandler(
    this.bus,
    this.config.gduDefs.pfds.slice(1).map(pfdGduConfig => {
      return {
        index: pfdGduConfig.altimeterIndex,
        supportBaroPreselect: pfdGduConfig.supportBaroPreselect,
        isBaroMetric: PfdUserSettings.getMasterManager(this.bus).getSetting(`altimeterBaroMetric_${pfdGduConfig.index}`)
      };
    })
  );

  private readonly initializationManager = new InitializationManager(this.bus);

  private readonly chartsManager = new G3000ChartsManager(this.bus, this.fms, this.fmsPositionSystemSelector.selectedIndex);

  private checklistManager?: ChecklistManager;

  private readonly displayPanesController = new DisplayPanesController(this.bus, this.config.gduDefs.pfdCount);
  private readonly displayPaneViewFactory = new DisplayPaneViewFactory();

  private settingSaveManager?: G3000UserSettingSaveManager;

  private readonly flightPlanRouteSyncManager = new GarminFlightPlanRouteSyncManager();
  private isFlightPlanInit = false;

  private lastActiveFplCalcTime = 0;

  private avionicsGlobalPowerState: boolean | undefined = undefined;

  private readonly pluginSystem = new PluginSystem<G3000MfdPlugin, G3000MfdPluginBinder>();

  /**
   * Constructor.
   * @param instrument This instrument's parent BaseInstrument.
   * @param config This instrument's general configuration object.
   * @param instrumentConfig This instrument's instrument-specific configuration object.
   */
  constructor(instrument: BaseInstrument, config: AvionicsConfig, private readonly instrumentConfig: MfdConfig) {
    super('MFD', instrument, config);

    //Sets the simvar that tells the VFRMap not to construct a flight plan for display from the game
    //flight plan, but instead to get flight plan events from the avionics.
    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    this.flightPlanStore.init();

    this.createSystems();

    this.backplane.addInstrument(InstrumentBackplaneNames.NavCom, this.navComInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.AutopilotRadioNav, this.apRadioNavInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Traffic, this.trafficInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Xpdr, this.xpdrInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Timer, this.timerInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.FuelTotalizer, this.fuelTotalizerInstrument);

    this.obsManager.init();

    if (this.trafficSystem.type === TrafficSystemType.TcasII) {
      this.xpdrTcasManager = new GarminXpdrTcasManager(this.bus, 1);
    }

    if (this.config.sensors.weatherRadarDefinition !== undefined) {
      this.weatherRadarManager = new WeatherRadarManager(
        this.bus,
        this.config.sensors.weatherRadarDefinition.scanActiveCircuitIndex,
        this.config.sensors.weatherRadarDefinition.scanActiveCircuitProcedureIndex
      );
    }

    this.initAuralAlertUserSettings();
    this.initTouchdownCalloutUserSettings();

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
   * Initializes aural alert user settings.
   */
  private initAuralAlertUserSettings(): void {
    // Check if only one aural alert voice is supported. If so, force the setting to that value.
    if (this.config.auralAlerts.supportedVoices !== 'both') {
      const voice = this.config.auralAlerts.supportedVoices === 'male' ? AuralAlertVoiceSetting.Male : AuralAlertVoiceSetting.Female;
      AuralAlertUserSettings.getManager(this.bus).getSetting('auralAlertVoice').value = voice;
    }
  }

  /**
   * Initializes touchdown callout user settings.
   */
  private initTouchdownCalloutUserSettings(): void {
    if (!this.config.terrain.touchdownCallouts) {
      return;
    }

    const settingManager = TouchdownCalloutUserSettings.getManager(this.bus);
    for (const options of Object.values(this.config.terrain.touchdownCallouts.options)) {
      settingManager.getEnabledSetting(options.altitude).value = options.enabled;
    }
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.initPlugins();

    this.initChartSources(this.pluginSystem);
    this.chartsManager.init(this.chartsSources);

    await this.initChecklist(this.pluginSystem);

    const pluginPersistentSettings = new Map<string, UserSetting<any>>();

    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      for (const setting of plugin.getPersistentSettings()) {
        pluginPersistentSettings.set(setting.definition.name, setting);
      }
    });

    if (!this.config.persistentUserSettings.disablePersistentSettings) {
      this.initPersistentSettings(this.config.persistentUserSettings.aircraftKey, pluginPersistentSettings.values());
    }

    this.chartsManager.startReconcilePreferredSource();

    this.auralAlertXmlAdapter.start();
    this.auralAlertWarningAdapter.start();

    if (this.config.esp) {
      this.createEsp();
    }

    this.createToldModule();

    const displayPanePowerOnOptions = this.createDisplayPanePowerOnOptions();

    const initializationProcess = this.createInitializationProcess();
    if (initializationProcess) {
      this.initializationManager.init(initializationProcess);
    }

    this.backplane.init();

    this.avionicsStatusManager.init();

    this.flightPathCalcManager.init();

    this.initActiveFplCalcListener();
    this.initFlightPlan();

    this.radarAltimeterDataProvider.init();
    this.gps1DataProvider.init();
    this.gps2DataProvider.init();
    this.minimumsDataProvider.init();
    this.terrainSystemStateDataProvider.init();
    this.activeNavSourceManager.init();
    this.dmeTuneManager.init();
    this.comRadioTxRxManager.init();
    this.timerManager.init();
    this.goAroundManager.init();
    this.headingSyncManager.init();
    this.fmsSpeedManager?.init();
    this.minimumsUnitsManager.init();
    this.xpdrTcasManager?.init(true);
    this.baroTransitionAlertManager.init();
    this.trafficSystem.init();

    if (this.terrainSystem) {
      this.terrainSystemAdcSelector.init();
      this.terrainSystemAhrsSelector.init();
      this.terrainSystemDataProvider.init();
      this.terrainSystem.init();

      this.terrainSystemAuralManager.init();
      this.touchdownCalloutAuralManager.init();
    }

    this.weatherRadarManager?.init();
    this.gpsIntegrityDataProvider.init();
    this.vSpeedBugManager.init(true);
    this.windDataProvider.init();
    this.vnavDataProvider.init();
    this.vnavAuralManager.init();
    this.weightFuelComputer.init();
    this.weightBalanceComputer?.init(true);

    if (this.config.performance.isSurfaceWatchSupported || this.config.performance.isToldSupported) {
      this.toldManager.init(true);
    }
    if (this.toldComputer !== undefined && this.toldModule !== undefined) {
      this.toldComputer.init(this.toldModule, true);
    }

    this.mapTerrainWxCompatManagers.forEach(manager => { manager.init(); });

    this.casPowerStateManager.init();
    this.casMasterAuralAlertManager.init();

    this.altimeterBaroKeyEventHandler.init();

    this.displayPanesController.init(displayPanePowerOnOptions);

    if (this.checkListDef) {
      this.checklistManager = new ChecklistManager(1, this.bus, this.checkListDef);
    }
    this.checklistStateProvider?.init();

    this.bus.getSubscriber<AvionicsStatusEvents>().on('avionics_global_power').handle(this.onGlobalPowerChanged.bind(this));

    this.registerDisplayPaneViews();
    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      plugin.registerDisplayPaneViews(this.displayPaneViewFactory);
    });

    FSComponent.render(
      this.renderComponents(),
      this.instrument.getChildById('Electricity')
    );

    (this.instrument as WTG3000BaseInstrument<this>).setHighlightElement(this.highlightRef.instance);

    this.initAvionicsStatusListener();
    this.mainContentHidden.sub(this.onMainContentHiddenChanged.bind(this), true);

    this.bus.getSubscriber<HEvent>().on('hEvent').handle(this.onHEvent.bind(this));

    this.initNavigationLoop();

    this.doDelayedInit();
  }

  /**
   * Initializes this instrument's plugins.
   */
  private async initPlugins(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, this.instrument.templateID, (target) => {
      return target === 'WTG3000v2_MFD';
    });

    const pluginBinder: G3000MfdPluginBinder = {
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

    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      plugin.onInit();
    });
  }

  /**
   * Performs initialization tasks after a 500-millisecond wait.
   */
  private async doDelayedInit(): Promise<void> {
    await Wait.awaitDelay(500);

    this.casLegacyAdapter.start();
    this.comRadioSpacingManager.init();
    this.navRadioMonitorManager.init();

    // We need to delay initialization of this manager because the on ground simvar is not properly initialized for in-air starts.
    this.trafficOperatingModeManager?.init(this.avionicsGlobalPowerState !== true);

    if (this.trafficSystem.type === TrafficSystemType.TcasII) {
      TrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode').value = TrafficOperatingModeSetting.Auto;
    }
  }

  /**
   * Creates an ESP system.
   */
  private createEsp(): void {
    let def: G3000EspDefinition | undefined;

    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      def ??= plugin.getEspDefinition?.();
    }, true);

    if (def) {
      this.espDataProvider = new G3000EspDataProvider(this.bus, {
        ahrsCount: this.config.sensors.ahrsCount,
        adcCount: this.config.sensors.adcCount,
        isArmingInhibited: def.isArmingInhibited
      });

      this.esp = new G3000Esp(this.bus, this.espDataProvider, def);

      this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
        plugin.onEspCreated?.(this.esp!, this.espDataProvider!);
      }, true);
    }
  }

  /**
   * Creates a TOLD module.
   */
  private createToldModule(): void {
    if (this.config.performance.isToldSupported) {
      this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
        this.toldModule ??= plugin.getToldModule();
      });
    }
  }

  /**
   * Creates options with which to configure display pane logic on initial system power-on.
   * @returns Options with which to configure display pane logic on initial system power-on, or `undefined` if default
   * options should be used.
   */
  private createDisplayPanePowerOnOptions(): Readonly<DisplayPanePowerOnOptions> | undefined {
    let displayPanePowerOnOptions: Readonly<DisplayPanePowerOnOptions> | undefined = undefined;
    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      displayPanePowerOnOptions ??= plugin.getDisplayPanePowerOnOptions?.();
    }, true);
    return displayPanePowerOnOptions;
  }

  /**
   * Creates an initialization process.
   * @returns An initialization process, or `undefined` if one could not be created.
   */
  private createInitializationProcess(): InitializationProcess | undefined {
    let initializationProcess: InitializationProcess | null | undefined = undefined;
    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      if (initializationProcess === undefined) {
        initializationProcess = plugin.getInitializationProcess?.();
      }
    }, true);

    return initializationProcess ?? undefined;
  }

  /**
   * Initializes persistent settings. Loads saved settings and starts auto-save.
   * @param aircraftKey The aircraft key under which persistent settings are saved.
   * @param pluginSettings Persistent settings defined by plugins.
   */
  private initPersistentSettings(aircraftKey: string, pluginSettings: Iterable<UserSetting<any>>): void {
    this.settingSaveManager = new G3000UserSettingSaveManager(
      this.bus,
      this.config,
      pluginSettings,
      this.fmsSpeedsSettingManager,
      this.weightBalanceSettingManager
    );
    const profileKey = `${aircraftKey}_g3000-default-profile`;
    this.settingSaveManager.load(profileKey);
    this.settingSaveManager.startAutoSave(profileKey);
  }

  /**
   * Initializes the flight plan
   */
  private async initFlightPlan(): Promise<void> {
    const [, manager] = await Promise.all([
      this.initPrimaryFlightPlan(),
      FlightPlanRouteManager.getManager()
    ]);

    // Wait for the game to finish loading.
    await Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.ingame, true);

    // Wait 2 seconds because trying to load the sim flight plan too early sometimes ends up with missing waypoints.
    await Wait.awaitDelay(2000);

    this.flightPlanRouteSyncManager.init(
      manager,
      new GarminPrimaryFlightPlanRouteLoader(this.fms, {
        userFacilityScope: G3000FacilityUtils.USER_FACILITY_SCOPE,
        allowRnpArApproaches: this.config.fms.approach.supportRnpAr,
      }),
      new GarminPrimaryFlightPlanRouteProvider(this.fms)
    );

    // Always load the synced avionics route, or the EFB route if a synced route does not exist, on flight start.
    const routeToLoad = manager.syncedAvionicsRoute.get() ?? manager.efbRoute.get();
    await this.flightPlanRouteSyncManager.loadRoute(routeToLoad);

    this.flightPlanRouteSyncManager.replyToAllPendingRequests();
    this.flightPlanRouteSyncManager.startAutoReply();

    this.isFlightPlanInit = true;

    if (this.avionicsGlobalPowerState) {
      this.flightPlanRouteSyncManager.startAutoSync();
    }
  }

  /**
   * Initializes the primary flight plan.
   */
  private async initPrimaryFlightPlan(): Promise<void> {
    // Request a sync from any other instrument in case of an instrument reload
    this.fms.flightPlanner.requestSync();
    await Wait.awaitDelay(500);
    // Initialize the primary plan in case one was not synced.
    await this.fms.initPrimaryFlightPlan();
  }

  /**
   * Initializes the autopilot.
   * @param lnavComputer The LNAV computer from which the autopilot should source data.
   */
  private initAutopilot(lnavComputer: LNavComputer): void {
    const pluginOptions: G3000AutopilotPluginOptions[] = [];
    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      const options = plugin.getAutopilotOptions?.();
      if (options) {
        pluginOptions.push(options);
      }
    });

    const apConfig = new G3000APConfig(
      this.bus,
      this.fms,
      lnavComputer,
      this.verticalPathCalculator,
      this.navToNavComputer,
      this.config,
      pluginOptions
    );

    this.autopilot = new G3000Autopilot(
      this.bus,
      this.flightPlanner,
      apConfig,
      new GarminAPStateManager(this.bus, apConfig),
      this.config.autopilot,
      PfdUserSettings.getMasterManager(this.bus),
      this.minimumsDataProvider
    );

    this.autopilot.stateManager.initialize();

    this.initSelectedAltitude(this.autopilot);
  }

  /**
   * Initializes the state of the autopilot's selected altitude.
   * @param autopilot The autopilot.
   */
  private initSelectedAltitude(autopilot: G3000Autopilot): void {
    const needInit = SimVar.GetSimVarValue('L:1:Garmin_Init_Selected_Altitude', SimVarValueType.Bool);
    if (needInit) {
      autopilot.setSelectedAltitudeInitialized(true);
    }
  }

  /**
   * Initializes the update loop for LNAV, autopilot, and ESP.
   */
  private async initNavigationLoop(): Promise<void> {
    await Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.ingame, true);

    const lnavComputerDataProvider = new DefaultLNavComputerDataProvider({
      isPositionDataValid: MappedValue.create(
        ([fmsPosMode]) => fmsPosMode !== FmsPositionMode.None,
        this.fmsPositionSystemSelector.selectedFmsPosMode
      )
    });

    const lnavMaxBankAngle = (): number => {
      return this.autopilot!.apValues.maxBankId.get() === 1
        ? Math.min(this.config.autopilot.lnavOptions.maxBankAngle, this.config.autopilot.lowBankOptions.maxBankAngle)
        : this.config.autopilot.lnavOptions.maxBankAngle;
    };
    const lnavComputer = new LNavComputer(
      0,
      this.bus,
      this.flightPlanner,
      new GarminObsLNavModule(0, this.bus, this.flightPlanner, {
        intercept: GarminAPUtils.lnavIntercept,
      }),
      {
        dataProvider: lnavComputerDataProvider,
        maxBankAngle: lnavMaxBankAngle,
        intercept: GarminAPUtils.lnavIntercept,
        hasVectorAnticipation: true
      }
    );

    this.initAutopilot(lnavComputer);

    if (this.esp) {
      this.espDataProvider!.init();
      this.esp.init();
    }

    const sub = this.bus.getSubscriber<ClockEvents>();

    let prevActiveSimDuration: number | undefined;

    sub.on('activeSimDurationHiFreq').handle(activeSimDuration => {
      const isPaused = prevActiveSimDuration !== undefined && (activeSimDuration - prevActiveSimDuration === 0);

      if (isPaused) {
        if (this.esp) {
          this.espDataProvider!.pause();
          this.esp.pause();
        }
      } else {
        lnavComputerDataProvider.update();
        lnavComputer.update();
        this.autopilot!.update();

        if (this.esp) {
          this.espDataProvider!.update(Date.now());
          this.esp.update();
        }
      }

      prevActiveSimDuration = activeSimDuration;
    });
  }

  /**
   * Registers display pane views with this instrument's display pane view factory.
   */
  private registerDisplayPaneViews(): void {
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
          flightPlanListManager={this.flightPlanListManagers[index]}
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
          facLoader={this.facLoader}
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
          facLoader={this.facLoader}
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
          facLoader={this.facLoader}
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

    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.Charts, index => {
      return (
        <ChartsPaneView
          index={index}
          dataProviderFactory={() => new DefaultChartsPaneViewDataProvider(this.bus, this.chartsSources, index, this.pfdSensorsSettingManager, false)}
          chartsConfig={this.config.charts}
        />
      );
    });
    this.displayPaneViewFactory.registerView(DisplayPaneViewKeys.ProcedurePreviewCharts, index => {
      return (
        <ChartsPaneView
          index={index}
          dataProviderFactory={() => new DefaultChartsPaneViewDataProvider(this.bus, this.chartsSources, index, this.pfdSensorsSettingManager, true)}
          chartsConfig={this.config.charts}
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
      this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
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

    this.displayPaneViewFactory
      .registerView(DisplayPaneViewKeys.Gps1Status, index => <GpsStatusPane dataProvider={this.gps1DataProvider} bus={this.bus} index={index} halfSizeOnly />);
    this.displayPaneViewFactory
      .registerView(DisplayPaneViewKeys.Gps2Status, index => <GpsStatusPane dataProvider={this.gps2DataProvider} bus={this.bus} index={index} halfSizeOnly />);
  }

  /**
   * Initializes a listener which records the most recent time the active flight plan was calculated.
   */
  private initActiveFplCalcListener(): void {
    this.flightPlanner.onEvent('fplCalculated').handle((e: FlightPlanCalculatedEvent) => {
      if (e.planIndex === this.flightPlanner.activePlanIndex) {
        this.lastActiveFplCalcTime = Date.now();
      }
    });
  }

  /**
   * Renders this instrument's components.
   * @returns This instrument's rendered components, as a VNode.
   */
  private renderComponents(): VNode {
    let renderedEis: VNode | null = null;
    this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
      renderedEis ??= plugin.renderEis();
    });

    let startupScreenRows: readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[] | undefined = undefined;
    if (this.instrumentConfig.startupScreen) {
      this.pluginSystem.callPlugins((plugin: G3000MfdPlugin) => {
        startupScreenRows ??= plugin.getStartupScreenRows();
      });
    }

    const overlayVNodes: VNode[] = [];
    this.pluginSystem.callPlugins(plugin => {
      const node = plugin.renderToDisplayOverlay?.();
      if (node) {
        overlayVNodes.push(node);
      }
    });

    return (
      <>
        <div class={{ 'mfd-main-content': true, 'hidden': this.mainContentHidden }}>
          <MfdNavDataBar
            bus={this.bus}
            fms={this.fms}
            gpsIntegrityDataProvider={this.gpsIntegrityDataProvider}
            dataBarSettingManager={MfdNavDataBarUserSettings.getManager(this.bus)}
            unitsSettingManager={UnitsUserSettings.getManager(this.bus)}
            dateTimeSettingManager={DateTimeUserSettings.getManager(this.bus)}
            updateFreq={1}
          />
          <DisplayPaneContainer
            ref={this.displayPaneContainerRef}
            bus={this.bus}
            leftIndex={DisplayPaneIndex.LeftMfd}
            rightIndex={DisplayPaneIndex.RightMfd}
            leftPaneFullSize={Vec2Math.create(995, 748)}
            leftPaneHalfSize={Vec2Math.create(495, 748)}
            rightPaneFullSize={Vec2Math.create(995, 748)}
            rightPaneHalfSize={Vec2Math.create(495, 748)}
            displayPaneViewFactory={this.displayPaneViewFactory}
            updateFreq={30}
            alternateUpdatesInSplitMode
            class='display-pane-container-mfd'
          />
          <div class='engine-instruments' data-checklist='checklist-eis'>
            {renderedEis}
          </div>
        </div>
        <DisplayOverlayLayer ref={this.displayOverlayLayerRef} show={this.displayOverlayShow} class='mfd-display-overlay'>
          {overlayVNodes}
        </DisplayOverlayLayer>
        <glasscockpit-highlight ref={this.highlightRef} id="highlight"></glasscockpit-highlight>
        {this.instrumentConfig.startupScreen && (
          <StartupScreen
            ref={this.startupScreenRef}
            airplaneName={this.instrumentConfig.startupScreen.airplaneName}
            airplaneLogoFilePath={this.instrumentConfig.startupScreen.airplaneLogoFilePath}
            bus={this.bus}
            rows={startupScreenRows}
            onConfirmation={this.onStartupConfirmation.bind(this)}
          />
        )}
        <div class={{ 'mfd-boot-splash': true, 'hidden': this.bootSplashHidden }}>
          <img src={`${G3000FilePaths.ASSETS_PATH}/Images/Common/garmin_logo.png`} />
        </div>
      </>
    );
  }

  /** @inheritdoc */
  protected getBootDuration(): number {
    return 4500 + Math.random() * 1000;
  }

  /** @inheritdoc */
  public Update(): void {
    super.Update();

    const realTime = Date.now();

    this.gpsSynchronizer.update();
    this.logicHost.update(this.instrument.deltaTime);

    if (this.flightPlanner.hasActiveFlightPlan() && realTime - this.lastActiveFplCalcTime >= WTG3000MfdInstrument.ACTIVE_FLIGHT_PLAN_CALC_PERIOD) {
      this.flightPlanner.getActiveFlightPlan().calculate();
    }

    if (this.terrainSystem) {
      this.terrainSystemDataProvider.update(realTime);
      this.terrainSystem.update();
    }
  }

  /** @inheritdoc */
  public onSoundEnd(soundEventId: Name_Z): void {
    this.soundServer2.onSoundEnd(soundEventId);
  }

  /** @inheritdoc */
  protected onBootFinished(): void {
    if (this.instrumentConfig.startupScreen) {
      this.avionicsStatusClient.setStatus(AvionicsStatus.Startup);
    } else {
      this.avionicsStatusClient.setStatus(AvionicsStatus.On);
    }
  }

  /** @inheritdoc */
  protected onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    super.onAvionicsStatusChanged(event);

    switch (event.current) {
      case AvionicsStatus.Off:
      case AvionicsStatus.Booting:
        this.startupScreenRef.getOrDefault()?.sleep();
        break;
      case AvionicsStatus.Startup:
        this.startupScreenRef.instance.wake();
        break;
      case AvionicsStatus.On:
        this.startupScreenRef.getOrDefault()?.sleep();
        break;
    }
  }

  /**
   * Responds to changes in the avionics global power state.
   * @param event The event describing the change in the avionics global power state.
   */
  private onGlobalPowerChanged(event: Readonly<AvionicsStatusGlobalPowerEvent>): void {
    this.avionicsGlobalPowerState = event.current;

    if (event.previous === true && event.current === false) {
      // Avionics global power off.

      this.headingSyncManager.pause();
      this.headingSyncManager.reset();

      this.esp?.setAvionicsPowered(false);

      if (this.isFlightPlanInit) {
        this.flightPlanRouteSyncManager.stopAutoSync();
        this.resetFlightPlansOnPowerOff();
      }

      this.fmsSpeedManager?.resetUserOverride();

      this.baroTransitionAlertManager.reset();
      this.baroTransitionAlertManager.pause();

      this.vSpeedBugManager.pause();
      this.trafficOperatingModeManager?.pause();
      this.xpdrTcasManager?.pause();
      this.terrainSystem?.turnOff();
      this.terrainSystem?.removeAllInhibits();
      this.weightBalanceComputer?.pause();
      this.toldManager.pause();
      this.toldComputer?.pause();
      this.initializationManager.resetAccepted();

      if (this.checklistManager) {
        this.checklistManager.resetAll();
        this.checklistManager.sleep();
      }

      // Stop and reset generic timer.
      this.bus.getPublisher<GarminTimerControlEvents>().pub('garmin_gen_timer_set_value_1', 0, true, false);

      this.auralAlertSystem.sleep();

    } else if (event.current === true) {
      // Avionics global power on.

      if (this.isFlightPlanInit) {
        this.flightPlanRouteSyncManager.startAutoSync();
      }

      this.auralAlertSystem.wake();

      if (this.esp) {
        EspUserSettings.getManager(this.bus).getSetting('espEnabled').value = true;
        this.esp.setAvionicsPowered(true);
      }

      this.baroTransitionAlertManager.resume();

      this.terrainSystem?.turnOn();

      if (event.previous === false) {
        // Only reset the autopilot if this was a true power cycle. Otherwise we will end up turning the AP off
        // when loading into a flight in-air.
        this.autopilot?.reset();

        // Only reset the active nav source to GPS/FMS if this was a true power cycle. Otherwise we will override
        // the nav source set by the .FLT file when loading into a powered-on flight. This will still override the
        // .FLT file on a cold-and-dark start, but there shouldn't ever be a case where a non-default state is desired
        // when loading cold-and-dark.
        this.bus.getPublisher<ControlEvents>().pub('cdi_src_set', { type: NavSourceType.Gps, index: 1 }, true, true);

        this.terrainSystem?.startTest();
      }

      // Reset VNAV to enabled.
      this.bus.getPublisher<VNavControlEvents>().pub('vnav_set_state', true, true, false);

      this.headingSyncManager.resume();

      const pfdSettingManager = PfdUserSettings.getMasterManager(this.bus);
      pfdSettingManager.getSetting('pfdBearingPointer1Source_1').resetToDefault();
      pfdSettingManager.getSetting('pfdBearingPointer1Source_2').resetToDefault();
      pfdSettingManager.getSetting('pfdBearingPointer2Source_1').resetToDefault();
      pfdSettingManager.getSetting('pfdBearingPointer2Source_2').resetToDefault();

      this.navRadioMonitorManager.reset();
      this.comRadioTxRxManager.reset();
      this.vSpeedBugManager.reset();
      this.vSpeedBugManager.resume();
      this.displayPanesController.reset();
      this.trafficOperatingModeManager?.reset();
      this.trafficOperatingModeManager?.resume();
      this.xpdrTcasManager?.reset();
      this.xpdrTcasManager?.resume();
      this.weightFuelComputer.reset();
      if (this.weightBalanceComputer) {
        this.weightBalanceComputer.reset();
        this.weightBalanceComputer.resume();

        this.weightBalanceSettingManager!.getSetting('weightBalanceActiveEnvelopeIndex').value = this.config.performance.weightBalanceConfig!.envelopeOptions.defaultIndex;
      }
      this.toldManager.reset(ToldResetType.All);
      this.toldManager.resume();
      this.toldComputer?.resume();
      this.chartsManager.reset();
      this.checklistManager?.wake();

      // Set generic timer mode to counting up.
      this.bus.getPublisher<GarminTimerControlEvents>().pub('garmin_gen_timer_set_mode_1', FlightTimerMode.CountingUp, true, false);
    }
  }

  /**
   * Resets all flight plans when the avionics are turned off.
   */
  private async resetFlightPlansOnPowerOff(): Promise<void> {
    // Cancel any in-progress loads of synced avionics routes so that we don't run into race conditions by resetting
    // the flight plans in the middle of a load.
    await this.flightPlanRouteSyncManager.cancelLoad();

    if (!this.avionicsGlobalPowerState) {
      this.fms.resetAllFlightPlans();
    }
  }

  /**
   * Responds to when the user confirms the startup screen.
   */
  private onStartupConfirmation(): void {
    this.avionicsStatusClient.setStatus(AvionicsStatus.On);
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
    if (this.startupScreenRef.getOrDefault()?.onInteractionEvent(event)) {
      return;
    }

    if (this.displayOverlayLayerRef.instance.onInteractionEvent(event)) {
      return;
    }

    // Left display pane gets priority to handle events.
    this.displayPaneContainerRef.instance.routeInteractionEvent('left', event)
      || this.displayPaneContainerRef.instance.routeInteractionEvent('right', event);
  }
}
