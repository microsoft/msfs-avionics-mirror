import { NavSourceType } from '@microsoft/msfs-sdk';

import { NavReferenceSource } from '@microsoft/msfs-garminsdk';

import { G3000NavIndicator, G3000NavSourceName } from '../../NavReference/G3000NavReference';
import { PfdBearingPointerSource } from '../../Settings/PfdUserSettings';

/**
 * Utility class for creating nav source name formatters.
 */
export class NavSourceFormatter {
  /**
   * Creates a function which generates formatted nav source names.
   * @param gpsName The name to use for GPS-type nav sources.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showDmeIndex Whether to show the index for DME-type nav sources.
   * @param showAdfIndex Whether to show the index for ADF-type nav sources.
   * @returns A function which generates formatted nav source names.
   */
  public static create(
    gpsName: 'GPS' | 'FMS',
    showGpsIndex: boolean,
    showDmeIndex: boolean,
    showAdfIndex: boolean
  ): (sourceName: G3000NavSourceName) => string {
    const names = {
      ['NAV1']: 'NAV1',
      ['NAV2']: 'NAV2',
      ['DME1']: `DME${showDmeIndex ? '1' : ''}`,
      ['DME2']: `DME${showDmeIndex ? '2' : ''}`,
      ['ADF1']: `ADF${showAdfIndex ? '1' : ''}`,
      ['ADF2']: `ADF${showAdfIndex ? '2' : ''}`,
      ['FMS1']: `${gpsName}${showGpsIndex ? '1' : ''}`,
      ['FMS2']: `${gpsName}${showGpsIndex ? '2' : ''}`,
    };

    return (sourceName: G3000NavSourceName) => {
      return names[sourceName] ?? '';
    };
  }

  /**
   * Creates a function which generates formatted nav source names for nav sources.
   * @param gpsName The name to use for GPS-type nav sources.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showDmeIndex Whether to show the index for DME-type nav sources.
   * @param showAdfIndex Whether to show the index for ADF-type nav sources.
   * @returns A function which generates formatted nav source names for nav sources.
   */
  public static createForSource(
    gpsName: 'GPS' | 'FMS',
    showGpsIndex: boolean,
    showDmeIndex: boolean,
    showAdfIndex: boolean
  ): (source: NavReferenceSource<G3000NavSourceName>) => string {
    const formatter = NavSourceFormatter.create(gpsName, showGpsIndex, showDmeIndex, showAdfIndex);

    return (source: NavReferenceSource<G3000NavSourceName>) => {
      return formatter(source.name);
    };
  }

  /**
   * Creates a function which generates formatted nav source names for nav indicators.
   * @param gpsName The name to use for GPS-type nav sources.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showDmeIndex Whether to show the index for DME-type nav sources.
   * @param showAdfIndex Whether to show the index for ADF-type nav sources.
   * @param showNavType Whether to show the navaid type (VOR vs LOC) for NAV-type nav sources. If `false`, `'NAV'` will
   * be used as the name for all NAV-type sources.
   * @returns A function which generates formatted nav source names for nav indicators.
   */
  public static createForIndicator(
    gpsName: 'GPS' | 'FMS',
    showGpsIndex: boolean,
    showDmeIndex: boolean,
    showAdfIndex: boolean,
    showNavType: boolean
  ): (indicator: G3000NavIndicator) => string {
    const formatter = NavSourceFormatter.create(gpsName, showGpsIndex, showDmeIndex, showAdfIndex);

    if (showNavType) {
      return (indicator: G3000NavIndicator) => {
        const source = indicator.source.get();

        if (source === null) {
          return '';
        }

        if (source.getType() === NavSourceType.Nav && source.index < 3) {
          return `${indicator.isLocalizer.get() === true ? 'LOC' : 'VOR'}${source.index}`;
        } else {
          return formatter(source.name);
        }
      };
    } else {
      return (indicator: G3000NavIndicator) => {
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
   * @param gpsName The name to use for GPS-type nav sources.
   * @param showGpsIndex Whether to show the index for GPS-type nav sources.
   * @param showDmeIndex Whether to show the index for DME-type nav sources.
   * @param showAdfIndex Whether to show the index for ADF-type nav sources.
   * @returns A function which generates formatted nav source names for nav sources.
   */
  public static createForBearingPointerSetting(
    gpsName: 'GPS' | 'FMS',
    showGpsIndex: boolean,
    showDmeIndex: boolean,
    showAdfIndex: boolean
  ): (bearingPointerSource: PfdBearingPointerSource) => string {
    const map = {
      [PfdBearingPointerSource.Nav1]: 'NAV1',
      [PfdBearingPointerSource.Nav2]: 'NAV2',
      [PfdBearingPointerSource.Fms1]: 'FMS1',
      [PfdBearingPointerSource.Fms2]: 'FMS2',
      [PfdBearingPointerSource.Adf1]: 'ADF1',
      [PfdBearingPointerSource.Adf2]: 'ADF2',
    } as const;

    const formatter = NavSourceFormatter.create(gpsName, showGpsIndex, showDmeIndex, showAdfIndex);

    return (bearingPointerSource: PfdBearingPointerSource) => {
      return bearingPointerSource === PfdBearingPointerSource.None ? 'OFF' : formatter(map[bearingPointerSource]);
    };
  }
}