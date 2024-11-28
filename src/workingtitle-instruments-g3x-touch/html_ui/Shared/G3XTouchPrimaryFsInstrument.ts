import {
  APGpsSteerDirectorSteerCommand, APRadioNavInstrument, APVerticalModes, AltitudeSelectManager, ArrayUtils,
  AuralAlertSystem, AuralAlertSystemWarningAdapter, AuralAlertSystemXmlAdapter, CasSystemLegacyAdapter,
  CdiControlEventsForId, ClockEvents, DefaultLNavComputerDataProvider, DefaultXmlAuralAlertParser, FSComponent,
  FlightPlanCalculatedEvent, FlightPlanRouteManager, FlightTimerInstrument, FlightTimerMode, GameStateProvider,
  GpsSynchronizer, LNavComputer, LNavObsManager, MappedSubject, MinimumsManager, MinimumsMode, NavComInstrument,
  NavSourceType, SetSubject, SimVarValueType, SoundServer, Subject, UnitType, UserSetting, VNavAltCaptureType,
  VNavPathMode, VNavState, Value, Wait, XMLWarningFactory, XPDRInstrument
} from '@microsoft/msfs-sdk';

import {
  APExternalGuidanceProvider, FlightPathCalculatorManager, GarminAPConfig, GarminAPStateManager, GarminAPUtils,
  GarminAutopilot, GarminFlightPlanRouteSyncManager, GarminObsLNavModule, GarminTimerControlEvents, GarminTimerManager,
  GarminVNavGlidepathGuidance, GarminVNavGuidance, GarminVNavPathGuidance, MinimumsUnitsManager, NavdataComputer,
  TrafficOperatingModeSetting
} from '@microsoft/msfs-garminsdk';

import { G3XAPApproachAvailableManager } from './Autopilot/G3XAPApproachAvailableManager';
import { G3XNavToNavGuidanceProvider } from './Autopilot/G3XNavToNavGuidanceProvider';
import { AvionicsStatusEvents, AvionicsStatusGlobalPowerEvent } from './AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatusManager } from './AvionicsStatus/AvionicsStatusManager';
import { G3XCdiId } from './CommonTypes';
import { G3XFplSource } from './FlightPlan/G3XFplSourceTypes';
import { G3XInternalPrimaryFlightPlanRouteLoader } from './FlightPlan/G3XInternalPrimaryFlightPlanRouteLoader';
import { G3XInternalPrimaryFlightPlanRouteProvider } from './FlightPlan/G3XInternalPrimaryFlightPlanRouteProvider';
import { FuelTotalizer } from './Fuel';
import { G3XTouchFsInstrument } from './G3XTouchFsInstrument';
import { InstrumentBackplaneNames } from './Instruments/InstrumentBackplaneNames';
import { SavedNavComFrequencyManager } from './NavCom/SavedNavComFrequencyManager';
import { CdiAutoSlewManager } from './Navigation';
import { ActiveNavSourceManager } from './Navigation/ActiveNavSourceManager';
import { FplCalculationUserSettings } from './Settings/FplCalculationUserSettings';
import { FplSourceUserSettings, G3XFplSourceSettingMode } from './Settings/FplSourceUserSettings';
import { G3XDateTimeUserSettings } from './Settings/G3XDateTimeUserSettings';
import { G3XGlobalUserSettingSaveManager } from './Settings/G3XGlobalUserSettingSaveManager';
import { G3XTrafficUserSettings } from './Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from './Settings/G3XUnitsUserSettings';
import { TransponderAutoAirborneManager } from './Transponder/TransponderAutoAirborneManager';
import { TransponderAutoGroundAltManager } from './Transponder/TransponderAutoGroundAltManager';

/**
 * A primary instrument for the G3X Touch.
 */
export class G3XTouchPrimaryFsInstrument extends G3XTouchFsInstrument {

  /** The amount of time between periodic active flight plan calculations, in milliseconds. */
  private static readonly ACTIVE_FLIGHT_PLAN_CALC_PERIOD = 3000;

