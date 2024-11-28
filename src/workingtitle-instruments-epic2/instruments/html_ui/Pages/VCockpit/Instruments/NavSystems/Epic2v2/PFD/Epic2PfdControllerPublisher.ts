import { ConsumerSubject, EventBus, MappedSubject } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, Epic2PfdControlEvents, Epic2PfdControlPfdEvents, Epic2PfdControlRadioEvents, PfdControlState } from '@microsoft/msfs-epic2-shared';

import { PfdControllerSystemEvents } from './Systems/PfdControllerSystem';

/** Handles the PFD interface to the PFD controllers. */
export class Epic2PfdControllerPublisher {
  private static readonly hEventRegex = /^PFDCTRL_(\d)_(.+)$/;
  private static readonly pfdEventMap: Record<string, keyof Epic2PfdControlPfdEvents> = {
    'BARO_DEC': 'pfd_control_baro_decrement',
    'BARO_INC': 'pfd_control_baro_increment',
    'BARO_PUSH': 'pfd_control_baro_push',
    'NAV_SEL': 'pfd_control_nav_select_push',
    'NAV_PREVIEW': 'pfd_control_nav_preview_push',
    'BRG1': 'pfd_control_pointer_1_push',
    'BRG2': 'pfd_control_pointer_2_push',
    'HSI': 'pfd_control_hsi_push',
    'ET': 'pfd_control_timer_push',
    'RANGE_DEC': 'pfd_control_range_decrement',
    'RANGE_INC': 'pfd_control_range_increment',
    'COURSE_SEL_DEC': 'pfd_control_course_decrement',
    'COURSE_SEL_INC': 'pfd_control_course_increment',
    'COURSE_SEL_PUSH': 'pfd_control_course_push',
    'ADHRS': 'pfd_control_adahrs_push',
  };

  private static readonly radioEventMap: Record<string, keyof Epic2PfdControlRadioEvents> = {
    'IDENT': 'pfd_control_ident_push',
    'VFR': 'pfd_control_vfr_push',
    'DME': 'pfd_control_dme_push',
    'DETAIL': 'pfd_control_detail_push',
    'VOLUME_DEC': 'pfd_control_volume_decrement',
    'VOLUME_INC': 'pfd_control_volume_increment',
    'VOLUME_PUSH': 'pfd_control_volume_push',
    'RADIO_SEL_OUTER_INC': 'pfd_control_sel_coarse_increment',
    'RADIO_SEL_OUTER_DEC': 'pfd_control_sel_coarse_decrement',
    'RADIO_SEL_INNER_INC': 'pfd_control_sel_fine_increment',
    'RADIO_SEL_INNER_DEC': 'pfd_control_sel_fine_decrement',
    'RADIO_SEL_INNER_PUSH': 'pfd_control_sel_push',
  };
  private static readonly pfdControllerSwapEvent = 'PFD';

  private readonly onsideControllerIndex = this.duIndex === DisplayUnitIndices.PfdRight ? 2 : 1;
  private readonly offsideControllerIndex = this.duIndex === DisplayUnitIndices.PfdRight ? 1 : 2;
  private readonly offsideControllerSystemEvent: keyof PfdControllerSystemEvents = `pfd_controller_active_pfd_${this.offsideControllerIndex}`;
  private readonly onsideControllerSystemEvent: keyof PfdControllerSystemEvents = `pfd_controller_active_pfd_${this.onsideControllerIndex}`;

  private readonly sub = this.bus.getSubscriber<PfdControllerSystemEvents>();
  private readonly pfdControlPublisher = this.bus.getPublisher<Epic2PfdControlEvents>();

  private readonly onsideActivePfd = ConsumerSubject.create(this.sub.on(this.onsideControllerSystemEvent), null);
  private readonly offsideActivePfd = ConsumerSubject.create(this.sub.on(this.offsideControllerSystemEvent), null);

  private readonly activeController = MappedSubject.create(
    ([onsidePfd, offsidePfd]) => {
      if (onsidePfd === this.duIndex) {
        return this.onsideControllerIndex;
      } else if (offsidePfd === this.duIndex) {
        return this.offsideControllerIndex;
      } else {
        return null;
      }
    },
    this.onsideActivePfd,
    this.offsideActivePfd,
  );

  private readonly controlState = this.activeController.map((controllerIndex) => {
    if (controllerIndex === this.onsideControllerIndex) {
      return PfdControlState.Onside;
    } else if (controllerIndex === this.offsideControllerIndex) {
      return PfdControlState.Offside;
    } else {
      return PfdControlState.Inactive;
    }
  });

  /**
   * Constructs a new PFD controller.
   * @param bus The instrument event bus.
   * @param duIndex The display unit index for this PFD.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly duIndex: DisplayUnitIndices,
  ) {
    this.controlState.sub((v) => this.pfdControlPublisher.pub('pfd_control_state', v, false, true), true);
  }

  /**
   * Tries to handle PFD controller H events.
   * @param event The H event name.
   * @returns true if the event was a PFD controller event (no further handling necessary),
   * or false if not (event should be published to the bus).
   */
  tryHandleHEvent(event: string): boolean {
    const match = event.match(Epic2PfdControllerPublisher.hEventRegex);
    if (match === null) {
      return false;
    }

    const eventName = match[2];

    if (eventName === Epic2PfdControllerPublisher.pfdControllerSwapEvent) {
      // PfdControllerSystem handles these
      return false;
    }

    const controllerIndex = parseInt(match[1]);

    // drop events from other controllers that aren't controlling us
    if (this.activeController.get() !== controllerIndex) {
      return true;
    }

    const pfdEvent = Epic2PfdControllerPublisher.pfdEventMap[eventName];
    if (pfdEvent !== undefined) {
      this.pfdControlPublisher.pub(pfdEvent, undefined, false, false);
      this.pfdControlPublisher.pub('pfd_control_pfd_event', pfdEvent, false, false);
    }
    const radioEvent = Epic2PfdControllerPublisher.radioEventMap[eventName];
    if (radioEvent !== undefined) {
      this.pfdControlPublisher.pub(radioEvent, undefined, false, false);
      this.pfdControlPublisher.pub('pfd_control_radio_event', radioEvent, false, false);
    }

    return true;
  }
}
