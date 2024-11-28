import { PfdIndex } from '../CommonTypes';
import { GduSoftkeyInteractionEvent } from './GduSoftkeyInteractionEvent';
import { PfdControllerInteractionEvent } from './PfdControllerInteractionEvent';

/**
 * A utility class for working with GDU interaction events.
 */
export class GduInteractionEventUtils {
  private static readonly SOFTKEY_INTERACTION_EVENTS = [
    GduSoftkeyInteractionEvent.SoftKey01,
    GduSoftkeyInteractionEvent.SoftKey02,
    GduSoftkeyInteractionEvent.SoftKey03,
    GduSoftkeyInteractionEvent.SoftKey04,
    GduSoftkeyInteractionEvent.SoftKey05,
    GduSoftkeyInteractionEvent.SoftKey06,
    GduSoftkeyInteractionEvent.SoftKey07,
    GduSoftkeyInteractionEvent.SoftKey08,
    GduSoftkeyInteractionEvent.SoftKey09,
    GduSoftkeyInteractionEvent.SoftKey10,
    GduSoftkeyInteractionEvent.SoftKey11,
    GduSoftkeyInteractionEvent.SoftKey12,
  ];

  private static readonly PFD_CONTROLLER_EVENT_SUFFIX_MAP: Record<PfdControllerInteractionEvent, string> = {
    [PfdControllerInteractionEvent.JoystickLeft]: 'JOYSTICK_LEFT',
    [PfdControllerInteractionEvent.JoystickRight]: 'JOYSTICK_RIGHT',
    [PfdControllerInteractionEvent.JoystickUp]: 'JOYSTICK_UP',
    [PfdControllerInteractionEvent.JoystickDown]: 'JOYSTICK_DOWN',
    [PfdControllerInteractionEvent.JoystickInc]: 'RANGE_INC',
    [PfdControllerInteractionEvent.JoystickDec]: 'RANGE_DEC',
    [PfdControllerInteractionEvent.JoystickPush]: 'JOYSTICK_PUSH',
  };

  /**
   * Creates a function that maps H events to interaction events for a PFD.
   * @param pfdIndex The index of the PFD for which to create the mapping function.
   * @returns A function that maps H events to interaction events for the specified PFD. If the H event cannot be
   * mapped, then the function will return `undefined`.
   */
  public static pfdHEventMap(pfdIndex: PfdIndex): (hEvent: string) => string | undefined {
    const hEventPrefix = `AS3000_PFD_${pfdIndex}`;

    // Softkeys

    const softkeyPrefix = `${hEventPrefix}_SOFTKEYS`;
    const softkeyMap: Partial<Record<string, GduSoftkeyInteractionEvent>> = {};
    for (let i = 0; i < 12; i++) {
      softkeyMap[`${softkeyPrefix}_${i + 1}`] = GduInteractionEventUtils.SOFTKEY_INTERACTION_EVENTS[i];
    }

    // PFD controller

    const pfdControllerMap: Partial<Record<string, PfdControllerInteractionEvent>> = {};
    for (const [event, suffix] of Object.entries(GduInteractionEventUtils.PFD_CONTROLLER_EVENT_SUFFIX_MAP)) {
      pfdControllerMap[`${hEventPrefix}_${suffix}`] = event as PfdControllerInteractionEvent;
    }

    return (hEvent: string): string | undefined => {
      const softkeyEvent = softkeyMap[hEvent];
      if (softkeyEvent !== undefined) {
        return softkeyEvent;
      }

      const pfdControllerEvent = pfdControllerMap[hEvent];
      if (pfdControllerEvent) {
        return pfdControllerEvent;
      }

      return undefined;
    };
  }

  /**
   * Creates a function that maps H events to interaction events for an MFD.
   * @returns A function that maps H events to interaction events for an MFD. If the H event cannot be mapped, then the
   * function will return `undefined`.
   */
  public static mfdHEventMap(): (hEvent: string) => string | undefined {
    const softkeyPrefix = 'AS3000_MFD_SOFTKEYS';

    const softkeyMap: Partial<Record<string, GduSoftkeyInteractionEvent>> = {};
    for (let i = 0; i < 12; i++) {
      softkeyMap[`${softkeyPrefix}_${i + 1}`] = GduInteractionEventUtils.SOFTKEY_INTERACTION_EVENTS[i];
    }

    return (hEvent: string): string | undefined => {
      const softkeyEvent = softkeyMap[hEvent];
      if (softkeyEvent !== undefined) {
        return softkeyEvent;
      }

      return undefined;
    };
  }
}
