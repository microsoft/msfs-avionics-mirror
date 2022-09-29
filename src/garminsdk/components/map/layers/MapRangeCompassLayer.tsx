/// <reference types="msfstypes/JS/Avionics" />

import {
  APEvents, BitFlags, ComponentProps, Consumer, DisplayComponent, EventBus, FSComponent, MapCanvasLayer, MapFollowAirplaneModule, MapIndexedRangeModule,
  MapLayer, MapLayerProps, MapOwnAirplanePropsModule, MappedSubject, MapProjection, MapProjectionChangeType, MapSyncedCanvasLayer, MapSystemKeys, NavAngleUnit,
  NavMath, NumberUnitInterface, ReadonlyFloat64Array, Subject, Subscribable, Unit, UnitFamily, UnitType, Vec2Math, Vec2Subject, VNode
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';
import { MapRangeCompassModule } from '../modules/MapRangeCompassModule';
import { MapUnitsModule } from '../modules/MapUnitsModule';

/**
 * Modules required by MapRangeCompassLayer.
 */
export interface MapRangeCompassLayerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Follow airplane module. */
  [MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]: MapOrientationModule;

  /** Range compass module. */
  [GarminMapKeys.RangeCompass]: MapRangeCompassModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * A function which renders labels for map range compasses.
 */
export type MapRangeCompassLabelRenderer = (range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>, displayUnit: Subscribable<Unit<UnitFamily.Distance>>) => VNode;

/**
 * Component props for MapRangeCompassLayer.
 */
export interface MapRangeCompassLayerProps extends MapLayerProps<MapRangeCompassLayerModules> {
  /** The event bus. */
  bus: EventBus;

  /** Whether to show the range label. */
  showLabel: boolean;

  /**
   * A function which renders labels for the rings. If not defined, a default label of type {@link MapRangeDisplay}
   * will be rendered.
   */
  renderLabel?: MapRangeCompassLabelRenderer;

  /** Whether to show the selected heading bug. */
  showHeadingBug: boolean;

  /** The width, in pixels, of the compass arc stroke. Defaults to 2 pixels. */
  arcStrokeWidth?: number;

  /** The style of the compass arc stroke. Defaults to `'white'`. */
  arcStrokeColor?: string;

  /** The length, in pixels, of major bearing ticks. */
  bearingTickMajorLength: number;

  /** The length, in pixels, of minor bearing ticks. */
  bearingTickMinorLength: number;

  /** The length, in pixels, of the tick marks at the ends of the compass arc. Defaults to the major bearing tick length. */
  arcEndTickLength?: number;

  /** The bearing label font type. */
  bearingLabelFont: string;

  /** The size, in pixels, of the bearing label font. */
  bearingLabelFontSize: number;

  /** The color of the bearing label font. Defaults to the arc stroke color. */
  bearingLabelFontColor?: string;

  /** The width, in pixels, of the bearing label font's outline. Defaults to 6 pixels. */
  bearingLabelOutlineWidth?: number;

  /** The color of the bearing label outline. Defaults to `'black'`. */
  bearingLabelOutlineColor?: string;

  /**
   * The radial offset, in pixels, of bearing labels from its associated tick mark. Positive values shift the label
   * away from the tick mark. Defaults to 0 pixels.
   */
  bearingLabelRadialOffset?: number;

  /**
   * The width, in pixels, of the reference tick. Defaults to the arc stroke width.
   */
  referenceTickWidth?: number;

  /**
   * The height, in pixels, of the reference tick. Defaults to the minor bearing tick length.
   */
  referenceTickHeight?: number;

  /**
   * The width, in pixels, of the selected heading bug.
   */
  headingBugWidth?: number;

  /**
   * The height, in pixels, of the selected heading bug.
   */
  headingBugHeight?: number;

  /** The width, in pixels, of the selected heading line. Defaults to the arc stroke width. */
  headingLineWidth?: number;

  /** The style of the selected heading line. Defaults to `'cyan'`. */
  headingLineStyle?: string | CanvasGradient | CanvasPattern;

  /**
   * The dash array of the selected heading line. Defaults to `[3 * width, 3 * width]`, where `width` is the width of
   * the heading line.
   */
  headingLineDash?: readonly number[];

  /**
   * The width, in pixels, of the reference arrow.
   */
  referenceArrowWidth?: number;

  /**
   * The height, in pixels, of the reference arrow.
   */
  referenceArrowHeight?: number;
}

/**
 * A map layer which draws a range compass in front of the map target.
 */
export class MapRangeCompassLayer extends MapLayer<MapRangeCompassLayerProps> {
  /** The angular width of the compass arc, in degrees. */
  public static readonly ARC_ANGULAR_WIDTH = 120;

  /** The angular interval, in degrees, between major bearing ticks. */
  public static readonly BEARING_TICK_MAJOR_INTERVAL = 30;

  /** The number of minor bearing ticks per major bearing tick. */
  public static readonly BEARING_TICK_MINOR_FACTOR = 3;

  /** The radial on which the range label is positioned, in degrees. */
  public static readonly RANGE_LABEL_RADIAL_ANGLE = -135;

  private static readonly DEFAULT_ARC_STROKE_WIDTH = 2; // px
  private static readonly DEFAULT_ARC_STROKE_COLOR = 'white';

  private static readonly DEFAULT_HEADING_LABEL_OUTLINE_WIDTH = 6; // px
  private static readonly DEFAULT_HEADING_LABEL_OUTLINE_COLOR = 'black';
  private static readonly DEFAULT_HEADING_LABEL_RADIAL_OFFSET = 0; // px

  private static readonly DEFAULT_HEADING_BUG_WIDTH = 20; // px
  private static readonly DEFAULT_HEADING_BUG_HEIGHT = 10; // px
  private static readonly DEFAULT_HEADING_LINE_STYLE = 'cyan';
  private static readonly DEFAULT_REF_ARROW_WIDTH = 15; // px
  private static readonly DEFAULT_REF_ARROW_HEIGHT = 20; // px

  private static readonly vec2Cache = Array.from({ length: 4 }, () => new Float64Array(2));

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly arcLayerRef = FSComponent.createRef<MapSyncedCanvasLayer<MapLayerProps<MapRangeCompassLayerModules>>>();
  private readonly roseLayerContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly roseLayerRef = FSComponent.createRef<MapRangeCompassRose>();
  private readonly referenceMarkerContainerRef = FSComponent.createRef<MapRangeCompassReferenceMarkerContainer>();
  private readonly roseLabelsLayerRef = FSComponent.createRef<MapRangeCompassRoseLabels>();
  private readonly headingIndicatorRef = FSComponent.createRef<MapRangeCompassSelectedHeading>();
  private readonly rangeDisplayContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly arcStrokeWidth = this.props.arcStrokeWidth ?? MapRangeCompassLayer.DEFAULT_ARC_STROKE_WIDTH;
  private readonly arcStrokeColor = this.props.arcStrokeColor ?? MapRangeCompassLayer.DEFAULT_ARC_STROKE_COLOR;
  private readonly arcEndTickLength = this.props.arcEndTickLength ?? this.props.bearingTickMajorLength;

  private readonly bearingLabelFontColor = this.props.bearingLabelFontColor ?? this.arcStrokeColor;
  private readonly bearingLabelOutlineWidth = this.props.bearingLabelOutlineWidth ?? MapRangeCompassLayer.DEFAULT_HEADING_LABEL_OUTLINE_WIDTH;
  private readonly bearingLabelOutlineColor = this.props.bearingLabelOutlineColor ?? MapRangeCompassLayer.DEFAULT_HEADING_LABEL_OUTLINE_COLOR;
  private readonly bearingLabelRadialOffset = this.props.bearingLabelRadialOffset ?? MapRangeCompassLayer.DEFAULT_HEADING_LABEL_RADIAL_OFFSET;

  private readonly referenceTickWidth = this.props.referenceTickWidth ?? this.arcStrokeWidth;
  private readonly referenceTickHeight = this.props.referenceTickHeight ?? this.props.bearingTickMinorLength;

  private readonly headingBugWidth = this.props.headingBugWidth ?? MapRangeCompassLayer.DEFAULT_HEADING_BUG_WIDTH;
  private readonly headingBugHeight = this.props.headingBugHeight ?? MapRangeCompassLayer.DEFAULT_HEADING_BUG_HEIGHT;
  private readonly headingLineWidth = this.props.headingLineWidth ?? this.arcStrokeWidth;
  private readonly headingLineStyle = this.props.headingLineStyle ?? MapRangeCompassLayer.DEFAULT_HEADING_LINE_STYLE;
  private readonly headingLineDash = this.props.headingLineDash ?? [3 * this.headingLineWidth, 3 * this.headingLineWidth];
  private readonly referenceArrowWidth = this.props.referenceArrowWidth ?? MapRangeCompassLayer.DEFAULT_REF_ARROW_WIDTH;
  private readonly referenceArrowHeight = this.props.referenceArrowHeight ?? MapRangeCompassLayer.DEFAULT_REF_ARROW_HEIGHT;

  private readonly unitsModule = this.props.model.getModule(GarminMapKeys.Units);
  private readonly rangeModule = this.props.model.getModule(GarminMapKeys.Range);
  private readonly orientationModule = this.props.model.getModule(GarminMapKeys.Orientation);
  private readonly rangeRingModule = this.props.model.getModule(GarminMapKeys.RangeCompass);

  private readonly isFollowingAirplane = this.props.model.getModule(MapSystemKeys.FollowAirplane).isFollowing;

  private readonly centerSubject = Vec2Subject.createFromVector(new Float64Array(2));
  private readonly radiusSubject = Subject.create(0);
  private readonly rotationSubject = Subject.create(0);
  private readonly magVarCorrectionSubject = MappedSubject.create(
    ([navAngle, magVar]) => navAngle.isMagnetic() ? magVar : 0,
    this.unitsModule?.navAngle ?? Subject.create(NavAngleUnit.create(true)),
    this.props.model.getModule(MapSystemKeys.OwnAirplaneProps).magVar
  );

  private readonly referenceMarkerTypeSub = Subject.create(MapRangeCompassReferenceMarkerType.TICK);

  private needUpdateRootVisibility = false;
  private needRedrawArc = true;
  private needRedrawBearings = true;
  private needRotateBearingTicks = true;
  private needRechooseReferenceMarker = true;
  private needRepositionReferenceMarker = true;
  private needReclipTicks = true;
  private needUpdateHeadingIndicatorVisibility = true;
  private needRepositionLabel = true;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.needUpdateRootVisibility = true;
    if (isVisible) {
      this.needRechooseReferenceMarker = true;
      this.updateParameters();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.arcLayerRef.instance.onAttached();
    this.roseLayerRef.instance.onAttached();
    this.roseLabelsLayerRef.instance.onAttached();
    this.referenceMarkerContainerRef.instance.onAttached();
    this.headingIndicatorRef.getOrDefault()?.onAttached();

    this.initListeners();
    this.updateVisibility();
    this.updateParameters();
  }

  /**
   * Initializes listeners.
   */
  private initListeners(): void {
    this.initParameterListeners();
    this.initModuleListeners();
    this.isFollowingAirplane.sub(() => {
      this.needRechooseReferenceMarker = true;
      this.needUpdateHeadingIndicatorVisibility = true;
    });
  }

  /**
   * Initializes parameter listeners.
   */
  private initParameterListeners(): void {
    this.centerSubject.sub(this.onCenterChanged.bind(this));
    this.radiusSubject.sub(this.onRadiusChanged.bind(this));
    this.rotationSubject.sub(this.onRotationChanged.bind(this));
    this.magVarCorrectionSubject.sub(this.onMagVarCorrectionChanged.bind(this));
  }

  /**
   * Initializes modules listeners.
   */
  private initModuleListeners(): void {
    this.rangeModule.nominalRange.sub(this.onRangeChanged.bind(this));
    this.orientationModule.orientation.sub(this.onOrientationChanged.bind(this));
    this.rangeRingModule.show.sub(this.onRangeCompassShowChanged.bind(this));
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.arcLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.roseLabelsLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    if (this.props.showHeadingBug) {
      this.headingIndicatorRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    }

    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      // resizing the map will cause synced canvas layers to clear themselves, so we need to force a redraw on these
      // layers.
      this.needRedrawArc = true;
      this.needRedrawBearings = true;
    }

    if (!this.isVisible()) {
      return;
    }

    this.updateParameters();
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (this.needUpdateRootVisibility) {
      this.updateRootVisibility();
      this.needUpdateRootVisibility = false;
    }

    if (!this.isVisible()) {
      return;
    }

    this.redraw();
    this.updateSubLayers(time, elapsed);
  }

  /**
   * Updates the visibility of this layer's root.
   */
  private updateRootVisibility(): void {
    this.rootRef.instance.style.display = this.isVisible() ? 'block' : 'none';
  }

  /**
   * Redraws the compass.
   */
  private redraw(): void {
    this.redrawArc();
    this.redrawBearings();
    this.updateReferenceMarker();
    this.updateHeadingIndicator();
    if (this.props.showLabel) {
      this.updateLabel();
    }
  }

  /**
   * Redraws the arc of the compass.
   */
  private redrawArc(): void {
    if (!this.needRedrawArc) {
      return;
    }

    const arcLayerDisplay = this.arcLayerRef.instance.display;
    arcLayerDisplay.clear();

    const center = this.centerSubject.get();
    const radius = this.radiusSubject.get();
    const angularWidthRad = MapRangeCompassLayer.ARC_ANGULAR_WIDTH * Avionics.Utils.DEG2RAD;
    const startAngle = -Math.PI / 2 - angularWidthRad / 2;
    const endAngle = -Math.PI / 2 + angularWidthRad / 2;
    const leftTickStart = Vec2Math.add(
      Vec2Math.setFromPolar(radius + this.arcEndTickLength, startAngle, MapRangeCompassLayer.vec2Cache[0]),
      center,
      MapRangeCompassLayer.vec2Cache[0]
    );
    const leftTickEnd = Vec2Math.add(
      Vec2Math.setFromPolar(radius, startAngle, MapRangeCompassLayer.vec2Cache[1]),
      center,
      MapRangeCompassLayer.vec2Cache[1]
    );
    const rightTickStart = Vec2Math.add(
      Vec2Math.setFromPolar(radius, endAngle, MapRangeCompassLayer.vec2Cache[2]),
      center,
      MapRangeCompassLayer.vec2Cache[2]
    );
    const rightTickEnd = Vec2Math.add(
      Vec2Math.setFromPolar(radius + this.arcEndTickLength, endAngle, MapRangeCompassLayer.vec2Cache[3]),
      center,
      MapRangeCompassLayer.vec2Cache[3]
    );
    this.composeArcPath(center, radius, angularWidthRad, leftTickStart, leftTickEnd, rightTickStart, rightTickEnd);
    arcLayerDisplay.context.lineWidth = this.arcStrokeWidth;
    arcLayerDisplay.context.strokeStyle = this.arcStrokeColor;
    arcLayerDisplay.context.stroke();

    this.needRedrawArc = false;
  }

  /**
   * Composes the path of the compass arc.
   * @param center The center of the compass, in pixels.
   * @param radius The radius of the compass, in pixels.
   * @param angularWidth The angular width of the arc, in radians.
   * @param leftTickStart The position of the start of the left end tick, in pixels.
   * @param leftTickEnd The position of the end of the left end tick, in pixels.
   * @param rightTickStart The position of the start of the right end tick, in pixels.
   * @param rightTickEnd The position of the end of the right end tick, in pixels.
   */
  private composeArcPath(
    center: ReadonlyFloat64Array,
    radius: number,
    angularWidth: number,
    leftTickStart: ReadonlyFloat64Array,
    leftTickEnd: ReadonlyFloat64Array,
    rightTickStart: ReadonlyFloat64Array,
    rightTickEnd: ReadonlyFloat64Array
  ): void {
    const arcLayerDisplay = this.arcLayerRef.instance.display;
    arcLayerDisplay.context.beginPath();
    arcLayerDisplay.context.moveTo(leftTickStart[0], leftTickStart[1]);
    arcLayerDisplay.context.lineTo(leftTickEnd[0], leftTickEnd[1]);
    arcLayerDisplay.context.arc(center[0], center[1], radius, (-angularWidth - Math.PI) / 2, (angularWidth - Math.PI) / 2);
    arcLayerDisplay.context.lineTo(rightTickEnd[0], rightTickEnd[1]);
  }

  /**
   * Redraws the bearing tick and labels.
   */
  private redrawBearings(): void {
    if (!this.needRedrawBearings && !this.needRotateBearingTicks) {
      return;
    }

    this.roseLabelsLayerRef.instance.redraw();
    this.roseLayerRef.instance.updateRotation();

    this.needRotateBearingTicks = false;

    if (!this.needRedrawBearings && !this.needReclipTicks) {
      return;
    }

    if (this.needReclipTicks) {
      this.updateBearingTickClip();
    }

    this.roseLayerRef.instance.redraw();

    this.needRedrawBearings = false;
  }

  /**
   * Updates the bearing tick clip mask.
   */
  private updateBearingTickClip(): void {
    const center = this.centerSubject.get();
    const radius = this.radiusSubject.get();
    const thick = this.arcStrokeWidth / 2;
    const innerToOuterLength = this.arcEndTickLength + thick + 5;
    const totalRadius = radius + this.arcEndTickLength + thick / 2 + 5;
    const leftAngle = -MapRangeCompassLayer.ARC_ANGULAR_WIDTH / 2 * Avionics.Utils.DEG2RAD - Math.PI / 2;

    const leftInner1 = Vec2Math.setFromPolar(radius - thick / 2, leftAngle, MapRangeCompassLayer.vec2Cache[0]);
    const leftInner2 = Vec2Math.setFromPolar(thick / 2, leftAngle - Math.PI / 2, MapRangeCompassLayer.vec2Cache[1]);
    const leftOuter = Vec2Math.setFromPolar(innerToOuterLength, leftAngle, MapRangeCompassLayer.vec2Cache[2]);
    const outerWidth = Math.abs(leftInner1[0] + leftInner2[0] + leftOuter[0]) * 2;

    (this.roseLayerContainerRef.instance.style as any).webkitClipPath // the cast is to avoid typescript complaining webkitCliPath doesn't exist
      = `path('M${center[0]},${center[1]} l${leftInner1[0]},${leftInner1[1]} l${leftInner2[0]},${leftInner2[1]} l${leftOuter[0]},${leftOuter[1]} a${totalRadius},${totalRadius},0,0,1,${outerWidth},0 l${leftInner2[0]},${-leftInner2[1]} l${leftInner1[0]},${-leftInner1[1]} Z')`;

    this.needReclipTicks = false;
  }

  /**
   * Redraws the reference marker.
   */
  private updateReferenceMarker(): void {
    if (!this.needRechooseReferenceMarker && !this.needRepositionReferenceMarker) {
      return;
    }

    if (this.needRechooseReferenceMarker) {
      const orientation = this.orientationModule.orientation.get();
      const type = (this.props.showHeadingBug && this.isFollowingAirplane.get() && orientation === MapOrientation.HeadingUp)
        ? MapRangeCompassReferenceMarkerType.ARROW
        : MapRangeCompassReferenceMarkerType.TICK;

      this.referenceMarkerTypeSub.set(type);

      this.needRechooseReferenceMarker = false;
    }

    if (!this.needRepositionReferenceMarker) {
      return;
    }

    this.referenceMarkerContainerRef.instance.reposition();

    this.needRepositionReferenceMarker = false;
  }

  /**
   * Updates the selected heading indicator.
   */
  private updateHeadingIndicator(): void {
    if (!this.needUpdateHeadingIndicatorVisibility) {
      return;
    }

    const orientation = this.orientationModule.orientation.get();
    this.headingIndicatorRef.getOrDefault()?.setVisible(this.isFollowingAirplane.get() && orientation === MapOrientation.HeadingUp);

    this.needUpdateHeadingIndicatorVisibility = false;
  }

  /**
   * Updates the range display label.
   */
  private updateLabel(): void {
    if (!this.needRepositionLabel) {
      return;
    }

    const center = this.centerSubject.get();
    const radius = this.radiusSubject.get();
    const pos = Vec2Math.add(
      Vec2Math.setFromPolar(radius, MapRangeCompassLayer.RANGE_LABEL_RADIAL_ANGLE * Avionics.Utils.DEG2RAD, MapRangeCompassLayer.vec2Cache[0]),
      center,
      MapRangeCompassLayer.vec2Cache[0]
    );

    this.rangeDisplayContainerRef.instance.style.left = `${pos[0]}px`;
    this.rangeDisplayContainerRef.instance.style.top = `${pos[1]}px`;

    this.needRepositionLabel = false;
  }

  /**
   * Updates this layer's sublayers.
   * @param time The current time as a UNIX timestamp.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  private updateSubLayers(time: number, elapsed: number): void {
    this.arcLayerRef.instance.onUpdated(time, elapsed);
    this.roseLayerRef.instance.onUpdated(time, elapsed);
    this.roseLabelsLayerRef.instance.onUpdated(time, elapsed);
    this.referenceMarkerContainerRef.instance.onUpdated(time, elapsed);
    if (this.props.showHeadingBug) {
      this.headingIndicatorRef.instance.onUpdated(time, elapsed);
    }
  }

  /**
   * Updates this layer's visibility.
   */
  private updateVisibility(): void {
    this.setVisible(this.props.model.getModule('rangeCompass').show.get());
  }

  /**
   * Updates the ring.
   */
  private updateParameters(): void {
    const center = this.props.mapProjection.getTargetProjected();
    const radius = (this.rangeModule.nominalRange.get().asUnit(UnitType.GA_RADIAN) as number) / this.props.mapProjection.getProjectedResolution();
    const rotation = Math.round((this.props.mapProjection.getRotation() + this.magVarCorrectionSubject.get() * Avionics.Utils.DEG2RAD) * 1e4) / 1e4;

    this.centerSubject.set(center);
    this.radiusSubject.set(radius);
    this.rotationSubject.set(rotation);
  }

  /**
   * Responds to changes in the location of the center of the compass.
   */
  private onCenterChanged(): void {
    this.needRedrawArc = true;
    this.needRedrawBearings = true;
    this.needRepositionReferenceMarker = true;
    this.needReclipTicks = true;
    this.needRepositionLabel = true;
  }

  /**
   * Responds to changes in the radius of the compass.
   */
  private onRadiusChanged(): void {
    this.needRedrawArc = true;
    this.needRedrawBearings = true;
    this.needRepositionReferenceMarker = true;
    this.needReclipTicks = true;
    this.needRepositionLabel = true;
  }

  /**
   * Responds to changes in the rotation of the compass.
   */
  private onRotationChanged(): void {
    this.needRotateBearingTicks = true;
  }

  /**
   * Responds to changes in the magnetic variation correction for the compass.
   */
  private onMagVarCorrectionChanged(): void {
    if (this.isVisible()) {
      this.updateParameters();
    }
  }

  /**
   * Responds to changes in the nominal map range.
   */
  private onRangeChanged(): void {
    if (this.isVisible()) {
      this.updateParameters();
    }
  }

  /**
   * Responds to changes in the map orientation.
   */
  private onOrientationChanged(): void {
    this.needRechooseReferenceMarker = true;
    this.needUpdateHeadingIndicatorVisibility = true;
  }

  /**
   * Responds to changes in whether to show the range ring.
   */
  private onRangeCompassShowChanged(): void {
    this.updateVisibility();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
        <MapSyncedCanvasLayer ref={this.arcLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
        <div ref={this.roseLayerContainerRef} style='position: absolute; width: 100%; height: 100%;'>
          <MapRangeCompassRose
            ref={this.roseLayerRef} model={this.props.model} mapProjection={this.props.mapProjection}
            compassCenterSubject={this.centerSubject} compassRadiusSubject={this.radiusSubject} compassRotationSubject={this.rotationSubject}
            tickMajorInterval={MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL}
            tickMinorMultiplier={MapRangeCompassLayer.BEARING_TICK_MINOR_FACTOR}
            tickMajorLength={this.props.bearingTickMajorLength} tickMinorLength={this.props.bearingTickMinorLength}
            tickStrokeWidth={this.arcStrokeWidth} tickStrokeColor={this.arcStrokeColor}
          />
        </div>
        <MapRangeCompassReferenceMarkerContainer
          ref={this.referenceMarkerContainerRef}
          model={this.props.model} mapProjection={this.props.mapProjection}
          compassCenterSubject={this.centerSubject} compassRadiusSubject={this.radiusSubject} compassRotationSubject={this.rotationSubject}
          activeType={this.referenceMarkerTypeSub}
          tickWidth={this.referenceTickWidth} tickHeight={this.referenceTickHeight}
          arrowWidth={this.referenceArrowWidth} arrowHeight={this.referenceArrowHeight}
          color={this.arcStrokeColor}
        />
        {this.renderSelectedHeadingIndicator()}
        <MapRangeCompassRoseLabels
          ref={this.roseLabelsLayerRef} model={this.props.model} mapProjection={this.props.mapProjection}
          compassCenterSubject={this.centerSubject} compassRadiusSubject={this.radiusSubject} compassRotationSubject={this.rotationSubject}
          angularWidth={MapRangeCompassLayer.ARC_ANGULAR_WIDTH} interval={MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL}
          font={this.props.bearingLabelFont} fontSize={this.props.bearingLabelFontSize} fontColor={this.bearingLabelFontColor}
          outlineWidth={this.bearingLabelOutlineWidth} outlineColor={this.bearingLabelOutlineColor}
          radialOffset={this.props.bearingTickMajorLength + this.bearingLabelRadialOffset}
        />
        {this.renderRangeDisplay()}
      </div>
    );
  }

  /**
   * Renders the selected heading indicator.
   * @returns a VNode representing the range display label.
   */
  private renderSelectedHeadingIndicator(): VNode {
    return this.props.showHeadingBug
      ? (
        <MapRangeCompassSelectedHeading
          ref={this.headingIndicatorRef} model={this.props.model} mapProjection={this.props.mapProjection}
          bus={this.props.bus} // TODO: Refactor this to use a map autopilot module instead of consuming directly from the bus
          compassCenterSubject={this.centerSubject} compassRadiusSubject={this.radiusSubject} compassRotationSubject={this.rotationSubject}
          bugWidth={this.headingBugWidth} bugHeight={this.headingBugHeight}
          bugNotchHeight={this.referenceArrowHeight / 3} bugNotchWidth={this.referenceArrowWidth / 3}
          outlineWidth={1}
          lineWidth={this.headingLineWidth}
          lineStyle={this.headingLineStyle}
          lineDash={this.headingLineDash}
        />
      )
      : (
        <div style='display: none;' />
      );
  }

  /**
   * Renders the range display label.
   * @returns a VNode representing the range display label.
   */
  private renderRangeDisplay(): VNode | null {
    const rangeModule = this.rangeModule;
    const displayUnit = this.unitsModule?.distanceLarge ?? Subject.create(UnitType.NMILE);

    return this.props.showLabel
      ? (
        <div ref={this.rangeDisplayContainerRef} style='position: absolute; transform: translate(-50%, -50%);'>
          {
            this.props.renderLabel !== undefined
              ? this.props.renderLabel(rangeModule.nominalRange, displayUnit)
              : (<MapRangeDisplay range={rangeModule.nominalRange} displayUnit={displayUnit} />)
          }
        </div>
      )
      : null;
  }
}

