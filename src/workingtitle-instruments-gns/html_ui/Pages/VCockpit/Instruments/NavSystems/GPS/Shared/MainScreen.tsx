import {
  AdcPublisher, APRadioNavInstrument, AutopilotInstrument, BitFlags, CdiControlEvents, CdiUtils, Clock, ClockEvents,
  CombinedSubject, ComponentProps, ComRadioIndex, ComSpacing, ConsumerSubject, ConsumerValue, ControlPublisher,
  DisplayComponent, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator,
  FlightPlanner, FSComponent, GameStateProvider, GNSSPublisher, GPSSatComputer, GPSSatComputerEvents, GpsSynchronizer,
  GPSSystemState, HEvent, InstrumentBackplane, IntersectionType, LNavComputer, LNavControlEvents, LNavObsManager,
  LNavObsSimVarPublisher, LNavSimVarPublisher, LNavUtils, NavRadioIndex, NearestContext, RadioType, SBASGroupName,
  SetSubject, SimVarValueType, TrafficInstrument, VNavDataEventPublisher, VNavSimVarPublisher, VNode, Wait
} from '@microsoft/msfs-sdk';

import {
  DefaultObsSuspDataProvider, FlightPlanSimSyncManager, FmaData, Fms, GarminAdsb, GarminAPUtils,
  GarminGlidepathComputer, GarminNavToNavComputer, GarminObsLNavModule, LNavDataSimVarPublisher, NavdataComputer, NavEventsPublisher,
  ObsSuspModes, TrafficAdvisorySystem
} from '@microsoft/msfs-garminsdk';

import { GNSAPConfig } from './Autopilot/GNSAPConfig';
import { GNSAPStateManager } from './Autopilot/GNSAPStateManager';
import { GNSAutopilot } from './Autopilot/GNSAutopilot';
import { CDINavSource } from './Instruments/CDINavSource';
import { ExternalSourceEvents } from './Instruments/ExternalSourceEvents';
import { GNSAdsbPublisher } from './Instruments/GNSAdsbPublisher';
import { GnsAhrsPublisher } from './Instruments/GnsAhrsPublisher';
import { PowerEvents, PowerState } from './Instruments/Power';
import { GnsCourseController } from './Navigation/GnsCourseController';
import { GNSExternalGuidancePublisher } from './Navigation/GNSExternalGuidancePublisher';
import { GnsFmsUtils } from './Navigation/GnsFmsUtils';
import { GnsObsEvents } from './Navigation/GnsObsEvents';
import { GnsVnavController } from './Navigation/Vnav/GnsVnavController';
import { GNSSettingsProvider } from './Settings/GNSSettingsProvider';
import { StartupScreen } from './StartupScreen';
import { FooterBar, NavInfoPane, PageContainer, RadioPane, StatusPane } from './UI';
import { InteractionEvent, InteractionEventMap } from './UI/InteractionEvent';
import { AlertMessageEvents, AlertsSubject } from './UI/Pages/Dialogs/AlertsSubject';
import { SelfTest } from './UI/Pages/SelfTest';
import { GNSType } from './UITypes';
import { NearestAirportFilter } from './Utils/NearestAirportFilter';

import './MainScreen.css';
import { GNSAPEvents } from './Autopilot/GNSAPEvents';
import { GNSNavToNavGuidancePublisher } from './Autopilot/GNSNavToNavGuidancePublisher';
import { GNSAPCdiSourceManager } from './Autopilot/GNSAPCdiSourceManager';
import { GnsNavToNavManager } from './Navigation/GnsNavToNavManager';

/**
 * Main Screen Options
 */
export interface MainScreenOptions {
  /** The instrument index. */
  instrumentIndex: number;

  /** The templateId for the instrument. */
  templateId: string;

  /** The event prefix. */
  eventPrefix: string;

  /** The NAV radio index to use. */
  navIndex: NavRadioIndex;

  /** The COM radio index to use. */
  comIndex: ComRadioIndex;

  /** Whether the instrument is configured to use split CDIs */
  isUsingNewCdiBehaviour: boolean;

  /** Whether autopilot should be disabled */
  disableAutopilot: boolean,

  /** Whether autopilot nav arming should be disabled */
  disableApNavArm: boolean,

  /** Whether the autopilot supports an independent flight director */
  apSupportsFlightDirector: boolean,

  /** Whether autopilot backcourse guidance should be disabled */
  disableApBackCourse: boolean;

