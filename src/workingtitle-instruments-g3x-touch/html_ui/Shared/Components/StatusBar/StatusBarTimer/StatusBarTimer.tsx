import {
  ComponentProps, ConsumerSubject, DisplayComponent, FlightTimerEventsForId, FlightTimerMode, FSComponent, VNode
} from '@microsoft/msfs-sdk';

import { GarminTimerControlEventsForId, GarminTimerManager } from '@microsoft/msfs-garminsdk';

import { UiService } from '../../../UiSystem/UiService';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';
import { RenderedUiViewEntry } from '../../../UiSystem/UiViewTypes';
import { UserTimerValueDisplay } from '../../Timer/UserTimerValueDisplay';

import './StatusBarTimer.css';

/**
 * Component props for {@link StatusBarTimer}.
 */
export interface StatusBarTimerProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;
}

/**
 * A G3X timer display for the bottom status bar. Toggles timer popup on click.
 */
export class StatusBarTimer extends DisplayComponent<StatusBarTimerProps> {
  private static readonly MAX_VALUE_SECONDS = GarminTimerManager.MAX_GENERIC_TIMER_VALUE / 1000;

  private readonly pub = this.props.uiService.bus.getPublisher<GarminTimerControlEventsForId<'g3x'>>();

  private readonly isTimerRunning = ConsumerSubject.create(null, false);
  private readonly timerValue = ConsumerSubject.create(null, 0);

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  public onAfterRender(): void {
    this.rootRef.instance.addEventListener('click', this.onPressed.bind(this));

    const sub = this.props.uiService.bus.getSubscriber<FlightTimerEventsForId<'g3x'>>();

    this.pub.pub('garmin_gen_timer_set_mode_g3x_1', FlightTimerMode.CountingUp, true, false);
    this.pub.pub('garmin_gen_timer_set_value_g3x_1', 0, true, false);

    this.isTimerRunning.setConsumer(sub.on(`timer_is_running_g3x_${GarminTimerManager.GENERIC_TIMER_INDEX}`));
    this.timerValue.setConsumer(sub.on(`timer_value_ms_g3x_${GarminTimerManager.GENERIC_TIMER_INDEX}`));
  }

  /**
   * Responds when the user presses the timer display.
   */
  private onPressed(): void {
    if (!this.props.uiService.closePfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.UserTimer)) {
      this.props.uiService.openPfdPopup(UiViewKeys.UserTimer, true, { popupType: 'slideout-bottom-full', backgroundOcclusion: 'none' });
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='status-bar-section status-bar-timer-container'>
        <div>TMR</div>
        <UserTimerValueDisplay
          value={this.timerValue}
          isRunning={this.isTimerRunning}
          class='status-bar-timer-value'
        />
      </div>
    );
  }
}