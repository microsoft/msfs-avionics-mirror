import {
  ConsumerSubject, FacilityType, FlightPlanCopiedEvent, FlightPlanIndicationEvent, FlightPlanOriginDestEvent,
  FlightPlanPredictor, FlightPlanProcedureDetailsEvent, FmcScreenPluginContext, OriginDestChangeType,
  PerformancePlanRepository, registerPlugin, Subject,
} from '@microsoft/msfs-sdk';

import { WT21FlightPlanPredictorConfiguration, WT21FmsUtils, WT21LNavDataEvents } from '@microsoft/msfs-wt21-shared';

import {
  FmcMiscEvents, PerfInitPage, PerfMenuPage, WT21FmcAvionicsPlugin, WT21FmcEvents, WT21FmcPage,
} from '@microsoft/msfs-wt21-fmc';

import { CJ4PerfMenuPageExtension } from './Pages/CJ4PerfMenuPageExtension';
import { CJ4TakeoffRefPage } from './Pages/CJ4TakeoffRefPage';
import { CJ4ApproachRefPage } from './Pages/CJ4ApproachRefPage';
import { CJ4_PERFORMANCE_PLAN_DEFINITIONS, CJ4PerformancePlan } from '../Shared/Performance/CJ4PerformancePlan';
import { ApproachPerformanceManager, TakeoffPerformanceManager } from '../Shared/Performance/PerformanceCalculators';
import { CJ4PerfInitPageExtension } from './Pages/CJ4PerfInitPageExtension';

/**
 * CJ4 FMC plugin
 */
export class CJ4FmcPlugin extends WT21FmcAvionicsPlugin {
  public readonly cj4PerformancePlanRepository = new PerformancePlanRepository<CJ4PerformancePlan>(
    'wt.cj4.wt21perf',
    this.binder.bus,
    this.binder.flightPlanner,
    CJ4_PERFORMANCE_PLAN_DEFINITIONS,
  );

  public readonly performancePlanProxy = this.cj4PerformancePlanRepository.createPerformancePlanProxy({
    /** @inheritDoc */
    onBeforeEdit: (property) => {
      if (property.differentiateBetweenFlightPlans && this.binder.fms.hasFlightPlan(WT21FmsUtils.PRIMARY_MOD_PLAN_INDEX)) {
        // Create a MOD flight plan
        this.binder.fms.getModFlightPlan();
      }
    },
    /** @inheritDoc */
    onAfterEdit: (property, newValue) => {
      if (!property.differentiateBetweenFlightPlans) {
        // We edit both plans, since we do not want to involve an EXEC to confirm a value.
        // This makes sure that if a value is modified while a MOD plan exists, we modify it, making a copy
        // from ACT -> MOD not reset the value.
        this.cj4PerformancePlanRepository.triggerSync(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

        const modPerfPlan = this.cj4PerformancePlanRepository.forFlightPlanIndex(WT21FmsUtils.PRIMARY_MOD_PLAN_INDEX);

        if (modPerfPlan) {
          modPerfPlan[property.key].set(newValue);

          this.cj4PerformancePlanRepository.triggerSync(WT21FmsUtils.PRIMARY_MOD_PLAN_INDEX);
        }
      }
    },
  });

  private readonly nominalActiveLegSubject = ConsumerSubject.create(
    this.binder.bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_nominal_leg_index'),
    -1,
  );

  private readonly flightPlanPredictor = new FlightPlanPredictor(
    this.binder.bus,
    this.binder.flightPlanner,
    Subject.create(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX),
    this.nominalActiveLegSubject,
    WT21FlightPlanPredictorConfiguration,
  );

  private readonly takeoffPerformanceManager = new TakeoffPerformanceManager(
    this.binder.bus,
    this.binder.fms.basePerformanceManager,
    this.performancePlanProxy,
    this.binder.isPrimaryInstrument,
  );

  private readonly approachPerformanceManager = new ApproachPerformanceManager(
    this.binder.bus,
    this.binder.fms,
    this.binder.fms.basePerformanceManager,
    this.performancePlanProxy,
    this.flightPlanPredictor,
  );

  /** @inheritdoc */
  public onInstalled(): void {
    if (this.binder.isPrimaryInstrument) {
      this.setupEventListeners();
    }
  }

  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    this.binder.bus.getSubscriber<WT21FmcEvents>().on(FmcMiscEvents.BTN_EXEC).handle(() => this.handleExecPressed());
    this.binder.flightPlanner.onEvent('fplLoaded').handle(() => this.syncFlightPlanToPerformancePlan());
    this.binder.flightPlanner.onEvent('fplCreated').handle(this.applyCreationToPerformancePlans);
    this.binder.flightPlanner.onEvent('fplCopied').handle(this.applyCopyToPerformancePlans);
    this.binder.flightPlanner.onEvent('fplOriginDestChanged').handle(this.applyOriginDestOrProcedureDetailChangedToPerformancePlans);
    this.binder.flightPlanner.onEvent('fplProcDetailsChanged').handle(this.applyOriginDestOrProcedureDetailChangedToPerformancePlans);
  }

