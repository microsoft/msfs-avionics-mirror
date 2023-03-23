import { ComponentProps, DebounceTimer, DisplayComponent, FSComponent, SetSubject, Subject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';
import { ToggleStatusBar } from '../components';

import { SoftKeyMenuItem } from './SoftKeyMenu';

/**
 * Component props for SoftKey.
 */
export interface SoftKeyProps extends ComponentProps {
  /** The menu item to bind to the softkey. */
  menuItem: Subscribable<SoftKeyMenuItem | null>;

  /**
   * The amount of time, in milliseconds, to display the softkey pressed animation after the softkey has been pressed.
   * Defaults to {@link SoftKey.DEFAULT_PRESSED_DURATION}.
   */
  pressedDuration?: number;

  /** CSS class(es) to apply to the softkey's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * An individual Garmin softkey tab display.
 */
export class SoftKey extends DisplayComponent<SoftKeyProps> {
  private static readonly DEFAULT_PRESSED_DURATION = 150; // milliseconds

  private static readonly RESERVED_CSS_CLASSES = [
    'softkey', 'softkey-disabled', 'softkey-highlighted', 'softkey-pressed',
    'softkey-value-text-show', 'softkey-value-toggle-show'
  ] as const;

  private readonly rootCssClass = SetSubject.create(['softkey']);

  private readonly label = Subject.create('');
  private readonly disabled = Subject.create(true);
  private readonly highlighted = Subject.create(false);
  private readonly value = Subject.create<string | boolean | undefined>(undefined);

  private readonly toggleStatusBarState = Subject.create(false);
  private readonly valueText = Subject.create('');

  private readonly pressedTimer = new DebounceTimer();
  private readonly pressedDuration = this.props.pressedDuration ?? SoftKey.DEFAULT_PRESSED_DURATION;

  private cssClassSub?: Subscription;
  private menuItemSub?: Subscription;
  private labelPipe?: Subscription;
  private disabledPipe?: Subscription;
  private highlightedPipe?: Subscription;
  private valuePipe?: Subscription;
  private pressedSub?: Subscription;

  private readonly onPressedHandler = this.onPressed.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.disabled.sub(this.onDisabledChanged.bind(this), true);
    this.highlighted.sub(this.onHighlightedChanged.bind(this), true);
    this.value.sub(this.onValueChanged.bind(this), true);

    this.menuItemSub = this.props.menuItem.sub(menuItem => {
      this.unsubscribeFromMenuItem();

      if (menuItem !== null) {
        this.labelPipe = menuItem.label.pipe(this.label);
        this.disabledPipe = menuItem.disabled.pipe(this.disabled);
        this.highlightedPipe = menuItem.highlighted.pipe(this.highlighted);
        this.valuePipe = menuItem.value.pipe(this.value);
        this.pressedSub = menuItem.pressed.on(this.onPressedHandler);
      } else {
        this.label.set('');
        this.disabled.set(true);
        this.highlighted.set(false);
        this.value.set(undefined);
      }
    }, true);
  }

  /**
   * Unsubscribes from change events on the menu item.
   */
  private unsubscribeFromMenuItem(): void {
    this.labelPipe?.destroy();
    this.disabledPipe?.destroy();
    this.highlightedPipe?.destroy();
    this.valuePipe?.destroy();
    this.pressedSub?.destroy();

    this.labelPipe = undefined;
    this.disabledPipe = undefined;
    this.highlightedPipe = undefined;
    this.valuePipe = undefined;
    this.pressedSub = undefined;
  }

  /**
   * Responds to changes in this softkey's disabled state.
   * @param isDisabled Whether this softkey is disabled.
   */
  private onDisabledChanged(isDisabled: boolean): void {
    if (isDisabled) {
      this.rootCssClass.add('softkey-disabled');
    } else {
      this.rootCssClass.delete('softkey-disabled');
    }
  }

  /**
   * Responds to changes in this softkey's highlighted state.
   * @param isHighlighted Whether this softkey is highlighted.
   */
  private onHighlightedChanged(isHighlighted: boolean): void {
    if (isHighlighted) {
      this.rootCssClass.add('softkey-highlighted');
    } else {
      this.rootCssClass.add('softkey-highlighted');
    }
  }

  /**
   * Responds to changes in this softkey's value.
   * @param value The new value.
   */
  private onValueChanged(value: string | boolean | undefined): void {
    this.rootCssClass.delete('softkey-value-text-show');
    this.rootCssClass.delete('softkey-value-toggle-show');

    if (typeof value === 'string') {
      this.rootCssClass.add('softkey-value-text-show');

      this.valueText.set(value);
    } else if (typeof value === 'boolean') {
      this.rootCssClass.add('softkey-value-toggle-show');

      this.toggleStatusBarState.set(value);
    }
  }

  /**
   * Responds to when this softkey is pressed.
   */
  private onPressed(): void {
    this.rootCssClass.add('softkey-pressed');

    this.pressedTimer.schedule(() => {
      this.rootCssClass.delete('softkey-pressed');
    }, this.pressedDuration);
  }

  /**
   * Renders the component.
   * @returns The rendered component VNode.
   */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, SoftKey.RESERVED_CSS_CLASSES);
    } else if (typeof this.props.class === 'string') {
      FSComponent.parseCssClassesFromString(this.props.class)
        .filter(cssClass => !SoftKey.RESERVED_CSS_CLASSES.includes(cssClass as any))
        .forEach(cssClass => { this.rootCssClass.add(cssClass); });
    }

    return (
      <div class={this.rootCssClass}>
        <div class='softkey-borders' />
        <div class='softkey-content'>
          <div class='softkey-label'>{this.label}</div>
          <div class='softkey-value-text'>{this.valueText}</div>
          <ToggleStatusBar state={this.toggleStatusBarState} class='softkey-value-toggle' />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.cssClassSub?.destroy();
    this.menuItemSub?.destroy();
    this.unsubscribeFromMenuItem();
  }
}
