import {
  ActiveOrUpcomingLegPredictions, ClockEvents, ComponentProps, ComputedSubject, ConsumerSubject, DateTimeFormatter, DisplayComponent, FacilityLoader,
  FacilityType, FlightPlanner, FlightPlanPredictor, FSComponent, MappedSubject, NumberFormatter, Subject, Subscribable, UnitType, VNavEvents, VNode
} from '@microsoft/msfs-sdk';

import { PerformancePlanData, WT21AlternatePredictor, WT21FmsUtils, WT21LNavDataEvents, WT21MfdTextPageEvents, WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import { MfdTextPageComponent, MfdTextPageProps } from './MfdTextPageComponent';

import './ProgressPage.css';
import './MfdPagesContainer.css';

const PROGRESS_PAGE_NUM_ROWS = 8;

/**
 * Props for {@link ProgressPage}
 */
export interface ProgressPageProps extends MfdTextPageProps {
  /**
   * The flight planner
   */
  planner: FlightPlanner,

  /**
   * The facility loader
   */
  facLoader: FacilityLoader,

  /**
   * The flight plan predictor
   */
  predictor: FlightPlanPredictor,

  /**
   * Performance plan data
   */
  performancePlan: PerformancePlanData,
}

/**
 * The Progress Page component.
 */
export class ProgressPage extends MfdTextPageComponent<ProgressPageProps> {
  private readonly subs = this.props.bus.getSubscriber<ClockEvents & WT21LNavDataEvents & VNavEvents & WT21MfdTextPageEvents>();

  private readonly nominalActiveLegIndexSub = ConsumerSubject.create(this.subs.on('lnavdata_nominal_leg_index').whenChanged(), -1).pause();
  private readonly simTimeSub = ConsumerSubject.create(this.subs.on('simTime').whenChanged(), 0).pause();
  private readonly updateSub = ConsumerSubject.create(this.subs.on('simTime').whenChangedBy(2_000), null).pause();
  private readonly vnavTodGlobalLegIndexSub = ConsumerSubject.create(this.subs.on('vnav_tod_global_leg_index').whenChanged(), -1).pause();
  private readonly vnavTodDistanceSub = ConsumerSubject.create(this.subs.on('vnav_tod_distance').whenChanged(), -1).pause();
  private readonly vnavBodGlobalLegIndexSub = ConsumerSubject.create(this.subs.on('vnav_bod_global_leg_index').whenChanged(), -1).pause();
  private readonly vnavBodDistanceSub = ConsumerSubject.create(this.subs.on('vnav_bod_distance').whenChanged(), -1).pause();

  private readonly pageIndex = Subject.create(0);
  private readonly pageCount = Subject.create(4);

  private readonly altnPredictor = new WT21AlternatePredictor(this.props.planner, this.props.facLoader, this.props.predictor);

  private readonly todPredictions: ActiveOrUpcomingLegPredictions = {
    kind: 'activeOrUpcoming',
    ident: 'TOD',
    distance: -1,
    estimatedTimeOfArrival: -1,
    estimatedTimeEnroute: -1,
    fob: null,
  };

  private readonly bodPredictions: ActiveOrUpcomingLegPredictions = {
    kind: 'activeOrUpcoming',
    ident: 'BOD',
    distance: -1,
    estimatedTimeOfArrival: -1,
    estimatedTimeEnroute: -1,
    fob: null,
  };

  private readonly fuelFormatter = NumberFormatter.create({ precision: 10, round: -1 });

  private readonly fuelAtDestSub = Subject.create<null | number>(null);

  private readonly fuelAtAltnSub = Subject.create<null | number>(null);

  private readonly reservesTextSub = MappedSubject.create(([reserves]) => {
    if (reserves) {
      if (WT21UnitsUtils.getIsMetric()) {
        return this.fuelFormatter(UnitType.POUND.convertTo(reserves, UnitType.KILOGRAM)).padStart(4, ' ');
      } else {
        return this.fuelFormatter(reserves).padStart(4, ' ');
      }
    } else {
      return '----';
    }
  }, this.props.performancePlan.reserveFuel);

  private readonly extraTextSub = MappedSubject.create(([reserves, fuelAtDest, fuelAtAltn]) => {
    if (reserves && fuelAtDest && fuelAtAltn) {
      const extra: number = fuelAtDest - (fuelAtDest - fuelAtAltn) - reserves;

      return this.fuelFormatter(WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(extra, UnitType.KILOGRAM) : extra).padStart(4, ' ');
    }

    return '----';
  }, this.props.performancePlan.reserveFuel, this.fuelAtDestSub, this.fuelAtAltnSub);

  /** @inheritDoc */
  show(): void {
    super.show();

    this.nominalActiveLegIndexSub.resume();
    this.simTimeSub.resume();
    this.updateSub.resume();
    this.vnavTodGlobalLegIndexSub.resume();
    this.vnavTodDistanceSub.resume();
    this.vnavBodGlobalLegIndexSub.resume();
    this.vnavBodDistanceSub.resume();
  }

  /** @inheritDoc */
  hide(): void {
    super.hide();

    this.nominalActiveLegIndexSub.pause();
    this.simTimeSub.pause();
    this.updateSub.pause();
    this.vnavTodGlobalLegIndexSub.pause();
    this.vnavTodDistanceSub.pause();
    this.vnavBodGlobalLegIndexSub.pause();
    this.vnavBodDistanceSub.pause();
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const sub = this.props.bus.getSubscriber<ClockEvents & WT21LNavDataEvents & VNavEvents & WT21MfdTextPageEvents>();

    this.updateSub.sub(() => this.update());

    sub.on('wt21mfd_text_page_prev').handle((targetMfdIndex) => {
      if (targetMfdIndex === this.props.mfdIndex) {
        const curr = this.pageIndex.get();

        if (curr === 0) {
          this.pageIndex.set(Math.max(0, this.pageCount.get() - 1));
        } else {
          this.pageIndex.set(this.pageIndex.get() - 1);
        }

        this.update();
      }
    });

    sub.on('wt21mfd_text_page_next').handle((targetMfdIndex) => {
      if (targetMfdIndex === this.props.mfdIndex) {
        if (this.pageCount.get() > 1) {
          this.pageIndex.set((this.pageIndex.get() + 1) % this.pageCount.get());
        }

        this.update();
      }
    });
  }

  /**
   * Update loop
   */
  private update(): void {
    this.props.predictor.update();
    this.altnPredictor.update().catch();

    const predictions = Array.from(this.props.predictor.iteratePredictions(this.nominalActiveLegIndexSub.get() - 1));
    this.pageCount.set(Math.ceil(predictions.length / PROGRESS_PAGE_NUM_ROWS));

    const pageIndex = this.pageIndex.get();
    const pageCount = this.pageCount.get();

    // Prevent the page index from staying too high
    if (pageIndex >= pageCount) {
      this.pageIndex.set(Math.max(0, pageCount - 1));
    }

    const rowData: ProgressPageRowData[] = [];

    let plan;
    if (this.props.planner.hasFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX)) {
      plan = this.props.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);
    }

    for (let i = 0; rowData.length < 8 && i < 16; i++) {
      const pageStartIndex = pageIndex * 8;
      const associatedLegIndex = this.nominalActiveLegIndexSub.get() + (pageStartIndex + i) - 1;

      if (plan && associatedLegIndex >= plan.length) {
        break;
      }

      // TOD prediction
      if (associatedLegIndex === this.vnavTodGlobalLegIndexSub.get()) {
        const todDistance = this.vnavTodDistanceSub.get();

        if (todDistance > 0) {
          const todDistanceNM = UnitType.NMILE.convertFrom(todDistance, UnitType.METER);

          this.todPredictions.distance = todDistanceNM;

          this.props.predictor.applyPredictionsForDistance(todDistanceNM, this.todPredictions);

          const data = this.todPredictions as unknown as ProgressPageRowData;

          data.style = ProgressPageRowStyle.Vnav;

          rowData.push(data);
        }
      }

      const prediction = this.props.predictor.predictionsForLegIndex(associatedLegIndex);
      if (prediction) {
        let style;
        if (associatedLegIndex === this.nominalActiveLegIndexSub.get() - 1) {
          style = ProgressPageRowStyle.PreviousLeg;
        } else if (associatedLegIndex === this.nominalActiveLegIndexSub.get()) {
          style = ProgressPageRowStyle.ActiveLeg;
        } else {
          style = ProgressPageRowStyle.UpcomingLeg;
        }

        const data = prediction as unknown as ProgressPageRowData;

        data.style = style;

        rowData.push(data);

        // BOD prediction
        if (associatedLegIndex === this.vnavBodGlobalLegIndexSub.get()) {
          const bodDistance = this.vnavBodDistanceSub.get();

          if (bodDistance > 0) {
            this.bodPredictions.distance = prediction.distance;

            this.props.predictor.applyPredictionsForDistance(prediction.distance, this.bodPredictions);

            const bodData = this.bodPredictions as unknown as ProgressPageRowData;

            bodData.style = ProgressPageRowStyle.Vnav;

            rowData.push(bodData);
          }
        }
      }
    }

    for (let i = 0; i < PROGRESS_PAGE_NUM_ROWS; i++) {
      const row = this.rowRefs[i];
      const data = rowData[i];

      if (data) {
        row.instance.props.data.set(data);
        row.instance.props.data.notify();
      } else {
        row.instance.props.data.set(null);
      }
    }

    if (plan) {
      if (plan.destinationAirport) {
        this.props.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport).then((facility) => {
          const destinationPredictions = this.props.predictor.getDestinationPrediction(facility);

          if (destinationPredictions) {
            this.fuelAtDestSub.set(destinationPredictions.fob);

            const data = destinationPredictions as unknown as ProgressPageRowData;

            data.style = ProgressPageRowStyle.UpcomingLeg;

            this.destRowRef.instance.props.data.set(data);
            this.destRowRef.instance.props.data.notify();
          } else {
            this.destRowRef.instance.props.data.set(null);
            this.fuelAtDestSub.set(null);
          }
        }).catch(() => {
          this.destRowRef.instance.props.data.set(null);
          this.fuelAtDestSub.set(null);
        });
      } else {
        this.destRowRef.instance.props.data.set(null);
        this.fuelAtDestSub.set(null);
      }

      if (this.altnPredictor.alternatePredictions) {
        const altnPredictions = this.altnPredictor.alternatePredictions;

        this.fuelAtAltnSub.set(altnPredictions.fob);

        const data = altnPredictions as unknown as ProgressPageRowData;

        data.style = ProgressPageRowStyle.UpcomingLeg;

        this.altnRowRef.instance.props.data.set(data);
        this.altnRowRef.instance.props.data.notify();
      } else {
        this.altnRowRef.instance.props.data.set(null);
        this.fuelAtAltnSub.set(null);
      }
    }
  }

  private rowRefs = [
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
    FSComponent.createRef<ProgressPageRow>(),
  ];

  private destRowRef = FSComponent.createRef<ProgressPageRow>();

  private altnRowRef = FSComponent.createRef<ProgressPageRow>();

  /** @inheritDoc */
  public render(): VNode {
    const fuelUnit = WT21UnitsUtils.getIsMetric() ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-main-container">
        <div class="mfd-page-title-header">
          <div class="header-hidden">xxx</div>
          <div>FMS ACT PROGRESS</div>
          <div>{MappedSubject.create(([i, max]) => `${i + 1}/${Math.max(1, max)}`, this.pageIndex, this.pageCount)}</div>
        </div>

        <div class="progress-grid">
          <div class="cyan-text">WPT</div>
          <div class="grid-right cyan-text">DIST</div>
          <div class="grid-center cyan-text">ETA</div>
          <div class="grid-right cyan-text">FUEL</div>

          <ProgressPageRow
            ref={this.rowRefs[0]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[1]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[2]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[3]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[4]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[5]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[6]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <ProgressPageRow
            ref={this.rowRefs[7]}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

        </div>

        <div class="progress-row cyan-text">--------------------------------------------</div>

        <div class="dest-grid">
          <div class="cyan-text dest-indent">DEST</div>

          <ProgressPageRow
            ref={this.destRowRef}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <div class="cyan-text dest-indent">ALTN</div>

          <ProgressPageRow
            ref={this.altnRowRef}
            data={Subject.create<ProgressPageRowData | null>(null)}
            simTime={this.simTimeSub}
          />

          <div class="cyan-text grid-left fuel-column">RESERVE</div>
          <div class="grid-right">{this.reservesTextSub}</div>
          <div class="cyan-text grid-left fuel-column">EXTRA</div>
          <div class="grid-right">{this.extraTextSub}</div>
        </div>

        <div class="progress-fuel-label cyan-text">({fuelUnit})</div>

      </div>
    );
  }
}

