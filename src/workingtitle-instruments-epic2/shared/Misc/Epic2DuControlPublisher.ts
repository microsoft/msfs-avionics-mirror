import {
  ConsumerSubject, EventBus, HEvent, MappedSubject, MathUtils, PublishPacer, SimVarPublisher, SimVarPublisherEntry, SimVarValueType, Subject, Subscribable
} from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import {
  Epic2DuControlButtonEvents, Epic2DuControlEvents, Epic2DuControlHEvents, Epic2DuControlLocalVarEvents, Epic2DuControlLocalVars, Epic2KeyboardCharHEvents,
  Epic2KeyboardControlHEvents, Epic2KeyboardEvents, Epic2KeyboardHEventToCharMap
} from './Epic2DuControlEvents';

/** A controller for DU events. */
export class Epic2InputControlPublisher extends SimVarPublisher<Epic2DuControlLocalVarEvents> {
  private static readonly CHAR_H_EVENTS: string[] = Object.values(Epic2KeyboardCharHEvents);

  private static readonly CONTROL_EVENT_TO_BUS_EVENT_MAP:
    Record<Epic2KeyboardControlHEvents | Epic2DuControlHEvents, keyof Epic2KeyboardEvents | keyof Epic2DuControlButtonEvents> =
  {
    [Epic2KeyboardControlHEvents.Clear]: 'epic2_keyboard_clear',
    [Epic2KeyboardControlHEvents.CursorLeft]: 'epic2_keyboard_cursor_left',
    [Epic2KeyboardControlHEvents.CursorRight]: 'epic2_keyboard_cursor_right',
    [Epic2KeyboardControlHEvents.Delete]: 'epic2_keyboard_delete',
    [Epic2KeyboardControlHEvents.Enter]: 'epic2_keyboard_enter',
    [Epic2KeyboardControlHEvents.PlusMinus]: 'epic2_keyboard_plusminus',
    [Epic2DuControlHEvents.ChartVideo]: 'epic2_du_chart_video_button',
    [Epic2DuControlHEvents.Checklist]: 'epic2_du_checklist_button',
    [Epic2DuControlHEvents.Com]: 'epic2_du_com_button',
    [Epic2DuControlHEvents.Detail]: 'epic2_du_detail_button',
    [Epic2DuControlHEvents.DirTo]: 'epic2_du_dirto_button',
    [Epic2DuControlHEvents.Event]: 'epic2_du_event_button',
    [Epic2DuControlHEvents.FlapOverride]: 'epic2_du_flap_override_button',
    [Epic2DuControlHEvents.FrequencySwap]: 'epic2_du_frequency_swap_button',
    [Epic2DuControlHEvents.GlideslopeInhibit]: 'epic2_du_glideslope_inhibit_button',
    [Epic2DuControlHEvents.Info]: 'epic2_du_info_button',
    [Epic2DuControlHEvents.Nav]: 'epic2_du_nav_button',
    [Epic2DuControlHEvents.Page]: 'epic2_du_page_button',
    [Epic2DuControlHEvents.TerrainInhibit]: 'epic2_du_terrain_inhibit_button',
    [Epic2DuControlHEvents.Xpdr]: 'epic2_du_xpdr_button',
  };

  private static readonly CONTROL_H_EVENTS: string[] = Object.keys(Epic2InputControlPublisher.CONTROL_EVENT_TO_BUS_EVENT_MAP);

  private readonly selectedDu = ConsumerSubject.create(null, DisplayUnitIndices.PfdLeft);

  private readonly isThisDuSelected = this.hostDuIndex !== undefined ? MappedSubject.create(
    ([selectedDu, hostDu]) => selectedDu === hostDu,
    this.selectedDu,
    this.hostDuIndex,
  ) : Subject.create(false);

  /**
   * Ctor.
   * @param bus Instrument event bus.
   * @param hostDuIndex The host DU index.
   * @param pacer An optional pacer for the publisher.
   */
  constructor(bus: EventBus, private readonly hostDuIndex?: Subscribable<DisplayUnitIndices>, pacer?: PublishPacer<Epic2DuControlLocalVarEvents>) {
    const localVars = new Map<keyof Epic2DuControlLocalVarEvents, SimVarPublisherEntry<any>>([
      ['epic2_selected_display_unit', { name: Epic2DuControlLocalVars.SelectedDisplayUnit, type: SimVarValueType.Number, map: (v) => MathUtils.clamp(v, DisplayUnitIndices.PfdLeft, DisplayUnitIndices.PfdRight) }],
      ['epic2_mfd_swap', { name: Epic2DuControlLocalVars.MfdSwap, type: SimVarValueType.Bool }],
    ]);
    super(localVars, bus, pacer);
  }

  /** @inheritdoc */
  public startPublish(): void {
    const sub = this.bus.getSubscriber<Epic2DuControlEvents & HEvent>();
    const pub = this.bus.getPublisher<Epic2DuControlEvents>();

    sub.on('hEvent').handle((ev) => {
      if (this.isThisDuSelected.get()) {
        if (Epic2InputControlPublisher.isKeyboardCharEvent(ev)) {
          const char = Epic2KeyboardHEventToCharMap[ev];
          pub.pub('epic2_keyboard_char', char);
        } else if (Epic2InputControlPublisher.isControlHEvent(ev)) {
          const busEvent = Epic2InputControlPublisher.CONTROL_EVENT_TO_BUS_EVENT_MAP[ev];
          pub.pub(busEvent, null);
        }
      }
    });

    this.isThisDuSelected.sub((v) => pub.pub('epic2_host_display_unit_selected', v, false, true));

    this.selectedDu.setConsumer(sub.on('epic2_selected_display_unit'));

    super.startPublish();
  }

  /**
   * Checks if an event name is a keyboard event.
   * @param ev The event name to check.
   * @returns true when the event is a keyboard event.
   */
  private static isKeyboardCharEvent(ev: string): ev is Epic2KeyboardCharHEvents {
    return Epic2InputControlPublisher.CHAR_H_EVENTS.includes(ev);
  }

  /**
   * Checks if an event name is a DU control event.
   * @param ev The event name to check.
   * @returns true when the event is a DU control event.
   */
  private static isControlHEvent(ev: string): ev is Epic2DuControlHEvents {
    return Epic2InputControlPublisher.CONTROL_H_EVENTS.includes(ev);
  }
}
