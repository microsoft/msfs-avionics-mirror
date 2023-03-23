/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/radionav" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/Coherent/Facilities" />

import {
  AdcPublisher, AhrsPublisher, APEvents, APRadioNavInstrument, AutopilotInstrument, BaseInstrumentPublisher, Clock, ClockEvents,
  ControlPublisher, EISPublisher, ElectricalPublisher, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator, FlightPlanner, FsInstrument,
  GNSSPublisher, GpsSynchronizer, InstrumentBackplane, LNavSimVarPublisher, NavComSimVarPublisher, NavProcSimVars, NavSourceType,
  SimVarValueType, SmoothingPathCalculator, Subject, UserSettingSaveManager, VNavSimVarPublisher, Wait, XPDRInstrument
} from '@microsoft/msfs-sdk';

import { WT21Fms } from '../Shared/FlightPlan/WT21Fms';
import { WT21FmsUtils } from '../Shared/FlightPlan/WT21FmsUtils';
import { WT21SpeedConstraintStore } from './Autopilot/WT21SpeedConstraintStore';
import { WT21SpeedMessagesManager } from './Autopilot/WT21SpeedMessagesManager';
import { FlightPlanAsoboSync } from '../Shared/FlightPlanAsoboSync';
import { FmcSimVarPublisher, FmcSimVars } from '../Shared/FmcSimVars';
import { FmcMessageReceiver } from '../Shared/MessageSystem/FmcMessageReceiver';
import { FmcMsgInfo } from '../Shared/MessageSystem/FmcMsgInfo';
import { MESSAGE_TARGET } from '../Shared/MessageSystem/MessageDefinition';
import { FMS_MESSAGE_ID } from '../Shared/MessageSystem/MessageDefinitions';
import { MessageManager } from '../Shared/MessageSystem/MessageManager';
import { MessageService } from '../Shared/MessageSystem/MessageService';
import { PfdMessageReceiver } from '../Shared/MessageSystem/PfdMessageReceiver';
import { WT21ControlEvents, WT21ControlPublisher } from '../Shared/WT21ControlEvents';
import { FgpUserSettings } from '../Shared/Profiles/FgpUserSettings';
import { WT21SettingSaveManager } from '../Shared/Profiles/WT21SettingSaveManager';
import { WT21APConfig } from './Autopilot/WT21APConfig';
import { WT21APStateManager } from './Autopilot/WT21APStateManager';
import { WT21Autopilot } from './Autopilot/WT21Autopilot';
import { WT21LNavDataSimVarPublisher } from './Autopilot/WT21LNavDataEvents';
import { WT21NavDataComputer } from './Autopilot/WT21NavDataComputer';
import { FmcMiscEvents, FmcPageEvent } from './FmcEvent';
import { FmcBtnEvents } from './Framework/FmcEventPublisher';
import { mapHEventToFmcEvent } from './FmcHEvents';
import { FmsPos } from './FmsPos';
import { FmcMsgLine } from './Framework/Components/FmcMsgLine';
import { FmcEventPublisher } from './Framework/FmcEventPublisher';
import { FmcPageConstructor } from './Framework/FmcPage';
import { FmcPageManager } from './Framework/FmcPageManager';
import { FmcRenderer } from './Framework/FmcRenderer';
import { FmcRouter } from './Framework/FmcRouter';
import { FmcScratchpad } from './Framework/FmcScratchpad';
import { FmcSelectWptPopup } from './Framework/FmcSelectWptPage';
import { ApproachRefPage } from './Pages/ApproachRefPage';
import { AtcControlPage } from './Pages/AtcControlPage';
import { DataLinkMenuPage } from './Pages/DataLinkMenuPage';
import { DefaultsPage } from './Pages/DefaultsPage';
import { DepArrPage } from './Pages/DepArrPage';
import { DirectToHistoryPage } from './Pages/DirectToHistoryPage';
import { DirectToPage } from './Pages/DirectToPage';
import { DisplayMenu } from './Pages/DisplayMenuPage';
import { FixInfoPage } from './Pages/FixInfoPage';
import { FlightLogPage } from './Pages/FlightLogPage';
import { FplnHoldPage } from './Pages/FplnHoldPage';
import { FplnPage } from './Pages/FplnPage';
import { FrequencyPage } from './Pages/FrequencyPage';
import { FuelMgmtPage } from './Pages/FuelMgmtPage';
import { GNSS1POSPage } from './Pages/GNSS1POSPage';
import { GNSSCTLPage } from './Pages/GNSSCTLPage';
import { HoldListPage } from './Pages/HoldListPage';
import { IndexPage } from './Pages/IndexPage';
import { LegsPage } from './Pages/LegsPage';
import { MCDUMenuPage } from './Pages/MCDUMenuPage';
import { MessagesPage } from './Pages/MessagesPage';
import { MFDAdvPage } from './Pages/MFDAdvPage';
import { NearestAirportsPage } from './Pages/NearestAirportsPage';
import { PerfInitPage } from './Pages/PerfInitPage';
import { PerfMenuPage } from './Pages/PerfMenuPage';
import { PosInitPage } from './Pages/PosInitPage';
import { ProgPage } from './Pages/ProgPage';
import { StatusPage } from './Pages/StatusPage';
import { TakeoffRefPage } from './Pages/TakeoffRefPage';
import { TCASPage } from './Pages/TCASPage';
import { TunePage } from './Pages/TunePage';
import { VNAVSetupPage } from './Pages/VNAVSetupPage';
import { VORDMECTLPage } from './Pages/VORDMECTLPage';
import { CommunicationTypePage } from './Pages/CommunicationTypePage';
import { DatabasePage } from './Pages/DatabasePage';
import { DefinePilotWptPage } from './Pages/DefinePilotWptPage';
import { PilotWptListPage } from './Pages/PilotWptListPage';
import { DescentAdvisoryManager } from '../Shared/Navigation/DescentAdvisoryManager';