/**
 * Component props for sublayers of MapRangeCompassLayer.
 */
interface MapRangeCompassSubLayerProps extends MapLayerProps<MapRangeCompassLayerModules> {
  /** A Subject for the center of the compass. */
  compassCenterSubject: Subscribable<ReadonlyFloat64Array>;

  /** A Subject for the radius of the compass. */
  compassRadiusSubject: Subscribable<number>;

  /** A Subject for the rotation of the compass. */
  compassRotationSubject: Subscribable<number>;
}

/**
 * Component props for MapRangeCompassRose.
 */
interface MapRangeCompassRoseProps extends MapRangeCompassSubLayerProps {
  /** The interval, in degrees, between major ticks. */
  tickMajorInterval: number;

  /** The number of minor ticks per major tick. */
  tickMinorMultiplier: number;

  /** The stroke width, in pixels, of bearing ticks. */
  tickStrokeWidth: number;

  /** The stroke color of bearing ticks. */
  tickStrokeColor: string;

  /** The length, in pixels, of major bearing ticks. */
  tickMajorLength: number;

  /** The length, in pixels, of minor bearing ticks. */
  tickMinorLength: number;
}

/**
 * A rotating compass rose with unlabeled graduated bearing ticks.
 */
class MapRangeCompassRose extends MapCanvasLayer<MapRangeCompassRoseProps> {
  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2)];

  private readonly bearingStep = this.props.tickMajorInterval / this.props.tickMinorMultiplier * Avionics.Utils.DEG2RAD;
  private readonly numMinorBearingTicks = Math.floor(2 * Math.PI / this.bearingStep);

  /**
   * Redraws the canvas.
   */
  public redraw(): void {
    const center = this.props.compassCenterSubject.get();
    const radius = this.props.compassRadiusSubject.get();
    const canvasSize = Math.ceil(radius) * 2;

    this.setWidth(canvasSize);
    this.setHeight(canvasSize);

    this.display.canvas.style.left = `${center[0] - canvasSize / 2}px`;
    this.display.canvas.style.top = `${center[1] - canvasSize / 2}px`;

    this.display.clear();
    this.composeBearingTicksPath(radius);
    this.display.context.lineWidth = this.props.tickStrokeWidth;
    this.display.context.strokeStyle = this.props.tickStrokeColor;
    this.display.context.stroke();
  }

  /**
   * Composes the path of the bearing ticks.
   * @param radius The radius of the compass, in pixels.
   */
  private composeBearingTicksPath(radius: number): void {
    const canvasSize = this.getWidth();
    const center = Vec2Math.set(canvasSize / 2, canvasSize / 2, MapRangeCompassRose.vec2Cache[0]);

    this.display.context.beginPath();

    for (let i = 0; i < this.numMinorBearingTicks; i++) {
      const bearing = i * this.bearingStep;
      const angle = bearing - Math.PI / 2;

      let start;
      if (i % MapRangeCompassLayer.BEARING_TICK_MINOR_FACTOR === 0) {
        // major tick
        start = Vec2Math.add(
          Vec2Math.setFromPolar(radius - this.props.tickMajorLength, angle, MapRangeCompassRose.vec2Cache[1]),
          center,
          MapRangeCompassRose.vec2Cache[1]
        );
      } else {
        // minor tick
        start = Vec2Math.add(
          Vec2Math.setFromPolar(radius - this.props.tickMinorLength, angle, MapRangeCompassRose.vec2Cache[1]),
          center,
          MapRangeCompassRose.vec2Cache[1]
        );
      }

      const end = Vec2Math.add(
        Vec2Math.setFromPolar(radius, angle, MapRangeCompassRose.vec2Cache[2]),
        center,
        MapRangeCompassRose.vec2Cache[2]
      );

      this.display.context.moveTo(start[0], start[1]);
      this.display.context.lineTo(end[0], end[1]);
    }
  }

  /**
   * Updates the rotation of this rose.
   */
  public updateRotation(): void {
    this.display.canvas.style.transform = `rotate(${this.props.compassRotationSubject.get()}rad)`;
  }
}

