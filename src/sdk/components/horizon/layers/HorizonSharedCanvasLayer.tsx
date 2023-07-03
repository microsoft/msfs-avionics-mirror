/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { BitFlags } from '../../../math/BitFlags';
import { ComponentProps, DisplayComponent, FSComponent, VNode } from '../../FSComponent';
import { HorizonLayer } from '../HorizonLayer';
import { HorizonProjection, HorizonProjectionChangeType } from '../HorizonProjection';
import { HorizonCanvasLayerCanvasInstance, HorizonCanvasLayerProps } from './HorizonCanvasLayer';
import { HorizonSyncedCanvasLayer } from './HorizonSyncedCanvasLayer';

/**
 * An instance of a shared canvas used by {@link HorizonSharedCanvasLayer}.
 */
export interface HorizonSharedCanvasInstance {
  /** This instance's canvas element. */
  readonly canvas: HTMLCanvasElement;

  /** This instance's canvas 2D rendering context. */
  readonly context: CanvasRenderingContext2D;

  /** Whether this canvas has been invalidated. */
  readonly isInvalidated: boolean;
}

/**
 * A horizon layer containing a single canvas synced to the horizon's projected size that can be shared amongst
 * multiple sublayers for rendering.
 *
 * All of the layer's children are rendered on top of the shared canvas element. All children that extend
 * {@link HorizonSharedCanvasSubLayer} are treated as sublayers and can render to the shared canvas element.
 */
export class HorizonSharedCanvasLayer extends HorizonLayer<HorizonCanvasLayerProps> {
  private thisNode?: VNode;

  private readonly canvasLayerRef = FSComponent.createRef<HorizonSyncedCanvasLayer>();

  private readonly sublayers: HorizonSharedCanvasSubLayer<any>[] = [];

  private sharedCanvasInstance?: HorizonSharedCanvasInstanceClass;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.canvasLayerRef.instance.setVisible(isVisible);

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].setVisible(isVisible);
    }
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    // Enumerate sublayers
    FSComponent.visitNodes(thisNode, node => {
      if (node !== thisNode && node.instance instanceof DisplayComponent) {
        if (node.instance instanceof HorizonSharedCanvasSubLayer) {
          this.sublayers.push(node.instance);
        }

        return true;
      }

      return false;
    });
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();

    this.sharedCanvasInstance = new HorizonSharedCanvasInstanceClass(this.canvasLayerRef.instance.display);

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].attach(this.props.projection, this.sharedCanvasInstance);
    }
  }

  /** @inheritdoc */
  public onWake(): void {
    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onWake();
    }
  }

  /** @inheritdoc */
  public onSleep(): void {
    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onSleep();
    }
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onProjectionChanged(projection, changeFlags);

    if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.ProjectedSize)) {
      this.sharedCanvasInstance!.invalidate();
    }

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onProjectionChanged(projection, changeFlags);
    }
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    let invalidate = false;
    for (let i = 0; !invalidate && i < this.sublayers.length; i++) {
      invalidate = this.sublayers[i].shouldInvalidate(time, elapsed);
    }

    if (invalidate) {
      this.sharedCanvasInstance!.invalidate();
    }

    for (let i = 0; i < this.sublayers.length; i++) {
      this.sublayers[i].onUpdated(time, elapsed);
    }

    this.sharedCanvasInstance!.revalidate();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <HorizonSyncedCanvasLayer
          ref={this.canvasLayerRef}
          projection={this.props.projection}
        />
        {this.props.children}
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

/**
 * A sublayer of {@link HorizonSharedCanvasLayer}.
 */
export class HorizonSharedCanvasSubLayer<P extends ComponentProps> extends DisplayComponent<P> {
  private _isAttached = false;
  private _isVisible = true;

  private _projection?: HorizonProjection;
  private _display?: HorizonSharedCanvasInstance;

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * This sublayer's horizon projection.
   * @throws Error if this sublayer is not attached.
   */
  protected get projection(): HorizonProjection {
    if (this._projection) {
      return this._projection;
    }

    throw new Error('HorizonSharedCanvasSubLayer: attempted to access projection before sublayer was attached');
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * This sublayer's shared canvas instance.
   * @throws Error if this sublayer is not attached.
   */
  protected get display(): HorizonSharedCanvasInstance {
    if (this._display) {
      return this._display;
    }

    throw new Error('HorizonSharedCanvasSubLayer: attempted to access display canvas before sublayer was attached');
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
   * @param projection The horizon projection used by this sublayer.
   * @param display The canvas instance shared by this sublayer.
   */
  public attach(projection: HorizonProjection, display: HorizonSharedCanvasInstance): void {
    this._projection = projection;
    this._display = display;

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
   * This method is called when this sublayer's horizon projection changes.
   * @param projection This sublayer's horizon projection.
   * @param changeFlags The types of changes made to the projection.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    // noop
  }

  /**
   * This method is called at the beginning of every update cycle to check whether this sublayer's shared canvas
   * instance should be invalidated. If the canvas is already invalidated, then this method will not be called.
   * @param time The current time as a UNIX timestamp in milliseconds.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   * @returns Whether this sublayer's shared canvas instance should be invalidated.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public shouldInvalidate(time: number, elapsed: number): boolean {
    return false;
  }

  /**
   * This method is called once every update cycle after this sublayer's shared canvas instance has had a chance to be
   * invalidated.
   * @param time The current time as a UNIX timestamp in milliseconds.
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
 * An implementation of {@link HorizonSharedCanvasInstance} which is backed by a
 * {@link HorizonCanvasLayerCanvasInstance}.
 */
class HorizonSharedCanvasInstanceClass implements HorizonSharedCanvasInstance {
  /** @inheritdoc */
  public readonly canvas = this.instance.canvas;

  /** @inheritdoc */
  readonly context = this.instance.context;

  private _isInvalidated = false;
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this canvas has been invalidated. */
  public get isInvalidated(): boolean {
    return this._isInvalidated;
  }

  /**
   * Creates a new instance of HorizonSharedCanvasInstanceClass.
   * @param instance This instance's backing canvas instance.
   */
  public constructor(private readonly instance: HorizonCanvasLayerCanvasInstance) {
  }

  /**
   * Invalidates and clears this canvas.
   */
  public invalidate(): void {
    this._isInvalidated = true;
    this.instance.clear();
  }

  /** @inheritdoc */
  public revalidate(): void {
    this._isInvalidated = false;
  }
}