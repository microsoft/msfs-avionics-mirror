import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, Subscription, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for FailureBox.
 */
export interface FailureBoxProps extends ComponentProps {
  /** Whether to show the box. */
  show: Subscribable<boolean>;

  /** CSS class(es) to apply to the box's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A failure box.
 */
export class FailureBox extends DisplayComponent<FailureBoxProps> {
  private static readonly RESERVED_CLASSES = ['failure-box'];

  private readonly display = this.props.show.map(show => show ? '' : 'none');

  private cssClassSubs?: Subscription[];

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | ToggleableClassNameRecord | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('failure-box');

      if (this.props.class.isSubscribableSet === true) {
        this.cssClassSubs = [FSComponent.bindCssClassSet(cssClass, this.props.class as SubscribableSet<string>, FailureBox.RESERVED_CLASSES)];
      } else {
        this.cssClassSubs = FSComponent.bindCssClassSet(cssClass, this.props.class as ToggleableClassNameRecord, FailureBox.RESERVED_CLASSES);
      }
    } else {
      cssClass = `failure-box ${this.props.class ?? ''}`;
    }

    return (
      <svg class={cssClass} style={{ 'display': this.display }}>
        <line x1='0%' y1='0%' x2='100%' y2='100%' class='failure-box-line' />
        <line x1='0%' y1='100%' x2='100%' y2='0%' class='failure-box-line' />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.display.destroy();

    if (this.cssClassSubs) {
      for (const sub of this.cssClassSubs) {
        sub.destroy();
      }
    }

    super.destroy();
  }
}