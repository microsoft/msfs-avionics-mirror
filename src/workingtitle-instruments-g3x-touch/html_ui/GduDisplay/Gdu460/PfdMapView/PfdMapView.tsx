import {
  CompiledMapSystem, FSComponent, MapIndexedRangeModule, MapSystemBuilder, ReadonlyFloat64Array, Subject,
  Subscription, UserSettingManager, VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapOrientation, MapRangeController, TouchPad, TrafficSystem
} from '@microsoft/msfs-garminsdk';

import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { G3XNavMapBuilder } from '../../../Shared/Components/Map/Assembled/G3XNavMapBuilder';
import { MapDragPanController } from '../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { G3XMapCompassArcModule } from '../../../Shared/Components/Map/Modules/G3XMapCompassArcModule';
import { MapDragPanModule } from '../../../Shared/Components/Map/Modules/MapDragPanModule';
import { MapOrientationOverrideModule } from '../../../Shared/Components/Map/Modules/MapOrientationOverrideModule';
import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { G3XTrafficUserSettings } from '../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewOcclusionType, UiViewSizeMode } from '../../../Shared/UiSystem/UiViewTypes';

import './PfdMapView.css';

/**
 * Component props for PfdMapView.
 */
export interface PfdMapViewProps extends UiViewProps {
  /** The traffic system used by the view's map to display traffic, or `null` if there is no traffic system. */
  trafficSystem: TrafficSystem | null;

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
 * A PFD map view.
 */
export class PfdMapView extends AbstractUiView<PfdMapViewProps> {
  private static readonly DEFAULT_RANGE_INDEX = 7; // 0.8 nautical miles

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapTrackUpTargetOffset = Vec2Subject.create(Vec2Math.create());

  private readonly mapCompassArcAngularWidth = Subject.create(110);

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XNavMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      bingId: `g3x-${this.props.uiService.gduIndex}-map-2`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.gduIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: 60,
      targetOffsets: {
        [MapOrientation.TrackUp]: this.mapTrackUpTargetOffset,
        [MapOrientation.DtkUp]: this.mapTrackUpTargetOffset
      },

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      compassArcOptions: {
        arcAngularWidth: this.mapCompassArcAngularWidth,
        arcTopMargin: 40,
        bearingTickMajorLength: 15,
        bearingTickMinorLength: 10,
        bearingLabelFont: 'DejaVuSans-SemiBold',
        bearingLabelMajorFontSize: 24,
        bearingLabelMinorFontSize: 22,
        bearingLabelRadialOffset: 14,
        readoutBorderSize: Vec2Math.create(72, 40)
      },

      flightPlanner: this.props.fplSourceDataProvider.flightPlanner,
      lnavIndex: this.props.fplSourceDataProvider.lnavIndex,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,

      trafficSystem: this.props.trafficSystem ?? undefined,
      trafficIconOptions: {
        iconSize: 30,
        fontSize: 14
      },

      includeOrientationToggle: true,

      settingManager: MapUserSettings.getStandardManager(this.props.uiService.bus),
      trafficSettingManager: G3XTrafficUserSettings.getManager(this.props.uiService.bus),
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus),

      useRangeUserSettingByDefault: false
    })
    .withProjectedSize(this.mapSize)
    .build('common-map pfd-nav-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The orientation override module. */
        [G3XMapKeys.OrientationOverride]: MapOrientationOverrideModule;

        /** The compass arc module. */
        [G3XMapKeys.CompassArc]: G3XMapCompassArcModule;

        /** The drag-to-pan module. */
        [G3XMapKeys.DragPan]: MapDragPanModule;
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

  private readonly mapOrientationOverrideModule = this.compiledMap.context.model.getModule(G3XMapKeys.OrientationOverride);
  private readonly mapCompassArcModule = this.compiledMap.context.model.getModule(G3XMapKeys.CompassArc);
  private readonly mapDragPanModule = this.compiledMap.context.model.getModule(G3XMapKeys.DragPan);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapDragPanController = this.compiledMap.context.getController(G3XMapKeys.DragPan);

  private dragPanPrimed = false;
  private readonly dragPanThreshold = this.props.uiService.gduFormat === '460' ? 20 : 10;
  private readonly dragStartPos = Vec2Math.create();
  private readonly dragDelta = Vec2Math.create();

  private avionicsStatusSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._knobLabelState.set([
      [UiKnobId.LeftInner, 'Zoom Map'],
      [UiKnobId.LeftOuter, 'Zoom Map'],
      [UiKnobId.RightInner, 'Zoom Map'],
      [UiKnobId.RightOuter, 'Zoom Map']
    ]);

    this.compiledMap.ref.instance.sleep();

    this.mapCompassArcModule.showMinorBearingLabels.set(true);
    this.mapCompassArcModule.showReadout.set(true);

    this.reset();

    this.avionicsStatusSub = this.props.uiService.bus.getSubscriber<AvionicsStatusEvents>()
      .on(`avionics_status_${this.props.uiService.instrumentIndex}`)
      .handle(this.onAvionicsStatusChanged.bind(this));
  }

  /** @inheritdoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.mapDragPanController.setDragPanActive(false);
    this.mapOrientationOverrideModule.orientationOverride.set(null);

    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /**
   * Updates this page's child components when the size of this page's parent UI view changes.
   * @param sizeMode The new size mode of this page.
   * @param dimensions The new dimensions of this page, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.mapSize.set(dimensions);

    if (sizeMode === UiViewSizeMode.Full) {
      this.mapTrackUpTargetOffset.set(0, 0.39);
      this.mapCompassArcAngularWidth.set(110);
    } else {
      this.mapTrackUpTargetOffset.set(0, 0.25);
      this.mapCompassArcAngularWidth.set(70);
    }
  }

  /** @inheritdoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    if (occlusionType === 'hide') {
      this.compiledMap.ref.instance.sleep();
    } else {
      this.compiledMap.ref.instance.wake();
    }
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    if (this.mapDragPanModule.isActive.get()) {
      if (this.dragDelta[0] !== 0 || this.dragDelta[1] !== 0) {
        this.mapDragPanController.drag(this.dragDelta[0], this.dragDelta[1]);
        Vec2Math.set(0, 0, this.dragDelta);
      }
    }

    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.changeRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? 1 : -1);
        return true;
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.changeRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? -1 : 1);
        return true;
    }

    return false;
  }

  /**
   * Changes this page's map range index.
   * @param delta The change in index to apply.
   */
  private changeRangeIndex(delta: number): void {
    this.mapRangeController.changeRangeIndex(delta);
  }

  /**
   * Responds to when the avionics status of this page's parent GDU changes.
   * @param event The event describing the avionics status change.
   */
  private onAvionicsStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    if (event.current === AvionicsStatus.Off) {
      this.reset();
    }
  }

  /**
   * Resets this page in response to a power cycle.
   */
  private reset(): void {
    this.mapRangeController.setRangeIndex(PfdMapView.DEFAULT_RANGE_INDEX);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='pfd-map-view'>
        <TouchPad
          ref={this.touchPadRef}
          bus={this.props.uiService.bus}
          onDragStarted={this.onDragStarted.bind(this)}
          onDragMoved={this.onDragMoved.bind(this)}
          onDragEnded={this.onDragEnded.bind(this)}
          class='pfd-map-view-touch-pad'
        >
          {this.compiledMap.map}
        </TouchPad>
        <div class='ui-layered-darken' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.compiledMap.ref.getOrDefault()?.destroy();
    this.touchPadRef.getOrDefault()?.destroy();

    this.avionicsStatusSub?.destroy();

    super.destroy();
  }
}