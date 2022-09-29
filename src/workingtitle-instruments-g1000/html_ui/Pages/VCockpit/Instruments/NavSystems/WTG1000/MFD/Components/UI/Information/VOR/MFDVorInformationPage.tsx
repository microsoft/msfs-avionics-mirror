import { FacilityType, FacilityWaypoint, FSComponent, VNode, VorFacility } from 'msfssdk';

import { NearestVorFrequencyGroup, NearestVorInformationGroup } from '../../Nearest/VORs';
import { FacilityGroup } from '../FacilityGroup';
import { MFDInformationPage } from '../MFDInformationPage';

/**
 * A component that displays a page of information about an intersection facility.
 */
export class MFDVorInformationPage extends MFDInformationPage {

  private readonly informationGroup = FSComponent.createRef<NearestVorInformationGroup>();
  private readonly frequencyGroup = FSComponent.createRef<NearestVorFrequencyGroup>();

  /** @inheritdoc */
  protected getDefaultRangeIndex(): number {
    return 16; // 15 NM/25 KM
  }

  /**
   * A callback called when a new waypoint is selected.
   * @param waypoint The waypoint that was selected.
   */
  private onSelected(waypoint: FacilityWaypoint<VorFacility> | null): void {
    if (waypoint !== null) {
      this.informationGroup.instance.set(waypoint.facility.get());
      this.frequencyGroup.instance.set(waypoint.facility.get());

      this.frequencyGroup.instance.setDisabled(false);
    } else {
      this.informationGroup.instance.set(null);
      this.frequencyGroup.instance.set(null);

      this.frequencyGroup.instance.setDisabled(true);
    }

    this.waypoint.set(waypoint);
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    if (this.waypoint.get() === null) {
      this.frequencyGroup.instance.setDisabled(true);
    }
  }

  /** @inheritdoc */
  protected renderGroups(): VNode {
    return (
      <>
        <FacilityGroup bus={this.props.bus} facilityLoader={this.props.facilityLoader} facilityType={FacilityType.VOR}
          viewService={this.props.viewService} title='VOR' onSelected={this.onSelected.bind(this)} ref={this.facilityGroup} />
        <NearestVorInformationGroup ref={this.informationGroup} />
        <NearestVorFrequencyGroup ref={this.frequencyGroup} controlPublisher={this.props.controlPublisher} />
      </>
    );
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-vor-information';
  }
}