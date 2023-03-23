import { DebounceTimer, DisplayComponent, FSComponent, SetSubject, Subject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * Data describing the active autopilot mode for an FMA mode display slot.
 */
export type FmaModeSlotActiveData = {
  /** The active mode. */
  active: string;

  /** The armed mode from which the active mode transitioned. */
  armedTransition: string | undefined;

  /** The secondary armed mode from which the active mode transitioned. */
  secondaryArmedTransition: string | undefined;

  /** The failed mode that caused the transition to the current active mode. */
  failed: string | undefined;
};

/**
 * Component props for FmaModeSlot.
 */
export interface FmaModeSlotProps {
  /** The slot's current active mode. */
  active: Subscribable<FmaModeSlotActiveData>;

  /** CSS class(es) to apply to the slot's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * An FMA mode display slot.
 */
export class FmaModeSlot extends DisplayComponent<FmaModeSlotProps> {
  private static readonly ALERT_DURATION = 10000; // milliseconds
  private static readonly FAILED_DURATION = 5000; // milliseconds

  private readonly rootCssClass = SetSubject.create(['fma-mode']);

  private readonly activeModeText = Subject.create('');

  private readonly alertTimer = new DebounceTimer();

  private cssClassSub?: Subscription;
  private activeModeSub?: Subscription;
  private isFailedSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.activeModeSub = this.props.active.sub(data => {
      this.onActiveModeChanged(data.active, data.armedTransition, data.secondaryArmedTransition, data.failed);
    }, true);
  }

  /**
   * Responds to changes in this slot's active mode.
   * @param active The active mode.
   * @param armedTransition The armed mode from which the active mode transitioned.
   * @param secondaryArmedTransition The secondary armed mode from which the active mode transitioned.
   * @param failed The failed mode that caused the transition to the current active mode.
   */
  private onActiveModeChanged(active: string, armedTransition: string | undefined, secondaryArmedTransition: string | undefined, failed: string | undefined): void {
    if (failed !== undefined) {
      this.activeModeText.set(failed);

      this.rootCssClass.delete('fma-mode-alert');
      this.rootCssClass.add('fma-mode-failed');

      this.alertTimer.schedule(() => {
        this.rootCssClass.delete('fma-mode-failed');
        this.onActiveModeChanged(this.props.active.get().active, undefined, undefined, undefined);
      }, FmaModeSlot.FAILED_DURATION);
    } else {
      this.alertTimer.clear();
      this.rootCssClass.delete('fma-mode-failed');

      this.activeModeText.set(active);

      if (armedTransition === active || secondaryArmedTransition === active || this.isDualVerticalTransition(active, secondaryArmedTransition)) {
        this.rootCssClass.add('fma-mode-alert');
        this.alertTimer.schedule(() => {
          this.rootCssClass.delete('fma-mode-alert');
        }, FmaModeSlot.ALERT_DURATION);
      } else {
        this.rootCssClass.delete('fma-mode-alert');
      }
    }
  }

  /**
   * Checks whether the active mode transitioned from a combined dual vertical armed mode.
   * @param active The active mode.
   * @param secondaryArmedTransition The secondary armed mode from which the active mode transitioned.
   * @returns Whether the active mode transitioned from a combined dual vertical armed mode.
   */
  private isDualVerticalTransition(active: string, secondaryArmedTransition: string | undefined): boolean {
    return (secondaryArmedTransition === 'GP/V' && (active === 'GP' || active === 'VPTH'))
      || (secondaryArmedTransition === 'GS/V' && (active === 'GS' || active === 'VPTH'));
  }

  /** @inheritdoc */
  public render(): VNode {
    if (this.props.class !== undefined) {
      const reservedClasses = ['fma-mode', 'fma-mode-alert', 'fma-mode-failed'];

      if (typeof this.props.class === 'string') {
        FSComponent.parseCssClassesFromString(this.props.class)
          .filter(cssClass => !reservedClasses.includes(cssClass as any))
          .forEach(cssClass => { this.rootCssClass.add(cssClass); });
      } else {
        this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, reservedClasses);
      }
    }

    return (
      <div class={this.rootCssClass}>{this.activeModeText}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cssClassSub?.destroy();
    this.activeModeSub?.destroy();
    this.isFailedSub?.destroy();

    super.destroy();
  }
}