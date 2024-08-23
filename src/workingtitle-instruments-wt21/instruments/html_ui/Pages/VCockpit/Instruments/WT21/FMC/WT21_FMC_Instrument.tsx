/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/radionav" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/Coherent/Facilities" />

import {
  AdcPublisher, AhrsPublisher, APEvents, APRadioNavInstrument, AutopilotInstrument, BaseInstrumentPublisher, Clock, ClockEvents, ControlPublisher, EISPublisher,
  ElectricalPublisher, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator, FlightPlanner, FSComponent, FsInstrument, GameStateProvider,
  GNSSPublisher, GpsSynchronizer, InstrumentBackplane, LNavSimVarPublisher, NavComEvents, NavComSimVarPublisher, NavSourceType, PluginSystem, SimVarValueType,
  SmoothingPathCalculator, UserSettingSaveManager, VNavSimVarPublisher, Wait, XPDRInstrument,
} from '@microsoft/msfs-sdk';

import { WT21APConfig } from './Autopilot/WT21APConfig';
import { WT21APStateManager } from './Autopilot/WT21APStateManager';
import { WT21Autopilot } from './Autopilot/WT21Autopilot';
import { WT21NavDataComputer } from './Autopilot/WT21NavDataComputer';
import { WT21SpeedConstraintStore } from './Autopilot/WT21SpeedConstraintStore';
import { WT21SpeedMessagesManager } from './Autopilot/WT21SpeedMessagesManager';
import { FmcMiscEvents } from './FmcEvent';
import { mapHEventToFmcEvent } from './FmcHEvents';
import { FmsPos } from './FmsPos';
import { FmcEventPublisher } from './Framework/FmcEventPublisher';
import { FmcKeyboardInput } from './Framework/FmcKeyboardInput';
import { WT21FlightLogger } from './Systems/WT21FlightLogger';
import { WT21VorManager } from './Systems/WT21VorManager';
import { WT21CduDisplay } from './WT21CduDisplay';
import { WT21FmcAvionicsPlugin, WT21FmcPluginBinder } from './WT21FmcAvionicsPlugin';
import { WT21FmcEvents } from './WT21FmcEvents';

import './WT21_FMC.css';
import {
  DefaultsUserSettings, FgpUserSettings, FmcSimVarPublisher, FmcSimVars, FMS_MESSAGE_ID, MESSAGE_TARGET, MessageManager, MessageService, PfdMessageReceiver, PFDUserSettings,
  WT21ControlEvents, WT21ControlPublisher, WT21FixInfoConfig, WT21FixInfoManager, WT21FmsUtils, WT21LNavDataSimVarPublisher, WT21SettingSaveManager,
} from '@microsoft/msfs-wt21-shared';
import { WT21Fms } from './FlightPlan/WT21Fms';
import { DescentAdvisoryManager, FmcMessageReceiver } from './Data';
import { FlightPlanAsoboSync } from './FlightPlan';

/**
 * The WT21 FMC Instrument
 */
export class WT21_FMC_Instrument implements FsInstrument {
  private readonly cduScreenRef = FSComponent.createRef<WT21CduDisplay>();

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
  private readonly fmcKeyboardInput: FmcKeyboardInput;
  private readonly backplane: InstrumentBackplane;

  public readonly planner: FlightPlanner;
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
  private messageService!: MessageService;
  private messageManager!: MessageManager;
  private vorManager!: WT21VorManager;
  public readonly flightLogger: WT21FlightLogger;
  private readonly fixInfoManager: WT21FixInfoManager;

