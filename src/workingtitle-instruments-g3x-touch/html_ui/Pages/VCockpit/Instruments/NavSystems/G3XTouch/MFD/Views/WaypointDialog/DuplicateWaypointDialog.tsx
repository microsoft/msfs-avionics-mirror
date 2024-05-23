import {
  AirportUtils, ArraySubject, Facility, FacilityType, FacilityUtils, FacilityWaypoint, FSComponent, ICAO, VNode
} from '@microsoft/msfs-sdk';

import { DynamicListData, Regions } from '@microsoft/msfs-garminsdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';

import './DuplicateWaypointDialog.css';

/**
 * A request input for {@link DuplicateWaypointDialog}.
 */
export interface DuplicateWaypointDialogInput {
  /** The duplicate waypoints that the user can select. */
  waypoints: readonly FacilityWaypoint[];
}

/**
 * A dialog which allows the user to select a waypoint from among a list of waypoints with duplicate idents.
 */
export class DuplicateWaypointDialog extends AbstractUiView implements UiDialogView<DuplicateWaypointDialogInput, FacilityWaypoint> {
  private readonly listRef = FSComponent.createRef<UiList<Facility & DynamicListData>>();

  private readonly waypoints = ArraySubject.create<FacilityWaypoint>();

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<FacilityWaypoint> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public request(input: DuplicateWaypointDialogInput): Promise<UiDialogResult<FacilityWaypoint>> {
    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.waypoints.set(input.waypoints);
    });
  }

  /** @inheritDoc */
  public override onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public override onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public override onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when a waypoint is selected.
   * @param waypoint The selected waypoint.
   */
  private onWaypointSelected(waypoint: FacilityWaypoint): void {
    this.resultObject = {
      wasCancelled: false,
      payload: waypoint
    };

    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public override render(): VNode | null {
    return (
      <div class="facility-duplicates-dialog ui-view-panel">
        <div class="ui-view-panel-title">Duplicates Found</div>

        <UiList<FacilityWaypoint & DynamicListData>
          ref={this.listRef}
          class="facility-duplicates-dialog"
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds}
          listItemLengthPx={92}
          listItemSpacingPx={4}
          itemsPerPage={6}
          data={this.waypoints}
          renderItem={this.renderItem.bind(this)}
        />
      </div>
    );
  }

  /**
   * Renders a list item for a waypoint.
   * @param waypoint The waypoint for which to render the list item.
   * @returns A rendered list item for the specified waypoint, as a VNode.
   */
  private renderItem(waypoint: FacilityWaypoint): VNode {
    const facility = waypoint.facility.get();

    let labelText = ICAO.getIdent(facility.icao);

    let regionCode: string | undefined = facility.region;
    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      regionCode = AirportUtils.tryGetRegionCode(facility);
    }

    if (regionCode !== undefined) {
      labelText += ` - ${Regions.getName(regionCode)}`;
    }

    return (
      <UiListItem hideBorder={true}>
        <UiListFocusable>
          <UiTouchButton
            label={labelText}
            onPressed={this.onWaypointSelected.bind(this, waypoint)}
            class="facility-duplicates-dialog-entry"
          />
        </UiListFocusable>
      </UiListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cleanupRequest();

    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
