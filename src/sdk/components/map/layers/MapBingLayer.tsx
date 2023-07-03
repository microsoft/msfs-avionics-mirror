/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/types" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import { CssTransformBuilder } from '../../../graphics/css/CssTransform';
import { BitFlags, ReadonlyFloat64Array, UnitType, Vec2Math, Vec2Subject } from '../../../math';
import { ObjectSubject } from '../../../sub/ObjectSubject';
import { Subscribable } from '../../../sub/Subscribable';
import { SubscribableArray } from '../../../sub/SubscribableArray';
import { BingComponent, WxrMode } from '../../bing';
import { FSComponent, VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection, MapProjectionChangeType } from '../MapProjection';

/**
 * Component props for the MapComponent.
 */
export interface MapBingLayerProps<M> extends MapLayerProps<M> {
  /** The unique ID to assign to this Bing map. */
  bingId: string;

  /**
   * The earth colors for the layer's Bing component. Index 0 defines the water color, and indexes 1 to the end of the
   * array define the terrain colors. Each color should be expressed as `R + G * 256 + B * 256^2`. If not defined, all
   * colors default to black.
   */
  earthColors: SubscribableArray<number>;

  /**
   * The elevation range over which to assign the earth terrain colors, as `[minimum, maximum]` in feet. The terrain
   * colors are assigned at regular intervals over the entire elevation range, starting with the first terrain color at
   * the minimum elevation and ending with the last terrain color at the maximum elevation. Terrain below and above the
   * minimum and maximum elevation are assigned the first and last terrain colors, respectively. Defaults to
   * `[0, 30000]`.
   */
  earthColorsElevationRange?: Subscribable<ReadonlyFloat64Array>;

  /**
   * A subscribable which provides the reference mode for the layer's Bing component.
   */
  reference: Subscribable<EBingReference>;

  /**
   * A subscribable which provides the weather radar mode for the layer's Bing component.
   */
  wxrMode?: Subscribable<WxrMode>;

  /**
   * The weather radar colors for the layer's Bing component. Each entry `E_i` of the array is a tuple `[color, rate]`
   * that defines a color stop, where `color` is an RGBA color expressed as `R + G * 256 + B * 256^2 + A * 256^3` and
   * `rate` is a precipitation rate in millimeters per hour.
   *
   * In general, the color defined by `E_i` is applied to precipitation rates ranging from the rate defined by `E_i-1`
   * to the rate defined by `E_i`. There are two special cases. The color defined by `E_0` is applied to the
   * precipitation rates from zero to the rate defined by `E_0`. The color defined by `E_n-1`, where `n` is the length
   * of the array, is applied to the precipitation rates from the rate defined by `E_n-2` to positive infinity.
   *
   * If not defined, the colors default to {@link BingComponent.DEFAULT_WEATHER_COLORS}.
   */
  wxrColors?: SubscribableArray<readonly [number, number]>;

  /**
   * A subscribable which provides whether or not the map isolines are visible.
   */
  isoLines?: Subscribable<boolean>;

  /**
   * How long to delay binding the map in milliseconds. Defaults to zero milliseconds.
   */
  delay?: number;

  /** The mode to put the map in. Defaults to {@link EBingMode.PLANE}. */
  mode?: EBingMode;

  /** The opacity of Map Bing Layer as set by pilot. Default to 1. */
  opacity?: Subscribable<number>;
}

/**
 * A FSComponent that display the MSFS Bing Map, weather radar, and 3D terrain.
 */
export class MapBingLayer<M = any> extends MapLayer<MapBingLayerProps<M>> {
  private readonly bingRef = FSComponent.createRef<BingComponent>();

  private readonly wrapperStyle = ObjectSubject.create({
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px',
    'display': '',
    'transform': '',
    'opacity': '',
  });

  private readonly resolution = Vec2Subject.create(Vec2Math.create(1024, 1024));

  private readonly rotationTransform = CssTransformBuilder.rotate('rad');

  /** The length of this layer's diagonal, in pixels. */
  private size = 0;

  private needUpdate = false;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.wrapperStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.updateFromProjectedSize(this.props.mapProjection.getProjectedSize());

    this.props.opacity?.sub((v: number) => {
      this.wrapperStyle.set('opacity', v.toString());
    }, true);

