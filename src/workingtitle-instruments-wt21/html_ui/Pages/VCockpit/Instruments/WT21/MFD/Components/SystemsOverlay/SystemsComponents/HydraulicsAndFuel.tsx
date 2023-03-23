import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, UnitType, VNode } from '@microsoft/msfs-sdk';
import { WT21UnitsUtils } from '../../../../Shared/WT21UnitsUtils';

/**
 * The HydraulicsAndFuel component.
 */
export class HydraulicsAndFuel extends DisplayComponent<ComponentProps> {
  private readonly hydPressLeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 100) * 100).toFixed(0); });
  private readonly hydPressRightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 100) * 100).toFixed(0); });
  private readonly pphLeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly pphRightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return (Math.floor(v / 10) * 10).toFixed(0); });
  private readonly fuelTempLeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
  private readonly fuelTempRightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(0); });
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
   * Updates the left hydraulic pressure value.
   * @param value The new value.
   */
  public updateHydPressLeft(value: number): void {
    this.hydPressLeftValue.set(value);
  }

  /**
   * Updates the right hydraulic pressure value.
   * @param value The new value.
   */
  public updateHydPressRight(value: number): void {
    this.hydPressRightValue.set(value);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div>
        <svg height="135" width="180">
          <line x1="0" y1="10" x2="70" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="90" y="17" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">HYD</text>
          <line x1="110" y1="10" x2="180" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="90" y="42" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">PSI</text>
          <text x="65" y="42" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.hydPressLeftValue}</text>
          <text x="172" y="42" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.hydPressRightValue}</text>
          <line x1="0" y1="60" x2="65" y2="60" stroke="var(--wt21-colors-white)" />
          <text x="90" y="67" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">FUEL</text>
          <line x1="113" y1="60" x2="180" y2="60" stroke="var(--wt21-colors-white)" />
          <text x="90" y="97" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">{this.fuelFlowUnit}</text>
          <text x="65" y="97" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.pphLeftValue}</text>
          <text x="172" y="97" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.pphRightValue}</text>
          <text x="90" y="127" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">°C</text>
          <text x="65" y="127" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.fuelTempLeftValue}</text>
          <text x="172" y="127" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.fuelTempRightValue}</text>
        </svg>
      </div>
    );
  }
}