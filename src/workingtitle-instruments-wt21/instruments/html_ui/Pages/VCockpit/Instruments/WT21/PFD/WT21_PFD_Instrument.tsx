/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/avionics" />
/// <reference types="@microsoft/msfs-types/js/common" />

import {
  AdcPublisher, AhrsPublisher, AutopilotInstrument, BaseInstrumentPublisher, BasicAvionicsSystem, Clock, ControlPublisher, ControlSurfacesPublisher, DefaultUserSettingManager,
  ElectricalPublisher, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator, FlightPlanner, FSComponent, GNSSPublisher, HEventPublisher,
  InstrumentBackplane, LNavSimVarPublisher, MinimumsEvents, MinimumsManager, MinimumsSimVarPublisher, NavComSimVarPublisher, PluginSystem, SimVarValueType, TrafficInstrument,
  UserSettingSaveManager, VNavSimVarPublisher, Wait, XPDRSimVarPublisher,
} from '@microsoft/msfs-sdk';

import {
  AdfRadioSource, AOASystemEvents, BottomSectionContainer, BottomSectionVersion, DisplayUnitLayout, FmcSimVarPublisher, GpsSource, Gpws, initNavIndicatorContext, MenuContainer,
  NavIndicatorContext, NavIndicators, NavRadioNavSource, NavSources, PerformancePlanRepository, RefsSettings, RefsUserSettings, WT21AvionicsPlugin, WT21BearingPointerNavIndicator,
  WT21CabinLightsSystem, WT21ControlPublisher, WT21CourseNeedleNavIndicator, WT21DisplayUnitFsInstrument, WT21DisplayUnitType, WT21ElectricalSetup, WT21FixInfoConfig,
  WT21FixInfoManager, WT21FmsUtils, WT21GhostNeedleNavIndicator, WT21LNavDataSimVarPublisher, WT21NavIndicator, WT21NavIndicatorName, WT21NavIndicators, WT21NavSourceNames,
  WT21NavSources, WT21PluginBinder, WT21SettingSaveManager, WT21TCAS, WT21TCASTransponderManager, DcpController, DcpEvent, DcpEventPublisher, DcpHEvents, ElapsedTime, DcpEvents,
} from '@microsoft/msfs-wt21-shared';

import { WT21PfdConfigBuilder, WT21PfdConfigInterface } from './WT21PfdConfigBuilder';
import { MinimumsAlertController } from './Components/FlightInstruments/MinimumsAlertController';
import { UpperSectionContainer } from './Components/FlightInstruments/UpperSectionContainer';
import { LowerSectionContainer } from './Components/LowerSection/LowerSectionContainer';
import { PfdBaroSetMenu } from './Menus/PfdBaroSetMenu';
import { PfdBrgSrcMenu } from './Menus/PfdBrgSrcMenu';
import { PfdConfigMenu } from './Menus/PfdConfigMenu';
import { PfdMenu } from './Menus/PfdMenu';
import { PfdMenuViewService } from './Menus/PfdMenuViewService';
import { PfdOverlaysMenu } from './Menus/PfdOverlaysMenu';
import { PfdRefsMenu } from './Menus/PfdRefsMenu';
import { PfdSideButtonsNavBrgSrcMenu } from './Menus/PfdSideButtonsNavBrgSrcMenu';
import { PfdSideButtonsRefs1Menu } from './Menus/PfdSideButtonsRefs1Menu';
import { PfdSideButtonsRefs2Menu } from './Menus/PfdSideButtonsRefs2Menu';

import './WT21_PFD.css';

/**
 * The WT21 PFD Instrument
 */
