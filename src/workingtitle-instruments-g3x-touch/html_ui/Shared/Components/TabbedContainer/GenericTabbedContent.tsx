import { FSComponent, MutableSubscribable, MutableSubscribableMap, VNode } from '@microsoft/msfs-sdk';

import { UiInteractionEvent } from '../../UiSystem/UiInteraction';
import { UiKnobId } from '../../UiSystem/UiKnobTypes';
import { TabbedContentProps } from './TabbedContent';
import { AbstractTabbedContent } from './AbstractTabbedContent';

/**
 * Member properties of a {@link GenericTabbedContent}.
 */
export type GenericTabbedContentMembers = {
  /** The bezel rotary knob label state requested by the content. */
  readonly knobLabelState: MutableSubscribableMap<UiKnobId, string> & MutableSubscribable<ReadonlyMap<UiKnobId, string>, Iterable<readonly [UiKnobId, string]>>;
};

/**
 * Component props for {@link GenericTabbedContent}.
 */
export interface GenericTabbedContentProps extends TabbedContentProps {
  /** A function which is called after the content is rendered. */
  onAfterRender?: (thisNode: VNode, members: GenericTabbedContentMembers) => void;

  /** A function which is called when the content is selected to be displayed in its parent container. */
  onSelect?: (members: GenericTabbedContentMembers) => void;

  /** A function which is called when the content is deselected. */
  onDeselect?: (members: GenericTabbedContentMembers) => void;

  /**
   * A function which is called when the content is opened. Content is opened when it is selected and its parent
   * container is open.
   */
  onOpen?: (members: GenericTabbedContentMembers) => void;

  /**
   * A function which is called when the content is closed. Content is closed when it is deselected or its parent
   * container is closed.
   */
  onClose?: (members: GenericTabbedContentMembers) => void;

  /**
   * A function which is called when the content is resumed. Content is resumed when it is selected and its parent
   * container is resumed.
   */
  onResume?: (members: GenericTabbedContentMembers) => void;

  /**
   * A function which is called when the content is paused. Content is paused when it is deselected or its parent
   * container is paused.
   */
  onPause?: (members: GenericTabbedContentMembers) => void;

  /**
   * A function which is called when the content is updated. Content is updated when it is selected and its parent
   * container is updated.
   */
  onUpdate?: (time: number, members: GenericTabbedContentMembers) => void;

  /**
   * A function which handles UI interaction events routed to the content. If not defined, then the content will not
   * handle any events.
   */
  onUiInteractionEvent?: (event: UiInteractionEvent, members: GenericTabbedContentMembers) => boolean;

  /** A function which is called when the content is destroyed. */
  onDestroy?: () => void;
}

/**
 * A generic implementation of `TabbedContent` which renders its children as-is and defers callback logic to
 * functions passed to its props.
 */
export class GenericTabbedContent extends AbstractTabbedContent<GenericTabbedContentProps> {
  private thisNode?: VNode;

  private readonly members: GenericTabbedContentMembers = {
    knobLabelState: this._knobLabelState
  };

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.onAfterRender && this.props.onAfterRender(thisNode, this.members);
  }

  /** @inheritDoc */
  public onSelect(): void {
    this.props.onSelect && this.props.onSelect(this.members);
  }

  /** @inheritDoc */
  public onDeselect(): void {
    this.props.onDeselect && this.props.onDeselect(this.members);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.props.onOpen && this.props.onOpen(this.members);
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
  public onUpdate(time: number): void {
    this.props.onUpdate && this.props.onUpdate(time, this.members);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.props.onUiInteractionEvent ? this.props.onUiInteractionEvent(event, this.members) : false;
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