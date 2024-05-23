import { ConsumerSubject, FlightTimerEventsForId, FlightTimerUtils, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GarminTimerControlEventsForId, GarminTimerManager } from '@microsoft/msfs-garminsdk';

import { UserTimerValueDisplay } from '../../Components/Timer/UserTimerValueDisplay';
import { UiTouchButton } from '../../Components/TouchButton/UiTouchButton';
import { UiValueTouchButton } from '../../Components/TouchButton/UiValueTouchButton';
import { AbstractUiView } from '../../UiSystem/AbstractUiView';
import { UiKnobId } from '../../UiSystem/UiKnobTypes';

import './UserTimerView.css';

/**
 * A UI view which allows the user to control the user timer.
 */
export class UserTimerView extends AbstractUiView {
  private thisNode?: VNode;

  private readonly pub = this.props.uiService.bus.getPublisher<GarminTimerControlEventsForId<'g3x'>>();

  private readonly timerValue = ConsumerSubject.create(null, 0).pause();
  private readonly isTimerRunning = ConsumerSubject.create(null, false).pause();

  /** @inheritDoc */
  public onAfterRender(thisNode?: VNode): void {
    this.thisNode = thisNode;

    const sub = this.props.uiService.bus.getSubscriber<FlightTimerEventsForId<'g3x'>>();

    this.isTimerRunning.setConsumer(FlightTimerUtils.onEvent('g3x', GarminTimerManager.GENERIC_TIMER_INDEX, sub, 'timer_is_running'));
    this.timerValue.setConsumer(FlightTimerUtils.onEvent('g3x', GarminTimerManager.GENERIC_TIMER_INDEX, sub, 'timer_value_ms'));

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Move Selector'],
      [UiKnobId.SingleInner, 'Move Selector'],
      [UiKnobId.LeftOuter, 'Move Selector'],
      [UiKnobId.LeftInner, 'Move Selector'],
      [UiKnobId.RightOuter, 'Move Selector'],
      [UiKnobId.RightInner, 'Move Selector']
    ]);

    this.focusController.setActive(true);
  }

  /** @inheritdoc */
  public onOpen(): void {
    this.isTimerRunning.resume();
    this.timerValue.resume();

    this.focusController.setFocusIndex(0);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.isTimerRunning.pause();
    this.timerValue.pause();
  }

  /** Starts user timer if currently stopped, stops if currently running */
  private toggleTimer(): void {
    if (this.isTimerRunning.get()) {
      this.pub.pub('garmin_gen_timer_stop_g3x_1', undefined, true, false);
    } else {
      this.pub.pub('garmin_gen_timer_start_g3x_1', undefined, true, false);
    }
  }

  /** Stops and resets user timer */
  private resetTimer(): void {
    this.pub.pub('garmin_gen_timer_stop_g3x_1', undefined, true, false);
    this.pub.pub('garmin_gen_timer_set_value_g3x_1', 0, true, false);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='user-timer-view ui-view-panel'>
        <div class='user-timer-view-title'>Timer</div>
        <div class='user-timer-view-buttons'>
          <UiValueTouchButton
            state={this.timerValue}
            renderValue={
              <UserTimerValueDisplay
                value={this.timerValue}
                isRunning={this.isTimerRunning}
              />
            }
            label={this.isTimerRunning.map(isRunning => isRunning ? 'Stop' : 'Start')}
            onPressed={this.toggleTimer.bind(this)}
            focusController={this.focusController}
            class='user-timer-view-stop-start'
          />
          <UiTouchButton
            label={'Reset'}
            onPressed={this.resetTimer.bind(this)}
            focusController={this.focusController}
            class='user-timer-view-reset'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.isTimerRunning.destroy();
    this.timerValue.destroy();

    super.destroy();
  }
}