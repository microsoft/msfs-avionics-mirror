import {
  ComponentProps, DisplayComponent, FSComponent, FacilityLoader, FacilityWaypoint, ICAO, SetSubject, Subject,
  SubscribableSet, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { UiFlightPlanLegDisplay } from '../../../../../../Shared/Components/FlightPlan/UiFlightPlanLegDisplay';
import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { FlightPlanApproachLegPreviewDataItem } from '../../../../../../Shared/FlightPlan/FlightPlanDataItem';

import './PfdFlightPlanInsetApproachLegPreviewListItem.css';

/**
 * Component props for {@link PfdFlightPlanInsetApproachLegPreviewListItem}.
 */
export interface PfdFlightPlanInsetApproachLegPreviewListItemProps extends ComponentProps {
  /** Data pertaining to the list item's flight plan leg. */
  data: FlightPlanApproachLegPreviewDataItem;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A cache used to retrieve waypoints. */
  facWaypointCache: GarminFacilityWaypointCache;

  /** The CSS class(es) to apply to the list item's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A list item that renders a previewed approach flight plan leg data item for the PFD flight plan inset.
 */
export class PfdFlightPlanInsetApproachLegPreviewListItem extends DisplayComponent<PfdFlightPlanInsetApproachLegPreviewListItemProps> {

  private static readonly RESERVED_CSS_CLASSES = ['pfd-fpl-inset-approach-leg-preview-list-item'];

  private readonly itemRef = FSComponent.createRef<UiListItem>();

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly waypoint = Subject.create<FacilityWaypoint | null>(null);

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.retrieveWaypoint();
  }

  /**
   * Retrieves this list item's waypoint fix.
   */
  private async retrieveWaypoint(): Promise<void> {
    const fixIcao = this.props.data.fixIcao;
    if (!ICAO.isFacility(fixIcao)) {
      return;
    }

    try {
      const facility = await this.props.facLoader.getFacility(ICAO.getFacilityType(fixIcao), fixIcao);
      this.waypoint.set(this.props.facWaypointCache.get(facility));
    } catch {
      // noop
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('pfd-fpl-inset-approach-leg-preview-list-item');

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, PfdFlightPlanInsetApproachLegPreviewListItem.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      const classesToAdd = FSComponent.parseCssClassesFromString(
        this.props.class,
        classToFilter => !PfdFlightPlanInsetApproachLegPreviewListItem.RESERVED_CSS_CLASSES.includes(classToFilter)
      );
      for (const classToAdd of classesToAdd) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <UiListItem
        ref={this.itemRef}
        hideBorder
        designatedChildDrivesFocusable
      >
        <div class={this.rootCssClass}>
          <UiFlightPlanLegDisplay
            leg={this.props.data.leg}
            fixIcao={this.props.data.fixIcao}
            approachData={this.props.data.approachData}
            facLoader={this.props.facLoader}
            facWaypointCache={this.props.facWaypointCache}
            class='pfd-fpl-inset-approach-leg-preview-list-item-leg-display'
          />
          <div class='pfd-fpl-inset-approach-leg-preview-list-item-data-field-container' />
        </div>
      </UiListItem>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.itemRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
