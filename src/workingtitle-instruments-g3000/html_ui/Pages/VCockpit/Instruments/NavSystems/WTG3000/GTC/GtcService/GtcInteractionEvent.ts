import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

enum GtcButtonBarEvent {
  ButtonBarUpPressed = 'ButtonBarUpPressed',
  ButtonBarDownPressed = 'ButtonBarDownPressed',
  ButtonBarEnterPressed = 'ButtonBarEnterPressed',
  ButtonBarCancelPressed = 'ButtonBarCancelPressed',
}

export enum GtcHardwareControlEvent {
  InnerKnobInc = 'InnerKnobInc',
  InnerKnobDec = 'InnerKnobDec',
  OuterKnobInc = 'OuterKnobInc',
  OuterKnobDec = 'OuterKnobDec',
  InnerKnobPush = 'InnerKnobPush',
  InnerKnobPushLong = 'InnerKnobPushLong',
  SoftKey1 = 'SoftKey1',
  SoftKey2 = 'SoftKey2',
  SoftKey3 = 'SoftKey3',
  CenterKnobDec = 'CenterKnobDec',
  CenterKnobInc = 'CenterKnobInc',
  CenterKnobPush = 'CenterKnobPush',
  MapKnobDec = 'MapKnobDec',
  MapKnobInc = 'MapKnobInc',
  MapKnobPush = 'MapKnobPush',
  JoystickUp = 'JoystickUp',
  JoystickDown = 'JoystickDown',
  JoystickLeft = 'JoystickLeft',
  JoystickRight = 'JoystickRight',
}

export const GtcInteractionEvent = { ...GtcButtonBarEvent, ...GtcHardwareControlEvent };
/** An interaction event targeting the GTC, like a GTC button or knob press/turn, or a button bar button press. */
export type GtcInteractionEvent = typeof GtcInteractionEvent[keyof typeof GtcInteractionEvent];

/** Something that can handle a GtcInteractionEvent. */
export interface GtcInteractionHandler {
  /**
   * Handles GtcInteractionEvents.
   * @param event The event.
   * @returns Whether the event was handled or not.
   */
  onGtcInteractionEvent(event: GtcInteractionEvent): boolean
}

/** Collection of function for working with GtcInteractionEvents. */
export class GtcInteractionEventUtils {
  private static readonly HORIZONTAL_H_EVENT_MAP: Partial<Record<string, GtcHardwareControlEvent>> = {
    TopKnob_Small_INC: GtcHardwareControlEvent.InnerKnobInc,
    TopKnob_Small_DEC: GtcHardwareControlEvent.InnerKnobDec,
    TopKnob_Large_INC: GtcHardwareControlEvent.OuterKnobInc,
    TopKnob_Large_DEC: GtcHardwareControlEvent.OuterKnobDec,
    TopKnob_Push: GtcHardwareControlEvent.InnerKnobPush,
    TopKnob_Push_Long: GtcHardwareControlEvent.InnerKnobPushLong,
    SoftKey_1: GtcHardwareControlEvent.SoftKey1,
    SoftKey_2: GtcHardwareControlEvent.SoftKey2,
    SoftKey_3: GtcHardwareControlEvent.SoftKey3,
    BottomKnob_Small_DEC: GtcHardwareControlEvent.MapKnobDec,
    BottomKnob_Small_INC: GtcHardwareControlEvent.MapKnobInc,
    BottomKnob_Push: GtcHardwareControlEvent.MapKnobPush,
  };

  private static readonly VERTICAL_H_EVENT_MAP: Partial<Record<string, GtcHardwareControlEvent>> = {
    Joystick_DEC: GtcHardwareControlEvent.MapKnobDec,
    Joystick_INC: GtcHardwareControlEvent.MapKnobInc,
    Joystick_Push: GtcHardwareControlEvent.MapKnobPush,
    Joystick_Up: GtcHardwareControlEvent.JoystickUp,
    Joystick_Down: GtcHardwareControlEvent.JoystickDown,
    Joystick_Left: GtcHardwareControlEvent.JoystickLeft,
    Joystick_Right: GtcHardwareControlEvent.JoystickRight,
    MiddleKnob_DEC: GtcHardwareControlEvent.CenterKnobDec,
    MiddleKnob_INC: GtcHardwareControlEvent.CenterKnobInc,
    MiddleKnob_Push: GtcHardwareControlEvent.CenterKnobPush,
    RightKnob_Large_DEC: GtcHardwareControlEvent.OuterKnobDec,
    RightKnob_Large_INC: GtcHardwareControlEvent.OuterKnobInc,
    RightKnob_Small_DEC: GtcHardwareControlEvent.InnerKnobDec,
    RightKnob_Small_INC: GtcHardwareControlEvent.InnerKnobInc,
    RightKnob_Push: GtcHardwareControlEvent.InnerKnobPush,
    RightKnob_Push_Long: GtcHardwareControlEvent.InnerKnobPushLong,
  };

  /**
   * Maps an H event to a GtcHardwareControlEvent for a GTC.
   * @param orientation The orientation of the GTC.
   * @param instrumentIndex Which instrument index of the GTC.
   * @returns The mapped event, or undefined if no matching event or index.
   */
  public static hEventMap(orientation: GtcOrientation, instrumentIndex: number): (hEvent: string) => GtcHardwareControlEvent | undefined {
    // Example events
    // AS3000_TSC_Horizontal_1_TopKnob_Small_INC
    // AS3000_TSC_Vertical_2_TopKnob_Small_DEC

    let orientationPrefix: string;
    let map: Partial<Record<string, GtcHardwareControlEvent>>;

    if (orientation === 'horizontal') {
      orientationPrefix = 'Horizontal';
      map = GtcInteractionEventUtils.HORIZONTAL_H_EVENT_MAP;
    } else {
      orientationPrefix = 'Vertical';
      map = GtcInteractionEventUtils.VERTICAL_H_EVENT_MAP;
    }

    const regex = new RegExp(`^AS3000_TSC_${orientationPrefix}_${instrumentIndex}_(.*)$`);

    return (hEvent: string): GtcHardwareControlEvent | undefined => {
      const match = hEvent.match(regex);

      if (match !== null && match[1]) {
        return map[match[1]];
      } else {
        return undefined;
      }
    };
  }
}