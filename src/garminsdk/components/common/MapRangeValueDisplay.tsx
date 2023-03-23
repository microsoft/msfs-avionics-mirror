import {
  CombinedSubject, ComponentProps, DisplayComponent, FSComponent, MappedSubject, NumberFormatter, NumberUnitInterface,
  Subject, Subscribable, SubscribableSet, SubscribableUtils, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { NumberUnitDisplay } from './NumberUnitDisplay';

/**
 * Component props for MapRangeValueDisplay describing raw range values.
 */
type MapRangeValueDisplayRawRangeProps = {
  /** The displayed range. */
  range: NumberUnitInterface<UnitFamily.Distance> | Subscribable<NumberUnitInterface<UnitFamily.Distance>>;
};

/**
 * Component props for MapRangeValueDisplay describing indexed range values.
 */
type MapRangeValueDisplayIndexedRangeProps = {
  /** The index of the displayed range. */
  rangeIndex: number | Subscribable<number>;

  /** The map range array. */
  rangeArray: Subscribable<readonly NumberUnitInterface<UnitFamily.Distance>[]>;
};

/**
 * Component props for MapRangeValueDisplay describing the displayed range.
 */
type MapRangeValueDisplayRangeProps = MapRangeValueDisplayIndexedRangeProps | MapRangeValueDisplayRawRangeProps;

/**
 * Component props for MapRangeValueDisplay.
 */
export type MapRangeValueDisplayProps = MapRangeValueDisplayRangeProps & ComponentProps & {
  /** The displayed unit type. */
  displayUnit: Subscribable<Unit<UnitFamily.Distance> | null>;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays a map range value.
 */
export class MapRangeValueDisplay extends DisplayComponent<MapRangeValueDisplayProps> {
  private static readonly DEFAULT_RANGE = UnitType.NMILE.createNumber(NaN);

  private readonly numberUnitRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly range = ('range' in this.props)
    ? SubscribableUtils.toSubscribable(this.props.range, true)
    : MappedSubject.create(
      ([rangeArray, rangeIndex]): NumberUnitInterface<UnitFamily.Distance> => {
        return rangeArray[rangeIndex] ?? MapRangeValueDisplay.DEFAULT_RANGE;
      },
      this.props.rangeArray,
      SubscribableUtils.toSubscribable(this.props.rangeIndex, true)
    );
  private readonly displayUnit = Subject.create<Unit<UnitFamily.Distance> | null>(null);

  private readonly displayUnitState = CombinedSubject.create(
    this.range,
    this.props.displayUnit
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.displayUnitState.sub(this.updateDisplayUnit.bind(this), true);
  }

  /**
   * Updates this component's display unit.
   */
  private updateDisplayUnit(): void {
    const nominalDisplayUnit = this.props.displayUnit.get();
    const range = this.range.get();

    let displayUnit;
    if (nominalDisplayUnit && nominalDisplayUnit.equals(UnitType.NMILE)) {
      if (range.asUnit(UnitType.FOOT) as number <= 2501) {
        displayUnit = UnitType.FOOT;
      } else {
        displayUnit = UnitType.NMILE;
      }
    } else if (nominalDisplayUnit && nominalDisplayUnit.equals(UnitType.KILOMETER)) {
      if (range.asUnit(UnitType.METER) as number < 999) {
        displayUnit = UnitType.METER;
      } else {
        displayUnit = UnitType.KILOMETER;
      }
    } else {
      displayUnit = nominalDisplayUnit;
    }

    this.displayUnit.set(displayUnit);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <NumberUnitDisplay
        ref={this.numberUnitRef}
        value={this.range}
        displayUnit={this.displayUnit}
        formatter={NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: false, maxDigits: 3 })}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.numberUnitRef.getOrDefault()?.destroy();

    this.displayUnitState.destroy();
    if (this.range instanceof MappedSubject) {
      this.range.destroy();
    }

    super.destroy();
  }
}