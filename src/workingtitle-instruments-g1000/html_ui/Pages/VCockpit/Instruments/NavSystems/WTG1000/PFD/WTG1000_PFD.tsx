/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import {
  AdcPublisher, AnnunciationType, AutopilotInstrument, AvionicsSystem, BaseInstrumentPublisher, CasEvents, Clock, CompositeLogicXMLHost, ControlPublisher, ControlSurfacesPublisher,
  DebounceTimer,
  ElectricalPublisher, EventBus, FacilityLoader, FacilityRepository, FlightPathAirplaneSpeedMode, FlightPathCalculator, FlightPlanner, FlightPlannerEvents,
  FSComponent, GNSSPublisher, HEventPublisher, InstrumentBackplane, InstrumentEvents, LNavSimVarPublisher, MinimumsControlEvents, MinimumsSimVarPublisher,
  NavComInstrument, NavComSimVarPublisher, NavProcessor, PluginSystem, SimVarValueType, SoundServer, Subject, TrafficInstrument, UnitType,
  UserSettingSaveManager, VNavSimVarPublisher, Wait, XMLGaugeConfigFactory, XMLWarningFactory, XPDRInstrument
} from '@microsoft/msfs-sdk';

import { AdcSystem, Fms, GarminAdsb, LNavDataSimVarPublisher, NavIndicatorController, TrafficAdvisorySystem } from '@microsoft/msfs-garminsdk';

