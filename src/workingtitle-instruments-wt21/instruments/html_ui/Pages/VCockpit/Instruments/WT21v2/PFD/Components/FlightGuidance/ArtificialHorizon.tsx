import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { AdiProjectionUtils } from '../../Utils/AdiProjectionUtils';
import { FlightGuidancePlaneInfo } from './AttitudeDirectorIndicator';

import './ArtificialHorizon.css';

/**
 * The properties for the ArtificialHorizon component.
 */
interface ArtificialHorizonProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The ArtificialHorizon component.
 */
export class ArtificialHorizon extends DisplayComponent<ArtificialHorizonProps> {
  private innerRef = FSComponent.createRef<HTMLElement>();
  private outerRef = FSComponent.createRef<HTMLElement>();
  private readonly pxPerDegY: number;

  /**
   * Ctor.
   * @param props the component properties
   */
  constructor(props: ArtificialHorizonProps) {
    super(props);
    this.pxPerDegY = AdiProjectionUtils.getPxPerDegY();
  }

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /**
   * Update method.
   * @param planeState The plane state info
   */
  public update(planeState: FlightGuidancePlaneInfo): void {
    this.innerRef.instance.style.transform = `translate3d(0px, ${planeState.pitch * this.pxPerDegY}px, 0px)`;
    this.outerRef.instance.style.transform = `rotate3d(0,0,1,${planeState.roll}deg)`;
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="artificial-horizon-container" ref={this.outerRef}>
        <div class="artificial-horizon-inner" ref={this.innerRef}>
          <div class="artificial-horizon-sky"></div>
          <div class="artificial-horizon-horizon"></div>
          <div class="artificial-horizon-ground"></div>
        </div>
        {/* <div id="dev-center"
          style="position: absolute; width: 100%; height: 100%; border-left:1px solid green; top:0%; left:50%">
        </div>
        <div id="dev-centerh"
          style="position: absolute; width: 100%; height: 100%; border-top:1px solid green; top:50%; left:0%">
        </div> */}
      </div>
    );
  }
}
