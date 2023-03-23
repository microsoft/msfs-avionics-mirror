import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { WaypointIcon, WaypointIconProps } from '@microsoft/msfs-garminsdk';
import { GtcUiMapWaypointIconImageCache } from './GtcUiWaypointIconImageCache';

/** Props for GtcWaypointIcon. */
export type GtcWaypointIconProps = Pick<WaypointIconProps, 'waypoint' | 'planeHeading' | 'class' | 'ref'>;

/** A waypoint icon for the GTC. */
export class GtcWaypointIcon extends DisplayComponent<GtcWaypointIconProps> {
  private readonly ref = FSComponent.createRef<WaypointIcon>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <WaypointIcon
        ref={this.ref}
        waypoint={this.props.waypoint}
        planeHeading={this.props.planeHeading}
        class={this.props.class}
        atlasIconSize={25}
        imageCache={GtcUiMapWaypointIconImageCache.getCache()}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();
  }
}