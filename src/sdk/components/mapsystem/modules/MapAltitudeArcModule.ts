import { Subject } from '../../../sub/Subject';

/**
 * A module describing the display of the altitude intercept arc.
 */
export class MapAltitudeArcModule {
  /** Whether to show the altitude intercept arc. */
  public readonly show = Subject.create(false);

  /**
   * MapAltitudeArcModule constructor.
   * @param show When passed, the `show` field will be initialized to this value.
   */
  public constructor(show?: boolean) {
    if (show !== undefined) {
      this.show.set(show);
    }
  }
}