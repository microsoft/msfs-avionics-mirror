import { ComponentProps, DisplayComponent, FSComponent, MathUtils, VNode } from '@microsoft/msfs-sdk';

import { TrimPointer } from './TrimPointer';

import './ElevatorTrimDisplay.css';

/**
 * The ElevatorTrimDisplay component.
 */
export class ElevatorTrimDisplay extends DisplayComponent<ComponentProps> {

  private readonly elevatorTrimRef = FSComponent.createRef<HTMLDivElement>();
  private readonly greenBoxRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * Updates the elevator trim pointer
   * @param value The elevator trim percentage
   */
  public update(value: number): void {
    //Limits -100%(Nose down) to +100%(Nose up)
    const clampedValue = MathUtils.clamp(value, -100, 100);
    const correction = 75 / 200;
    this.elevatorTrimRef.instance.style.transform = `translate3d(0px, ${clampedValue * correction}px, 0px)`;
  }

  /**
   * Hide/Show the trim green reference box.
   * @param shouldBeVisible If the green box should be visible.
   */
  public setGreenboxVisibility(shouldBeVisible: boolean): void {
    this.greenBoxRef.instance.classList.toggle('hidden', !shouldBeVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flight-control-elevator">
        <svg height="121" width="80">
          <text x="22" y="57" fill="var(--wt21-colors-white)" font-size="20">ND</text>
          <rect x="46" y="43" width="10" height="75" stroke="var(--wt21-colors-white)" />
          <rect x="47" y="79" width="8" height="15" fill="var(--wt21-colors-green)" ref={this.greenBoxRef} />
          <text x="22" y="118" fill="var(--wt21-colors-white)" font-size="20">NU</text>
        </svg>
        <div class="flight-control-elevator-pointer" ref={this.elevatorTrimRef}>
          <TrimPointer pointDirection={90} />
        </div>
      </div>
    );
  }
}