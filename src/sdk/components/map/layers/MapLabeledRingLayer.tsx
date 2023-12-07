import { BitFlags } from '../../../math/BitFlags';
import { ReadonlyFloat64Array, Vec2Math } from '../../../math/VecMath';
import { DisplayComponent, FSComponent, VNode } from '../../FSComponent';
import { DefaultMapLabeledRingLabel } from '../DefaultMapLabeledRingLabel';
import { MapLabeledRingLabel } from '../MapLabeledRingLabel';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection, MapProjectionChangeType } from '../MapProjection';
import { MapCanvasLayerCanvasInstance } from './MapCanvasLayer';
import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';

/**
 * A map layer that displays a ring (circle) with one or more labels.
 */
export class MapLabeledRingLayer<T extends MapLayerProps<any>> extends MapLayer<T> {
  protected readonly labelContainerRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer<MapLayerProps<any>>>();

  private readonly center = new Float64Array(2);
  private radius = 0;
  private strokeWidth = 0;
  private strokeStyle: string | CanvasGradient | CanvasPattern = '';
  private strokeDash: readonly number[] = [];
  private outlineWidth = 0;
  private outlineStyle: string | CanvasGradient | CanvasPattern = '';
  private outlineDash: readonly number[] = [];
  private needUpdateRingPosition = false;
  protected isInit = false;

  private readonly labels: DefaultMapLabeledRingLabel<any>[] = [];

  /**
   * Gets the center position of this layer's ring, in pixels.
   * @returns the center position of this layer's ring.
   */
  public getRingCenter(): ReadonlyFloat64Array {
    return this.center;
  }

  /**
   * Gets the radius of this layer's ring, in pixels.
   * @returns the radius of this layer's ring.
   */
  public getRingRadius(): number {
    return this.radius;
  }

  /**
   * Sets the center and radius of this layer's ring.
   * @param center The new center, in pixels.
   * @param radius The new radius, in pixels.
   */
  public setRingPosition(center: ReadonlyFloat64Array, radius: number): void {
    if (Vec2Math.equals(this.center, center) && radius === this.radius) {
      return;
    }

    this.center.set(center);
    this.radius = radius;

    this.needUpdateRingPosition = true;
  }

  /**
   * Sets the styling for this layer's ring stroke. Any style that is not explicitly defined will be left unchanged.
   * @param width The new stroke width.
   * @param style The new stroke style.
   * @param dash The new stroke dash.
   */
  public setRingStrokeStyles(width?: number, style?: string | CanvasGradient | CanvasPattern, dash?: readonly number[]): void {
    this.strokeWidth = width ?? this.strokeWidth;
    this.strokeStyle = style ?? this.strokeStyle;
    this.strokeDash = dash ?? this.strokeDash;

    this.needUpdateRingPosition = true;
  }

  /**
   * Sets the styling for this layer's ring outline. Any style that is not explicitly defined will be left unchanged.
   * @param width The new outline width.
   * @param style The new outline style.
   * @param dash The new outline dash.
   */
  public setRingOutlineStyles(width?: number, style?: string | CanvasGradient | CanvasPattern, dash?: readonly number[]): void {
    this.outlineWidth = width ?? this.outlineWidth;
    this.outlineStyle = style ?? this.outlineStyle;
    this.outlineDash = dash ?? this.outlineDash;

    this.needUpdateRingPosition = true;
  }

