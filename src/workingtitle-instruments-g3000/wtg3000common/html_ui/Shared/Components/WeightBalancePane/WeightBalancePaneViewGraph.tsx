import {
  ArrayUtils, ClippedPathStream, ComponentProps, ConsumerSubject, ConsumerValue, CssTransformBuilder,
  CssTransformChain, CssTransformSubject, CssTranslate3dTransform, CssTranslateTransform, DisplayComponent, EventBus,
  FSComponent, MappedSubject, MathUtils, MutableSubscribable, NullPathStream, PathStream, Subject,
  SubscribableMapFunctions, Subscription, UnitType, UserSettingManager, VNode, VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import { UnitFormatter, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { G3000WeightBalanceEvents } from '../../Performance/WeightBalance/G3000WeightBalanceEvents';
import { WeightBalanceConfig } from '../../Performance/WeightBalance/WeightBalanceConfig';
import { WeightBalanceEnvelopeDef, WeightBalanceEnvelopeGraphScaleDef } from '../../Performance/WeightBalance/WeightBalanceTypes';
import { WeightFuelEvents } from '../../Performance/WeightFuel/WeightFuelEvents';
import { WeightBalanceUserSettingManager } from '../../Settings/WeightBalanceUserSettings';
import { WeightFuelUserSettingTypes } from '../../Settings/WeightFuelUserSettings';
import { WeightBalancePaneViewPanel } from './WeightBalancePaneViewPanel';

import './WeightBalancePaneViewGraph.css';

/**
 * Component props for {@link WeightBalancePaneViewGraph}.
 */
export interface WeightBalancePaneViewGraphProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight/fuel user settings. */
  weightFuelSettingManager: UserSettingManager<WeightFuelUserSettingTypes>;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * Display modes for graph panel markers.
 */
type MarkerMode = 'caution' | 'normal' | 'none';

/**
 * A CG vs weight graph panel for the weight and balance pane.
 */
export class WeightBalancePaneViewGraph extends DisplayComponent<WeightBalancePaneViewGraphProps> implements WeightBalancePaneViewPanel {
  private static readonly EMPTY_LINE_DASH = [];

  private static readonly GRID_LINE_WIDTH = 1; // px
  private static readonly GRID_LINE_COLOR = '#404040';

  private static readonly ENVELOPE_LINE_WIDTH = 2; // px
  private static readonly ENVELOPE_LINE_COLOR = '#ffffff';

  private static readonly CG_LINE_WIDTH = 4; // px
  private static readonly CG_LINE_COLOR = '#00ff00';
  private static readonly CG_LINE_CAUTION_COLOR = '#ffff00';

  private isPaneInFullMode = false;

  private readonly weightUnitText = this.props.unitsSettingManager.weightUnits.map(UnitFormatter.create());

  private readonly armUnitText = MappedSubject.create(
    ([weightUnit, def]) => {
      if (def.useMac) {
        return '%MAC';
      } else {
        const armUnitLongText = weightUnit.equals(UnitType.KILOGRAM) ? 'Centimeters' : 'Inches';
        return `${armUnitLongText} Aft of Datum`;
      }
    },
    this.props.unitsSettingManager.weightUnits,
    this.props.weightBalanceSettingManager.activeEnvelopeDef
  );

  private readonly weightScaleLabelText = ArrayUtils.create(10, () => Subject.create(''));
  private readonly armScaleLabelText = ArrayUtils.create(10, () => Subject.create(''));

  private readonly plotAreaRef = FSComponent.createRef<HTMLDivElement>();
  private readonly canvasRef = FSComponent.createRef<HTMLCanvasElement>();
  private canvasContext: CanvasRenderingContext2D | null = null;
  private readonly clipBounds = VecNSubject.create(VecNMath.create(4));
  private readonly clipPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.clipBounds);
  private needRefreshPlot = false;

  private envelopeDef?: Readonly<WeightBalanceEnvelopeDef>;
  private scaleDef?: Readonly<WeightBalanceEnvelopeGraphScaleDef>;
  private scaleWidth = 0;
  private scaleHeight = 0;

  private readonly zeroFuelWeightSource = ConsumerValue.create(null, 0);
  private readonly rampWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly zeroFuelMomentSource = ConsumerSubject.create(null, 0).pause();

  private readonly takeoffWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly takeoffArmSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly takeoffMarkerMode = MappedSubject.create(
    ([envelopeDef, weight, arm]): MarkerMode => {
      if (weight === null || arm === null) {
        return 'none';
      }

      return weight < envelopeDef.minWeight || weight > envelopeDef.maxWeight
        || arm < envelopeDef.getMinArm(weight) || arm > envelopeDef.getMaxArm(weight)
        ? 'caution' : 'normal';
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.takeoffWeightSource,
    this.takeoffArmSource
  ).pause();
  private readonly takeoffMarkerHidden = Subject.create(true);
  private readonly takeoffMarkerTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px')
  ));

  private readonly currentWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly currentWeight = this.currentWeightSource.map(WeightBalancePaneViewGraph.withPrecisionNullable.bind(undefined, 1));
  private readonly currentArmSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly currentArm = this.currentArmSource.map(WeightBalancePaneViewGraph.withPrecisionNullable.bind(undefined, 0.01));
  private readonly isCurrentMarkerOffscale = Subject.create(false);
  private readonly currentMarkerMode = MappedSubject.create(
    ([envelopeDef, weight, arm, isCurrentMarkerOffscale]): MarkerMode => {
      if (isCurrentMarkerOffscale || weight === null || arm === null) {
        return 'none';
      }

      return weight < envelopeDef.minWeight || weight > envelopeDef.maxWeight
        || arm < envelopeDef.getMinArm(weight) || arm > envelopeDef.getMaxArm(weight)
        ? 'caution' : 'normal';
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.currentWeight,
    this.currentArm,
    this.isCurrentMarkerOffscale
  ).pause();
  private readonly currentMarkerHidden = Subject.create(true);
  private readonly currentMarkerTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px')
  ));

  private readonly landingWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly landingWeight = this.landingWeightSource.map(WeightBalancePaneViewGraph.withPrecisionNullable.bind(undefined, 1));
  private readonly landingArmSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly landingArm = this.landingArmSource.map(WeightBalancePaneViewGraph.withPrecisionNullable.bind(undefined, 0.01));
  private readonly landingMarkerMode = MappedSubject.create(
    ([envelopeDef, weight, arm]): MarkerMode => {
      if (weight === null || arm === null) {
        return 'none';
      }

      return weight < envelopeDef.minWeight || weight > envelopeDef.maxWeight || weight > envelopeDef.maxLandingWeight
        || arm < envelopeDef.getMinArm(weight) || arm > envelopeDef.getMaxArm(weight)
        ? 'caution' : 'normal';
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.landingWeight,
    this.landingArm
  ).pause();
  private readonly landingMarkerHidden = Subject.create(true);
  private readonly landingMarkerTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px')
  ));

  private readonly envelopeLegendText = this.props.weightBalanceSettingManager.activeEnvelopeDef.map(def => def.name).pause();

  private readonly subscriptions: Subscription[] = [
    this.weightUnitText,
    this.armUnitText,
    this.rampWeightSource,
    this.zeroFuelMomentSource,
    this.takeoffWeightSource,
    this.takeoffArmSource,
    this.takeoffMarkerMode,
    this.currentWeightSource,
    this.currentArmSource,
    this.currentMarkerMode,
    this.landingWeightSource,
    this.landingArmSource,
    this.landingMarkerMode,
    this.envelopeLegendText
  ];

  private readonly canvasRefreshSubs: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.canvasContext = this.canvasRef.instance.getContext('2d');

    this.takeoffMarkerTransform.transform.getChild(0).set(-50, -50);
    this.currentMarkerTransform.transform.getChild(0).set(-50, -50);
    this.landingMarkerTransform.transform.getChild(0).set(-50, -50);

    const sub = this.props.bus.getSubscriber<WeightFuelEvents & G3000WeightBalanceEvents>();

    this.zeroFuelWeightSource.setConsumer(sub.on('weightfuel_zero_fuel_weight'));
    this.rampWeightSource.setConsumer(sub.on('weightfuel_ramp_weight'));
    this.zeroFuelMomentSource.setConsumer(sub.on('weightbalance_zero_fuel_moment'));

    this.currentWeightSource.setConsumer(sub.on('weightfuel_aircraft_weight').withPrecision(0));
    this.currentArmSource.setConsumer(sub.on('weightbalance_aircraft_arm').withPrecision(2));
    this.landingWeightSource.setConsumer(sub.on('weightfuel_landing_weight').withPrecision(0));
    this.landingArmSource.setConsumer(sub.on('weightbalance_landing_arm').withPrecision(2));

    const scheduleRefreshPlot = (): void => { this.needRefreshPlot = true; };

    this.canvasRefreshSubs.push(
      this.props.weightBalanceSettingManager.activeEnvelopeDef.sub(scheduleRefreshPlot, false, true),
      this.props.unitsSettingManager.weightUnits.sub(scheduleRefreshPlot, false, true),
      this.zeroFuelMomentSource.sub(scheduleRefreshPlot, false, true),
      this.rampWeightSource.sub(scheduleRefreshPlot, false, true)
    );
  }

  /** @inheritDoc */
  public onResume(isPaneInFullMode: boolean): void {
    this.isPaneInFullMode = isPaneInFullMode;

    for (const sub of this.subscriptions) {
      sub.resume(true);
    }

    this.needRefreshPlot = true;

    for (const sub of this.canvasRefreshSubs) {
      sub.resume();
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }

    for (const sub of this.canvasRefreshSubs) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onUpdate(): void {
    if (this.needRefreshPlot) {
      this.refreshPlotParams();
      this.refreshScaleLabels();
      this.refreshCanvas();
      this.needRefreshPlot = false;
    }

    this.updateMarkers();
  }

  /**
   * Refreshes this panel's plot parameters.
   */
  private refreshPlotParams(): void {
    const plotArea = this.plotAreaRef.instance;
    this.scaleWidth = plotArea.offsetWidth;
    this.scaleHeight = plotArea.offsetHeight;
    this.envelopeDef = this.props.weightBalanceSettingManager.activeEnvelopeDef.get();
    this.scaleDef = this.isPaneInFullMode ? this.envelopeDef.smallGraphScaleDef : this.envelopeDef.largeGraphScaleDef;
  }

  /**
   * Refreshes this panel's plot scale labels.
   */
  private refreshScaleLabels(): void {
    if (!this.envelopeDef || !this.scaleDef) {
      return;
    }

    const weightUnit = this.props.unitsSettingManager.weightUnits.get();
    const armUnit = weightUnit.equals(UnitType.KILOGRAM) ? UnitType.CENTIMETER : UnitType.INCH;

    const armTickIntervalIn = (this.scaleDef.maxArm - this.scaleDef.minArm) / 10;
    const weightTickIntervalLb = (this.scaleDef.maxWeight - this.scaleDef.minWeight) / 10;

    const formatArm = this.envelopeDef.useMac
      ? (arm: number): string => MathUtils.lerp(arm, this.props.weightBalanceConfig.macArm![0], this.props.weightBalanceConfig.macArm![1], 0, 100).toFixed(0)
      : (arm: number): string => UnitType.INCH.convertTo(arm, armUnit).toFixed(0);

    // Update scale labels

    for (let i = 0; i < this.armScaleLabelText.length; i++) {
      this.armScaleLabelText[i].set(formatArm(this.scaleDef.minArm + armTickIntervalIn * (i + 0.5)));
    }

    for (let i = 0; i < this.weightScaleLabelText.length; i++) {
      this.weightScaleLabelText[i].set(UnitType.POUND.convertTo(this.scaleDef.minWeight + weightTickIntervalLb * (i + 0.5), weightUnit).toFixed(0));
    }
  }

  /**
   * Refreshes this panel's plot canvas.
   */
  private refreshCanvas(): void {
    const canvas = this.canvasRef.instance;
    const context = this.canvasContext;

    canvas.width = this.scaleWidth;
    canvas.height = this.scaleHeight;

    if (this.scaleWidth === 0 || this.scaleHeight === 0 || !this.envelopeDef || !this.scaleDef || context === null) {
      return;
    }

    // Define coordinates of bottom-left and top-right corners.

    const x0 = 0;
    const y0 = this.scaleHeight;
    const x1 = this.scaleWidth;
    const y1 = 0;

    // Draw borders and grid lines.

    context.strokeStyle = WeightBalancePaneViewGraph.GRID_LINE_COLOR;
    context.lineWidth = WeightBalancePaneViewGraph.GRID_LINE_WIDTH;

    const gridLineHalfWidth = WeightBalancePaneViewGraph.GRID_LINE_WIDTH / 2;

    context.beginPath();
    context.moveTo(0 + gridLineHalfWidth, 0 + gridLineHalfWidth);
    context.lineTo(this.scaleWidth - gridLineHalfWidth, 0 + gridLineHalfWidth);
    context.lineTo(this.scaleWidth - gridLineHalfWidth, this.scaleHeight - gridLineHalfWidth);
    context.lineTo(0 + gridLineHalfWidth, this.scaleHeight - gridLineHalfWidth);
    context.closePath();

    const armTickIntervalPx = this.scaleWidth / 10;
    for (let i = 0; i < 10; i++) {
      const x = x0 + armTickIntervalPx * (i + 0.5);
      context.moveTo(x, y0);
      context.lineTo(x, y1);
    }

    const weightTickIntervalPx = this.scaleHeight / 10;
    for (let i = 0; i < 10; i++) {
      const y = y0 - weightTickIntervalPx * (i + 0.5);
      context.moveTo(x0, y);
      context.lineTo(x1, y);
    }

    context.stroke();

    // Establish clip bounds

    this.clipBounds.set(-5, -5, this.scaleWidth + 5, this.scaleHeight + 5);
    this.clipPathStream.setConsumer(context);

    // Draw envelope and max landing weight line.

    context.strokeStyle = WeightBalancePaneViewGraph.ENVELOPE_LINE_COLOR;
    context.lineWidth = WeightBalancePaneViewGraph.ENVELOPE_LINE_WIDTH;

    this.clipPathStream.beginPath();
    this.drawEnvelopePath(this.clipPathStream, this.envelopeDef, this.scaleDef, x0, y0, x1, y1);

    context.stroke();

    const maxLandingY = MathUtils.lerp(this.envelopeDef.maxLandingWeight, this.scaleDef.minWeight, this.scaleDef.maxWeight, y0, y1);
    if (maxLandingY <= y0 && maxLandingY >= y1) {

      context.beginPath();
      context.moveTo(x0, maxLandingY);
      context.lineTo(x1, maxLandingY);

      // Max landing line has 14 solid segments and 13 gaps. Each gap is 80% of the length of a solid segment.
      const u = this.scaleWidth / 24.4;
      context.setLineDash([u, 0.8 * u]);
      context.stroke();
      context.setLineDash(WeightBalancePaneViewGraph.EMPTY_LINE_DASH);
    }

    // Draw CG line

    const zeroFuelWeight = this.zeroFuelWeightSource.get();
    const rampWeight = this.rampWeightSource.get();
    if (zeroFuelWeight >= 0 && rampWeight !== null && rampWeight > zeroFuelWeight) {
      // We will draw the CG line twice. The first line is drawn with the caution color and is not clipped. The second
      // line is drawn with the normal color and is clipped to the region inside the envelope limits. The end result
      // is that within the envelope limits the CG line is the normal color, and outside the limits the CG line is the
      // caution color.

      this.clipPathStream.beginPath();
      this.drawCgPath(this.clipPathStream, this.zeroFuelMomentSource.get(), zeroFuelWeight, rampWeight, this.scaleDef, x0, y0, x1, y1);

      context.lineWidth = WeightBalancePaneViewGraph.CG_LINE_WIDTH;
      context.strokeStyle = WeightBalancePaneViewGraph.CG_LINE_CAUTION_COLOR;
      context.stroke();

      context.beginPath();
      this.drawEnvelopePath(context, this.envelopeDef, this.scaleDef, x0, y0, x1, y1);
      context.clip();

      this.clipPathStream.beginPath();
      this.drawCgPath(this.clipPathStream, this.zeroFuelMomentSource.get(), zeroFuelWeight, rampWeight, this.scaleDef, x0, y0, x1, y1);

      // Make the line a little bit thicker than the caution so that the caution line doesn't spill out from the edges.
      context.lineWidth = WeightBalancePaneViewGraph.CG_LINE_WIDTH + 0.1;
      context.strokeStyle = WeightBalancePaneViewGraph.CG_LINE_COLOR;
      context.stroke();
    }
  }

  /**
   * Draws a path depicting a weight and balance envelope limit to a path stream.
   * @param pathStream The path stream to which to draw.
   * @param def The definition for the envelope to draw.
   * @param scaleDef The definition for the graph scale to use when drawing the path.
   * @param x0 The x-coordinate of the bottom-left corner of the graph.
   * @param y0 The y-coordinate of the bottom-left corner of the graph.
   * @param x1 The x-coordinate of the top-right corner of the graph.
   * @param y1 The x-coordinate of the top-right corner of the graph.
   */
  private drawEnvelopePath(
    pathStream: PathStream,
    def: Readonly<WeightBalanceEnvelopeDef>,
    scaleDef: Readonly<WeightBalanceEnvelopeGraphScaleDef>,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): void {
    const startX = MathUtils.lerp(def.minArmBreakpoints[0][0], scaleDef.minArm, scaleDef.maxArm, x0, x1);
    const startY = MathUtils.lerp(def.minArmBreakpoints[0][1], scaleDef.minWeight, scaleDef.maxWeight, y0, y1);

    pathStream.moveTo(startX, startY);

    for (let i = 1; i < def.minArmBreakpoints.length; i++) {
      const [arm, weight] = def.minArmBreakpoints[i];
      pathStream.lineTo(
        MathUtils.lerp(arm, scaleDef.minArm, scaleDef.maxArm, x0, x1),
        MathUtils.lerp(weight, scaleDef.minWeight, scaleDef.maxWeight, y0, y1)
      );
    }
    for (let i = def.maxArmBreakpoints.length - 1; i >= 0; i--) {
      const [arm, weight] = def.maxArmBreakpoints[i];
      pathStream.lineTo(
        MathUtils.lerp(arm, scaleDef.minArm, scaleDef.maxArm, x0, x1),
        MathUtils.lerp(weight, scaleDef.minWeight, scaleDef.maxWeight, y0, y1)
      );
    }

    pathStream.lineTo(startX, startY);
  }

  /**
   * Draws a path depicting center of gravity moment arm versus weight from ramp weight to zero-fuel weight to a path
   * stream.
   * @param pathStream The path stream to which to draw.
   * @param zeroFuelMoment The center of gravity moment, in pound-inches, at zero-fuel weight.
   * @param zeroFuelWeight The zero-fuel weight, in pounds.
   * @param rampWeight The ramp weight, in pounds.
   * @param scaleDef The definition for the graph scale to use when drawing the path.
   * @param x0 The x-coordinate of the bottom-left corner of the graph.
   * @param y0 The y-coordinate of the bottom-left corner of the graph.
   * @param x1 The x-coordinate of the top-right corner of the graph.
   * @param y1 The x-coordinate of the top-right corner of the graph.
   */
  private drawCgPath(
    pathStream: PathStream,
    zeroFuelMoment: number,
    zeroFuelWeight: number,
    rampWeight: number,
    scaleDef: Readonly<WeightBalanceEnvelopeGraphScaleDef>,
    x0: number, y0: number,
    x1: number, y1: number
  ): void {
    const calcArm = (weight: number): number => {
      const fuel = weight - zeroFuelWeight;
      return (zeroFuelMoment + fuel * this.props.weightBalanceConfig.fuelStationDef.arm) / (zeroFuelWeight + fuel);
    };

    const rampArm = calcArm(rampWeight);
    const zeroFuelArm = zeroFuelMoment / zeroFuelWeight;

    const cgX0 = MathUtils.lerp(rampArm, scaleDef.minArm, scaleDef.maxArm, x0, x1);
    const cgY0 = MathUtils.lerp(rampWeight, scaleDef.minWeight, scaleDef.maxWeight, y0, y1);

    const cgX1 = MathUtils.lerp(zeroFuelArm, scaleDef.minArm, scaleDef.maxArm, x0, x1);
    const cgY1 = MathUtils.lerp(zeroFuelWeight, scaleDef.minWeight, scaleDef.maxWeight, y0, y1);

    pathStream.moveTo(cgX0, cgY0);

    this.resampleCgPath(pathStream, calcArm, rampWeight, zeroFuelWeight, cgX0, cgY0, cgX1, cgY1, scaleDef, x0, y0, x1, y1, 0);

    pathStream.lineTo(cgX1, cgY1);
  }

  /**
   * Resamples a path depicting center of gravity moment arm versus weight between two weights. The algorithm first
   * assumes that the path between the two weights is linear. The midpoint of the path is then checked for deviation
   * from linearity. If the deviation exceeds a certain threshold, then a new vertex for the path is created at the
   * midpoint and the two resulting sub-paths (from the beginning to the midpoint and from the midpoint to the end) are
   * resampled in turn.
   * @param pathStream The path stream to which to draw.
   * @param calcArm A function that calculates a center of gravity moment arm, in inches, for a given weight, in
   * pounds.
   * @param weight0 The first weight.
   * @param weight1 The second weight.
   * @param cgX0 The x-coordinate of the first moment arm.
   * @param cgY0 The y-coordinate of the first weight.
   * @param cgX1 The x-coordinate of the second moment arm.
   * @param cgY1 The y-coordinate of the second weight.
   * @param scaleDef The definition for the graph scale to use when resampling the path.
   * @param x0 The x-coordinate of the bottom-left corner of the graph.
   * @param y0 The y-coordinate of the bottom-left corner of the graph.
   * @param x1 The x-coordinate of the top-right corner of the graph.
   * @param y1 The x-coordinate of the top-right corner of the graph.
   * @param depth The current resampling depth.
   */
  private resampleCgPath(
    pathStream: PathStream,
    calcArm: (weight: number) => number,
    weight0: number, weight1: number,
    cgX0: number, cgY0: number,
    cgX1: number, cgY1: number,
    scaleDef: Readonly<WeightBalanceEnvelopeGraphScaleDef>,
    x0: number, y0: number,
    x1: number, y1: number,
    depth: number
  ): void {
    // Enforce a maximum of 2^6 - 1 = 63 resampled points.
    if (depth >= 6) {
      return;
    }

    const weightMid = (weight0 + weight1) / 2;
    const armMid = calcArm(weightMid);

    const cgXMid = MathUtils.lerp(armMid, scaleDef.minArm, scaleDef.maxArm, x0, x1);
    const cgYMid = (cgY0 + cgY1) / 2;

    const dx = cgXMid - (cgX0 + cgX1) / 2;

    // Skip resampling if calculated midpoint is less than or equal to 0.5 pixels from the linearly-interpolated
    // midpoint.
    if (dx <= 0.5) {
      return;
    }

    this.resampleCgPath(pathStream, calcArm, weight0, weightMid, cgX0, cgY0, cgXMid, cgYMid, scaleDef, x0, y0, x1, y1, depth + 1);

    pathStream.lineTo(cgXMid, cgYMid);

    this.resampleCgPath(pathStream, calcArm, weightMid, weight1, cgXMid, cgYMid, cgX1, cgY1, scaleDef, x0, y0, x1, y1, depth + 1);
  }

  /**
   * Updates this panel's markers.
   */
  private updateMarkers(): void {
    if (!this.scaleDef || this.scaleHeight <= 0 || this.scaleWidth <= 0) {
      this.takeoffMarkerHidden.set(true);
      this.currentMarkerHidden.set(true);
      this.landingMarkerHidden.set(true);

      this.isCurrentMarkerOffscale.set(false);
      return;
    }

    const x0 = 0;
    const y0 = this.scaleHeight;
    const x1 = this.scaleWidth;
    const y1 = 0;

    this.updateMarkerPosition(
      this.takeoffWeightSource.get(),
      this.takeoffArmSource.get(),
      this.scaleDef,
      x0, y0,
      x1, y1,
      this.takeoffMarkerHidden,
      this.takeoffMarkerTransform
    );

    this.updateMarkerPosition(
      this.currentWeightSource.get(),
      this.currentArmSource.get(),
      this.scaleDef,
      x0, y0,
      x1, y1,
      this.currentMarkerHidden,
      this.currentMarkerTransform,
      this.isCurrentMarkerOffscale
    );

    this.updateMarkerPosition(
      this.landingWeightSource.get(),
      this.landingArmSource.get(),
      this.scaleDef,
      x0, y0,
      x1, y1,
      this.landingMarkerHidden,
      this.landingMarkerTransform
    );
  }

  /**
   * Updates the position of one of this panel's markers.
   * @param weight The marker's weight, in pounds, or `null` if the value is uninitialized.
   * @param arm The marker's moment arm, in inches, or `null` if the value is uninitialized.
   * @param scaleDef The definition for the graph scale to use when positioning the marker.
   * @param x0 The x-coordinate of the bottom-left corner of the graph.
   * @param y0 The y-coordinate of the bottom-left corner of the graph.
   * @param x1 The x-coordinate of the top-right corner of the graph.
   * @param y1 The x-coordinate of the top-right corner of the graph.
   * @param hidden A mutable subscribable that controls the visibility of the marker.
   * @param transform A CSS transform subject that controls the position of the marker.
   * @param isOffscale A mutable subscribable that determines whether the marker is considered offscale.
   */
  private updateMarkerPosition(
    weight: number | null,
    arm: number | null,
    scaleDef: Readonly<WeightBalanceEnvelopeGraphScaleDef>,
    x0: number, y0: number,
    x1: number, y1: number,
    hidden: MutableSubscribable<any, boolean>,
    transform: CssTransformSubject<CssTransformChain<[CssTranslateTransform, CssTranslate3dTransform]>>,
    isOffscale?: MutableSubscribable<any, boolean>
  ): void {
    if (weight === null || arm === null) {
      hidden.set(true);
      isOffscale?.set(false);
    } else {
      hidden.set(false);

      const x = MathUtils.lerp(arm, scaleDef.minArm, scaleDef.maxArm, x0, x1);
      const y = MathUtils.lerp(weight, scaleDef.minWeight, scaleDef.maxWeight, y0, y1);

      transform.transform.getChild(1).set(x, y, 0, 0.1, 0.1);
      transform.resolve();

      isOffscale?.set(x < x0 || y > y0 || x > x1 || y < y1);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    const isTakeoffMarkerNormal = this.takeoffMarkerMode.map(mode => mode === 'normal');
    const isTakeoffMarkerCaution = this.takeoffMarkerMode.map(mode => mode === 'caution');

    const isCurrentMarkerNormal = this.currentMarkerMode.map(mode => mode === 'normal');
    const isCurrentMarkerCaution = this.currentMarkerMode.map(mode => mode === 'caution');

    const isLandingMarkerNormal = this.landingMarkerMode.map(mode => mode === 'normal');
    const isLandingMarkerCaution = this.landingMarkerMode.map(mode => mode === 'caution');

    return (
      <div class='weight-balance-pane-graph'>
        <div class='weight-balance-pane-graph-graph'>
          <div ref={this.plotAreaRef} class='weight-balance-pane-graph-plot-area'>
            <canvas ref={this.canvasRef} class='weight-balance-pane-graph-canvas' />
            <svg
              viewBox='0 0 20 20'
              class={{
                'weight-balance-pane-graph-marker': true,
                'weight-balance-pane-graph-marker-landing': true,
                'weight-balance-pane-graph-marker-normal': isLandingMarkerNormal,
                'weight-balance-pane-graph-marker-caution': isLandingMarkerCaution,
                'hidden': this.landingMarkerHidden
              }}
              style={{
                'position': 'absolute',
                'left': '0px',
                'top': '0px',
                'transform': this.landingMarkerTransform
              }}
            >
              {this.renderLandingMarkerPath()}
            </svg>
            <svg
              viewBox='0 0 20 20'
              class={{
                'weight-balance-pane-graph-marker': true,
                'weight-balance-pane-graph-marker-current': true,
                'weight-balance-pane-graph-marker-normal': isCurrentMarkerNormal,
                'weight-balance-pane-graph-marker-caution': isCurrentMarkerCaution,
                'hidden': this.currentMarkerHidden
              }}
              style={{
                'position': 'absolute',
                'left': '0px',
                'top': '0px',
                'transform': this.currentMarkerTransform
              }}
            >
              {this.renderCurrentMarkerPath()}
            </svg>
            <svg
              viewBox='0 0 20 20'
              class={{
                'weight-balance-pane-graph-marker': true,
                'weight-balance-pane-graph-marker-takeoff': true,
                'weight-balance-pane-graph-marker-normal': isTakeoffMarkerNormal,
                'weight-balance-pane-graph-marker-caution': isTakeoffMarkerCaution,
                'hidden': this.takeoffMarkerHidden
              }}
              style={{
                'position': 'absolute',
                'left': '0px',
                'top': '0px',
                'transform': this.takeoffMarkerTransform
              }}
            >
              {this.renderTakeoffMarkerPath()}
            </svg>
          </div>

          <div class='weight-balance-pane-graph-scale-y'>
            {this.weightScaleLabelText.map((text, index) => {
              return (
                <div
                  class='weight-balance-pane-graph-scale-label'
                  style={`position: absolute; top: ${100 - index * 10 - 5}%; transform: translateY(-50%);`}
                >
                  {text}
                </div>
              );
            })}
          </div>
          <div class='weight-balance-pane-graph-scale-x'>
            {this.armScaleLabelText.map((text, index) => {
              return (
                <div
                  class='weight-balance-pane-graph-scale-label'
                  style={`position: absolute; left: ${index * 10 + 5}%; transform: translateX(-50%);`}
                >
                  {text}
                </div>
              );
            })}
          </div>

          <div class='weight-balance-pane-graph-title weight-balance-pane-graph-title-y'>Loaded Weight {this.weightUnitText}</div>
          <div class='weight-balance-pane-graph-title weight-balance-pane-graph-title-x'>Loaded {this.props.weightBalanceConfig.armLabel} – {this.armUnitText}</div>

          <div
            class={{
              'weight-balance-pane-graph-offscale-banner': true,
              'hidden': this.isCurrentMarkerOffscale.map(SubscribableMapFunctions.not())
            }}
          >
            <div class='weight-balance-pane-graph-offscale-banner-line'>CURRENT LOADING</div>
            <div class='weight-balance-pane-graph-offscale-banner-line'>OUTSIDE DISPLAY AREA</div>
          </div>
        </div>

        <div class='weight-balance-pane-graph-legend'>
          <div class='weight-balance-pane-graph-legend-cell'>
            <span class='weight-balance-pane-graph-legend-text'>Take Off</span>
            <svg
              viewBox='0 0 20 20'
              class={{
                'weight-balance-pane-graph-legend-icon': true,
                'weight-balance-pane-graph-marker': true,
                'weight-balance-pane-graph-marker-takeoff': true,
                'weight-balance-pane-graph-marker-normal': isTakeoffMarkerNormal,
                'weight-balance-pane-graph-marker-caution': isTakeoffMarkerCaution
              }}
            >
              {this.renderTakeoffMarkerPath()}
            </svg>
          </div>
          <div class='weight-balance-pane-graph-legend-cell'>
            <span class='weight-balance-pane-graph-legend-text'>Landing</span>
            <svg
              viewBox='0 0 20 20'
              class={{
                'weight-balance-pane-graph-legend-icon': true,
                'weight-balance-pane-graph-marker': true,
                'weight-balance-pane-graph-marker-landing': true,
                'weight-balance-pane-graph-marker-normal': isLandingMarkerNormal,
                'weight-balance-pane-graph-marker-caution': isLandingMarkerCaution
              }}
            >
              {this.renderLandingMarkerPath()}
            </svg>
          </div>
          <div class='weight-balance-pane-graph-legend-cell'>
            <span class='weight-balance-pane-graph-legend-text'>Current</span>
            <svg
              viewBox='0 0 20 20'
              class={{
                'weight-balance-pane-graph-legend-icon': true,
                'weight-balance-pane-graph-marker': true,
                'weight-balance-pane-graph-marker-current': true,
                'weight-balance-pane-graph-marker-normal': isCurrentMarkerNormal,
                'weight-balance-pane-graph-marker-caution': isCurrentMarkerCaution
              }}
            >
              {this.renderCurrentMarkerPath()}
            </svg>
          </div>
          <div class='weight-balance-pane-graph-legend-cell'>
            <span class='weight-balance-pane-graph-legend-text'>{this.envelopeLegendText}<br />Envelope</span>
            <svg viewBox='0 0 20 12' class='weight-balance-pane-graph-legend-icon weight-balance-pane-graph-legend-envelope-icon'>
              <path d='M 3.5 1 h 13 v 10 h -13 z' />
            </svg>
          </div>
          <div class='weight-balance-pane-graph-legend-cell'>
            <span class='weight-balance-pane-graph-legend-text'>Max Landing<br />Weight</span>
            <svg viewBox='0 0 50 2' class='weight-balance-pane-graph-legend-icon weight-balance-pane-graph-legend-landing-weight-icon'>
              <path d='M 5 1 h 14 M 45 1 h -14' />
            </svg>
          </div>
          <div class='weight-balance-pane-graph-legend-cell weight-balance-pane-graph-legend-fuel-burn-cell'>
            <span class='weight-balance-pane-graph-legend-text'>Fuel Burn</span><br />
            <svg
              viewBox='0 0 40 3'
              class={{
                'weight-balance-pane-graph-legend-icon': true,
                'weight-balance-pane-graph-legend-fuel-burn-icon': true,
                'weight-balance-pane-graph-legend-fuel-burn-icon-normal': isCurrentMarkerNormal,
                'weight-balance-pane-graph-legend-fuel-burn-icon-caution': isCurrentMarkerCaution
              }}
            >
              <path d='M 0 1.5 h 40' />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders an SVG path for a takeoff marker icon.
   * @returns An SVG path for a takeoff marker icon, as a VNode.
   */
  private renderTakeoffMarkerPath(): VNode {
    return (
      <path d='M 2 2 l 16 8 l -16 8 z' class='weight-balance-pane-graph-marker-icon' />
    );
  }

  /**
   * Renders an SVG path for a landing marker icon.
   * @returns An SVG path for a landing marker icon, as a VNode.
   */
  private renderLandingMarkerPath(): VNode {
    return (
      <path d='M 3 3 h 14 v 14 h -14 z' class='weight-balance-pane-graph-marker-icon' />
    );
  }

  /**
   * Renders an SVG path for a current marker icon.
   * @returns An SVG path for a current marker icon, as a VNode.
   */
  private renderCurrentMarkerPath(): VNode {
    return (
      <>
        <path d='M 10 1 l 9 9 l -9 9 l -9 -9 z' class='weight-balance-pane-graph-marker-icon' />

        {/* Fake a radial gradient */}
        {ArrayUtils.create(8, index => {
          const delta = index + 1;
          return (
            <>
              <path
                d={`M 10 1 l ${delta} ${delta} h ${-2 * delta} l ${delta} ${-delta}`}
                class='weight-balance-pane-graph-marker-gradient'
              />
              <path
                d={`M 19 10 l ${-delta} ${delta} v ${-2 * delta} l ${delta} ${delta}`}
                class='weight-balance-pane-graph-marker-gradient'
              />
              <path
                d={`M 10 19 l ${-delta} ${-delta} h ${2 * delta} l ${-delta} ${delta}`}
                class='weight-balance-pane-graph-marker-gradient'
              />
              <path
                d={`M 1 10 l ${delta} ${-delta} v ${2 * delta} l ${-delta} ${-delta}`}
                class='weight-balance-pane-graph-marker-gradient'
              />
            </>
          );
        })}
      </>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    for (const sub of this.canvasRefreshSubs) {
      sub.destroy();
    }

    super.destroy();
  }

  /**
   * Rounds a nullable numeric value to a given precision.
   * @param precision The precision to which to round.
   * @param value The value to round.
   * @returns The specified value rounded to the specified precision, or `null` if the original value was `null`.
   */
  private static withPrecisionNullable(precision: number, value: number | null): number | null {
    return value === null ? null : MathUtils.round(value, precision);
  }
}
