import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MathUtils, Subject, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import './SpeedVector.css';

/** The speed vector props. */
interface SpeedTrendProps extends ComponentProps {
  /**
   * The difference between the current calibrated airspeed and that predicted in 6 seconds
   * at the current rate of acceleration, in knots.
   */
  casTrendDiff: Subscribable<number | null>;

  /** Scale in pixels per knot. */
  scale: number;

  /** Half the total tape height in pixels. */
  halfHeight: number;
}


/** The speed vector component. */
export class SpeedVector extends DisplayComponent<SpeedTrendProps> {
  private static readonly CAP_HEIGHT_PX = 6;
  private readonly trendVectorMagnitude = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));
  private readonly capPosition = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));
  private readonly trendVectorDirection = CssTransformSubject.create(CssTransformBuilder.scaleY());
  private readonly isHidden = Subject.create(true);

  /**
   * Responds to when the casTrendDiff changes.
   * @param trend The new casTrendDiff, in knots.
   */
  private onTrendChanged(trend: number | null): void {
    if (trend && Math.abs(trend) > 1) {
      this.isHidden.set(false);

      this.trendVectorDirection.transform.set(trend < 0 ? -1 : 1);
      this.trendVectorDirection.resolve();

      this.trendVectorMagnitude.transform.set(0, -Math.min(Math.abs(trend * this.props.scale), this.props.halfHeight), 0, undefined, 0.1);
      this.trendVectorMagnitude.resolve();

      const capDistanceFromCenter = -MathUtils.clamp(trend * this.props.scale, -this.props.halfHeight, this.props.halfHeight);
      this.capPosition.transform.set(0,
        capDistanceFromCenter > 0 ? capDistanceFromCenter - SpeedVector.CAP_HEIGHT_PX : capDistanceFromCenter,
        0, undefined, 0.1);
      this.capPosition.resolve();
    } else {
      this.isHidden.set(true);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.casTrendDiff.sub(this.onTrendChanged.bind(this));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (<>
      <div class={{
        'airspeed-trend-vector': true,
        'hidden': this.isHidden,
      }}
        style={{ 'transform': this.trendVectorDirection }}>
        <div
          class="airspeed-trend-vector-line"
          style={{
            'transform': this.trendVectorMagnitude,
          }}
        />
      </div>
      <div
        class={{
          'airspeed-trend-vector-cap': true,
          'hidden': this.isHidden,
        }}
        style={{
          'transform': this.capPosition,
        }}
      /></>
    );
  }
}
