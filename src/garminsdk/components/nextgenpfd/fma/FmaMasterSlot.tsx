import { DebounceTimer, DisplayComponent, FSComponent, ObjectSubject, SetSubject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * Display states for an FMA master display slot.
 */
export enum FmaMasterSlotState {
  Off = 'Off',
  On = 'On',
  Failed = 'Failed'
}

/**
 * Component props for FmaMasterSlot.
 */
export interface FmaMasterSlotProps {
  /** The slot's state. */
  state: Subscribable<FmaMasterSlotState>;

  /** CSS class(es) to apply to the slot's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * An FMA master display slot.
 */
export class FmaMasterSlot extends DisplayComponent<FmaMasterSlotProps> {
  private static readonly RESERVED_CSS_CLASSES = ['fma-master', 'fma-master-alert', 'fma-master-failed'];

  private static readonly ALERT_DURATION = 5000; // milliseconds

  private readonly rootStyle = ObjectSubject.create({
    visibility: 'hidden'
  });

  private readonly rootCssClass = SetSubject.create(['fma-master']);

  private readonly alertTimer = new DebounceTimer();

  private isStateOn = false;

  private cssClassSub?: Subscription;
  private stateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.stateSub = this.props.state.sub(this.onStateChanged.bind(this), true);
  }

  /**
   * Responds to changes in this slot's state.
   * @param state The slot's current state.
   */
  private onStateChanged(state: FmaMasterSlotState): void {
    this.alertTimer.clear();

    switch (state) {
      case FmaMasterSlotState.Failed:
        this.alertTimer.clear();
        this.rootCssClass.delete('fma-master-alert');
        this.rootCssClass.add('fma-master-failed');
        this.rootStyle.set('visibility', '');
        break;
      case FmaMasterSlotState.On:
        this.alertTimer.clear();
        this.rootCssClass.delete('fma-master-alert');
        this.rootCssClass.delete('fma-master-failed');
        this.rootStyle.set('visibility', '');
        break;
      case FmaMasterSlotState.Off:
        this.rootCssClass.delete('fma-master-failed');
        if (this.isStateOn) {
          this.rootCssClass.add('fma-master-alert');
          this.alertTimer.schedule(() => {
            this.rootCssClass.delete('fma-master-alert');
            this.rootStyle.set('visibility', 'hidden');
          }, FmaMasterSlot.ALERT_DURATION);
        } else {
          this.alertTimer.clear();
          this.rootCssClass.delete('fma-master-alert');
          this.rootStyle.set('visibility', 'hidden');
        }
        break;
    }

    this.isStateOn = state === FmaMasterSlotState.On;
  }

  /** @inheritdoc */
  public render(): VNode {
    if (this.props.class !== undefined) {
      if (typeof this.props.class === 'string') {
        FSComponent.parseCssClassesFromString(this.props.class, cssClass => !FmaMasterSlot.RESERVED_CSS_CLASSES.includes(cssClass))
          .forEach(cssClass => { this.rootCssClass.add(cssClass); });
      } else {
        this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, FmaMasterSlot.RESERVED_CSS_CLASSES);
      }
    }

    return (
      <div class={this.rootCssClass} style={this.rootStyle}>{this.props.children}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cssClassSub?.destroy();
    this.stateSub?.destroy();

    super.destroy();
  }
}