/* eslint-disable max-len */
// TODO:  Remove the above disable whenever all the verbose commented out code put in place for flight plan
// debugging has been removed for good, so we have proper line length checking.
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />

import {
  AdcPublisher, AltitudeSelectManagerAccelFilter, APRadioNavInstrument, AutopilotInstrument, AvionicsSystem, BaseInstrumentPublisher, Clock, ClockEvents,
  CompositeLogicXMLHost, ControlPublisher, EISPublisher, ElectricalPublisher, EventBus, EventSubscriber, FacilityLoader, FacilityRepository,
  FlightPathAirplaneSpeedMode, FlightPathCalculator, FlightPlanner, FSComponent, GameStateProvider, GNSSPublisher, GpsSynchronizer, HEvent, HEventPublisher,
  InstrumentBackplane, InstrumentEvents, LNavSimVarPublisher, MinimumsManager, MinimumsSimVarPublisher, NavComSimVarPublisher, NavEvents, NavSourceType,
  PluginSystem, SimVarValueType, SmoothingPathCalculator, TrafficInstrument, UserSettingSaveManager, VNavSimVarPublisher, VNode, Wait, XMLGaugeConfigFactory
} from '@microsoft/msfs-sdk';

import {
  ActiveNavSource, AdcSystem, DateTimeUserSettings, Fms, GarminAdsb, GarminAPConfig, GarminAPStateManager, GarminGoAroundManager, GarminNavEvents,
  GarminVNavUtils, LNavDataSimVarPublisher, NavdataComputer, TrafficAdvisorySystem, TrafficOperatingModeManager, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { PFDUserSettings } from '../PFD/PFDUserSettings';
import { G1000Autopilot } from '../Shared/Autopilot/G1000Autopilot';
import { BacklightManager } from '../Shared/Backlight/BacklightManager';
import { FuelComputer } from '../Shared/FuelComputer';
import { G1000ControlPublisher } from '../Shared/G1000Events';
import { G1000AvionicsPlugin, G1000PluginBinder } from '../Shared/G1000Plugin';
import { AltimeterBaroKeyEventHandler } from '../Shared/Input/AltimeterBaroKeyEventHandler';
import { AhrsPublisher } from '../Shared/Instruments/AhrsPublisher';
import { G1000APPublisher } from '../Shared/Instruments/G1000APPublisher';
import { NavComRadio } from '../Shared/NavCom/NavComRadio';
import { ActiveNavSourceManager } from '../Shared/Navigation/ActiveNavSourceManager';
import { G1000AirframeOptionsManager } from '../Shared/Profiles/G1000AirframeOptionsManager';
import { G1000SettingSaveManager } from '../Shared/Profiles/G1000SettingSaveManager';
import { StartupLogo } from '../Shared/StartupLogo';
import {
  ADCAvionicsSystem, AHRSSystem, AvionicsComputerSystem, EngineAirframeSystem, G1000AvionicsSystem, MagnetometerSystem, TransponderSystem
} from '../Shared/Systems';
import { ControlpadInputController, ControlpadTargetInstrument } from '../Shared/UI/Controllers/ControlpadInputController';
import { ContextMenuDialog } from '../Shared/UI/Dialogs/ContextMenuDialog';
import { MessageDialog } from '../Shared/UI/Dialogs/MessageDialog';
import { EngineMenu } from '../Shared/UI/Menus/MFD/EngineMenu';
import { FuelRemMenu } from '../Shared/UI/Menus/MFD/FuelRemMenu';
import { InsetMenu } from '../Shared/UI/Menus/MFD/InsetMenu';
import { LeanMenu } from '../Shared/UI/Menus/MFD/LeanMenu';
import { MapOptMenu } from '../Shared/UI/Menus/MFD/MapOptMenu';
import { MFDFPLRootMenu } from '../Shared/UI/Menus/MFD/MFDFPLRootMenu';
import { MFDNavMapRootMenu } from '../Shared/UI/Menus/MFD/MFDNavMapRootMenu';
import { MFDNearestAirportRootMenu } from '../Shared/UI/Menus/MFD/MFDNearestAirportRootMenu';
import { MFDNearestVorRootMenu } from '../Shared/UI/Menus/MFD/MFDNearestVorRootMenu';
import { MFDSelectProcedureRootMenu } from '../Shared/UI/Menus/MFD/MFDSelectProcedureRootMenu';
import { MFDSystemSetupRootMenu } from '../Shared/UI/Menus/MFD/MFDSystemSetupRootMenu';
import { SystemMenu } from '../Shared/UI/Menus/MFD/SystemMenu';
import { SoftKeyMenu } from '../Shared/UI/Menus/SoftKeyMenu';
import { SoftKeyMenuSystem } from '../Shared/UI/Menus/SoftKeyMenuSystem';
import { SoftKeyBar } from '../Shared/UI/SoftKeyBar';
import { WaypointIconImageCache } from '../Shared/WaypointIconImageCache';
import { WeatherRadarController } from '../Shared/WeatherRadar/WeatherRadarController';
import { EIS } from './Components/EIS';
import { MFDSelectAirway } from './Components/UI/Airway/MFDSelectAirway';
import { MFDDirectTo } from './Components/UI/DirectTo/MFDDirectTo';
import { MFDFPLPage } from './Components/UI/FPL/MFDFPLPage';
import { MFDHold } from './Components/UI/Hold/MFDHold';
import { MFDAirportInformationPage } from './Components/UI/Information/Airport/MFDAirportInformationPage';
import { MFDIntersectionInformationPage } from './Components/UI/Information/Intersection/MFDIntersectionInformationPage';
import { MFDNdbInformationPage } from './Components/UI/Information/NDB/MFDNdbInformationPage';
import { MFDVorInformationPage } from './Components/UI/Information/VOR/MFDVorInformationPage';
import { MFDMapSettings } from './Components/UI/MapSettings/MFDMapSettings';
import { MFDPageMenuDialog } from './Components/UI/MFDPageMenuDialog';
import { MFDPageSelect, PageSelectMenuSystem } from './Components/UI/MFDPageSelect';
import { MFDViewService } from './Components/UI/MFDViewService';
import { MFDNavDataBar } from './Components/UI/NavDataBar/MFDNavDataBar';
import { MFDNavDataBarUserSettings } from './Components/UI/NavDataBar/MFDNavDataBarUserSettings';
import { MFDNavMapPage } from './Components/UI/NavMap/MFDNavMapPage';
import { MFDNearestAirportsPage } from './Components/UI/Nearest/MFDNearestAirportsPage';
import { MFDNearestIntersectionsPage } from './Components/UI/Nearest/MFDNearestIntersectionsPage';
import { MFDNearestNdbsPage } from './Components/UI/Nearest/MFDNearestNDBsPage';
import { MFDNearestVorsPage } from './Components/UI/Nearest/MFDNearestVORsPage';
import { MFDProc } from './Components/UI/Procedure/MFDProc';
import { MFDSelectProcedurePage } from './Components/UI/Procedure/MFDSelectProcedurePage';
import { MFDSetRunway } from './Components/UI/SetRunway/MFDSetRunway';
import { MFDSystemSetupPage } from './Components/UI/SystemSetup/MFDSystemSetupPage';
import { MFDTrafficMapAltitudeMenu } from './Components/UI/Traffic/MFDTrafficMapAltitudeMenu';
import { MFDTrafficMapMotionDurationMenu } from './Components/UI/Traffic/MFDTrafficMapMotionDurationMenu';
import { MFDTrafficMapMotionMenu } from './Components/UI/Traffic/MFDTrafficMapMotionMenu';
import { MFDTrafficMapPage } from './Components/UI/Traffic/MFDTrafficMapPage';
import { MFDTrafficMapRootMenu } from './Components/UI/Traffic/MFDTrafficMapRootMenu';
import { MFDWeatherRadarModeMenu } from './Components/UI/WeatherRadar/MFDWeatherRadarModeMenu';
import { MFDWeatherRadarPage } from './Components/UI/WeatherRadar/MFDWeatherRadarPage';
import { MFDWeatherRadarRootMenu } from './Components/UI/WeatherRadar/MFDWeatherRadarRootMenu';
import { MFDWptDupDialog } from './Components/UI/WptDup/MFDWptDupDialog';
import { MFDWptInfo } from './Components/UI/WptInfo/MFDWptInfo';

// import { TurbulenceGraph } from './Components/UI/TurbulenceGraph';
import '../Shared/UI/Common/g1k_common.css';
import './WTG1000_MFD.css';
import '../Shared/UI/Common/LatLonDisplay.css';

/**
 * The base G1000 MFD instrument class.
 */
class WTG1000_MFD extends BaseInstrument {
  private readonly bus: EventBus;

  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly gnss: GNSSPublisher;
  private readonly adc: AdcPublisher;
  private readonly ahrsPublisher: AhrsPublisher;
  private readonly eis: EISPublisher;
  private readonly hEventPublisher: HEventPublisher;
  private readonly g1000ControlPublisher: G1000ControlPublisher;
  private readonly controlPublisher: ControlPublisher;
  private readonly electricalPublisher: ElectricalPublisher;
  private readonly navComSimVarPublisher: NavComSimVarPublisher;

  private readonly lNavPublisher: LNavSimVarPublisher;
  private readonly lNavDataPublisher: LNavDataSimVarPublisher;
  private readonly vNavPublisher: VNavSimVarPublisher;
  private fms!: Fms;

  private readonly apInstrument: AutopilotInstrument;
  private readonly g1000ApPublisher: G1000APPublisher;
  private readonly apRadioNav: APRadioNavInstrument;
  private readonly trafficInstrument: TrafficInstrument;
  private readonly clock: Clock;

  private readonly backplane: InstrumentBackplane;
  private readonly xmlLogicHost: CompositeLogicXMLHost;
  private readonly loader: FacilityLoader;
  private readonly calculator: FlightPathCalculator;
  private readonly planner: FlightPlanner;
  private readonly heventSub: EventSubscriber<HEvent>;
  private readonly gaugeFactory: XMLGaugeConfigFactory;
  private readonly minimumsPublisher: MinimumsSimVarPublisher;
  private readonly minimumsManager: MinimumsManager;
  private readonly airframeOptions: G1000AirframeOptionsManager;

  private readonly activeNavSourceManager: ActiveNavSourceManager;

  private readonly altimeterBaroKeyEventHandler: AltimeterBaroKeyEventHandler;

  private verticalPathCalculator!: SmoothingPathCalculator;
  private autopilot!: G1000Autopilot;

  private viewService: MFDViewService;

  private readonly navdataComputer: NavdataComputer;
  private readonly gpsSynchronizer: GpsSynchronizer;

  private lastCalculate = 0;

  private readonly tas: TrafficAdvisorySystem;
  private readonly trafficOperatingModeManager: TrafficOperatingModeManager;

  private readonly backlightManager: BacklightManager;

  private readonly settingSaveManager: UserSettingSaveManager;
  private readonly fuelComputer: FuelComputer;

  private readonly g1000Systems: G1000AvionicsSystem[] = [];
  private readonly systems: AvionicsSystem[] = [];

  private readonly pluginSystem = new PluginSystem<G1000AvionicsPlugin, G1000PluginBinder>();

  private readonly comRadio = FSComponent.createRef<NavComRadio>();
  private readonly navRadio = FSComponent.createRef<NavComRadio>();
  private controlPadHandler: ControlpadInputController;

  private goAroundManager?: GarminGoAroundManager;

  /**
   * Creates an instance of the WTG1000_MFD.
   */
  constructor() {
    super();
    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    WaypointIconImageCache.init();

    this.bus = new EventBus();

    this.baseInstrumentPublisher = new BaseInstrumentPublisher(this, this.bus);

    this.gnss = new GNSSPublisher(this.bus);
    this.adc = new AdcPublisher(this.bus);
    this.ahrsPublisher = new AhrsPublisher(this.bus);
    this.controlPublisher = new ControlPublisher(this.bus);

    this.eis = new EISPublisher(this.bus);
    this.electricalPublisher = new ElectricalPublisher(this.bus);
    this.lNavPublisher = new LNavSimVarPublisher(this.bus);
    this.lNavDataPublisher = new LNavDataSimVarPublisher(this.bus);
    this.vNavPublisher = new VNavSimVarPublisher(this.bus);
    this.apRadioNav = new APRadioNavInstrument(this.bus);
    this.navComSimVarPublisher = new NavComSimVarPublisher(this.bus);

    this.hEventPublisher = new HEventPublisher(this.bus);
    this.g1000ControlPublisher = new G1000ControlPublisher(this.bus);
    this.controlPublisher = new ControlPublisher(this.bus);
    this.apInstrument = new AutopilotInstrument(this.bus);
    this.trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
    this.g1000ApPublisher = new G1000APPublisher(this.bus);

    this.minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
    this.minimumsManager = new MinimumsManager(this.bus);

    this.activeNavSourceManager = new ActiveNavSourceManager(this.bus);
    this.activeNavSourceManager.init();

    this.altimeterBaroKeyEventHandler = new AltimeterBaroKeyEventHandler(this.bus);
    this.altimeterBaroKeyEventHandler.init();

    this.clock = new Clock(this.bus);
    this.fuelComputer = new FuelComputer(this.bus);

    this.backplane = new InstrumentBackplane();
    this.backplane.addPublisher('base', this.baseInstrumentPublisher);
    this.backplane.addPublisher('adc', this.adc);
    this.backplane.addPublisher('ahrs', this.ahrsPublisher);
    this.backplane.addPublisher('hEvents', this.hEventPublisher);
    this.backplane.addPublisher('gnss', this.gnss);
    this.backplane.addPublisher('eis', this.eis);
    this.backplane.addPublisher('control', this.controlPublisher);
    this.backplane.addPublisher('g1000Control', this.g1000ControlPublisher);
    this.backplane.addPublisher('lnav', this.lNavPublisher);
    this.backplane.addPublisher('lnavdata', this.lNavDataPublisher);
    this.backplane.addPublisher('vnav', this.vNavPublisher);
    this.backplane.addPublisher('electrical', this.electricalPublisher);
    this.backplane.addPublisher('navComSimVar', this.navComSimVarPublisher);
    this.backplane.addPublisher('minimums', this.minimumsPublisher);
    this.backplane.addPublisher('g1000ap', this.g1000ApPublisher);

    this.backplane.addInstrument('ap', this.apInstrument);
    this.backplane.addInstrument('apRadioNav', this.apRadioNav);
    this.backplane.addInstrument('fuelComputer', this.fuelComputer);
    this.backplane.addInstrument('traffic', this.trafficInstrument);

    this.viewService = new MFDViewService(this.bus);

    this.loader = new FacilityLoader(FacilityRepository.getRepository(this.bus));
    this.calculator = new FlightPathCalculator(this.loader, {
      defaultClimbRate: 300,
      defaultSpeed: 60,
      bankAngle: [[10, 60], [25, 180]],
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: [[10, 60], [15, 100]],
      maxBankAngle: 25,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind
    }, this.bus);
    this.planner = FlightPlanner.getPlanner(this.bus, this.calculator);
    this.gpsSynchronizer = new GpsSynchronizer(this.bus, this.planner, this.loader);

    (window as any)['planner'] = this.planner;
    (window as any)['calculator'] = this.calculator;

    this.heventSub = this.bus.getSubscriber<HEvent>();
    this.xmlLogicHost = new CompositeLogicXMLHost();

    this.gaugeFactory = new XMLGaugeConfigFactory(this, this.bus);

    this.airframeOptions = new G1000AirframeOptionsManager(this, this.bus);

    this.navdataComputer = new NavdataComputer(this.bus, this.planner, this.loader);

    this.tas = new TrafficAdvisorySystem(this.bus, this.trafficInstrument, new GarminAdsb(this.bus), false);
    this.trafficOperatingModeManager = new TrafficOperatingModeManager(this.bus);

    this.backlightManager = new BacklightManager('mfd', this.bus);

    // TODO: Support pilot profiles.
    this.settingSaveManager = new G1000SettingSaveManager(this.bus);
    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
    this.settingSaveManager.load(saveKey);
    this.settingSaveManager.startAutoSave(saveKey);

    this.initDuration = 3000;
    this.needValidationAfterInit = true;

    this.controlPadHandler = new ControlpadInputController(this.bus, ControlpadTargetInstrument.MFD);
  }

  /**
   * The instrument template ID.
   * @returns The instrument template ID.
   */
  get templateID(): string {
    return 'AS1000_MFD';
  }

  /**
   * Whether or not the instrument is interactive (a touchscreen instrument).
   * @returns True
   */
  get isInteractive(): boolean {
    return true;
  }

  /**
   * A callback called when the element has connection to the DOM.
   */
  public connectedCallback(): void {
    super.connectedCallback();
    this.airframeOptions.parseConfig();

    // The NXi does not support FMS-managed speed.
    SimVar.SetSimVarValue('L:XMLVAR_SpeedIsManuallySet', SimVarValueType.Bool, 1);

    this.verticalPathCalculator = new SmoothingPathCalculator(this.bus, this.planner, 0, {
      defaultFpa: 3,
      maxFpa: 6,
      isLegEligible: GarminVNavUtils.isLegVNavEligible,
      shouldUseConstraint: GarminVNavUtils.shouldUseConstraint,
      invalidateClimbConstraint: GarminVNavUtils.invalidateClimbConstraint,
      invalidateDescentConstraint: GarminVNavUtils.invalidateDescentConstraint
    });

    const apConfig = new GarminAPConfig(this.bus, this.planner, this.verticalPathCalculator, {
      rollMinBankAngle: this.airframeOptions.autopilotConfig.rollOptions.minBankAngle,
      rollMaxBankAngle: this.airframeOptions.autopilotConfig.rollOptions.maxBankAngle,
      hdgMaxBankAngle: this.airframeOptions.autopilotConfig.hdgOptions.maxBankAngle,
      vorMaxBankAngle: this.airframeOptions.autopilotConfig.vorOptions.maxBankAngle,
      locMaxBankAngle: this.airframeOptions.autopilotConfig.locOptions.maxBankAngle,
      lnavMaxBankAngle: this.airframeOptions.autopilotConfig.lnavOptions.maxBankAngle,
      lowBankAngle: this.airframeOptions.autopilotConfig.lowBankOptions.maxBankAngle,
    });
    this.autopilot = new G1000Autopilot(
      this.bus, this.planner,
      apConfig,
      new GarminAPStateManager(this.bus, apConfig),
      {
        metricAltSettingsManager: PFDUserSettings.getManager(this.bus),
        altSelectOptions: {
          accelInputCountThreshold: 11,
          accelResetOnDirectionChange: true,
          accelFilter: AltitudeSelectManagerAccelFilter.ZeroIncDec,
          transformSetToIncDec: this.airframeOptions.autopilotConfig.supportAltSelCompatibility
        }
      }
    );

    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame).then(() => {
      this.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(() => {
        this.autopilot.update();
      });
    });

    this.fms = new Fms(true, this.bus, this.planner, this.verticalPathCalculator);
    this.goAroundManager = new GarminGoAroundManager(this.bus, this.fms);

    const softKeyMenuSystem = new SoftKeyMenuSystem(this.bus, 'AS1000_MFD_SOFTKEYS_');
    const rotaryMenuSystem = new PageSelectMenuSystem();

    //// BEGIN CURRENT
    const gaugeConfig = this.airframeOptions.gaugeConfig;

    this.pluginSystem.addScripts(this.xmlConfig, this.templateID, (target) => {
      return target === this.templateID;
    }).then(() => {
      this.pluginSystem.startSystem({
        bus: this.bus, backplane: this.backplane, fms: this.fms, viewService: this.viewService,
        menuSystem: softKeyMenuSystem, pageSelectMenuSystem: rotaryMenuSystem
      }).then(() => {
        softKeyMenuSystem.addMenu('empty', new SoftKeyMenu(softKeyMenuSystem));
        softKeyMenuSystem.addMenu('navmap-root', new MFDNavMapRootMenu(softKeyMenuSystem));

        softKeyMenuSystem.addMenu('map-opt', new MapOptMenu(softKeyMenuSystem, this.controlPublisher));
        softKeyMenuSystem.addMenu('traffic-root', new MFDTrafficMapRootMenu(softKeyMenuSystem));
        softKeyMenuSystem.addMenu('traffic-motion', new MFDTrafficMapMotionMenu(softKeyMenuSystem));
        softKeyMenuSystem.addMenu('traffic-motion-duration', new MFDTrafficMapMotionDurationMenu(softKeyMenuSystem));
        softKeyMenuSystem.addMenu('traffic-alt', new MFDTrafficMapAltitudeMenu(softKeyMenuSystem));
        softKeyMenuSystem.addMenu('wxr-root', new MFDWeatherRadarRootMenu(softKeyMenuSystem));
        softKeyMenuSystem.addMenu('wxr-mode', new MFDWeatherRadarModeMenu(softKeyMenuSystem, this.viewService));
        softKeyMenuSystem.addMenu('selectproc-root', new MFDSelectProcedureRootMenu(softKeyMenuSystem, this.viewService, this.bus));
        softKeyMenuSystem.addMenu('engine-menu', new EngineMenu(softKeyMenuSystem, gaugeConfig, this.g1000ControlPublisher));
        softKeyMenuSystem.addMenu('lean-menu', new LeanMenu(softKeyMenuSystem, gaugeConfig, this.g1000ControlPublisher));
        softKeyMenuSystem.addMenu('system-menu', new SystemMenu(softKeyMenuSystem, gaugeConfig, this.g1000ControlPublisher));
        softKeyMenuSystem.addMenu('fuel-rem-menu', new FuelRemMenu(softKeyMenuSystem, gaugeConfig, this.g1000ControlPublisher));
        softKeyMenuSystem.addMenu('inset-menu', new InsetMenu(softKeyMenuSystem, this.controlPublisher));
        softKeyMenuSystem.addMenu('fpln-menu', new MFDFPLRootMenu(softKeyMenuSystem, this.controlPublisher));
        softKeyMenuSystem.addMenu('nearest-airports-menu', new MFDNearestAirportRootMenu(softKeyMenuSystem, this.g1000ControlPublisher));
        softKeyMenuSystem.addMenu('nearest-vors-menu', new MFDNearestVorRootMenu(softKeyMenuSystem, this.g1000ControlPublisher));
        softKeyMenuSystem.addMenu('systemsetup-root', new MFDSystemSetupRootMenu(softKeyMenuSystem));
        // menuSystem.addMenu('fpln-opt', new FlightPlanPopoutMenu(menuSystem, this.controlPublisher));
        // menuSystem.addMenu('view-opt', new ViewMenu(menuSystem, this.controlPublisher));

        softKeyMenuSystem.pushMenu('navmap-root');

        this.pluginSystem.callPlugins(p => p.onMenuSystemInitialized?.());

        let eisNode: VNode | null = null;
        this.pluginSystem.callPlugins(p => {
          eisNode ??= p.renderEIS?.() || null;
        });

        FSComponent.render(eisNode ?? <EIS bus={this.bus} logicHandler={this.xmlLogicHost} gaugeConfig={gaugeConfig} />, document.getElementsByClassName('eis')[0] as HTMLDivElement);
        FSComponent.render(
          <MFDNavDataBar
            bus={this.bus}
            fms={this.fms}
            dataBarSettingManager={MFDNavDataBarUserSettings.getManager(this.bus)}
            unitsSettingManager={UnitsUserSettings.getManager(this.bus)}
            dateTimeSettingManager={DateTimeUserSettings.getManager(this.bus)}
            updateFreq={1}
            openPage={this.viewService.openPage}
          />,
          document.getElementById('NavComBox')
        );
        FSComponent.render(<NavComRadio ref={this.navRadio} bus={this.bus} title='NAV' position='left' templateId={this.templateID} />, document.querySelector('#NavComBox #Left'));
        FSComponent.render(<NavComRadio ref={this.comRadio} bus={this.bus} title='COM' position='right' templateId={this.templateID} />, document.querySelector('#NavComBox #Right'));
        FSComponent.render(<SoftKeyBar menuSystem={softKeyMenuSystem} />, document.getElementById('Electricity'));

        FSComponent.render(<StartupLogo bus={this.bus} eventPrefix='AS1000_MFD' onConfirmation={(): any => this.initAcknowledged = true} />, this);

        this.backplane.init();
        this.controlPublisher.publishEvent('publish_radio_states', true);

        this.viewService.registerView('NavMapPage', () => <MFDNavMapPage viewService={this.viewService} bus={this.bus} menuSystem={softKeyMenuSystem} flightPlanner={this.planner} tas={this.tas} />);
        this.viewService.registerView('FPLPage', () => <MFDFPLPage viewService={this.viewService} fms={this.fms} bus={this.bus} menuSystem={softKeyMenuSystem} tas={this.tas} />);
        this.viewService.registerView('TrafficPage', () => <MFDTrafficMapPage viewService={this.viewService} bus={this.bus} menuSystem={softKeyMenuSystem} flightPlanner={this.planner} tas={this.tas} />);
        if (this.airframeOptions.hasWeatherRadar) {
          this.viewService.registerView('WeatherRadarPage', () => <MFDWeatherRadarPage viewService={this.viewService} bus={this.bus} menuSystem={softKeyMenuSystem} />);
        }

        this.viewService.registerView('SelectProcedurePage', () => <MFDSelectProcedurePage viewService={this.viewService} fms={this.fms} bus={this.bus} calculator={this.calculator} menuSystem={softKeyMenuSystem} hasRadioAltimeter={this.airframeOptions.hasRadioAltimeter} />);

        this.viewService.registerView('NearestAirports', () => <MFDNearestAirportsPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} loader={this.loader} publisher={this.controlPublisher} tas={this.tas} />);
        this.viewService.registerView('NearestIntersections', () => <MFDNearestIntersectionsPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} loader={this.loader} publisher={this.controlPublisher} tas={this.tas} />);
        this.viewService.registerView('NearestNDBs', () => <MFDNearestNdbsPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} loader={this.loader} publisher={this.controlPublisher} tas={this.tas} />);
        this.viewService.registerView('NearestVORs', () => <MFDNearestVorsPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} loader={this.loader} publisher={this.controlPublisher} tas={this.tas} />);

        this.viewService.registerView('AirportInformation', () => <MFDAirportInformationPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} facilityLoader={this.loader} controlPublisher={this.controlPublisher} />);
        this.viewService.registerView('IntersectionInformation', () => <MFDIntersectionInformationPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} facilityLoader={this.loader} controlPublisher={this.controlPublisher} />);
        this.viewService.registerView('NdbInformation', () => <MFDNdbInformationPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} facilityLoader={this.loader} controlPublisher={this.controlPublisher} />);
        this.viewService.registerView('VorInformation', () => <MFDVorInformationPage viewService={this.viewService} fms={this.fms} menuSystem={softKeyMenuSystem} bus={this.bus} facilityLoader={this.loader} controlPublisher={this.controlPublisher} />);

        this.viewService.registerView('SystemSetupPage', () => <MFDSystemSetupPage viewService={this.viewService} bus={this.bus} menuSystem={softKeyMenuSystem} />);

        this.viewService.registerView('PageSelect', () => <MFDPageSelect viewService={this.viewService} title="Page Select" showTitle={false} supportWeatherRadarPage={this.airframeOptions.hasWeatherRadar} menuSystem={rotaryMenuSystem} pluginSystem={this.pluginSystem} />);
        this.viewService.registerView('ContextMenuDialog', () => <ContextMenuDialog viewService={this.viewService} title="" showTitle={false} upperKnobCanScroll={true} />);
        this.viewService.registerView('PROC', () => <MFDProc viewService={this.viewService} title="Procedures" showTitle={true} fms={this.fms} />);
        this.viewService.registerView('DirectTo', () => <MFDDirectTo viewService={this.viewService} bus={this.bus} fms={this.fms} title="Direct To" showTitle={true} />);
        this.viewService.registerView('MapSettings', () => <MFDMapSettings viewService={this.viewService} title='Map Settings' showTitle={true} bus={this.bus} menuSystem={softKeyMenuSystem} />);
        this.viewService.registerView('WptInfo', () => <MFDWptInfo viewService={this.viewService} title="Waypoint Information" showTitle={true} bus={this.bus} />);
        this.viewService.registerView('SetRunway', () => <MFDSetRunway viewService={this.viewService} title="Set Runway" showTitle={true} />);
        this.viewService.registerView('MessageDialog', () => <MessageDialog viewService={this.viewService} title="" showTitle={false} />);
        this.viewService.registerView('PageMenuDialog', () => <MFDPageMenuDialog viewService={this.viewService} title="Page Menu" showTitle={true} />);
        this.viewService.registerView('SelectAirway', () => <MFDSelectAirway viewService={this.viewService} title="Select Airway" showTitle={true} fms={this.fms} bus={this.bus} />);
        this.viewService.registerView('HoldAt', () => <MFDHold viewService={this.viewService} title="Hold at" showTitle={true} fms={this.fms} bus={this.bus} />);
        this.viewService.registerView('WptDup', () => <MFDWptDupDialog viewService={this.viewService} title='Duplicate Waypoints' showTitle={true} bus={this.bus} />);

        // this.viewService.registerView('Turb', () => <TurbulenceGraph viewService={this.viewService} bus={this.bus} menuSystem={menuSystem} />);

        this.controlPadHandler.setFrequencyElementRefs(this.comRadio.instance, this.navRadio.instance);

        this.viewService.open('NavMapPage');

        this.pluginSystem.callPlugins(p => p.onViewServiceInitialized?.());
        this.controlPublisher.publishEvent('init_cdi', true);
      });

      // force enable animations
      document.documentElement.classList.add('animationsEnabled');
    });
  }

  /**
   * A callback called when the instrument is initialized.
   */
  public Init(): void {
    super.Init();

    this.initPrimaryFlightPlan();
    this.clock.init();
    this.tas.init();
    this.backlightManager.init();

    if (this.airframeOptions.hasWeatherRadar) {
      new WeatherRadarController(this.bus);
    }

    this.initializeAvElectrical();

    this.g1000Systems.push(new MagnetometerSystem(1, this.bus));
    this.g1000Systems.push(new ADCAvionicsSystem(1, this.bus));
    this.g1000Systems.push(new AHRSSystem(1, this.bus));
    this.g1000Systems.push(new TransponderSystem(1, this.bus));
    this.g1000Systems.push(new AvionicsComputerSystem(1, this.bus));
    this.g1000Systems.push(new AvionicsComputerSystem(2, this.bus));
    this.g1000Systems.push(new EngineAirframeSystem(1, this.bus));

    this.systems.push(new AdcSystem(1, this.bus, 1, 1, 'elec_av1_bus'));

    const sub = this.bus.getSubscriber<InstrumentEvents>();

    // initialize screen state callback
    sub.on('vc_screen_state').handle(event => {
      if (event.current !== event.previous) {
        this.onScreenStateChanged(event.current);
      }
    });

    //Bridge G1000 CDI to newer nav source events for GoAoundManager
    this.bus.getSubscriber<NavEvents>().on('cdi_select').handle(v => {
      const publisher = this.bus.getPublisher<GarminNavEvents>();

      if (v.type === NavSourceType.Gps) {
        publisher.pub('active_nav_source_1', ActiveNavSource.Gps1, false, true);
      } else if (v.type === NavSourceType.Nav) {
        publisher.pub('active_nav_source_1', v.index === 0 ? ActiveNavSource.Nav1 : ActiveNavSource.Nav2);
      } else {
        publisher.pub('active_nav_source_1', ActiveNavSource.Nav1);
      }

    });
    this.goAroundManager?.init();

    this.doDelayedInit();
  }

  /**
   * Performs initialization tasks after a 500-millisecond wait.
   */
  private async doDelayedInit(): Promise<void> {
    await Wait.awaitDelay(500);

    this.trafficOperatingModeManager.init();
  }

  /**
   * Initialized the avionics electrical bus XML logic.
   */
  private initializeAvElectrical(): void {
    let pfdId = 'AS1000_PFD';
    let mfdId = 'AS1000_MFD';

    const logicElement = this.xmlConfig.getElementsByTagName('Logic');
    if (logicElement.length > 0) {
      pfdId = logicElement[0].getElementsByTagName('PFD')[0].textContent ?? 'AS1000_PFD';
      mfdId = logicElement[0].getElementsByTagName('MFD')[0].textContent ?? 'AS1000_MFD';
    }

    const pfdBusLogic = this.getElectricalLogicForName(pfdId);
    const mfdBusLogic = this.getElectricalLogicForName(mfdId);

    if (pfdBusLogic !== undefined) {
      this.electricalPublisher.setAv1Bus(pfdBusLogic);
    }

    if (mfdBusLogic !== undefined) {
      this.electricalPublisher.setAv2Bus(mfdBusLogic);
    }
  }

  /**
   * Gets the electrical bus XML logic for a given panel name.
   * @param name The name of the panel.
   * @returns The XML logic element, or undefined if none was found.
   */
  private getElectricalLogicForName(name: string): CompositeLogicXMLElement | undefined {
    const instrumentConfigs = this.xmlConfig.getElementsByTagName('Instrument');
    for (let i = 0; i < instrumentConfigs.length; i++) {
      const el = instrumentConfigs.item(i);

      if (el !== null) {
        const nameEl = el.getElementsByTagName('Name');
        if (nameEl.length > 0 && nameEl[0].textContent === name) {
          const electrics = el.getElementsByTagName('Electric');
          if (electrics.length > 0) {
            return new CompositeLogicXMLElement(this, electrics[0]);
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Initializes the primary flight plan.
   */
  private initPrimaryFlightPlan(): void {
    // Do not create a new flight plan ourselves; instead we will sync it from the PFD.
    this.fms.flightPlanner.requestSync();
  }

  /**
   * A callback called when the instrument gets a frame update.
   */
  public Update(): void {
    super.Update();

    const now = Date.now();
    if (now - this.lastCalculate > 3000) {
      this.lastCalculate = now;
    }

    this.clock.onUpdate();
    this.backplane.onUpdate();
    this.xmlLogicHost.update(this.deltaTime);
    this.gpsSynchronizer.update();

    this.updateSystems();
  }

  /**
   * Updates this instrument's systems.
   */
  private updateSystems(): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].onUpdate();
    }
  }

  /**
   * Handles when the instrument screen state has changed.
   * @param state The current screen state.
   */
  private onScreenStateChanged(state: ScreenState): void {
    if (state === ScreenState.ON) {
      this.bus.pub('mfd_power_on', true, true, true);
      this.xmlLogicHost.setIsPaused(false);
    } else {
      this.bus.pub('mfd_power_on', false, true, true);
      this.xmlLogicHost.setIsPaused(true);
    }
  }

  /**
   * Callback called when the flight starts.
   */
  protected onFlightStart(): void {
    super.onFlightStart();
    this.autopilot.stateManager.initialize();
  }

  /**
   * A callback called when the instrument received a H event.
   * @param args The H event and associated arguments, if any.
   */
  public onInteractionEvent(args: string[]): void {
    const isHandled = this.controlPadHandler.handleControlPadEventInput(args[0]);
    if (isHandled === false) {
      // If the controlpad handler did not handle the event, continue and publish:
      this.hEventPublisher.dispatchHEvent(args[0]);
    }
  }


}

registerInstrument('wtg1000-mfd', WTG1000_MFD);
