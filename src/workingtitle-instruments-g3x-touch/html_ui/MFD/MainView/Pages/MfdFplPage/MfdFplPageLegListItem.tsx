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
import { FlightPlanLegDataItem, FlightPlanLegDataItemActiveStatus } from '../../../../Shared/FlightPlan/FlightPlanDataItem';
import { G3XUnitsUserSettingManager } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { MfdFplPageDataFieldRenderer } from './DataField/MfdFplPageDataFieldRenderer';
import { MfdFplPageDataFieldSlot } from './DataField/MfdFplPageDataFieldSlot';

import './MfdFplPageLegListItem.css';

/**
 * Component props for {@link MfdFplPageLegListItem}.
 */
export interface MfdFplPageLegListItemProps extends Omit<UiListItemProps, 'onFocusGained' | 'onFocusLost'> {
  /** Data pertaining to the list item's flight plan leg. */
  data: FlightPlanLegDataItem;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A cache used to retrieve waypoints. */
  facWaypointCache: GarminFacilityWaypointCache;

  /** The renderer to use to render the list item's flight plan data fields. */
  dataFieldRenderer: MfdFplPageDataFieldRenderer;

  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** The format of the list item's parent GDU display. */
  gduFormat: GduFormat;

  /**
   * A function which is called when the list item gains UI focus.
   * @param data The flight plan data associated with the list item.
   */
  onFocusGained?: (data: FlightPlanLegDataItem) => void;

  /**
   * A function which is called when the list item loses UI focus.
   * @param data The flight plan data associated with the list item.
   */
  onFocusLost?: (data: FlightPlanLegDataItem) => void;

  /**
   * A function which is called when the list item's leg button is pressed.
   * @param data The flight plan data associated with the list item.
   */
  onButtonPressed?: (button: UiTouchButton, data: FlightPlanLegDataItem) => void;

  /** The CSS class(es) to apply to the list item's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A list item that renders a flight plan leg data item for the MFD FPL page.
 */
export class MfdFplPageLegListItem extends DisplayComponent<MfdFplPageLegListItemProps> {

  private static readonly RESERVED_CSS_CLASSES = ['mfd-fpl-page-leg-list-item', 'mfd-fpl-page-leg-list-item-active'];

  private buttonChildrenNode?: VNode | null;

  private readonly itemRef = FSComponent.createRef<UiListItem>();

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly waypoint = Subject.create<FacilityWaypoint | null>(null);

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.retrieveWaypoint();

    this.subscriptions.push(
      this.props.data.activeStatus.sub(status => {
        this.rootCssClass.toggle('mfd-fpl-page-leg-list-item-active', status === FlightPlanLegDataItemActiveStatus.To);
      }, true)
    );
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
    this.rootCssClass.add('mfd-fpl-page-leg-list-item');

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, MfdFplPageLegListItem.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !MfdFplPageLegListItem.RESERVED_CSS_CLASSES.includes(classToFilter))) {
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
              class='mfd-fpl-page-leg-list-item-button'
            >
              {this.buttonChildrenNode = (
                <UiFlightPlanLegDisplay
                  leg={this.props.data.leg.leg}
                  fixIcao={this.props.data.fixIcao}
                  approachData={this.props.data.approachData}
                  facLoader={this.props.facLoader}
                  facWaypointCache={this.props.facWaypointCache}
                  class='mfd-fpl-page-leg-list-item-button-leg-display'
                />
              )}
            </UiTouchButton>
          </UiListFocusable>
          <div class='mfd-fpl-page-leg-list-item-data-field-container'>
            {this.props.data.dataFields.map((dataField, index) => {
              if (index >= 3) {
                return null;
              }

              return (
                <MfdFplPageDataFieldSlot
                  index={index}
                  dataField={dataField}
                  renderer={this.props.dataFieldRenderer}
                />
              );
            })}
          </div>
        </div>
      </UiListItem>
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
