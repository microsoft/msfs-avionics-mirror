import {
  AdcEvents, AltitudeRestrictionType, APEvents, ComputedSubject, ConsumerSubject, EventBus, FlightPlanActiveLegEvent, FlightPlanCalculatedEvent,
  FlightPlanCopiedEvent, FlightPlanLegEvent, FlightPlannerEvents, LegType, NavMath, Subject, UnitType, VNavUtils,
} from '@microsoft/msfs-sdk';

import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';
import { WT21LNavDataEvents } from '../Autopilot/WT21LNavDataEvents';
import { DisplayField } from '../Framework/Components/DisplayField';
import { RawFormatter } from '../Framework/FmcFormats';
import { FmcListUtility } from '../Framework/FmcListUtility';
import { FmcPage } from '../Framework/FmcPage';
import { FmcPageManager } from '../Framework/FmcPageManager';
import { FmcRenderTemplate, FmcRenderTemplateRow } from '../Framework/FmcRenderer';
import { DirectToPage } from './DirectToPage';
import { DirectToPageItem, DirectToPageStore } from './DirectToPageStore';

/**
 * DIRECT TO PAGE Controller
 */
export class DirectToPageController {

  static readonly activeHeaderString = ' ACT DIRECT-TO[blue]';
  static readonly modHeaderString = ' MOD[white] DIRECT-TO[blue]';

  public readonly currentPage = Subject.create(1);
  public readonly pageCount = ComputedSubject.create<number, number>(0, (v): number => {
    return Math.max(1, Math.ceil(v / 5));
  });

  private legChangeConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplLegChange');
  private planCopiedConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCopied');
  private planCalculatedConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCalculated');
  private activeLegChangeConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplActiveLegChange');
  private lnavDataEffectiveLegIndex = this.eventBus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_nominal_leg_index').whenChanged();
  private currentAltitude = ConsumerSubject.create(this.eventBus.getSubscriber<AdcEvents>().on('indicated_alt').whenChanged().withPrecision(0).atFrequency(1), 0);
  private apAltitudeSelected = ConsumerSubject.create(this.eventBus.getSubscriber<APEvents>().on('ap_altitude_selected').whenChanged().withPrecision(0).atFrequency(1), 0);
  private listConsumer = this.store.legs;

  // private activeLegDistance = 0;
  private effectiveLegIndex = -1;

  private planChanged = false;

