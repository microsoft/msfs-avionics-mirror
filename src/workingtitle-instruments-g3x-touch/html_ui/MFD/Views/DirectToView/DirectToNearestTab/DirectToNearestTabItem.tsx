import { ComponentProps, DisplayComponent, FacilityWaypoint, FSComponent, NumberFormatter, VNode } from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { UiListButton } from '../../../../Shared/Components/List/UiListButton';
import { G3XUnitsUserSettingManager } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { UiNearestWaypointDisplay } from '../../../Components/Nearest/UiNearestWaypointDisplay';

import './DirectToNearestTabItem.css';

/**
 * Component props for {@link DirectToNearestTabItem}.
 */
export interface DirectToNearestTabItemProps extends ComponentProps {
  /** An information store for the waypoint to display. */
  waypointInfoStore: WaypointInfoStore;

  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** A callback function to execute when the item is selected. */
  onSelected: (waypoint: FacilityWaypoint) => void;
}

/**
 * A component which displays a waypoint in the Direct To Nearest tab.
 */
export class DirectToNearestTabItem extends DisplayComponent<DirectToNearestTabItemProps> {
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private readonly buttonRef = FSComponent.createRef<UiListButton>();

  /**
   * Handles when the waypoint is pressed.
   */
  private handleWaypointPressed(): void {
    const waypoint = this.props.waypointInfoStore.waypoint.get();
    if (waypoint) {
      this.props.onSelected(waypoint as FacilityWaypoint);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <UiListButton
        ref={this.buttonRef}
        fullSize
        useListItemStyle
        onPressed={this.handleWaypointPressed.bind(this)}
        class='direct-to-nearest-tab-item'
      >
        <UiNearestWaypointDisplay
          waypointInfoStore={this.props.waypointInfoStore}
          hideRightInfo
          unitsSettingManager={this.props.unitsSettingManager}
          class='direct-to-nearest-tab-item-waypoint'
        />
        <G3XNumberUnitDisplay
          value={this.props.waypointInfoStore.distance}
          displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
          formatter={DirectToNearestTabItem.DISTANCE_FORMATTER}
          class='direct-to-nearest-tab-item-brg-dist direct-to-nearest-tab-item-distance'
        />
        <G3XBearingDisplay
          value={this.props.waypointInfoStore.bearing}
          displayUnit={this.props.unitsSettingManager.navAngleUnits}
          formatter={DirectToNearestTabItem.BEARING_FORMATTER}
          class='direct-to-nearest-tab-item-brg-dist direct-to-nearest-tab-item-bearing'
        />
      </UiListButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
