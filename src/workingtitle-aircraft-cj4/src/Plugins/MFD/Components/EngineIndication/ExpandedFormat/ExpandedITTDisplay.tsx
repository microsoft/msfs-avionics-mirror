import { ComponentProps, DisplayComponent, FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { LeftGaugePointer } from '../DisplayComponents/LeftGaugePointer';
import { RightGaugePointer } from '../DisplayComponents/RightGaugePointer';

import './ExpandedITTDisplay.css';

/**
 * The ExpandedITTDisplay component.
 */
export class ExpandedITTDisplay extends DisplayComponent<ComponentProps> {
  private readonly leftPointerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightPointerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitLeftRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitRightRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitLeftIgnitionRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLimitRightIgnitionRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ittLeftValue = Subject.create(0);
  private readonly ittRightValue = Subject.create(0);
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
   * @param value 1 if combustion is on, 0 if it is off.
   * @param engineIndex The engine index (1/2).
   */
  public updateCombustion(value: number, engineIndex: number): void {
    this.isCombustionOn[engineIndex - 1] = value === 1;
    this.evaluateIgnition();
  }

  /**
   * Updates the starter value.
   * @param value 1 if starter is on, 0 if it is off.
   * @param engineIndex  The engine index (1/2).
   */
  public updateStarter(value: number, engineIndex: number): void {
    this.isStarterOn[engineIndex - 1] = value === 1;
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
    //FOR 1050 to 900: 45px for 150 units = 0.3
    //FOR 900 to 800: 44px for 100 units = 0.44
    //FOR 800 to 600: 124px for 200 units = 0.62
    //FOR 600 to 200: 42px for 400 units = 0.105
    //Top is 0px, bottom is 270px, 900 is 45px, 800 is 89px, 600 is 213px
    const clampedN1 = MathUtils.clamp(value, 0, 1050);
    const correction = clampedN1 >= 900 ? 0.3 : clampedN1 >= 800 ? 0.44 : clampedN1 >= 600 ? 0.62 : 0.105;

    if (value >= 900) {
      pointerRef.instance.style.transform = `translate3d(0px, ${(1050 - clampedN1) * correction}px, 0px)`;
    } else if (value >= 800) {
      pointerRef.instance.style.transform = `translate3d(0px, ${45 + ((900 - clampedN1) * correction)}px, 0px)`;
    } else if (value >= 600) {
      pointerRef.instance.style.transform = `translate3d(0px, ${89 + ((800 - clampedN1) * correction)}px, 0px)`;
    } else {
      pointerRef.instance.style.transform = `translate3d(0px, ${213 + ((600 - clampedN1) * correction)}px, 0px)`;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="expandeditt-display-container" data-checklist="ITT">
        <svg height="305px" width="150px">
          <line x1="20" y1="20" x2="35" y2="20" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="20" x2="113" y2="20" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="35" x2="43" y2="35" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="35" x2="105" y2="35" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="50" x2="35" y2="50" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="50" x2="113" y2="50" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="65" x2="43" y2="65" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="65" x2="105" y2="65" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="87" x2="35" y2="87" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="87" x2="113" y2="87" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="109" x2="43" y2="109" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="109" x2="105" y2="109" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="140" x2="35" y2="140" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="140" x2="113" y2="140" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="171" x2="43" y2="171" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="171" x2="105" y2="171" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="202" x2="35" y2="202" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="202" x2="113" y2="202" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="233" x2="43" y2="233" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="233" x2="105" y2="233" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="254" x2="43" y2="254" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="254" x2="105" y2="254" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="275" x2="43" y2="275" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="275" x2="105" y2="275" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="20" x2="20" y2="290" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="20" x2="128" y2="290" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="5" y1="290" x2="20" y2="290" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="128" y1="290" x2="143" y2="290" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <text x="74" y="36" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">1000</text>
          <text x="74" y="66" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">900</text>
          <text x="74" y="111" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">800</text>
          <text x="74" y="173" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">700</text>
          <text x="74" y="234" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">600</text>
          <text x="74" y="255" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">400</text>
          <text x="74" y="276" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">200</text>
          <text x="74" y="21" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">ITT°C</text>
        </svg>
        <div class="itt-temp-limit-container" ref={this.ittLimitLeftRef}>
          <svg>
            <rect x="19" y="87" height="8" width="10" fill="var(--wt21-colors-yellow)" />
            <line x1="19" y1="85" x2="39" y2="85" stroke="var(--wt21-colors-red)" stroke-width="3px" />
          </svg>
        </div>
        <div class="itt-temp-limit-container" ref={this.ittLimitRightRef}>
          <svg>
            <rect x="119" y="87" height="8" width="10" fill="var(--wt21-colors-yellow)" />
            <line x1="129" y1="85" x2="109" y2="85" stroke="var(--wt21-colors-red)" stroke-width="3px" />
          </svg>
        </div>
        <div class="itt-temp-limit-container" ref={this.ittLimitLeftIgnitionRef}>
          <svg>
            <rect x="19" y="36" height="58" width="10" fill="var(--wt21-colors-yellow)" />
            <path d="m 19 35 l 18 -6 l 0 12 z" fill="var(--wt21-colors-red)" />
          </svg>
        </div>
        <div class="itt-temp-limit-container" ref={this.ittLimitRightIgnitionRef}>
          <svg>
            <rect x="119" y="36" height="58" width="10" fill="var(--wt21-colors-yellow)" />
            <path d="m 130 35 l -18 -6 l 0 12 z" fill="var(--wt21-colors-red)" />
          </svg>
        </div>
        <div class="left-itt-pointer-mask">
          <div ref={this.leftPointerRef}>
            <LeftGaugePointer />
          </div>
        </div>
        <div class="right-itt-pointer-mask">
          <div ref={this.rightPointerRef}>
            <RightGaugePointer />
          </div>
        </div>
      </div>
    );
  }
}