import {
  CompiledMapSystem, EventBus, FlightPlanner, MapIndexedRangeModule, MapSystemBuilder, Subscription, Vec2Math,
  Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController,
  UnitsUserSettings, WindDataProvider
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../../CommonTypes';
import { PfdControllerJoystickEventMapHandler } from '../../Input/PfdControllerJoystickEventMapHandler';
import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { PfdSensorsUserSettingManager } from '../../Settings/PfdSensorsUserSettings';
import { ConnextMapUserSettings } from '../../Settings/WeatherMapUserSettings';
import { BingUtils } from '../Bing/BingUtils';
import { ControllableDisplayPaneIndex, DisplayPaneIndex, DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { DisplayPaneViewEvent } from '../DisplayPanes/DisplayPaneViewEvents';
import { G3000MapBuilder } from '../Map/G3000MapBuilder';
import { MapConfig } from '../Map/MapConfig';

import '../Map/CommonMap.css';

/**
 * Component props for ConnextWeatherPaneView.
 */
export interface ConnextWeatherPaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** A provider of wind data. Required to display the map wind vector. */
  windDataProvider?: WindDataProvider;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A display pane view which displays a Connext weather map.
 */
export class ConnextWeatherPaneView extends DisplayPaneView<ConnextWeatherPaneViewProps, DisplayPaneViewEvent> {

  private static readonly DATA_UPDATE_FREQ = 30; // Hz

  private readonly size = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly mapSettingManager = ConnextMapUserSettings.getDisplayPaneCombinedManager(this.props.bus, this.props.index as ControllableDisplayPaneIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(G3000MapBuilder.connextMap, {
      bingId: `pane_map_${this.props.index}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.index),

      dataUpdateFreq: ConnextWeatherPaneView.DATA_UPDATE_FREQ,

      includeRunwayOutlines: false,

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

      ...G3000MapBuilder.ownAirplaneIconOptions(this.props.config),

      windDataProvider: this.props.windDataProvider,

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: G3000MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),

      pfdIndex: G3000MapBuilder.getPfdIndexForDisplayPane(this.props.index, this.props.pfdSensorsSettingManager.pfdCount),
      pfdSensorsSettingManager: this.props.pfdSensorsSettingManager
    })
    .withProjectedSize(this.size)
    .build('common-map connext-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;
        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);
  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);

  private readonly mapPointerActiveSetting = DisplayPanesUserSettings.getDisplayPaneManager(this.props.bus, this.props.index).getSetting('displayPaneMapPointerActive');

  private readonly pfdControllerJoystickEventHandler = this.props.index === DisplayPaneIndex.LeftPfd || this.props.index === DisplayPaneIndex.RightPfd
    ? new PfdControllerJoystickEventMapHandler({
      onPointerToggle: this.onJoystickPointerToggle.bind(this),
      onPointerMove: this.onJoystickPointerMove.bind(this),
      onRangeChange: this.onJoystickRangeChange.bind(this)
    })
    : undefined;

  private pointerActivePipe?: Subscription;

  /** @inheritdoc */
  public override onAfterRender(): void {
    this._title.set('Connext Weather');

    this.compiledMap.ref.instance.sleep();

    this.pointerActivePipe = this.mapPointerModule.isActive.pipe(this.mapPointerActiveSetting, true);
  }

  /** @inheritdoc */
  public override onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.size.set(width, height);
    this.compiledMap.ref.instance.wake();
    this.pointerActivePipe?.resume(true);
  }

  /** @inheritdoc */
  public override onPause(): void {
    this.mapPointerController.setPointerActive(false);

    this.compiledMap.ref.instance.sleep();
    this.pointerActivePipe?.pause();
    this.mapPointerActiveSetting.value = false;
  }

  /** @inheritdoc */
  public override onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    this.size.set(width, height);
  }

  /** @inheritdoc */
  public override onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritdoc */
  public onEvent(event: DisplayPaneViewEvent): void {
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
    }
  }

  /** @inheritDoc */
  public onInteractionEvent(event: string): boolean {
    if (this.pfdControllerJoystickEventHandler) {
      return this.pfdControllerJoystickEventHandler.onInteractionEvent(event);
    }

    return false;
  }

  /**
   * Responds to when a map pointer toggle event is commanded by the PFD controller joystick.
   * @returns Whether the event was handled.
   */
  private onJoystickPointerToggle(): boolean {
    this.mapPointerController.togglePointerActive();
    return true;
  }

  /**
   * Responds to when a map pointer move event is commanded by the PFD controller joystick.
   * @param dx The horizontal displacement, in pixels.
   * @param dy The vertical displacement, in pixels.
   * @returns Whether the event was handled.
   */
  private onJoystickPointerMove(dx: number, dy: number): boolean {
    this.mapPointerController.movePointer(dx, dy);
    return true;
  }

  /**
   * Responds to when a map range change event is commanded by the PFD controller joystick.
   * @param direction The direction in which to change the map range.
   * @returns Whether the event was handled.
   */
  private onJoystickRangeChange(direction: 1 | -1): boolean {
    this.changeRangeIndex(direction);
    return true;
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

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      this.compiledMap.map
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.compiledMap.ref.instance.destroy();

    this.pointerActivePipe?.destroy();

    super.destroy();
  }
}