  /** Maximum AP bank angle */
  maxApBankAngle?: number;

  /** LNAV index, if not provided it defaults to 0 */
  lnavIndex?: number;

  /** VNAV index, if not provided it defaults to 0 */
  vnavIndex?: number;

  /** Flight planner ID, if not provided it defaults to an empty string */
  flightPlannerId: string;

  /**
   * Whether the GNS instrument hosts a primary FMS instance. If not defined, then the instrument hosts a primary FMS
   * instance if and only if its assigned NAV radio index is 1.
   */
  isFmsPrimary?: boolean;

  /**
   * The G3X external source index assigned to the GNS, either 1 or 2. If not defined, then the GNS will not attempt to
   * communicate with the G3X.
   */
  g3xExternalSourceIndex?: 1 | 2;
}


/**
 * Props on the MainScreen component.
 */
interface MainScreenProps extends ComponentProps {
  /** An instance of the EventBus. */
  bus: EventBus;

  /** An instance of the InstrumentBackplane. */
  backplane: InstrumentBackplane;

  /** The options for this instrument */
  options: MainScreenOptions;

  /** The class to apply to this main screen. */
  class: GNSType;

  /**
   * Panel XML config document
   */
  xmlConfig: Document,
}

/**
 * A component that displays the main screen of the GNS530.
 */
export class MainScreen extends DisplayComponent<MainScreenProps> {

  //begin publishers and backplane instruments
  public gnssPublisher: GNSSPublisher;
  public adcPublisher: AdcPublisher;
  public ahrsPublisher: GnsAhrsPublisher;
  public clock: Clock;
  public apRadioNavInstrument!: APRadioNavInstrument;
  public autopilotInstrument!: AutopilotInstrument;
  public trafficInstrument: TrafficInstrument;
  public adsb: GarminAdsb;
  public adsbPublisher: GNSAdsbPublisher;
  public navEventsPublisher: NavEventsPublisher;
  public lNavPublisher!: LNavSimVarPublisher;
  public lNavObsPublisher!: LNavObsSimVarPublisher;
  public vNavPublisher!: VNavSimVarPublisher;
  public lNavDataPublisher!: LNavDataSimVarPublisher;
  public vNavDataPublisher!: VNavDataEventPublisher;
  public gpsSynchronizer!: GpsSynchronizer;
  public enabledSbasGroups: SetSubject<SBASGroupName>;
  public gpsSatComputer: GPSSatComputer;
  public trafficSystem: TrafficAdvisorySystem;
  public controlPublisher: ControlPublisher;

  //begin flight planning classes
  private readonly isFmsPrimary = this.props.options.isFmsPrimary ?? this.isPrimaryInstrument;

  private readonly lnavIndex = (this.props.options.lnavIndex !== undefined && LNavUtils.isValidLNavIndex(this.props.options.lnavIndex))
    ? this.props.options.lnavIndex : 0;

  private readonly vnavIndex = (this.props.options.vnavIndex !== undefined && LNavUtils.isValidLNavIndex(this.props.options.vnavIndex))
    ? this.props.options.vnavIndex : 0;

  private readonly cdiId = `gns${this.props.options.navIndex}`;

  private readonly lnavComputer?: LNavComputer;
  private readonly navdataComputer?: NavdataComputer;

  private readonly glidepathComputer?: GarminGlidepathComputer;

  private readonly navToNavComputer?: GarminNavToNavComputer;
  private readonly navToNavManager?: GnsNavToNavManager;

  private readonly fmaData = ConsumerValue.create<Readonly<FmaData> | undefined>(null, undefined);

  private readonly externalGuidancePublisher?: GNSExternalGuidancePublisher;

  public planner: FlightPlanner;
  public facLoader: FacilityLoader;
  public calculator: FlightPathCalculator;
  public fms: Fms;

  private primaryFlightPlanInitPromiseResolve!: () => void;
  private readonly primaryFlightPlanInitPromise = new Promise<void>(resolve => { this.primaryFlightPlanInitPromiseResolve = resolve; });

  private flightPlanSimSyncManager?: FlightPlanSimSyncManager;

  private readonly settingsProvider = new GNSSettingsProvider(this.props.bus);

  private readonly obsManager?: LNavObsManager;

  private readonly obsSuspDataProvider: DefaultObsSuspDataProvider;
  private readonly cdiNavSource = new CDINavSource(
    this.props.class,
    this.props.options.instrumentIndex,
    this.props.options.navIndex,
    this.props.bus
  );

