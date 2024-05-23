import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, NumberFormatter, NumberUnitInterface,
  Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { G3XNumberUnitDisplay } from './G3XNumberUnitDisplay';

/**
 * Component props for G3XMapRangeValueDisplay describing raw range values.
 */
type G3XMapRangeValueDisplayRawRangeProps = {
  /** The displayed range. */
  range: NumberUnitInterface<UnitFamily.Distance> | Subscribable<NumberUnitInterface<UnitFamily.Distance>>;
};

/**
 * Component props for G3XMapRangeValueDisplay describing indexed range values.
 */
type G3XMapRangeValueDisplayIndexedRangeProps = {
  /** The index of the displayed range. */
  rangeIndex: number | Subscribable<number>;

  /** The map range array. */
  rangeArray: Subscribable<readonly NumberUnitInterface<UnitFamily.Distance>[]>;
};

/**
 * Component props for G3XMapRangeValueDisplay describing the displayed range.
 */
type G3XMapRangeValueDisplayRangeProps = G3XMapRangeValueDisplayIndexedRangeProps | G3XMapRangeValueDisplayRawRangeProps;

/**
 * Component props for G3XMapRangeValueDisplay.
 */
export type G3XMapRangeValueDisplayProps = G3XMapRangeValueDisplayRangeProps & ComponentProps & {
  /** The displayed unit type. */
  displayUnit: Unit<UnitFamily.Distance> | null | Subscribable<Unit<UnitFamily.Distance> | null>;

  /**
   * Whether to use basic unit text formatting instead of G3X-style unit text formatting. Ignored if `unitFormatter` is
   * defined. Defaults to `false`.
   */
  useBasicUnitFormat?: boolean;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays a map range value.
 */
export class G3XMapRangeValueDisplay extends DisplayComponent<G3XMapRangeValueDisplayProps> {
  private static readonly DEFAULT_RANGE = UnitType.NMILE.createNumber(NaN);

  private readonly numberUnitDisplayRef = FSComponent.createRef<G3XNumberUnitDisplay<UnitFamily.Distance>>();

  private readonly nominalDisplayUnit = SubscribableUtils.toSubscribable(this.props.displayUnit, true) as Subscribable<Unit<UnitFamily.Distance> | null>;

  private readonly range = ('range' in this.props)
    ? SubscribableUtils.toSubscribable(this.props.range, true)
    : MappedSubject.create(
      ([rangeArray, rangeIndex]): NumberUnitInterface<UnitFamily.Distance> => {
        return rangeArray[rangeIndex] ?? G3XMapRangeValueDisplay.DEFAULT_RANGE;
      },
      this.props.rangeArray,
      SubscribableUtils.toSubscribable(this.props.rangeIndex, true)
    );
  private readonly displayUnit = Subject.create<Unit<UnitFamily.Distance> | null>(null);

  private readonly formatter = NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: false, maxDigits: 3, cache: true });

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    const displayUnitHandler = this.updateDisplayUnit.bind(this);

    this.subscriptions.push(
      this.range.sub(displayUnitHandler),
      this.nominalDisplayUnit.sub(displayUnitHandler)
    );

    this.updateDisplayUnit();
  }

  /**
   * Updates this component's display unit.
   */
  private updateDisplayUnit(): void {
    const nominalDisplayUnit = this.nominalDisplayUnit.get();
    const range = this.range.get();

    let displayUnit;
    if (nominalDisplayUnit && nominalDisplayUnit.equals(UnitType.NMILE)) {
      if (range.asUnit(UnitType.FOOT) as number <= 1001) {
        displayUnit = UnitType.FOOT;
      } else {
        displayUnit = UnitType.NMILE;
      }
    } else {
      displayUnit = nominalDisplayUnit;
    }

    this.displayUnit.set(displayUnit);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <G3XNumberUnitDisplay
        ref={this.numberUnitDisplayRef}
        value={this.range}
        displayUnit={this.displayUnit}
        formatter={this.formatter}
        useBasicUnitFormat={this.props.useBasicUnitFormat}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.numberUnitDisplayRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    if (this.range instanceof MappedSubject) {
      this.range.destroy();
    }

    super.destroy();
  }
}