  private readonly pluginSystem = new PluginSystem<WT21FmcAvionicsPlugin, WT21FmcPluginBinder>();

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
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind,
    }, this.bus);
    this.planner = FlightPlanner.getPlanner(this.bus, this.calculator, WT21FmsUtils.buildWT21LegName);

    this.verticalPathCalculator = new SmoothingPathCalculator(this.bus, this.planner, WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX, {
      defaultFpa: 3,
      minFpa: 2,
      maxFpa: 6,
      forceFirstApproachAtConstraint: true,
    });

    // TODO figure out the actual values and config
    this.navComSimVarPublisher = new NavComSimVarPublisher(this.bus);

    this.eisPublisher = new EISPublisher(this.bus);

    // need the message service early here
    if (this.instrument.isPrimary) {
      this.initMessageService();
    }

    this.fmcKeyboardInput = new FmcKeyboardInput(this.bus);

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

    this.initPluginSystem().then(async () => {
      this.backplane.init();

      await Wait.awaitCondition(() => this.cduScreenRef.getOrDefault()?.fmcScreen !== undefined, 100, 10_000);

      this.pluginSystem.callPlugins((it) => {
        const context = this.cduScreenRef.instance.fmcScreen;

        if (!context) {
          return;
        }

        it.registerFmcExtensions?.(context);
      });

      this.cduScreenRef.instance.afterPluginSystemInitialized();
    });

    this.clock.init();

    // FIXME Add route predictor when FlightPlanPredictor refactored to implement FlightPlanPredictionsProvider
    this.fixInfoManager = new WT21FixInfoManager(this.bus, this.facLoader, WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX, this.planner, WT21FixInfoConfig /*, this.activeRoutePredictor*/);
    this.fmsPos = new FmsPos(this.bus, this.messageService);
    this.fms = new WT21Fms(this.bus, this.planner, this.fmsPos, this.verticalPathCalculator, this.messageService, this.fixInfoManager);
    this.speedConstraintStore = new WT21SpeedConstraintStore(this.bus, this.planner);

    if (this.instrument.isPrimary) {
      this.initializeAutopilot();
      this.gpsSynchronizer = new GpsSynchronizer(this.bus, this.planner, this.facLoader);
      this.speedMessagesManager = new WT21SpeedMessagesManager(this.bus, this.fms, this.messageService, this.speedConstraintStore, this.verticalPathCalculator);
      this.descentAdvisoryManager = new DescentAdvisoryManager(this.bus, this.fms);
    }


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

    this.renderComponents();

    this.vorManager = new WT21VorManager(this.bus, this.fms.facLoader);
    if (!this.instrument.isPrimary) {
      if (DefaultsUserSettings.getManager(this.bus).getSetting('flightLogOnLanding').value === true) {
        // listen for ftl log event to show flt log page
        this.bus.getSubscriber<WT21ControlEvents>().on('show_flt_log').handle(() => {
          // this.router.navigateTo('/flt-log');
        });
      }
    }

    this.flightLogger = new WT21FlightLogger(this.bus);
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is initialized.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });

    const pluginBinder: WT21FmcPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      flightPlanner: this.planner,
      fms: this.fms,
      isPrimaryInstrument: this.instrument.isPrimary,
    };

    return this.pluginSystem.startSystem(pluginBinder);
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
    this.bus.getSubscriber<NavComEvents>().on('nav_obs_1').whenChanged().handle(x => course1Setting.value = x);

    const course2Setting = FgpUserSettings.getManager(this.bus).getSetting('course2');
    SimVar.SetSimVarValue('K:VOR2_SET', SimVarValueType.Number, course2Setting.value);
    this.bus.getSubscriber<NavComEvents>().on('nav_obs_2').whenChanged().handle(x => course2Setting.value = x);
  }

  /**
   * Renders the components
   */
  private renderComponents(): void {
    FSComponent.render(
      <WT21CduDisplay
        ref={this.cduScreenRef}
        bus={this.bus}
        baseInstrument={this}
        fms={this.fms}
        fmcIndex={this.getInstrumentIndex()}
      />,
      document.querySelector('#Electricity'),
    );
  }

  /** @inheritdoc */
  onInteractionEvent(_args: Array<string>): void {
    const event = mapHEventToFmcEvent(_args[0], this.instrument.instrumentIndex);
    if (event) {
      this.fmcEventPublisher.dispatchHEvent(event);
    }
  }

  /**
   * Returns the FMC index of this instrument
   *
   * @throws if the FMC index is invalid
   *
   * @returns 1 or 2
   */
  private getInstrumentIndex(): 1 | 2 {
    const index = this.instrument.urlConfig.index;

    if (index !== 1 && index !== 2) {
      throw new Error('Invalid FMC index: must be 1 or 2');
    }

    return index;
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

    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      this.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(() => {
        this.ap.update();
      });
    });
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
              this.bus.getPublisher<WT21FmcEvents>().pub(FmcMiscEvents.BTN_EXEC, undefined, false);
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
