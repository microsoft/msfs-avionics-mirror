import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayFormat, FSComponent, NumberUnitSubject, SetSubject, Subject, Subscribable,
  SubscribableMapFunctions, Subscription, UnitFamily, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettingTypes, GarminTimerManager, TimeDisplayFormat } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay, TimeDisplay } from '@microsoft/msfs-wtg3000-common';

import { TimeInfoDataProvider } from './TimeInfoDataProvider';

import './TimeInfo.css';

/**
 * Component props for TimeInfo.
 */
export interface TimeInfoProps extends ComponentProps {
  /** A data provider for the display. */
  dataProvider: TimeInfoDataProvider;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 time information display. Displays the value of the generic timer and the current time.
 */
export class TimeInfo extends DisplayComponent<TimeInfoProps> {
  private static readonly MAX_TIMER_VALUE_SECONDS = GarminTimerManager.MAX_GENERIC_TIMER_VALUE / 1000;

  private readonly timerRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();
  private readonly simTimeRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();

  private readonly rootCssClass = SetSubject.create(['time-info']);
  private readonly simTimeCssClass = SetSubject.create<string>();

  private readonly timerValue = NumberUnitSubject.create(UnitType.SECOND.createNumber(0));
  private readonly simTime = Subject.create(0);

  private readonly timeFormat = this.props.dateTimeSettingManager.getSetting('dateTimeFormat').map(mode => {
    switch (mode) {
      case DateTimeFormatSettingMode.Local24:
        return TimeDisplayFormat.Local24;
      case DateTimeFormatSettingMode.Local12:
        return TimeDisplayFormat.Local12;
      default:
        return TimeDisplayFormat.UTC;
    }
  });
  private readonly timeFormatText = Subject.create('UTC');

  private timerValuePipe?: Subscription;
  private simTimePipe?: Subscription;
  private formatSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const timerValuePipe = this.timerValuePipe = this.props.dataProvider.timerValue.pipe(this.timerValue, value => {
      return Math.max(0, Math.round(value / 1000) % TimeInfo.MAX_TIMER_VALUE_SECONDS);
    }, true);
    const simTimePipe = this.simTimePipe = this.props.dataProvider.time.pipe(this.simTime, SubscribableMapFunctions.withPrecision(1000), true);

    const formatSub = this.formatSub = this.props.dateTimeSettingManager.getSetting('dateTimeFormat').sub(format => {
      switch (format) {
        case DateTimeFormatSettingMode.Local12:
        case DateTimeFormatSettingMode.Local24:
          this.timeFormatText.set('LCL');
          break;
        default:
          this.timeFormatText.set('UTC');
      }

      this.simTimeCssClass.toggle('time-info-time-show-suffix', format === DateTimeFormatSettingMode.Local12);
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootCssClass.add('hidden');

        formatSub.pause();
        timerValuePipe.pause();
        simTimePipe.pause();
      } else {
        this.rootCssClass.delete('hidden');

        formatSub.resume(true);
        timerValuePipe.resume(true);
        simTimePipe.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='time-info-row time-info-timer'>
          <div class='time-info-title'>TMR</div>
          <DurationDisplay
            ref={this.timerRef}
            value={this.timerValue}
            options={{
              format: DurationDisplayFormat.hh_mm_ss
            }}
          />
        </div>
        <div class='time-info-row time-info-time'>
          <div class='time-info-title'>{this.timeFormatText}</div>
          <TimeDisplay
            ref={this.simTimeRef}
            time={this.simTime}
            format={this.timeFormat}
            localOffset={this.props.dateTimeSettingManager.getSetting('dateTimeLocalOffset')}
            class={this.simTimeCssClass}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.timerRef.getOrDefault()?.destroy();
    this.simTimeRef.getOrDefault()?.destroy();

    this.timeFormat.destroy();

    this.timerValuePipe?.destroy();
    this.simTimePipe?.destroy();
    this.formatSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}