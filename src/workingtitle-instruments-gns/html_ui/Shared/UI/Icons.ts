import { Facility, FacilityType, ICAO, ImageCache, NdbFacility, NdbType, VorFacility, VorType } from '@microsoft/msfs-sdk';

import { GNSFilePaths } from '../GNSFilePaths';

ImageCache.addToCache('INTERSECTION', `${GNSFilePaths.ASSETS_PATH}/Images/intersection_cyan.png`);
ImageCache.addToCache('AIRPORT', `${GNSFilePaths.ASSETS_PATH}/Images/airport_magenta.png`);
ImageCache.addToCache('VOR', `${GNSFilePaths.ASSETS_PATH}/Images/vor.png`);
ImageCache.addToCache('VORDME', `${GNSFilePaths.ASSETS_PATH}/Images/vordme.png`);
ImageCache.addToCache('NDB_MH', `${GNSFilePaths.ASSETS_PATH}/Images/ndb.png`);
ImageCache.addToCache('NDB', `${GNSFilePaths.ASSETS_PATH}/Images/ndbdme.png`);
ImageCache.addToCache('LEGICON_DEFAULT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_default.svg`);
ImageCache.addToCache('LEGICON_ARC_LEFT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_arc_left.svg`);
ImageCache.addToCache('LEGICON_ARC_RIGHT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_arc_right.svg`);
ImageCache.addToCache('LEGICON_DIRECTTO', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_directto.svg`);
ImageCache.addToCache('LEGICON_DIRECTTO_WHITE', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_directto_white.svg`);
ImageCache.addToCache('LEGICON_HOLD_LEFT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_hold_left.svg`);
ImageCache.addToCache('LEGICON_HOLD_RIGHT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_hold_right.svg`);
ImageCache.addToCache('LEGICON_PTURN_LEFT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_pturn_left.svg`);
ImageCache.addToCache('LEGICON_PTURN_RIGHT', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_pturn_right.svg`);
ImageCache.addToCache('LEGICON_PTURN_LEFT_GREEN', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_pturn_left_green.svg`);
ImageCache.addToCache('LEGICON_PTURN_RIGHT_GREEN', `${GNSFilePaths.ASSETS_PATH}/Images/legicon_pturn_right_green.svg`);

/**
 * Gets facility icon data.
 */
export class Icons {

  /**
   * Gets the icon image source for a given facility.
   * @param facility The facility to get the source for.
   * @returns The icon image source URI.
   */
  public static getByFacility(facility: Facility): HTMLImageElement {
    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
        return ImageCache.get('AIRPORT');
      case FacilityType.VOR:
        return (facility as VorFacility).type === VorType.VORDME ? ImageCache.get('VORDME') : ImageCache.get('VOR');
      case FacilityType.NDB:
        return (facility as NdbFacility).type === NdbType.MH ? ImageCache.get('NDB_MH') : ImageCache.get('NDB');
      default:
        return ImageCache.get('INTERSECTION');
    }
  }
}
