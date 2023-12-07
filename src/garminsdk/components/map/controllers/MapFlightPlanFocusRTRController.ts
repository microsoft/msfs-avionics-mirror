import {
  BitFlags, DebounceTimer, GeoPoint, MapIndexedRangeModule, MapOwnAirplanePropsModule, MappedSubject, MapProjection,
  MapProjectionChangeType, MapSystemContext, MapSystemController, MapSystemKeys, ReadonlyFloat64Array,
  ResourceConsumer, ResourceModerator, Subject, Subscribable, Subscription, UnitType, VecNMath
} from '@microsoft/msfs-sdk';

import { MapFlightPlanDataProvider } from '../flightplan/MapFlightPlanDataProvider';
import { MapFlightPlanFocusCalculator } from '../flightplan/MapFlightPlanFocusCalculator';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapResourcePriority } from '../MapResourcePriority';
import { MapFlightPlanFocusModule } from '../modules/MapFlightPlanFocusModule';
import { MapOrientation, MapOrientationModule } from '../modules/MapOrientationModule';
import { MapRangeController } from './MapRangeController';

/**
 * Modules required for MapFlightPlanFocusRTRController.
 */
export interface MapFlightPlanFocusRTRControllerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Own airplane props module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Flight plan focus module. */
  [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;

  /** Orientation module. */
  [GarminMapKeys.Orientation]?: MapOrientationModule;
}

/**
 * Required controllers for MapFlightPlanFocusRTRController.
 */
export interface MapFlightPlanFocusRTRControllerControllers {
  /** Range controller. */
  [GarminMapKeys.Range]: MapRangeController;
}

/**
 * Required context properties for MapFlightPlanFocusRTRController.
 */
export interface MapFlightPlanFocusRTRControllerContext {
  /** Resource moderator for control of the map's projection target. */
  [MapSystemKeys.TargetControl]?: ResourceModerator;

  /** Resource moderator for control of the map's desired orientation mode. */
  [GarminMapKeys.DesiredOrientationControl]?: ResourceModerator;

  /** Resource moderator for the use range setting subject. */
  [GarminMapKeys.UseRangeSetting]?: ResourceModerator<Subject<boolean>>;
}

/**
 * Controls the pointer of a map.
 */
export class MapFlightPlanFocusRTRController extends MapSystemController<
  MapFlightPlanFocusRTRControllerModules,
  any,
  MapFlightPlanFocusRTRControllerControllers,
  MapFlightPlanFocusRTRControllerContext
