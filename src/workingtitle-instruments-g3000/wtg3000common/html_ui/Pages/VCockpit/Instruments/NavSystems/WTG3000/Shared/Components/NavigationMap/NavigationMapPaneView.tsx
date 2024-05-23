/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CompiledMapSystem, EventBus, FacilityLoader, FacilityType, FlightPlan, FlightPlanner, FlightPlanSegmentType, FSComponent,
  ICAO, LegDefinition, LegType, MapIndexedRangeModule, MapSystemBuilder, NodeReference, SetSubject, Subject, Subscription,
  UnitType, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  FlightPlanFocus, Fms, FmsUtils, GarminAdditionalApproachType, GarminMapKeys, MapFlightPlanFocusModule, MapPointerController, MapPointerInfoLayerSize,
  MapPointerModule, MapRangeController, TrafficSystem, TrafficUserSettings, UnitsUserSettings, VNavDataProvider, WindDataProvider
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../../CommonTypes';
import { FlightPlanListManager, FlightPlanStore } from '../../FlightPlan';
import { G3000FPLUtils } from '../../FlightPlan/G3000FPLUtils';
import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { IauUserSettingManager } from '../../Settings/IauUserSettings';
import { MapInsetSettingMode, MapUserSettings } from '../../Settings/MapUserSettings';
import { BingUtils } from '../Bing/BingUtils';
import { ApproachNameDisplay } from '../Common/ApproachNameDisplay';
import { DisplayPaneInsetView } from '../DisplayPanes/DisplayPaneInsetView';
import { ControllableDisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { MapBuilder } from '../Map/MapBuilder';
import { MapConfig } from '../Map/MapConfig';
import { FlightPlanTextInset } from './FlightPlanTextInset/FlightPlanTextInset';
import { FlightPlanTextUpdateData, NavigationMapPaneFlightPlanFocusData, NavigationMapPaneViewEventTypes } from './NavigationMapPaneViewEvents';

import '../Map/CommonMap.css';
import './NavigationMapPaneView.css';

/**
 * Component props for NavigationMapPaneView.
 */
export interface NavigationMapPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** A facility loader. */
  facLoader: FacilityLoader;

  /** The flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** The traffic system used by the map to display traffic. */
  trafficSystem: TrafficSystem;

  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;

  /** A provider of wind data. Required to display the map wind vector. */
  windDataProvider?: WindDataProvider;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /** The Fms. */
  fms: Fms<G3000FlightPlannerId>;

  /** The flight plan list manager instance for this pane. */
  flightPlanListManager: FlightPlanListManager;

  /** A manager for all IAU user settings. */
  iauSettingManager: IauUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * Navigation map pane inset modes.
 */
enum NavigationMapPaneInsetMode {
  None = 'None',
  VertSituationDisplay = 'VertSituationDisplay',
  FlightPlanText = 'FlightPlanText',
  FlightPlanProgress = 'FlightPlanProgress',
}

/**
 * A display pane view which displays a navigation map.
 */
export class NavigationMapPaneView extends DisplayPaneView<NavigationMapPaneViewProps, DisplayPaneViewEvent<NavigationMapPaneViewEventTypes>> {

  private static readonly DATA_UPDATE_FREQ = 30; // Hz

  private static readonly VSD_MAP_HEIGHT_PFD = 488;
  private static readonly VSD_MAP_HEIGHT_MFD = 458;
  private static readonly FLIGHT_PLAN_TEXT_MAP_HEIGHT = 508;

  private activeInsetView?: DisplayPaneInsetView;
  private readonly flightPlanTextInset = FSComponent.createRef<FlightPlanTextInset>();
  private readonly insetModeToViewMap = {
    [NavigationMapPaneInsetMode.FlightPlanText]: this.flightPlanTextInset as NodeReference<DisplayPaneInsetView>,
  } as Record<NavigationMapPaneInsetMode, NodeReference<DisplayPaneInsetView>>;

  private readonly rootCssClass = SetSubject.create(['nav-map-pane']);

  private readonly displayPaneSizeMode = Subject.create<DisplayPaneSizeMode>(DisplayPaneSizeMode.Hidden);
  private readonly paneSize = Vec2Math.create(100, 100);
  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapSettingManager = MapUserSettings.getDisplayPaneManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);

  private readonly drawEntirePrimaryPlan = Subject.create(false);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.navMap, {
      bingId: `pane_map_${this.props.index}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.index),

      dataUpdateFreq: NavigationMapPaneView.DATA_UPDATE_FREQ,

      rangeRingOptions: {
        showLabel: true
      },

      rangeCompassOptions: {
        showLabel: true,
        showHeadingBug: true,
        supportHeadingSync: true,
        bearingTickMajorLength: 10,
        bearingTickMinorLength: 5,
        bearingLabelFont: 'DejaVuSans-SemiBold',
        bearingLabelFontSize: 17
      },

      flightPlanner: this.props.flightPlanner,
      supportFlightPlanFocus: true,
      drawEntirePlan: this.drawEntirePrimaryPlan,
      nominalFocusMargins: VecNMath.create(4, 40, 40, 40, 40),

      ...MapBuilder.ownAirplaneIconOptions(this.props.config),

      trafficSystem: this.props.trafficSystem,
      trafficIconOptions: {
        iconSize: 30,
        font: 'DejaVuSans-SemiBold',
        fontSize: 14
      },

      windDataProvider: this.props.windDataProvider,

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      relativeTerrainStatusIndicatorIconPath: MapBuilder.relativeTerrainIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus),

      iauIndex: MapBuilder.getIauIndexForDisplayPane(this.props.index),
      iauSettingManager: this.props.iauSettingManager
    })
    .withProjectedSize(this.mapSize)
    .build('common-map nav-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;

        /** The flight plan focus module. */
        [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;
      },
      any,
      {
        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);
  private readonly mapFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);

  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);
  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);

  private readonly mapPointerActiveSetting = DisplayPanesUserSettings.getDisplayPaneManager(this.props.bus, this.props.index).getSetting('displayPaneMapPointerActive');

  private focusedPlanIndex = -1;
  private readonly focusedPlanName = Subject.create<string | VNode>('');

  private setFocusOpId = 0;

  private readonly mapInsetModeSetting = this.mapSettingManager.getSetting('mapInsetMode');
  private readonly mapInsetTextCumulativeSetting = this.mapSettingManager.getSetting('mapInsetTextCumulative');

  private readonly insetMode = Subject.create(NavigationMapPaneInsetMode.None);

  private pointerActivePipe?: Subscription;
  private planNameTitlePipe?: Subscription;
  private planNameSetSub?: Subscription;
  private planNameDeleteSub?: Subscription;
  private planOriginDestSub?: Subscription;
  private mapInsetSettingModeSub?: Subscription;

  /** @inheritdoc */
  public override onAfterRender(): void {
    this._title.set('Navigation Map');

    this.compiledMap.ref.instance.sleep();

    this.pointerActivePipe = this.mapPointerModule.isActive.pipe(this.mapPointerActiveSetting, true);

    this.planNameTitlePipe = this.focusedPlanName.pipe(this._title, name => `Flight Plan – ${name}`, true);

    this.planNameSetSub = this.props.flightPlanner.onEvent('fplUserDataSet').handle(e => {
      if (e.planIndex === this.focusedPlanIndex && e.key === 'name') {
        this.focusedPlanName.set(G3000FPLUtils.getFlightPlanDisplayName(this.props.flightPlanner.getFlightPlan(this.focusedPlanIndex)));
      }
    });
    this.planNameDeleteSub = this.props.flightPlanner.onEvent('fplUserDataDelete').handle(e => {
      if (e.planIndex === this.focusedPlanIndex && e.key === 'name') {
        this.focusedPlanName.set(G3000FPLUtils.getFlightPlanDisplayName(this.props.flightPlanner.getFlightPlan(this.focusedPlanIndex)));
      }
    });
    this.planOriginDestSub = this.props.flightPlanner.onEvent('fplOriginDestChanged').handle(e => {
      if (e.planIndex === this.focusedPlanIndex) {
        this.focusedPlanName.set(G3000FPLUtils.getFlightPlanDisplayName(this.props.flightPlanner.getFlightPlan(this.focusedPlanIndex)));
      }
    });

    this.mapInsetSettingModeSub = this.mapInsetModeSetting.sub(mode => {
      switch (mode) {
        case MapInsetSettingMode.VertSituationDisplay:
          this.insetMode.set(NavigationMapPaneInsetMode.VertSituationDisplay);
          break;
        case MapInsetSettingMode.FlightPlanText:
          this.insetMode.set(NavigationMapPaneInsetMode.FlightPlanText);
          break;
        case MapInsetSettingMode.FlightPlanProgress:
          this.insetMode.set(NavigationMapPaneInsetMode.FlightPlanProgress);
          break;
        default:
          this.insetMode.set(NavigationMapPaneInsetMode.None);
      }
    }, false, true);

    this.insetMode.sub(this.onInsetModeChanged.bind(this), true);
  }

  /**
   * Responds to when this pane's inset mode changes.
   * @param mode The new inset mode.
   */
  private onInsetModeChanged(mode: NavigationMapPaneInsetMode): void {
    this.updateMapSize();

    this.rootCssClass.toggle('nav-map-pane-inset-none', mode === NavigationMapPaneInsetMode.None);
    this.rootCssClass.toggle('nav-map-pane-inset-vsd', mode === NavigationMapPaneInsetMode.VertSituationDisplay);
    this.rootCssClass.toggle('nav-map-pane-inset-fpl', mode === NavigationMapPaneInsetMode.FlightPlanText);
    this.rootCssClass.toggle('nav-map-pane-inset-fpr', mode === NavigationMapPaneInsetMode.FlightPlanProgress);

    this.activeInsetView?.onPause();
    this.activeInsetView = this.insetModeToViewMap[mode]?.getOrDefault() ?? undefined;
    this.activeInsetView?.onResume(this.displayPaneSizeMode.get(), this.paneSize[0], this.paneSize[1]);
  }

  /**
   * Updates the size of this pane's map.
   */
  private updateMapSize(): void {
    switch (this.insetMode.get()) {
      case NavigationMapPaneInsetMode.VertSituationDisplay:
        this.mapSize.set(this.paneSize[0], this.isPfd ? NavigationMapPaneView.VSD_MAP_HEIGHT_PFD : NavigationMapPaneView.VSD_MAP_HEIGHT_MFD);
        break;
      case NavigationMapPaneInsetMode.FlightPlanText:
        this.mapSize.set(this.paneSize[0], NavigationMapPaneView.FLIGHT_PLAN_TEXT_MAP_HEIGHT);
        break;
      default:
        this.mapSize.set(this.paneSize);
    }
  }

  /** @inheritdoc */
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.displayPaneSizeMode.set(size);
    Vec2Math.set(width, height, this.paneSize);
    this.updateMapSize();

    this.mapInsetSettingModeSub?.resume(true);
    this.compiledMap.ref.instance.wake();
    this.pointerActivePipe?.resume(true);
    this.activeInsetView?.onResume(size, width, height);
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.mapInsetSettingModeSub?.pause();
    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
    this.pointerActivePipe?.pause();
    this.mapPointerActiveSetting.value = false;
    this.activeInsetView?.onPause();
  }

  /** @inheritdoc */
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.displayPaneSizeMode.set(size);
    Vec2Math.set(width, height, this.paneSize);
    this.updateMapSize();
    this.activeInsetView?.onResize(size, width, height);
  }

  /** @inheritdoc */
  public override onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
    this.activeInsetView?.onUpdate(time);
  }

  /** @inheritdoc */
  public onEvent(event: DisplayPaneViewEvent<NavigationMapPaneViewEventTypes>): void {
    switch (event.eventType) {
      case 'display_pane_map_range_inc':
        this.changeRangeIndex(1);
        break;
      case 'display_pane_map_range_dec':
        this.changeRangeIndex(-1);
        break;
      case 'display_pane_map_pointer_active_set':
        this.mapPointerController.setPointerActive(event.eventData as boolean);
        break;
      case 'display_pane_map_pointer_active_toggle':
        this.mapPointerController.togglePointerActive();
        break;
      case 'display_pane_map_pointer_move': {
        if (this.mapPointerModule.isActive.get()) {
          const eventData = event.eventData as [number, number];
          this.mapPointerController.movePointer(eventData[0], eventData[1]);
        }
        break;
      }
      case 'display_pane_nav_map_fpl_focus_set':
        this.setFlightPlanFocus(event.eventData as NavigationMapPaneFlightPlanFocusData);
        break;
      case 'display_pane_nav_map_text_inset_update':
        this.flightPlanTextInset.getOrDefault()?.onFlightPlanTextInsetEvent(event.eventData as FlightPlanTextUpdateData);
        break;
    }
  }

  /**
   * Changes this view's map range index.
   * @param delta The change in index to apply.
   */
  private changeRangeIndex(delta: number): void {
    const oldIndex = this.mapRangeModule.nominalRangeIndex.get();
    const newIndex = this.mapRangeController.changeRangeIndex(delta);

    if (newIndex !== oldIndex) {
      this.mapPointerController.targetPointer();
    }
  }

  /**
   * Sets the flight plan focus for this view's map.
   * @param data Data defining the flight plan focus to set.
   */
  private async setFlightPlanFocus(data: NavigationMapPaneFlightPlanFocusData): Promise<void> {
    this.planNameTitlePipe?.pause();

    if (data.planIndex < 0 || !this.props.flightPlanner.hasFlightPlan(data.planIndex)) {
      this.focusedPlanIndex = -1;
      this.drawEntirePrimaryPlan.set(false);
      this.mapFocusModule.planHasFocus.set(false);
      this.mapFocusModule.focus.set(null);

      this._title.set('Navigation Map');
      return;
    }

    // TODO: Support standby flight plan

    const plan = this.props.flightPlanner.getFlightPlan(data.planIndex);

    this.focusedPlanIndex = data.planIndex;
    let focus: FlightPlanFocus = Array.from(plan.legs(false, data.globalLegIndexStart, data.globalLegIndexEnd));
    if (focus.length === 0) {
      focus = null;
    }

    this.drawEntirePrimaryPlan.set(data.planIndex === Fms.PRIMARY_PLAN_INDEX);
    this.mapFocusModule.focus.set(focus);
    this.mapFocusModule.planHasFocus.set(data.planIndex === Fms.PRIMARY_PLAN_INDEX);

    const opId = ++this.setFocusOpId;

    const name = await this.getFlightPlanFocusName(plan, data.segmentIndex, data.globalLegIndex);

    if (opId !== this.setFocusOpId) {
      return;
    }

    if (typeof name === 'string') {
      this.focusedPlanName.set(name);
      this.planNameTitlePipe?.resume(true);
    } else {
      this._title.set((
        <div class='nav-map-title'>
          <span>FlightPlan – </span>
          {name}
        </div>
      ));
    }
  }

  /**
   * Gets the name of a flight plan focus. The name is represented as a string containing the name of the flight plan
   * if the focus has no associated segment or leg, or as a VNode if there is the focus does have an associated segment
   * or leg.
   * @param plan The focused flight plan.
   * @param segmentIndex The index of the flight plan segment associated with the focus, or `-1` if there is no
   * associated segment.
   * @param globalLegIndex The index of the first flight plan leg in the focus, or `-1` if the focus is empty.
   * @returns A Promise which will be fulfilled with the name of the specified flight plan focus.
   */
  private async getFlightPlanFocusName(plan: FlightPlan, segmentIndex: number, globalLegIndex: number): Promise<string | VNode> {
    const segment = plan.tryGetSegment(segmentIndex);
    const leg = plan.tryGetLeg(globalLegIndex);

    if (segment === null && leg === null) {
      return G3000FPLUtils.getFlightPlanDisplayName(plan);
    }

    if (segment !== null) {
      switch (segment.segmentType) {
        case FlightPlanSegmentType.Departure:
          if (
            plan.procedureDetails.departureIndex >= 0
            && plan.procedureDetails.departureFacilityIcao !== undefined
            && ICAO.isFacility(plan.procedureDetails.departureFacilityIcao, FacilityType.Airport)
          ) {
            const airport = await this.props.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.departureFacilityIcao);
            return (
              <div>
                {FmsUtils.getDepartureNameAsString(
                  airport,
                  airport.departures[plan.procedureDetails.departureIndex],
                  plan.procedureDetails.departureTransitionIndex,
                  plan.procedureDetails.originRunway
                )}
              </div>
            );
          } else if (plan.originAirport !== undefined && ICAO.isFacility(plan.originAirport, FacilityType.Airport)) {
            return (
              <div>{ICAO.getIdent(plan.originAirport)}</div>
            );
          }
          break;
        case FlightPlanSegmentType.Enroute:
          if (segment.airway !== undefined) {
            return (
              <div>{segment.airway}</div>
            );
          }
          break;
        case FlightPlanSegmentType.Arrival:
          if (
            plan.procedureDetails.arrivalIndex >= 0
            && plan.procedureDetails.arrivalFacilityIcao !== undefined
            && ICAO.isFacility(plan.procedureDetails.arrivalFacilityIcao, FacilityType.Airport)
          ) {
            const airport = await this.props.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.arrivalFacilityIcao);
            return (
              <div>
                {FmsUtils.getArrivalNameAsString(
                  airport,
                  airport.arrivals[plan.procedureDetails.arrivalIndex],
                  plan.procedureDetails.arrivalTransitionIndex,
                  plan.procedureDetails.arrivalRunway
                )}
              </div>
            );
          }
          break;
        case FlightPlanSegmentType.Approach:
          if (
            plan.procedureDetails.approachFacilityIcao !== undefined
            && ICAO.isFacility(plan.procedureDetails.approachFacilityIcao, FacilityType.Airport)
          ) {
            const airport = await this.props.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.approachFacilityIcao);
            const approach = FmsUtils.getApproachFromPlan(plan, airport);

            if (approach !== undefined && approach.approachType !== GarminAdditionalApproachType.APPROACH_TYPE_VFR) {
              return (
                <ApproachNameDisplay
                  approach={approach}
                  airport={airport}
                  useZeroWithSlash
                />
              );
            }
          }
          break;
        case FlightPlanSegmentType.Destination:
          if (plan.destinationAirport !== undefined && ICAO.isFacility(plan.destinationAirport, FacilityType.Airport)) {
            return (
              <div>{ICAO.getIdent(plan.destinationAirport)}</div>
            );
          }
          break;
      }
    } else {
      const prevLeg = plan.tryGetLeg(globalLegIndex - 1);
      return (
        <div>
          {prevLeg !== null && (<>{this.getLegName(prevLeg)}<span>/</span></>)}{this.getLegName(leg as LegDefinition)}
        </div>
      );
    }

    return G3000FPLUtils.getFlightPlanDisplayName(plan);
  }

  /**
   * Gets the displayed name of a flight plan leg as part of a flight plan focus.
   * @param leg A flight plan leg.
   * @returns The displayed name of the specified flight plan leg as part of a flight plan focus, as a VNode.
   */
  private getLegName(leg: LegDefinition): VNode {
    switch (leg.leg.type) {
      case LegType.HF:
      case LegType.HM:
      case LegType.HA:
      case LegType.PI:
        return <span>{ICAO.getIdent(leg.leg.fixIcao)}</span>;
      case LegType.CA:
      case LegType.VA:
        return <><span>{UnitType.METER.convertTo(leg.leg.altitude1, UnitType.FOOT).toFixed(0)}</span><span class='numberunit-unit-small'>FT</span></>;
      default:
        return <span>{leg.name ?? ICAO.getIdent(leg.leg.fixIcao)}</span>;
    }
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      <div class={this.rootCssClass}>
        {this.compiledMap.map}
        <div class="nav-map-pane-inset-container">
          <div class="vertical-situation-display-inset">
            VSD Not Available
          </div>
          <FlightPlanTextInset
            ref={this.flightPlanTextInset}
            index={this.props.index}
            bus={this.props.bus}
            flightPlanStore={this.props.flightPlanStore}
            flightPlanListManager={this.props.flightPlanListManager}
            mapInsetTextCumulativeSetting={this.mapInsetTextCumulativeSetting}
            vnavDataProvider={this.props.vnavDataProvider}
          />
          <div class="flight-plan-progress-inset">
            Flight Plan Progress Not Available
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.compiledMap.ref.instance.destroy();

    this.pointerActivePipe?.destroy();
    this.planNameSetSub?.destroy();
    this.planNameDeleteSub?.destroy();
    this.planOriginDestSub?.destroy();
    this.mapInsetSettingModeSub?.destroy();

    this.flightPlanTextInset.getOrDefault()?.destroy();

    super.destroy();
  }
}