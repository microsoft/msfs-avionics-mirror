import { EventBus, PublishPacer, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * Unsuffixed roots for G3X Touch backlight events.
 */
interface G3XBacklightEventsRoot {
  /** The backlight level for a G3X Touch GDU screen, in the range `[0, 1]`. */
  g3x_backlight_screen_level: number;
}

/**
 * Events related to G3X Touch backlight levels.
 */
export interface G3XBacklightEvents {
  /** The G3X Touch's automatic software backlight level, in the range `[0, 1]`. */
  g3x_backlight_auto_level: number;

  /** The backlight level for a G3X Touch GDU screen, in the range `[0, 1]`. */
  [g3x_backlight_screen_level: `g3x_backlight_screen_level_${number}`]: number;
}

/**
 * A publisher for G3X Touch backlight levels.
 */
export class G3XBacklightPublisher extends SimVarPublisher<G3XBacklightEvents, G3XBacklightEventsRoot> {

  /**
   * Creates a new instance of G3XBacklightPublisher.
   * @param bus The EventBus to publish to.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<G3XBacklightEvents>) {
    super(new Map([
      ['g3x_backlight_auto_level', { name: 'L:WTG3X_Auto_Backlight', type: SimVarValueType.Number }],
      ['g3x_backlight_screen_level', { name: 'L:WTG3X_Screen_Backlight:#index#', type: SimVarValueType.Number, indexed: true, defaultIndex: null }],
    ]), bus, pacer);
  }
}
