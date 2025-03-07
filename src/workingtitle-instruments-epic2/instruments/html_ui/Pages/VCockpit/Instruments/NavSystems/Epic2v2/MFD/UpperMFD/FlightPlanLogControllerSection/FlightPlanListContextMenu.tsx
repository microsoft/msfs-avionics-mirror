import {
  BitFlags, ComponentProps, DisplayComponent, EventBus, FacilityType, FacilityUtils, FlightPlanSegmentType, FlightPlanUtils, FSComponent, ICAO,
  LegDefinitionFlags, LegType, Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2ExtraLegDefinitionFlags, Epic2Fms, Epic2FmsUtils, Epic2RadioUtils, FlightPlanLegListData, FlightPlanListData, FlightPlanStore, FmsMessageKey,
  FmsMessageTransmitter, ModalKey, ModalService, TouchButton
} from '@microsoft/msfs-epic2-shared';

import { DepartureArrivalModal } from '../FlightPlanConfigSection';
import { PlanMapEvents } from '../Map/PlanFormatController';
import { CrossModal } from '../Modals/CrossDialog';
import { HoldModal } from '../Modals/HoldModal';
import { InterceptModal } from '../Modals/InterceptModal';
import { ShowInfoModal } from '../Modals/ShowInfo/ShowInfoModal';

/** The properties for the {@link FlightPlanListContextMenu} component. */
interface FlightPlanListContextMenuProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The flight plan store to use for the active plan. */
  activeStore: FlightPlanStore;

  /** The flight plan store to use for the pending plan. */
  pendingStore: FlightPlanStore;

  /** The aircraft fms object */
  fms: Epic2Fms

  /** The modal service */
  modalService: ModalService
}

enum FlightPlanItemBaseOptions {
  CenterMap = 'Center Map',
  DirectTo = 'Direct To',
  DirectToRecovery = 'Direct To<br>Recovery',
  Intercept = 'Intercept...',
  AmendRoute = 'Amend Route',
  DeleteWpt = 'Delete Wpt',
  MakeFrom = 'From Wpt',
  Cross = 'Cross...',
  Hold = 'Hold...',
  DepartureArrival = 'Departure /<br>Arrival...',
  WeatherInfo = 'WX Info...',
  ShowInfo = 'Show Info...',
  TuneNav1 = 'Tune NAV 1',
  TuneNav2 = 'Tune NAV 2',
}

/** Type that correspends to the keys of {@link FlightPlanItemBaseOptions} */
type FlightPlanItemOptionsKeys = keyof typeof FlightPlanItemBaseOptions
/** Type used for the array of subjects used to indicate list item visibility  */
type FlightPlanItemVisibilityArray = { [key: string]: Subject<boolean> }

enum SelectedLegType {
  Discontinuity,
  Airport,
  EnrouteAirport,
  Waypoint,
  VorWaypoint,
  DirectTo,
  LabelledLeg
}

