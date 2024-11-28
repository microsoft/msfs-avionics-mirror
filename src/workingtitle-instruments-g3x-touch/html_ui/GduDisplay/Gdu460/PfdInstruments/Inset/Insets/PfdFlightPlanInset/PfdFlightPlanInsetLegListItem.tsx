import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, FSComponent, FacilityLoader,
  FacilityWaypoint, ICAO, NumberFormatter, NumberUnitSubject, SetSubject, Subject, SubscribableSet,
  SubscribableUtils, Subscription, ToggleableClassNameRecord, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../../../../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { UiFlightPlanLegDisplay } from '../../../../../../Shared/Components/FlightPlan/UiFlightPlanLegDisplay';
import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { FlightPlanDataFieldType, FlightPlanDataFieldTypeValueMap } from '../../../../../../Shared/FlightPlan/FlightPlanDataField';
import { FlightPlanLegDataItem, FlightPlanLegDataItemActiveStatus } from '../../../../../../Shared/FlightPlan/FlightPlanDataItem';
import { G3XUnitsUserSettingManager } from '../../../../../../Shared/Settings/G3XUnitsUserSettings';

import './PfdFlightPlanInsetLegListItem.css';

/**
 * Component props for {@link PfdFlightPlanInsetLegListItem}.
 */
export interface PfdFlightPlanInsetLegListItemProps extends ComponentProps {
  /** Data pertaining to the list item's flight plan leg. */
  data: FlightPlanLegDataItem;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A cache used to retrieve waypoints. */
  facWaypointCache: GarminFacilityWaypointCache;

  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** The CSS class(es) to apply to the list item's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A list item that renders a flight plan leg data item for the PFD flight plan inset.
 */
export class PfdFlightPlanInsetLegListItem extends DisplayComponent<PfdFlightPlanInsetLegListItemProps> {

  private static readonly RESERVED_CSS_CLASSES = ['pfd-fpl-inset-leg-list-item', 'pfd-fpl-inset-leg-list-item-active'];

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private readonly itemRef = FSComponent.createRef<UiListItem>();

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly waypoint = Subject.create<FacilityWaypoint | null>(null);

  private readonly bearingValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly distanceValue = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.retrieveWaypoint();

    this.subscriptions.push(
      this.props.data.activeStatus.sub(status => {
        this.rootCssClass.toggle('pfd-fpl-inset-leg-list-item-active', status === FlightPlanLegDataItemActiveStatus.To);
      }, true),

      SubscribableUtils.pipeOptionalMappedSource(
        this.props.data.dataFields[0],
        this.bearingValue,
        to => { to.set(NaN); },
        field => field && field.type === FlightPlanDataFieldType.Dtk
          ? field.value as FlightPlanDataFieldTypeValueMap[FlightPlanDataFieldType.Dtk]
          : undefined
      ),

      SubscribableUtils.pipeOptionalMappedSource(
        this.props.data.dataFields[1],
        this.distanceValue,
        to => { to.set(NaN); },
        field => field && field.type === FlightPlanDataFieldType.LegDistance
          ? field.value as FlightPlanDataFieldTypeValueMap[FlightPlanDataFieldType.LegDistance]
          : undefined
      ),
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

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('pfd-fpl-inset-leg-list-item');

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, PfdFlightPlanInsetLegListItem.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      const classesToAdd = FSComponent.parseCssClassesFromString(
        this.props.class,
        classToFilter => !PfdFlightPlanInsetLegListItem.RESERVED_CSS_CLASSES.includes(classToFilter)
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
            leg={this.props.data.leg.leg}
            fixIcao={this.props.data.fixIcao}
            approachData={this.props.data.approachData}
            facLoader={this.props.facLoader}
            facWaypointCache={this.props.facWaypointCache}
            useShortSpecialLegIdent
            class='pfd-fpl-inset-leg-list-item-leg-display'
          />
          <div class='pfd-fpl-inset-leg-list-item-data-field-container'>
            <G3XBearingDisplay
              value={this.bearingValue}
              displayUnit={this.props.unitsSettingManager.navAngleUnits}
              formatter={PfdFlightPlanInsetLegListItem.BEARING_FORMATTER}
              class='pfd-fpl-inset-leg-list-item-data-field-brg'
            />
            <G3XNumberUnitDisplay
              value={this.distanceValue}
              displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
              formatter={PfdFlightPlanInsetLegListItem.DISTANCE_FORMATTER}
              class='pfd-fpl-inset-leg-list-item-data-field-dist'
            />
          </div>
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
