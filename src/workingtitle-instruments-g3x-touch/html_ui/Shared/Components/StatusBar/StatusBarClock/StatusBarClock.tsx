import {
  ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettingTypes, TimeDisplayFormat } from '@microsoft/msfs-garminsdk';

import { G3XTimeDisplay } from '../../Common/G3XTimeDisplay';

/**
 * Component props for {@link StatusBarClock}.
 */
export interface StatusBarClockProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;
}

/**
 * A G3X clock display for the bottom status bar. Displays local or UTC time.
 */
export class StatusBarClock extends DisplayComponent<StatusBarClockProps> {
  private static readonly DATE_TIME_FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  private static readonly SUFFIX_FORMATTER = (format: TimeDisplayFormat, isAm: boolean): string => {
    if (format === TimeDisplayFormat.Local12) {
      return isAm ? 'am' : 'pm';
    } else {
      return '';
    }
  };

  private readonly timeDisplayRef = FSComponent.createRef<G3XTimeDisplay>();

  private readonly simTime = ConsumerSubject.create(null, 0);

  private readonly dateTimeFormat = this.props.dateTimeSettingManager.getSetting('dateTimeFormat').map(settingMode => {
    return StatusBarClock.DATE_TIME_FORMAT_SETTING_MAP[settingMode] ?? TimeDisplayFormat.UTC;
  });

  /** @inheritDoc */
  public onAfterRender(): void {
    this.simTime.setConsumer(this.props.bus.getSubscriber<ClockEvents>().on('simTime').withPrecision(-3));
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{
        'status-bar-section': true,
        'status-bar-clock-container': true,
      }}>
        <div>{this.dateTimeFormat.map(x => x === TimeDisplayFormat.UTC ? 'UTC' : 'LCL')}</div>
        <G3XTimeDisplay
          ref={this.timeDisplayRef}
          time={this.simTime}
          format={this.dateTimeFormat}
          localOffset={this.props.dateTimeSettingManager.getSetting('dateTimeLocalOffset')}
          suffixFormatter={StatusBarClock.SUFFIX_FORMATTER}
        />
      </div>
    );
  }
}