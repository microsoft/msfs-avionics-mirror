import {
  ActiveOrUpcomingLegPredictions, ClockEvents, ComponentProps, ComputedSubject, ConsumerSubject, DateTimeFormatter, DisplayComponent,
  DmsFormatter, DurationFormatter, EngineEvents, EventBus, FacilityLoader, FacilityType, FlightPlanner, FlightPlannerEvents,
  FlightPlanPredictor, FSComponent, ICAO, MappedSubject, NumberFormatter, PassedLegPredictions, Subject, Subscribable, UnitType,
  VNode,
} from '@microsoft/msfs-sdk';
import { MfdTextPageComponent, MfdTextPageProps } from './MfdTextPageComponent';
import { WT21Fms } from '../../../Shared/FlightPlan/WT21Fms';
import { WT21LNavDataEvents } from '../../../FMC/Autopilot/WT21LNavDataEvents';
import { PerformancePlanData } from '../../../Shared/Performance/PerformancePlanData';

import './PosReportPage.css';
import './MfdPagesContainer.css';
import { WT21UnitsUtils } from '../../../Shared/WT21UnitsUtils';

/**
 * Props for {@link PosReportPage}
 */
export interface PosReportPageProps extends MfdTextPageProps {
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
   * The performance plan
   */
  performancePlan: PerformancePlanData,
}

/**
 * The Position Report Page component.
 */
export class PosReportPage extends MfdTextPageComponent<PosReportPageProps> {
  private readonly durationFormatter = DurationFormatter.create('{m}:{ss}', UnitType.SECOND, 1, '-:--');
  private readonly fuelFormatter = NumberFormatter.create({ precision: 10, round: -1 });

  private readonly subs = this.props.bus.getSubscriber<ClockEvents & EngineEvents & FlightPlannerEvents & WT21LNavDataEvents>();

  private readonly updateSub = ConsumerSubject.create(this.subs.on('realTime').whenChangedBy(2_500), -1).pause();
  private readonly fuelTotalQuantitySub = ConsumerSubject.create(this.subs.on('fuel_total'), -1).pause();
  private readonly fuelWeightPerGallonSub = ConsumerSubject.create(this.subs.on('fuel_weight_per_gallon'), -1).pause();
  private readonly nominalActiveLegIndexSub = ConsumerSubject.create(this.subs.on('lnavdata_nominal_leg_index'), -1).pause();
  private readonly fplCopiedSub = ConsumerSubject.create(this.subs.on('fplCopied'), null).pause();
  private readonly fplLoadedSub = ConsumerSubject.create(this.subs.on('fplLoaded'), null).pause();
  private readonly fplSegmentChangeSub = ConsumerSubject.create(this.subs.on('fplSegmentChange'), null).pause();

  private readonly flightPlanUpdateSub = MappedSubject.create(this.nominalActiveLegIndexSub, this.fplCopiedSub, this.fplLoadedSub, this.fplSegmentChangeSub);

  private readonly destinationPredictionSub = Subject.create<ActiveOrUpcomingLegPredictions | null>(null);

  private readonly eteDestTextSub = this.destinationPredictionSub.map((predictions) => {
    if (predictions) {
      return this.durationFormatter(predictions.estimatedTimeEnroute);
    }

    return '-:--';
  });

  private readonly distToGoTextSub = this.destinationPredictionSub.map((predictions) => {
    if (predictions) {
      return predictions.distance.toFixed(0);
    }

    return '---';
  });

  private readonly fuelRemainingTextSub = MappedSubject.create(([fuelTotalQuantity, fuelWeightPerGallon]) => {
    if (fuelTotalQuantity !== -1 && fuelWeightPerGallon !== -1) {
      const totalFuelWeight = fuelTotalQuantity * fuelWeightPerGallon;

      return this.fuelFormatter(totalFuelWeight);
    }

    return '----';
  }, this.fuelTotalQuantitySub, this.fuelWeightPerGallonSub);

