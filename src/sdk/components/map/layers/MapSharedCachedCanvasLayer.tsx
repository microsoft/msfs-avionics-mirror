import { GeoProjection } from '../../../geo/GeoProjection';
import { ComponentProps, DisplayComponent, FSComponent, VNode } from '../../FSComponent';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapModel } from '../MapModel';
import { MapProjection } from '../MapProjection';
import { MapCachedCanvasLayer, MapCachedCanvasLayerCanvasInstance, MapCachedCanvasLayerReference, MapCachedCanvasLayerTransform } from './MapCachedCanvasLayer';

/**
 * An instance of a shared canvas used by {@link MapSharedCachedCanvasLayer}.
 */
export interface MapSharedCachedCanvasInstance {
  /** This instance's canvas element. */
  readonly canvas: HTMLCanvasElement;

  /** This instance's canvas 2D rendering context. */
  readonly context: CanvasRenderingContext2D;

  /** Whether this canvas has been invalidated. */
  readonly isInvalidated: boolean;

  /** Gets the size (width and height) of this instance's canvas element, in pixels. */
  readonly size: number;

  /**
   * This instance's map projection reference. The rendering of items to this instance's canvas is based on this
   * reference.
   */
  readonly reference: MapCachedCanvasLayerReference;

  /** This instance's transform. */
  readonly transform: MapCachedCanvasLayerTransform;

  /** The projection used to draw this instance's canvas image. */
  readonly geoProjection: GeoProjection;
}

/**
 * Component props for {@link MapSharedCachedCanvasLayer}.
 */
export interface MapSharedCachedCanvasLayerProps<M> extends MapLayerProps<M> {
  /** Whether to include an offscreen buffer. Defaults to `false`. */
  useBuffer?: boolean;

  /** The factor by which the canvas should be overdrawn. Values less than 1 will be clamped to 1. */
  overdrawFactor: number;
}

/**
 * A map layer containing a single canvas whose image can be cached and transformed as the map projection changes and
 * can be shared amongst multiple sublayers for rendering.
 *
 * All of the layer's children are rendered on top of the shared canvas element. All children that extend
 * {@link MapSharedCachedCanvasSubLayer} are treated as sublayers and can render to the shared canvas element.
 */
export class MapSharedCachedCanvasLayer extends MapLayer<MapSharedCachedCanvasLayerProps<any>> {
  private thisNode?: VNode;

  private readonly canvasLayerRef = FSComponent.createRef<MapCachedCanvasLayer>();

  private readonly sublayers: MapSharedCachedCanvasSubLayer<any>[] = [];

  private sharedDisplayCanvasInstance?: MapSharedCachedCanvasInstanceClass;
  private sharedBufferCanvasInstance?: MapSharedCachedCanvasInstanceClass;

  private isInit = false;

