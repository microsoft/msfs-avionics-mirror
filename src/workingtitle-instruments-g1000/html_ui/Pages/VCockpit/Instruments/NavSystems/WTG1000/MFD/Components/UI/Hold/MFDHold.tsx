import {
  CompiledMapSystem, FSComponent, MapIndexedRangeModule, MapSystemBuilder, MathUtils, NavMath, NumberUnitSubject, UnitFamily, Vec2Math, VecNMath, VNode
} from 'msfssdk';

import {
  GarminMapKeys, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController, MapWaypointHighlightModule, UnitsUserSettings
} from 'garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { Hold } from '../../../../Shared/UI/Hold/Hold';
import { ActionButton } from '../../../../Shared/UI/UIControls/ActionButton';
import { ArrowToggle } from '../../../../Shared/UI/UIControls/ArrowToggle';
import { NumberInput } from '../../../../Shared/UI/UIControls/NumberInput';
import { TimeDistanceInput } from '../../../../Shared/UI/UIControls/TimeDistanceInput';
import { GroupBox } from '../GroupBox';

import './MFDHold.css';

/**
 * A class that displays the MFD hold dialog.
 */
export class MFDHold extends Hold {
  private static readonly DEFAULT_MAP_RANGE_INDEX = 14;

  private static readonly MAP_UPDATE_FREQ = 30; // Hz
  private static readonly MAP_DATA_UPDATE_FREQ = 4; // Hz

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.waypointMap, {
      bingId: 'mfd-wptinfo-map',
      dataUpdateFreq: MFDHold.MAP_DATA_UPDATE_FREQ,

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
    .withClockUpdate(MFDHold.MAP_UPDATE_FREQ)
    .build('mfd-holdmap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule,

        /** The pointer module. */
        [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController,

        /** The pointer controller. */
        [GarminMapKeys.Pointer]: MapPointerController
      },
      any
    >;

  private readonly mapRangeModule = this.compiledMap.context.model.getModule(GarminMapKeys.Range);
  private readonly mapHighlightModule = this.compiledMap.context.model.getModule(GarminMapKeys.WaypointHighlight);
  private readonly mapPointerModule = this.compiledMap.context.model.getModule(GarminMapKeys.Pointer);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.compiledMap.ref.instance.sleep();

    this.mapRangeController.setRangeIndex(MFDHold.DEFAULT_MAP_RANGE_INDEX);

    this.store.waypoint.pipe(this.mapHighlightModule.waypoint);
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
    }

    return super.onInteractionEvent(evt);
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
    this.mapRangeController.setRangeIndex(MFDHold.DEFAULT_MAP_RANGE_INDEX);
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
   * Renders the MFD hold dialog.
   * @returns The rendered VNode.
   */
  public render(): VNode {
    const legName = this.createLegNameSubscribable();
    const directionString = this.createDirectionStringSubscribable();

    return (
      <div class='popout-dialog mfd-hold' ref={this.viewContainerRef}>
        <h1>{this.props.title}</h1>
        <GroupBox title='Direction, Course'>
          <div class='mfd-hold-gridcontainer'>
            <div>Hold <span>{directionString}</span> of</div>
            <div>{legName}</div>
            <div>
              Course <NumberInput class='mfd-hold-course' minValue={1} maxValue={360} wrap
                dataSubject={this.store.course} increment={1} onRegister={this.register} formatter={(v): string => `${NavMath.normalizeHeading(v).toFixed(0).padStart(3, '0')}°`} />
            </div>
            <div>
              <ArrowToggle class='mfd-hold-inbound' options={['Inbound', 'Outbound']} dataref={this.store.isInbound} onRegister={this.register} />
            </div>
          </div>
        </GroupBox>
        <GroupBox title='Leg Time, Distance'>
          <div class='mfd-hold-gridcontainer'>
            <div>
              Leg <ArrowToggle class='mfd-hold-time' options={['Time', 'Distance']} dataref={this.store.isTime} onRegister={this.register} />
            </div>
            <div>
              <TimeDistanceInput
                ref={this.distanceInput} class='mfd-hold-distance'
                timeSubject={this.store.time as unknown as NumberUnitSubject<UnitFamily.Duration>}
                distanceSubject={this.store.distance as unknown as NumberUnitSubject<UnitFamily.Distance>}
                onRegister={this.register}
              />
            </div>
          </div>
        </GroupBox>
        <GroupBox title='Turns'>
          <div class='mfd-hold-gridcontainer'>
            <div>Turn Direction</div>
            <div>
              <ArrowToggle class='mfd-hold-direction' options={['Left', 'Right']} dataref={this.store.turnDirection} onRegister={this.register} />
            </div>
          </div>
        </GroupBox>
        <GroupBox title='Map' class='mfd-hold-map-box'>
          {this.compiledMap.map}
        </GroupBox>
        <ActionButton class='mfd-hold-load' text='Load?' onExecute={(): void => { this.controller.accept(); this.close(); }} onRegister={this.register} />
      </div>
    );
  }
}