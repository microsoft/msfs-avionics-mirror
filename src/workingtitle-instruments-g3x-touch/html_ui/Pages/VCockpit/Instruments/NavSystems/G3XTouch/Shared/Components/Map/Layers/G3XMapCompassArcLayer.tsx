/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AffineTransformPathStream, ArrayUtils, BasicNavAngleSubject, BasicNavAngleUnit, BitFlags, ClippedPathStream, CssTransformBuilder, CssTransformSubject,
  DebounceTimer, FSComponent, MapFollowAirplaneModule, MapLayer, MapLayerProps, MapOwnAirplanePropsModule, MappedSubject, MapProjection,
  MapProjectionChangeType, MapSharedCanvasLayer, MapSharedCanvasSubLayer, MapSharedCanvasSubLayerProps, MapSyncedCanvasLayer,
  MapSystemKeys, MathUtils, NullPathStream, NumberFormatter, PathStream, ReadonlyFloat64Array, Subject, Subscribable,
  SubscribableUtils, Subscription, Vec2Math, Vec2Subject, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapGarminAutopilotPropsModule, MapOrientation, MapOrientationModule, MapUnitsModule } from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../../Common/G3XBearingDisplay';
import { G3XMapKeys } from '../G3XMapKeys';
import { G3XMapCompassArcModule } from '../Modules/G3XMapCompassArcModule';

import './G3XMapCompassArcLayer.css';

const EMPTY_DASH: number[] = [];
const READOUT_BORDER_REFERENCE_SIZE = Vec2Math.create(100, 46);
const HEADING_BUG_REFERENCE_SIZE = Vec2Math.create(24, 12);

/**
 * Modules required by G3XMapCompassArcLayer.
 */
export interface G3XMapCompassArcLayerModules {
  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Autopilot properties module. */
  [MapSystemKeys.AutopilotProps]?: MapGarminAutopilotPropsModule;