  private apCdiSourceManager?: GNSAPCdiSourceManager;
  public autopilot?: GNSAutopilot;

  private vnavController: GnsVnavController | undefined;

  private readonly comPane = FSComponent.createRef<RadioPane>();
  private readonly vLocPane = FSComponent.createRef<RadioPane>();
  private readonly footerBar = FSComponent.createRef<FooterBar>();
  private readonly pageContainer = FSComponent.createRef<PageContainer>();
  private readonly startupScreen = FSComponent.createRef<StartupScreen>();
  private readonly selfTest = FSComponent.createRef<SelfTest>();

  private isComSelected = true;
  private gamePlanSynced = false;
  private currentPowerState = PowerState.Off;

  private alertsSubject: AlertsSubject;
  private gnsCourseController: GnsCourseController;

  /**
   * Obtains whether this instrument is the primary instrument
   *
   * @returns a boolean
   */
  private get isPrimaryInstrument(): boolean {
    return this.props.options.navIndex === 1;
  }

  /**
   * Creates an instance of a DisplayComponent.
   * @param props The propertis of the component.
   */
  constructor(props: MainScreenProps) {
    super(props);

    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    this.alertsSubject = new AlertsSubject(this.props.bus);
    this.gnsCourseController = new GnsCourseController(this.props.bus, this.lnavIndex, this.props.options.navIndex);

    this.gnssPublisher = new GNSSPublisher(this.props.bus);

    this.enabledSbasGroups = SetSubject.create(Object.values(SBASGroupName));
    this.gpsSatComputer = new GPSSatComputer(
      1,
      this.props.bus,
      'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/gps_ephemeris.json',
      'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/gps_sbas.json',
      5000,
      this.enabledSbasGroups,
      'none',
      {
        channelCount: 15,
        satInUseMaxCount: 15,
        satInUsePdopTarget: 2,
        satInUseOptimumCount: 5
      }
    );
    this.adcPublisher = new AdcPublisher(this.props.bus);
    this.ahrsPublisher = new GnsAhrsPublisher(this.props.bus);

    this.navEventsPublisher = new NavEventsPublisher(this.props.bus);
    this.lNavPublisher = new LNavSimVarPublisher(this.props.bus);
    this.lNavObsPublisher = new LNavObsSimVarPublisher(this.props.bus);
    this.vNavPublisher = new VNavSimVarPublisher(this.props.bus);
    this.lNavDataPublisher = new LNavDataSimVarPublisher(this.props.bus);
    this.vNavDataPublisher = new VNavDataEventPublisher(this.props.bus);
    this.clock = new Clock(this.props.bus);
    this.controlPublisher = new ControlPublisher(this.props.bus);
    this.trafficInstrument = new TrafficInstrument(this.props.bus, {
      simTimeUpdateFreq: 2,
      realTimeUpdateFreq: 1,
      contactDeprecateTime: 10
    });

    this.adsb = new GarminAdsb(this.props.bus);
    this.adsbPublisher = new GNSAdsbPublisher(this.props.bus);
    this.trafficSystem = new TrafficAdvisorySystem(this.props.bus, this.trafficInstrument, this.adsb, false);
    this.controlPublisher.startPublish();

    // Flight Planning Items
    this.facLoader = new FacilityLoader(FacilityRepository.getRepository(this.props.bus), () => {
      NearestContext.initialize(this.facLoader, this.props.bus);

      const intersections = NearestContext.getInstance().intersections;
      intersections.awaitStart().then(() => {
        intersections.setFilter(BitFlags.union(
          BitFlags.createFlag(IntersectionType.None),
          BitFlags.createFlag(IntersectionType.Named),
          BitFlags.createFlag(IntersectionType.Unnamed),
          BitFlags.createFlag(IntersectionType.Offroute),
          BitFlags.createFlag(IntersectionType.IAF),
          BitFlags.createFlag(IntersectionType.FAF),
          BitFlags.createFlag(IntersectionType.RNAV)
        ), true);
      });

      setInterval(() => NearestContext.getInstance().update(), 2000);
    });

    this.calculator = new FlightPathCalculator(this.facLoader, {
      id: this.props.options.flightPlannerId,
      initSyncRole: this.props.options.g3xExternalSourceIndex === undefined ? 'none' : 'primary',
      defaultClimbRate: 1000,
      defaultSpeed: 120,
      bankAngle: 20,
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: null,
      maxBankAngle: this.props.options.maxApBankAngle ?? 20,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.GroundSpeed
    }, this.props.bus);

    this.planner = FlightPlanner.getPlanner(this.props.options.flightPlannerId, this.props.bus, { calculator: this.calculator });

    this.fms = new Fms(
      this.isFmsPrimary,
      this.props.bus,
      this.planner,
      undefined,
      {
        procedureLegMapper: GnsFmsUtils.gnsProcedureLegValid,
        lnavIndex: this.lnavIndex,
        navRadioIndexes: [this.props.options.navIndex],
        cdiId: this.cdiId,
        disableApproachAvailablePublish: true
      }
    );

    const approachActiveTopic = `gns_ap_approach_active_${this.props.options.navIndex}` as const;
    this.fms.onEvent('fms_flight_phase').handle(flightPhase => {
      this.props.bus.getPublisher<GNSAPEvents>().pub(approachActiveTopic, flightPhase.isApproachActive, true, true);
    });

    if (this.isFmsPrimary) {
      this.lnavComputer = new LNavComputer(
        this.lnavIndex,
        this.props.bus,
        this.planner,
        new GarminObsLNavModule(this.lnavIndex, this.props.bus, this.planner, {
          maxBankAngle: this.props.options.maxApBankAngle ?? 20,
          intercept: GarminAPUtils.lnavIntercept,
        }),
        {
          maxBankAngle: this.props.options.maxApBankAngle ?? 20,
          intercept: GarminAPUtils.lnavIntercept,
          // TODO: hook up FMS position system selection.
          // isPositionDataValid: () => this.fmsPositionSelector.selectedFmsPosMode.get() !== FmsPositionMode.None,
          hasVectorAnticipation: true
        }
      );

      this.navdataComputer = new NavdataComputer(this.props.bus, this.planner, this.facLoader, { lnavIndex: this.lnavIndex, vnavIndex: this.vnavIndex });

      this.glidepathComputer = new GarminGlidepathComputer(
        this.vnavIndex,
        this.props.bus,
        this.planner,
        {
          lnavIndex: this.lnavIndex,
          allowApproachBaroVNav: false,
          allowPlusVWithoutSbas: false,
          gpsSystemState: ConsumerSubject.create(this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1'), GPSSystemState.Searching)
        }
      );

      this.externalGuidancePublisher = new GNSExternalGuidancePublisher(this.lnavIndex);

      // TODO: Add support for configurable OBS index and sim state use.
      this.obsManager = new LNavObsManager(this.props.bus, this.lnavIndex, true);
      this.obsManager.init();
    }

    this.navToNavComputer = new GarminNavToNavComputer(this.props.bus, this.fms, {
      cdiId: this.cdiId,
      navRadioIndexes: [this.props.options.navIndex],
      inhibitMultipleSwitches: true
    });
    this.navToNavManager = new GnsNavToNavManager(this.cdiId, this.props.bus, this.navToNavComputer);

    if (!this.props.options.disableAutopilot) {
      new GNSNavToNavGuidancePublisher(this.props.bus, this.navToNavComputer, this.navToNavManager, {
        armableNavRadioIndex: `gns_ap_nav_to_nav_armable_nav_radio_index_${this.props.options.navIndex}`,
        armableLateralMode: `gns_ap_nav_to_nav_armable_lateral_mode_${this.props.options.navIndex}`,
        armableVerticalMode: `gns_ap_nav_to_nav_armable_vertical_mode_${this.props.options.navIndex}`,
        isExternalCdiSwitchInProgress: `gns_ap_nav_to_nav_external_switch_in_progress_${this.props.options.navIndex}`
      });

      this.props.bus.pub(`gns_ap_nav_to_nav_can_switch_${this.props.options.navIndex}`, false, true, true);
    }
    if (this.props.options.g3xExternalSourceIndex !== undefined) {
      new GNSNavToNavGuidancePublisher(this.props.bus, this.navToNavComputer, this.navToNavManager, {
        armableNavRadioIndex: `g3x_external_nav_to_nav_armable_nav_radio_index_${this.props.options.g3xExternalSourceIndex}`,
        armableLateralMode: `g3x_external_nav_to_nav_armable_lateral_mode_${this.props.options.g3xExternalSourceIndex}`,
        armableVerticalMode: `g3x_external_nav_to_nav_armable_vertical_mode_${this.props.options.g3xExternalSourceIndex}`,
        isExternalCdiSwitchInProgress: `g3x_external_nav_to_nav_external_switch_in_progress_${this.props.options.g3xExternalSourceIndex}`
      });

      this.props.bus.pub(`g3x_external_nav_to_nav_can_switch_${this.props.options.g3xExternalSourceIndex}`, false, true, true);
    }

    this.obsSuspDataProvider = new DefaultObsSuspDataProvider(this.props.bus, {
      lnavIndex: this.lnavIndex
    });
    this.obsSuspDataProvider.init();

    // Publish OBS mode on bus
    this.obsSuspDataProvider.mode.sub((mode) => {
      this.props.bus.getPublisher<GnsObsEvents>().pub('obs_susp_mode', mode);
    });

    SimVar.SetSimVarValue(`L:${this.props.options.templateId}_SelectedSource`, 'number', 1);

    // Backplane items
    this.props.backplane.addPublisher('adc', this.adcPublisher);
    this.props.backplane.addPublisher('ahrs', this.ahrsPublisher);
    this.props.backplane.addPublisher('gnss', this.gnssPublisher);
    this.props.backplane.addPublisher('navEvents', this.navEventsPublisher);
    this.props.backplane.addPublisher('lnav', this.lNavPublisher);
    this.props.backplane.addPublisher('lnavobs', this.lNavObsPublisher);
    this.props.backplane.addPublisher('vnav', this.vNavPublisher);
    this.props.backplane.addPublisher('lnavdata', this.lNavDataPublisher);
    this.props.backplane.addPublisher('vnavdata', this.vNavDataPublisher);
    this.props.backplane.addPublisher('adsb', this.adsbPublisher);
    this.props.backplane.addInstrument('traffic', this.trafficInstrument);

    this.init();
  }

  /**
   * Sets up sync of settings to SimVars
   */
  private syncSettingsToSimVars(): void {
    this.settingsProvider.generalSettings.getSetting('com_frequency_spacing').sub((value) => {
      const comSpacingLVarValue = SimVar.GetSimVarValue(`A:COM SPACING MODE:${this.props.options.comIndex}`, 'Enum');

      if (value === ComSpacing.Spacing833Khz) {
        if (comSpacingLVarValue === 0) {
          SimVar.SetSimVarValue(`K:COM_${this.props.options.comIndex}_SPACING_MODE_SWITCH`, 'Boolean', true);
        }
      } else {
        if (comSpacingLVarValue === 1) {
          SimVar.SetSimVarValue(`K:COM_${this.props.options.comIndex}_SPACING_MODE_SWITCH`, 'Boolean', true);
        }
      }
    }, true);
  }

  /**
   * Initializes SBAS group settings sync to the GPS satellite computer system.
   */
  private initSbasSettingsSync(): void {
    const gpsSettings = this.settingsProvider.gps;

    gpsSettings.getSetting('sbas_waas_enabled').sub(enabled => enabled ? this.enabledSbasGroups.add(SBASGroupName.WAAS) : this.enabledSbasGroups.delete(SBASGroupName.WAAS));
    gpsSettings.getSetting('sbas_egnos_enabled').sub(enabled => enabled ? this.enabledSbasGroups.add(SBASGroupName.EGNOS) : this.enabledSbasGroups.delete(SBASGroupName.EGNOS));
    gpsSettings.getSetting('sbas_gagan_enabled').sub(enabled => enabled ? this.enabledSbasGroups.add(SBASGroupName.GAGAN) : this.enabledSbasGroups.delete(SBASGroupName.GAGAN));
    gpsSettings.getSetting('sbas_msas_enabled').sub(enabled => enabled ? this.enabledSbasGroups.add(SBASGroupName.MSAS) : this.enabledSbasGroups.delete(SBASGroupName.MSAS));
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.comPane.instance.setActive(true);
    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(this.onInteractionEvent.bind(this) as any);

    this.pageContainer.instance.init();
    this.props.bus.getSubscriber<PowerEvents>().on('instrument_powered').handle(this.onPowerStateChanged.bind(this));
  }

  /**
   * Handles when the GNS power state is changed.
   * @param state The new power state.
   */
  private onPowerStateChanged(state: PowerState): void {
    this.currentPowerState = state;
    if (state === PowerState.OnSkipInit) {
      this.gpsSatComputer.acquireAndUseSatellites();
      this.pageContainer.instance.openPageGroup('NAV', true, 1);
      this.setExternalSourceState(true);
    }

    if (state === PowerState.On) {
      this.pageContainer.instance.openPageGroup('NAV', true, 4);
      this.setExternalSourceState(true);
    }

    if (state === PowerState.Off) {
      this.gpsSatComputer.reset();
      this.setExternalSourceState(false);
    }
  }

  /**
   * Sets whether the GNS is available as an external source state
   * @param powered Whether the GNS is now powered
   */
  private setExternalSourceState(powered: boolean): void {
    if (this.props.options.g3xExternalSourceIndex !== undefined) {
      this.props.bus.getPublisher<ExternalSourceEvents>().pub(`g3x_fpl_source_external_available_${this.props.options.g3xExternalSourceIndex}`, powered, true, true);
      SimVar.SetSimVarValue(`L:WT_G3X_Fpl_Source_External_Available:${this.props.options.g3xExternalSourceIndex}`, SimVarValueType.Bool, powered);
    }
  }

  /**
   * Initialization Method.
   */
  private init(): void {
    this.trafficSystem.init();
    this.clock.init();
    this.initSbasSettingsSync();

    if (this.isPrimaryInstrument) {
      this.apRadioNavInstrument = new APRadioNavInstrument(this.props.bus, 'gnsAP');
      this.autopilotInstrument = new AutopilotInstrument(this.props.bus);
      this.gpsSynchronizer = new GpsSynchronizer(this.props.bus, this.fms.flightPlanner, this.fms.facLoader, {
        lnavIndex: this.lnavIndex,
        vnavIndex: this.vnavIndex
      });

      this.props.backplane.addInstrument('ap', this.autopilotInstrument);
      this.props.backplane.addInstrument('apradionav', this.apRadioNavInstrument);
    }

    this.props.backplane.init();

    this.initFlightPlanAndAp().then();

    // Configure NearestContext based on settings
    NearestContext.onInitialized(() => {
      const surfaceTypeSetting = this.settingsProvider.generalSettings.getSetting('nearest_airport_criteria_surface_type');
      const minLengthSetting = this.settingsProvider.generalSettings.getSetting('nearest_airport_criteria_min_length');

      CombinedSubject.create(surfaceTypeSetting, minLengthSetting).sub(([surfaceType, minLength]) => {
        if (surfaceType !== undefined) {
          NearestAirportFilter.setSurfaceTypeFilter(surfaceType);
        }
        if (minLength !== undefined) {
          NearestAirportFilter.setMinimumRunwayLength(minLength);
        }
      });

      NearestContext.getInstance().intersections.setFilterDupTerminal(true);

      // Sync settings to SimVars
      this.syncSettingsToSimVars();
    });

    this.gpsSatComputer.init();
  }

  /**
   * Initializes the primary flight plan
   */
  private async initFlightPlanAndAp(): Promise<void> {
    // Request a sync from the FMC in case of an instrument reload
    this.planner.requestSync();

    await Wait.awaitDelay(500);

    // Initialize the primary plan in case one was not synced
    if (!this.planner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
      await this.fms.initPrimaryFlightPlan();
    } else if (this.isPrimaryInstrument) {
      const plan = this.fms.getPrimaryFlightPlan();
      const numSegments = plan.segmentCount;

      if (numSegments === 0) {
        await this.fms.initPrimaryFlightPlan(true);
      }
    }

    this.primaryFlightPlanInitPromiseResolve();

    // Setup AP
    if (this.isFmsPrimary && this.isPrimaryInstrument && !this.props.options.disableAutopilot) {
      this.apCdiSourceManager = new GNSAPCdiSourceManager(this.props.bus);

      const apConfig = new GNSAPConfig(
        this.props.bus,
        this.lnavComputer!.steerCommand,
        this.glidepathComputer!.glidepathGuidance,
        this.apCdiSourceManager.navToNavGuidance,
        this.props.options.disableApNavArm,
        this.props.options.disableApBackCourse,
        this.props.options.apSupportsFlightDirector,
        this.props.options.maxApBankAngle,
      );

      this.autopilot = new GNSAutopilot(
        this.props.bus,
        this.planner,
        apConfig,
        new GNSAPStateManager(this.props.bus, apConfig, this.apCdiSourceManager, this.props.options.apSupportsFlightDirector),
      );

      setTimeout(() => {
        this.autopilot?.stateManager.initialize();
      }, 500);
    }

    if (this.isFmsPrimary) {
      Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
        this.props.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(this.updateNavigation.bind(this));
      });
    }

