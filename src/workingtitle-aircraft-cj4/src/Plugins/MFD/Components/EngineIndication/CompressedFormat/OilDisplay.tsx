import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, UnitType, VNode } from '@microsoft/msfs-sdk';

import { EisValueDisplay } from '../EisValueDisplay';

import './OilDisplay.css';

/**
 * The OilDisplay component.
 */
export class OilDisplay extends DisplayComponent<ComponentProps> {
  private readonly leftTempValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
  private readonly rightTempValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
  private readonly leftPressureValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
  private readonly rightPressureValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });

  /**
   * Updates the left Oil Temperature value.
   * @param value The new value.
   */
  public updateOilTempLeft(value: number): void {
    this.leftTempValue.set(UnitType.FAHRENHEIT.convertTo(value, UnitType.CELSIUS));
  }

  /**
   * Updates the right Oil Temperature value.
   * @param value The new value.
   */
  public updateOilTempRight(value: number): void {
    this.rightTempValue.set(UnitType.FAHRENHEIT.convertTo(value, UnitType.CELSIUS));
  }

  /**
   * Updates the left Oil Pressure value.
   * @param value The new value.
   */
  public updateOilPressureLeft(value: number): void {
    this.leftPressureValue.set(value);
  }

  /**
   * Updates the right Oil Pressure value.
   * @param value The new value.
   */
  public updateOilPressureRight(value: number): void {
    this.rightPressureValue.set(value);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="oil-display-container">
        <div class="oil-display-row">
          <div class="oil-display-values"><EisValueDisplay valueSubject={this.leftTempValue} minValue={-90} emptyText='--' /></div>
          <div>OIL °C</div>
          <div class="oil-display-values"><EisValueDisplay valueSubject={this.rightTempValue} minValue={-90} emptyText='--' /></div>
        </div>
        <div class="oil-display-row">
          <div class="oil-display-values"><EisValueDisplay valueSubject={this.leftPressureValue} minValue={0} emptyText='---' /></div>
          <div>OIL PSI</div>
          <div class="oil-display-values"><EisValueDisplay valueSubject={this.rightPressureValue} minValue={0} emptyText='---' /></div>
        </div>
      </div>
    );
  }
}