/**
 * Component props for MapRangeCompassRoseLabels.
 */
interface MapRangeCompassRoseLabelsProps extends MapRangeCompassSubLayerProps {
  /** The angular width, in degrees, of the window within which labels are visible. */
  angularWidth: number;

  /** The interval, in degrees, between labels. */
  interval: number;

  /** The bearing label font type. */
  font: string;

  /** The size, in pixels, of the bearing label font. */
  fontSize: number;

  /** The color of the bearing label font. */
  fontColor: string;

  /** The width, in pixels, of the bearing label font's outline. */
  outlineWidth: number;

  /** The color of the bearing label outline. */
  outlineColor: string;

  /**
   * The radial offset, in pixels, of bearing labels from the edge of the rose. Positive values shift the label toward
   * the center of the rose.
   */
  radialOffset: number;
}

/**
 * Bearing labels for a rotating range compass rose.
 */
class MapRangeCompassRoseLabels extends MapSyncedCanvasLayer<MapRangeCompassRoseLabelsProps> {
  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2)];

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.initStyles();
  }

  /**
   * Initializes styles on this layer's canvas context.
   */
  private initStyles(): void {
    this.display.context.lineWidth = this.props.outlineWidth * 2;
    this.display.context.strokeStyle = this.props.outlineColor;
    this.display.context.font = `${this.props.fontSize}px ${this.props.font}`;
    this.display.context.fillStyle = this.props.fontColor;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    super.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.initStyles();
    }
  }

  /**
   * Redraws the bearing labels.
   */
  public redraw(): void {
    this.display.clear();

    const PI2 = Math.PI * 2;
    const center = this.props.compassCenterSubject.get();
    const radius = this.props.compassRadiusSubject.get();
    const rotation = this.props.compassRotationSubject.get();
    const halfAngularWidth = this.props.angularWidth / 2 * Avionics.Utils.DEG2RAD;
    const centerBearing = (-rotation + PI2) % PI2;

    const intervalRad = this.props.interval * Avionics.Utils.DEG2RAD;
    for (let bearing = 0; bearing < PI2; bearing += intervalRad) {
      if (Math.min(Math.abs(bearing - centerBearing), PI2 - Math.abs(bearing - centerBearing)) > halfAngularWidth) {
        continue;
      }

      this.drawBearingLabel(center, radius, rotation, bearing);
    }
  }

  /**
   * Draws a bearing label.
   * @param center The center of the compass, in pixels.
   * @param radius The radius of the compass, in pixels.
   * @param rotation The rotation of the compass, in radians.
   * @param bearing The label's bearing, in radians.
   */
  private drawBearingLabel(center: ReadonlyFloat64Array, radius: number, rotation: number, bearing: number): void {
    // TODO: support the T superscript for true bearings.
    const text = (360 - (360 - (bearing * Avionics.Utils.RAD2DEG)) % 360).toFixed(0).padStart(3, '0');
    const angle = bearing - Math.PI / 2 + rotation;
    const textWidth = this.display.context.measureText(text).width;
    const textHeight = this.props.fontSize;
    const textOffset = Math.hypot(textWidth, textHeight) / 2 + this.props.radialOffset;

    const textRadius = radius - textOffset;
    const labelPos = Vec2Math.add(
      Vec2Math.setFromPolar(textRadius, angle, MapRangeCompassRoseLabels.vec2Cache[0]),
      Vec2Math.set(center[0] - textWidth / 2, center[1] + textHeight / 2, MapRangeCompassRoseLabels.vec2Cache[1]),
      MapRangeCompassRoseLabels.vec2Cache[0]
    );

    if (this.props.outlineWidth > 0) {
      this.display.context.strokeText(text, labelPos[0], labelPos[1]);
    }
    this.display.context.fillText(text, labelPos[0], labelPos[1]);
  }
}