  /**
   * Handles the EXEC button being pressed
   */
  private handleExecPressed(): void {
    if (this.binder.fms.planInMod.get()) {
      // make sure ACT performance plan has new values
      this.syncFlightPlanToPerformancePlan();

      // sync ACT performance plan
      this.cj4PerformancePlanRepository.triggerSync(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);
    }
  }

  /**
   * Syncs the primary flight plan data to the relevant performance plan values
   */
  private syncFlightPlanToPerformancePlan(): void {
    if (this.cj4PerformancePlanRepository.has(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.binder.fms.getPrimaryFlightPlan();

      this.performancePlanProxy.takeoffAirportIcao.set(plan.originAirport ?? null);
      this.performancePlanProxy.takeoffRunway.set(plan.procedureDetails.originRunway ?? null);

      this.performancePlanProxy.approachAirportIcao.set(plan.destinationAirport ?? null);
      this.performancePlanProxy.approachRunway.set(plan.procedureDetails.destinationRunway ?? null);
    }
  }

  /**
   * Applies flight plan copy events to the performance plan repository
   *
   * @param ev plan copied event
   */
  private applyCreationToPerformancePlans = (ev: FlightPlanIndicationEvent): void => {
    if (!this.cj4PerformancePlanRepository.hasAnyPlan()) {
      this.cj4PerformancePlanRepository.forFlightPlanIndex(ev.planIndex);
    }
  };

  /**
   * Applies flight plan copy events to the performance plan repository
   *
   * @param ev plan copied event
   */
  private applyCopyToPerformancePlans = (ev: FlightPlanCopiedEvent): void => {
    if (!this.cj4PerformancePlanRepository.has(ev.planIndex)) {
      this.cj4PerformancePlanRepository.create(ev.planIndex);
    }

    this.cj4PerformancePlanRepository.copy(ev.planIndex, ev.targetPlanIndex);
  };

  private applyOriginDestOrProcedureDetailChangedToPerformancePlans = async (ev: FlightPlanOriginDestEvent | FlightPlanProcedureDetailsEvent): Promise<void> => {
    if ('type' in ev && (ev.type === OriginDestChangeType.OriginAdded || ev.type === OriginDestChangeType.OriginRemoved)) {
      this.cj4PerformancePlanRepository.copy(PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX, ev.planIndex);
    }

    const plan = this.binder.flightPlanner.getFlightPlan(ev.planIndex);
    const perfPlan = this.cj4PerformancePlanRepository.forFlightPlanIndex(ev.planIndex);

    if (plan.originAirport) {
      perfPlan.takeoffAirportIcao.set(plan.originAirport);

      const originAirport = await this.binder.fms.facLoader.getFacility(FacilityType.Airport, plan.originAirport);

      const originRunway = plan.procedureDetails.originRunway;

      if (originRunway && originAirport.runways[originRunway.parentRunwayIndex]) {
        perfPlan.takeoffRunway.set(originRunway);
      } else {
        perfPlan.takeoffRunway.set(null);
      }
    } else {
      perfPlan.takeoffAirportIcao.set(null);
      perfPlan.takeoffRunway.set(null);
    }

    if (plan.destinationAirport) {
      perfPlan.approachAirportIcao.set(plan.destinationAirport);

      const destinationAirport = await this.binder.fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);

      const destinationRunway = plan.procedureDetails.destinationRunway;

      if (destinationRunway && destinationAirport.runways[destinationRunway.parentRunwayIndex]) {
        perfPlan.approachRunway.set(destinationRunway);
      } else {
        perfPlan.approachRunway.set(null);
      }
    } else {
      perfPlan.approachAirportIcao.set(null);
      perfPlan.approachRunway.set(null);
    }
  };

  /** @inheritDoc */
  public override registerFmcExtensions(context: FmcScreenPluginContext<WT21FmcPage<any>, WT21FmcEvents>): void {
    context.attachPageExtension(PerfMenuPage, CJ4PerfMenuPageExtension);
    context.attachPageExtension(PerfInitPage, CJ4PerfInitPageExtension); // TODO fix attachPageExtension typings

    context.addPluginPageRoute(
      '/cj4/takeoff-ref',
      CJ4TakeoffRefPage,
      undefined,
      {
        fms: this.binder.fms,
        cj4PerformancePlanProxy: this.performancePlanProxy,
        takeoffPerformanceManager: this.takeoffPerformanceManager,
      },
    );
    context.addPluginPageRoute(
      '/cj4/approach-ref',
      CJ4ApproachRefPage,
      undefined,
      {
        fms: this.binder.fms,
        performancePlanProxy: this.performancePlanProxy,
        approachPerformanceManager: this.approachPerformanceManager,
      },
    );
  }
}

registerPlugin(CJ4FmcPlugin);
