import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The Battery component.
 */
export class Battery extends DisplayComponent<ComponentProps> {
  private readonly current = ComputedSubject.create(0, v => {
    v = (v * -1);
    return ((v > 0 ? Math.floor : Math.ceil)(v / 5) * 5);
  });
  private readonly voltage = Subject.create(0);
  private readonly temperature = Subject.create(26);

  /**
   * Updates the value of battery current (Amps).
   * @param current The new value of battery current.
   */
  public updateCurrent(current: number): void {
    this.current.set(current);
  }

  /**
   * Updates the value of battery voltage.
   * @param volts The new value of battery voltage.
   */
  public updateVoltage(volts: number): void {
    this.voltage.set(volts);
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