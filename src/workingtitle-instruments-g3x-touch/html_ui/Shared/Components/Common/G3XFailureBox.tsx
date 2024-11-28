import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableSet,
  SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import './G3XFailureBox.css';

/**
 * Component props for {@link G3XFailureBox}.
 */
export interface G3XFailureBoxProps extends ComponentProps {
  /** Whether to show the box. */
  show: Subscribable<boolean>;

  /** The box's label. */
  label?: string | Subscribable<string> | VNode;

  /** CSS class(es) to apply to the box's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A G3X Touch failure box.
 */
export class G3XFailureBox extends DisplayComponent<G3XFailureBoxProps> {
  private static readonly RESERVED_CLASSES = ['failure-box'];

  private thisNode?: VNode;

  private readonly display = this.props.show.map(show => show ? '' : 'none');

  private readonly subscriptions: Subscription[] = [
    this.display
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('failure-box');

      const sub = FSComponent.bindCssClassSet(cssClass, this.props.class as ToggleableClassNameRecord, G3XFailureBox.RESERVED_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      cssClass = `failure-box ${this.props.class ?? ''}`;
    }

    return (
      <div class={cssClass} style={{ 'display': this.display }}>
        <svg class='failure-box-cross'>
          <line x1='0%' y1='0%' x2='100%' y2='100%' class='failure-box-cross-line-outline' />
          <line x1='0%' y1='100%' x2='100%' y2='0%' class='failure-box-cross-line-outline' />
          <line x1='0%' y1='0%' x2='100%' y2='100%' class='failure-box-cross-line-stroke' />
          <line x1='0%' y1='100%' x2='100%' y2='0%' class='failure-box-cross-line-stroke' />
        </svg>
        {this.renderLabel()}
        {this.props.children}
      </div>
    );
  }

  /**
   * Renders this box's label.
   * @returns This box's label, as a VNode, or `null` if this box does not have a label.
   */
  private renderLabel(): VNode | null {
    if (this.props.label === undefined) {
      return null;
    }

    if (SubscribableUtils.isSubscribable(this.props.label)) {
      const label = this.props.label.map(SubscribableMapFunctions.identity());
      this.subscriptions.push(label);

      return (
        <div class='failure-box-label'>
          {label}
        </div>
      );
    } else {
      return (
        <div class='failure-box-label'>
          {this.props.label}
        </div>
      );
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}