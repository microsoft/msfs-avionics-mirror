import { ComputedSubject, Facility, FacilityWaypoint, FSComponent, NavMath, Subscribable, VNode, Waypoint } from 'msfssdk';

import { AirportWaypoint } from 'garminsdk';

import { UiMapWaypointIconImageCache } from './UiWaypointIconImageCache';
import { WaypointComponent, WaypointComponentProps } from './WaypointComponent';

/**
 * Component props for WaypointIcon.
 */
export interface WaypointIconProps extends WaypointComponentProps {
  /** A subscribable which provides the airplane's current true heading. */
  planeHeading?: Subscribable<number>;

  /** CSS class(es) to add to the root of the icon component. */
  class?: string;
}

/**
 * A waypoint icon.
 */
export class WaypointIcon extends WaypointComponent<WaypointIconProps> {
  private readonly imgRef = FSComponent.createRef<HTMLImageElement>();

  private readonly imgCache = UiMapWaypointIconImageCache.getCache();

  private readonly planeHeadingChangedHandler = this.onPlaneHeadingChanged.bind(this);

  private readonly srcSub = ComputedSubject.create<Waypoint | null, string>(null, (waypoint): string => {
    if (!waypoint) {
      return '';
    }

    if (waypoint instanceof FacilityWaypoint) {
      return this.getFacilityIconSrc(waypoint);
    }

    return '';
  });
  private readonly needUpdateAirportSpriteSub = ComputedSubject.create<Waypoint | null, boolean>(null, (waypoint): boolean => {
    if (!waypoint) {
      return false;
    }

    return !!this.props.planeHeading && waypoint instanceof AirportWaypoint;
  });

  private imgFrameRowCount = 1;
  private imgFrameColCount = 1;
  private imgOffset = '0px 0px';

  /** @inheritdoc */
  public onAfterRender(): void {
    this.initImageLoadListener();

    super.onAfterRender();

    this.initPlaneHeadingListener();
  }

  /**
   * Initializes the image onload listener.
   */
  private initImageLoadListener(): void {
    this.imgRef.instance.onload = this.onImageLoaded.bind(this);
  }

  /**
   * Initializes the plane heading listener.
   */
  private initPlaneHeadingListener(): void {
    if (this.props.planeHeading) {
      this.props.planeHeading.sub(this.planeHeadingChangedHandler, true);
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected onWaypointChanged(waypoint: Waypoint | null): void {
    this.srcSub.set(waypoint);
    this.needUpdateAirportSpriteSub.set(waypoint);
  }

  /**
   * A callback which is called when this component's image element finishes loading an image.
   */
  private onImageLoaded(): void {
    const img = this.imgRef.instance;
    this.imgFrameRowCount = Math.floor(img.naturalHeight / 32);
    this.imgFrameColCount = Math.floor(img.naturalWidth / 32);
  }

  /**
   * A callback which is called when plane heading changes.
   * @param planeHeading The true heading of the airplane, in degrees.
   */
  private onPlaneHeadingChanged(planeHeading: number): void {
    if (this.needUpdateAirportSpriteSub.get()) {
      this.updateAirportSprite(planeHeading);
    }
  }

  /**
   * Updates this icon's airport sprite.
   * @param planeHeading The true heading of the airplane, in degrees.
   */
  private updateAirportSprite(planeHeading: number): void {
    const waypoint = this.props.waypoint.get();
    if (!(waypoint instanceof AirportWaypoint) || !waypoint.longestRunway) {
      return;
    }

    const headingDelta = waypoint.longestRunway.direction - planeHeading;
    const frame = Math.round(NavMath.normalizeHeading(headingDelta) / 22.5) % 8;
    const row = Math.min(Math.floor(frame / 4), this.imgFrameRowCount - 1);
    const col = Math.min(frame % 4, this.imgFrameColCount - 1);
    const xOffset = col * -32;
    const yOffset = row * -32;

    this.setImgOffset(`${xOffset}px ${yOffset}px`);
  }

  /**
   * Sets the object offset of this icon's image element.
   * @param offset The new offset.
   */
  private setImgOffset(offset: string): void {
    if (offset === this.imgOffset) {
      return;
    }

    this.imgOffset = offset;
    this.imgRef.instance.style.objectPosition = offset;
  }

  /**
   * Gets the appropriate icon src for a facility waypoint.
   * @param waypoint A facility waypoint.
   * @returns the appropriate icon src for the facility waypoint.
   */
  private getFacilityIconSrc(waypoint: FacilityWaypoint<Facility>): string {
    return this.imgCache.getForWaypoint(waypoint)?.src ?? '';
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <img ref={this.imgRef} class={this.props.class ?? ''} src={this.srcSub}
        style={`width: 32px; height: 32px; object-fit: none; object-position: ${this.imgOffset};`} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    if (this.props.planeHeading) {
      this.props.planeHeading.unsub(this.planeHeadingChangedHandler);
    }
  }
}