export class WT21_PFD_Instrument extends WT21DisplayUnitFsInstrument {
  private readonly bus: EventBus;
  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly hEventPublisher: HEventPublisher;
  private readonly adcPublisher: AdcPublisher;
  private readonly ahrsPublisher: AhrsPublisher;
  private readonly gnssPublisher: GNSSPublisher;
  private readonly electricalPublisher: ElectricalPublisher;
  private readonly cfPublisher: ControlSurfacesPublisher;
  private readonly backplane: InstrumentBackplane;
  private readonly apInstrument: AutopilotInstrument;
  private readonly trafficInstrument: TrafficInstrument;
  private readonly lNavSimVarPublisher: LNavSimVarPublisher;
  private readonly lNavDataSimVarPublisher: WT21LNavDataSimVarPublisher;
  private readonly vNavSimVarPublisher: VNavSimVarPublisher;
  private readonly xpdrSimVarPublisher: XPDRSimVarPublisher;
  private readonly facLoader: FacilityLoader;
  private readonly calculator: FlightPathCalculator;
  private readonly planner: FlightPlanner;
  private readonly clock: Clock;
  private readonly dcpEventPublisher: DcpEventPublisher;
  private readonly controlPublisher: ControlPublisher;
  private readonly wt21ControlPublisher: WT21ControlPublisher;
  private readonly navSources: WT21NavSources;
  private readonly navIndicators: WT21NavIndicators;
  private readonly navComSimVarPublisher: NavComSimVarPublisher;
  private readonly dcpController: DcpController;
  private readonly elapsedTime: ElapsedTime;
  private readonly refsSettings: DefaultUserSettingManager<RefsSettings>;
  private readonly settingSaveManager: UserSettingSaveManager;
  private readonly pfdMenuViewService: PfdMenuViewService;
  private readonly fmcSimVarPublisher: FmcSimVarPublisher;
  private readonly minimumsPublisher: MinimumsSimVarPublisher;
  private readonly cabinLightsSystemInstrument: WT21CabinLightsSystem;
  private readonly minimumsManager: MinimumsManager;
  private readonly minimumsAlertController: MinimumsAlertController;
  private readonly tcas: WT21TCAS;
  private readonly gpws: Gpws;
  private readonly tcasTransponderManager: WT21TCASTransponderManager;
  private readonly perfPlanRepository: PerformancePlanRepository;
  // private readonly wt21Watson = new WT21Watson();
  private readonly avionicsSystems: BasicAvionicsSystem<any>[] = [];
  private readonly fixInfoManager: WT21FixInfoManager;

  private readonly pluginSystem = new PluginSystem<WT21AvionicsPlugin, WT21PluginBinder>();

  private readonly pfdConfig: WT21PfdConfigInterface;

