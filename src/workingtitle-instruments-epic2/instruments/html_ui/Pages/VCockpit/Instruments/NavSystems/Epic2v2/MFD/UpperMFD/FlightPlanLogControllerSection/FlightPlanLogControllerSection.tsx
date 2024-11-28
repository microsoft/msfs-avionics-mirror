import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { ButtonBoxArrow, ButtonMenu, Epic2Fms, FlightPlanStore, ModalService, TouchButton } from '@microsoft/msfs-epic2-shared';

import { FlightPlanListContextMenu } from './FlightPlanListContextMenu';
import { LogControllerOptions } from './LogControllerTypes';
import { WaypointListHeader } from './WaypointListHeader';

import './FlightPlanLogControllerSection.css';

/** The properties for the {@link FlightPlanLogControllerSection} component. */
interface FlightPlanLogControllerSectionProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Log Controller Option List **/
  selectedLogControllerOption: Subject<LogControllerOptions>;

  /** The flight plan store to use for the active plan. */
  activeStore: FlightPlanStore;

  /** The flight plan store to use for the pending plan. */
  pendingStore: FlightPlanStore;

  /** The aircraft fms object */
  fms: Epic2Fms

  /** The modal service */
  modalService: ModalService
}

/** The FlightPlanLogControllerSection component. */
export class FlightPlanLogControllerSection extends DisplayComponent<FlightPlanLogControllerSectionProps> {
  /**
   * TouchButton options to display in the menu
   */
  private menuOptions = Object.entries(LogControllerOptions).map(
    ([, value]) => (
      <TouchButton
        variant={'bar-menu'}
        label={value}
        onPressed={() => this.handleChange(value)}
      />
    ),
  );

  /**
   * Menu change handler
   * @param val LogControllerOptions
   */
  public handleChange(val: any): void {
    this.props.selectedLogControllerOption.set(val);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flight-plan-log-controller-section">
        <div class="flight-plan-log-controller-menu">
          <ButtonMenu buttons={this.menuOptions} position={'bottom'}>
            <ButtonBoxArrow label={this.props.selectedLogControllerOption} width={184} />
          </ButtonMenu>
        </div>
        <FlightPlanListContextMenu
          modalService={this.props.modalService}
          fms={this.props.fms}
          bus={this.props.bus}
          activeStore={this.props.activeStore}
          pendingStore={this.props.pendingStore}
        />
        <WaypointListHeader selectedOption={this.props.selectedLogControllerOption} />
      </div>
    );
  }
}
