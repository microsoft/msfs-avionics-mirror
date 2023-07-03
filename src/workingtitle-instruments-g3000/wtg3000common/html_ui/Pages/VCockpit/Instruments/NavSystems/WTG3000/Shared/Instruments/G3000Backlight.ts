import { EventBus, IndexedEvents, PublishPacer, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';
import { PfdIndex } from '../CommonTypes';

/**
 * Unsuffixed roots for G3000 PFD screen backlight events.
 */
interface G3000PfdBacklightEventsRoot {
  /** The backlight level of a G3000 PFD screen, in the range `[0, 1]`. */
  g3000_backlight_pfd: number;
}

/**
 * Unsuffixed roots for G3000 MFD screen backlight events.
 */
interface G3000MfdBacklightEventsRoot {
  /** The backlight level of a G3000 MFD screen, in the range `[0, 1]`. */
  g3000_backlight_mfd: number;
}

/**
 * Unsuffixed roots for G3000 GTC screen backlight events.
 */
interface G3000GtcBacklightEventsRoot {
  /** The backlight level of a G3000 GTC screen, in the range `[0, 1]`. */
  g3000_backlight_gtc: number;
}

/**
 * Unsuffixed roots for indexed G3000 screen backlight events.
 */
type G3000BacklightIndexedEventsRoot = G3000PfdBacklightEventsRoot & G3000MfdBacklightEventsRoot & G3000GtcBacklightEventsRoot;

/**
 * Events related to Garmin G3000 screen backlight levels.
 */
export interface G3000BacklightEvents extends
  IndexedEvents<G3000PfdBacklightEventsRoot, PfdIndex>,
  IndexedEvents<G3000MfdBacklightEventsRoot, 1>,
  IndexedEvents<G3000GtcBacklightEventsRoot, number> {

  /** The G3000 automatic software backlight level, in the range `[0, 1]`. */
  g3000_backlight_auto_level: number;
}

/**
 * A publisher for G3000 screen backlight levels.
 */
export class G3000BacklightPublisher extends SimVarPublisher<G3000BacklightEvents, G3000BacklightIndexedEventsRoot> {

  /**
   * Creates a new instance of G3000BacklightPublisher.
   * @param bus The EventBus to publish to.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<G3000BacklightEvents>) {
    super(new Map([
      ['g3000_backlight_pfd', { name: 'L:WTG3000_Pfd_Backlight:#index#', type: SimVarValueType.Number, indexed: [1, 2], defaultIndex: null }],
      ['g3000_backlight_mfd', { name: 'L:WTG3000_Mfd_Backlight:#index#', type: SimVarValueType.Number, indexed: [1] }],
      ['g3000_backlight_gtc', { name: 'L:WTG3000_Gtc_Backlight:#index#', type: SimVarValueType.Number, indexed: true, defaultIndex: null }],
      ['g3000_backlight_auto_level', { name: 'L:WTG3000_Auto_Backlight', type: SimVarValueType.Number }]
    ]), bus, pacer);
  }
}

/**
 * A utility class for working with G3000 backlight SimVars.
 */
export class G3000BacklightUtils {
  /**
   * Gets the backlight level SimVar name for a PFD.
   * @param index A PFD index.
   * @returns The backlight level SimVar name for the specified PFD.
   * @throws Error if {@link index} is not a valid value.
   */
  public static getPfdLevelSimVarName(index: PfdIndex): string {
    if (index !== 1 && index !== 2) {
      throw new Error(`Invalid PFD index: ${index} (must be 1 or 2)`);
    }

    return index === 1 ? 'L:WTG3000_Pfd_Backlight:1' : 'L:WTG3000_Pfd_Backlight:2';
  }

  /**
   * Gets the backlight level SimVar name for the MFD.
   * @returns The backlight level SimVar name for the MFD.
   */
  public static getMfdLevelSimVarName(): string {
    return 'L:WTG3000_Mfd_Backlight:1';
  }

  /**
   * Gets the backlight level SimVar name for a GTC.
   * @param index A GTC index.
   * @returns The backlight level SimVar name for the specified GTC.
   * @throws Error if {@link index} is not a valid value.
   */
  public static getGtcLevelSimVarName(index: number): string {
    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`Invalid GTC index: ${index} (must be a positive integer)`);
    }

    return `L:WTG3000_Gtc_Backlight:${index}`;
  }

  /**
   * Gets the automatic software backlight level SimVar name.
   * @returns The automatic software backlight level SimVar name.
   */
  public static getAutoLevelSimVarName(): string {
    return 'L:WTG3000_Auto_Backlight';
  }
}