    this.vnavController = new GnsVnavController(this.props.bus, this.fms);
  }

  /**
   * Method to run on flight start.
   */
  public onFlightStart(): void {
    if (this.props.options.navIndex === 1 && this.autopilot) {
      this.autopilot.stateManager.initialize();
    }

    if (this.isPrimaryInstrument) {
      if (this.gamePlanSynced) {
        this.fms.activateNearestLeg();
        return;
      }

      this.initFlightPlanSimSync();
    }
  }

  /**
   * Initializes flight plan sync to and from the sim. This method should only be called once the flight has finished
   * loading (i.e. when the game state is either briefing or ingame).
   */
  private async initFlightPlanSimSync(): Promise<void> {
    [this.flightPlanSimSyncManager] = await Promise.all([
      FlightPlanSimSyncManager.getManager(this.props.bus, this.fms),
      this.primaryFlightPlanInitPromise,
      Wait.awaitDelay(5000) // Ensure we wait at least 5 seconds because trying to load the sim flight plan too early sometimes ends up with missing waypoints.
    ]);

    try {
      await this.flightPlanSimSyncManager.loadFromSim(true);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        console.error(e.stack);
      }
    }

    this.flightPlanSimSyncManager.startAutoSync();
    this.gamePlanSynced = true;
  }

  private lastCalculate = 0;

  /**
   * Update loop for the main screen.
   */
  public update(): void {

    const isPrimaryInstrument = this.props.options.navIndex === 1;

    this.clock.onUpdate();
    this.props.backplane.onUpdate();

    if (isPrimaryInstrument) {
      // Planner update
      const now = Date.now();

      if (now - this.lastCalculate > 3000) {
        this.planner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX) && this.planner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX).calculate();

        // SimVar.SetSimVarValue('K:HEADING_GYRO_SET', SimVarValueType.Number, 0);
        this.lastCalculate = now;
      }

      this.gpsSynchronizer.update();
    }

    this.vnavController?.update();

    if (this.currentPowerState === PowerState.On || this.currentPowerState === PowerState.OnSkipInit) {
      this.gpsSatComputer.onUpdate();
    }
  }

  /**
   * Updates FMS lateral/vertical guidance and the autopilot.
   */
  private updateNavigation(): void {
    this.lnavComputer!.update();

    if (this.autopilot) {
      this.glidepathComputer!.update();

      this.autopilot.update();
    } else {
      this.glidepathComputer!.update();

      this.externalGuidancePublisher!.update(this.lnavComputer!.steerCommand, this.glidepathComputer!.glidepathGuidance);
    }
  }

  /**
   * Handles when an interaction event is received by the main screen.
   * @param evt The event that was received.
   */
  private onInteractionEvent(evt: string): void {
    const interactionEvent = InteractionEventMap.get(evt);
    if (interactionEvent !== undefined) {
      switch (interactionEvent) {
        case InteractionEvent.LeftKnobPush:
          this.isComSelected = !this.isComSelected;
          if (this.isComSelected) {
            this.comPane.instance.setActive(true);
            this.vLocPane.instance.setActive(false);
            SimVar.SetSimVarValue(`L:${this.props.options.templateId}_SelectedSource`, 'number', 1);
          } else {
            this.comPane.instance.setActive(false);
            this.vLocPane.instance.setActive(true);
            SimVar.SetSimVarValue(`L:${this.props.options.templateId}_SelectedSource`, 'number', 2);
          }
          break;
        case InteractionEvent.LeftInnerInc:
          this.changeRadio('FRACT', 'INC');
          break;
        case InteractionEvent.LeftInnerDec:
          this.changeRadio('FRACT', 'DEC');
          break;
        case InteractionEvent.LeftOuterInc:
          this.changeRadio('WHOLE', 'INC');
          break;
        case InteractionEvent.LeftOuterDec:
          this.changeRadio('WHOLE', 'DEC');
          break;
        case InteractionEvent.NavSwap:
          SimVar.SetSimVarValue(`K:NAV${this.props.options.navIndex}_RADIO_SWAP`, 'number', 0);
          break;
        case InteractionEvent.ComSwap:
          SimVar.SetSimVarValue(`K:COM${this.props.options.navIndex}_RADIO_SWAP`, 'number', 0);
          break;
        case InteractionEvent.CDI:
          this.props.bus.getPublisher<CdiControlEvents>().pub(`cdi_src_gps_toggle${CdiUtils.getEventBusTopicSuffix(this.cdiId)}`, undefined, true, false);
          break;
        case InteractionEvent.OBS: {
          this.obsPressed();
          break;
        }
        default:
          if (!this.startupScreen.instance.isBooted()) {
            this.startupScreen.instance.onInteractionEvent(interactionEvent);
          } else if (this.selfTest.instance.isActive) {
            this.selfTest.instance.onInteractionEvent(interactionEvent);
          } else {
            this.pageContainer.instance.onInteractionEvent(interactionEvent);
          }
          break;
      }
    }
  }

  /**
   * Changes the nav/com radio in the system.
   * @param step The step to use to change the radio.
   * @param direction The direction to move the radio.
   */
  private changeRadio(step: 'FRACT' | 'WHOLE', direction: 'INC' | 'DEC'): void {
    if (this.isComSelected) {
      SimVar.SetSimVarValue(`K:COM${this.props.options.comIndex === 1 ? '' : this.props.options.comIndex}_RADIO_${step}_${direction}`, 'number', 0);
    } else {
      SimVar.SetSimVarValue(`K:NAV${this.props.options.navIndex}_RADIO_${step}_${direction}`, 'number', 0);
    }
  }

  /**
   * Handles when the OBS button is pressed.
   */
  private obsPressed(): void {
    const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.lnavIndex);

    const obsMode = this.obsSuspDataProvider.mode.get();
    switch (obsMode) {
      case ObsSuspModes.SUSP:
        this.props.bus.getPublisher<LNavControlEvents>().pub(`suspend_sequencing${lnavTopicSuffix}`, false, true, true);
        break;
      case ObsSuspModes.OBS:
        SimVar.SetSimVarValue('K:GPS_OBS_OFF', 'number', 0);
        this.props.bus.getPublisher<LNavControlEvents>().pub(`suspend_sequencing${lnavTopicSuffix}`, false, true, true);
        break;
      default:
        if (this.obsSuspDataProvider.isObsAvailable.get()) {
          SimVar.SetSimVarValue('K:GPS_OBS_ON', 'number', 0);
        } else {
          this.props.bus.getPublisher<AlertMessageEvents>().pub('alerts_push', {
            key: 'obs-not-available',
            message: 'OBS not available',
          });
        }
    }
  }

  /**
   * Handles when the page is changed.
   * @param index The new page index.
   */
  private onPageChanged(index: number): void {
    this.footerBar.instance.onPageChanged(index);
  }

  /**
   * Handles when the page group is changed.
   * @param label The new page group label.
   * @param pages The new page group total number of pages.
   */
  private onPageGroupChanged(label: string, pages: number): void {
    this.footerBar.instance.onPageGroupChanged(label, pages);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <StartupScreen bus={this.props.bus} gnsType={this.props.class} onConfirmed={() => { }} ref={this.startupScreen} />
        <SelfTest bus={this.props.bus} gnsType={this.props.class} settingsProvider={this.settingsProvider} navRadioIndex={this.props.options.navIndex} ref={this.selfTest} />
        <div class={`${this.props.class} mainscreen-left`}>
          <RadioPane bus={this.props.bus} type={RadioType.Com} index={this.props.options.comIndex} ref={this.comPane} />
          <RadioPane bus={this.props.bus} type={RadioType.Nav} index={this.props.options.navIndex} ref={this.vLocPane} />
          {this.props.class === 'wt530' ? <NavInfoPane bus={this.props.bus} radioIndex={this.props.options.navIndex} /> : null}
          <StatusPane bus={this.props.bus} lnavIndex={this.lnavIndex} />
        </div>
        <div class={`${this.props.class} mainscreen-right`}>
          <PageContainer
            onPageChanged={this.onPageChanged.bind(this)}
            onPageGroupChanged={this.onPageGroupChanged.bind(this)}
            bus={this.props.bus}
            ref={this.pageContainer}
            gnsType={this.props.class}
            fms={this.fms}
            settingsProvider={this.settingsProvider}
            xmlConfig={this.props.xmlConfig}
            gpsSat={this.gpsSatComputer}
            trafficSystem={this.trafficSystem}
            alerts={this.alertsSubject}
            options={this.props.options}
          />
        </div>
        <div class={`${this.props.class} mainscreen-footer`}>
          <FooterBar
            ref={this.footerBar}
            bus={this.props.bus}
            gnsType={this.props.class}
            isPrimaryInstrument={this.isPrimaryInstrument}
            gnsCdiMode={this.cdiNavSource.gnsCdiMode}
            alerts={this.alertsSubject}
            flightPlanner={this.fms.flightPlanner}
          />
        </div>
      </>
    );
  }
}