  /**
   * Creates an instance of the WT21_PFD.
   * @param instrument The base instrument.
   */
  constructor(readonly instrument: BaseInstrument) {
    super(instrument, WT21DisplayUnitType.Pfd, 1); // TODO if we add support for multiple PFDs, adapt this

    SimVar.SetSimVarValue('L:WT21_BETA_VERSION', 'number', 15);

    RegisterViewListener('JS_LISTENER_INSTRUMENTS');

    this.bus = new EventBus();

    // TODO: Support pilot profiles.

    this.refsSettings = RefsUserSettings.getManager(this.bus);
    // Loading the settings should be the first thing that we do after creating the bus
    this.settingSaveManager = new WT21SettingSaveManager(this.bus);
    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
    this.settingSaveManager.load(saveKey);
    this.settingSaveManager.startAutoSave(saveKey);

    this.backplane = new InstrumentBackplane();

    this.baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
    this.backplane.addPublisher('base', this.baseInstrumentPublisher);

    this.adcPublisher = new AdcPublisher(this.bus);
    this.backplane.addPublisher('adc', this.adcPublisher);

    this.ahrsPublisher = new AhrsPublisher(this.bus);
    this.backplane.addPublisher('ahrs', this.ahrsPublisher);

    this.hEventPublisher = new HEventPublisher(this.bus);
    this.backplane.addPublisher('hEvents', this.hEventPublisher);

    this.gnssPublisher = new GNSSPublisher(this.bus);
    this.backplane.addPublisher('gnss', this.gnssPublisher);

    this.cfPublisher = new ControlSurfacesPublisher(this.bus, 3);
    this.backplane.addPublisher('cf', this.cfPublisher);

    this.apInstrument = new AutopilotInstrument(this.bus);
    this.backplane.addInstrument('ap', this.apInstrument);

    this.lNavSimVarPublisher = new LNavSimVarPublisher(this.bus);
    this.backplane.addPublisher('lnav', this.lNavSimVarPublisher);

    this.lNavDataSimVarPublisher = new WT21LNavDataSimVarPublisher(this.bus);
    this.backplane.addPublisher('lnavdata', this.lNavDataSimVarPublisher);

    this.vNavSimVarPublisher = new VNavSimVarPublisher(this.bus);
    this.backplane.addPublisher('vnav', this.vNavSimVarPublisher);

    this.xpdrSimVarPublisher = new XPDRSimVarPublisher(this.bus);
    this.backplane.addPublisher('xpdr', this.xpdrSimVarPublisher);

    this.electricalPublisher = new ElectricalPublisher(this.bus);
    this.backplane.addPublisher('electrical', this.electricalPublisher);

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

    this.clock = new Clock(this.bus);

    this.dcpEventPublisher = new DcpEventPublisher(this.bus);
    this.backplane.addPublisher('dcpEvents', this.dcpEventPublisher);

    this.dcpController = new DcpController(this.bus);
    this.elapsedTime = new ElapsedTime(this.bus);

    this.controlPublisher = new ControlPublisher(this.bus);
    this.backplane.addPublisher('control', this.controlPublisher);

    this.wt21ControlPublisher = new WT21ControlPublisher(this.bus);
    this.backplane.addPublisher('wt21control', this.wt21ControlPublisher);

    this.navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
    this.backplane.addPublisher('navCom', this.navComSimVarPublisher);

    this.fmcSimVarPublisher = new FmcSimVarPublisher(this.bus);
    this.backplane.addPublisher('fmc', this.fmcSimVarPublisher);

    this.minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
    this.backplane.addPublisher('minimums', this.minimumsPublisher);

    this.cabinLightsSystemInstrument = new WT21CabinLightsSystem(this.bus);
    this.backplane.addInstrument('cabinlights', this.cabinLightsSystemInstrument);

    this.minimumsManager = new MinimumsManager(this.bus);

    this.gpws = new Gpws(this.bus, this.facLoader);
    this.gpws.init();

    this.navSources = new NavSources<WT21NavSourceNames>(
      new NavRadioNavSource<WT21NavSourceNames>(this.bus, 'NAV1', 1),
      new NavRadioNavSource<WT21NavSourceNames>(this.bus, 'NAV2', 2),
      new AdfRadioSource<WT21NavSourceNames>(this.bus, 'ADF', 1),
      new GpsSource<WT21NavSourceNames>(this.bus, 'FMS1', 1, this.planner),
      new GpsSource<WT21NavSourceNames>(this.bus, 'FMS2', 2, this.planner),
    );
    this.backplane.addInstrument('navSources', this.navSources);

    const courseNeedleNavIndicator = new WT21CourseNeedleNavIndicator(this.navSources, this, this.bus);

    this.navIndicators = new NavIndicators(new Map<WT21NavIndicatorName, WT21NavIndicator>([
      ['courseNeedle', courseNeedleNavIndicator],
      ['ghostNeedle', new WT21GhostNeedleNavIndicator(this.navSources, this.bus)],
      ['bearingPointer1', new WT21BearingPointerNavIndicator(this.navSources, this.bus, 1, 'NAV1')],
      ['bearingPointer2', new WT21BearingPointerNavIndicator(this.navSources, this.bus, 2, 'NAV2')],
    ]));
    this.backplane.addInstrument('navIndicators', this.navIndicators);

    this.trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
    this.backplane.addInstrument('traffic', this.trafficInstrument);

    this.tcas = new WT21TCAS(this.bus, this.trafficInstrument);
    this.perfPlanRepository = new PerformancePlanRepository(this.planner, this.bus);
    this.tcasTransponderManager = new WT21TCASTransponderManager(this.bus);

    this.minimumsAlertController = new MinimumsAlertController(this.bus);

    this.pfdMenuViewService = new PfdMenuViewService(this.bus, this.displayUnitConfig, courseNeedleNavIndicator);

    // FIXME Add route predictor when FlightPlanPredictor refactored to implement FlightPlanPredictionsProvider
    this.fixInfoManager = new WT21FixInfoManager(this.bus, this.facLoader, WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX, this.planner, WT21FixInfoConfig /*, this.activeRoutePredictor*/);

    this.initPluginSystem().then(() => {
      this.backplane.init();
      this.doRenderComponents();
      this.doRegisterMenus();
    });

    // TODO Remove once pfd menu is implemented
    // Sets bearing pointer 1 to nav 1
    this.controlPublisher.publishEvent('brg_src_switch', 1);
    // Sets bearing pointer 2 to nav 1
    this.controlPublisher.publishEvent('brg_src_switch', 2);
    // Sets bearing pointer 2 to nav 2
    this.controlPublisher.publishEvent('brg_src_switch', 2);

    // Sync minimums with settings
    const minsPub = this.bus.getPublisher<MinimumsEvents>();

    minsPub.pub('set_minimums_mode', this.refsSettings.getSetting('minsmode').value);
    minsPub.pub('set_decision_height_feet', this.refsSettings.getSetting('radiomins').value);
    minsPub.pub('set_decision_altitude_feet', this.refsSettings.getSetting('baromins').value);

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    initNavIndicatorContext(this.navIndicators);

    SimVar.SetSimVarValue('L:AS3000_Brightness', 'number', 0.85);
    this.clock.init();
    this.tcasTransponderManager.init();
    this.tcas.init();
    this.initPrimaryFlightPlan();
    WT21ElectricalSetup.initializeAvElectrical(this.electricalPublisher, this.instrument);
    WT21ElectricalSetup.initializeSystems(this.avionicsSystems, this.bus, this.instrument.xmlConfig);

    this.setupAoaLvarPublish();

    // TODO move this somewhere else
    const dcpEvents = this.bus.getSubscriber<DcpEvents>();
    dcpEvents.on('dcpEvent').handle((event: DcpEvent): void => {
      switch (event) {
        case DcpEvent.DCP_NAV:
          if (this.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys) {
            return;
          }

          (this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator).navSwap();
          break;
        case DcpEvent.DCP_DATA_INC:
          (this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator).presetIncrease();
          break;
        case DcpEvent.DCP_DATA_DEC:
          (this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator).presetDecrease();
          break;
      }
    });

    this.pfdConfig = this.buildConfig();
  }

