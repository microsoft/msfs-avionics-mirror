import {
  AffineTransformPathStream, ArraySubject, BingComponent, ComponentProps, ConsumerSubject, DisplayComponent, EventBus,
  FSComponent, GNSSEvents, MappedSubject, MathUtils, MutableSubscribable, NumberFormatter, NumberUnitInterface,
  NumberUnitSubject, ObjectSubject, ReadonlyFloat64Array, SetSubject, Subject, Subscribable, SubscribableUtils,
  Subscription, SvgPathStream, Unit, UnitFamily, UnitType, Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';
import { NumberUnitDisplay } from '../common/NumberUnitDisplay';
import { WeatherRadarUtils } from './WeatherRadarUtils';

/**
 * The operating mode of a Garmin weather radar.
 */
export enum WeatherRadarOperatingMode {
  Standby = 'Standby',
  Weather = 'Weather'
}

/**
 * The scan mode of a Garmin weather radar.
 */
export enum WeatherRadarScanMode {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical'
}

/**
 * Component props for WeatherRadar.
 */
export interface WeatherRadarProps extends ComponentProps {
  /** The unique ID to assign to the weather radar's Bing instance. */
  bingId: string;

  /** The event bus. */
  bus: EventBus;

  /** The operating mode of the weather radar. */
  operatingMode: Subscribable<WeatherRadarOperatingMode>;

  /** The scan mode of the weather radar. */
  scanMode: Subscribable<WeatherRadarScanMode>;

  /** The angular width, in degrees, of the radar arc in horizontal scan mode. */
  horizontalScanAngularWidth: number | Subscribable<number>;

  /** The angular width, in degrees, of the radar arc in vertical scan mode. */
  verticalScanAngularWidth: number | Subscribable<number>;

  /** The display range of the weather radar. */
  range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The units displayed by the weather radar's range labels. */
  rangeUnit: Unit<UnitFamily.Distance> | Subscribable<Unit<UnitFamily.Distance>>;

  /** The size of the weather radar display, as `[width, height]` in pixels. */
  size: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** Whether to show the bearing line in horizontal scan mode. */
  showBearingLine: Subscribable<boolean>;

  /** Whether to show the tilt line in vertical scan mode. */
  showTiltLine: Subscribable<boolean>;

  /**
   * The colors for the weather radar at zero gain. Each entry `E_i` of the array is a tuple `[color, dBZ]` that
   * defines a color stop, where `color` is an RGBA color expressed as `R + G * 256 + B * 256^2 + A * 256^3` and `dBZ`
   * is a return signal strength.
   *
   * In general, the color defined by `E_i` is applied to returns ranging from the signal strength defined by `E_i-1`
   * to the signal strength defined by `E_i`. There are two special cases. The color defined by `E_0` is applied to
   * returns with signal strengths from negative infinity to the strength defined by `E_0`. The color defined by
   * `E_n-1`, where `n` is the length of the array, is applied to returns with signal strengths from the strength
   * defined by `E_n-2` to positive infinity.
   */
  colors: readonly (readonly [number, number])[] | Subscribable<readonly (readonly [number, number])[]>;

  /** The gain of the weather radar, in dBZ. */
  gain: Subscribable<number>;

  /** Whether weather radar data is in a failure state. */
  isDataFailed: Subscribable<boolean>;

  /**
   * The padding inside the weather radar display respected by the radar arc in horizontal scan mode, as
   * `[left, top, right, bottom]` in pixels. Defaults to `[0, 0, 0, 0]`.
   */
  horizontalScanPadding?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The padding inside the weather radar display respected by the radar arc in vertical scan mode, as
   * `[left, top, right, bottom]` in pixels. Defaults to `[0, 0, 0, 0]`.
   */
  verticalScanPadding?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The amount the vertical range lines extend outward from the boundaries of the radar arc, in pixels.
   * Defaults to 0 pixels.
   */
  verticalRangeLineExtend?: number | Subscribable<number>;

  /** The angular width of the reference line, in degrees. Defaults to 0 degrees. */
  referenceLineAngularWidth?: number;

  /** A mutable subscribable to bind to the position of the center of the radar arc, as `[x, y]` in pixels. */
  arcOrigin?: MutableSubscribable<any, ReadonlyFloat64Array>;

  /** A mutable subscribable to bind to the radius of the radar arc, in pixels. */
  arcRadius?: MutableSubscribable<any, number>;

  /** A mutable subscribable to bind to the bounding rect of the radar arc, as `[left, top, right, bottom]` in pixels. */
  arcBounds?: MutableSubscribable<any, ReadonlyFloat64Array>;
}

/**
 * A Garmin weather radar display.
 */
export class WeatherRadar extends DisplayComponent<WeatherRadarProps> {
  private static readonly DEFAULT_PADDING = VecNMath.create(4); // px
  private static readonly DEFAULT_VERTICAL_RANGE_LINE_EXTEND = 0; // px
  private static readonly DEFAULT_BEARING_LINE_ANGULAR_WIDTH = 1; // degrees

  private static readonly VERTICAL_RANGE_MARKER_HEIGHT = 60000; // feet

  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];

  private readonly bingRef = FSComponent.createRef<BingComponent>();
  private readonly rangeLabelRefs = Array.from({ length: 4 }, () => FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>());

  private readonly rootStyle = ObjectSubject.create({
    width: '0px',
    height: '0px',
    '--weather-radar-arc-origin-x': '0px',
    '--weather-radar-arc-origin-y': '0px',
    '--weather-radar-arc-radius': '0px',
    '--weather-radar-arc-left': '0px',
    '--weather-radar-arc-top': '0px',
    '--weather-radar-arc-right': '0px',
    '--weather-radar-arc-bottom': '0px',
  });

  private readonly bingStyle = ObjectSubject.create({
    display: 'none',
    position: 'absolute',
    left: '0',
    top: '0',
    width: '0px',
    height: '0px'
  });

  private readonly rangeLabelStyles = Array.from({ length: 4 }, () => ObjectSubject.create({
    position: 'absolute',
    left: '0',
    right: '0',
    top: '0',
    bottom: '0'
  }));

  private readonly verticalRangeLineStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly verticalRangeLabelTopStyle = ObjectSubject.create({
    display: 'none',
    position: 'absolute',
    left: '0',
    bottom: '0'
  });

  private readonly verticalRangeLabelBottomStyle = ObjectSubject.create({
    display: 'none',
    position: 'absolute',
    left: '0',
    top: '0'
  });

  private readonly referenceLineContainerStyle = ObjectSubject.create({
    display: 'none',
    position: 'absolute',
    left: '0',
    top: '0',
    width: '0px',
    height: '0px',
    transform: 'rotate3d(0, 0, 1, 0deg)',
    'transform-origin': '0% 50%'
  });

  private readonly rootCssClass = SetSubject.create(['weather-radar']);

  private readonly svgPathStream = new SvgPathStream(0.1);
  private readonly svgTransformPathStream = new AffineTransformPathStream(this.svgPathStream);

  private readonly horizontalScanAngularWidth = SubscribableUtils.toSubscribable(this.props.horizontalScanAngularWidth, true);
  private readonly verticalScanAngularWidth = SubscribableUtils.toSubscribable(this.props.verticalScanAngularWidth, true);

  private readonly size = SubscribableUtils.toSubscribable(this.props.size, true);
  private readonly horizontalScanPadding = SubscribableUtils.toSubscribable(this.props.horizontalScanPadding ?? WeatherRadar.DEFAULT_PADDING, true);
  private readonly verticalScanPadding = SubscribableUtils.toSubscribable(this.props.verticalScanPadding ?? WeatherRadar.DEFAULT_PADDING, true);

  private readonly verticalRangeLineExtend = SubscribableUtils.toSubscribable(this.props.verticalRangeLineExtend ?? WeatherRadar.DEFAULT_VERTICAL_RANGE_LINE_EXTEND, true);

  private readonly referenceLineAngularWidth = (this.props.referenceLineAngularWidth ?? WeatherRadar.DEFAULT_BEARING_LINE_ANGULAR_WIDTH) * Avionics.Utils.DEG2RAD;

  private scanMode = WeatherRadarScanMode.Horizontal;
  private isSwitchingScanMode = false;

  /** The [x, y] position, in pixels, of the center of the weather radar arc. */
  private readonly arcOrigin = Vec2Math.create();
  /** The radius, in pixels, of the weather radar arc. */
  private arcRadius = 0;
  /** The angular width, in radians, of the weather radar arc. */
  private arcAngularWidth = 0;
  /** The bounding rect of the weather radar arc. */
  private readonly arcBounds = VecNMath.create(4);

  private readonly overlayViewBox = Subject.create('0 0 0 0');
  private readonly boundaryLinePath = Subject.create('');
  private readonly rangeLinesPath = Subject.create('');

  private readonly referenceLineContainerViewBox = Subject.create('0 0 0 0');
  private readonly referenceLinePath = Subject.create('');

  private readonly verticalRangeLinesPath = Subject.create('');

  private readonly position = ConsumerSubject.create(null, new LatLongAlt(), (a, b) => a.lat === b.lat && a.long === b.long);

  private readonly wxrMode = Subject.create({ mode: EWeatherRadar.HORIZONTAL, arcRadians: MathUtils.HALF_PI }, (a, b) => a.mode === b.mode && a.arcRadians === b.arcRadians);

  private readonly ranges = Array.from({ length: 4 }, () => NumberUnitSubject.create(UnitType.NMILE.createNumber(0)));

  private readonly verticalRangeTop = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly verticalRangeBottom = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private readonly isReferenceLineVisible = MappedSubject.create(
    ([showBearing, showTilt, scanMode]): boolean => {
      return scanMode === WeatherRadarScanMode.Horizontal ? showBearing : showTilt;
    },
    this.props.showBearingLine,
    this.props.showTiltLine,
    this.props.scanMode
  );

  private readonly colors = SubscribableUtils.toSubscribable(this.props.colors, true);
  private readonly bingWxrColorsWorkingArray: [number, number][] = [];
  private readonly bingWxrColors = ArraySubject.create<readonly [number, number]>();

  private needResize = false;
  private needReposition = false;
  private needUpdateBingWxrMode = false;
  private needUpdateBingWxrColors = false;
  private needRedrawOverlay = false;
  private needRedrawVerticalRangeLines = false;
  private needUpdateBing = false;
  private needUpdateReferenceLineVisibility = false;
  private needRotateReferenceLine = false;

  private operatingModeSub?: Subscription;
  private scanModeSub?: Subscription;
  private horizontalScanAngularWidthSub?: Subscription;
  private verticalScanAngularWidthSub?: Subscription;
  private rangeSub?: Subscription;
  private isDataFailedSub?: Subscription;
  private sizeSub?: Subscription;
  private horizontalScanPaddingSub?: Subscription;
  private verticalScanPaddingSub?: Subscription;
  private verticalRangeLineExtendSub?: Subscription;
  private colorsSub?: Subscription;
  private gainSub?: Subscription;

  private isAlive = true;
  private isInit = false;
  private isAwake = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.sizeSub = this.size.sub(() => { this.needResize = true; }, true);

    this.horizontalScanPaddingSub = this.horizontalScanPadding.sub(() => {
      this.needReposition ||= this.props.scanMode.get() === WeatherRadarScanMode.Horizontal;
    }, true);
    this.verticalScanPaddingSub = this.verticalScanPadding.sub(() => {
      this.needReposition ||= this.props.scanMode.get() === WeatherRadarScanMode.Vertical;
    }, true);

    this.verticalRangeLineExtendSub = this.verticalRangeLineExtend.sub(() => {
      this.needRedrawVerticalRangeLines ||= this.props.scanMode.get() === WeatherRadarScanMode.Vertical;
    }, true);

    this.operatingModeSub = this.props.operatingMode.sub(() => { this.needUpdateBing = true; }, true);
    this.isDataFailedSub = this.props.isDataFailed.sub(() => { this.needUpdateBing = true; }, true);

    this.scanModeSub = this.props.scanMode.sub(mode => {
      if (mode === WeatherRadarScanMode.Horizontal) {
        this.rootCssClass.delete('scan-vertical');
        this.rootCssClass.add('scan-horizontal');
      } else {
        this.rootCssClass.delete('scan-horizontal');
        this.rootCssClass.add('scan-vertical');
      }

      this.needReposition = true;
      this.needUpdateBingWxrMode = true;
      this.needRotateReferenceLine = true;
    }, true);

    this.horizontalScanAngularWidthSub = this.horizontalScanAngularWidth.sub(() => {
      const isHorizontal = this.props.scanMode.get() === WeatherRadarScanMode.Horizontal;
      this.needReposition ||= isHorizontal;
      this.needUpdateBingWxrMode ||= isHorizontal;
    }, true);

    this.verticalScanAngularWidthSub = this.verticalScanAngularWidth.sub(() => {
      const isVertical = this.props.scanMode.get() === WeatherRadarScanMode.Vertical;
      this.needReposition ||= isVertical;
      this.needUpdateBingWxrMode ||= isVertical;
    }, true);

    this.rangeSub = this.props.range.sub(range => {
      for (let i = 0; i < this.ranges.length; i++) {
        this.ranges[i].set(range.asUnit(UnitType.NMILE) * (i + 1) / 4);
      }

      this.needUpdateBing = true;

      this.needRedrawVerticalRangeLines ||= this.props.scanMode.get() === WeatherRadarScanMode.Vertical;
    }, true);

    this.position.setConsumer(this.props.bus.getSubscriber<GNSSEvents>().on('gps-position'));

    this.position.sub(() => { this.needUpdateBing = true; }, true);

    this.isReferenceLineVisible.sub(() => {
      this.needUpdateReferenceLineVisibility = true;
    }, true);

    this.colorsSub = this.colors.sub(() => { this.needUpdateBingWxrColors = true; }, true);
    this.gainSub = this.props.gain.sub(() => { this.needUpdateBingWxrColors = true; }, true);

    this.isInit = true;

    if (!this.isAwake) {
      this.bingRef.instance.sleep();
    }
  }

  /**
   * Wakes this weather radar. Once awake, this radar will be able to update.
   * @throws Error if this weather radar is dead.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('WeatherRadar: cannot wake a dead component');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    if (!this.isInit) {
      return;
    }

    this.bingRef.instance.wake();
  }

  /**
   * Puts this weather radar to sleep. Once asleep, this radar will not be able to update until it is awakened.
   * @throws Error if this weather radar is dead.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('WeatherRadar: cannot sleep a dead component');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    if (!this.isInit) {
      return;
    }

    this.bingRef.instance.sleep();
  }

  /**
   * Updates this weather radar.
   * @throws Error if this weather radar is dead.
   */
  public update(): void {
    if (!this.isAlive) {
      throw new Error('WeatherRadar: cannot update a dead component');
    }

    if (!this.isInit || !this.isAwake) {
      return;
    }

    if (this.needResize) {
      this.resizeContainer(this.size.get());
      this.needReposition = true;
    }

    if (this.needUpdateBingWxrMode) {
      this.updateBingWxrMode();
    }

    if (this.needReposition) {
      this.recomputePositioning();
      this.repositionBing();
      this.needRedrawOverlay = true;
    }

    if (this.needRedrawOverlay) {
      this.redrawOverlay();
    } else if (this.needRedrawVerticalRangeLines) {
      this.drawVerticalRangeLines(this.size.get(), this.arcOrigin, this.arcRadius, this.arcAngularWidth, this.props.range.get().asUnit(UnitType.FOOT));
    }

    if (this.needUpdateBingWxrColors) {
      this.updateBingWxrColors();
    }

    if (this.needUpdateBing) {
      if (!this.props.isDataFailed.get() && this.props.operatingMode.get() === WeatherRadarOperatingMode.Weather) {
        this.bingStyle.set('display', this.isSwitchingScanMode ? 'none' : '');

        const pos = this.position.get();
        this.bingRef.instance.setPositionRadius(new LatLong(pos.lat, pos.long), this.props.range.get().asUnit(UnitType.METER));
      } else {
        this.bingStyle.set('display', 'none');
      }
    }

    if (this.needUpdateReferenceLineVisibility) {
      this.referenceLineContainerStyle.set('display', this.isReferenceLineVisible.get() ? '' : 'none');
    }

    if (this.needRotateReferenceLine) {
      this.referenceLineContainerStyle.set('transform', `rotate3d(0, 0, 1, ${this.props.scanMode.get() === WeatherRadarScanMode.Horizontal ? -90 : 0}deg)`);
    }

    this.needResize = false;
    this.needReposition = false;
    this.needUpdateBingWxrMode = false;
    this.needUpdateBingWxrColors = false;
    this.needRedrawOverlay = false;
    this.needRedrawVerticalRangeLines = false;
    this.needUpdateBing = this.isSwitchingScanMode;
    this.isSwitchingScanMode = false;
    this.needUpdateReferenceLineVisibility = false;
    this.needRotateReferenceLine = false;
  }

  /**
   * Resizes this weather radar's root container.
   * @param size The size of the root container.
   */
  private resizeContainer(size: ReadonlyFloat64Array): void {
    this.rootStyle.set('width', `${size[0]}px`);
    this.rootStyle.set('height', `${size[1]}px`);
  }

  /**
   * Updates this weather radar's Bing component weather mode.
   */
  private updateBingWxrMode(): void {
    const scanMode = this.props.scanMode.get();

    if (scanMode !== this.scanMode) {
      this.scanMode = scanMode;
      this.needUpdateBing ||= !this.isSwitchingScanMode;
      this.isSwitchingScanMode = true;
    }

    this.arcAngularWidth = (
      this.scanMode === WeatherRadarScanMode.Horizontal
        ? this.horizontalScanAngularWidth.get()
        : this.verticalScanAngularWidth.get()
    ) * Avionics.Utils.DEG2RAD;

    this.wxrMode.set({ mode: this.scanMode === WeatherRadarScanMode.Horizontal ? EWeatherRadar.HORIZONTAL : EWeatherRadar.VERTICAL, arcRadians: this.arcAngularWidth });
  }

  /**
   * Recomputes the size and positioning of this weather radar's radar arc.
   */
  private recomputePositioning(): void {
    const size = this.size.get();
    const width = size[0], height = size[1];

    const aspectRatio = 1 / (2 * Math.sin(this.arcAngularWidth / 2));

    if (this.scanMode === WeatherRadarScanMode.Horizontal) {
      const padding = this.horizontalScanPadding.get();

      this.arcRadius = Math.max(0, Math.min(height - padding[1] - padding[3], (width - padding[0] - padding[2]) * aspectRatio));
      Vec2Math.set((padding[0] + width - padding[2]) / 2, height - padding[3], this.arcOrigin);

      const arcWidth = this.arcRadius / aspectRatio;
      VecNMath.set(this.arcBounds, this.arcOrigin[0] - arcWidth / 2, this.arcOrigin[1] - this.arcRadius, this.arcOrigin[0] + arcWidth / 2, this.arcOrigin[1]);
    } else {
      const padding = this.verticalScanPadding.get();

      this.arcRadius = Math.max(0, Math.min((width - padding[0] - padding[2]), (height - padding[1] - padding[3]) * aspectRatio));
      Vec2Math.set(padding[0], (padding[1] + height - padding[3]) / 2, this.arcOrigin);

      const arcHeight = this.arcRadius / aspectRatio;
      VecNMath.set(this.arcBounds, this.arcOrigin[0], this.arcOrigin[1] - arcHeight / 2, this.arcOrigin[0] + this.arcRadius, this.arcOrigin[1] + arcHeight / 2);
    }

    this.rootStyle.set('--weather-radar-arc-origin-x', `${this.arcOrigin[0]}px`);
    this.rootStyle.set('--weather-radar-arc-origin-y', `${this.arcOrigin[1]}px`);
    this.rootStyle.set('--weather-radar-arc-radius', `${this.arcRadius}px`);
    this.rootStyle.set('--weather-radar-arc-left', `${this.arcBounds[0]}px`);
    this.rootStyle.set('--weather-radar-arc-top', `${this.arcBounds[1]}px`);
    this.rootStyle.set('--weather-radar-arc-right', `${this.arcBounds[2]}px`);
    this.rootStyle.set('--weather-radar-arc-bottom', `${this.arcBounds[3]}px`);

    this.props.arcOrigin?.set(this.arcOrigin);
    this.props.arcRadius?.set(this.arcRadius);
    this.props.arcBounds?.set(this.arcBounds);
  }

  /**
   * Repositions this weather radar's Bing component.
   */
  private repositionBing(): void {
    const size = this.arcRadius * 2;

    this.bingStyle.set('width', `${size}px`);
    this.bingStyle.set('height', `${size}px`);
    this.bingStyle.set('left', `${this.arcOrigin[0] - size / 2}px`);
    this.bingStyle.set('top', `${this.arcOrigin[1] - size / 2}px`);
  }

  /**
   * Redraws this weather radar's overlay elements, including the radar arc boundary lines, range lines, and reference
   * line.
   */
  private redrawOverlay(): void {
    const size = this.size.get();
    const isScanHorizontal = this.props.scanMode.get() === WeatherRadarScanMode.Horizontal;

    this.overlayViewBox.set(`0 0 ${size[0]} ${size[1]}`);

    const facing = isScanHorizontal ? -MathUtils.HALF_PI : 0;

    this.drawBoundaryLines(this.arcOrigin, this.arcRadius, facing, this.arcAngularWidth);
    this.drawRangeLines(size, this.arcOrigin, this.arcRadius, facing, this.arcAngularWidth);
    this.drawReferenceLine(this.arcOrigin, this.arcRadius);

    if (isScanHorizontal) {
      this.hideVerticalRangeLines();
    } else {
      this.drawVerticalRangeLines(size, this.arcOrigin, this.arcRadius, this.arcAngularWidth, this.props.range.get().asUnit(UnitType.FOOT));
    }
  }

  /**
   * Draws radar arc boundary lines.
   * @param arcOrigin The position of the center of the radar arc, as `[x, y]` in pixels.
   * @param arcRadius The radius of the radar arc, in pixels.
   * @param facing The facing angle of the radar arc, in radians. An angle of `0` points in the positive x-direction,
   * with positive angles proceeding clockwise.
   * @param arcAngularWidth The angular width of the radar arc, in radians.
   */
  private drawBoundaryLines(arcOrigin: ReadonlyFloat64Array, arcRadius: number, facing: number, arcAngularWidth: number): void {
    this.svgTransformPathStream
      .resetTransform()
      .addRotation(facing - arcAngularWidth / 2)
      .addTranslation(arcOrigin[0], arcOrigin[1]);

    this.svgTransformPathStream.beginPath();

    this.svgTransformPathStream.moveTo(arcRadius, 0);
    this.svgTransformPathStream.lineTo(0, 0);

    this.svgTransformPathStream.addRotation(arcAngularWidth, 'before');

    this.svgTransformPathStream.lineTo(arcRadius, 0);

    this.boundaryLinePath.set(this.svgPathStream.getSvgPath());
  }

  /**
   * Draws radar arc range lines.
   * @param size The size of this weather radar display, as `[width, height]` in pixels.
   * @param arcOrigin The position of the center of the radar arc, as `[x, y]` in pixels.
   * @param arcRadius The radius of the radar arc, in pixels.
   * @param facing The facing angle of the radar arc, in radians. An angle of `0` points in the positive x-direction,
   * with positive angles proceeding clockwise.
   * @param arcAngularWidth The angular width of the radar arc, in radians.
   */
  private drawRangeLines(size: ReadonlyFloat64Array, arcOrigin: ReadonlyFloat64Array, arcRadius: number, facing: number, arcAngularWidth: number): void {
    const leftAngle = facing - arcAngularWidth / 2;
    const rightAngle = leftAngle + arcAngularWidth;

    // set anchor point for range labels based on quadrant they appear in
    const useLeft = Math.sin(rightAngle) <= 0;
    const useTop = Math.cos(rightAngle) >= 0;
    const labelXToSet = useLeft ? 'left' : 'right';
    const labelXScale = useLeft ? 1 : -1;
    const labelXOffset = useLeft ? 0 : size[0];
    const labelYToSet = useTop ? 'top' : 'bottom';
    const labelYScale = useTop ? 1 : -1;
    const labelYOffset = useTop ? 0 : size[1];
    const labelXToClear = useLeft ? 'right' : 'left';
    const labelYToClear = useTop ? 'bottom' : 'top';

    const leftEndpoint = Vec2Math.setFromPolar(1, leftAngle, WeatherRadar.vec2Cache[0]);
    const rightEndpoint = Vec2Math.setFromPolar(1, rightAngle, WeatherRadar.vec2Cache[1]);

    this.svgPathStream.beginPath();

    for (let i = 4; i > 0; i--) {
      const radius = arcRadius * i / 4;

      this.svgPathStream.moveTo(leftEndpoint[0] * radius + arcOrigin[0], leftEndpoint[1] * radius + arcOrigin[1]);
      this.svgPathStream.arc(arcOrigin[0], arcOrigin[1], radius, leftAngle, rightAngle);

      const labelStyle = this.rangeLabelStyles[i - 1];

      labelStyle.set(labelXToSet, `${(rightEndpoint[0] * radius + arcOrigin[0]) * labelXScale + labelXOffset}px`);
      labelStyle.set(labelYToSet, `${(rightEndpoint[1] * radius + arcOrigin[1]) * labelYScale + labelYOffset}px`);
      labelStyle.set(labelXToClear, '');
      labelStyle.set(labelYToClear, '');
    }

    this.rangeLinesPath.set(this.svgPathStream.getSvgPath());
  }

  /**
   * Draws a reference line.
   * @param arcOrigin The position of the center of the radar arc, as `[x, y]` in pixels.
   * @param arcRadius The radius of the radar arc, in pixels.
   */
  private drawReferenceLine(arcOrigin: ReadonlyFloat64Array, arcRadius: number): void {
    this.referenceLineContainerViewBox.set(`0 ${-arcRadius / 2} ${arcRadius} ${arcRadius}`);

    this.referenceLineContainerStyle.set('left', `${arcOrigin[0]}px`);
    this.referenceLineContainerStyle.set('top', `${arcOrigin[1] - arcRadius / 2}px`);
    this.referenceLineContainerStyle.set('width', `${arcRadius}px`);
    this.referenceLineContainerStyle.set('height', `${arcRadius}px`);

    this.svgTransformPathStream
      .resetTransform()
      .addRotation(-this.referenceLineAngularWidth / 2);

    this.svgTransformPathStream.beginPath();

    this.svgTransformPathStream.moveTo(arcRadius * 0.15, 0);
    this.svgTransformPathStream.lineTo(arcRadius, 0);

    this.svgTransformPathStream.addRotation(this.referenceLineAngularWidth, 'before');

    this.svgTransformPathStream.lineTo(arcRadius, 0);
    this.svgTransformPathStream.lineTo(arcRadius * 0.15, 0);
    this.svgTransformPathStream.closePath();

    this.referenceLinePath.set(this.svgPathStream.getSvgPath());
  }

  /**
   * Draws radar arc vertical range lines.
   * @param size The size of this weather radar display, as `[width, height]` in pixels.
   * @param arcOrigin The position of the center of the radar arc, as `[x, y]` in pixels.
   * @param arcRadius The radius of the radar arc, in pixels.
   * @param arcAngularWidth The angular width of the radar arc, in radians.
   * @param range The display range of this weather radar.
   */
  private drawVerticalRangeLines(size: ReadonlyFloat64Array, arcOrigin: ReadonlyFloat64Array, arcRadius: number, arcAngularWidth: number, range: number): void {
    const maxLineOffset = arcRadius * Math.sin(arcAngularWidth / 2) * 0.75;

    if (maxLineOffset <= 0) {
      this.hideVerticalRangeLines();
      return;
    }

    let height = WeatherRadar.VERTICAL_RANGE_MARKER_HEIGHT;
    let lineOffset = height / range * arcRadius;

    while (lineOffset > maxLineOffset) {
      lineOffset *= 0.5;
      height *= 0.5;
    }

    const lineExtend = this.verticalRangeLineExtend.get();

    const lineStartX = arcOrigin[0] + lineOffset / Math.tan(arcAngularWidth / 2) - lineExtend;
    const lineEndX = arcOrigin[0] + arcRadius + lineExtend;

    this.verticalRangeLinesPath.set(
      `M ${lineStartX} ${arcOrigin[1] + lineOffset} L ${lineEndX} ${arcOrigin[1] + lineOffset} M ${lineStartX} ${arcOrigin[1] - lineOffset} L ${lineEndX} ${arcOrigin[1] - lineOffset}`
    );

    this.verticalRangeLineStyle.set('display', '');

    this.verticalRangeLabelTopStyle.set('display', '');
    this.verticalRangeLabelTopStyle.set('left', `${lineEndX}px`);
    this.verticalRangeLabelTopStyle.set('bottom', `${size[1] - (arcOrigin[1] - lineOffset)}px`);

    this.verticalRangeLabelBottomStyle.set('display', '');
    this.verticalRangeLabelBottomStyle.set('left', `${lineEndX}px`);
    this.verticalRangeLabelBottomStyle.set('top', `${arcOrigin[1] + lineOffset}px`);

    this.verticalRangeTop.set(height);
    this.verticalRangeBottom.set(-height);
  }

  /**
   * Hides this weather radar's vertical range lines.
   */
  private hideVerticalRangeLines(): void {
    this.verticalRangeLineStyle.set('display', 'none');
    this.verticalRangeLabelTopStyle.set('display', 'none');
    this.verticalRangeLabelBottomStyle.set('display', 'none');
  }

  /**
   * Updates this weather radar's Bing component weather colors.
   */
  private updateBingWxrColors(): void {
    const colors = this.colors.get();
    const gain = this.props.gain.get();

    this.bingWxrColorsWorkingArray.length = colors.length;

    for (let i = 0; i < colors.length; i++) {
      const stop = colors[i];
      const bingStop = (this.bingWxrColorsWorkingArray[i] ??= [0, 0]);
      bingStop[0] = stop[0];
      bingStop[1] = MathUtils.round(WeatherRadarUtils.dbzToPrecipRate(stop[1] - gain), 0.01);
    }

    this.bingWxrColors.set(this.bingWxrColorsWorkingArray);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='weather-radar-bing-container' style={this.bingStyle}>
          <BingComponent
            ref={this.bingRef}
            id={this.props.bingId}
            mode={EBingMode.PLANE}
            wxrMode={this.wxrMode}
            wxrColors={this.bingWxrColors}
          />
        </div>
        <svg viewBox={this.overlayViewBox} class='weather-radar-overlay' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
          <path d={this.boundaryLinePath} class='weather-radar-boundary-line' />
          <path d={this.rangeLinesPath} class='weather-radar-range-lines' />
          <path d={this.verticalRangeLinesPath} class='weather-radar-vertical-range-lines' style={this.verticalRangeLineStyle} />
        </svg>
        <svg viewBox={this.referenceLineContainerViewBox} class='weather-radar-reference-line-container' style={this.referenceLineContainerStyle}>
          <path d={this.referenceLinePath} class='weather-radar-reference-line' />
        </svg>
        <div style={this.verticalRangeLabelTopStyle}>
          <NumberUnitDisplay
            value={this.verticalRangeTop}
            displayUnit={null}
            formatter={NumberFormatter.create({ precision: 1, showCommas: true, forceSign: true })}
            class='weather-radar-vertical-range-label weather-radar-vertical-range-label-top'
          />
        </div>
        <div style={this.verticalRangeLabelBottomStyle}>
          <NumberUnitDisplay
            value={this.verticalRangeBottom}
            displayUnit={null}
            formatter={NumberFormatter.create({ precision: 1, showCommas: true, forceSign: true })}
            class='weather-radar-vertical-range-label weather-radar-vertical-range-label-bottom'
          />
        </div>
        {
          this.ranges.map((range, index) => {
            return (
              <div style={this.rangeLabelStyles[index]}>
                <NumberUnitDisplay
                  ref={this.rangeLabelRefs[index]}
                  value={range}
                  displayUnit={this.props.rangeUnit}
                  formatter={NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false, maxDigits: 3 })}
                  class={`weather-radar-range-label weather-radar-range-label-${index + 1}`}
                />
              </div>
            );
          })
        }
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isAlive = false;

    this.bingRef.getOrDefault()?.destroy();
    this.rangeLabelRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    this.position.destroy();

    this.operatingModeSub?.destroy();
    this.scanModeSub?.destroy();
    this.horizontalScanAngularWidthSub?.destroy();
    this.verticalScanAngularWidthSub?.destroy();
    this.rangeSub?.destroy();
    this.isDataFailedSub?.destroy();
    this.sizeSub?.destroy();
    this.horizontalScanPaddingSub?.destroy();
    this.verticalScanPaddingSub?.destroy();
    this.verticalRangeLineExtendSub?.destroy();
    this.colorsSub?.destroy();
    this.gainSub?.destroy();
  }
}