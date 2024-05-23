import {
  ComponentProps, DisplayComponent, DurationFormatter, FSComponent, SetSubject, Subscribable, SubscribableSet,
  Subscription, ToggleableClassNameRecord, UnitType, VNode
} from '@microsoft/msfs-sdk';

import './UserTimerValueDisplay.css';

/**
 * Component props for {@link UserTimerValueDisplay}
 */
export interface UserTimerValueDisplayProps extends ComponentProps {
  /** The timer value, in milliseconds. */
  value: Subscribable<number>;

  /** Whether the timer is running. */
  isRunning: Subscribable<boolean>;

  /** CSS class(es) to add to the display's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A component that displays the value of a user timer.
 */
export class UserTimerValueDisplay extends DisplayComponent<UserTimerValueDisplayProps> {
  private static readonly RESERVED_CLASSES = ['user-timer-value', 'user-timer-value-running'];

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly formatter = DurationFormatter.create('{mm}:{ss}', UnitType.MILLISECOND, 1000, { cache: true });
  private readonly valueText = this.props.value.map(value => this.formatter(Math.floor(value)));

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.props.isRunning.sub(isRunning => { this.rootCssClass.toggle('user-timer-value-running', isRunning); }, true)
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('user-timer-value');

    if (typeof this.props.class === 'object') {
      const cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, UserTimerValueDisplay.RESERVED_CLASSES);
      if (Array.isArray(cssClassSub)) {
        this.subscriptions.push(...cssClassSub);
      } else {
        this.subscriptions.push(cssClassSub);
      }
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UserTimerValueDisplay.RESERVED_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass}>{this.valueText}</div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.valueText.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}