/**
 * Component props for MapRangeCompassReferenceMarker.
 */
interface MapRangeCompassReferenceMarkerProps extends ComponentProps {
  /** The width of the marker. */
  width: number;

  /** The height of the marker. */
  height: number;

  /** The color of the marker. */
  color: string;
}

/**
 * A reference marker for MapRangeCompassLayer.
 */
interface MapRangeCompassReferenceMarker extends DisplayComponent<MapRangeCompassReferenceMarkerProps> {
  /**
   * Sets whether this marker should be visible.
   * @param val Whether this marker should be visible.
   */
  setVisible(val: boolean): void;

  /**
   * Sets this marker's position. The provided position should be the position of the middle of the range compass arc.
   * @param pos The new position, in pixels.
   */
  setPosition(pos: ReadonlyFloat64Array): void;
}

/**
 * A reference arrow for MapRangeCompassLayer.
 */
class MapRangeCompassReferenceArrow extends DisplayComponent<MapRangeCompassReferenceMarkerProps> implements MapRangeCompassReferenceMarker {
  private readonly svgRef = FSComponent.createRef<HTMLElement>();

  /**
   * Sets whether this marker should be visible. This method has no effect if this marker has not been rendered.
   * @param val Whether this marker should be visible.
   */
  public setVisible(val: boolean): void {
    if (!this.svgRef.instance) {
      return;
    }

    this.svgRef.instance.style.display = val ? 'block' : 'none';
  }

