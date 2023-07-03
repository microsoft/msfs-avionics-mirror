import {
  AdcPublisher, APRadioNavInstrument, AutopilotInstrument, Clock, CombinedSubject, ComponentProps, ComRadioIndex,
  ComSpacing, ConsumerSubject, ControlPublisher, DisplayComponent, EventBus, FacilityLoader, FacilityRepository, FlightPathCalculator, FlightPlanner,
  FSComponent, VNavControlEvents, GNSSPublisher, GPSSatComputer, GpsSynchronizer, HEvent, InstrumentBackplane, LNavEvents,
  LNavSimVarPublisher, MappedSubject, NavEvents, NavRadioIndex, NearestContext, RadioType, SBASGroupName, SetSubject,
  TrafficInstrument, VNavDataEventPublisher, VNavSimVarPublisher, VNode, Wait, SimVarValueType, Subject, ControlEvents, NavSourceType,
  FlightPathAirplaneSpeedMode, BitFlags, IntersectionType
} from '@microsoft/msfs-sdk';

import {
  FlightPlanSimSyncManager, Fms, GarminAdsb, GarminControlEvents, LNavDataSimVarPublisher, NavdataComputer, NavEventsPublisher,
  ObsSuspModes, TrafficAdvisorySystem
} from '@microsoft/msfs-garminsdk';

import { GNSAPConfig } from './Autopilot/GNSAPConfig';
import { GNSAutopilot } from './Autopilot/GNSAutopilot';
import { GnsVnavController } from './Navigation/Vnav/GnsVnavController';
import { CDINavSource, GnsCdiMode } from './Instruments/CDINavSource';
import { GNSAdsbPublisher } from './Instruments/GNSAdsbPublisher';
import { PowerEvents, PowerState } from './Instruments/Power';
import { GnsObsEvents } from './Navigation/GnsObsEvents';
import { GNSSettingsProvider } from './Settings/GNSSettingsProvider';
import { StartupScreen } from './StartupScreen';
import { FooterBar, NavInfoPane, PageContainer, RadioPane, StatusPane } from './UI';
import { InteractionEvent, InteractionEventMap } from './UI/InteractionEvent';
import { AlertMessageEvents, AlertsSubject } from './UI/Pages/Dialogs/AlertsSubject';
import { SelfTest } from './UI/Pages/SelfTest';
import { GNSType } from './UITypes';
import { NearestAirportFilter } from './Utils/NearestAirportFilter';
import { GnsFmsUtils } from './Navigation/GnsFmsUtils';
import { GnsCourseController } from './Navigation/GnsCourseController';
import { GnsAhrsPublisher } from './Instruments/GnsAhrsPublisher';
import { GNSAPStateManager } from './Autopilot/GNSAPStateManager';
import { GNSEvents } from './GNSEvents';

