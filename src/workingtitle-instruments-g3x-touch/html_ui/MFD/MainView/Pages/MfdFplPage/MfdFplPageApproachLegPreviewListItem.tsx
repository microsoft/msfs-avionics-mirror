import {
  DisplayComponent, FSComponent, FacilityLoader, FacilityWaypoint, ICAO, SetSubject, Subject, SubscribableSet,
  Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../../../Shared/CommonTypes';
import { UiFlightPlanLegDisplay } from '../../../../Shared/Components/FlightPlan/UiFlightPlanLegDisplay';
import { UiListFocusable } from '../../../../Shared/Components/List/UiListFocusable';
import { UiListItem, UiListItemProps } from '../../../../Shared/Components/List/UiListItem';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { FlightPlanApproachLegPreviewDataItem } from '../../../../Shared/FlightPlan/FlightPlanDataItem';

import './MfdFplPageApproachLegPreviewListItem.css';

/**
 * Component props for {@link MfdFplPageApproachLegPreviewListItem}.
 */
export interface MfdFplPageApproachLegPreviewListItemProps extends Omit<UiListItemProps, 'onFocusGained' | 'onFocusLost'> {
  /** Data pertaining to the list item's flight plan leg. */
  data: FlightPlanApproachLegPreviewDataItem;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A cache used to retrieve waypoints. */
  facWaypointCache: GarminFacilityWaypointCache;

  /** The format of the list item's parent GDU display. */
  gduFormat: GduFormat;

  /**
   * A function which is called when the list item gains UI focus.
   * @param data The flight plan data associated with the list item.
   */
  onFocusGained?: (data: FlightPlanApproachLegPreviewDataItem) => void;

  /**
   * A function which is called when the list item loses UI focus.
   * @param data The flight plan data associated with the list item.
   */
  onFocusLost?: (data: FlightPlanApproachLegPreviewDataItem) => void;

  /**
   * A function which is called when the list item's leg button is pressed.
   * @param data The flight plan data associated with the list item.
   */
  onButtonPressed?: (button: UiTouchButton, data: FlightPlanApproachLegPreviewDataItem) => void;

  /** The CSS class(es) to apply to the list item's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A list item that renders a previewed approach flight plan leg data item for the MFD FPL page.
 */
export class MfdFplPageApproachLegPreviewListItem extends DisplayComponent<MfdFplPageApproachLegPreviewListItemProps> {

  private static readonly RESERVED_CSS_CLASSES = ['mfd-fpl-page-approach-leg-preview-list-item'];

  private buttonChildrenNode?: VNode | null;

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

  /**
   * Responds to when this list item gains focus.
   */
  private onFocusGained(): void {
    this.props.onFocusGained && this.props.onFocusGained(this.props.data);
  }

  /**
   * Responds to when this list item loses focus.
   */
  private onFocusLost(): void {
    this.props.onFocusLost && this.props.onFocusLost(this.props.data);
  }

  /**
   * Responds to when this list item's leg button is pressed.
   * @param button The button that was pressed.
   */
  private onButtonPressed(button: UiTouchButton): void {
    this.props.onButtonPressed && this.props.onButtonPressed(button, this.props.data);
  }

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('mfd-fpl-page-approach-leg-preview-list-item');

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, MfdFplPageApproachLegPreviewListItem.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      const classesToAdd = FSComponent.parseCssClassesFromString(
        this.props.class,
        classToFilter => !MfdFplPageApproachLegPreviewListItem.RESERVED_CSS_CLASSES.includes(classToFilter)
      );
      for (const classToAdd of classesToAdd) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class='mfd-fpl-page-approach-leg-preview-list-item-container'>
        {this.props.data.index === 0 && (
          <div class='mfd-fpl-page-approach-leg-preview-list-item-top-divider' />
        )}
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
                class='mfd-fpl-page-approach-leg-preview-list-item-button'
              >
                {this.buttonChildrenNode = (
                  <UiFlightPlanLegDisplay
                    leg={this.props.data.leg}
                    fixIcao={this.props.data.fixIcao}
                    approachData={this.props.data.approachData}
                    facLoader={this.props.facLoader}
                    facWaypointCache={this.props.facWaypointCache}
                    class='mfd-fpl-page-approach-leg-preview-list-item-button-leg-display'
                  />
                )}
              </UiTouchButton>
            </UiListFocusable>

            {/*
            * We use dummy data fields here to make sure the empty space on the right of the item is consistent with
            * the data fields on flight plan leg list items.
           */}
            <div class='mfd-fpl-page-approach-leg-preview-list-item-data-field-container'>
              <div class='mfd-fpl-page-data-field-slot mfd-fpl-page-data-field-slot-1' />
              <div class='mfd-fpl-page-data-field-slot mfd-fpl-page-data-field-slot-2' />
              <div class='mfd-fpl-page-data-field-slot mfd-fpl-page-data-field-slot-3' />
            </div>
          </div>
        </UiListItem>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonChildrenNode && FSComponent.shallowDestroy(this.buttonChildrenNode);

    this.itemRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