  private static readonly NULL_GPS_STEER_COMMAND: Readonly<APGpsSteerDirectorSteerCommand> = {
    isValid: false,
    isHeading: false,
    courseToSteer: 0,
    trackRadius: 0,
    dtk: 0,
    xtk: 0,
    tae: 0
  };
  private static readonly NULL_VNAV_GUIDANCE: Readonly<GarminVNavGuidance> = {
    state: VNavState.Disabled,
    isActive: false,
    pathMode: VNavPathMode.None,
    armedClimbMode: APVerticalModes.NONE,
    shouldActivateClimbMode: false,
    altitudeCaptureType: VNavAltCaptureType.None,
    shouldCaptureAltitude: false,
    altitudeToCapture: 0
  };
  private static readonly NULL_VERTICAL_PATH_GUIDANCE: Readonly<GarminVNavPathGuidance> = {
    isValid: false,
    fpa: 0,
    deviation: 0
  };
  private static readonly NULL_GLIDEPATH_GUIDANCE: Readonly<GarminVNavGlidepathGuidance> = {
    approachHasGlidepath: false,
    isValid: false,
    canCapture: false,
    fpa: 0,
    deviation: 0
  };

  private readonly soundServer2 = new SoundServer(this.bus);
  private readonly auralAlertSystem = new AuralAlertSystem(this.bus);
  private readonly avionicsStatusManager = new AvionicsStatusManager(this.bus);

  private readonly obsManager = new LNavObsManager(this.bus, this.config.fms.lnavIndex, this.config.fms.useSimObsState);

  private readonly navComInstrument = new NavComInstrument(this.bus, undefined, 2, 2);
  private readonly apRadioNavInstrument = new APRadioNavInstrument(this.bus, 'g3x');
  private readonly xpdrInstrument = new XPDRInstrument(this.bus);
  private readonly timerInstrument = new FlightTimerInstrument(this.bus, { id: 'g3x', count: 2 });
  private readonly fuelTotalizerInstrument: FuelTotalizer = new FuelTotalizer(this.bus);

  private readonly casLegacyAdapter = new CasSystemLegacyAdapter(this.bus, this.xmlLogicHost, this.config.annunciations);
  // private readonly casMasterAuralAlertManager = new CasMasterAuralAlertManager(this.bus);

  private readonly auralAlertXmlAdapter = new AuralAlertSystemXmlAdapter(
    this.bus,
    this.xmlLogicHost,
    this.casSystem,
    this.instrument.xmlConfig.getElementsByTagName('PlaneHTMLConfig')[0].querySelector(':scope>AuralAlerts'),
    new DefaultXmlAuralAlertParser(this.instrument, 'g3x-aural-$$xml-default$$')
  );
  private readonly auralAlertWarningAdapter = new AuralAlertSystemWarningAdapter(
    this.bus,
    this.xmlLogicHost,
    new XMLWarningFactory(this.instrument).parseConfig(this.instrument.xmlConfig),
    'g3x-aural-$$warning-default$$'
  );

  private readonly flightPathCalcManager = new FlightPathCalculatorManager(
    this.bus,
    {
      id: 'g3x',
      isAdcDataValid: Subject.create(true),
      isGpsDataValid: Subject.create(true),
      maxBankAngle: this.config.fms.flightPathOptions.maxBankAngle,
      lowBankAngle: this.config.fms.flightPathOptions.lowBankAngle
    }
  );

  private readonly activeNavSourceManager = new ActiveNavSourceManager(
    this.bus,
    ArrayUtils.create(3, index => {
      if (index === 0) {
        return undefined;
      }

      return {
        supportNav: this.config.radios.navDefinitions[index] !== undefined,
        supportGps: this.config.fms.externalFplSources[index] !== undefined,
        cdiId: this.config.fms.externalFplSources[index]?.cdiId
      };
    }),
    {
      syncWithSim: this.config.autopilot !== undefined,
      setFromKeyEvents: this.config.autopilot !== undefined
    }
  );

