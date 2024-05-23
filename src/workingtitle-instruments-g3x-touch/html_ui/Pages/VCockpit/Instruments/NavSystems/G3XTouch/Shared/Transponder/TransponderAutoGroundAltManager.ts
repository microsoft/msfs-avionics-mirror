import { AdcEvents, ConsumerSubject, ControlEvents, EventBus, XPDRMode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

import { G3XTransponderEvents } from './G3XTransponderEvents';

/**
 * Configuration options for {@link TransponderAutoGroundAltManager}.
 */
export type TransponderAutoGroundAltManagerOptions = {
  /**
   * Whether to strictly enforce the GROUND/ALT mode state of the transponder. If `true`, then the transponder will not
   * allowed to be in GROUND mode when in the air or in ALT mode when on the ground. If `false`, then the transponder
   * will switch from GROUND to ALT mode when a on-ground to in-air transition is detected and from ALT to GROUND when
   * the opposite transition is detected, but it is otherwise free to be in GROUND or ALT mode regardless of whether
   * the airplane is on the ground. Defaults to `false`.
   */
  enforceModes?: boolean;
};

/**
 * A manager that automatically switches a transponder between GROUND and ALT modes in response to on-ground/in-air
 * transitions.
 */
export class TransponderAutoGroundAltManager {
  private readonly publisher = this.bus.getPublisher<ControlEvents & G3XTransponderEvents>();

  private readonly enforceModes: boolean;

  private readonly isOnGround = ConsumerSubject.create(null, false);
  private readonly xpdrMode = ConsumerSubject.create(null, XPDRMode.OFF);

  private armedMode: XPDRMode.GROUND | XPDRMode.ALT | null = null;

  private isAlive = true;
  private isInit = false;

  /**
   * Creates a new instance of TransponderAutoGroundManager. The new manager is created in an un-initialized state.
   * @param bus The event bus.
   * @param options Options with which to configure the manager.
   */
  public constructor(private readonly bus: EventBus, options?: Readonly<TransponderAutoGroundAltManagerOptions>) {
    this.enforceModes = options?.enforceModes ?? false;
  }

  /**
   * Initializes this manager. Once initialized, the manager will automatically switch transponder modes between GROUND
   * and ALT.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('TransponderAutoGroundAltManager: cannot activate a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<AdcEvents & XPDRSimVarEvents>();

    this.isOnGround.setConsumer(sub.on('on_ground'));
    this.xpdrMode.setConsumer(sub.on('xpdr_mode_1'));

    this.isOnGround.sub(this.publishOnGround.bind(this), true);

    if (this.enforceModes) {
      const doEnforceModes = this.doEnforceModes.bind(this);
      this.isOnGround.sub(doEnforceModes);
      this.xpdrMode.sub(doEnforceModes);
      doEnforceModes();
    } else {
      this.isOnGround.sub(this.tryAutoSwitch.bind(this), true);
    }
  }

  /**
   * Responds to when whether the airplane is on the ground changes.
   * @param isOnGround Whether the airplane is on the ground.
   */
  private publishOnGround(isOnGround: boolean): void {
    this.publisher.pub('g3x_xpdr_on_ground_1', isOnGround, true, true);
  }

  /**
   * Attempts to switch the transponder mode to GROUND or ALT in response to a transition between on-ground/in-air.
   * @param isOnGround Whether the airplane is on the ground.
   */
  private tryAutoSwitch(isOnGround: boolean): void {
    if (isOnGround) {
      if (this.armedMode === XPDRMode.GROUND && this.xpdrMode.get() === XPDRMode.ALT) {
        this.publisher.pub('publish_xpdr_mode_1', XPDRMode.GROUND, true, false);
      }

      this.armedMode = XPDRMode.ALT;
    } else {
      if (this.armedMode === XPDRMode.ALT && this.xpdrMode.get() === XPDRMode.GROUND) {
        this.publisher.pub('publish_xpdr_mode_1', XPDRMode.ALT, true, false);
      }

      this.armedMode = XPDRMode.GROUND;
    }
  }

  /**
   * Enforces the correct transponder GROUND/ALT mode state. If the current transponder mode is GROUND and the airplane
   * is in the air, then the transponder mode will be changed to ALT. If the current transponder mode is ALT and the
   * airplane is on the ground, then the transponder mode will be changed to GROUND.
   */
  private doEnforceModes(): void {
    switch (this.xpdrMode.get()) {
      case XPDRMode.GROUND:
        if (!this.isOnGround.get()) {
          this.publisher.pub('publish_xpdr_mode_1', XPDRMode.ALT, true, false);
        }
        break;
      case XPDRMode.ALT:
        if (this.isOnGround.get()) {
          this.publisher.pub('publish_xpdr_mode_1', XPDRMode.GROUND, true, false);
        }
        break;
    }
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer automatically switch transponder modes.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();
    this.xpdrMode.destroy();
  }
}