import { EIS } from '../MFD/Components/EIS';
import { MapInset } from '../PFD/Components/Overlays/MapInset';
import { BacklightManager } from '../Shared/Backlight/BacklightManager';
import { FlightPlanAsoboSync } from '../Shared/FlightPlanAsoboSync';
import { G1000ControlPublisher } from '../Shared/G1000Events';
import { G1000PfdAvionicsPlugin } from '../Shared/G1000PfdPlugin';
import { G1000PfdPluginBinder } from '../Shared/G1000Plugin';
import { AhrsPublisher } from '../Shared/Instruments/AhrsPublisher';
import { NavComRadio } from '../Shared/NavCom/NavComRadio';
import { G1000Config } from '../Shared/NavComConfig';
import { NPConfig } from '../Shared/NavProcessorConfig';
import { G1000AirframeOptionsManager } from '../Shared/Profiles/G1000AirframeOptionsManager';
import { G1000SettingSaveManager } from '../Shared/Profiles/G1000SettingSaveManager';
import { StartupLogo } from '../Shared/StartupLogo';
import {
  ADCAvionicsSystem, AHRSSystem, AvionicsComputerSystem, EngineAirframeSystem, G1000AvionicsSystem, MagnetometerSystem, SoundSystem, TransponderSystem
} from '../Shared/Systems';
import { ControlpadInputController, ControlpadTargetInstrument } from '../Shared/UI/Controllers/ControlpadInputController';
import { ContextMenuDialog } from '../Shared/UI/Dialogs/ContextMenuDialog';
import { MessageDialog } from '../Shared/UI/Dialogs/MessageDialog';
import { ALTUnitsMenu } from '../Shared/UI/Menus/ALTUnitsMenu';
import { MapHSILayoutMenu } from '../Shared/UI/Menus/MapHSILayoutMenu';
import { MapHSIMenu } from '../Shared/UI/Menus/MapHSIMenu';
import { EngineMenu } from '../Shared/UI/Menus/MFD/EngineMenu';
import { FuelRemMenu } from '../Shared/UI/Menus/MFD/FuelRemMenu';
import { LeanMenu } from '../Shared/UI/Menus/MFD/LeanMenu';
import { SystemMenu } from '../Shared/UI/Menus/MFD/SystemMenu';
import { PFDOptMenu } from '../Shared/UI/Menus/PFDOptMenu';
import { RootMenu } from '../Shared/UI/Menus/RootMenu';
import { SoftKeyMenuSystem } from '../Shared/UI/Menus/SoftKeyMenuSystem';
import { SVTMenu } from '../Shared/UI/Menus/SVTMenu';
import { WindMenu } from '../Shared/UI/Menus/WindMenu';
import { XPDRCodeMenu } from '../Shared/UI/Menus/XPDRCodeMenu';
import { XPDRMenu } from '../Shared/UI/Menus/XPDRMenu';
import { SoftKeyBar } from '../Shared/UI/SoftKeyBar';
import { UnitsUserSettings } from '../Shared/Units/UnitsUserSettings';
import { VSpeedUserSettingManager } from '../Shared/VSpeed/VSpeedUserSettings';
import { WaypointIconImageCache } from '../Shared/WaypointIconImageCache';
import { G1000AirspeedIndicator } from './Components/FlightInstruments/AirspeedIndicator/G1000AirspeedIndicator';
import { G1000AirspeedIndicatorDataProvider } from './Components/FlightInstruments/AirspeedIndicator/G1000AirspeedIndicatorDataProvider';
import { Altimeter } from './Components/FlightInstruments/Altimeter';
import { CAS } from './Components/FlightInstruments/CAS';
import { FlightDirector } from './Components/FlightInstruments/FlightDirector';
import { MarkerBeacon } from './Components/FlightInstruments/MarkerBeacon';
import { PrimaryHorizonDisplay } from './Components/FlightInstruments/PrimaryHorizonDisplay';
import { VerticalDeviation } from './Components/FlightInstruments/VerticalDeviation';
import { VerticalSpeedIndicator } from './Components/FlightInstruments/VerticalSpeedIndicator';
import { HSI } from './Components/HSI/HSI';
import { BottomInfoPanel } from './Components/Overlays/BottomInfoPanel';
import { DMEWindow } from './Components/Overlays/DMEWindow';
import { Fma } from './Components/Overlays/Fma/Fma';
import { WindOverlay } from './Components/Overlays/Wind/WindOverlay';
import { ADFDME } from './Components/UI/ADF-DME/ADFDME';
import { PFDSelectAirway } from './Components/UI/Airway/PFDSelectAirway';
import { Alerts } from './Components/UI/Alerts/Alerts';
import { AlertsSubject } from './Components/UI/Alerts/AlertsSubject';
import { CasAlertsBridge } from './Components/UI/Alerts/CasAlertsBridge';
import { PFDDirectTo } from './Components/UI/DirectTo/PFDDirectTo';
import { FPL } from './Components/UI/FPL/FPL';
import { PFDHold } from './Components/UI/Hold/PFDHold';
import { Nearest } from './Components/UI/Nearest';
import { PFDPageMenuDialog } from './Components/UI/PFDPageMenuDialog';
import { PFDSetup } from './Components/UI/PFDSetup';
import { PFDViewService } from './Components/UI/PFDViewService';
import { PFDSelectApproachView } from './Components/UI/Procedure/Approach/PFDSelectApproachView';
import { PFDSelectArrivalView } from './Components/UI/Procedure/DepArr/PFDSelectArrivalView';
import { PFDSelectDepartureView } from './Components/UI/Procedure/DepArr/PFDSelectDepartureView';
import { PFDProc } from './Components/UI/Procedure/PFDProc';
import { PFDSetRunway } from './Components/UI/SetRunway/PFDSetRunway';
import { TimerRef } from './Components/UI/TimerRef/TimerRef';
import { PFDWptDupDialog } from './Components/UI/WptDup/PFDWptDupDialog';
import { PFDWptInfo } from './Components/UI/WptInfo/PFDWptInfo';
import { VNavAlertForwarder } from './Components/VNavAlertForwarder';
import { WarningDisplay } from './Components/Warnings';

import '../Shared/UI/Common/g1k_common.css';
import '../Shared/UI/Common/LatLonDisplay.css';
import './WTG1000_PFD.css';

/**
 * The base G1000 PFD instrument class.
 */
