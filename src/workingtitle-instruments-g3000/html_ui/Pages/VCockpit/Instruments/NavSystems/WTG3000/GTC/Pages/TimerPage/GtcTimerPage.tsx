import {
  ConsumerSubject, DurationDisplay, FlightTimerEvents, FlightTimerMode, FSComponent, NumberUnitSubject, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { GarminTimerControlEvents, GarminTimerManager } from '@microsoft/msfs-garminsdk';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { GtcDurationDialog } from '../../Dialog/GtcDurationDialog';
import { GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcTimerPage.css';

/**
 * A GTC timer page.
 */
export class GtcTimerPage extends GtcView {
  private static readonly MAX_VALUE_SECONDS = GarminTimerManager.MAX_GENERIC_TIMER_VALUE / 1000;

  private readonly publisher = this.bus.getPublisher<GarminTimerControlEvents>();

  private readonly timerMode = ConsumerSubject.create(null, FlightTimerMode.CountingDown).pause();
  private readonly isTimerRunning = ConsumerSubject.create(null, false).pause();

  private readonly timerValue = NumberUnitSubject.create(UnitType.SECOND.createNumber(0));

  private thisNode?: VNode;

  private timerValueSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Timer');

    const sub = this.bus.getSubscriber<FlightTimerEvents>();

    this.timerMode.setConsumer(sub.on(`timer_mode_${GarminTimerManager.GENERIC_TIMER_INDEX}`));
    this.isTimerRunning.setConsumer(sub.on(`timer_is_running_${GarminTimerManager.GENERIC_TIMER_INDEX}`));

    this.timerValueSub = sub.on(`timer_value_ms_${GarminTimerManager.GENERIC_TIMER_INDEX}`).handle(value => {
      this.timerValue.set(Math.max(0, Math.round(value / 1000) % GtcTimerPage.MAX_VALUE_SECONDS));
    }, true);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.timerMode.resume();
    this.isTimerRunning.resume();
    this.timerValueSub?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.timerMode.pause();
    this.isTimerRunning.pause();
    this.timerValueSub?.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='timer-page'>
        <TouchButton
          onPressed={async () => {
            const result = await this.props.gtcService.openPopup<GtcDurationDialog>(GtcViewKeys.DurationDialog1, 'normal', 'hide')
              .ref.request({ title: 'Enter Time', initialValue: this.timerValue.get().asUnit(UnitType.SECOND) });

            if (!result.wasCancelled) {
              this.publisher.pub('garmin_gen_timer_set_value_1', result.payload * 1000, true, false);
            }
          }}
          class='timer-page-value-button'
        >
          <div class='timer-page-value-button-label'>Time</div>
          <DurationDisplay
            value={this.timerValue}
            options={{
              pad: 2
            }}
            class='timer-page-value-button-value'
          />
        </TouchButton>
        <div class='timer-page-count-container'>
          <div class='timer-page-count-title'>Count</div>
          <ToggleTouchButton
            state={this.timerMode.map(mode => mode === FlightTimerMode.CountingUp)}
            label='Up'
            onPressed={() => { this.publisher.pub('garmin_gen_timer_set_mode_1', FlightTimerMode.CountingUp, true, false); }}
            class='timer-page-count-button'
          />
          <ToggleTouchButton
            state={this.timerMode.map(mode => mode === FlightTimerMode.CountingDown)}
            label='Down'
            onPressed={() => { this.publisher.pub('garmin_gen_timer_set_mode_1', FlightTimerMode.CountingDown, true, false); }}
            class='timer-page-count-button'
          />
        </div>
        <TouchButton
          label='Reset'
          onPressed={() => { this.publisher.pub('garmin_gen_timer_reset_1', undefined, true, false); }}
          class='timer-page-side-button timer-page-reset-button'
        />
        <TouchButton
          label={this.isTimerRunning.map(isRunning => isRunning ? 'Stop' : 'Start')}
          onPressed={() => {
            if (this.isTimerRunning.get()) {
              this.publisher.pub('garmin_gen_timer_stop_1', undefined, true, false);
            } else {
              this.publisher.pub('garmin_gen_timer_start_1', undefined, true, false);
            }
          }}
          class='timer-page-side-button timer-page-start-stop-button'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.timerMode.destroy();
    this.isTimerRunning.destroy();

    this.timerValueSub?.destroy();

    super.destroy();
  }
}