  /**
   * Sets this marker's position. The provided position should be the position of the middle of the range compass arc.
   * This method has no effect if this marker has not been rendered.
   * @param pos The new position, in pixels.
   */
  public setPosition(pos: ReadonlyFloat64Array): void {
    if (!this.svgRef.instance) {
      return;
    }

    const svg = this.svgRef.instance;
    svg.style.left = `${pos[0]}px`;
    svg.style.top = `${pos[1]}px`;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg
        ref={this.svgRef} viewBox='0 0 100 100' preserveAspectRatio='none'
        style={`display: none; position: absolute; width: ${this.props.width}px; height: ${this.props.height}px; transform: translate(-50%, -66.7%);`}
      >
        <path d='M 0 0 L 100 0 L 50 100 Z' fill={this.props.color} />
      </svg>
    );
  }
}

/**
 * A reference tick for MapRangeCompassLayer.
 */
class MapRangeCompassReferenceTick extends DisplayComponent<MapRangeCompassReferenceMarkerProps> implements MapRangeCompassReferenceMarker {
  private readonly svgRef = FSComponent.createRef<HTMLElement>();

  /**
   * Sets whether this marker should be visible. This method has no effect if this marker has not been rendered.
   * @param val Whether this marker should be visible.
   */
  public setVisible(val: boolean): void {
    if (!this.svgRef.instance) {
      return;
    }

    this.svgRef.instance.style.display = val ? 'block' : 'none';
  }

