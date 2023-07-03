import {
  AdaptiveNearestSubscription, AirportClassMask, AirportFacility,
  AirportUtils, ApproachProcedure, FocusPosition, FSComponent,
  NearestAirportSubscription, NearestSubscription, VNode
} from '@microsoft/msfs-sdk';

import { ProcedureType } from '@microsoft/msfs-garminsdk';

import { G1000ControlEvents } from '../../../../Shared/G1000Events';
import { NearestAirportSearchSettings } from '../../../../Shared/NearestAirportSearchSettings';
import { G1000UiControl, G1000UiControlProps } from '../../../../Shared/UI/G1000UiControl';
import { MFDSelectProcedurePage } from '../Procedure/MFDSelectProcedurePage';
import {
  NearestAirportApproachesGroup, NearestAirportFrequenciesGroup,
  NearestAirportInformationGroup, NearestAirportRunwaysGroup,
} from './Airports';
import { MFDNearestPage, MFDNearestPageProps } from './MFDNearestPage';

export enum NearestAirportSoftKey {
  APT,
  RNWY,
  FREQ,
  APR,
  LD_APR
}

/**
 * A component that display a list of the nearest airports with accompanying information
 * and a map indicating the airport location.
 */
export class MFDNearestAirportsPage extends MFDNearestPage<AirportFacility> {

  private readonly informationGroup = FSComponent.createRef<NearestAirportInformationGroup>();
  private readonly runwaysGroup = FSComponent.createRef<NearestAirportRunwaysGroup>();
  private readonly frequenciesGroup = FSComponent.createRef<NearestAirportFrequenciesGroup>();
  private readonly approachesGroup = FSComponent.createRef<NearestAirportApproachesGroup>();

  private facility: AirportFacility | undefined;
  private approach: ApproachProcedure | undefined;

  private searchSettings = NearestAirportSearchSettings.getManager(this.props.bus);
  private searchSubscription: NearestAirportSubscription | undefined;

  /**
   * Creates an instance of a nearest airport box.
   * @param props The props.
   */
  constructor(props: MFDNearestPageProps) {
    super(props);

    const searchLengthSetting = this.searchSettings.getSetting('runwayLength');
    const searchSurfaceSetting = this.searchSettings.getSetting('surfaceTypes');

    searchLengthSetting.sub(v => {
      this.searchSubscription?.setFilterCb((f: AirportFacility) => {
        return AirportUtils.hasMatchingRunway(f, v, searchSurfaceSetting.value);
      });
    }, true);

    searchSurfaceSetting.sub(v => {
      this.searchSubscription?.setFilterCb((f: AirportFacility) => {
        return AirportUtils.hasMatchingRunway(f, searchLengthSetting.value, v);
      });
    }, true);

    this.props.bus.on('nearest_airports_key', (group: number) => {
      switch (group) {
        case NearestAirportSoftKey.APT:
          this.facilitiesGroup.instance.focus(FocusPosition.MostRecent);
          this.setScrollEnabled(true);
          break;
        case NearestAirportSoftKey.RNWY:
          this.runwaysGroup.instance.focus(FocusPosition.MostRecent);
          this.setScrollEnabled(true);
          break;
        case NearestAirportSoftKey.FREQ:
          this.frequenciesGroup.instance.focus(FocusPosition.MostRecent);
          this.setScrollEnabled(true);
          break;
        case NearestAirportSoftKey.APR:
          this.approachesGroup.instance.focus(FocusPosition.MostRecent);
          this.setScrollEnabled(true);
          break;
        case NearestAirportSoftKey.LD_APR:
          this.onLoadApproach();
          break;
      }
    });
  }

  /** @inheritdoc */
  public onViewOpened(): void {
    super.onViewOpened();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('nearest-airports-menu');
  }

  /** @inheritdoc */
  protected getFacilityGroupTitle(): string {
    return 'Nearest Airports';
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-nearest-airports';
  }

  /** @inheritdoc */
  protected getSelectedGroup(): G1000UiControl<G1000UiControlProps> {
    return this.uiRoot.instance;
  }

  /** @inheritdoc */
  protected buildNearestSubscription(): NearestSubscription<AirportFacility> {
    this.searchSubscription = new NearestAirportSubscription(this.props.loader);
    return new AdaptiveNearestSubscription(this.searchSubscription, 200);
  }

  /** @inheritdoc */
  protected onFacilitySelected(airport: AirportFacility | null): void {
    super.onFacilitySelected(airport);

    this.informationGroup.instance.set(airport);
    this.runwaysGroup.instance.set(airport);
    this.frequenciesGroup.instance.set(airport);
    this.approachesGroup.instance.set(airport);

    this.facility = airport ?? undefined;
  }

  /**
   * A callback called when the LD APR softkey menu item is pressed to load an
   * approach into the PROC approach pane.
   */
  private onLoadApproach(): void {
    if (this.facility !== undefined && this.approach !== undefined) {
      // save the approach because it will be cleared when the select approach page is opened.
      const approach = this.approach;
      const procApproach = this.props.viewService.open('SelectProcedurePage', true) as MFDSelectProcedurePage;
      procApproach.setActiveProcedureType(ProcedureType.APPROACH)?.setFacilityAndApproach(this.facility, approach);
    }
  }

  /**
   * A callback called when an approach is selected in the approach group.
   * @param approach The approach that was selected.
   */
  private onApproachSelected(approach: ApproachProcedure | undefined): void {
    this.approach = approach;
    const publisher = this.props.bus.getPublisher<G1000ControlEvents>();

    if (this.approach !== undefined) {
      publisher.pub('ld_apr_enabled', true, false, false);
    } else {
      publisher.pub('ld_apr_enabled', false, false, false);
    }
  }

  /** @inheritdoc */
  protected setFilter(): void {
    // TODO: Exclude private airports when the data returned by the facilities loader is present and accurate.
    this.searchSubscription?.setFilter(false, AirportClassMask.SoftSurface | AirportClassMask.HardSurface | AirportClassMask.AllWater);
  }

  /**
   * Render the component.
   * @returns a VNode
   */
  protected renderGroups(): VNode {
    return (
      <>
        <NearestAirportInformationGroup ref={this.informationGroup} unitsSettingManager={this.unitsSettingManager} />
        <NearestAirportRunwaysGroup ref={this.runwaysGroup} unitsSettingManager={this.unitsSettingManager} isolateScroll />
        <NearestAirportFrequenciesGroup ref={this.frequenciesGroup} controlPublisher={this.props.publisher} isolateScroll />
        <NearestAirportApproachesGroup ref={this.approachesGroup} onSelected={this.onApproachSelected.bind(this)} isolateScroll />
      </>
    );
  }
}
