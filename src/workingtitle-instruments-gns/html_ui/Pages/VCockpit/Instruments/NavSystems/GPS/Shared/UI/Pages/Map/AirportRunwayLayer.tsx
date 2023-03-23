import {
  FSComponent, GeoPoint, GeoPointInterface, GeoProjection, MapCachedCanvasLayer, MapCullableLocationTextLabel, MapCullableTextLabelManager, MapCullableTextLayer, MapLayer,
  MapLayerProps, MapProjection, MapSystemWaypointsRenderer, MapWaypoint, NavMath, OneWayRunway, RunwaySurfaceCategory, RunwayUtils, Subscribable, UnitType, Vec2Math, Vec2Subject,
  VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { AirportSize, AirportWaypoint } from '@microsoft/msfs-garminsdk';

import { GNSMapKeys, GNSMapModules } from './GNSMapSystem';
import { GNSType } from '../../../UITypes';

/**
 * Props on the AirportRunwayLayer layer.
 */
interface AirportRunwayLayerProps extends MapLayerProps<GNSMapModules> {
  /** The waypoint renderer to use with this instance. */
  waypointRenderer: MapSystemWaypointsRenderer;

  /** The type of GNS unit that will display these runways. */
  gnsType: GNSType
}

/**
 * A map layer that displays airport runways.
 */
export class AirportRunwayLayer extends MapLayer<AirportRunwayLayerProps> {
  private readonly textManager = new MapCullableTextLabelManager(true);
  private readonly waypointAddedSub = this.props.waypointRenderer.onWaypointAdded.on(this.onWaypointAdded.bind(this));
  private readonly waypointRemovedSub = this.props.waypointRenderer.onWaypointRemoved.on(this.onWaypointRemoved.bind(this));

  private updateRequired = false;

  private displayedAirports = new Map<string, AirportWaypoint>();
  private runwayLabels = new Map<string, RunwayTextLabel[]>();

  private readonly canvasLayerRef = FSComponent.createRef<MapCachedCanvasLayer>();
  private readonly labelLayerRef = FSComponent.createRef<MapCullableTextLayer>();

  private readonly vec2Cache = [new Float64Array(2), new Float64Array(2), new Float64Array(2), new Float64Array(2), new Float64Array(2), new Float64Array(2), new Float64Array(2)];
  private readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];

  private readonly displayModule = this.props.model.getModule(GNSMapKeys.Runways);
  private readonly runwaysDisplayedSub = this.displayModule.displayRunways.sub(() => this.updateRequired = true);
  private readonly labelsDisplayedSub = this.displayModule.displayLabels.sub(() => this.updateRequired = true);
  private readonly focusChangedSub = this.displayModule.focusAirport.sub(this.onFocusAirportChanged.bind(this));

  private focusedAirport?: AirportWaypoint;

  private readonly centerlineDash = [5, 5];

  /** @inheritdoc */
  public onAttached(): void {
    this.canvasLayerRef.instance.onAttached();
    this.labelLayerRef.instance.onAttached();
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.labelLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    this.canvasLayerRef.instance.onUpdated(time, elapsed);
    const performUpdate = this.isVisible() && (this.updateRequired || this.canvasLayerRef.instance.display.isInvalid);
    if (performUpdate) {
      this.canvasLayerRef.instance.display.syncWithMapProjection(this.props.mapProjection);
      this.canvasLayerRef.instance.display.clear();

      const context = this.canvasLayerRef.instance.display.context;
      const geoProjection = this.canvasLayerRef.instance.display.geoProjection;

      context.fillStyle = 'white';
      context.strokeStyle = 'black';
      context.lineWidth = 1;

      if (this.displayModule.displayRunways.get()) {
        for (const airport of this.displayedAirports.values()) {
          this.drawRunways(airport, geoProjection, context);
        }

        const focusAirport = this.displayModule.focusAirport.get();
        if (focusAirport !== undefined && this.displayedAirports.get(focusAirport.uid) === undefined) {
          this.drawRunways(focusAirport, geoProjection, context);
        }
      }

      this.updateRequired = false;
    }

    this.textManager.update(this.props.mapProjection);
    this.labelLayerRef.instance.display.clear();
    const context = this.labelLayerRef.instance.display.context;

    if (this.displayModule.displayLabels.get()) {
      for (const label of this.textManager.visibleLabels) {
        label.draw(context, this.props.mapProjection);
      }
    }
  }

  /**
   * Draws the runways for a given airport.
   * @param airport The airport to draw runways for.
   * @param geoProjection The geoprojection from the canvas to draw against.
   * @param context The canvas rendering context to use.
   */
  private drawRunways(airport: AirportWaypoint, geoProjection: GeoProjection, context: CanvasRenderingContext2D): void {
    const runways = airport.facility.get().runways;
    for (let i = 0; i < runways.length; i++) {
      const runway = runways[i];
      const runwayPos = this.geoPointCache[0].set(runway.latitude, runway.longitude);

      const halfWidth = UnitType.METER.convertTo(runway.width / 2, UnitType.GA_RADIAN);
      const halfLength = UnitType.METER.convertTo(runway.length / 2, UnitType.GA_RADIAN);

      const leftBound = runwayPos.offset(NavMath.normalizeHeading(runway.direction - 90), halfWidth, this.geoPointCache[1]);
      const forwardBound = runwayPos.offset(runway.direction, halfLength, this.geoPointCache[2]);
      const backwardBound = runwayPos.offset(NavMath.normalizeHeading(runway.direction + 180), halfLength, this.geoPointCache[3]);

      const pPos = geoProjection.project(runwayPos, this.vec2Cache[0]);
      const pLeft = geoProjection.project(leftBound, this.vec2Cache[1]);

      const width = Math.max(Vec2Math.distance(pPos, pLeft) * 2, 3) / 2;

      const pBack = geoProjection.project(backwardBound, this.vec2Cache[0]);
      const pForward = geoProjection.project(forwardBound, this.vec2Cache[1]);

      const theta = Vec2Math.theta(Vec2Math.sub(pForward, pBack, this.vec2Cache[2]));
      const pBackL = Vec2Math.add(Vec2Math.setFromPolar(width, theta - (Math.PI / 2), this.vec2Cache[2]), pBack, this.vec2Cache[3]);
      const pBackR = Vec2Math.add(Vec2Math.setFromPolar(width, theta + (Math.PI / 2), this.vec2Cache[2]), pBack, this.vec2Cache[4]);
      const pForwardL = Vec2Math.add(Vec2Math.setFromPolar(width, theta - (Math.PI / 2), this.vec2Cache[2]), pForward, this.vec2Cache[5]);
      const pForwardR = Vec2Math.add(Vec2Math.setFromPolar(width, theta + (Math.PI / 2), this.vec2Cache[2]), pForward, this.vec2Cache[6]);

      context.fillStyle = RunwayUtils.getSurfaceCategory(runway) === RunwaySurfaceCategory.Hard ? 'white' : '#00ff00';
      context.beginPath();

      context.moveTo(pBackL[0], pBackL[1]);
      context.lineTo(pBackR[0], pBackR[1]);
      context.lineTo(pForwardR[0], pForwardR[1]);
      context.lineTo(pForwardL[0], pForwardL[1]);

      context.closePath();
      context.fill();

      if (width >= 4) {
        context.beginPath();
        context.moveTo(pBack[0], pBack[1]);
        context.lineTo(pForward[0], pForward[1]);
        context.setLineDash(this.centerlineDash);
        context.stroke();
      }
    }
  }

  /**
   * A handler that is called when a waypoint is added to the waypoint renderer.
   * @param sender The waypoint renderer.
   * @param waypoint The waypoint that was added.
   */
  private onWaypointAdded(sender: any, waypoint: MapWaypoint): void {
    if (waypoint instanceof AirportWaypoint && (waypoint.size === AirportSize.Large || waypoint.size === AirportSize.Medium)) {
      this.displayedAirports.set(waypoint.uid, waypoint);
      this.processAirportWaypoint(waypoint);

      this.updateRequired = true;
    }
  }

  /**
   * A handler that is called when a waypoint is added to the waypoint renderer.
   * @param sender The waypoint renderer.
   * @param waypoint The waypoint that was added.
   */
  private onWaypointRemoved(sender: any, waypoint: MapWaypoint): void {
    if (waypoint instanceof AirportWaypoint && (waypoint.size === AirportSize.Large || waypoint.size === AirportSize.Medium)) {
      this.displayedAirports.delete(waypoint.uid);
      const labels = this.runwayLabels.get(waypoint.uid);

      if (this.displayModule.focusAirport.get()?.uid !== waypoint.uid) {
        labels?.forEach(l => this.textManager.deregister(l));
        this.runwayLabels.delete(waypoint.uid);
      }

      this.updateRequired = true;
    }
  }

  /**
   * A callback fired when the focused airport is changed.
   * @param waypoint The waypoint representing the focused airport.
   */
  private onFocusAirportChanged(waypoint: AirportWaypoint | undefined): void {
    if (waypoint === this.focusedAirport) {
      return;
    }

    if (this.focusedAirport !== undefined) {
      const displayedAirport = this.displayedAirports.get(this.focusedAirport.uid);
      if (displayedAirport === undefined) {
        const labels = this.runwayLabels.get(this.focusedAirport.uid);

        labels?.forEach(l => this.textManager.deregister(l));
        this.runwayLabels.delete(this.focusedAirport.uid);
      }
    }

    if (waypoint !== undefined) {
      const displayedAirport = this.displayedAirports.get(waypoint.uid);
      if (displayedAirport === undefined) {
        this.processAirportWaypoint(waypoint);
      }
    }

    this.focusedAirport = waypoint;
    this.updateRequired = true;
  }

  /**
   * Processes an airport waypoint to generate runway labels.
   * @param waypoint The waypoint to process.
   */
  private processAirportWaypoint(waypoint: AirportWaypoint): void {
    const oneWayRunways: OneWayRunway[] = [];
    const runways = waypoint.facility.get().runways;

    for (let i = 0; i < runways.length; i++) {
      oneWayRunways.push(...RunwayUtils.getOneWayRunways(runways[i], i));
    }

    const runwayLabels: RunwayTextLabel[] = [];
    for (let i = 0; i < oneWayRunways.length; i++) {
      const runway = oneWayRunways[i];
      const label = new RunwayTextLabel(runway.designation, new GeoPoint(runway.latitude, runway.longitude), runway.course, this.props.gnsType);

      runwayLabels.push(label);
      this.textManager.register(label);
    }

    this.runwayLabels.set(waypoint.uid, runwayLabels);
  }

  /** @inheritdoc */
  public onDetached(): void {
    this.waypointAddedSub.destroy();
    this.waypointRemovedSub.destroy();
    this.runwaysDisplayedSub.destroy();
    this.labelsDisplayedSub.destroy();
    this.focusChangedSub.destroy();

    this.canvasLayerRef.instance.onDetached();
    this.labelLayerRef.instance.onDetached();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <MapCachedCanvasLayer
          ref={this.canvasLayerRef}
          model={this.props.model} mapProjection={this.props.mapProjection}
          useBuffer={true} overdrawFactor={Math.SQRT2}
        />
        <MapCullableTextLayer model={this.props.model} mapProjection={this.props.mapProjection}
          manager={this.textManager} ref={this.labelLayerRef} />
      </>
    );
  }
}

