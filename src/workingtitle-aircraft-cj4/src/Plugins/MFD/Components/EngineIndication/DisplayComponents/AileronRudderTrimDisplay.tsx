import { ComponentProps, DisplayComponent, FSComponent, MathUtils, VNode } from '@microsoft/msfs-sdk';

import { TrimPointer } from './TrimPointer';

import './AileronRudderTrimDisplay.css';

/**
 * The AileronRudderTrimDisplay component.
 */
export class AileronRudderTrimDisplay extends DisplayComponent<ComponentProps> {

  private readonly aileronTrimRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rudderTrimRef = FSComponent.createRef<HTMLDivElement>();
  private readonly greenBoxRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * Updates the aileron trim pointer
   * @param value The aileron trim value
   */
  public updateAileronTrim(value: number): void {
    //Limts: -100% to +100%
    const clampedValue = MathUtils.clamp(value, -100, 100);
    const correction = 75 / 200;
    this.aileronTrimRef.instance.style.transform = `translate3d(${clampedValue * correction}px, 0px, 0px)`;
  }

  /**
   * Updates the rudder trim pointer
   * @param value The rudder trim value
   */
  public updateRudderTrim(value: number): void {
    //Limts: -100% to +100%
    const clampedValue = MathUtils.clamp(value, -100, 100);
    const correction = 75 / 200;
    this.rudderTrimRef.instance.style.transform = `translate3d(${clampedValue * correction}px, 0px, 0px)`;
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
      <div class="flight-control-aileron-rudder">
        <svg height="121" width="130">
          <text x="22" y="72" fill="var(--wt21-colors-white)" font-size="20">L</text>
          <rect x="36" y="63" width="75" height="7" stroke="var(--wt21-colors-white)" />
          <rect x="61" y="64" width="26" height="5" fill="var(--wt21-colors-green)" ref={this.greenBoxRef} />
          <line x1="74" y1="64" x2="74" y2="69" stroke="black" stroke-width="2" />
          <text x="116" y="72" fill="var(--wt21-colors-white)" font-size="20">R</text>
          <text x="74" y="25" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">AIL</text>
          <text x="74" y="120" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">RUD</text>
        </svg>
        <div class="flight-control-aileron-pointer" ref={this.aileronTrimRef}>
          <TrimPointer pointDirection={0} />
        </div>
        <div class="flight-control-rudder-pointer" ref={this.rudderTrimRef}>
          <TrimPointer pointDirection={180} />
        </div>
      </div>
    );
  }
}