import {
  ComputedSubject, FacilityWaypointUtils, FSComponent, NavMath, SetSubject, Subscribable, SubscribableSet, Subscription,
  ToggleableClassNameRecord, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import { WaypointIconImageCache } from '../../graphics';
import { AirportWaypoint } from '../../navigation';
import { WaypointComponent, WaypointComponentProps } from './WaypointComponent';

/** Component props for WaypointIcon. */
export interface WaypointIconProps extends WaypointComponentProps {
  /**
   * A subscribable which provides the airplane's current true heading.
   * When provided, airport icons will be rotate depending on the difference
   * between the plane's heading and the airport's longest runway.
   * If not provided, airport icons will show the heading of the longest runway. */
  planeHeading?: Subscribable<number>;

  /** The size of each square icon in the texture atlas. */
  atlasIconSize: number;

  /** The image waypoint icon image cache to use. */
  imageCache: WaypointIconImageCache;

  /** CSS class(es) to add to the root of the icon component. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/** A waypoint icon. */
export class WaypointIcon extends WaypointComponent<WaypointIconProps> {
  private static readonly RESERVED_CLASSES = [];

  private readonly imgRef = FSComponent.createRef<HTMLImageElement>();

  private readonly srcSub = ComputedSubject.create<Waypoint | null, string>(null, (waypoint): string => {
    if (waypoint !== null && FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
      return this.props.imageCache.getForWaypoint(waypoint)?.src ?? '';
    }
    return '';
  });

  private imgFrameRowCount = 1;
  private imgFrameColCount = 1;
  private imgOffset?: string = undefined;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.initImageLoadListener();

    super.onAfterRender();

    if (this.props.planeHeading) {
      this.subscriptions.push(this.props.planeHeading.sub(this.updateOffset.bind(this), true));
    }
  }

  /** @inheritdoc */
  protected override onWaypointChanged(waypoint: Waypoint | null): void {
    this.srcSub.set(waypoint);
    this.updateOffset();
  }

  /**
   * Initializes the image onload listener.
   */
  private initImageLoadListener(): void {
    this.imgRef.instance.onload = this.onImageLoaded.bind(this);
  }

  /**
   * A callback which is called when this component's image element finishes loading an image.
   */
  private onImageLoaded(): void {
    const img = this.imgRef.instance;
    this.imgFrameRowCount = Math.floor(img.naturalHeight / this.props.atlasIconSize);
    this.imgFrameColCount = Math.floor(img.naturalWidth / this.props.atlasIconSize);
    this.updateOffset();
  }

  /**
   * Updates this icon's offset, or unsets it.
   */
  private updateOffset(): void {
    const waypoint = this.props.waypoint.get();

    if (this.imgFrameRowCount > 1 && this.imgFrameColCount > 1 && waypoint instanceof AirportWaypoint && waypoint.longestRunway !== null) {
      let headingOffset = this.props.planeHeading ? this.props.planeHeading.get() : NaN;
      if (isNaN(headingOffset)) {
        headingOffset = 0;
      }
      this.updateAirportIconOffset(headingOffset, waypoint.longestRunway.direction);
    } else {
      this.setImgOffset('unset');
    }
  }

  /**
   * Updates this airport icon's offset.
   * @param headingOffset How mush to offset the runway heading by.
   * @param runwayHeading The heading of the runway.
   */
  private updateAirportIconOffset(headingOffset: number, runwayHeading: number): void {
    const headingDelta = runwayHeading - headingOffset;
    const frame = Math.round(NavMath.normalizeHeading(headingDelta) / 22.5) % 8;
    const row = Math.min(Math.floor(frame / 4), this.imgFrameRowCount - 1);
    const col = Math.min(frame % 4, this.imgFrameColCount - 1);
    const xOffset = col * -this.props.atlasIconSize;
    const yOffset = row * -this.props.atlasIconSize;

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

    if (offset === 'unset') {
      // If not a texture atlas, do this so that the icon is centered.
      this.imgRef.instance.style.display = 'inline-flex';
    } else {
      this.imgRef.instance.style.display = 'inline-block';
    }

    this.imgOffset = offset;
    this.imgRef.instance.style.objectPosition = offset;
  }

  /** @inheritdoc */
  public render(): VNode {
    const { atlasIconSize } = this.props;

    let cssClass: string | SetSubject<string> | undefined;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      const sub = FSComponent.bindCssClassSet(cssClass, this.props.class, WaypointIcon.RESERVED_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      cssClass = this.props.class;
    }

    return (
      <img
        ref={this.imgRef}
        class={cssClass}
        src={this.srcSub}
        style={`width: ${atlasIconSize}px; height: ${atlasIconSize}px; object-fit: none; object-position: ${this.imgOffset};`}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    const img = this.imgRef.getOrDefault();
    if (img) {
      img.onload = null;
    }

    super.destroy();
  }
}