import '../Shared/WT21_Common.css';
import './WT21_FMC.css';
import { FmcKeyboardInput } from './Framework/FmcKeyboardInput';
import { WeatherPage } from './Pages/WeatherPage';
import { WeatherRequestTermWxPage } from './Pages/WeatherRequestTermWxPage';
import { WeatherViewTermWxPage } from './Pages/WeatherViewTermWxPage';
import { WeatherViewSingleTermWxPage } from './Pages/WeatherViewSingleTermWxPage';
import { PFDUserSettings } from '../PFD/PFDUserSettings';
import { WT21VorManager } from './Systems/WT21VorManager';
import { WT21FlightLogger } from './Systems/WT21FlightLogger';
import { DefaultsUserSettings } from '../Shared/Profiles/DefaultsUserSettings';

/**
 * The WT21 FMC Instrument
 */
export class WT21_FMC_Instrument implements FsInstrument {
  private readonly bus: EventBus;
  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly fmcEventPublisher: FmcEventPublisher;
  private readonly gnssPublisher: GNSSPublisher;
  private readonly adcPublisher: AdcPublisher;
  private readonly electricalPublisher: ElectricalPublisher;
  private readonly ahrsPublisher: AhrsPublisher;
  private readonly controlPublisher: ControlPublisher;
  private readonly settingSaveManager: UserSettingSaveManager;

  private readonly wt21ControlPublisher: WT21ControlPublisher;
  private readonly clock: Clock;
  private readonly navComSimVarPublisher: NavComSimVarPublisher;
  private readonly eisPublisher: EISPublisher;
  private readonly fmcRenderer: FmcRenderer;
  private readonly fmcScratchpad: FmcScratchpad;
  private readonly fmcKeyboardInput: FmcKeyboardInput;
  private readonly fmcMsgLine: FmcMsgLine;
  private readonly activeRouteSubject: Subject<string>;
  private readonly activePageSubject: Subject<FmcPageConstructor>;
  private readonly router: FmcRouter;
  private readonly backplane: InstrumentBackplane;

