import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayOptions, FamilyOfUnit, FSComponent, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, Subscribable, Unit,
  UnitFamily, UnitOfNumber, VNode
} from '@microsoft/msfs-sdk';

import { BearingDisplay } from '../common/BearingDisplay';
import { NumberUnitDisplay } from '../common/NumberUnitDisplay';
import { TimeDisplay, TimeDisplayFormat } from '../common/TimeDisplay';
import { NavDataFieldModel } from './NavDataFieldModel';

/**
 * Component props for NavDataField.
 */
export interface NavDataFieldProps<T> extends ComponentProps {
  /** The title of the data field. */
  title: string;

  /** The model data field's data model. */
  model: NavDataFieldModel<T>;

  /** CSS class(es) to apply to the root of the component. */
  class?: string;
}

/**
 * A navigation data field, consisting of a title and a value.
 *
 * The root element of the field contains the `nav-data-field` CSS class by default.
 *
 * The root element contains a child title element with the CSS class `nav-data-field-title`.
 */
export abstract class NavDataField<T, P extends NavDataFieldProps<T> = NavDataFieldProps<T>> extends DisplayComponent<P> {
  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`nav-data-field ${this.props.class ?? ''}`}>
        <div class='nav-data-field-title'>{this.props.title}</div>
        {this.renderValue()}
      </div>
    );
  }

  /**
   * Renders this data field's value component.
   * @returns This data field's value component, as a VNode.
   */
  protected abstract renderValue(): VNode;
}

/**
 * Component props for NavDataGenericField.
 */
export interface NavDataGenericFieldProps<T> extends NavDataFieldProps<T> {
  /** A function to execute when the component is destroyed. */
  onDestroy?: () => void;
}

/**
 * A generic navigation data field which renders its children as its value.
 *
 * The root element of the field contains the `nav-data-field` CSS class by default.
 *
 * The root element contains a child title element with the CSS class `nav-data-field-title`.
 */
export class NavDataGenericField<T, P extends NavDataGenericFieldProps<T> = NavDataGenericFieldProps<T>> extends NavDataField<T, P> {
  /**
   * Renders this data field's value component.
   * @returns This data field's value component, as a VNode.
   */
  protected renderValue(): VNode {
    return (
      <>
        {this.props.children ?? null}
      </>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();
  }
}

/**
 * Component props for NavDataNumberUnitField.
 */
export interface NavDataNumberUnitFieldProps<T extends NumberUnitInterface<string>> extends NavDataFieldProps<T> {
  /** A subscribable which provides the display unit type. */
  displayUnit: Unit<FamilyOfUnit<UnitOfNumber<T>>> | null | Subscribable<Unit<FamilyOfUnit<UnitOfNumber<T>>> | null>;

  /** A function which formats numbers. */
  formatter: (number: number) => string;

  /**
   * A function which formats units. The formatted unit text should be written to the 2-tuple passed to the `out`
   * parameter, as `[bigText, smallText]`. `bigText` and `smallText` will be rendered into separate `<span>` elements
   * representing the big and small components of the rendered unit text, respectively. If not defined, then units
   * will be formatted based on the text generated by the `UnitFormatter` class.
   */
  unitFormatter?: (out: [string, string], unit: Unit<FamilyOfUnit<UnitOfNumber<T>>>, number: number) => void;

  /** Whether to hide the unit text when the displayed value is equal to `NaN`. Defaults to `false`. */
  hideUnitWhenNaN?: boolean;
}

/**
 * A navigation data field which displays a value consisting of a number with unit type.
 *
 * The root element of the field contains the `nav-data-field` CSS class by default.
 *
 * The root element contains a child title element with the CSS class `nav-data-field-title`.
 */
export class NavDataNumberUnitField<T extends NumberUnitInterface<string>> extends NavDataField<T, NavDataNumberUnitFieldProps<T>> {
  private readonly numberUnitRef = FSComponent.createRef<NumberUnitDisplay<FamilyOfUnit<UnitOfNumber<T>>>>();

  /** @inheritDoc */
  public renderValue(): VNode {
    return (
      <NumberUnitDisplay
        ref={this.numberUnitRef}
        value={this.props.model.value as unknown as Subscribable<NumberUnitInterface<FamilyOfUnit<UnitOfNumber<T>>>>}
        displayUnit={this.props.displayUnit}
        formatter={this.props.formatter}
        unitFormatter={this.props.unitFormatter}
        hideUnitWhenNaN={this.props.hideUnitWhenNaN}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.numberUnitRef.getOrDefault()?.destroy();
  }
}

/**
 * Component props for `NavDataNumberField`.
 */
export interface NavDataNumberFieldProps<T extends number> extends NavDataFieldProps<T> {
  /** A function which formats numbers. */
  formatter: (number: number) => string;
}

/**
 * Component props for NavDataDurationField.
 */
export interface NavDataDurationFieldProps<T extends NumberUnitInterface<UnitFamily.Duration>> extends NavDataFieldProps<T> {
  /** Formatting options. */
  options?: Partial<DurationDisplayOptions>;
}

/**
 * A navigation data field which displays a value consisting of a formatted duration.
 *
 * The root element of the field contains the `nav-data-field` CSS class by default.
 *
 * The root element contains a child title element with the CSS class `nav-data-field-title`.
 */
export class NavDataDurationField<T extends NumberUnitInterface<UnitFamily.Duration>> extends NavDataField<T, NavDataDurationFieldProps<T>> {
  private readonly durationRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Duration>>();

