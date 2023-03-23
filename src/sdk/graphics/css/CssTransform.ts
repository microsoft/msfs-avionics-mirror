import { MathUtils } from '../../math/MathUtils';
import { Transform2D } from '../../math/Transform2D';
import { ReadonlyFloat64Array, VecNMath } from '../../math/VecMath';
import { AbstractSubscribable } from '../../sub/AbstractSubscribable';

/**
 * A CSS transform.
 */
export interface CssTransform {
  /**
   * Resolves this transform to a CSS transform string.
   * @returns A CSS transform string representative of this transform.
   */
  resolve(): string;
}

/**
 * An abstract implementation of {@link CssTransform}
 */
abstract class AbstractCssTransform implements CssTransform {
  protected readonly params: Float64Array;
  protected readonly cachedParams: Float64Array;

  protected stringValue?: string;

  /**
   * Constructor.
   * @param initialParams The transform's initial parameters.
   */
  public constructor(initialParams: readonly number[]) {
    this.params = new Float64Array(initialParams);
    this.cachedParams = new Float64Array(initialParams);
  }

  /** @inheritdoc */
  public resolve(): string {
    if (this.stringValue !== undefined && VecNMath.equals(this.params, this.cachedParams)) {
      return this.stringValue;
    }

    VecNMath.copy(this.params, this.cachedParams);
    this.stringValue = this.buildString(this.params);
    return this.stringValue;
  }

  /**
   * Builds a CSS transform string representative of this transform.
   * @param params The parameters of this transform.
   * @returns A CSS transform string representative of this transform.
   */
  protected abstract buildString(params: ReadonlyFloat64Array): string;
}

/**
 * A CSS `matrix` transform.
 */
