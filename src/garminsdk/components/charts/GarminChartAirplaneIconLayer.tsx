import {
  Accessible, AccessibleUtils, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent,
  LatLonInterface, MutableSubscribable, ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils, Subscription,
  Vec2Math, VNode
} from '@microsoft/msfs-sdk';

import { GarminChartDisplayLayer } from './GarminChartDisplayLayer';
import { GarminChartDisplayProjection } from './GarminChartDisplayProjection';

/**
 * Bitflags describing the status of a Garmin terminal (airport) chart display airplane icon.
 */
export enum GarminChartAirplaneIconStatus {
  /** The icon is visible. */
  Visible = 1 << 0,

  /** The icon cannot be displayed due to lack of airplane data. */
  NoData = 1 << 1,

  /** The icon cannot be displayed due to an invalid projection. */
  NoProjection = 1 << 2,

  /** The icon cannot be displayed because the airplane is outside the geo-referenced area. */
  OutOfBounds = 1 << 3,
}

/**
 * Component props for {@link GarminChartAirplaneIconLayer}.
 */
export interface GarminChartAirplaneIconLayerProps {
  /** The airplane's position. */
  planePosition: Accessible<Readonly<LatLonInterface>>;

  /** The airplane's true heading, in degrees. */
  planeHeading: Accessible<number>;

  /** The absolute path to the airplane icon's image asset. */
  imgSrc: string | Subscribable<string>;

  /**
   * The anchor point of the airplane icon, as `[x, y]` in relative units, where `[0, 0]` is the top-left corner of the
   * icon, and `[1, 1]` is the bottom-right corner. The anchor point is always positioned at the projected coordinates
   * of the airplane.
   */
  iconAnchor: ReadonlyFloat64Array | Accessible<ReadonlyFloat64Array>;

  /** A mutable subscribable to which to write the airplane icon's status. */
  status?: MutableSubscribable<any, number>;
}

/**
 * A Garmin terminal (airport) chart display layer that renders an airplane icon. The airplane icon is positioned in
 * the display using geo-referencing data. If there is no geo-referencing data available, or the airplane's position
 * falls outside the geo-referenced area, then the icon is hidden.
 */
export class GarminChartAirplaneIconLayer
  extends DisplayComponent<GarminChartAirplaneIconLayerProps>
  implements GarminChartDisplayLayer {

  /** @inheritDoc */
  public readonly isTerminalChartDisplayLayer = true;

  private readonly vec2Cache = [Vec2Math.create()];

  private readonly imgSrc = Subject.create('');
  private readonly iconDisplay = Subject.create('');

  private readonly iconAnchor = AccessibleUtils.toAccessible(this.props.iconAnchor, true);

  private readonly iconCssTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate('rad'),
    CssTransformBuilder.translate('%'),
  ));
  private readonly iconAnchorCssTransform = this.iconCssTransform.transform.getChild(2);
  private readonly iconTranslateCssTransform = this.iconCssTransform.transform.getChild(0);
  private readonly iconRotateCssTransform = this.iconCssTransform.transform.getChild(1);

  private needUpdateImgSrc = false;

  private imgSrcSub?: Subscription;

  /** @inheritDoc */
  public onAttached(): void {
    if (SubscribableUtils.isSubscribable(this.props.imgSrc)) {
      this.imgSrcSub = this.props.imgSrc.sub(() => { this.needUpdateImgSrc = true; }, true);
    } else {
      this.imgSrc.set(this.props.imgSrc);
    }
  }

  /** @inheritDoc */
  public onProjectionChanged(): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdate(time: number, projection: GarminChartDisplayProjection): void {
    if (this.needUpdateImgSrc) {
      this.imgSrc.set((this.props.imgSrc as Subscribable<string>).get());
    }

    this.updateIconPosition(projection);
  }

  /**
   * Updates the position of this layer's icon.
   * @param projection The projection of this layer's parent display.
   */
  private updateIconPosition(projection: GarminChartDisplayProjection): void {
    const planePosition = this.props.planePosition.get();
    const planeHeading = this.props.planeHeading.get();

    const hasData = isFinite(planePosition.lat)
      && isFinite(planePosition.lon)
      && isFinite(planeHeading);
    const hasProjection = projection.isValid() && projection.isGeoReferenced();

    let isInBounds = true;
    let isDisplayed = false;

    if (hasData && hasProjection) {
      const projected = projection.convertGeoToDisplay(planePosition, this.vec2Cache[0]);
      isInBounds = Vec2Math.isFinite(projected);

      if (isInBounds) {
        const anchor = this.iconAnchor.get();
        this.iconAnchorCssTransform.set(-anchor[0] * 100, -anchor[1] * 100, 0.1, 0.1);

        this.iconTranslateCssTransform.set(projected[0], projected[1], 0, 0.1, 0.1);

        const rotation = planeHeading * Avionics.Utils.DEG2RAD
          + projection.getGeoReferenceRotation()
          + projection.getChartRotation();
        this.iconRotateCssTransform.set(rotation, 1e-4);

        this.iconCssTransform.resolve();

        this.iconDisplay.set('block');

        isDisplayed = true;
      } else {
        this.iconDisplay.set('none');
      }
    } else {
      this.iconDisplay.set('none');
    }

    if (this.props.status) {
      let status = 0;
      if (!hasData) {
        status |= GarminChartAirplaneIconStatus.NoData;
      }
      if (!hasProjection) {
        status |= GarminChartAirplaneIconStatus.NoProjection;
      }
      if (!hasData) {
        status |= GarminChartAirplaneIconStatus.NoData;
      }
      if (!isInBounds) {
        status |= GarminChartAirplaneIconStatus.OutOfBounds;
      }
      if (isDisplayed) {
        status |= GarminChartAirplaneIconStatus.Visible;
      }

      this.props.status.set(status);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <img
        src={this.imgSrc}
        style={{
          'display': this.iconDisplay,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': this.iconCssTransform,
          'transform-origin': '0% 0%'
        }}
        class='terminal-chart-display-airplane-icon'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.imgSrcSub?.destroy();

    super.destroy();
  }
}
