import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

/** Props for MapCompassArcMask. */
export interface MapCompassArcMaskProps extends ComponentProps {
  /** When false, it will just render the children. */
  isEnabled: boolean;
  /** The mask height. */
  maskHeightPx: number;
  /** The mask width */
  maskWidth?: string;
  /** The mask inner container height. Should match the height of this component's parent. */
  innerHeightPx: number;
}

/** Creates a div with overflow hidden, and an inner container to recenter things on. */
export class MapCompassArcMask extends DisplayComponent<MapCompassArcMaskProps> {
  /** @inheritdoc */
  public render(): VNode {
    if (this.props.isEnabled) {
      return (
        <div
          class="map-compass-arc-mask"
          style={`position: absolute; top: 0px; width: ${this.props.maskWidth ? this.props.maskWidth : '100%'}; height: ${this.props.maskHeightPx}px; overflow: hidden;`}
        >
          {/* Goes inside the clipped container with full svg size again so that contents are properly centered on the map. */}
          <div
            class="map-compass-arc-mask-inner"
            style={`position: absolute; top: 0px; width: 100%; height: ${this.props.innerHeightPx}px;
            display: flex; justify-content: center; align-items: center;`}
          >
            {this.props.children}
          </div>
        </div>
      );
    } else {
      return <>{this.props.children}</>;
    }
  }
}