  private readonly planner: FlightPlanner;
  private readonly facLoader: FacilityLoader;
  private readonly calculator: FlightPathCalculator;
  private readonly verticalPathCalculator: SmoothingPathCalculator;
  private readonly fmsPos: FmsPos;
  public readonly fms: WT21Fms;
  private readonly speedConstraintStore: WT21SpeedConstraintStore;
  private ap!: WT21Autopilot;
  private apRadioNavInstrument!: APRadioNavInstrument;
  private apInstrument!: AutopilotInstrument;
  private readonly lNavPublisher!: LNavSimVarPublisher;
  private readonly lNavDataPublisher!: WT21LNavDataSimVarPublisher;
  private navdataComputer!: WT21NavDataComputer;
  private vNavPublisher!: VNavSimVarPublisher;
  private readonly fmcSimVarPublisher!: FmcSimVarPublisher;
  private readonly xpdrInstrument?: XPDRInstrument;
  private readonly gpsSynchronizer?: GpsSynchronizer;
  private readonly speedMessagesManager?: WT21SpeedMessagesManager;
  private readonly descentAdvisoryManager?: DescentAdvisoryManager;

  private fmcMsgReceiver!: FmcMessageReceiver;
  private pfdMsgReceiver!: PfdMessageReceiver;
  private fmsMsgInfo!: FmcMsgInfo;
  private messageService!: MessageService;
  private messageManager!: MessageManager;
  private vorManager!: WT21VorManager;
  public readonly flightLogger: WT21FlightLogger;

  // private readonly wt21Watson = new WT21Watson();

