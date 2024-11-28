import { DisplayComponent, FSComponent, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { TimeDisplay, TimeDisplayFormat, TimeDisplayProps } from '@microsoft/msfs-garminsdk';

import { G3XSpecialChar } from '../../Graphics/Text/G3XSpecialChar';

/**
 * Component props for G3XTimeDisplay.
 */
export interface G3XTimeDisplayProps extends TimeDisplayProps {
  /**
   * Whether to the pad the hour text with leading zeroes (up to two digits). Defaults to `false` when the display
   * format is equal to `TimeDisplayFormat.Local12` and to `true` when when the display format is any other value.
   */
  padHour?: boolean | Subscribable<boolean>;

  /** Whether to use vertical suffix formatting instead of standard suffix formatting. Defaults to `false`. */
  useVerticalSuffix?: boolean;

  /** Whether to only show the 'AM/PM' suffix. Ignored if `suffixFormatter` is defined. Defaults to `false`. */
  onlyShowAmPmSuffix?: boolean;
}

/**
 * A G3X Touch component which displays a time value.
 */
export class G3XTimeDisplay extends DisplayComponent<G3XTimeDisplayProps> {

  /**
   * A function which formats standard suffixes for G3XTimeDisplay.
   * @param onlyShowAmPm Whether to only show the 'AM/PM' suffix.
   * @param format The current format used to display the time.
   * @param isAm Whether or not the current time is AM.
   * @returns The suffix to append to the displayed time.
   */
  public static readonly DEFAULT_STANDARD_SUFFIX_FORMATTER = (onlyShowAmPm: boolean, format: TimeDisplayFormat, isAm: boolean): string => {
    if (format === TimeDisplayFormat.Local12) {
      return isAm ? ' AM' : ' PM';
    } else if (!onlyShowAmPm) {
      if (format === TimeDisplayFormat.Local24) {
        return '';
      } else {
        return ' UTC';
      }
    } else {
      return '';
    }
  };

  /**
   * A function which formats vertical suffixes for G3XTimeDisplay.
   * @param onlyShowAmPm Whether to only show the 'AM/PM' suffix.
   * @param format The current format used to display the time.
   * @param isAm Whether or not the current time is AM.
   * @returns The suffix to append to the displayed time.
   */
  public static readonly DEFAULT_VERTICAL_SUFFIX_FORMATTER = (onlyShowAmPm: boolean, format: TimeDisplayFormat, isAm: boolean): string => {
    if (format === TimeDisplayFormat.Local12) {
      return isAm ? G3XSpecialChar.Am : G3XSpecialChar.Pm;
    } else if (!onlyShowAmPm) {
      if (format === TimeDisplayFormat.Local24) {
        return '';
      } else {
        return G3XSpecialChar.Utc;
      }
    } else {
      return '';
    }
  };

  private readonly ref = FSComponent.createRef<TimeDisplay>();

  private readonly format = SubscribableUtils.toSubscribable(this.props.format, true) as Subscribable<TimeDisplayFormat>;
  private readonly padHour = this.props.padHour === undefined
    ? this.format.map(format => format !== TimeDisplayFormat.Local12)
    : undefined;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TimeDisplay
        ref={this.ref}
        time={this.props.time}
        format={this.format}
        localOffset={this.props.localOffset}
        padHour={this.props.padHour ?? this.padHour}
        suffixFormatter={this.props.suffixFormatter ?? (
          this.props.useVerticalSuffix
            ? G3XTimeDisplay.DEFAULT_VERTICAL_SUFFIX_FORMATTER.bind(undefined, this.props.onlyShowAmPmSuffix ?? false)
            : G3XTimeDisplay.DEFAULT_STANDARD_SUFFIX_FORMATTER.bind(undefined, this.props.onlyShowAmPmSuffix ?? false)
        )}
        hideSuffixWhenNaN={this.props.hideSuffixWhenNaN}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    this.padHour?.destroy();

    super.destroy();
  }
}