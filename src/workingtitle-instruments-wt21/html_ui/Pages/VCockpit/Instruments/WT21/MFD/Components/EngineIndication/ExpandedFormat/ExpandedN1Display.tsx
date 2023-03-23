import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { LeftGaugePointer } from '../DisplayComponents/LeftGaugePointer';
import { RightGaugePointer } from '../DisplayComponents/RightGaugePointer';

import './ExpandedN1Display.css';

/**
 * The ExpandedN1Display component.
 */
export class ExpandedN1Display extends DisplayComponent<ComponentProps> {
  private readonly leftPointerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightPointerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly leftBugRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightBugRef = FSComponent.createRef<HTMLDivElement>();

  private readonly leftMaxFlagRef = FSComponent.createRef<SVGLineElement>();
  private readonly rightMaxFlagRef = FSComponent.createRef<SVGLineElement>();

  private readonly n1LeftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v >= 0 ? v.toFixed(1) : '---.-'; });
  private readonly n1RightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v >= 0 ? v.toFixed(1) : '---.-'; });

  private readonly n1LeftInvalid = Subject.create<boolean>(true);
  private readonly n1RightInvalid = Subject.create<boolean>(true);

  private readonly n1LeftValueColor = Subject.create('var(--wt21-colors-yellow)');
  private readonly n1RightValueColor = Subject.create('var(--wt21-colors-yellow)');

  private readonly n1LeftTarget = Subject.create(0);
  private readonly n1RightTarget = Subject.create(0);

  private readonly leftFadecModeText = Subject.create('');
  private readonly rightFadecModeText = Subject.create('');

  private readonly leftFadecModeColor = Subject.create('');
  private readonly rightFadecModeColor = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.n1LeftValue.sub((v: string, rv: number) => {
      this.updatePointer(rv, this.leftPointerRef);
      this.updateBugVisibility(rv, this.leftBugRef);
      this.n1LeftInvalid.set(rv < 0);
    }, true);
    this.n1RightValue.sub((v: string, rv: number) => {
      this.updatePointer(rv, this.rightPointerRef);
      this.updateBugVisibility(rv, this.rightBugRef);
      this.n1RightInvalid.set(rv < 0);
    }, true);

    this.n1LeftInvalid.sub((v: boolean) => {
      this.n1LeftValueColor.set(v ? 'var(--wt21-colors-yellow)' : 'var(--wt21-colors-green)');
      this.leftMaxFlagRef.instance.style.visibility = v ? 'hidden' : 'visible';
    }, true);

    this.n1RightInvalid.sub((v: boolean) => {
      this.n1RightValueColor.set(v ? 'var(--wt21-colors-yellow)' : 'var(--wt21-colors-green)');
      this.rightMaxFlagRef.instance.style.visibility = v ? 'hidden' : 'visible';
    }, true);

    this.n1LeftTarget.sub(v => this.updatePointer(v, this.leftBugRef), true);
    this.n1RightTarget.sub(v => this.updatePointer(v, this.rightBugRef), true);
  }

  /**
   * Updates the left N1 value.
   * @param n1Value The left N1 value.
   */
  public updateN1Left(n1Value: number): void {
    this.n1LeftValue.set(n1Value);
  }

  /**
   * Updates the right N1 value.
   * @param n1Value The right N1 value.
   */
  public updateN1Right(n1Value: number): void {
    this.n1RightValue.set(n1Value);
  }

  /**
   * Updates the left N1 target bug value.
   * @param n1Target The left N1 target value.
   */
  public updateN1TargetLeft(n1Target: number): void {
    this.n1LeftTarget.set(n1Target);
  }

  /**
   * Updates the right N1 target bug value.
   * @param n1Target The right N1 target value.
   */
  public updateN1TargetRight(n1Target: number): void {
    this.n1RightTarget.set(n1Target);
  }

  /**
   * Updates the left FADEC mode.
   * @param mode The FADEC mode.
   */
  public updateFadecModeLeft(mode: string): void {
    this.updateFadecMode(mode, this.leftFadecModeText, this.leftFadecModeColor);
  }

  /**
   * Updates the right FADEC mode.
   * @param mode The FADEC mode.
   */
  public updateFadecModeRight(mode: string): void {
    this.updateFadecMode(mode, this.rightFadecModeText, this.rightFadecModeColor);
  }

  /**
   * Updates the pointer according to the N1 value.
   * @param value The N1 value.
   * @param pointerRef The pointer reference.
   */
  private updatePointer(value: number, pointerRef: NodeReference<HTMLDivElement>): void {
    //Correction is for non-linear gauge markings
    //FOR 110 to 80: 150px for 30 units = 5
    //FOR 80 to 20: 75px per 60 increments = 1.25
    //Top is 0px, bottom is 234px, 80 is 150px
    const clampedN1 = MathUtils.clamp(value, 15, 110);
    const correction = clampedN1 >= 80 ? 5 : 1.25;

    if (value >= 80) {
      pointerRef.instance.style.transform = `translate3d(0px, ${(110 - clampedN1) * correction}px, 0px)`;
    } else {
      pointerRef.instance.style.transform = `translate3d(0px, ${150 + ((80 - clampedN1) * correction)}px, 0px)`;
    }
  }

  /**
   * Updates a FADEC mode indication.
   * @param mode The FADEC mode.
   * @param textSub The subject which provides the indication element's text.
   * @param colorSub The subject which provides the indication element's color.
   */
  private updateFadecMode(mode: string, textSub: Subject<string>, colorSub: Subject<string>): void {
    let text = '';
    let color = 'green';

    switch (mode) {
      case 'GROUND':
        color = 'white';
      // eslint-disable-next-line no-fallthrough
      case 'TO':
        text = 'TO';
        break;
      case 'CLB':
      case 'CRU':
        text = mode;
    }

    textSub.set(text);
    colorSub.set(`var(--wt21-colors-${color})`);
  }

  /**
   * Updates the target bug visibility based on given n1 value.
   * @param n1 The N1 value in percent.
   * @param bugRef The node reference for the bug visibility to update.
   */
  private updateBugVisibility(n1: number, bugRef: NodeReference<HTMLElement>): void {
    bugRef.instance.classList.toggle('hidden', n1 < 24.5);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="expanded-n1-display-container" data-checklist="N1">
        <svg height="300px" width="193px">
          <line x1="35" y1="25" x2="58" y2="25" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="25" x2="138" y2="25" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="50" x2="50" y2="50" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="50" x2="146" y2="50" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="75" x2="58" y2="75" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="75" x2="138" y2="75" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="100" x2="50" y2="100" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="100" x2="146" y2="100" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="125" x2="58" y2="125" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="125" x2="138" y2="125" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="150" x2="50" y2="150" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="150" x2="146" y2="150" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="175" x2="58" y2="175" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="175" x2="138" y2="175" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="200" x2="58" y2="200" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="200" x2="138" y2="200" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="225" x2="58" y2="225" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="225" x2="138" y2="225" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="250" x2="58" y2="250" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="250" x2="138" y2="250" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="35" y1="25" x2="35" y2="259" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="161" y1="25" x2="161" y2="259" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>

          <line x1="33" y1="51" x2="50" y2="51" stroke="var(--wt21-colors-red)" stroke-width="3px" ref={this.leftMaxFlagRef}></line>
          <line x1="163" y1="51" x2="146" y2="51" stroke="var(--wt21-colors-red)" stroke-width="3px" ref={this.rightMaxFlagRef}></line>

          <rect x="5" y="259" height="33" width="88" stroke="var(--wt21-colors-white)" />
          <rect x="104" y="259" height="33" width="88" stroke="var(--wt21-colors-white)" />
          <text x="98" y="76" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">100</text>
          <text x="98" y="126" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">90</text>
          <text x="98" y="176" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">80</text>
          <text x="98" y="201" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">60</text>
          <text x="98" y="226" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">40</text>
          <text x="98" y="251" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">20</text>
          <text x="98" y="20" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">N1 %</text>
          <text x="73" y="110" style="writing-mode: tb; glyph-orientation-vertical: 0;" fill={this.leftFadecModeColor} font-size="20">{this.leftFadecModeText}</text>
          <text x="122" y="110" style="writing-mode: tb; glyph-orientation-vertical: 0;" fill={this.rightFadecModeColor} font-size="20">{this.rightFadecModeText}</text>
          <text x="88" y="285" fill={this.n1LeftValueColor} text-anchor="end" font-size="28">{this.n1LeftValue}</text>
          <text x="186" y="285" fill={this.n1RightValueColor} text-anchor="end" font-size="28">{this.n1RightValue}</text>
        </svg>
        <div class="left-n1-pointer-mask">
          <div class="left-n1-bug" ref={this.leftBugRef}>
            <svg height="16" width="13">
              <path d="M 0 0 l 13 0 l 0 16 l -13 0 l 8 -8 z" fill="var(--wt21-colors-cyan)" />
            </svg>
          </div>
          <div ref={this.leftPointerRef}>
            <LeftGaugePointer />
          </div>
        </div>
        <div class="right-n1-pointer-mask">
          <div class="right-n1-bug" ref={this.rightBugRef}>
            <svg height="16" width="13">
              <path d="M 0 0 l 13 0 l -8 8 l 8 8 l -13 0 z" fill="var(--wt21-colors-cyan)" />
            </svg>
          </div>
          <div ref={this.rightPointerRef}>
            <RightGaugePointer />
          </div>
        </div>
      </div>
    );
  }
}