  /**
   * Creates an instance of the WT21_FMC.
   * @param instrument The base instrument.
   */
  constructor(readonly instrument: BaseInstrument) {
    RegisterViewListener('JS_LISTENER_INSTRUMENTS');

    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    this.backplane = new InstrumentBackplane();
    this.bus = new EventBus();

    // Auto saving is done on the PFD
    // Loading the settings should be the first thing that we do after creating the bus
    this.settingSaveManager = new WT21SettingSaveManager(this.bus);
    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
    this.settingSaveManager.load(saveKey);
    this.loadSimVarSettings();

    this.baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
    this.fmcEventPublisher = new FmcEventPublisher(this.bus);
    this.gnssPublisher = new GNSSPublisher(this.bus);
    this.electricalPublisher = new ElectricalPublisher(this.bus);
    this.adcPublisher = new AdcPublisher(this.bus);
    this.ahrsPublisher = new AhrsPublisher(this.bus);
    this.wt21ControlPublisher = new WT21ControlPublisher(this.bus);
    this.controlPublisher = new ControlPublisher(this.bus);
    this.fmcSimVarPublisher = new FmcSimVarPublisher(this.bus);
    this.lNavPublisher = new LNavSimVarPublisher(this.bus);
    this.lNavDataPublisher = new WT21LNavDataSimVarPublisher(this.bus);
    this.xpdrInstrument = new XPDRInstrument(this.bus);

    this.clock = new Clock(this.bus);

    // Flight Planning Items
    this.facLoader = new FacilityLoader(FacilityRepository.getRepository(this.bus));
    this.calculator = new FlightPathCalculator(this.facLoader, {
      defaultClimbRate: 2000,
      defaultSpeed: 220,
      bankAngle: 25,
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: null,
      maxBankAngle: 25,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind
    }, this.bus);
    this.planner = FlightPlanner.getPlanner(this.bus, this.calculator, WT21FmsUtils.buildWT21LegName);

    this.verticalPathCalculator = new SmoothingPathCalculator(this.bus, this.planner, WT21Fms.PRIMARY_ACT_PLAN_INDEX, {
      defaultFpa: 3,
      minFpa: 2,
      maxFpa: 6,
      forceFirstApproachAtConstraint: true
    });

    // TODO figure out the actual values and config
    this.navComSimVarPublisher = new NavComSimVarPublisher(this.bus);

    this.eisPublisher = new EISPublisher(this.bus);

    // need the message service early here
    if (this.instrument.isPrimary) {
      this.initMessageService();
    }

    this.fmcRenderer = new FmcRenderer(this.bus);
    this.fmcScratchpad = new FmcScratchpad(this.bus, this.fmcRenderer);
    this.fmcKeyboardInput = new FmcKeyboardInput(this.bus);

    this.activeRouteSubject = Subject.create('/status');
    this.activePageSubject = Subject.create<FmcPageConstructor>(StatusPage);
    this.router = new FmcRouter(this.activeRouteSubject, this.activePageSubject, this.bus);

    this.backplane.addPublisher('base', this.baseInstrumentPublisher);
    this.backplane.addPublisher('wt21control', this.wt21ControlPublisher);
    this.backplane.addPublisher('adc', this.adcPublisher);
    this.backplane.addPublisher('ahrs', this.ahrsPublisher);
    this.backplane.addPublisher('elec', this.electricalPublisher);
    this.backplane.addPublisher('gnss', this.gnssPublisher);
    this.backplane.addPublisher('ctrl', this.controlPublisher);
    this.backplane.addPublisher('fmcevent', this.fmcEventPublisher);
    this.backplane.addPublisher('navcom', this.navComSimVarPublisher);
    this.backplane.addPublisher('eis', this.eisPublisher);
    this.backplane.addPublisher('fmcsimvar', this.fmcSimVarPublisher);
    this.backplane.addPublisher('lnav', this.lNavPublisher);
    this.backplane.addPublisher('lnavdata', this.lNavDataPublisher);
    this.xpdrInstrument && this.backplane.addInstrument('xpdr', this.xpdrInstrument);

    SimVar.SetSimVarValue('L:AS3000_Brightness', 'number', 1);

    this.clock.init();

    this.fmsPos = new FmsPos(this.bus, this.messageService);
    this.fms = new WT21Fms(this.bus, this.planner, this.fmsPos, this.verticalPathCalculator, this.messageService);
    this.speedConstraintStore = new WT21SpeedConstraintStore(this.bus, this.planner);
    this.fmcMsgLine = new FmcMsgLine(this.fms.planInMod, this.fmcRenderer);
    this.fmsMsgInfo = new FmcMsgInfo(this.bus, this.fmcMsgLine);

    if (this.instrument.isPrimary) {
      this.initializeAutopilot();
      this.gpsSynchronizer = new GpsSynchronizer(this.bus, this.planner, this.facLoader);
      this.speedMessagesManager = new WT21SpeedMessagesManager(this.bus, this.fms, this.messageService, this.speedConstraintStore, this.verticalPathCalculator);
      this.descentAdvisoryManager = new DescentAdvisoryManager(this.bus, this.fms);
    }

    this.backplane.init();

    this.initFlightPlan().then(() => {
      if (this.instrument.isPrimary && this.instrument.getGameState() === 3) {
        if (!this.ap.stateManager.stateManagerInitialized.get()) {
          this.ap.stateManager.initialize(true);
          this.ap.apValues.maxBankAngle.set(35);
        }
      }

      // emit new flight plan event when takeoff airport icao changes
      this.fms.getActivePerformancePlan().takeoffAirportIcao.sub(() => {
        this.bus.getPublisher<WT21ControlEvents>().pub('new_flight_plan_created', undefined, true, false);
      });

      // reset the flight logger when origin changes (new flight plan)
      this.bus.getSubscriber<WT21ControlEvents>().on('new_flight_plan_created').handle(() => {
        this.flightLogger.reset();
      });
    });

    this.initializeRoutes();

    this.vorManager = new WT21VorManager(this.bus, this.fms.facLoader);
    if (!this.instrument.isPrimary) {
      if (DefaultsUserSettings.getManager(this.bus).getSetting('flightLogOnLanding').value === true) {
        // listen for ftl log event to show flt log page
        this.bus.getSubscriber<WT21ControlEvents>().on('show_flt_log').handle(() => {
          this.router.navigateTo('/flt-log');
        });
      }
    }

    this.flightLogger = new WT21FlightLogger(this.bus);
  }

