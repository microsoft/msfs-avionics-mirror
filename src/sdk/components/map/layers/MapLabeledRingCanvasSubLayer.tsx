import { ReadonlyFloat64Array, Vec2Math } from '../../../math/VecMath';
import { DisplayComponent, FSComponent, VNode } from '../../FSComponent';
import { DefaultMapLabeledRingLabel } from '../DefaultMapLabeledRingLabel';
import { MapLabeledRingLabel } from '../MapLabeledRingLabel';
import { MapSharedCanvasSubLayer, MapSharedCanvasSubLayerProps } from './MapSharedCanvasLayer';

/**
 * A map shared canvas sublayer that displays a ring (circle) with one or more labels.
 */
export class MapLabeledRingCanvasSubLayer<T extends MapSharedCanvasSubLayerProps<any>> extends MapSharedCanvasSubLayer<T> {
  private readonly labelContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly center = new Float64Array(2);
  private radius = 0;

  private strokeWidth = 0;
  private strokeStyle: string | CanvasGradient | CanvasPattern = '';
  private strokeDash: readonly number[] = [];
  private outlineWidth = 0;
  private outlineStyle: string | CanvasGradient | CanvasPattern = '';
  private outlineDash: readonly number[] = [];

  private readonly labels: DefaultMapLabeledRingLabel<any>[] = [];

  private needInvalidate = false;

  /**
   * Gets the center position of this sublayer's ring, in pixels.
   * @returns the center position of this sublayer's ring.
   */
  public getRingCenter(): ReadonlyFloat64Array {
    return this.center;
  }

  /**
   * Gets the radius of this sublayer's ring, in pixels.
   * @returns the radius of this sublayer's ring.
   */
  public getRingRadius(): number {
    return this.radius;
  }

  /**
   * Sets the center and radius of this sublayer's ring.
   * @param center The new center, in pixels.
   * @param radius The new radius, in pixels.
   */
  public setRingPosition(center: ReadonlyFloat64Array, radius: number): void {
    if (Vec2Math.equals(this.center, center) && radius === this.radius) {
      return;
    }

    this.center.set(center);
    this.radius = radius;

    this.needInvalidate = true;
  }

  /**
   * Sets the styling for this sublayer's ring stroke. Any style that is not explicitly defined will be left unchanged.
   * @param width The new stroke width.
   * @param style The new stroke style.
   * @param dash The new stroke dash.
   */
  public setRingStrokeStyles(width?: number, style?: string | CanvasGradient | CanvasPattern, dash?: readonly number[]): void {
    this.strokeWidth = width ?? this.strokeWidth;
    this.strokeStyle = style ?? this.strokeStyle;
    this.strokeDash = dash ?? this.strokeDash;

    this.needInvalidate = true;
  }

  /**
   * Sets the styling for this sublayer's ring outline. Any style that is not explicitly defined will be left unchanged.
   * @param width The new outline width.
   * @param style The new outline style.
   * @param dash The new outline dash.
   */
  public setRingOutlineStyles(width?: number, style?: string | CanvasGradient | CanvasPattern, dash?: readonly number[]): void {
    this.outlineWidth = width ?? this.outlineWidth;
    this.outlineStyle = style ?? this.outlineStyle;
    this.outlineDash = dash ?? this.outlineDash;

    this.needInvalidate = true;
  }

  /**
   * Creates a ring label. Labels can only be created after this sublayer has been rendered.
   * @param content The content of the new label.
   * @returns The newly created ring label, or `null` if a label could not be created.
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
  public onVisibilityChanged(isVisible: boolean): void {
    this.needInvalidate = true;

    this.labelContainerRef.instance.style.display = isVisible ? 'block' : 'none';
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.needInvalidate = true;
  }

  /** @inheritdoc */
  public shouldInvalidate(): boolean {
    return this.needInvalidate;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (this.display.isInvalidated) {
      this.needInvalidate = false;

      if (!this.isVisible()) {
        return;
      }

      this.drawRing();
      this.updateLabelPositions();
    }
  }

  /**
   * Draws this layer's ring.
   */
  private drawRing(): void {
    if (!this.isRingInView()) {
      return;
    }

    this.display.context.beginPath();
    this.display.context.arc(this.center[0], this.center[1], this.radius, 0, Math.PI * 2);
    if (this.outlineWidth > 0) {
      this.applyStrokeToContext(this.display.context, this.strokeWidth + this.outlineWidth * 2, this.outlineStyle, this.outlineDash);
    }
    if (this.strokeWidth > 0) {
      this.applyStrokeToContext(this.display.context, this.strokeWidth, this.strokeStyle, this.strokeDash);
    }
  }

  /**
   * Checks whether this sublayer's ring is in view.
   * @returns whether this sublayer's ring is in view.
   */
  private isRingInView(): boolean {
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

    const width = this.projection.getProjectedSize()[0];
    const height = this.projection.getProjectedSize()[1];

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
  private applyStrokeToContext(
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
   * Updates the position of this sublayer's labels based on the position of the ring.
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
      <div ref={this.labelContainerRef} style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'></div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const label of this.labels) {
      label.destroy();
    }

    super.destroy();
  }
}