  /**
   * Renders a row.
   * @param page The FmcPage
   * @param data The Data as RoutePageLegItem or undefined
   * @returns an array of FmcRenderTemplateRows
   */
  public renderRow = (page: FmcPage, data: DirectToPageItem | undefined): FmcRenderTemplateRow[] => {
    if (data !== undefined) {
      const ident = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: () => this.leftPressed(data),
      });
      const altitude = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: (scratchpadContents) => this.rightPressed(data, scratchpadContents),
      });
      const bearing = new DisplayField(this.page, {
        formatter: RawFormatter,
      });

      if (data.legDefinition) {
        ident.takeValue('<' + (data.legDefinition.name ?? 'noname') + (data.isToLeg ? '[magenta]' : ''));
        // TODO Take transition altitude into account?
        altitude.takeValue(WT21FmsUtils.getConstraintDisplayForDirectPage(data.legDefinition.verticalData,
          this.fms.getActivePerformancePlan().transitionAltitude.get()));
        let brg = null;
        if (data.legDefinition.calculated?.endLat && data.legDefinition.calculated?.endLon) {
          brg = NavMath.normalizeHeading(this.fms.ppos.bearingTo(data.legDefinition.calculated.endLat, data.legDefinition.calculated.endLon));
        }
        bearing.takeValue(brg !== null ? ' ' + brg.toFixed(0).padStart(3, '0') + '°[blue]' : brg);
        return [[bearing], [ident, altitude]];
      }
    }
    return [[''], ['']];
  };

  public legsList = new FmcListUtility(this.page, this.store.legs, this.renderRow, 4);

  /**
   * Creates the Controller.
   * @param eventBus The event bus
   * @param fms The Fms
   * @param store The Store
   * @param page The FMC Page
   * @param pageManager The FMC Page Manager
   */
  constructor(private readonly eventBus: EventBus, private readonly fms: WT21Fms, private readonly store: DirectToPageStore,
    private readonly page: FmcPage, private readonly pageManager: FmcPageManager) {
  }

  /**
   * Initializes the Controller
   */
  public init(): void {
    this.legChangeConsumer.handle(this.handleFlightPlanChangeEventLegs);
    this.activeLegChangeConsumer.handle(this.handleActiveLegChangeLegs);
    this.planCalculatedConsumer.handle(this.handleFlightPlanCalculatedEventLegs);
    this.lnavDataEffectiveLegIndex.handle(this.handleEffectiveLegIndexUpdate);
    this.currentAltitude.resume();
    this.apAltitudeSelected.sub(this.handleOnApSelectedAltitudeChanged);
    this.planCopiedConsumer.handle(this.handleFlightPlanCopyEventLegs);

    this.fms.planInMod.sub(this.handleOnModExecLegs);

    this.currentPage.sub(this.handleCurrentPageChangeLegs);

    this.listConsumer.sub(this.handleOnListUpdateLegs);

    this.getData();
  }

  /**
   * Destroys the Controller.
   */
  public destroy(): void {
    this.legChangeConsumer.off(this.handleFlightPlanChangeEventLegs);
    this.activeLegChangeConsumer.off(this.handleActiveLegChangeLegs);
    this.planCalculatedConsumer.off(this.handleFlightPlanCalculatedEventLegs);
    this.lnavDataEffectiveLegIndex.off(this.handleEffectiveLegIndexUpdate);
    this.currentAltitude.pause();
    this.apAltitudeSelected.unsub(this.handleOnApSelectedAltitudeChanged);
    this.planCopiedConsumer.off(this.handleFlightPlanCopyEventLegs);

    this.fms.planInMod.unsub(this.handleOnModExecLegs);

    this.currentPage.unsub(this.handleCurrentPageChangeLegs);

    this.listConsumer.unsub(this.handleOnListUpdateLegs);
  }

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
   * @param event is the FlightPlanLegEvent
   */
  private handleFlightPlanCopyEventLegs = (event: FlightPlanCopiedEvent): void => {
    if (event.targetPlanIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX) {
      this.planChanged = true;
    }
  };

  /**
   * Handles when the Active Leg Changeed Event is received over the bus
   * @param event is the FlightPlanActiveLegEvent
   */
  private handleActiveLegChangeLegs = (event: FlightPlanActiveLegEvent): void => {
    if (this.fms.getPlanIndexForFmcPage() === WT21Fms.PRIMARY_MOD_PLAN_INDEX
      && event.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.planChanged = true;
    }
  };

  /**
   * Handles when the Calculated Event is received over the bus
   * @param event is the FlightPlanCalculatedEvent
   */
  private handleFlightPlanCalculatedEventLegs = (event: FlightPlanCalculatedEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage() && this.planChanged) {
      this.getData();
      this.planChanged = false;
    }
  };

  /**
   * Handles when the effective leg index changes.
   * @param effectiveLegIndex The effective leg index that LNAV is navigating to.
   */
  private handleEffectiveLegIndexUpdate = (effectiveLegIndex: number): void => {
    this.effectiveLegIndex = effectiveLegIndex;
    if (!this.fms.planInMod.get() && effectiveLegIndex > -1) {
      this.planChanged = true;
      this.getData();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleOnModExecLegs = (inMod: boolean): void => {
    this.planChanged = true;
    this.getData();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleCurrentPageChangeLegs = (page: number): void => {
    this.page.invalidate();
  };

  private handleOnListUpdateLegs = (): void => {
    this.invalidate();
  };

  private handleOnApSelectedAltitudeChanged = (): void => {
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
  public renderPage(): FmcRenderTemplate {
    const page = this.page as DirectToPage;

    const template: FmcRenderTemplate = [[page.pageHeaderDisplay, page.FplnPagingIndicator]];
    template.push(['']);

    const randomDirectEntry = new DisplayField(this.page, {
      formatter: RawFormatter,
      onSelected: (scratchpadContents) => this.lskL1Pressed(scratchpadContents),
      onDelete: () => this.lskL1Pressed('', true),
    });
    randomDirectEntry.takeValue('<-----');

    const nearestAirports = new DisplayField(this.page, {
      formatter: RawFormatter,
      onSelected: this.lskR1Pressed.bind(this),
    });
    nearestAirports.takeValue('NEAREST APTS>');

    template.push([randomDirectEntry, nearestAirports]);

    this.legsList.renderList(this.currentPage.get()).forEach(row => template.push(row));
    template.push(['-----------------[blue]ALT SEL[white]']);

    const altSel = new DisplayField(this.page, {
      formatter: RawFormatter,
      onSelected: this.lskR6Pressed.bind(this),
    });

    altSel.takeValue(this.apAltitudeSelected.get().toFixed(0));

    template.push(['', altSel]);
    return template;
  }

  /**
   * Method to get the flight plan data on initial open.
   */
  private getData(): void {
    if (this.fms.hasFlightPlan(this.fms.getPlanIndexForFmcPage())) {
      const plan = this.fms.getPlanForFmcRender();
      const toLegIndex = Math.max(0, this.effectiveLegIndex);
      const startSegmentIndex = Math.max(0, plan.getSegmentIndex(toLegIndex));
      const legs = [];

      for (let s = startSegmentIndex; s < plan.segmentCount; s++) {
        const segment = plan.getSegment(s);
        let startLegIndex = 0;
        if (s === startSegmentIndex) {
          startLegIndex = toLegIndex - segment.offset;
        }

        for (let l = startLegIndex; l < segment.legs.length; l++) {
          const legDefinition = segment.legs[l];
          if (legDefinition.leg.type !== LegType.Discontinuity) {
            legs.push(new DirectToPageItem(segment.offset + l, segment.segmentIndex, l, segment.offset + l === plan.activeLateralLeg, legDefinition));
          }
        }
      }

      legs.push(new DirectToPageItem(-1, -1, -1, false, undefined));
      this.store.setLegs(legs);
      this.pageCount.set(legs.length);
    }
  }

  /**
   * Handler called when a LSK is pressed on a SelectableDataField.
   * @param data The Leg Page Item or undefined.
   * @returns whether this leftPressed event was successful
   */
  private async leftPressed(data: DirectToPageItem | undefined): Promise<boolean | string> {

    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (data && data.legDefinition && WT21FmsUtils.canLegBeSelectedOnDirectPage(data.legDefinition.leg)) {
      this.fms.createDirectTo(data.segmentIndex, data.segmentLegIndex);
      this.page.setActiveRoute('/legs');
      return Promise.resolve(true);
    }

    return Promise.reject('INVALID DIRECT TO');
  }

  /**
   * Handler called when a RSK is pressed on a SelectableDataField.
   * @param data The Leg Page Item or undefined.
   * @param scratchpadContents The Scratchpad Contents
   * @returns Whether this right press was successfully handled.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async rightPressed(data: DirectToPageItem | undefined, scratchpadContents: string): Promise<boolean | string> {
    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (!data) {
      return false;
    }

    const plan = this.fms.getModFlightPlan();
    const targetLeg = plan.getLeg(data.globalIndex);

    const activeLegIndex = plan.activeLateralLeg;

    const legs = Array.from(plan.legs());

    const firstDiscoIndex = legs.findIndex((it) => WT21FmsUtils.isLegVectOrDisco(it.leg));
    const firstDiscoLegIndex = firstDiscoIndex !== -1 ? firstDiscoIndex : Number.MAX_SAFE_INTEGER;

    const vplan = this.fms.getVerticalPlanForFmcRender();
    const lastClimbPhaseLegConstraintIndex = VNavUtils.getLastClimbConstraintIndex(vplan);

    const lastClimbPhaseLegIndex = lastClimbPhaseLegConstraintIndex !== -1 ? vplan.constraints[lastClimbPhaseLegConstraintIndex].index : -1;

    if ((data.globalIndex >= firstDiscoLegIndex && firstDiscoLegIndex >= activeLegIndex) || data.globalIndex < lastClimbPhaseLegIndex) {
      this.fms.cancelMod();

      return Promise.reject('INVALID DIRECT-TO');
    }

    for (let i = 0; i < data.globalIndex; i++) {
      const leg = plan.getLeg(i);

      if (leg.verticalData.altDesc !== AltitudeRestrictionType.Unused) {
        plan.setLegVerticalData(i, { altDesc: AltitudeRestrictionType.Unused });
      }
    }

    const existingVerticalData = targetLeg.verticalData;

    let finalAltitude;
    if (scratchpadContents) {
      const parsed = parseInt(scratchpadContents);

      if (!Number.isFinite(parsed) || parsed < 0) {
        return Promise.reject('INVALID ENTRY');
      }

      finalAltitude = UnitType.METER.convertFrom(parsed, UnitType.FOOT);
    } else {
      finalAltitude = existingVerticalData.altitude1;
    }

    const vdtoCreated = this.fms.createVerticalDirectTo(plan, data.globalIndex, finalAltitude);

    if (!vdtoCreated) {
      this.fms.cancelMod();

      return Promise.reject('INVALID DIRECT-TO');
    }

    return true;
  }

  /**
   * Handler called when LSK L1 is pressed to set a direct to random.
   * @param scratchpadContents The Scratchpad Contents
   * @param isDelete Whether the input was a DELETE
   * @returns Whether this button press was successfully handled.
   */
  private lskL1Pressed = async (scratchpadContents: string, isDelete?: boolean): Promise<boolean | string> => {
    if (!isDelete && scratchpadContents) {
      const selectedFacility = await this.pageManager.selectWptFromIdent(scratchpadContents, this.fms.ppos);
      if (selectedFacility !== null) {
        const plan = this.fms.getPlanForFmcRender();
        const segmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
        const segmentLegIndex = plan.activeLateralLeg - plan.getSegment(segmentIndex).offset;
        if (segmentIndex !== undefined && segmentLegIndex !== undefined) {
          this.fms.createDirectTo(segmentIndex, segmentLegIndex, true, undefined, selectedFacility);
          this.page.setActiveRoute('/legs');
          return Promise.resolve(true);
        }
      }
    } else if (isDelete) {
      return Promise.reject('DELETE NOT AVAILABLE');
    }
    return Promise.reject('FACILITY NOT FOUND');
  };

  /**
   * Handler called when LSK R1 is pressed to open the Nearest Airport Pages.
   * @returns Whether this button press was successfully handled.
   */
  private lskR1Pressed = async (): Promise<boolean> => {
    this.page.setActiveRoute('/nearest-airports');
    return true;
  };

  /**
   * Handler called when LSK R6 is pressed to open the Nearest Airport Pages.
   * @returns The altitude to put in the scratchpad.
   */
  private lskR6Pressed = (): Promise<string> => {
    return Promise.resolve(this.apAltitudeSelected.get().toFixed(0));
  };
}
