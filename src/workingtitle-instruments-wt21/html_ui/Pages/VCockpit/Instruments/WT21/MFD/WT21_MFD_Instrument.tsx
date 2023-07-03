/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import {
  AdcPublisher, AhrsPublisher, AutopilotInstrument, BaseInstrumentPublisher, BasicAvionicsSystem, Clock,
  ClockEvents, CompositeLogicXMLHost, ConsumerSubject,
  DebounceTimer,
  ElectricalEvents, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator, FlightPlanner,
  FlightPlanPredictor, FSComponent,
  FsInstrument,
  GNSSPublisher, HEventPublisher, InstrumentBackplane, InstrumentEvents, LNavSimVarPublisher, MinimumsSimVarPublisher, NavComSimVarPublisher,
  PressurizationPublisher, SimVarValueType,
  SoundServer,
  StallWarningEvents,
  StallWarningPublisher,
  Subject, TrafficInstrument, UserSettingSaveManager,
  VNavSimVarPublisher, Wait, XPDRSimVarPublisher,
} from '@microsoft/msfs-sdk';

import { WT21LNavDataEvents, WT21LNavDataSimVarPublisher } from '../FMC/Autopilot/WT21LNavDataEvents';
import { BottomSectionContainer, BottomSectionVersion } from '../Shared/BottomSection/BottomSectionContainer';
import { WT21FmsUtils } from '../Shared/FlightPlan/WT21FmsUtils';
import { FmcSimVarPublisher } from '../Shared/FmcSimVars';
import { MfdHsi } from '../Shared/LowerSection/HSI/MfdHsi';
import { MenuContainer } from '../Shared/Menus/MenuContainer';
import { AdfRadioSource, GpsSource, initNavIndicatorContext, NavIndicatorContext, NavIndicators, NavRadioNavSource, NavSources } from '../Shared/Navigation';
import {
  WT21BearingPointerNavIndicator, WT21CourseNeedleNavIndicator, WT21NavIndicator, WT21NavIndicatorName, WT21NavIndicators, WT21NavSourceNames, WT21NavSources
} from '../Shared/Navigation/WT21NavIndicators';
import { PerformancePlanRepository } from '../Shared/Performance/PerformancePlanRepository';
import { WT21SettingSaveManager } from '../Shared/Profiles/WT21SettingSaveManager';
import { WT21TCAS } from '../Shared/Traffic/WT21TCAS';
import { CcpController } from './CCP/CcpController';
import { CcpEventPublisher } from './CCP/CcpEventPublisher';
import { CcpHEvents } from './CCP/CcpHEvents';
import { CAS } from './Components/CAS/CAS';
import { EisInstrument } from './Components/EngineIndication/EisData';
import { EngineIndicationDisplayContainer } from './Components/EngineIndication/EngineIndicationDisplayContainer';
import { SystemsOverlayContainer } from './Components/SystemsOverlay/SystemsOverlayContainer';
import { UpperTextContainer } from './Components/UpperTextContainer';
import { TextPagesContainer } from './Components/TextPagesContainer';
import { MfdLwrMenu } from './Menus/MfdLwrMenu';
import { MfdLwrMenuViewService } from './Menus/MfdLwrMenuViewService';
import { MfdLwrOverlaysMenu } from './Menus/MfdLwrOverlaysMenu';
import { MfdUprMenu } from './Menus/MfdUprMenu';
import { MfdUprMenuViewService } from './Menus/MfdUprMenuViewService';
import { PerformancePlanProxy } from '../Shared/Performance/PerformancePlanProxy';
import { MfdLwrMapSymbolsMenu } from './Menus/MfdLwrMapSymbolsMenu';
import { WT21FlightPlanPredictorConfiguration } from '../Shared/WT21FlightPlanPredictorConfiguration';
import { WT21Fms } from '../Shared/FlightPlan/WT21Fms';
import { WT21ElectricalSetup } from '../Shared/Systems/WT21ElectricalSetup';

import '../Shared/WT21_Common.css';
import './WT21_MFD.css';
import { WT21XmlAuralsConfig } from '../Shared/WT21XmlAuralsConfig';

/**
 * The WT21 MFD Instrument
 */
