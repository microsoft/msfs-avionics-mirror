import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, UnitType, VNode } from '@microsoft/msfs-sdk';

import { WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import { EisValueDisplay } from '../EisValueDisplay';

import './ExpandedFuelDisplay.css';

/**
 * The ExpandedFuelDisplay component.
 */
export class ExpandedFuelDisplay extends DisplayComponent<ComponentProps> {
  private readonly pphLeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly pphRightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly fuelTempLeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
  private readonly fuelTempRightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
  private readonly fuelQuantityLeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly fuelQuantityRightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly fuelUnit = WT21UnitsUtils.getIsMetric() ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);
  private readonly fuelFlowUnit = WT21UnitsUtils.getIsMetric() ? WT21UnitsUtils.getUnitString(UnitType.KGH) : WT21UnitsUtils.getUnitString(UnitType.PPH);

  /**
   * Updates the left Fuel Flow value.
   * @param value The new value.
   */
  public updateFuelFlowLeft(value: number): void {
    if (WT21UnitsUtils.getIsMetric()) {
      this.pphLeftValue.set(UnitType.GPH_FUEL.convertTo(value, UnitType.KGH));
    } else {
      this.pphLeftValue.set(UnitType.GPH_FUEL.convertTo(value, UnitType.PPH));
    }
  }

  /**
   * Updates the right Fuel Flow value.
   * @param value The new value.
   */
  public updateFuelFlowRight(value: number): void {
    if (WT21UnitsUtils.getIsMetric()) {
      this.pphRightValue.set(UnitType.GPH_FUEL.convertTo(value, UnitType.KGH));
    } else {
      this.pphRightValue.set(UnitType.GPH_FUEL.convertTo(value, UnitType.PPH));
    }
  }

  /**
   * Updates the left Fuel Temperature value.
   * @param value The new value.
   */
  public updateFuelTempLeft(value: number): void {
    this.fuelTempLeftValue.set(value);
  }

  /**
   * Updates the right Fuel Temperature value.
   * @param value The new value.
   */
  public updateFuelTempRight(value: number): void {
    this.fuelTempRightValue.set(value);
  }

  /**
   * Updates the left Fuel Quantity value.
   * @param value The new value.
   */
  public updateFuelQuantityLeft(value: number): void {
    if (WT21UnitsUtils.getIsMetric()) {
      this.fuelQuantityLeftValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.KILOGRAM));
    } else {
      this.fuelQuantityLeftValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.POUND));
    }

  }

  /**
   * Updates the right Fuel Quantity value.
   * @param value The new value.
   */
  public updateFuelQuantityRight(value: number): void {
    if (WT21UnitsUtils.getIsMetric()) {
      this.fuelQuantityRightValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.KILOGRAM));
    } else {
      this.fuelQuantityRightValue.set(UnitType.GALLON_FUEL.convertTo(value, UnitType.POUND));
    }

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="expanded-fuel-container">
        <div class="expanded-fuel-title">FUEL
        </div>
        <div class="expanded-fuel-row">
          <div class="expanded-fuel-values expanded-fuel-left-padding"><EisValueDisplay valueSubject={this.pphLeftValue} minValue={0} emptyText='----' /></div>
          <div>{this.fuelFlowUnit}</div>
          <div class="expanded-fuel-values"><EisValueDisplay valueSubject={this.pphRightValue} minValue={0} emptyText='----' /></div>
        </div>
        <div class="expanded-fuel-row">
          <div class="expanded-fuel-values expanded-fuel-left-padding"><EisValueDisplay valueSubject={this.fuelTempLeftValue} minValue={-90} emptyText='--' /></div>
          <div>°C</div>
          <div class="expanded-fuel-values"><EisValueDisplay valueSubject={this.fuelTempRightValue} minValue={-90} emptyText='--' /></div>
        </div>
        <div class="expanded-fueldisplay-container">
          <div class="fueldisplay-box"><EisValueDisplay valueSubject={this.fuelQuantityLeftValue} minValue={0} emptyText='----' /></div>
          <div class="fueldisplay-title">{this.fuelUnit}S</div>
          <div class="fueldisplay-box"><EisValueDisplay valueSubject={this.fuelQuantityRightValue} minValue={0} emptyText='----' /></div>
        </div>
      </div>
    );
  }
}
