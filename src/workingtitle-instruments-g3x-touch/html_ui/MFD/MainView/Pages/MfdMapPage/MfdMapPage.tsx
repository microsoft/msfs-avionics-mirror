import {
  CompiledMapSystem, DebounceTimer, FSComponent, FacilityLoader, MapIndexedRangeModule, MapSystemBuilder,
  ReadonlyFloat64Array, Subject, Subscription, UserSettingManager, VNode, Vec2Math, Vec2Subject, VecNMath
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapOrientation, MapRangeController, TouchPad, TrafficSystem
} from '@microsoft/msfs-garminsdk';

import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../../../../Shared/AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../../../../Shared/AvionicsStatus/AvionicsStatusTypes';
import { G3XNavMapBuilder } from '../../../../Shared/Components/Map/Assembled/G3XNavMapBuilder';
import { MapDragPanController } from '../../../../Shared/Components/Map/Controllers/MapDragPanController';
import { G3XMapKeys } from '../../../../Shared/Components/Map/G3XMapKeys';
import { MapConfig } from '../../../../Shared/Components/Map/MapConfig';
import { G3XMapCompassArcModule } from '../../../../Shared/Components/Map/Modules/G3XMapCompassArcModule';
import { MapDragPanModule } from '../../../../Shared/Components/Map/Modules/MapDragPanModule';
import { MapOrientationOverrideModule } from '../../../../Shared/Components/Map/Modules/MapOrientationOverrideModule';

import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { DisplayUserSettingTypes } from '../../../../Shared/Settings/DisplayUserSettings';
import { G3XTrafficUserSettings } from '../../../../Shared/Settings/G3XTrafficUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../../Shared/Settings/MapUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewLifecyclePolicy, UiViewOcclusionType, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { AbstractMfdPage } from '../../../PageNavigation/AbstractMfdPage';
import { MfdPageProps } from '../../../PageNavigation/MfdPage';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { MfdMapOptionsPopup } from './MfdMapOptionsPopup';
import { MfdMapSetupPopup } from './MfdMapSetupPopup';

import './MfdMapPage.css';

/**
 * Component props for MfdMapPage.
 */
export interface MfdMapPageProps extends MfdPageProps {
  /** A facility loader. */
  facLoader: FacilityLoader;

  /** The traffic system used by the page's map to display traffic, or `null` if there is no traffic system. */
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
 * UI view keys for popups owned by the MFD map page.
 */
enum MfdMapPagePopupKeys {
  MapOptions = 'MfdMapPageOptions'
}

/**
 * An MFD map page.
 */
export class MfdMapPage extends AbstractMfdPage<MfdMapPageProps> {
  private static readonly DEFAULT_RANGE_INDEX = 7; // 0.8 nautical miles

  private static readonly MAP_RESIZE_HIDE_DURATION = 250; // milliseconds

  private readonly touchPadRef = FSComponent.createRef<TouchPad>();

  private readonly mapSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapTrackUpTargetOffset = Vec2Subject.create(Vec2Math.create());

  private readonly mapCompassArcAngularWidth = Subject.create(110);

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XNavMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.facLoader,

