import {
  DisplayComponent, FSComponent, MutableSubscribable,
  MutableSubscribableInputType, Subject, SubscribableType, VNode,
} from '@microsoft/msfs-sdk';
import { GtcService, GtcViewOcclusionType } from '../../GtcService/GtcService';
import { GtcListDialog, GtcListDialogParams } from '../../Dialog/GtcListDialog';
import { ValueTouchButton } from './ValueTouchButton';
import { GtcValueTouchButton, GtcValueTouchButtonProps } from './GtcValueTouchButton';

/**
 * Component props for GtcListSelectTouchButton.
 */
export interface GtcListSelectTouchButtonProps<S extends MutableSubscribable<any, any>>
  extends Omit<GtcValueTouchButtonProps<S>, 'state' | 'onPressed' | 'gtcOrientation'> {

  /** The GTC service. */
  gtcService: GtcService;

  /** The key of the GTC list dialog the button will open as a selection list. */
  listDialogKey: string;

  /** The occlusion type applied to views beneath the popup. Defaults to `'darken'`. */
  occlusionType?: GtcViewOcclusionType;

  /** A mutable subscribable whose state will be bound to the button. */
  state: S;

  /**
   * When true, the button will be highlighted while the list is open, and the isHighlighted prop will be ignored.
   * Defaults to false.
   */
  highlightButtonWhileListIsOpen?: boolean;

  /**
   * Parameters to pass to the selection list dialog, or a function which will return the parameters when called each
   * time the list is opened.
   */
  listParams: GtcListDialogParams<SubscribableType<S>> | ((state: S) => GtcListDialogParams<MutableSubscribableInputType<S>>);

  /**
   * A callback function which will be called every time a value is selected from the list. If not defined, selecting
   * a value from the list will automatically set the button's bound state.
   */
  onSelected?: <B extends GtcListSelectTouchButton<S> = GtcListSelectTouchButton<S>>(value: MutableSubscribableInputType<S>, state: S, button: B) => void;

  /**
   * A callback function which will be when the list was opened, and then cancelled.
   */
  onCancelled?: <B extends GtcListSelectTouchButton<S> = GtcListSelectTouchButton<S>>(state: S, button: B) => void;
}

/**
 * A touchscreen button which displays the value of a bound state and when pressed, opens a selection list dialog to
 * optionally set the value of the bound state.
 *
 * The button uses a {@link ValueTouchButton} for rendering and touch functionality. All children are rendered as
 * children of the `ValueTouchButton`.
 */
export class GtcListSelectTouchButton<S extends MutableSubscribable<any>> extends DisplayComponent<GtcListSelectTouchButtonProps<S>> {
  private readonly buttonRef = FSComponent.createRef<ValueTouchButton<S>>();

  private readonly isListOpen = Subject.create(false);

  private readonly listParamsFunc = typeof this.props.listParams === 'function'
    ? this.props.listParams
    : (): GtcListDialogParams<MutableSubscribableInputType<S>> => this.props.listParams as GtcListDialogParams<MutableSubscribableInputType<S>>;

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
  }

  /**
   * The onPressed callback.
   * @param button The value touch button.
   * @param state The state.
   */
  private readonly onPressed = async (button: ValueTouchButton<S>, state: S): Promise<void> => {
    this.isListOpen.set(true);

    const result = await this.props.gtcService.openPopup<GtcListDialog>(this.props.listDialogKey, undefined, this.props.occlusionType).ref.request(this.listParamsFunc(state));

    this.isListOpen.set(false);

    if (!result.wasCancelled) {
      if (this.props.onSelected === undefined) {
        state.set(result.payload);
      } else {
        this.props.onSelected && this.props.onSelected(result.payload, state, this);
      }
    } else {
      this.props.onCancelled && this.props.onCancelled(state, this);
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcValueTouchButton
        ref={this.buttonRef}
        state={this.props.state}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.highlightButtonWhileListIsOpen ? this.isListOpen : this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        renderValue={this.props.renderValue}
        onTouched={this.props.onTouched}
        onPressed={this.onPressed}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcService.orientation}
        class={this.props.class}
      >
        {this.props.children}
      </GtcValueTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}