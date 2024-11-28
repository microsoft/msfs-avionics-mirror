import {
  DisplayComponent, Facility, FacilityWaypoint, FSComponent, Subscribable, SubscribableUtils, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { UiWaypointTouchButton, UiWaypointTouchButtonProps } from '../../../Shared/Components/TouchButton/UiWaypointTouchButton';
import { G3XWaypointSearchType, G3XWaypointSearchTypeMap } from '../../../Shared/Navigation/G3XWaypointSearchTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { WaypointDialog } from '../../Views/WaypointDialog/WaypointDialog';

/**
 * Component props for {@link UiWaypointSelectButton}.
 */
export interface UiWaypointSelectButtonProps<T extends G3XWaypointSearchType, S extends Subscribable<G3XWaypointSearchTypeMap[T] | null>>
  extends Omit<UiWaypointTouchButtonProps, 'waypoint' | 'onPressed' | 'gtcOrientation'> {

  /** The UI service instance. */
  uiService: UiService;

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
  onSelected?: <B extends UiWaypointSelectButton<T, S> = UiWaypointSelectButton<T, S>>(
    selectedWaypoint: G3XWaypointSearchTypeMap[T],
    waypointState: S,
    button: B
  ) => void;

  /**
   * A callback function which will be called every time a waypoint selection from the button is cancelled.
   * @param button The button used to initiate the selection that was cancelled.
   * @param waypointState The waypoint state bound to the button.
   */
  onCancelled?: <B extends UiWaypointSelectButton<T, S> = UiWaypointSelectButton<T, S>>(
    waypointState: S,
    button: B
  ) => void;
}

/**
 * A touchscreen button which displays information about a waypoint and when pressed allows the user to select a
 * a facility waypoint by ident.
 */
export class UiWaypointSelectButton<T extends G3XWaypointSearchType, S extends Subscribable<G3XWaypointSearchTypeMap[T] | null>>
  extends DisplayComponent<UiWaypointSelectButtonProps<T, S>> {

  private readonly buttonRef = FSComponent.createRef<UiWaypointTouchButton>();

  private readonly mutableWaypoint = SubscribableUtils.isMutableSubscribable<G3XWaypointSearchTypeMap[T] | null>(this.props.waypoint)
    ? this.props.waypoint
    : undefined;

  /**
   * Gets this button's root HTML element.
   * @returns This button's root HTML element.
   * @throws Error if this button has not yet been rendered.
   */
  public getRootElement(): HTMLElement {
    return this.buttonRef.instance.getRootElement();
  }

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
      <UiWaypointTouchButton
        ref={this.buttonRef}
        waypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        onTouched={this.props.onTouched}
        onPressed={async (): Promise<void> => {
          const initialValue = this.props.waypoint.get();
          const result = await this.props.uiService.openMfdPopup<WaypointDialog>(UiViewStackLayer.Overlay, UiViewKeys.WaypointDialog)
            .ref.request({
              searchType: this.props.type,
              initialValue
            });

          if (result.wasCancelled) {
            this.props.onCancelled && this.props.onCancelled(this.props.waypoint, this);
          } else {
            if (this.props.onSelected === undefined) {
              this.mutableWaypoint?.set(result.payload);
            } else {
              this.props.onSelected && this.props.onSelected(result.payload, this.props.waypoint, this);
            }
          }
        }}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        nullIdent={this.props.nullIdent}
        nullName={this.props.nullName}
        nullLabel={this.props.nullLabel}
        hideRightInfo={this.props.hideRightInfo}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gduFormat={this.props.uiService.gduFormat}
        focusController={this.props.focusController}
        canBeFocused={this.props.canBeFocused}
        focusOptions={this.props.focusOptions}
        class={this.props.class}
      >
        {this.props.children}
      </UiWaypointTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}