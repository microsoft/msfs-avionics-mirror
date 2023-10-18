import {
  CompiledMapSystem, DisplayComponent, EventBus, FlightPlanner, FSComponent, HEvent, InstrumentEvents, MapIndexedRangeModule, MapSystemBuilder, NodeReference,
  Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapOrientation, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, TrafficAdvisorySystem, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { MapBuilder } from '../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../Shared/Map/MapWaypointIconImageCache';
import { TrafficUserSettings } from '../../../Shared/Traffic/TrafficUserSettings';
import { PfdMapLayoutSettingMode, PFDUserSettings } from '../../PFDUserSettings';

import './MapInset.css';

/**
 * The properties on the map inset component.
 */
interface MapInsetProps {

  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** The G1000 traffic advisory system. */
  tas: TrafficAdvisorySystem;
}

/**
 * The PFD map inset overlay.
 */
export class MapInset extends DisplayComponent<MapInsetProps> {
  private static readonly UPDATE_FREQ = 30; // Hz
  private static readonly DATA_UPDATE_FREQ = 4; // Hz
  private static readonly POINTER_MOVE_INCREMENT = 2; // pixels

  private readonly el = new NodeReference<HTMLDivElement>();

  private readonly mapSize = Vec2Subject.createFromVector(Vec2Math.create(242, 230));

  private readonly mapSettingManager = MapUserSettings.getPfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.navMap, {
      bingId: 'pfd-map',
      dataUpdateFreq: MapInset.DATA_UPDATE_FREQ,

      rangeEndpoints: {
        [MapOrientation.NorthUp]: VecNMath.create(4, 0.5, 0.5, 0.5, 0.1),
        [MapOrientation.HeadingUp]: VecNMath.create(4, 0.5, 0.67, 0.5, 0.16),
        [MapOrientation.TrackUp]: VecNMath.create(4, 0.5, 0.67, 0.5, 0.16),
      },

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'Roboto',

      rangeRingOptions: {
        showLabel: false
      },

      rangeCompassOptions: {
        showLabel: false,
        showHeadingBug: false,
        arcEndTickLength: 5,
        bearingTickMajorLength: 10,
        bearingTickMinorLength: 5,
        bearingLabelFont: 'Roboto-Bold',
        bearingLabelFontSize: 20
      },

      flightPlanner: this.props.flightPlanner,

      ...MapBuilder.ownAirplaneIconOptions(),

      trafficSystem: this.props.tas,
      trafficIconOptions: {
        iconSize: 30,
        font: 'Roboto-Bold',
        fontSize: 16
      },

      includeWindVector: false,

      pointerBoundsOffset: VecNMath.create(4, 0.2, 0.2, 0.4, 0.2),
      pointerInfoSize: MapPointerInfoLayerSize.Small,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      includeRangeIndicator: true,

      showDetailIndicatorTitle: false,

      includeTerrainScale: false,

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus) as any
    })
    .withProjectedSize(this.mapSize)
    .withClockUpdate(MapInset.UPDATE_FREQ)
    .build('pfd-insetmap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;
      },
      any,
      {
        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController;
      },
      any
    >;

  private readonly mapRangeSetting = this.mapSettingManager.getSetting('mapRangeIndex');

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  private isMfdPowered = false;

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.setVisible(false);

    PFDUserSettings.getManager(this.props.bus).whenSettingChanged('mapLayout').handle((mode) => {
      this.setVisible(mode === PfdMapLayoutSettingMode.Inset || mode === PfdMapLayoutSettingMode.TFC);
    });

    const hEvents = this.props.bus.getSubscriber<HEvent>();
    hEvents.on('hEvent').handle(this.onInteractionEvent.bind(this));

    this.props.bus.on('mfd_power_on', isPowered => this.isMfdPowered = isPowered);
    this.props.bus.getSubscriber<InstrumentEvents>().on('vc_screen_state').handle(state => {
      if (state.current === ScreenState.REVERSIONARY) {
        setTimeout(() => {
          this.el.instance.classList.add('reversionary');
          this.mapSize.set(312, 230);

          if (!this.isMfdPowered) {
            this.props.bus.on('mfd_power_on', this.onMfdPowerOn);
          }
        }, 1000);
      } else if (this.isMfdPowered) {
        setTimeout(() => {
          this.el.instance.classList.remove('reversionary');
          this.mapSize.set(242, 230);
        }, 1000);
      }
    });
  }

  /**
   * Sets whether or not the inset map is visible.
   * @param isVisible Whether or not the map is visible.
   */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.style.display = '';
      this.compiledMap.ref.instance.wake();
    } else {
      this.el.instance.style.display = 'none';
      this.mapPointerController.setPointerActive(false);
      this.compiledMap.ref.instance.sleep();
    }
  }

  /**
   * Handles when the MFD has powered on.
   * @param isPowered Whether the MFD has finished powering up or not.
   */
  private onMfdPowerOn = (isPowered: boolean): void => {
    if (isPowered) {
      setTimeout(() => {
        this.el.instance.classList.remove('reversionary');
        this.mapSize.set(242, 230);

        this.props.bus.off('mfd_power_on', this.onMfdPowerOn);
      }, 1000);
    }
  };

  /**
   * A callback which is called when an interaction event occurs.
   * @param hEvent An interaction event.
   */
  private onInteractionEvent(hEvent: string): void {
    if (!this.compiledMap.ref.instance.isAwake) {
      return;
    }

    switch (hEvent) {
      case 'AS1000_PFD_RANGE_INC':
        this.changeMapRangeIndex(1);
        break;
      case 'AS1000_PFD_RANGE_DEC':
        this.changeMapRangeIndex(-1);
        break;
      case 'AS1000_PFD_JOYSTICK_PUSH':
        this.mapPointerController.togglePointerActive();
        break;
      default:
        this.handleMapPointerMoveEvent(hEvent);
    }
  }

  /**
   * Changes the MFD map range index setting.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    const newIndex = Utils.Clamp(this.mapRangeSetting.value + delta, 0, this.mapRangeModule.nominalRanges.get().length - 1);

    if (this.mapRangeSetting.value !== newIndex) {
      this.mapPointerController.targetPointer();
      this.mapRangeSetting.value = newIndex;
    }
  }

  /**
   * Handles events that move the map pointer.
   * @param hEvent An interaction event.
   */
  private handleMapPointerMoveEvent(hEvent: string): void {
    if (!this.mapPointerModule.isActive.get()) {
      return;
    }

    switch (hEvent) {
      case 'AS1000_PFD_JOYSTICK_LEFT':
        this.mapPointerController.movePointer(-MapInset.POINTER_MOVE_INCREMENT, 0);
        break;
      case 'AS1000_PFD_JOYSTICK_UP':
        this.mapPointerController.movePointer(0, -MapInset.POINTER_MOVE_INCREMENT);
        break;
      case 'AS1000_PFD_JOYSTICK_RIGHT':
        this.mapPointerController.movePointer(MapInset.POINTER_MOVE_INCREMENT, 0);
        break;
      case 'AS1000_PFD_JOYSTICK_DOWN':
        this.mapPointerController.movePointer(0, MapInset.POINTER_MOVE_INCREMENT);
        break;
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="map-inset" ref={this.el}>
        {this.compiledMap.map}
      </div>
    );
  }
}
