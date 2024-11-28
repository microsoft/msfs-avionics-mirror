/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MinimumsControlEvents, MinimumsMode, NumberFormatter,
  NumberUnitSubject, SetSubject, Subscribable, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { MinimumsAlertState, MinimumsDataProvider } from '@microsoft/msfs-garminsdk';

import { BaroMinimumDialog } from '../../../MFD/Views/BaroMinimumDialog/BaroMinimumDialog';
import { G3XNumberUnitDisplay } from '../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { TouchButton } from '../../../Shared/Components/TouchButton/TouchButton';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';

import './BaroMinimumDisplay.css';

/**
 * Component props for {@link BaroMinimumDisplay}.
 */
export interface BaroMinimumDisplayProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;

  /** A provider of minimums data. */
  dataProvider: MinimumsDataProvider;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3X barometric minimums display.
 */
export class BaroMinimumDisplay extends DisplayComponent<BaroMinimumDisplayProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private readonly rootRef = FSComponent.createRef<TouchButton>();

  private readonly rootCssClass = SetSubject.create(['baro-minimum-display', 'pfd-touch-button']);

  private readonly publisher = this.props.uiService.bus.getPublisher<MinimumsControlEvents>();

  private readonly isVisible = MappedSubject.create(
    ([declutter, mode]) => !declutter && mode === MinimumsMode.BARO,
    this.props.declutter,
    this.props.dataProvider.mode
  );

  private readonly minimumsValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private baroMinimumsPipe?: Subscription;
  private minimumsModeSub?: Subscription;
  private minimumsAlertSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.baroMinimumsPipe = this.props.dataProvider.baroMinimums.pipe(this.minimumsValue, true);
    this.minimumsModeSub = this.props.dataProvider.mode.sub(this.onMinimumsModeChanged.bind(this), false, true);
    this.minimumsAlertSub = this.props.minimumsAlertState.sub(this.onMinimumsAlertStateChanged.bind(this), false, true);

    this.isVisible.sub(this.onVisibilityChanged.bind(this), true);
  }

  /**
   * Responds to when this display's visibility changes.
   * @param isVisible Whether the display is visible.
   */
  private onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.minimumsModeSub!.resume(true);
      this.minimumsAlertSub!.resume(true);
    } else {
      this.minimumsModeSub!.pause();
      this.baroMinimumsPipe!.pause();
      this.minimumsAlertSub!.pause();
    }
  }

  /**
   * Responds to when the minimums mode changes.
   * @param mode The new minimums mode.
   */
  private onMinimumsModeChanged(mode: MinimumsMode): void {
    if (mode === MinimumsMode.BARO) {
      this.baroMinimumsPipe!.resume(true);
    } else {
      this.baroMinimumsPipe!.pause();
      this.minimumsValue.set(NaN);
    }
  }

  /**
   * Responds to when the minimums alert state changes.
   * @param state The new minimums alert state.
   */
  private onMinimumsAlertStateChanged(state: MinimumsAlertState): void {
    this.rootCssClass.toggle('minimums-alert-atorbelow', state === MinimumsAlertState.AtOrBelow);
  }

  /**
   * Responds to when this display is pressed.
   */
  private async onPressed(): Promise<void> {
    // Close baro minimum dialog if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.BaroMinimumDialog)) {
      return;
    }

    // TODO: The real unit seems to set the dialog's initial value to field elevation (runway elevation?) when an
    // approach/destination airport is loaded in the flight plan. It may also set the initial value to indicated
    // altitude when on the ground (need more research to confirm).
    const initialValue = this.props.dataProvider.baroMinimums.get();

    const result = await this.props.uiService.openMfdPopup<BaroMinimumDialog>(UiViewStackLayer.Overlay, UiViewKeys.BaroMinimumDialog)
      .ref.request({
        initialValue
      });

    if (!result.wasCancelled) {
      if (result.payload.clear) {
        this.publisher.pub('set_minimums_mode', MinimumsMode.OFF);
        this.publisher.pub('set_decision_altitude_feet', 0, true, true);
      } else {
        this.publisher.pub('set_minimums_mode', MinimumsMode.BARO);
        this.publisher.pub('set_decision_altitude_feet', result.payload.value, true, true);
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <TouchButton
        ref={this.rootRef}
        isVisible={this.isVisible}
        onPressed={this.onPressed.bind(this)}
        class={this.rootCssClass}
      >
        <div class='baro-minimum-display-title'>BARO MIN</div>
        <G3XNumberUnitDisplay
          value={this.minimumsValue}
          displayUnit={UnitType.FOOT}
          formatter={BaroMinimumDisplay.FORMATTER}
          useBasicUnitFormat
          class='baro-minimum-display-value'
        />
      </TouchButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.rootRef.getOrDefault()?.destroy();

    this.isVisible.destroy();

    this.baroMinimumsPipe?.destroy();
    this.minimumsModeSub?.destroy();
    this.minimumsAlertSub?.destroy();

    super.destroy();
  }
}

