import {
  DisplayComponent, Facility, FacilitySearchType, FacilityWaypoint, FSComponent, ICAO, IntersectionFacility, NdbFacility, Subscribable,
  SubscribableSet, SubscribableUtils, UserFacility, VNode, VorFacility,
} from '@microsoft/msfs-sdk';
import { AirportWaypoint, GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcWaypointButton, GtcWaypointButtonProps } from './GtcWaypointButton';
import { GtcKeyboardDialog } from '../../Dialog/GtcKeyboardDialog';

/**
 * Waypoint search types supported by {@link GtcWaypointSelectButton}.
 */
export type WaypointSelectType = Extract<FacilitySearchType,
  FacilitySearchType.AllExceptVisual |
  FacilitySearchType.Airport |
  FacilitySearchType.Vor |
  FacilitySearchType.Ndb |
  FacilitySearchType.Intersection |
  FacilitySearchType.User
>;

/**
 * A map from waypoint search types to waypoint types.
 */
export type WaypointSelectTypeMap = {
  /** All waypoints. */
  [FacilitySearchType.AllExceptVisual]: FacilityWaypoint;

  /** Airports. */
  [FacilitySearchType.Airport]: AirportWaypoint;

  /** VORs. */
  [FacilitySearchType.Vor]: FacilityWaypoint<VorFacility>;

  /** NDBs. */
  [FacilitySearchType.Ndb]: FacilityWaypoint<NdbFacility>;

  /** Intersections. */
  [FacilitySearchType.Intersection]: FacilityWaypoint<IntersectionFacility>;

  /** User waypoints. */
  [FacilitySearchType.User]: FacilityWaypoint<UserFacility>;
};

/**
 * Component props for GtcWaypointSelectButton.
 */
export interface GtcWaypointSelectButtonProps<T extends WaypointSelectType, S extends Subscribable<WaypointSelectTypeMap[T] | null>>
  extends Omit<GtcWaypointButtonProps, 'waypoint' | 'onPressed' | 'gtcOrientation'> {

  /** The GTC service. */
  gtcService: GtcService;

  /** The type of facility allowed to be selected by the button. */
  type: T;

  /** The waypoint state bound to the button. */
  waypoint: S;

  /** A cache used by the button to retrieve waypoints for facilities. */
  waypointCache: GarminFacilityWaypointCache;

  /**
   * A callback function which will be called every time a value is selected from the list. If not defined and the
   * button's bound waypoint state is a mutable subscribable, the bound state will be set to the selected waypoint.
   * @param selectedWaypoint The waypoint that was selected.
   * @param waypointState The waypoint state bound to the button.
   * @param button The button used to initiate the selection.
   */
  onSelected?: <B extends GtcWaypointSelectButton<T, S> = GtcWaypointSelectButton<T, S>>(
    selectedWaypoint: WaypointSelectTypeMap[T],
    waypointState: S,
    button: B
  ) => void;

  /**
   * A callback function which will be called every time a waypoint selection from the button is cancelled.
   * @param button The button used to initiate the selection that was cancelled.
   * @param waypointState The waypoint state bound to the button.
   */
  onCancelled?: <B extends GtcWaypointSelectButton<T, S> = GtcWaypointSelectButton<T, S>>(
    button: B,
    waypointState: S
  ) => void;

  /** The CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A GTC button which displays the ident, name, and icon for a waypoint and when pressed allows the user to select
 * a facility waypoint by ident.
 */
export class GtcWaypointSelectButton<T extends WaypointSelectType, S extends Subscribable<WaypointSelectTypeMap[T] | null>>
  extends DisplayComponent<GtcWaypointSelectButtonProps<T, S>> {

  private static readonly DIALOG_LABEL_TEXT = {
    [FacilitySearchType.AllExceptVisual]: 'Waypoint Identifier Lookup',
    [FacilitySearchType.Airport]: 'Airport Identifier Lookup',
    [FacilitySearchType.Vor]: 'VOR Identifier Lookup',
    [FacilitySearchType.Ndb]: 'NDB Identifier Lookup',
    [FacilitySearchType.Intersection]: 'Intersection Identifier Lookup',
    [FacilitySearchType.User]: 'User Waypoint Identifier Lookup'
  };

  private readonly buttonRef = FSComponent.createRef<GtcWaypointButton>();

  private readonly mutableWaypoint = SubscribableUtils.isMutableSubscribable<WaypointSelectTypeMap[T] | null>(this.props.waypoint)
    ? this.props.waypoint
    : undefined;

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcWaypointButton
        ref={this.buttonRef}
        waypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        onTouched={this.props.onTouched}
        onPressed={async (): Promise<void> => {
          const initialWaypoint = this.props.waypoint.get();
          const initialInputText = initialWaypoint === null ? undefined : ICAO.getIdent(initialWaypoint.facility.get().icao);
          const result = await this.props.gtcService.openPopup<GtcKeyboardDialog<Facility>>(GtcViewKeys.KeyboardDialog, 'normal', 'hide')
            .ref.request({
              facilitySearchType: this.props.type,
              label: GtcWaypointSelectButton.DIALOG_LABEL_TEXT[this.props.type],
              allowSpaces: false,
              maxLength: 6,
              initialInputText
            });

          if (result.wasCancelled) {
            this.props.onCancelled && this.props.onCancelled(this, this.props.waypoint);
          } else {
            const waypoint = this.props.waypointCache.get(result.payload) as WaypointSelectTypeMap[T];
            if (this.props.onSelected === undefined) {
              this.mutableWaypoint?.set(waypoint);
            } else {
              this.props.onSelected && this.props.onSelected(waypoint, this.props.waypoint, this);
            }
          }
        }}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        nullIdent={this.props.nullIdent}
        nullName={this.props.nullName}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcService.orientation}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        class={this.props.class}
        nullLabel={this.props.nullLabel}
      >
        {this.props.children}
      </GtcWaypointButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}