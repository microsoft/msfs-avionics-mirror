import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { WaypointIcon, WaypointIconProps } from '@microsoft/msfs-garminsdk';

import { UiWaypointIconImageCache } from './UiWaypointIconImageCache';

/**
 * Component props for UiWaypointIcon.
 */
export type UiWaypointIconProps = Pick<WaypointIconProps, 'waypoint' | 'planeHeading' | 'class' | 'ref'>;

/**
 * A G3X Touch waypoint icon for display in UI views.
 */
export class UiWaypointIcon extends DisplayComponent<UiWaypointIconProps> {
  private readonly ref = FSComponent.createRef<WaypointIcon>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <WaypointIcon
        ref={this.ref}
        waypoint={this.props.waypoint}
        planeHeading={this.props.planeHeading}
        atlasIconSize={25}
        imageCache={UiWaypointIconImageCache.getCache()}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }
}