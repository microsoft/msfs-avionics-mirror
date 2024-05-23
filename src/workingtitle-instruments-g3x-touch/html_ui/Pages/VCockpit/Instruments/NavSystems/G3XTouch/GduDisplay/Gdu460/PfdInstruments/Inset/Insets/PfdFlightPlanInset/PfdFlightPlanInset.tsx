import { FSComponent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { MfdFplPageDataFieldRenderer } from '../../../../../../MFD/MainView/Pages/MfdFplPage/DataField/MfdFplPageDataFieldRenderer';
import { FmsFlightPlanningConfig } from '../../../../../../Shared/AvionicsConfig/FmsConfig';
import { UiFlightPlanList } from '../../../../../../Shared/Components/FlightPlan/UiFlightPlanList';
import { ActiveFlightPlanDataArray } from '../../../../../../Shared/FlightPlan/ActiveFlightPlanDataArray';
import { DefaultFlightPlanDataFieldCalculatorRepo } from '../../../../../../Shared/FlightPlan/DefaultFlightPlanDataFieldCalculatorRepo';
import { DefaultFlightPlanDataFieldFactory } from '../../../../../../Shared/FlightPlan/DefaultFlightPlanDataFieldFactory';
import { FlightPlanDataFieldType } from '../../../../../../Shared/FlightPlan/FlightPlanDataField';
import { FlightPlanDataItem, FlightPlanDataItemType } from '../../../../../../Shared/FlightPlan/FlightPlanDataItem';
import { G3XFms } from '../../../../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XExternalFplSourceIndex, G3XFplSource } from '../../../../../../Shared/FlightPlan/G3XFplSourceTypes';
import { FplCalculationUserSettings } from '../../../../../../Shared/Settings/FplCalculationUserSettings';
import { G3XDateTimeUserSettings } from '../../../../../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XUnitsUserSettings } from '../../../../../../Shared/Settings/G3XUnitsUserSettings';
import { AbstractPfdInset } from '../../AbstractPfdInset';
import { PfdInsetProps } from '../../PfdInset';
import { PfdFlightPlanInsetApproachLegPreviewListItem } from './PfdFlightPlanInsetApproachLegPreviewListItem';
import { PfdFlightPlanInsetLegListItem } from './PfdFlightPlanInsetLegListItem';

import './PfdFlightPlanInset.css';

/**
 * Component props for {@link PfdFlightPlanInset}.
 */
export interface PfdFlightPlanInsetProps extends PfdInsetProps {
  /** The FMS. */
  fms: G3XFms;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A configuration object defining options for flight planning. */
  flightPlanningConfig: FmsFlightPlanningConfig;
}

/**
 * A PFD flight plan inset.
 */
export class PfdFlightPlanInset extends AbstractPfdInset<PfdFlightPlanInsetProps> {
  private static readonly DATA_FIELD_UPDATE_INTERVAL = 1000; // milliseconds

  private readonly listRef = FSComponent.createRef<UiFlightPlanList>();

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private readonly fplCalculationSettingManager = FplCalculationUserSettings.getManager(this.props.uiService.bus);
  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly fplDataFieldCalculatorRepo = new DefaultFlightPlanDataFieldCalculatorRepo(
    this.props.uiService.bus,
    this.props.uiService.gduIndex,
    this.fplCalculationSettingManager.getSetting('fplSpeed'),
    this.fplCalculationSettingManager.getSetting('fplFuelFlow'),
    {
      supportSensedFuelFlow: this.props.flightPlanningConfig.supportSensedFuelFlow,
      fuelOnBoardType: this.props.flightPlanningConfig.fuelOnBoardType
    }
  );

  private readonly fplDataFieldRenderer = new MfdFplPageDataFieldRenderer(
    false,
    this.unitsSettingManager,
    G3XDateTimeUserSettings.getManager(this.props.uiService.bus)
  );

  private readonly fplDataArray = new ActiveFlightPlanDataArray(
    new DefaultFlightPlanDataFieldFactory(),
    this.fplDataFieldCalculatorRepo,
    {
      dataFieldCount: 2
    }
  );

  private lastDataFieldUpdateTime: number | undefined = undefined;
  private needScrollToActiveLeg = false;

  private fplSourceSub?: Subscription;
  private toLegIndexSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.fplDataArray.setAddWaypointItemVisible(false);
    this.fplDataArray.setDataFieldType(0, FlightPlanDataFieldType.Dtk);
    this.fplDataArray.setDataFieldType(1, FlightPlanDataFieldType.LegDistance);

    this.toLegIndexSub = this.fplDataArray.toLegIndex.sub(() => { this.needScrollToActiveLeg = true; }, false, true);

    this.fplSourceSub = this.props.fplSourceDataProvider.source.sub(this.onFplSourceChanged.bind(this), false, true);
  }

  /**
   * Responds to when the flight plan source changes.
   * @param source The new flight plan source.
   */
  private onFplSourceChanged(source: G3XFplSource): void {
    this.updateFplArrayFromSource(source);
  }

  /**
   * Updates this inset's flight plan data array from a flight plan source.
   * @param source The flight plan source from which to update the array.
   */
  private updateFplArrayFromSource(source: G3XFplSource): void {
    if (source === G3XFplSource.Internal || source === G3XFplSource.InternalRev) {
      this.fplDataFieldCalculatorRepo.setLNavIndex(this.props.fplSourceDataProvider.internalSourceDef.lnavIndex);
      this.fplDataArray.setFlightPlanner(false, this.props.fms.internalFms.flightPlanner);
    } else {
      this.updateFplArrayFromExternalSource(source === G3XFplSource.External1 ? 1 : 2);
    }

    this.scrollToActiveLeg(false, false);
  }

  /**
   * Updates this inset's flight plan data array from an external flight plan source.
   * @param index The index of the external flight plan source from which to update the array.
   */
  private updateFplArrayFromExternalSource(index: G3XExternalFplSourceIndex): void {
    const def = this.props.fplSourceDataProvider.externalSourceDefs[index];

    this.fplDataFieldCalculatorRepo.setLNavIndex(def?.lnavIndex ?? -1);
    this.fplDataArray.setFlightPlanner(true, def?.fms.flightPlanner ?? null);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.fplDataArray.resume();

    this.updateFplArrayFromSource(this.props.fplSourceDataProvider.source.get());

    this.fplSourceSub!.resume();
    this.toLegIndexSub!.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.fplDataArray.pause();

    this.fplSourceSub!.pause();
    this.toLegIndexSub!.pause();

    this.needScrollToActiveLeg = false;
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.lastDataFieldUpdateTime !== undefined && time < this.lastDataFieldUpdateTime) {
      this.lastDataFieldUpdateTime = time;
    }

    if (this.lastDataFieldUpdateTime === undefined || time - this.lastDataFieldUpdateTime >= PfdFlightPlanInset.DATA_FIELD_UPDATE_INTERVAL) {
      this.fplDataArray.calculateDataFields();
      this.lastDataFieldUpdateTime = time;
    }

    if (this.needScrollToActiveLeg) {
      this.scrollToActiveLeg(true, true);
      this.needScrollToActiveLeg = false;
    }
  }

  /**
   * Attempts to scroll this inset's list in order to place the active leg in the middle of the list.
   * @param animate Whether to animate the scroll.
   * @param skipIfItemInView Whether to skip the operation if the active leg is already in view or will be in view when
   * the current scrolling animation finishes.
   */
  private scrollToActiveLeg(animate: boolean, skipIfItemInView: boolean): void {
    const toLegVisibleIndex = this.listRef.instance.visibleIndexOfIndex(this.fplDataArray.toLegIndex.get());

    if (toLegVisibleIndex >= 0) {
      this.listRef.instance.scrollToIndex(toLegVisibleIndex, 1, false, animate, skipIfItemInView);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='pfd-fpl-inset'>
        <div class='pfd-fpl-inset-header'>
          <div class='pfd-fpl-inset-header-left'>Active Flight Plan</div>
          <div class='pfd-fpl-inset-header-right'>DTK / DIST</div>
        </div>
        <UiFlightPlanList
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.fplDataArray}
          renderItem={this.renderListItem.bind(this)}
          listItemLengthPx={59}
          listItemSpacingPx={0}
          maxRenderedItemCount={20}
          itemsPerPage={4}
          autoDisableOverscroll
          gduFormat={this.props.uiService.gduFormat}
          class='pfd-fpl-inset-list'
        />
      </div>
    );
  }

  /**
   * Renders a list item for a data item in this inset's flight plan array.
   * @param data The flight plan data item to render.
   * @returns A list item for the specified data item, as a VNode.
   * @throws Error if the data item has an unrecognized type.
   */
  private renderListItem(data: FlightPlanDataItem): VNode {
    switch (data.type) {
      case FlightPlanDataItemType.AddWaypoint:
        return (
          <div class='hidden' />
        );
      case FlightPlanDataItemType.Leg:
        return (
          <PfdFlightPlanInsetLegListItem
            data={data}
            facLoader={this.props.fms.facLoader}
            facWaypointCache={this.facWaypointCache}
            unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
          />
        );
      case FlightPlanDataItemType.ApproachLegPreview:
        return (
          <PfdFlightPlanInsetApproachLegPreviewListItem
            data={data}
            facLoader={this.props.fms.facLoader}
            facWaypointCache={this.facWaypointCache}
          />
        );
      default:
        throw new Error(`PfdFlightPlanInset: unrecognized flight plan data item type: ${(data as FlightPlanDataItem).type}`);
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.fplDataArray.destroy();
    this.fplDataFieldCalculatorRepo.destroy();
    this.fplDataFieldRenderer.destroy();

    this.fplSourceSub?.destroy();

    super.destroy();
  }
}