  /**
   * Sets this marker's position. The provided position should be the position of the middle of the range compass arc.
   * This method has no effect if this marker has not been rendered.
   * @param pos The new position, in pixels.
   */
  public setPosition(pos: ReadonlyFloat64Array): void {
    if (!this.svgRef.instance) {
      return;
    }

    const svg = this.svgRef.instance;
    svg.style.left = `${pos[0]}px`;
    svg.style.top = `${pos[1]}px`;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg
        ref={this.svgRef} viewBox='0 0 100 100' preserveAspectRatio='none'
        style={`display: none; position: absolute; width: ${this.props.width}px; height: ${this.props.height}px; transform: translate(-50%, -100%);`}
      >
        <rect x='0' y='0' width='100' height='100' fill={this.props.color} />
      </svg>
    );
  }
}

/**
 *
 */
enum MapRangeCompassReferenceMarkerType {
  TICK,
  ARROW
}

/**
 * Component props for MapRangeCompassReferenceMarkerContainer.
 */
interface MapRangeCompassReferenceMarkerContainerProps extends MapRangeCompassSubLayerProps {
  /** A subscribable which provides the active marker type. */
  activeType: Subscribable<MapRangeCompassReferenceMarkerType>;

  /** The width, in pixels, of the reference tick. */
  tickWidth: number;

  /** The height, in pixels, of the reference tick. */
  tickHeight: number;

  /** The width, in pixels, of the reference arrow. */
  arrowWidth: number;

  /** The height, in pixels, of the reference arrow. */
  arrowHeight: number;

  /** The color of the reference markers. */
  color: string;
}

/**
 * A container for range compass reference markers.
 */
class MapRangeCompassReferenceMarkerContainer extends MapLayer<MapRangeCompassReferenceMarkerContainerProps> {
  private static readonly tempVec2 = new Float64Array(2);

  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly referenceTickRef = FSComponent.createRef<MapRangeCompassReferenceMarker>();
  private readonly referenceArrowRef = FSComponent.createRef<MapRangeCompassReferenceMarker>();

  private activeReferenceMarker: MapRangeCompassReferenceMarker | null = null;

  /** @inheritdoc */
  public onAttached(): void {
    this.props.activeType.sub(this.onActiveTypeChanged.bind(this), true);
  }

  /**
   * Responds to active marker type changes.
   * @param type The active marker type.
   */
  private onActiveTypeChanged(type: MapRangeCompassReferenceMarkerType): void {
    const selectedReferenceMarker = type === MapRangeCompassReferenceMarkerType.TICK
      ? this.referenceTickRef.instance
      : this.referenceArrowRef.instance;

    const oldActiveMarker = this.activeReferenceMarker;

    if (oldActiveMarker !== selectedReferenceMarker) {
      this.activeReferenceMarker = selectedReferenceMarker;
      oldActiveMarker?.setVisible(false);
      this.activeReferenceMarker.setVisible(true);
      this.reposition();
    }
  }

