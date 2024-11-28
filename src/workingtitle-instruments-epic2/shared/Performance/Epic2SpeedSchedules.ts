import {
  AdcEvents, AeroMath, AirportFacility, ConsumerValue, ControlSurfacesEvents, EventBus, GeoPoint, LatLonInterface, Subject, Subscribable, UnitType
} from '@microsoft/msfs-sdk';

import { SpeedScheduleConfig } from '../AvionicsConfig';
import { AirGroundDataProviderEvents } from '../Instruments';
import { Epic2PerformancePlan } from './Epic2PerformancePlan';
import { Epic2VSpeedController, VSpeedType } from './Epic2VSpeedController';

/**
 * A base class that handles an Epic 2 speed schedule
 */
export class Epic2SpeedScheduleBase {
  /** The indicated airspeed for this schedule */
  public scheduledIas = -1;

  /** The mach for this schedule */
  public scheduledMach = -1;

  /** Whether to use the scheduled mach speed */
  public isMachInUse = false;

  /**
   * Determines whether the speed schedule should use mach, based on the crossover altitude
   * @param pressureAltitude The current pressure altitude, in feet
   * @returns Whether the crossover altitude has been exceeded
   */
  private determineIfMach(pressureAltitude: number): boolean {
    const scheduledMach = this.scheduledMach;

    if (scheduledMach <= 0) {
      return false;
    }

    const scheduledMps = UnitType.KNOT.convertTo(this.scheduledIas, UnitType.MPS);
    const pressureAltMetre = UnitType.FOOT.convertTo(pressureAltitude, UnitType.METER);
    const iasMachConverted = AeroMath.casToMachIsa(scheduledMps, pressureAltMetre);

    return iasMachConverted >= this.scheduledMach;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Updates the speed schedule
   * @param pressureAltitude The current pressure altitude, in feet
   * @param position The position, if applicable
   */
  public update(pressureAltitude: number, position?: LatLonInterface): void {
    this.isMachInUse = this.determineIfMach(pressureAltitude);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

/**
 * A class that handles the Epic2 climb speed schedule
 */
export class Epic2ClimbSpeedSchedule extends Epic2SpeedScheduleBase {
  private readonly currentSpeed = ConsumerValue.create<number>(this.bus.getSubscriber<AdcEvents>().on('ias').whenChangedBy(1), 0);
  private readonly isOnGround = ConsumerValue.create<boolean>(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), false);

  private readonly departureVSpeed = this.vSpeedController.vSpeedDefinitions.filter(
    (def) => def.type === VSpeedType.Takeoff && def.label.toLocaleLowerCase() === this.config.climbSchedule.vSpeedSetting.toLocaleLowerCase())[0]?.speed ?? null;

  public readonly originFac = Subject.create<AirportFacility | undefined>(undefined);
  private readonly originPosition = this.originFac.map((origin) => origin && new GeoPoint(origin.lat, origin.lon));

  public isDeparture = false;

  /** @inheritdoc */
  constructor(
    private readonly bus: EventBus,
    private readonly config: SpeedScheduleConfig,
    private readonly vSpeedController: Epic2VSpeedController,
    private readonly flapPosition: Subscribable<number>,
    private readonly gaModeActive: Subscribable<boolean>,
  ) {
    super();
  }

  /** Determines the takeoff schedule speed
   * @returns the scheduled speed for takeoff
   */
  private getTakeoffScheduleSpeed(): number {
    const departureSpeed = this.config.climbSchedule.departureSpeed.ias;

    const flapsRetracted = this.flapPosition.get() === 0;
    const vYSpeed = this.departureVSpeed.get() ?? departureSpeed;
    const currentSpeed = this.currentSpeed.get();

    if (this.gaModeActive.get()) {
      return currentSpeed < 40 ? vYSpeed : departureSpeed;
    } else {
      if (this.isOnGround.get()) {
        return vYSpeed;
      } else if (flapsRetracted) {
        return departureSpeed;
      } else {
        return Math.round(Math.max(vYSpeed, Math.min(this.currentSpeed.get(), vYSpeed + 10)));
      }
    }
  }

  /** @inheritdoc */
  public update(pressureAltitude: number, position: LatLonInterface): void {
    const originAltDifference = pressureAltitude - UnitType.FOOT.convertFrom(this.originFac.get()?.runways[0].elevation ?? 0, UnitType.METER);
    const originDist = UnitType.NMILE.convertFrom(this.originPosition.get()?.distance(position) ?? NaN, UnitType.GA_RADIAN);
    const climbSpeed = this.config.climbSchedule.climbSpeed;

    if (!isNaN(originDist) && originDist < 5 && originAltDifference < 2500) {
      this.isDeparture = true;
      this.scheduledIas = this.getTakeoffScheduleSpeed();
      this.scheduledMach = -1;
    } else {
      this.isDeparture = false;
      this.scheduledIas= climbSpeed.ias;
      this.scheduledMach = climbSpeed.mach ?? -1;
    }

    super.update(pressureAltitude);
  }
}

/**
 * A class that handles the Epic2 climb speed schedule
 */
export class Epic2CruiseSpeedSchedule extends Epic2SpeedScheduleBase {
  /** @inheritdoc */
  constructor(
    private readonly config: SpeedScheduleConfig,
    private readonly perfPlan: Epic2PerformancePlan
  ) {
    super();
  }

  /** @inheritdoc */
  public update(pressureAltitude: number): void {
    this.scheduledIas = this.perfPlan.cruiseTargetSpeedIas.get() ?? this.config.cruiseSchedule.ias;
    this.scheduledMach = this.perfPlan.cruiseTargetSpeedMach.get() ?? -1;

    super.update(pressureAltitude);
  }
}

/**
 * A class that handles the Epic2 descent speed schedule
 */
export class Epic2DescentSpeedSchedule extends Epic2SpeedScheduleBase {
  private readonly gearPosition = ConsumerValue.create<number>(this.bus.getSubscriber<ControlSurfacesEvents>().on('gear_handle_position'), 0);

  public readonly destFac = Subject.create<AirportFacility | undefined>(undefined);
  private readonly destPosition = this.destFac.map((origin) => origin && new GeoPoint(origin.lat, origin.lon));

  public isApproach = false;

  /** @inheritdoc */
  constructor(
    private readonly bus: EventBus,
    private readonly config: SpeedScheduleConfig,
    private readonly flapPosition: Subscribable<number>,
  ) {
    super();
  }

  /** Determines the approach schedule speed
   * @param altitude the altitude of the waypoint or aircraft
   * @param position the position of the waypoint or aircraft
   * @returns the scheduled speed for approach
   */
  private getApproachSchedule(altitude: number, position: LatLonInterface): number | void {
    const destinationAltDifference = altitude - UnitType.FOOT.convertFrom(this.destFac.get()?.runways[0].elevation ?? 0, UnitType.METER);
    const destinationDist = UnitType.NMILE.convertFrom(this.destPosition.get()?.distance(position) ?? NaN, UnitType.GA_RADIAN);
    const flapPosition = this.flapPosition.get();

    if (
      (destinationAltDifference < 5000 && destinationDist < 15)
      || ((flapPosition !== 0 || this.gearPosition.get() !== 0) && destinationAltDifference < 10000)
    ) {
      let lastValidSchedule;
      for (const speedConfig of this.config.descentSchedule.approachSpeed) {
        if (Math.round(flapPosition) >= speedConfig.flapAngle) {
          lastValidSchedule = speedConfig.schedule;
          break;
        }
      }

      return lastValidSchedule?.ias;
    }
  }

  /** @inheritdoc */
  public update(pressureAltitude: number, position: LatLonInterface): void {
    const approachIas = this.getApproachSchedule(pressureAltitude, position);
    const descentSpeed = this.config.descentSchedule.descentSpeed;

    if (approachIas) {
      this.isApproach = true;
      this.scheduledIas = approachIas;
      this.scheduledMach = -1;
    } else {
      this.isApproach = false;
      this.scheduledIas = descentSpeed.ias;
      this.scheduledMach = descentSpeed.mach ?? -1;
    }

    super.update(pressureAltitude);
  }
}
