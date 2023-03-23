import { AffineTransformPathStream, ComponentProps, DisplayComponent, FSComponent, MathUtils, ObjectSubject, Subject, SvgPathStream, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for TurnRateIndicator.
 */
export interface TurnRateProps extends ComponentProps {
  /** The radius of the HSI compass, in pixels. */
  compassRadius: number;
}

/**
 * A turn rate indicator for a next-generation (NXi, G3000, etc) HSI.
 *
 * The turn rate indicator is rendered such that it sits on the top edge of an HSI compass. The indicator spans 24
 * degrees of arc on either side of the lubber line and is 24 pixels tall. Markings are present at 9 and 18 degrees
 * on either side of the lubber line. A turn rate vector is extended along an arc parallel to the compass edge
 * subtending an angle equal to the estimated change in heading over the next 6 seconds. If turn rate exceeds 4
 * degrees per second, the vector is clamped to 24 degrees of arc and an arrowhead is added to the end.
 *
 * The turn rate indicator's root element should be positioned such that its bottom edge intersects the center of the
 * HSI compass, and its left edge sits flush with the left edge of the HSI compass (the width of the root element is
 * equal to the diameter of the compass).
 */
export class TurnRateIndicator extends DisplayComponent<TurnRateProps> {
  private static readonly HALF_ANGULAR_WIDTH = 24; // degrees
  private static readonly HEIGHT = 24; // px
  private static readonly TICK_OFFSET = 3; // px
  private static readonly TICK_LENGTH = 15; // px
  private static readonly VECTOR_OFFSET = 1; // px
  private static readonly VECTOR_WIDTH = 6; // px
  private static readonly ARROW_WIDTH = 12; // px
  private static readonly ARROW_LENGTH = 12; // px

  private readonly clipStyle = ObjectSubject.create({
    position: 'absolute',
    left: '50%',
    top: '0px',
    width: '50%',
    height: '100%',
    overflow: 'hidden',
    transform: 'scaleX(1) rotateX(0deg)',
    'transform-origin': '0% 50%'
  });

  private readonly rotateStyle = ObjectSubject.create({
    position: 'absolute',
    right: '0px',
    top: '0px',
    width: '200%',
    height: '100%',
    transform: 'rotate3d(0, 0, 1, 0deg)',
    'transform-origin': '50% 100%'
  });

  private noArrowVectorPath = '';
  private arrowVectorPath = '';
  private readonly vectorPath = Subject.create('');

  private readonly vectorRotate = Subject.create(0);
  private readonly vectorRotateSign = this.vectorRotate.map(rotate => rotate < 0 ? -1 : 1);
  private readonly vectorRotateMag = this.vectorRotate.map(Math.abs);

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.vectorRotateSign.sub(sign => {
      this.clipStyle.set('transform', `scaleX(${sign}) rotateX(0deg)`);
    }, true);

    this.vectorRotateMag.sub(rotate => {
      this.rotateStyle.set('transform', `rotate3d(0, 0, 1, ${rotate}deg)`);
    }, true);
  }

  /**
   * Sets this indicator's displayed turn rate.
   * @param turnRate The turn rate, in degrees per second. Positive values indicate a right-hand turn.
   */
  public setTurnRate(turnRate: number): void {
    this.vectorPath.set(Math.abs(turnRate) > 4 ? this.arrowVectorPath : this.noArrowVectorPath);
    this.vectorRotate.set(MathUtils.clamp(MathUtils.round(turnRate * 6, 0.1), -24, 24));
  }

  /** @inheritdoc */
  public override render(): VNode {
    const svgPathStream = new SvgPathStream(0.1);
    const transformStream = new AffineTransformPathStream(svgPathStream);

    const compassRadius = this.props.compassRadius;

    // ---- Build border ----

    const innerRadius = compassRadius;
    const outerRadius = compassRadius + TurnRateIndicator.HEIGHT;

    transformStream.beginPath();
    transformStream.resetTransform();

    transformStream.addRotation(-MathUtils.HALF_PI - TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(innerRadius, 0);
    transformStream.lineTo(outerRadius, 0);
    transformStream.arc(0, 0, outerRadius, 0, 2 * TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);

    transformStream.addRotation(2 * TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);
    transformStream.lineTo(innerRadius, 0);
    transformStream.arc(0, 0, innerRadius, 0, -2 * TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD, true);

    const borderPath = svgPathStream.getSvgPath();

    // ---- Build ticks ----

    const tickStart = compassRadius + TurnRateIndicator.TICK_OFFSET;
    const tickEnd = tickStart + TurnRateIndicator.TICK_LENGTH;

    transformStream.beginPath();
    transformStream.resetTransform();

    // -18 degrees
    transformStream.addRotation(-MathUtils.HALF_PI - 18 * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(tickStart, 0);
    transformStream.lineTo(tickEnd, 0);

    // -9 degrees
    transformStream.addRotation(9 * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(tickStart, 0);
    transformStream.lineTo(tickEnd, 0);

    // +9 degrees
    transformStream.addRotation(18 * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(tickStart, 0);
    transformStream.lineTo(tickEnd, 0);

    // +18 degrees
    transformStream.addRotation(9 * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(tickStart, 0);
    transformStream.lineTo(tickEnd, 0);

    const ticksPath = svgPathStream.getSvgPath();

    // ---- Build no-arrow vector ----

    const vectorInnerRadius = compassRadius + TurnRateIndicator.VECTOR_OFFSET;
    const vectorOuterRadius = innerRadius + TurnRateIndicator.VECTOR_WIDTH;

    transformStream.beginPath();
    transformStream.resetTransform();

    transformStream.addRotation(-MathUtils.HALF_PI - TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(vectorInnerRadius, 0);
    transformStream.lineTo(vectorOuterRadius, 0);
    transformStream.arc(0, 0, vectorOuterRadius, 0, TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);

    transformStream.addRotation(TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);
    transformStream.lineTo(vectorInnerRadius, 0);
    transformStream.arc(0, 0, vectorInnerRadius, 0, -TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD, true);

    this.noArrowVectorPath = svgPathStream.getSvgPath();

    // ---- Build arrow vector ----

    const vectorCenter = (vectorInnerRadius + vectorOuterRadius) / 2;

    transformStream.beginPath();
    transformStream.resetTransform();

    transformStream.addRotation(-MathUtils.HALF_PI - TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);
    transformStream.moveTo(vectorInnerRadius, 0);
    transformStream.lineTo(vectorOuterRadius, 0);
    transformStream.arc(0, 0, vectorOuterRadius, 0, TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);

    transformStream.addRotation(TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD);
    transformStream.lineTo(vectorCenter + TurnRateIndicator.ARROW_WIDTH / 2, 0);

    transformStream.addRotation(TurnRateIndicator.ARROW_LENGTH / vectorCenter);
    transformStream.lineTo(vectorCenter, 0);

    transformStream.addRotation(-TurnRateIndicator.ARROW_LENGTH / vectorCenter);
    transformStream.lineTo(vectorCenter - TurnRateIndicator.ARROW_WIDTH / 2, 0);
    transformStream.lineTo(vectorInnerRadius, 0);
    transformStream.arc(0, 0, vectorInnerRadius, 0, -TurnRateIndicator.HALF_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD, true);

    this.arrowVectorPath = svgPathStream.getSvgPath();

    const viewBox = `${-compassRadius} ${-outerRadius} ${2 * compassRadius} ${outerRadius}`;

    return (
      <div class="hsi-turn-rate-indicator" style={`width: ${compassRadius * 2}px; height: ${outerRadius}px`}>
        <svg viewBox={viewBox} class="hsi-turn-rate-indicator-background" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;">
          <path d={borderPath} class="hsi-turn-rate-indicator-border" />
          <path d={ticksPath} class="hsi-turn-rate-indicator-ticks" />
        </svg>
        <div class="hsi-turn-rate-indicator-dynamic-clip" style={this.clipStyle}>
          <svg viewBox={viewBox} class="hsi-turn-rate-indicator-dynamic" style={this.rotateStyle}>
            <path d={this.vectorPath} class="hsi-turn-rate-indicator-vector" />
          </svg>
        </div>
      </div>
    );
  }
}