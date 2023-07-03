import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { WaypointIcon, WaypointIconProps } from '@microsoft/msfs-garminsdk';
import { G1000UiMapWaypointIconImageCache } from './G1000UiWaypointIconImageCache';

/** Props for G1000WaypointIcon. */
export type G1000WaypointIconProps = Pick<WaypointIconProps, 'waypoint' | 'planeHeading' | 'class' | 'ref'>;

/** A waypoint icon for the G1000. */
export class G1000WaypointIcon extends DisplayComponent<G1000WaypointIconProps> {
  private readonly ref = FSComponent.createRef<WaypointIcon>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <WaypointIcon
        ref={this.ref}
        waypoint={this.props.waypoint}
        planeHeading={this.props.planeHeading}
        class={this.props.class}
        atlasIconSize={32}
        imageCache={G1000UiMapWaypointIconImageCache.getCache()}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();
  }
}