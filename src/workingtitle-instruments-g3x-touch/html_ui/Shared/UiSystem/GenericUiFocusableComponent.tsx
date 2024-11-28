import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { UiFocusController } from './UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from './UiFocusTypes';
import { UiInteractionEvent } from './UiInteraction';

/**
 * Component props for {@link GenericUiFocusableComponent}.
 */
export interface GenericUiFocusableComponentProps extends ComponentProps {
  /** Whether the component can be focused. Defaults to `true`. */
  canBeFocused?: boolean | Subscribable<boolean>;

  /** A function which is called after the component is rendered. */
  onAfterRender?: (thisNode: VNode) => void;

  /** A function which is called when the component is registered with a controller. */
  onRegistered?: (controller: UiFocusController) => void;

  /** A function which is called when the component is deregistered with a controller. */
  onDeregistered?: (controller: UiFocusController) => void;

  /** A function which is called when the component gains focus. */
  onFocusGained?: (direction: UiFocusDirection) => void;

  /** A function which is called when the component loses focus. */
  onFocusLost?: () => void;

  /**
   * A function which handles interaction events routed to the component. If not defined, then the component will not
   * handle any events.
   */
  onUiInteractionEvent?: (event: UiInteractionEvent) => boolean;

  /** A function which is called when the component is destroyed. */
  onDestroy?: () => void;
}

/**
 * A generic implementation of `UiFocusableComponent` which renders its children as-is and defers callback logic to
 * functions passed to its props.
 */
export class GenericUiFocusableComponent extends DisplayComponent<GenericUiFocusableComponentProps> implements UiFocusableComponent {
  private thisNode?: VNode;

  private parentController?: UiFocusController;

  /** @inheritDoc */
  public readonly isUiFocusableComponent = true;

  /** @inheritDoc */
  public readonly canBeFocused = SubscribableUtils.toSubscribable(this.props.canBeFocused ?? true, true);

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.onAfterRender && this.props.onAfterRender(thisNode);
  }

  /**
   * Attempts to set focus on this component.
   * @param direction The direction from which to set focus. Defaults to `UiFocusDirection.Unspecified`.
   */
  public focusSelf(direction?: UiFocusDirection): void {
    this.parentController?.setFocus(this, direction);
  }

  /** @inheritDoc */
  public onRegistered(controller: UiFocusController): void {
    this.parentController = controller;
    this.props.onRegistered && this.props.onRegistered(controller);
  }

  /** @inheritDoc */
  public onDeregistered(controller: UiFocusController): void {
    this.parentController = undefined;
    this.props.onDeregistered && this.props.onDeregistered(controller);
  }

  /** @inheritDoc */
  public onFocusGained(direction: UiFocusDirection): void {
    this.props.onFocusGained && this.props.onFocusGained(direction);
  }

  /** @inheritDoc */
  public onFocusLost(): void {
    this.props.onFocusLost && this.props.onFocusLost();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.props.onUiInteractionEvent ? this.props.onUiInteractionEvent(event) : false;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>{this.props.children}</>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.parentController?.deregister(this);

    this.props.onDestroy && this.props.onDestroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
