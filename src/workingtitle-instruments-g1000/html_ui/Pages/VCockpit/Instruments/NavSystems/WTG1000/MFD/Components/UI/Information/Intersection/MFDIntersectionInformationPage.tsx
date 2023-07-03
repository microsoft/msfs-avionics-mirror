import { FacilityType, FacilityWaypoint, FSComponent, IntersectionFacility, VNode } from '@microsoft/msfs-sdk';

import { NearestIntersectionInformationGroup, NearestIntersectionReferenceVorGroup } from '../../Nearest/Intersections';
import { FacilityGroup } from '../FacilityGroup';
import { MFDInformationPage } from '../MFDInformationPage';

/**
 * A component that displays a page of information about an intersection facility.
 */
export class MFDIntersectionInformationPage extends MFDInformationPage {

  private readonly informationGroup = FSComponent.createRef<NearestIntersectionInformationGroup>();
  private readonly referenceVorGroup = FSComponent.createRef<NearestIntersectionReferenceVorGroup>();

  /** @inheritdoc */
  protected getDefaultRangeIndex(): number {
    return 14; // 7.5 NM/15 KM
  }

  /**
   * A callback called when a new waypoint is selected.
   * @param waypoint The waypoint that was selected.
   */
  private onSelected(waypoint: FacilityWaypoint<IntersectionFacility> | null): void {
    if (waypoint !== null) {
      this.informationGroup.instance.set(waypoint.facility.get());
      this.referenceVorGroup.instance.set(waypoint.facility.get());
    } else {
      this.informationGroup.instance.set(null);
      this.referenceVorGroup.instance.set(null);
    }

    this.waypoint.set(waypoint);
  }

  /** @inheritdoc */
  protected renderGroups(): VNode {
    return (
      <>
        <FacilityGroup bus={this.props.bus} facilityLoader={this.props.facilityLoader} facilityType={FacilityType.Intersection}
          viewService={this.props.viewService} title='Intersection' onSelected={this.onSelected.bind(this)} ref={this.facilityGroup} />
        <NearestIntersectionInformationGroup ref={this.informationGroup} />
        <NearestIntersectionReferenceVorGroup ref={this.referenceVorGroup} unitsSettingManager={this.unitsSettingManager} />
      </>
    );
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-intersection-information';
  }
}