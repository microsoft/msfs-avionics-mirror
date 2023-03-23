import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './TrimPointer.css';

/**
 * The properties for the TrimPointer component.
 */
interface TrimPointerProps extends ComponentProps {

  /** A prop to define which direction the arrow points. */
  pointDirection: number;

}

/**
 * The TrimPointer component.
 */
export class TrimPointer extends DisplayComponent<TrimPointerProps> {

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="trim-pointer" style={`transform: rotate(${this.props.pointDirection}deg)`}>
        <svg height="17" width="11">
          <path d="M 0 0 l 5.5 17 l 5.5 -17 z" fill="var(--wt21-colors-white)" />
        </svg>
      </div>
    );
  }
}