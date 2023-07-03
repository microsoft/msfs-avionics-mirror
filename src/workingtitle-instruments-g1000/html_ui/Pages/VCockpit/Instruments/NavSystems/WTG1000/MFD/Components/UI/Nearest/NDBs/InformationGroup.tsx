import { DisplayComponent, FSComponent, GeoPoint, GeoPointSubject, LatLonDisplay, NdbFacility, VNode } from '@microsoft/msfs-sdk';

import { GroupBox } from '../../GroupBox';

import './InformationGroup.css';

/**
 * A component that displays information about an NDB on the
 * MFD nearest NDBs page.
 */
export class NearestNdbInformationGroup extends DisplayComponent<any> {

  private readonly content = FSComponent.createRef<HTMLDivElement>();
  private facilityPos = GeoPointSubject.createFromGeoPoint(new GeoPoint(0, 0));

  /**
   * Sets the facility to display in this group.
   * @param facility The facility to display.
   */
  public set(facility: NdbFacility | null): void {
    if (facility !== null) {
      this.facilityPos.set(facility.lat, facility.lon);
      this.content.instance.classList.remove('hidden-element');
    } else {
      this.content.instance.classList.add('hidden-element');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GroupBox title='Information'>
        <div class="mfd-nearest-ndb-info hidden-element" ref={this.content}>
          <LatLonDisplay location={this.facilityPos} class='mfd-nearest-ndb-info-latlon' />
        </div>
      </GroupBox>
    );
  }
}