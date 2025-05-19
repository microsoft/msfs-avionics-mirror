import {
  AccelerometerPublisher, AdcPublisher, AhrsPublisher, AmbientPublisher, AutopilotInstrument, AvionicsSystem,
  BaseInstrumentPublisher, CasSystem, Clock, ClockEvents, CompositeLogicXMLHost, ControlSurfacesPublisher,
  DebounceTimer, EISPublisher, ElectricalPublisher, EventBus, FacilityLoader, FacilityRepository,
  FlightPathAirplaneSpeedMode, FlightPathAirplaneWindMode, FlightPathCalculator, FlightPlanner, FlightTimerPublisher,
  FSComponent, FsInstrument, GameStateProvider, GNSSPublisher, GPSSatComputer, HEventPublisher, InstrumentBackplane,
  LNavObsSimVarPublisher, MinimumsSimVarPublisher, NavComSimVarPublisher, NavSourceType, PluginSystem, SBASGroupName,
  SimVarValueType, SmoothingPathCalculator, Subject, TrafficInstrument, UserSetting, VNavSimVarPublisher, VNode, Wait
} from '@microsoft/msfs-sdk';

import {
  AdcSystem, AhrsSystem, AoaSystem, DefaultGpsIntegrityDataProvider, DefaultMinimumsDataProvider,
  DefaultVNavDataProvider, DefaultWindDataProvider, FmsPositionMode, FmsPositionSystem, FmsUtils,
  GarminAPSimVarPublisher, GarminSpeedConstraintStore, GarminVNavUtils, GpsNavSource, GpsReceiverSelector,
  GpsReceiverSystem, MagnetometerSystem, MarkerBeaconSystem, NavDataFieldGpsValidity, NavEventsPublisher,
  NavRadioNavSource, NavReferenceIndicatorsCollection, NavReferenceSource, NavReferenceSourceCollection, NullNavSource,
  RadarAltimeterSystem
} from '@microsoft/msfs-garminsdk';

import { G3XTouch } from '../G3XTouch';
import { Gdu460Display } from '../GduDisplay/Gdu460/Gdu460Display';
import { Gdu460PfdInstrumentsView } from '../GduDisplay/Gdu460/PfdInstruments/Gdu460PfdInstrumentsView';
import { PfdFlightPlanInset, PfdMapInset, PfdNearestAirportsInset, PfdTrafficInset } from '../GduDisplay/Gdu460/PfdInstruments/Inset/Insets';
import { PfdInsetKeys } from '../GduDisplay/Gdu460/PfdInstruments/Inset/PfdInsetKeys';
import { PfdInsetRegistrar } from '../GduDisplay/Gdu460/PfdInstruments/Inset/PfdInsetRegistrar';
import { PfdMapView } from '../GduDisplay/Gdu460/PfdMapView/PfdMapView';
import { RadioVolumeShortcutPopup } from '../GduDisplay/Gdu460/RadioVolumeShortcutPopup/RadioVolumeShortcutPopup';
import { GduDisplay } from '../GduDisplay/GduDisplay';
import { BaroPressureDialog, UiListDialog, UiMessageDialog } from '../MFD/Dialogs';
import { AirportFrequencyDialog } from '../MFD/Dialogs/AirportFrequencyDialog';
import { CourseDialog } from '../MFD/Dialogs/CourseDialog';
import { UiGenericNumberUnitDialog } from '../MFD/Dialogs/UiGenericNumberUnitDialog';
import { MfdMainPageKeys } from '../MFD/MainView/MfdMainPageKeys';
import { MfdMainPageRegistrar } from '../MFD/MainView/MfdMainPageRegistrar';
import { MfdMainView } from '../MFD/MainView/MfdMainView';
import { MfdEnginePage, MfdFplPage, MfdInfoPage, MfdMapPage, MfdTrafficPage } from '../MFD/MainView/Pages';
import { MfdWaypointPage } from '../MFD/MainView/Pages/MfdWaypointPage/MfdWaypointPage';
import { MfdNrstView } from '../MFD/NrstView/MfdNrstView';
import {
  ApproachDialog, BacklightIntensityPopup, DataBarFieldEditView, DataBarFieldSelectDialog, DataBarSetupView,
  DisplaySetupView, DuplicateWaypointDialog, MainMenuView, NoOptionsPopup, PfdOptionsView, PfdSetupView,
  SelectedAltitudeDialog, SelectedCourseDialog, SelectedHeadingDialog, SetupView, SoundSetupView, StartupView,
  TimeSetupView, UnitsSetupView, WaypointDialog, WaypointInfoPopup
} from '../MFD/Views';
import { AfcsControlsView } from '../MFD/Views/AfcsControlsView/AfcsControlsView';
import { AudioPopup } from '../MFD/Views/AudioView/AudioPopup';
import { AudioRadiosPopup } from '../MFD/Views/AudioView/AudioRadiosPopup';
import { BaroMinimumDialog } from '../MFD/Views/BaroMinimumDialog/BaroMinimumDialog';
import { ComFrequencyDialog } from '../MFD/Views/ComFrequencyDialog/ComFrequencyDialog';
import { DirectToView } from '../MFD/Views/DirectToView/DirectToView';
import { ComFindFrequencyDialog } from '../MFD/Views/FindFrequencyDialog/ComFindFrequencyDialog/ComFindFrequencyDialog';
import { ComFindFrequencyEditUserDialog } from '../MFD/Views/FindFrequencyDialog/ComFindFrequencyDialog/Tabs/User/ComFindFrequencyEditUserDialog';
import { NavFindFrequencyDialog } from '../MFD/Views/FindFrequencyDialog/NavFindFrequencyDialog/NavFindFrequencyDialog';
import { NavFindFrequencyEditUserDialog } from '../MFD/Views/FindFrequencyDialog/NavFindFrequencyDialog/Tabs/User/NavFindFrequencyEditUserDialog';
import { MfdRadioVolumePopup } from '../MFD/Views/MfdRadioVolumePopup/MfdRadioVolumePopup';
import { NavFrequencyDialog } from '../MFD/Views/NavFrequencyDialog/NavFrequencyDialog';
import { SelectRadioDialog } from '../MFD/Views/SelectRadioDialog/SelectRadioDialog';
import { TransponderView } from '../MFD/Views/TransponderView/TransponderView';
import { UserFrequencyInputDialog, UserFrequencyInputDialogType } from '../MFD/Views/UserFrequencyInputDialog/UserFrequencyInputDialog';
import { UserFrequencyNameInputDialog } from '../MFD/Views/UserFrequencyInputDialog/UserFrequencyNameInputDialog';
import { UserFrequencyNumberInputDialog } from '../MFD/Views/UserFrequencyInputDialog/UserFrequencyNumberInputDialog';
import { PfdPageRegistrar } from '../PFD/PfdPage/PfdPageRegistrar';
import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { FmsExternalFplSourceConfig } from './AvionicsConfig/FmsConfig';
import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from './AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatusClient, AvionicsStatusEventClient } from './AvionicsStatus/AvionicsStatusManager';
import { AvionicsStatus } from './AvionicsStatus/AvionicsStatusTypes';
import { G3XAutoBacklightManager } from './Backlight/G3XAutoBacklightManager';
import { G3XBacklightPublisher } from './Backlight/G3XBacklightEvents';
import { G3XBacklightManager } from './Backlight/G3XBacklightManager';
import { CasPowerStateManager } from './CAS/CasPowerStateManager';
import { G3XBuiltInChartsSourceProvider } from './Charts/G3XBuiltInChartsSourceProvider';
import { G3XChartsSource, G3XChartsSourceFactory } from './Charts/G3XChartsSource';
import { G3XNavDataBarEditController } from './Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarEditController';
import { G3XNavDataBarFieldModelFactory } from './Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarFieldModelFactory';
import { G3XNavDataBarFieldRenderer } from './Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarFieldRenderer';
import { G3XMapTerrainWxSettingCompatManager } from './Components/Map/G3XMapTerrainWxSettingCompatManager';
import { DefaultRadioSavedFrequenciesDataProvider } from './DataProviders/RadioSavedFrequenciesDataProvider';
import { ActiveFlightPlanStore } from './FlightPlan/ActiveFlightPlanStore';
import { DefaultG3XFplSourceDataProvider } from './FlightPlan/DefaultG3XFplSourceDataProvider';
import { G3XFms, G3XFmsExternalFplSourceOptions } from './FlightPlan/G3XFms';
import { FuelTotalizerSimVarPublisher } from './Fuel';
import { G3XTouchFilePaths } from './G3XTouchFilePaths';
import { G3XTouchPlugin, G3XTouchPluginBinder } from './G3XTouchPlugin';
import { G3XTouchUiComponentContext } from './G3XTouchUiComponentContext';
import { InstrumentConfig } from './InstrumentConfig/InstrumentConfig';
import { InstrumentBackplaneNames } from './Instruments/InstrumentBackplaneNames';
import { G3XNavComControlPublisher } from './NavCom/G3XNavComEventPublisher';
import { G3XNavSimVarPublisher } from './Navigation/G3XNavEvents';
import { DefaultPositionHeadingDataProvider } from './Navigation/PositionHeadingDataProvider';
import {
  G3XTouchActiveSourceNavIndicator, G3XTouchBearingPointerNavIndicator, G3XTouchNavIndicator, G3XTouchNavIndicatorName,
  G3XTouchNavIndicators, G3XTouchNavSourceName, G3XTouchNavSources
} from './NavReference/G3XTouchNavReference';
import { NearestAirportNavSource } from './NavReference/NearestAirportNavSource';
import { G3XNearestContext } from './Nearest/G3XNearestContext';
import { DefaultG3XRadiosDataProvider } from './Radio/DefaultG3XRadiosDataProvider';
import { ReversionaryModeManager } from './ReversionaryMode/ReversionaryModeManager';
import { BacklightUserSettings } from './Settings/BacklightUserSettings';
import { CnsDataBarUserSettings } from './Settings/CnsDataBarUserSettings';
import { DisplayUserSettingManager } from './Settings/DisplayUserSettings';
import { FplDisplayUserSettings } from './Settings/FplDisplayUserSettings';
import { G3XChartsUserSettingManager } from './Settings/G3XChartsUserSettings';
import { G3XDateTimeUserSettings } from './Settings/G3XDateTimeUserSettings';
import { G3XLocalUserSettingSaveManager } from './Settings/G3XLocalUserSettingSaveManager';
import { G3XUnitsUserSettings } from './Settings/G3XUnitsUserSettings';
import { GduUserSettingManager } from './Settings/GduUserSettings';
import { MapUserSettings } from './Settings/MapUserSettings';
import { PfdUserSettingManager } from './Settings/PfdUserSettings';
import { SavedFrequenciesUserSettingsManager } from './Settings/SavedFrequenciesUserSettings';
import { VSpeedUserSettingManager } from './Settings/VSpeedUserSettings';
import { UiService } from './UiSystem/UiService';
import { UiViewKeys } from './UiSystem/UiViewKeys';
import { UiViewLifecyclePolicy, UiViewStackLayer } from './UiSystem/UiViewTypes';
import { UserTimerView } from './Views';

