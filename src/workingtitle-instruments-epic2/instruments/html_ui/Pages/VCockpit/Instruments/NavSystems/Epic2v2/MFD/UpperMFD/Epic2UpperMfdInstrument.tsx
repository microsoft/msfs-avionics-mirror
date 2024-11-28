/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  APRadioNavInstrument, ArrayUtils, AutothrottleThrottleIndex, AvionicsSystemState, ClockEvents, ConsumerSubject, EngineType, FlightPlanRouteManager,
  FSComponent, GameStateProvider, GpsSynchronizer, LNavComputer, MappedSubject, PluginSystem, SimVarValueType, Subject, Wait, WeightBalanceSimvarPublisher
} from '@microsoft/msfs-sdk';

import {
  AltimeterBaroKeyEventHandler, AvionicsConfig, DefaultAirGroundDataProvider, DefaultAirspeedDataProvider, DefaultAltitudeDataProvider,
  DefaultAutopilotDataProvider, DefaultFlapWarningDataProvider, DefaultHeadingDataProvider, DefaultInertialDataProvider, DefaultLandingGearDataProvider,
  DefaultRadioAltimeterDataProvider, DefaultStallWarningDataProvider, Epic2Adsb, Epic2APConfig, Epic2APStateManager, Epic2APUtils, Epic2Autopilot,
  Epic2DuControlEvents, Epic2Fadec, Epic2FlightAreaComputer, Epic2FlightPlans, Epic2Fms, Epic2FsInstrument, Epic2NavDataComputer, Epic2SpeedPredictions,
  Epic2TcasAuralAlertManager, Epic2TcasII, Epic2VSpeedController, FlightPlanListManager, FlightPlanStore, FmcSimVarPublisher, FmsMessageManager,
  FuelTotalizerSimVarPublisher, Gpws, InstrumentBackplaneNames, MapDataProvider, ModalKey, ModalPosition, ModalService, SpeedOverrideController,
  TakeoffConfigPublisher, TrafficOperatingModeManager
} from '@microsoft/msfs-epic2-shared';

import { Epic2Autothrottle } from './Autothrottle/Epic2Autothrottle';
import { Epic2JetFadec } from './Autothrottle/Epic2JetFadec';
import { Epic2TurbopropFadec } from './Autothrottle/Epic2TurbopropFadec';
import { Epic2UpperMfdAvionicsPlugin, Epic2UpperMfdPluginBinder } from './Epic2UpperMfdAvionicsPlugin';
import { DepartureArrivalModal } from './FlightPlanConfigSection/DepartureArrivalOverlay/DepartureArrivalModal';
import { FlightPlanConfigSection } from './FlightPlanConfigSection/FlightPlanConfigSection';
import { FlightPlanListSection } from './FlightPlanListSection/FlightPlanListSection';
import { LogControllerOptions } from './FlightPlanLogControllerSection';
import { FlightPlanLogControllerSection } from './FlightPlanLogControllerSection/FlightPlanLogControllerSection';
import { Epic2FlightPlanRouteLoader } from './Fms/Epic2FlightPlanRouteLoader';
import { Epic2FlightPlanRouteSyncManager } from './Fms/Epic2FlightPlanRouteSyncManager';
import { Epic2FmsSpeedManager } from './Fms/Epic2FmsSpeedManager';
import { MfdMap } from './Map/MfdMap';
import { NearestFunctionModal } from './Map/NearestFunctionModal';
import { CrossModal } from './Modals/CrossDialog';
import { HoldModal } from './Modals/HoldModal';
import { InterceptModal } from './Modals/InterceptModal';
import { JoinAirwayOverlay } from './Modals/JoinOverlayModal';
import { SelectObjectModal } from './Modals/SelectObjectModal';
import { ShowInfoModal } from './Modals/ShowInfo/ShowInfoModal';
import { Epic2DmeController } from './NavCom/Epic2DmeController';

/**
 * The EPIC2 upper MFD instrument.
 */
export class Epic2UpperMfdInstrument extends Epic2FsInstrument {
  private readonly pluginSystem = new PluginSystem<Epic2UpperMfdAvionicsPlugin, Epic2UpperMfdPluginBinder>();

