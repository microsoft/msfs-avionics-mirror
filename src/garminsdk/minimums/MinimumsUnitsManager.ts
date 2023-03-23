import { EventBus, MinimumsControlEvents, Subscription } from '@microsoft/msfs-sdk';
import { UnitsAltitudeSettingMode, UnitsUserSettings } from '../settings';

/**
 * A manager for minimums units. Keeps the minimums unit in sync with the Garmin altitude display units setting.
 */
export class MinimumsUnitsManager {
  private readonly publisher = this.bus.getPublisher<MinimumsControlEvents>();

  private readonly altitudeUnitsSetting = UnitsUserSettings.getManager(this.bus).getSetting('unitsAltitude');

  private isAlive = true;
  private isInit = false;

  private altitudeUnitsSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically keep the minimums unit in sync with
   * the Garmin altitude display units setting until it is destroyed.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('MinimumsUnitsManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.altitudeUnitsSub = this.altitudeUnitsSetting.sub(mode => {
      if (mode === UnitsAltitudeSettingMode.Meters) {
        this.publisher.pub('set_da_distance_unit', 'meters', true, false);
      } else {
        this.publisher.pub('set_da_distance_unit', 'feet', true, false);
      }
    }, true);
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.altitudeUnitsSub?.destroy();
  }
}