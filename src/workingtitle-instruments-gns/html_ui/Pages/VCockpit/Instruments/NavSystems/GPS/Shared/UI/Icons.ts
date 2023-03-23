import { Facility, FacilityType, ICAO, ImageCache, NdbFacility, NdbType, VorFacility, VorType } from '@microsoft/msfs-sdk';

ImageCache.addToCache('INTERSECTION', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/intersection_cyan.png');
ImageCache.addToCache('AIRPORT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/airport_magenta.png');
ImageCache.addToCache('VOR', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/vor.png');
ImageCache.addToCache('VORDME', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/vordme.png');
ImageCache.addToCache('NDB_MH', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/ndb.png');
ImageCache.addToCache('NDB', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/ndbdme.png');
ImageCache.addToCache('LEGICON_DEFAULT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_default.svg');
ImageCache.addToCache('LEGICON_ARC_LEFT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_arc_left.svg');
ImageCache.addToCache('LEGICON_ARC_RIGHT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_arc_right.svg');
ImageCache.addToCache('LEGICON_DIRECTTO', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_directto.svg');
ImageCache.addToCache('LEGICON_DIRECTTO_WHITE', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_directto_white.svg');
ImageCache.addToCache('LEGICON_HOLD_LEFT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_hold_left.svg');
ImageCache.addToCache('LEGICON_HOLD_RIGHT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_hold_right.svg');
ImageCache.addToCache('LEGICON_PTURN_LEFT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_pturn_left.svg');
ImageCache.addToCache('LEGICON_PTURN_RIGHT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_pturn_right.svg');
ImageCache.addToCache('LEGICON_PTURN_LEFT_GREEN', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_pturn_left_green.svg');
ImageCache.addToCache('LEGICON_PTURN_RIGHT_GREEN', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legicon_pturn_right_green.svg');

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