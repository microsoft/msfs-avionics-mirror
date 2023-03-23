import { ComponentProps, DisplayComponent, FSComponent, MathUtils, Subject, VNode } from '@microsoft/msfs-sdk';

import { TrimPointer } from '../../EngineIndication/DisplayComponents/TrimPointer';

import './TrimGroup.css';

/**
 * The TrimGroup component.
 */
export class TrimGroup extends DisplayComponent<ComponentProps> {

  private readonly systems2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly aileronTrimRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rudderTrimRef = FSComponent.createRef<HTMLDivElement>();
  private readonly elevatorTrimRefLeft = FSComponent.createRef<HTMLDivElement>();
  private readonly elevatorTrimRefRight = FSComponent.createRef<HTMLDivElement>();
  private readonly greenBoxRef1 = FSComponent.createRef<HTMLDivElement>();
  private readonly greenBoxRef2 = FSComponent.createRef<HTMLDivElement>();
  private readonly greenBoxRef3 = FSComponent.createRef<HTMLDivElement>();

  private readonly elevatorTrimValue = Subject.create('');

  public readonly setVisibility = (isVisible: boolean): void => {
    this.systems2Ref.instance.classList.toggle('hidden', !isVisible);
  };

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
   * Updates the elevator trim pointer
   * @param value The elevator trim percentage
   */
  public updateElevatorTrim(value: number): void {
    //Limits -100%(Nose down) to +100%(Nose up)
    const clampedValue = MathUtils.clamp(value, -100, 100);
    const trimValue = (-clampedValue / 10).toFixed(1);
    const correction = 75 / 200;
    this.elevatorTrimRefLeft.instance.style.transform = `translate3d(0px, ${clampedValue * correction}px, 0px)`;
    this.elevatorTrimRefRight.instance.style.transform = `translate3d(0px, ${clampedValue * correction}px, 0px)`;
    this.elevatorTrimValue.set(trimValue);
  }

  /**
   * Hide/Show the trim green reference box.
   * @param shouldBeVisible If the green box should be visible.
   */
  public setGreenboxVisibility(shouldBeVisible: boolean): void {
    this.greenBoxRef1.instance.classList.toggle('hidden', !shouldBeVisible);
    this.greenBoxRef2.instance.classList.toggle('hidden', !shouldBeVisible);
    this.greenBoxRef3.instance.classList.toggle('hidden', !shouldBeVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="systems2-data-container hidden" ref={this.systems2Ref}>
        <div class="systems2-trim-title">
          <svg height="125" width="80">
            <line x1="30" y1="30" x2="30" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1" />
            <line x1="30" y1="10" x2="40" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1" />
            <text x="30" y="30" style="writing-mode: tb; glyph-orientation-vertical: 0; letter-spacing:-4" fill="var(--wt21-colors-white)" font-size="20">TRIM</text>
            <line x1="30" y1="100" x2="30" y2="120" stroke="var(--wt21-colors-white)" stroke-width="1" />
            <line x1="30" y1="120" x2="40" y2="120" stroke="var(--wt21-colors-white)" stroke-width="1" />
          </svg>
        </div>
        <div class="systems2-aileron-group">
          <svg height="121" width="160">
            <text x="22" y="71" fill="var(--wt21-colors-white)" font-size="20">L</text>
            <rect x="36" y="63" width="75" height="7" stroke="var(--wt21-colors-white)" />
            <rect x="61" y="64" width="26" height="5" fill="var(--wt21-colors-green)" ref={this.greenBoxRef1} />
            <line x1="74" y1="64" x2="74" y2="69" stroke="black" stroke-width="2" />
            <text x="116" y="71" fill="var(--wt21-colors-white)" font-size="20">R</text>
            <text x="74" y="25" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">AIL</text>
          </svg>
        </div>
        <div class="systems2-rudder-group">
          <svg height="121" width="170">
            <text x="22" y="71" fill="var(--wt21-colors-white)" font-size="20">L</text>
            <rect x="36" y="63" width="75" height="7" stroke="var(--wt21-colors-white)" />
            <rect x="61" y="64" width="26" height="5" fill="var(--wt21-colors-green)" ref={this.greenBoxRef2} />
            <line x1="74" y1="64" x2="74" y2="69" stroke="black" stroke-width="2" />
            <text x="116" y="71" fill="var(--wt21-colors-white)" font-size="20">R</text>
            <text x="74" y="120" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">RUD</text>
          </svg>
        </div>
        <div class="systems2-elevator-group">
          <svg height="121" width="200">
            <text x="0" y="25" fill="var(--wt21-colors-white)" font-size="20">ELEV</text>
            <text x="72" y="25" fill="var(--wt21-colors-white)" font-size="20">ND</text>
            <rect x="78" y="28" width="7" height="75" stroke="var(--wt21-colors-white)" />
            <rect x="79" y="65" width="5" height="15" fill="var(--wt21-colors-green)" ref={this.greenBoxRef3} />
            <text x="72" y="120" fill="var(--wt21-colors-white)" font-size="20">NU</text>
            <text x="140" y="25" fill="var(--wt21-colors-white)" font-size="20">{this.elevatorTrimValue}</text>
            <text x="45" y="67" fill="var(--wt21-colors-white)" font-size="20">L</text>
            <text x="108" y="67" fill="var(--wt21-colors-white)" font-size="20">R</text>
          </svg>
        </div>
        <div class="systems2-aileron-pointer" ref={this.aileronTrimRef}>
          <TrimPointer pointDirection={0} />
        </div>
        <div class="systems2-rudder-pointer" ref={this.rudderTrimRef}>
          <TrimPointer pointDirection={180} />
        </div>
        <div class="systems2-elevator-left-pointer" ref={this.elevatorTrimRefLeft}>
          <TrimPointer pointDirection={270} />
        </div>
        <div class="systems2-elevator-right-pointer" ref={this.elevatorTrimRefRight}>
          <TrimPointer pointDirection={90} />
        </div>
      </div>
    );
  }
}