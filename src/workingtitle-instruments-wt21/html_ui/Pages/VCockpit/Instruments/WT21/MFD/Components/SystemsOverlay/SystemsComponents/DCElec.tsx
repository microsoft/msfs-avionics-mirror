import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The DCElec component.
 */
export class DCElec extends DisplayComponent<ComponentProps> {
  private readonly ampLeft = ComputedSubject.create(0, v => ((v > 0 ? Math.floor : Math.ceil)(v / 5) * 5));
  private readonly ampRight = ComputedSubject.create(0, v => ((v > 0 ? Math.floor : Math.ceil)(v / 5) * 5));
  private readonly voltLeft = Subject.create(0);
  private readonly voltRight = Subject.create(0);

  /**
   * Updates the value of bus 1 current (Amps).
   * @param current The new value of bus current.
   */
  public updateAmpBus1(current: number): void {
    this.ampLeft.set(current);
  }

  /**
   * Updates the value of bus 2 current (Amps).
   * @param current The new value of bus current.
   */
  public updateAmpBus2(current: number): void {
    this.ampRight.set(current);
  }

  /**
   * Updates the value of bus 1 voltage.
   * @param volts The new value of bus voltage.
   */
  public updateVoltageBus1(volts: number): void {
    this.voltLeft.set(volts);
  }

  /**
   * Updates the value of bus 2 voltage.
   * @param volts The new value of bus voltage.
   */
  public updateVoltageBus2(volts: number): void {
    this.voltRight.set(volts);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div>
        <svg height="135" width="200">
          <line x1="0" y1="10" x2="50" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="100" y="17" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">DC ELEC</text>
          <line x1="150" y1="10" x2="200" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="100" y="40" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">AMP</text>
          <text x="50" y="40" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.ampLeft}</text>
          <text x="185" y="40" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.ampRight}</text>
          <text x="100" y="63" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">VOLT</text>
          <text x="50" y="63" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.voltLeft}</text>
          <text x="185" y="63" text-anchor="end" font-size="24px" fill="var(--wt21-colors-green)">{this.voltRight}</text>
        </svg>
      </div>
    );
  }
}