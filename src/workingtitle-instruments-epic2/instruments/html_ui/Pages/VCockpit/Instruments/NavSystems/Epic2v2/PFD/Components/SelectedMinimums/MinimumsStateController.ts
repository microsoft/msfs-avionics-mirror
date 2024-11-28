import { ConsumerSubject, EventBus, HEvent, MathUtils, MinimumsControlEvents, MinimumsEvents, MinimumsMode } from '@microsoft/msfs-sdk';

import { CockpitUserSettings, Epic2ControlEvents } from '@microsoft/msfs-epic2-shared';

/**
 * Type of a single MinimumsControlEvent.
 */
type MinimumsControlEvent = keyof MinimumsControlEvents;

const MINIMUMS_MODE_TO_EVENT_TOPIC: Record<MinimumsMode.BARO | MinimumsMode.RA, MinimumsControlEvent> = {
  [MinimumsMode.BARO]: 'set_decision_altitude_feet',
  [MinimumsMode.RA]: 'set_decision_height_feet',
};

/**
 * A controller that listens to H Events sent for Minimums Indications.
 * Sends Key Events to MinimumsManager.
 */
export class MinimumsStateController {
  public static readonly BARO_INITIAL_VALUE = 0;
  public static readonly BARO_MIN = 10;
  public static readonly BARO_MAX = 16000;
  public static readonly RA_INITIAL_VALUE = 0;
  public static readonly RA_MIN = 10;
  public static readonly RA_MAX = 2500;

  private lastTimeKnobUsed: number | null;
  private knobHits: number;
  private knobIncrementValue: number;
  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.bus);
  private readonly minsPub = this.bus.getPublisher<MinimumsEvents>();
  private readonly alertSub = this.bus.getSubscriber<Epic2ControlEvents>();
  private readonly baroMinimumsSetting = this.cockpitUserSettings.getSetting('decisionAltitudeFeet');
  private readonly radioMinimumsSetting = this.cockpitUserSettings.getSetting('decisionHeightFeet');
  private readonly minimumsModeSetting = this.cockpitUserSettings.getSetting('minimumsMode');

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(
    private readonly bus: EventBus
  ) {
    this.lastTimeKnobUsed = null;
    this.knobHits = 0;
    this.knobIncrementValue = 10;
    this.init();
  }

  /**
   * Initializes this controller. Once initialized, this will continuously listen to H Events that interact with the minimums,
   * and send MinimumsControllerEvent-s to MinimumsManager until destroyed.
   */
  private init(): void {
    const hEventSub = this.bus.getSubscriber<HEvent>();
    const minsSub = this.bus.getSubscriber<MinimumsEvents>();

    const decisionAltitudeSub = ConsumerSubject.create(minsSub.on('decision_altitude_feet').whenChanged(), MinimumsStateController.BARO_INITIAL_VALUE);
    const decisionHeightSub = ConsumerSubject.create(minsSub.on('decision_height_feet').whenChanged(), MinimumsStateController.RA_INITIAL_VALUE);

    decisionAltitudeSub.sub((da) => {
      this.cockpitUserSettings.getSetting('decisionAltitudeFeet').set(da);
    }, true);

    decisionHeightSub.sub((dh) => {
      this.cockpitUserSettings.getSetting('decisionHeightFeet').set(dh);
    }, true);

    hEventSub.on('hEvent').handle((hevent) => {
      switch (hevent) {
        case 'MINIMUMS_INC':
          this.handleMinsChangeEvent(true);
          break;
        case 'MINIMUMS_DEC':
          this.handleMinsChangeEvent(false);
          break;
        case 'MINIMUMS_PRESS':
          this.handleMinsPressEvent();
          break;
      }
    });

    this.minsPub.pub(MINIMUMS_MODE_TO_EVENT_TOPIC[MinimumsMode.BARO], this.baroMinimumsSetting.get(), true);
    this.minsPub.pub(MINIMUMS_MODE_TO_EVENT_TOPIC[MinimumsMode.RA], this.radioMinimumsSetting.get(), true);

    this.minimumsModeSetting.sub(mode => {
      // Re-sync minimums value after mode is changed
      const minimumsValue = mode === MinimumsMode.RA ? this.radioMinimumsSetting : this.baroMinimumsSetting;
      this.minsPub.pub(MINIMUMS_MODE_TO_EVENT_TOPIC[mode], minimumsValue.get());
    }, true);
  }

  /**
   * Handles the minimums increase and decrease events.
   * @param isIncrease Whether the minimums should be increased or decreased.
   */
  private handleMinsChangeEvent(isIncrease: boolean): void {

    this.adjustKnobVelocity();

    const direction = isIncrease ? 'up' as const : 'down' as const;

    const mode = this.minimumsModeSetting.get();

    const minValue = mode === MinimumsMode.RA
      ? MinimumsStateController.RA_MIN
      : MinimumsStateController.BARO_MIN;

    const currentValue = mode === MinimumsMode.RA
      ? this.radioMinimumsSetting.get()
      : this.baroMinimumsSetting.get();


    const maxValue = mode === MinimumsMode.RA
      ? MinimumsStateController.RA_MAX
      : MinimumsStateController.BARO_MAX;

    /**
     * Prevents default values of RA and BARO from jumping 100
     * instead of 10 on first scroll up or down
     * @returns number result of scrolling
     */
    const nextMinimumsValue = (): number => {
      const isDefaultValue = (mode === MinimumsMode.BARO && currentValue === 2000) || (mode === MinimumsMode.RA && currentValue === 200);
      const incrementValue = isDefaultValue ? 1 : this.knobIncrementValue;

      return MathUtils.clamp(currentValue + incrementValue * (direction === 'up' ? 10 : -10), minValue, maxValue);
    };

    this.minsPub.pub(MINIMUMS_MODE_TO_EVENT_TOPIC[mode], nextMinimumsValue());
  }

  /**
   * Toggle between BARO and RA on knob press
   */
  private handleMinsPressEvent(): void {
    if (this.minimumsModeSetting.get() === MinimumsMode.BARO) {
      this.minimumsModeSetting.set(MinimumsMode.RA);
    } else {
      this.minimumsModeSetting.set(MinimumsMode.BARO);
    }
  }

  /**
   * Increase knob velocity according to frequency of use.
   */
  private adjustKnobVelocity(): void {
    if (!this.lastTimeKnobUsed) {
      this.lastTimeKnobUsed = Date.now();
    } else {
      if (Date.now() - this.lastTimeKnobUsed < 300) {
        if (this.knobHits < 5) {
          this.knobIncrementValue = 1;
        } else if (this.knobHits <= 10) {
          this.knobIncrementValue = 10;
        } else {
          this.knobIncrementValue = 100;
        }
        this.knobHits++;
      } else {
        this.knobIncrementValue = 1;
        this.knobHits = 0;
      }
      this.lastTimeKnobUsed = Date.now();
    }
  }
}
