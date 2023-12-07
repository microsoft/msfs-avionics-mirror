import {
  AdaptiveNearestSubscription, AirportClassMask, AirportFacility,
  AirportUtils, ApproachProcedure, FocusPosition, FSComponent,
  NearestAirportSubscription, NearestSubscription, Subject, Subscription, VNode
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
import { MFDPageMenuDialog } from '../MFDPageMenuDialog';
import { MenuItemDefinition } from '../../../../Shared';

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

  private g1000ControlPublisher = this.props.bus.getPublisher<G1000ControlEvents>();

  private readonly informationGroup = FSComponent.createRef<NearestAirportInformationGroup>();
  private readonly runwaysGroup = FSComponent.createRef<NearestAirportRunwaysGroup>();
  private readonly frequenciesGroup = FSComponent.createRef<NearestAirportFrequenciesGroup>();
  private readonly approachesGroup = FSComponent.createRef<NearestAirportApproachesGroup>();

  private pageMenu?: MFDPageMenuDialog;
  private pageMenuSub?: Subscription;
  private isPageMenuRunwayEnabledSub?: Subscription;
  private readonly isPageMenuRunwayEnabled = Subject.create<boolean>(false);

  private facility: AirportFacility | undefined = undefined;
  private approach: ApproachProcedure | undefined = undefined;

  private searchSettings = NearestAirportSearchSettings.getManager(this.props.bus);
  private searchSubscription: NearestAirportSubscription | undefined;

  private readonly pageMenuItems = (): MenuItemDefinition[] => [
    {
      id: 'select-airport-window',
      renderContent: (): VNode => <span>Select Airport Window</span>,
      action: (): void => {
        this.g1000ControlPublisher.pub('nearest_airports_key', NearestAirportSoftKey.APT);
      }
    },
    {
      id: 'select-runway-window',
      renderContent: (): VNode => <span>Select Runway Window</span>,
      isEnabled: this.isPageMenuRunwayEnabled.get(),
      action: (): void => {
        this.g1000ControlPublisher.pub('nearest_airports_key', NearestAirportSoftKey.RNWY);
      }
    },
    {
      id: 'select-frequency-window',
      renderContent: (): VNode => <span>Select Frequency Window</span>,
      action: (): void => {
        this.g1000ControlPublisher.pub('nearest_airports_key', NearestAirportSoftKey.FREQ);
      }
    },
    {
      id: 'select-approach-window',
      renderContent: (): VNode => <span>Select Approach Window</span>,
      action: (): void => {
        this.g1000ControlPublisher.pub('nearest_airports_key', NearestAirportSoftKey.APR);
      }
    },
    {
      id: 'load-approach',
      renderContent: (): VNode => <span>Load Approach</span>,
      isEnabled: this.pageMenu?.inputData.get() !== undefined && this.approach !== undefined,
      action: (): void => {
        this.g1000ControlPublisher.pub('nearest_airports_key', NearestAirportSoftKey.LD_APR);
      }
    },
    {
      id: 'charts',
      renderContent: (): VNode => <span>Charts</span>,
      isEnabled: false,
    },
  ];


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
    this._title.set('NRST - Nearest Airports');
  }

  /**
   * Opens the Page Menu popup when Menu button is pressed.
   * @returns whether the event was handled.
   */
  protected override onMenuPressed(): boolean {
    if (this.pageMenuSub) {
      this.pageMenuSub.destroy();
      this.pageMenuSub = undefined;
    }

    if (this.isPageMenuRunwayEnabledSub) {
      this.isPageMenuRunwayEnabledSub.destroy();
      this.isPageMenuRunwayEnabledSub = undefined;
    }

    this.pageMenu = this.props.viewService.open<MFDPageMenuDialog>('PageMenuDialog');
    this.pageMenuSub = this.pageMenu
      .setInput(this.facility)
      .inputData.sub((input: AirportFacility | undefined) => {
        this.isPageMenuRunwayEnabled.set(input !== undefined && input.runways.length > 1);
      }, true);

    this.isPageMenuRunwayEnabled.sub(() => {
      this.pageMenu?.setMenuItems(this.pageMenuItems());
    }, true);

    return true;
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

    if (this.approach !== undefined) {
      this.g1000ControlPublisher.pub('ld_apr_enabled', true, false, false);
    } else {
      this.g1000ControlPublisher.pub('ld_apr_enabled', false, false, false);
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

  /** @inheritdoc */
  public pause(): void {
    this.pageMenuSub?.pause();
    this.isPageMenuRunwayEnabledSub?.pause();
  }

  /** @inheritdoc */
  public resume(): void {
    this.pageMenuSub?.resume();
    this.isPageMenuRunwayEnabledSub?.resume();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.pageMenuSub?.destroy();
    this.isPageMenuRunwayEnabledSub?.destroy();
  }
}