  private readonly cdiAutoSlewManagers = this.config.radios.navDefinitions.map(def => {
    if (!def || !def.supportAutoSlew) {
      return undefined;
    }

    return new CdiAutoSlewManager(this.navSources.get(`NAV${def.index}`));
  });

  private readonly timerManager = new GarminTimerManager(this.bus, { id: 'g3x', genericTimerCount: 1 });

  // TODO: hook up FMS position system selection.
  private readonly lnavComputerDataProvider = new DefaultLNavComputerDataProvider();
  private readonly lnavMaxBankAngle = this.config.autopilot
    ? (): number => {
      return this.autopilot!.apValues.maxBankId.get() === 1
        ? Math.min(this.config.autopilot!.lnavOptions.maxBankAngle, this.config.autopilot!.lowBankOptions.maxBankAngle)
        : this.config.autopilot!.lnavOptions.maxBankAngle;
    }
    : 25;
  private readonly lnavComputer = new LNavComputer(
    this.fplSourceDataProvider.internalSourceDef.lnavIndex,
    this.bus,
    this.flightPlanner,
    new GarminObsLNavModule(this.fplSourceDataProvider.internalSourceDef.lnavIndex, this.bus, this.flightPlanner, {
      intercept: GarminAPUtils.lnavIntercept,
      useSimObsState: this.config.fms.useSimObsState
    }),
    {
      maxBankAngle: this.lnavMaxBankAngle,
      intercept: GarminAPUtils.lnavIntercept,
      dataProvider: this.lnavComputerDataProvider,
      hasVectorAnticipation: true
    }
  );

  private readonly navdataComputer = new NavdataComputer(this.bus, this.flightPlanner, this.facLoader, {
    lnavIndex: this.fplSourceDataProvider.internalSourceDef.lnavIndex,
    useSimObsState: this.config.fms.useSimObsState,
    vnavIndex: this.fplSourceDataProvider.internalSourceDef.vnavIndex,
    useVfrCdiScaling: true
  });

  protected readonly savedNavComFrequenciesManager = new SavedNavComFrequencyManager(
    this.bus,
    this.savedFrequenciesSettingManager,
    this.config.radios,
    this.navComControlPublisher
  );

  private readonly transponderAutoGroundAltManager = this.config.transponder?.includeAutoGroundAlt && this.config.transponder.useSimGroundMode
    ? new TransponderAutoGroundAltManager(this.bus, { enforceModes: !this.config.transponder.hasSelectableGround })
    : undefined;
  private readonly transponderAutoAirborneManager = this.config.transponder?.includeAutoAirborne
    ? new TransponderAutoAirborneManager(this.bus)
    : undefined;

  private readonly gpsSynchronizer = this.config.fms.syncToSim
    ? new GpsSynchronizer(this.bus, this.flightPlanner, this.facLoader, {
      lnavIndex: this.config.fms.lnavIndex,
      vnavIndex: this.config.fms.vnavIndex
    })
    : undefined;

  private readonly gpsSteerCommand = Value.create<Readonly<APGpsSteerDirectorSteerCommand>>({
    isValid: false,
    isHeading: false,
    courseToSteer: 0,
    trackRadius: 0,
    dtk: 0,
    xtk: 0,
    tae: 0
  });
  private readonly vnavGuidance = Value.create<Readonly<GarminVNavGuidance>>(G3XTouchPrimaryFsInstrument.NULL_VNAV_GUIDANCE);
  private readonly verticalPathGuidance = Value.create<Readonly<GarminVNavPathGuidance>>(G3XTouchPrimaryFsInstrument.NULL_VERTICAL_PATH_GUIDANCE);
  private readonly glidepathGuidance = Value.create<Readonly<GarminVNavGlidepathGuidance>>(G3XTouchPrimaryFsInstrument.NULL_GLIDEPATH_GUIDANCE);

