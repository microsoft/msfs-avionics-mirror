import {
  FSComponent, MapAutopilotPropsModule, MapLayer, MapLayerProps, MapOwnAirplanePropsModule, MappedSubject, MappedSubscribable, MapProjection,
  MapSyncedCanvasLayer, MapSystemKeys, NumberUnitInterface, Subject, Subscribable, Subscription, UnitFamily, UnitType, Vec2Math, Vec2Subject, VNode
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapAltitudeArcModule } from '../modules/MapAltitudeArcModule';

/**
 * Modules required for MapAltitudeArcLayer.
 */
export interface MapAltitudeArcLayerModules {
  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Autopilot module. */
  [MapSystemKeys.AutopilotProps]: MapAutopilotPropsModule;

  /** Altitude intercept arc module. */
  [GarminMapKeys.AltitudeArc]: MapAltitudeArcModule;
}

/**
 * Component props for MapAltitudeArcLayer.
 */
export interface MapAltitudeArcLayerProps extends MapLayerProps<MapAltitudeArcLayerModules> {
  /** The precision to apply to the airplane's vertical speed when calculating the position of the arc. */
  verticalSpeedPrecision: NumberUnitInterface<UnitFamily.Speed> | Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /** The minimum magnitude of the airplane's vertical speed required to display the arc. */
  verticalSpeedThreshold: NumberUnitInterface<UnitFamily.Speed> | Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /** The minimum magnitude of the airplane's vertical deviation from the selected altitude required to display the arc. */
  altitudeDeviationThreshold: NumberUnitInterface<UnitFamily.Distance> | Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The angular width of the arc, in degrees. Defaults to 60 degrees */
  arcAngularWidth?: number;

  /** The radius of the arc, in pixels. Defaults to 64 pixels. */
  arcRadius?: number;

  /** The width of the arc stroke, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The style of the arc stroke. Defaults to `'cyan'`. */
  strokeStyle?: string;

  /** The width of the arc outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number;

  /** The style of the arc outline. Defaults to `'#505050'`. */
  outlineStyle?: string;
}

/**
 * A map layer which displays an altitude intercept arc.
 */