/**
 * Row data
 */
interface ProgressPageRowData {
  /**
   * Row style
   */
  style: ProgressPageRowStyle,

  /**
   * Leg ident
   */
  ident: string,

  /**
   * Distance field value
   */
  distance: number,

  /**
   * ETA field value, in UTC seconds from midnight
   */
  estimatedTimeOfArrival: number,

  /**
   * FUEL (LB) field value
   */
  fob: number | null
}

/**
 * Display style for row
 */
enum ProgressPageRowStyle {
  PreviousLeg,
  ActiveLeg,
  UpcomingLeg,
  Vnav,
}

/**
 * Props for {@link ProgressPageRow}
 */
interface ProgressPageRowProps extends ComponentProps {
  /**
   * Data for the row
   */
  data: Subject<ProgressPageRowData | null>,

  /**
   * Sim time in unix ms
   */
  simTime: Subscribable<number>,
}

/**
 * Row of the FMS ACT PROGRESS page
 */
class ProgressPageRow extends DisplayComponent<ProgressPageRowProps> {
  private readonly timeFormatter = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--' });
  private readonly fuelFormatter = NumberFormatter.create({ precision: 10, round: -1 });

  private readonly identTextSub = ComputedSubject.create<ProgressPageRowData | null, string>(null, (data) => data?.ident ?? '-----');

