import {
  ActiveLegType, ClockEvents, FlightPlanActiveLegEvent, FocusPosition, FSComponent, GPSSatComputerEvents, GPSSystemState, LegType, Subject,
  TcasAdvisoryDataProvider, UserSetting, UserSettingValue, VNode
} from '@microsoft/msfs-sdk';

import { DefaultNavDataBarFieldModelFactory, DirectToState, Fms, NavDataFieldGpsValidity, NavDataFieldType, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../../Shared/Settings/GNSSettingsProvider';
import { DataFieldContext, GNSDataFieldRenderer } from '../../../../Shared/UI/DataFields/GNSDataFieldRenderer';
import { GNSUiControl } from '../../../../Shared/UI/GNSUiControl';
import { InteractionEvent } from '../../../../Shared/UI/InteractionEvent';
import { GNSMapBuilder } from '../../../../Shared/UI/Pages/Map/GNSMapBuilder';
import { GNSMapController } from '../../../../Shared/UI/Pages/Map/GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from '../../../../Shared/UI/Pages/Map/GNSMapSystem';
import { LegIcon } from '../../../../Shared/UI/Pages/Map/LegIcon';
import { MapPageDataField } from '../../../../Shared/UI/Pages/Map/MapPageDataField';
import { WaypointLeg } from '../../../../Shared/UI/Pages/Map/WaypointLeg';
import { MenuDefinition, MenuEntry, Page, PageProps, ViewService } from '../../../../Shared/UI/Pages/Pages';
import { WT530Cdi } from './WT530Cdi';

import './ArcNavMap.css';

/** A type describing the arc map controllers. */
type GNSArcMapControllers = GNSMapControllers & {

  /** The root map controller instance. */
  [GNSMapKeys.Controller]: GNSMapController;
}

/**
 * Props on the ArcNavMap page.
 */
interface ArcNavMapProps extends PageProps {
  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;

  /** An instance of the FMS. */
  fms: Fms;

  /** The GNS traffic system to supply traffic data from. */
  trafficSystem: TrafficSystem;

  /** The traffic advisory data provider. */
  tcasDataProvider: TcasAdvisoryDataProvider;

  /** The instrument index. */
  instrumentIndex: number;
}

/**
 * A component that displays the GNS arc/nav main map.
 */
export class ArcNavMap extends Page<ArcNavMapProps> {
  private readonly fromWaypoint = FSComponent.createRef<WaypointLeg>();
  private readonly toWaypoint = FSComponent.createRef<WaypointLeg>();
  private readonly legIcon = FSComponent.createRef<LegIcon>();
  private readonly rootControl = FSComponent.createRef<GNSUiControl>();
  private readonly gpsValidity = Subject.create<NavDataFieldGpsValidity>(NavDataFieldGpsValidity.Invalid);

  private readonly ArcMap = GNSMapBuilder
    .withArcMap(
      this.props.bus,
      this.props.fms,
      this.props.settingsProvider,
      this.props.gnsType,
      this.props.instrumentIndex,
      this.props.trafficSystem,
      this.props.tcasDataProvider)
    .withController(GNSMapKeys.Controller, c => new GNSMapController(c, this.props.settingsProvider, this.props.fms, true))
    .build<GNSMapModules, GNSMapLayers, GNSArcMapControllers, GNSMapContextProps>('arc-map-container');

  private readonly fieldContext: DataFieldContext = {
    modelFactory: new DefaultNavDataBarFieldModelFactory(this.props.bus, this.gpsValidity, {
      lnavIndex: this.props.fms.lnavIndex,
      vnavIndex: this.props.fms.vnavIndex
    }),
    renderer: new GNSDataFieldRenderer(this.props.settingsProvider.units, this.props.settingsProvider.time),
    fieldTypeMenuEntries: [
      { label: 'BRG - Bearing', disabled: false, type: NavDataFieldType.BearingToWaypoint },
      { label: 'DIS - Distance', disabled: false, type: NavDataFieldType.DistanceToWaypoint },
      { label: 'DTK - Desired Track', disabled: false, type: NavDataFieldType.DesiredTrack },
      { label: 'ESA - Enrte Safe Alt', disabled: true, type: NavDataFieldType.BearingToWaypoint },
      { label: 'ETA - Est Time Arvl', disabled: false, type: NavDataFieldType.TimeOfWaypointArrival },
      { label: 'ETE - Est Time Enrte', disabled: false, type: NavDataFieldType.TimeToWaypoint },
      { label: 'FLOW - Total Fuel Flow', disabled: true, type: NavDataFieldType.BearingToWaypoint },
      { label: 'GS - Ground Speed', disabled: false, type: NavDataFieldType.GroundSpeed },
      { label: 'MSA - Min Safe Alt', disabled: true, type: NavDataFieldType.BearingToWaypoint },
      { label: 'TKE - Track Ang Err', disabled: false, type: NavDataFieldType.TrackAngleError },
      { label: 'TRK - Track', disabled: false, type: NavDataFieldType.GroundTrack },
      { label: 'VSR - Vert Spd Reqd', disabled: false, type: NavDataFieldType.VerticalSpeedRequired },
      { label: 'XTK - Cross Track Err', disabled: false, type: NavDataFieldType.CrossTrack },
    ],
  };

  private readonly trkField = FSComponent.createRef<MapPageDataField>();
  private readonly fields = [
    FSComponent.createRef<MapPageDataField>(), FSComponent.createRef<MapPageDataField>(),
    FSComponent.createRef<MapPageDataField>(), FSComponent.createRef<MapPageDataField>()
  ];

  private readonly clockSub = this.props.bus.getSubscriber<ClockEvents>().on('realTime')
    .atFrequency(4).handle(() => {
      for (let i = 0; i < this.fields.length; i++) {
        this.fields[i].getOrDefault()?.update();
      }

      this.trkField.getOrDefault()?.update();
    });

  private readonly pageMenu = new ArcNavMapPageMenu(this.props.settingsProvider);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.ArcMap.ref.instance.sleep();

    this.props.fms.flightPlanner.onEvent('fplActiveLegChange').handle(this.onActiveLegChanged.bind(this));
    this.legIcon.instance.updateLegIcon(true, false, LegType.TF);

    this.trkField.instance.setDisabled(true);
    this.toWaypoint.instance.setDisabled(true);
    this.fromWaypoint.instance.setDisabled(true);

    this.pageMenu.onRestoreDefaults = (): void => {
      this.props.settingsProvider.arcMapFields.getAllSettings().forEach(v => v.resetToDefault());
      ViewService.back();
    };

    this.pageMenu.onChangeFieldsSelected = (): any => {
      ViewService.back();
      this.rootControl.instance.focus(FocusPosition.First);
    };

    this.props.settingsProvider.map.getSetting('map_arc_nexrad_enabled').sub(v => {
      this.ArcMap.context.getController(GNSMapKeys.Controller).setNexradVisible(v);
    }, true);

    this.props.settingsProvider.map.getSetting('map_arc_declutter_level').sub(v => {
      this.ArcMap.context.model.getModule(GNSMapKeys.Declutter)?.declutterLevel.set(v);
    }, true);

    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(state => {
      const valid = state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired;
      this.gpsValidity.set(valid ? NavDataFieldGpsValidity.Valid : NavDataFieldGpsValidity.Invalid);
    });


  }

  /**
   * Handles when the active flight plan leg changes.
   * @param data The active flight plan leg change event.
   */
  private onActiveLegChanged(data: FlightPlanActiveLegEvent): void {
    if (data.planIndex !== this.props.fms.flightPlanner.activePlanIndex) {
      return;
    }

    if (this.props.fms.hasPrimaryFlightPlan() && data.type === ActiveLegType.Lateral) {
      const plan = this.props.fms.getPrimaryFlightPlan();
      const toLeg = plan.tryGetLeg(data.segmentIndex, data.legIndex);
      this.toWaypoint.instance.setLeg(toLeg);

      if (toLeg !== null) {
        const toLegIndex = plan.getLegIndexFromLeg(toLeg);
        const fromLeg = plan.tryGetLeg(toLegIndex - 1);
        const directToState = this.props.fms.getDirectToState();

        this.fromWaypoint.instance.setLeg(fromLeg);

        if (fromLeg === null || directToState === DirectToState.TOEXISTING || directToState === DirectToState.TORANDOM) {
          this.legIcon.instance.updateLegIcon(true, true, toLeg.leg.type, toLeg.leg.turnDirection);
        } else {
          this.legIcon.instance.updateLegIcon(true, false, toLeg.leg.type, toLeg.leg.turnDirection);
        }
      } else {
        this.legIcon.instance.updateLegIcon(true, false, LegType.TF);
      }
    } else {
      this.legIcon.instance.updateLegIcon(true, false, LegType.TF);
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    switch (evt) {
      case InteractionEvent.RangeIncrease:
        this.ArcMap.context.getController(GNSMapKeys.Controller).increaseRange();
        return true;
      case InteractionEvent.RangeDecrease:
        this.ArcMap.context.getController(GNSMapKeys.Controller).decreaseRange();
        return true;
      case InteractionEvent.MENU:
        ViewService.menu(this.pageMenu);
        return true;
      case InteractionEvent.CLR:
        if (!this.rootControl.instance.isFocused) {
          this.ArcMap.context.getController(GNSMapKeys.Controller).changeDeclutter(this.props.settingsProvider.map.getSetting('map_arc_declutter_level'));
          return true;
        }
    }

    let handled = false;
    if (this.rootControl.instance.isFocused) {
      if (evt === InteractionEvent.CLR) {
        this.rootControl.instance.blur();
        handled = true;
      } else {
        handled = this.rootControl.instance.onInteractionEvent(evt);
      }
    }

    if (handled) {
      return handled;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.ArcMap.ref.instance.sleep();

    this.clockSub.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.ArcMap.ref.instance.wake();

    this.clockSub.resume();
  }

  /** @inheritdoc */
  public render(): VNode {
    const fieldSettings = this.props.settingsProvider.arcMapFields;

    return (
      <div class='page page-no-padding hide-element' ref={this.el}>
        <GNSUiControl ref={this.rootControl} isolateScroll>
          <div class='arc-map-topbar'>
            <div class='arc-map-track'>
              <svg width='42' height='10'>
                <path d='M 0 0 L 0 4 L 18 4 L 21 7 L 24 4 L 42 4 L 42 0 M 21 7 L 21 10' stroke-width='1px' stroke='cyan' />
              </svg>
              <MapPageDataField context={this.fieldContext}
                type={Subject.create<NavDataFieldType>(NavDataFieldType.GroundTrack)}
                bus={this.props.bus} ref={this.trkField} />
            </div>
            <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('arcmap_topLeft_field_type')} bus={this.props.bus} ref={this.fields[0]} />
            <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('arcmap_topRight_field_type')} bus={this.props.bus} ref={this.fields[1]} />
          </div>
          {this.ArcMap.map}
          <div class='arc-map-bottombar'>
            <div class='arc-map-waypoints'>
              <WaypointLeg ref={this.fromWaypoint} class='arc-map-waypoints-from' isArcMap={true} />
              <LegIcon ref={this.legIcon} />
              <WaypointLeg ref={this.toWaypoint} class='arc-map-waypoints-to' isArcMap={true} />
            </div>
            <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('arcmap_bottomLeft_field_type')} bus={this.props.bus} ref={this.fields[2]} />
            <WT530Cdi bus={this.props.bus} fms={this.props.fms} />
            <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('arcmap_bottomRight_field_type')} bus={this.props.bus} ref={this.fields[3]} />
          </div>
        </GNSUiControl>
      </div>
    );
  }
}