  /** Sets SimVars based on persisted settings.
   * Should be called after settings have been loaded.
   * Only needs to run on a single instrument. */
  private loadSimVarSettings(): void {
    if (!this.instrument.isPrimary) {
      return;
    }

    // Selected heading
    const selectedHeadingSetting = FgpUserSettings.getManager(this.bus).getSetting('selectedHeading');
    SimVar.SetSimVarValue('K:HEADING_BUG_SET', SimVarValueType.Degree, selectedHeadingSetting.value);
    this.bus.getSubscriber<APEvents>().on('ap_heading_selected').whenChanged().handle(x => selectedHeadingSetting.value = x);

    // Course
    const course1Setting = FgpUserSettings.getManager(this.bus).getSetting('course1');
    SimVar.SetSimVarValue('K:VOR1_SET', SimVarValueType.Number, course1Setting.value);
    this.bus.getSubscriber<NavProcSimVars>().on('nav_obs_1').whenChanged().handle(x => course1Setting.value = x);

    const course2Setting = FgpUserSettings.getManager(this.bus).getSetting('course2');
    SimVar.SetSimVarValue('K:VOR2_SET', SimVarValueType.Number, course2Setting.value);
    this.bus.getSubscriber<NavProcSimVars>().on('nav_obs_2').whenChanged().handle(x => course2Setting.value = x);
  }

  /**
   * Initialize the routes on the FmcRouter
   */
  private initializeRoutes(): void {
    const pageManager = new FmcPageManager(this.bus, this.fmcRenderer, this.router,
      this.fmcScratchpad, this, this.fmcMsgLine, this.instrument.isPrimary ? 1 : 2);

    this.router
      .add('/', IndexPage, FmcPageEvent.PAGE_INDEX)
      .add('/legs', LegsPage, FmcPageEvent.PAGE_LEGS)
      .add('/route', FplnPage, FmcPageEvent.PAGE_FPLN)
      .add('/fpln-hold', FplnHoldPage)
      .add('/hold-list', HoldListPage)
      .add('/tune/1', TunePage, FmcPageEvent.PAGE_TUNE)
      .add('/tune/2', TunePage)
      .add('/atc', AtcControlPage)
      .add('/tcas', TCASPage)
      .add('/index', IndexPage, FmcPageEvent.PAGE_INDEX)
      .add('/mcdu-menu', MCDUMenuPage, FmcPageEvent.PAGE_MCDUMENU)
      .add('/status', StatusPage, FmcPageEvent.PAGE_STATUS)
      .add('/pos-init', PosInitPage, FmcPageEvent.PAGE_POSINIT)
      .add('/datalink-menu', DataLinkMenuPage, FmcPageEvent.PAGE_DATALINKMENU)
      .add('/dl-weather', WeatherPage, FmcPageEvent.PAGE_WEATHER)
      .add('/dl-terminalwx-req', WeatherRequestTermWxPage, FmcPageEvent.PAGE_TERMWX_REQ)
      .add('/dl-terminalwx-view', WeatherViewTermWxPage, FmcPageEvent.PAGE_TERMWX_VIEW)
      .add('/dl-terminalwx-single-view', WeatherViewSingleTermWxPage)
      .add('/vor-dme-ctl', VORDMECTLPage, FmcPageEvent.PAGE_VORDMECTL)
      .add('/gnss-ctl', GNSSCTLPage, FmcPageEvent.PAGE_GNSSCTL)
      .add('/gnss1-pos', GNSS1POSPage, FmcPageEvent.PAGE_GNSS1POS)
      .add('/freq', FrequencyPage, FmcPageEvent.PAGE_FREQ)
      .add('/comm-type', CommunicationTypePage)
      .add('/fix', FixInfoPage, FmcPageEvent.PAGE_FIX)
      .add('/prog', ProgPage, FmcPageEvent.PAGE_PROG)

      .add('/perf-menu', PerfMenuPage, FmcPageEvent.PAGE_PERF)
      .add('/perf-init', PerfInitPage, FmcPageEvent.PAGE_PERFINIT)
      .add('/takeoff-ref', TakeoffRefPage, FmcPageEvent.PAGE_TAKEOFFREF)
      .add('/appr-ref', ApproachRefPage, FmcPageEvent.PAGE_APPROACHREF1)
      .add('/defaults', DefaultsPage, FmcPageEvent.PAGE_DEFAULTS)
      .add('/vnav-setup', VNAVSetupPage, FmcPageEvent.PAGE_VNAVSETUP)
      .add('/fuel-mgmt', FuelMgmtPage, FmcPageEvent.PAGE_FUELMGMT1)
      .add('/flt-log', FlightLogPage, FmcPageEvent.PAGE_FLTLOG)

      .add('/database', DatabasePage)
      .add('/pilot-wpt-list', PilotWptListPage)
      .add('/define-pilot-wpt', DefinePilotWptPage)
      .add('/dep-arr', DepArrPage, FmcPageEvent.PAGE_DEPARRIDX)
      .add('/dspl-menu-1', DisplayMenu, FmcPageEvent.PAGE_DSPLMENU1)
      .add('/mfd-adv', MFDAdvPage, FmcPageEvent.PAGE_MFDADV)
      .add('/direct-to', DirectToPage, FmcPageEvent.PAGE_DIR)
      .add('/direct-to-history', DirectToHistoryPage)
      .add('/nearest-airports', NearestAirportsPage)
      .add('/msg', MessagesPage, FmcPageEvent.PAGE_MSG)

      .add('/select-wpt', FmcSelectWptPopup);

    this.router.hookup();

    this.activePageSubject.sub((page) => pageManager.switchToPage(page), true);
  }


