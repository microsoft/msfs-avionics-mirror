/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  BasicNavAngleUnit, BitFlags, EventBus, FSComponent, MapCanvasLayer, MapLayer, MapLayerProps, MappedSubject, MapProjection, MapProjectionChangeType,
  MapSyncedCanvasLayer, MapSystemKeys, NumberUnitInterface, ReadonlyFloat64Array, Subject, Subscribable, Unit, UnitFamily, UnitType, Vec2Math, Vec2Subject,
  VNode
} from '@microsoft/msfs-sdk';

import { GNSMapKeys, GNSMapModules } from './GNSMapSystem';

/**
 * A function which renders labels for map range compasses.
 */
export type MapRangeCompassLabelRenderer = (range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>, displayUnit: Subscribable<Unit<UnitFamily.Distance>>) => VNode;

/**
 * Component props for MapRangeCompassLayer.
 */
export interface MapRangeCompassLayerProps extends MapLayerProps<GNSMapModules> {
  /** The event bus. */
  bus: EventBus;

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
}

/**
 * A map layer which draws a range compass in front of the map target.
 */
export class MapRangeCompassLayer extends MapLayer<MapRangeCompassLayerProps> {
  /** The angular width of the compass arc, in degrees. */
  public static readonly ARC_ANGULAR_WIDTH = 130;

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

  private static readonly vec2Cache = Array.from({ length: 4 }, () => new Float64Array(2));

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly arcLayerRef = FSComponent.createRef<MapSyncedCanvasLayer<MapLayerProps<GNSMapModules>>>();
  private readonly roseLayerContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly roseLayerRef = FSComponent.createRef<MapRangeCompassRose>();
  private readonly roseLabelsLayerRef = FSComponent.createRef<MapRangeCompassRoseLabels>();

  private readonly arcStrokeWidth = this.props.arcStrokeWidth ?? MapRangeCompassLayer.DEFAULT_ARC_STROKE_WIDTH;
  private readonly arcStrokeColor = this.props.arcStrokeColor ?? MapRangeCompassLayer.DEFAULT_ARC_STROKE_COLOR;
  private readonly arcEndTickLength = this.props.arcEndTickLength ?? this.props.bearingTickMajorLength;

  private readonly bearingLabelFontColor = this.props.bearingLabelFontColor ?? this.arcStrokeColor;
  private readonly bearingLabelOutlineWidth = this.props.bearingLabelOutlineWidth ?? MapRangeCompassLayer.DEFAULT_HEADING_LABEL_OUTLINE_WIDTH;
  private readonly bearingLabelOutlineColor = this.props.bearingLabelOutlineColor ?? MapRangeCompassLayer.DEFAULT_HEADING_LABEL_OUTLINE_COLOR;
  private readonly bearingLabelRadialOffset = this.props.bearingLabelRadialOffset ?? MapRangeCompassLayer.DEFAULT_HEADING_LABEL_RADIAL_OFFSET;

  private readonly unitsModule = this.props.model.getModule(GNSMapKeys.Units);
  private readonly rangeModule = this.props.model.getModule(GNSMapKeys.Range);
  private readonly waypointBearingModule = this.props.model.getModule(GNSMapKeys.WaypointBearing);

  private readonly centerSubject = Vec2Subject.create(new Float64Array(2));
  private readonly radiusSubject = Subject.create(0);
  private readonly rotationSubject = Subject.create(0);
  private readonly waypointBearingSubject = Subject.create<number | undefined>(undefined);
  private readonly magVarCorrectionSubject = MappedSubject.create(
    ([navAngle, magVar]) => navAngle.isMagnetic() ? magVar : 0,
    this.unitsModule?.navAngle ?? Subject.create(BasicNavAngleUnit.create(true)),
    this.props.model.getModule(MapSystemKeys.OwnAirplaneProps).magVar
  );

  private needUpdateRootVisibility = false;
  private needRedrawArc = true;
  private needRedrawBearings = true;
  private needRotateBearingTicks = true;
  private needReclipTicks = true;

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.needUpdateRootVisibility = true;
    if (isVisible) {
      this.updateParameters();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.arcLayerRef.instance.onAttached();
    this.roseLayerRef.instance.onAttached();
    this.roseLabelsLayerRef.instance.onAttached();

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
  }

  /**
   * Initializes parameter listeners.
   */
  private initParameterListeners(): void {
    this.centerSubject.sub(this.onCenterChanged.bind(this));
    this.radiusSubject.sub(this.onRadiusChanged.bind(this));
    this.rotationSubject.sub(this.onRotationChanged.bind(this));
    this.waypointBearingSubject.sub(this.onWaypointBearingChanged.bind(this));
    this.magVarCorrectionSubject.sub(this.onMagVarCorrectionChanged.bind(this));
  }

