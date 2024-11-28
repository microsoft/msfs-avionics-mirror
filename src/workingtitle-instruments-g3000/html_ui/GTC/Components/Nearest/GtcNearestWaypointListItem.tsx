import { DisplayComponent, FacilityWaypoint, FSComponent, NumberFormatter, SetSubject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { BearingDisplay, NumberUnitDisplay, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { NearestWaypointEntry } from '@microsoft/msfs-wtg3000-common';
import { GtcService } from '../../GtcService/GtcService';
import { GtcBearingArrow } from '../BearingArrow/GtcBearingArrow';
import { GtcListItem, GtcListItemProps } from '../List/GtcListItem';
import { GtcWaypointButton } from '../TouchButton/GtcWaypointButton';

import './GtcNearestWaypointListItem.css';

/**
 * Component props for GtcNearestWaypointListItem.
 */
export interface GtcNearestWaypointListItemProps<EntryType extends NearestWaypointEntry<FacilityWaypoint<any>> = NearestWaypointEntry<FacilityWaypoint<any>>>
  extends GtcListItemProps {

  /** The GTC service. */
  gtcService: GtcService;

  /** Data pertaining to the list item's waypoint. */
  entry: EntryType;

  /** A manager for display unit settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the list item is selected. */
  isSelected?: Subscribable<boolean>;

  /** A callback function to execute when the list item's waypoint button is pressed. */
  onButtonPressed?: (entry: EntryType) => void;
}

/**
 * A GTC list item which displays information on a nearest waypoint entry. Renders a waypoint button, bearing and
 * distance to waypoint, and additional optional children.
 */
export class GtcNearestWaypointListItem<EntryType extends NearestWaypointEntry<FacilityWaypoint<any>> = NearestWaypointEntry<FacilityWaypoint<any>>>
  extends DisplayComponent<GtcNearestWaypointListItemProps<EntryType>> {

  private static readonly RESERVED_CSS_CLASSES = ['nearest-wpt-list-item'];

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private readonly itemRef = FSComponent.createRef<GtcListItem>();

  private cssClassSub?: Subscription | Subscription[];

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['nearest-wpt-list-item']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, GtcNearestWaypointListItem.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'nearest-wpt-list-item';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !GtcNearestWaypointListItem.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <GtcListItem
        ref={this.itemRef}
        hideBorder={this.props.hideBorder}
        paddedListItem={this.props.paddedListItem}
        class={cssClass}
      >
        <GtcWaypointButton
          waypoint={this.props.entry.waypoint}
          onPressed={() => { this.props.onButtonPressed && this.props.onButtonPressed(this.props.entry); }}
          isHighlighted={this.props.isSelected}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
          class='nearest-wpt-list-item-button'
        />
        <div class='nearest-wpt-list-item-brg'>
          <GtcBearingArrow
            relativeBearing={this.props.entry.relativeBearing}
          />
          <BearingDisplay
            value={this.props.entry.store.bearing}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={GtcNearestWaypointListItem.BEARING_FORMATTER}
          />
        </div>
        <NumberUnitDisplay
          value={this.props.entry.store.distance}
          displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
          formatter={GtcNearestWaypointListItem.DISTANCE_FORMATTER}
          class='nearest-wpt-list-item-dis'
        />
        {this.props.children}
      </GtcListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.itemRef.getOrDefault()?.destroy();

    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    super.destroy();
  }
}