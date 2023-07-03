import { FacilityType, FacilityWaypoint, FSComponent, NdbFacility, VNode } from '@microsoft/msfs-sdk';

import { NearestNdbFrequencyGroup, NearestNdbInformationGroup } from '../../Nearest/NDBs';
import { FacilityGroup } from '../FacilityGroup';
import { MFDInformationPage } from '../MFDInformationPage';

/**
 * A component that displays a page of information about an intersection facility.
 */
export class MFDNdbInformationPage extends MFDInformationPage {

  private readonly informationGroup = FSComponent.createRef<NearestNdbInformationGroup>();
  private readonly frequencyGroup = FSComponent.createRef<NearestNdbFrequencyGroup>();

  /** @inheritdoc */
  protected getDefaultRangeIndex(): number {
    return 14; // 7.5 NM/15 KM
  }

  /**
   * A callback called when a new waypoint is selected.
   * @param waypoint The waypoint that was selected.
   */
  private onSelected(waypoint: FacilityWaypoint<NdbFacility> | null): void {
    if (waypoint !== null) {
      this.informationGroup.instance.set(waypoint.facility.get());
      this.frequencyGroup.instance.set(waypoint.facility.get());
    } else {
      this.informationGroup.instance.set(null);
      this.frequencyGroup.instance.set(null);
    }

    this.waypoint.set(waypoint);
  }

  /** @inheritdoc */
  protected renderGroups(): VNode {
    return (
      <>
        <FacilityGroup bus={this.props.bus} facilityLoader={this.props.facilityLoader} facilityType={FacilityType.NDB}
          viewService={this.props.viewService} title='NDB' onSelected={this.onSelected.bind(this)} ref={this.facilityGroup} />
        <NearestNdbInformationGroup ref={this.informationGroup} />
        <NearestNdbFrequencyGroup ref={this.frequencyGroup} />
      </>
    );
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-ndb-information';
  }
}