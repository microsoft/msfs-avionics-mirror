import { AdcEvents, ClockEvents, ConsumerSubject, EventBus, SpeedUnit, VNavPathCalculator } from '@microsoft/msfs-sdk';
import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { FMS_MESSAGE_ID } from '../../Shared/MessageSystem/MessageDefinitions';
import { MessageService } from '../../Shared/MessageSystem/MessageService';
import { WT21LNavDataEvents } from './WT21LNavDataEvents';
import { WT21SpeedConstraintStore } from './WT21SpeedConstraintStore';

const CHECK_SPEED_IAS_TOLERANCE = 20;
const CHECK_SPEED_MACH_TOLERANCE = 0.03;

/**
 * A manager for WT21 speed messages
 */
export class WT21SpeedMessagesManager {
  private readonly sub = this.bus.getSubscriber<AdcEvents & ClockEvents & WT21LNavDataEvents>();

  private readonly currentSpeed = ConsumerSubject.create(this.sub.on('ias').whenChanged(), -1);
  private readonly currentMach = ConsumerSubject.create(this.sub.on('mach_number').whenChanged(), -1);

  private readonly nominalLegIndex = ConsumerSubject.create(this.sub.on('lnavdata_nominal_leg_index').whenChanged(), -1);

  private constraintPreviouslyMet = true;

  /** @inheritDoc */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: WT21Fms,
    private readonly messageService: MessageService,
    private readonly speedConstraintStore: WT21SpeedConstraintStore,
    private readonly vnavPathCalculator: VNavPathCalculator,
  ) {
    this.sub.on('realTime').whenChangedBy(5_000).handle(this.update.bind(this));
  }

  /**
   * Updates the speed messages
   */
  private update(): void {
    if (this.fms.hasPrimaryFlightPlan()) {
      const activeLegIndex = this.nominalLegIndex.get();

      if (activeLegIndex > -1) {
        const flightPhase = this.vnavPathCalculator.getFlightPhase(WT21Fms.PRIMARY_ACT_PLAN_INDEX);
        const effectiveConstraint = this.speedConstraintStore.getCurrentSpeedConstraint(activeLegIndex, flightPhase);

        if (effectiveConstraint) {
          const currentSpeed = this.currentSpeed.get();
          const currentMach = this.currentMach.get();

          if (currentSpeed > -1 && currentMach > -1) {
            const currentFilteredIas = Math.round(this.currentSpeed.get() / 5) * 5;
            const currentFilteredMach = Math.round(this.currentMach.get() / 0.01) * 0.01;

            const constraintSpeed = effectiveConstraint.speedConstraint.speed;
            const constraintIsMach = effectiveConstraint.speedConstraint.speedUnit === SpeedUnit.MACH;

            const delta = (constraintIsMach ? currentFilteredMach : currentFilteredIas) - constraintSpeed;

            const constraintMet = delta <= (constraintIsMach ? CHECK_SPEED_MACH_TOLERANCE : CHECK_SPEED_IAS_TOLERANCE);

            if (!constraintMet && this.constraintPreviouslyMet) {
              this.constraintPreviouslyMet = constraintMet;
              this.messageService.post(FMS_MESSAGE_ID.CHECK_SPEED);
            } else if (constraintMet && !this.constraintPreviouslyMet) {
              this.constraintPreviouslyMet = constraintMet;
              this.messageService.clear(FMS_MESSAGE_ID.CHECK_SPEED);
            }
          }
        } else if (!this.constraintPreviouslyMet) {
          this.constraintPreviouslyMet = true;
          this.messageService.clear(FMS_MESSAGE_ID.CHECK_SPEED);
        }

        // TODO hold condition - need to improve the hold info situation in flight plan / sync
      }
    }
  }
}