/**
 * A common instrument for the G3X Touch.
 */
export abstract class G3XTouchFsInstrument implements FsInstrument {

  protected readonly gduDisplay = FSComponent.createRef<GduDisplay>();

  protected readonly bus = new EventBus();
  protected readonly xmlLogicHost = new CompositeLogicXMLHost();
  protected readonly casSystem = new CasSystem(this.bus, this.isPrimary);

  protected readonly config = new AvionicsConfig(this.instrument, this.instrument.xmlConfig);
  protected readonly instrumentConfig = new InstrumentConfig(
    this.instrument,
    this.config,
    this.instrument.xmlConfig,
    this.instrument.instrumentXmlConfig
  );

  protected readonly gduIndex = this.instrument.instrumentIndex;

  private isInstrumentPowered = false;
  private isPowerValid = false;
  protected isPowered: boolean | undefined = undefined;

  private readonly bootTimer = new DebounceTimer();

  protected readonly facRepo = FacilityRepository.getRepository(this.bus);
  protected readonly facLoader = new FacilityLoader(this.facRepo, undefined, {
    sharedFacilityCacheId: 'g3x',
  });

  protected readonly hEventPublisher = new HEventPublisher(this.bus);

  protected readonly flightPathCalculator = new FlightPathCalculator(
    this.facLoader,
    {
      id: 'g3x',
      initSyncRole: this.isPrimary ? 'primary' : 'replica',
      defaultClimbRate: 300,
      defaultSpeed: 50,
      bankAngle: [[10, 60], [40, 300]],
      holdBankAngle: null,
      courseReversalBankAngle: null,
      turnAnticipationBankAngle: [[10, 60], [15, 100]],
      maxBankAngle: this.config.fms.flightPathOptions.maxBankAngle,
      airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind,
      airplaneWindMode: FlightPathAirplaneWindMode.Automatic,
    },
    this.bus
  );
  protected readonly flightPlanner = FlightPlanner.getPlanner('g3x', this.bus, { calculator: this.flightPathCalculator });

  protected readonly speedConstraintStore = new GarminSpeedConstraintStore(this.bus, this.flightPlanner);

  protected readonly externalFlightPathCalculators = new Map<string, FlightPathCalculator>();
  protected readonly externalFlightPlanners = new Map<string, FlightPlanner>();

  protected readonly fms = new G3XFms(
    this.isPrimary,
    this.bus,
    this.flightPlanner,
    {
      lnavIndex: this.config.fms.lnavIndex,
      useSimObsState: this.config.fms.useSimObsState,
      facLoader: this.facLoader,
      externalFplSourceOptions: this.config.fms.externalFplSources.map(this.createExternalFplSourceOptions.bind(this))
    }
  );

  protected readonly fplSourceDataProvider = new DefaultG3XFplSourceDataProvider(
    this.bus,
    {
      fms: this.fms.internalFms,
      lnavIndex: this.config.fms.lnavIndex,
      vnavIndex: this.config.fms.vnavIndex,
      cdiId: 'g3x'
    },
    this.config.fms.externalFplSources.map(config => {
      if (!config) {
        return undefined;
      }

      return {
        externalNavigatorIndex: config.index,
        fms: this.fms.getExternalFms(config.index),
        lnavIndex: config.lnavIndex,
        vnavIndex: config.vnavIndex,
        cdiId: config.cdiId
      };
    })
  );

  protected readonly avionicsStatusClient = new AvionicsStatusClient(this.instrument.instrumentIndex, this.bus);
  protected readonly avionicsStatusEventClient = new AvionicsStatusEventClient(this.avionicsStatusClient.uid, this.bus);
  protected readonly avionicsStatusSimVar = `L:WTG3XTouch_${this.avionicsStatusClient.uid}_Avionics_Status`;

  protected readonly reversionaryModeManager = new ReversionaryModeManager(this.bus, this.config, this.gduIndex);
  protected readonly reversionaryModeSub = this.reversionaryModeManager.isReversionaryMode.sub(this.onIsReversionaryModeChanged.bind(this), false, true);

  protected readonly backplane = new InstrumentBackplane();

  protected readonly clock = new Clock(this.bus);

  protected readonly baseInstrumentPublisher = new BaseInstrumentPublisher(this.instrument, this.bus);
  protected readonly ambientPublisher = new AmbientPublisher(this.bus);
  protected readonly accelerometerPublisher = new AccelerometerPublisher(this.bus);
  protected readonly adcPublisher = new AdcPublisher(this.bus);
  protected readonly ahrsPublisher = new AhrsPublisher(this.bus);
  protected readonly gnssPublisher = new GNSSPublisher(this.bus);
  protected readonly g3xNavPublisher = new G3XNavSimVarPublisher(this.bus);
  protected readonly lNavObsPublisher = new LNavObsSimVarPublisher(this.bus);
  protected readonly vNavPublisher = new VNavSimVarPublisher(this.bus);
  protected readonly navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
  protected readonly garminAutopilotPublisher = new GarminAPSimVarPublisher(this.bus);
  protected readonly minimumsPublisher = new MinimumsSimVarPublisher(this.bus);
  protected readonly navEventsPublisher = new NavEventsPublisher(this.bus);
  protected readonly electricalPublisher = new ElectricalPublisher(this.bus);
  protected readonly eisPublisher = new EISPublisher(this.bus);
  protected readonly controlSurfacesPublisher = new ControlSurfacesPublisher(this.bus, 3);
  protected readonly timerPublisher = new FlightTimerPublisher(this.bus, { id: 'g3x' });
  protected readonly fuelTotalizerPublisher = new FuelTotalizerSimVarPublisher(this.bus);
  protected readonly navComControlPublisher = new G3XNavComControlPublisher(this.bus);
  protected readonly backlightPublisher = new G3XBacklightPublisher(this.bus);

  protected readonly apInstrument = new AutopilotInstrument(this.bus);
  protected readonly trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
  protected readonly trafficAvionicsSystem = this.config.traffic.resolve()(this.bus, this.trafficInstrument, 10000);
  protected readonly trafficSystem = this.trafficAvionicsSystem?.trafficSystem ?? null;

  protected readonly systems: AvionicsSystem[] = [];

  protected readonly navSources: G3XTouchNavSources;
  protected readonly navIndicators: G3XTouchNavIndicators;

  protected readonly gduSettingManager = new GduUserSettingManager(this.bus, this.config.gduDefs);
  protected readonly displaySettingManager = new DisplayUserSettingManager(this.bus, this.config.gduDefs.count);
  protected readonly pfdSettingManager = new PfdUserSettingManager(this.bus, this.config.gduDefs.count);
  protected readonly vSpeedSettingManager = new VSpeedUserSettingManager(this.bus, this.instrumentConfig.vSpeeds);
  protected readonly chartsSettingManager = new G3XChartsUserSettingManager(this.bus, this.config.gduDefs.count);