/**
 * A page menu for the arc nav map page.
 */
class ArcNavMapPageMenu extends MenuDefinition {
  public onChangeFieldsSelected = (): void => { };

  public onRestoreDefaults = (): void => { };

  private nexradLabel = Subject.create('Display NEXRAD?');
  private nexradSetting: UserSetting<UserSettingValue>;

  /**
   * Creates an instance of a ArcNavMapPageMenu.
   * @param settingsProvider The settings provider to use with this menu.
   */
  constructor(private readonly settingsProvider: GNSSettingsProvider) {
    super();

    this.nexradSetting = this.settingsProvider.map.getSetting('map_arc_nexrad_enabled');
    this.nexradSetting.sub(v => this.setEntryLabel(2, v ? 'Hide NEXRAD?' : 'Display NEXRAD?'), true);
  }

  /** @inheritdoc */
  public entries: readonly MenuEntry[] = [
    { label: 'Crossfill?', disabled: true, action: (): void => { } },
    { label: 'Enable Auto Zoom?', disabled: true, action: (): void => { } },
    { label: this.nexradLabel, disabled: false, action: this.toggleNexrad.bind(this) },
    { label: 'Change Fields?', disabled: false, action: (): void => this.onChangeFieldsSelected() },
    { label: 'Restore Defaults?', disabled: false, action: (): void => this.onRestoreDefaults() },
  ];

  /**
   * Toggles NEXRAD for the arc nav map.
   */
  private toggleNexrad(): void {
    this.nexradSetting.set(!this.nexradSetting.get());
    ViewService.back();
  }

  /** @inheritdoc */
  public updateEntries(): void {
    /** no-op */
  }
}