  /**
   * Handles updating the destination predictions
   */
  private handleUpdateDestinationPredictions(): void {
    if (this.props.planner.hasFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.props.planner.getFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX);

      if (plan.destinationAirport && plan.destinationAirport !== ICAO.emptyIcao) {
        this.props.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport).then((facility) => {
          if (facility) {
            this.destinationPredictionSub.set(this.props.predictor.getDestinationPrediction(facility));
          } else {
            this.destinationPredictionSub.set(null);
          }
        });
      } else {
        this.destinationPredictionSub.set(null);
      }
    }
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.updateSub.sub(() => this.handleUpdateDestinationPredictions());
  }

  /** @inheritDoc */
  show(): void {
    super.show();

    this.updateSub.resume();
    this.fuelTotalQuantitySub.resume();
    this.fuelWeightPerGallonSub.resume();
    this.nominalActiveLegIndexSub.resume();
    this.fplCopiedSub.resume();
    this.fplLoadedSub.resume();
    this.fplSegmentChangeSub.resume();
  }

  /** @inheritDoc */
  hide(): void {
    super.hide();

    this.updateSub.pause();
    this.fuelTotalQuantitySub.pause();
    this.fuelWeightPerGallonSub.pause();
    this.nominalActiveLegIndexSub.pause();
    this.fplCopiedSub.pause();
    this.fplLoadedSub.pause();
    this.fplSegmentChangeSub.pause();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-main-container">
        <div class="mfd-page-title-header pos-report-header-margin">
          <div class="header-hidden">xxx</div>
          <div>FMS ACT POS REPORT</div>
          <div>1/1</div>
        </div>

        <PosReportPrevLeg
          bus={this.props.bus}
          updateSub={this.updateSub}
          nominalActiveLegIndexSub={this.nominalActiveLegIndexSub}
          flightPlanUpdateSub={this.flightPlanUpdateSub}
          planner={this.props.planner}
          predictor={this.props.predictor}
          performancePlan={this.props.performancePlan}
        />
        <PosReportActiveOrUpcomingLeg
          bus={this.props.bus}
          updateSub={this.updateSub}
          nominalActiveLegIndexSub={this.nominalActiveLegIndexSub}
          flightPlanUpdateSub={this.flightPlanUpdateSub}
          planner={this.props.planner}
          predictor={this.props.predictor}
          performancePlan={this.props.performancePlan}
          indexDelta={0}
          active={true}
        />
        <PosReportActiveOrUpcomingLeg
          bus={this.props.bus}
          updateSub={this.updateSub}
          nominalActiveLegIndexSub={this.nominalActiveLegIndexSub}
          flightPlanUpdateSub={this.flightPlanUpdateSub}
          planner={this.props.planner}
          predictor={this.props.predictor}
          performancePlan={this.props.performancePlan}
          indexDelta={1}
          active={false}
        />

        <div class="pos-report-weather cyan-text">
          <div>-----</div>
          <div>---°C</div>
          <div class="grid-right">---T/ -- KT</div>
          <div>---------</div>
          <div>---°C</div>
          <div class="grid-right">---T/ -- KT</div>
        </div>

        <div class="pos-report-dest">
          <div class="cyan-text">FUEL REM</div>
          <div class="grid-right pos-report-dest-spacing">{this.fuelRemainingTextSub}</div>
          <div class="cyan-text">FUEL USED</div>
          <div class="grid-right">----</div>
          <div class="cyan-text">ETE DEST</div>
          <div class="grid-right pos-report-dest-spacing">{this.eteDestTextSub}</div>
          <div class="cyan-text">TIME ALOFT</div>
          <div class="grid-right">-:--</div>
          <div class="cyan-text">DIST TO GO</div>
          <div class="grid-right pos-report-dest-spacing">{this.distToGoTextSub}</div>
          <div class="cyan-text">DIST FLOWN</div>
          <div class="grid-right">---</div>
        </div>
      </div>
    );
  }
}

/**
 * Props for pos report leg section components
 */
interface PosReportLegSectionProps extends ComponentProps {
  /**
   * The event bus
   */
  bus: EventBus,

  /**
   * Update subscribable
   */
  updateSub: Subscribable<any>,

  /**
   * Flight plan change subscribable
   */
  flightPlanUpdateSub: Subscribable<any>,