export class WT21_MFD_Instrument implements FsInstrument {
  private readonly backplane: InstrumentBackplane;
  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly hEventPublisher: HEventPublisher;
  private readonly apInstrument: AutopilotInstrument;
  private readonly eisInstrument: EisInstrument;
  private readonly adcPublisher: AdcPublisher;
  private readonly ahrsPublisher: AhrsPublisher;
  private readonly lnavPublisher: LNavSimVarPublisher;
  private readonly lnavDataPublisher: WT21LNavDataSimVarPublisher;
  private readonly vNavSimVarPublisher: VNavSimVarPublisher;
  private readonly trafficInstrument: TrafficInstrument;
  private readonly facLoader: FacilityLoader;
  private readonly calculator: FlightPathCalculator;
  private readonly planner: FlightPlanner;
  private readonly predictor: FlightPlanPredictor;
  private readonly clock: Clock;
  private readonly pressurizationPublisher!: PressurizationPublisher;
  private readonly xpdrPublisher!: XPDRSimVarPublisher;
  private readonly gnssPublisher!: GNSSPublisher;
  private readonly bus: EventBus;
  private readonly settingSaveManager: UserSettingSaveManager;
  private readonly navSources: WT21NavSources;
  private readonly navIndicators: WT21NavIndicators;
  private readonly navComSimVarPublisher: NavComSimVarPublisher;
  private readonly uprMenuViewService: MfdUprMenuViewService;
  private readonly lwrMenuViewService: MfdLwrMenuViewService;
  private readonly ccpEventPublisher: CcpEventPublisher;
  private readonly ccpController: CcpController;
  private readonly fmcSimVarPublisher: FmcSimVarPublisher;
  private readonly minimumsPublisher: MinimumsSimVarPublisher;
  private readonly stallWarningPublisher: StallWarningPublisher;

  private readonly primaryPlanNominalLegIndexSub = ConsumerSubject.create(null, -1,);

  private readonly xmlLogicHost: CompositeLogicXMLHost;
  private readonly avionicsSystems: BasicAvionicsSystem<any>[] = [];

  private readonly soundServer?: SoundServer;

  private readonly tcas: WT21TCAS;
  // private readonly wt21Watson = new WT21Watson();
  private readonly perfPlanRepository: PerformancePlanRepository;
  private performancePlanProxy!: PerformancePlanProxy;

  private readonly casRef = FSComponent.createRef<CAS>();
  private readonly textPageContainerRef = FSComponent.createRef<TextPagesContainer>();
  private readonly hsiRef = FSComponent.createRef<MfdHsi>();

  private readonly dispatchModeTimer: DebounceTimer = new DebounceTimer();
  private isMasterBatteryOn = false;
  private isAv1BusOn = false;
  private auralsConfig: WT21XmlAuralsConfig;

