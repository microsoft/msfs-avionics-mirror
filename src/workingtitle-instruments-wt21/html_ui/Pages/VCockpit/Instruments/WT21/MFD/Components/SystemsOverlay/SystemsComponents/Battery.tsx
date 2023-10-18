import { ComponentProps, DisplayComponent, FSComponent, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The Battery component.
 */
export class Battery extends DisplayComponent<ComponentProps> {
  private readonly current = Subject.create(0);
  private readonly voltage = Subject.create(0);
  private readonly temperature = Subject.create(26);

  /**
   * Updates the value of battery current (Amps).
   * @param current The new value of battery current.
   */
  public updateCurrent(current: number): void {
    let calcCurrent = this.calculateCurrent(current, this.voltage.get());
    calcCurrent = Math.floor((calcCurrent) / 5) * 5;
    this.current.set(calcCurrent);
  }

  /**
   * Calculates the current seen on the battery.
   * @param amps The current being drawn from the battery (sim value).
   * @param volts The voltage of the battery (sim value).
   * @returns The current seen on the battery.
   */
  private calculateCurrent(amps: number, volts: number): number {
    const soc = SimVar.GetSimVarValue('ELECTRICAL BATTERY ESTIMATED CAPACITY PCT:1', SimVarValueType.Percent);
    let battCurrent = 0;
    if (amps < 0) {
      const chargingVolts = Math.max(volts, 25.4);

      const ocv = soc / 100 * (chargingVolts - 21) + 21;

      const chargingPotential = chargingVolts - ocv;
      const chargingCurrent = chargingPotential / 0.05;
      battCurrent = Math.ceil(chargingCurrent);
    } else {
      battCurrent = Math.floor(-amps);
    }

    return battCurrent;
  }

  /**
   * Updates the value of battery voltage.
   * @param volts The new value of battery voltage.
   */
  public updateVoltage(volts: number): void {
    this.voltage.set(Math.floor(volts));
  }

  /**
   * Updates the value of battery temperature.
   * @param temp The new value of battery temperature.
   */
  public updateTemperature(temp: number): void {
    this.temperature.set(temp);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div>
        <svg height="135" width="200">
          <line x1="0" y1="10" x2="65" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="100" y="17" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">BATT</text>
          <line x1="135" y1="10" x2="200" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="65" y="40" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">AMP</text>
          <text x="150" y="40" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.current}</text>
          <text x="65" y="63" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">VOLT</text>
          <text x="150" y="63" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.voltage}</text>
          <text x="65" y="85" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">TEMP °C</text>
          <text x="150" y="85" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.temperature}</text>
        </svg>
      </div>
    );
  }
}