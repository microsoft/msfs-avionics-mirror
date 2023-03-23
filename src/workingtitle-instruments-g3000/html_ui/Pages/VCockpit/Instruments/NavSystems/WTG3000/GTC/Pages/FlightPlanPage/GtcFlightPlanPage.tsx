/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ClockEvents,
  DebounceTimer, FlightPlanSegmentType, FSComponent, LegDefinition, MappedSubject,
  SetSubject, StringUtils, Subject, Subscription, UserSetting, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { Fms, FmsUtils, GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';
import {
  ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneSettings,
  DisplayPanesUserSettings, DisplayPaneViewKeys, FlightPlanLegListData, FlightPlanListData,
  FlightPlanSegmentData, FlightPlanSegmentListData, G3000FPLUtils, FlightPlanStore,
  NavigationMapPaneFlightPlanFocusData, NavigationMapPaneViewEventTypes,
  SelectableFlightPlanListData, FlightPlanListManager, FlightPlanLegData, FlightPlanTextUpdateData, FlightPlanTextUpdater,
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDirectToPage } from '../DirectToPage/GtcDirectToPage';
import { AddEnrouteWaypointListItem } from './AddEnrouteWaypointListItem';
import { AirwayOptionsSlideoutMenu } from './AirwayOptionsSlideoutMenu';
import { ApproachOptionsSlideoutMenu } from './ApproachOptionsSlideoutMenu';
import { ArrivalOptionsSlideoutMenu } from './ArrivalOptionsSlideoutMenu';
import { DepartureOptionsSlideoutMenu } from './DepartureOptionsSlideoutMenu';
import { DestinationOptionsSlideoutMenu } from './DestinationOptionsSlideoutMenu';
import { EnrouteOptionsSlideoutMenu } from './EnrouteOptionsSlideoutMenu';
import { FlightPlanApproachListItem } from './FlightPlanApproachListItem';
import { FlightPlanArrivalListItem } from './FlightPlanArrivalListItem';
import { FlightPlanDataFieldsPage } from './FlightPlanDataFieldsPage';
import { FlightPlanDestinationListItem } from './FlightPlanDestinationListItem';
import { FlightPlanEnrouteListItem } from './FlightPlanEnrouteListItem';
import { FlightPlanFpaSpeedSlideoutMenu } from './FlightPlanFpaSpeedSlideoutMenu';
import { FlightPlanFromToArrow } from './FlightPlanFromToArrow';
import { FlightPlanLegListItem } from './FlightPlanLegListItem';
import { FlightPlanOriginListItem } from './FlightPlanOriginListItem';
import { FlightPlanSegmentListItem } from './FlightPlanSegmentListItem';
import { FlightPlanVnavConstraintSlideoutMenu } from './FlightPlanVnavConstraintSlideoutMenu';
import { GtcFlightPlanOptionsPopup } from './GtcFlightPlanOptionsPopup';
import { GtcFlightPlanPageSlideoutMenu } from './GtcFlightPlanPageSlideoutMenu';
import { OriginOptionsSlideoutMenu } from './OriginOptionsSlideoutMenu';
import { WaypointOptionsSlideoutMenu } from './WaypointOptionsSlideoutMenu';
import { GtcFlightPlanPageViewKeys } from './FlightPlanPageTypes';

import './GtcFlightPlanPage.css';

/** Properties of FlightPlanPage */
export interface FlightPlanPageProps extends GtcViewProps {
  /** The GtcService instance */
  fms: Fms;
  /** Which flight plan index to handle events for. */
  planIndex: number;
  /** The flight plan store to use. */
  store: FlightPlanStore;
  /** The flight plan list to use. */
  listManager: FlightPlanListManager;
  /** @inheritdoc */
  displayPaneIndex: ControllableDisplayPaneIndex;
}

/** The flight plan page. */
export class GtcFlightPlanPage extends GtcView<FlightPlanPageProps> {
  public override title = Subject.create('Active Flight Plan');

  protected readonly publisher = this.bus.getPublisher<DisplayPaneControlEvents<NavigationMapPaneViewEventTypes>>();

  private readonly flightPlanBoxClassList = SetSubject.create(['flight-plan-box']);

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly displayPaneSettings: UserSettingManager<DisplayPaneSettings>;

  private readonly store = this.props.store;

  private readonly listManager = this.props.listManager;

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  private readonly selectedListData = Subject.create<SelectableFlightPlanListData | null>(null);

  private readonly canScrollUpWaypoint = Subject.create(false);
  private readonly canScrollDownWaypoint = Subject.create(false);

  private readonly showOnMap: UserSetting<boolean>;
  private readonly showOnMapData = Subject.create<NavigationMapPaneFlightPlanFocusData>({
    planIndex: -1,
    globalLegIndexStart: -1,
    globalLegIndexEnd: -1,
    segmentIndex: -1,
    globalLegIndex: -1
  });
  private readonly showOnMapDataUpdateTimer = new DebounceTimer();

  /** Updates this page's show on map flight plan focus data based on the current show on map state and flight plan list selection. */
  private readonly showOnMapUpdateHandler = (): void => {
    const showOnMap = this.showOnMap.get();

    if (!showOnMap) {
      this.showOnMapData.set({ planIndex: -1, globalLegIndexStart: -1, globalLegIndexEnd: -1, segmentIndex: -1, globalLegIndex: -1 });
      return;
    }

    const plan = this.props.fms.getFlightPlan(this.props.planIndex);

    let globalLegIndexStart: number;
    let globalLegIndexEnd: number;
    let segmentIndex: number;
    let globalLegIndex: number;

    const data = this.selectedListData.get();
    if (data === null) {
      globalLegIndexStart = 0;
      globalLegIndexEnd = plan.length;
      segmentIndex = -1;
      globalLegIndex = -1;
    } else {
      if (data.type === 'leg') {
        const legData = data.legData;
        globalLegIndexStart = legData.globalLegIndex.get();

        // If the selected leg is the target of a DTO existing, focus the DTO leg instead.
        if (legData.segment.segmentIndex === plan.directToData.segmentIndex && globalLegIndexStart - legData.segment.offset === plan.directToData.segmentLegIndex) {
          globalLegIndexStart += FmsUtils.DTO_LEG_OFFSET;
        }

        globalLegIndexEnd = globalLegIndexStart + 1;
        segmentIndex = -1;
        globalLegIndex = globalLegIndexStart;
      } else {
        const segmentData = data.segmentData;
        const segment = segmentData.segment;

        if (segment.segmentType === FlightPlanSegmentType.Enroute && segment.airway === undefined) {
          // When the enroute header is selected, flight plan focus is set to all enroute legs, plus the first leg
          // after the last enroute leg.

          globalLegIndexStart = -1;
          globalLegIndexEnd = -1;

          for (const planSegment of plan.segmentsOfType(FlightPlanSegmentType.Enroute)) {
            globalLegIndexStart ??= planSegment.offset;
            globalLegIndexEnd = planSegment.offset + planSegment.legs.length + 1;
          }

          globalLegIndexEnd = Math.min(plan.length, globalLegIndexEnd);
          segmentIndex = -1;
        } else {
          globalLegIndexStart = segment.offset;
          globalLegIndexEnd = segment.offset + segment.legs.length;
          segmentIndex = segment.segmentIndex;
        }

        globalLegIndex = -1;
      }
    }

    this.showOnMapData.set({ planIndex: this.props.planIndex, globalLegIndexStart, globalLegIndexEnd, segmentIndex, globalLegIndex });
  };

  private readonly flightPlanList = FSComponent.createRef<GtcList<FlightPlanListData>>();
  private readonly directToRandomLegsRef = FSComponent.createRef<HTMLDivElement>();
  private readonly directToRandomLegListItemRef = FSComponent.createRef<FlightPlanLegListItem>();
  private readonly directToRandomHoldLegListItemRef = FSComponent.createRef<FlightPlanLegListItem>();

  private readonly columnHeader1 = MappedSubject.create(([origin, destination, planName]) => {
    return G3000FPLUtils.getFlightPlanDisplayName(planName, origin, destination);
  }, this.store.originIdent, this.store.destinationIdent, this.store.flightPlanName);
  private readonly columnHeader2 = Subject.create('ALT');
  private readonly columnHeader3 = this.gtcService.isAdvancedVnav
    ? 'FPA/SPD'
    : MappedSubject.create(([dataField1, dataField2]) => {
      return `${dataField1}/${dataField2}`;
    }, this.gtcService.gtcSettings.getSetting('flightPlanDataField1'), this.gtcService.gtcSettings.getSetting('flightPlanDataField2'));

  private readonly listItemHeightPx = this.gtcService.isHorizontal ? 134 : 72;
  private readonly listItemSpacingPx = this.gtcService.isHorizontal ? 2 : 1;

  private readonly lastActiveLegAutoScrolledTo = Subject.create<FlightPlanLegData | undefined>(undefined);
  private readonly toLegScrollSub: Subscription;
  private readonly activeLegChangedDebounced = new DebounceTimer();

  private readonly topRowSegmentIndex = Subject.create(-1);
  private readonly topRowSegmentLegIndex = Subject.create(-1);
  private readonly selectedSegmentIndex = Subject.create(-1);
  private readonly selectedSegmentLegIndex = Subject.create(-1);
  private readonly flightPlanTextUpdatedTimer = new DebounceTimer();
  private readonly isActivePaneController = this.gtcService.selectedDisplayPane.map(selectedPane => {
    return selectedPane === this.props.displayPaneIndex;
  });
  private readonly isPageOpen = Subject.create(false);
  private readonly isControllingFlightPlanTextInset = MappedSubject.create(([isPageOpen, isActivePaneController, activeControlMode]) => {
    return isPageOpen && isActivePaneController && activeControlMode === 'MFD';
  }, this.isPageOpen, this.isActivePaneController, this.gtcService.activeControlMode);

  private readonly subscriptions = [] as Subscription[];

  private lastVisibleTopIndex = 0;

  private selectedListDataSub?: Subscription;
  private showOnMapSub?: Subscription;
  private legsChangedSub?: Subscription;
  private waypointArrowUpdateClockSub?: Subscription;

  private isPaused = true;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: FlightPlanPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcFlightPlanPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettings = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);

    this.showOnMap = this.props.gtcService.gtcSettings.getSetting(`gtcShowFlightPlanPreview${this.displayPaneIndex}`);

    // Scroll to active leg when changed, but only if not in view
    this.toLegScrollSub = this.store.toLeg.sub(() => {
      this.activeLegChangedDebounced.schedule(this.autoScrollToActiveLeg.bind(this), 0);
    }, false, true);

    this.waypointArrowUpdateClockSub = this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1)
      .handle(this.updateWaypointArrowButtons.bind(this)).pause();

    // Deselect the selected item if it gets deleted
    this.props.store.flightPlanLegsChanged.on(() => {
      const selected = this.selectedListData.get();
      if (!selected) { return; }
      if (selected.type === 'leg' && !this.store.legMap.has(selected.legData.leg)) {
        this.selectedListData.set(null);
      } else if (selected.type === 'segment' && !this.store.segmentMap.has(selected.segmentData.segment)) {
        this.selectedListData.set(null);
      }
    });

    this.props.store.flightPlanLegsChanged.on(() => {
      this.calcTopRow();
    });

    this.props.store.toLeg.sub(() => {
      this.calcTopRow();
    });

    this.listManager.collapsedAirwaySegments.sub(() => this.sendFlightPlanTextDataDebounced(true));

    this.isControllingFlightPlanTextInset.sub(isControllingInset => {
      if (isControllingInset) {
        this.sendFlightPlanTextDataDebounced(false, false);
      } else {
        this.sendFlightPlanTextDataDebounced(false, true);
      }
    });
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this._activeComponent.set(this.flightPlanList.instance);

    // ---- Register Popups ----

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.FlightPlanOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <GtcFlightPlanOptionsPopup
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            planIndex={this.props.planIndex}
            showOnMap={this.showOnMap}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.DataFields,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => <FlightPlanDataFieldsPage gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex!} />,
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.OriginOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <OriginOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            store={this.store}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.DepartureOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <DepartureOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            store={this.store}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.EnrouteOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <EnrouteOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
            onWaypointInserted={this.handleWaypointInserted.bind(this)}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.AirwayOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <AirwayOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            selectedListData={this.selectedListData}
            fms={this.props.fms}
            planIndex={this.props.planIndex}
            store={this.props.store}
            listManager={this.listManager}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.ArrivalOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <ArrivalOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            store={this.store}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.DestinationOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <DestinationOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            store={this.store}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.ApproachOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <ApproachOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            store={this.store}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent, // This popup gets opened/closed a lot when scrolling through waypoints, so make it persistent.
      GtcFlightPlanPageViewKeys.WaypointOptions,
      'MFD',
      (gtcService, controlMode, displayPaneIndex) => {
        return (
          <WaypointOptionsSlideoutMenu
            gtcService={gtcService}
            controlMode={controlMode}
            displayPaneIndex={displayPaneIndex}
            fms={this.props.fms}
            store={this.store}
            listManager={this.listManager}
            planIndex={this.props.planIndex}
            selectedListData={this.selectedListData}
            selectNextWaypoint={this.selectNextWaypoint.bind(this)}
            canScrollUp={this.canScrollUpWaypoint}
            canScrollDown={this.canScrollDownWaypoint}
            onWaypointInserted={this.handleWaypointInserted.bind(this)}
          />
        );
      },
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.FpaSpeedMenu, 'MFD',
      () => <FlightPlanFpaSpeedSlideoutMenu controlMode='MFD' gtcService={this.gtcService} fms={this.props.fms} store={this.store} />,
      this.props.displayPaneIndex
    );

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcFlightPlanPageViewKeys.VnavConstraint, 'MFD',
      () => <FlightPlanVnavConstraintSlideoutMenu controlMode='MFD' gtcService={this.gtcService} fms={this.props.fms} store={this.store} planIndex={this.props.planIndex} />,
      this.props.displayPaneIndex
    );

    // ---- Off-Route Direct To ----

    this.store.isDirectToRandomActiveWithHold.sub(isDtoRandom => {
      this.flightPlanBoxClassList.toggle('direct-to-random', isDtoRandom !== false);
      this.flightPlanBoxClassList.toggle('direct-to-random-with-hold', isDtoRandom === 'with-hold');
      if (isDtoRandom === false) {
        this.directToRandomLegsRef.instance.innerHTML = '';
        this.directToRandomLegListItemRef.getOrDefault()?.destroy();
        this.directToRandomHoldLegListItemRef.getOrDefault()?.destroy();
      }
    }, true);

    this.store.directToRandomLegListData.sub(this.renderOffrouteDirectTo.bind(this), true);
    this.store.directToRandomHoldLegListData.sub(this.renderOffrouteDirectTo.bind(this), true);

    this.directToRandomLegsRef.instance.style.setProperty('--touch-list-item-height', this.listItemHeightPx + 'px');
    this.directToRandomLegsRef.instance.style.setProperty('--touch-list-item-margin', this.listItemSpacingPx + 'px');

    // ---- Selected Item Popups ----

    this.selectedListDataSub = this.selectedListData.sub(selected => {
      if (selected === null) {
        return;
      }

      if (selected.type === 'leg') {
        this.props.gtcService.openPopup<WaypointOptionsSlideoutMenu>(GtcFlightPlanPageViewKeys.WaypointOptions, 'slideout-right', 'none')
          .ref.setData(selected);
      } else {
        let popupKey: string | undefined;
        switch (selected.segmentData.segment.segmentType) {
          case FlightPlanSegmentType.Departure:
            popupKey = this.props.store.departureProcedure.get() === undefined
              ? GtcFlightPlanPageViewKeys.OriginOptions
              : GtcFlightPlanPageViewKeys.DepartureOptions;
            break;
          case FlightPlanSegmentType.Enroute:
            if (selected.segmentData.segment.airway === undefined) {
              popupKey = GtcFlightPlanPageViewKeys.EnrouteOptions;
            } else {
              popupKey = GtcFlightPlanPageViewKeys.AirwayOptions;
            }
            break;
          case FlightPlanSegmentType.Arrival:
            popupKey = GtcFlightPlanPageViewKeys.ArrivalOptions;
            break;
          case FlightPlanSegmentType.Approach:
            popupKey = GtcFlightPlanPageViewKeys.ApproachOptions;
            break;
          case FlightPlanSegmentType.Destination:
            popupKey = GtcFlightPlanPageViewKeys.DestinationOptions;
            break;
        }

        if (popupKey !== undefined) {
          this.props.gtcService.openPopup<GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData>>(popupKey, 'slideout-right', 'none')
            .ref.setData(selected);
        }
      }
    }, false, true);

    this.selectedListData.sub(() => this.updateWaypointArrowButtons(), true);

    // TODO Pause and resume
    this.selectedListData.sub(selected => {
      if (!selected) {
        this.selectedSegmentIndex.set(-1);
        this.selectedSegmentLegIndex.set(-1);
      } else if (selected.type === 'segment') {
        this.selectedSegmentIndex.set(selected.segmentData.segment.segmentIndex);
        this.selectedSegmentLegIndex.set(-1);
      } else if (selected.type === 'leg') {
        this.selectedSegmentIndex.set(selected.segmentListData?.segmentData.segment.segmentIndex ?? -1);
        this.selectedSegmentLegIndex.set(selected.legData.segmentLegIndex.get());
      }
      this.sendFlightPlanTextDataDebounced(true);
    });

    // ---- Show On Map ----

    const selectedListDataShowOnMapSub = this.selectedListData.sub(() => {
      if (!this.showOnMapDataUpdateTimer.isPending()) {
        this.showOnMapDataUpdateTimer.schedule(this.showOnMapUpdateHandler, 0);
      }
    }, false, true);

    const legsChangedSub = this.legsChangedSub = this.props.store.flightPlanLegsChanged.on(() => {
      if (!this.showOnMapDataUpdateTimer.isPending()) {
        this.showOnMapDataUpdateTimer.schedule(this.showOnMapUpdateHandler, 0);
      }
    }, true);

    const showOnMapDataSub = this.showOnMapData.sub(data => {
      this.sendFlightPlanFocusData(data);
    }, false, true);

    this.showOnMapSub = this.showOnMap.sub(show => {
      const viewSetting = this.displayPaneSettings.getSetting('displayPaneView');

      if (show) {
        viewSetting.value = DisplayPaneViewKeys.NavigationMap;
        this.showOnMapUpdateHandler();
        selectedListDataShowOnMapSub.resume();
        legsChangedSub.resume();
        showOnMapDataSub.resume(true);
      } else {
        selectedListDataShowOnMapSub.pause();
        legsChangedSub.pause();
        this.showOnMapUpdateHandler();
        showOnMapDataSub.pause();
        viewSetting.value = this.displayPaneSettings.getSetting('displayPaneDesignatedView').value;
      }
    }, false, true);
  }

  /** Scrolls to the active leg because the active leg changed. */
  private autoScrollToActiveLeg(): void {
    const toLeg = this.store.toLeg.get();
    if (!toLeg) { return; }
    if (toLeg === this.lastActiveLegAutoScrolledTo.get()) { return; }
    this.lastActiveLegAutoScrolledTo.set(toLeg);
    const toLegListData = this.listManager.legDataMap.get(toLeg);
    if (!toLegListData) { return; }
    // Don't scroll if a slideout menu is open
    if (this.selectedListData.get() !== null) { return; }
    // We still want to do the above stuff, mainly setting the last active leg auto scrolled to
    // But don't want to actually scroll when paused
    if (this.isPaused) { return; }
    this.flightPlanList.instance.scrollToItem(toLegListData, 2, true, true);
  }

  /** @inheritdoc */
  public onOpen(wasPreviouslyOpened: boolean): void {
    this.isPageOpen.set(true);
    this.showOnMapSub?.resume(true);
    this.waypointArrowUpdateClockSub?.resume(true);
    this.lastActiveLegAutoScrolledTo.set(this.store.toLeg.get());
    this.toLegScrollSub.resume();

    // Scroll to active leg when page is opened
    if (!wasPreviouslyOpened) {
      const toLeg = this.store.toLeg.get();
      if (!toLeg) { return; }
      const toLegListData = this.listManager.legDataMap.get(toLeg);
      if (!toLegListData) { return; }
      this.flightPlanList.instance.scrollToItem(toLegListData, 2, false);
    }
  }

  /** @inheritdoc */
  public onResume(): void {
    this.isPaused = false;
    this.subscriptions.forEach(x => x.resume(true));
    this.selectedListDataSub?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.isPaused = true;
    this.subscriptions.forEach(x => x.pause());
    this.selectedListDataSub?.pause();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.isPageOpen.set(false);
    this.showOnMap.set(false);
    this.showOnMapSub?.pause();
    this.waypointArrowUpdateClockSub?.pause();
    this.toLegScrollSub.pause();

    this.selectedListData.set(null);
  }

  /**
   * Scrolls the flight plan page to the given segment type.
   * @param segmentType The segment type.
   */
  public scrollTo(segmentType: FlightPlanSegmentType): void {
    const segData = this.getSegmentTypeListData(segmentType);
    if (!segData) { return; }
    const segmentListData = this.listManager.segmentDataMap.get(segData);
    if (!segmentListData) { return; }
    this.flightPlanList.instance.scrollToItem(segmentListData, 2, false);
  }

  /**
   * Gets the list data for the given segment type.
   * @param segmentType The segment type.
   * @returns the list data for the given segment type.
   */
  private getSegmentTypeListData(segmentType: FlightPlanSegmentType): FlightPlanSegmentData | undefined {
    switch (segmentType) {
      case FlightPlanSegmentType.Departure: {
        return this.store.departureSegmentData.get();
      }
      case FlightPlanSegmentType.Arrival: {
        return this.store.arrivalSegmentData.get();
      }
      case FlightPlanSegmentType.Approach: {
        return this.store.approachSegmentData.get();
      }
      default: return undefined;
    }
  }

  /**
   * Handles a new waypoint being inserted.
   * @param newLeg The new leg defintion.
   */
  private handleWaypointInserted(newLeg: LegDefinition): void {
    const newLegData = this.store.legMap.get(newLeg);
    if (!newLegData) { return; }
    const newLegListData = this.listManager.legDataMap.get(newLegData);
    if (!newLegListData) { return; }
    this.flightPlanList.instance.scrollToItem(newLegListData, 2, true);
  }

  /**
   * Selects the next waypoin in the given direction and scrolls to it if needed.
   * @param direction The direction to select in.
   */
  private selectNextWaypoint(direction: 1 | -1): void {
    const selectedWaypoint = this.selectedListData.get();
    if (!selectedWaypoint) { return; }

    const itemArray = this.listManager.dataList.getArray();
    const selectedIndex = itemArray.indexOf(selectedWaypoint);
    if (selectedIndex === -1) { return; }

    const newSelection = this.getNextWaypoint(direction);

    if (!newSelection) { return; }

    this.selectedListData.set(newSelection);

    const position = direction === 1 ? 4 : 0;
    this.flightPlanList.instance.scrollToItem(newSelection, position, true, true);
  }

  /** Updates which waypoint arrow buttons are enabled. */
  private updateWaypointArrowButtons(): void {
    this.canScrollUpWaypoint.set(!!this.getNextWaypoint(-1));
    this.canScrollDownWaypoint.set(!!this.getNextWaypoint(1));
  }

  /**
   * Gets the next waypoint in the given direction, or undefined if no more waypoints in that direction.
   * @param direction The direction to look in.
   * @returns the next waypoint or undefined if no more waypoints in that direction.
   */
  private getNextWaypoint(direction: 1 | -1): FlightPlanLegListData | undefined {
    const selectedWaypoint = this.selectedListData.get();
    if (!selectedWaypoint) { return undefined; }

    const itemArray = this.listManager.dataList.getArray();
    const selectedIndex = itemArray.indexOf(selectedWaypoint);
    if (selectedIndex === -1) { return; }

    let newSelection: FlightPlanLegListData | undefined;

    if (direction === 1) {
      for (let i = selectedIndex + 1; i < itemArray.length; i++) {
        const item = itemArray[i];
        if (item.type === 'leg' && item.isVisible.get()) {
          newSelection = item;
          break;
        }
      }
    } else {
      for (let i = selectedIndex - 1; i >= 0; i--) {
        const item = itemArray[i];
        if (item.type === 'leg' && item.isVisible.get()) {
          newSelection = item;
          break;
        }
      }
    }

    return newSelection;
  }

  /** Renders the offroute direct to legs to the page. */
  private renderOffrouteDirectTo(): void {
    const legListData = this.store.directToRandomLegListData.get();
    const holdLegListData = this.store.directToRandomHoldLegListData.get();

    this.directToRandomLegsRef.instance.innerHTML = '';
    this.directToRandomLegListItemRef.getOrDefault()?.destroy();
    this.directToRandomHoldLegListItemRef.getOrDefault()?.destroy();

    if (!legListData) { return; }


    const legListItemComponent = (
      <>
        <FlightPlanLegListItem
          ref={this.directToRandomLegListItemRef}
          fms={this.props.fms}
          legListData={legListData}
          waypointCache={this.waypointCache}
          gtcService={this.gtcService}
          planIndex={Fms.DTO_RANDOM_PLAN_INDEX}
          store={this.props.store}
          isDirectToRandom={true}
        >
          <FlightPlanFromToArrow
            isFromLegInAirway={Subject.create(false)}
            isToLegInAirway={Subject.create(false)}
            fromIndex={Subject.create(undefined)}
            toIndex={Subject.create(0)}
            listItemHeightPx={this.listItemHeightPx}
            listItemSpacingPx={this.listItemSpacingPx}
            gtcOrientation={this.gtcService.orientation}
          />
        </FlightPlanLegListItem>
        {holdLegListData &&
          <FlightPlanLegListItem
            ref={this.directToRandomHoldLegListItemRef}
            fms={this.props.fms}
            legListData={holdLegListData}
            waypointCache={this.waypointCache}
            gtcService={this.gtcService}
            planIndex={Fms.DTO_RANDOM_PLAN_INDEX}
            store={this.props.store}
            isDirectToRandom={true}
          >
            <FlightPlanFromToArrow
              isFromLegInAirway={Subject.create(false)}
              isToLegInAirway={Subject.create(false)}
              fromIndex={Subject.create(undefined)}
              toIndex={Subject.create(0)}
              listItemHeightPx={this.listItemHeightPx}
              listItemSpacingPx={this.listItemSpacingPx}
              gtcOrientation={this.gtcService.orientation}
            />
          </FlightPlanLegListItem>
        }
      </>
    );

    FSComponent.render(legListItemComponent, this.directToRandomLegsRef.instance);
  }

  /**
   * Sends flight plan focus data to the display pane controlled by this page.
   * @param data The data to send.
   */
  protected sendFlightPlanFocusData(data: NavigationMapPaneFlightPlanFocusData): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_nav_map_fpl_focus_set',
      eventData: data
    }, true, false);
  }

  /**
   * Sends flight plan text data to the display pane controlled by this page.
   * @param debounce Whether to debounce the update.
   * @param releaseControl Whether to release control of the flight plan text inset.
   */
  protected sendFlightPlanTextDataDebounced(debounce: boolean, releaseControl = false): void {
    if (debounce) {
      if (!this.isControllingFlightPlanTextInset.get()) {
        return;
      }
      this.flightPlanTextUpdatedTimer.schedule(() => this.sendFlightPlanTextData(), 500);
    } else {
      this.flightPlanTextUpdatedTimer.clear();
      this.sendFlightPlanTextData(releaseControl);
    }
  }

  /**
   * Sends flight plan text data to the display pane controlled by this page.
   * @param releaseControl Whether to release control of the flight plan text inset.
   */
  protected sendFlightPlanTextData(releaseControl = false): void {
    this.publisher.pub('display_pane_view_event', {
      displayPaneIndex: this.displayPaneIndex,
      eventType: 'display_pane_nav_map_text_inset_update',
      eventData: {
        topRowSegmentIndex: releaseControl ? -1 : this.topRowSegmentIndex.get(),
        topRowSegmentLegIndex: this.topRowSegmentLegIndex.get(),
        selectedSegmentIndex: this.selectedSegmentIndex.get(),
        selectedSegmentLegIndex: this.selectedSegmentLegIndex.get(),
        collapsedSegmentIndexes: releaseControl ? undefined : Array.from(this.listManager.collapsedAirwaySegments.get()).map(x => x.segmentIndex),
      } as FlightPlanTextUpdateData,
    }, true, false);
  }

  /**
   * Callback for GtcList to track when the list is scrolled.
   * @param topVisibleIndex The top visible index in the list.
   */
  private readonly calcTopRow = (topVisibleIndex?: number): void => {
    if (topVisibleIndex === undefined) {
      topVisibleIndex = this.lastVisibleTopIndex;
    } else {
      this.lastVisibleTopIndex = topVisibleIndex;
    }

    const list = this.listManager.dataList.getArray().filter(x => x.isVisible.get());

    for (let i = topVisibleIndex; i < list.length; i++) {
      const item = list[i];
      if (FlightPlanTextUpdater.shouldIgnoreItem(item, this.store.originFacility.get(), this.store.destinationFacility.get())) {
        continue;
      }
      if (item.type === 'segment') {
        this.topRowSegmentIndex.set(item.segmentData.segment.segmentIndex);
        this.topRowSegmentLegIndex.set(-1);
        break;
      } else if (item.type === 'leg') {
        this.topRowSegmentIndex.set(item.segmentListData?.segmentData.segment.segmentIndex ?? -1);
        this.topRowSegmentLegIndex.set(item.legData.segmentLegIndex.get());
        break;
      }
    }
    this.sendFlightPlanTextDataDebounced(true);
  };

  /**
   * Renders a flight plan list item.
   * @param listItem The list item to render.
   * @returns The rendered list item.
   */
  private readonly renderItem = (listItem: FlightPlanListData): VNode => {
    const { fms } = this.props;

    switch (listItem.type) {
      case 'segment': {
        switch (listItem.segmentData.segment.segmentType) {
          case FlightPlanSegmentType.Departure:
            return (
              <FlightPlanOriginListItem
                segmentListData={listItem}
                store={this.store}
                gtcService={this.gtcService}
                fms={fms}
                selectedListData={this.selectedListData}
              />
            );
          case FlightPlanSegmentType.Arrival:
            return (
              <FlightPlanArrivalListItem
                segmentListData={listItem}
                gtcService={this.gtcService}
                arrivalString={this.store.arrivalString}
                selectedListData={this.selectedListData}
              />
            );
          case FlightPlanSegmentType.Approach:
            return (
              <FlightPlanApproachListItem
                segmentListData={listItem}
                gtcService={this.gtcService}
                store={this.store}
                selectedListData={this.selectedListData}
              />
            );
          case FlightPlanSegmentType.Destination:
            return (
              <FlightPlanDestinationListItem
                segmentListData={listItem}
                store={this.store}
                gtcService={this.gtcService}
                fms={fms}
                selectedListData={this.selectedListData}
              />
            );
          case FlightPlanSegmentType.Enroute:
            return (
              <FlightPlanEnrouteListItem
                gtcService={this.gtcService}
                segmentListData={listItem}
                selectedListData={this.selectedListData}
              />
            );
          default:
            // TODO Is this still needed?
            console.error('unhandled segment type in renderItem');
            return (
              <FlightPlanSegmentListItem
                segmentListData={listItem}
              />
            );
        }
      }
      case 'leg':
        return (
          <FlightPlanLegListItem
            fms={fms}
            legListData={listItem}
            waypointCache={this.waypointCache}
            gtcService={this.gtcService}
            planIndex={this.props.planIndex}
            store={this.props.store}
            selectedListData={this.selectedListData}
          />
        );
      case 'addEnrouteWaypointButton':
        return (
          <AddEnrouteWaypointListItem
            gtcService={this.gtcService}
            fms={this.props.fms}
            planIndex={this.props.planIndex}
            isVisible={this.store.addEnrouteWaypointButtonIsVisible}
            isDoneEnabled={this.store.isThereAtLeastOneLeg}
          />
        );
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gtc-page gtc-page-flight-plan">
        <div class="button-column">
          <GtcTouchButton
            class="direct-to-button"
            label={<img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_small_direct_to.png" />}
            onPressed={() => {
              // In case a slideout menu is open, close it first
              if (this.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) {
                this.gtcService.goBack();
              }
              this.gtcService.changePageTo<GtcDirectToPage>(GtcViewKeys.DirectTo).ref.setWaypoint({});
            }}
          />
          <GtcTouchButton
            label={'PROC'}
            onPressed={() => {
              // In case a slideout menu is open, close it first
              if (this.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) {
                this.gtcService.goBack();
              }
              this.gtcService.changePageTo(GtcViewKeys.Procedures);
            }}
          />
          <GtcTouchButton
            label={'Standby\nFlight\nPlan'}
            onPressed={() => { }}
            isEnabled={false}
            class="small-font"
          />
          <GtcTouchButton
            label={'VNAV'}
            onPressed={() => {
              // In case a slideout menu is open, close it first
              if (this.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) {
                this.gtcService.goBack();
              }
              if (this.gtcService.isAdvancedVnav) {
                this.gtcService.changePageTo(GtcViewKeys.AdvancedVnavProfile);
              } else {
                this.gtcService.changePageTo(GtcViewKeys.VnavProfile);
              }
            }}
          />
          <GtcTouchButton
            label={'Flight\nPlan\nOptions'}
            class="small-font"
            onPressed={() => {
              // In case a slideout menu is open, close it first
              if (this.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) {
                this.gtcService.goBack();
              }
              this.props.gtcService.openPopup(GtcFlightPlanPageViewKeys.FlightPlanOptions);
            }}
          />
        </div>
        <div class={this.flightPlanBoxClassList}>
          <div class="list-top-section">
            <div class="column-header-1">{this.columnHeader1}</div>
            <div class="column-header-divider-1" />
            <div class="column-header-2">{this.columnHeader2}</div>
            <div class="column-header-divider-2" />
            <div class="column-header-3">{this.columnHeader3}</div>
          </div>
          <div class="offroute-dto-label">Offroute {StringUtils.DIRECT_TO}</div>
          <div ref={this.directToRandomLegsRef} class="direct-to-random-legs gtc-list" />
          <div class="direct-to-random-bar" />
          <GtcList<FlightPlanListData>
            ref={this.flightPlanList}
            class="flight-plan-list"
            bus={this.bus}
            sidebarState={this._sidebarState}
            listItemHeightPx={this.listItemHeightPx}
            heightPx={this.store.isDirectToRandomActiveWithHold.map(x =>
              x === 'with-hold'
                ? this.gtcService.isHorizontal ? 277 : 148
                : x === 'no-hold'
                  ? this.gtcService.isHorizontal ? 413 : 221
                  : this.gtcService.isHorizontal ? 683 : 366)}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={this.store.isDirectToRandomActiveWithHold.map(x => x === 'with-hold' ? 2 : x === 'no-hold' ? 3 : 5)}
            data={this.listManager.dataList}
            renderItem={this.renderItem}
            onTopVisibleIndexChanged={this.calcTopRow}
            staticTouchListChildren={(
              <FlightPlanFromToArrow
                isFromLegInAirway={this.store.fromLegSegment.map(x => x?.airway !== undefined)}
                isToLegInAirway={this.store.toLegSegment.map(x => x?.airway !== undefined)}
                fromIndex={this.listManager.fromLegVisibleListIndex}
                toIndex={this.listManager.toLegVisibleListIndex}
                listItemHeightPx={this.listItemHeightPx}
                listItemSpacingPx={this.listItemSpacingPx}
                gtcOrientation={this.gtcService.orientation}
              />
            )}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showOnMapSub?.destroy();
    this.legsChangedSub?.destroy();
    if (typeof this.columnHeader3 === 'object' && 'destroy' in this.columnHeader3) {
      this.columnHeader3.destroy();
    }

    super.destroy();
  }
}