export class MapAltitudeArcLayer extends MapLayer<MapAltitudeArcLayerProps> {
  private static readonly DEFAULT_ARC_ANGULAR_WIDTH = 60; // degrees
  private static readonly DEFAULT_ARC_RADIUS = 64; // px
  private static readonly DEFAULT_STROKE_WIDTH = 2; // px
  private static readonly DEFAULT_STROKE_STYLE = 'cyan';
  private static readonly DEFAULT_OUTLINE_WIDTH = 1; // px
  private static readonly DEFAULT_OUTLINE_STYLE = '#505050';

  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2)];

  private readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer>();

  private readonly arcAngularWidth = (this.props.arcAngularWidth ?? MapAltitudeArcLayer.DEFAULT_ARC_ANGULAR_WIDTH) * Avionics.Utils.DEG2RAD;
  private readonly arcHalfAngularWidth = this.arcAngularWidth / 2;
  private readonly arcRadius = this.props.arcRadius ?? MapAltitudeArcLayer.DEFAULT_ARC_RADIUS;
  private readonly strokeWidth = this.props.strokeWidth ?? MapAltitudeArcLayer.DEFAULT_STROKE_WIDTH;
  private readonly strokeStyle = this.props.strokeStyle ?? MapAltitudeArcLayer.DEFAULT_STROKE_STYLE;
  private readonly outlineWidth = this.props.outlineWidth ?? MapAltitudeArcLayer.DEFAULT_OUTLINE_WIDTH;
  private readonly outlineStyle = this.props.outlineStyle ?? MapAltitudeArcLayer.DEFAULT_OUTLINE_STYLE;

  private readonly ownAirplanePropsModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly autopilotModule = this.props.model.getModule(MapSystemKeys.AutopilotProps);
  private readonly altitudeArcModule = this.props.model.getModule(GarminMapKeys.AltitudeArc);

  private vsPrecisionMap?: MappedSubscribable<number>;
  private vsThresholdMap?: MappedSubscribable<number>;
  private altDevThresholdMap?: MappedSubscribable<number>;

  private readonly vsPrecisionFpm = ('isSubscribable' in this.props.verticalSpeedPrecision)
    ? this.vsPrecisionMap = this.props.verticalSpeedPrecision.map(v => v.asUnit(UnitType.FPM))
    : Subject.create(this.props.verticalSpeedPrecision.asUnit(UnitType.FPM));

  private readonly vsThresholdFpm = ('isSubscribable' in this.props.verticalSpeedThreshold)
    ? this.vsThresholdMap = this.props.verticalSpeedThreshold.map(v => v.asUnit(UnitType.FPM))
    : Subject.create(this.props.verticalSpeedThreshold.asUnit(UnitType.FPM));

  private readonly altDevThresholdFeet = ('isSubscribable' in this.props.altitudeDeviationThreshold)
    ? this.altDevThresholdMap = this.props.altitudeDeviationThreshold.map(v => v.asUnit(UnitType.FOOT))
    : Subject.create(this.props.altitudeDeviationThreshold.asUnit(UnitType.FOOT));

  private readonly vsFpm = this.ownAirplanePropsModule.verticalSpeed.map(vs => vs.asUnit(UnitType.FPM));
  private readonly vsFpmQuantized = MappedSubject.create(
    ([vsFpm, precision]): number => {
      return Math.round(vsFpm / precision) * precision;
    },
    this.vsFpm,
    this.vsPrecisionFpm
  );

  private readonly projectedPlanePosition = Vec2Subject.createFromVector(new Float64Array(2));
  private readonly projectPlanePositionHandler = (): void => {
    const projected = this.props.mapProjection.project(this.ownAirplanePropsModule.position.get(), MapAltitudeArcLayer.vec2Cache[0]);
    this.projectedPlanePosition.set(projected);
  };

  private isArcVisible?: MappedSubscribable<boolean>;

  private needUpdate = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.needUpdate = true;
    } else {
      this.canvasLayerRef.getOrDefault()?.tryGetDisplay()?.clear();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.canvasLayerRef.instance.onAttached();

    this.subscriptions.push(this.ownAirplanePropsModule.position.sub(this.projectPlanePositionHandler));

    const scheduleUpdate = (): void => { this.needUpdate = true; };

    this.isArcVisible = MappedSubject.create(([show, vsFpm, alt, selectedAlt, vsThreshold, altDevThresholdFeet]) => {
      if (!show || Math.abs(vsFpm) < vsThreshold) {
        return false;
      }

      const altDevFeet = selectedAlt.asUnit(UnitType.FOOT) - alt.asUnit(UnitType.FOOT);
      return Math.abs(altDevFeet) >= altDevThresholdFeet && altDevFeet * vsFpm > 0;
    },
      this.altitudeArcModule.show,
      this.vsFpmQuantized,
      this.ownAirplanePropsModule.altitude,
      this.autopilotModule.selectedAltitude,
      this.vsThresholdFpm,
      this.altDevThresholdFeet
    );

    this.isArcVisible.sub(isVisible => { this.setVisible(isVisible); }, true);

    this.subscriptions.push(this.projectedPlanePosition.sub(scheduleUpdate));

    this.subscriptions.push(this.ownAirplanePropsModule.trackTrue.sub(scheduleUpdate));
    this.subscriptions.push(this.ownAirplanePropsModule.groundSpeed.sub(scheduleUpdate));
    this.subscriptions.push(this.ownAirplanePropsModule.altitude.sub(scheduleUpdate));
    this.vsFpmQuantized.sub(scheduleUpdate);

    this.subscriptions.push(this.autopilotModule.selectedAltitude.sub(scheduleUpdate, true));
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.projectPlanePositionHandler();
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const display = this.canvasLayerRef.instance.display!;
    display.clear();

    const track = this.ownAirplanePropsModule.trackTrue.get();
    const groundSpeed = this.ownAirplanePropsModule.groundSpeed.get();
    const altitude = this.ownAirplanePropsModule.altitude.get();
    const selectedAltitude = this.autopilotModule.selectedAltitude.get();
    const vsFpm = this.vsFpmQuantized.get();

    const timeToAltitudeMinute = (selectedAltitude.asUnit(UnitType.FOOT) - altitude.asUnit(UnitType.FOOT)) / vsFpm;
    const distanceToAltitudeFeet = groundSpeed.asUnit(UnitType.FPM) * timeToAltitudeMinute;
    const distancePx = UnitType.FOOT.convertTo(distanceToAltitudeFeet, UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
    const projectedTrackAngle = track * Avionics.Utils.DEG2RAD + this.props.mapProjection.getRotation() - Math.PI / 2;

    const projectedPlanePos = this.projectedPlanePosition.get();

    display.context.beginPath();

    const center = Vec2Math.add(
      Vec2Math.setFromPolar(distancePx - this.arcRadius, projectedTrackAngle, MapAltitudeArcLayer.vec2Cache[0]),
      projectedPlanePos,
      MapAltitudeArcLayer.vec2Cache[0]
    );
    const arcStart = Vec2Math.add(
      Vec2Math.setFromPolar(this.arcRadius, projectedTrackAngle - this.arcHalfAngularWidth, MapAltitudeArcLayer.vec2Cache[1]),
      center,
      MapAltitudeArcLayer.vec2Cache[1]
    );

    display.context.moveTo(arcStart[0], arcStart[1]);
    display.context.arc(
      center[0], center[1],
      this.arcRadius,
      projectedTrackAngle - this.arcHalfAngularWidth, projectedTrackAngle + this.arcHalfAngularWidth
    );

    display.context.lineWidth = this.strokeWidth + this.outlineWidth * 2;
    display.context.strokeStyle = this.outlineStyle;
    display.context.stroke();

    display.context.lineWidth = this.strokeWidth;
    display.context.strokeStyle = this.strokeStyle;
    display.context.stroke();

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapSyncedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.vsPrecisionMap?.destroy();
    this.vsThresholdMap?.destroy();
    this.altDevThresholdMap?.destroy();

    this.vsFpm.destroy();

    this.isArcVisible?.destroy();

    this.subscriptions.forEach(sub => sub.destroy());
  }
}