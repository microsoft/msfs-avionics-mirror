import { AbstractMapWaypointIcon, AbstractMapWaypointIconOptions, MapProjection, MapWaypoint, ReadonlyFloat64Array, Subscribable } from '@microsoft/msfs-sdk';

/**
 * A waypoint icon with an image as the icon's graphic source.
 * With support for showing a different icon based on the map range setting.
 */
export class MapDynamicWaypointImageIcon<T extends MapWaypoint> extends AbstractMapWaypointIcon<T> {
  /**
   * Constructor.
   * @param waypoint The waypoint associated with this icon.
   * @param priority The render priority of this icon. Icons with higher priorities should be rendered above those
   * with lower priorities.
   * @param img This icon's image.
   * @param dot_img This icon's image for the dot.
   * @param size The size of this icon, as `[width, height]` in pixels, or a subscribable which provides it.
   * @param minRange The range from which to show the dot instead of the image.
   * @param currentRange The current range setting of the map.
   * @param options Options with which to initialize this icon.
   */
  constructor(
    waypoint: T,
    priority: number | Subscribable<number>,
    protected readonly img: HTMLImageElement,
    protected readonly dot_img: HTMLImageElement,
    size: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>,
    protected readonly minRange: number,
    protected readonly currentRange: Subscribable<number>,
    options?: AbstractMapWaypointIconOptions
  ) {
    super(waypoint, priority, size, options);
  }

  /** @inheritdoc */
  protected drawIconAt(context: CanvasRenderingContext2D, mapProjection: MapProjection, left: number, top: number): void {
    const size = this.size.get();
    if (this.currentRange.get() <= this.minRange) {
      context.drawImage(this.img, left, top, size[0], size[1]);
    } else {
      context.drawImage(this.dot_img, left, top, size[0], size[1]);
    }
  }
}
