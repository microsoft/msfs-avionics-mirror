import { NumberUnitInterface, Unit, UnitFamily, UnitType } from '../../math/NumberUnit';
import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { SubscribableSet } from '../../sub/SubscribableSet';
import { Subscription } from '../../sub/Subscription';
import { ComponentProps, DisplayComponent, FSComponent, VNode } from '../FSComponent';

export enum DurationDisplayFormat {
  /** hh:mm:ss. */
  hh_mm_ss,

  /** hh:mm. */
  hh_mm,

  /** mm:ss. */
  mm_ss,

  /** hh:mm if value is greater or equal to 1 hour, otherwise mm:ss. */
  hh_mm_or_mm_ss
}

export enum DurationDisplayDelim {
  /** Colon (`:`). */
  Colon,

  /** `:` if hh:mm:ss or mm:ss, `+` if hh:mm. */
  ColonOrCross,

  /** Space (` `). */
  Space
}

/**
 * Formatting options for DurationDisplay.
 */
export type DurationDisplayOptions = {
  /** The format with which to display values. */
  format: DurationDisplayFormat,

  /** The delimiter to insert between parts of formatted values. */
  delim: DurationDisplayDelim,

  /** The number of digits to which to pad the first part of formatted values with leading zeroes. */
  pad: number,

  /** A function used to format the last part of formatted values. */
  numberFormatter: (value: number) => string,

  /** Whether to show units. */
  showUnits: boolean,

  /** A function used to format units. */
  unitFormatter: (value: number, unit: Unit<UnitFamily.Duration>) => string,

  /** Whether to use a minus sign (`−`) in place of a dash (`-`) in front of negative numbers. */
  useMinusSign: boolean;

  /** Whether to force the display of a positive sign. */
  forceSign: boolean;

  /** The string to display when the value is NaN. */
  nanString: string
};

/**
 * Component props for DurationDisplay.
 */
export interface DurationDisplayProps extends ComponentProps {
  /** The duration to display, or a subscribable which provides it. */
  value: NumberUnitInterface<UnitFamily.Duration> | Subscribable<NumberUnitInterface<UnitFamily.Duration>>;

  /**
   * Formatting options. Options not explicitly defined will be set to the following default values:
   * * `pad = 0`
   * * `format = DurationDisplayFormat.hh_mm_ss`
   * * `delim = DurationDisplayDelim.Colon`
   * * `showUnits = false`
   * * `useMinusSign = false`
   * * `forceSign = false`
   * * `nanString = ''`
   */
  options?: Partial<Readonly<DurationDisplayOptions>>;

  /** CSS class(es) to add to the root of the icon component. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays duration values.
 */
export class DurationDisplay extends DisplayComponent<DurationDisplayProps> {
  /** Default formatting options. */
  public static readonly DEFAULT_OPTIONS: Readonly<DurationDisplayOptions> = {
    pad: 0,
    format: DurationDisplayFormat.hh_mm_ss,
    delim: DurationDisplayDelim.Colon,
    showUnits: false,
    numberFormatter: (value: number): string => value.toFixed(0),
    unitFormatter: (value: number, unit: Unit<UnitFamily.Duration>): string => unit.name[0],
    useMinusSign: false,
    forceSign: false,
    nanString: ''
  };

  private readonly value: Subscribable<NumberUnitInterface<UnitFamily.Duration>> = ('isSubscribable' in this.props.value)
    ? this.props.value
    : Subject.create(this.props.value);

  private valueSub?: Subscription;

  private readonly options: DurationDisplayOptions = Object.assign({}, DurationDisplay.DEFAULT_OPTIONS, this.props.options);
  private readonly delim: string;
  private readonly negativeSign = this.options.useMinusSign ? '−' : '-';
  private readonly positiveSign = this.options.forceSign ? '+' : '';

  private readonly text = Subject.create('');