  /**
   * Creates an instance of the WT21_MFD.
   * @param instrument The base instrument.
   */
  constructor(readonly instrument: BaseInstrument) {
    RegisterViewListener('JS_LISTENER_INSTRUMENTS');

    this.bus = new EventBus();
    this.backplane = new InstrumentBackplane();

    if (this.instrument.isPrimary) {
      this.soundServer = new SoundServer(this.bus);
    }

    // Autosaving is done on the PFD
    // Loading the settings should be the first thing that we do after creating the bus
    this.settingSaveManager = new WT21SettingSaveManager(this.bus);
    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
    this.settingSaveManager.load(saveKey);

    this.baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
    this.backplane.addPublisher('base', this.baseInstrumentPublisher);

    this.hEventPublisher = new HEventPublisher(this.bus);
    this.backplane.addPublisher('hEvents', this.hEventPublisher);

    this.ccpEventPublisher = new CcpEventPublisher(this.bus);
    this.backplane.addPublisher('ccpEvents', this.ccpEventPublisher);

    this.ccpController = new CcpController(this.bus);

    this.apInstrument = new AutopilotInstrument(this.bus);
    this.backplane.addInstrument('ap', this.apInstrument);

    this.adcPublisher = new AdcPublisher(this.bus);
    this.backplane.addPublisher('adc', this.adcPublisher);

    this.ahrsPublisher = new AhrsPublisher(this.bus);
    this.backplane.addPublisher('ahrs', this.ahrsPublisher);

    this.lnavPublisher = new LNavSimVarPublisher(this.bus);
    this.backplane.addPublisher('lnav', this.lnavPublisher);

    this.lnavDataPublisher = new WT21LNavDataSimVarPublisher(this.bus);
    this.backplane.addPublisher('lnavdata', this.lnavDataPublisher);

    this.vNavSimVarPublisher = new VNavSimVarPublisher(this.bus);
    this.backplane.addPublisher('vnav', this.vNavSimVarPublisher);

    this.gnssPublisher = new GNSSPublisher(this.bus);
    this.backplane.addPublisher('gnss', this.gnssPublisher);

    this.pressurizationPublisher = new PressurizationPublisher(this.bus);
    this.backplane.addPublisher('pressurization', this.pressurizationPublisher);

    this.fmcSimVarPublisher = new FmcSimVarPublisher(this.bus);
    this.backplane.addPublisher('fmc', this.fmcSimVarPublisher);

    this.eisInstrument = new EisInstrument(this.bus);

    this.xpdrPublisher = new XPDRSimVarPublisher(this.bus);
    this.backplane.addPublisher('xpdr', this.xpdrPublisher);

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

    this.predictor = new FlightPlanPredictor(
      this.bus,
      this.planner,
      Subject.create(WT21Fms.PRIMARY_ACT_PLAN_INDEX),
      this.primaryPlanNominalLegIndexSub,
      WT21FlightPlanPredictorConfiguration,
    );
    this.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(2_500).handle(() => this.predictor.update());

    this.clock = new Clock(this.bus);

    this.eisInstrument = new EisInstrument(this.bus);
    this.backplane.addPublisher('eis', this.eisInstrument.eisPub);
    this.backplane.addPublisher('controlsurfaces', this.eisInstrument.surfacesPub);
    this.backplane.addPublisher('electrics', this.eisInstrument.elecPub);

    this.navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
    this.backplane.addPublisher('navCom', this.navComSimVarPublisher);

    // TODO Deduplicate this code against PFD code
    this.navSources = new NavSources<WT21NavSourceNames>(
      new NavRadioNavSource<WT21NavSourceNames>(this.bus, 'NAV1', 1),
      new NavRadioNavSource<WT21NavSourceNames>(this.bus, 'NAV2', 2),
      new AdfRadioSource<WT21NavSourceNames>(this.bus, 'ADF', 1),
      new GpsSource<WT21NavSourceNames>(this.bus, 'FMS1', 1, this.planner),
      new GpsSource<WT21NavSourceNames>(this.bus, 'FMS2', 2, this.planner),
    );
    this.backplane.addInstrument('navSources', this.navSources);

    // TODO Deduplicate this code against PFD code
    this.navIndicators = new NavIndicators(new Map<WT21NavIndicatorName, WT21NavIndicator>([
      ['courseNeedle', new WT21CourseNeedleNavIndicator(this.navSources, this.bus, 'MFD')],
      ['bearingPointer1', new WT21BearingPointerNavIndicator(this.navSources, this.bus, 1, 'NAV1')],
      ['bearingPointer2', new WT21BearingPointerNavIndicator(this.navSources, this.bus, 2, 'NAV2')],
    ]));
    this.backplane.addInstrument('navIndicators', this.navIndicators);

    this.xmlLogicHost = new CompositeLogicXMLHost(true);

    this.trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
    this.backplane.addInstrument('traffic', this.trafficInstrument);

    this.minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
    this.backplane.addPublisher('minimums', this.minimumsPublisher);

    this.stallWarningPublisher = new StallWarningPublisher(this.bus, 0.8);
    this.backplane.addPublisher('stallWarning', this.stallWarningPublisher);

    this.primaryPlanNominalLegIndexSub.setConsumer(
      this.bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_nominal_leg_index').whenChanged(),
    );

    this.tcas = new WT21TCAS(this.bus, this.trafficInstrument);
    this.perfPlanRepository = new PerformancePlanRepository(this.planner, this.bus);

    this.uprMenuViewService = new MfdUprMenuViewService();
    this.lwrMenuViewService = new MfdLwrMenuViewService();
    this.uprMenuViewService.otherMenuServices.push(this.lwrMenuViewService);
    this.lwrMenuViewService.otherMenuServices.push(this.uprMenuViewService);

    this.backplane.init();

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    initNavIndicatorContext(this.navIndicators);

    // set up synced perf proxy so we can also pull in the per managers here
    this.performancePlanProxy = new PerformancePlanProxy(this.perfPlanRepository.getActivePlan());
    this.performancePlanProxy.switchToPlan(this.perfPlanRepository.getActivePlan(), true);

    if (this.instrument.isPrimary) {
      FSComponent.render(<EngineIndicationDisplayContainer bus={this.bus} eis={this.eisInstrument} />, document.getElementById('EngineInstruments'));
      FSComponent.render(<CAS ref={this.casRef} bus={this.bus} logicHandler={this.xmlLogicHost} instrument={this.instrument} />, document.getElementById('HSIMap'));
    } else {
      FSComponent.render(<CAS ref={this.casRef} bus={this.bus} logicHandler={this.xmlLogicHost} instrument={this.instrument} />, document.getElementById('EngineInstruments'));
    }
    FSComponent.render(<UpperTextContainer bus={this.bus} planner={this.planner} facLoader={this.facLoader} eis={this.eisInstrument} performancePlanProxy={this.performancePlanProxy} />, document.getElementById('UpperMenu'));
    FSComponent.render(
      <TextPagesContainer
        ref={this.textPageContainerRef}
        bus={this.bus}
        planner={this.planner}
        facLoader={this.facLoader}
        predictor={this.predictor}
        performancePlan={this.performancePlanProxy}
        mfdIndex={this.instrument.instrumentIndex}
      />,
      document.getElementById('TextPagesContainer'));
    FSComponent.render(<SystemsOverlayContainer bus={this.bus} eis={this.eisInstrument} />, document.getElementById('Electricity'));
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <MfdHsi ref={this.hsiRef} bus={this.bus} flightPlanner={this.planner} tcas={this.tcas} mfdIndex={this.instrument.instrumentIndex} />
      </NavIndicatorContext.Provider>
      , document.getElementById('HSIMap')
    );
    FSComponent.render(<BottomSectionContainer bus={this.bus} version={(this.instrument.isPrimary) ? BottomSectionVersion.ver2 : BottomSectionVersion.ver3}
      planner={this.planner} />,
      document.getElementById('MFDBottomSection'));
    FSComponent.render(<MenuContainer bus={this.bus} />, document.getElementById('MenuSection'));