  /**
   * Creates a ring label. Labels can only be created after this layer has been rendered.
   * @param content The content of the new label.
   * @returns the newly created ring label, or null if a label could not be created.
   */
  public createLabel<L extends string | number | HTMLElement | DisplayComponent<any> | SVGElement>
    (content: VNode): MapLabeledRingLabel<L> | null {

    if (!this.labelContainerRef.instance) {
      return null;
    }

    const node = (
      <DefaultMapLabeledRingLabel>
        {content}
      </DefaultMapLabeledRingLabel>
    );

    FSComponent.render(node, this.labelContainerRef.instance);
    const label = node.instance as DefaultMapLabeledRingLabel<L>;
    label.setRingPosition(this.center, this.radius);
    this.labels.push(label);
    return label;
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onVisibilityChanged(isVisible: boolean): void {
    if (this.isInit) {
      this.updateFromVisibility();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.canvasLayerRef.instance.onAttached();
    this.isInit = true;
    this.updateFromVisibility();
    this.needUpdateRingPosition = true;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      // resizing the map will cause the canvas layer to clear itself, so we need to force a redraw.
      this.needUpdateRingPosition = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.needUpdateRingPosition) {
      this.updateRingPosition();
      this.needUpdateRingPosition = false;
    }

    this.canvasLayerRef.instance.onUpdated(time, elapsed);
  }

  /**
   * Updates this layer according to its current visibility.
   */
  protected updateFromVisibility(): void {
    const isVisible = this.isVisible();
    this.canvasLayerRef.instance.setVisible(isVisible);
    this.labelContainerRef.instance.style.display = isVisible ? 'block' : 'none';
  }

  /**
   * Updates the position of this layer's ring.
   */
  protected updateRingPosition(): void {
    this.drawRing();
    this.updateLabelPositions();
  }

  /**
   * Draws this layer's ring to canvas.
   */
  private drawRing(): void {
    const canvasDisplay = this.canvasLayerRef.instance.display as MapCanvasLayerCanvasInstance;
    canvasDisplay.clear();

    if (!this.isRingInView()) {
      return;
    }

    canvasDisplay.context.beginPath();
    canvasDisplay.context.arc(this.center[0], this.center[1], this.radius, 0, Math.PI * 2);
    if (this.outlineWidth > 0) {
      this.applyStrokeToContext(canvasDisplay.context, this.strokeWidth + this.outlineWidth * 2, this.outlineStyle, this.outlineDash);
    }
    if (this.strokeWidth > 0) {
      this.applyStrokeToContext(canvasDisplay.context, this.strokeWidth, this.strokeStyle, this.strokeDash);
    }
  }

  /**
   * Checks whether this layer's ring is in view.
   * @returns whether this layer's ring is in view.
   */
  protected isRingInView(): boolean {
    const centerX = this.center[0];
    const centerY = this.center[1];

    const innerHalfLength = this.radius / Math.SQRT2;
    const innerLeft = centerX - innerHalfLength;
    const innerRight = centerX + innerHalfLength;
    const innerTop = centerY - innerHalfLength;
    const innerBottom = centerY + innerHalfLength;

    const outerLeft = centerX - this.radius;
    const outerRight = centerX + this.radius;
    const outerTop = centerY - this.radius;
    const outerBottom = centerY + this.radius;

    const width = this.props.mapProjection.getProjectedSize()[0];
    const height = this.props.mapProjection.getProjectedSize()[1];

    if (innerLeft < 0 && innerRight > width && innerTop < 0 && innerBottom > height) {
      return false;
    }
    if (outerLeft > width || outerRight < 0 || outerTop > height || outerBottom < 0) {
      return false;
    }
    return true;
  }

  /**
   * Applies a stroke to a canvas rendering context.
   * @param context The canvas to which to apply a stroke.
   * @param lineWidth The stroke width.
   * @param strokeStyle The stroke style.
   * @param dash The stroke dash.
   */
  protected applyStrokeToContext(
    context: CanvasRenderingContext2D,
    lineWidth: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    dash: readonly number[]
  ): void {
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.setLineDash(dash);
    context.stroke();
  }

  /**
   * Updates the position of this layer's labels based on the position of the ring.
   */
  private updateLabelPositions(): void {
    const len = this.labels.length;
    for (let i = 0; i < len; i++) {
      this.labels[i].setRingPosition(this.center, this.radius);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <MapSyncedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
        <div ref={this.labelContainerRef} style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'></div>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.canvasLayerRef.getOrDefault()?.destroy();

    for (const label of this.labels) {
      label.destroy();
    }

    super.destroy();
  }
}