export class CssMatrixTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [1, 0, 0, 1, 0, 0];

  /**
   * Creates a new instance of a CSS `matrix` transform, initialized to the identity transformation.
   */
  public constructor() {
    super(CssMatrixTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets the parameters of this transform.
   * @param scaleX The x scaling value to set.
   * @param skewY The y skew value to set.
   * @param skewX The x skew value to set.
   * @param scaleY The y scaling value to set.
   * @param translateX The x translation value to set.
   * @param translateY The y translation value to set.
   */
  public set(scaleX: number, skewY: number, skewX: number, scaleY: number, translateX: number, translateY: number): void;
  /**
   * Sets the parameters of this transform.
   * @param transform A transform object containing the parameters to set.
   */
  public set(transform: Transform2D): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public set(arg1: number | Transform2D, skewY?: number, skewX?: number, scaleY?: number, translateX?: number, translateY?: number): void {
    let scaleX: number;
    if (typeof arg1 === 'number') {
      scaleX = arg1;
    } else {
      [scaleX, skewX, skewY, scaleY, translateX, translateY] = arg1.getParameters();
    }

    this.params[0] = scaleX;
    this.params[1] = skewY as number;
    this.params[2] = skewX as number;
    this.params[3] = scaleY as number;
    this.params[4] = translateX as number;
    this.params[5] = translateY as number;
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `matrix(${params.join(', ')})`;
  }
}

/**
 * A CSS `rotate` transform.
 */
export class CssRotateTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0];

  /**
   * Creates a new instance of a CSS `rotate` transform, initialized to zero rotation.
   * @param unit The angle unit to use for this transform.
   */
  public constructor(private readonly unit: 'rad' | 'deg') {
    super(CssRotateTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's rotation angle.
   * @param angle The angle to set.
   * @param precision The precision with which to set the angle. A value of `0` denotes infinite precision. Defaults
   * to `0`.
   */
  public set(angle: number, precision = 0): void {
    this.params[0] = precision === 0 ? angle : MathUtils.round(angle, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `rotate(${params[0]}${this.unit})`;
  }
}

/**
 * A CSS `rotate3d` transform.
 */
export class CssRotate3dTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0, 0, 1, 0];

  /**
   * Creates a new instance of a CSS `rotate3d` transform, initialized to zero rotation about the z axis.
   * @param unit The angle unit to use for this transform.
   */
  public constructor(private readonly unit: 'rad' | 'deg') {
    super(CssRotate3dTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's rotation.
   * @param x The x component of the rotation axis vector.
   * @param y The y component of the rotation axis vector.
   * @param z The z component of the rotation axis vector.
   * @param angle The rotation angle to set.
   * @param precision The precision with which to set the angle. A value of `0` denotes infinite precision. Defaults
   * to `0`.
   */
  public set(x: number, y: number, z: number, angle: number, precision = 0): void {
    this.params[0] = x;
    this.params[1] = y;
    this.params[2] = z;
    this.params[3] = precision === 0 ? angle : MathUtils.round(angle, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `rotate3d(${params[0]}, ${params[1]}, ${params[2]}, ${params[3]}${this.unit})`;
  }
}

/**
 * A CSS `translateX` transform.
 */
export class CssTranslateXTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0];

  /**
   * Creates a new instance of a CSS `translateX` transform, initialized to zero translation.
   * @param unit The unit to use for this transform.
   */
  public constructor(private readonly unit: string) {
    super(CssTranslateXTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's translation.
   * @param x The translation to set.
   * @param precision The precision with which to set the translation. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   */
  public set(x: number, precision = 0): void {
    this.params[0] = precision === 0 ? x : MathUtils.round(x, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `translateX(${params[0]}${this.unit})`;
  }
}

/**
 * A CSS `translateY` transform.
 */
export class CssTranslateYTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0];

  /**
   * Creates a new instance of a CSS `translateY` transform, initialized to zero translation.
   * @param unit The unit to use for this transform.
   */
  public constructor(private readonly unit: string) {
    super(CssTranslateYTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's translation.
   * @param y The translation to set.
   * @param precision The precision with which to set the translation. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   */
  public set(y: number, precision = 0): void {
    this.params[0] = precision === 0 ? y : MathUtils.round(y, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `translateY(${params[0]}${this.unit})`;
  }
}

/**
 * A CSS `translateZ` transform.
 */
export class CssTranslateZTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0];

  /**
   * Creates a new instance of a CSS `translateZ` transform, initialized to zero translation.
   * @param unit The unit to use for this transform.
   */
  public constructor(private readonly unit: string) {
    super(CssTranslateZTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's translation.
   * @param z The translation to set.
   * @param precision The precision with which to set the translation. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   */
  public set(z: number, precision = 0): void {
    this.params[0] = precision === 0 ? z : MathUtils.round(z, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `translateZ(${params[0]}${this.unit})`;
  }
}

/**
 * A CSS `translate` transform.
 */
export class CssTranslateTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0, 0];

  /**
   * Creates a new instance of a CSS `translate` transform, initialized to zero translation.
   * @param unitX The unit to use for this transform's x translation.
   * @param unitY The unit to use for this transform's y translation. Defaults to the same unit as the x translation.
   */
  public constructor(private readonly unitX: string, private readonly unitY = unitX) {
    super(CssTranslateTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's translation.
   * @param x The x translation to set.
   * @param y The y translation to set.
   * @param precisionX The precision with which to set the x translation. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   * @param precisionY The precision with which to set the y translation. A value of `0` denotes infinite precision.
   * Defaults to the x translation precision value.
   */
  public set(x: number, y: number, precisionX = 0, precisionY = precisionX): void {
    this.params[0] = precisionX === 0 ? x : MathUtils.round(x, precisionX);
    this.params[1] = precisionY === 0 ? y : MathUtils.round(y, precisionY);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `translate(${params[0]}${this.unitX}, ${params[1]}${this.unitY})`;
  }
}

/**
 * A CSS `translate3d` transform.
 */
export class CssTranslate3dTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [0, 0, 0];

  /**
   * Creates a new instance of a CSS `translate3d` transform, initialized to zero translation.
   * @param unitX The unit to use for this transform's x translation.
   * @param unitY The unit to use for this transform's y translation. Defaults to the same unit as the x translation.
   * @param unitZ The unit to use for this transform's z translation. Defaults to the same unit as the x translation.
   */
  public constructor(private readonly unitX: string, private readonly unitY = unitX, private readonly unitZ = unitX) {
    super(CssTranslate3dTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's translation.
   * @param x The x translation to set.
   * @param y The y translation to set.
   * @param z The z translation to set.
   * @param precisionX The precision with which to set the x translation. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   * @param precisionY The precision with which to set the y translation. A value of `0` denotes infinite precision.
   * Defaults to the x translation precision value.
   * @param precisionZ The precision with which to set the z translation. A value of `0` denotes infinite precision.
   * Defaults to the x translation precision value.
   */
  public set(x: number, y: number, z: number, precisionX = 0, precisionY = precisionX, precisionZ = precisionX): void {
    this.params[0] = precisionX === 0 ? x : MathUtils.round(x, precisionX);
    this.params[1] = precisionY === 0 ? y : MathUtils.round(y, precisionY);
    this.params[2] = precisionZ === 0 ? z : MathUtils.round(z, precisionZ);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `translate3d(${params[0]}${this.unitX}, ${params[1]}${this.unitY}, ${params[2]}${this.unitZ})`;
  }
}

/**
 * A CSS `scaleX` transform.
 */
export class CssScaleXTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [1];

  /**
   * Creates a new instance of a CSS `scaleX` transform, initialized to the identity scaling.
   */
  public constructor() {
    super(CssScaleXTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's scaling.
   * @param x The scaling to set.
   * @param precision The precision with which to set the scaling. A value of `0` denotes infinite precision. Defaults
   * to `0`.
   */
  public set(x: number, precision = 0): void {
    this.params[0] = precision === 0 ? x : MathUtils.round(x, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `scaleX(${params[0]})`;
  }
}

/**
 * A CSS `scaleY` transform.
 */
export class CssScaleYTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [1];

  /**
   * Creates a new instance of a CSS `scaleY` transform, initialized to the identity scaling.
   */
  public constructor() {
    super(CssScaleYTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's scaling.
   * @param y The scaling to set.
   * @param precision The precision with which to set the scaling. A value of `0` denotes infinite precision. Defaults
   * to `0`.
   */
  public set(y: number, precision = 0): void {
    this.params[0] = precision === 0 ? y : MathUtils.round(y, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `scaleY(${params[0]})`;
  }
}

/**
 * A CSS `scaleZ` transform.
 */
export class CssScaleZTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [1];

  /**
   * Creates a new instance of a CSS `scaleZ` transform, initialized to the identity scaling.
   */
  public constructor() {
    super(CssScaleZTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's scaling.
   * @param z The scaling to set.
   * @param precision The precision with which to set the scaling. A value of `0` denotes infinite precision. Defaults
   * to `0`.
   */
  public set(z: number, precision = 0): void {
    this.params[0] = precision === 0 ? z : MathUtils.round(z, precision);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `scaleZ(${params[0]})`;
  }
}

/**
 * A CSS `scale` transform.
 */
export class CssScaleTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [1, 1];

  /**
   * Creates a new instance of a CSS `scale` transform, initialized to the identity scaling.
   */
  public constructor() {
    super(CssScaleTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's scaling.
   * @param x The x scaling to set.
   * @param y The y scaling to set.
   * @param precisionX The precision with which to set the x scaling. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   * @param precisionY The precision with which to set the y scaling. A value of `0` denotes infinite precision.
   * Defaults to the x scaling precision value.
   */
  public set(x: number, y: number, precisionX = 0, precisionY = precisionX): void {
    this.params[0] = precisionX === 0 ? x : MathUtils.round(x, precisionX);
    this.params[1] = precisionY === 0 ? y : MathUtils.round(y, precisionY);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `scale(${params[0]}, ${params[1]})`;
  }
}

/**
 * A CSS `scale3d` transform.
 */
export class CssScale3dTransform extends AbstractCssTransform {
  private static readonly DEFAULT_PARAMS = [1, 1, 1];

  /**
   * Creates a new instance of a CSS `scale3d` transform, initialized to the identity scaling.
   */
  public constructor() {
    super(CssScale3dTransform.DEFAULT_PARAMS);
  }

  /**
   * Sets this transform's scaling.
   * @param x The x scaling to set.
   * @param y The y scaling to set.
   * @param z The z scaling to set.
   * @param precisionX The precision with which to set the x scaling. A value of `0` denotes infinite precision.
   * Defaults to `0`.
   * @param precisionY The precision with which to set the y scaling. A value of `0` denotes infinite precision.
   * Defaults to the x scaling precision value.
   * @param precisionZ The precision with which to set the z scaling. A value of `0` denotes infinite precision.
   * Defaults to the x scaling precision value.
   */
  public set(x: number, y: number, z: number, precisionX = 0, precisionY = precisionX, precisionZ = precisionX): void {
    this.params[0] = precisionX === 0 ? x : MathUtils.round(x, precisionX);
    this.params[1] = precisionY === 0 ? y : MathUtils.round(y, precisionY);
    this.params[2] = precisionZ === 0 ? z : MathUtils.round(y, precisionZ);
  }

  /** @inheritdoc */
  protected buildString(params: ReadonlyFloat64Array): string {
    return `scale3d(${params[0]}, ${params[1]}, ${params[2]})`;
  }
}

/**
 * A concatenated chain of CSS transforms.
 */
export class CssTransformChain<T extends CssTransform[]> implements CssTransform {
  private readonly transforms: T;

  private readonly stringValues: string[] = [];

  private chainedStringValue?: string;

  /**
   * Creates a new chain of CSS transforms.
   * @param transforms The individual child transforms that will constitute the new transform chain. The order of
   * the children passed to the constructor determines the order of concatenation. Concatenation follows the standard
   * CSS transform convention: for a concatenation of transforms `[A, B, C]`, the resulting transformation is
   * equivalent to the one produced by multiplying the transformation matrices in the order `(A * B) * C`.
   */
  public constructor(...transforms: T) {
    this.transforms = transforms;
  }

  /**
   * Gets one of this chain's child transforms.
   * @param index The index of the child to get.
   * @returns The child transform at the specified index in this chain.
   * @throws RangeError if `index` is out of bounds.
   */
  public getChild<Index extends number>(index: Index): Omit<NonNullable<T[Index]>, 'resolve'> {
    if (index < 0 || index >= this.transforms.length) {
      throw new RangeError();
    }

    return this.transforms[index] as NonNullable<T[Index]>;
  }

  /** @inheritdoc */
  public resolve(): string {
    let needRebuildString = false;

    for (let i = 0; i < this.transforms.length; i++) {
      const stringValue = this.transforms[i].resolve();
      if (this.stringValues[i] !== stringValue) {
        this.stringValues[i] = stringValue;
        needRebuildString = true;
      }
    }

    if (needRebuildString || this.chainedStringValue === undefined) {
      this.chainedStringValue = this.stringValues.join(' ');
    }

    return this.chainedStringValue;
  }
}

/**
 * A subscribable subject whose value is a CSS transform string resolved from a {@link CssTransform}.
 */
export class CssTransformSubject<T extends CssTransform> extends AbstractSubscribable<string> {
  private readonly _transform: T;

  private stringValue: string;

  /** This subject's associated CSS transform. */
  public readonly transform: Omit<T, 'resolve'>;

  /**
   * Constructor.
   * @param transform The new subject's CSS transform.
   */
  private constructor(transform: T) {
    super();

    this._transform = transform;
    this.stringValue = transform.resolve();

    this.transform = transform;
  }

  /** @inheritdoc */
  public get(): string {
    return this.stringValue;
  }

  /**
   * Resolves this subject's CSS transform to a CSS transform string, and sets this subject's value to the resolved
   * string. If this changes this subject's value, subscribers will be notified.
   */
  public resolve(): void {
    const stringValue = this._transform.resolve();
    if (stringValue !== this.stringValue) {
      this.stringValue = stringValue;
      this.notify();
    }
  }

  /**
   * Creates a new instance of {@link CssTransformSubject} whose value is resolved from a CSS transform.
   * @param transform A CSS transform.
   * @returns A new instance of {@link CssTransformSubject} whose value is resolved from the specified CSS transform.
   */
  public static create<T extends CssTransform>(transform: T): CssTransformSubject<T> {
    return new CssTransformSubject(transform);
  }
}

/**
 * A utility class for building CSS transforms.
 */
export class CssTransformBuilder {
  /**
   * Creates a new instance of a CSS `matrix` transform, initialized to the identity transformation.
   * @returns A new instance of a CSS `matrix` transform, initialized to the identity transformation.
   */
  public static matrix(): CssMatrixTransform {
    return new CssMatrixTransform();
  }

  /**
   * Creates a new instance of a CSS `rotate` transform, initialized to zero rotation.
   * @param unit The angle unit to use for the new transform.
   * @returns A new instance of a CSS `rotate` transform, initialized to zero rotation.
   */
  public static rotate(unit: 'rad' | 'deg'): CssRotateTransform {
    return new CssRotateTransform(unit);
  }

  /**
   * Creates a new instance of a CSS `rotate3d` transform, initialized to zero rotation about the z axis.
   * @param unit The angle unit to use for the new transform.
   * @returns A new instance of a CSS `rotate3d` transform, initialized to zero rotation about the z axis.
   */
  public static rotate3d(unit: 'rad' | 'deg'): CssRotate3dTransform {
    return new CssRotate3dTransform(unit);
  }

  /**
   * Creates a new instance of a CSS `translateX` transform, initialized to zero translation.
   * @param unit The unit to use for the new transform.
   * @returns A new instance of a CSS `translateX` transform, initialized to zero translation.
   */
  public static translateX(unit: string): CssTranslateXTransform {
    return new CssTranslateXTransform(unit);
  }

  /**
   * Creates a new instance of a CSS `translateY` transform, initialized to zero translation.
   * @param unit The unit to use for the new transform.
   * @returns A new instance of a CSS `translateY` transform, initialized to zero translation.
   */
  public static translateY(unit: string): CssTranslateYTransform {
    return new CssTranslateYTransform(unit);
  }

  /**
   * Creates a new instance of a CSS `translateZ` transform, initialized to zero translation.
   * @param unit The unit to use for the new transform.
   * @returns A new instance of a CSS `translateZ` transform, initialized to zero translation.
   */
  public static translateZ(unit: string): CssTranslateZTransform {
    return new CssTranslateZTransform(unit);
  }

  /**
   * Creates a new instance of a CSS `translate` transform, initialized to zero translation.
   * @param unitX The unit to use for the new transform's x translation.
   * @param unitY The unit to use for the new transform's y translation.
   * @returns A new instance of a CSS `translate` transform, initialized to zero translation.
   */
  public static translate(unitX: string, unitY?: string): CssTranslateTransform {
    return new CssTranslateTransform(unitX, unitY);
  }

  /**
   * Creates a new instance of a CSS `translate3d` transform, initialized to zero translation.
   * @param unitX The unit to use for the new transform's x translation.
   * @param unitY The unit to use for the new transform's y translation.
   * @param unitZ The unit to use for the new transform's z translation.
   * @returns A new instance of a CSS `translate3d` transform, initialized to zero translation.
   */
  public static translate3d(unitX: string, unitY?: string, unitZ?: string): CssTranslate3dTransform {
    return new CssTranslate3dTransform(unitX, unitY, unitZ);
  }

  /**
   * Creates a new instance of a CSS `scaleX` transform, initialized to the identity scaling.
   * @returns A new instance of a CSS `scaleX` transform, initialized to the identity scaling.
   */
  public static scaleX(): CssScaleXTransform {
    return new CssScaleXTransform();
  }

  /**
   * Creates a new instance of a CSS `scaleY` transform, initialized to the identity scaling.
   * @returns A new instance of a CSS `scaleY` transform, initialized to the identity scaling.
   */
  public static scaleY(): CssScaleYTransform {
    return new CssScaleYTransform();
  }

  /**
   * Creates a new instance of a CSS `scaleZ` transform, initialized to the identity scaling.
   * @returns A new instance of a CSS `scaleZ` transform, initialized to the identity scaling.
   */
  public static scaleZ(): CssScaleZTransform {
    return new CssScaleZTransform();
  }

  /**
   * Creates a new instance of a CSS `scale` transform, initialized to the identity scaling.
   * @returns A new instance of a CSS `scale` transform, initialized to the identity scaling.
   */
  public static scale(): CssScaleTransform {
    return new CssScaleTransform();
  }

  /**
   * Creates a new instance of a CSS `scale3d` transform, initialized to the identity scaling.
   * @returns A new instance of a CSS `scale3d` transform, initialized to the identity scaling.
   */
  public static scale3d(): CssScale3dTransform {
    return new CssScale3dTransform();
  }

  /**
   * Concatenates zero or more CSS transformations.
   * @param transforms The individual transforms to concatentate. The order of the transforms passed to the function
   * determines the order of concatenation. Concatenation follows the standard CSS transform convention: for a
   * concatenation of transforms `[A, B, C]`, the resulting transformation is equivalent to the one produced by
   * multiplying the transformation matrices in the order `(A * B) * C`.
   * @returns A new {@link CssTransformChain} object representing the concatenation of the specified transforms.
   */
  public static concat<T extends CssTransform[]>(...transforms: T): CssTransformChain<T> {
    return new CssTransformChain(...transforms);
  }
}