> {

  private static readonly DEFAULT_FOCUS_DEBOUNCE_DELAY = 500; // ms

  private readonly rangeModule = this.context.model.getModule(GarminMapKeys.Range);
  private readonly ownAirplanePropsModule = this.context.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly focusModule = this.context.model.getModule(GarminMapKeys.FlightPlanFocus);
  private readonly orientationModule = this.context.model.getModule(GarminMapKeys.Orientation);

  protected readonly mapTargetParam = {
    target: new GeoPoint(0, 0)
  };

  private readonly hasTargetControl = Subject.create(this.context.targetControlModerator === undefined);
  private readonly hasRangeSettingControl = Subject.create(this.context.useRangeSettingModerator === undefined);
  private readonly canActivateFocus = MappedSubject.create(
    ([hasTargetControl, hasRangeSettingControl]): boolean => {
      return hasTargetControl && hasRangeSettingControl;
    },
    this.hasTargetControl,
    this.hasRangeSettingControl
  );

  private readonly targetControl = this.context[MapSystemKeys.TargetControl];

  private readonly targetControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.FLIGHT_PLAN_FOCUS,

    onAcquired: () => {
      this.hasTargetControl.set(true);
    },

    onCeded: () => {
      this.hasTargetControl.set(false);
    }
  };

  private readonly desiredOrientationControl = this.context[GarminMapKeys.DesiredOrientationControl];

  private readonly desiredOrientationControlConsumer: ResourceConsumer = {
    priority: MapResourcePriority.FLIGHT_PLAN_FOCUS,

    onAcquired: () => {
      this.orientationModule?.desiredOrientation.set(MapOrientation.NorthUp);
    },

    onCeded: () => { }
  };

  private readonly useRangeSetting = this.context[GarminMapKeys.UseRangeSetting];

  private readonly useRangeSettingConsumer: ResourceConsumer<Subject<boolean>> = {
    priority: MapResourcePriority.FLIGHT_PLAN_FOCUS,

    onAcquired: (useRangeSetting) => {
      useRangeSetting.set(false);
      this.hasRangeSettingControl.set(true);
    },

    onCeded: () => {
      this.hasRangeSettingControl.set(false);
    }
  };

  private readonly focusMargins = VecNMath.create(4, 20, 20, 20, 20);

  private readonly isPlanFocusValid = MappedSubject.create(
    ([planHasFocus, planFocus]): boolean => {
      return planHasFocus && planFocus !== null;
    },
    this.focusModule.planHasFocus,
    this.focusModule.focus
  );

  private readonly isFocusActive = MappedSubject.create(
    ([isPlanFocusValid, canActivateFocus]): boolean => {
      return isPlanFocusValid && canActivateFocus;
    },
    this.isPlanFocusValid,
    this.canActivateFocus
  );

  private readonly focusCalculator = new MapFlightPlanFocusCalculator(this.context.projection);
  private readonly focusRangeTarget = { range: 0, target: new GeoPoint(0, 0) };

  private readonly focusDebounceTimer = new DebounceTimer();

  private isFocusActiveSub?: Subscription;
  private focusSub?: Subscription;
  private isFocusActivePipe?: Subscription;

  private dataProviderSub?: Subscription;
  private planCalculatedSub?: Subscription;
  private rangeArraySub?: Subscription;

  private readonly focusMarginsSub: Subscription;

  private isRangeTargetUpdatePending = false;
  private readonly pendRangeTargetUpdate = (): void => { this.isRangeTargetUpdatePending = true; };

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param nominalFocusMargins A subscribable which provides the nominal focus margins, as
   * `[left, top, right, bottom]` in pixels. The nominal margins define the offset of the boundaries of the focus
   * region relative to the map's projected window, *excluding* the dead zone. Positive values represent offsets
   * toward the center of the window. When the flight plan is focused, the focused elements of the plan are guaranteed
   * to be contained within the focus region.
   * @param defaultFocusRangeIndex The default map range index to apply when the flight plan focus consists of only a
   * single point in space.
   * @param focusDebounceDelay The debounce delay, in milliseconds, to apply to focus target calculations when the
   * flight plan focus changes. Defaults to 500 milliseconds.
   */
  constructor(
    context: MapSystemContext<MapFlightPlanFocusRTRControllerModules, any, any, MapFlightPlanFocusRTRControllerContext>,
    private readonly nominalFocusMargins: Subscribable<ReadonlyFloat64Array>,
    private readonly defaultFocusRangeIndex: number,
    private readonly focusDebounceDelay = MapFlightPlanFocusRTRController.DEFAULT_FOCUS_DEBOUNCE_DELAY
  ) {
    super(context);

    this.focusMarginsSub = this.nominalFocusMargins.sub(this.updateFocusMargins.bind(this), true);
  }

  /** @inheritdoc */
  public onDeadZoneChanged(): void {
    this.updateFocusMargins();
  }

  /**
   * Updates the flight plan focus margins.
   */
  private updateFocusMargins(): void {
    const deadZone = this.context.deadZone.get();
    const nominalMargins = this.nominalFocusMargins.get();

    this.focusMargins[0] = deadZone[0] + nominalMargins[0];
    this.focusMargins[1] = deadZone[1] + nominalMargins[1];
    this.focusMargins[2] = deadZone[2] + nominalMargins[2];
    this.focusMargins[3] = deadZone[3] + nominalMargins[3];
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.rangeArraySub = this.rangeModule.nominalRanges.sub(this.onFlightPlanFocusChanged.bind(this), false, true);
    this.focusSub = this.focusModule.focus.sub(this.onFlightPlanFocusChanged.bind(this), false, true);
    this.dataProviderSub = this.focusModule.dataProvider.sub(this.onDataProviderChanged.bind(this), true);

    this.isFocusActivePipe = this.isFocusActive.pipe(this.focusModule.isActive);
    this.isFocusActiveSub = this.focusModule.isActive.sub(this.onIsFocusActiveChanged.bind(this), true);
    this.isPlanFocusValid.sub(this.onIsPlanFocusValidChanged.bind(this), true);
  }

  /**
   * Responds to changes in whether the current flight plan focus is valid.
   * @param isValid Whether the current flight plan focus is valid.
   */
  private onIsPlanFocusValidChanged(isValid: boolean): void {
    if (isValid) {
      this.useRangeSetting?.claim(this.useRangeSettingConsumer);
      this.targetControl?.claim(this.targetControlConsumer);
    } else {
      this.targetControl?.forfeit(this.targetControlConsumer);
      this.useRangeSetting?.forfeit(this.useRangeSettingConsumer);
    }
  }

  /**
   * Responds to changes in whether flight plan focus is active.
   * @param isActive Whether flight plan focus is active.
   */
  private onIsFocusActiveChanged(isActive: boolean): void {
    if (isActive) {
      if (this.desiredOrientationControl === undefined) {
        // If there is no moderator, assume we have control
        this.orientationModule?.desiredOrientation.set(MapOrientation.NorthUp);
      } else {
        this.desiredOrientationControl.claim(this.desiredOrientationControlConsumer);
      }
    } else {
      this.focusDebounceTimer.clear();

      this.desiredOrientationControl?.forfeit(this.desiredOrientationControlConsumer);
    }

    this.setFlightPlanFocusListenersActive(isActive);
  }

  /**
   * Activates or deactivates flight plan focus listeners.
   * @param isActive Whether to activate flight plan focus listeners.
   */
  private setFlightPlanFocusListenersActive(isActive: boolean): void {
    if (isActive) {
      this.pendRangeTargetUpdate();

      (this.focusSub as Subscription).resume();
      this.planCalculatedSub?.resume();
      (this.rangeArraySub as Subscription).resume();
    } else {
      (this.focusSub as Subscription).pause();
      this.planCalculatedSub?.pause();
      (this.rangeArraySub as Subscription).pause();
    }
  }

  /**
   * Responds to changes in the flight plan focus.
   */
  private onFlightPlanFocusChanged(): void {
    this.schedulePendRangeTargetUpdate();
  }

  /**
   * Responds to changes in the flight plan focus data provider.
   * @param dataProvider The new flight plan focus data provider.
   */
  private onDataProviderChanged(dataProvider: MapFlightPlanDataProvider | null): void {
    this.planCalculatedSub?.destroy();

    this.planCalculatedSub = dataProvider?.planCalculated.on(this.onFlightPlanCalculated.bind(this), !this.focusModule.isActive.get());
  }

  /**
   * A callback which is called when the flight plan is calculated.
   */
  private onFlightPlanCalculated(): void {
    // only update from flight plan focus if the focus is not null and a valid range and target do not already exist.
    if (this.focusModule.planHasFocus.get() && this.focusModule.focus.get() !== null && isNaN(this.focusRangeTarget.range)) {
      this.pendRangeTargetUpdate();
    }
  }

  /**
   * Schedules an update of the map target and range from the current flight plan focus after a debounce delay.
   */
  private schedulePendRangeTargetUpdate(): void {
    this.focusDebounceTimer.schedule(
      this.pendRangeTargetUpdate,
      this.focusDebounceDelay
    );
  }

  /**
   * Updates the map target and range from the current flight plan focus.
   */
  private updateRangeTargetFromFocus(): void {
    const targetRange = this.focusCalculator.calculateRangeTarget(
      this.focusModule.focus.get(),
      this.focusMargins,
      this.ownAirplanePropsModule.position.get(),
      this.focusRangeTarget
    );

    if (isNaN(targetRange.range)) {
      return;
    }

    this.mapTargetParam.target.set(targetRange.target);
    this.context.projection.setQueued(this.mapTargetParam);

    const ranges = this.rangeModule.nominalRanges.get();

    const rangeIndex = targetRange.range > 0
      ? ranges.findIndex(range => range.asUnit(UnitType.GA_RADIAN) >= targetRange.range)
      : this.defaultFocusRangeIndex;

    const rangeIndexToSet = rangeIndex < 0 ? ranges.length - 1 : rangeIndex;

    this.context.getController(GarminMapKeys.Range).setRangeIndex(rangeIndexToSet);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.ProjectedSize | MapProjectionChangeType.RangeEndpoints)) {
      this.pendRangeTargetUpdate();
    }
  }

  /** @inheritdoc */
  public onBeforeUpdated(): void {
    if (!this.isRangeTargetUpdatePending) {
      return;
    }

    this.updateRangeTargetFromFocus();

    this.isRangeTargetUpdatePending = false;
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.targetControl?.forfeit(this.targetControlConsumer);
    this.desiredOrientationControl?.forfeit(this.desiredOrientationControlConsumer);
    this.useRangeSetting?.forfeit(this.useRangeSettingConsumer);

    this.isPlanFocusValid.destroy();

    this.focusSub?.destroy();
    this.dataProviderSub?.destroy();
    this.planCalculatedSub?.destroy();
    this.rangeArraySub?.destroy();

    this.isFocusActivePipe?.destroy();
    this.isFocusActiveSub?.destroy();

    this.focusMarginsSub.destroy();
  }
}