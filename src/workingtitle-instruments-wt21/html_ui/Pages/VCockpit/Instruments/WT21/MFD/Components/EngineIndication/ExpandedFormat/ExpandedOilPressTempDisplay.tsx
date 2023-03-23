import { ComponentProps, DisplayComponent, FSComponent, MathUtils, NodeReference, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';

import './ExpandedOilPressTempDisplay.css';

/**
 * The ExpandedOilPressTempDisplay component.
 */
export class ExpandedOilPressTempDisplay extends DisplayComponent<ComponentProps> {
  private readonly leftOilTempRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightOilTempRef = FSComponent.createRef<HTMLDivElement>();
  private readonly leftOilPsiRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rightOilPsiRef = FSComponent.createRef<HTMLDivElement>();

  private psiCorrection = 70 / 150;
  private tempCorrection = 70 / 160;

  private readonly leftTempValue = Subject.create<number>(0);
  private readonly rightTempValue = Subject.create<number>(0);
  private readonly leftPressureValue = Subject.create<number>(0);
  private readonly rightPressureValue = Subject.create<number>(0);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.leftTempValue.sub((v: number) => this.setOilTempGauge(v, this.leftOilTempRef));
    this.rightTempValue.sub((v: number) => this.setOilTempGauge(v, this.rightOilTempRef));

    this.leftPressureValue.sub((v: number) => this.setOilPsiGauge(v, this.leftOilPsiRef));
    this.rightPressureValue.sub((v: number) => this.setOilPsiGauge(v, this.rightOilPsiRef));
  }

  /**
   * Updates the left Oil Temperature value.
   * @param value The new value.
   */
  public updateOilTempLeft(value: number): void {
    this.leftTempValue.set(UnitType.FAHRENHEIT.convertTo(value, UnitType.CELSIUS));
    this.leftOilTempRef.instance.style.visibility = value < -100 ? 'hidden' : 'visible';
  }

  /**
   * Updates the right Oil Temperature value.
   * @param value The new value.
   */
  public updateOilTempRight(value: number): void {
    this.rightTempValue.set(UnitType.FAHRENHEIT.convertTo(value, UnitType.CELSIUS));
    this.rightOilTempRef.instance.style.visibility = value < -100 ? 'hidden' : 'visible';

  }

  /**
   * Updates the left Oil Pressure value.
   * @param value The new value.
   */
  public updateOilPressureLeft(value: number): void {
    this.leftPressureValue.set(value);
    this.leftOilPsiRef.instance.style.visibility = value < 0 ? 'hidden' : 'visible';
  }

  /**
   * Updates the right Oil Pressure value.
   * @param value The new value.
   */
  public updateOilPressureRight(value: number): void {
    this.rightPressureValue.set(value);
    this.rightOilPsiRef.instance.style.visibility = value < 0 ? 'hidden' : 'visible';
  }

  /**
   * Updates the oil pressure gauge according to the value.
   * @param value The oil pressure value.
   * @param ref The reference to the gauge.
   */
  private setOilPsiGauge(value: number, ref: NodeReference<HTMLDivElement>): void {
    // Gauge range = 0 to 150psi
    //  Total length of gauge is 70 pixels
    const clampedPsi = MathUtils.clamp(value, 0, 150);
    ref.instance.style.transform = `translate3d(0px, ${(150 - clampedPsi) * this.psiCorrection}px, 0px)`;
  }

  /**
   * Updates the oil temperature gauge according to the value.
   * @param value The oil temperature value.
   * @param ref The reference to the gauge.
   */
  private setOilTempGauge(value: number, ref: NodeReference<HTMLDivElement>): void {
    // Gauge range = 0 to 160C
    //  Total length of gauge is 70 pixels
    const clampedTemp = MathUtils.clamp(value, 0, 160);
    ref.instance.style.transform = `translate3d(0px, ${(160 - clampedTemp) * this.tempCorrection}px, 0px)`;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="expanded-oil-press-temp-container">
        <svg height="131" width="180">
          <line x1="0" y1="10" x2="180" y2="10" stroke-width="1px" stroke="var(--wt21-colors-white)"></line>
          <text x="45" y="25" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">OIL PSI</text>
          <text x="135" y="25" fill="var(--wt21-colors-white)" text-anchor="middle" alignment-baseline="middle" font-size="20">OIL °C</text>

          <rect x="22" y="35" height="70" width="6" fill="var(--wt21-colors-red)"></rect>
          <rect x="22" y="43" height="53" width="6" fill="var(--wt21-colors-yellow)"></rect>
          <rect x="22" y="48" height="45" width="6" fill="var(--wt21-colors-green)"></rect>

          <rect x="64" y="35" height="70" width="6" fill="var(--wt21-colors-red)"></rect>
          <rect x="64" y="43" height="53" width="6" fill="var(--wt21-colors-yellow)"></rect>
          <rect x="64" y="48" height="45" width="6" fill="var(--wt21-colors-green)"></rect>


          <rect x="115" y="35" height="70" width="6" fill="var(--wt21-colors-red)"></rect>
          <rect x="115" y="39" height="62" width="6" fill="var(--wt21-colors-yellow)"></rect>
          <rect x="115" y="45" height="40" width="6" fill="var(--wt21-colors-green)"></rect>

          <rect x="155" y="35" height="70" width="6" fill="var(--wt21-colors-red)"></rect>
          <rect x="155" y="39" height="62" width="6" fill="var(--wt21-colors-yellow)"></rect>
          <rect x="155" y="45" height="40" width="6" fill="var(--wt21-colors-green)"></rect>

          {/* <text x="30" y="119" fill="var(--wt21-colors-green)" text-anchor="middle" alignment-baseline="middle" font-size="22">1</text>
          <text x="79" y="119" fill="var(--wt21-colors-green)" text-anchor="middle" alignment-baseline="middle" font-size="22">1</text>
          <text x="115" y="119" fill="var(--wt21-colors-green)" text-anchor="middle" alignment-baseline="middle" font-size="22">17</text>
          <text x="166" y="119" fill="var(--wt21-colors-green)" text-anchor="middle" alignment-baseline="middle" font-size="22">17</text> */}
          <line x1="90" y1="22" x2="90" y2="120" stroke-width="1px" stroke="var(--wt21-colors-white)"></line>
          <line x1="0" y1="130" x2="180" y2="130" stroke-width="1px" stroke="var(--wt21-colors-white)"></line>
        </svg>
        <div class="left-oil-psi-pointer" ref={this.leftOilPsiRef}>
          <svg height="10" width="15">
            <path d="M 0 0 l 0 10 l 15 -5 l -15 -5" fill="var(--wt21-colors-green)" />
          </svg>
        </div>
        <div class="right-oil-psi-pointer" ref={this.rightOilPsiRef}>
          <svg height="10" width="15">
            <path d="M 0 5 l 15 -5 l 0 10 l -15 -5" fill="var(--wt21-colors-green)" />
          </svg>
        </div>
        <div class="left-oil-temp-pointer" ref={this.leftOilTempRef}>
          <svg height="10" width="15">
            <path d="M 0 0 l 0 10 l 15 -5 l -15 -5" fill="var(--wt21-colors-green)" />
          </svg>
        </div>
        <div class="right-oil-temp-pointer" ref={this.rightOilTempRef}>
          <svg height="10" width="15">
            <path d="M 0 5 l 15 -5 l 0 10 l -15 -5" fill="var(--wt21-colors-green)" />
          </svg>
        </div>
      </div>
    );
  }
}