  /**
   * Nominal active leg index subscribable
   */
  nominalActiveLegIndexSub: Subscribable<number>,

  /**
   * The flight planner
   */
  planner: FlightPlanner,

  /**
   * The flight plan predictor
   */
  predictor: FlightPlanPredictor,

  /**
   * The performance plan
   */
  performancePlan: PerformancePlanData,
}

/**
 * POS REPORT previous leg section
 */
class PosReportPrevLeg extends DisplayComponent<PosReportLegSectionProps> {
  private readonly timeFormatter = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--' });
  private readonly fuelFormatter = NumberFormatter.create({ precision: 10, round: -1 });

  // TODO replace this with an `onUpdated` event in the predictor ?
  private readonly subs = this.props.bus.getSubscriber<ClockEvents & FlightPlannerEvents & WT21LNavDataEvents>();

  private readonly simTimeSub = ConsumerSubject.create(this.subs.on('simTime'), -1);

  private readonly prevLegSub = this.props.flightPlanUpdateSub.map(([index]) => {
    if (index === -1) {
      return null;
    }

    if (this.props.planner.hasFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.props.planner.getFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX);

      const prevLegIndex = this.props.predictor.findPreviousPredictedLegIndex(index);
      const leg = plan.tryGetLeg(prevLegIndex);

      if (leg) {
        return leg;
      }
    }

    return null;
  });

  private readonly identTextSub = this.prevLegSub.map((leg) => {
    if (leg) {
      return leg.name ?? 'NONAME';
    }

    return '-----';
  });

  private readonly dmsFormatter = new DmsFormatter();

  private readonly coordinatesTextSub = this.prevLegSub.map((leg) => {
    if (leg && leg.calculated && leg.calculated.endLat && leg.calculated.endLon) {
      return this.dmsFormatter.getLatDmsStr(leg.calculated.endLat, false) + ' ' + this.dmsFormatter.getLonDmsStr(leg.calculated.endLon);
    }

    return '---°--.-- ----°--.--';
  });

  private readonly ataTextSub = ComputedSubject.create<PassedLegPredictions | null, string>(null, (predictions) => {
    if (predictions?.actualTimeOfArrival) {
      const simTime = this.simTimeSub.get();
      const unixDayStartMs = simTime - (simTime % (1_000 * 60 * 60 * 24));

      return this.timeFormatter(unixDayStartMs + (predictions.actualTimeOfArrival * 1_000));
    }

    return '--:--';
  });

  private readonly distTextSub = ComputedSubject.create<PassedLegPredictions | null, string>(null, (predictions) => {
    if (predictions) {
      return `${predictions.distance.toFixed(0)} NM`;
    }

    return '-----';
  });

  private readonly altTextSub = ComputedSubject.create<PassedLegPredictions | null, string>(null, (predictions) => {
    if (predictions) {
      const altitude = predictions.actualAltitude;
      const transitionAltitude = this.props.performancePlan.transitionAltitude.get();

      if (altitude !== null && altitude !== undefined && transitionAltitude !== null) {

        if (altitude >= transitionAltitude) {
          const fl = (altitude / 100).toFixed(0).padStart(3, '0');

          return `Fl${fl}`;
        } else {
          return altitude.toFixed(0);
        }
      }
    }

    return '-----';
  });

  private readonly fuelTextSub = ComputedSubject.create<PassedLegPredictions | null, string>(null, (predictions) => {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const fuelUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

    if (predictions?.actualFob) {
      return `${this.fuelFormatter(isMetric ? UnitType.POUND.convertTo(predictions.actualFob, UnitType.KILOGRAM) : predictions.actualFob)} ${fuelUnit}`;
    }

    return `---- ${fuelUnit}`;
  });

  /**
   * Handles updating the predictions
   */
  private handleUpdatePredictions(): void {
    const prevLegIndex = this.props.predictor.findPreviousPredictedLegIndex(this.props.nominalActiveLegIndexSub.get());

    const predictions = this.props.predictor.predictionsForLegIndex(prevLegIndex);

    if (predictions && predictions.kind === 'passed') {
      this.ataTextSub.set(predictions);
      this.altTextSub.set(predictions);
      this.distTextSub.set(predictions);
      this.fuelTextSub.set(predictions);
    } else {
      this.ataTextSub.set(null);
      this.distTextSub.set(null);
      this.altTextSub.set(null);
      this.fuelTextSub.set(null);
    }
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.updateSub.sub(() => this.handleUpdatePredictions());
  }

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div class="pos-report-grid-container cyan-text">
        <div>{this.identTextSub}</div>
        <div class="grid-coordinates">{this.coordinatesTextSub}</div>
        <div class="grid-indent">ATA</div>
        <div>{this.ataTextSub}</div>
        <div style="margin-left:-20px">DIST</div>
        <div class="grid-left text-right" style="margin-left:-55px;min-width:91px">{this.distTextSub}</div>
        <div class="grid-indent">ALT</div>
        <div>{this.altTextSub}</div>
        <div style="margin:0 -20px">FUEL</div>
        <div class="grid-left text-right" style="margin-left:-55px">{this.fuelTextSub}</div>
      </div>
    );
  }
}

