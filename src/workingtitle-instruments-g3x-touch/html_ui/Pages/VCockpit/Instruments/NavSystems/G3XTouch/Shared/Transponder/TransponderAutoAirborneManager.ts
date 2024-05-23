import { AdcEvents, ConsumerValue, ControlEvents, EventBus, Subscription, XPDRMode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

/**
 * A manager that automatically switches a transponder from STBY to ALT mode in response to on-ground to in-air
 * transitions.
 */
export class TransponderAutoAirborneManager {
  private readonly publisher = this.bus.getPublisher<ControlEvents>();

  private readonly xpdrMode = ConsumerValue.create(null, XPDRMode.OFF);

  private armedMode: XPDRMode.ALT | null = null;

  private isAlive = true;
  private isInit = false;

  private isOnGroundSub?: Subscription;

  /**
   * Creates a new instance of TransponderAutoAirborneManager. The new manager is created in an un-initialized state.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes this manager. Once initialized, the manager will automatically switch transponder mode from STBY to
   * ALT in response to on-ground to in-air transitions.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('TransponderAutoAirborneManager: cannot activate a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<AdcEvents & XPDRSimVarEvents>();

    this.xpdrMode.setConsumer(sub.on('xpdr_mode_1'));

    this.isOnGroundSub = sub.on('on_ground').whenChanged().handle(this.onIsOnGroundChanged.bind(this));
  }

  /**
   * Responds to when whether the airplane is on the ground changes.
   * @param isOnGround Whether the airplane is on the ground.
   */
  private onIsOnGroundChanged(isOnGround: boolean): void {
    if (isOnGround) {
      this.armedMode = XPDRMode.ALT;
    } else {
      if (this.armedMode === XPDRMode.ALT && this.xpdrMode.get() === XPDRMode.STBY) {
        this.publisher.pub('publish_xpdr_mode_1', XPDRMode.ALT, true, false);
      }

      this.armedMode = null;
    }
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer automatically switch transponder modes.
   */
  public destroy(): void {
    this.isAlive = false;

    this.xpdrMode.destroy();
    this.isOnGroundSub?.destroy();
  }
}