      bingId: `g3x-${this.props.uiService.instrumentIndex}-map-1`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,
      targetOffsets: {
        [MapOrientation.TrackUp]: this.mapTrackUpTargetOffset,
        [MapOrientation.DtkUp]: this.mapTrackUpTargetOffset
      },

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      // TODO: Support GDU470 (portrait)
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
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus)
    })
    .withProjectedSize(this.mapSize)
    .withDeadZone(VecNMath.create(4, 0, 0, 0, 1))
    .build('common-map mfd-nav-map') as CompiledMapSystem<
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

  private readonly mapHiddenDebounce = new DebounceTimer();
  private readonly mapHidden = Subject.create(false);
  private readonly showMapFunc = this.mapHidden.set.bind(this.mapHidden, false);

  private avionicsStatusSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Map');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_map.png`);

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Static, UiViewKeys.MapSetup,
      (uiService, containerRef) => {
        return (
          <MfdMapSetupPopup
            uiService={uiService}
            containerRef={containerRef}
            facLoader={this.props.facLoader}
            trafficSystem={this.props.trafficSystem}
            fplSourceDataProvider={this.props.fplSourceDataProvider}
            gduSettingManager={this.props.gduSettingManager}
            displaySettingManager={this.props.displaySettingManager}
            mapConfig={this.props.mapConfig}
            mapOrientationOverride={this.mapOrientationOverrideModule.orientationOverride}
          />
        );
      }
    );

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, MfdMapPagePopupKeys.MapOptions,
      (uiService, containerRef) => {
        return (
          <MfdMapOptionsPopup
            uiService={uiService}
            containerRef={containerRef}
            supportTraffic={this.props.trafficSystem !== null}
          />
        );
      }
    );

    this._knobLabelState.setValue(UiKnobId.SingleInner, 'Zoom Map');
    this._knobLabelState.setValue(UiKnobId.LeftInner, 'Zoom Map');
    this._knobLabelState.setValue(UiKnobId.RightInner, 'Zoom Map');

    this.compiledMap.ref.instance.sleep();

    this.mapCompassArcModule.showMinorBearingLabels.set(true);
    this.mapCompassArcModule.showReadout.set(true);

    this.reset();

    this.avionicsStatusSub = this.props.uiService.bus.getSubscriber<AvionicsStatusEvents>()
      .on(`avionics_status_${this.props.uiService.instrumentIndex}`)
      .handle(this.onAvionicsStatusChanged.bind(this));
  }

  /** @inheritdoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.mapDragPanController.setDragPanActive(false);
    this.mapOrientationOverrideModule.orientationOverride.set(null);

    this.compiledMap.ref.instance.sleep();

    this.mapHiddenDebounce.clear();
    this.mapHidden.set(true);
  }

  /** @inheritdoc */
  public onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /**
   * Updates this page's child components when the size of this page's parent UI view changes.
   * @param sizeMode The new size mode of this page.
   * @param dimensions The new dimensions of this page, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    // TODO: Support GDU470 (portrait)

    this.mapSize.set(dimensions);

    if (sizeMode === MfdPageSizeMode.Full) {
      this.mapTrackUpTargetOffset.set(0, 0.39);
      this.mapCompassArcAngularWidth.set(110);
    } else {
      this.mapTrackUpTargetOffset.set(0, 0.25);
      this.mapCompassArcAngularWidth.set(70);
    }

    // Hide the map for a short period after resizing so that users don't see any artifacts from the Bing map texture.
    this.mapHidden.set(true);
    this.mapHiddenDebounce.schedule(this.showMapFunc, MfdMapPage.MAP_RESIZE_HIDE_DURATION);
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
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.changeRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? 1 : -1);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.changeRangeIndex(this.props.displaySettingManager.getSetting('displayKnobZoomReverse').value ? -1 : 1);
        return true;
      case UiInteractionEvent.BackPress:
        if (this.mapDragPanModule.isActive.get()) {
          this.mapDragPanController.setDragPanActive(false);
          return true;
        }
        break;
      case UiInteractionEvent.MenuPress:
        this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, MfdMapPagePopupKeys.MapOptions, false, { popupType: 'slideout-bottom-full' });
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
    this.mapRangeController.setRangeIndex(MfdMapPage.DEFAULT_RANGE_INDEX);
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
      <div class='mfd-map-page'>
        <div class={{ 'mfd-nav-map-container': true, 'hidden': this.mapHidden }}>
          <TouchPad
            ref={this.touchPadRef}
            bus={this.props.uiService.bus}
            onDragStarted={this.onDragStarted.bind(this)}
            onDragMoved={this.onDragMoved.bind(this)}
            onDragEnded={this.onDragEnded.bind(this)}
            class='mfd-map-page-touch-pad'
          >
            {this.compiledMap.map}
          </TouchPad>
        </div>
        <div class='ui-layered-darken' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.mapHiddenDebounce.clear();

    this.compiledMap.ref.getOrDefault()?.destroy();
    this.touchPadRef.getOrDefault()?.destroy();

    this.avionicsStatusSub?.destroy();

    super.destroy();
  }
}