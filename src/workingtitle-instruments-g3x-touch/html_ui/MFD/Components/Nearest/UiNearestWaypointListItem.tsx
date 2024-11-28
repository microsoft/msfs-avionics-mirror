import {
  DisplayComponent, FSComponent, NumberFormatter, SetSubject, Subscribable, SubscribableSet, SubscribableUtils,
  Subscription, ToggleableClassNameRecord, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import { GduFormat } from '../../../Shared/CommonTypes';
import { UiBearingArrow } from '../../../Shared/Components/BearingArrow/UiBearingArrow';
import { G3XBearingDisplay } from '../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem, UiListItemProps } from '../../../Shared/Components/List/UiListItem';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { NearestWaypointEntry } from '../../../Shared/Nearest/NearestWaypointEntry';
import { G3XUnitsUserSettingManager } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { UiNearestWaypointDisplay } from './UiNearestWaypointDisplay';

import './UiNearestWaypointListItem.css';

/**
 * Component props for {@link UiNearestWaypointListItem}.
 */
export interface UiNearestWaypointListItemProps<
  W extends Waypoint,
  EntryType extends NearestWaypointEntry<W> = NearestWaypointEntry<W>
> extends Omit<UiListItemProps, 'onFocusGained' | 'onFocusLost'> {
  /** Data pertaining to the list item's waypoint. */
  entry: EntryType;

  /**
   * Whether to display the bearing and distance to the waypoint in the compact form. In the compact form, the bearing
   * and distance are stacked in a single column to take up less horizontal space. Defaults to `false`.
   */
  compactBrgDis?: boolean | Subscribable<boolean>;

  /**
   * Whether to display city information for applicable waypoints (airports, VORs, NDBs) instead of their names.
   * Defaults to `false`.
   */
  showCity?: boolean | Subscribable<boolean>;

  /**
   * Bit flags to use for filtering runways based on surface category when displaying longest runway information for
   * airports. Defaults to all flags set to `1` (`true`).
   */
  runwaySurfaceFilter?: number | Subscribable<number>;

  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** The format of the list item's parent GDU display. */
  gduFormat: GduFormat;

  /**
   * A function which is called when the list item gains UI focus.
   * @param entry The entry for the list item's waypoint.
   */
  onFocusGained?: (entry: EntryType) => void;

  /**
   * A function which is called when the list item loses UI focus.
   * @param entry The entry for the list item's waypoint.
   */
  onFocusLost?: (entry: EntryType) => void;

  /**
   * A function which is called when the list item's waypoint button is pressed.
   * @param entry The entry for the list item's waypoint.
   */
  onButtonPressed?: (entry: EntryType) => void;

  /** The CSS class(es) to apply to the list item's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A nearest waypoint list item.
 */
export class UiNearestWaypointListItem<W extends Waypoint, EntryType extends NearestWaypointEntry<W> = NearestWaypointEntry<W>>
  extends DisplayComponent<UiNearestWaypointListItemProps<W, EntryType>> {

  private static readonly RESERVED_CSS_CLASSES = ['nearest-wpt-list-item', 'nearest-wpt-list-item-compact-brg-dis'];

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private readonly itemRef = FSComponent.createRef<UiListItem>();

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (SubscribableUtils.isSubscribable(this.props.compactBrgDis)) {
      this.subscriptions.push(
        this.props.compactBrgDis.sub(compactBrgDis => {
          this.rootCssClass.toggle('nearest-wpt-list-item-compact-brg-dis', compactBrgDis);
        }, true)
      );
    } else {
      this.rootCssClass.toggle('nearest-wpt-list-item-compact-brg-dis', this.props.compactBrgDis === true);
    }
  }

  /**
   * Responds to when this list item gains focus.
   */
  private onFocusGained(): void {
    this.props.onFocusGained && this.props.onFocusGained(this.props.entry);
  }

  /**
   * Responds to when this list item loses focus.
   */
  private onFocusLost(): void {
    this.props.onFocusLost && this.props.onFocusLost(this.props.entry);
  }

  /**
   * Responds to when this list item's waypoint button is pressed.
   */
  private onButtonPressed(): void {
    this.props.onButtonPressed && this.props.onButtonPressed(this.props.entry);
  }

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('nearest-wpt-list-item');

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, UiNearestWaypointListItem.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiNearestWaypointListItem.RESERVED_CSS_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <UiListItem
        ref={this.itemRef}
        designatedChildDrivesFocusable={this.props.designatedChildDrivesFocusable}
        hideBorder={this.props.hideBorder}
        onFocusGained={this.onFocusGained.bind(this)}
        onFocusLost={this.onFocusLost.bind(this)}
      >
        <div class={this.rootCssClass}>
          <UiListFocusable>
            <UiTouchButton
              onPressed={this.onButtonPressed.bind(this)}
              isInList
              gduFormat={this.props.gduFormat}
              class='nearest-wpt-list-item-button'
            >
              <UiNearestWaypointDisplay
                waypointInfoStore={this.props.entry.store}
                showCity={this.props.showCity}
                runwaySurfaceFilter={this.props.runwaySurfaceFilter}
                unitsSettingManager={this.props.unitsSettingManager}
              />
            </UiTouchButton>
          </UiListFocusable>
          <div class='nearest-wpt-list-item-brg-dis-container'>
            <div class='nearest-wpt-list-item-brg'>
              <UiBearingArrow
                relativeBearing={this.props.entry.relativeBearing}
              />
              <G3XBearingDisplay
                value={this.props.entry.store.bearing}
                displayUnit={this.props.unitsSettingManager.navAngleUnits}
                formatter={UiNearestWaypointListItem.BEARING_FORMATTER}
              />
            </div>
            <div class='nearest-wpt-list-item-divider nearest-wpt-list-item-brg-dis-divider' />
            <G3XNumberUnitDisplay
              value={this.props.entry.store.distance}
              displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
              formatter={UiNearestWaypointListItem.DISTANCE_FORMATTER}
              class='nearest-wpt-list-item-dis'
            />
          </div>
          {this.props.children}
        </div>
      </UiListItem>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.itemRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}