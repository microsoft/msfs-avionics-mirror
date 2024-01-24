import { ComponentProps, DisplayComponent, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

/** Component props for {@link StationVsWeightCurrentIcon}. */
interface StationVsWeightIconProps extends ComponentProps {
  /** The reference to the node. */
  ref?: NodeReference<HTMLDivElement>;
}

/** The "Takeoff" icon for the Station vs Weight diagram */
export class StationVsWeightTakeoffIcon extends DisplayComponent<StationVsWeightIconProps> {
  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={ this.props.ref } class="takeoff-icon">
        <svg viewBox="0 0 14 14" width="14px" height="14px">
          <path d="M 0 0 L 0 14 L 14 7 Z" fill="#00FD00" stroke="#000000" stroke-width="1"/>
        </svg>
      </div>
    );
  }
}

/** The "Landing" icon for the Station vs Weight diagram */
export class StationVsWeightLandingIcon extends DisplayComponent<StationVsWeightIconProps> {
  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={ this.props.ref } class="landing-icon">
        <svg viewBox="0 0 13 13" width="13px" height="13px">
          <path d="M 0 0 L 13 0 L 13 13 L 0 13 Z" fill="#C0C0C0" stroke="#000000" stroke-width="1"/>
        </svg>
      </div>
    );
  }
}

/** The "Current" icon for the Station vs Weight diagram */
export class StationVsWeightCurrentIcon extends DisplayComponent<StationVsWeightIconProps> {
  /** @inheritDoc */
  public render(): VNode {
    // TODO: Fix the gradient to match real unit
    return (
      <div ref={ this.props.ref } class="current-icon">
        <svg viewBox="0 0 17 17" width="17px" height="17px">
          <radialGradient id="RadialGradient1">
            <stop offset="0%" stop-color="rgba(0,243,0,1)"/>
            <stop offset="70%" stop-color="rgba(0,134,0,1)"/>
            <stop offset="100%" stop-color="rgba(0,134,0,1)"/>
          </radialGradient>
          <path d="M 8.5 0 L 17 8.5 L 8.5 17 L 0 8.5 Z" fill="url(#RadialGradient1)" stroke="#000000" stroke-width="1"/>
        </svg>
      </div>
    );
  }
}