  protected readonly gduAliasedSettingManager = this.gduSettingManager.getAliasedManager(this.gduIndex);
  protected readonly displayAliasedSettingManager = this.displaySettingManager.getAliasedManager(this.gduIndex);
  protected readonly pfdAliasedSettingManager = this.pfdSettingManager.getAliasedManager(this.gduIndex);
  protected readonly chartsAliasedSettingManager = this.chartsSettingManager.getAliasedManager(this.gduIndex);

  protected readonly savedFrequenciesSettingManager = new SavedFrequenciesUserSettingsManager(this.bus);

  protected readonly gpsIntegrityDataProvider = new DefaultGpsIntegrityDataProvider(this.bus, this.gduIndex);
  protected readonly minimumsDataProvider = new DefaultMinimumsDataProvider(this.bus, this.config.sensors.hasRadarAltimeter);

  protected readonly gpsSatComputers: GPSSatComputer[] = [];
  protected readonly gpsReceiverSelectors: GpsReceiverSelector[] = [];

  protected readonly windDataProvider = new DefaultWindDataProvider(
    this.bus,
    this.gduAliasedSettingManager.getSetting('gduAdcIndex'),
    this.gduAliasedSettingManager.getSetting('gduAhrsIndex'),
    this.gduIndex
  );

  protected readonly vnavDataProvider = new DefaultVNavDataProvider(
    this.bus,
    this.fplSourceDataProvider.fms,
    {
      vnavIndex: this.fplSourceDataProvider.vnavIndex,
      adcIndex: this.gduAliasedSettingManager.getSetting('gduAdcIndex'),
      cdiId: this.fplSourceDataProvider.cdiId
    }
  );

  protected readonly posHeadingDataProvider = new DefaultPositionHeadingDataProvider(
    this.bus,
    this.gduIndex,
    this.gduAliasedSettingManager.getSetting('gduAhrsIndex'),
    30
  );

  protected readonly radiosDataProvider = new DefaultG3XRadiosDataProvider(this.bus, this.config.radios);

  protected readonly navComSavedFrequenciesProvider = new DefaultRadioSavedFrequenciesDataProvider(this.bus);

  protected readonly activeFlightPlanStore = new ActiveFlightPlanStore(this.fms, this.fplSourceDataProvider.source);

  protected readonly casPowerStateManager = new CasPowerStateManager(this.bus);

  protected readonly navDataFieldGpsValidity = this.gpsIntegrityDataProvider.fmsPosMode.map(mode => {
    switch (mode) {
      case FmsPositionMode.Gps:
      case FmsPositionMode.Dme:
      case FmsPositionMode.Hns:
        return NavDataFieldGpsValidity.Valid;
      case FmsPositionMode.DeadReckoning:
      case FmsPositionMode.DeadReckoningExpired:
        return NavDataFieldGpsValidity.DeadReckoning;
      default:
        return NavDataFieldGpsValidity.Invalid;
    }
  });

  protected readonly navDataBarFieldModelFactory = new G3XNavDataBarFieldModelFactory(
    this.bus,
    this.navDataFieldGpsValidity,
    {
      lnavIndex: this.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.fplSourceDataProvider.vnavIndex
    }
  );
  protected readonly navDataBarFieldRenderer = new G3XNavDataBarFieldRenderer(
    G3XUnitsUserSettings.getManager(this.bus),
    G3XDateTimeUserSettings.getManager(this.bus)
  );

  protected readonly navDataBarEditController = new G3XNavDataBarEditController();

  protected readonly mapTerrainWxSettingCompatManager = new G3XMapTerrainWxSettingCompatManager(MapUserSettings.getStandardManager(this.bus));

  protected readonly autoBacklightManager = new G3XAutoBacklightManager(
    this.gduIndex,
    this.bus,
    {
      minInputIntensity: this.instrumentConfig.backlight.photoCell.inputRange[0],
      maxInputIntensity: this.instrumentConfig.backlight.photoCell.inputRange[1],
      timeConstant: this.instrumentConfig.backlight.photoCell.timeConstant * 1000,
      gamma: this.instrumentConfig.backlight.photoCell.gamma
    }
  );
  protected readonly backlightManager = new G3XBacklightManager(
    this.gduIndex,
    this.bus,
    BacklightUserSettings.getManager(this.bus),
    this.instrumentConfig.backlight
  );

  protected readonly isPane1Visible = Subject.create(false);
  protected readonly isPane2Visible = Subject.create(false);

  protected readonly uiService: UiService;
  protected readonly mfdMainPageRegistrar = new MfdMainPageRegistrar();
  protected readonly pfdPageRegistrar = new PfdPageRegistrar();
  protected readonly pfdInsetRegistrar = new PfdInsetRegistrar();

  protected readonly pluginSystem = new PluginSystem<G3XTouchPlugin, G3XTouchPluginBinder>();

  protected localSettingSaveManager?: G3XLocalUserSettingSaveManager;

  protected readonly chartsSources: G3XChartsSource[] = [];

  /** Whether this instrument has started updating. */
  protected haveUpdatesStarted = false;

  /**
   * Creates a new instance of G3XTouchFsInstrument.
   * @param instrument This instrument's parent BaseInstrument.
   * @param isPrimary Whether this instrument is the primary instrument.
   * @throws Error
   */
  constructor(
    public readonly instrument: BaseInstrument,
    protected readonly isPrimary: boolean
  ) {
    if (!this.config.gduDefs.definitions[this.instrument.instrumentIndex]) {
      throw new Error(`G3XTouchFsInstrument: instrument was initialized with an undeclared GDU index: ${this.instrument.instrumentIndex}`);
    }

    this.backplane.addInstrument(InstrumentBackplaneNames.Clock, this.clock);
    this.backplane.addInstrument(InstrumentBackplaneNames.Autopilot, this.apInstrument);
    this.backplane.addInstrument(InstrumentBackplaneNames.Traffic, this.trafficInstrument);
    this.backplane.addPublisher(InstrumentBackplaneNames.Base, this.baseInstrumentPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.HEvents, this.hEventPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Ambient, this.ambientPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Accelerometer, this.accelerometerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Adc, this.adcPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Ahrs, this.ahrsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Gnss, this.gnssPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.G3XNav, this.g3xNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.LNavObs, this.lNavObsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.VNav, this.vNavPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavCom, this.navComSimVarPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.GarminAutopilot, this.garminAutopilotPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Minimums, this.minimumsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavEvents, this.navEventsPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Electrical, this.electricalPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Eis, this.eisPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.ControlSurfaces, this.controlSurfacesPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Timer, this.timerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.FuelTotalizer, this.fuelTotalizerPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Backlight, this.backlightPublisher);

    this.createSystems();

    const navSources: NavReferenceSource<G3XTouchNavSourceName>[] = [
      this.config.radios.navDefinitions[1]
        ? new NavRadioNavSource<G3XTouchNavSourceName>(this.bus, 'NAV1', 1)
        : new NullNavSource('NAV1', NavSourceType.Nav, 1),

      this.config.radios.navDefinitions[2]
        ? new NavRadioNavSource<G3XTouchNavSourceName>(this.bus, 'NAV2', 2)
        : new NullNavSource('NAV2', NavSourceType.Nav, 2),

      new GpsNavSource<G3XTouchNavSourceName>(this.bus, 'GPSInt', 3, {
        lnavIndex: this.fplSourceDataProvider.internalSourceDef.lnavIndex,
        vnavIndex: this.fplSourceDataProvider.internalSourceDef.vnavIndex
      }),

      this.config.fms.externalFplSources[1]
        ? new GpsNavSource<G3XTouchNavSourceName>(this.bus, 'GPS1', 1, {
          lnavIndex: this.config.fms.externalFplSources[1].lnavIndex,
          vnavIndex: this.config.fms.externalFplSources[1].vnavIndex
        })
        : new NullNavSource('GPS1', NavSourceType.Gps, 1),

      this.config.fms.externalFplSources[2]
        ? new GpsNavSource<G3XTouchNavSourceName>(this.bus, 'GPS2', 2, {
          lnavIndex: this.config.fms.externalFplSources[2].lnavIndex,
          vnavIndex: this.config.fms.externalFplSources[2].vnavIndex
        })
        : new NullNavSource('GPS2', NavSourceType.Gps, 2),

      new NearestAirportNavSource<G3XTouchNavSourceName>(this.bus, 'NRST', 4, this.gduIndex),
    ];

    this.navSources = new NavReferenceSourceCollection<G3XTouchNavSourceName>(...navSources);

    this.navIndicators = new NavReferenceIndicatorsCollection(new Map<G3XTouchNavIndicatorName, G3XTouchNavIndicator>([
      ['activeSource', new G3XTouchActiveSourceNavIndicator(this.navSources, this.bus)],
      ['bearingPointer1', new G3XTouchBearingPointerNavIndicator(this.navSources, this.bus, 1, this.pfdAliasedSettingManager)],
      ['bearingPointer2', new G3XTouchBearingPointerNavIndicator(this.navSources, this.bus, 2, this.pfdAliasedSettingManager)]
    ]));

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    // Wait until game has entered briefing or in-game mode before initializing the avionics status client. This
    // ensures that we do not publish any statuses based on erroneous power states.
    Wait.awaitSubscribable(
      GameStateProvider.get(),
      gameState => gameState === GameState.briefing || gameState === GameState.ingame,
      true
    ).then(async () => {
      this.isPowerValid = true;

      this.avionicsStatusClient.init();
      this.avionicsStatusEventClient.init();

      // Wait until updates have started before initializing the power state because instrument power is not
      // initialized until the first update.
      await Wait.awaitCondition(() => this.haveUpdatesStarted);

      if (this.isPowered === undefined) {
        this.isPowered = this.isInstrumentPowered;
        this.onPowerChanged(this.isPowered, undefined);
      }
    });

    this.activeFlightPlanStore.init();

    this.uiService = new UiService(
      this.instrument.instrumentIndex,
      this.config,
      this.instrumentConfig,
      this.bus,
      this.isPane1Visible,
      this.isPane2Visible,
      this.displayAliasedSettingManager
    );
  }

