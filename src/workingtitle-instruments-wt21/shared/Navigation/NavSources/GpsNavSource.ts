/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApproachGuidanceMode, EventBus, FlightPlanner, LNavEvents, NavMath, NavSourceType, Subject, VNavEvents, VNavState } from '@microsoft/msfs-sdk';

import { WT21LNavDataEvents } from '../../Systems/Autopilot/WT21LNavDataEvents';
import { WT21NavigationUserSettings } from '../WT21NavigationUserSettings';
import { NavSourceBase } from './NavSourceBase';

/** Represents a GPS/FMS source, subscribes to the custom FMS LVars. */
export class GpsSource<T extends readonly string[]> extends NavSourceBase<T> {
  private readonly lnavIsTracking = Subject.create(false);
  private readonly lnavBrgMag = Subject.create(0);
  private readonly lnavDis = Subject.create(0);
  private readonly lnavDtkMag = Subject.create(0);
  private readonly lnavXtk = Subject.create(0);
  private readonly vnavVDev = Subject.create(0);
  private readonly vnavLpvVDev = Subject.create(0);
  private readonly vnavState = Subject.create(VNavState.Disabled);
  private readonly vnavApproachMode = Subject.create(ApproachGuidanceMode.None);
  private readonly vnavPathAvailable = Subject.create(false);
  private readonly advisoryVnavSetting = WT21NavigationUserSettings.getManager(this.bus).getSetting('advisoryVnavEnabled');

  /** @inheritdoc */
  public constructor(
    bus: EventBus,
    name: T[number],
    index: number,
    private readonly flightPlanner: FlightPlanner,
  ) {
    super(bus, name, index);

    const lnav = this.bus.getSubscriber<LNavEvents & WT21LNavDataEvents>();
    lnav.on('lnav_is_tracking').whenChanged().handle(this.lnavIsTracking.set.bind(this.lnavIsTracking));
    lnav.on('lnavdata_waypoint_bearing_mag').whenChanged().handle(this.lnavBrgMag.set.bind(this.lnavBrgMag));
    lnav.on('lnavdata_waypoint_distance').whenChanged().handle(this.lnavDis.set.bind(this.lnavDis));
    lnav.on('lnavdata_dtk_mag').whenChanged().handle(this.lnavDtkMag.set.bind(this.lnavDtkMag));
    lnav.on('lnavdata_xtk').whenChanged().handle(this.lnavXtk.set.bind(this.lnavXtk));
    lnav.on('lnavdata_cdi_scale').whenChanged().handle(this.setters.get('lateralDeviationScaling')!);
    lnav.on('lnavdata_cdi_scale_label').whenChanged().handle(this.setters.get('lateralDeviationScalingLabel')!);
    lnav.on('lnavdata_nominal_leg_index').atFrequency(2).handle(this.handleEffectiveLegIndex);

    this.lnavIsTracking.sub(this.updateBearing);
    this.lnavBrgMag.sub(this.updateBearing);

    this.lnavIsTracking.sub(this.updateDistance);
    this.lnavDis.sub(this.updateDistance);

    this.lnavIsTracking.sub(this.updateCourse);
    this.lnavDtkMag.sub(this.updateCourse);

    this.lnavIsTracking.sub(this.updateLateralDeviation);
    this.lnavXtk.sub(this.updateLateralDeviation);
    this.lateralDeviationScaling.sub(this.updateLateralDeviation);

    const vnav = this.bus.getSubscriber<VNavEvents>();
    vnav.on('vnav_vertical_deviation').whenChangedBy(1).handle(this.vnavVDev.set.bind(this.vnavVDev));
    vnav.on('gp_vertical_deviation').whenChangedBy(1).handle(this.vnavLpvVDev.set.bind(this.vnavLpvVDev));
    vnav.on('vnav_state').whenChanged().handle(this.vnavState.set.bind(this.vnavState));
    vnav.on('gp_approach_mode').whenChanged().handle(this.vnavApproachMode.set.bind(this.vnavApproachMode));
    vnav.on('vnav_path_available').whenChanged().handle(this.vnavPathAvailable.set.bind(this.vnavPathAvailable));

    this.vnavVDev.sub(this.updateVerticalDeviation);
    this.vnavLpvVDev.sub(this.updateVerticalDeviation);
    this.vnavState.sub(this.updateVerticalDeviation);
    this.vnavApproachMode.sub(this.updateVerticalDeviation);
    this.vnavPathAvailable.sub(this.updateVerticalDeviation);
  }

  /** @inheritdoc */
  public getType(): NavSourceType {
    return NavSourceType.Gps;
  }

  private readonly updateBearing = (): void => {
    if (!this.lnavIsTracking.get()) {
      this.bearing.set(null);
    } else {
      this.bearing.set(this.lnavBrgMag.get());
    }
  };

  private readonly updateDistance = (): void => {
    if (!this.lnavIsTracking.get()) {
      this.distance.set(null);
    } else {
      this.distance.set(this.lnavDis.get());
    }
  };

  private readonly updateCourse = (): void => {
    if (!this.lnavIsTracking.get()) {
      this.course.set(null);
    } else {
      this.course.set(this.lnavDtkMag.get());
    }
  };

  private readonly updateLateralDeviation = (): void => {
    const scaling = this.lateralDeviationScaling.get();
    if (!this.lnavIsTracking.get() || scaling === null) {
      this.lateralDeviation.set(null);
    } else {
      const xtk = this.lnavXtk.get();
      const newDeviation = NavMath.clamp(xtk / scaling, -1, 1);
      this.lateralDeviation.set(-newDeviation);
    }
  };

  private readonly updateVerticalDeviation = (): void => {
    const lpvVDev = this.vnavLpvVDev.get();
    const gpAvailable = lpvVDev >= -1000 && lpvVDev <= 1000;
    const isVNavModeDisabled = this.vnavState.get() <= VNavState.Enabled_Inactive;
    const showVnavVdev = this.vnavPathAvailable.get() && (!isVNavModeDisabled || this.advisoryVnavSetting.value);
    let vdev = showVnavVdev ? this.vnavVDev.get() : null;
    const isGpActiveApproachMode = this.vnavApproachMode.get() === ApproachGuidanceMode.GPActive;
    if (isGpActiveApproachMode || (isVNavModeDisabled && gpAvailable)) {
      vdev = lpvVDev;
    }
    if (vdev === null) {
      this.verticalDeviation.set(null);
      return;
    }
    // TODO vertical deviation scaling?
    const newDeviation = NavMath.clamp(vdev / -750, -1, 1);
    this.verticalDeviation.set(newDeviation);
  };

  private readonly handleEffectiveLegIndex = (effectiveLegIndex: number): void => {
    if (this.flightPlanner.hasFlightPlan(0) && effectiveLegIndex >= 0) {
      const plan = this.flightPlanner.getFlightPlan(0);
      const leg = plan.tryGetLeg(effectiveLegIndex);
      this.ident.set(leg?.name || null);
    } else {
      this.ident.set(null);
    }
  };
}