/**
 * Props for {@link PosReportActiveOrUpcomingLeg}
 */
export interface PosReportActiveOrUpcomingLegProps extends PosReportLegSectionProps {
  /**
   * Index delta from the active leg index
   */
  indexDelta: number,

  /**
   * Whether this is for the active leg
   */
  active: boolean,
}

/**
 * POS REPORT active leg section
 */
class PosReportActiveOrUpcomingLeg extends DisplayComponent<PosReportActiveOrUpcomingLegProps> {
  private readonly timeFormatter = DateTimeFormatter.create('{HH}:{mm}', { nanString: '--:--' });
  private readonly durationFormatter = DurationFormatter.create('{m}:{ss}', UnitType.SECOND, 1, '-:--');
  private readonly fuelFormatter = NumberFormatter.create({ precision: 10, round: -1 });

  // TODO replace this with an `onUpdated` event in the predictor ?
  private readonly subs = this.props.bus.getSubscriber<ClockEvents & FlightPlannerEvents & WT21LNavDataEvents>();

  private readonly simTimeSub = ConsumerSubject.create(this.subs.on('simTime'), -1);

  private readonly nominalActiveLegIndexSub = ConsumerSubject.create(this.subs.on('lnavdata_nominal_leg_index'), -1);

  private readonly flightPlanChangeTrigger = Subject.create(0);

