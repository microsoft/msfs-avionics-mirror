import { MapProjection } from '../MapProjection';
import { MapSharedCanvasInstance, MapSharedCanvasSubLayer, MapSharedCanvasSubLayerProps } from './MapSharedCanvasLayer';

/**
 * Component props for GenericMapSharedCanvasSubLayer.
 */
export interface GenericMapSharedCanvasSubLayerProps<M> extends MapSharedCanvasSubLayerProps<M> {
  /** A function which will be called when the sublayer's visibility changes. */
  onVisibilityChanged?: (isVisible: boolean) => void;

  /** A function which will be called when the sublayer is attached to its parent layer. */
  onAttached?: (projection: MapProjection, display: MapSharedCanvasInstance) => void;

  /** A function which will be called when the sublayer is awakened. */
  onWake?: (projection: MapProjection, display: MapSharedCanvasInstance) => void;

  /** A function which will be called when the sublayer is put to sleep. */
  onSleep?: (projection: MapProjection, display: MapSharedCanvasInstance) => void;

  /**
   * A function which will be called at the beginning of every update cycle to check whether the sublayer's shared
   * canvas instance should be invalidated. If the canvas is already invalidated, then this function will not be
   * called.
   */
  shouldInvalidate?: (projection: MapProjection, display: MapSharedCanvasInstance, time: number, elapsed: number) => boolean;

  /**
   * A function which will be called once every update cycle after the sublayer's shared canvas instance has had a
   * chance to be invalidated.
   */
  onUpdated?: (projection: MapProjection, display: MapSharedCanvasInstance, time: number, elapsed: number) => void;

  /** A function which will be called when the sublayer is destroyed. */
  onDestroyed?: () => void;
}

/**
 * A generic implementation of {@link MapSharedCanvasSubLayer} that delegates behavior to props.
 */
export class GenericMapSharedCanvasSubLayer<P extends GenericMapSharedCanvasSubLayerProps<any>> extends MapSharedCanvasSubLayer<P> {
  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.props.onVisibilityChanged && this.props.onVisibilityChanged(isVisible);
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.props.onAttached && this.props.onAttached(this.projection, this.display);
  }

  /** @inheritdoc */
  public onWake(): void {
    this.props.onWake && this.props.onWake(this.projection, this.display);
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.props.onSleep && this.props.onSleep(this.projection, this.display);
  }

  /** @inheritdoc */
  public shouldInvalidate(time: number, elapsed: number): boolean {
    return this.props.shouldInvalidate ? this.props.shouldInvalidate(this.projection, this.display, time, elapsed) : false;
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    this.props.onUpdated && this.props.onUpdated(this.projection, this.display, time, elapsed);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroyed && this.props.onDestroyed();

    super.destroy();
  }
}