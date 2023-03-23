import { ClockEvents, EventBus, FocusPosition, FSComponent, GPSSatComputerEvents, GPSSystemState, Subject, VNode } from '@microsoft/msfs-sdk';

import { DefaultNavDataBarFieldModelFactory, Fms, NavDataFieldGpsValidity, NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSType } from '../../../UITypes';
import { DataFieldContext, GNSDataFieldRenderer } from '../../DataFields/GNSDataFieldRenderer';
import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { MapPageDataField } from './MapPageDataField';

import './StandardNavMapFields.css';

/**
 * Props for {@link StandardNavMapFields}
 */
export interface StandardNavMapFieldsProps extends GNSUiControlProps {
  /** The event bus */
  bus: EventBus,

  /** The FMS */
  fms: Fms,

  /** The type of GNS unit. */
  gnsType: GNSType
}

/**
 * A control that contains the data field setup menu for the standard nav map
 */
export class StandardNavMapFields extends GNSUiControl<StandardNavMapFieldsProps> {
  private readonly el = FSComponent.createRef<HTMLElement>();

  private readonly gpsValidity = Subject.create<NavDataFieldGpsValidity>(NavDataFieldGpsValidity.Invalid);
  private readonly settingsProvider = new GNSSettingsProvider(this.props.bus);

  private readonly fieldContext: DataFieldContext = {
    modelFactory: new DefaultNavDataBarFieldModelFactory(this.props.bus, this.props.fms, this.gpsValidity),
    renderer: new GNSDataFieldRenderer(this.settingsProvider.units, this.settingsProvider.time),
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
      { label: 'WPT - Active Wpt', disabled: false, type: NavDataFieldType.Waypoint },
      { label: 'XTK - Cross Track Err', disabled: false, type: NavDataFieldType.CrossTrack },
    ],
  };

  private readonly fields = [
    FSComponent.createRef<MapPageDataField>(),
    FSComponent.createRef<MapPageDataField>(),
    FSComponent.createRef<MapPageDataField>(),
    FSComponent.createRef<MapPageDataField>(),
    FSComponent.createRef<MapPageDataField>()
  ];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(state => {
      const valid = state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired;
      this.gpsValidity.set(valid ? NavDataFieldGpsValidity.Valid : NavDataFieldGpsValidity.Invalid);
    });
  }

  public readonly clockSub = this.props.bus.getSubscriber<ClockEvents>().on('realTime')
    .atFrequency(4).handle(() => {
      for (let i = 0; i < this.fields.length; i++) {
        this.fields[i].getOrDefault()?.update();
      }
    });

  /**
   * Sets whether the map setup pane is open.
   * @param isOpen True if open, false otherwise.
   */
  public setOpen(isOpen: boolean): void {
    if (isOpen) {
      this.el.instance.classList.remove('hide-element');
    } else {
      this.el.instance.classList.add('hide-element');
      this.blur();
    }
  }

  /**
   * Focuses the data field pane itself
   */
  public focusSelf(): void {
    this.focus(FocusPosition.First);
  }

  /** @inheritdoc */
  public onRightKnobPush(): boolean {
    this.blur();
    return true;
  }

  /** @inheritDoc */
  render(): VNode {
    const fieldSettings = this.settingsProvider.standardNavMapFields;

    return (
      <div ref={this.el} class="std-map-data-fields hide-element">
        <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('stdmap_field_1_type')} bus={this.props.bus} ref={this.fields[0]} />
        <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('stdmap_field_2_type')} bus={this.props.bus} ref={this.fields[1]} />
        <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('stdmap_field_3_type')} bus={this.props.bus} ref={this.fields[2]} />
        <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('stdmap_field_4_type')} bus={this.props.bus} ref={this.fields[3]} />
        {this.props.gnsType === 'wt530' &&
          <MapPageDataField context={this.fieldContext} type={fieldSettings.getSetting('stdmap_field_5_type')} bus={this.props.bus} ref={this.fields[4]} />}
      </div>
    );
  }
}