  /**
   * Creates a set of external flight plan source options from a configuration object.
   * @param config The configuration object that defines the external flight plan source for which to create options.
   * @returns A set of external flight plan source options defined by the specified configuration object.
   */
  protected createExternalFplSourceOptions(config: FmsExternalFplSourceConfig | undefined): G3XFmsExternalFplSourceOptions | undefined {
    if (!config) {
      return undefined;
    }

    let flightPathCalculator = this.externalFlightPathCalculators.get(config.flightPathCalculatorId);
    if (!flightPathCalculator) {
      flightPathCalculator = new FlightPathCalculator(
        this.facLoader,
        {
          id: config.flightPathCalculatorId,
          initSyncRole: 'replica',
          defaultClimbRate: 300,
          defaultSpeed: 50,
          bankAngle: [[10, 60], [40, 300]],
          holdBankAngle: null,
          courseReversalBankAngle: null,
          turnAnticipationBankAngle: [[10, 60], [15, 100]],
          maxBankAngle: this.config.fms.flightPathOptions.maxBankAngle,
          airplaneSpeedMode: FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind,
          airplaneWindMode: FlightPathAirplaneWindMode.Automatic,
        },
        this.bus
      );
      this.externalFlightPathCalculators.set(config.flightPathCalculatorId, flightPathCalculator);
    }

    let flightPlanner = this.externalFlightPlanners.get(config.flightPlannerId);
    if (!flightPlanner) {
      flightPlanner = FlightPlanner.getPlanner(config.flightPlannerId, this.bus, { calculator: flightPathCalculator });
      this.externalFlightPlanners.set(config.flightPlannerId, flightPlanner);
    }

    return {
      flightPlanner,
      verticalPathCalculator: config.vnavIndex >= 0
        ? new SmoothingPathCalculator(this.bus, flightPlanner, FmsUtils.PRIMARY_PLAN_INDEX, {
          index: config.vnavIndex,
          defaultFpa: 3,
          maxFpa: 6,
          isLegEligible: GarminVNavUtils.isLegVNavEligible,
          shouldUseConstraint: GarminVNavUtils.shouldUseConstraint,
          invalidateClimbConstraint: GarminVNavUtils.invalidateClimbConstraint,
          invalidateDescentConstraint: GarminVNavUtils.invalidateDescentConstraint
        })
        : undefined,
      lnavIndex: config.lnavIndex,
      useSimObsState: config.useSimObsState,
      vnavIndex: config.vnavIndex,
      cdiId: config.cdiId
    };
  }

  /**
   * Creates this instrument's avionics systems.
   */
  protected createSystems(): void {
    const altimeterIndex = this.config.gduDefs.definitions[this.gduIndex].altimeterIndex;

    const adcSystems = this.config.sensors.adcDefinitions.slice(1, this.config.sensors.adcCount + 1).map((def, index) => {
      return new AdcSystem(index + 1, this.bus, def.airspeedIndicatorIndex, altimeterIndex, def.electricity);
    });

    // Garmin GMUs seem to always be powered directly from their parent AHRS systems.
    const magnetometers = this.config.sensors.ahrsDefinitions.slice(1, this.config.sensors.ahrsCount + 1).map((def, index) => {
      return new MagnetometerSystem(index + 1, this.bus, def.electricity);
    });
    const ahrsSystems = this.config.sensors.ahrsDefinitions.slice(1, this.config.sensors.ahrsCount + 1).map((def, index) => {
      return new AhrsSystem(index + 1, this.bus, def.attitudeIndicatorIndex, def.directionIndicatorIndex, def.electricity);
    });

    const gpsSystems: GpsReceiverSystem[] = [];
    const fmsPosSystems: FmsPositionSystem[] = [];

    for (let index = 1; index <= this.config.sensors.gpsReceiverDefinitions.length; index++) {
      const def = this.config.sensors.gpsReceiverDefinitions[index];
      if (
        !def
        || (def.type === 'internal' && def.gduIndex > this.config.gduDefs.count)
      ) {
        continue;
      }

      const gpsSatComputer = this.gpsSatComputers[index] = new GPSSatComputer(
        index,
        this.bus,
        `${G3XTouchFilePaths.ASSETS_PATH}/Data/gps_ephemeris.json`,
        `${G3XTouchFilePaths.ASSETS_PATH}/Data/gps_sbas.json`,
        5000,
        def.type === 'internal' || def.supportSbas ? Object.values(SBASGroupName) : [],
        (def.type === 'internal' || (def.type === 'external' && def.isPrimary)) && this.isPrimary ? 'primary' : 'replica',
        def.type === 'internal'
          ? {
            channelCount: 12,
            satInUseMaxCount: 12,
            satInUsePdopTarget: 2,
            satInUseOptimumCount: 5
          }
          : def.options
      );

      gpsSystems.push(new GpsReceiverSystem(index, this.bus, gpsSatComputer, def.electricity));
    }

    for (let index = 1; index <= this.config.gduDefs.count; index++) {
      const gduConfig = this.config.gduDefs.definitions[index];

      const gpsReceiverSelector = this.gpsReceiverSelectors[index] = new GpsReceiverSelector(
        this.bus,
        gduConfig.fmsPosDefinition.gpsReceiverIndexes,
        { receiverPriorities: gduConfig.fmsPosDefinition.gpsReceiverIndexes }
      );

      fmsPosSystems.push(new FmsPositionSystem(
        index,
        this.bus,
        gpsReceiverSelector.selectedIndex,
        this.gduSettingManager.getAliasedManager(index).getSetting('gduAdcIndex'),
        this.gduSettingManager.getAliasedManager(index).getSetting('gduAhrsIndex'),
        undefined, undefined,
        gduConfig.fmsPosDefinition.electricity
      ));

      gpsReceiverSelector.init();
    }

    this.systems.push(
      ...magnetometers,
      ...adcSystems,
      ...ahrsSystems,
      ...gpsSystems,
      ...fmsPosSystems,
      new AoaSystem(1, this.bus, this.config.sensors.aoaDefinition.electricity),
      new MarkerBeaconSystem(1, this.bus, this.config.sensors.markerBeaconDefinition.electricity)
    );

    if (this.config.sensors.radarAltimeterDefinition !== undefined) {
      this.systems.push(new RadarAltimeterSystem(1, this.bus, this.config.sensors.radarAltimeterDefinition.electricity));
    }
  }

