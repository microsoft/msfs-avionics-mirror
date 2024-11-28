
import { Epic2KeyboardCharHEvents, Epic2KeyboardControlHEvents } from '@microsoft/msfs-epic2-shared';

/** Publishes TSC keyboard's key presses as `HEvent`s. */
export class KeyboardHEventPublisher {
  /**
   * Sends a key press to the DUs.
   * @param key The H event without H: prefix.
   */
  public static sendKey(key: Epic2KeyboardCharHEvents | Epic2KeyboardControlHEvents): void {
    SimVar.SetSimVarValue(`H:${key}`, 'boolean', 1);
  }
}