    this.uprMenuViewService.registerView(
      'MfdUprMenu',
      () =>
        <MfdUprMenu
          viewService={this.uprMenuViewService}
          bus={this.bus}
        />
    );

    this.lwrMenuViewService.registerView(
      'MfdLwrMenu',
      () =>
        <MfdLwrMenu
          viewService={this.lwrMenuViewService}
          bus={this.bus}
        />
    );
    this.lwrMenuViewService.registerView('MfdLwrOverlaysMenu', () => <MfdLwrOverlaysMenu viewService={this.lwrMenuViewService} bus={this.bus} />);
    this.lwrMenuViewService.registerView('MfdLwrMapSymbolsMenu', () => <MfdLwrMapSymbolsMenu viewService={this.lwrMenuViewService} bus={this.bus} />);

    this.bus.pub('mfd_index', this.instrument.instrumentIndex, false, true);

    // initialize onInGame callback
    const instrSub = this.bus.getSubscriber<InstrumentEvents>();
    const onInGameSub = instrSub.on('vc_game_state').whenChanged().handle(state => {
      if (state === GameState.ingame) {
        this.onInGame();
        onInGameSub.destroy();
      }
    }, true);
    onInGameSub.resume(true);

    this.clock.init();
    this.tcas.init();
    WT21ElectricalSetup.initializeAvElectrical(this.eisInstrument.elecPub, this.instrument);
    WT21ElectricalSetup.initializeSystems(this.avionicsSystems, this.bus, this.instrument.xmlConfig);