    if (this.props.wxrMode !== undefined) {
      this.props.wxrMode.sub(() => {
        this.updateFromProjectedSize(this.props.mapProjection.getProjectedSize());
        this.needUpdate = true;
      });
    }
  }

  /** @inheritdoc */
  public onWake(): void {
    this.bingRef.instance.wake();
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.bingRef.instance.sleep();
  }

  /**
   * Updates this layer according to the current size of the projected map window.
   * @param projectedSize The size of the projected map window.
   */
  private updateFromProjectedSize(projectedSize: ReadonlyFloat64Array): void {
    let offsetX: number, offsetY: number;

    if (this.props.wxrMode && this.props.wxrMode.get().mode === EWeatherRadar.HORIZONTAL) {
      const offsetSize = new Float64Array([projectedSize[0], projectedSize[1]]);
      const offset = this.props.mapProjection.getTargetProjectedOffset();

      offsetSize[0] += offset[0];
      offsetSize[1] += offset[1];
      this.size = this.getSize(offsetSize);

      offsetX = ((projectedSize[0] - this.size) / 2) + offset[0];
      offsetY = ((projectedSize[1] - this.size) / 2) + offset[1];
    } else {
      this.size = this.getSize(projectedSize);

      offsetX = (projectedSize[0] - this.size) / 2;
      offsetY = (projectedSize[1] - this.size) / 2;
    }

    this.wrapperStyle.set('left', `${offsetX}px`);
    this.wrapperStyle.set('top', `${offsetY}px`);
    this.wrapperStyle.set('width', `${this.size}px`);
    this.wrapperStyle.set('height', `${this.size}px`);

    this.resolution.set(this.size, this.size);
  }

  /**
   * Gets an appropriate size, in pixels, for this Bing layer given specific map projection window dimensions.
   * We get the length of the hypotenuse so that the map edges won't show when rotating.
   * @param projectedSize - the size of the projected map window.
   * @returns an appropriate size for this Bing layer.
   */
  private getSize(projectedSize: ReadonlyFloat64Array): number {
    return Vec2Math.abs(projectedSize);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.ProjectedSize | MapProjectionChangeType.TargetProjected)) {
      this.updateFromProjectedSize(mapProjection.getProjectedSize());
    }

    if (this.bingRef.instance.isBound()) {
      this.needUpdate = true;
    }
  }

  /**
   * A callback which is called when the Bing component is bound.
   */
  private onBingBound(): void {
    this.needUpdate = true;
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdated(time: number, elapsed: number): void {
    if (!this.needUpdate) {
      return;
    }

    this.updatePositionRadius();

    this.needUpdate = false;
  }

  /**
   * Resets the underlying Bing component's img src attribute.
   */
  public resetImgSrc(): void {
    this.bingRef.instance.resetImgSrc();
  }

  /**
   * Updates the Bing map center position and radius.
   */
  protected updatePositionRadius(): void {
    const center = this.props.mapProjection.getCenter();
    const radius = this.calculateDesiredRadius(this.props.mapProjection);
    this.bingRef.instance.setPositionRadius(new LatLong(center.lat, center.lon), radius);

    if (!this.props.wxrMode || (this.props.wxrMode && this.props.wxrMode.get().mode !== EWeatherRadar.HORIZONTAL)) {
      this.rotationTransform.set(this.props.mapProjection.getRotation(), 1e-3);
    } else {
      this.rotationTransform.set(0);
    }

    this.wrapperStyle.set('transform', this.rotationTransform.resolve());
  }

  /**
   * Gets the desired Bing map radius in meters given a map projection model.
   * @param mapProjection - a map projection model.
   * @returns the desired Bing map radius.
   */
  private calculateDesiredRadius(mapProjection: MapProjection): number {
    const scaleFactor = mapProjection.getScaleFactor();
    const pointScaleFactor = 1 / Math.cos(mapProjection.getCenter().lat * Avionics.Utils.DEG2RAD);
    const radiusGARad = this.size / (2 * scaleFactor * pointScaleFactor);
    return UnitType.GA_RADIAN.convertTo(radiusGARad, UnitType.METER) as number;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.wrapperStyle} class={this.props.class ?? ''}>
        <BingComponent
          ref={this.bingRef} id={this.props.bingId}
          onBoundCallback={this.onBingBound.bind(this)}
          resolution={this.resolution}
          mode={this.props.mode ?? EBingMode.PLANE}
          earthColors={this.props.earthColors}
          earthColorsElevationRange={this.props.earthColorsElevationRange}
          reference={this.props.reference}
          wxrMode={this.props.wxrMode}
          wxrColors={this.props.wxrColors}
          isoLines={this.props.isoLines}
          delay={this.props.delay}
        />
      </div>
    );
  }
}