class WTG1000_PFD extends BaseInstrument {
  private readonly bus = new EventBus();

  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly adcPublisher: AdcPublisher;
  private readonly ahrsPublisher: AhrsPublisher;
  private readonly controlPublisher: ControlPublisher;
  private readonly g1000ControlPublisher: G1000ControlPublisher;
  private readonly lNavPublisher: LNavSimVarPublisher;
  private readonly lNavDataPublisher: LNavDataSimVarPublisher;
  private readonly vNavPublisher: VNavSimVarPublisher;
  private readonly gnssPublisher: GNSSPublisher;
  private readonly electricalPublisher: ElectricalPublisher;
  private readonly backplane: InstrumentBackplane;
  private readonly hEventPublisher: HEventPublisher;
  private readonly navComSimVarPublisher: NavComSimVarPublisher;
  private readonly navComInstrument: NavComInstrument;
  private readonly apInstrument: AutopilotInstrument;
  private readonly navProcessor: NavProcessor;
  private readonly xpdrInstrument: XPDRInstrument;
  private readonly trafficInstrument: TrafficInstrument;
  private readonly clock: Clock;
  private readonly navIndicatorController: NavIndicatorController;
  private readonly fms: Fms;
  private readonly planner: FlightPlanner;
  private readonly facLoader: FacilityLoader;
  private readonly calculator: FlightPathCalculator;
  private readonly soundServer: SoundServer;
  private readonly minimumsPublisher: MinimumsSimVarPublisher;
  private readonly controlSurfacesPublisher: ControlSurfacesPublisher;

  private lastCalculate = 0;

  private readonly tas: TrafficAdvisorySystem;

  private readonly viewService: PFDViewService;

  private readonly casXmlLogicHost: CompositeLogicXMLHost;
  private readonly eisXmlLogicHost: CompositeLogicXMLHost;
  private readonly warningFactory: XMLWarningFactory;

  private readonly backlightManager: BacklightManager;

  private readonly settingSaveManager: UserSettingSaveManager;
  private previousScreenState: ScreenState | undefined;
  private readonly gaugeFactory: XMLGaugeConfigFactory;

  private readonly airframeOptions: G1000AirframeOptionsManager;

  private readonly g1000Systems: G1000AvionicsSystem[] = [];
  private readonly systems: AvionicsSystem[] = [];

  private readonly alerts: AlertsSubject;
  private readonly casAlertsBridge: CasAlertsBridge;

  private isMfdPoweredOn = false;
  private gamePlanSynced = false;
  private vnavAlertForwarder: any;

  private readonly pluginSystem = new PluginSystem<G1000PfdAvionicsPlugin, G1000PfdPluginBinder>();

  private airspeedIndicatorDataProvider!: G1000AirspeedIndicatorDataProvider;

  private vSpeedSettingManager!: VSpeedUserSettingManager;

  private readonly comRadio = FSComponent.createRef<NavComRadio>();
  private readonly navRadio = FSComponent.createRef<NavComRadio>();
  private controlPadHandler = new ControlpadInputController(this.bus, ControlpadTargetInstrument.PFD);
  private casPowerDebounce = new DebounceTimer();

  /**
   * Creates an instance of the WTG1000_PFD.
   */
  constructor() {
    super();
    RegisterViewListener('JS_LISTENER_INSTRUMENTS');
    SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);

    WaypointIconImageCache.init();

    this.baseInstrumentPublisher = new BaseInstrumentPublisher(this, this.bus);

    this.vnavAlertForwarder = new VNavAlertForwarder(this.bus);

    this.hEventPublisher = new HEventPublisher(this.bus);
    this.adcPublisher = new AdcPublisher(this.bus);
    this.ahrsPublisher = new AhrsPublisher(this.bus);
    this.gnssPublisher = new GNSSPublisher(this.bus);
    this.lNavPublisher = new LNavSimVarPublisher(this.bus);
    this.lNavDataPublisher = new LNavDataSimVarPublisher(this.bus);
    this.vNavPublisher = new VNavSimVarPublisher(this.bus);
    this.electricalPublisher = new ElectricalPublisher(this.bus);

    this.controlPublisher = new ControlPublisher(this.bus);
    this.g1000ControlPublisher = new G1000ControlPublisher(this.bus);
    this.navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
    this.navComInstrument = new NavComInstrument(this.bus, G1000Config, 2, 2, true);
    this.apInstrument = new AutopilotInstrument(this.bus);

