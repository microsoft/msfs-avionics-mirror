import { ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import {
  GuiDialog, GuiDialogProps, HSIContainer, LeftInfoPanel, PerformancePlan, RightInfoPanel, WaypointAlerter, WT21DisplayUnitFsInstrument, WT21FixInfoManager,
  WT21TCAS, ElapsedTime,
} from '@microsoft/msfs-wt21-shared';

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
