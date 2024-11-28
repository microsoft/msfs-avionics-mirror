import {
  AuralAlertActivation, AuralAlertControlEvents, AuralAlertRegistrationManager, CasSystem,
  DefaultTcasAdvisoryDataProvider, EventBus, FSComponent, MappedSubject, PluginSystem, SetSubject, Subject,
  UserSettingManager, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  AltimeterDataProvider, AltitudeAlerter, AltitudeAlertState, DateTimeUserSettings,
  DefaultAirspeedIndicatorDataProvider, DefaultAoaDataProvider, DefaultMarkerBeaconDataProvider,
  DefaultNavStatusBoxDataProvider, DefaultObsSuspDataProvider, DefaultTcasRaCommandDataProvider, DmeUserSettings, Fms,
  FmsPositionMode, GpsIntegrityDataProvider, HsiGpsIntegrityAnnunciationMode, MinimumsAlerter, MinimumsAlertState,
  MinimumsDataProvider, PfdDeclutterManager, RadarAltimeterDataProvider, SoftKeyBar, SoftKeyMenuSystem,
  TerrainSystemStateDataProvider, TrafficSystem, TrafficSystemType, UnitsUserSettings, VNavDataProvider,
  WaypointAlertComputer, WindDataProvider
} from '@microsoft/msfs-garminsdk';

import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, AvionicsConfig, AvionicsStatus, AvionicsStatusChangeEvent,
  AvionicsStatusEvents, AvionicsStatusUtils, DisplayPaneIndex, DisplayPaneSizeMode, DisplayPaneView,
  DisplayPaneViewEvent, DisplayPaneViewProps, G3000AuralAlertIds, G3000AuralAlertUtils, G3000DmeInfoNavIndicator,
  G3000FullCASDisplay2, G3000NavIndicators, G3000NavInfoNavIndicator, MapUserSettings, PfdAliasedUserSettingTypes,
  PfdMapLayoutSettingMode, PfdSensorsUserSettingManager, SoftKeyUtils, VSpeedUserSettingManager
} from '@microsoft/msfs-wtg3000-common';

import { PfdConfig } from '../../Config/PfdConfig';
import { G3000PfdPlugin, G3000PfdPluginBinder } from '../../G3000PFDPlugin';
import { AdcSettingsSoftKeyMenu } from '../../SoftKey/AdcSettingsSoftKeyMenu';
import { AhrsSettingsSoftKeyMenu } from '../../SoftKey/AhrsSettingsSoftKeyMenu';
import { AltitudeUnitsSoftKeyMenu } from '../../SoftKey/AltitudeUnitsSoftKeyMenu';
import { AttitudeOverlaysSoftKeyMenu } from '../../SoftKey/AttitudeOverlaysSoftKeyMenu';
import { DataLinkSettingsSoftKeyMenu } from '../../SoftKey/DataLinkSettingsSoftKeyMenu';
import { MapLayoutSoftKeyMenu } from '../../SoftKey/MapLayoutSoftKeyMenu';
import { MapOverlays1SoftKeyMenu, MapOverlays2SoftKeyMenu } from '../../SoftKey/MapOverlaysSoftKeyMenu';
import { OtherPfdSettingsSoftKeyMenu } from '../../SoftKey/OtherPfdSettingsSoftKeyMenu';
import { PfdMapSettingsSoftKeyMenu } from '../../SoftKey/PfdMapSettingsSoftKeyMenu';
import { PfdRootSoftKeyMenu } from '../../SoftKey/PfdRootSoftKeyMenu';
import { PfdSettingsSoftKeyMenu } from '../../SoftKey/PfdSettingsSoftKeyMenu';
import { SensorsSoftKeyMenu } from '../../SoftKey/SensorsSoftKeyMenu';
import { SvtSettingsSoftKeyMenu } from '../../SoftKey/SvtSettingsSoftKeyMenu';
import { WindSoftKeyMenu } from '../../SoftKey/WindSoftKeyMenu';
import { G3000AirspeedIndicator } from '../Airspeed/G3000AirspeedIndicator';
import { G3000Altimeter } from '../Altimeter/G3000Altimeter';
import { RadarAltimeter } from '../Altimeter/RadarAltimeter';
import { AoaIndicator } from '../Aoa/AoaIndicator';
import { BearingInfoBanner } from '../BearingInfo/BearingInfoBanner';
import { BottomInfoPanel } from '../BottomInfoPanel/BottomInfoPanel';
import { ComInfoBox } from '../ComInfoBox/ComInfoBox';
import { Fma } from '../Fma/Fma';
import { HorizonDisplay } from '../Horizon/HorizonDisplay';
import { DefaultHsiDataProvider } from '../HSI/DefaultHsiDataProvider';
import { Hsi } from '../HSI/Hsi';
import { HsiGpsIntegrityAnnunciation } from '../HSI/HsiGpsIntegrityAnnunciation';
import { InsetMapContainer } from '../InsetMap/InsetMapContainer';
import { MarkerBeaconDisplay } from '../Marker/MarkerBeaconDisplay';
import { MinimumsDisplay } from '../Minimums/MinimumsDisplay';
import { NavDmeInfoBanner } from '../NavDmeInfo/NavDmeInfoBanner';
import { NavStatusBoxBanner } from '../NavStatusBox/NavStatusBoxBanner';
import { G3000PfdTerrainSystemAnnunciation } from '../Terrain/G3000PfdTerrainSystemAnnunciation';
import { PfdTrafficAlertMapManager } from '../Traffic/PfdTrafficAlertMapManager';
import { PfdTrafficAnnunciation } from '../Traffic/PfdTrafficAnnunciation';
import { DefaultVdiDataProvider } from '../VDI/DefaultVdiDataProvider';
import { VerticalDeviationIndicator } from '../VDI/VerticalDeviationIndicator';
import { VerticalSpeedIndicator } from '../VSI/VerticalSpeedIndicator';
import { WindDisplay } from '../Wind/WindDisplay';

