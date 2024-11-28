import {
  AbstractFmcPage, ComputedSubject, DisplayField, EventBus, FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanCopiedEvent, FlightPlanLegEvent,
  FlightPlannerEvents, FmcListUtility, FmcRenderTemplate, FmcRenderTemplateRow, LegType, NavMath, RawFormatter, Subject, Subscription
} from '@microsoft/msfs-sdk';

import { WT21FmsUtils, WT21LNavDataEvents } from '@microsoft/msfs-wt21-shared';

import { WT21Fms } from '../FlightPlan/WT21Fms';
import { WT21FmcPage } from '../WT21FmcPage';
import { DirectToPage } from './DirectToPage';
import { DirectToPageItem, DirectToPageStore } from './DirectToPageStore';

/**
 * DIRECT TO HISTORY PAGE Controller
 */
export class DirectToHistoryPageController {

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
  private listConsumer = this.store.legs;

  // private activeLegDistance = 0;
  private effectiveLegIndex = -1;

  private planChanged = false;

  public renderRow = (page: AbstractFmcPage, indexInDisplay: number, prevData: DirectToPageItem | undefined, data: DirectToPageItem | undefined): FmcRenderTemplateRow[] => {
    if (data !== undefined) {
      const ident = new DisplayField(this.page, {
        formatter: RawFormatter,
        onSelected: () => this.leftPressed(data),
      });
      const bearing = new DisplayField(this.page, {
        formatter: RawFormatter,
      });

      if (data.legDefinition) {
        ident.takeValue('<' + (data.legDefinition.name ?? 'noname'));
        let brg = null;
        if (data.legDefinition.calculated?.endLat && data.legDefinition.calculated?.endLon) {
          brg = NavMath.normalizeHeading(this.fms.ppos.bearingTo(data.legDefinition.calculated.endLat, data.legDefinition.calculated.endLon));
        }
        bearing.takeValue(brg !== null ? ' ' + brg.toFixed(0) + '°[blue]' : brg);
        return [[bearing], [ident]];
      }
    }
    return [[''], ['']];
  };

  public legsList = new FmcListUtility<DirectToPageItem>(this.page, this.store.legs, this.renderRow, 5);

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates the Controller.
   * @param eventBus The event bus
   * @param fms The Fms
   * @param store The Store
   * @param page The FMC Page
   */
  constructor(
    private readonly eventBus: EventBus,
    private readonly fms: WT21Fms,
    private readonly store: DirectToPageStore,
    private readonly page: WT21FmcPage,
  ) {
  }

  /**
   * Initializes the Controller
   */
  public init(): void {
    this.subscriptions.push(
      this.legChangeConsumer.handle(this.handleFlightPlanChangeEventLegs),
      this.activeLegChangeConsumer.handle(this.handleActiveLegChangeLegs),
      this.planCalculatedConsumer.handle(this.handleFlightPlanCalculatedEventLegs),
      this.lnavDataEffectiveLegIndex.handle(this.handleEffectiveLegIndexUpdate),
      this.planCopiedConsumer.handle(this.handleFlightPlanCopyEventLegs),

      this.fms.planInMod.sub(this.handleOnModExecLegs),

      this.currentPage.sub(this.handleCurrentPageChangeLegs),

      this.listConsumer.sub(this.handleOnListUpdateLegs),
    );

    this.getData();
  }

  /**
   * Destroys the Controller.
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
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
    if (event.targetPlanIndex === WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX) {
      this.planChanged = true;
    }
  };

  /**
   * Handles when the Active Leg Changeed Event is received over the bus
   * @param event is the FlightPlanActiveLegEvent
   */
  private handleActiveLegChangeLegs = (event: FlightPlanActiveLegEvent): void => {
    if (event.planIndex === this.fms.getPlanIndexForFmcPage()) {
      this.getData();
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
    this.getData();
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
    template.push(['', '', 'HISTORY[blue s-text]']);

    this.legsList.renderList(this.currentPage.get()).forEach(row => template.push(row));

    template.splice(2, 1);

    template.push(['------------------------[blue]']);

    template.push(['']);
    return template;
  }

  /**
   * Method to get the flight plan data on initial open.
   */
  private getData(): void {
    if (this.fms.hasFlightPlan(this.fms.getPlanIndexForFmcPage())) {
      const plan = this.fms.getPlanForFmcRender();
      const fromLegIndex = Math.max(0, this.effectiveLegIndex - 1);
      const endSegmentIndex = Math.max(0, plan.getSegmentIndex(fromLegIndex));
      const legs = [];

      for (let s = 0; s < endSegmentIndex; s++) {
        const segment = plan.getSegment(s);
        let endLegIndex = segment.legs.length - 1;
        if (s === endSegmentIndex) {
          endLegIndex = fromLegIndex - segment.offset;
        }

        for (let l = 0; l <= endLegIndex; l++) {
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
      this.page.screen.navigateTo('/legs');
      return Promise.resolve(true);
    }

    return Promise.reject('INVALID DIRECT TO');
  }
}
