import {
  AuralAlertControlEvents, AuralAlertActivation, AuralAlertRegistrationManager, CasSystem, DefaultTcasAdvisoryDataProvider,
  EventBus, FSComponent, MappedSubject, PluginSystem, SetSubject, Subject, UserSettingManager, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  AltimeterDataProvider, DateTimeUserSettings, DefaultAoaDataProvider, DefaultMarkerBeaconDataProvider, DefaultNavStatusBoxDataProvider,
  DefaultObsSuspDataProvider, DefaultTcasRaCommandDataProvider, DmeUserSettings, Fms, FmsPositionMode, GpsIntegrityDataProvider,
  HsiGpsIntegrityAnnunciationMode, MinimumsAlerter, MinimumsAlertState, MinimumsDataProvider, PfdDeclutterManager,
  RadarAltimeterDataProvider, SoftKeyBar, SoftKeyMenuSystem, TrafficSystem, TrafficSystemType, UnitsUserSettings, VNavDataProvider,
  WaypointAlertComputer, WindDataProvider
} from '@microsoft/msfs-garminsdk';

import {
  AuralAlertUserSettings, AuralAlertVoiceSetting, AvionicsConfig, AvionicsStatus, AvionicsStatusChangeEvent, AvionicsStatusEvents,
  AvionicsStatusUtils, G3000FullCASDisplay, DisplayPaneIndex, DisplayPaneSizeMode, DisplayPaneView, DisplayPaneViewEvent, DisplayPaneViewProps,
  G3000AuralAlertIds, G3000AuralAlertUtils, G3000DmeInfoNavIndicator, G3000NavIndicators, G3000NavInfoNavIndicator,
  IauUserSettingManager, MapUserSettings, PfdAliasedUserSettingTypes, PfdMapLayoutSettingMode, SoftKeyHEventMap, VSpeedUserSettingManager
} from '@microsoft/msfs-wtg3000-common';

import { PfdConfig } from '../../Config/PfdConfig';
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
import { G3000PfdPlugin, G3000PfdPluginBinder } from '../../G3000PFDPlugin';
import { AirspeedIndicator } from '../Airspeed/AirspeedIndicator';
import { Altimeter } from '../Altimeter/Altimeter';
import { RadarAltimeter } from '../Altimeter/RadarAltimeter';
import { AoaIndicator } from '../Aoa/AoaIndicator';
import { BearingInfoBanner } from '../BearingInfo/BearingInfoBanner';
import { BottomInfoPanel } from '../BottomInfoPanel/BottomInfoPanel';
import { ComInfoBox } from '../ComInfoBox/ComInfoBox';
import { Fma } from '../Fma/Fma';
import { HorizonDisplay } from '../Horizon/HorizonDisplay';
import { Hsi } from '../HSI/Hsi';
import { DefaultHsiDataProvider } from '../HSI/HsiDataProvider';
import { HsiGpsIntegrityAnnunciation } from '../HSI/HsiGpsIntegrityAnnunciation';
import { InsetMapContainer } from '../InsetMap/InsetMapContainer';
import { MarkerBeaconDisplay } from '../Marker/MarkerBeaconDisplay';
import { MinimumsDisplay } from '../Minimums/MinimumsDisplay';
import { NavDmeInfoBanner } from '../NavDmeInfo/NavDmeInfoBanner';
import { NavStatusBoxBanner } from '../NavStatusBox/NavStatusBoxBanner';
import { PfdTrafficAlertMapManager } from '../Traffic/PfdTrafficAlertMapManager';
import { PfdTrafficAnnunciation } from '../Traffic/PfdTrafficAnnunciation';
import { DefaultVdiDataProvider } from '../VDI/VdiDataProvider';
import { VerticalDeviationIndicator } from '../VDI/VerticalDeviationIndicator';
import { VerticalSpeedIndicator } from '../VSI/VerticalSpeedIndicator';
import { WindDisplay } from '../Wind/WindDisplay';