  private readonly lnavComputer = new LNavComputer(
    0,
    this.bus,
    this.flightPlanner,
    undefined,
    {
      maxBankAngle: 35,
      intercept: Epic2APUtils.lnavInterceptCurve,
      hasVectorAnticipation: true
    }
  );

  private autopilot!: Epic2Autopilot;
  private apRadioNavInstrument!: APRadioNavInstrument;

  private fadec!: Epic2Fadec;
  private autothrottle!: Epic2Autothrottle;

  private readonly fms: Epic2Fms;
  private readonly fplSyncManager?: Epic2FlightPlanRouteSyncManager;
  private readonly gpws: Gpws;
  private readonly tcas: Epic2TcasII;
  private readonly trafficOperatingModeManager: TrafficOperatingModeManager;
  private readonly tcasAurals: Epic2TcasAuralAlertManager;

  private readonly gpsSynchronizer = new GpsSynchronizer(this.bus, this.flightPlanner, this.facLoader);

  private readonly upperMfdSettings = this.mfdUserSettingsManager.getAliasedManager(this.displayUnitIndex);

  // When the MFDs are swapped, the upper MFD instrument is displayed on the lower DU. The lower DU is driven by AGM2.
  // When the MFD are not swapped, the upper MFD instrument is displayed on the upper DU which is driven by AGM1.
  private readonly isMfdSwapped = ConsumerSubject.create(this.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_mfd_swap'), false);
  private readonly agmSubject = MappedSubject.create(
    ([agm1State, agm2State, isMfdSwapped]) => (isMfdSwapped && agm2State === AvionicsSystemState.On) || (!isMfdSwapped && agm1State === AvionicsSystemState.On),
    this.agm1State, this.agm2State, this.isMfdSwapped
  );

  private readonly headingDataProvider = new DefaultHeadingDataProvider(this.bus, this.selectedFmsPosIndex, this.selectedAdahrsIndex, this.displayUnitIndex);
  private readonly autopilotDataProvider = new DefaultAutopilotDataProvider(this.bus, 1, this.config.autopilot);
  private readonly inertialDataProvider = new DefaultInertialDataProvider(this.bus, this.selectedAdahrsIndex, this.selectedFmsPosIndex, this.displayUnitIndex);
  private readonly airspeedDataProvider = new DefaultAirspeedDataProvider(this.bus, this.selectedAdahrsIndex, this.displayUnitIndex);
  private readonly altitudeDataProvider = new DefaultAltitudeDataProvider(this.bus, 1, 1);
  private readonly flapWarningDataProvider = new DefaultFlapWarningDataProvider(this.bus, this.selectedFlapWarningIndex);
  private readonly landingGearDataProvider = new DefaultLandingGearDataProvider(this.bus, 1);
  private readonly radioAltimeterDataProvider = new DefaultRadioAltimeterDataProvider(this.bus, 1);
  protected readonly stallWarningDataProvider = new DefaultStallWarningDataProvider(
    this.bus, this.selectedAoaIndex, this.selectedAdahrsIndex,
  );
  private readonly airGroundDataProvider = new DefaultAirGroundDataProvider(
    this.bus,
    this.airspeedDataProvider,
    this.landingGearDataProvider,
    this.radioAltimeterDataProvider
  );

  private takeoffConfigPublisher!: TakeoffConfigPublisher;

  private readonly mfdMapDataProvider = new MapDataProvider(
    this.bus,
    this.headingDataProvider,
    this.inertialDataProvider,
    this.upperMfdSettings.getSetting('mapDisplayMode'),
    this.upperMfdSettings.getSetting('mapRange'),
    this.upperMfdSettings.getSetting('mapWaypointsDisplay'),
  );

  private readonly fmcSimVarPublisher = new FmcSimVarPublisher(this.bus);
  private readonly weightAndBalancePublisher = new WeightBalanceSimvarPublisher(this.bus);

  private readonly flightPlanStoreActive: FlightPlanStore;
  private readonly flightPlanStorePending: FlightPlanStore;
  private readonly flightPlanListManagerActive: FlightPlanListManager;
  private readonly flightPlanListManagerPending: FlightPlanListManager;

  private readonly flightAreaComputer: Epic2FlightAreaComputer;
  private readonly speedPredictionComputer: Epic2SpeedPredictions;
  protected readonly fmsSpeedManager: Epic2FmsSpeedManager;
  private readonly vSpeedController: Epic2VSpeedController;
  private readonly navdataComputer = new Epic2NavDataComputer(this.bus, this.flightPlanner);

  private readonly dmeController = new Epic2DmeController(this.bus, this.navComUserSettingsManager);
  private readonly speedOverrideController = new SpeedOverrideController(this.bus);

  protected altimeterBaroKeyEventHandler?: AltimeterBaroKeyEventHandler;

  private readonly modalService = new ModalService(document.getElementById('ModalsContainer')!);

  private readonly fuelTotalizerPublisher = new FuelTotalizerSimVarPublisher(this.bus);
  private readonly fmsMessageManager: FmsMessageManager;

  private lastCalculate = 0;

  private selectedLogControllerOption = Subject.create<LogControllerOptions>(LogControllerOptions.Cross);

  /** @inheritdoc */
  constructor(
    public readonly instrument: BaseInstrument,
    config: AvionicsConfig,
  ) {
    super(instrument, config);

    this.fms = new Epic2Fms(
      this.bus,
      this.flightPlanner,
      this.verticalPathCalculator,
      true,
      this.config,
      this.inertialDataProvider,
      this.airspeedDataProvider,
      this.airGroundDataProvider,
    );

    this.fmsMessageManager = new FmsMessageManager(this.bus, this.fms.performancePlanProxy, this.airGroundDataProvider, this.altitudeDataProvider);

    this.fplSyncManager = new Epic2FlightPlanRouteSyncManager(this.fms);

    this.vSpeedController = new Epic2VSpeedController(this.bus, this.config.airframe);
    this.speedPredictionComputer = new Epic2SpeedPredictions(this.fms, this.bus, this.config.speedSchedules, this.vSpeedController, this.verticalPathCalculator);

    this.fmsSpeedManager = new Epic2FmsSpeedManager(this.bus, this.facLoader, this.flightPlanner, this.speedPredictionComputer, config);

    this.flightPlanStoreActive = new FlightPlanStore(
      this.bus,
      this.fms,
      Epic2FlightPlans.Active,
      this.flightPlanner,
      this.verticalPathCalculator,
      this.fms.performancePlanRepository,
      this.upperMfdSettings,
      this.speedPredictionComputer
    );
    this.flightPlanStoreActive.init();
    this.flightPlanStorePending = new FlightPlanStore(
      this.bus,
      this.fms,
      Epic2FlightPlans.Pending,
      this.flightPlanner,
      this.verticalPathCalculator,
      this.fms.performancePlanRepository,
      this.upperMfdSettings,
    );
    this.flightPlanStorePending.init();

    this.flightPlanListManagerActive = new FlightPlanListManager(this.bus, this.flightPlanStoreActive, this.fms, Epic2FlightPlans.Active, Subject.create(false));
    this.flightPlanListManagerPending = new FlightPlanListManager(this.bus, this.flightPlanStorePending, this.fms, Epic2FlightPlans.Pending, Subject.create(false));

    this.flightAreaComputer = new Epic2FlightAreaComputer(this.bus, this.selectedFmsPosIndex, this.flightPlanStoreActive);

    this.gpws = new Gpws(this.bus, 1, this.facLoader, this.autopilotDataProvider);
    this.tcas = new Epic2TcasII(this.bus, this.trafficInstrument, new Epic2Adsb(this.bus), this.config.sensors.acasDefinition);
    this.trafficOperatingModeManager = new TrafficOperatingModeManager(this.bus);
    this.tcasAurals = new Epic2TcasAuralAlertManager(this.bus);

    // FIXME proper backplane name
    this.backplane.addPublisher('fmcSimVars', this.fmcSimVarPublisher);
    this.backplane.addPublisher('weightAndBalance', this.weightAndBalancePublisher);
    this.backplane.addPublisher('fuelTotalizer', this.fuelTotalizerPublisher);
    this.backplane.addInstrument(InstrumentBackplaneNames.HeadingDataProvider, this.headingDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AutopilotDataProvider, this.autopilotDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.InertialDataProvider, this.inertialDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AirspeedDataProvider, this.airspeedDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AltitudeDataProvider, this.altitudeDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.FlapWarningDataProvider, this.flapWarningDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.LandingGearDataProvider, this.landingGearDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.RadioAltimeterDataProvider, this.radioAltimeterDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.StallWarningDataProvider, this.stallWarningDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.AirGroundDataProvider, this.airGroundDataProvider);
    this.backplane.addInstrument(InstrumentBackplaneNames.DmeController, this.dmeController);
    this.backplane.addInstrument(InstrumentBackplaneNames.FmsMessageManager, this.fmsMessageManager);

    this.agmSubject.pipe(this.isAgmOn);

    this.doInit();
  }

  /** Init instrument. */
  protected override doInit(): void {
    // init plugins before super init so they have a chance to hook up to the backplane etc.
    this.initPluginSystem().then(() => {
      this.initializeAutopilot();

      this.initFlightPlan().then(() => {
        // Depends on perf plan existing => flight plans need to exist
        this.setupBaroKeyEventHandler();

        this.flightAreaComputer.init();

        // initialise the AP after the flight plans are available
        this.autopilot.stateManager.initialize();

        if (this.fplSyncManager) {
          this.fplSyncManager.replyToAllPendingRequests();
          this.fplSyncManager.startAutoReply();
          this.fplSyncManager.startAutoSync();
        }
      });

      this.renderComponents();

      this.registerModals();
      this.tcas.init();
      this.trafficOperatingModeManager.init();
      this.tcasAurals.init();
      this.gpws.init();
      this.fmsSpeedManager.init();

      // Called once after rendering all input fields.
      Coherent.trigger('UNFOCUS_INPUT_FIELD', '');

      super.doInit();
    });

    /** Sets the performance plan data according to the entered fields */
    const perfPlan = this.fms.performancePlanRepository.getActivePlan();
    const bow = this.upperMfdSettings.tryGetSetting('basicOperatingWeightLbs')?.get();
    const paxWt = this.upperMfdSettings.tryGetSetting('passengerWeightLbs')?.get();
    const crzKts = this.upperMfdSettings.tryGetSetting('cruiseSpeedKts')?.get();
    const crzMach = this.upperMfdSettings.tryGetSetting('cruiseSpeedMach')?.get();
    (bow !== undefined && !isNaN(bow)) && perfPlan.basicOperatingWeight.set(bow);
    (paxWt !== undefined && !isNaN(paxWt)) && perfPlan.averagePassengerWeight.set(paxWt);
    (crzKts !== undefined && !isNaN(crzKts)) && perfPlan.cruiseTargetSpeedIas.set(crzKts);
    (crzMach !== undefined && !isNaN(crzMach)) && perfPlan.cruiseTargetSpeedMach.set(crzMach);
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is ready.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });

