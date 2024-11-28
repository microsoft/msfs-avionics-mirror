import {
  CompiledMapSystem, ComponentProps, DisplayComponent, EventBus, FlightPlanner, MapIndexedRangeModule,
  MapSystemBuilder, ReadonlyFloat64Array, Subscribable, Subscription, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapOrientation, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController,
  TrafficSystem, TrafficUserSettings, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import {
  BingUtils, DisplayPaneIndex, DisplayPanesUserSettings, DisplayPaneViewEvent, G3000FlightPlannerId, G3000MapBuilder,
  MapConfig, MapUserSettings, PfdControllerJoystickEventMapHandler, PfdIndex, PfdSensorsUserSettingManager
} from '@microsoft/msfs-wtg3000-common';

import './NavInsetMap.css';

/**
 * Component props for NavInsetMap.
 */
export interface NavInsetMapProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** The traffic system used by the map to display traffic. */
  trafficSystem: TrafficSystem;

  /** The index of the PFD to which the map belongs. */
  pfdIndex: PfdIndex;

  /** The projected size of the map. */
  projectedSize: Subscribable<ReadonlyFloat64Array>;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A configuration object defining options for the map. */
  config: MapConfig;
}

/**
 * A PFD inset map.
 */
export class NavInsetMap extends DisplayComponent<NavInsetMapProps> {
  private static readonly UPDATE_FREQ = 4; // Hz
  private static readonly POINTER_UPDATE_FREQ = 30; // Hz
  private static readonly DATA_UPDATE_FREQ = 4; // Hz
  private static readonly POINTER_MOVE_INCREMENT = 2; // pixels

  private readonly mapSettingManager = MapUserSettings.getPfdManager(this.props.bus, this.props.pfdIndex);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(G3000MapBuilder.navMap, {
      bingId: `pfd-map-${this.props.pfdIndex}`,
      bingDelay: BingUtils.getBindDelayForPane(this.props.pfdIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument),

      dataUpdateFreq: NavInsetMap.DATA_UPDATE_FREQ,

      rangeEndpoints: {
        [MapOrientation.NorthUp]: VecNMath.create(4, 0.5, 0.5, 0.5, 0.1),
        [MapOrientation.HeadingUp]: VecNMath.create(4, 0.5, 0.67, 0.5, 0.16),
        [MapOrientation.TrackUp]: VecNMath.create(4, 0.5, 0.67, 0.5, 0.16),
      },

      rangeRingOptions: {
        showLabel: false
      },

      rangeCompassOptions: {
        showLabel: false,
        showHeadingBug: false,
        arcEndTickLength: 5,
        bearingTickMajorLength: 10,
        bearingTickMinorLength: 5,
        bearingLabelFont: 'DejaVuSans-SemiBold',
        bearingLabelFontSize: 17
      },

      flightPlanner: this.props.flightPlanner,

      ...G3000MapBuilder.ownAirplaneIconOptions(this.props.config),

      trafficSystem: this.props.trafficSystem,
      trafficIconOptions: {
        iconSize: 30,
        font: 'DejaVuSans-SemiBold',
        fontSize: 14
      },

      includeWindVector: false,

      pointerBoundsOffset: VecNMath.create(4, 0.2, 0.2, 0.4, 0.2),
      pointerInfoSize: MapPointerInfoLayerSize.Small,

      miniCompassImgSrc: G3000MapBuilder.miniCompassIconSrc(),

      includeRangeIndicator: true,

      showDetailIndicatorTitle: false,

      includeTerrainScale: false,
      relativeTerrainStatusIndicatorIconPath: G3000MapBuilder.relativeTerrainIconSrc(),

      settingManager: this.mapSettingManager,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus),

      pfdIndex: this.props.pfdIndex,
      pfdSensorsSettingManager: this.props.pfdSensorsSettingManager
    })
    .withProjectedSize(this.props.projectedSize)
    .build('nav-inset-map') as CompiledMapSystem<
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

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  private readonly mapPointerActiveSetting = DisplayPanesUserSettings.getDisplayPaneManager(
    this.props.bus,
    this.props.pfdIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument
  ).getSetting('displayPaneMapPointerActive');

  private readonly pfdControllerJoystickEventHandler = new PfdControllerJoystickEventMapHandler({
    onPointerToggle: this.onJoystickPointerToggle.bind(this),
    onPointerMove: this.onJoystickPointerMove.bind(this),
    onRangeChange: this.onJoystickRangeChange.bind(this)
  });

  private updatePeriod = 0;
  private lastUpdateTime = 0;

  private isInit = false;
  private isAwake = false;

  private pointerActivePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.mapPointerModule.isActive.sub(isActive => {
      this.updatePeriod = 1000 / (isActive ? NavInsetMap.POINTER_UPDATE_FREQ : NavInsetMap.UPDATE_FREQ);
    }, true);

    this.pointerActivePipe = this.mapPointerModule.isActive.pipe(this.mapPointerActiveSetting, !this.isAwake);

    if (!this.isAwake) {
      this.compiledMap.ref.instance.sleep();
    }

    this.isInit = true;
  }

  /**
   * Wakes this map.
   */
  public wake(): void {
    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.pointerActivePipe?.resume(true);

    if (!this.isInit) {
      return;
    }

    this.compiledMap.ref.instance.wake();
  }

  /**
   * Wakes this map.
   */
  public sleep(): void {
    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.mapPointerController.setPointerActive(false);

    this.pointerActivePipe?.pause();
    this.mapPointerActiveSetting.value = false;

    if (!this.isInit) {
      return;
    }

    this.compiledMap.ref.instance.sleep();
  }

  /**
   * Updates this map.
   * @param time The current real time, as a UNIX timestamp in milliseconds.
   */
  public update(time: number): void {
    if (!this.isInit || !this.isAwake) {
      return;
    }

    if (time - this.lastUpdateTime >= this.updatePeriod) {
      this.compiledMap.ref.instance.update(time);

      this.lastUpdateTime = time;
    }
  }

  /**
   * Responds to display pane view events.
   * @param event A display pane view event.
   */
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

  /**
   * Handles an interaction event.
   * @param event The interaction event to handle.
   * @returns Whether the interaction event was handled.
   */
  public onInteractionEvent(event: string): boolean {
    return this.pfdControllerJoystickEventHandler.onInteractionEvent(event);
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
   * Changes this map's range index.
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
  public render(): VNode {
    return this.compiledMap.map;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.compiledMap.ref.getOrDefault()?.destroy();

    this.pointerActivePipe?.destroy();

    super.destroy();
  }
}
