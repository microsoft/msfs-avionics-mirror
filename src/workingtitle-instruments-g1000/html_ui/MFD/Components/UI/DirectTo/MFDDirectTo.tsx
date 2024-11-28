import { CompiledMapSystem, FSComponent, MapIndexedRangeModule, MapSystemBuilder, MathUtils, Vec2Math, VecNMath, VNode } from '@microsoft/msfs-sdk';

import {
  GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController, UnitsUserSettings, WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { DirectTo } from '../../../../Shared/UI/DirectTo/DirectTo';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { GroupBox } from '../GroupBox';

import './MFDDirectTo.css';

/**
 * The MFD direct-to popout.
 */
export class MFDDirectTo extends DirectTo {
  private static readonly DEFAULT_MAP_RANGE_INDEX = 14;
  private static readonly MAP_UPDATE_FREQ = 30; // Hz
  private static readonly MAP_DATA_UPDATE_FREQ = 4; // Hz

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.waypointMap, {
      bingId: 'mfd-wptinfo-map',
      dataUpdateFreq: MFDDirectTo.MAP_DATA_UPDATE_FREQ,

      airportAutoRangeMargins: VecNMath.create(4, 20, 20, 20, 20),

      waypointIconImageCache: MapWaypointIconImageCache.getCache(),
      waypointStyleFontType: 'Roboto',

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
    .withProjectedSize(Vec2Math.create(290, 250))
    .withClockUpdate(MFDDirectTo.MAP_UPDATE_FREQ)
    .build('mfd-dtomap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The waypoint selection module. */
        [GarminMapKeys.WaypointSelection]: WaypointMapSelectionModule;

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
  private readonly mapWptSelectionModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointSelection);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.compiledMap.ref.instance.sleep();

    this.mapRangeController.setRangeIndex(MFDDirectTo.DEFAULT_MAP_RANGE_INDEX);

    this.store.waypoint.pipe(this.mapWptSelectionModule.waypoint);
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
    }

    return super.onInteractionEvent(evt);
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

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.compiledMap.ref.instance.wake();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    super.onViewClosed();

    this.compiledMap.ref.instance.sleep();
    this.mapRangeController.setRangeIndex(MFDDirectTo.DEFAULT_MAP_RANGE_INDEX);
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class='popout-dialog mfd-dto' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <GroupBox title="Ident, Facility, City">
          {this.renderWaypointInput()}
        </GroupBox>
        <GroupBox title="VNV">
          <div class="mfd-dto-vnv-box">
            <div>- - - - -<span class="size12">FT</span></div>
            <div>+0<span class="size12">NM</span></div>
          </div>
        </GroupBox>
        <GroupBox title="Map" class='mfd-dto-map-box'>
          {this.compiledMap.map}
        </GroupBox>
        <GroupBox title="Location">
          <div class="mfd-dto-location">
            <div class='mfd-dto-location-field mfd-dto-bearing'>
              <div class='mfd-dto-location-field-title'>BRG</div>
              {this.renderBearing()}
            </div>
            <div class='mfd-dto-location-field mfd-dto-distance'>
              <div class='mfd-dto-location-field-title'>DIS</div>
              {this.renderDistance()}
            </div>
          </div>
        </GroupBox>
        <GroupBox title='Course' class='mfd-dto-course-box'>
          {this.renderCourseInput('mfd-dto-course-input')}
        </GroupBox>
        <div class="mfd-action-buttons mfd-dto-action-buttons">
          <ActionButton onRegister={this.register} isVisible={this.controller.canActivate} onExecute={this.onLoadExecuted} text="Activate?" />
          <ActionButton onRegister={this.register} isVisible={this.controller.canActivate} onExecute={this.onHoldButtonPressed} text="Hold?" />
        </div>
      </div>
    );
  }
}