import './PfdInstrumentContainer.css';
import { AfcsStatusBoxPluginOptions } from '../Fma';

/**
 * Component props for PfdInstrumentContainer.
 */
export interface PfdInstrumentContainerProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The FMS. */
  fms: Fms;

  /** The traffic system. */
  trafficSystem: TrafficSystem;

  /** The configuration object for the pane's parent avionics system. */
  config: AvionicsConfig;

  /** The configuration object for the pane's parent PFD instrument. */
  instrumentConfig: PfdConfig;

  /** A collection of all navigation indicators. */
  navIndicators: G3000NavIndicators;

  /** A provider of GPS position integrity data. */
  gpsIntegrityDataProvider: GpsIntegrityDataProvider;

  /** A provider of altimeter data. */
  altimeterDataProvider: AltimeterDataProvider;

  /** A provider of radar altimeter data. If not defined, the radar altimeter display will not be rendered. */
  radarAltimeterDataProvider?: RadarAltimeterDataProvider;

  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;

  /** A provider of wind data. */
  windDataProvider: WindDataProvider;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /** A provider of terrain alerting system state data. */
  terrainSystemStateDataProvider: TerrainSystemStateDataProvider;

  /** A reference to this instrument's CAS system. */
  casSystem: CasSystem;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** The plugin system for the pane's parent PFD instrument. */
  pluginSystem: PluginSystem<G3000PfdPlugin, G3000PfdPluginBinder>;
}

/**
 * A container for the main PFD instrument display.
 */
export class PfdInstrumentContainer extends DisplayPaneView<PfdInstrumentContainerProps> {

  private thisNode?: VNode;

  private readonly horizonRef = FSComponent.createRef<HorizonDisplay>();
  private readonly airspeedIndicatorRef = FSComponent.createRef<G3000AirspeedIndicator>();
  private readonly altimeterRef = FSComponent.createRef<G3000Altimeter>();
  private readonly hsiRef = FSComponent.createRef<Hsi>();
  private readonly insetMapRef = FSComponent.createRef<InsetMapContainer>();

  private readonly pfdIndex = this.props.index === DisplayPaneIndex.LeftPfdInstrument ? 1 : 2;

  private readonly pfdSensorsAliasedSettingManager = this.props.pfdSensorsSettingManager.getAliasedManager(this.pfdIndex);

  private readonly isInSplitMode = Subject.create(false);

  private readonly softKeyMenuSystem = this.props.instrumentConfig.layout.includeSoftKeys
    ? new SoftKeyMenuSystem(this.props.bus)
    : undefined;

  private readonly softKeyEventMapper = this.props.instrumentConfig.layout.includeSoftKeys
    ? SoftKeyUtils.createPfdInteractionEventMap(
      this.props.instrumentConfig.layout.splitModeInstrumentSide === 'auto'
        ? (this.pfdIndex === 1 ? 'left' : 'right')
        : this.props.instrumentConfig.layout.splitModeInstrumentSide,
      this.isInSplitMode
    )
    : undefined;

  private readonly horizonSize = Vec2Subject.create(Vec2Math.create(1280, 800));
  private readonly horizonOffset = Vec2Subject.create(Vec2Math.create(0, -125));

  private readonly rootCssClass = SetSubject.create(['pfd-instrument-container']);

