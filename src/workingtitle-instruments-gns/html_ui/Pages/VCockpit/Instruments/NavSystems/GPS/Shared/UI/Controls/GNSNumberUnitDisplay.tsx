import {
  AbstractNumberUnitDisplay, AbstractNumberUnitDisplayProps, ComponentProps, DisplayComponent, FSComponent, NavAngleUnit, NumberUnitInterface, Subject,
  Subscribable, SubscribableSet, SubscribableUtils, Unit, UnitType, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for GNSNumberUnitDisplay
 */
export interface GNSNumberUnitDisplayProps<F extends string> extends AbstractNumberUnitDisplayProps<F> {
  /** A function which formats numbers. */
  formatter: (number: number) => string;

  /** CSS class(es) to add to the root of the icon component. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays a number with units.
 */
export class GNSNumberUnitDisplay<F extends string> extends AbstractNumberUnitDisplay<F, GNSNumberUnitDisplayProps<F>> {
  private readonly numberText = Subject.create('');
  private readonly unitText = Subject.create('');

  /** @inheritdoc */
  protected onValueChanged(value: NumberUnitInterface<F>): void {
    this.setDisplay(value, this.displayUnit.get());
  }

  /** @inheritdoc */
  protected onDisplayUnitChanged(displayUnit: Unit<F> | null): void {
    this.setDisplay(this.value.get(), displayUnit);
  }

  /**
   * Displays this component's current value.
   * @param value The current value.
   * @param displayUnit The current display unit.
   */
  private setDisplay(value: NumberUnitInterface<F>, displayUnit: Unit<F> | null): void {
    if (!displayUnit || !value.unit.canConvert(displayUnit)) {
      displayUnit = value.unit;
    }

    const numberText = this.props.formatter(value.asUnit(displayUnit));
    this.numberText.set(numberText);

    this.unitText.set(GNSNumberUnitDisplay.getUnitChar(displayUnit));
  }

  /**
   * Gets a unit type character to display.
   * @param unitType The type of unit that was changed to.
   * @returns The special character that represents the unit type ligature.
   */
  public static getUnitChar(unitType: UnitType | null): string {

    if ((unitType as NavAngleUnit).isMagnetic !== undefined) {
      return (unitType as NavAngleUnit).isMagnetic() ? 'ï' : 'ð';
    }

    switch (unitType) {
      case UnitType.FOOT:
        return 'à';
      case UnitType.NMILE:
        return 'á';
      case UnitType.KPH:
        return 'â';
      case UnitType.KILOMETER:
        return 'ã';
      case UnitType.MPH:
        return 'ä';
      case UnitType.MILE:
        return 'å';
      case UnitType.METER:
        return 'æ';
      case UnitType.MPM:
        return 'ç';
      case UnitType.FPM:
        return 'è';
      case UnitType.GALLON || UnitType.GALLON_FUEL:
        return 'é';
      case UnitType.KILOGRAM:
        return 'ì';
      case UnitType.LITER:
        return 'í';
      case UnitType.POUND:
        return 'î';
      case UnitType.DEGREE:
        return 'ï';
      case UnitType.IN_HG:
        return 'À';
      case UnitType.HPA:
        return 'Å';
      case UnitType.CELSIUS:
        return 'Á';
      case UnitType.FAHRENHEIT:
        return 'Â';
      case UnitType.KNOT:
        return 'È';
      default:
        return '';
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''} style='white-space: nowrap;'>
        <span class='numberunit-num'>{this.numberText}</span><span class='numberunit-unit'>{this.unitText}</span>
      </div>
    );
  }
}

/**
 * Props on the GNSVerticalUnitDisplay component.
 */
interface GNSVerticalUnitDisplayProps<F extends string> extends ComponentProps {
  /** The unit to display. */
  unit: Unit<F> | null | Subscribable<Unit<F> | null>
}

/**
 * A component that displays a vertical unit character ligature.
 */
export class GNSVerticalUnitDisplay<F extends string> extends DisplayComponent<GNSVerticalUnitDisplayProps<F>> {
  private readonly unit = SubscribableUtils.toSubscribable(this.props.unit, true) as Subscribable<Unit<F> | null>;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span class='numberunit-unit'>{this.unit.map((v: Unit<F> | null): string => GNSNumberUnitDisplay.getUnitChar(v))}</span>
    );
  }
}