  /**
   * Builds the PFD config object from panel.xml.
   * @returns The PFD config object.
   */
  private buildConfig(): WT21PfdConfigInterface {
    const instrumentConfigElems = this.instrument.xmlConfig.getElementsByTagName('Instrument');
    const thisInstrumentConfigElem: Element | undefined = Array.from(instrumentConfigElems)
      .find(elem => Array.from(elem.children).some(child =>
        child.tagName === 'Name' && child.textContent === `${this.instrument.templateID}_${this.instrument.instrumentIndex}`));

    return new WT21PfdConfigBuilder(thisInstrumentConfigElem ?? <></>, this.instrument).getConfig();
  }

  /**
   * Registers the menus.
   */
  private doRegisterMenus(): void {
    this.pfdMenuViewService.registerView(
      'PfdMenu',
      () => <PfdMenu
        viewService={this.pfdMenuViewService}
        bus={this.bus}
        courseNeedle={this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator} />
    );
    this.pfdMenuViewService.registerView(
      'BrgSrcMenu',
      () => <PfdBrgSrcMenu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        bearingPointerIndicator1={this.navIndicators.get('bearingPointer1')}
        bearingPointerIndicator2={this.navIndicators.get('bearingPointer2')}
        nav1Source={this.navSources.get('NAV1')}
        nav2Source={this.navSources.get('NAV2')}
        adfSource={this.navSources.get('ADF')} />
    );
    this.pfdMenuViewService.registerView('PfdConfigMenu', () => <PfdConfigMenu viewService={this.pfdMenuViewService} bus={this.bus} />);
    this.pfdMenuViewService.registerView('PfdRefsMenu', () => <PfdRefsMenu viewService={this.pfdMenuViewService} bus={this.bus} planner={this.planner} />);
    this.pfdMenuViewService.registerView('PfdOverlaysMenu', () => <PfdOverlaysMenu viewService={this.pfdMenuViewService} bus={this.bus} />);
    this.pfdMenuViewService.registerView('PfdBaroSetMenu', () => <PfdBaroSetMenu viewService={this.pfdMenuViewService} bus={this.bus} />);
    this.pfdMenuViewService.registerView(
      'PfdSideButtonsNavBrgSrcMenu',
      () => <PfdSideButtonsNavBrgSrcMenu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        bearingPointerIndicator1={this.navIndicators.get('bearingPointer1')}
        bearingPointerIndicator2={this.navIndicators.get('bearingPointer2')}
        nav1Source={this.navSources.get('NAV1')}
        nav2Source={this.navSources.get('NAV2')}
        adfSource={this.navSources.get('ADF')}
        courseNeedle={this.navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator} />
    );
    this.pfdMenuViewService.registerView(
      'PfdSideButtonsRefs1Menu',
      () => <PfdSideButtonsRefs1Menu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        planner={this.planner} />
    );
    this.pfdMenuViewService.registerView(
      'PfdSideButtonsRefs2Menu',
      () => <PfdSideButtonsRefs2Menu
        bus={this.bus}
        viewService={this.pfdMenuViewService}
        planner={this.planner} />
    );
  }