  private readonly altitudeAlerter = new AltitudeAlerter(this.pfdIndex, this.props.bus, this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex'));

  private readonly minimumsAlerter = new MinimumsAlerter(
    this.props.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex'),
    true
  );

  private readonly aoaDataProvider = new DefaultAoaDataProvider(
    this.props.bus,
    1,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex')
  );

  private readonly airspeedIndicatorDataProvider = new DefaultAirspeedIndicatorDataProvider(
    this.props.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAdcIndex'),
    {
      isAirspeedHoldActive: this.props.config.autothrottle ? true : undefined,
      ...this.props.instrumentConfig.airspeedIndicator.dataProviderOptions
    },
    this.aoaDataProvider
  );

  private readonly hsiDataProvider = new DefaultHsiDataProvider(
    this.props.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAhrsIndex'),
    this.pfdIndex,
    this.props.navIndicators.get('activeSource'),
    this.props.navIndicators.get('approachPreview'),
    this.props.navIndicators.get('bearingPointer1'),
    this.props.navIndicators.get('bearingPointer2')
  );

  private readonly vdiDataProvider = new DefaultVdiDataProvider(
    this.props.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAhrsIndex'),
    this.props.vnavDataProvider,
    this.props.navIndicators.get('activeSource'),
    this.props.navIndicators.get('approachPreview')
  );

  private readonly waypointAlertComputer = new WaypointAlertComputer(this.props.bus, this.props.fms.flightPlanner, 9.9);

  private readonly navStatusDataProvider = new DefaultNavStatusBoxDataProvider(this.props.bus, this.props.fms, this.waypointAlertComputer, this.props.vnavDataProvider);

  private readonly obsSuspDataProvider = new DefaultObsSuspDataProvider(this.props.bus);

  private readonly tcasAdvisoryDataProvider = new DefaultTcasAdvisoryDataProvider(this.props.bus, this.props.trafficSystem);
  private readonly tcasRaCommandDataProvider = this.props.trafficSystem.type === TrafficSystemType.TcasII
    ? new DefaultTcasRaCommandDataProvider(this.props.bus, this.props.trafficSystem)
    : undefined;

  private readonly markerBeaconDataProvider = new DefaultMarkerBeaconDataProvider(this.props.bus, 1);

  private readonly declutterManager = new PfdDeclutterManager(
    this.props.bus,
    this.pfdSensorsAliasedSettingManager.getSetting('pfdAhrsIndex')
  );

  private readonly trafficAlertMapManager = new PfdTrafficAlertMapManager(this.pfdIndex, this.props.bus, this.tcasAdvisoryDataProvider);

  private readonly navDmeBannerPosition = this.props.instrumentConfig.layout.useNavDmeInfoBanner
    ? 'upper'
    : this.props.instrumentConfig.layout.includeSoftKeys ? 'lower-softkey' : 'lower';
  private readonly declutterNavDmeBanner = this.props.instrumentConfig.layout.useNavDmeInfoBanner
    ? undefined
    : MappedSubject.create(
      ([declutter, isInSplitMode]): boolean => declutter || !isInSplitMode,
      this.declutterManager.declutter,
      this.isInSplitMode
    );

  private readonly declutterBearingInfoBanner = this.props.instrumentConfig.layout.useNavStatusBanner
    ? undefined
    : MappedSubject.create(
      ([declutter, isInSplitMode]): boolean => declutter || !isInSplitMode,
      this.declutterManager.declutter,
      this.isInSplitMode
    );

  private readonly isHsiMapEnabled = this.props.pfdSettingManager.getSetting('pfdMapLayout').map(mode => mode === PfdMapLayoutSettingMode.Hsi);

  private readonly hsiGpsIntegrityAnnuncMode = this.props.gpsIntegrityDataProvider.fmsPosMode.map(mode => {
    switch (mode) {
      case FmsPositionMode.Gps:
        return HsiGpsIntegrityAnnunciationMode.Ok;
      case FmsPositionMode.Dme:
      case FmsPositionMode.Hns:
        return HsiGpsIntegrityAnnunciationMode.GpsNotUsed;
      default:
        return HsiGpsIntegrityAnnunciationMode.GpsLoi;
    }
  });

  private readonly auralAlertPublisher = this.props.bus.getPublisher<AuralAlertControlEvents>();
  private auralAlertManager?: AuralAlertRegistrationManager;

  private readonly auralVoice = AuralAlertUserSettings.getManager(this.props.bus).voice;

  /**
   * Creates a new instance of PfdInstrumentContainer.
   * @param props The component props for the new instance.
   */
  public constructor(props: PfdInstrumentContainerProps) {
    super(props);

    this.initSoftKeyMenu();

    if (this.pfdIndex === 1) {
      this.auralAlertManager = new AuralAlertRegistrationManager(this.props.bus);

      this.auralAlertManager.register({
        uuid: G3000AuralAlertIds.AltitudeAlert,
        queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.AltitudeAlert],
        sequence: 'tone_altitude_alert_default',
        continuous: false,
        repeat: false,
        timeout: 5000
      });

      this.auralAlertManager.register({
        uuid: G3000AuralAlertIds.Minimums,
        queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.Minimums],
        sequence: ['aural_minimums_f', 'aural_minimums_f'],
        continuous: false,
        repeat: false,
        timeout: 5000
      });
    }
  }

  /**
   * Initializes this container's softkey menu, if one exists.
   */
  private initSoftKeyMenu(): void {
    if (this.softKeyMenuSystem === undefined) {
      return;
    }

    const cdiNavIndicator = this.props.navIndicators.get('activeSource');
    const pfdMapSettingManager = MapUserSettings.getPfdManager(this.props.bus, this.pfdIndex);

    this.softKeyMenuSystem.registerMenu('root', menuSystem => new PfdRootSoftKeyMenu(menuSystem, this.pfdIndex, cdiNavIndicator, this.obsSuspDataProvider, this.props.pfdSettingManager, this.props.config.radios, this.declutterManager.declutter, false));

    this.softKeyMenuSystem.registerMenu('pfd-map-settings', menuSystem => new PfdMapSettingsSoftKeyMenu(menuSystem, this.pfdIndex, this.props.pfdSettingManager, pfdMapSettingManager, false));
    this.softKeyMenuSystem.registerMenu('map-layout', menuSystem => new MapLayoutSoftKeyMenu(menuSystem, this.props.pfdSettingManager));
    this.softKeyMenuSystem.registerMenu('data-link-settings', menuSystem => new DataLinkSettingsSoftKeyMenu(menuSystem, false));

    this.softKeyMenuSystem.registerMenu('pfd-settings', menuSystem => new PfdSettingsSoftKeyMenu(menuSystem, this.pfdIndex, this.props.pfdSettingManager, this.props.config.radios, false));
    this.softKeyMenuSystem.registerMenu('attitude-overlays', menuSystem => new AttitudeOverlaysSoftKeyMenu(menuSystem, this.props.pfdSettingManager, false));

    this.softKeyMenuSystem.registerMenu('other-pfd-settings', menuSystem => new OtherPfdSettingsSoftKeyMenu(menuSystem, this.props.pfdSettingManager, false));
    this.softKeyMenuSystem.registerMenu('wind', menuSystem => new WindSoftKeyMenu(menuSystem, this.props.pfdSettingManager, false));
    this.softKeyMenuSystem.registerMenu('altitude-units', menuSystem => new AltitudeUnitsSoftKeyMenu(menuSystem, this.props.pfdSettingManager, false));

    this.softKeyMenuSystem.registerMenu('sensors', menuSystem => new SensorsSoftKeyMenu(menuSystem, false));
    this.softKeyMenuSystem.registerMenu('adc-settings', menuSystem => new AdcSettingsSoftKeyMenu(menuSystem, this.pfdIndex, this.props.config.sensors.adcCount, this.pfdSensorsAliasedSettingManager, false));
    this.softKeyMenuSystem.registerMenu('ahrs-settings', menuSystem => new AhrsSettingsSoftKeyMenu(menuSystem, this.props.config.sensors.ahrsCount, this.pfdSensorsAliasedSettingManager, false));

    this.softKeyMenuSystem.registerMenu('root-split', menuSystem => new PfdRootSoftKeyMenu(menuSystem, this.pfdIndex, cdiNavIndicator, this.obsSuspDataProvider, this.props.pfdSettingManager, this.props.config.radios, this.declutterManager.declutter, true));

    this.softKeyMenuSystem.registerMenu('pfd-map-settings-split', menuSystem => new PfdMapSettingsSoftKeyMenu(menuSystem, this.pfdIndex, this.props.pfdSettingManager, pfdMapSettingManager, true));
    this.softKeyMenuSystem.registerMenu('map-overlays-1', menuSystem => new MapOverlays1SoftKeyMenu(menuSystem, pfdMapSettingManager));
    this.softKeyMenuSystem.registerMenu('map-overlays-2', menuSystem => new MapOverlays2SoftKeyMenu(menuSystem, pfdMapSettingManager));
    this.softKeyMenuSystem.registerMenu('data-link-settings-split', menuSystem => new DataLinkSettingsSoftKeyMenu(menuSystem, true));

    this.softKeyMenuSystem.registerMenu('pfd-settings-split', menuSystem => new PfdSettingsSoftKeyMenu(menuSystem, this.pfdIndex, this.props.pfdSettingManager, this.props.config.radios, true));
    this.softKeyMenuSystem.registerMenu('attitude-overlays-split', menuSystem => new AttitudeOverlaysSoftKeyMenu(menuSystem, this.props.pfdSettingManager, true));
    this.softKeyMenuSystem.registerMenu('svt-settings', menuSystem => new SvtSettingsSoftKeyMenu(menuSystem, this.props.pfdSettingManager));

    this.softKeyMenuSystem.registerMenu('other-pfd-settings-split', menuSystem => new OtherPfdSettingsSoftKeyMenu(menuSystem, this.props.pfdSettingManager, true));
    this.softKeyMenuSystem.registerMenu('wind-split', menuSystem => new WindSoftKeyMenu(menuSystem, this.props.pfdSettingManager, true));
    this.softKeyMenuSystem.registerMenu('altitude-units-split', menuSystem => new AltitudeUnitsSoftKeyMenu(menuSystem, this.props.pfdSettingManager, true));
    this.softKeyMenuSystem.registerMenu('sensors-split', menuSystem => new SensorsSoftKeyMenu(menuSystem, true));
    this.softKeyMenuSystem.registerMenu('adc-settings-split', menuSystem => new AdcSettingsSoftKeyMenu(menuSystem, this.pfdIndex, this.props.config.sensors.adcCount, this.pfdSensorsAliasedSettingManager, true));
    this.softKeyMenuSystem.registerMenu('ahrs-settings-split', menuSystem => new AhrsSettingsSoftKeyMenu(menuSystem, this.props.config.sensors.ahrsCount, this.pfdSensorsAliasedSettingManager, true));

    this.props.pluginSystem.callPlugins(plugin => {
      plugin.registerSoftkeyMenus(this.softKeyMenuSystem as SoftKeyMenuSystem, this.pfdIndex);
    });

    this.softKeyMenuSystem.pushMenu('root');
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.aoaDataProvider.init();
    this.airspeedIndicatorDataProvider.init();
    this.hsiDataProvider.init(true);
    this.vdiDataProvider.init(true);
    this.navStatusDataProvider.init();
    this.obsSuspDataProvider.init();
    this.tcasAdvisoryDataProvider.init();
    this.tcasRaCommandDataProvider?.init();
    this.markerBeaconDataProvider.init();

    this.declutterManager.init();
    this.trafficAlertMapManager.init();

    this.rootCssClass.add(this.softKeyMenuSystem === undefined ? 'pfd-nosoftkey' : 'pfd-softkey');
    this.rootCssClass.add(this.props.instrumentConfig.layout.useNavStatusBanner ? 'pfd-use-nav-status-banner' : 'pfd-no-nav-status-banner');
    this.rootCssClass.add(this.props.instrumentConfig.layout.useNavDmeInfoBanner ? 'pfd-use-nav-dme-banner' : 'pfd-no-nav-dme-banner');

    this.altitudeAlerter.init();
    this.minimumsAlerter.init();

    // Initialize triggers for resetting softkey menu to root.
    const softKeyMenuSystem = this.softKeyMenuSystem;
    if (softKeyMenuSystem !== undefined) {
      this.isInSplitMode.sub(isInSplitMode => {
        softKeyMenuSystem.clear();
        softKeyMenuSystem.pushMenu(isInSplitMode ? 'root-split' : 'root');
      }, true);

      this.declutterManager.declutter.sub(declutter => {
        if (declutter) {
          softKeyMenuSystem.clear();
          softKeyMenuSystem.pushMenu(this.isInSplitMode.get() ? 'root-split' : 'root');
        }
      }, true);
    }

    // Handle avionics global power state.
    this.props.bus.getSubscriber<AvionicsStatusEvents>()
      .on(`avionics_status_${AvionicsStatusUtils.getUid('PFD', this.pfdIndex)}`)
      .handle(this.onAvionicsStatusChanged.bind(this));

    // Aural alerts.
    if (this.pfdIndex === 1) {
      this.initMinimumsAural();
      this.initAltitudeAlertAural();
    }
  }

  /**
   * Initializes the altitude alert aural.
   */
  private initAltitudeAlertAural(): void {
    this.altitudeAlerter.state.sub(v => {
      if (v === AltitudeAlertState.Within1000 || v === AltitudeAlertState.Deviation) {
        this.auralAlertPublisher.pub('aural_alert_activate', G3000AuralAlertIds.AltitudeAlert, true, false);
      } else {
        this.auralAlertPublisher.pub('aural_alert_deactivate', G3000AuralAlertIds.AltitudeAlert, true, false);
      }
    });
  }

  /**
   * Initializes the minimums aural.
   */
  private initMinimumsAural(): void {
    const activation: Record<AuralAlertVoiceSetting, AuralAlertActivation> = {
      [AuralAlertVoiceSetting.Male]: {
        uuid: G3000AuralAlertIds.Minimums,
        sequence: ['aural_minimums_m', 'aural_minimums_m']
      },

      [AuralAlertVoiceSetting.Female]: {
        uuid: G3000AuralAlertIds.Minimums,
        sequence: ['aural_minimums_f', 'aural_minimums_f']
      }
    };

    this.minimumsAlerter.state.sub(v => {
      if (v === MinimumsAlertState.AtOrBelow) {
        this.auralAlertPublisher.pub('aural_alert_activate', activation[this.auralVoice.get()], true, false);
      } else {
        this.auralAlertPublisher.pub('aural_alert_deactivate', G3000AuralAlertIds.Minimums, true, false);
      }
    });
  }

  /** @inheritDoc */
  public onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(size, width, height);
    this.isInSplitMode.set(size === DisplayPaneSizeMode.Half);

    this.hsiDataProvider.resume();
    this.vdiDataProvider.resume();

    this.horizonRef.instance.wake();
    this.airspeedIndicatorRef.instance.wake();
    this.altimeterRef.instance.wake();
    this.hsiRef.instance.wake();
  }

  /** @inheritDoc */
  public onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(size, width, height);
    this.isInSplitMode.set(size === DisplayPaneSizeMode.Half);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.horizonRef.instance.sleep();
    this.airspeedIndicatorRef.instance.sleep();
    this.altimeterRef.instance.sleep();
    this.hsiRef.instance.sleep();

    this.hsiDataProvider.pause();
    this.vdiDataProvider.pause();
  }

  /**
   * Updates the size of this container.
   * @param size The size of this container.
   * @param width The width of this container, in pixels.
   * @param height The height of this container, in pixels.
   */
  private updateSize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.horizonSize.set(width, height);

    if (size === DisplayPaneSizeMode.Full) {
      this.horizonOffset.set(0, -125);
    } else {
      this.horizonOffset.set(-30, -125);
    }

    this.insetMapRef.instance.onResize(size);
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    this.waypointAlertComputer.update();
    this.hsiRef.instance.onUpdate(time);
    this.insetMapRef.instance.onUpdate(time);
  }

  /** @inheritDoc */
  public onEvent(event: DisplayPaneViewEvent): void {
    this.hsiRef.instance.onEvent(event);
    this.insetMapRef.instance.onEvent(event);
  }

  /** @inheritDoc */
  public onInteractionEvent(event: string): boolean {
    if (this.softKeyMenuSystem) {
      const index = this.softKeyEventMapper!(event);
      if (index !== undefined) {
        this.softKeyMenuSystem.onSoftKeyPressed(index);
        return true;
      }
    }

    if (this.hsiRef.instance.onInteractionEvent(event)) {
      return true;
    }
    if (this.insetMapRef.instance.onInteractionEvent(event)) {
      return true;
    }

    return false;
  }

  /**
   * Responds to when the status of this container's parent avionics unit changes.
   * @param event The event describing the avionics status change.
   */
  private onAvionicsStatusChanged(event: AvionicsStatusChangeEvent): void {
    if (event.previous !== undefined && event.previous !== AvionicsStatus.Off && event.current === AvionicsStatus.Off) {
      // Power off from a powered-on state.

      // Reset softkey menu to root.
      if (this.softKeyMenuSystem !== undefined) {
        this.softKeyMenuSystem.clear();
        this.softKeyMenuSystem.pushMenu(this.isInSplitMode.get() ? 'root-split' : 'root');
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    const pluginAfcsStatusBoxOptions: AfcsStatusBoxPluginOptions[] = [];
    const pluginRenderedVNodes: VNode[] = [];
    this.props.pluginSystem.callPlugins(plugin => {
      const afcsStatusBoxOptions = plugin.getAfcsStatusBoxOptions?.();
      if (afcsStatusBoxOptions) {
        pluginAfcsStatusBoxOptions.push(afcsStatusBoxOptions);
      }

      const node = plugin.renderToPfdInstruments(
        this.pfdIndex,
        this.props.index as DisplayPaneIndex.LeftPfdInstrument | DisplayPaneIndex.RightPfdInstrument,
        this.isInSplitMode,
        this.declutterManager.declutter
      );
      if (node) {
        pluginRenderedVNodes.push(node);
      }
    });

    return (
      <div class={this.rootCssClass}>
        <HorizonDisplay
          ref={this.horizonRef}
          bus={this.props.bus}
          pfdIndex={this.pfdIndex}
          config={this.props.config.horizon}
          projectedSize={this.horizonSize}
          projectedOffset={this.horizonOffset}
          lowBankAngle={this.props.config.autopilot.lowBankOptions.maxBankAngle}
          tcasRaCommandDataProvider={this.tcasRaCommandDataProvider}
          pfdSensorsSettingManager={this.pfdSensorsAliasedSettingManager}
          pfdSettingManager={this.props.pfdSettingManager}
          unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
          declutter={this.declutterManager.declutter}
        />
        <Fma
          bus={this.props.bus}
          flightPlanner={this.props.fms.flightPlanner}
          supportAutothrottle={this.props.config.autothrottle}
          pluginOptions={pluginAfcsStatusBoxOptions}
        />
        {this.props.instrumentConfig.cas.casEnabled && (
          <G3000FullCASDisplay2
            bus={this.props.bus}
            messages={this.props.casSystem.casActiveMessageSubject}
            maxMessageCount={this.isInSplitMode.map(isSplit => {
              return isSplit
                ? this.props.instrumentConfig.cas.alertCountSplitScreen
                : this.props.instrumentConfig.cas.alertCountFullScreen;
            })}
            maxUnscrollableWarningCount={this.isInSplitMode.map(isSplit => {
              return isSplit
                ? this.props.instrumentConfig.cas.unscrollableAlertCountSplitScreen
                : this.props.instrumentConfig.cas.unscrollableAlertCountFullScreen;
            })}
            pfdIndices={[this.pfdIndex]}
            dataChecklist='checklist-pfd-cas'
          />
        )}
        <ComInfoBox bus={this.props.bus} tcasIsSupported={this.props.config.traffic.type === TrafficSystemType.TcasII} />
        <G3000AirspeedIndicator
          ref={this.airspeedIndicatorRef}
          bus={this.props.bus}
          config={this.props.instrumentConfig.airspeedIndicator}
          dataProvider={this.airspeedIndicatorDataProvider}
          vSpeedSettingManager={this.props.vSpeedSettingManager}
          declutter={this.declutterManager.declutter}
        />
        <G3000Altimeter
          ref={this.altimeterRef}
          config={this.props.instrumentConfig.altimeter}
          pfdGduConfig={this.props.config.gduDefs.pfds[this.pfdIndex]}
          dataProvider={this.props.altimeterDataProvider}
          altitudeAlertState={this.altitudeAlerter.state}
          minimumsAlertState={this.minimumsAlerter.state}
          pfdSettingManager={this.props.pfdSettingManager}
          declutter={this.declutterManager.declutter}
        />
        <VerticalSpeedIndicator
          bus={this.props.bus}
          config={this.props.instrumentConfig.vsi}
          vnavDataProvider={this.props.vnavDataProvider}
          tcasRaCommandDataProvider={this.tcasRaCommandDataProvider}
          pfdSensorsSettingManager={this.pfdSensorsAliasedSettingManager}
          declutter={this.declutterManager.declutter}
          isAdvancedVnav={this.props.fms.isAdvancedVnav}
        />
        <VerticalDeviationIndicator
          bus={this.props.bus}
          dataProvider={this.vdiDataProvider}
          declutter={this.declutterManager.declutter}
          supportLimitIndicators
        />
        <MarkerBeaconDisplay
          dataProvider={this.markerBeaconDataProvider}
          declutter={Subject.create(false)}
        />
        <AoaIndicator
          bus={this.props.bus}
          config={this.props.instrumentConfig.aoaIndicator}
          dataProvider={this.aoaDataProvider}
          settingManager={this.props.pfdSettingManager}
        />
        {
          this.props.instrumentConfig.layout.useWindBanner && (
            <WindDisplay
              dataProvider={this.props.windDataProvider}
              windDisplaySettingManager={this.props.pfdSettingManager}
              unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
              declutter={this.declutterManager.declutter}
            />
          )
        }
        {
          this.props.radarAltimeterDataProvider !== undefined && (
            <RadarAltimeter
              bus={this.props.bus}
              dataProvider={this.props.radarAltimeterDataProvider}
              minimumsMode={this.minimumsAlerter.minimumsMode}
              minimumsAlertState={this.minimumsAlerter.state}
            />
          )
        }
        <MinimumsDisplay
          bus={this.props.bus}
          dataProvider={this.props.minimumsDataProvider}
          minimumsAlertState={this.minimumsAlerter.state}
          unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
          declutter={this.declutterManager.declutter}
        />
        <Hsi
          ref={this.hsiRef}
          bus={this.props.bus}
          flightPlanner={this.props.fms.flightPlanner}
          trafficSystem={this.props.trafficSystem}
          pfdIndex={this.pfdIndex}
          mapConfig={this.props.config.map}
          pfdSensorsSettingManager={this.props.pfdSensorsSettingManager}
          pfdMapLayoutSettingManager={this.props.pfdSettingManager}
          dataProvider={this.hsiDataProvider}
          unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
          declutter={this.declutterManager.declutter}
        />
        <NavDmeInfoBanner
          navInfoIndicator={this.props.navIndicators.get('navInfo') as G3000NavInfoNavIndicator}
          dmeInfoIndicator={this.props.navIndicators.get('dmeInfo') as G3000DmeInfoNavIndicator}
          dmeRadioCount={this.props.config.radios.dmeCount}
          dmeSettingManager={DmeUserSettings.getManager(this.props.bus)}
          unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
          isHsiMapEnabled={this.isHsiMapEnabled}
          declutter={this.declutterNavDmeBanner ?? this.declutterManager.declutter}
          position={this.navDmeBannerPosition}
        />
        {
          this.props.instrumentConfig.layout.useNavStatusBanner && (
            <NavStatusBoxBanner
              bus={this.props.bus}
              config={this.props.instrumentConfig.navStatusBox}
              dataProvider={this.navStatusDataProvider}
              gpsIntegrityDataProvider={this.props.gpsIntegrityDataProvider}
              unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
              isHsiMapEnabled={this.isHsiMapEnabled}
              declutter={this.declutterManager.declutter}
            />
          )
        }
        {
          this.declutterBearingInfoBanner && (
            <BearingInfoBanner
              bus={this.props.bus}
              adfRadioCount={this.props.config.radios.adfCount}
              navIndicators={this.props.navIndicators}
              unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
              isHsiMapEnabled={this.isHsiMapEnabled}
              declutter={this.declutterBearingInfoBanner}
              softkey={this.props.instrumentConfig.layout.includeSoftKeys}
            />
          )
        }
        {
          this.softKeyMenuSystem !== undefined && (
            <svg class='pfd-bottom-info-softkey-background-gradient-container'>
              <defs>
                <linearGradient id='pfd-bottom-info-softkey-background-gradient' x1='0%' x2='0%' y1='100%' y2='0%'>
                  <stop offset='0%' stop-color='#0a0d10' />
                  <stop offset='100%' stop-color='#131a20' />
                </linearGradient>
              </defs>
            </svg>
          )
        }
        <PfdTrafficAnnunciation
          trafficSystem={this.props.trafficSystem}
          advisoryDataProvider={this.tcasAdvisoryDataProvider}
          declutter={this.declutterManager.declutter}
        />
        <G3000PfdTerrainSystemAnnunciation
          config={this.props.config.terrain}
          operatingMode={this.props.terrainSystemStateDataProvider.operatingMode}
          statusFlags={this.props.terrainSystemStateDataProvider.statusFlags}
          inhibitFlags={this.props.terrainSystemStateDataProvider.inhibitFlags}
          prioritizedAlert={this.props.terrainSystemStateDataProvider.prioritizedAlert}
        />
        <HsiGpsIntegrityAnnunciation
          mode={this.hsiGpsIntegrityAnnuncMode}
        />
        {...pluginRenderedVNodes}
        <BottomInfoPanel
          bus={this.props.bus}
          pfdIndex={this.pfdIndex}
          layoutConfig={this.props.instrumentConfig.layout}
          radiosConfig={this.props.config.radios}
          navStatusBoxConfig={this.props.instrumentConfig.navStatusBox}
          navIndicators={this.props.navIndicators}
          gpsIntegrityDataProvider={this.props.gpsIntegrityDataProvider}
          navStatusBoxDataProvider={this.navStatusDataProvider}
          windDataProvider={this.props.windDataProvider}
          pfdSensorsSettingManager={this.pfdSensorsAliasedSettingManager}
          pfdSettingManager={this.props.pfdSettingManager}
          dmeSettingManager={DmeUserSettings.getManager(this.props.bus)}
          unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
          dateTimeSettingManager={DateTimeUserSettings.getManager(this.props.bus)}
          isInSplitMode={this.isInSplitMode}
          declutter={this.declutterManager.declutter}
        />
        <InsetMapContainer
          ref={this.insetMapRef}
          bus={this.props.bus}
          flightPlanner={this.props.fms.flightPlanner}
          trafficSystem={this.props.trafficSystem}
          pfdIndex={this.pfdIndex}
          config={this.props.config.map}
          pfdSensorsSettingManager={this.props.pfdSensorsSettingManager}
          pfdMapLayoutSettingManager={this.props.pfdSettingManager}
        />
        {
          this.softKeyMenuSystem === undefined
            ? null
            : (
              <SoftKeyBar
                menuSystem={this.softKeyMenuSystem}
              />
            )
        }
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.altitudeAlerter.destroy();
    this.minimumsAlerter.destroy();
    this.aoaDataProvider.destroy();
    this.airspeedIndicatorDataProvider.destroy();
    this.hsiDataProvider.destroy();
    this.vdiDataProvider.destroy();
    this.navStatusDataProvider.destroy();
    this.obsSuspDataProvider.destroy();
    this.tcasAdvisoryDataProvider.destroy();
    this.tcasRaCommandDataProvider?.destroy();
    this.markerBeaconDataProvider.destroy();
    this.declutterManager.destroy();
    this.trafficAlertMapManager.destroy();

    this.isHsiMapEnabled.destroy();
    this.hsiGpsIntegrityAnnuncMode.destroy();

    this.auralAlertManager?.destroy();

    super.destroy();
  }
}
