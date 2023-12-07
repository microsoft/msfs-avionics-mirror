import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubscribable, Subject, Subscribable, SubscribableMapFunctions,
  SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

/**
 * Time display formats.
 */
export enum TimeDisplayFormat {
  /** UTC time. */
  UTC,
  /** Local time in 24-hour format. */
  Local24,
  /** Local time in 12-hour format. */
  Local12
}

/**
 * Component props for TimeDisplay.
 */
export interface TimeDisplayProps extends ComponentProps {
  /** The time to display, as a UNIX timestamp in milliseconds, or a subscribable which provides it. */
  time: number | Subscribable<number>;

  /** The display format, or a subscribable which provides it. */
  format: TimeDisplayFormat | Subscribable<TimeDisplayFormat>;

  /** The local time offset, in milliseconds, or a subscribable which provides it. */
  localOffset: number | Subscribable<number>;

  /**
   * A function which formats suffixes to append to the displayed time. If not defined, then the suffix will be
   * will be formatted as `'UTC'` if the display format is {@link TimeDisplayFormat.UTC}, `'LCL'` if the display format
   * is {@link TimeDisplayFormat.Local24}, and either `'AM'` or `'PM'` if the display format is
   * {@link TimeDisplayFormat.Local12}.
   */
  suffixFormatter?: (format: TimeDisplayFormat, isAm: boolean) => string;

  /** Whether to hide the suffix when the displayed time is equal to `NaN`. Defaults to `false`. */
  hideSuffixWhenNaN?: boolean;

  /** CSS class(es) to apply to the root of the component. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * Displays time in HH:MM:SS format.
 */
export class TimeDisplay extends DisplayComponent<TimeDisplayProps> {
  private static readonly SECOND_PRECISION_MAP = SubscribableMapFunctions.withPrecision(1000);

  private static readonly HIDE_UNIT_TEXT_PIPE = (text: string): string => text === '' ? 'none' : '';

  /**
   * A function which formats suffixes for TimeDisplay.
   * @param format The current format used to display the time.
   * @param isAm Whether or not the current time is AM.
   * @returns The suffix to append to the displayed time.
   */
  public static readonly DEFAULT_SUFFIX_FORMATTER = (format: TimeDisplayFormat, isAm: boolean): string => {
    if (format === TimeDisplayFormat.UTC) {
      return 'UTC';
    } else if (format === TimeDisplayFormat.Local24) {
      return 'LCL';
    } else {
      return isAm ? 'AM' : 'PM';
    }
  };

  private readonly timeSeconds = typeof this.props.time === 'object'
    ? (this.timeSub = this.props.time.map(TimeDisplay.SECOND_PRECISION_MAP))
    : Subject.create(TimeDisplay.SECOND_PRECISION_MAP(this.props.time));

  private readonly format = SubscribableUtils.toSubscribable(this.props.format, true);

  private readonly localOffset = SubscribableUtils.toSubscribable(this.props.localOffset, true);

  private readonly suffixFormatter = this.props.suffixFormatter ?? TimeDisplay.DEFAULT_SUFFIX_FORMATTER;

  private readonly suffixDisplay = Subject.create('');

  private readonly date = new Date();

  private readonly hourText = Subject.create('');
  private readonly minText = Subject.create('');
  private readonly secText = Subject.create('');
  private readonly suffixText = Subject.create('');

  private readonly updateHandler = this.updateDisplayedTime.bind(this);

  private timeSub?: MappedSubscribable<number>;
  private formatSub?: Subscription;
  private localOffsetSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.formatSub = this.format.sub(this.updateHandler);
    this.localOffsetSub = this.localOffset.sub(this.updateHandler);
    this.timeSeconds.sub(this.updateHandler, true);

    // We have to hide the suffix text when empty because an empty string will get rendered as a space.
    this.suffixText.pipe(this.suffixDisplay, TimeDisplay.HIDE_UNIT_TEXT_PIPE);
  }

  /**
   * Updates the displayed time.
   */
  protected updateDisplayedTime(): void {
    const utcTime = this.timeSeconds.get();
    const format = this.format.get();

    let isAm = true;

    if (isNaN(utcTime)) {
      this.hourText.set('__');
      this.minText.set('__');
      this.secText.set('__');

      this.suffixText.set(this.props.hideSuffixWhenNaN ? '' : this.getSuffix(format, isAm));
    } else {
      const offset = format === TimeDisplayFormat.UTC ? 0 : this.localOffset.get();

      const displayTime = utcTime + offset;
      this.date.setTime(displayTime);

      const hour = this.date.getUTCHours();
      isAm = hour < 12;

      const displayHour = format === TimeDisplayFormat.Local12
        ? 12 - (12 - (hour % 12)) % 12 // Need to display hours 0 and 12 as '12'
        : hour % 24;

      this.hourText.set(displayHour.toString().padStart(2, '0'));

      this.minText.set(this.date.getUTCMinutes().toString().padStart(2, '0'));

      this.secText.set(this.date.getUTCSeconds().toString().padStart(2, '0'));

      this.suffixText.set(this.getSuffix(format, isAm));
    }
  }

  /**
   * Gets the suffix to append to the time display.
   * @param format The format of the time display.
   * @param isAm Whether or not the current time is AM.
   * @returns The time display suffix.
   */
  protected getSuffix(format: TimeDisplayFormat, isAm: boolean): string {
    return this.suffixFormatter(format, isAm);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''} style='white-space: nowrap;'>
        <span class='time-hour'>{this.hourText}</span>
        <span class='time-min'>:{this.minText}</span>
        <span class='time-sec'>:{this.secText}</span>
        <span class='time-suffix' style={{ 'display': this.suffixDisplay }}>{this.suffixText}</span>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.timeSub?.destroy();
    this.formatSub?.destroy();
    this.localOffsetSub?.destroy();
  }
}