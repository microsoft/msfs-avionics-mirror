import {
  ClockEvents, ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EventBus, FlightPlanner, FSComponent, LegType, VNavEvents, VNode
} from '@microsoft/msfs-sdk';

import './VnavPreselectBox.css';
import { WT21FmsUtils } from '@microsoft/msfs-wt21-shared';

/**
 * The properties for the VnavPreselectBox component.
 */
interface VnavPreselectBoxProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The flight planner */
  planner: FlightPlanner,
}

/**
 * The VnavPreselectBox component.
 */
export class VnavPreselectBox extends DisplayComponent<VnavPreselectBoxProps> {
  private readonly constraintAltitude = ComputedSubject.create(-1, (v): string => {
    if (v > -1) {
      return v.toFixed(0);
    } else if (v === -2) {
      return 'RWY';
    } else {
      return ' ';
    }
  });

  private readonly nextConstraintLegIndex = ConsumerSubject.create(null, -1).pause();
  private readonly nextConstraintTargetAltitude = ConsumerSubject.create(null, -1).pause();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.nextConstraintLegIndex.setConsumer(this.props.bus.getSubscriber<VNavEvents>().on('vnav_constraint_global_leg_index').whenChanged()).resume();
    this.nextConstraintTargetAltitude.setConsumer(this.props.bus.getSubscriber<VNavEvents>().on('vnav_next_constraint_altitude').whenChanged()).resume();

    // HINT: we have to schedule updating it by clock
    // because it is possible for flight plan changes not to be propagated when the LVars change
    this.props.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(2).handle(() => {
      this.updateTargetAltitude();
    });
  }

  /**
   * Updates the target altitude.
   */
  private updateTargetAltitude(): void {
    if (this.props.planner.hasFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.props.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);
      const nextConstraintLegIndex = this.nextConstraintLegIndex.get();
      const vnavWaypointLeg = plan.tryGetLeg(nextConstraintLegIndex);
      const isRunway = vnavWaypointLeg && vnavWaypointLeg.leg.fixIcao[0] === 'R' && vnavWaypointLeg.leg.type === LegType.TF;
      if (isRunway) {
        this.constraintAltitude.set(-2);
      } else {
        this.constraintAltitude.set(this.nextConstraintTargetAltitude.get());
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>{this.constraintAltitude}</div>
    );
  }
}
