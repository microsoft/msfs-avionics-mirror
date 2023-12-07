import { ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { ElapsedTime } from '../../PFD/DCP/ElapsedTime';
import { WT21TCAS } from '../Traffic/WT21TCAS';
import { GuiDialog, GuiDialogProps } from '../UI/GuiDialog';
import { HSIContainer } from './HSI/HSIContainer';
import { LeftInfoPanel } from './LeftInfoPanel/LeftInfoPanel';
import { RightInfoPanel } from './RightInfoPanel/RightInfoPanel';
import { WaypointAlerter } from './WaypointAlerter';
import { WT21FixInfoManager } from '../../FMC/Systems/WT21FixInfoManager';
import { PerformancePlan } from '../Performance/PerformancePlan';
import { WT21DisplayUnitFsInstrument } from '../WT21DisplayUnitFsInstrument';

import './LowerSectionContainer.css';

/**
 * Component props for LowerSectionContainer.
 */
interface LowerSectionContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The display unit */
  displayUnit: WT21DisplayUnitFsInstrument;

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

  /** The fix info manager. */
  fixInfo?: WT21FixInfoManager;

  /** The active performance plan */
  performancePlan: PerformancePlan;
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
            displayUnit={this.props.displayUnit}
            elapsedTime={this.props.elapsedTime}
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
            fixInfo={this.props.fixInfo}
            performancePlan={this.props.performancePlan}
          />
        </div>
        <div class="right-panel">
          <RightInfoPanel
            bus={this.props.bus}
            displayUnit={this.props.displayUnit}
            tcas={this.props.tcas}
          />
        </div>
      </div>
    );
  }
}