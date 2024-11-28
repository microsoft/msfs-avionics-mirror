import {
  ArraySubject, BitFlags, FlightPlan, FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanSegment, FlightPlanSegmentType, FlightPlanUtils, Formatter,
  ICAO, LegDefinitionFlags, LegType, Subject, Subscribable, SubscribableArray, Subscription
} from '@microsoft/msfs-sdk';

import { UnsExtraLegDefinitionFlags, UnsFlightPlans, UnsFms, UnsFmsUtils } from '../../Fms';
import { UnsFmcPage } from '../UnsFmcPage';
import { PickListData, UnsPickList } from './UnsPickList';

/**
 * DTO page waypoint list entry
 */
export interface WaypointListEntry {
  /** The flight plan index of the waypoint */
  index: number,

  /** The index of the segment the leg is in */
  segmentIndex: number,

  /** The index of the leg in its segment */
  localLegIndex: number,

  /** The waypoint's ident */
  ident: string,

  /** The fix's ICAO */
  icao: string,

  /** Whether this waypoint entry corresponds to the active leg */
  isActiveLeg: boolean,
}

/**
 * Formatter for {@link WaypointListEntry {} in a pick list
 */
class UnsWaypointPickListFormatter implements Formatter<WaypointListEntry> {
  /** @inheritDoc */
  format({ index, ident, isActiveLeg }: WaypointListEntry): string {
    const indexString = index.toString().padStart(2, ' ');
    const caretString = isActiveLeg ? '>' : ' ';
    const identString = ident.padEnd(9, ' ');

    return `${indexString}${caretString}[white s-text]${identString}[${isActiveLeg ? 'magenta' : 'white'} s-text]`;
  }
}

/**
 * Pick list for picking flight plan waypoints
 */
export class UnsWaypointPickList extends UnsPickList<WaypointListEntry> {
  private readonly subscriptions: Subscription[];

  private readonly fms: UnsFms;

  private readonly _eligibleWaypoints: ArraySubject<WaypointListEntry>;

  public readonly eligibleWaypoints: SubscribableArray<WaypointListEntry>;

  private readonly _data: Subject<PickListData<WaypointListEntry>>;

  public readonly data: Subscribable<PickListData<WaypointListEntry>>;

  /** @inheritDoc */
  constructor(page: UnsFmcPage, fms: UnsFms) {
    const eligibleWaypoints = ArraySubject.create<WaypointListEntry>([]);
    const data = Subject.create<PickListData<WaypointListEntry>>({title: '', data: [], itemsPerPage: 8});

    super(page, data, new UnsWaypointPickListFormatter());

    this.subscriptions = [];
    this.fms = fms;
    this._eligibleWaypoints = eligibleWaypoints;
    this.eligibleWaypoints = eligibleWaypoints;
    this._data = data;
    this.data = data;

    for (const binding of this.createBindings()) {
      this.page.addBinding(binding);
    }

    this.generateEligibleWaypoints();
  }

  /**
   * Returns the target flight plan
   *
   * @returns a flight plan
   */
  private get targetPlan(): FlightPlan {
    return this.fms.getPrimaryFlightPlan();
  }

  /**
   * Creates the bindings for this controller
   *
   * @returns an array of subscriptions
   */
  private createBindings(): Subscription[] {
    return [
      this._eligibleWaypoints.sub((index, type, item, array) => {
        this._data.set({ title: '', data: array, itemsPerPage: 8 });
      }, true),
      this.fms.flightPlanner.onEvent('fplLoaded').handle(this.handleUpdateEligibleWaypoints.bind(this)),
      this.fms.flightPlanner.onEvent('fplCreated').handle(this.handleUpdateEligibleWaypoints.bind(this)),
      this.fms.flightPlanner.onEvent('fplCopied').handle(this.handleUpdateEligibleWaypoints.bind(this)),
      this.fms.flightPlanner.onEvent('fplLegChange').handle(this.handleUpdateEligibleWaypoints.bind(this)),
      this.fms.flightPlanner.onEvent('fplSegmentChange').handle(this.handleUpdateEligibleWaypoints.bind(this)),
      this.fms.flightPlanner.onEvent('fplActiveLegChange').handle(this.handleUpdateEligibleWaypoints.bind(this)),
    ];
  }

  /**
   * Callback to be invoked when the page containing this waypoint pick list ss resumed
   */
  public onPageResume(): void {
    this.generateEligibleWaypoints();
  }

  /**
   * Destroys this waypoint pick list
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }

  /**
   * Handles a flight plan event which triggers an update to eligible waypoints
   *
   * @param event the event
   */
  private handleUpdateEligibleWaypoints(event: FlightPlanIndicationEvent | FlightPlanCopiedEvent): void {
    if (('targetPlanIndex' in event && event.targetPlanIndex !== UnsFlightPlans.Active) || event.planIndex !== UnsFlightPlans.Active) {
      return;
    }

    this.generateEligibleWaypoints();
  }


  /**
   * Generates the list of eligible waypoints from the target flight plan
   */
  private generateEligibleWaypoints(): void {
    this._eligibleWaypoints.clear();

    const plan = this.targetPlan;
    const activeLateralLegIndex = plan.activeLateralLeg; // TODO maybe use nominal index

    const planApproachSegment: FlightPlanSegment | undefined = Array.from(plan.segmentsOfType(FlightPlanSegmentType.Approach))[0];
    const eoaIndex = UnsFmsUtils.getEndOfApproachPoint(plan);

    // FIXME we should probably have a global process for getting flight plan indices (user facing) from global leg indices,
    // including markers
    let offsetForMarkers = 0;

    for (const leg of plan.legs()) {
      // In a DTO, only include the target of a direct to
      const legIsInExistingDto = BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo) && !BitFlags.isAll(leg.flags, UnsExtraLegDefinitionFlags.DirectToTarget);
      const legTerminatesAtFix = [LegType.AF, LegType.CF, LegType.DF, LegType.HF, LegType.HM, LegType.IF, LegType.TF, LegType.RF].includes(leg.leg.type);

      const legIsEligible = !legIsInExistingDto && legTerminatesAtFix; // TODO move to UnsFmsUtils

      const globalLegIndex = plan.getLegIndexFromLeg(leg);
      const segmentIndex = plan.getSegmentIndex(globalLegIndex);
      const localLegIndex = plan.getSegmentLegIndex(globalLegIndex);

      if (planApproachSegment && segmentIndex === planApproachSegment.segmentIndex) {
        if (localLegIndex === 0) {
          offsetForMarkers++;
        }
      }

      if (eoaIndex !== -1 && eoaIndex + 1 === globalLegIndex) {
        offsetForMarkers++;
      }

      if (!legIsEligible || (segmentIndex === plan.directToData.segmentIndex && localLegIndex === plan.directToData.segmentLegIndex)) {
        continue;
      }

      const isHold = FlightPlanUtils.isHoldLeg(leg.leg.type);
      const isOverfly = leg.leg.flyOver;

      this._eligibleWaypoints.insert({
        index: globalLegIndex + 1 + offsetForMarkers,
        segmentIndex,
        localLegIndex,
        ident: ICAO.getIdent(leg.leg.fixIcao) + (isHold ? '/H' : '') + (isOverfly ? '*' : ''),
        icao: leg.leg.fixIcao,
        isActiveLeg: activeLateralLegIndex === globalLegIndex,
      });
    }
  }
}
