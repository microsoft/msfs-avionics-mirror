import {
  AltitudeRestrictionType, BitFlags, ComputedSubject, ConsumerSubject, ControlEvents, EventBus, FixTypeFlags, FlightPathUtils, FlightPlan,
  FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanLegEvent, FlightPlannerEvents, FlightPlanSegment, FlightPlanSegmentType,
  GeoPoint, GNSSEvents, ICAO, LegTurnDirection, LegType, LNavDataSimVarEvents, LNavEvents, SpeedRestrictionType, SpeedUnit,
  Subject, VNavConstraint, VNavLeg,
} from '@microsoft/msfs-sdk';

import { DirectToState, WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';
import { WT21LNavDataEvents } from '../Autopilot/WT21LNavDataEvents';
import { DisplayField } from '../Framework/Components/DisplayField';
import { RawFormatter } from '../Framework/FmcFormats';
import { FmcListUtility } from '../Framework/FmcListUtility';
import { FmcPage } from '../Framework/FmcPage';
import { FmcPageManager } from '../Framework/FmcPageManager';
import { FmcRenderTemplate, FmcRenderTemplateRow } from '../Framework/FmcRenderer';
import { WT21PilotWaypointUtils } from '../Navigation/WT21PilotWaypointUtils';
import { LegsPage } from './LegsPage';
import { LegPageItem, LegsPageStore } from './LegsPageStore';

/**
 * LEGS PAGE Controller
 */
export class LegsPageController {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  public isForHoldSelection = false;

  static readonly discoIdentString = '□□□□□';
  static readonly discoAltitudeString = '- DISCONTINUITY - ';
  static readonly discoCourseString = ' THEN';
  static readonly activeHeaderString = ' ACT LEGS[blue]';
  static readonly modHeaderString = ' MOD[white] LEGS[blue]';

  public readonly currentPage = Subject.create(1);
  public readonly pageCount = ComputedSubject.create<number, number>(0, (v): number => {
    return Math.max(1, Math.ceil(v / 5));
  });

  private legChangeConsumerLegs = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplLegChange');
  private planCopiedConsumerLegs = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCopied');
  private planCalculatedConsumerLegs = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCalculated');
  private activeLegChangeConsumerLegs = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplActiveLegChange');
  private lnavDataConsumerLegs = this.eventBus.getSubscriber<LNavDataSimVarEvents>().on('lnavdata_waypoint_distance');
  private sequencingSuspendedConsumerLegs = this.eventBus.getSubscriber<LNavEvents>().on('lnav_is_suspended');
  private effectiveLegIndexConsumerLegs = this.eventBus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_nominal_leg_index');
  private vnavUpdatedConsumerLegs = this.fms.verticalPathCalculator.vnavCalculated;
  private listConsumerLegs = this.store.legs;

  private activeLegDistance = 0;
  private effectiveLegIndex = -1;

  private planChanged = false;

  public lnavSequencing = true;

  public readonly ppos = ConsumerSubject.create(this.eventBus.getSubscriber<GNSSEvents>().on('gps-position'), new LatLongAlt());

  /**
   * Renders a row.
   * @param page The FmcPage
   * @param data The Data as RoutePageLegItem or undefined
   * @param nextData The next Data as RoutePageLegItem or undefined
   * @returns an array of FmcRenderTemplateRows
   */
  public renderRow = (page: FmcPage, data?: LegPageItem, nextData?: LegPageItem): FmcRenderTemplateRow[] => {
    if (data !== undefined) {
      const ident = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: (scratchpadContents) => this.leftPressed(data, scratchpadContents, false),
        onDelete: () => this.leftPressed(data, '', true),
      });

      const altitude = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: (scratchpadContents) => this.rightPressed(data, scratchpadContents, false),
        onDelete: () => this.rightPressed(data, '', true),
      });

      const dtkDistance = new DisplayField(this.page, {
        formatter: RawFormatter,
      });

      const fpa = new DisplayField(this.page, {
        formatter: RawFormatter,
      });

      const isPlanInMod = this.fms.planInMod.get();
      // TO Leg is WHITE when in MOD
      const toLegStyle = isPlanInMod ? '' : '[magenta]';

      if (data.legDefinition) {
        if (!data.legDefinition.leg.fixIcao) {
          ident.takeValue('PPOS');
        }

        // If this is an altitude leg followed by a course to leg, then display it as (INTC)
        const showAsIntc = WT21FmsUtils.isAltitudeLeg(data.legDefinition.leg.type)
          && nextData && nextData.legDefinition && WT21FmsUtils.isCourseToLeg(nextData.legDefinition.leg.type);

        if (data.isFromLeg) {
          if (this.isFmcPageInDirectToExistingState()) {
            ident.takeValue('(DIR)[blue]');
          } else if (showAsIntc) {
            ident.takeValue('(INTC)');
          } else {
            ident.takeValue((data.legDefinition.name ?? 'noname') + '[blue]');
          }
          dtkDistance.takeValue('');
          if (isPlanInMod) {
            altitude.takeValue('');
            fpa.takeValue('');
          } else {
            altitude.takeValue(
              this.lnavSequencing ? 'AUTO[green d-text]/[white d-text]' + 'INHIBIT[white s-text]'
                : 'AUTO[white s-text]/[white d-text]' + 'INHIBIT[green d-text]');
            fpa.takeValue('SEQUENCE[s-text blue] ');
          }
        } else {
          if (data.legDefinition.leg.type === LegType.Discontinuity) {
            ident.takeValue(LegsPageController.discoIdentString + (data.isToLeg ? toLegStyle : ''));
            altitude.takeValue(LegsPageController.discoAltitudeString);
            dtkDistance.takeValue(LegsPageController.discoCourseString + (data.isToLeg ? toLegStyle : ''));
          } else {
            if (showAsIntc) {
              ident.takeValue('(INTC)' + (data.isToLeg ? toLegStyle : ''));
            } else {
              ident.takeValue((data.legDefinition.name ?? 'noname') + (data.isToLeg ? toLegStyle : ''));
            }
            const altitudeInvalid = data.vnavLeg?.invalidConstraintAltitude !== undefined;
            const isRunway = data.legDefinition.leg.fixIcao[0] === 'R' && data.legDefinition.leg.type === LegType.TF;
            altitude.takeValue(WT21FmsUtils.getConstraintDisplayForLegs(this.fms.performancePlanProxy, data.legDefinition.verticalData,
              this.fms.getActivePerformancePlan().transitionAltitude.get(), altitudeInvalid, isRunway));
            dtkDistance.takeValue(
              data.isToLeg ? WT21FmsUtils.parseDtkDistanceForDisplay(data.legDefinition, data.isToLeg, this.fms.ppos, this.activeLegDistance) + toLegStyle
                : WT21FmsUtils.parseDtkDistanceForDisplay(data.legDefinition, data.isToLeg, this.fms.ppos)
            );
          }
          if (data.isFirstMissedLeg) {
            fpa.takeValue('MISSED APPR[s-text white]');
          } else {
            let fpaValue = '';
            if (data.legDefinition.verticalData.altDesc !== AltitudeRestrictionType.Unused && data.vnavLeg !== undefined) {
              fpaValue = WT21FmsUtils.getFpaDisplayForLegs(data.vnavLeg, data.vnavConstraint, data.legDefinition.verticalData.phase);
            }
            fpa.takeValue(fpaValue);
          }
        }
      } else {
        if (data.isPpos) {
          ident.takeValue('PPOS[blue]');
          altitude.takeValue(
            this.lnavSequencing ? 'AUTO[green d-text]/[white d-text]' + 'INHIBIT[white s-text]'
              : 'AUTO[white s-text]/[white d-text]' + 'INHIBIT[green d-text]');
          fpa.takeValue('SEQUENCE[s-text blue] ');
        } else {
          ident.takeValue('-----');
          altitude.takeValue('');
          fpa.takeValue('');
        }
        dtkDistance.takeValue('');
      }

      return [[dtkDistance, fpa], [ident, altitude]];
    }
    return [[''], ['']];
  };

  public legsList = new FmcListUtility(this.page, this.store.legs, this.renderRow, 5);

  /**
   * Creates the Controller.
   * @param eventBus The event bus
   * @param fms The Fms
   * @param store The Store
   * @param page The FMC Page
   * @param pageManager The FMC Page Manager
   */
  constructor(
    private readonly eventBus: EventBus,
    private readonly fms: WT21Fms,
    private readonly store: LegsPageStore,
    private readonly page: FmcPage,
    private readonly pageManager: FmcPageManager,
  ) { }

  /**
   * Initializes the Controller
   */
  public init(): void {
    this.legChangeConsumerLegs.handle(this.handleFlightPlanChangeEventLegs);
    this.activeLegChangeConsumerLegs.handle(this.handlePlanActiveLegChangeLegs);
    this.planCalculatedConsumerLegs.handle(this.handleFlightPlanCalculatedEventLegs);
    this.lnavDataConsumerLegs.atFrequency(1).handle(this.handleActiveLegDistanceUpdate);
    this.planCopiedConsumerLegs.handle(this.handleFlightPlanCopyEventLegs);
    this.sequencingSuspendedConsumerLegs.whenChanged().handle(this.handleSequencingSuspendedEventLegs);
    this.effectiveLegIndexConsumerLegs.whenChanged().handle(this.handleEffectiveLegChangedLegs);
    this.vnavUpdatedConsumerLegs.on(this.handleVnavCalculatedLegs);

    this.fms.planInMod.sub(this.handleOnModExecLegs);

    this.currentPage.sub(this.handleCurrentPageChangeLegs);

    this.listConsumerLegs.sub(this.handleOnListUpdateLegs);

    this.store.selectedLeg = undefined;

    this.updateData();
    this.updateVerticalData();
  }

  /**
   * Destroys the Controller.
   */
  public destroy(): void {
    this.legChangeConsumerLegs.off(this.handleFlightPlanChangeEventLegs);
    this.activeLegChangeConsumerLegs.off(this.handlePlanActiveLegChangeLegs);
    this.planCalculatedConsumerLegs.off(this.handleFlightPlanCalculatedEventLegs);
    this.lnavDataConsumerLegs.off(this.handleActiveLegDistanceUpdate);
    this.planCopiedConsumerLegs.off(this.handleFlightPlanCopyEventLegs);
    this.sequencingSuspendedConsumerLegs.off(this.handleSequencingSuspendedEventLegs);
    this.effectiveLegIndexConsumerLegs.off(this.handleEffectiveLegChangedLegs);
    this.vnavUpdatedConsumerLegs.off(this.handleVnavCalculatedLegs);

    this.fms.planInMod.unsub(this.handleOnModExecLegs);

    this.currentPage.unsub(this.handleCurrentPageChangeLegs);

    this.listConsumerLegs.unsub(this.handleOnListUpdateLegs);

    this.ppos.destroy();
  }

  /**
   * Handles when a Lnav Sequencing event is received over the bus
   * @param isSuspended Whether sequencing is suspended
   */
  private handleSequencingSuspendedEventLegs = (isSuspended: boolean): void => {
    this.lnavSequencing = !isSuspended;
    this.invalidate();
  };

  /**
   * Handles when a Flight Plan Change Event is received over the bus
   * @param event is the FlightPlanLegEvent
   */
  private handleFlightPlanChangeEventLegs = (event: FlightPlanLegEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.planChanged = true;
    }
  };

  /**
   * Handles when a Flight Plan Change Event is received over the bus
   */
  private handleFlightPlanCopyEventLegs = (): void => {
    this.planChanged = true;
  };

  /**
   * Handles when the Active Leg Changeed Event is received over the bus
   * @param event is the FlightPlanActiveLegEvent
   */
  private handlePlanActiveLegChangeLegs = (event: FlightPlanActiveLegEvent): void => {
    if (this.fms.getPlanIndexForFmcPage() === WT21Fms.PRIMARY_MOD_PLAN_INDEX
      && event.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.planChanged = true;
    }
  };

  /**
   * Handles when the Effective Leg Value Event is received over the bus
   * @param index The Effective Active Leg Index
   */
  private handleEffectiveLegChangedLegs = (index: number): void => {
    this.effectiveLegIndex = index;
    if (!this.fms.planInMod.get() && index > -1) {
      this.planChanged = true;
      this.updateData();
    }
  };

  /**
   * Handles when the Calculated Event is received over the bus
   * @param event is the FlightPlanCalculatedEvent
   */
  private handleFlightPlanCalculatedEventLegs = (event: FlightPlanCalculatedEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage() && this.planChanged) {
      this.updateData();
    } else if (event.planIndex === WT21Fms.PRIMARY_MOD_PLAN_INDEX) {
      if (this.fms.planInMod.get() && this.fms.getDirectToState(WT21Fms.PRIMARY_MOD_PLAN_INDEX) === DirectToState.TOEXISTING) {
        this.fms.verticalPathCalculator.requestPathCompute(WT21Fms.PRIMARY_MOD_PLAN_INDEX);
      }
    }
  };

  /**
   * Handles when the Vnav Path Calculator completes running calculations
   * and refreshes the display if the calculator updated the currently displayed plan.
   * @param sender The Sender of the event.
   * @param planIndex The Plan Index.
   */
  private handleVnavCalculatedLegs = (sender: any, planIndex: number): void => {
    const displayedPlanIndex = this.fms.planInMod.get() ? WT21Fms.PRIMARY_MOD_PLAN_INDEX : WT21Fms.PRIMARY_ACT_PLAN_INDEX;
    if (sender !== undefined && displayedPlanIndex === planIndex) {
      this.updateVerticalData();
      this.invalidate();
    }
  };

  /**
   * Handles when the active leg distance updates once per second.
   * @param dis is the distance to the active waypoint in NM
   */
  private handleActiveLegDistanceUpdate = (dis: number): void => {
    const rounded = Math.round(dis * 10) / 10;
    if (rounded !== this.activeLegDistance) {
      this.activeLegDistance = rounded;
      this.planChanged = true;
    }
  };

  private handleOnModExecLegs = (inMod: boolean): void => {
    const page = this.page as LegsPage;
    page.cancelModDisplay.takeValue(inMod ? '<CANCEL MOD' : '<SEC FPLN');
    // Call updateData immediately, which will invalidate the page causing a render,
    // so that the user has immediate feedback after hitting EXEC or CANCEL MOD
    this.updateData();
    this.planChanged = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleCurrentPageChangeLegs = (): void => {
    this.invalidate();
  };

  private handleOnListUpdateLegs = (): void => {
    this.invalidate();
  };

  /**
   * Local invalidate method
   */
  private invalidate(): void {

    this.page.invalidate();
  }

  /**
   * Renders the Page
   * @returns The FmcRenderTemplate
   */
  public renderPageRows(): FmcRenderTemplate {
    const page = this.page as LegsPage;

    const template: FmcRenderTemplate = [[page.pageHeaderDisplay, page.FplnPagingIndicator]];
    this.legsList.renderList(this.currentPage.get()).forEach(row => template.push(row));

    return template;
  }

  /**
   * Method to update the data used to render the Legs page.
   */
  private updateData(): void {
    if (this.fms.hasFlightPlan(this.fms.getPlanIndexForFmcPage())) {
      const lateralPlan = this.fms.getPlanForFmcRender();
      const verticalPlan = this.fms.getVerticalPlanForFmcRender();

      const activeLegIndex = lateralPlan.planIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX ? Math.max(lateralPlan.activeLateralLeg, this.effectiveLegIndex)
        : lateralPlan.activeLateralLeg;

      const fromLegIndex = Math.max(0, activeLegIndex - 1);
      const startSegmentIndex = Math.max(0, lateralPlan.getSegmentIndex(fromLegIndex));
      const legs = [];
      let isFromLeg = true;
      let isToLeg = false;
      let mapFound = false;

      const activeLeg = lateralPlan.tryGetLeg(lateralPlan.activeLateralLeg);

      const doShowPposRow = activeLeg && activeLeg.leg.type === LegType.HM && activeLeg.leg.fixIcao === ICAO.emptyIcao;

      if (doShowPposRow) {
        // Add PPOS leg if the active leg is a PPOS hold
        legs.push(new LegPageItem(-1, -1, -1, true, false, false, false));
      }

      for (let s = startSegmentIndex; s < lateralPlan.segmentCount; s++) {
        const segment = lateralPlan.getSegment(s);
        let startLegIndex = 0;
        if (s === startSegmentIndex) {
          startLegIndex = fromLegIndex - segment.offset;
        }

        for (let l = startLegIndex; l < segment.legs.length; l++) {
          const legDefinition = segment.legs[l];

          // Don't show FROM leg if for hold selection - we are already showing PPOS
          if (isFromLeg && doShowPposRow) {
            isFromLeg = false;
            isToLeg = true;
            continue;
          }

          const globalLegIndex = segment.offset + l;

          let vnavConstraint: VNavConstraint | undefined;
          let vnavLeg: VNavLeg | undefined;

          if (verticalPlan !== undefined && legDefinition.verticalData !== undefined && legDefinition.verticalData.altDesc !== AltitudeRestrictionType.Unused) {
            vnavConstraint = verticalPlan.constraints.find(c => c.index === globalLegIndex);

            if (verticalPlan.segments[segment.segmentIndex] !== undefined && verticalPlan.segments[segment.segmentIndex].legs[l] !== undefined) {
              vnavLeg = verticalPlan.segments[segment.segmentIndex].legs[l];
            }
          }

          legs.push(new LegPageItem(globalLegIndex, segment.segmentIndex, l, false, isFromLeg, isToLeg, mapFound, legDefinition, vnavLeg, vnavConstraint));

          if (mapFound) {
            mapFound = false;
          }
          if (BitFlags.isAll(legDefinition.leg.fixTypeFlags, FixTypeFlags.MAP)) {
            mapFound = true;
          }
          if (isToLeg) {
            isToLeg = false;
          }
          if (isFromLeg) {
            isFromLeg = false;
            isToLeg = true;
          }
        }
      }

      legs.push(new LegPageItem(-1, -1, -1, false, false, false, false, undefined));
      this.store.setLegs(legs);
      this.pageCount.set(legs.length);
      const pageDiff = this.pageCount.get() - this.currentPage.get();
      if (pageDiff < 0) {
        this.currentPage.set(this.currentPage.get() + pageDiff);
      }
    }
    this.planChanged = false;
  }

  /**
   * Method to update the vertical data used to render the Legs page.
   */
  private updateVerticalData(): void {
    const verticalPlan = this.fms.getVerticalPlanForFmcRender();
    const legsPageItemsArray = this.store.legs.getArray();

    let vnavLeg: VNavLeg | undefined;
    let vnavConstraint: VNavConstraint | undefined;

    legsPageItemsArray.forEach(item => {

      if (verticalPlan !== undefined &&
        verticalPlan.segments[item.segmentIndex] !== undefined &&
        verticalPlan.segments[item.segmentIndex].legs[item.segmentLegIndex] !== undefined) {

        vnavLeg = verticalPlan.segments[item.segmentIndex].legs[item.segmentLegIndex];
        vnavConstraint = verticalPlan.constraints.find(c => c.index === item.globalIndex);
      }

      this.store.setVNavLegAndConstraint(item.globalIndex, vnavLeg, vnavConstraint);
      vnavLeg = undefined;
      vnavConstraint = undefined;
    });
  }

  /**
   * Inserts a flight plan hold based on the HOLD AT facility being the parent leg already present in the flight plan
   *
   * @throws if an error occurs during the process
   *
   * @returns the index of the inserted hold leg
   */
  public insertCurrentFplnHoldFacility(): number | null {
    const facility = this.store.holdAtFacilitySubject.get();

    if (!facility) {
      throw new Error('Tried to insert flight plan hold with no hold at facility');
    }

    // FIXME how do we handle multi0ple legs in the flight plan with the same ICAO ?
    const matchingLeg = this.store.legs.getArray().find((it) => it.legDefinition?.leg?.fixIcao === facility.icao);

    if (!matchingLeg) {
      throw new Error('Tried to insert flight plan hold with no leg matching the hold at facility');
    }

    const parentLeg = matchingLeg.legDefinition;

    if (!parentLeg) {
      throw new Error('Tried to insert flight plan hold but matching leg had not leg definition');
    }

    const renderPlan = this.fms.getPlanForFmcRender();

    const parentLegIndex = renderPlan.getLegIndexFromLeg(parentLeg);
    const parentLegSegmentIndex = renderPlan.getSegmentIndex(parentLegIndex);
    const parentLegSegment = renderPlan.getSegment(parentLegSegmentIndex);

    const holdLeg = FlightPlan.createLeg({
      type: LegType.HM,
      fixIcao: parentLeg.leg.fixIcao,
      turnDirection: LegTurnDirection.Right,
      distanceMinutes: true,
      distance: 1,
      course: 100, // FIXME tmpy
    });

    const holdInserted = this.fms.insertHold(parentLegSegmentIndex, parentLegIndex - parentLegSegment.offset, holdLeg);

    if (holdInserted) {
      return parentLegIndex + 1;
    }

    return null;
  }

  /**
   * Handler called when a LSK is pressed on a SelectableDataField.
   * @param data The Leg Page Item or undefined.
   * @param scratchpadContents The Scratchpad Contents
   * @param isDelete Whether the input was a DELETE
   * @returns whether this leftPressed event was successful
   */
  private async leftPressed(data: LegPageItem | undefined, scratchpadContents: string, isDelete: boolean | undefined): Promise<boolean | string> {
    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (this.store.selectedLeg && data) {
      if (scratchpadContents === this.store.selectedLeg.legDefinition?.name) {
        if (data.isToLeg) {
          this.fms.createDirectTo(this.store.selectedLeg.segmentIndex, this.store.selectedLeg.segmentLegIndex);
          this.store.selectedLeg = undefined;
          return Promise.resolve(true);
        }

        const array = this.store.legs.getArray();
        const selectedLegArrayIndex = array.findIndex(leg => {
          // Need to compare the legDefinitions instead of the leg, because the leg store items get recreated on a regular basis
          return leg.legDefinition === this.store.selectedLeg?.legDefinition;
        });

        if (data.isFromLeg) {
          const nextLeg = this.store.legs.tryGet(selectedLegArrayIndex + 1);
          if (nextLeg) {
            this.fms.activateLeg(nextLeg.segmentIndex, nextLeg.segmentLegIndex);
            this.store.selectedLeg = undefined;
            return Promise.resolve(true);
          }
          return Promise.reject('UNABLE SET FROM LEG');
        }

        const legsToDelete = this.store.selectedLeg.globalIndex - data.globalIndex;

        const planToModify = this.fms.getModFlightPlan();

        for (let i = selectedLegArrayIndex - 1; i >= selectedLegArrayIndex - legsToDelete; i--) {
          const leg = this.store.legs.tryGet(i);

          if (leg) {
            const removed = planToModify.removeLeg(leg.segmentIndex, leg.segmentLegIndex);

            if (!removed) {
              this.store.selectedLeg = undefined;

              this.fms.cancelMod();

              // While INVALID DELETE would make more technical sense, this code path usually happens from a non-delete user operation,
              // meaning INVALID ENTRY is less confusing here
              return Promise.reject('INVALID ENTRY');
            }
          }
        }
        this.store.selectedLeg = undefined;
        return Promise.resolve(true);
      } else {
        this.store.selectedLeg = undefined;
      }
    }

    const holdAtFacility = this.store.holdAtFacilitySubject.get();

    if (holdAtFacility && data) {
      if (scratchpadContents.startsWith('HOLD AT ')) {
        const scratchpadRest = scratchpadContents.replace('HOLD AT ', '');

        const storeFacilityIdent = ICAO.getIdent(holdAtFacility.icao);

        if (scratchpadRest === storeFacilityIdent) {
          const holdLeg = FlightPlan.createLeg({
            type: LegType.HM,
            turnDirection: LegTurnDirection.Right,
            course: 100, // FIXME
            distance: 1,
            distanceMinutes: true,
            fixIcao: holdAtFacility.icao,
          });

          const waypointInserted = this.fms.insertWaypoint(holdAtFacility, data.segmentIndex, data.segmentLegIndex);

          if (!waypointInserted) {
            throw new Error('Could not insert waypoint for non-flight plan hold');
          }

          const plan = this.fms.getPlanForFmcRender();

          const addedLeg = plan.getSegment(data.segmentIndex).legs[data.segmentLegIndex];

          if (!addedLeg) {
            throw new Error('Could not find insert waypoint leg for non-flight plan hold');
          }

          const addedLegGlobalIndex = plan.getLegIndexFromLeg(addedLeg);
          const addedLegSegmentIndex = plan.getSegmentIndex(addedLegGlobalIndex);
          const addedLegSegment = plan.getSegment(addedLegSegmentIndex);

          const holdInserted = this.fms.insertHold(addedLegSegmentIndex, addedLegGlobalIndex - addedLegSegment.offset, holdLeg);

          if (holdInserted) {
            this.store.holdAtFacilitySubject.set(null);

            this.page.setActiveRoute('/fpln-hold', { atLeg: addedLegGlobalIndex + 1 });

            return true;
          }

          return Promise.reject('TOO MANY HOLDS');
        } else {
          return Promise.reject('FACILITY NOT FOUND');
        }
      }
    }

    if (isDelete) {
      if (data && !data.isFromLeg) {
        if (data.isToLeg && this.fms.createDirectToExistingNextValidLeg(data.globalIndex)) {
          return Promise.resolve(true);
        } else if (this.fms.removeWaypoint(data.segmentIndex, data.segmentLegIndex)) {
          return Promise.resolve(true);
        }
      }
      return Promise.reject('INVALID DELETE');
    }

    if (scratchpadContents && !data?.isFromLeg) {
      let pos: GeoPoint | undefined;

      const plan = this.fms.getPlanForFmcRender();

      const prevLegIndex = (data && data.globalIndex >= 0 ? data.globalIndex : plan.length) - 1;
      if (prevLegIndex >= 0 && prevLegIndex < plan.length) {
        const prevLeg = plan.getLeg(prevLegIndex);
        pos = prevLeg.calculated ? FlightPathUtils.getLegFinalPosition(prevLeg.calculated, LegsPageController.geoPointCache[0]) : undefined;
        if (!pos) {
          switch (prevLeg.leg.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HM:
            case LegType.HA: {
              const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(prevLeg.leg.fixIcao), prevLeg.leg.fixIcao);
              pos = LegsPageController.geoPointCache[0].set(facility);
            }
          }
        }
      }

      if (!pos) {
        const ppos = this.ppos.get();
        pos = LegsPageController.geoPointCache[0].set(ppos.lat, ppos.long);
      }

      let selectedFacility = await this.pageManager.selectWptFromIdent(scratchpadContents, pos);
      let insertAfter = false;

      // Pilot-defined waypoints
      if (!selectedFacility) {
        const result = await WT21PilotWaypointUtils.createFromScratchpadEntry(
          this.fms,
          (ident, refPos) => this.pageManager.selectWptFromIdent(ident, refPos),
          scratchpadContents,
          data?.globalIndex,
        );

        if (result) {
          const [userFacility] = result;
          [, insertAfter] = result;

          this.fms.addUserFacility(userFacility);

          selectedFacility = userFacility;
        }
      }

      // Do a Direct To Random, by creating and inserting the new waypoint, then calling createDirectToExisting
      if (selectedFacility !== null) {
        let segmentIndex = data && data.segmentIndex > -1 ? data.segmentIndex : undefined;
        let segmentLegIndex = data && data.segmentLegIndex > -1 ? data.segmentLegIndex : undefined;

        if (insertAfter && segmentIndex !== undefined && segmentLegIndex !== undefined) {
          const segment = plan.getSegment(segmentIndex);
          const isLastLegInSegment = segmentLegIndex === segment.legs.length - 1;

          // If we need to insert the waypoint after, we make sure we don't do so in the departure segment
          if (segment.segmentType === FlightPlanSegmentType.Departure && isLastLegInSegment) {
            let segmentToInsertIn: FlightPlanSegment | undefined = Array.from(plan.segmentsOfType(FlightPlanSegmentType.Enroute))[0];

            if (segmentToInsertIn?.airway) {
              segmentToInsertIn = undefined;
            }

            segmentToInsertIn ??= plan.insertSegment(segmentIndex + 1, FlightPlanSegmentType.Enroute);

            segmentIndex = segmentToInsertIn.segmentIndex;
            segmentLegIndex = 0;
          } else {
            segmentLegIndex++;
          }
        }

        // If new waypoint was dropped on a DISCO, try to delete the DISCO first
        if (segmentIndex !== undefined && segmentLegIndex !== undefined && data?.legDefinition?.leg.type === LegType.Discontinuity) {
          const waypointRemoved = this.fms.removeWaypoint(segmentIndex, segmentLegIndex);
          if (!waypointRemoved) {
            // If the DISCO could not be deleted, then the new waypoint was dropped on an invalid spot
            return Promise.reject('INVALID ENTRY');
          }
        }
        if (data) {
          if (data.isToLeg && !insertAfter) {
            this.fms.createDirectTo(segmentIndex, segmentLegIndex, true, undefined, selectedFacility);
          } else {
            this.fms.insertWaypoint(selectedFacility, segmentIndex, segmentLegIndex);
          }
        }
        return Promise.resolve(true);
      }

      return Promise.reject('FACILITY NOT FOUND');
    }

    if (!this.store.selectedLeg && data && data.legDefinition) {
      // Hold at FPLN waypoint
      if (this.isForHoldSelection) {
        const { fixIcao } = data.legDefinition.leg;

        try {
          const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(fixIcao), fixIcao);

          this.store.holdAtFacilitySubject.set(facility);

          const atLeg = this.insertCurrentFplnHoldFacility();

          if (atLeg !== null) {
            this.store.holdAtFacilitySubject.set(null);

            this.page.setActiveRoute('/fpln-hold', { atLeg: atLeg - 1 });

            return true;
          }

          return Promise.reject('TOO MANY HOLDS');
        } catch (e) {
          console.error('Could not load facility from selected hold ident: ' + ICAO.getIdent(fixIcao));
          console.error(e);
        }
      }

      switch (data.legDefinition.leg.type) {
        case LegType.CI:
        case LegType.VI:
        case LegType.FA:
        case LegType.CA:
        case LegType.VA:
        case LegType.VM:
        case LegType.Discontinuity:
          return Promise.reject('INVALID LEG SELECTION');
        default:
          // When in a Direct To (FROM leg shows (DIR)), do not allow selecting the (DIR) FROM leg
          if (data.isFromLeg && this.isFmcPageInDirectToExistingState()) {
            return Promise.reject('INVALID LEG SELECTION');
          }
          this.store.selectedLeg = data;
          return Promise.resolve(data.legDefinition.name ?? 'noleg bug');
      }
    }

    return Promise.reject('INVALID LEFT PRESS');
  }

  /** Checks if we are in a Direct To Existing state for ACT plan, or MOD when plan is in MOD.
   * @returns Whether we are in a Direct To Existing state for ACT plan, or MOD when plan is in MOD. */
  public isFmcPageInDirectToExistingState(): boolean {
    const fmcPlan = this.fms.getPlanForFmcRender();
    if (fmcPlan.planIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX) {
      // When not in MOD, we use effective leg index for things,
      // so here we need to check if the effective leg index mathces what the plan still thinks is the DTO state.
      // We subtract 1 so that we get the index of the effective FROM leg, just in case the TO leg is in a different segment.
      const effectiveFromLegIndex = Math.max(fmcPlan.activeLateralLeg, this.effectiveLegIndex) - 1;
      const effectiveSegmentIndex = fmcPlan.getSegmentIndex(effectiveFromLegIndex);
      const effectiveSegmentLegIndex = fmcPlan.getSegmentLegIndex(effectiveFromLegIndex);
      const dtoState = fmcPlan.directToData;
      // We add 2 to the dto segment leg index because the DTO is made of 3 legs, and we want to check the last one.
      return effectiveSegmentIndex === dtoState.segmentIndex && (effectiveSegmentLegIndex === dtoState.segmentLegIndex + 2);
    } else {
      return this.fms.getDirectToState(this.fms.getPlanIndexForFmcPage()) === DirectToState.TOEXISTING;
    }
  }

  /**
   * Handler called when a RSK is pressed on a SelectableDataField.
   * @param data The Leg Page Item or undefined.
   * @param scratchpadContents The Scratchpad Contents
   * @param isDelete Whether the input was a DELETE
   * @returns Whether this right press was successfully handled.
   */
  private async rightPressed(data: LegPageItem | undefined, scratchpadContents: string, isDelete: boolean | undefined): Promise<boolean | string> {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (data && data.isFromLeg) {

      const legsArray = this.store.legs.getArray();
      const fromLegIndexInLegsArray = legsArray.findIndex(l => l === data);
      const toLeg = legsArray[fromLegIndexInLegsArray + 1];
      if (toLeg !== undefined && toLeg.legDefinition?.leg && WT21FmsUtils.isLegVectOrDisco(toLeg.legDefinition.leg)) {
        if (this.fms.createDirectToExistingNextValidLeg(toLeg.globalIndex)) {
          return Promise.resolve(true);
        } else {
          return Promise.reject('INVALID ENTRY');
        }
      }

      this.eventBus.getPublisher<ControlEvents>().pub('suspend_sequencing', this.lnavSequencing, true);
      return Promise.resolve(true);
    }

    if (data?.globalIndex === undefined || !data.legDefinition) {
      return false;
    }

    if (!scratchpadContents && isDelete !== true) {
      if (data.isFromLeg) {
        return Promise.reject('KEY NOT ACTIVE');
      }
      return Promise.resolve(WT21FmsUtils.getConstraintDisplayForLegs(this.fms.performancePlanProxy, data.legDefinition.verticalData, this.fms.getActivePerformancePlan().transitionAltitude.get()).replace(/\s*(?:---\/|-----|\[[^\]]*\])\s*/g, ''));
    }

    if (data.legDefinition.leg.type === LegType.Discontinuity) {
      return Promise.reject('KEY NOT ACTIVE');
    }

    if (isDelete) {
      this.fms.setUserConstraint(data.globalIndex, {
        altDesc: AltitudeRestrictionType.Unused,
        altitude1: 0,
        altitude2: 0,
        speed: 0,
        speedDesc: SpeedRestrictionType.Unused,
        speedUnit: SpeedUnit.IAS,
        displayAltitude1AsFlightLevel: false,
        displayAltitude2AsFlightLevel: false,
      });
      return true;
    }

    const verticalDataClone = { ...data.legDefinition.verticalData };

    const isValid = WT21FmsUtils.parseConstraintInput(scratchpadContents, verticalDataClone);

    if (isValid === false) {
      return Promise.reject('INVALID ENTRY');
    }

    this.fms.setUserConstraint(data.globalIndex, verticalDataClone);

    return true;
  }

  /**
   * Sets the Direct To INTC CRS.
   * @param modPlan The MOD Flight Plan.
   * @param newCourse The scratchpad contents
   * @returns whether this was successfully completed.
   */
  public setDirectToCourse(modPlan: FlightPlan, newCourse: number): boolean {
    if (newCourse !== undefined) {
      if (newCourse >= 0 && newCourse <= 360 && modPlan.directToData.segmentIndex > -1 && modPlan.directToData.segmentLegIndex > -1) {
        this.fms.createDirectTo(modPlan.directToData.segmentIndex, modPlan.directToData.segmentLegIndex, true, newCourse);
        return true;
      }
    }

    return false;
  }


}
