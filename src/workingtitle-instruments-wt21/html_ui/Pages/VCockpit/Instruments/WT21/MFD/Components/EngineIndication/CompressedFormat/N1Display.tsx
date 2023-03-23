import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { LeftGaugePointer } from '../DisplayComponents/LeftGaugePointer';
import { RightGaugePointer } from '../DisplayComponents/RightGaugePointer';

import './N1Display.css';

/**
 * The N1Display component.
 */
export class N1Display extends DisplayComponent<ComponentProps> {

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
   * Updates the left N1 value.
   * @param n1Value The left N1 value.
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
   * Updates the pointer according to the N1 value.
   * @param value The N1 value.
   * @param pointerRef The pointer reference.
   */
  private updatePointer(value: number, pointerRef: NodeReference<HTMLDivElement>): void {
    if (pointerRef.instance !== null) {
      //Correction is for non-linear gauge markings
      //FOR 100 to 60: 90px for every 50 increments = 1.8
      //FOR 60 to 20: 36px per 40 increments = 0.9
      //Top is 0px, bottom is 132px, 60 is 90px
      const clampedN1 = MathUtils.clamp(value, 15, 110);
      const correction = clampedN1 >= 60 ? 1.8 : 0.9;

      if (value >= 60) {
        pointerRef.instance.style.transform = `translate3d(0px, ${(110 - clampedN1) * correction}px, 0px)`;
      } else {
        pointerRef.instance.style.transform = `translate3d(0px, ${90 + ((60 - clampedN1) * correction)}px, 0px)`;
      }
    }
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
      <div class="n1-compressed-display-container" data-checklist="N1">
        <svg height="200px" width="170px">
          <line x1="20" y1="10" x2="43" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="10" x2="123" y2="10" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="28" x2="43" y2="28" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="28" x2="123" y2="28" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="46" x2="35" y2="46" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="46" x2="131" y2="46" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="64" x2="43" y2="64" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="64" x2="123" y2="64" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="82" x2="35" y2="82" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="82" x2="131" y2="82" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="100" x2="43" y2="100" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="100" x2="123" y2="100" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="118" x2="43" y2="118" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="118" x2="123" y2="118" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="136" x2="43" y2="136" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="136" x2="123" y2="136" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="20" y1="10" x2="20" y2="142" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="146" y1="10" x2="146" y2="142" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="5" y1="142" x2="161" y2="142" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="83" y1="142" x2="83" y2="172" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="5" y1="172" x2="161" y2="172" stroke="var(--wt21-colors-white)" stroke-width="1px"></line>
          <line x1="18" y1="17" x2="39" y2="17" stroke="var(--wt21-colors-red)" stroke-width="2px" ref={this.leftMaxFlagRef}></line>
          <line x1="148" y1="17" x2="127" y2="17" stroke="var(--wt21-colors-red)" stroke-width="2px" ref={this.rightMaxFlagRef}></line>
          <text x="83" y="28" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">100</text>
          <text x="83" y="64" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">80</text>
          <text x="83" y="100" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">60</text>
          <text x="83" y="136" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">20</text>
          <text x="83" y="16" fill="var(--wt21-colors-white)" text-anchor="middle" font-size="20">N1 %</text>
          <text x="58" y="50" style="writing-mode: tb; glyph-orientation-vertical: 0;" fill={this.leftFadecModeColor} font-size="20">{this.leftFadecModeText}</text>
          <text x="107" y="50" style="writing-mode: tb; glyph-orientation-vertical: 0;" fill={this.rightFadecModeColor} font-size="20">{this.rightFadecModeText}</text>
          <text x="74" y="167" fill={this.n1LeftValueColor} text-anchor="end" font-size="28">{this.n1LeftValue}</text>
          <text x="102" y="167" fill={this.n1RightValueColor} text-anchor="start" font-size="28">{this.n1RightValue}</text>
        </svg>
        <div class="left-n1-compressed-pointer-mask">
          <div class="left-n1-compressed-bug" ref={this.leftBugRef}>
            <svg height="16" width="13">
              <path d="M 0 0 l 13 0 l 0 16 l -13 0 l 8 -8 z" fill="var(--wt21-colors-cyan)" />
            </svg>
          </div>
          <div ref={this.leftPointerRef}>
            <LeftGaugePointer />
          </div>
        </div>
        <div class="right-n1-compressed-pointer-mask">
          <div class="right-n1-compressed-bug" ref={this.rightBugRef}>
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