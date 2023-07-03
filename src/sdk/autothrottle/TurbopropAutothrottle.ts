import { EventBus } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { ThrottleLeverManager } from '../fadec/ThrottleLeverManager';
import { Subscribable } from '../sub/Subscribable';
import { AbstractAutothrottle, AutothrottleThrottle, AutothrottleThrottleInfo } from './AbstractAutothrottle';

/**
 * An autothrottle system for turboprop engines.
 */
export class TurbopropAutothrottle extends AbstractAutothrottle {
  /** @inheritdoc */
  protected createThrottle(
    bus: EventBus,
    info: AutothrottleThrottleInfo,
    servoSpeed: number,
    powerSmoothingConstant: number,
    powerSmoothingVelocityConstant: number | undefined,
    powerLookahead: Subscribable<number>,
    powerLookaheadSmoothingConstant: number | undefined,
    powerLookaheadSmoothingVelocityConstant: number | undefined,
    throttleLeverManager: ThrottleLeverManager | undefined
  ): AutothrottleThrottle {
    return new TurbopropAutothrottleThrottle(
      bus,
      info,
      servoSpeed,
      powerSmoothingConstant, powerSmoothingVelocityConstant,
      powerLookahead,
      powerLookaheadSmoothingConstant, powerLookaheadSmoothingVelocityConstant,
      throttleLeverManager
    );
  }
}

/**
 * An autothrottle throttle for turboprop engines.
 */
class TurbopropAutothrottleThrottle extends AutothrottleThrottle {
  private readonly torqueSimVar: string;

  /** @inheritdoc */
  public constructor(
    bus: EventBus,
    info: AutothrottleThrottleInfo,
    servoSpeed: number,
    powerSmoothingConstant: number,
    powerSmoothingVelocityConstant: number | undefined,
    powerLookahead: Subscribable<number>,
    powerLookaheadSmoothingConstant: number | undefined,
    powerLookaheadSmoothingVelocityConstant: number | undefined,
    throttleLeverManager?: ThrottleLeverManager
  ) {
    super(
      bus,
      info,
      servoSpeed,
      powerSmoothingConstant, powerSmoothingVelocityConstant,
      powerLookahead,
      powerLookaheadSmoothingConstant, powerLookaheadSmoothingVelocityConstant,
      throttleLeverManager
    );

    this.torqueSimVar = `TURB ENG MAX TORQUE PERCENT:${this.index}`;
  }

  /** @inheritdoc */
  protected getPower(): number {
    return SimVar.GetSimVarValue(this.torqueSimVar, SimVarValueType.Percent);
  }
}