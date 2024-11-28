import { ArraySubject, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { NavDataBarSettingTypes, NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { GroupBox } from '../GroupBox';
import { MFDNavDataBarUserSettings } from '../NavDataBar/MFDNavDataBarUserSettings';
import { MFDSystemSetupGroupProps } from './MFDSystemSetupGroup';
import { MFDSystemSetupSelectRow } from './MFDSystemSetupRow';

/**
 * The MFD System Setup page MFD Data Bar Fields group.
 */
export class MFDSystemSetupDataBarGroup extends DisplayComponent<MFDSystemSetupGroupProps> {
  private static readonly SUPPORTED_FIELD_TYPES = [
    NavDataFieldType.BearingToWaypoint,
    NavDataFieldType.Destination,
    NavDataFieldType.DistanceToWaypoint,
    NavDataFieldType.DistanceToDestination,
    NavDataFieldType.DesiredTrack,
    NavDataFieldType.Endurance,
    NavDataFieldType.TimeToDestination,
    NavDataFieldType.TimeOfWaypointArrival,
    NavDataFieldType.TimeToWaypoint,
    NavDataFieldType.FuelOnBoard,
    NavDataFieldType.FuelOverDestination,
    NavDataFieldType.GroundSpeed,
    NavDataFieldType.ISA,
    NavDataFieldType.TimeOfDestinationArrival,
    NavDataFieldType.TrueAirspeed,
    NavDataFieldType.TrackAngleError,
    NavDataFieldType.GroundTrack,
    NavDataFieldType.VerticalSpeedRequired,
    NavDataFieldType.CrossTrack
  ];

  private readonly settingManager = MFDNavDataBarUserSettings.getManager(this.props.bus);

  /** @inheritdoc */
  public render(): VNode {
    const valueArray = ArraySubject.create(Array.from(MFDSystemSetupDataBarGroup.SUPPORTED_FIELD_TYPES));
    return (
      <GroupBox title='MFD Data Bar Fields' class='mfd-system-setup-group'>
        <MFDSystemSetupSelectRow<NavDataBarSettingTypes, 'navDataBarField0'>
          title={'Field 1'}
          selectControlProps={{
            viewService: this.props.viewService,
            registerFunc: this.props.registerFunc,
            settingManager: this.settingManager,
            settingName: 'navDataBarField0',
            values: valueArray,
            outerContainer: this.props.pageContainerRef
          }}
        />
        <MFDSystemSetupSelectRow<NavDataBarSettingTypes, 'navDataBarField1'>
          title={'Field 2'}
          selectControlProps={{
            viewService: this.props.viewService,
            registerFunc: this.props.registerFunc,
            settingManager: this.settingManager,
            settingName: 'navDataBarField1',
            values: valueArray,
            outerContainer: this.props.pageContainerRef
          }}
        />
        <MFDSystemSetupSelectRow<NavDataBarSettingTypes, 'navDataBarField2'>
          title={'Field 3'}
          selectControlProps={{
            viewService: this.props.viewService,
            registerFunc: this.props.registerFunc,
            settingManager: this.settingManager,
            settingName: 'navDataBarField2',
            values: valueArray,
            outerContainer: this.props.pageContainerRef
          }}
        />
        <MFDSystemSetupSelectRow<NavDataBarSettingTypes, 'navDataBarField3'>
          title={'Field 4'}
          selectControlProps={{
            viewService: this.props.viewService,
            registerFunc: this.props.registerFunc,
            settingManager: this.settingManager,
            settingName: 'navDataBarField3',
            values: valueArray,
            outerContainer: this.props.pageContainerRef
          }}
        />
      </GroupBox>
    );
  }
}