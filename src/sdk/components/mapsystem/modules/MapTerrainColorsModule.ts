import { Vec2Math } from '../../../math/VecMath';
import { Vec2Subject } from '../../../math/VectorSubject';
import { ArraySubject } from '../../../sub/ArraySubject';
import { Subject } from '../../../sub/Subject';
import { BingComponent } from '../../bing/BingComponent';

/**
 * A map data module that controls the terrain color reference point.
 */
export class MapTerrainColorsModule {
  /** The terrain colors reference point. */
  public readonly reference = Subject.create(EBingReference.SEA);

  /** Whether or not to show the map terrain isolines. */
  public readonly showIsoLines = Subject.create<boolean>(false);

  /** The terrain colors array. */
  public readonly colors = ArraySubject.create(BingComponent.createEarthColorsArray('#0000FF', [
    {
      elev: 0,
      color: '#000000'
    }
  ], 0, 30000, 1));

  /** The elevation range over which to assign the terrain colors, as `[minimum, maximum]` in feet. */
  public readonly colorsElevationRange = Vec2Subject.create(Vec2Math.create(0, 30000));
}