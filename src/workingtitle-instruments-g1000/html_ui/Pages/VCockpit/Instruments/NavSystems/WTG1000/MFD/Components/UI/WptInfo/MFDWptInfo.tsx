import { CompiledMapSystem, FSComponent, LatLonDisplay, MapIndexedRangeModule, MapSystemBuilder, MathUtils, Vec2Math, VecNMath, VNode } from 'msfssdk';

import {
  GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController, MapWaypointHighlightModule, UnitsUserSettings
} from 'garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { WptInfo } from '../../../../Shared/UI/WptInfo/WptInfo';
import { GroupBox } from '../GroupBox';

import './MFDWptInfo.css';

/**
 * The MFD waypoint info popout.
 */
export class MFDWptInfo extends WptInfo {
  private static readonly DEFAULT_MAP_RANGE_INDEX = 14;
  private static readonly MAP_UPDATE_FREQ = 30; // Hz
  private static readonly MAP_DATA_UPDATE_FREQ = 4; // Hz
  private static readonly POINTER_MOVE_INCREMENT = 2; // pixels

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.waypointMap, {
      bingId: 'mfd-wptinfo-map',
      dataUpdateFreq: MFDWptInfo.MAP_DATA_UPDATE_FREQ,

      boundsOffset: VecNMath.create(4, 20, 20, 20, 20),

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),

      rangeRingOptions: {
        showLabel: true
      },

      ...MapBuilder.ownAirplaneIconOptions(),

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Medium,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus)
    })
    .withProjectedSize(Vec2Math.create(290, 300))
    .withClockUpdate(MFDWptInfo.MAP_UPDATE_FREQ)
    .build('mfd-wptinfomap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The pointer module. */
        [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule;

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
  private readonly mapHighlightModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointHighlight);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.compiledMap.ref.instance.sleep();

    this.mapRangeController.setRangeIndex(MFDWptInfo.DEFAULT_MAP_RANGE_INDEX);

    this.store.waypoint.pipe(this.mapHighlightModule.waypoint);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
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
    const currentIndex = this.mapRangeModule.nominalRangeIndex.get();
    const newIndex = MathUtils.clamp(currentIndex + delta, 0, this.mapRangeModule.nominalRanges.get().length - 1);

    if (newIndex !== currentIndex) {
      this.mapPointerController.targetPointer();
      this.mapRangeController.setRangeIndex(newIndex);
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
        this.mapPointerController.movePointer(-MFDWptInfo.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_UP:
        this.mapPointerController.movePointer(0, -MFDWptInfo.POINTER_MOVE_INCREMENT);
        return true;
      case FmsHEvent.JOYSTICK_RIGHT:
        this.mapPointerController.movePointer(MFDWptInfo.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_DOWN:
        this.mapPointerController.movePointer(0, MFDWptInfo.POINTER_MOVE_INCREMENT);
        return true;
    }

    return false;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected onWptDupDialogClose(): void {
    this.close();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected onViewOpened(): void {
    super.onViewOpened();

    this.compiledMap.ref.instance.wake();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected onViewClosed(): void {
    super.onViewClosed();

    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
    this.mapRangeController.setRangeIndex(MFDWptInfo.DEFAULT_MAP_RANGE_INDEX);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public render(): VNode {
    return (
      <div class='popout-dialog mfd-wptinfo' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <GroupBox title="Ident, Facility, City">
          {this.renderWaypointInput()}
        </GroupBox>
        <GroupBox title="Map" class='mfd-wptinfo-map-box'>
          {this.compiledMap.map}
        </GroupBox>
        <GroupBox title="Location">
          <div class='mfd-wptinfo-loc'>
            <div class='mfd-wptinfo-loc-field mfd-wptinfo-loc-bearing'>
              <div class='mfd-wptinfo-loc-title'>BRG</div>
              {this.renderBearing('mfd-wptinfo-loc-value')}
            </div>
            <div class='mfd-wptinfo-loc-field mfd-wptinfo-loc-distance'>
              <div class='mfd-wptinfo-loc-title'>DIS</div>
              {this.renderDistance('mfd-wptinfo-loc-value')}
            </div>
            <div class='mfd-wptinfo-loc-region'>{this.store.region}</div>
            <LatLonDisplay location={this.store.location} class='mfd-wptinfo-loc-latlon' />
          </div>
        </GroupBox>
        <div class="mfd-wptinfo-bottom-prompt">{this.store.prompt}</div>
      </div>
    );
  }
}