  /**
   * Initializes modules listeners.
   */
  private initModuleListeners(): void {
    this.rangeModule.nominalRange.sub(this.onRangeChanged.bind(this));
    this.waypointBearingModule?.waypointBearing.sub(b => this.waypointBearingSubject.set(b));
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.arcLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.roseLabelsLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

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
    const pathStart = Vec2Math.add(
      Vec2Math.setFromPolar(radius, startAngle, MapRangeCompassLayer.vec2Cache[1]),
      center,
      MapRangeCompassLayer.vec2Cache[1]
    );

    this.composeArcPath(center, radius, angularWidthRad, pathStart);
    arcLayerDisplay.context.lineWidth = this.arcStrokeWidth + 3;
    arcLayerDisplay.context.strokeStyle = 'black';
    arcLayerDisplay.context.stroke();

    this.composeArcPath(center, radius, angularWidthRad, pathStart);
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
   * @param pathStart The position of the start of the left end of the arc, in pixels.
   */
  private composeArcPath(
    center: ReadonlyFloat64Array,
    radius: number,
    angularWidth: number,
    pathStart: ReadonlyFloat64Array
  ): void {
    const arcLayerDisplay = this.arcLayerRef.instance.display;
    arcLayerDisplay.context.beginPath();
    arcLayerDisplay.context.moveTo(pathStart[0], pathStart[1]);
    arcLayerDisplay.context.arc(center[0], center[1], radius, (-angularWidth - Math.PI) / 2, (angularWidth - Math.PI) / 2);
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
   * Updates this layer's sublayers.
   * @param time The current time as a UNIX timestamp.
   * @param elapsed The elapsed time, in milliseconds, since the last update.
   */
  private updateSubLayers(time: number, elapsed: number): void {
    this.arcLayerRef.instance.onUpdated(time, elapsed);
    this.roseLayerRef.instance.onUpdated(time, elapsed);
    this.roseLabelsLayerRef.instance.onUpdated(time, elapsed);
  }

  /**
   * Updates this layer's visibility.
   */
  private updateVisibility(): void {
    this.setVisible(true);
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
    this.waypointBearingSubject.set(this.waypointBearingModule?.waypointBearing.get());
  }

  /**
   * Responds to changes in the location of the center of the compass.
   */
  private onCenterChanged(): void {
    this.needRedrawArc = true;
    this.needRedrawBearings = true;
    this.needReclipTicks = true;
  }

  /**
   * Responds to changes in the radius of the compass.
   */
  private onRadiusChanged(): void {
    this.needRedrawArc = true;
    this.needRedrawBearings = true;
    this.needReclipTicks = true;
  }

  /**
   * Responds to changes in the rotation of the compass.
   */
  private onRotationChanged(): void {
    this.needRotateBearingTicks = true;
  }

  /**
   * Responds to changes in the DTK.
   */
  private onWaypointBearingChanged(): void {
    this.needRedrawBearings = true;
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>
        <MapSyncedCanvasLayer ref={this.arcLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
        <div ref={this.roseLayerContainerRef} style='position: absolute; width: 100%; height: 100%;'>
          <MapRangeCompassRose
            ref={this.roseLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} compassWptBearingSubject={this.waypointBearingSubject}
            compassCenterSubject={this.centerSubject} compassRadiusSubject={this.radiusSubject} compassRotationSubject={this.rotationSubject}
            tickMajorInterval={MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL}
            tickMinorMultiplier={MapRangeCompassLayer.BEARING_TICK_MINOR_FACTOR}
            tickMajorLength={this.props.bearingTickMajorLength} tickMinorLength={this.props.bearingTickMinorLength}
            tickStrokeWidth={this.arcStrokeWidth} tickStrokeColor={this.arcStrokeColor}
          />
        </div>
        <MapRangeCompassRoseLabels
          ref={this.roseLabelsLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} compassWptBearingSubject={this.waypointBearingSubject}
          compassCenterSubject={this.centerSubject} compassRadiusSubject={this.radiusSubject} compassRotationSubject={this.rotationSubject}
          angularWidth={MapRangeCompassLayer.ARC_ANGULAR_WIDTH} interval={MapRangeCompassLayer.BEARING_TICK_MAJOR_INTERVAL}
          font={this.props.bearingLabelFont} fontSize={this.props.bearingLabelFontSize} fontColor={this.bearingLabelFontColor}
          outlineWidth={this.bearingLabelOutlineWidth} outlineColor={this.bearingLabelOutlineColor}
          radialOffset={this.props.bearingTickMajorLength + this.bearingLabelRadialOffset}
        />
      </div>
    );
  }
}

/**
 * Component props for sublayers of MapRangeCompassLayer.
 */
interface MapRangeCompassSubLayerProps extends MapLayerProps<GNSMapModules> {
  /** A Subject for the center of the compass. */
  compassCenterSubject: Subscribable<ReadonlyFloat64Array>;

  /** A Subject for the radius of the compass. */
  compassRadiusSubject: Subscribable<number>;

  /** A Subject for the rotation of the compass. */
  compassRotationSubject: Subscribable<number>;

  /** A subject for the bearing to the current waypoint. */
  compassWptBearingSubject: Subscribable<number | undefined>;
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
    this.display.context.lineWidth = this.props.tickStrokeWidth + 3;
    this.display.context.strokeStyle = 'black';
    this.display.context.stroke();

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

  private readonly normalFont = `${this.props.fontSize}px ${this.props.font}`;
  private readonly majorFont = `${this.props.fontSize + 4}px ${this.props.font}`;

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
    this.display.context.font = this.normalFont;
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
    const dtk = this.props.compassWptBearingSubject.get();
    const halfAngularWidth = this.props.angularWidth / 2 * Avionics.Utils.DEG2RAD;
    const centerBearing = (-rotation + PI2) % PI2;

    const intervalRad = this.props.interval * Avionics.Utils.DEG2RAD;
    for (let bearing = 0; bearing < PI2; bearing += intervalRad) {
      if (Math.min(Math.abs(bearing - centerBearing), PI2 - Math.abs(bearing - centerBearing)) > halfAngularWidth) {
        continue;
      }

      this.drawBearingLabel(center, radius, rotation, bearing);
    }

    this.drawBearingPointer(center, radius, rotation, dtk);
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
    const bearingDeg = (360 - (360 - (bearing * Avionics.Utils.RAD2DEG)) % 360);
    let text = (bearingDeg / 10).toFixed(0);
    let font = this.normalFont;

    switch (text) {
      case '36':
      case '0':
        text = 'N';
        font = this.majorFont;
        break;
      case '9':
        text = 'E';
        font = this.majorFont;
        break;
      case '18':
        text = 'S';
        font = this.majorFont;
        break;
      case '27':
        text = 'W';
        font = this.majorFont;
        break;
    }

    if (this.display.context.font !== font) {
      this.display.context.font = font;
    }

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

  /**
   * Draws the waypoint bearing pointer.
   * @param center The center of the arc.
   * @param radius The radius of the arc.
   * @param rotation The current polar rotation of the map.
   * @param bearing The bearing to the current waypoint, in true degrees north.
   */
  private drawBearingPointer(center: ReadonlyFloat64Array, radius: number, rotation: number, bearing: number | undefined): void {
    if (bearing !== undefined) {
      const PI2 = Math.PI * 2;
      const halfPi = Math.PI / 2;

      const dtkRadians = bearing * Avionics.Utils.DEG2RAD;
      const centerBearing = (-rotation + PI2) % PI2;

      let angle = (centerBearing - dtkRadians + Math.PI) % PI2 - Math.PI;
      angle = angle < - 180 ? angle + PI2 : angle;

      const oldStrokeStyle = this.display.context.strokeStyle;
      this.display.context.strokeStyle = '#0f0';
      this.display.context.lineWidth = 3;

      this.display.context.beginPath();
      const maxAngularWidth = (this.props.angularWidth / 2) * Avionics.Utils.DEG2RAD;

      if (angle >= maxAngularWidth || angle <= -maxAngularWidth) {
        const sign = angle > maxAngularWidth ? -1 : 1;
        const polarAngle = (maxAngularWidth * sign) + halfPi;
        const ySwappedPolarAngle = (polarAngle + Math.PI) % PI2;

        const pos = Vec2Math.add(
          center,
          Vec2Math.setFromPolar(radius, ySwappedPolarAngle, MapRangeCompassRoseLabels.vec2Cache[0]), MapRangeCompassRoseLabels.vec2Cache[0]);

        this.display.context.moveTo(pos[0], pos[1]);
        this.display.context.lineTo(pos[0] + (3 * -sign), pos[1] + 6);
        this.display.context.lineTo(pos[0] + (9 * -sign), pos[1] + 6);

        this.display.context.stroke();
      } else {
        const correctedAngle = -angle + halfPi;
        const correctedOppositeAngle = (correctedAngle + Math.PI) % PI2;

        const pos = Vec2Math.add(center, Vec2Math.setFromPolar(radius, correctedOppositeAngle, MapRangeCompassRoseLabels.vec2Cache[0]), MapRangeCompassRoseLabels.vec2Cache[0]);
        const arrowAngularWidth = 30 * Avionics.Utils.DEG2RAD;
        this.display.context.moveTo(pos[0], pos[1]);

        const leftAngle = Vec2Math.setFromPolar(14, correctedAngle + (arrowAngularWidth / 2), MapRangeCompassRoseLabels.vec2Cache[1]);
        const leftEndPos = Vec2Math.add(pos, leftAngle, MapRangeCompassRoseLabels.vec2Cache[1]);
        this.display.context.lineTo(leftEndPos[0], leftEndPos[1]);

        const rightAngle = Vec2Math.setFromPolar(14, correctedAngle - (arrowAngularWidth / 2), MapRangeCompassRoseLabels.vec2Cache[1]);
        const rightEndPos = Vec2Math.add(pos, rightAngle, MapRangeCompassRoseLabels.vec2Cache[1]);
        this.display.context.moveTo(pos[0], pos[1]);
        this.display.context.lineTo(rightEndPos[0], rightEndPos[1]);

        this.display.context.stroke();
      }

      this.display.context.strokeStyle = oldStrokeStyle;
    }
  }
}