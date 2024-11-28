import { EventBus, HEvent, NavSourceType, SimVarValueType, Subscription } from '@microsoft/msfs-sdk';

import { G3000NavIndicator, PfdIndex } from '@microsoft/msfs-wtg3000-common';

/**
 * Handles course knob inputs for a PFD to change the selected course of the PFD's active NAV source.
 */
export class PfdCourseKnobInputHandler {
  private static readonly KEY_PREFIX_NAV1 = 'K:VOR1_OBI';
  private static readonly KEY_PREFIX_NAV1_SET = 'K:VOR1';
  private static readonly KEY_PREFIX_NAV2 = 'K:VOR2_OBI';
  private static readonly KEY_PREFIX_NAV2_SET = 'K:VOR2';
  private static readonly KEY_PREFIX_GPS = 'K:GPS_OBS';

  private readonly hEventPrefix = `AS3000_PFD_${this.index}_CRS_`;

  private isAlive = true;
  private isInit = false;

  private hEventSub?: Subscription;

  /**
   * Constructor.
   * @param index The index of this handler's parent PFD.
   * @param bus The event bus.
   * @param activeNavIndicator The active NAV indicator for this handler's parent PFD.
   */
  public constructor(
    public readonly index: PfdIndex,
    private readonly bus: EventBus,
    private readonly activeNavIndicator: G3000NavIndicator
  ) {
  }

  /**
   * Initializes this handler. Once this handler is initialized, it will change the selected course of the active
   * NAV source in response to course knob input events.
   * @throws Error if this handler has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('PfdCourseKnobInputHandler: cannot initialize a dead handler');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<HEvent>();

    this.hEventSub = sub.on('hEvent').handle(hEvent => {
      if (hEvent.startsWith(this.hEventPrefix)) {
        this.handleCourseKnobInput(hEvent.substring(17));
      }
    });
  }

  /**
   * Handles a course knob input.
   * @param input The key of the input to handle, with the prefix removed.
   */
  private handleCourseKnobInput(input: string): void {
    const source = this.activeNavIndicator.source.get();

    if (source === null) {
      return;
    }

    let keyPrefix: string | undefined;
    switch (source.getType()) {
      case NavSourceType.Nav:
        keyPrefix = source.index === 1 ? PfdCourseKnobInputHandler.KEY_PREFIX_NAV1 : PfdCourseKnobInputHandler.KEY_PREFIX_NAV2;
        break;
      case NavSourceType.Gps:
        keyPrefix = PfdCourseKnobInputHandler.KEY_PREFIX_GPS;
        break;
    }

    if (keyPrefix === undefined) {
      return;
    }

    switch (input) {
      case 'INC':
      case 'DEC':
        SimVar.SetSimVarValue(`${keyPrefix}_${input}`, SimVarValueType.Number, 1);
        break;
      case 'PUSH': {
        const toSet = this.activeNavIndicator.isLocalizer.get()
          ? this.activeNavIndicator.localizerCourse.get()
          : this.activeNavIndicator.bearing.get();

        if (toSet !== null) {
          if (source.getType() === NavSourceType.Nav) {
            keyPrefix = source.index === 1 ? PfdCourseKnobInputHandler.KEY_PREFIX_NAV1_SET : PfdCourseKnobInputHandler.KEY_PREFIX_NAV2_SET;
          }
          SimVar.SetSimVarValue(`${keyPrefix}_SET`, SimVarValueType.Number, Math.round(toSet));
        }
        break;
      }
    }
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.isAlive = false;

    this.hEventSub?.destroy();
  }
}