  /** @inheritDoc */
  public onVisibilityChanged(isVisible: boolean): void {
    if (!this.isInit) {
      return;
    }

    this.canvasLayerRef.instance.setVisible(isVisible);

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].setVisible(isVisible);
    }
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    // Enumerate sublayers
    FSComponent.visitNodes(thisNode, node => {
      if (node !== thisNode && node.instance instanceof DisplayComponent) {
        if (node.instance instanceof MapSharedCachedCanvasSubLayer) {
          this.sublayers.push(node.instance);
        }

        return true;
      }

      return false;
    });
  }

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();

    this.sharedDisplayCanvasInstance = new MapSharedCachedCanvasInstanceClass(this.canvasLayerRef.instance.display, this.canvasLayerRef.instance);
    if (this.props.useBuffer) {
      this.sharedBufferCanvasInstance = new MapSharedCachedCanvasInstanceClass(this.canvasLayerRef.instance.buffer, this.canvasLayerRef.instance);
    }

    this.isInit = true;

    if (!this.isVisible()) {
      this.onVisibilityChanged(false);
    }

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].attach(this.props.mapProjection, this.sharedDisplayCanvasInstance, this.sharedBufferCanvasInstance);
    }
  }

  /** @inheritDoc */
  public onWake(): void {
    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onWake();
    }
  }

  /** @inheritDoc */
  public onSleep(): void {
    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onSleep();
    }
  }

  /** @inheritDoc */
  public onMapProjectionChanged(projection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(projection, changeFlags);

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onMapProjectionChanged(projection, changeFlags);
    }
  }

  /** @inheritDoc */
  public onUpdated(time: number, elapsed: number): void {
    this.canvasLayerRef.instance.onUpdated(time, elapsed);

    let invalidateDisplay = this.canvasLayerRef.instance.display.isInvalid;
    let invalidateBuffer = this.sharedBufferCanvasInstance ? this.canvasLayerRef.instance.buffer.isInvalid : true;
    for (let i = 0; (!invalidateDisplay || !invalidateBuffer) && i < this.sublayers.length; i++) {
      invalidateBuffer ||= this.sublayers[i].shouldInvalidateBuffer(time, elapsed);
      invalidateDisplay ||= this.sublayers[i].shouldInvalidateDisplay(time, elapsed);
    }

    if (this.sharedBufferCanvasInstance && invalidateBuffer) {
      this.sharedBufferCanvasInstance.invalidate();
      this.sharedBufferCanvasInstance.syncWithMapProjection(this.props.mapProjection);
    }

    if (invalidateDisplay) {
      this.sharedDisplayCanvasInstance!.invalidate();
      this.sharedDisplayCanvasInstance!.syncWithMapProjection(this.props.mapProjection);
    }

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onUpdated(time, elapsed);
    }

    this.sharedDisplayCanvasInstance!.revalidate();
    if (this.sharedBufferCanvasInstance) {
      this.sharedBufferCanvasInstance.revalidate();
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        <MapCachedCanvasLayer
          ref={this.canvasLayerRef}
          model={this.props.model}
          mapProjection={this.props.mapProjection}
          useBuffer={this.props.useBuffer}
          overdrawFactor={this.props.overdrawFactor}
        />
        {this.props.children}
      </>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

/**
 * Component props for MapSharedCanvasSubLayer.
 */
export interface MapSharedCachedCanvasSubLayerProps<M> extends ComponentProps {
  /** A map model. */
  model: MapModel<M>;
}

/**
 * A sublayer of {@link MapSharedCachedCanvasLayer}.
 */
export class MapSharedCachedCanvasSubLayer<P extends MapSharedCachedCanvasSubLayerProps<any>> extends DisplayComponent<P> {
  private _isAttached = false;
  private _isVisible = true;

  private _projection?: MapProjection;
  private _display?: MapSharedCachedCanvasInstance;
  private _buffer?: MapSharedCachedCanvasInstance;

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * This sublayer's map projection.
   * @throws Error if this sublayer is not attached.
   */
  protected get projection(): MapProjection {
    if (this._projection) {
      return this._projection;
    }

    throw new Error('MapSharedCachedCanvasSubLayer: attempted to access projection before sublayer was attached');
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * This sublayer's shared displayed canvas instance.
   * @throws Error if this sublayer is not attached.
   */
  protected get display(): MapSharedCachedCanvasInstance {
    if (this._display) {
      return this._display;
    }

    throw new Error('MapSharedCachedCanvasSubLayer: attempted to access display canvas before sublayer was attached');
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * This sublayer's shared offscreen buffer canvas instance.
   * @throws Error if the buffer does not exist.
   */
  protected get buffer(): MapSharedCachedCanvasInstance {
    if (this._buffer) {
      return this._buffer;
    }

    throw new Error('MapSharedCachedCanvasSubLayer: attempted to access buffer canvas when one does not exist');
  }

  /**
   * Attempts to get this sublayer's shared offscreen buffer canvas instance.
   * @returns This sublayer's shared offscreen buffer canvas instance, or `undefined` if the buffer does not exist.
   */
  protected tryGetBuffer(): MapSharedCachedCanvasInstance | undefined {
    return this._buffer;
  }

  /**
   * Checks whether this sublayer is attached to a parent layer.
   * @returns Whether this sublayer is attached to a parent layer.
   */
  protected isAttached(): boolean {
    return this._isAttached;
  }

  /**
   * Checks whether this sublayer is visible.
   * @returns Whether this sublayer is visible.
   */
  protected isVisible(): boolean {
    return this._isVisible;
  }

  /**
   * Attaches this sublayer to a parent layer.
   * @param projection The map projection used by this sublayer.
   * @param display The displayed canvas instance shared by this sublayer.
   * @param buffer The offscreen buffer canvas instance shared by this sublayer, or `undefined` if there is no buffer.
   */
  public attach(projection: MapProjection, display: MapSharedCachedCanvasInstance, buffer: MapSharedCachedCanvasInstance | undefined): void {
    this._projection = projection;
    this._display = display;
    this._buffer = buffer;

    this._isAttached = true;
    if (!this._isVisible) {
      this.onVisibilityChanged(this._isVisible);
    }
    this.onAttached();
  }

  /**
   * Sets this sublayer's visibility.
   * @param val Whether this sublayer should be visible.
   */
  public setVisible(val: boolean): void {
    if (this._isVisible === val) {
      return;
    }

    this._isVisible = val;
    if (this._isAttached) {
      this.onVisibilityChanged(val);
    }
  }

  /**
   * This method is called when this layer's visibility changes.
   * @param isVisible Whether the layer is now visible.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onVisibilityChanged(isVisible: boolean): void {
    // noop
  }

  /**
   * This method is called when this sublayer is attached to its parent layer.
   */
  public onAttached(): void {
    // noop
  }

  /**
   * This method is called when this sublayer's parent layer is awakened.
   */
  public onWake(): void {
    // noop
  }

  /**
   * This method is called when this sublayer's parent layer is put to sleep.
   */
  public onSleep(): void {
    // noop
  }

  /**
   * This method is called when this sublayer's map projection changes.
   * @param projection This sublayer's map projection.
   * @param changeFlags The types of changes made to the projection.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMapProjectionChanged(projection: MapProjection, changeFlags: number): void {
    // noop
  }

  /**
   * This method is called at the beginning of every update cycle to check whether this sublayer's shared displayed
   * canvas instance should be invalidated. If the canvas is already invalidated, then this method will not be called.
   * @param time The current time as a Javascript timestamp.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   * @returns Whether this sublayer's shared displayed canvas instance should be invalidated.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public shouldInvalidateDisplay(time: number, elapsed: number): boolean {
    return false;
  }

  /**
   * This method is called at the beginning of every update cycle to check whether this sublayer's shared offscreen
   * buffer canvas instance should be invalidated. If the canvas is already invalidated, then this method will not be
   * called.
   * @param time The current time as a Javascript timestamp.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   * @returns Whether this sublayer's shared offscreen buffer canvas instance should be invalidated.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public shouldInvalidateBuffer(time: number, elapsed: number): boolean {
    return false;
  }

  /**
   * This method is called once every update cycle after this sublayer's shared canvas instance has had a chance to be
   * invalidated.
   * @param time The current time as a Javascript timestamp.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdated(time: number, elapsed: number): void {
    // noop
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return null;
  }
}

/**
 * An implementation of {@link MapSharedCachedCanvasInstance} which is backed by a
 * {@link MapCachedCanvasLayerCanvasInstance}.
 */
class MapSharedCachedCanvasInstanceClass implements MapSharedCachedCanvasInstance {
  /** @inheritDoc */
  public readonly canvas = this.instance.canvas;

  /** @inheritDoc */
  readonly context = this.instance.context;

  private _isInvalidated = false;
  /** @inheritDoc */
  public get isInvalidated(): boolean {
    return this._isInvalidated || this.instance.isInvalid;
  }

  /** @inheritDoc */
  public get size(): number {
    return this.layer.getSize();
  }

  /** @inheritDoc */
  public get isTransformInvalidated(): boolean {
    return this.instance.isInvalid;
  }

  /** @inheritDoc */
  public get reference(): MapCachedCanvasLayerReference {
    return this.instance.reference;
  }

  /** @inheritDoc */
  public get transform(): MapCachedCanvasLayerTransform {
    return this.instance.transform;
  }

  /** @inheritDoc */
  public get geoProjection(): GeoProjection {
    return this.instance.geoProjection;
  }

  /**
   * Creates a new instance of MapSharedCachedCanvasInstanceClass.
   * @param instance This instance's backing canvas instance.
   * @param layer The backing canvas instance's parent cached canvas layer.
   */
  public constructor(
    private readonly instance: MapCachedCanvasLayerCanvasInstance,
    private readonly layer: MapCachedCanvasLayer
  ) {
  }

  /**
   * Syncs this canvas instance with the current map projection.
   * @param mapProjection The current map projection.
   */
  public syncWithMapProjection(mapProjection: MapProjection): void {
    this.instance.syncWithMapProjection(mapProjection);
  }

  /**
   * Invalidates and clears this canvas.
   */
  public invalidate(): void {
    this._isInvalidated = true;
    this.instance.invalidate();
  }

  /**
   * Revalidates this canvas.
   */
  public revalidate(): void {
    this._isInvalidated = false;
  }
}