  private readonly activeLegSub = MappedSubject.create(([index]) => {
    if (index === -1) {
      return null;
    }

    if (this.props.planner.hasFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.props.planner.getFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX);

      const legIndex = this.props.active ? index : this.props.predictor.findNextPredictedLegIndex(index);
      const leg = plan.tryGetLeg(legIndex);

      if (leg) {
        return leg;
      }
    }

    return null;
  }, this.nominalActiveLegIndexSub, this.flightPlanChangeTrigger);

  private readonly identTextSub = this.activeLegSub.map((leg) => {
    if (leg) {
      return leg.name ?? 'NONAME';
    }

    return '-----';
  });

  private readonly dmsFormatter = new DmsFormatter();

  private readonly coordinatesTextSub = this.activeLegSub.map((leg) => {
    if (leg && leg.calculated && leg.calculated.endLat && leg.calculated.endLon) {
      return this.dmsFormatter.getLatDmsStr(leg.calculated.endLat, false) + ' ' + this.dmsFormatter.getLonDmsStr(leg.calculated.endLon);
    }

    return '---°--.-- ----°--.--';
  });

  private readonly etaTextSub = ComputedSubject.create<ActiveOrUpcomingLegPredictions | null, string>(null, (predictions) => {
    if (predictions?.estimatedTimeOfArrival) {
      const simTime = this.simTimeSub.get();
      const unixDayStartMs = simTime - (simTime % (1_000 * 60 * 60 * 24));

      return this.timeFormatter(unixDayStartMs + (predictions.estimatedTimeOfArrival * 1_000));
    }

    return '--:--';
  });

  private readonly legTimeTextSub = ComputedSubject.create<ActiveOrUpcomingLegPredictions | null, string>(null, (predictions) => {
    if (predictions?.estimatedTimeEnroute) {
      return this.durationFormatter(predictions.estimatedTimeEnroute);
    }

    return '--:--';
  });

  private readonly distTextSub = ComputedSubject.create<ActiveOrUpcomingLegPredictions | null, string>(null, (predictions) => {
    if (predictions) {
      return `${predictions.distance.toFixed(0)} NM`;
    }

    return '--- NM';
  });

  private readonly courseTextSub = this.activeLegSub.map((leg) => {
    if (leg?.calculated && leg.calculated.initialDtk) {
      return `${leg.calculated.initialDtk.toFixed(0).padStart(3, '0')}°`;
    }

    return '---°';
  });

  private readonly legDistanceTextSub = this.activeLegSub.map((leg) => {
    if (leg?.calculated && leg.calculated.distance) {
      const distance = leg.calculated.distance;
      const distanceNM = UnitType.NMILE.convertFrom(distance, UnitType.METER);

      return `${distanceNM.toFixed(0)} NM`;
    }

    return '--- NM';
  });

  private readonly fuelTextSub = ComputedSubject.create<ActiveOrUpcomingLegPredictions | null, string>(null, (predictions) => {
    const isMetric = WT21UnitsUtils.getIsMetric();
    const fuelUnit = isMetric ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

    if (predictions && predictions.fob !== null) {
      return `${this.fuelFormatter(isMetric ? UnitType.POUND.convertTo(predictions.fob, UnitType.KILOGRAM) : predictions.fob)} ${fuelUnit}`;
    }

    return `---- ${fuelUnit}`;
  });

  /**
   * Handles predictions updates for this entry
   */
  private handleUpdatePredictions(): void {
    const nominalActiveLegIndex = this.nominalActiveLegIndexSub.get();
    const legIndex = this.props.active ? nominalActiveLegIndex : this.props.predictor.findNextPredictedLegIndex(nominalActiveLegIndex);

    const prediction = this.props.predictor.predictionsForLegIndex(legIndex);

    if (prediction && prediction.kind === 'activeOrUpcoming') {
      this.etaTextSub.set(prediction);
      this.legTimeTextSub.set(prediction);
      this.distTextSub.set(prediction);
      this.fuelTextSub.set(prediction);
    } else {
      this.etaTextSub.set(null);
      this.legTimeTextSub.set(null);
      this.distTextSub.set(null);
      this.fuelTextSub.set(null);
    }
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.subs.on('fplLoaded').handle(() => this.flightPlanChangeTrigger.notify());
    this.subs.on('fplCopied').handle(() => this.flightPlanChangeTrigger.notify());

    this.props.updateSub.sub(() => this.handleUpdatePredictions());

    this.nominalActiveLegIndexSub.sub(() => this.handleUpdatePredictions());
    this.subs.on('fplLoaded').handle(() => this.handleUpdatePredictions());
    this.subs.on('fplCopied').handle(() => this.handleUpdatePredictions());
  }


  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div class={`pos-report-grid-container ${this.props.active ? 'magenta-text' : 'white-text'}`}>
        <div>{this.identTextSub}</div>
        <div class="grid-coordinates">{this.coordinatesTextSub}</div>
        <div class="grid-indent cyan-text">ETA</div>
        <div class="grid-right pos-grid-spacing1">{this.etaTextSub}</div>
        <div class="grid-indent cyan-text">LEG T</div>
        <div class="grid-left" style="padding-left:25px">{this.legTimeTextSub}</div>
        <div class="grid-indent cyan-text">DIST</div>
        <div class="grid-right pos-grid-spacing2">{this.distTextSub}</div>
        <div class="grid-indent cyan-text">CRS</div>
        <div class="grid-left" style="padding-left:25px">{this.courseTextSub}</div>
        <div class="grid-indent cyan-text">FUEL</div>
        <div class="grid-right pos-grid-spacing2">{this.fuelTextSub}</div>
        {!this.props.active && (
          <>
            <div class="grid-indent cyan-text">LEG D</div>
            <div class="grid-left" style="padding-left:25px">{this.legDistanceTextSub}</div>
          </>
        )}
      </div>
    );
  }
}