  /** @inheritdoc */
  constructor(props: DurationDisplayProps) {
    super(props);

    switch (this.options.delim) {
      case DurationDisplayDelim.Colon:
        this.delim = ':';
        break;
      case DurationDisplayDelim.Space:
        this.delim = ' ';
        break;
      default:
        this.delim = '';
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.valueSub = this.value.sub(this.onValueChanged.bind(this), true);
  }

  /**
   * A callback which is called when this component's bound value changes.
   * @param value The new value.
   */
  private onValueChanged(value: NumberUnitInterface<UnitFamily.Duration>): void {
    this.setDisplay(value);
  }

  /**
   * Displays this component's current value.
   * @param value The current value.
   */
  private setDisplay(value: NumberUnitInterface<UnitFamily.Duration>): void {
    let text: string;

    if (value.isNaN()) {
      text = this.options.nanString;
    } else {
      let hrText = '';
      let minText = '';
      let secText = '';
      let hrUnitText = '';
      let minUnitText = '';
      let secUnitText = '';
      let hrDelim = '';
      let minDelim = '';

      const valueAsSeconds = Math.abs(value.asUnit(UnitType.SECOND));
      const isNegative = value.number < 0;

      let hours = Math.floor(valueAsSeconds / 3600);
      if (this.options.format != DurationDisplayFormat.mm_ss && !(this.options.format === DurationDisplayFormat.hh_mm_or_mm_ss && hours == 0)) {
        hrText = hours.toFixed(0);
        if (this.options.delim === DurationDisplayDelim.ColonOrCross) {
          if (this.options.format === DurationDisplayFormat.hh_mm_or_mm_ss || this.options.format === DurationDisplayFormat.hh_mm) {
            hrDelim = '+';
          } else {
            hrDelim = ':';
          }
        } else {
          hrDelim = this.delim;
        }
      }

      const hoursInMinutes = hours * 60;
      let minutes: number;
      let seconds: number;

      if (this.options.format === DurationDisplayFormat.hh_mm || (this.options.format === DurationDisplayFormat.hh_mm_or_mm_ss && hours !== 0)) {
        minutes = valueAsSeconds / 60 - hoursInMinutes;
        minText = this.options.numberFormatter(minutes);
      } else {
        minutes = Math.floor(valueAsSeconds / 60 - hoursInMinutes);
        minText = minutes.toFixed(0);
        minDelim = this.options.delim === DurationDisplayDelim.ColonOrCross ? ':' : this.delim;

        seconds = valueAsSeconds - (hoursInMinutes + minutes) * 60;
        secText = this.options.numberFormatter(seconds);
      }

      if (secText && secText.replace(/\b0+/, '').substring(0, 2) === '60') {
        seconds = parseFloat(secText) - 60;
        minutes++;
        secText = this.options.numberFormatter(seconds);
        minText = `${minutes}`;
      }
      if (minText && minText.replace(/\b0+/, '').substring(0, 2) === '60' && hrText) {
        if (secText) {
          minutes = 0;
          minText = '00';
        } else {
          minutes = parseFloat(minText) - 60;
          minText = this.options.numberFormatter(minutes);
        }
        hours++;
        hrText = `${hours}`;
      }

      // pad parts with leading zeroes
      if (hrText) {
        hrText = hrText.padStart(this.options.pad, '0');
        if (secText) {
          minText = minText.padStart(2, '0');
          secText = DurationDisplay.padIntegerPart(secText.replace(/^0+/, ''), 2, '0');
        } else {
          minText = DurationDisplay.padIntegerPart(minText.replace(/^0+/, ''), 2, '0');
        }
      } else {
        minText = minText.padStart(this.options.pad, '0');
        secText = DurationDisplay.padIntegerPart(secText.replace(/^0+/, ''), 2, '0');
      }

      // format units
      if (this.options.showUnits) {
        hrText && (hrUnitText = this.options.unitFormatter(parseFloat(hrText), UnitType.HOUR));
        minUnitText = this.options.unitFormatter(parseFloat(minText), UnitType.MINUTE);
        secText && (secUnitText = this.options.unitFormatter(parseFloat(secText), UnitType.SECOND));
      }

      // compute sign
      const sign = isNegative ? this.negativeSign : this.positiveSign;

      text = `${sign}${hrText}${hrUnitText}${hrDelim}${minText}${minUnitText}${minDelim}${secText}${secUnitText}`;
    }

    this.text.set(text);
  }

  /**
   * Pads the integer part of a string which represents a number.
   * @param str A string which represents a number.
   * @param maxLength The length to which the integer part of the string will be padded.
   * @param fillString The string with which to pad the original string.
   * @returns a new string which is the result of padding the original string.
   */
  private static padIntegerPart(str: string, maxLength: number, fillString?: string): string {
    const decimalIndex = str.indexOf('.');
    return str.padStart(decimalIndex < 0 ? maxLength : str.length - decimalIndex + maxLength, fillString);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''} style='white-space: nowrap;'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.valueSub?.destroy();
  }
}
