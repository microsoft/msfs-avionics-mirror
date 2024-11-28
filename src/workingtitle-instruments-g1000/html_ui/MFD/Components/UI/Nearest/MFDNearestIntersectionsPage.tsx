import { BitFlags, FSComponent, IntersectionFacility, IntersectionType, NearestIntersectionSubscription, NearestSubscription, VNode } from '@microsoft/msfs-sdk';

import { G1000UiControl, G1000UiControlProps } from '../../../../Shared/UI/G1000UiControl';
import { NearestIntersectionInformationGroup, NearestIntersectionReferenceVorGroup } from './Intersections';
import { MFDNearestPage } from './MFDNearestPage';

/**
 * A page that displays the nearest intersections and related information on the MFD.
 */
export class MFDNearestIntersectionsPage extends MFDNearestPage<IntersectionFacility> {

  private readonly informationGroup = FSComponent.createRef<NearestIntersectionInformationGroup>();
  private readonly referenceVorGroup = FSComponent.createRef<NearestIntersectionReferenceVorGroup>();

  /** @inheritdoc */
  protected getSelectedGroup(): G1000UiControl<G1000UiControlProps> {
    return this.uiRoot.instance;
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-nearest-intersections';
  }

  /** @inheritdoc */
  protected getFacilityGroupTitle(): string {
    return 'Nearest Intersections';
  }

  /** @inheritdoc */
  protected buildNearestSubscription(): NearestSubscription<IntersectionFacility> {
    const sub = new NearestIntersectionSubscription(this.props.loader);

    sub.awaitStart().then(() => {
      sub.setFilter(BitFlags.union(
        BitFlags.createFlag(IntersectionType.None),
        BitFlags.createFlag(IntersectionType.Named),
        BitFlags.createFlag(IntersectionType.Unnamed),
        BitFlags.createFlag(IntersectionType.Offroute),
        BitFlags.createFlag(IntersectionType.IAF),
        BitFlags.createFlag(IntersectionType.FAF),
        BitFlags.createFlag(IntersectionType.RNAV)
      ), true);
    });

    return sub;
  }

  /** @inheritdoc */
  protected onFacilitySelected(facility: IntersectionFacility): void {
    super.onFacilitySelected(facility);

    this.informationGroup.instance.set(facility);
    this.referenceVorGroup.instance.set(facility);
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
        <NearestIntersectionInformationGroup ref={this.informationGroup} />
        <NearestIntersectionReferenceVorGroup ref={this.referenceVorGroup} unitsSettingManager={this.unitsSettingManager} />
      </>
    );
  }
}
