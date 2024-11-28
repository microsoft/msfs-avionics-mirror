import { FSComponent, NdbFacility, NearestNdbSubscription, NearestSubscription, VNode } from '@microsoft/msfs-sdk';

import { G1000UiControl, G1000UiControlProps } from '../../../../Shared/UI/G1000UiControl';
import { MFDNearestPage } from './MFDNearestPage';
import { NearestNdbFrequencyGroup, NearestNdbInformationGroup } from './NDBs';

/**
 * A page that displays the nearest intersections and related information on the MFD.
 */
export class MFDNearestNdbsPage extends MFDNearestPage<NdbFacility> {

  private readonly informationGroup = FSComponent.createRef<NearestNdbInformationGroup>();
  private readonly frequencyGroup = FSComponent.createRef<NearestNdbFrequencyGroup>();

  /** @inheritdoc */
  protected getSelectedGroup(): G1000UiControl<G1000UiControlProps> {
    return this.uiRoot.instance;
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-nearest-ndbs';
  }

  /** @inheritdoc */
  protected getFacilityGroupTitle(): string {
    return 'Nearest NDB';
  }

  /** @inheritdoc */
  protected buildNearestSubscription(): NearestSubscription<NdbFacility> {
    return new NearestNdbSubscription(this.props.loader);
  }

  /** @inheritdoc */
  protected onFacilitySelected(facility: NdbFacility): void {
    super.onFacilitySelected(facility);

    this.informationGroup.instance.set(facility);
    this.frequencyGroup.instance.set(facility);
  }

  /** @inheritdoc */
  public onViewOpened(): void {
    super.onViewOpened();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('navmap-root');
  }

  /** @inheritdoc */
  protected renderGroups(): VNode {
    return (
      <>
        <NearestNdbInformationGroup ref={this.informationGroup} />
        <NearestNdbFrequencyGroup ref={this.frequencyGroup} />
      </>
    );
  }
}