  /**
   * Renders the components.
   */
  private doRenderComponents(): void {
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <UpperSectionContainer
          bus={this.bus}
          planner={this.planner}
          performancePlan={this.perfPlanRepository.getActivePlan()}
          pfdConfig={this.pfdConfig}
        />
      </NavIndicatorContext.Provider>,
      document.getElementById('UpperSection')
    );
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <LowerSectionContainer
          bus={this.bus}
          displayUnit={this}
          elapsedTime={this.elapsedTime}
          activeMenu={this.pfdMenuViewService.activeView}
          flightPlanner={this.planner}
          tcas={this.tcas}
          mfdIndex={0}
          fixInfo={this.fixInfoManager}
          performancePlan={this.perfPlanRepository.getActivePlan()} />
      </NavIndicatorContext.Provider>,
      document.getElementById('LowerSection')
    );
    FSComponent.render(
      <NavIndicatorContext.Provider value={this.navIndicators}>
        <BottomSectionContainer bus={this.bus} version={BottomSectionVersion.ver1} />
      </NavIndicatorContext.Provider>,
      document.getElementById('BottomSection')
    );
    FSComponent.render(<MenuContainer bus={this.bus} />, document.getElementById('MenuSection'));
  }

  /**
   * Initializes the plugin system.
   * @returns A promise that resolves when the plugin system is initialized.
   */
  private async initPluginSystem(): Promise<void> {
    await this.pluginSystem.addScripts(this.instrument.xmlConfig, `${this.instrument.templateID}_${this.instrument.instrumentIndex}`, (target) => {
      return target === this.instrument.templateID;
    });

    const pluginBinder: WT21PluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      flightPlanner: this.planner,
      isPrimaryInstrument: this.instrument.isPrimary,
    };

    return this.pluginSystem.startSystem(pluginBinder);
  }

  /** @inheritdoc */
  public onInteractionEvent(_args: Array<string>): void {
    const handledByMenu = this.pfdMenuViewService.onInteractionEvent(_args[0]);
    if (!handledByMenu) {
      try {
        const event = DcpHEvents.mapHEventToDcpEvent(_args[0]);
        if (event) {
          this.dcpEventPublisher.dispatchHEvent(event);
        } else {
          this.hEventPublisher.dispatchHEvent(_args[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  /** @inheritdoc */
  public Update(): void {
    this.backplane.onUpdate();
    // HINT: Updating the AHRSSystem
    this.avionicsSystems[0].onUpdate();
    this.clock.onUpdate();
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    //noop
  }

  /**
   * Initializes the primary flight plan.
   */
  private async initPrimaryFlightPlan(): Promise<void> {
    // Request a sync from the FMC in case of an instrument reload
    await Wait.awaitDelay(2500);
    this.planner.requestSync();
    // // Initialize the primary plan in case one was not synced.
    // if (this.planner.hasFlightPlan(0)) {
    //   return;
    // }

    // this.planner.createFlightPlan(0);
    // this.planner.createFlightPlan(1);
  }


  /**
   * Method to subscribe to aoasys_aoa_pct and write the LVAR for the glareshield AOA indicator.
   */
  private setupAoaLvarPublish(): void {
    this.bus.getSubscriber<AOASystemEvents>().on('aoasys_aoa_pct').withPrecision(2).handle(v => {
      SimVar.SetSimVarValue('L:WT21_AOA_PCT', SimVarValueType.Number, v);
    });
  }

}