  /**
   * Repositions the reference marker.
   */
  public reposition(): void {
    const center = this.props.compassCenterSubject.get();
    const radius = this.props.compassRadiusSubject.get();
    const pos = Vec2Math.add(
      Vec2Math.setFromPolar(radius, -Math.PI / 2, MapRangeCompassReferenceMarkerContainer.tempVec2),
      center,
      MapRangeCompassReferenceMarkerContainer.tempVec2
    );

    this.activeReferenceMarker?.setPosition(pos);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.containerRef} style='position: absolute; width: 100%; height: 100%;'>
        <MapRangeCompassReferenceTick
          ref={this.referenceTickRef}
          width={this.props.tickWidth} height={this.props.tickHeight}
          color={this.props.color}
        />
        <MapRangeCompassReferenceArrow
          ref={this.referenceArrowRef}
          width={this.props.arrowWidth} height={this.props.arrowHeight}
          color={this.props.color}
        />
      </div>
    );
  }
}

/**
 * Component props for MapRangeCompassHeadingBug.
 */
interface MapRangeCompassSelectedHeadingProps extends MapRangeCompassSubLayerProps {
  /** The event bus. */
  bus: EventBus;

  /** The width of the bug, in pixels. */
  bugWidth: number;

  /** The height of the bug, in pixels. */
  bugHeight: number;

  /** The width of the notch in the bug, in pixels. */
  bugNotchWidth: number;

  /** The height of the notch in the bug, in pixels. */
  bugNotchHeight: number;

  /** The width of the bug outline. */
  outlineWidth: number;

  /** The width of the heading line. */
  lineWidth: number;

  /** The style of the heading line. */
  lineStyle: string | CanvasGradient | CanvasPattern;

  /** The dash array for the heading line. */
  lineDash: readonly number[];
}

/**
 * The selected heading bug and heading line for the map range compass layer.
 */
class MapRangeCompassSelectedHeading extends MapLayer<MapRangeCompassSelectedHeadingProps> {
  /** The amount of time, in milliseconds, the indicator is unsuppressed when the selected heading is changed. */
  public static readonly UNSUPPRESS_DURATION = 3000;

  /** The color of the bug and line. */
  public static readonly COLOR = 'cyan';

  /** The outline color of the bug. */
  public static readonly OUTLINE_COLOR = 'black';

  private static readonly NO_LINE_DASH = [];

  private readonly canvasLayerRef = FSComponent.createRef<MapCanvasLayer<any>>();
  private selectedHeadingConsumer: Consumer<number>;
  private selectedHeading = 0;
  private isInit = false;
  private readonly isSuppressedSubject = Subject.create(true);
  private suppressTimer: NodeJS.Timeout | null = null;

  private readonly centerSubject = Vec2Subject.createFromVector(new Float64Array(2));
  private readonly radiusSubject = Subject.create(0);
  private readonly rotationSubject = Subject.create(0);
  private readonly isOOBSubject = Subject.create(true);

  private needRedraw = true;
  private needReposition = true;
  private needRotate = true;

