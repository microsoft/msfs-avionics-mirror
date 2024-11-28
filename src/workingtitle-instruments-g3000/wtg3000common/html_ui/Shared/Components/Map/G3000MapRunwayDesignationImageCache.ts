import { DefaultMapRunwayDesignationImageCache, MapRunwayDesignationImageCache } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '../../G3000FilePaths';

/**
 * A utility class for retrieving G3000 map runway designation image caches.
 */
export class G3000MapRunwayDesignationImageCache {
  private static INSTANCE?: MapRunwayDesignationImageCache;

  /**
   * Gets a map runway designation image cache.
   * @returns A map runway designation image cache.
   */
  public static getCache(): MapRunwayDesignationImageCache {
    return G3000MapRunwayDesignationImageCache.INSTANCE ??= this.createCache();
  }

  /**
   * Creates a runway designation image cache.
   * @returns A new runway designation image cache.
   */
  private static createCache(): MapRunwayDesignationImageCache {
    const cache = new DefaultMapRunwayDesignationImageCache();

    for (let i = 1; i <= 36; i++) {
      cache.registerNumber(i, `${G3000FilePaths.ASSETS_PATH}/Images/Map/runway/runway_${i.toString().padStart(2, '0')}.png`);
    }

    cache.registerDesignator(RunwayDesignator.RUNWAY_DESIGNATOR_LEFT, `${G3000FilePaths.ASSETS_PATH}/Images/Map/runway/runway_L.png`);
    cache.registerDesignator(RunwayDesignator.RUNWAY_DESIGNATOR_CENTER, `${G3000FilePaths.ASSETS_PATH}/Images/Map/runway/runway_C.png`);
    cache.registerDesignator(RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT, `${G3000FilePaths.ASSETS_PATH}/Images/Map/runway/runway_R.png`);
    cache.registerDesignator(RunwayDesignator.RUNWAY_DESIGNATOR_WATER, `${G3000FilePaths.ASSETS_PATH}/Images/Map/runway/runway_W.png`);

    return cache;
  }
}
