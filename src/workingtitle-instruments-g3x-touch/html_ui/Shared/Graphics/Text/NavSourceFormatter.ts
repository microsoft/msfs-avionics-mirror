import { NavSourceType } from '@microsoft/msfs-sdk';

import { NavReferenceSource } from '@microsoft/msfs-garminsdk';

import { G3XTouchNavIndicator, G3XTouchNavSourceName } from '../../NavReference/G3XTouchNavReference';
import { PfdBearingPointerSource } from '../../Settings/PfdUserSettings';

/**
 * Utility class for creating nav source name formatters.
 */
export class NavSourceFormatter {
  /**
   * Creates a function which generates formatted nav source names.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showNavIndex Whether to show the index for NAV-type nav sources.
   * @returns A function which generates formatted nav source names.
   */
  public static create(
    showGpsIndex: boolean,
    showNavIndex: boolean
  ): (sourceName: G3XTouchNavSourceName) => string {
    const names = {
      ['NAV1']: `VLOC${showNavIndex ? '1' : ''}`,
      ['NAV2']: `VLOC${showNavIndex ? '2' : ''}`,
      ['GPSInt']: 'GPS',
      ['GPS1']: `GPS${showGpsIndex ? '1' : ''}`,
      ['GPS2']: `GPS${showGpsIndex ? '2' : ''}`,
      ['NRST']: 'NRST',
    };

    return (sourceName: G3XTouchNavSourceName) => {
      return names[sourceName] ?? '';
    };
  }

  /**
   * Creates a function which generates formatted nav source names for nav sources.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showNavIndex Whether to show the index for NAV-type nav sources.
   * @returns A function which generates formatted nav source names for nav sources.
   */
  public static createForSource(
    showGpsIndex: boolean,
    showNavIndex: boolean
  ): (source: NavReferenceSource<G3XTouchNavSourceName>) => string {
    const formatter = NavSourceFormatter.create(showGpsIndex, showNavIndex);

    return (source: NavReferenceSource<G3XTouchNavSourceName>) => {
      return formatter(source.name);
    };
  }

  /**
   * Creates a function which generates formatted nav source names for nav indicators.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showNavIndex Whether to show the index for NAV-type nav sources.
   * @param showNavType Whether to show the navaid type (VOR vs LOC) for NAV-type nav sources. If `false`, `'VLOC'`
   * will be used as the name for all NAV-type sources.
   * @returns A function which generates formatted nav source names for nav indicators.
   */
  public static createForIndicator(
    showGpsIndex: boolean,
    showNavIndex: boolean,
    showNavType: boolean
  ): (indicator: G3XTouchNavIndicator) => string {
    const formatter = NavSourceFormatter.create(showGpsIndex, showNavIndex);

    if (showNavType) {
      return (indicator: G3XTouchNavIndicator) => {
        const source = indicator.source.get();

        if (source === null) {
          return '';
        }

        if (source.getType() === NavSourceType.Nav && source.index < 3) {
          return `${indicator.isLocalizer.get() === true ? 'LOC' : 'VOR'}${showNavIndex ? source.index : ''}`;
        } else {
          return formatter(source.name);
        }
      };
    } else {
      return (indicator: G3XTouchNavIndicator) => {
        const source = indicator.source.get();

        if (source === null) {
          return '';
        }

        return formatter(source.name);
      };
    }
  }

  /**
   * Creates a function which generates formatted nav source names for nav sources.
   * @param showNavIndex Whether to show the index for NAV-type nav sources.
   * @returns A function which generates formatted nav source names for nav sources.
   */
  public static createForBearingPointerSetting(
    showNavIndex: boolean,
  ): (bearingPointerSource: PfdBearingPointerSource) => string {
    const map = {
      [PfdBearingPointerSource.Nav1]: 'NAV1',
      [PfdBearingPointerSource.Nav2]: 'NAV2',
      [PfdBearingPointerSource.NearestAirport]: 'NRST',
    } as const;

    const formatter = NavSourceFormatter.create(false, showNavIndex);

    return (bearingPointerSource: PfdBearingPointerSource) => {
      switch (bearingPointerSource) {
        case PfdBearingPointerSource.None:
          return 'OFF';
        case PfdBearingPointerSource.Gps:
          return 'GPS';
        case PfdBearingPointerSource.Nav1:
        case PfdBearingPointerSource.Nav2:
        case PfdBearingPointerSource.NearestAirport:
          return formatter(map[bearingPointerSource]);
        default:
          return '';
      }
    };
  }
}