  /** @inheritdoc */
  constructor(props: MapRangeCompassSelectedHeadingProps) {
    super(props);

    this.selectedHeadingConsumer = this.props.bus.getSubscriber<APEvents>().on('ap_heading_selected').whenChanged();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
  public onVisibilityChanged(isVisible: boolean): void {
    if (this.isInit) {
      this.updateFromVisibility();
    }
  }

  /**
   * Updates this layer according to its current visibility.
   */
  private updateFromVisibility(): void {
    const isVisible = this.isVisible();
    if (isVisible) {
      this.selectedHeadingConsumer.handle(this.onSelectedHeadingChanged);
    } else {
      this.selectedHeadingConsumer.off(this.onSelectedHeadingChanged);
      this.suppress();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();
    this.initCanvas();
    this.isInit = true;

    this.initSubjectListeners();
    this.updateFromVisibility();
  }

  /**
   * Initializes canvas width.
   */
  private initCanvas(): void {
    const width = Math.max(this.props.lineWidth, this.props.bugWidth + this.props.outlineWidth * 2);
    this.canvasLayerRef.instance.setWidth(width);

    const canvasLayerDisplay = this.canvasLayerRef.instance.display;
    canvasLayerDisplay.canvas.style.width = `${width}px`;

    canvasLayerDisplay.canvas.style.transformOrigin = '50% 100%';
  }

  /**
   * Initializes subject listeners.
   */
  private initSubjectListeners(): void {
    this.props.compassCenterSubject.sub(this.updateParameters.bind(this));
    this.props.compassRadiusSubject.sub(this.updateParameters.bind(this));
    this.props.compassRotationSubject.sub(this.updateParameters.bind(this));

    this.centerSubject.sub(this.onCenterChanged.bind(this));
    this.radiusSubject.sub(this.onRadiusChanged.bind(this));
    this.rotationSubject.sub(this.onRotationChanged.bind(this));

    this.isSuppressedSubject.sub(this.onIsSuppressedChanged.bind(this));
    this.isOOBSubject.sub(this.onIsOOBChanged.bind(this));
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.needReposition = true;
      this.needRedraw = true;
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onUpdated(time: number, elapsed: number): void {
    this.canvasLayerRef.instance.onUpdated(time, elapsed);

    if (this.needReposition) {
      this.reposition();
    } else if (this.needRedraw) {
      this.redraw();
    }

    if (this.needRotate) {
      this.rotate();
    }
  }

  /**
   * Repositions the canvas.
   */
  private reposition(): void {
    const center = this.props.compassCenterSubject.get();
    const projectedWidth = this.props.mapProjection.getProjectedSize()[0];
    const projectedHeight = this.props.mapProjection.getProjectedSize()[1];

    // find the distance to the farthest corner.
    const isLeft = center[0] > projectedWidth / 2;
    const isTop = center[1] > projectedHeight / 2;
    const height = Math.hypot(center[0] - (isLeft ? 0 : projectedWidth), center[1] - (isTop ? 0 : projectedHeight));

    this.canvasLayerRef.instance.setHeight(height);

    const canvasLayerDisplay = this.canvasLayerRef.instance.display;
    canvasLayerDisplay.canvas.style.height = `${height}px`;

    canvasLayerDisplay.canvas.style.left = `${center[0] - this.canvasLayerRef.instance.getWidth() / 2}px`;
    canvasLayerDisplay.canvas.style.bottom = `${projectedHeight - center[1]}px`;

    this.needReposition = false;

    this.redraw();
  }

  /**
   * Redraws the canvas.
   */
  private redraw(): void {
    const canvasWidth = this.canvasLayerRef.instance.getWidth();
    const canvasHeight = this.canvasLayerRef.instance.getHeight();
    const radius = this.props.compassRadiusSubject.get();

    const canvasLayerDisplay = this.canvasLayerRef.instance.display;
    canvasLayerDisplay.clear();

    this.redrawLine(canvasWidth, canvasHeight);
    this.redrawBug(canvasWidth, canvasHeight, radius);

    this.needRedraw = false;
  }

  /**
   * Redraws the heading line.
   * @param canvasWidth The width of the canvas, in pixels.
   * @param canvasHeight The height of the canvas, in pixels.
   */
  private redrawLine(canvasWidth: number, canvasHeight: number): void {
    const canvasLayerDisplay = this.canvasLayerRef.instance.display;

    canvasLayerDisplay.context.beginPath();
    canvasLayerDisplay.context.moveTo(canvasWidth / 2, canvasHeight);
    canvasLayerDisplay.context.lineTo(canvasWidth / 2, 0);

    canvasLayerDisplay.context.lineWidth = this.props.lineWidth;
    canvasLayerDisplay.context.strokeStyle = MapRangeCompassSelectedHeading.COLOR;
    canvasLayerDisplay.context.setLineDash(this.props.lineDash);
    canvasLayerDisplay.context.stroke();
  }

  /**
   * Redraws the heading bug.
   * @param canvasWidth The width of the canvas, in pixels.
   * @param canvasHeight The height of the canvas, in pixels.
   * @param radius The radius of the compass, in pixels.
   */
  private redrawBug(canvasWidth: number, canvasHeight: number, radius: number): void {
    const canvasLayerDisplay = this.canvasLayerRef.instance.display;

    const left = (canvasWidth - this.props.bugWidth) / 2;
    const top = canvasHeight - radius;
    const middle = canvasWidth / 2;
    const right = left + this.props.bugWidth;
    const bottom = top + this.props.bugHeight;

    canvasLayerDisplay.context.beginPath();
    canvasLayerDisplay.context.moveTo(left, top);
    canvasLayerDisplay.context.lineTo(middle - this.props.bugNotchWidth / 2, top);
    canvasLayerDisplay.context.lineTo(middle, top + this.props.bugNotchHeight);
    canvasLayerDisplay.context.lineTo(middle + this.props.bugNotchWidth / 2, top);
    canvasLayerDisplay.context.lineTo(right, top);
    canvasLayerDisplay.context.lineTo(right, bottom);
    canvasLayerDisplay.context.lineTo(left, bottom);
    canvasLayerDisplay.context.closePath();

    canvasLayerDisplay.context.fillStyle = MapRangeCompassSelectedHeading.COLOR;
    canvasLayerDisplay.context.lineWidth = this.props.outlineWidth * 2;
    canvasLayerDisplay.context.strokeStyle = MapRangeCompassSelectedHeading.OUTLINE_COLOR;
    canvasLayerDisplay.context.setLineDash(MapRangeCompassSelectedHeading.NO_LINE_DASH);
    canvasLayerDisplay.context.stroke();
    canvasLayerDisplay.context.fill();
  }

  /**
   * Rotates the canvas.
   */
  private rotate(): void {
    const compassRotation = this.props.compassRotationSubject.get();
    const rotation = this.selectedHeading * Avionics.Utils.DEG2RAD + compassRotation;

    this.canvasLayerRef.instance.display.canvas.style.transform = `rotate(${rotation}rad)`;

    this.needRotate = false;
  }

  /**
   * Suppresses this indicator, making it invisible. Also kills the suppress timer if it is running.
   */
  private suppress(): void {
    this.killSuppressTimer();
    this.isSuppressedSubject.set(true);
  }

  /**
   * Unsuppresses this indicator, making it visible, for a certain duration. If the suppress timer is currently
   * running, it is killed and replaced with a new one which will fire after the specified duration.
   * @param duration The duration for which to unsuppress, in milliseconds.
   */
  private unsuppress(duration: number): void {
    this.killSuppressTimer();

    this.isSuppressedSubject.set(false);
    this.suppressTimer = setTimeout(this.suppressCallback, duration);
  }

  /**
   * A callback which is called when the suppress timer fires.
   */
  private suppressCallback = (): void => {
    this.suppressTimer = null;
    this.isSuppressedSubject.set(true);
  };

  /**
   * Kills the timer to suppress this indicator, if one is currently running.
   */
  private killSuppressTimer(): void {
    if (this.suppressTimer !== null) {
      clearTimeout(this.suppressTimer);
    }
  }

  /**
   * Updates this indicator based on whether it should be suppressed.
   * @param isSuppressed Whether this indicator should be suppressed.
   */
  private updateFromIsSuppressed(isSuppressed: boolean): void {
    this.updateCanvasVisibility(isSuppressed, this.isOOBSubject.get());
  }

  /**
   * Updates this indicator based on whether it is out of the current compass bounds.
   * @param isOOB Whether this indicator is out of the current compass bounds.
   */
  private updateFromIsOOB(isOOB: boolean): void {
    this.updateCanvasVisibility(this.isSuppressedSubject.get(), isOOB);
  }

  /**
   * Updates the visibility of the canvas.
   * @param isSuppressed Whether this indicator is suppressed.
   * @param isOOB Whether this indicator is out of the current compass bounds.
   */
  private updateCanvasVisibility(isSuppressed: boolean, isOOB: boolean): void {
    this.canvasLayerRef.instance.setVisible(!isOOB && !isSuppressed);
  }

  /**
   * Updates this indicator's center, radius, and rotation.
   */
  private updateParameters(): void {
    const compassRotation = this.props.compassRotationSubject.get();
    const compassCenter = -compassRotation * Avionics.Utils.RAD2DEG;
    const isOOB = Math.abs(NavMath.diffAngle(this.selectedHeading, compassCenter)) > MapRangeCompassLayer.ARC_ANGULAR_WIDTH / 2;

    this.isOOBSubject.set(isOOB);

    if (!this.canvasLayerRef.instance.isVisible()) {
      return;
    }

    const center = this.props.compassCenterSubject.get();
    const radius = this.props.compassRadiusSubject.get();
    const rotation = compassRotation + this.selectedHeading * Avionics.Utils.DEG2RAD;

    this.centerSubject.set(center);
    this.radiusSubject.set(radius);
    this.rotationSubject.set(rotation);
  }

  /**
   * A callback which is called when the center of the compass changes.
   */
  private onCenterChanged(): void {
    this.needReposition = true;
  }

  /**
   * A callback which is called when the center of the compass changes.
   */
  private onRadiusChanged(): void {
    this.needRedraw = true;
  }

  /**
   * A callback which is called when the rotation of the compass changes.
   */
  private onRotationChanged(): void {
    this.needRotate = true;
  }

  /**
   * A callback which is called when the selected heading changes.
   * @param heading The new selected heading, in degrees.
   */
  private onSelectedHeadingChanged = (heading: number): void => {
    this.selectedHeading = heading;

    this.unsuppress(MapRangeCompassSelectedHeading.UNSUPPRESS_DURATION);
    this.updateParameters();
  };

  /**
   * A callback which is called when whether this indicator is suppressed has changed.
   * @param isSuppressed Whether this indicator is suppressed.
   */
  private onIsSuppressedChanged(isSuppressed: boolean): void {
    this.updateFromIsSuppressed(isSuppressed);
  }

  /**
   * A callback which is called when whether this indicator is out of the current compass bounds has changed.
   * @param isOOB Whether this indicator is out of the current compass bounds.
   */
  private onIsOOBChanged(isOOB: boolean): void {
    this.updateFromIsOOB(isOOB);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
    );
  }
}