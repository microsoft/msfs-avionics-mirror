import { FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { MFDMapSettingsGroup, MFDMapSettingsGroupProps } from './MFDMapSettingsGroup';
import { MFDMapToggleRangeSettingsRow } from './MFDMapSettingsRow';

/**
 * The 'Land' map settings group.
 */
export class MFDMapSettingsLandGroup extends MFDMapSettingsGroup<MFDMapSettingsGroupProps> {
  /** @inheritdoc */
  protected getSettingRows(containerRef: NodeReference<HTMLElement>): VNode[] {
    return [
      <MFDMapToggleRangeSettingsRow
        viewService={this.props.viewService}
        title={'User Waypoint'}
        toggleProps={{
          viewService: this.props.viewService,
          registerFunc: this.register,
          settingManager: this.props.settingManager,
          settingName: 'mapUserWaypointShow',
        }}
        rangeProps={{
          viewService: this.props.viewService,
          registerFunc: this.register,
          settingManager: this.props.settingManager,
          settingName: 'mapUserWaypointRangeIndex',
          values: Array.from({ length: 10 }, (value, index) => index + 9), // 1 nm to 40 nm
          mapRanges: this.props.mapRanges,
          outerContainer: containerRef
        }}
      />
    ];
  }
}