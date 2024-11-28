import { ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './AltitudeTrendVector.css';

/** AltitudeTrendVector props */
interface AltitudeTrendProps extends ComponentProps {
  /** The current altitude trend, predicted for 6 seconds into the future, in feet, or null when invalid. */
  altitudeTrend: Subscribable<number | null>;

  /** Half the total tape height in pixels. */
  halfHeight: number;

  /** Scale in pixels per foot. */
  scale: number;
}

/** Displays the altitude trend vector. */
export class AltitudeTrendVector extends DisplayComponent<AltitudeTrendProps> {
  private readonly trendVectorMagnitude = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));
  private readonly trendVectorDirection = CssTransformSubject.create(CssTransformBuilder.scaleY());
  private readonly isHidden = Subject.create(true);

  /**
   * Responds to when the altitude trend changes.
   * @param trend The new altitude trend, in feet.
   */
  private onTrendChanged(trend: number | null): void {
    if (trend && Math.abs(trend) > 1) {
      this.isHidden.set(false);

      this.trendVectorDirection.transform.set(trend < 0 ? -1 : 1);
      this.trendVectorDirection.resolve();

      this.trendVectorMagnitude.transform.set(0, -Math.min(Math.abs(trend * this.props.scale), this.props.halfHeight), 0, undefined, 0.1);
      this.trendVectorMagnitude.resolve();

    } else {
      this.isHidden.set(true);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.altitudeTrend.sub(this.onTrendChanged.bind(this));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'altitude-trend-vector': true,
          'hidden': this.isHidden,
        }}
        style={{ 'transform': this.trendVectorDirection, }}>
        <div class="altitude-trend-vector-line" style={{ 'transform': this.trendVectorMagnitude }} />
      </div >
    );
  }
}
