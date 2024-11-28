import {
  CompiledMapSystem, EventBus, FocusPosition, FSComponent, MapIndexedRangeModule, MapSystemBuilder, MathUtils, Subject, Vec2Math, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  Fms, GarminMapKeys, MapFlightPlanFocusModule, MapPointerController, MapPointerInfoLayerSize, MapPointerModule, MapRangeController, TrafficAdvisorySystem,
  TrafficUserSettings, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { MapBuilder } from '../../../../Shared/Map/MapBuilder';
import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { MapWaypointIconImageCache } from '../../../../Shared/Map/MapWaypointIconImageCache';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { MFDUiPage, MFDUiPageProps } from '../MFDUiPage';
import { MFDFPL } from './MFDFPL';

import './MFDFPLPage.css';

/**
 * Component props for MFDFPLPage.
 */
export interface MFDFPLPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  fms: Fms;

  /** The G1000 traffic advisory system. */
  tas: TrafficAdvisorySystem;
}

/**
 * A page which displays the flight plan map and active flight plan information.
 */
export class MFDFPLPage extends MFDUiPage<MFDFPLPageProps> {
  private static readonly UPDATE_FREQ = 30; // Hz
  private static readonly POINTER_MOVE_INCREMENT = 5; // pixels

  private readonly fplRef = FSComponent.createRef<MFDFPL>();

  private readonly mapSettingManager = MapUserSettings.getMfdManager(this.props.bus);

  private readonly drawEntirePlan = Subject.create(false);

  private readonly compiledMap = MapSystemBuilder.create(this.props.bus)
    .with(MapBuilder.navMap, {
      bingId: 'mfd-page-map',
      dataUpdateFreq: MFDFPLPage.UPDATE_FREQ,

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

      flightPlanner: this.props.fms.flightPlanner,
      supportFlightPlanFocus: true,
      drawEntirePlan: this.drawEntirePlan,
      nominalFocusMargins: VecNMath.create(4, 40, 40, 40, 40),

      ...MapBuilder.ownAirplaneIconOptions(),

      trafficSystem: this.props.tas,
      trafficIconOptions: {
        iconSize: 30,
        font: 'Roboto-Bold',
        fontSize: 16
      },

      pointerBoundsOffset: VecNMath.create(4, 0.1, 0.1, 0.1, 0.1),
      pointerInfoSize: MapPointerInfoLayerSize.Medium,

      miniCompassImgSrc: MapBuilder.miniCompassIconSrc(),

      settingManager: this.mapSettingManager as any,
      unitsSettingManager: UnitsUserSettings.getManager(this.props.bus),
      trafficSettingManager: TrafficUserSettings.getManager(this.props.bus) as any
    })
    .withProjectedSize(Vec2Math.create(440, 734))
    .withDeadZone(VecNMath.create(4, 0, 56, 0, 0))
    .withClockUpdate(MFDFPLPage.UPDATE_FREQ)
    .build('mfd-fplmap') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The pointer module. */
        [GarminMapKeys.Pointer]: MapPointerModule;

        /** The flight plan focus module. */
        [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;
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
  private readonly mapFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);

  private readonly mapRangeController = this.compiledMap.context.getController(GarminMapKeys.Range);
  private readonly mapPointerController = this.compiledMap.context.getController(GarminMapKeys.Pointer);


  /** @inheritdoc */
  constructor(props: MFDFPLPageProps) {
    super(props);

    this._title.set('FPL – Active Flight Plan');
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.compiledMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public processHEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        this.setScrollEnabled(!this.scrollController.getIsScrollEnabled());
        return true;
      case FmsHEvent.MENU:
        // Always pass menu events through to FPL, even if scroll is disabled.
        if (this.fplRef.instance.onInteractionEvent(evt)) {
          return true;
        }
        break;
      case FmsHEvent.RANGE_DEC:
        this.changeMapRangeIndex(-1);
        return true;
      case FmsHEvent.RANGE_INC:
        this.changeMapRangeIndex(1);
        return true;
      case FmsHEvent.JOYSTICK_PUSH:
        this.mapPointerController?.togglePointerActive();
        return true;
    }

    let handledByDetails = false;
    if (this.fplRef.instance.isFocused) {
      handledByDetails = this.fplRef.instance.onInteractionEvent(evt);
    }

    if (!handledByDetails) {
      return this.handleMapPointerMoveEvent(evt) || super.onInteractionEvent(evt);
    } else {
      return handledByDetails;
    }
  }

  /** @inheritdoc */
  public setScrollEnabled(enabled: boolean): void {
    super.setScrollEnabled(enabled);

    if (enabled && !this.fplRef.instance.isFocused) {
      this.fplRef.instance.focus(FocusPosition.MostRecent);
      this.fplRef.instance.scrollToActiveLeg(true);
      this.mapFocusModule.planHasFocus.set(true);
      this.drawEntirePlan.set(true);
    } else if (!enabled && this.fplRef.instance.isFocused) {
      this.fplRef.instance.blur();
      this.fplRef.instance.scrollToActiveLeg(false);
      this.mapFocusModule.planHasFocus.set(false);
      this.drawEntirePlan.set(false);
    }
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
        this.mapPointerController.movePointer(-MFDFPLPage.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_UP:
        this.mapPointerController.movePointer(0, -MFDFPLPage.POINTER_MOVE_INCREMENT);
        return true;
      case FmsHEvent.JOYSTICK_RIGHT:
        this.mapPointerController.movePointer(MFDFPLPage.POINTER_MOVE_INCREMENT, 0);
        return true;
      case FmsHEvent.JOYSTICK_DOWN:
        this.mapPointerController.movePointer(0, MFDFPLPage.POINTER_MOVE_INCREMENT);
        return true;
    }

    return false;
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    this.props.viewService.clearPageHistory();

    this.props.menuSystem.clear();
    this.props.menuSystem.pushMenu('fpln-menu');

    this.compiledMap.ref.instance.wake();
    this.fplRef.instance.onViewOpened();
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    super.onViewClosed();

    this.mapPointerController.setPointerActive(false);
    this.compiledMap.ref.instance.sleep();
    this.fplRef.instance.onViewClosed();
  }

  /** @inheritdoc */
  protected onViewResumed(): void {
    super.onViewResumed();

    this.fplRef.instance.onViewResumed();
  }

  /** @inheritdoc */
  protected onFPLPressed(): boolean {
    this.props.viewService.open('NavMapPage');
    return true;
  }

  /**
   * Responds to when this page's FPL component is focused.
   */
  private onFPLFocused(): void {
    if (!this.scrollController.getIsScrollEnabled()) {
      this.setScrollEnabled(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='mfd-page'>
        {this.compiledMap.map}
        <MFDFPL
          ref={this.fplRef}
          bus={this.props.bus}
          viewService={this.props.viewService}
          fms={this.props.fms}
          focus={this.mapFocusModule.focus}
          onFocused={this.onFPLFocused.bind(this)}
          isolateScroll
        />
      </div>
    );
  }
}
