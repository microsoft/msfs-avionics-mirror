import { Fms } from '@microsoft/msfs-garminsdk';
import { EventBus, FlightPlannerEvents, Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry, ViewService } from '../Pages';
/**
 * menu button popups barebones since no options are selectable in AUX menus
 */
export class WaypointAirportPageMenu extends MenuDefinition {

  private readonly hasNoDestinationAirport = Subject.create<boolean>(false);
  private readonly hasNoPlanAirports = Subject.create<boolean>(false);

  /** @inheritdoc */
  public readonly entries: readonly MenuEntry[] = [
    {
      label: 'Select Next FPL Apt?', disabled: this.hasNoPlanAirports, action: (): void => {
        const airport = this.findNextAirportInPlan();
        if (airport !== undefined) {
          this.onFacilitySelected(airport);
        }
        ViewService.back();
      }
    },
    {
      label: 'Select Destination Apt?', disabled: this.hasNoDestinationAirport, action: (): void => {
        const airport = this.getDestinationAirport();
        if (airport !== undefined) {
          this.onFacilitySelected(airport);
        }
        ViewService.back();
      }
    },
  ];

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(bus: EventBus, private fms: Fms, private onFacilitySelected = (facility?: string): void => undefined) {
    super();
    bus.getSubscriber<FlightPlannerEvents>().on('fplLegChange').handle(this.onPlanChanged);
  }

  public onPlanChanged = (): void => {
    let hasNoPlanAirports = true;
    let hasNoDestinationAirport = true;

    if (this.fms.hasPrimaryFlightPlan()) {
      const plan = this.fms.getPrimaryFlightPlan();
      hasNoDestinationAirport = (plan.destinationAirport ? false : true);

      if (plan.destinationAirport) {
        hasNoPlanAirports = false;
      } else {

        for (let l = plan.activeLateralLeg; l < plan.length; l++) {
          const leg = plan.getLeg(l);
          if (leg.leg.fixIcao[0] === 'A') {
            hasNoPlanAirports = false;
          }
        }
      }
    }
    this.hasNoPlanAirports.set(hasNoPlanAirports);
    this.hasNoDestinationAirport.set(hasNoDestinationAirport);
  };

  /**
   * Finds the next airport in the flight plan
   * @returns a airport facility
   */
  private findNextAirportInPlan(): string | undefined {
    let facility: string | undefined;

    if (this.fms.hasPrimaryFlightPlan()) {
      const plan = this.fms.getPrimaryFlightPlan();

      for (let l = plan.activeLateralLeg; l < plan.length; l++) {
        const leg = plan.getLeg(l);
        if (leg.leg.fixIcao[0] === 'A') {
          facility = leg.leg.fixIcao;
          break;
        }

      }
      if (!facility && plan.destinationAirport) {
        facility = plan.destinationAirport;
      }
    }

    return facility;
  }

  /**
   * Finds the destination airport in the flight plan
   * @returns the destination airport facility
   */
  private getDestinationAirport(): string | undefined {
    let facility: string | undefined;
    if (this.fms.hasPrimaryFlightPlan()) {
      const plan = this.fms.getPrimaryFlightPlan();
      if (plan.destinationAirport) {
        facility = plan.destinationAirport;
      }
    }
    return facility;
  }


  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}