import { ComputedSubject, Facility, FacilityType, FacilityWaypoint, FSComponent, ICAO, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { UiControl, UiControlProps } from '../UiControl';
import { G1000WaypointIcon } from '../Waypoint/G1000WaypointIcon';
import { WaypointRegion } from '../Waypoint/WaypointRegion';

import './WptDupListItem.css';

/**
 * Component props for WaypointDuplicateFacilityItem.
 */
export interface WptDupListItemProps extends UiControlProps {
  /** A subject which provides a facility waypoint to bind. */
  waypoint: Subscribable<FacilityWaypoint<Facility> | null>;

  /** CSS class(es) to add to the root of the list item component. */
  class?: string;
}

/**
 * An item in a list of duplicate facility waypoints. Displays the type of the waypoint, an icon, and the region in
 * which the waypoint is located.
 */
export class WptDupListItem extends UiControl<WptDupListItemProps> {
  private static readonly FACILITY_TYPE_TEXT = {
    [FacilityType.Airport]: 'APT',
    [FacilityType.VOR]: 'VOR',
    [FacilityType.NDB]: 'NDB',
    [FacilityType.Intersection]: 'INT',
    [FacilityType.USR]: 'USR',
    [FacilityType.RWY]: 'RWY',
    [FacilityType.VIS]: 'VIS'
  };

  private readonly iconRef = FSComponent.createRef<G1000WaypointIcon>();
  private readonly regionContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly regionRef = FSComponent.createRef<WaypointRegion>();

  private readonly facilityType = ComputedSubject.create<FacilityWaypoint<Facility> | null, string>(null, (waypoint): string => {
    return waypoint ? WptDupListItem.FACILITY_TYPE_TEXT[ICAO.getFacilityType(waypoint.facility.get().icao)] : '';
  });

  private waypointSub?: Subscription;

  /** @inheritdoc */
  constructor(props: WptDupListItemProps) {
    super(props);

    this.waypointSub = this.props.waypoint.sub(this.onWaypointChanged.bind(this), true);
  }

  /** @inheritDoc */
  public getHighlightElement(): Element | null {
    return this.regionContainerRef.instance;
  }

  /**
   * A callback which is called when this item's waypoint changes.
   * @param waypoint The new waypoint.
   */
  protected onWaypointChanged(waypoint: FacilityWaypoint<Facility> | null): void {
    this.facilityType.set(waypoint);
  }

  /**
   * Renders this control.
   * @returns this control's VNode.
   */
  public renderControl(): VNode {
    return (
      <div class={`wpt-dup-listitem ${this.props.class ?? ''}`}>
        <div class='wpt-dup-listitem-type'>{this.facilityType}</div>
        <G1000WaypointIcon ref={this.iconRef} waypoint={this.props.waypoint} class='wpt-dup-listitem-icon' />
        <div ref={this.regionContainerRef} class='wpt-dup-listitem-region-container'>
          <WaypointRegion ref={this.regionRef} waypoint={this.props.waypoint} class='wpt-dup-listitem-region' />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.iconRef.instance.destroy();
    this.regionRef.instance.destroy();
    this.waypointSub?.destroy();

    super.destroy();
  }
}