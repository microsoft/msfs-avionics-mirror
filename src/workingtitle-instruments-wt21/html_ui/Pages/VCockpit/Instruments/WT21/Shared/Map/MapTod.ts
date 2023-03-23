import {
  AbstractMapWaypointIconOptions, ImageCache, MapCullableLocationTextLabel, MapCullableTextLabel, MapWaypointIcon, MapWaypointImageIcon,
  MapWaypointRendererIconFactory, MapWaypointRendererLabelFactory, ReadonlyFloat64Array, Vec2Math, VNavWaypoint, Waypoint
} from '@microsoft/msfs-sdk';

import { WT21_PFD_MFD_Colors } from '../WT21_Colors';

/**
 * A waypoint icon factory for VNAV waypoints.
 */
export class MapTodIconFactory implements MapWaypointRendererIconFactory<Waypoint> {
  private static readonly ICON_SIZE = Vec2Math.create(24, 24);

  /** @inheritdoc */
  public getIcon<T extends Waypoint>(role: number, waypoint: T): MapWaypointIcon<T> {
    return new MapTodIcon(waypoint as any, 9999, MapTodIconFactory.ICON_SIZE, { offset: new Float64Array([0, 0.5]) }) as unknown as MapWaypointIcon<T>;
  }
}

/**
 * A waypoint label factory for VNAV waypoints.
 */
export class MapTodLabelFactory implements MapWaypointRendererLabelFactory<Waypoint> {

  /** @inheritdoc */
  public getLabel(role: number, waypoint: Waypoint): MapCullableTextLabel {
    return new MapCullableLocationTextLabel('TOD', 9999, waypoint.location, true, { fontSize: 24, fontColor: WT21_PFD_MFD_Colors.green, font: 'WT21', anchor: new Float64Array([-0.35, 0.4]), offset: new Float64Array([5, 0]) });
  }
}

/**
 * A waypoint label factory for VNAV waypoints.
 */
export class MapDesAdvisoryLabelFactory implements MapWaypointRendererLabelFactory<Waypoint> {

  /** @inheritdoc */
  public getLabel(role: number, waypoint: Waypoint): MapCullableTextLabel {
    return new MapCullableLocationTextLabel('DES', 9999, waypoint.location, true, { fontSize: 24, fontColor: WT21_PFD_MFD_Colors.green, font: 'WT21', anchor: new Float64Array([-0.35, 0.4]), offset: new Float64Array([5, 0]) });
  }
}

/**
 * A VNAV waypoint icon.
 */
export class MapTodIcon extends MapWaypointImageIcon<VNavWaypoint> {
  /**
   * Constructor.
   * @param waypoint The waypoint associated with this icon.
   * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
   * with lower priorities.
   * @param size The size of this icon, as `[width, height]` in pixels.
   * @param options Options with which to initialize this icon.
   */
  constructor(
    waypoint: VNavWaypoint,
    priority: number,
    size: ReadonlyFloat64Array,
    options?: AbstractMapWaypointIconOptions
  ) {
    super(waypoint, priority, ImageCache.get('TOD'), size, options);
  }
}