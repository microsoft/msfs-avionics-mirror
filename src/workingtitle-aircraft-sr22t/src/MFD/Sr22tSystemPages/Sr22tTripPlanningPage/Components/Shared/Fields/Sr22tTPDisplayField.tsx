import { ComponentProps, DisplayComponent, FSComponent, MappedSubscribable, SetSubject, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import './Sr22tTPFields.css';

export enum DisplayFieldFormat {
  value = 'value',
  stringValue = 'string',
  timePlus = 'H+MM',
  timeColon = 'HH:MM',
}

/** The object containing all display data for a single display field. */
export type DisplayFieldData = {
  /** The title of the field. */
  title: string;
  /** The value of the field. */
  value?: Subscribable<number>;
  /** The string subject to be drawn as value. */
  stringValue?: Subscribable<string>;
  /** The value of the field. */
  unit: string | undefined;
  /** The number of decimal places to show for the value. */
  decimals: number | undefined;
  /** The minimum number of whole number digits to show for the value. */
  minDigits: number | undefined;
  /** The maximum number of whole number digits to show for the value. */
  maxDigits: number | undefined;
  /** A string to specify how the value should be displayed. */
  format: DisplayFieldFormat | undefined;
  /** Optional flag that draws the value in cyan, as if the field would be editable. */
  valueCssClass?: SetSubject<string>;
};

/** The properties for the Sr22tTPDisplayField component. */
export interface DisplayFieldProps extends ComponentProps {
  /** The `DisplayFieldData` object. */
  data: DisplayFieldData;
  /** If not specified, the unit default label will be displayed. */
  unitLabel?: string;
  /** Whether the display field is in warning state. */
  isWarning?: Subscribable<boolean>;
}

/** Displays a single field of title and value in `AUX - Trip Planning` page. */
export class Sr22tTPDisplayField extends DisplayComponent<DisplayFieldProps> {

  private readonly ref = FSComponent.createRef<HTMLDivElement>();
  private readonly isWarning = SubscribableUtils.toSubscribable(this.props.isWarning ?? false, true);
  private warningSubscription?: Subscription;
  private readonly valueAsString: MappedSubscribable<string> | undefined;
  private valueCss = SetSubject.create(['tp-labeled-number-value']);

  /**
   * Constructor
   * @param props props
   */
  constructor(props: DisplayFieldProps) {
    super(props);

    if (this.props.data.valueCssClass !== undefined) {
      this.valueCss = this.props.data.valueCssClass;
      this.valueCss.add('tp-labeled-number-value');
    }

    let decimals = this.props.data.decimals !== undefined ? this.props.data.decimals : 0;
    const minDigits = this.props.data.minDigits !== undefined ? this.props.data.minDigits : 1;
    const maxDigits = this.props.data.maxDigits !== undefined ? this.props.data.maxDigits : 3;
    const format = this.props.data.format !== undefined ? this.props.data.format : DisplayFieldFormat.value;

    let active: boolean;
    let valueString: string;

    switch (format) {
      case DisplayFieldFormat.value:
        this.valueAsString = this.props.data.value?.map(value => {
          // Only for the numbers we check for the upper and lower limits:
          active = !isNaN(value) && value < Math.pow(10, maxDigits) && value >= 0;

          if (active) {
            // Don't show decimals when greater or equal to 100
            if (value >= 100) {
              decimals = 0;
            }

            valueString = value.toFixed(decimals);
            const wholeNumberString = value.toFixed(0);

            // Pad with zeroes if necessary
            if (wholeNumberString.length < minDigits) {
              let paddingZeros = '';
              for (let i = 0; i < minDigits - wholeNumberString.length; i++) {
                paddingZeros += '0';
              }
              valueString = paddingZeros + valueString;
            }
          } else {

            let wholeNumberDashes = '';
            for (let i = 0; i < maxDigits; i++) {
              wholeNumberDashes += '_';
            }

            let decimalDashes = '';
            for (let i = 0; i < decimals; i++) {
              decimalDashes += '_';
            }

            valueString = wholeNumberDashes;
            if (decimalDashes.length > 0) {
              valueString = valueString + '.' + decimalDashes;
            }
          }
          return valueString;
        });
        break;

      case DisplayFieldFormat.timePlus:
        this.valueAsString = this.props.data.value?.map(value => {
          // For times we leave the upper limit part away:
          active = !isNaN(value) && value >= 0;

          if (active) {
            const hours = Math.floor(value);
            let minutestring = ((value * 60) % 60).toFixed(0);
            if (minutestring.length < 2) {
              minutestring = '0' + minutestring;
            }
            return hours.toString() + '+' + minutestring;
          } else {
            return '_+__';
          }
        });
        break;

      case DisplayFieldFormat.timeColon:
        // Format for time (##:##), can be HH:MM or MM:SS depending on the value sent
        this.valueAsString = this.props.data.value?.map(value => {

          // limit left side to 2 digits
          value %= 100;

          // For times we leave the upper limit part away:
          active = !isNaN(value) && value >= 0;

          if (active) {
            let leftString = (Math.floor(value) % 100).toString();
            if (leftString.length < 2) {
              leftString = '0' + leftString;
            }

            let rightString = ((value * 60) % 60).toFixed(0);
            if (rightString.length < 2) {
              rightString = '0' + rightString;
            }

            return leftString + ':' + rightString;
          } else {
            return '__:__';
          }
        });
        break;
      case DisplayFieldFormat.stringValue:
        this.valueAsString = this.props.data.stringValue?.map(stringValue => {
          return stringValue;
        });
        break;
    }

  }

  private readonly unitAsString = this.props.data.unit
    ? this.props.data.unit
    : '';

  /** @inheritdoc */
  public onAfterRender(): void {
    this.warningSubscription = this.isWarning.sub((isWarning) => this.ref.instance.classList.toggle('warning', isWarning), true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tp-labeled-number' ref={this.ref}>
        <div class='tp-labeled-number-title'>{this.props.data.title}</div>
        <div class={this.valueCss}>{this.valueAsString}</div>
        <div class='tp-labeled-number-unit'>{this.unitAsString}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.warningSubscription?.destroy();
  }
}