    const pluginBinder: Epic2UpperMfdPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      config: this.config,
    };

    return this.pluginSystem.startSystem(pluginBinder);
  }

  /** Setup the baro key event handler. */
  protected setupBaroKeyEventHandler(): void {
    // this is the one and only instance managing all altimeters
    this.altimeterBaroKeyEventHandler = new AltimeterBaroKeyEventHandler(
      this.bus,
      ArrayUtils.flat(this.config.sensors.adahrsDefinitions.slice(1).map(def => {
        return [
          {
            index: def.leftAltimeterIndex,
          },
          {
            index: def.rightAltimeterIndex,
          },
        ];
      })),
      this.pfdUserSettingsManager,
      this.fms.getActivePerformancePlan(),
    );

    this.altimeterBaroKeyEventHandler.init();
  }

  /** @inheritdoc */
  private renderComponents(): void {
    FSComponent.render(
      <>
        <MfdMap
          bus={this.bus}
          facLoader={this.facLoader}
          flightPlanner={this.flightPlanner}
          settings={this.upperMfdSettings}
          mapDataProvider={this.mfdMapDataProvider}
          perfPlanRepository={this.fms.performancePlanRepository}
          modalService={this.modalService}
          store={this.flightPlanStoreActive}
          // activeRoutePredictor={this.pred}
          tcas={this.tcas}
          headingDataProvider={this.headingDataProvider}
          autopilotDataProvider={this.autopilotDataProvider}
          altitudeDataProvider={this.altitudeDataProvider}
          inertialDataProvider={this.inertialDataProvider}
          fms={this.fms}
        />
        <FlightPlanLogControllerSection
          bus={this.bus}
          activeStore={this.flightPlanStoreActive}
          pendingStore={this.flightPlanStorePending}
          fms={this.fms}
          selectedLogControllerOption={this.selectedLogControllerOption}
          modalService={this.modalService}
        />
        <FlightPlanListSection
          bus={this.bus}
          fms={this.fms}
          selectedLogControllerOption={this.selectedLogControllerOption}
          planIndex={Epic2FlightPlans.Pending}
          storeActive={this.flightPlanStoreActive}
          storePending={this.flightPlanStorePending}
          listManagerActive={this.flightPlanListManagerActive}
          listManagerPending={this.flightPlanListManagerPending}
          modalService={this.modalService}
        />
        <FlightPlanConfigSection
          bus={this.bus}
          fms={this.fms}
          activeFlightPlanStore={this.flightPlanStoreActive}
          pendingFlightPlanStore={this.flightPlanStorePending}
          modalService={this.modalService}
          perfPlanRepository={this.fms.performancePlanRepository}
          settings={this.upperMfdSettings}
          vSpeedController={this.vSpeedController}
        />
      </>,
      document.getElementById('UpperMfdContent'),
    );
  }

  /** Registers the modal components. */
  private registerModals(): void {
    this.modalService.registerModal(ModalKey.DepartureArrival, ModalPosition.FlightManagementWindowBottom, () =>
      <DepartureArrivalModal fms={this.fms} bus={this.bus} activeStore={this.flightPlanStoreActive} pendingStore={this.flightPlanStorePending} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.SelectObject, ModalPosition.FlightManagementWindowBottom, () =>
      <SelectObjectModal fms={this.fms} bus={this.bus} store={this.flightPlanStoreActive} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.JoinAirway, ModalPosition.FlightManagementWindowTop, () =>
      <JoinAirwayOverlay fms={this.fms} bus={this.bus} store={this.flightPlanStorePending} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.Hold, ModalPosition.InavMap, () =>
      <HoldModal fms={this.fms} bus={this.bus} store={this.flightPlanStoreActive} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.Intercept, ModalPosition.InavMap, () =>
      <InterceptModal fms={this.fms} bus={this.bus} store={this.flightPlanStoreActive} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.Cross, ModalPosition.InavMap, () =>
      <CrossModal fms={this.fms} bus={this.bus} store={this.flightPlanStoreActive} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.NearestAirports, ModalPosition.InavMap, () =>
      <NearestFunctionModal fms={this.fms} bus={this.bus} store={this.flightPlanStorePending} modalService={this.modalService} />
    );
    this.modalService.registerModal(ModalKey.ShowInfo, ModalPosition.FlightManagementWindowBottom, () =>
      <ShowInfoModal fms={this.fms} bus={this.bus} store={this.flightPlanStorePending} modalService={this.modalService} />
    );
  }

  /** Makes sure that we have the flight plan, requesting sync if needed. */
  private async initFlightPlan(): Promise<void> {
    // Sets the simvar that tells the VFRMap not to construct a flight plan for display from the game
    // flight plan, but instead to get flight plan events from the avionics.
    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    // Request sync
    this.flightPlanner.requestSync();

    // Wait for sync
    await Wait.awaitDelay(500);

    const [, routeManager] = await Promise.all([
      this.fms.initFlightPlans(),
      FlightPlanRouteManager.getManager()
    ]);

    if (this.fplSyncManager) {
      this.fplSyncManager.init(routeManager, new Epic2FlightPlanRouteLoader(this.fms));
    }
  }

  /**
   * Initializes the autopilot.
   * @throws When an invalid system configuration is encountered.
   */
  private initializeAutopilot(): void {

    const epic2ApConfig = new Epic2APConfig(
      this.bus,
      this.facLoader,
      this.flightPlanner,
      this.flightPlanStoreActive,
      this.selectedFmsPosIndex,
      this.verticalPathCalculator,
      this.fms.activePerformancePlan,
      this.lnavComputer.steerCommand,
      this.pluginSystem,
    );
    this.autopilot = new Epic2Autopilot(
      this.bus,
      this.flightPlanner,
      epic2ApConfig,
      new Epic2APStateManager(this.bus, epic2ApConfig),
      this.pfdUserSettingsManager,
      this.headingDataProvider,
      this.stallWarningDataProvider
    );

    this.apRadioNavInstrument = new APRadioNavInstrument(this.bus);
    this.backplane.addInstrument(InstrumentBackplaneNames.AutopilotRadioNav, this.apRadioNavInstrument);

    // Autopilot Update Loop
    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      this.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(() => {
        this.lnavComputer.update();
        this.autopilot.update();
      });
    });

    // TODO do we need to wait for gamestate?
    const numberOfEngines = SimVar.GetSimVarValue('NUMBER OF ENGINES', SimVarValueType.Number) as number;
    const engineType = SimVar.GetSimVarValue('ENGINE TYPE', SimVarValueType.Enum) as EngineType;

    let fadecFactory: Epic2UpperMfdAvionicsPlugin['getFadec'];

    this.pluginSystem.callPlugins((p) => {
      if (p.getFadec !== undefined) {
        if (fadecFactory === undefined) {
          fadecFactory = p.getFadec.bind(p);
        } else {
          console.warn('Multiple plugins attempted to provide FADECs!!');
        }
      }
    });

    if (fadecFactory === undefined) {
      fadecFactory = () => {
        if (engineType === EngineType.Jet) {
          return new Epic2JetFadec(this.bus, { numberOfEngines: numberOfEngines as AutothrottleThrottleIndex });
        } else if (engineType === EngineType.Turboprop) {
          return new Epic2TurbopropFadec(this.bus, { numberOfEngines: numberOfEngines as AutothrottleThrottleIndex });
        } else {
          throw new Error(`Invalid engine type: ${EngineType[engineType]} (${engineType})! Expected Jet or Turboprop.`);
        }
      };
    }

    this.fadec = fadecFactory();

    this.autothrottle = new Epic2Autothrottle(
      this.bus,
      this.fadec,
      this.config.autothrottle,
      this.airspeedDataProvider,
      this.airGroundDataProvider,
      this.altitudeDataProvider,
      this.autopilotDataProvider,
      this.flapWarningDataProvider,
      this.radioAltimeterDataProvider,
    );

    this.autothrottle.init();

    this.takeoffConfigPublisher = new TakeoffConfigPublisher(
      this.bus,
      this.flapWarningDataProvider,
      this.airGroundDataProvider,
      this.fadec,
    );

    this.backplane.addInstrument(InstrumentBackplaneNames.TakeoffConfigPublisher, this.takeoffConfigPublisher);
  }

  /** @inheritdoc */
  public Update(): void {
    super.Update();

    this.gpsSynchronizer?.update();

    this.flightAreaComputer.onUpdate();
    this.navdataComputer.update();

    // Planner update
    const now = Date.now();

    if (now - this.lastCalculate > 3000) {
      const planInMod = this.fms.planInMod.get();

      if (this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active)) {
        this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active).calculate();
      }

      if (planInMod && this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Pending)) {
        this.flightPlanner.getFlightPlan(Epic2FlightPlans.Pending).calculate();
      }

      SimVar.SetSimVarValue('K:HEADING_GYRO_SET', SimVarValueType.Number, 0);
      this.lastCalculate = now;
    }
  }

  /** @inheritdoc */
  public override onInteractionEvent(args: string[]): void {
    if (!this.softKeyController.mapHEventToSoftKeyEvent(args[0])) {
      this.hEventPublisher.dispatchHEvent(args[0]);
    }
  }
}
