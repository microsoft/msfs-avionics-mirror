import {
  ApproachProcedure, ArraySubject, ComputedSubject, ConsumerSubject, FacilityType, FlightPlannerEvents, FocusPosition, FSComponent,
  ICAO, Subject, VNode,
} from '@microsoft/msfs-sdk';

import { Fms, FmsEvents, FmsFlightPhase } from '@microsoft/msfs-garminsdk';

import { GNSUiControlList, GNSUiControlListProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuItemInformation } from '../Auxiliary/MenuItemInformation';
import { PageMenuItem } from '../PageMenu/PageMenuItem';
import { MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { ProcApproachPage } from '../Waypoint/ProcApproachPage';
import { ProcArrivalPage } from '../Waypoint/ProcArrivalPage';
import { ProcDeparturePage } from '../Waypoint/ProcDeparturePage';
import { ProcedurePageMenu } from './ProcedurePageMenu';
import { GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';

import './ProcedurePage.css';

/**
 * The Procedure Page Props
 */
interface ProcedurePageProps extends PageProps {
  /**
   * Callback for when an airport is selected to be displayed on the WPT APT page
   */
  onPageSelected: <T extends Page = Page>(v: number) => T | undefined,


  /** The FMS. */
  fms: Fms;
}

/**
 * Procedure Page.
 */
export class ProcedurePage extends Page<ProcedurePageProps> {
  private readonly hasNoApproachLoaded = Subject.create<boolean>(true);
  private readonly procDetailsConsumer = this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplProcDetailsChanged').handle(this.onPlanChanged.bind(this));
  private readonly menu = new ProcedurePageMenu();
  private readonly procPageMenuItems = FSComponent.createRef<GNSUiControlList<MenuItemInformation, GNSUiControlListProps<MenuItemInformation>>>();

  private readonly flightPhaseConsumer = ConsumerSubject.create<FmsFlightPhase>(null, { isApproachActive: false, isInMissedApproach: false, isPastFaf: false });

  private readonly approachAiportIdent = ComputedSubject.create<string | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '____';
    }
    return v;
  });

  private readonly arrivalAiportIdent = ComputedSubject.create<string | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '____';
    }
    return v;
  });

  private readonly departureAiportIdent = ComputedSubject.create<string | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '____';
    }
    return v;
  });

  private readonly approach = ComputedSubject.create<ApproachProcedure | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '-';
    }
    return '- ' + GnsFmsUtils.getApproachNameAsString(v);
  });

  private readonly arrival = ComputedSubject.create<string | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '-';
    }
    return v;
  });

  private readonly departure = ComputedSubject.create<string | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '-';
    }
    return v;
  });

  private procPageList: MenuEntry[] = [
    {
      label: 'Activate Vectors-To-Final?', disabled: this.hasNoApproachLoaded, action: (): void => {
        this.props.fms.activateVtf();
        ViewService.back();
      }
    },
    {
      label: 'Activate Approach?', disabled: this.hasNoApproachLoaded, action: async () => {
        const isApproachActive = this.flightPhaseConsumer.get().isApproachActive;

        if (isApproachActive) {
          const doIt = await ViewService.confirm('RESTART APPROACH', 'Are you sure you want to discontinue the current approach?');

          if (!doIt) {
            return;
          }
        }

        this.props.fms.activateApproach();

        // Opens standard nav map
        ViewService.open('NAV', true, 1);
      }
    },
    {
      label: 'Select Approach?', disabled: false, action: (): void => {
        this.props.onPageSelected<ProcApproachPage>(3)?.openFromProcMenu();
      }
    },
    {
      label: 'Select Arrival?', disabled: false, action: (): void => {
        this.props.onPageSelected<ProcArrivalPage>(4)?.openFromProcMenu();
      }
    },
    {
      label: 'Select Departure?', disabled: false, action: (): void => {
        this.props.onPageSelected<ProcDeparturePage>(5)?.openFromProcMenu();
      }
    },
  ];

  private procOptions = ArraySubject.create(this.procPageList);

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    const list = this.procPageMenuItems.instance;
    list.focus(FocusPosition.First);
  }


  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    const list = this.procPageMenuItems.instance;

    if (evt === InteractionEvent.RightKnobPush) {
      if (!list.isFocused) {
        list.focus(FocusPosition.MostRecent);
      } else {
        list.blur();
      }
      return true;
    } else if (evt === InteractionEvent.MENU) {
      ViewService.menu(this.menu);
      return true;
    } else if (evt === InteractionEvent.PROC) {
      ViewService.back();
      return true;
    }

    let handled = false;
    if (this.procPageMenuItems.instance.isFocused) {
      handled = this.procPageMenuItems.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (evt === InteractionEvent.RightOuterInc || evt === InteractionEvent.RightOuterDec) {
      return this.procPageMenuItems.instance.isFocused;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /**
   * Picks the next page to be loaded
   * @param listMenuItem the menuEntry
   * @returns if the page has been loaded
   */
  public onListItemSelected = (listMenuItem: PageMenuItem): boolean => {
    const menuEntry = listMenuItem.props.data;

    if (menuEntry !== null) {
      if (menuEntry.action instanceof Subject) {
        const action = menuEntry.action.get();
        action();
      } else {
        menuEntry.action();
      }
    }
    return true;
  };

  /**
   * Will return whether an approach is returned or not.
   * @returns a boolean if there is an approach loaded
   */
  private isApproachLoaded(): boolean {

    if (this.props.fms.hasPrimaryFlightPlan()) {
      const plan = this.props.fms.getPrimaryFlightPlan();
      return plan.procedureDetails.approachIndex > -1;
    }
    return false;
  }

  /**
   * Sets the hasNoApproachLoaded to true or false.
   */
  private async onPlanChanged(): Promise<void> {
    this.hasNoApproachLoaded.set(!this.isApproachLoaded());

    if (this.props.fms.hasPrimaryFlightPlan()) {
      const plan = this.props.fms.getPrimaryFlightPlan();
      const facloader = this.props.fms.facLoader;

      if (plan.procedureDetails.approachFacilityIcao !== undefined) {
        const approachFacility = await facloader.getFacility(FacilityType.Airport, plan.procedureDetails.approachFacilityIcao);
        this.approach.set(approachFacility.approaches[plan.procedureDetails.approachIndex]);
        this.approachAiportIdent.set(ICAO.getIdent(plan.procedureDetails.approachFacilityIcao));
      } else {
        this.approach.set(undefined);
        this.approachAiportIdent.set(undefined);
      }

      if (plan.procedureDetails.arrivalFacilityIcao !== undefined) {
        const arrivalFacility = await facloader.getFacility(FacilityType.Airport, plan.procedureDetails.arrivalFacilityIcao);
        this.arrival.set(GnsFmsUtils.getArrivalNameAsString(arrivalFacility,
          arrivalFacility.arrivals[plan.procedureDetails.arrivalIndex], plan.procedureDetails.arrivalTransitionIndex, undefined));
        this.arrivalAiportIdent.set(ICAO.getIdent(plan.procedureDetails.arrivalFacilityIcao));
      } else {
        this.arrival.set(undefined);
        this.arrivalAiportIdent.set(undefined);
      }

      if (plan.procedureDetails.departureFacilityIcao !== undefined) {
        const departureFacility = await facloader.getFacility(FacilityType.Airport, plan.procedureDetails.departureFacilityIcao);
        this.departure.set(GnsFmsUtils.getDepartureNameAsString(departureFacility,
          departureFacility.departures[plan.procedureDetails.departureIndex], plan.procedureDetails.departureTransitionIndex, plan.procedureDetails.originRunway));
        this.departureAiportIdent.set(ICAO.getIdent(plan.procedureDetails.departureFacilityIcao));
      } else {
        this.departure.set(undefined);
        this.departureAiportIdent.set(undefined);
      }
    } else {
      this.approach.set(undefined);
      this.arrival.set(undefined);
      this.departure.set(undefined);
      this.approachAiportIdent.set(undefined);
      this.arrivalAiportIdent.set(undefined);
      this.departureAiportIdent.set(undefined);
    }
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const sub = this.props.bus.getSubscriber<FmsEvents>();

    this.flightPhaseConsumer.setConsumer(sub.on('fms_flight_phase'));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <div class='page proc-page hide-element' ref={this.el}>
          <h2 class="page-header">PROCEDURES</h2>

          <div class='proc-table proc-table-full-height'>
            <GNSUiControlList<MenuEntry, GNSUiControlListProps<MenuEntry>>
              data={this.procOptions}
              renderItem={(data: MenuEntry): VNode => <PageMenuItem data={data} onSelected={this.onListItemSelected} />}
              ref={this.procPageMenuItems}
              hideScrollbar={true}
            />
          </div>
          {this.props.gnsType === 'wt530' && (
            <div class='proc-loaded-procedures-header'>
              LOADED PROCEDURES
              <div class='proc-table proc-loaded-procedures'>
                <div class='proc-loaded-procedures-labels'>APR</div>
                <div>{this.approachAiportIdent}</div>
                <div>{this.approach}</div>
                <div class='proc-loaded-procedures-labels'>ARVL</div>
                <div>{this.arrivalAiportIdent}</div>
                <div>{this.arrival}</div>
                <div class='proc-loaded-procedures-labels'>DEP</div>
                <div>{this.departureAiportIdent}</div>
                <div>{this.departure}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
