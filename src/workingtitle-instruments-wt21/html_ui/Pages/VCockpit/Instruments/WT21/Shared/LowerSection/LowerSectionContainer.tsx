import { ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { ElapsedTime } from '../../PFD/DCP/ElapsedTime';
import { WT21TCAS } from '../Traffic/WT21TCAS';
import { GuiDialog, GuiDialogProps } from '../UI/GuiDialog';
import { HSIContainer } from './HSI/HSIContainer';
import { LeftInfoPanel } from './LeftInfoPanel/LeftInfoPanel';
import { RightInfoPanel } from './RightInfoPanel/RightInfoPanel';
import { WaypointAlerter } from './WaypointAlerter';

import './LowerSectionContainer.css';

/**
 * Component props for LowerSectionContainer.
 */
interface LowerSectionContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The elapsed time state. */
  elapsedTime: ElapsedTime;

  // eslint-disable-next-line jsdoc/require-jsdoc
  activeMenu: Subscribable<GuiDialog<GuiDialogProps> | null>;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of TCAS. */
  tcas: WT21TCAS;

  /** The index of the MFD screen. */
  mfdIndex: number;
}

/** The LowerSectionContainer component. */
export class LowerSectionContainer extends DisplayComponent<LowerSectionContainerProps> {

  private readonly waypointAlerter = new WaypointAlerter(this.props.bus);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="lower-section-container PFD">
        <div class="left-panel">
          <LeftInfoPanel
            bus={this.props.bus}
            elapsedTime={this.props.elapsedTime}
            pfdOrMfd="PFD"
            activeMenu={this.props.activeMenu}
            waypointAlerter={this.waypointAlerter}
          />
        </div>
        <div class="hsi-center">
          <HSIContainer
            bus={this.props.bus}
            pfdOrMfd="PFD"
            flightPlanner={this.props.flightPlanner}
            tcas={this.props.tcas}
            mfdIndex={this.props.mfdIndex}
            waypointAlerter={this.waypointAlerter}
          />
        </div>
        <div class="right-panel">
          <RightInfoPanel bus={this.props.bus} tcas={this.props.tcas} pfdOrMfd="PFD" />
        </div>
      </div>
    );
  }
}