import { APTogaPitchDirector, ConsumerValue, EventBus } from '@microsoft/msfs-sdk';

import { AirGroundDataProviderEvents } from '../../Instruments';

/**
 * The GA mode director targeting:
 * - 9° up in the air
 * - 5° initial pitch on the ground, and transitioning to 9° as the pilot pitches up
 */
export class Epic2GaDirector extends APTogaPitchDirector {
  private static readonly GROUND_PITCH = 5;
  private static readonly MAX_PITCH = 9;

  private readonly isOnGround = ConsumerValue.create(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), false).pause();

  private epic2PitchTarget: number = 0;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus) {
    super(Epic2GaDirector.MAX_PITCH);
  }

  /** @inheritdoc */
  public override activate(): void {
    super.activate();

    this.isOnGround.resume();

    if (this.isOnGround.get()) {
      this.epic2PitchTarget = Epic2GaDirector.GROUND_PITCH;
    } else {
      this.epic2PitchTarget = Epic2GaDirector.MAX_PITCH;
    }

    this.setPitch && this.setPitch(-this.epic2PitchTarget);
  }

  /** @inheritdoc */
  public override deactivate(): void {
    super.deactivate();

    this.isOnGround.pause();
  }

  /** @inheritdoc */
  public override update(): void {
    super.update();

    // push the pitch target up, letting the normal AP servo control the rate
    if (this.epic2PitchTarget < Epic2GaDirector.MAX_PITCH && !this.isOnGround.get()) {
      this.epic2PitchTarget = Epic2GaDirector.MAX_PITCH;
      this.setPitch && this.setPitch(-this.epic2PitchTarget);
    }
  }
}