/** Component to provide the context menu called from selecting a flight plan list item */
export class FlightPlanListContextMenu extends DisplayComponent<FlightPlanListContextMenuProps> {
  private static ItemVisibilityConditions: { [key in FlightPlanItemOptionsKeys]: SelectedLegType[] } = {
    CenterMap: [SelectedLegType.Airport, SelectedLegType.Waypoint, SelectedLegType.VorWaypoint, SelectedLegType.DirectTo],
    DirectTo: [SelectedLegType.Airport, SelectedLegType.Waypoint, SelectedLegType.VorWaypoint],
    DirectToRecovery: [SelectedLegType.DirectTo],
    Intercept: [SelectedLegType.Airport, SelectedLegType.Waypoint, SelectedLegType.VorWaypoint],
    AmendRoute: [SelectedLegType.Waypoint, SelectedLegType.VorWaypoint, SelectedLegType.Airport, SelectedLegType.LabelledLeg],
    DeleteWpt: [SelectedLegType.Waypoint, SelectedLegType.VorWaypoint, SelectedLegType.Discontinuity, SelectedLegType.LabelledLeg],
    MakeFrom: [SelectedLegType.Waypoint, SelectedLegType.VorWaypoint],
    Cross: [SelectedLegType.Airport, SelectedLegType.Waypoint, SelectedLegType.VorWaypoint],
    Hold: [SelectedLegType.Airport, SelectedLegType.Waypoint, SelectedLegType.VorWaypoint],
    DepartureArrival: [SelectedLegType.Airport],
    WeatherInfo: [SelectedLegType.Airport],
    ShowInfo: [SelectedLegType.Airport, SelectedLegType.Waypoint, SelectedLegType.VorWaypoint],
    TuneNav1: [SelectedLegType.VorWaypoint],
    TuneNav2: [SelectedLegType.VorWaypoint]
  };
  private flightPlanMenuOptions: TouchButton[];
  private isVisible = Subject.create<boolean>(false);
  private planItemListLabel = Subject.create<string>('');
  private listItemVisibilitySubjects: FlightPlanItemVisibilityArray = {};
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.props.bus);

  /** @inheritdoc */
  constructor(props: FlightPlanListContextMenuProps) {
    super(props);

    this.listItemVisibilitySubjects = Object.keys(FlightPlanItemBaseOptions).reduce(
      (array, key) => {
        array[key] = Subject.create<boolean>(false);
        return array;
      },
      {} as { [key: string]: Subject<boolean> }
    );

    this.flightPlanMenuOptions = Object.entries(FlightPlanItemBaseOptions).map(
      ([key, value]) => {
        return (
          <TouchButton
            variant={'bar-menu'}
            label={value}
            isVisible={this.listItemVisibilitySubjects[key]}
            onPressed={() => this.handleMenuItemClick(value)}
          />
        );
      },
    );
  }

  /**
   * Function that will get the segment and local leg indexes from the item data
   * @param itemData {@link FlightPlanLegListData} object
   * @returns Segment index and local leg index
   */
  private getLegIndexesFromItemData(itemData: FlightPlanLegListData): [number, number] {
    const plan = this.props.fms.getPlanForFmcRender();
    const globalLegIndex = itemData?.legData.globalLegIndex.get();
    const segmentIndex = plan.getSegmentIndex(globalLegIndex);
    const localLegIndex = plan.getSegmentLegIndex(globalLegIndex);

    return [segmentIndex, localLegIndex];
  }

  /**
   * Function that handles the centering of waypoints from the flight plan
   * @param itemData {@link FlightPlanLegListData} object
   */
  private centerWaypoint(itemData: FlightPlanLegListData): void {
    const index = itemData.legData.globalLegIndex.get();
    this.props.bus.getPublisher<PlanMapEvents>().pub('plan_map_ctr_wpt', { legIndex: index }, false, false);
  }

  /**
   * Function that handles the deletion of waypoints from the flight plan
   * @param itemData {@link FlightPlanLegListData} object
   */
  private deleteWaypoint(itemData: FlightPlanLegListData): void {
    const plan = this.props.fms.getPlanForFmcRender();
    const [segmentIndex, localLegIndex] = this.getLegIndexesFromItemData(itemData);

    // If there is a DTO, we want to only remove the leg if the leg is not already being removed by the dto
    if (plan.directToData.segmentIndex !== -1 && plan.directToData.segmentLegIndex !== -1) {
      const dtoLegIndex = Epic2FmsUtils.getGlobalLegIndex(plan, plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
      if (itemData.legData.globalLegIndex.get() > dtoLegIndex + 3) {
        this.props.fms.removeWaypoint(segmentIndex, localLegIndex);
      } else {
        this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
      }
    } else {
      const leg = itemData.legData.leg;

      this.props.fms.removeWaypoint(segmentIndex, localLegIndex);

      // If we remove the prior leg first, then the leg index of the target leg will change
      // So we have to delete the target leg and then the prior leg
      if (
        localLegIndex > 0 && (leg.leg.type === LegType.VI || BitFlags.isAny(leg.flags, Epic2ExtraLegDefinitionFlags.HeadingInterceptLeg))
      ) {
        const priorLeg = plan.getLeg(segmentIndex, localLegIndex - 1);
        if (priorLeg.leg.type === LegType.VI || BitFlags.isAny(priorLeg.flags, Epic2ExtraLegDefinitionFlags.HeadingInterceptLeg)) {
          this.props.fms.removeWaypoint(segmentIndex, localLegIndex - 1);
        }
      }
    }
  }

  /**
   * Function that handles the amendment of the flight plan route
   * @param itemData {@link FlightPlanLegListData} object
   */
  private amendRoute(itemData: FlightPlanLegListData): void {
    this.props.fms.getModFlightPlan();
    this.props.pendingStore.amendWaypointForDisplay.set(itemData.legData);
  }

  /**
   * Function that will make the selected waypoint the FROM waypoint
   * @param itemData {@link FlightPlanLegListData} object
   */
  private makeFromWaypoint(itemData: FlightPlanLegListData): void {
    const plan = this.props.fms.getModFlightPlan();

    if (plan.directToData.segmentIndex !== -1 || plan.directToData.segmentLegIndex !== -1) {
      this.props.fms.removeDirectToExisting(undefined, itemData.legData.globalLegIndex.get() + 1, undefined, true);
    } else {
      const segmentIndex = plan.getSegmentIndex(itemData.legData.globalLegIndex.get() + 1);
      const segmentLegIndex = plan.getSegmentLegIndex(itemData.legData.globalLegIndex.get() + 1);

      this.props.fms.activateLeg(segmentIndex, segmentLegIndex);
    }
  }

  /**
   * Function that handles a direct to
   * @param itemData {@link FlightPlanLegListData} object
   */
  private directTo(itemData: FlightPlanLegListData): void {
    const [segmentIndex, localLegIndex] = this.getLegIndexesFromItemData(itemData);

    this.props.fms.createDirectTo(segmentIndex, localLegIndex, true);
  }

  /**
   * Function which will run direct to recovery
   */
  private directToRecovery(): void {
    this.props.fms.directToRecovery();
  }

  /**
   * Opens the hold modal
   * @param itemData {@link FlightPlanLegListData} object
   */
  private openHoldModal(itemData: FlightPlanLegListData): void {
    if (itemData.legData.leg.leg.fixIcao.trim().length > 0 && !(Epic2FmsUtils.isHoldAtLeg(itemData.legData.leg.leg.type) && itemData.legData.isActiveLeg.get())) {
      this.props.modalService.open<HoldModal>(ModalKey.Hold).modal.setLeg(itemData.legData.globalLegIndex.get());
    } else {
      this.fmsMessageTransmitter.sendMessage(FmsMessageKey.InvalidFlightPlanOp);
    }
  }

  /**
   * Opens the cross modal
   * @param itemData {@link FlightPlanLegListData} object
   */
  private openCrossModal(itemData: FlightPlanLegListData): void {
    if (itemData.legData.leg.leg.fixIcao.trim().length > 0) {
      this.props.modalService.open<CrossModal>(ModalKey.Cross).modal.setLeg(itemData.legData.globalLegIndex.get());
    } else {
      this.fmsMessageTransmitter.sendMessage(FmsMessageKey.InvalidFlightPlanOp);
    }
  }

  /**
   * Opens the intercept modal
   * @param itemData {@link FlightPlanLegListData} object
   */
  private openInterceptModal(itemData: FlightPlanLegListData): void {
    this.props.modalService.open<InterceptModal>(ModalKey.Intercept).modal.setLeg(itemData.legData.globalLegIndex.get());
  }

  /**
   * Opens the departure and arrival modal
   * @param itemData {@link FlightPlanLegListData} object
   */
  private openDepartureArrivalModal(itemData: FlightPlanLegListData): void {
    const segmentType = itemData.legData.segment.segmentType;
    const openModal = this.props.modalService.open<DepartureArrivalModal>(ModalKey.DepartureArrival)!.modal;
    if (segmentType === FlightPlanSegmentType.Departure || segmentType === FlightPlanSegmentType.Origin) {
      openModal.setActiveTab('departure');
    } else {
      openModal.setActiveTab('arrival');
    }
  }

  /**
   * Tunes the nav radio to the relevant frequency
   * @param itemData {@link FlightPlanLegListData} object
   * @param radioIndex Nav 1 or Nav 2
   */
  private async tuneNav(itemData: FlightPlanLegListData, radioIndex: 1 | 2): Promise<void> {
    const facility = await this.props.fms.facLoader.getFacility(FacilityType.VOR, itemData.legData.leg.leg.fixIcao);
    Epic2RadioUtils.setActiveNavFrequencyMhz(radioIndex, facility.freqMHz);
    if (facility.ils !== null) {
      Epic2RadioUtils.setActiveNavCourse(radioIndex, facility.ils.localizerCourse);
    }
  }

  /**
   * Displays the show info modal
   * @param itemData {@link FlightPlanLegListData} object
   */
  private showLegInfo(itemData: FlightPlanLegListData): void {
    this.props.modalService.open<ShowInfoModal>(ModalKey.ShowInfo).modal.setInfo(itemData.legData.leg.leg.fixIcao);
  }

  /**
   * Displays the weather tab of the show info modal
   * @param itemData {@link FlightPlanLegListData} object
   */
  private showWeatherInfo(itemData: FlightPlanLegListData): void {
    const modal = this.props.modalService.open<ShowInfoModal>(ModalKey.ShowInfo).modal;
    modal.setInfo(itemData.legData.leg.leg.fixIcao).then(() => modal.setTab('wx'));
  }

  /**
   * Menu item click handler
   * @param val Flight plan item option clicked by user
   * @returns nothing
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleMenuItemClick(val: FlightPlanItemBaseOptions): void {
    const data = this.props.activeStore.selectedEnrouteWaypoint.get();
    this.props.activeStore.selectedEnrouteWaypoint.set(undefined);

    if (data) {
      switch (val) {
        case FlightPlanItemBaseOptions.CenterMap:
          return this.centerWaypoint(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.DeleteWpt:
          return this.deleteWaypoint(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.AmendRoute:
          return this.amendRoute(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.DirectTo:
          return this.directTo(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.MakeFrom:
          return this.makeFromWaypoint(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.DirectToRecovery:
          return this.directToRecovery();
        case FlightPlanItemBaseOptions.Hold:
          return this.openHoldModal(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.Intercept:
          return this.openInterceptModal(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.Cross:
          return this.openCrossModal(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.DepartureArrival:
          return this.openDepartureArrivalModal(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.TuneNav1:
          this.tuneNav(data as FlightPlanLegListData, 1);
          return;
        case FlightPlanItemBaseOptions.TuneNav2:
          this.tuneNav(data as FlightPlanLegListData, 2);
          return;
        case FlightPlanItemBaseOptions.ShowInfo:
          return this.showLegInfo(data as FlightPlanLegListData);
        case FlightPlanItemBaseOptions.WeatherInfo:
          return this.showWeatherInfo(data as FlightPlanLegListData);
      }
    }
  }

  /**
   * Sets the item visibility depending on the selected leg type
   * @param selectedLegType The type of the selected item
   */
  private setItemVisibility(selectedLegType: SelectedLegType): void {
    for (const key in this.listItemVisibilitySubjects) {
      this.listItemVisibilitySubjects[key].set(FlightPlanListContextMenu.ItemVisibilityConditions[key as FlightPlanItemOptionsKeys].includes(selectedLegType));
    }
  }

  /**
   * Determines the selected leg type
   * @param listData the list data for the selected item
   * @returns the type of the selected leg
   */
  private async getLegType(listData: FlightPlanListData): Promise<SelectedLegType> {
    if (listData.type === 'directTo') {
      return SelectedLegType.DirectTo;
    }

    listData = listData as FlightPlanLegListData;

    const leg = listData.legData.leg;
    const legType = listData.legData.leg.leg.type;

    if (
      // Is this a Fly Heading xxx, or Fly To Intercept leg?
      (FlightPlanUtils.isDiscontinuityLeg(legType) && BitFlags.isAny(leg.flags, LegDefinitionFlags.VectorsToFinal | LegDefinitionFlags.VectorsToFinalFaf))
      || (legType === LegType.VM || legType === LegType.FM)
      || (legType === LegType.VI || BitFlags.isAny(leg.flags, Epic2ExtraLegDefinitionFlags.HeadingInterceptLeg))
    ) {
      return SelectedLegType.LabelledLeg;
    } else if (FlightPlanUtils.isDiscontinuityLeg(legType)) {
      return SelectedLegType.Discontinuity;
    } else if (listData.legData.isAirport && (listData.legData.isOrigin || listData.legData.isDestination)) {
      return SelectedLegType.Airport;
    } else {
      const facilityIcao = listData.legData.leg.leg.fixIcao;

      if (facilityIcao.trim().length === 0) {
        return SelectedLegType.Waypoint;
      } else {
        const facilityType = ICAO.getFacilityType(facilityIcao);
        const facility = await this.props.fms.facLoader.getFacility(facilityType, facilityIcao);

        const isRadio = FacilityUtils.isFacilityType(facility, FacilityType.VOR) && facility.freqMHz;

        return isRadio ? SelectedLegType.VorWaypoint : SelectedLegType.Waypoint;
      }
    }
  }

  /** @inheritdoc */
  public async onAfterRender(): Promise<void> {
    this.props.activeStore.selectedEnrouteWaypoint.sub(async (listData) => {
      this.isVisible.set(listData !== undefined);

      if (listData) {
        const legType = await this.getLegType(listData);

        this.planItemListLabel.set(
          legType == SelectedLegType.Discontinuity ? 'Discon'
            : legType == SelectedLegType.DirectTo ? 'Direct'
              : (listData as FlightPlanLegListData).legData.leg.name ?? '');
        this.setItemVisibility(legType);
      }
    });

    this.props.fms.planInMod.sub(() => this.props.activeStore.selectedEnrouteWaypoint.set(undefined));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flight-plan-log-item-menu" style={this.isVisible.map((bool) => bool ? '' : 'display: none')}>
        <div class='button-box-arrow' style='width: 150px'>
          <TouchButton variant={'small'}>
            <div class="flight-plan-log-item-menu-container">
              <img class="flight-plan-log-item-menu-image" src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan.png" />
              <div class="flight-plan-log-item-menu-label">{this.planItemListLabel}</div>
            </div>
          </TouchButton>
        </div>
        {...this.flightPlanMenuOptions}
      </div>
    );
  }
}
