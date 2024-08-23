import { ComponentProps, DisplayComponent, FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { LeftGaugePointer } from '../DisplayComponents/LeftGaugePointer';
import { RightGaugePointer } from '../DisplayComponents/RightGaugePointer';

import './ITTDisplay.css';

/**
 * The ITTDisplay component.
 */
export class ITTDisplay extends DisplayComponent<ComponentProps> {

  private readonly leftPointerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightPointerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLeftValue = Subject.create(0);
  private readonly ittRightValue = Subject.create(0);
  private readonly ittLimitLeftRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitRightRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitLeftIgnitionRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitRightIgnitionRef = FSComponent.createRef<HTMLDivElement>();

  private readonly isIgnitingLeft = Subject.create<boolean>(false);
  private readonly isIgnitingRight = Subject.create<boolean>(false);
  private isCombustionOn = [false, false];
  private isStarterOn = [false, false];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.ittLeftValue.sub((v: number) => this.updatePointer(v, this.leftPointerRef));
    this.ittRightValue.sub((v: number) => this.updatePointer(v, this.rightPointerRef));
    this.isIgnitingLeft.sub((v: boolean) => this.updateIttLimitVisibility(v, 1), true);
    this.isIgnitingRight.sub((v: boolean) => this.updateIttLimitVisibility(v, 2), true);
  }

  /**
   * Updates the visibility of the ITT limit containers.
   * @param isIgniting true if the engine is igniting, false if it is not.
   * @param engineIndex The engine index (1/2).
   */
  private updateIttLimitVisibility(isIgniting: boolean, engineIndex: number): void {
    if (engineIndex === 1) {
      this.ittLimitLeftRef.instance.classList.toggle('hidden', isIgniting);
      this.ittLimitLeftIgnitionRef.instance.classList.toggle('hidden', !isIgniting);
    } else {
      this.ittLimitRightRef.instance.classList.toggle('hidden', isIgniting);
      this.ittLimitRightIgnitionRef.instance.classList.toggle('hidden', !isIgniting);
    }
  }

  /**
   * Updates the combustion value.
   * @param value Whether combustion is active.
   * @param engineIndex The engine index (1/2).
   */
  public updateCombustion(value: boolean, engineIndex: number): void {
    this.isCombustionOn[engineIndex - 1] = value;
    this.evaluateIgnition();
  }

  /**
   * Updates the starter value.
   * @param value Whether the starter is on.
   * @param engineIndex  The engine index (1/2).
   */
  public updateStarter(value: boolean, engineIndex: number): void {
    this.isStarterOn[engineIndex - 1] = value;
    this.evaluateIgnition();
  }

  /**
   * Evaluates the ignition state.
   */
  private evaluateIgnition(): void {
    this.isIgnitingLeft.set(this.isStarterOn[0] && this.isCombustionOn[0]);
    this.isIgnitingRight.set(this.isStarterOn[1] && this.isCombustionOn[1]);
  }

  /**
   * Updates the left ITT value.
   * @param ittValue The left ITT value.
   */
  public updateIttLeft(ittValue: number): void {
    this.ittLeftValue.set(ittValue);
  }

  /**
   * Updates the left ITT value.
   * @param ittValue The left ITT value.
   */
  public updateIttRight(ittValue: number): void {
    this.ittRightValue.set(ittValue);
  }

  /**
   * Updates the pointer according to the ITT value.
   * @param value The ITT value.
   * @param pointerRef The pointer reference.
   */
  private updatePointer(value: number, pointerRef: NodeReference<HTMLDivElement>): void {
    //Correction is for non-linear gauge markings
    //FOR 1050 to 900: 30px for 250 units = 0.2
    //FOR 900 to 800: 25px for 100 units = 0.25
    //FOR 800 to 700: 30px for 100 units = 0.3
    //FOR 700 to 600: 25px for 100 units = 0.25
    //FOR 600 to 200: 22px for 400 units = 0.055
    //Top is 0px, bottom is 137px, 900 is 30px, 800 is 55px, 700 is 85px, 600 is 110px

    const clampedITT = MathUtils.clamp(value, 100, 1050);
    const correction = clampedITT >= 900 ? 0.2 : clampedITT >= 800 ? 0.25 : clampedITT >= 700 ? 0.3 : clampedITT >= 600 ? 0.25 : clampedITT >= 100 ? 0.055 : 0.0;

    if (value >= 900) {
      pointerRef.instance.style.transform = `translate3d(0px, ${(1050 - clampedITT) * correction}px, 0px)`;
    } else if (value >= 800) {
      pointerRef.instance.style.transform = `translate3d(0px, ${30 + ((900 - clampedITT) * correction)}px, 0px)`;
    } else if (value >= 700) {
      pointerRef.instance.style.transform = `translate3d(0px, ${55 + ((800 - clampedITT) * correction)}px, 0px)`;
    } else if (value >= 600) {
      pointerRef.instance.style.transform = `translate3d(0px, ${85 + ((700 - clampedITT) * correction)}px, 0px)`;
    } else if (value < 600) {
      pointerRef.instance.style.transform = `translate3d(0px, ${110 + ((600 - clampedITT) * correction)}px, 0px)`;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="itt-display-container" data-checklist="ITT">
        <svg height="200px" width="150px">
          <line x1="20" y1="10" x2="33" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="10" x2="115" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="20" x2="43" y2="20" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="20" x2="105" y2="20" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="40" x2="43" y2="40" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="40" x2="105" y2="40" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="65" x2="43" y2="65" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="65" x2="105" y2="65" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="95" x2="43" y2="95" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="95" x2="105" y2="95" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="120" x2="43" y2="120" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="120" x2="105" y2="120" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="131" x2="43" y2="131" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="131" x2="105" y2="131" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="142" x2="43" y2="142" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="142" x2="105" y2="142" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="20" y1="10" x2="20" y2="147" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="10" x2="128" y2="147" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="5" y1="147" x2="20" y2="147" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="147" x2="143" y2="147" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <text x="74" y="40" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">900</text>
          <text x="74" y="67" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">800</text>
          <text x="74" y="95" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">700</text>
          <text x="74" y="120" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">600</text>
          <text x="74" y="142" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">200</text>
          <text x="74" y="21" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">ITT°C</text>
        </svg>
        <div class="itt-temp-limit-container" ref={this.ittLimitLeftRef}>
          <svg>
            <line x1="20" y1="53" x2="30" y2="53" stroke="yellow" stroke-width="5px" />
            <line x1="20" y1="50" x2="39" y2="50" stroke="var(--wt21-colors-red)" stroke-width="3px" />
          </svg>
        </div>
        <div class="itt-temp-limit-container" ref={this.ittLimitRightRef}>
          <svg>
            <line x1="128" y1="53" x2="118" y2="53" stroke="yellow" stroke-width="5px" />
            <line x1="128" y1="50" x2="109" y2="50" stroke="var(--wt21-colors-red)" stroke-width="3px" />
          </svg>
        </div>
        <div class="itt-temp-limit-container" ref={this.ittLimitLeftIgnitionRef}>
          <svg>
            <rect x="20" y="22" height="34" width="10" fill="var(--wt21-colors-yellow)" />
            <path d="m 19 22 l 18 -6 l 0 12 z" fill="var(--wt21-colors-red)" />
          </svg>
        </div>
        <div class="itt-temp-limit-container" ref={this.ittLimitRightIgnitionRef}>
          <svg>
            <rect x="118" y="22" height="34" width="10" fill="var(--wt21-colors-yellow)" />
            <path d="m 130 22 l -18 -6 l 0 12 z" fill="var(--wt21-colors-red)" />
          </svg>
        </div>
        <div class="left-itt-compressed-pointer-mask">
          <div ref={this.leftPointerRef}>
            <LeftGaugePointer />
          </div>
        </div>
        <div class="right-itt-compressed-pointer-mask">
          <div ref={this.rightPointerRef}>
            <RightGaugePointer />
          </div>
        </div>
      </div>
    );
  }
}