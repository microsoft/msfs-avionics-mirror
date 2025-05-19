import {
  CompiledMapSystem, DebounceTimer, FSComponent, FacilityLoader, FacilityWaypoint, MapIndexedRangeModule,
  MapSystemBuilder, ReadonlyFloat64Array, Subject, UserSettingManager, VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapRangeController, TouchPad, WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { G3XWaypointMapBuilder } from '../../../../Shared/Components/Map/Assembled/G3XWaypointMapBuilder';
import { MapDragPanController } from '../../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { MapDragPanModule } from '../../../../Shared/Components/Map/Modules/MapDragPanModule';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { DisplayUserSettingTypes } from '../../../../Shared/Settings/DisplayUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../../Shared/UiSystem/UiView';
import { UiViewOcclusionType, UiViewSizeMode } from '../../../../Shared/UiSystem/UiViewTypes';

import './MfdWaypointMapPopup.css';

/**
 * Component props for {@link MfdWaypointMapPopup}.
 */
export interface MfdWaypointMapPopupProps extends UiViewProps {
  /** A facility loader. */
  facLoader: FacilityLoader;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A configuration object defining options for the map. */
  mapConfig: MapConfig;
}

/**
 * An MFD Waypoint map popup.
 */
export class MfdWaypointMapPopup extends AbstractUiView<MfdWaypointMapPopupProps> {
  private static readonly DEFAULT_TARGET_RANGE_INDEX = 12; // 8 nm

  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XWaypointMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.facLoader,

      bingId: `g3x-${this.props.uiService.instrumentIndex}-map-1`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      settingManager: MapUserSettings.getStandardManager(this.props.uiService.bus),
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus)
    })
    .withProjectedSize(this.mapSize)
    .build('common-map mfd-waypoint-map') as CompiledMapSystem<
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
      },
      any
    >;

  private readonly mapDragPanModule = this.compiledMap.context.model.getModule(G3XMapKeys.DragPan);
  private readonly mapWptSelectionModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointSelection);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapDragPanController = this.compiledMap.context.getController(G3XMapKeys.DragPan);

  private dragPanPrimed = false;
  private readonly dragPanThreshold = this.props.uiService.gduFormat === '460' ? 20 : 10;
  private readonly dragStartPos = Vec2Math.create();
  private readonly dragDelta = Vec2Math.create();

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  /** @inheritDoc */
  public onAfterRender(): void {
    this._knobLabelState.set([
      [UiKnobId.SingleInner, 'Zoom Map'],
      [UiKnobId.SingleOuter, 'Zoom Map'],
      [UiKnobId.LeftInner, 'Zoom Map'],
      [UiKnobId.LeftOuter, 'Zoom Map'],
      [UiKnobId.RightInner, 'Zoom Map'],
      [UiKnobId.RightOuter, 'Zoom Map'],
    ]);

    this.compiledMap.ref.instance.sleep();

    this.mapRangeController.setRangeIndex(MfdWaypointMapPopup.DEFAULT_TARGET_RANGE_INDEX);
  }

  /**
   * Sets this popup's selected waypoint.
   * @param waypoint The waypoint to select, or `null` to clear the selected waypoint.
   */
  public setSelectedWaypoint(waypoint: FacilityWaypoint | null): void {
    this.mapDragPanController.setDragPanActive(false);

    this.mapWptSelectionModule.waypoint.set(waypoint);

    this.mapRangeController.setRangeIndex(MfdWaypointMapPopup.DEFAULT_TARGET_RANGE_INDEX);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.compiledMap.ref.instance.sleep();
    this.mapDragPanController.setDragPanActive(false);

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);
  }

  /** @inheritDoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /**
   * Updates this page's child components when the size of this page's parent UI view changes.
   * @param sizeMode The new size mode of this page.
   * @param dimensions The new dimensions of this page, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Support GDU470 (portrait)

    // Need to subtract the popup margins and border widths from the map size.
    const horizMargin = sizeMode === UiViewSizeMode.Half ? 7 : 7 * 2;
    this.mapSize.set(dimensions[0] - 3 * 2 - horizMargin, dimensions[1] - 3 * 2 - 7 * 2);

    // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, MfdWaypointMapPopup.MAP_RESIZE_HIDE_DURATION);
  }

  /** @inheritDoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    if (occlusionType === 'hide') {
      this.compiledMap.ref.instance.sleep();
    } else {
      this.compiledMap.ref.instance.wake();
    }
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
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.changeMapRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? 1 : -1);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.changeMapRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? -1 : 1);
        return true;
      case UiInteractionEvent.BackPress:
        if (this.mapDragPanModule.isActive.get()) {
          this.mapDragPanController.setDragPanActive(false);
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Changes this component's map range index.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    this.mapRangeController.changeRangeIndex(delta);
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
      <div class='mfd-waypoint-map-popup'>
        <div class={{ 'mfd-waypoint-map-container': true, 'hidden': this.mapHidden }}>
          <TouchPad
            ref={this.touchPadRef}
            bus={this.props.uiService.bus}
            onDragStarted={this.onDragStarted.bind(this)}
            onDragMoved={this.onDragMoved.bind(this)}
            onDragEnded={this.onDragEnded.bind(this)}
            class='mfd-waypoint-map-popup-touch-pad'
          >
            {this.compiledMap.map}
          </TouchPad>
        </div>
        <div class='ui-layered-darken' />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    this.compiledMap.ref.getOrDefault()?.destroy();
    this.touchPadRef.getOrDefault()?.destroy();

    super.destroy();
  }
}