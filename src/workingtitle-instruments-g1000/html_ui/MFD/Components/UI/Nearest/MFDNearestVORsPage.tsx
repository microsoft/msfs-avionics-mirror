import { FocusPosition, FSComponent, NearestSubscription, NearestVorSubscription, VNode, VorFacility } from '@microsoft/msfs-sdk';

import { G1000UiControl, G1000UiControlProps } from '../../../../Shared/UI/G1000UiControl';
import { MFDNearestPage, MFDNearestPageProps } from './MFDNearestPage';
import { NearestVorFrequencyGroup, NearestVorInformationGroup } from './VORs';

export enum NearestVorSoftKey {
  VOR,
  FREQ
}

/**
 * A page that displays the nearest intersections and related information on the MFD.
 */
export class MFDNearestVorsPage extends MFDNearestPage<VorFacility> {

  private readonly informationGroup = FSComponent.createRef<NearestVorInformationGroup>();
  private readonly frequencyGroup = FSComponent.createRef<NearestVorFrequencyGroup>();

  /**
   * Creates an instance of the MFDNearestVorsPage component.
   * @param props The props for this component.
   */
  constructor(props: MFDNearestPageProps) {
    super(props);

    this.props.bus.on('nearest_vors_key', (group: number) => {
      switch (group) {
        case NearestVorSoftKey.VOR:
          this.facilitiesGroup.instance.focus(FocusPosition.MostRecent);
          break;
        case NearestVorSoftKey.FREQ:
          this.frequencyGroup.instance.focus(FocusPosition.MostRecent);
          break;
      }
    });
  }

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
    return 'Nearest VOR';
  }

  /** @inheritdoc */
  protected buildNearestSubscription(): NearestSubscription<VorFacility> {
    return new NearestVorSubscription(this.props.loader);
  }

  /** @inheritdoc */
  protected onFacilitySelected(facility: VorFacility): void {
    super.onFacilitySelected(facility);

    this.informationGroup.instance.set(facility);
    this.frequencyGroup.instance.set(facility);
  }

  /** @inheritdoc */
  public onViewOpened(): void {
    super.onViewOpened();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('nearest-vors-menu');
  }

  /** @inheritdoc */
  protected renderGroups(): VNode {
    return (
      <>
        <NearestVorInformationGroup ref={this.informationGroup} />
        <NearestVorFrequencyGroup ref={this.frequencyGroup} controlPublisher={this.props.publisher} isolateScroll />
      </>
    );
  }
}