  /** Follow airplane module. */
  [MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Compass arc module. */
  [G3XMapKeys.CompassArc]: G3XMapCompassArcModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * Component props for G3XMapCompassArcLayer.
 */
export interface G3XMapCompassArcLayerProps extends MapLayerProps<G3XMapCompassArcLayerModules> {
  /** The angular width of the arc, in degrees. */
  arcAngularWidth: number | Subscribable<number>;

  /**
   * The margin, in pixels, from the top of the arc (excluding the reference arrow and heading/track readout) to the
   * top of the map's projected window.
   */
  arcTopMargin: number | Subscribable<number>;

  /**
   * Whether to support autopilot selected heading sync behavior. If `true`, then
   * {@link MapGarminAutopilotPropsModule.manualHeadingSelect} will be used to determine when manual adjustments to
   * selected heading are made. If `false`, then any change to selected heading is considered a manual adjustment.
   * Defaults to `false`.
   */
  supportHeadingSync?: boolean;

  /** The width, in pixels, of the compass arc stroke. Defaults to 2 pixels. */
  arcStrokeWidth?: number;

  /** The color of the compass arc stroke. Defaults to `'white'`. */
  arcStrokeColor?: string;

  /** The width, in pixels, of the compass arc outline. Defaults to 1 pixel. */
  arcOutlineWidth?: number;

  /** The color of the compass arc outline. Defaults to `'black'`.  */
  arcOutlineColor?: string;

  /** The length, in pixels, of major bearing ticks. */
  bearingTickMajorLength: number;

  /** The length, in pixels, of minor bearing ticks. */
  bearingTickMinorLength: number;

  /** The font type used for the bearing labels. */
  bearingLabelFont: string;

  /** The color of the bearing label font. Defaults to the arc stroke color. */
  bearingLabelFontColor?: string;

  /** The size, in pixels, of the major bearing label font. */
  bearingLabelMajorFontSize: number;

  /** The size, in pixels, of the minor bearing label font. */
  bearingLabelMinorFontSize: number;

  /** The width, in pixels, of the bearing label font's outline. Defaults to 6 pixels. */
  bearingLabelOutlineWidth?: number;

  /** The color of the bearing label outline. Defaults to `'black'`. */
  bearingLabelOutlineColor?: string;

  /**
   * The radial offset, in pixels, of bearing labels from the arc. Positive values shift the labels toward the center
   * of the arc. Defaults to 0 pixels.
   */
  bearingLabelRadialOffset?: number;

  /**
   * The size of the border of the digital heading/track readout, as `[width, height]` in pixels. Required to render
   * the readout border.
   */
  readoutBorderSize?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The width, in pixels, of the reference arrow. The reference arrow is not shown if the heading/track readout is
   * shown. Defaults to the reference arrow height.
   */
  referenceArrowWidth?: number;

  /**
   * The height, in pixels, of the reference arrow. The reference arrow is not shown if the heading/track readout is
   * shown. Defaults to the minor bearing tick length.
   */
  referenceArrowHeight?: number;

  /** The width, in pixels, of the selected heading line. Defaults to the arc stroke width. */
  headingLineWidth?: number;

  /** The color of the selected heading line. Defaults to `'cyan'`. */
  headingLineColor?: string;

  /**
   * The dash array of the selected heading line. Defaults to `[3 * width, 3 * width]`, where `width` is the width of
   * the heading line.
   */
  headingLineDash?: readonly number[];

  /**
   * The width, in pixels, of the selected heading bug. Defaults to 24 pixels.
   */
  headingBugWidth?: number;

  /**
   * The height, in pixels, of the selected heading bug. Defaults to 12 pixels.
   */
  headingBugHeight?: number;

  /** The color of the selected heading bug. Defaults to `'cyan'`. */
  headingBugColor?: string;

  /**
   * The width, in pixels, of the selected heading bug's outline Defaults to 1 pixel.
   */
  headingBugOutlineWidth?: number;

  /** The color of the selected heading bug's outline. Defaults to `'cyan'`. */
  headingBugOutlineColor?: string;
}

/**
 * A map layer which draws a compass arc centered on and above the map target while the map orientation is heading up
 * or track up and the map is following the player airplane.
 */
export class G3XMapCompassArcLayer extends MapLayer<G3XMapCompassArcLayerProps> {
  private static readonly HEADING_UNSUPPRESS_DURATION = 3000;

  private static readonly DEFAULT_ARC_STROKE_WIDTH = 2; // px
  private static readonly DEFAULT_ARC_STROKE_COLOR = 'white';
  private static readonly DEFAULT_ARC_OUTLINE_WIDTH = 1; // px
  private static readonly DEFAULT_ARC_OUTLINE_COLOR = 'black';

  private static readonly DEFAULT_BEARING_LABEL_OUTLINE_WIDTH = 6; // px
  private static readonly DEFAULT_BEARING_LABEL_OUTLINE_COLOR = 'black';
  private static readonly DEFAULT_BEARING_LABEL_RADIAL_OFFSET = 0; // px

  private static readonly DEFAULT_HEADING_LINE_COLOR = 'cyan';
  private static readonly DEFAULT_HEADING_BUG_COLOR = 'cyan';
  private static readonly DEFAULT_HEADING_BUG_OUTLINE_WIDTH = 1; // px
  private static readonly DEFAULT_HEADING_BUG_OUTLINE_COLOR = 'black';

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer<MapLayerProps<G3XMapCompassArcLayerModules>>>();

  private readonly arcAngularWidth = SubscribableUtils.toSubscribable(this.props.arcAngularWidth, true);
  private readonly arcTopMargin = SubscribableUtils.toSubscribable(this.props.arcTopMargin, true);

  private readonly arcStrokeWidth = this.props.arcStrokeWidth ?? G3XMapCompassArcLayer.DEFAULT_ARC_STROKE_WIDTH;
  private readonly arcStrokeColor = this.props.arcStrokeColor ?? G3XMapCompassArcLayer.DEFAULT_ARC_STROKE_COLOR;
  private readonly arcOutlineWidth = this.props.arcOutlineWidth ?? G3XMapCompassArcLayer.DEFAULT_ARC_OUTLINE_WIDTH;
  private readonly arcOutlineColor = this.props.arcOutlineColor ?? G3XMapCompassArcLayer.DEFAULT_ARC_OUTLINE_COLOR;

  private readonly bearingLabelFontColor = this.props.bearingLabelFontColor ?? this.arcStrokeColor;
  private readonly bearingLabelOutlineWidth = this.props.bearingLabelOutlineWidth ?? G3XMapCompassArcLayer.DEFAULT_BEARING_LABEL_OUTLINE_WIDTH;
  private readonly bearingLabelOutlineColor = this.props.bearingLabelOutlineColor ?? G3XMapCompassArcLayer.DEFAULT_BEARING_LABEL_OUTLINE_COLOR;
  private readonly bearingLabelRadialOffset = this.props.bearingLabelRadialOffset ?? G3XMapCompassArcLayer.DEFAULT_BEARING_LABEL_RADIAL_OFFSET;

  private readonly readoutBorderSize = this.props.readoutBorderSize === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.readoutBorderSize, true);

  private readonly referenceArrowHeight = this.props.referenceArrowHeight ?? this.props.bearingTickMinorLength;
  private readonly referenceArrowWidth = this.props.referenceArrowWidth ?? this.referenceArrowHeight;

  private readonly headingLineWidth = this.props.headingLineWidth ?? this.arcStrokeWidth;
  private readonly headingLineColor = this.props.headingLineColor ?? G3XMapCompassArcLayer.DEFAULT_HEADING_LINE_COLOR;
  private readonly headingLineDash = this.props.headingLineDash ?? [3 * this.headingLineWidth, 3 * this.headingLineWidth];
  private readonly headingBugWidth = this.props.headingBugWidth ?? HEADING_BUG_REFERENCE_SIZE[0];
  private readonly headingBugHeight = this.props.headingBugHeight ?? HEADING_BUG_REFERENCE_SIZE[1];
  private readonly headingBugColor = this.props.headingBugColor ?? G3XMapCompassArcLayer.DEFAULT_HEADING_BUG_COLOR;
  private readonly headingBugOutlineWidth = this.props.headingBugOutlineWidth ?? G3XMapCompassArcLayer.DEFAULT_HEADING_BUG_OUTLINE_WIDTH;
  private readonly headingBugOutlineColor = this.props.headingBugOutlineColor ?? G3XMapCompassArcLayer.DEFAULT_HEADING_BUG_OUTLINE_COLOR;

  private readonly unitsModule = this.props.model.getModule(GarminMapKeys.Units);
  private readonly orientationModule = this.props.model.getModule(GarminMapKeys.Orientation);
  private readonly compassArcModule = this.props.model.getModule(G3XMapKeys.CompassArc);

  private readonly isFollowingAirplane = this.props.model.getModule(MapSystemKeys.FollowAirplane).isFollowing;
  private readonly magVar = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps).magVar;

  private readonly centerSubject = Vec2Subject.create(new Float64Array(2));
  private readonly radiusSubject = Subject.create(0);
  private readonly rotationSubject = Subject.create(0);
  private readonly magVarCorrectionSubject = MappedSubject.create(
    ([navAngle, magVar]) => navAngle.isMagnetic() ? magVar : 0,
    this.unitsModule?.navAngle ?? Subject.create(BasicNavAngleUnit.create(true)),
    this.magVar
  );