    this.xpdrInstrument = new XPDRInstrument(this.bus);
    this.trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
    this.minimumsPublisher = new MinimumsSimVarPublisher(this.bus);

    this.controlSurfacesPublisher = new ControlSurfacesPublisher(this.bus, 3);

    this.clock = new Clock(this.bus);

    this.facLoader = new FacilityLoader(FacilityRepository.getRepository(this.bus));
    this.calculator = new FlightPathCalculator(this.facLoader, {
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
    this.viewService = new PFDViewService(this.bus);

    this.navProcessor = new NavProcessor(this.bus, new NPConfig(this.bus, this.planner));

    this.backplane = new InstrumentBackplane();
    this.backplane.addPublisher('base', this.baseInstrumentPublisher);
    this.backplane.addPublisher('adc', this.adcPublisher);
    this.backplane.addPublisher('ahrs', this.ahrsPublisher);
    this.backplane.addPublisher('lnav', this.lNavPublisher);
    this.backplane.addPublisher('lnavdata', this.lNavDataPublisher);
    this.backplane.addPublisher('vnav', this.vNavPublisher);
    this.backplane.addPublisher('hEvents', this.hEventPublisher);
    this.backplane.addPublisher('control', this.controlPublisher);
    this.backplane.addPublisher('g1000Control', this.g1000ControlPublisher);
    this.backplane.addPublisher('gnss', this.gnssPublisher);
    this.backplane.addPublisher('electrical', this.electricalPublisher);
    this.backplane.addPublisher('minimums', this.minimumsPublisher);
    this.backplane.addPublisher('navcom', this.navComSimVarPublisher);

    this.backplane.addInstrument('navcom', this.navComInstrument);
    this.backplane.addInstrument('ap', this.apInstrument);
    this.backplane.addInstrument('nav', this.navProcessor);
    this.backplane.addInstrument('xpdr', this.xpdrInstrument);
    this.backplane.addInstrument('traffic', this.trafficInstrument);

    this.backplane.addPublisher('ControlSurfaces', this.controlSurfacesPublisher);

    this.gaugeFactory = new XMLGaugeConfigFactory(this, this.bus);
    this.airframeOptions = new G1000AirframeOptionsManager(this, this.bus);

    this.tas = new TrafficAdvisorySystem(this.bus, this.trafficInstrument, new GarminAdsb(this.bus), false);

    this.fms = new Fms(false, this.bus, this.planner);
    FlightPlanAsoboSync.init();

    this.navIndicatorController = new NavIndicatorController(this.bus, this.fms);

    this.casXmlLogicHost = new CompositeLogicXMLHost();
    this.eisXmlLogicHost = new CompositeLogicXMLHost();
    this.warningFactory = new XMLWarningFactory(this);

    this.soundServer = new SoundServer(this.bus);

    this.backlightManager = new BacklightManager('pfd', this.bus);

    // TODO: Support pilot profiles.
    this.settingSaveManager = new G1000SettingSaveManager(this.bus);
    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
    this.settingSaveManager.load(saveKey);

    this.alerts = new AlertsSubject(this.bus);
    this.casAlertsBridge = new CasAlertsBridge(this.bus);
    this.initDuration = 5000;
  }

  /**
   * The instrument template ID.
   * @returns The instrument template ID.
   */
  get templateID(): string {
    return 'AS1000_PFD';
  }

  /**
   * Whether or not the instrument is interactive (a touchscreen instrument).
   * @returns True
   */
  get isInteractive(): boolean {
    return true;
  }

  /**
   * A callback called when the element is attached to the DOM.
   */
  public connectedCallback(): void {
    super.connectedCallback();
    this.airframeOptions.parseConfig();

    this.classList.add('hidden-element');

    this.airspeedIndicatorDataProvider = new G1000AirspeedIndicatorDataProvider(this.bus, this.airframeOptions.airspeedIndicatorConfig);

    this.vSpeedSettingManager = new VSpeedUserSettingManager(this.bus, this.airframeOptions.vSpeedGroups);

    const gaugeConfig = this.airframeOptions.gaugeConfig;
    const menuSystem = new SoftKeyMenuSystem(this.bus, 'AS1000_PFD_SOFTKEYS_');

    this.pluginSystem.addScripts(this.xmlConfig, this.templateID, (target) => {
      return target === this.templateID;
    }).then(() => {
      this.pluginSystem.startSystem({
        bus: this.bus, backplane: this.backplane, viewService: this.viewService, menuSystem: menuSystem,
        fms: this.fms, navIndicatorController: this.navIndicatorController
      }).then(() => {

        // if (alertsPopoutRef.instance !== null) {
        menuSystem.addMenu('root', new RootMenu(menuSystem, this.controlPublisher, this.g1000ControlPublisher, this.bus));
        // }
        menuSystem.addMenu('map-hsi', new MapHSIMenu(menuSystem));
        menuSystem.addMenu('map-hsi-layout', new MapHSILayoutMenu(menuSystem));
        menuSystem.addMenu('pfd-opt', new PFDOptMenu(menuSystem, this.controlPublisher, this.g1000ControlPublisher, this.bus));
        menuSystem.addMenu('svt', new SVTMenu(menuSystem));
        menuSystem.addMenu('wind', new WindMenu(menuSystem));
        menuSystem.addMenu('alt-units', new ALTUnitsMenu(menuSystem));
        menuSystem.addMenu('xpdr', new XPDRMenu(menuSystem, this.controlPublisher, this.g1000ControlPublisher, this.bus));
        menuSystem.addMenu('xpdr-code', new XPDRCodeMenu(menuSystem, this.bus, this.g1000ControlPublisher));

        menuSystem.addMenu('engine-menu', new EngineMenu(menuSystem, gaugeConfig, this.g1000ControlPublisher));
        menuSystem.addMenu('lean-menu', new LeanMenu(menuSystem, gaugeConfig, this.g1000ControlPublisher));
        menuSystem.addMenu('system-menu', new SystemMenu(menuSystem, gaugeConfig, this.g1000ControlPublisher));
        menuSystem.addMenu('fuel-rem-menu', new FuelRemMenu(menuSystem, gaugeConfig, this.g1000ControlPublisher));

        menuSystem.pushMenu('root');

        this.pluginSystem.callPlugins(p => p.onMenuSystemInitialized?.());

        FSComponent.render(<PrimaryHorizonDisplay bus={this.bus} hasRadioAltimeter={this.airframeOptions.hasRadioAltimeter} />, document.getElementById('HorizonContainer'));

        FSComponent.render(<HSI bus={this.bus} flightPlanner={this.planner} navIndicatorController={this.navIndicatorController} tas={this.tas} unitsSettingManager={UnitsUserSettings.getManager(this.bus)} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<FlightDirector bus={this.bus} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(
          <G1000AirspeedIndicator
            dataProvider={this.airspeedIndicatorDataProvider}
            config={this.airframeOptions.airspeedIndicatorConfig}
            vSpeedSettingManager={this.vSpeedSettingManager}
            declutter={Subject.create(false)}
          />,
          document.getElementById('InstrumentsContainer')
        );
        FSComponent.render(<VerticalSpeedIndicator bus={this.bus} navIndicatorController={this.navIndicatorController} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<Altimeter bus={this.bus} g1000Publisher={this.g1000ControlPublisher} hasRadioAltimeter={this.airframeOptions.hasRadioAltimeter} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<MarkerBeacon bus={this.bus} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<DMEWindow bus={this.bus} navIndicatorController={this.navIndicatorController} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<VerticalDeviation bus={this.bus} navIndicatorController={this.navIndicatorController} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<NavComRadio ref={this.navRadio} bus={this.bus} title='NAV' position='left' templateId={this.templateID} />, document.querySelector('#NavComBox #Left'));
        FSComponent.render(<NavComRadio ref={this.comRadio} bus={this.bus} title='COM' position='right' templateId={this.templateID} />, document.querySelector('#NavComBox #Right'));
        FSComponent.render(<Fma bus={this.bus} planner={this.planner} navController={this.navIndicatorController} />, document.getElementById('NavComBox'));
        FSComponent.render(<BottomInfoPanel bus={this.bus} controlPublisher={this.controlPublisher} unitsSettingManager={UnitsUserSettings.getManager(this.bus)} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<SoftKeyBar menuSystem={menuSystem} />, document.getElementById('Electricity'));
        FSComponent.render(<WindOverlay bus={this.bus} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<MapInset bus={this.bus} flightPlanner={this.planner} tas={this.tas} />, document.getElementById('InstrumentsContainer'));
        FSComponent.render(<CAS bus={this.bus} logicHandler={this.casXmlLogicHost} annunciations={this.airframeOptions.annunciationConfig} cautionSoundId='tone_caution' warningSoundId='tone_warning' />, document.getElementById('cas'));
        FSComponent.render(<WarningDisplay bus={this.bus} logicHandler={this.casXmlLogicHost} warnings={this.airframeOptions.warningConfig} />, document.getElementById('warnings'));


        this.pluginSystem.callPlugins(plugin => {

          // At last, let the plugins directly render on the instruments container:
          const node = plugin.renderToPfdInstruments?.();
          if (node) {
            FSComponent.render(node, document.getElementById('InstrumentsContainer'));
          }
        });

        FSComponent.render(<StartupLogo bus={this.bus} eventPrefix='AS1000_PFD' />, this);
        FSComponent.render(<EIS bus={this.bus} logicHandler={this.eisXmlLogicHost} gaugeConfig={gaugeConfig} />, document.getElementsByClassName('eis')[0] as HTMLDivElement);

        this.viewService.registerView('FPL', () => <FPL viewService={this.viewService} bus={this.bus} fms={this.fms} title="Flight Plan" showTitle={true} />);
        this.viewService.registerView('PROC', () => <PFDProc viewService={this.viewService} title="Procedures" showTitle={true} fms={this.fms} />);
        this.viewService.registerView('DirectTo', () => <PFDDirectTo viewService={this.viewService} bus={this.bus} fms={this.fms} title="Direct To" showTitle={true} />);
        this.viewService.registerView('WptInfo', () => <PFDWptInfo viewService={this.viewService} bus={this.bus} title="Waypoint Information" showTitle={true} />);
        this.viewService.registerView('MessageDialog', () => <MessageDialog viewService={this.viewService} title="" showTitle={false} />);
        this.viewService.registerView('SetRunway', () => <PFDSetRunway viewService={this.viewService} title="Set Runway" showTitle={true} />);
        this.viewService.registerView('SelectDeparture', () => <PFDSelectDepartureView viewService={this.viewService} bus={this.bus} fms={this.fms} calculator={this.calculator} title="Select Departure" showTitle={true} />);
        this.viewService.registerView('SelectApproach', () => <PFDSelectApproachView viewService={this.viewService} bus={this.bus} fms={this.fms} calculator={this.calculator} title="Select Approach" showTitle={true} hasRadioAltimeter={this.airframeOptions.hasRadioAltimeter} />);
        this.viewService.registerView('SelectArrival', () => <PFDSelectArrivalView viewService={this.viewService} bus={this.bus} fms={this.fms} calculator={this.calculator} title="Select Arrival" showTitle={true} />);
        this.viewService.registerView(ContextMenuDialog.name, () => <ContextMenuDialog viewService={this.viewService} title="" showTitle={false} upperKnobCanScroll={true} />);
        this.viewService.registerView('PageMenuDialog', () => <PFDPageMenuDialog viewService={this.viewService} title="Page Menu" showTitle={true} />);
        this.viewService.registerView(TimerRef.name, () => {
          return (
            <TimerRef
              viewService={this.viewService}
              title="TimerRef"
              showTitle={false}
              bus={this.bus}
              vSpeedSettingManager={this.vSpeedSettingManager}
              unitsSettingManager={UnitsUserSettings.getManager(this.bus)}
              hasRadioAltimeter={this.airframeOptions.hasRadioAltimeter}
            />
          );
        });
        this.viewService.registerView(ADFDME.name, () => <ADFDME viewService={this.viewService} bus={this.bus} title="ADF/DME TUNING" showTitle={true} navIndicatorController={this.navIndicatorController} />);
        this.viewService.registerView('WptDup', () => <PFDWptDupDialog viewService={this.viewService} title="Duplicate Waypoints" showTitle={true} />);
        this.viewService.registerView(Nearest.name, () => <Nearest viewService={this.viewService} bus={this.bus} loader={this.facLoader} publisher={this.controlPublisher} title="Nearest Airports" showTitle={true} />);
        this.viewService.registerView(PFDSetup.name, () => <PFDSetup viewService={this.viewService} title="PFD Setup Menu" showTitle={true} bus={this.bus} />);
        this.viewService.registerView(Alerts.name, () => <Alerts data={this.alerts} viewService={this.viewService} title="Alerts" showTitle={true} />);
        this.viewService.registerView('SelectAirway', () => <PFDSelectAirway viewService={this.viewService} title="Select Airway" showTitle={true} fms={this.fms} />);
        this.viewService.registerView('HoldAt', () => <PFDHold viewService={this.viewService} title="Hold at" showTitle={true} fms={this.fms} bus={this.bus} />);

        this.pluginSystem.callPlugins(p => p.onViewServiceInitialized?.());

        this.backplane.init();
        this.controlPublisher.publishEvent('init_cdi', true);
        this.bus.on('mfd_power_on', this.onMfdPowerOn);
        this.controlPadHandler.setFrequencyElementRefs(this.comRadio.instance, this.navRadio.instance);
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

    this.initializeAvElectrical();

    this.g1000Systems.push(new MagnetometerSystem(1, this.bus));
    this.g1000Systems.push(new ADCAvionicsSystem(1, this.bus));
    this.g1000Systems.push(new AHRSSystem(1, this.bus));
    this.g1000Systems.push(new TransponderSystem(1, this.bus));
    this.g1000Systems.push(new AvionicsComputerSystem(1, this.bus));
    this.g1000Systems.push(new AvionicsComputerSystem(2, this.bus));
    this.g1000Systems.push(new EngineAirframeSystem(1, this.bus));
    this.g1000Systems.push(new SoundSystem(1, this.bus, this.soundServer));

    this.systems.push(new AdcSystem(1, this.bus, 1, 1, 'elec_av1_bus'));

    this.airspeedIndicatorDataProvider.init();

    const sub = this.bus.getSubscriber<InstrumentEvents>();

    // initialize screen state callback
    sub.on('vc_screen_state').handle(event => {
      if (event.current !== event.previous) {
        this.onScreenStateChanged(event.current, event.previous);
      }
    });

    this.initMinimumsManager();
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
  private async initPrimaryFlightPlan(): Promise<void> {
    // Request a sync from the MFD in case of an instrument reload
    this.fms.flightPlanner.requestSync();
    await Wait.awaitDelay(500);
    // Initialize the primary plan in case one was not synced.
    this.fms.initPrimaryFlightPlan();
  }

  /**
   * Initializes the minimums manager by setting the units according to the User Settings.
   */
  private initMinimumsManager(): void {
    UnitsUserSettings.getManager(this.bus).altitudeUnits.sub(u => {
      const minsPub = this.bus.getPublisher<MinimumsControlEvents>();
      switch (u) {
        case UnitType.FOOT:
          minsPub.pub('set_da_distance_unit', 'feet', true, true);
          break;
        case UnitType.METER:
          minsPub.pub('set_da_distance_unit', 'meters', true, true);
          break;
        default:
          console.warn('Unknown altitude unit handled in initMinimumsManager: ' + u.name);
      }
    }, true);
  }

  /**
   * Callback called when the flight starts.
   */
  protected onFlightStart(): void {
    super.onFlightStart();

    if (this.gamePlanSynced) {
      this.fms.activateNearestLeg();
      return;
    }

    Wait.awaitCondition(() => this.planner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX), 1000)
      .then(async () => {
        await FlightPlanAsoboSync.loadFromGame(this.fms);
        this.bus.getSubscriber<FlightPlannerEvents>().on('fplLegChange').handle(() => {
          FlightPlanAsoboSync.SaveToGame(this.fms);
          this.gamePlanSynced = true;
        });
      });
  }

  /** @inheritdoc */
  public onPowerOn(): void {
    super.onPowerOn();

    this.classList.remove('hidden-element');
    this.casPowerDebounce.clear();
    this.casPowerDebounce.schedule(() => {
      this.bus.getPublisher<CasEvents>().pub('cas_set_initial_acknowledge', false, true, true);
    }, 2000);
  }

  /** @inheritdoc */
  public onShutDown(): void {
    super.onShutDown();

    this.classList.add('hidden-element');

    this.bus.getPublisher<CasEvents>().pub('cas_set_initial_acknowledge', true, true, true);
    SimVar.SetSimVarValue('K:MASTER_CAUTION_ACKNOWLEDGE', SimVarValueType.Number, 0);
    SimVar.SetSimVarValue('K:MASTER_WARNING_ACKNOWLEDGE', SimVarValueType.Number, 0);
    this.bus.getPublisher<CasEvents>().pub('cas_master_acknowledge', AnnunciationType.SafeOp, true, false);
    this.bus.getPublisher<CasEvents>().pub('cas_master_acknowledge', AnnunciationType.Advisory, true, false);
  }

  /**
   * A callback called when the instrument gets a frame update.
   */
  public Update(): void {
    super.Update();

    this.checkIsReversionary();

    this.clock.onUpdate();
    this.backplane.onUpdate();

    this.updateSystems();

    const now = Date.now();
    if (now - this.lastCalculate > 3000) {
      if (this.planner.hasFlightPlan(this.planner.activePlanIndex)) {
        this.planner.getActiveFlightPlan().calculate();
      }
      SimVar.SetSimVarValue('K:HEADING_GYRO_SET', SimVarValueType.Number, 0);
      this.lastCalculate = now;
    }
    this.casXmlLogicHost.update(this.deltaTime);
    this.eisXmlLogicHost.update(this.deltaTime);
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
   * @param newState The current screen state.
   * @param oldState The previous screen state.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onScreenStateChanged(newState: ScreenState, oldState: ScreenState | undefined): void {
    const eisEl = document.getElementsByClassName('eis')[0] as HTMLDivElement | undefined;
    if (eisEl !== undefined) {
      if (newState === ScreenState.REVERSIONARY) {
        this.eisXmlLogicHost.setIsPaused(false);
        setTimeout(() => {
          eisEl.classList.remove('hidden');
        }, 1000);
      } else if (newState === ScreenState.ON && this.isMfdPoweredOn) {
        this.onMfdPowerOn(true);
      }
    }
  }

  /**
   * Handles when the MFD powers on, to remove reversionary mode.
   * @param isPoweredOn Whether or not the MFD is powered on.
   */
  private onMfdPowerOn = (isPoweredOn: boolean): void => {
    this.isMfdPoweredOn = isPoweredOn;

    if (isPoweredOn) {
      const eisEl = document.getElementsByClassName('eis')[0] as HTMLDivElement | undefined;
      if (eisEl !== undefined) {
        setTimeout(() => {
          eisEl.classList.add('hidden');
          this.eisXmlLogicHost.setIsPaused(true);
        }, 1000);
      }
    }
  };

  /**
   * Sets whether or not the instrument is in reversionary mode.
   */
  private checkIsReversionary(): void {
    if (document.body.hasAttribute('reversionary')) {
      const attr = document.body.getAttribute('reversionary');
      if (attr == 'true') {
        this.reversionaryMode = true;
        return;
      }
    }

    if (this.screenState === ScreenState.ON && !this.isMfdPoweredOn) {
      this.screenState = ScreenState.REVERSIONARY;
      this.reversionaryMode = true;
      return;
    }

    this.reversionaryMode = false;
  }

  /**
   * A callback for when sounds are done playing.  This is needed to support the sound server.
   * @param soundEventId The sound that got played.
   */
  public onSoundEnd(soundEventId: Name_Z): void {
    this.soundServer.onSoundEnd(soundEventId);
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

registerInstrument('wtg1000-pfd', WTG1000_PFD);