  /**
   * Initializes this instrument's plugins.
   */
  protected async initPlugins(): Promise<void> {
    await this.pluginSystem.addScripts(
      this.instrument.xmlConfig,
      `${this.instrument.templateID}_${this.instrument.instrumentIndex}`,
      (target) => {
        return target === 'G3XTouchv2';
      }
    );
    const pluginBinder: G3XTouchPluginBinder = {
      bus: this.bus,
      backplane: this.backplane,
      config: this.config,
      instrumentConfig: this.instrumentConfig,
      facLoader: this.facLoader,
      flightPathCalculator: this.flightPathCalculator,
      fms: this.fms,
      uiService: this.uiService,
      navIndicators: this.navIndicators,
      casSystem: this.casSystem,
      radiosDataProvider: this.radiosDataProvider,
      fplSourceDataProvider: this.fplSourceDataProvider,
      gduSettingManager: this.gduSettingManager,
      displaySettingManager: this.displaySettingManager,
      pfdSettingManager: this.pfdSettingManager
    };

    await this.pluginSystem.startSystem(pluginBinder);

    this.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      plugin.onInit();
    });
  }

  /**
   * Initializes this instrument's electronic charts sources.
   * @param pluginSystem This instrument's plugin system.
   * @throws Error if a charts source factory produces a source with an improper ID.
   */
  protected initChartSources(pluginSystem: PluginSystem<G3XTouchPlugin, G3XTouchPluginBinder>): void {
    const sourceFactories = new G3XBuiltInChartsSourceProvider().getSources();

    const pluginSourceFactories = [] as G3XChartsSourceFactory[];

    pluginSystem.callPlugins(plugin => {
      const factories = plugin.getChartsSources?.();
      if (factories) {
        pluginSourceFactories.push(...factories);
      }
    });

    for (const pluginSourceFactory of pluginSourceFactories) {
      if (pluginSourceFactory.uid === '') {
        console.warn('G3XTouchFsInstrument: electronic charts source factory with ID equal to the empty string was found and will be ignored');
        continue;
      }

      const existingSourceIndex = sourceFactories.findIndex(factory => factory.uid === pluginSourceFactory.uid);
      if (existingSourceIndex < 0) {
        sourceFactories.push(pluginSourceFactory);
      } else {
        sourceFactories[existingSourceIndex] = pluginSourceFactory;
      }
    }

    for (const factory of sourceFactories) {
      const source = factory.createSource();

      if (source.uid !== factory.uid) {
        throw new Error(`G3XTouchFsInstrument: electronic charts source factory with ID "${factory.uid}" produced a source with a different ID "${source.uid}"!`);
      }

      this.chartsSources.push(source);
    }
  }

  /**
   * Initializes persistent settings. Loads saved settings and starts auto-save. Should be called after plugins have
   * been initialized.
   */
  protected initPersistentSettings(): void {
    const globalPluginSettings: UserSetting<any>[] = [];
    const localPluginSettings: UserSetting<any>[] = [];

    this.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      if (plugin.getPersistentGlobalSettings) {
        globalPluginSettings.push(...plugin.getPersistentGlobalSettings());
      }
      if (plugin.getPersistentLocalSettings) {
        localPluginSettings.push(...plugin.getPersistentLocalSettings());
      }
    });

    this.initGlobalPersistentSettings(globalPluginSettings);
    this.initLocalPersistentSettings(localPluginSettings);
  }

  /**
   * Initializes persistent global settings. Loads saved settings and starts auto-save.
   * @param pluginSettings Global persistent settings defined by plugins.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected initGlobalPersistentSettings(pluginSettings: Iterable<UserSetting<any>>): void {
    // noop
  }

  /**
   * Initializes persistent instrument-local settings. Loads saved settings and starts auto-save.
   * @param pluginSettings Instrument-local persistent settings defined by plugins.
   */
  protected initLocalPersistentSettings(pluginSettings: Iterable<UserSetting<any>>): void {
    this.localSettingSaveManager = new G3XLocalUserSettingSaveManager(this.bus, {
      backlightSettingManager: BacklightUserSettings.getManager(this.bus),
      cnsDataBarSettingManager: CnsDataBarUserSettings.getManager(this.bus),
      mapSettingManager: MapUserSettings.getMasterManager(this.bus),
      fplDisplaySettingManager: FplDisplayUserSettings.getManager(this.bus),
      pluginSettings
    });

    const profileKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}_g3x-default-profile_local_${this.instrument.instrumentIndex}`;
    this.localSettingSaveManager.load(profileKey);
    this.localSettingSaveManager.startAutoSave(profileKey);
  }

  /**
   * Initializes this instrument's flight plans.
   */
  protected initFlightPlans(): void {
    this.initInternalFlightPlans();
    this.initExternalFlightPlans();
  }

  protected abstract initInternalFlightPlans(): Promise<void>;

  /**
   * Initializes this instrument's external flight plans.
   */
  protected async initExternalFlightPlans(): Promise<void> {
    await Promise.all(this.fplSourceDataProvider.externalSourceDefs.map(def => {
      if (def) {
        return this.initExternalFlightPlan(def.fms.flightPlanner);
      } else {
        return Promise.resolve();
      }
    }));
  }

  /**
   * Initializes this instrument's flight plans for a single external flight plan source.
   * @param flightPlanner The flight planner associated with the external flight plan source for which to initialize
   * flight plans.
   */
  protected async initExternalFlightPlan(flightPlanner: FlightPlanner): Promise<void> {
    // Wait 2 seconds to allow the external flight plan source time to initialize, then request a flight plan sync if
    // we did not receive any sync events to initialize the primary flight plan (which can happen if this instrument
    // was initialized after the external flight plan source).
    await Wait.awaitDelay(2000);
    if (!flightPlanner.hasFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX)) {
      flightPlanner.requestSync();
    }
  }

  /**
   * Gets the duration, in milliseconds, required for this instrument to boot on power up.
   * @returns The duration, in milliseconds, required for this instrument to boot on power up.
   */
  protected getBoot1Duration(): number {
    return 3500 + Math.random() * 1000;
  }

  /**
   * Gets the duration, in milliseconds, required for this instrument to boot on phase 2.
   * @returns The duration, in milliseconds, required for this instrument to boot on phase 2.
   */
  protected getBoot2Duration(): number {
    return 3500 + Math.random() * 1000;
  }

  /**
   * Registers this instrument's UI views, MFD main pages, and PFD insets. Should be called after plugins have been
   * initialized.
   */
  protected registerUiComponents(): void {
    const context: G3XTouchUiComponentContext = {
      posHeadingDataProvider: this.posHeadingDataProvider,
      minimumsDataProvider: this.minimumsDataProvider,
      windDataProvider: this.windDataProvider,
      vnavDataProvider: this.vnavDataProvider,
      comRadioSpacingDataProvider: this.radiosDataProvider.comRadioSpacingDataProvider,
      gpsSatComputers: this.gpsSatComputers,
      trafficSystem: this.trafficSystem,
      navDataFieldGpsValidity: this.navDataFieldGpsValidity,
      navDataBarFieldModelFactory: this.navDataBarFieldModelFactory,
      navDataBarFieldRenderer: this.navDataBarFieldRenderer,
      navDataBarEditController: this.navDataBarEditController,
      mfdMainPageRegistrar: this.mfdMainPageRegistrar,
      pfdPageRegistrar: this.pfdPageRegistrar,
      pfdInsetRegistrar: this.uiService.gduFormat === '460' ? this.pfdInsetRegistrar : undefined,
      chartsSources: this.chartsSources
    };

    this.registerViews(context);
    this.registerMfdMainPages(context);
    this.registerPfdPages(context);
    this.registerPfdInsets(context);
  }

  /**
   * Registers this instrument's UI views. Should be called after plugins have been initialized.
   * @param context References to items used to create the base G3X Touch's UI views.
   */
  protected registerViews(context: Readonly<G3XTouchUiComponentContext>): void {
    // ---- PFD Popup Views ----

    this.uiService.registerPfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.UserTimer, (uiService, containerRef) => {
      return (
        <UserTimerView uiService={uiService} containerRef={containerRef} />
      );
    });

    if (this.uiService.gduFormat === '460') {
      this.uiService.registerPfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.RadioVolumeShortcutPopup, (uiService, containerRef) => {
        return (
          <RadioVolumeShortcutPopup
            uiService={uiService}
            containerRef={containerRef}
            radiosConfig={this.config.radios}
            radiosDataProvider={this.radiosDataProvider}
          />
        );
      });
    }

    // ---- MFD Main Layer Views ----

    this.uiService.registerMfdView(UiViewStackLayer.Main, UiViewLifecyclePolicy.Transient, UiViewKeys.Startup, (uiService, containerRef) => {
      return (
        <StartupView uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Main, UiViewLifecyclePolicy.Static, UiViewKeys.MfdMain, (uiService, containerRef) => {
      return (
        <MfdMainView uiService={uiService} containerRef={containerRef} pageRegistrar={context.mfdMainPageRegistrar} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Main, UiViewLifecyclePolicy.Static, UiViewKeys.MfdNrst, (uiService, containerRef) => {
      return (
        <MfdNrstView
          uiService={uiService} containerRef={containerRef}
          facLoader={this.facLoader}
          trafficSystem={context.trafficSystem}
          posHeadingDataProvider={context.posHeadingDataProvider}
          fplSourceDataProvider={this.fplSourceDataProvider}
          comRadioSpacingDataProvider={context.comRadioSpacingDataProvider}
          gduSettingManager={this.gduAliasedSettingManager}
          mapConfig={this.config.map}
        />
      );
    });

    // ---- MFD Overlay Layer Views ----

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.MainMenu, (uiService, containerRef) => {
      return (
        <MainMenuView
          uiService={uiService} containerRef={containerRef}
          config={this.config}
          radiosDataProvider={this.radiosDataProvider}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.PfdOptions, (uiService, containerRef) => {
      return (
        <PfdOptionsView
          uiService={uiService} containerRef={containerRef}
          insetRegistrar={this.pfdInsetRegistrar}
          activeNavIndicator={this.navIndicators.get('activeSource')}
          minimumsDataProvider={context.minimumsDataProvider}
          pfdSettingManager={this.pfdAliasedSettingManager}
          fmsConfig={this.config.fms}
          radiosConfig={this.config.radios}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.UserTimer, (uiService, containerRef) => {
      return (
        <UserTimerView uiService={uiService} containerRef={containerRef} />
      );
    });

    if (this.config.audio.audioPanel) {
      this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.AudioPopup, (uiService, containerRef) => {
        return (
          <AudioPopup uiService={uiService} containerRef={containerRef} radiosConfig={this.config.radios} />
        );
      });

      this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.AudioRadiosPopup, (uiService, containerRef) => {
        return (
          <AudioRadiosPopup uiService={uiService} containerRef={containerRef} radiosConfig={this.config.radios} />
        );
      });
    }

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, UiViewKeys.DirectTo, (uiService, containerRef) => {
      return (
        <DirectToView
          uiService={uiService}
          containerRef={containerRef}
          posHeadingDataProvider={context.posHeadingDataProvider}
          fplSourceDataProvider={this.fplSourceDataProvider}
          fms={this.fms}
          gduSettingManager={this.gduAliasedSettingManager}
          mapConfig={this.config.map}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.Setup, (uiService, containerRef) => {
      return (
        <SetupView uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.DataBarSetup, (uiService, containerRef) => {
      return (
        <DataBarSetupView
          uiService={uiService} containerRef={containerRef}
          config={this.config}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.DataBarFieldEdit, (uiService, containerRef) => {
      return (
        <DataBarFieldEditView
          uiService={uiService}
          containerRef={containerRef}
          navDataBarEditController={context.navDataBarEditController}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, UiViewKeys.DataBarFieldSelectDialog, (uiService, containerRef) => {
      return (
        <DataBarFieldSelectDialog
          uiService={uiService}
          containerRef={containerRef}
          navDataBarFieldModelFactory={context.navDataBarFieldModelFactory}
          navDataBarFieldRenderer={context.navDataBarFieldRenderer}
          navDataFieldGpsValidity={context.navDataFieldGpsValidity}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.DisplaySetup, (uiService, containerRef) => {
      return (
        <DisplaySetupView
          uiService={uiService}
          containerRef={containerRef}
          displaySettingManager={this.displayAliasedSettingManager}
          chartsSettingManager={this.chartsAliasedSettingManager}
          config={this.config}
          instrumentConfig={this.instrumentConfig}
          pfdPageDefs={context.pfdPageRegistrar.getRegisteredPagesArray()}
          chartsSources={context.chartsSources}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.UnitsSetup, (uiService, containerRef) => {
      return (
        <UnitsSetupView uiService={uiService} containerRef={containerRef} unitsConfig={this.config.units} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.TimeSetup, (uiService, containerRef) => {
      return (
        <TimeSetupView uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.SoundSetup, (uiService, containerRef) => {
      return (
        <SoundSetupView uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.PfdSetup, (uiService, containerRef) => {
      return (
        <PfdSetupView
          uiService={uiService}
          containerRef={containerRef}
          supportSvt={!this.instrumentConfig.bingMapOptimization.disableSvt}
          pfdSettingManager={this.pfdAliasedSettingManager}
        />
      );
    });

    if (this.config.transponder) {
      this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.Transponder, (uiService, containerRef) => {
        return (
          <TransponderView
            uiService={uiService}
            containerRef={containerRef}
            transponderConfig={this.config.transponder!}
          />
        );
      });
    }

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.AfcsControlsView, (uiService, containerRef) => {
      return (
        <AfcsControlsView uiService={uiService} containerRef={containerRef} hasYawDamper={false} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, UiViewKeys.WaypointInfoPopup, (uiService, containerRef) => {
      return (
        <WaypointInfoPopup
          uiService={uiService} containerRef={containerRef}
          fms={this.fms}
          posHeadingDataProvider={context.posHeadingDataProvider}
          fplSourceDataProvider={this.fplSourceDataProvider}
          radiosDataProvider={this.radiosDataProvider}
          comRadioSpacingDataProvider={context.comRadioSpacingDataProvider}
          gduSettingManager={this.gduAliasedSettingManager}
          displaySettingManager={this.displayAliasedSettingManager}
          chartsSettingManager={this.chartsAliasedSettingManager}
          mapConfig={this.config.map}
          chartsConfig={this.config.charts}
          radiosConfig={this.config.radios}
          chartsSources={context.chartsSources}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.MfdRadioVolumePopup, (uiService, containerRef) => {
      return (
        <MfdRadioVolumePopup
          uiService={uiService}
          containerRef={containerRef}
          radiosConfig={this.config.radios}
          radiosDataProvider={this.radiosDataProvider}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.BacklightIntensityPopup, (uiService, containerRef) => {
      return (
        <BacklightIntensityPopup
          uiService={uiService} containerRef={containerRef}
          backlightConfig={this.instrumentConfig.backlight}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.NoOptionsPopup, (uiService, containerRef) => {
      return (
        <NoOptionsPopup uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.ComFrequencyDialog, (uiService, containerRef) => {
      return (
        <ComFrequencyDialog
          uiService={uiService}
          containerRef={containerRef}
          radiosConfig={this.config.radios}
          radiosDataProvider={this.radiosDataProvider}
          useRadioVolumeShortcut={CnsDataBarUserSettings.getManager(this.uiService.bus).getSetting('cnsDataBarRadioVolumeShortcutShow')}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.ComFindFrequencyDialog, (uiService, containerRef) => {
      return (
        <ComFindFrequencyDialog
          uiService={uiService}
          containerRef={containerRef}
          savedFrequenciesProvider={this.navComSavedFrequenciesProvider}
          posHeadingDataProvider={context.posHeadingDataProvider}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.ComFindFrequencyEditUserDialog, (uiService, containerRef) => {
      return (
        <ComFindFrequencyEditUserDialog uiService={uiService} containerRef={containerRef} savedFrequenciesDataProvider={this.navComSavedFrequenciesProvider} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.ComFindFrequencyAddUserDialog, (uiService, containerRef) => {
      return (
        <UserFrequencyInputDialog
          uiService={uiService}
          containerRef={containerRef}
          type={UserFrequencyInputDialogType.Com}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.UserFrequencyNumberInputDialog, (uiService, containerRef) => {
      return (
        <UserFrequencyNumberInputDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.UserFrequencyNameInputDialog, (uiService, containerRef) => {
      return (
        <UserFrequencyNameInputDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.NavFrequencyDialog, (uiService, containerRef) => {
      return (
        <NavFrequencyDialog
          uiService={uiService}
          containerRef={containerRef}
          radiosConfig={this.config.radios}
          radiosDataProvider={this.radiosDataProvider}
          useRadioVolumeShortcut={CnsDataBarUserSettings.getManager(this.uiService.bus).getSetting('cnsDataBarRadioVolumeShortcutShow')}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.NavFindFrequencyDialog, (uiService, containerRef) => {
      return (
        <NavFindFrequencyDialog
          uiService={uiService}
          containerRef={containerRef}
          savedFrequenciesProvider={this.navComSavedFrequenciesProvider}
          posHeadingDataProvider={context.posHeadingDataProvider}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.NavFindFrequencyEditUserDialog, (uiService, containerRef) => {
      return (
        <NavFindFrequencyEditUserDialog uiService={uiService} containerRef={containerRef} savedFrequenciesDataProvider={this.navComSavedFrequenciesProvider} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.NavFindFrequencyAddUserDialog, (uiService, containerRef) => {
      return (
        <UserFrequencyInputDialog
          uiService={uiService}
          containerRef={containerRef}
          type={UserFrequencyInputDialogType.Nav}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.AirportFrequencyDialog, (uiService, containerRef) => {
      return (
        <AirportFrequencyDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.WaypointDialog, (uiService, containerRef) => {
      return (
        <WaypointDialog uiService={uiService} containerRef={containerRef} fms={this.fms} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.DuplicateWaypointDialog, (uiService, containerRef) => {
      return (
        <DuplicateWaypointDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.SelectRadioDialog, (uiService, containerRef) => {
      return (
        <SelectRadioDialog
          uiService={uiService} containerRef={containerRef}
          radiosDataProvider={this.radiosDataProvider}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, UiViewKeys.ApproachDialog, (uiService, containerRef) => {
      return (
        <ApproachDialog
          uiService={uiService} containerRef={containerRef}
          flightPathCalculator={this.flightPathCalculator}
          fms={this.fms}
          gduSettingManager={this.gduAliasedSettingManager}
          mapConfig={this.config.map}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Persistent, UiViewKeys.ListDialog1, (uiService, containerRef) => {
      return (
        <UiListDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.MessageDialog1, (uiService, containerRef) => {
      return (
        <UiMessageDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.GenericNumberUnitDialog1, (uiService, containerRef) => {
      return (
        <UiGenericNumberUnitDialog uiService={uiService} containerRef={containerRef} />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.SelectedAltitudeDialog, (uiService, containerRef) => {
      return (
        <SelectedAltitudeDialog
          uiService={uiService} containerRef={containerRef}
          gduSettingManager={this.gduAliasedSettingManager}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.BaroPressureDialog, (uiService, containerRef) => {
      return (
        <BaroPressureDialog
          uiService={uiService} containerRef={containerRef}
          gduSettingManager={this.gduAliasedSettingManager}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.BaroMinimumDialog, (uiService, containerRef) => {
      return (
        <BaroMinimumDialog
          uiService={uiService} containerRef={containerRef}
          minimumsDataProvider={context.minimumsDataProvider}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.SelectedHeadingDialog, (uiService, containerRef) => {
      return (
        <SelectedHeadingDialog
          uiService={uiService} containerRef={containerRef}
          gduSettingManager={this.gduAliasedSettingManager}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.SelectedCourseDialog, (uiService, containerRef) => {
      return (
        <SelectedCourseDialog
          uiService={uiService} containerRef={containerRef}
        />
      );
    });

    this.uiService.registerMfdView(UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, UiViewKeys.CourseDialog, (uiService, containerRef) => {
      return (
        <CourseDialog
          uiService={uiService} containerRef={containerRef}
        />
      );
    });

    this.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      plugin.registerUiViews?.(this.uiService, context);
    });
  }

  /**
   * Registers this instrument's MFD main pages. Should be called after plugins have been initialized.
   * @param context References to items used to create the base G3X Touch's MFD main pages.
   */
  protected registerMfdMainPages(context: Readonly<G3XTouchUiComponentContext>): void {
    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.Map,
      label: 'Map',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_map.png`,
      selectLabel: 'Map',
      order: 0,
      factory: (uiService, containerRef) => {
        return (
          <MfdMapPage
            uiService={uiService} containerRef={containerRef}
            facLoader={this.facLoader}
            trafficSystem={context.trafficSystem}
            fplSourceDataProvider={this.fplSourceDataProvider}
            gduSettingManager={this.gduAliasedSettingManager}
            displaySettingManager={this.displayAliasedSettingManager}
            mapConfig={this.config.map}
          />
        );
      }
    });

    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.Chart,
      label: 'Cht',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_en_route_chart.png`,
      selectLabel: 'Enroute\nCharts',
      order: 1,
    });

    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.Waypoint,
      label: 'Wpt',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_waypoint_info.png`,
      selectLabel: 'Waypoint',
      order: 2,
      factory: (uiService, containerRef) => {
        return (
          <MfdWaypointPage
            uiService={uiService} containerRef={containerRef}
            fms={this.fms}
            posHeadingDataProvider={context.posHeadingDataProvider}
            fplSourceDataProvider={this.fplSourceDataProvider}
            radiosDataProvider={this.radiosDataProvider}
            comRadioSpacingDataProvider={context.comRadioSpacingDataProvider}
            gduSettingManager={this.gduAliasedSettingManager}
            displaySettingManager={this.displayAliasedSettingManager}
            chartsSettingManager={this.chartsAliasedSettingManager}
            mapConfig={this.config.map}
            chartsConfig={this.config.charts}
            radiosConfig={this.config.radios}
            chartsSources={context.chartsSources}
          />
        );
      },
    });

    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.FlightPlan,
      label: 'FPL',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_fpl.png`,
      selectLabel: 'Active\nFlight Plan',
      order: 3,
      factory: (uiService, containerRef) => {
        return (
          <MfdFplPage
            uiService={uiService} containerRef={containerRef}
            fms={this.fms}
            trafficSystem={context.trafficSystem}
            fplSourceDataProvider={this.fplSourceDataProvider}
            flightPlanStore={this.activeFlightPlanStore}
            gduSettingManager={this.gduAliasedSettingManager}
            flightPlanningConfig={this.config.fms.flightPlanning}
            mapConfig={this.config.map}
            unitsConfig={this.config.units}
          />
        );
      }
    });

    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.Weather,
      label: 'Wx',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_weather.png`,
      selectLabel: 'Weather',
      order: 4,
    });

    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.Terrain,
      label: 'Ter',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_terrain.png`,
      selectLabel: 'Terrain',
      order: 5,
    });

    if (context.trafficSystem) {
      this.mfdMainPageRegistrar.registerPage({
        key: MfdMainPageKeys.Traffic,
        label: 'Trf',
        selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_traffic.png`,
        selectLabel: 'Traffic',
        order: 6,
        factory: (uiService, containerRef) => {
          return (
            <MfdTrafficPage
              uiService={uiService} containerRef={containerRef}
              facLoader={this.facLoader}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              trafficSystem={context.trafficSystem!}
              trafficSource={this.config.traffic.source}
              fplSourceDataProvider={this.fplSourceDataProvider}
              gduSettingManager={this.gduAliasedSettingManager}
              displaySettingManager={this.displayAliasedSettingManager}
              mapConfig={this.config.map}
            />
          );
        }
      });
    }

    this.mfdMainPageRegistrar.registerPage({
      key: MfdMainPageKeys.Info,
      label: 'Info',
      selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_gps_info.png`,
      selectLabel: 'Info',
      order: 7,
      factory: (uiService, containerRef) => (
        <MfdInfoPage
          uiService={uiService} containerRef={containerRef}
          gpsReceiverDefs={this.config.sensors.gpsReceiverDefinitions}
          gduDefsConfig={this.config.gduDefs}
          gpsSatComputers={context.gpsSatComputers}
        />
      )
    });

    this.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      plugin.registerMfdMainPages?.(this.mfdMainPageRegistrar, context);
    });

    if (this.config.engine.includeEnginePage) {
      // If the engine page is configured to be included, then check if it is already registered (by a plugin).
      // If not, then register one based on the panel.xml configuration.
      if (!this.mfdMainPageRegistrar.isPageRegistered(MfdMainPageKeys.Engine)) {
        this.mfdMainPageRegistrar.registerPage({
          key: MfdMainPageKeys.Engine,
          label: 'Eng',
          selectIconSrc: `${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_engine.png`,
          selectLabel: 'Engine',
          order: 8,
          factory: (uiService, containerRef) => {
            return (
              <MfdEnginePage
                uiService={uiService} containerRef={containerRef}
                xmlLogicHost={this.xmlLogicHost}
                gduSettingManager={this.gduAliasedSettingManager}
                unitsConfig={this.config.units}
                enginePageDefinition={this.config.engine.parseEnginePage(this.bus)}
              />
            );
          }
        });
      }
    } else {
      // If the engine page is not configured to be included, then make sure that it is unregistered in case any
      // plugins tried to register it.
      this.mfdMainPageRegistrar.unregisterPage(MfdMainPageKeys.Engine);
    }
  }

  /**
   * Registers this instrument's PFD pages. Should be called after plugins have been initialized.
   * @param context References to items used to create the base G3X Touch's PFD pages.
   */
  protected registerPfdPages(context: Readonly<G3XTouchUiComponentContext>): void {
    // ---- PFD Instruments View ----
    this.registerPfdInstrumentsPage(context);

    if (this.uiService.gduFormat === '460' && this.uiService.instrumentType === 'MFD') {
      // ---- PFD Map View ----
      this.pfdPageRegistrar.registerPage({
        key: UiViewKeys.PfdMap,
        order: 0,
        selectLabel: 'Map',
        lifecyclePolicy: UiViewLifecyclePolicy.Static,
        factory: this.instrumentConfig.bingMapOptimization.disablePfdMaps
          ? undefined
          : (uiService, containerRef) => {
            return (
              <PfdMapView
                uiService={uiService}
                containerRef={containerRef}
                facLoader={this.facLoader}
                trafficSystem={context.trafficSystem}
                fplSourceDataProvider={this.fplSourceDataProvider}
                gduSettingManager={this.gduAliasedSettingManager}
                displaySettingManager={this.displayAliasedSettingManager}
                mapConfig={this.config.map}
              />
            );
          }
      });

      // ---- PFD Charts View ----
      this.pfdPageRegistrar.registerPage({
        key: UiViewKeys.PfdCharts,
        order: 1,
        selectLabel: 'En Route Charts'
      });
    }

    this.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      plugin.registerPfdPages?.(this.pfdPageRegistrar, context);
    });

    // If a plugin unregistered the PFD instruments page, then we need to register the default one again because it is
    // a required page.
    if (!this.pfdPageRegistrar.isPageRegistered(UiViewKeys.PfdInstruments)) {
      this.registerPfdInstrumentsPage(context);
    }

    // Register PFD page views with the UI service.
    for (const pageDef of this.pfdPageRegistrar.getRegisteredPagesArray()) {
      if (pageDef.factory) {
        this.uiService.registerPfdView(UiViewStackLayer.Main, pageDef.lifecyclePolicy ?? UiViewLifecyclePolicy.Static, pageDef.key, pageDef.factory);
      }
    }
  }

  /**
   * Registers this instrument's PFD instruments view page.
   * @param context References to items used to create the base G3X Touch's PFD pages.
   */
  protected registerPfdInstrumentsPage(context: Readonly<G3XTouchUiComponentContext>): void {
    // TODO: Support GDU470 (portrait) display
    this.pfdPageRegistrar.registerPage({
      key: UiViewKeys.PfdInstruments,
      order: 2,
      selectLabel: 'PFD',
      lifecyclePolicy: UiViewLifecyclePolicy.Static,
      factory: (uiService, containerRef) => {
        return (
          <Gdu460PfdInstrumentsView
            uiService={uiService}
            containerRef={containerRef}
            config={this.config}
            instrumentConfig={this.instrumentConfig}
            pluginSystem={this.pluginSystem}
            navIndicators={this.navIndicators}
            insetRegistrar={this.pfdInsetRegistrar}
            fplSourceDataProvider={this.fplSourceDataProvider}
            windDataProvider={context.windDataProvider}
            vnavDataProvider={context.vnavDataProvider}
            minimumsDataProvider={context.minimumsDataProvider}
            casSystem={this.casSystem}
            gduAliasedSettingManager={this.gduAliasedSettingManager}
            pfdSettingManager={this.pfdAliasedSettingManager}
            vSpeedSettingManager={this.vSpeedSettingManager}
          />
        );
      }
    });
  }

  /**
   * Registers this instrument's PFD insets. Should be called after plugins have been initialized.
   * @param context References to items used to create the base G3X Touch's PFD insets.
   */
  protected registerPfdInsets(context: Readonly<G3XTouchUiComponentContext>): void {
    if (this.instrumentConfig.gduFormat === '470') {
      return;
    }

    this.pfdInsetRegistrar.registerInset({
      key: PfdInsetKeys.Map,
      selectLabel: 'Map',
      order: 0,
      factory: this.instrumentConfig.bingMapOptimization.disablePfdMaps
        ? undefined
        : (side, uiService) => {
          return (
            <PfdMapInset
              side={side}
              uiService={uiService}
              facLoader={this.facLoader}
              trafficSystem={context.trafficSystem}
              fplSourceDataProvider={this.fplSourceDataProvider}
              gduSettingManager={this.gduAliasedSettingManager}
              displaySettingManager={this.displayAliasedSettingManager}
              mapConfig={this.config.map}
            />
          );
        }
    });

    if (context.trafficSystem) {
      this.pfdInsetRegistrar.registerInset({
        key: PfdInsetKeys.Traffic,
        selectLabel: 'Traffic',
        order: 1,
        factory: (side, uiService) => {
          return (
            <PfdTrafficInset
              side={side}
              uiService={uiService}
              facLoader={this.facLoader}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              trafficSystem={context.trafficSystem!}
              trafficSource={this.config.traffic.source}
              fplSourceDataProvider={this.fplSourceDataProvider}
              gduSettingManager={this.gduAliasedSettingManager}
              displaySettingManager={this.displayAliasedSettingManager}
              mapConfig={this.config.map}
            />
          );
        }
      });
    }

    this.pfdInsetRegistrar.registerInset({
      key: PfdInsetKeys.FlightPlan,
      selectLabel: 'Flight Plan',
      order: 2,
      factory: (side, uiService) => {
        return (
          <PfdFlightPlanInset
            side={side}
            uiService={uiService}
            fms={this.fms}
            fplSourceDataProvider={this.fplSourceDataProvider}
            flightPlanningConfig={this.config.fms.flightPlanning}
          />
        );
      }
    });

    this.pfdInsetRegistrar.registerInset({
      key: PfdInsetKeys.NearestAirports,
      selectLabel: 'Nearest Airports',
      order: 3,
      factory: (side, uiService) => {
        return (
          <PfdNearestAirportsInset
            side={side}
            uiService={uiService}
            posHeadingDataProvider={context.posHeadingDataProvider}
          />
        );
      }
    });

    this.pluginSystem.callPlugins((plugin: G3XTouchPlugin) => {
      plugin.registerPfdInsets?.(this.pfdInsetRegistrar, context);
    });
  }

  /**
   * Initializes this instrument's nearest context.
   */
  protected async initNearestContext(): Promise<void> {
    await this.facLoader.awaitInitialization();

    const context = G3XNearestContext.initializeInstance(this.facLoader, this.bus, this.gduIndex);

    this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(0.5).handle(() => {
      context.update();
    });
  }

  /**
   * Initializes this instrument's avionics status listener. Once intialized, the listener will call this instrument's
   * `onAvionicsStatusChanged()` method as appropriate.
   */
  protected initAvionicsStatusListener(): void {
    this.bus.getSubscriber<AvionicsStatusEvents>().on(`avionics_status_${this.avionicsStatusClient.uid}`).handle(this.onAvionicsStatusChanged.bind(this));
  }

  /**
   * Renders this instrument's display components. Should be called after plugins have been initialized.
   * @returns This instrument's rendered display components, as a VNode.
   */
  protected renderComponents(): VNode {
    // TODO: Support GDU470 (7" portrait).
    return (
      <>
        <Gdu460Display
          ref={this.gduDisplay}
          config={this.config}
          instrumentConfig={this.instrumentConfig}
          pluginSystem={this.pluginSystem}
          xmlLogicHost={this.xmlLogicHost}
          bus={this.bus}
          fms={this.fms}
          uiService={this.uiService}
          gpsIntegrityDataProvider={this.gpsIntegrityDataProvider}
          radiosDataProvider={this.radiosDataProvider}
          navDataBarFieldModelFactory={this.navDataBarFieldModelFactory}
          navDataBarFieldRenderer={this.navDataBarFieldRenderer}
          navDataFieldGpsValidity={this.navDataFieldGpsValidity}
          navDataBarEditController={this.navDataBarEditController}
          displaySettingManager={this.displayAliasedSettingManager}
          pfdSettingManager={this.pfdAliasedSettingManager}
          isPane1Visible={this.isPane1Visible}
          isPane2Visible={this.isPane2Visible}
          onChecklistHighlightRendered={ref => { (this.instrument as G3XTouch).setHighlightElement(ref.instance); }}
        />
      </>
    );
  }

  /** @inheritdoc */
  public Update(): void {
    this.haveUpdatesStarted = true;
    this.backplane.onUpdate();
    this.xmlLogicHost.update(this.instrument.deltaTime);
    this.updateSystems();
  }

  /**
   * Updates this instrument's systems.
   */
  protected updateSystems(): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].onUpdate();
    }
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInteractionEvent(args: string[]): void {
    this.hEventPublisher.dispatchHEvent(args[0]);
  }

  /** @inheritdoc */
  public onFlightStart(): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    // noop
  }

  /**
   * A callback which is executed when this instrument transitions from a power-off to power-on state.
   */
  public onPowerOn(): void {
    this.isInstrumentPowered = true;

    if (this.isPowerValid) {
      const old = this.isPowered;
      this.isPowered = true;

      if (old !== true) {
        this.onPowerChanged(true, old);
      }
    }
  }

  /**
   * A callback which is executed when this instrument transitions from a power-on to power-off state.
   */
  public onPowerOff(): void {
    this.isInstrumentPowered = false;

    if (this.isPowerValid) {
      const old = this.isPowered;
      this.isPowered = false;

      if (old !== false) {
        this.onPowerChanged(false, old);
      }
    }
  }

  /**
   * Responds to when this instrument's power state changes.
   * @param current The current power state.
   * @param previous The previous power state, or `undefined` if the previous state was invalid.
   */
  protected onPowerChanged(current: boolean, previous: boolean | undefined): void {
    if (current) {
      if (previous === undefined) {
        // The instrument started in a powered state, so we skip bootup and set the status to ON.
        this.bootTimer.clear();
        this.reversionaryModeManager.activate();
        this.reversionaryModeSub.resume(true);
      } else {
        // The instrument transitioned from an unpowered to a powered state, so perform bootup.
        this.avionicsStatusClient.setStatus(AvionicsStatus.Booting1);
        this.bootTimer.schedule(this.onBoot1Finished.bind(this), this.getBoot1Duration());
      }
    } else {
      this.bootTimer.clear();
      this.reversionaryModeSub.pause();
      this.reversionaryModeManager.deactivate();
      this.avionicsStatusClient.setStatus(AvionicsStatus.Off);
    }
  }

  /**
   * Responds to when this instrument is finished booting phase 1.
   */
  protected onBoot1Finished(): void {
    this.avionicsStatusClient.setStatus(AvionicsStatus.Booting2);
    this.bootTimer.schedule(this.onBoot2Finished.bind(this), this.getBoot2Duration());
  }

  /**
   * Responds to when this instrument is finished booting phase 2.
   */
  protected onBoot2Finished(): void {
    this.reversionaryModeManager.activate();
    this.reversionaryModeSub.resume(true);
  }

  /**
   * Responds to when whether reversionary mode should be active changes while this instrument is powered and booted.
   * @param isReversionaryMode Whether reversionary mode should be active.
   */
  protected onIsReversionaryModeChanged(isReversionaryMode: boolean): void {
    this.avionicsStatusClient.setStatus(isReversionaryMode ? AvionicsStatus.Reversionary : AvionicsStatus.On);
  }

  /**
   * Responds to when the avionics status of this instrument changes.
   * @param event The event describing the avionics status change.
   */
  protected onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    if (event.current === AvionicsStatus.Off) {
      this.autoBacklightManager.sleep();
      this.backlightManager.sleep();
    } else {
      this.autoBacklightManager.wake();
      const backlightSettingManager = BacklightUserSettings.getManager(this.bus);
      if (this.instrumentConfig.backlight.defaultMode !== null) {
        backlightSettingManager.getSetting('displayBacklightMode').value = this.instrumentConfig.backlight.defaultMode;
      }
      backlightSettingManager.getSetting('displayBacklightManualLevel').resetToDefault();
      this.backlightManager.wake();
    }

    SimVar.SetSimVarValue(this.avionicsStatusSimVar, SimVarValueType.Number, event.current);

    this.uiService.setReversionaryMode(event.current === AvionicsStatus.Reversionary);

    this.gduDisplay.instance.onAvionicsStatusChanged(event);
  }
}