  /** @inheritdoc */
  onInteractionEvent(_args: Array<string>): void {
    const event = mapHEventToFmcEvent(_args[0], this.instrument.instrumentIndex);
    if (event) {
      this.fmcEventPublisher.dispatchHEvent(event);
    }
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /**
   * Initializes the autopilot.
   */
  private initializeAutopilot(): void {
    this.apInstrument = new AutopilotInstrument(this.bus);
    this.backplane.addInstrument('ap', this.apInstrument);
    this.apRadioNavInstrument = new APRadioNavInstrument(this.bus);
    this.backplane.addInstrument('apradionav', this.apRadioNavInstrument);

    const apConfig = new WT21APConfig(this.bus, this.planner, this.messageService, this.verticalPathCalculator, this.fms.activePerformancePlan);

    this.ap = new WT21Autopilot(
      this.bus,
      this.planner,
      apConfig,
      new WT21APStateManager(this.bus, apConfig),
      PFDUserSettings.getManager(this.bus),
    );
    this.navdataComputer = new WT21NavDataComputer(this.bus, this.planner, this.facLoader, this.messageService);

    this.vNavPublisher = new VNavSimVarPublisher(this.bus);
    this.backplane.addPublisher('vnav', this.vNavPublisher);

    const apUpdateFnc = (): void => { this.ap.update(); };
    this.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(apUpdateFnc);

  }

  private lastCalculate = 0;

  /**
   * A callback called when the instrument gets a frame update.
   */
  public Update(): void {
    this.clock.onUpdate();
    this.backplane.onUpdate();

    if (this.instrument.isPrimary) {
      this.navdataComputer?.update();
      // this.ap.update();
      this.gpsSynchronizer?.update();

      // Planner update
      const now = Date.now();

      if (now - this.lastCalculate > 3000) {
        const planInMod = SimVar.GetSimVarValue(FmcSimVars.FmcExecActive, SimVarValueType.Bool);
        if (this.planner.hasFlightPlan(0)) {
          this.planner.getFlightPlan(0).calculate();
        }

        if (planInMod && this.planner.hasFlightPlan(1)) {
          this.planner.getFlightPlan(1).calculate();
        }

        SimVar.SetSimVarValue('K:HEADING_GYRO_SET', SimVarValueType.Number, 0);
        this.lastCalculate = now;
      }
    }
  }

  /**
   * Callback called when the flight starts.
   */
  public onFlightStart(): void {
    if (this.instrument.isPrimary) {
      this.ap.stateManager.initialize();
      Wait.awaitCondition(() => this.planner.hasFlightPlan(0), 1000)
        .then(
          async () => {
            await FlightPlanAsoboSync.loadFromGame(this.fms);
            await Wait.awaitDelay(500);
            const batteryOn = SimVar.GetSimVarValue('ELECTRICAL MASTER BATTERY', 'bool');
            if (batteryOn) {
              this.bus.getPublisher<FmcBtnEvents>().pub('fmcExecEvent', FmcMiscEvents.BTN_EXEC, false);
            }
          }
        );
    }
  }

  /**
   * Initializes the primary flight plan.
   * To be used by the secondary instrument!
   */
  private async initFlightPlan(): Promise<void> {
    // Request a sync from the FMC in case of an instrument reload
    this.planner.requestSync();
    await Wait.awaitDelay(this.instrument.isPrimary ? 500 : 3000);
    // Initialize the primary plan in case one was not synced.
    if (this.planner.hasFlightPlan(0)) {
      this.fms.setFacilityInfo();
      this.fms.switchPerformanceProxyToRenderPlan();
      return;
    }

    if (!this.instrument.isPrimary) {
      this.planner.createFlightPlan(0);
      this.planner.createFlightPlan(1);
    } else {
      await this.fms.initPrimaryFlightPlan();
    }

    this.fms.switchPerformanceProxyToRenderPlan();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private initMessageService(): void {
    this.messageService = new MessageService();
    this.fmcMsgReceiver = new FmcMessageReceiver(this.bus);
    this.messageService.registerReceiver(MESSAGE_TARGET.FMC, this.fmcMsgReceiver);
    this.pfdMsgReceiver = new PfdMessageReceiver(this.bus);
    this.messageService.registerReceiver(MESSAGE_TARGET.PFD_TOP, this.pfdMsgReceiver);
    this.messageService.registerReceiver(MESSAGE_TARGET.PFD_BOT, this.pfdMsgReceiver);
    this.messageService.registerReceiver(MESSAGE_TARGET.MFD_TOP, this.pfdMsgReceiver);
    this.messageService.registerReceiver(MESSAGE_TARGET.MAP_MID, this.pfdMsgReceiver);
    this.messageManager = new MessageManager(this.bus, this.messageService);

    this.bus.getSubscriber<ClockEvents>().on('realTime')
      .atFrequency(1).handle(this.updateMessageService);
  }

  /** Updates the MessageService. */
  private readonly updateMessageService = (): void => {
    if (this.canActivateNoFlightPlanMessage()) {
      // Yes, the actual message is disabled when active nav source is not FMS, even if there is still no flight plan
      // Yes, the message will disappear from the MFD as well when active nav source is not FMS, even though that's mainly a PFD thing
      const blinkEndTime = Date.now() + 5000;
      this.messageService.post(FMS_MESSAGE_ID.NO_FLIGHT_PLAN, () => !this.canActivateNoFlightPlanMessage(), () => Date.now() < blinkEndTime);
    }

    this.messageService.update();
    this.pfdMsgReceiver.update();
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly canActivateNoFlightPlanMessage = (): boolean => {
    const isFmsActiveNavSource = this.fms.getCdiSource().type === NavSourceType.Gps;
    const noActiveFlightPlan = !this.fms.hasPrimaryFlightPlan() || this.fms.getPrimaryFlightPlan().length === 0;
    return isFmsActiveNavSource && noActiveFlightPlan;
  };

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    // noop
  }
}