  private readonly apExternalGuidanceProviders = this.config.fms.externalFplSources.map(config => {
    if (!config) {
      return undefined;
    }

    return new APExternalGuidanceProvider(
      config.apGuidanceIndex,
      { supportGpsSteer: true, supportVNav: true, supportGlidepath: true }
    );
  });

  private readonly navToNavGuidanceProvider = new G3XNavToNavGuidanceProvider(this.bus, this.fplSourceDataProvider);

  private readonly apConfig = this.config.autopilot
    ? new GarminAPConfig(this.bus, {
      cdiId: 'g3x',
      useIndicatedMach: true,
      lnavOptions: {
        steerCommand: this.gpsSteerCommand
      },
      vnavGuidance: this.vnavGuidance,
      verticalPathGuidance: this.verticalPathGuidance,
      glidepathGuidance: this.glidepathGuidance,
      navToNavGuidance: this.navToNavGuidanceProvider,
      rollMinBankAngle: this.config.autopilot.rollOptions.minBankAngle,
      rollMaxBankAngle: this.config.autopilot.rollOptions.maxBankAngle,
      hdgMaxBankAngle: this.config.autopilot.hdgOptions.maxBankAngle,
      vorMaxBankAngle: this.config.autopilot.vorOptions.maxBankAngle,
      locMaxBankAngle: this.config.autopilot.locOptions.maxBankAngle,
      lnavMaxBankAngle: this.config.autopilot.lnavOptions.maxBankAngle,
      lowBankAngle: this.config.autopilot.lowBankOptions.maxBankAngle,
    })
    : undefined;

  private readonly autopilot = this.apConfig
    ? new GarminAutopilot(
      this.bus, this.flightPlanner,
      this.apConfig,
      new GarminAPStateManager(this.bus, this.apConfig),
      {
        minimumsDataProvider: this.minimumsDataProvider,
        altSelectOptions: { transformSetToIncDec: true }
      }
    )
    : undefined;

  private readonly apApproachAvailableManager = this.autopilot
    ? new G3XAPApproachAvailableManager(this.bus, this.fplSourceDataProvider)
    : undefined;

  private readonly altSelectManager = this.autopilot === undefined
    ? this.createStandaloneAltitudeSelectManager()
    : undefined;

  private readonly minimumsManager = new MinimumsManager(this.bus);
  private readonly minimumsUnitsManager = new MinimumsUnitsManager(this.bus);

  private globalSettingSaveManager?: G3XGlobalUserSettingSaveManager;

  private readonly flightPlanRouteSyncManager = new GarminFlightPlanRouteSyncManager();
  private isPrimaryFlightPlanInit = false;

  private lastActiveFplCalcTime = 0;

  private avionicsGlobalPowerState: boolean | undefined = undefined;

  /**
   * Creates a new instance of G3XTouchFsInstrument.
   * @param instrument This instrument's parent BaseInstrument.
   */
  constructor(instrument: BaseInstrument) {
    super(instrument, true);

    this.backplane.addInstrument(InstrumentBackplaneNames.NavCom, this.navComInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.AutopilotRadioNav, this.apRadioNavInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Xpdr, this.xpdrInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Timer, this.timerInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.FuelTotalizer, this.fuelTotalizerInstrument);

    this.obsManager.init();

    //Sets the simvar that tells the VFRMap not to construct a flight plan for display from the game
    //flight plan, but instead to get flight plan events from the avionics.
    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    // The G3X does not support FMS-managed speed.
    SimVar.SetSimVarValue('L:XMLVAR_SpeedIsManuallySet', SimVarValueType.Bool, 1);

    // Initialize the autopilot when the flight starts.
    if (this.autopilot) {
      Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.ingame, true).then(() => {
        this.autopilot!.stateManager.initialize();
      });
    }