import './PfdInstrumentContainer.css';

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

  /** A reference to this instrument's CAS system. */
  casSystem: CasSystem;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

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

  private readonly hsiRef = FSComponent.createRef<Hsi>();
  private readonly insetMapRef = FSComponent.createRef<InsetMapContainer>();

  private readonly pfdIndex = this.props.index === DisplayPaneIndex.LeftPfdInstrument ? 1 : 2;

  private readonly iauAliasedSettingManager = this.props.iauSettingManager.getAliasedManager(this.props.instrumentConfig.iauIndex);

  private readonly isInSplitMode = Subject.create(false);

  private readonly softKeyMenuSystem = this.props.instrumentConfig.layout.includeSoftKeys
    ? new SoftKeyMenuSystem(
      this.props.bus,
      SoftKeyHEventMap.create(
        `AS3000_PFD_${this.pfdIndex}`,
        this.props.instrumentConfig.layout.splitModeInstrumentSide === 'auto' ? (this.pfdIndex === 1 ? 'left' : 'right') : this.props.instrumentConfig.layout.splitModeInstrumentSide,
        this.isInSplitMode
      )
    )
    : undefined;

  private readonly horizonSize = Vec2Subject.create(Vec2Math.create(1280, 800));
  private readonly horizonOffset = Vec2Subject.create(Vec2Math.create(0, -125));

  private readonly rootCssClass = SetSubject.create(['pfd-instrument-container']);

  private readonly minimumsAlerter = new MinimumsAlerter(
    this.props.bus,
    this.iauAliasedSettingManager.getSetting('iauAdcIndex'),
    true
  );

  private readonly aoaDataProvider = new DefaultAoaDataProvider(
    this.props.bus,
    1,
    this.iauAliasedSettingManager.getSetting('iauAdcIndex')
  );

  private readonly hsiDataProvider = new DefaultHsiDataProvider(
    this.props.bus,
    this.iauAliasedSettingManager.getSetting('iauAhrsIndex'),
    this.pfdIndex,
    this.props.navIndicators.get('activeSource'),
    this.props.navIndicators.get('approachPreview'),
    this.props.navIndicators.get('bearingPointer1'),
    this.props.navIndicators.get('bearingPointer2')
  );

  private readonly vdiDataProvider = new DefaultVdiDataProvider(
    this.props.bus,
    this.iauAliasedSettingManager.getSetting('iauAhrsIndex'),
    this.props.vnavDataProvider,
    this.props.navIndicators.get('activeSource'),
    this.props.navIndicators.get('approachPreview')
  );

  private readonly waypointAlertComputer = new WaypointAlertComputer(this.props.bus, this.props.fms.flightPlanner, 9.9);

  private readonly navStatusDataProvider = new DefaultNavStatusBoxDataProvider(this.props.bus, this.props.fms, this.waypointAlertComputer);

  private readonly obsSuspDataProvider = new DefaultObsSuspDataProvider(this.props.bus);

  private readonly tcasAdvisoryDataProvider = new DefaultTcasAdvisoryDataProvider(this.props.bus, this.props.trafficSystem);
  private readonly tcasRaCommandDataProvider = this.props.trafficSystem.type === TrafficSystemType.TcasII
    ? new DefaultTcasRaCommandDataProvider(this.props.bus, this.props.trafficSystem)
    : undefined;

  private readonly markerBeaconDataProvider = new DefaultMarkerBeaconDataProvider(this.props.bus, 1);

  private readonly declutterManager = new PfdDeclutterManager(
    this.props.bus,
    this.iauAliasedSettingManager.getSetting('iauAhrsIndex')
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

  /** @inheritdoc */
  public constructor(props: PfdInstrumentContainerProps) {
    super(props);

    this.initSoftKeyMenu();

    if (this.pfdIndex === 1) {
      this.auralAlertManager = new AuralAlertRegistrationManager(this.props.bus);
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
    this.softKeyMenuSystem.registerMenu('adc-settings', menuSystem => new AdcSettingsSoftKeyMenu(menuSystem, this.props.config.sensors.adcCount, this.iauAliasedSettingManager, false));
    this.softKeyMenuSystem.registerMenu('ahrs-settings', menuSystem => new AhrsSettingsSoftKeyMenu(menuSystem, this.props.config.sensors.ahrsCount, this.iauAliasedSettingManager, false));

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
    this.softKeyMenuSystem.registerMenu('adc-settings-split', menuSystem => new AdcSettingsSoftKeyMenu(menuSystem, this.props.config.sensors.adcCount, this.iauAliasedSettingManager, true));
    this.softKeyMenuSystem.registerMenu('ahrs-settings-split', menuSystem => new AhrsSettingsSoftKeyMenu(menuSystem, this.props.config.sensors.ahrsCount, this.iauAliasedSettingManager, true));

    this.props.pluginSystem.callPlugins(plugin => {
      plugin.registerSoftkeyMenus(this.softKeyMenuSystem as SoftKeyMenuSystem, this.pfdIndex);
    });

    this.softKeyMenuSystem.pushMenu('root');
  }

  /** @inheritdoc */
  public override onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.aoaDataProvider.init();
    this.hsiDataProvider.init();
    this.vdiDataProvider.init();
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

    // Minimums aural alert.
    if (this.pfdIndex === 1) {
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
  }

  /** @inheritdoc */
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(size, width, height);
    this.isInSplitMode.set(size === DisplayPaneSizeMode.Half);
  }

  /** @inheritdoc */
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.updateSize(size, width, height);
    this.isInSplitMode.set(size === DisplayPaneSizeMode.Half);
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

  /** @inheritdoc */
  public override onUpdate(time: number): void {
    this.waypointAlertComputer.update();
    this.hsiRef.instance.onUpdate(time);
    this.insetMapRef.instance.onUpdate(time);
  }

  /** @inheritdoc */
  public override onEvent(event: DisplayPaneViewEvent): void {
    this.hsiRef.instance.onEvent(event);
    this.insetMapRef.instance.onEvent(event);
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

  /** @inheritdoc */
  public override render(): VNode {
    const pluginRenderedVNodes: VNode[] = [];

    this.props.pluginSystem.callPlugins(plugin => {
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
          bus={this.props.bus}
          pfdIndex={this.pfdIndex}
          config={this.props.config.horizon}
          projectedSize={this.horizonSize}
          projectedOffset={this.horizonOffset}
          lowBankAngle={this.props.config.autopilot.lowBankOptions.maxBankAngle}
          tcasRaCommandDataProvider={this.tcasRaCommandDataProvider}
          iauSettingManager={this.iauAliasedSettingManager}
          pfdSettingManager={this.props.pfdSettingManager}
          unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
          declutter={this.declutterManager.declutter}
        />
        <Fma
          bus={this.props.bus}
          flightPlanner={this.props.fms.flightPlanner}
          supportAutothrottle={this.props.config.autothrottle}
        />
        {this.props.instrumentConfig.cas.casEnabled && (
          <G3000FullCASDisplay
            bus={this.props.bus}
            annunciations={this.props.casSystem.casActiveMessageSubject}
            numAnnunciationsShown={this.isInSplitMode.map(isSplit => {
              return isSplit ? this.props.instrumentConfig.cas.alertCountSplitScreen : this.props.instrumentConfig.cas.alertCountFullScreen;
            })}
            pfdIndices={[this.pfdIndex]}
          />
        )}
        <ComInfoBox bus={this.props.bus} tcasIsSupported={this.props.config.traffic.type === TrafficSystemType.TcasII} />
        <AirspeedIndicator
          bus={this.props.bus}
          config={this.props.instrumentConfig.airspeedIndicator}
          isAirspeedHoldActive={this.props.config.autothrottle ? true : undefined}
          aoaDataProvider={this.aoaDataProvider}
          iauSettingManager={this.iauAliasedSettingManager}
          vSpeedSettingManager={this.props.vSpeedSettingManager}
          declutter={this.declutterManager.declutter}
          pfdIndex={this.pfdIndex}
        />
        <Altimeter
          bus={this.props.bus}
          pfdIndex={this.pfdIndex}
          config={this.props.instrumentConfig.altimeter}
          iauConfig={this.props.config.iauDefs.definitions[this.props.instrumentConfig.iauIndex]}
          dataProvider={this.props.altimeterDataProvider}
          minimumsAlertState={this.minimumsAlerter.state}
          iauSettingManager={this.iauAliasedSettingManager}
          pfdSettingManager={this.props.pfdSettingManager}
          declutter={this.declutterManager.declutter}
        />
        <VerticalSpeedIndicator
          bus={this.props.bus}
          config={this.props.instrumentConfig.vsi}
          vnavDataProvider={this.props.vnavDataProvider}
          tcasRaCommandDataProvider={this.tcasRaCommandDataProvider}
          iauSettingManager={this.iauAliasedSettingManager}
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
          iauSettingManager={this.props.iauSettingManager}
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
          iauSettingManager={this.iauAliasedSettingManager}
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
          iauSettingManager={this.props.iauSettingManager}
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

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.minimumsAlerter.destroy();
    this.aoaDataProvider.destroy();
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