import './MainScreen.css';

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

  /** Whether autopilot nav arming should be disabled */
  disableApNavArm: boolean,

  /** Whether the autopilot supports an independent flight director */
  apSupportsFlightDirector: boolean,

  /** Whether autopilot backcourse guidance should be disabled */
  disableApBackCourse: boolean
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
  public vNavPublisher!: VNavSimVarPublisher;
  public lNavDataPublisher!: LNavDataSimVarPublisher;
  public vNavDataPublisher!: VNavDataEventPublisher;
  public gpsSynchronizer!: GpsSynchronizer;
  public enabledSbasGroups: SetSubject<SBASGroupName>;
  public gpsSatComputer: GPSSatComputer;
  public trafficSystem: TrafficAdvisorySystem;
  public controlPublisher: ControlPublisher;

  //begin flight planning classes
  public planner: FlightPlanner;
  public facLoader: FacilityLoader;
  public calculator: FlightPathCalculator;
  public fms: Fms;
  public navdataComputer: NavdataComputer;

  private primaryFlightPlanInitPromiseResolve!: () => void;
  private readonly primaryFlightPlanInitPromise = new Promise<void>(resolve => { this.primaryFlightPlanInitPromiseResolve = resolve; });

  private flightPlanSimSyncManager?: FlightPlanSimSyncManager;

  private readonly settingsProvider = new GNSSettingsProvider(this.props.bus);
  private cdiNavSource!: CDINavSource;

  private readonly isLNavSuspended: ConsumerSubject<boolean>;
  private readonly isObsActive: ConsumerSubject<boolean>;
  private readonly isObsAvailable: ConsumerSubject<boolean>;
  private readonly obsMode: MappedSubject<[boolean, boolean], ObsSuspModes>;
  private readonly gnsCdiMode = Subject.create<GnsCdiMode>(GnsCdiMode.GPS);

  public autopilot!: GNSAutopilot;

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
    this.gnsCourseController = new GnsCourseController(this.props.bus, this.props.options.navIndex);

    this.gnssPublisher = new GNSSPublisher(this.props.bus);

    this.enabledSbasGroups = SetSubject.create(Object.values(SBASGroupName));
    this.gpsSatComputer = new GPSSatComputer(
      1,
      this.props.bus,
      'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/gps_ephemeris.json',
      'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/gps_sbas.json',
      5000,
      this.enabledSbasGroups
    );
    this.adcPublisher = new AdcPublisher(this.props.bus);
    this.ahrsPublisher = new GnsAhrsPublisher(this.props.bus);

    this.navEventsPublisher = new NavEventsPublisher(this.props.bus);
    this.lNavPublisher = new LNavSimVarPublisher(this.props.bus);
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
      defaultClimbRate: 1000,
      defaultSpeed: 120,
      bankAngle: 20,
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: null,
      maxBankAngle: 20,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.GroundSpeed
    }, this.props.bus);
    this.planner = FlightPlanner.getPlanner(this.props.bus, this.calculator);
    this.fms = new Fms(this.isPrimaryInstrument, this.props.bus, this.planner, undefined, undefined, GnsFmsUtils.gnsProcedureLegValid);
    this.navdataComputer = new NavdataComputer(this.props.bus, this.planner, this.facLoader);

    // Setup nav and control event consumers
    const sub = this.props.bus.getSubscriber<NavEvents & LNavEvents & ControlEvents & GarminControlEvents>();

    sub.on('cdi_src_gps_toggle').handle(this.handleCDISourceToggle.bind(this));

    sub.on('cdi_src_set').handle(v => {
      if (v.type === NavSourceType.Nav) {
        this.gnsCdiMode.set(GnsCdiMode.VLOC);
      }
    });

    this.gnsCdiMode.sub(v => {
      this.props.bus.getPublisher<GNSEvents>().pub('gns_cdi_mode', { navIndex: this.props.options.navIndex, gnsCdiMode: v }, true, true);
    }, true);

    this.isLNavSuspended = ConsumerSubject.create(sub.on('lnav_is_suspended'), false);
    this.isObsActive = ConsumerSubject.create(sub.on('gps_obs_active'), false);
    this.isObsAvailable = ConsumerSubject.create(sub.on('obs_available'), false);

    this.obsMode = MappedSubject.create(
      ([isLnavSuspended, isObsActive]): ObsSuspModes => {
        return isObsActive
          ? ObsSuspModes.OBS
          : isLnavSuspended ? ObsSuspModes.SUSP : ObsSuspModes.NONE;
      },
      this.isLNavSuspended,
      this.isObsActive
    );

    // Publish OBS mode on bus
    this.obsMode.sub((mode) => {
      this.props.bus.getPublisher<GnsObsEvents>().pub('obs_susp_mode', mode);
    });

    SimVar.SetSimVarValue(`L:${this.props.options.templateId}_SelectedSource`, 'number', 1);

    // Backplane items
    this.props.backplane.addPublisher('adc', this.adcPublisher);
    this.props.backplane.addPublisher('ahrs', this.ahrsPublisher);
    this.props.backplane.addPublisher('gnss', this.gnssPublisher);
    this.props.backplane.addPublisher('navEvents', this.navEventsPublisher);
    this.props.backplane.addPublisher('lnav', this.lNavPublisher);
    this.props.backplane.addPublisher('vnav', this.vNavPublisher);
    this.props.backplane.addPublisher('lnavdata', this.lNavDataPublisher);
    this.props.backplane.addPublisher('vnavdata', this.vNavDataPublisher);
    this.props.backplane.addPublisher('adsb', this.adsbPublisher);
    this.props.backplane.addInstrument('traffic', this.trafficInstrument);

    this.init();
  }

  /** Handle CDI source toggling. */
  private handleCDISourceToggle(): void {
    if (!this.props.options.isUsingNewCdiBehaviour || this.isPrimaryInstrument) {
      this.gnsCdiMode.set(this.gnsCdiMode.get() === GnsCdiMode.GPS ? GnsCdiMode.VLOC : GnsCdiMode.GPS);
    }
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
      this.pageContainer.instance.openPageGroup('NAV', true, 1);
    }

    if (state === PowerState.On) {
      this.pageContainer.instance.openPageGroup('NAV', true, 4);
    }

    if (state === PowerState.Off) {
      this.gpsSatComputer.reset();
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
      this.apRadioNavInstrument = new APRadioNavInstrument(this.props.bus);
      this.autopilotInstrument = new AutopilotInstrument(this.props.bus);
      this.gpsSynchronizer = new GpsSynchronizer(this.props.bus, this.fms.flightPlanner, this.fms.facLoader);

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
    if (this.isPrimaryInstrument) {
      this.cdiNavSource = new CDINavSource(
        this.props.bus,
        this.gnsCdiMode);

      const apConfig = new GNSAPConfig(
        this.props.bus,
        this.planner,
        this.props.options.disableApNavArm,
        this.props.options.disableApBackCourse,
        this.props.options.apSupportsFlightDirector,
      );

      this.autopilot = new GNSAutopilot(
        this.props.bus,
        this.planner,
        apConfig,
        new GNSAPStateManager(this.props.bus, apConfig, this.props.options.apSupportsFlightDirector),
      );

      setTimeout(() => {
        this.autopilot.stateManager.initialize();
      }, 500);

      this.props.bus.getPublisher<VNavControlEvents>().pub('vnav_set_state', false);
    }

    this.vnavController = new GnsVnavController(this.props.bus, this.fms);
  }

  /**
   * Method to run on flight start.
   */
  public onFlightStart(): void {
    if (this.props.options.navIndex === 1) {
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

      this.autopilot?.update();

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
          this.gnsCdiMode.set(this.gnsCdiMode.get() === GnsCdiMode.GPS ? GnsCdiMode.VLOC : GnsCdiMode.GPS);
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
    const obsMode = this.obsMode.get();
    switch (obsMode) {
      case ObsSuspModes.SUSP:
        this.controlPublisher.publishEvent('suspend_sequencing', false);
        break;
      case ObsSuspModes.OBS:
        SimVar.SetSimVarValue('K:GPS_OBS_OFF', 'number', 0);
        this.controlPublisher.publishEvent('suspend_sequencing', false);
        break;
      default:
        if (this.isObsAvailable.get()) {
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
          <StatusPane bus={this.props.bus} />
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
            isUsingSplitCDIs={this.props.options.isUsingNewCdiBehaviour}
            gnsCdiMode={this.gnsCdiMode}
            instrumentIndex={this.props.options.instrumentIndex}
            alerts={this.alertsSubject}
            flightPlanner={this.fms.flightPlanner}
          />
        </div>
      </>
    );
  }
}