/**
 * A map text label used for runway designations.
 */
class RunwayTextLabel extends MapCullableLocationTextLabel {

  private readonly runwayLabelOffset: Vec2Subject;
  private readonly runwayDirection: number;

  /**
   * Constructor.
   * @param text The text of this label, or a subscribable which provides it.
   * @param location The geographic location of this label, or a subscribable which provides it.
   * @param runwayDirection The direction of the runway, used to offset the label.
   * @param gnsType The type of GNS unit that will display this runway label.
   */
  constructor(
    text: string | Subscribable<string>,
    location: GeoPointInterface | Subscribable<GeoPointInterface>,
    runwayDirection: number,
    gnsType: GNSType
  ) {
    const runwayLabelOffset = Vec2Subject.create(new Float64Array(2));
    super(text, 0, location, false, {
      fontSize: gnsType === 'wt430' ? 14 : 10,
      fontColor: 'black',
      font: 'GreatNiftySymbol-Regular',
      anchor: new Float64Array([0.5, 0.5]),
      showBg: true,
      bgColor: 'white',
      bgPadding: VecNMath.create(4, 0, 0, -1, 0),
      bgOutlineColor: 'black',
      bgOutlineWidth: 1,
      offset: runwayLabelOffset
    });

    this.runwayDirection = runwayDirection;
    this.runwayLabelOffset = runwayLabelOffset;
  }

  /** @inheritdoc */
  public draw(context: CanvasRenderingContext2D, mapProjection: MapProjection): void {
    const relativeBearing = (this.runwayDirection * Avionics.Utils.DEG2RAD) + mapProjection.getRotation();
    const offsetVec = Vec2Math.setFromPolar(1, relativeBearing + (Math.PI / 2), MapCullableLocationTextLabel.tempVec2);

    const fontSize = this.fontSize.get();
    const width = 0.6 * fontSize * this.text.get().length;
    const height = fontSize;

    this.runwayLabelOffset.set(offsetVec[0] * width, offsetVec[1] * height);
    super.draw(context, mapProjection);
  }
}