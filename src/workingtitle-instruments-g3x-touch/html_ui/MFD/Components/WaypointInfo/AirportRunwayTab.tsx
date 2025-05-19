import {
  AirportRunway, CompiledMapSystem, DebounceTimer, Facility, FacilityLoader, FacilityType, FacilityUtils, FSComponent, MapIndexedRangeModule, MappedSubject,
  MapSystemBuilder, MathUtils, Metar, MetarWindSpeedUnits, NodeReference, ReadonlyFloat64Array, RunwaySurfaceCategory, RunwayUtils, Subject, Subscribable,
  Subscription, Unit, UnitFamily, UnitType, UserSettingManager, Vec2Math, Vec2Subject, Vec3Math, Vec3Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  AirportWaypoint, GarminMapKeys, MapRangeController, TouchPad, WaypointInfoStore, WaypointMapRTRController, WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { G3XWaypointMapBuilder } from '../../../Shared/Components/Map/Assembled/G3XWaypointMapBuilder';
import { MapDragPanController } from '../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { MapDragPanModule } from '../../../Shared/Components/Map/Modules/MapDragPanModule';
import { AbstractTabbedContent } from '../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../Shared/Components/TabbedContainer/TabbedContent';
import { G3XFmsUtils } from '../../../Shared/FlightPlan/G3XFmsUtils';
import { G3XUnitFormatter } from '../../../Shared/Graphics/Text/G3XUnitFormatter';
import { G3XUnitsUserSettingManager } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../../Shared/Settings/MapUserSettings';
import { UiFocusController } from '../../../Shared/UiSystem/UiFocusController';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';
import { UiListSelectTouchButton } from '../TouchButton/UiListSelectTouchButton';

import './AirportRunwayTab.css';

/**
 * Component props for {@link AirportRunwayTab}.
 */
export interface AirportRunwayTabProps extends TabbedContentProps {
  /** The UI service. */
  uiService: UiService;

  /** A reference to the root element of the container of the tab's parent UI view. */
  containerRef: NodeReference<HTMLElement>;

  /** Whether the tab is allowed to handle bezel rotary knob push interactions. */
  allowKnobPush: Subscribable<boolean>;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** Information on the waypoint to display. */
  waypointInfo: WaypointInfoStore;

  /** The dimensions of the tab's content area, as `[width, height]` in pixels. */
  tabContentDimensions: Subscribable<ReadonlyFloat64Array>;

  /** The ID to assign to the Bing instance bound to the tab's map. */
  mapBingId: string;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for map user settings. */
  mapSettingManager: UserSettingManager<Partial<G3XMapUserSettingTypes>>;

  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * An airport runway tab.
 */
export class AirportRunwayTab extends AbstractTabbedContent<AirportRunwayTabProps> {
  private static readonly EMPTY_RUNWAYS = [];

  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds

  private static readonly UNIT_FORMATTER = G3XUnitFormatter.createBasic();

  private static readonly LABEL_TEXT_FORMATTER = (runway: AirportRunway | null): string => {
    return runway ? `Runway ${RunwayUtils.getRunwayPairNameString(runway)}` : '––––';
  };

  private static readonly SURFACE_TEXT_FORMATTER = (runway: AirportRunway | null): string => {
    if (runway === null) {
      return '';
    }

    switch (RunwayUtils.getSurfaceCategory(runway)) {
      case RunwaySurfaceCategory.Hard:
        return 'Hard Surface';
      case RunwaySurfaceCategory.Soft:
        return 'Soft Surface';
      case RunwaySurfaceCategory.Water:
        return 'Water Surface';
      default:
        return 'Unknown Surface';
    }
  };

  private static readonly DIMENSIONS_FORMATTER = ([runway, displayUnit]: readonly [AirportRunway | null, Unit<UnitFamily.Distance>]): string => {
    if (runway === null) {
      return '';
    }

    const length = Math.round(UnitType.METER.convertTo(runway.length, displayUnit));
    const width = Math.round(UnitType.METER.convertTo(runway.width, displayUnit));

    return `${length} × ${width}${AirportRunwayTab.UNIT_FORMATTER(displayUnit).toLowerCase()}`;
  };

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XWaypointMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.facLoader,

      bingId: this.props.mapBingId,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.gduIndex,
      gduSettingManager: this.props.gduSettingManager,

      supportAirportAutoRange: true,
      defaultAirportRangeIndex: 12, // 8 nm
      airportAutoRangeMargins: VecNMath.create(4, 20, 20, 20, 20),

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      settingManager: this.props.mapSettingManager,
      unitsSettingManager: this.props.unitsSettingManager
    })
    .withProjectedSize(this.mapSize)
    .build('airport-runway-tab-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The drag-to-pan module. */
        [G3XMapKeys.DragPan]: MapDragPanModule;

        /** The waypoint selection module. */
        [GarminMapKeys.WaypointSelection]: WaypointMapSelectionModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;

        /** The drag-to-pan controller. */
        [G3XMapKeys.DragPan]: MapDragPanController;

        /** The waypoint RTR controller. */
        [GarminMapKeys.WaypointRTR]: WaypointMapRTRController;
      },
      any
    >;

  private readonly mapDragPanModule = this.compiledMap.context.model.getModule(G3XMapKeys.DragPan);
  private readonly mapWptSelectionModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointSelection);

  private readonly mapDragPanController = this.compiledMap.context.getController(G3XMapKeys.DragPan);
  private readonly mapWptRTRController = this.compiledMap.context.getController(GarminMapKeys.WaypointRTR);

  private dragPanPrimed = false;
  private readonly dragPanThreshold = this.props.uiService.gduFormat === '460' ? 20 : 10;
  private readonly dragStartPos = Vec2Math.create();
  private readonly dragDelta = Vec2Math.create();

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private readonly selectListItemHeightPx = this.props.uiService.gduFormat === '460' ? 70 : 35;
  private readonly selectListItemSpacingPx = this.props.uiService.gduFormat === '460' ? 4 : 2;

  private readonly facilityRunways = this.props.waypointInfo.facility.map<readonly AirportRunway[]>(facility => {
    if (facility === null || !FacilityUtils.isFacilityType(facility, FacilityType.Airport) || facility.runways.length === 0) {
      return AirportRunwayTab.EMPTY_RUNWAYS;
    }

    return facility.runways.slice().sort(G3XFmsUtils.sortRunway);
  });

  private readonly isRunwayButtonVisible = Subject.create(false);

  private readonly selectedRunway = Subject.create<AirportRunway | null>(null);

  private readonly selectedAirportPipe = this.props.waypointInfo.waypoint.pipe(this.mapWptSelectionModule.waypoint, waypoint => {
    return waypoint instanceof AirportWaypoint ? waypoint : null;
  }, true);
  private readonly selectedRunwayPipe = this.selectedRunway.pipe(this.mapWptSelectionModule.runway, true);

  private readonly selectedRunwayLabelText = this.selectedRunway.map(AirportRunwayTab.LABEL_TEXT_FORMATTER).pause();
  private readonly selectedRunwaySurfaceText = this.selectedRunway.map(AirportRunwayTab.SURFACE_TEXT_FORMATTER).pause();
  private readonly selectedRunwayDimensionsText = MappedSubject.create(
    AirportRunwayTab.DIMENSIONS_FORMATTER,
    this.selectedRunway,
    this.props.unitsSettingManager.distanceUnitsSmall
  ).pause();

  private readonly metar = Subject.create<Metar | undefined>(undefined);
  private readonly runwayWindData = Vec3Subject.create(Vec3Math.create(NaN, NaN, NaN)); // [headwind, rightxwind, gust factor]

  private readonly windTitleText = Subject.create('');
  private readonly windValue1Text = Subject.create('');
  private readonly windValue2Text = Subject.create('');

  private readonly windValue1Preferred = Subject.create(false);
  private readonly windValue2Preferred = Subject.create(false);

  private readonly focusController = new UiFocusController();

  private readonly tabContentDimensionsSub = this.props.tabContentDimensions.sub(this.onTabContentDimensionsChanged.bind(this), false, true);

  private readonly subscriptions: Subscription[] = [
    this.tabContentDimensionsSub,
    this.facilityRunways,
    this.selectedAirportPipe,
    this.selectedRunwayDimensionsText
  ];

  private readonly pauseable: Subscription[] = [
    this.selectedRunwayLabelText,
    this.selectedRunwaySurfaceText,
    this.selectedRunwayDimensionsText
  ];

  private needInitialTarget = true;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.compiledMap.ref.instance.sleep();

    this.focusController.setActive(true);

    const windTextState = MappedSubject.create(
      this.selectedRunway,
      this.runwayWindData,
      this.props.unitsSettingManager.speedUnits
    );

    const updateMetarSub = this.props.waypointInfo.facility.sub(this.updateMetar.bind(this), false, true);

    const selectRunwayButtonFocusState = MappedSubject.create(
      this.props.allowKnobPush,
      this.facilityRunways
    );

    const updateSelectRunwayButtonFocusSub = selectRunwayButtonFocusState.sub(this.updateSelectRunwayButtonFocus.bind(this), false, true);

    this.subscriptions.push(
      updateMetarSub,
      windTextState,
      selectRunwayButtonFocusState
    );

    this.pauseable.push(
      updateMetarSub,
      windTextState.sub(this.onRunwayWindDataChanged.bind(this), false, true),
      updateSelectRunwayButtonFocusSub
    );

    MappedSubject.create(
      this.selectedRunway,
      this.metar
    ).sub(this.updateRunwayWindData.bind(this), true);

    this.facilityRunways.sub(this.onFacilityRunwaysChanged.bind(this), true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.tabContentDimensionsSub.resume(true);

    this.compiledMap.ref.instance.wake();

    this.selectedAirportPipe.resume(true);
    this.selectedRunwayPipe.resume(true);

    this.mapWptRTRController.tryTargetWaypoint(true);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.tabContentDimensionsSub.pause();

    this.selectedAirportPipe.pause();
    this.selectedRunwayPipe.pause();

    this.mapDragPanController.setDragPanActive(false);

    this.compiledMap.ref.instance.sleep();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.pauseable) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.pauseable) {
      sub.pause();
    }

    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.mapDragPanModule.isActive.get()) {
      if (this.dragDelta[0] !== 0 || this.dragDelta[1] !== 0) {
        this.mapDragPanController.drag(this.dragDelta[0], this.dragDelta[1]);
        Vec2Math.set(0, 0, this.dragDelta);
      }
    }

    this.compiledMap.ref.instance.update(time);

    // The RTR controller has trouble targeting the airport/runway before the map has been updated once, so we will
    // force it to re-target after the first map update.
    if (this.needInitialTarget) {
      this.mapWptRTRController.tryTargetWaypoint(true);
      this.needInitialTarget = false;
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to changes in the dimensions of this tab's content area.
   * @param tabContentDimensions The new dimensions of this tab's content area, as `[width, height]` in pixels.
   */
  private onTabContentDimensionsChanged(tabContentDimensions: ReadonlyFloat64Array): void {
    // The map takes up the entire width of the content area minus 7px padding and 2px border on each side.
    const mapWidth = tabContentDimensions[0] - 7 * 2 - 2 * 2;
    // The map takes up height of the content area remaining once 237px is subtracted for the runway info block, minus
    // an additional 7px padding and 2px border on each side.
    const mapHeight = tabContentDimensions[1] - 237 - 7 * 2 - 2 * 2;

    this.mapSize.set(mapWidth, mapHeight);

    // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, AirportRunwayTab.MAP_RESIZE_HIDE_DURATION);
  }

  /**
   * Responds to when the list of runways for the displayed facility changes.
   * @param runways The new list of runways for the displayed facility.
   */
  private onFacilityRunwaysChanged(runways: readonly AirportRunway[]): void {
    if (runways.length === 0) {
      this.selectedRunway.set(null);
    } else {
      this.selectedRunway.set(runways[0]);
    }
  }

  /**
   * Updates the UI focus and visibility state of this tab's select runway button.
   */
  private updateSelectRunwayButtonFocus(): void {
    if (this.props.allowKnobPush.get() && this.facilityRunways.get().length > 1) {
      this._knobLabelState.setValue(UiKnobId.SingleInnerPush, 'Runway');
      this._knobLabelState.setValue(UiKnobId.LeftInnerPush, 'Runway');
      this._knobLabelState.setValue(UiKnobId.RightInnerPush, 'Runway');

      this.isRunwayButtonVisible.set(true);
      this.focusController.setFocusIndex(0);
    } else {
      this._knobLabelState.delete(UiKnobId.SingleInnerPush);
      this._knobLabelState.delete(UiKnobId.LeftInnerPush);
      this._knobLabelState.delete(UiKnobId.RightInnerPush);

      this.focusController.removeFocus();
      this.isRunwayButtonVisible.set(this.facilityRunways.get().length > 1);
    }
  }

  private updateMetarOpId = 0;

  /**
   * Updates METAR data for the displayed facility.
   * @param facility The displayed facility.
   */
  private async updateMetar(facility: Facility | null): Promise<void> {
    const opId = ++this.updateMetarOpId;

    this.metar.set(undefined);

    if (facility && FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      const metar = await this.props.facLoader.getMetar(facility);

      if (opId !== this.updateMetarOpId) {
        return;
      }

      this.metar.set(metar);
    }
  }

  /**
   * Updates wind data for the selected runway.
   * @param state The wind data input state, as `[selected runway, METAR data]`.
   */
  private updateRunwayWindData(state: readonly [AirportRunway | null, Metar | undefined]): void {
    const [runway, metar] = state;

    if (!runway || !metar) {
      this.runwayWindData.set(NaN, NaN, NaN);
      return;
    }

    let windSpeedUnit: Unit<UnitFamily.Speed> | undefined;
    switch (metar.windSpeedUnits) {
      case MetarWindSpeedUnits.Knot:
        windSpeedUnit = UnitType.KNOT;
        break;
      case MetarWindSpeedUnits.KilometerPerHour:
        windSpeedUnit = UnitType.KPH;
        break;
      case MetarWindSpeedUnits.MeterPerSecond:
        windSpeedUnit = UnitType.MPS;
        break;
      default:
        windSpeedUnit = undefined;
    }

    if (metar.windSpeed === undefined || !windSpeedUnit || metar.windDir === undefined) {
      this.runwayWindData.set(NaN, NaN, NaN);
      return;
    }

    const windSpeed = UnitType.KNOT.convertFrom(metar.windSpeed, windSpeedUnit);
    const gustFactor = (metar.gust ?? NaN) / windSpeed;

    const primaryAngleDiff = MathUtils.diffAngleDeg(runway.direction, metar.windDir) * Avionics.Utils.DEG2RAD;

    const primaryHeadwind = windSpeed * Math.cos(primaryAngleDiff);
    const primaryCrosswind = windSpeed * Math.sin(primaryAngleDiff);

    this.runwayWindData.set(primaryHeadwind, primaryCrosswind, gustFactor);
  }

  /**
   * Responds to when wind data for the selected runway changes.
   * @param state The wind data state, as `[selected runway, wind data, display unit]`.
   */
  private onRunwayWindDataChanged(state: readonly [AirportRunway | null, ReadonlyFloat64Array, Unit<UnitFamily.Speed>]): void {
    const [runway, wind, displayUnit] = state;

    if (runway && Vec2Math.isFinite(wind)) {
      this.windTitleText.set('Wind');

      const [primaryName, secondaryName] = RunwayUtils.getRunwayPairNameString(runway).split('-');

      const headwind = UnitType.KNOT.convertTo(wind[0], displayUnit);
      const rightCrosswind = UnitType.KNOT.convertTo(wind[1], displayUnit);

      if (primaryName) {
        this.windValue1Text.set(this.getWindDataText(primaryName, headwind, rightCrosswind, wind[2], displayUnit));
      } else {
        this.windValue1Text.set('');
      }
      if (secondaryName) {
        this.windValue2Text.set(this.getWindDataText(secondaryName, -headwind, -rightCrosswind, wind[2], displayUnit));
      } else {
        this.windValue2Text.set('');
      }

      if (headwind !== 0) {
        this.windValue1Preferred.set(headwind > 0);
        this.windValue2Preferred.set(headwind < 0);
      } else {
        this.windValue1Preferred.set(false);
        this.windValue2Preferred.set(false);
      }
    } else {
      this.windTitleText.set('Wind: No Data');
      this.windValue1Text.set('');
      this.windValue2Text.set('');
      this.windValue1Preferred.set(false);
      this.windValue2Preferred.set(false);
    }
  }

  /**
   * Gets the wind data text to display for a runway.
   * @param name The name of the runway.
   * @param headwind The amount of headwind, in units of type `displayUnit`.
   * @param rightCrosswind The amount of right crosswind, in units of type `displayUnit`.
   * @param gustFactor The scaling factor relating steady-state wind speed to gust speed, or `NaN` if there is no
   * reported gust.
   * @param displayUnit The unit type in which the wind speeds are displayed.
   * @returns The wind data text to display for a runway.
   */
  private getWindDataText(
    name: string,
    headwind: number,
    rightCrosswind: number,
    gustFactor: number,
    displayUnit: Unit<UnitFamily.Speed>
  ): string {
    const headwindAbs = Math.abs(headwind);
    const crosswindAbs = Math.abs(rightCrosswind);

    const headwindText = `${headwind < 0 ? '↑' : '↓'}${headwindAbs.toFixed(0)}${isFinite(gustFactor) ? `G${(headwindAbs * gustFactor).toFixed(0)}` : ''}`;
    const crosswindText = `${rightCrosswind < 0 ? '→' : '←'}${crosswindAbs.toFixed(0)}${isFinite(gustFactor) ? `G${(crosswindAbs * gustFactor).toFixed(0)}` : ''}`;
    return `${name}:${headwindText} ${crosswindText}${AirportRunwayTab.UNIT_FORMATTER(displayUnit).toLowerCase()}`;
  }

  /**
   * Responds to when a drag motion starts on this page's map.
   * @param position The position of the mouse.
   */
  private onDragStarted(position: ReadonlyFloat64Array): void {
    this.dragStartPos.set(position);
    this.dragPanPrimed = true;
  }

  /**
   * Responds to when the mouse moves while dragging over this page's map.
   * @param position The new position of the mouse.
   * @param prevPosition The position of the mouse at the previous update.
   */
  private onDragMoved(position: ReadonlyFloat64Array, prevPosition: ReadonlyFloat64Array): void {
    if (this.mapDragPanModule.isActive.get()) {
      // Drag-to-pan is active. Accumulate dragging deltas so that they can be applied at the next update cycle.

      this.dragDelta[0] += position[0] - prevPosition[0];
      this.dragDelta[1] += position[1] - prevPosition[1];
    } else if (this.dragPanPrimed) {
      // Drag-to-pan is not active but is primed. If the user has dragged farther than the threshold required to
      // activate drag-to-pan, then do so.

      const dx = position[0] - this.dragStartPos[0];
      const dy = position[1] - this.dragStartPos[1];

      if (Math.hypot(dx, dy) >= this.dragPanThreshold) {
        this.dragPanPrimed = false;

        this.mapDragPanController.setDragPanActive(true);
        this.mapDragPanController.drag(dx, dy);
      }
    }
  }

  /**
   * Responds to when a drag motion ends on this page's map.
   */
  private onDragEnded(): void {
    this.dragPanPrimed = false;
    Vec2Math.set(0, 0, this.dragDelta);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='airport-runway-tab'>
        <div class='airport-runway-tab-map-container'>
          <div class={{ 'visibility-hidden': this.mapHidden }}>
            <TouchPad
              bus={this.props.uiService.bus}
              onDragStarted={this.onDragStarted.bind(this)}
              onDragMoved={this.onDragMoved.bind(this)}
              onDragEnded={this.onDragEnded.bind(this)}
              class='airport-runway-tab-map-touch-pad'
            >
              {this.compiledMap.map}
            </TouchPad>
            <div class='ui-layered-darken' />
          </div>
        </div>
        <div class='airport-runway-tab-button-row'>
          <UiListSelectTouchButton
            uiService={this.props.uiService}
            listDialogLayer={UiViewStackLayer.Overlay}
            listDialogKey={UiViewKeys.ListDialog1}
            containerRef={this.props.containerRef}
            openDialogAsPositioned
            isVisible={this.isRunwayButtonVisible}
            state={this.selectedRunway}
            renderValue={<div>{this.selectedRunwayLabelText}</div>}
            listParams={this.generateRunwayListParams.bind(this)}
            focusController={this.focusController}
            class='airport-runway-tab-runway-button'
          />
          <div class={{ 'airport-runway-tab-runway-label': true, 'hidden': this.isRunwayButtonVisible }}>
            {this.selectedRunwayLabelText}
          </div>
        </div>
        <div class='airport-runway-tab-info-row'>
          <div class='airport-runway-tab-info-row-left'>
            <div class='airport-runway-tab-surface'>{this.selectedRunwaySurfaceText}</div>
            <div class='airport-runway-tab-dimensions'>{this.selectedRunwayDimensionsText}</div>
          </div>
          <div class='airport-runway-tab-info-row-right'>
            <div class='airport-runway-tab-wind-title'>{this.windTitleText}</div>
            <div class={{ 'airport-runway-tab-wind-value': true, 'airport-runway-tab-wind-value-preferred': this.windValue1Preferred }}>
              {this.windValue1Text}
            </div>
            <div class={{ 'airport-runway-tab-wind-value': true, 'airport-runway-tab-wind-value-preferred': this.windValue2Preferred }}>
              {this.windValue2Text}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Generates a set of selection list dialog parameters for the user to select a runway from the currently displayed
   * airport.
   * @returns A set of selection list dialog parameters for the user to select a runway from the currently displayed
   * airport.
   */
  private generateRunwayListParams(): UiListDialogParams<AirportRunway | null> {
    const facilityRunways = this.facilityRunways.get();

    if (facilityRunways.length === 0) {
      return {
        inputData: []
      };
    }

    return {
      selectedValue: this.selectedRunway,
      inputData: facilityRunways.map(runway => {
        return {
          value: runway,
          labelRenderer: () => `Runway ${RunwayUtils.getRunwayPairNameString(runway)}`
        };
      }),
      listItemHeightPx: this.selectListItemHeightPx,
      listItemSpacingPx: this.selectListItemSpacingPx,
      itemsPerPage: Math.min(5, facilityRunways.length),
      autoDisableOverscroll: true,
      class: 'airport-runway-tab-select-dialog'
    };
  }

  /** @inheritDoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    this.selectedAirportPipe.destroy();

    super.destroy();
  }
}