  private readonly readoutDisplay = Subject.create('none');
  private readonly readoutCssTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.translateX('%')
  ));
  private readonly readoutValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(0));

  private readonly showHeadingIndicator = Subject.create(false);
  private readonly headingIndicatorSuppressTimer = new DebounceTimer();
  private readonly suppressHeadingCallback = this.showHeadingIndicator.set.bind(this.showHeadingIndicator, false);

  private needUpdateRootVisibility = false;
  private needUpdateReadoutVisibility = true;
  private needUpdateReadoutPosition = true;
  private needUpdateReadoutValue = true;

  private readonly subscriptions: Subscription[] = [];

  private manualHeadingSelectSub?: Subscription;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.needUpdateRootVisibility = true;

    this.canvasLayerRef.getOrDefault()?.setVisible(isVisible);

    this.updateHeadingIndicatorVisibility();

    if (isVisible) {
      this.updateParameters();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();
    this.canvasLayerRef.instance.setVisible(this.isVisible());

    this.readoutCssTransform.transform.getChild(1).set(-50);

    this.initListeners();
    this.updateVisibility();
    this.updateParameters();
  }

  /**
   * Initializes listeners.
   */
  private initListeners(): void {
    const updateVisibilityHandler = this.updateVisibility.bind(this);
    const updateParametersHandler = (): void => {
      if (this.isVisible()) {
        this.updateParameters();
      }
    };

    this.subscriptions.push(
      this.arcTopMargin.sub(updateParametersHandler),

      this.compassArcModule.show.sub(this.onCompassArcShowChanged.bind(this)),

      this.compassArcModule.showReadout.sub(() => { this.needUpdateReadoutVisibility = true; }),

      this.orientationModule.orientation.sub(updateVisibilityHandler),

      this.isFollowingAirplane.sub(updateVisibilityHandler),

      this.magVar.sub(() => { this.needUpdateReadoutValue = true; }),
    );

    const autopilotModule = this.props.model.getModule(MapSystemKeys.AutopilotProps);
    if (autopilotModule) {
      this.subscriptions.push(
        this.manualHeadingSelectSub = this.props.supportHeadingSync
          ? autopilotModule.manualHeadingSelect.on(this.unsuppressHeadingIndicator.bind(this), true)
          : autopilotModule.selectedHeading.sub(this.unsuppressHeadingIndicator.bind(this), false, true),

        this.compassArcModule.showHeadingBug.sub(this.updateHeadingIndicatorVisibility.bind(this), true)
      );
    }

    this.centerSubject.sub(this.onCenterChanged.bind(this));
    this.radiusSubject.sub(this.onRadiusChanged.bind(this));
    this.rotationSubject.sub(this.onRotationChanged.bind(this));
    this.magVarCorrectionSubject.sub(updateParametersHandler);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

    if (!this.isVisible()) {
      return;
    }

    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.TargetProjected | MapProjectionChangeType.Rotation)) {
      this.updateParameters();
    }
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (this.needUpdateRootVisibility) {
      this.updateRootVisibility();
      this.needUpdateRootVisibility = false;
    }

    this.canvasLayerRef.instance.onUpdated(time, elapsed);

    if (!this.isVisible()) {
      return;
    }

    this.updateReadout();
  }

  /**
   * Updates the visibility of this layer's root.
   */
  private updateRootVisibility(): void {
    this.rootRef.instance.style.display = this.isVisible() ? 'block' : 'none';
  }

  /**
   * Updates this layer's digital heading/track readout.
   */
  private updateReadout(): void {
    const isVisible = this.compassArcModule.showReadout.get();

    if (this.needUpdateReadoutVisibility) {
      this.readoutDisplay.set(isVisible ? '' : 'none');
      this.needUpdateReadoutVisibility = false;
    }

    if (!isVisible) {
      return;
    }

    if (this.needUpdateReadoutPosition) {
      const center = this.centerSubject.get();

      this.readoutCssTransform.transform.getChild(0).set(center[0], center[1] - this.radiusSubject.get(), 0, 1, 1);
      this.readoutCssTransform.resolve();

      this.needUpdateReadoutPosition = false;
    }

    if (this.needUpdateReadoutValue) {
      this.readoutValue.set(-this.props.mapProjection.getRotation() * Avionics.Utils.RAD2DEG, this.magVar.get());

      this.needUpdateReadoutValue = false;
    }
  }

  /**
   * Updates this layer's visibility.
   */
  private updateVisibility(): void {
    const orientation = this.orientationModule.orientation.get();
    this.setVisible(
      (orientation === MapOrientation.TrackUp || orientation === MapOrientation.HeadingUp)
      && this.compassArcModule.show.get()
      && this.isFollowingAirplane.get()
    );
  }

  /**
   * Updates the parameters (center, radius, rotation) of this layer's arc rose.
   */
  private updateParameters(): void {
    const center = this.props.mapProjection.getTargetProjected();

    const radius = Math.round(Math.max(0, Math.round(center[1]) - this.arcTopMargin.get()));
    const rotation = MathUtils.round((this.props.mapProjection.getRotation() + this.magVarCorrectionSubject.get() * Avionics.Utils.DEG2RAD), 1e-3);

    this.centerSubject.set(Math.round(center[0]), Math.round(center[1]));
    this.radiusSubject.set(radius);
    this.rotationSubject.set(rotation);
  }

  /**
   * Responds to changes in the location of the center of the compass.
   */
  private onCenterChanged(): void {
    this.needUpdateReadoutPosition = true;
  }

  /**
   * Responds to changes in the radius of the compass.
   */
  private onRadiusChanged(): void {
    this.needUpdateReadoutPosition = true;
  }

  /**
   * Responds to changes in the rotation of the compass.
   */
  private onRotationChanged(): void {
    this.needUpdateReadoutValue = true;
  }

  /**
   * Responds to changes in whether to show the compass arc.
   */
  private onCompassArcShowChanged(): void {
    this.updateVisibility();
  }

  /**
   * Updates the visibility of this layer's heading indicator.
   */
  private updateHeadingIndicatorVisibility(): void {
    const isVisible = this.isVisible() && this.compassArcModule.showHeadingBug.get();

    if (isVisible) {
      this.manualHeadingSelectSub?.resume();
    } else {
      this.manualHeadingSelectSub?.pause();
      this.suppressHeadingIndicator();
    }
  }

  /**
   * Suppresses the heading indicator, making it invisible.
   */
  private suppressHeadingIndicator(): void {
    this.headingIndicatorSuppressTimer.clear();
    this.showHeadingIndicator.set(false);
  }

  /**
   * Unsuppresses the heading indicator, making it visible for a short duration.
   */
  private unsuppressHeadingIndicator(): void {
    this.showHeadingIndicator.set(true);
    this.headingIndicatorSuppressTimer.schedule(this.suppressHeadingCallback, G3XMapCompassArcLayer.HEADING_UNSUPPRESS_DURATION);
  }

  /** @inheritdoc */
  public render(): VNode {
    const autopilotPropsModule = this.props.model.getModule(MapSystemKeys.AutopilotProps);

    return (
      <div ref={this.rootRef} class='map-compass-arc' style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
        <MapSharedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection}>
          {autopilotPropsModule !== undefined && (
            <G3XMapCompassArcHeadingLineSubLayer
              model={this.props.model}
              compassCenter={this.centerSubject} compassRadius={this.radiusSubject} compassRotation={this.rotationSubject}
              arcAngularWidth={this.arcAngularWidth}
              show={this.showHeadingIndicator}
              selectedHeading={autopilotPropsModule.selectedHeading}
              lineWidth={this.headingLineWidth} lineColor={this.headingLineColor} lineDash={this.headingLineDash}
              readoutBorderSize={this.readoutBorderSize}
            />
          )}

          <G3XMapCompassArcMainSubLayer
            model={this.props.model}
            compassCenter={this.centerSubject} compassRadius={this.radiusSubject} compassRotation={this.rotationSubject}
            arcAngularWidth={this.arcAngularWidth}
            arcStrokeWidth={this.arcStrokeWidth} arcStrokeColor={this.arcStrokeColor}
            arcOutlineWidth={this.arcOutlineWidth} arcOutlineColor={this.arcOutlineColor}
            bearingTickMajorLength={this.props.bearingTickMajorLength} bearingTickMinorLength={this.props.bearingTickMinorLength}
            bearingLabelFont={this.props.bearingLabelFont} bearingLabelFontColor={this.bearingLabelFontColor}
            bearingLabelOutlineWidth={this.bearingLabelOutlineWidth} bearingLabelOutlineColor={this.bearingLabelOutlineColor}
            bearingLabelRadialOffset={this.bearingLabelRadialOffset}
            bearingLabelMajorFontSize={this.props.bearingLabelMajorFontSize} bearingLabelMinorFontSize={this.props.bearingLabelMinorFontSize}
            readoutBorderSize={this.readoutBorderSize}
            referenceArrowWidth={this.referenceArrowWidth} referenceArrowHeight={this.referenceArrowHeight}
          />

          {autopilotPropsModule !== undefined && (
            <G3XMapCompassArcHeadingBugSubLayer
              model={this.props.model}
              compassCenter={this.centerSubject} compassRadius={this.radiusSubject} compassRotation={this.rotationSubject}
              arcAngularWidth={this.arcAngularWidth}
              show={this.showHeadingIndicator}
              selectedHeading={autopilotPropsModule.selectedHeading}
              bugWidth={this.headingBugWidth} bugHeight={this.headingBugHeight} bugColor={this.headingBugColor}
              bugOutlineWidth={this.headingBugOutlineWidth} bugOutlineColor={this.headingBugOutlineColor}
            />
          )}
        </MapSharedCanvasLayer>
        <div
          class='map-compass-arc-readout'
          style={{
            'display': this.readoutDisplay,
            'position': 'absolute',
            'left': '0px',
            'bottom': '100%',
            'transform': this.readoutCssTransform
          }}
        >
          <G3XBearingDisplay
            value={this.readoutValue}
            formatter={NumberFormatter.create({ precision: 1, pad: 3, cache: true })}
            displayUnit={this.unitsModule?.navAngle ?? BasicNavAngleUnit.create(true)}
            class='map-compass-arc-readout-value'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.magVarCorrectionSubject.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for sublayers of G3XMapCompassArcLayer.
 */
interface G3XMapCompassArcSubLayerProps extends MapSharedCanvasSubLayerProps<G3XMapCompassArcLayerModules> {
  /** The center of the compass, as `[x, y]` in pixels. */
  compassCenter: Subscribable<ReadonlyFloat64Array>;

  /** The radius of the compass, in pixels. */
  compassRadius: Subscribable<number>;

  /** The rotation of the compass, in radians. */
  compassRotation: Subscribable<number>;

  /** The angular width of the arc, in degrees. */
  arcAngularWidth: Subscribable<number>;
}

/**
 * Component props for G3XMapCompassArcMainSubLayer.
 */
interface G3XMapCompassArcMainSubLayerProps extends G3XMapCompassArcSubLayerProps, Required<Pick<
  G3XMapCompassArcLayerProps,
  'arcStrokeWidth' | 'arcStrokeColor' | 'arcOutlineWidth' | 'arcOutlineColor'
  | 'bearingTickMajorLength' | 'bearingTickMinorLength'
  | 'bearingLabelFont' | 'bearingLabelFontColor' | 'bearingLabelOutlineWidth' | 'bearingLabelOutlineColor' | 'bearingLabelRadialOffset'
  | 'bearingLabelMajorFontSize' | 'bearingLabelMinorFontSize'
  | 'referenceArrowWidth' | 'referenceArrowHeight'
>> {
  /**
   * The size of the border of the digital heading/track readout, as `[width, height]` in pixels.
   */
  readoutBorderSize?: Subscribable<ReadonlyFloat64Array>;
}

/**
 * A compass arc sublayer which draws the arc, bearing ticks, bearing labels, readout border, and reference arrow.
 */
class G3XMapCompassArcMainSubLayer extends MapSharedCanvasSubLayer<G3XMapCompassArcMainSubLayerProps> {
  private static readonly BEARING_TICK_MAJOR_INTERVAL = 30;
  private static readonly BEARING_TICK_MINOR_FACTOR = 3;
  private static readonly BEARING_TICK_MINOR_INTERVAL = G3XMapCompassArcMainSubLayer.BEARING_TICK_MAJOR_INTERVAL / G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_FACTOR;
  private static readonly BEARING_TICK_MINOR_INTERVAL_RAD = G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL * Avionics.Utils.DEG2RAD;

  private static readonly BEARING_LABELS = ArrayUtils.create(Math.floor(360 / G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL), index => {
    const bearing = index * G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL;
    switch (bearing) {
      case 0:
        return 'N';
      case 90:
        return 'E';
      case 180:
        return 'S';
      case 270:
        return 'W';
      default:
        return Math.round(bearing / 10).toString();
    }
  });

  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly bearingLabelMajorFont = `${this.props.bearingLabelMajorFontSize}px ${this.props.bearingLabelFont}`;
  private readonly bearingLabelMinorFont = `${this.props.bearingLabelMinorFontSize}px ${this.props.bearingLabelFont}`;

  private readonly compassArcModule = this.props.model.getModule(G3XMapKeys.CompassArc);

  private readonly transformPathStream = new AffineTransformPathStream(NullPathStream.INSTANCE);

  private needInvalidate = true;
  private needInitStyles = true;
  private needRechooseReferenceMarker = true;
  private needRepositionReferenceMarker = true;

  private readonly subscriptions: Subscription[] = [];

  private readoutBorderSizeSub?: Subscription;

  /** @inheritdoc */
  public onAttached(): void {
    this.transformPathStream.setConsumer(this.display.context);

    this.initListeners();
  }

  /**
   * Initializes this layer's compass arc canvas layer styles.
   */
  private initArcLayerStyles(): void {
    const context = this.display.context;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.lineJoin = 'round';
  }

  /**
   * Initializes listeners.
   */
  private initListeners(): void {
    const invalidateHandler = (): void => { this.needInvalidate = true; };

    this.subscriptions.push(
      this.props.arcAngularWidth.sub(invalidateHandler),
      this.compassArcModule.showMinorBearingLabels.sub(invalidateHandler),
      this.compassArcModule.showReadout.sub(show => {
        this.needInvalidate = true;
        if (show) {
          this.readoutBorderSizeSub?.resume();
        } else {
          this.readoutBorderSizeSub?.pause();
        }
      }),
      this.props.compassCenter.sub(invalidateHandler),
      this.props.compassRadius.sub(invalidateHandler),
      this.props.compassRotation.sub(invalidateHandler)
    );

    if (this.props.readoutBorderSize) {
      this.subscriptions.push(
        this.readoutBorderSizeSub = this.props.readoutBorderSize.sub(invalidateHandler, false, true)
      );
    }
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      // Resizing the map will cause the arc canvas layer to clear itself and reset all styles, so we need to
      // re-initialize styles and force a redraw.
      this.needInitStyles = true;
    }
  }

  /** @inheritdoc */
  public shouldInvalidate(): boolean {
    return this.needInvalidate;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.needInitStyles) {
      this.initArcLayerStyles();
      this.needInitStyles = false;
    }

    if (this.display.isInvalidated) {
      this.draw();
      this.needInvalidate = false;
    }
  }

  /**
   * Draws the compass arc.
   */
  private draw(): void {
    const center = this.props.compassCenter.get();
    const radius = this.props.compassRadius.get();
    const rotation = this.props.compassRotation.get();
    const angularWidth = this.props.arcAngularWidth.get();
    const angularWidthRad = angularWidth * Avionics.Utils.DEG2RAD;

    const minBearing = (-rotation * Avionics.Utils.RAD2DEG - angularWidth / 2 + 360) % 360;
    const maxBearing = minBearing + angularWidth;
    const startMinorBearing = MathUtils.ceil(minBearing, G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL);
    const startMajorBearing = MathUtils.ceil(minBearing, G3XMapCompassArcMainSubLayer.BEARING_TICK_MAJOR_INTERVAL);

    this.display.context.setLineDash(EMPTY_DASH);

    this.drawArc(center, radius, angularWidthRad, minBearing, maxBearing, startMinorBearing);
    this.drawBearingLabels(center, radius, rotation, maxBearing, startMajorBearing, startMinorBearing);
  }

  /**
   * Draws the compass arc's arc, bearing ticks, and readout border/reference arrow.
   * @param center The center of the arc, as `[x, y]` in pixels.
   * @param radius The radius of the arc, in pixels.
   * @param angularWidthRad The angular with of the arc, in radians.
   * @param minBearing The minimum bearing angle that is within the arc's bounds, in degrees.
   * @param maxBearing The maximum bearing angle that is within the arc's bounds, in degrees in the range `[0, 720)`.
   * This value is guaranteed to be greater than or equal to `minBearing`.
   * @param startMinorBearing The smallest bearing angle associated with a major or minor bearing tick that is within
   * the arc's bounds, in degrees in the range `[0, 720)`.
   */
  private drawArc(
    center: ReadonlyFloat64Array,
    radius: number,
    angularWidthRad: number,
    minBearing: number,
    maxBearing: number,
    startMinorBearing: number
  ): void {
    const showReadout = this.compassArcModule.showReadout.get();

    if (this.props.arcOutlineWidth > 0) {
      this.transformPathStream.beginPath();

      this.transformPathStream
        .resetTransform()
        .addTranslation(center[0], center[1]);

      // Readout border

      if (this.props.readoutBorderSize && showReadout) {
        this.transformPathStream.addTranslation(0, -radius);

        // The outline needs to extend beyond the ends of the border.
        this.pathReadoutBorder(this.transformPathStream, this.props.readoutBorderSize.get(), this.props.arcOutlineWidth);

        this.transformPathStream.addTranslation(0, radius);
      }

      // Arc

      // The outline needs to extend beyond the ends of the arc.
      const outlineAngularWidth = this.props.arcOutlineWidth / radius;
      const outlineAngularWidthRad = angularWidthRad + outlineAngularWidth * 2;

      this.transformPathStream.addRotation(-MathUtils.HALF_PI - outlineAngularWidthRad / 2, 'before');
      this.transformPathStream.moveTo(radius, 0);
      this.transformPathStream.arc(0, 0, radius, 0, outlineAngularWidthRad);

      // Tick

      this.transformPathStream.addRotation((startMinorBearing - minBearing) * Avionics.Utils.DEG2RAD + outlineAngularWidth, 'before');

      for (let bearing = startMinorBearing; bearing <= maxBearing; bearing += G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL) {
        const tickLength = bearing % G3XMapCompassArcMainSubLayer.BEARING_TICK_MAJOR_INTERVAL === 0
          ? this.props.bearingTickMajorLength
          : this.props.bearingTickMinorLength;

        this.transformPathStream.moveTo(radius, 0);
        // The outline needs to extend beyond the end of the tick.
        this.transformPathStream.lineTo(radius - tickLength - this.props.arcOutlineWidth, 0);

        this.transformPathStream.addRotation(G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL_RAD, 'before');
      }

      this.display.context.lineWidth = this.props.arcStrokeWidth + 2 * this.props.arcOutlineWidth;
      this.display.context.strokeStyle = this.props.arcOutlineColor;
      this.display.context.stroke();

      // Reference arrow

      if (!showReadout) {
        this.transformPathStream.beginPath();

        this.transformPathStream
          .resetTransform()
          .addTranslation(center[0], center[1] - radius);

        this.pathReferenceArrow(this.transformPathStream);

        this.display.context.lineWidth = this.props.arcOutlineWidth * 2;
        this.display.context.strokeStyle = this.props.arcOutlineColor;
        this.display.context.stroke();
      }
    }

    if (this.props.arcStrokeWidth > 0) {
      this.transformPathStream.beginPath();

      this.transformPathStream
        .resetTransform()
        .addTranslation(center[0], center[1]);

      // Readout border

      if (this.props.readoutBorderSize && showReadout) {
        this.transformPathStream.addTranslation(0, -radius);

        this.pathReadoutBorder(this.transformPathStream, this.props.readoutBorderSize.get(), 0);

        this.transformPathStream.addTranslation(0, radius);
      }

      // Arc

      this.transformPathStream.addRotation(-MathUtils.HALF_PI - angularWidthRad / 2, 'before');
      this.transformPathStream.moveTo(radius, 0);
      this.transformPathStream.arc(0, 0, radius, 0, angularWidthRad);

      // Tick

      this.transformPathStream.addRotation((startMinorBearing - minBearing) * Avionics.Utils.DEG2RAD, 'before');

      for (let bearing = startMinorBearing; bearing <= maxBearing; bearing += G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL) {
        const tickLength = bearing % G3XMapCompassArcMainSubLayer.BEARING_TICK_MAJOR_INTERVAL === 0
          ? this.props.bearingTickMajorLength
          : this.props.bearingTickMinorLength;

        this.transformPathStream.moveTo(radius, 0);
        this.transformPathStream.lineTo(radius - tickLength, 0);

        this.transformPathStream.addRotation(G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL_RAD, 'before');
      }

      this.display.context.lineWidth = this.props.arcStrokeWidth;
      this.display.context.strokeStyle = this.props.arcStrokeColor;
      this.display.context.stroke();

      // Reference arrow

      if (!showReadout) {
        this.transformPathStream.beginPath();

        this.transformPathStream
          .resetTransform()
          .addTranslation(center[0], center[1] - radius);

        this.pathReferenceArrow(this.transformPathStream);

        this.display.context.fillStyle = this.props.arcStrokeColor;
        this.display.context.fill();
      }
    }
  }

  /**
   * Paths the compass arc's heading/track readout border.
   * @param stream The stream to which to send path commands.
   * @param size The size of the border, as `[width, height]` in pixels.
   * @param extend The amount to extend the ends of the borders, in pixels.
   */
  private pathReadoutBorder(stream: PathStream, size: ReadonlyFloat64Array, extend: number): void {
    const xScale = size[0] / READOUT_BORDER_REFERENCE_SIZE[0];
    const yScale = size[1] / READOUT_BORDER_REFERENCE_SIZE[1];

    stream.moveTo(-50 * xScale, -28 * yScale - extend);
    stream.lineTo(-50 * xScale, -13.66 * yScale);
    stream.lineTo(-14.25 * xScale, -13.66 * yScale);
    stream.lineTo(0, 0);
    stream.lineTo(14.25 * xScale, -13.66 * yScale);
    stream.lineTo(50 * xScale, -13.66 * yScale);
    stream.lineTo(50 * xScale, -28 * yScale - extend);
  }

  /**
   * Paths the compass arc's reference arrow.
   * @param stream The stream to which to send path commands.
   */
  private pathReferenceArrow(stream: PathStream): void {
    stream.moveTo(0, 0);
    stream.lineTo(-this.props.referenceArrowWidth / 2, -this.props.referenceArrowHeight);
    stream.lineTo(this.props.referenceArrowWidth / 2, -this.props.referenceArrowHeight);
    stream.lineTo(0, 0);
  }

  /**
   * Draws the compass arc's bearing labels.
   * @param center The center of the arc, as `[x, y]` in pixels.
   * @param radius The radius of the arc, in pixels.
   * @param rotation The rotation of the compass rose, in radians.
   * @param maxBearing The maximum bearing angle that is within the arc's bounds, in degrees in the range `[0, 720)`.
   * This value is guaranteed to be greater than or equal to `minBearing`.
   * @param startMajorBearing The smallest bearing angle associated with a major bearing tick that is within the arc's
   * bounds, in degrees in the range `[0, 720)`.
   * @param startMinorBearing The smallest bearing angle associated with a major or minor bearing tick that is within
   * the arc's bounds, in degrees in the range `[0, 720)`.
   */
  private drawBearingLabels(
    center: ReadonlyFloat64Array,
    radius: number,
    rotation: number,
    maxBearing: number,
    startMajorBearing: number,
    startMinorBearing: number
  ): void {
    // Major Bearing Labels

    const labelRadius = radius - this.props.bearingLabelRadialOffset;

    this.display.context.fillStyle = this.props.bearingLabelFontColor;
    this.display.context.lineWidth = this.props.bearingLabelOutlineWidth;
    this.display.context.strokeStyle = this.props.bearingLabelOutlineColor;

    this.display.context.font = this.bearingLabelMajorFont;

    for (let bearing = startMajorBearing; bearing <= maxBearing; bearing += G3XMapCompassArcMainSubLayer.BEARING_TICK_MAJOR_INTERVAL) {
      const offset = Vec2Math.setFromPolar(labelRadius, (bearing - 90) * Avionics.Utils.DEG2RAD + rotation, G3XMapCompassArcMainSubLayer.vec2Cache[0]);
      const index = (bearing % 360) / G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL;

      this.drawBearingLabel(G3XMapCompassArcMainSubLayer.BEARING_LABELS[index], center[0] + offset[0], center[1] + offset[1]);
    }

    // Minor Bearing Labels

    if (this.compassArcModule.showMinorBearingLabels.get()) {
      this.display.context.font = this.bearingLabelMinorFont;

      for (let bearing = startMinorBearing; bearing <= maxBearing; bearing += G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL) {
        if (bearing % G3XMapCompassArcMainSubLayer.BEARING_TICK_MAJOR_INTERVAL === 0) {
          continue;
        }

        const offset = Vec2Math.setFromPolar(labelRadius, (bearing - 90) * Avionics.Utils.DEG2RAD + rotation, G3XMapCompassArcMainSubLayer.vec2Cache[0]);
        const index = (bearing % 360) / G3XMapCompassArcMainSubLayer.BEARING_TICK_MINOR_INTERVAL;

        this.drawBearingLabel(G3XMapCompassArcMainSubLayer.BEARING_LABELS[index], center[0] + offset[0], center[1] + offset[1]);
      }
    }
  }

  /**
   * Draws a single bearing label.
   * @param text The text of the label.
   * @param x The x-coordinate of the label.
   * @param y The y-coordinate of the label.
   */
  private drawBearingLabel(text: string, x: number, y: number): void {
    this.display.context.translate(x, y);
    this.display.context.rotate(1e-3); // Applying a rotation will enable sub-pixel positioning of the text.

    if (this.props.bearingLabelOutlineWidth > 0) {
      this.display.context.strokeText(text, 0, 0);
    }
    this.display.context.fillText(text, 0, 0);

    this.display.context.resetTransform();
  }

  /**
   * Redraws the reference marker.
   */
  private updateReferenceMarker(): void {
    if (!this.needRechooseReferenceMarker && !this.needRepositionReferenceMarker) {
      return;
    }

    // if (this.needRechooseReferenceMarker) {
    //   const orientation = this.orientationModule.orientation.get();
    //   const type = (this.props.showHeadingBug && this.isFollowingAirplane.get() && orientation === MapOrientation.HeadingUp)
    //     ? MapRangeCompassReferenceMarkerType.ARROW
    //     : MapRangeCompassReferenceMarkerType.TICK;

    //   this.referenceMarkerTypeSub.set(type);

    //   this.needRechooseReferenceMarker = false;
    // }

    // if (!this.needRepositionReferenceMarker) {
    //   return;
    // }

    // this.referenceMarkerContainerRef.instance.reposition();

    this.needRepositionReferenceMarker = false;
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for G3XMapCompassArcHeadingLineSubLayer.
 */
interface G3XMapCompassArcHeadingLineSubLayerProps extends G3XMapCompassArcSubLayerProps {
  /** Whether to show the selected heading line. */
  show: Subscribable<boolean>;

  /** The autopilot selected heading, in degrees. */
  selectedHeading: Subscribable<number>;

  /** The width of the heading line. */
  lineWidth: number;

  /** The color of the heading line. */
  lineColor: string;

  /** The dash array for the heading line. */
  lineDash: readonly number[];

  /**
   * The size of the border of the digital heading/track readout, as `[width, height]` in pixels.
   */
  readoutBorderSize?: Subscribable<ReadonlyFloat64Array>;
}

/**
 * A compass arc sublayer which draws the arc, bearing ticks, bearing labels, readout border, and reference arrow.
 */
class G3XMapCompassArcHeadingLineSubLayer extends MapSharedCanvasSubLayer<G3XMapCompassArcHeadingLineSubLayerProps> {
  private readonly compassArcModule = this.props.model.getModule(G3XMapKeys.CompassArc);

  private readonly clipBounds = VecNSubject.create(VecNMath.create(4));
  private readonly clipPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.clipBounds);
  private readonly transformPathStream = new AffineTransformPathStream(this.clipPathStream);

  private needInvalidate = true;

  private readonly subscriptions: Subscription[] = [];

  private readoutBorderSizeSub?: Subscription;
  private compassRadiusSub?: Subscription;

  /** @inheritdoc */
  public onAttached(): void {
    this.clipPathStream.setConsumer(this.display.context);

    this.initListeners();
  }

  /**
   * Initializes listeners.
   */
  private initListeners(): void {
    const invalidateHandler = (): void => { this.needInvalidate ||= this.props.show.get(); };

    this.subscriptions.push(
      this.props.show.sub(() => { this.needInvalidate = true; }),
      this.props.selectedHeading.sub(invalidateHandler),
      this.props.compassCenter.sub(invalidateHandler),
      this.props.compassRotation.sub(invalidateHandler)
    );

    if (this.props.readoutBorderSize) {
      this.subscriptions.push(
        this.readoutBorderSizeSub = this.props.readoutBorderSize.sub(invalidateHandler, false, true),
        this.compassRadiusSub = this.props.compassRadius.sub(invalidateHandler, false, true),

        this.compassArcModule.showReadout.sub(show => {
          this.needInvalidate = true;
          if (show) {
            this.readoutBorderSizeSub!.resume();
            this.compassRadiusSub!.resume();
          } else {
            this.readoutBorderSizeSub!.pause();
            this.compassRadiusSub!.pause();
          }
        }, true)
      );
    }
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      const size = mapProjection.getProjectedSize();
      this.clipBounds.set(0, 0, size[0], size[1]);
    }
  }

  /** @inheritdoc */
  public shouldInvalidate(): boolean {
    return this.needInvalidate;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.display.isInvalidated) {
      if (this.props.show.get()) {
        this.draw();
      }
      this.needInvalidate = false;
    }
  }

  /**
   * Draws the heading line.
   */
  private draw(): void {
    const length = Vec2Math.abs(this.projection.getProjectedSize());
    const compassCenter = this.props.compassCenter.get();
    const compassRotation = this.props.compassRotation.get();

    let needRestore = false;

    if (this.props.readoutBorderSize && this.compassArcModule.showReadout.get()) {
      // Set up a clipping path to occlude the heading line where the digital heading/track readout is located.

      needRestore = true;
      this.display.context.save();

      const projectedSize = this.projection.getProjectedSize();
      const compassRadius = this.props.compassRadius.get();
      const borderSize = this.props.readoutBorderSize.get();

      const xScale = borderSize[0] / READOUT_BORDER_REFERENCE_SIZE[0];
      const yScale = borderSize[1] / READOUT_BORDER_REFERENCE_SIZE[1];

      this.transformPathStream
        .resetTransform()
        .addTranslation(compassCenter[0], compassCenter[1] - compassRadius);

      this.display.context.beginPath();
      this.display.context.rect(0, 0, projectedSize[0], projectedSize[1]);

      this.transformPathStream
        .resetTransform()
        .addTranslation(compassCenter[0], compassCenter[1] - compassRadius);

      this.transformPathStream.moveTo(-50 * xScale, -46 * yScale);
      this.transformPathStream.lineTo(-50 * xScale, -13.66 * yScale);
      this.transformPathStream.lineTo(-14.25 * xScale, -13.66 * yScale);
      this.transformPathStream.lineTo(0, 0);
      this.transformPathStream.lineTo(14.25 * xScale, -13.66 * yScale);
      this.transformPathStream.lineTo(50 * xScale, -13.66 * yScale);
      this.transformPathStream.lineTo(50 * xScale, -46 * yScale);
      this.transformPathStream.lineTo(-50 * xScale, -46 * yScale);

      this.display.context.clip('evenodd');
    }

    this.transformPathStream
      .resetTransform()
      .addRotation(this.props.selectedHeading.get() * Avionics.Utils.DEG2RAD + compassRotation)
      .addTranslation(compassCenter[0], compassCenter[1]);

    this.transformPathStream.beginPath();
    this.transformPathStream.moveTo(0, 0);
    this.transformPathStream.lineTo(0, -length);

    this.display.context.lineWidth = this.props.lineWidth;
    this.display.context.strokeStyle = this.props.lineColor;
    this.display.context.setLineDash(this.props.lineDash);
    this.display.context.stroke();

    if (needRestore) {
      this.display.context.restore();
    }
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for G3XMapCompassArcHeadingBugSubLayer.
 */
interface G3XMapCompassArcHeadingBugSubLayerProps extends G3XMapCompassArcSubLayerProps {
  /** Whether to show the selected heading line. */
  show: Subscribable<boolean>;

  /** The autopilot selected heading, in degrees. */
  selectedHeading: Subscribable<number>;

  /** The width of the bug, in pixels. */
  bugWidth: number;

  /** The height of the bug, in pixels. */
  bugHeight: number;

  /** The color of the bug. */
  bugColor: string;

  /** The width of the bug's outline, in pixels. */
  bugOutlineWidth: number;

  /** The color of the bug's outline. */
  bugOutlineColor: string;
}

/**
 * A compass arc sublayer which draws the arc, bearing ticks, bearing labels, readout border, and reference arrow.
 */
class G3XMapCompassArcHeadingBugSubLayer extends MapSharedCanvasSubLayer<G3XMapCompassArcHeadingBugSubLayerProps> {
  private readonly xScale = this.props.bugWidth / HEADING_BUG_REFERENCE_SIZE[0];
  private readonly yScale = this.props.bugHeight / HEADING_BUG_REFERENCE_SIZE[1];

  private readonly transformPathStream = new AffineTransformPathStream(NullPathStream.INSTANCE);

  private needInvalidate = true;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAttached(): void {
    this.transformPathStream.setConsumer(this.display.context);

    this.initListeners();
  }

  /**
   * Initializes listeners.
   */
  private initListeners(): void {
    const invalidateHandler = (): void => { this.needInvalidate ||= this.props.show.get(); };

    this.subscriptions.push(
      this.props.show.sub(() => { this.needInvalidate = true; }),
      this.props.selectedHeading.sub(invalidateHandler),
      this.props.arcAngularWidth.sub(invalidateHandler),
      this.props.compassCenter.sub(invalidateHandler),
      this.props.compassRadius.sub(invalidateHandler),
      this.props.compassRotation.sub(invalidateHandler)
    );
  }

  /** @inheritdoc */
  public shouldInvalidate(): boolean {
    return this.needInvalidate;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.display.isInvalidated) {
      if (this.props.show.get()) {
        this.draw();
      }
      this.needInvalidate = false;
    }
  }

  /**
   * Draws the heading bug.
   */
  private draw(): void {
    const compassCenter = this.props.compassCenter.get();
    const compassRadius = this.props.compassRadius.get();
    const compassRotation = this.props.compassRotation.get();
    const angularWidth = this.props.arcAngularWidth.get();
    const selectedHeading = this.props.selectedHeading.get();

    if (MathUtils.diffAngleDeg(selectedHeading, -compassRotation * Avionics.Utils.RAD2DEG, false) > angularWidth / 2) {
      return;
    }

    this.transformPathStream
      .resetTransform()
      .addTranslation(0, -compassRadius)
      .addRotation(selectedHeading * Avionics.Utils.DEG2RAD + compassRotation)
      .addTranslation(compassCenter[0], compassCenter[1]);

    this.transformPathStream.beginPath();
    this.transformPathStream.moveTo(-12 * this.xScale, -12 * this.yScale);
    this.transformPathStream.lineTo(-12 * this.xScale, 0);
    this.transformPathStream.lineTo(12 * this.xScale, 0);
    this.transformPathStream.lineTo(12 * this.xScale, -12 * this.yScale);
    this.transformPathStream.lineTo(6.62 * this.xScale, -12 * this.yScale);
    this.transformPathStream.lineTo(0, -6 * this.yScale);
    this.transformPathStream.lineTo(-6.62 * this.xScale, -12 * this.yScale);
    this.transformPathStream.closePath();

    if (this.props.bugOutlineWidth > 0) {
      this.display.context.lineWidth = this.props.bugOutlineWidth * 2;
      this.display.context.strokeStyle = this.props.bugOutlineColor;
      this.display.context.stroke();
    }

    this.display.context.fillStyle = this.props.bugColor;
    this.display.context.fill();
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}