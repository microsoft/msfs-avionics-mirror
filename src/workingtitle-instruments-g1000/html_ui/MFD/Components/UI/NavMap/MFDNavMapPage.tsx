import {
  CompiledMapSystem, EventBus, FlightPlanner, FSComponent, MapIndexedRangeModule, MapSystemBuilder, MathUtils, Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapDeclutterSettingMode, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, TrafficAdvisorySystem, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { TrafficUserSettings } from '../../../../Shared/Traffic/TrafficUserSettings';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { MFDPageMenuDialog } from '../MFDPageMenuDialog';
import { MFDUiPage, MFDUiPageProps } from '../MFDUiPage';

import './MFDNavMapPage.css';

/**
 * Component props for MFDNavMapPage.
 */
export interface MFDNavMapPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** The G1000 traffic advisory system. */
  tas: TrafficAdvisorySystem;
}

/**
 * A page which displays the navigation map.
 */
export class MFDNavMapPage extends MFDUiPage<MFDNavMapPageProps> {
  private static readonly DECLUTTER_TEXT = {
    [MapDeclutterSettingMode.All]: 'All',
    [MapDeclutterSettingMode.Level3]: '3',
    [MapDeclutterSettingMode.Level2]: '2',
    [MapDeclutterSettingMode.Level1]: '1',
  };

  private static readonly UPDATE_FREQ = 30; // Hz
  private static readonly POINTER_MOVE_INCREMENT = 5; // pixels

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.navMap, {
      bingId: 'mfd-page-map',
      dataUpdateFreq: MFDNavMapPage.UPDATE_FREQ,

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'Roboto',

      rangeRingOptions: {
        showLabel: true
      },

      rangeCompassOptions: {
        showLabel: true,
        showHeadingBug: true,
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

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Full,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus) as any
    })
    .withProjectedSize(Vec2Math.create(876, 734))
    .withDeadZone(VecNMath.create(4, 0, 56, 0, 0))
    .withClockUpdate(MFDNavMapPage.UPDATE_FREQ)
    .build('mfd-navmap') as CompiledMapSystem<
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

  private readonly pageMenuItems = [
    {
      id: 'map-settings',
      renderContent: (): VNode => <span>Map Settings</span>,
      action: (): void => {
        this.props.viewService.open('MapSettings', false);
      }
    },
    {
      id: 'declutter',
      renderContent: (): VNode => <span>Declutter (Current Detail {MFDNavMapPage.DECLUTTER_TEXT[this.mapSettingManager.getSetting('mapDeclutter').value]})</span>,
      action: (): void => {
        const setting = this.mapSettingManager.getSetting('mapDeclutter');
        switch (setting.value) {
          case MapDeclutterSettingMode.All:
            setting.value = MapDeclutterSettingMode.Level3;
            break;
          case MapDeclutterSettingMode.Level3:
            setting.value = MapDeclutterSettingMode.Level2;
            break;
          case MapDeclutterSettingMode.Level2:
            setting.value = MapDeclutterSettingMode.Level1;
            break;
          case MapDeclutterSettingMode.Level1:
            setting.value = MapDeclutterSettingMode.All;
            break;
          default:
            setting.value = MapDeclutterSettingMode.All;
        }
      }
    },
    {
      id: 'measure-brg-dist',
      renderContent: (): VNode => <span>Measure Bearing/Distance</span>,
      isEnabled: false
    },
    {
      id: 'charts',
      renderContent: (): VNode => <span>Charts</span>,
      isEnabled: false
    },
    {
      id: 'hide-vsd',
      renderContent: (): VNode => <span>Hide VSD</span>,
      isEnabled: false
    },
  ];

  /** @inheritdoc */
  constructor(props: MFDNavMapPageProps) {
    super(props);

    this._title.set('Map – Navigation Map');
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.RANGE_DEC:
        this.changeMapRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeMapRangeIndex(1);
        return true;
      case FmsHEvent.JOYSTICK_PUSH:
        this.mapPointerController.togglePointerActive();
        return true;
    }

    return this.handleMapPointerMoveEvent(evt) || super.onInteractionEvent(evt);
  }

  /**
   * Changes the MFD map range index setting.
   * @param delta The change in index to apply.
   */
  private changeMapRangeIndex(delta: number): void {
    const newIndex = MathUtils.clamp(this.mapRangeSetting.value + delta, 0, this.mapRangeModule.nominalRanges.get().length - 1);

    if (newIndex !== this.mapRangeSetting.value) {
      this.mapPointerController.targetPointer();
      this.mapRangeSetting.value = newIndex;
    }
  }

  /**
   * Handles events that move the map pointer.
   * @param evt The event.
   * @returns Whether the event was handled.
   */
  private handleMapPointerMoveEvent(evt: FmsHEvent): boolean {
    if (!this.mapPointerModule.isActive.get()) {
      return false;
    }

    switch (evt) {
      case FmsHEvent.JOYSTICK_LEFT:
        this.mapPointerController.movePointer(-MFDNavMapPage.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_UP:
        this.mapPointerController.movePointer(0, -MFDNavMapPage.POINTER_MOVE_INCREMENT);
        return true;
      case FmsHEvent.JOYSTICK_RIGHT:
        this.mapPointerController.movePointer(MFDNavMapPage.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_DOWN:
        this.mapPointerController.movePointer(0, MFDNavMapPage.POINTER_MOVE_INCREMENT);
        return true;
    }

    return false;
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('navmap-root');

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    super.onViewClosed();

    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  protected onMenuPressed(): boolean {
    this.props.menuSystem.pushMenu('empty');
    const pageMenu = (this.props.viewService.open('PageMenuDialog') as MFDPageMenuDialog);
    pageMenu.setMenuItems(this.pageMenuItems);
    pageMenu.onClose.on(() => { this.props.menuSystem.back(); });
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='mfd-page'>
        {this.compiledMap.map}
      </div>
    );
  }
}
