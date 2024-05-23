import { FSComponent, MutableSubscribable, MutableSubscribableMap, ReadonlyFloat64Array, VNode } from '@microsoft/msfs-sdk';

import { AbstractUiView } from './AbstractUiView';
import { UiFocusController } from './UiFocusController';
import { UiInteractionEvent } from './UiInteraction';
import { UiKnobId } from './UiKnobTypes';
import { UiViewProps } from './UiView';
import { UiViewOcclusionType, UiViewSizeMode } from './UiViewTypes';

/**
 * Member properties of a {@link GenericUiView}.
 */
export type GenericUiViewMembers = {
  /** The bezel rotary knob label state requested by the view. */
  readonly knobLabelState: MutableSubscribableMap<UiKnobId, string> & MutableSubscribable<ReadonlyMap<UiKnobId, string>, Iterable<readonly [UiKnobId, string]>>;

  /** The view's UI focus controller. */
  readonly focusController: UiFocusController;
};

/**
 * Component props for {@link GenericUiView}.
 */
export interface GenericUiViewProps extends UiViewProps {
  /**
   * A function which creates the view's UI focus controller. If not defined, then a default focus controller will be
   * created.
   */
  createFocusController?: () => UiFocusController;

  /** A function which is called after the view is rendered. */
  onAfterRender?: (thisNode: VNode, members: GenericUiViewMembers) => void;

  /** A function which is called when the view is opened. */
  onOpen?: (sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array, members: GenericUiViewMembers) => void;

  /** A function which is called when the view is closed. */
  onClose?: (members: GenericUiViewMembers) => void;

  /** A function which is called when the view is resumed. */
  onResume?: (members: GenericUiViewMembers) => void;

  /** A function which is called when the view is paused. */
  onPause?: (members: GenericUiViewMembers) => void;

  /** A function which is called when the view is resized while it is open. */
  onResize?: (sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array, members: GenericUiViewMembers) => void;

  /** A function which is called when the occlusion type applied to the view changes while the view is open. */
  onOcclusionChange?: (occlusionType: UiViewOcclusionType, members: GenericUiViewMembers) => void;

  /** A function which is called every update cycle. */
  onUpdate?: (time: number, members: GenericUiViewMembers) => void;

  /**
   * A function which handles interaction events routed to the view. If not defined, then the view will delegate
   * interaction event handling to its UI focus controller.
   */
  onUiInteractionEvent?: (event: UiInteractionEvent, members: GenericUiViewMembers) => boolean;

  /** A function which is called when the view is destroyed. */
  onDestroy?: () => void;
}

/**
 * A generic implementation of `UiView` which renders its children as-is and defers callback logic to
 * functions passed to its props.
 */
export class GenericUiView extends AbstractUiView<GenericUiViewProps> {
  private thisNode?: VNode;

  private readonly members: GenericUiViewMembers = {
    knobLabelState: this._knobLabelState,
    focusController: this.focusController
  };

  /** @inheritDoc */
  protected createFocusController(): UiFocusController {
    return this.props.createFocusController ? this.props.createFocusController() : super.createFocusController();
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
    this.props.onAfterRender && this.props.onAfterRender(thisNode, this.members);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.props.onOpen && this.props.onOpen(sizeMode, dimensions, this.members);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.props.onClose && this.props.onClose(this.members);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.props.onResume && this.props.onResume(this.members);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.props.onPause && this.props.onPause(this.members);
  }

  /** @inheritDoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.props.onResize && this.props.onResize(sizeMode, dimensions, this.members);
  }

  /** @inheritDoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    this.props.onOcclusionChange && this.props.onOcclusionChange(occlusionType, this.members);
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    this.props.onUpdate && this.props.onUpdate(time, this.members);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.props.onUiInteractionEvent ? this.props.onUiInteractionEvent(event, this.members) : super.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>{this.props.children}</>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}