  /** @inheritDoc */
  public renderValue(): VNode {
    return (
      <DurationDisplay
        ref={this.durationRef}
        value={this.props.model.value}
        options={this.props.options}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.durationRef.getOrDefault()?.destroy();
  }
}

/**
 * Component props for NavDataTimeField.
 */
export interface NavDataTimeFieldProps extends NavDataFieldProps<number> {
  /** The display format. */
  format: TimeDisplayFormat | Subscribable<TimeDisplayFormat>;

  /** The local time offset, in milliseconds. */
  localOffset: number | Subscribable<number>;

  /** Whether to the pad the hour text with leading zeroes (up to two digits). Defaults to `true`. */
  padHour?: boolean | Subscribable<boolean>;

  /**
   * A function which formats suffixes to append to the displayed time. If not defined, then the suffix will be
   * will be formatted as `'UTC'` if the display format is {@link TimeDisplayFormat.UTC}, `'LCL'` if the display format
   * is {@link TimeDisplayFormat.Local24}, and either `'AM'` or `'PM'` if the display format is
   * {@link TimeDisplayFormat.Local12}.
   */
  suffixFormatter?: (format: TimeDisplayFormat, isAm: boolean) => string;

  /** Whether to hide the suffix when the displayed time is equal to `NaN`. Defaults to `false`. */
  hideSuffixWhenNaN?: boolean;
}

/**
 * A navigation data field which displays a value consisting of a formatted time.
 *
 * The root element of the field contains the `nav-data-field` CSS class by default.
 *
 * The root element contains a child title element with the CSS class `nav-data-field-title`.
 */
export class NavDataTimeField extends NavDataField<number, NavDataTimeFieldProps> {
  private readonly timeRef = FSComponent.createRef<TimeDisplay>();

  /** @inheritDoc */
  public renderValue(): VNode {
    return (
      <TimeDisplay
        ref={this.timeRef}
        time={this.props.model.value}
        format={this.props.format}
        localOffset={this.props.localOffset}
        padHour={this.props.padHour}
        suffixFormatter={this.props.suffixFormatter}
        hideSuffixWhenNaN={this.props.hideSuffixWhenNaN}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.timeRef.getOrDefault()?.destroy();
  }
}

/**
 * Component props for NavDataBearingField.
 */
export interface NavDataBearingFieldProps<T extends NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> extends NavDataFieldProps<T> {
  /** A subscribable which provides the display unit type. */
  displayUnit: NavAngleUnit | null | Subscribable<NavAngleUnit | null>;

  /** A function which formats numbers. */
  formatter: (number: number) => string;

  /**
   * A function which formats units. The formatted unit text should be written to the 2-tuple passed to the `out`
   * parameter, as `[bigText, smallText]`. `bigText` and `smallText` will be rendered into separate `<span>` elements
   * representing the big and small components of the rendered unit text, respectively. If not defined, then units
   * will be formatted such that `bigText` is always the degree symbol (°) and `smallText` is empty for magnetic
   * bearing or `'T'` for true bearing.
   */
  unitFormatter?: (out: [string, string], unit: NavAngleUnit, number: number) => void;

  /** Whether to display 360 in place of 0. True by default. */
  use360?: boolean;
}

/**
 * A navigation data field which displays a bearing value.
 *
 * The root element of the field contains the `nav-data-field` CSS class by default.
 *
 * The root element contains a child title element with the CSS class `nav-data-field-title`.
 */
export class NavDataBearingField<T extends NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> extends NavDataField<T, NavDataBearingFieldProps<T>> {
  private readonly bearingRef = FSComponent.createRef<BearingDisplay>();

  /** @inheritDoc */
  public renderValue(): VNode {
    return (
      <BearingDisplay
        ref={this.bearingRef}
        value={this.props.model.value}
        displayUnit={this.props.displayUnit}
        formatter={this.props.formatter}
        unitFormatter={this.props.unitFormatter}
        use360={this.props.use360}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.bearingRef.getOrDefault()?.destroy();
  }
}