    this.doInit().catch(e => {
      console.error(e);
    });
  }

  /**
   * Creates a new standalone altitude select manager.
   * @returns A new standalone altitude select manager.
   */
  private createStandaloneAltitudeSelectManager(): AltitudeSelectManager {
    const stops = SetSubject.create<number>();

    MappedSubject.create(this.minimumsDataProvider.mode, this.minimumsDataProvider.minimums).sub(([mode, minimums]) => {
      stops.clear();

      if (mode === MinimumsMode.BARO && minimums !== null) {
        stops.add(minimums);
      }
    }, true);

    return new AltitudeSelectManager(this.bus, undefined, {
      supportMetric: false,
      minValue: UnitType.FOOT.createNumber(-1000),
      maxValue: UnitType.FOOT.createNumber(50000),
      inputIncrLargeThreshold: 999,
      incrSmall: UnitType.FOOT.createNumber(100),
      incrLarge: UnitType.FOOT.createNumber(1000),
      initOnInput: true,
      initToIndicatedAlt: true,
      transformSetToIncDec: true
    }, stops);
  }

  /**
   * Performs initialization tasks.
   */
  private async doInit(): Promise<void> {
    await this.initPlugins();

    this.initPersistentSettings();

    this.auralAlertXmlAdapter.start();
    this.auralAlertWarningAdapter.start();

    this.backplane.init();

    this.avionicsStatusManager.init();

    this.flightPathCalcManager.init();

    this.initActiveFplCalcListener();
    this.initFlightPlans();

    // this.fmsPositionSelector.init();

    // this.radarAltimeterDataProvider.init();
    // this.gps1DataProvider.init();
    // this.gps2DataProvider.init();
    this.fplSourceDataProvider.init();
    this.gpsIntegrityDataProvider.init();
    this.minimumsDataProvider.init();
    this.activeNavSourceManager.init();
    // this.dmeTuneManager.init();
    // this.comRadioTxRxManager.init();
    // this.vSpeedBugManager.init(true);
    this.windDataProvider.init();
    this.vnavDataProvider.init();
    this.posHeadingDataProvider.init();
    this.comRadioSpacingDataProvider.init();
    // this.weightFuelComputer.init();
    this.savedNavComFrequenciesManager.init();
    this.navComSavedFrequenciesProvider.init();
    this.mapTerrainWxSettingCompatManager.init();

    if (this.autopilot) {
      this.navToNavGuidanceProvider.init();
      this.apApproachAvailableManager!.init();
    }

    this.transponderAutoGroundAltManager?.init();
    this.transponderAutoAirborneManager?.init();

    this.timerManager.init();
    this.minimumsUnitsManager.init();

    if (this.trafficSystem) {
      this.trafficSystem.init();
      // Always initialize traffic system to operating mode since the G3X doesn't provide any way to disable traffic.
      // TODO: TAS may be an exception to this since it doesn't make sense for it to actively interrogate while on the
      // ground. But we have no references for it, so it will be treated the same as the other traffic sources for now.
      G3XTrafficUserSettings.getManager(this.bus).getSetting('trafficOperatingMode').set(TrafficOperatingModeSetting.Operating);
    }

    this.casPowerStateManager.init();
    // this.casMasterAuralAlertManager.init();

    // this.altimeterBaroKeyEventHandler.init();

    this.bus.getSubscriber<AvionicsStatusEvents>().on('avionics_global_power').handle(this.onGlobalPowerChanged.bind(this));

    this.registerUiComponents();

    this.initNearestContext();

    FSComponent.render(
      this.renderComponents(),
      this.instrument.getChildById('Electricity')
    );

    // (this.instrument as WTG3000BaseInstrument<this>).setHighlightElement(this.highlightRef.instance);

    this.initAvionicsStatusListener();

    this.initSelectedAltitude();

    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      this.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(this.updateNavigation.bind(this));
    });

    this.doDelayedInit();
  }

  /**
   * Performs initialization tasks after a 500-millisecond wait.
   */
  private async doDelayedInit(): Promise<void> {
    await Wait.awaitDelay(500);

    this.casLegacyAdapter.start();
    // this.comRadioSpacingManager.init();
    // this.navRadioMonitorManager.init();
  }

  /** @inheritDoc */
  protected initGlobalPersistentSettings(pluginSettings: Iterable<UserSetting<any>>): void {
    this.globalSettingSaveManager = new G3XGlobalUserSettingSaveManager(this.bus, {
      displaySettingManager: this.displaySettingManager,
      pfdSettingManager: this.pfdSettingManager,
      dateTimeSettingManager: G3XDateTimeUserSettings.getManager(this.bus),
      trafficSettingManager: G3XTrafficUserSettings.getManager(this.bus),
      fplCalcSettingManager: FplCalculationUserSettings.getManager(this.bus),
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.bus),
      pluginSettings
    });

    const profileKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}_g3x-default-profile_global`;
    this.globalSettingSaveManager.load(profileKey);
    this.globalSettingSaveManager.startAutoSave(profileKey);
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

  /** @inheritDoc */
  protected async initInternalFlightPlans(): Promise<void> {
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
      new G3XInternalPrimaryFlightPlanRouteLoader(this.fms),
      new G3XInternalPrimaryFlightPlanRouteProvider(this.fms)
    );

    // Always load the synced avionics route, or the EFB route if a synced route does not exist, on flight start.
    const routeToLoad = manager.syncedAvionicsRoute.get() ?? manager.efbRoute.get();
    await this.flightPlanRouteSyncManager.loadRoute(routeToLoad);

    if (this.config.fms.syncToSim) {
      this.flightPlanRouteSyncManager.replyToAllPendingRequests();
      this.flightPlanRouteSyncManager.startAutoReply();
    }

    this.isPrimaryFlightPlanInit = true;

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
   * Initializes the state of the autopilot's selected altitude.
   */
  private initSelectedAltitude(): void {
    const needInit = SimVar.GetSimVarValue('L:1:Garmin_Init_Selected_Altitude', SimVarValueType.Bool);
    if (needInit) {
      this.autopilot?.setSelectedAltitudeInitialized(true);
      this.altSelectManager?.setSelectedAltitudeInitialized(true);
    }
  }

  /**
   * Updates FMS lateral/vertical guidance and the autopilot.
   */
  private updateNavigation(): void {
    const fplSource = this.fplSourceDataProvider.source.get();
    if (fplSource === G3XFplSource.Internal || fplSource === G3XFplSource.InternalRev) {
      this.lnavComputerDataProvider.update();
      this.lnavComputer.update();

      if (this.autopilot) {
        this.gpsSteerCommand.set(this.lnavComputer.steerCommand.get());
        this.vnavGuidance.set(G3XTouchPrimaryFsInstrument.NULL_VNAV_GUIDANCE);
        this.verticalPathGuidance.set(G3XTouchPrimaryFsInstrument.NULL_VERTICAL_PATH_GUIDANCE);
        this.glidepathGuidance.set(G3XTouchPrimaryFsInstrument.NULL_GLIDEPATH_GUIDANCE);

        this.autopilot.update();
      }
    } else {
      if (this.autopilot) {
        const externalGuidanceProvider = this.apExternalGuidanceProviders[fplSource === G3XFplSource.External1 ? 1 : 2];

        if (externalGuidanceProvider) {
          externalGuidanceProvider.update();
          this.gpsSteerCommand.set(externalGuidanceProvider.gpsSteerCommand);
          this.vnavGuidance.set(externalGuidanceProvider.vnavGuidance);
          this.verticalPathGuidance.set(externalGuidanceProvider.verticalPathGuidance);
          this.glidepathGuidance.set(externalGuidanceProvider.glidepathGuidance);
        } else {
          this.gpsSteerCommand.set(G3XTouchPrimaryFsInstrument.NULL_GPS_STEER_COMMAND);
          this.vnavGuidance.set(G3XTouchPrimaryFsInstrument.NULL_VNAV_GUIDANCE);
          this.verticalPathGuidance.set(G3XTouchPrimaryFsInstrument.NULL_VERTICAL_PATH_GUIDANCE);
          this.glidepathGuidance.set(G3XTouchPrimaryFsInstrument.NULL_GLIDEPATH_GUIDANCE);
        }

        this.autopilot.update();
      }
    }
  }

  /** @inheritdoc */
  public Update(): void {
    super.Update();

    this.gpsSynchronizer?.update();
    this.xmlLogicHost.update(this.instrument.deltaTime);

    if (this.flightPlanner.hasActiveFlightPlan() && Date.now() - this.lastActiveFplCalcTime >= G3XTouchPrimaryFsInstrument.ACTIVE_FLIGHT_PLAN_CALC_PERIOD) {
      this.flightPlanner.getActiveFlightPlan().calculate();
    }
  }

  /** @inheritdoc */
  public onSoundEnd(soundEventId: Name_Z): void {
    this.soundServer2.onSoundEnd(soundEventId);
  }

  /**
   * Responds to changes in the avionics global power state.
   * @param event The event describing the change in the avionics global power state.
   */
  private onGlobalPowerChanged(event: Readonly<AvionicsStatusGlobalPowerEvent>): void {
    this.avionicsGlobalPowerState = event.current;

    if (event.previous === true && event.current === false) {
      // Avionics global power off.

      if (this.isPrimaryFlightPlanInit) {
        this.flightPlanRouteSyncManager.stopAutoSync();
        this.resetFlightPlansOnPowerOff();
      }

      // this.vSpeedBugManager.pause();

      // Stop and reset generic timer.
      this.bus.getPublisher<GarminTimerControlEvents>().pub('garmin_gen_timer_set_value_1', 0, true, false);

      this.auralAlertSystem.sleep();

    } else if (event.current === true) {
      // Avionics global power on.

      if (this.isPrimaryFlightPlanInit) {
        this.flightPlanRouteSyncManager.startAutoSync();
      }

      if (event.previous === false) {
        // Only reset the autopilot if this was a true power cycle. Otherwise we will end up turning the AP off
        // when loading into a flight in-air.
        this.autopilot?.reset();
        this.altSelectManager?.reset(0, true);

        // Only reset the active nav source to GPS/FMS if this was a true power cycle. Otherwise we will override
        // the nav source set by the .FLT file when loading into a powered-on flight. This will still override the
        // .FLT file on a cold-and-dark start, but there shouldn't ever be a case where a non-default state is desired
        // when loading cold-and-dark.
        const cdiSourceIndex = this.config.fms.externalFplSources[1] ? 1 : this.config.fms.externalFplSources[2] ? 2 : 3;
        this.bus.getPublisher<CdiControlEventsForId<G3XCdiId>>().pub('cdi_src_set_g3x', { type: NavSourceType.Gps, index: cdiSourceIndex }, true, false);
      }

      this.auralAlertSystem.wake();

      // const pfdSettingManager = PfdUserSettings.getMasterManager(this.bus);
      // pfdSettingManager.getSetting('pfdBearingPointer1Source_1').resetToDefault();
      // pfdSettingManager.getSetting('pfdBearingPointer1Source_2').resetToDefault();
      // pfdSettingManager.getSetting('pfdBearingPointer2Source_1').resetToDefault();
      // pfdSettingManager.getSetting('pfdBearingPointer2Source_2').resetToDefault();

      // this.navRadioMonitorManager.reset();
      // this.comRadioTxRxManager.reset();
      // this.vSpeedBugManager.reset();
      // this.vSpeedBugManager.resume();
      // this.displayPanesController.reset();
      // this.weightFuelComputer.reset();

      // Set flight plan source setting to external if at least one compatible external navigator is supported, and to
      // internal otherwise.
      FplSourceUserSettings.getManager(this.bus).getSetting('fplSource').value = this.config.fms.externalFplSourceCount > 0
        ? G3XFplSourceSettingMode.External
        : G3XFplSourceSettingMode.Internal;

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
}
