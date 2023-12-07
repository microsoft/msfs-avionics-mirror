import { CssTransformBuilder, CssTransformSubject } from '../../graphics/css/CssTransform';
import { ReadonlyFloat64Array, Vec2Math } from '../../math/VecMath';
import { Subject } from '../../sub/Subject';
import { ComponentProps, DisplayComponent, FSComponent, VNode } from '../FSComponent';
import { MapLabeledRingLabel, MapLabeledRingLabelContent } from './MapLabeledRingLabel';

/**
 * A default implementation of {@link MapLabeledRingLabel}.
 */
export class DefaultMapLabeledRingLabel<T extends MapLabeledRingLabelContent> extends DisplayComponent<ComponentProps>
  implements MapLabeledRingLabel<T> {

  private static readonly tempVec2_1 = new Float64Array(2);

  private readonly translate = CssTransformSubject.create(CssTransformBuilder.translate('%'));
  private readonly left = Subject.create('');
  private readonly top = Subject.create('');

  private thisNode?: VNode;
  private _content?: T | null;

  /** @inheritdoc */
  public get content(): T {
    if (this._content === undefined || this._content === null) {
      throw new Error('DefaultMapLabeledRingLabel: unable to access content');
    }

    return this._content;
  }

  private readonly center = new Float64Array(2);
  private radius = 0;
  private readonly anchor = new Float64Array(2);
  private radialAngle = 0;
  private radialOffset = 0;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
    this._content = thisNode.children?.[0].instance as T | null;
  }

  /** @inheritdoc */
  public getAnchor(): ReadonlyFloat64Array {
    return this.anchor;
  }

  /** @inheritdoc */
  public getRadialAngle(): number {
    return this.radialAngle;
  }

  /** @inheritdoc */
  public getRadialOffset(): number {
    return this.radialOffset;
  }

  /** @inheritdoc */
  public setAnchor(anchor: ReadonlyFloat64Array): void {
    this.anchor.set(anchor);

    this.translate.transform.set(-anchor[0] * 100, -anchor[1] * 100);
    this.translate.resolve();
  }

  /** @inheritdoc */
  public setRadialAngle(angle: number): void {
    if (this.radialAngle === angle) {
      return;
    }

    this.radialAngle = angle;

    this.updatePosition();
  }

  /** @inheritdoc */
  public setRadialOffset(offset: number): void {
    if (this.radialOffset === offset) {
      return;
    }

    this.radialOffset = offset;

    this.updatePosition();
  }

  /**
   * Updates this label with the center and radius of its parent ring.
   * @param center The center of the ring, in pixels.
   * @param radius The radius of the ring, in pixels.
   */
  public setRingPosition(center: ReadonlyFloat64Array, radius: number): void {
    if (Vec2Math.equals(this.center, center) && radius === this.radius) {
      return;
    }

    this.center.set(center);
    this.radius = radius;

    this.updatePosition();
  }

  /**
   * Updates this label's position.
   */
  private updatePosition(): void {
    const pos = DefaultMapLabeledRingLabel.tempVec2_1;
    Vec2Math.setFromPolar(this.radius + this.radialOffset, this.radialAngle, pos);
    Vec2Math.add(this.center, pos, pos);

    this.left.set(`${pos[0]}px`);
    this.top.set(`${pos[1]}px`);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        style={{
          'position': 'absolute',
          'left': this.left,
          'top': this.top,
          'transform': this.translate
        }}
      >
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}