import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, UnitType, VNode } from '@microsoft/msfs-sdk';

import { WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import { EisValueDisplay } from '../EisValueDisplay';

import './FuelDisplay.css';

/**
 * The FuelDisplay component.
 */
export class FuelDisplay extends DisplayComponent<ComponentProps> {
  private readonly leftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly rightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly fuelUnit = WT21UnitsUtils.getIsMetric() ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

  /**
   * Updates the left Fuel value.
   * @param value The new value.
   */
  public updateFuelLeft(value: number): void {
    if (WT21UnitsUtils.getIsMetric()) {
      this.leftValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.KILOGRAM));
    } else {
      this.leftValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.POUND));
    }
  }

  /**
   * Updates the right Fuel value.
   * @param value The new value.
   */
  public updateFuelRight(value: number): void {
    if (WT21UnitsUtils.getIsMetric()) {
      this.rightValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.KILOGRAM));
    } else {
      this.rightValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.POUND));
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fueldisplay-container">
        <div class="fueldisplay-box"><EisValueDisplay valueSubject={this.leftValue} minValue={0} emptyText='----' /></div>
        <div class="fueldisplay-title">FUEL<br />{this.fuelUnit}S</div>
        <div class="fueldisplay-box"><EisValueDisplay valueSubject={this.rightValue} minValue={0} emptyText='----' /></div>
      </div>
    );
  }
}