    // wire dispatch mode visuals
    if (this.instrument.isPrimary) {
      const elecSub = this.bus.getSubscriber<ElectricalEvents>();
      elecSub.on('elec_master_battery').whenChanged().handle((status: boolean): void => {
        this.isMasterBatteryOn = status;
        this.setDispatchMode();
      });
      elecSub.on('elec_av1_bus').whenChanged().handle((status: boolean): void => {
        this.isAv1BusOn = status;
        this.setDispatchMode();
      });

      this.bus.getSubscriber<StallWarningEvents>().on('stall_warning_on')
        .handle(w => SimVar.SetSimVarValue('L:WT21_STALL_WARNING', SimVarValueType.Number, w ? 1 : 0));
    } else {
      this.hsiRef.instance.electricityShow();
      this.textPageContainerRef.instance.electricityShow();
    }

    this.eisInstrument.eisPub.startPublish();
    this.eisInstrument.surfacesPub.startPublish();
    this.eisInstrument.elecPub.startPublish();
    this.eisInstrument.fadecPub.startPublish();
    this.fmcSimVarPublisher.startPublish();
    this.initPrimaryFlightPlan();

    this.auralsConfig = new WT21XmlAuralsConfig(this.instrument, this.xmlLogicHost, this.bus);
  }

  /** @inheritdoc */
  public onFlightStart(): void {
    //noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /**
   * Sets the MFD visuals for Dispatch mode.
   */
  private setDispatchMode(): void {
    const shouldDispatch = this.isMasterBatteryOn && !this.isAv1BusOn;
    this.dispatchModeTimer.clear();
    this.dispatchModeTimer.schedule(() => {
      this.ccpController.setDispatchMode(shouldDispatch);
      if (shouldDispatch) {
        this.casRef.instance.show();
        this.textPageContainerRef.instance.electricityHide();
        this.hsiRef.instance.electricityHide();
      } else {
        this.casRef.instance.hide();
        this.textPageContainerRef.instance.electricityShow();
        this.hsiRef.instance.electricityShow();
      }
    }, this.isAv1BusOn === true ? 100 : 1200);
  }

  /**
   * Callback for when the game state transitions to either briefing or in-game.
   * This can be used as a "last chance" hook to initialize things that need to wait
   * until a plane has loaded and everything is in a stable state.
   */
  protected onInGame(): void {
    this.xmlLogicHost.setIsPaused(false);
  }

  /**
   * A callback called when the instrument gets a frame update.
   */
  public Update(): void {
    this.backplane.onUpdate();
    this.eisInstrument.eisPub.onUpdate();
    this.eisInstrument.surfacesPub.onUpdate();
    this.eisInstrument.elecPub.onUpdate();
    this.eisInstrument.fadecPub.onUpdate();
    // TODO dga: maybe don't do it every frame?
    this.xmlLogicHost.update(this.instrument.deltaTime);
    this.clock.onUpdate();
    // HINT: Updating the AHRSSystem
    this.avionicsSystems[0].onUpdate();
  }

  /**
   * A callback called when the instrument received a H event.
   * @param args The H event and associated arguments, if any.
   */
  public onInteractionEvent(args: string[]): void {
    const handledByUprMenu = this.uprMenuViewService.onInteractionEvent(args[0], this.instrument.instrumentIndex);
    const handledByLwrMenu = this.lwrMenuViewService.onInteractionEvent(args[0], this.instrument.instrumentIndex);
    if (!handledByUprMenu && !handledByLwrMenu) {
      const event = CcpHEvents.mapHEventToCcpEvent(args[0], this.instrument.instrumentIndex);
      if (event) {
        this.ccpEventPublisher.dispatchHEvent(event);
      } else {
        this.hEventPublisher.dispatchHEvent(args[0]);
      }
    }
  }

  /**
   * A callback for when sounds are done playing.  This is needed to support the sound server.
   * @param soundEventId The sound that got played.
   */
  public onSoundEnd(soundEventId: Name_Z): void {
    if (this.soundServer) {
      this.soundServer.onSoundEnd(soundEventId);
    }
  }

  /**
   * Initializes the primary flight plan.
   */
  private async initPrimaryFlightPlan(): Promise<void> {
    // Request a sync from the FMC in case of an instrument reload
    await Wait.awaitDelay(2500);
    this.planner.requestSync();
    // Initialize the primary plan in case one was not synced.
    // if (this.planner.hasFlightPlan(0)) {
    //   return;
    // }

    // this.planner.createFlightPlan(0);
    // this.planner.createFlightPlan(1);
  }
}