  private readonly distanceTextSub = ComputedSubject.create<ProgressPageRowData | null, string>(null, (data) => {
    if (data?.distance) {
      if (data.distance >= 100) {
        return `${Math.trunc(data.distance).toString().padStart(3, '0')}NM`;
      } else {
        return `${data.distance.toFixed(1)}NM`;
      }
    } else {
      return '---NM';
    }
  });

  private readonly etaTextSub = MappedSubject.create(([data, simTime]) => {
    if (data?.estimatedTimeOfArrival) {
      const unixDayStartMs = simTime - (simTime % (1_000 * 60 * 60 * 24));

      return this.timeFormatter(unixDayStartMs + (data.estimatedTimeOfArrival * 1_000));
    } else {
      return '--:--';
    }
  }, this.props.data, this.props.simTime);

  private readonly fuelLbsTextSub = ComputedSubject.create<ProgressPageRowData | null, string>(null, (data) => {
    if (data !== null && data.fob) {
      if (WT21UnitsUtils.getIsMetric()) {
        return this.fuelFormatter(UnitType.POUND.convertTo(data.fob, UnitType.KILOGRAM));
      } else {
        return this.fuelFormatter(data.fob);
      }
    } else {
      return '----';
    }
  });

  private readonly identStyleClass = Subject.create('');
  private readonly styleClass = Subject.create('');

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.data.sub((v) => {
      this.identTextSub.set(v);
      this.distanceTextSub.set(v);
      this.fuelLbsTextSub.set(v);

      switch (v?.style) {
        case ProgressPageRowStyle.PreviousLeg:
          this.identStyleClass.set('');
          this.styleClass.set('cyan-text');
          break;
        case ProgressPageRowStyle.ActiveLeg:
          this.identStyleClass.set('');
          this.styleClass.set('magenta-text');
          break;
        case ProgressPageRowStyle.Vnav:
          this.identStyleClass.set('vnav-ident');
          this.styleClass.set('green-text');
          break;
        default:
          this.identStyleClass.set('');
          this.styleClass.set('');
          break;
      }
    }, true);

    this.identStyleClass.sub((v) => this.identRef.instance.className = v);
    this.styleClass.sub((v) => this.elementRefs.forEach((el) => el.instance.className = v));
  }

  private identRef = FSComponent.createRef<HTMLDivElement>();

  private elementRefs = [
    FSComponent.createRef<HTMLDivElement>(),
    FSComponent.createRef<HTMLDivElement>(),
    FSComponent.createRef<HTMLDivElement>(),
    FSComponent.createRef<HTMLDivElement>(),
  ];

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <>
        <div ref={this.identRef}><span ref={this.elementRefs[0]}>{this.identTextSub}</span></div>
        <div class="grid-right"><span ref={this.elementRefs[1]}>{this.distanceTextSub}</span></div>
        <div class="grid-center"><span ref={this.elementRefs[2]}>{this.etaTextSub}</span></div>
        <div class="grid-right"><span ref={this.elementRefs[3]}>{this.fuelLbsTextSub}</span></div>
      </>
    );
  }
}
