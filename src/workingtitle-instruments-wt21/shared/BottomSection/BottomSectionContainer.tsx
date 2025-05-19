/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { BottomSectionVer1 } from './BottomSectionVer1';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BottomSectionVer2 } from './BottomSectionVer2';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BottomSectionVer3 } from './BottomSectionVer3';

import './BottomSectionContainer.css';

export enum BottomSectionVersion {
  ver1 = 'ver1',
  ver2 = 'ver2',
  ver3 = 'ver3',
}

/**
 * The properties for the BottomSectionContainer component.
 */
interface BottomSectionContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The version of the bottom section to display. */
  version: BottomSectionVersion;

  /** A facility loader. */
  facLoader: FacilityLoader;

  /** An instance of the flight planner. */
  planner?: FlightPlanner;
}

/**
 * The BottomSectionContainer component.
 */
export class BottomSectionContainer extends DisplayComponent<BottomSectionContainerProps> {

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
      <div>
        {
          this.props.version === BottomSectionVersion.ver1
            ? <BottomSectionVer1 bus={this.props.bus} />
            : (this.props.version === BottomSectionVersion.ver2)
              ? <BottomSectionVer2 bus={this.props.bus} facLoader={this.props.facLoader} planner={this.props.planner!} />
              : <BottomSectionVer3 bus={this.props.bus} />
        }
      </div>
    );
  }
}