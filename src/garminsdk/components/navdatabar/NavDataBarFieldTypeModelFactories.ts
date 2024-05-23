import {
  AccelerometerEvents, Accessible, AdcEvents, AhrsEvents, BaseLNavEvents, BasicNavAngleSubject, BasicNavAngleUnit,
  ClockEvents, Consumer, EngineEvents, EventBus, EventSubscriber, GNSSEvents, LNavEvents, LNavUtils,
  MappedSubscribable, NavAngleUnit, NavAngleUnitFamily, NavMath, NumberUnitInterface, NumberUnitSubject,
  PressurizationEvents, Subject, Subscribable, SubscribableUtils, UnitFamily, UnitType, VNavUtils
} from '@microsoft/msfs-sdk';

import { BaseGarminVNavDataEvents, GarminVNavDataEvents } from '../../autopilot/vnav/GarminVNavDataEvents';
import { BaseGarminVNavEvents, GarminVNavEvents } from '../../autopilot/vnav/GarminVNavEvents';
import { BaseLNavDataEvents, LNavDataEvents } from '../../navigation/LNavDataEvents';
import { NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import { EventBusNavDataBarFieldTypeModelFactory } from './EventBusNavDataBarFieldTypeModelFactory';
import {
  NavDataBarFieldConsumerValueModel, NavDataBarFieldConsumerValueNumberUnitModel,
  NavDataBarFieldModel
} from './NavDataBarFieldModel';

/**
 * Checks whether an LNAV index is valid.
 * @param lnavIndex The LNAV index to check.
 * @returns Whether the specified LNAV index is valid.
 */
function isLNavIndexValid(lnavIndex: number | Accessible<number>): boolean {
  if (typeof lnavIndex === 'object') {
    lnavIndex = lnavIndex.get();
  }

  return LNavUtils.isValidLNavIndex(lnavIndex);
}

/**
 * Resolves a base LNAV event bus topic for an LNAV index value. If the LNAV index is a static number, then the base
 * topic will be resolved to a consumer of the resolved topic corresponding to the value of the index. If the the LNAV
 * index is a subscribable, then the base topic will be resolved to a mapped subscribable of consumers of the resolved
 * topic corresopnding to the value of the index subscribable.
 * @param lnavIndex The LNAV index for which to resolve the topic.
 * @param subscriber The subscriber to use to subscribe to event bus topics.
 * @param topic The base LNAV event bus topic to resolve.
 * @returns A consumer for the resolved LNAV event bus topic if `lnavIndex` is a static number, or a mapped
 * subscribable of consumers of the resolved event bus topic if `lnavIndex` is a subscribable.
 */
function resolveLNavConsumer<T extends keyof (BaseLNavEvents & BaseLNavDataEvents)>(
  lnavIndex: number | Subscribable<number>,
  subscriber: EventSubscriber<LNavEvents & LNavDataEvents>,
  topic: T
): Consumer<(BaseLNavEvents & BaseLNavDataEvents)[T]> | MappedSubscribable<Consumer<(BaseLNavEvents & BaseLNavDataEvents)[T]> | null> {
  return SubscribableUtils.isSubscribable(lnavIndex)
    ? lnavIndex.map(index => {
      return LNavUtils.isValidLNavIndex(index)
        ? subscriber.on(`${topic}${LNavUtils.getEventBusTopicSuffix(index)}`)
        : null;
    }) as unknown as MappedSubscribable<Consumer<(BaseLNavEvents & BaseLNavDataEvents)[T]> | null>
    : subscriber.on(`${topic}${LNavUtils.getEventBusTopicSuffix(lnavIndex)}`) as unknown as Consumer<(BaseLNavEvents & BaseLNavDataEvents)[T]>;
}

/**
 * Checks whether a VNAV index is valid.
 * @param vnavIndex The VNAV index to check.
 * @returns Whether the specified VNAV index is valid.
 */
function isVNavIndexValid(vnavIndex: number | Accessible<number>): boolean {
  if (typeof vnavIndex === 'object') {
    vnavIndex = vnavIndex.get();
  }

  return VNavUtils.isValidVNavIndex(vnavIndex);
}

/**
 * Resolves a base VNAV event bus topic for a VNAV index value. If the VNAV index is a static number, then the base
 * topic will be resolved to a consumer of the resolved topic corresponding to the value of the index. If the the VNAV
 * index is a subscribable, then the base topic will be resolved to a mapped subscribable of consumers of the resolved
 * topic corresopnding to the value of the index subscribable.
 * @param vnavIndex The VNAV index for which to resolve the topic.
 * @param subscriber The subscriber to use to subscribe to event bus topics.
 * @param topic The base VNAV event bus topic to resolve.
 * @returns A consumer for the resolved VNAV event bus topic if `vnavIndex` is a static number, or a mapped
 * subscribable of consumers of the resolved event bus topic if `vnavIndex` is a subscribable.
 */
function resolveVNavConsumer<T extends keyof (BaseGarminVNavEvents & BaseGarminVNavDataEvents)>(
  vnavIndex: number | Subscribable<number>,
  subscriber: EventSubscriber<GarminVNavEvents & GarminVNavDataEvents>,
  topic: T
): Consumer<(BaseGarminVNavEvents & BaseGarminVNavDataEvents)[T]> | MappedSubscribable<Consumer<(BaseGarminVNavEvents & BaseGarminVNavDataEvents)[T]> | null> {
  return SubscribableUtils.isSubscribable(vnavIndex)
    ? vnavIndex.map(index => {
      return VNavUtils.isValidVNavIndex(index)
        ? subscriber.on(`${topic}${VNavUtils.getEventBusTopicSuffix(index)}`)
        : null;
    }) as unknown as MappedSubscribable<Consumer<(BaseGarminVNavEvents & BaseGarminVNavDataEvents)[T]> | null>
    : subscriber.on(`${topic}${VNavUtils.getEventBusTopicSuffix(vnavIndex)}`) as unknown as Consumer<(BaseGarminVNavEvents & BaseGarminVNavDataEvents)[T]>;
}

/**
 * Creates data models for Above Ground Level navigation data bar fields.
 */
export class NavDataBarFieldAglModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.AboveGroundLevel, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('above_ground_height'),
      ],
      [0] as [number],
      (sub, validity, [alt]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? alt.get() : NaN);
      }
    );
  }
}

/**
 * Creates data models for Bearing to Waypoint navigation data bar fields.
 */
export class NavDataBarFieldBrgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.BearingToWaypoint, GNSSEvents & LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldBrgModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_waypoint_bearing_mag'),
      this.sub.on('magvar')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      consumers,
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, bearing, magVar]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) ? bearing.get() : NaN, magVar.get());
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Cabin Altitude navigation data bar fields.
 */
export class NavDataBarFieldCabinAltitudeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.CabinAltitude, PressurizationEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('cabin_altitude'),
      ],
      [0] as [number],
      (sub, validity, [alt]) => {
        sub.set(alt.get());
      }
    );
  }
}

/**
 * Creates data models for Climb Gradient navigation data bar fields.
 */
export class NavDataBarFieldClgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.ClimbGradient, AdcEvents & GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('vertical_speed'),
        this.sub.on('ground_speed'),
      ],
      [0, 0] as [number, number],
      (sub, validity, [vs, gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const gsValue = gs.get();
        if (gpsValid && gsValue >= 30) {
          sub.set(vs.get() / UnitType.KNOT.convertTo(gsValue, UnitType.FPM) * 100);
        } else {
          sub.set(NaN);
        }
      }
    );
  }
}

/**
 * Creates data models for Climb Gradient (height per distance) navigation data bar fields.
 */
export class NavDataBarFieldClmModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.ClimbGradientPerDistance, AdcEvents & GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.DistanceRatio>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT_PER_NMILE.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('vertical_speed'),
        this.sub.on('ground_speed'),
      ],
      [0, 0] as [number, number],
      (sub, validity, [vs, gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const gsValue = gs.get();
        if (gpsValid && gsValue >= 30) {
          sub.set(vs.get() / gsValue * 60);
        } else {
          sub.set(NaN);
        }
      }
    );
  }
}

/**
 * Creates data models for Density Altitude navigation data bar fields.
 */
export class NavDataBarFieldDensityAltitudeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DensityAltitude, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('pressure_alt'),
      ],
      [0] as [number],
      (sub, validity, [alt]) => {
        sub.set(alt.get());
      }
    );
  }
}

/**
 * Creates data models for Destination navigation data bar fields.
 */
export class NavDataBarFieldDestModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Destination, LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldDestModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<string> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_destination_ident')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      Subject.create('____'),
      gpsValidity,
      consumers,
      [''] as [string],
      (sub, validity, [ident]) => {
        sub.set(ident.get() === '' ? '____' : ident.get());
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Distance to Waypoint navigation data bar fields.
 */
export class NavDataBarFieldDisModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DistanceToWaypoint, LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldDisModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_waypoint_distance')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, distance]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) ? distance.get() : NaN);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Distance to Destination navigation data bar fields.
 */
export class NavDataBarFieldDtgModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DistanceToDestination, LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldDtgModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_destination_distance')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, distance]) => {
        const gpsValidityValue = validity.get();
        const isGpsValid = gpsValidityValue === NavDataFieldGpsValidity.DeadReckoning || gpsValidityValue === NavDataFieldGpsValidity.Valid;
        const distanceValue = distance.get();
        sub.set((isGpsValid && isLNavIndexValid(this.lnavIndex) && isTracking.get() && distanceValue >= 0) ? distanceValue : NaN);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Desired Track navigation data bar fields.
 */
export class NavDataBarFieldDtkModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.DesiredTrack, GNSSEvents & LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldDtkModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_dtk_mag'),
      this.sub.on('magvar')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      consumers,
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, track, magVar]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) ? track.get() : NaN, magVar.get());
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Fuel Economy navigation data bar fields.
 */
export class NavDataBarFieldEcoModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelEconomy, GNSSEvents & EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.DistancePerWeight>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE_PER_GALLON_FUEL.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_flow_total'),
        this.sub.on('ground_speed'),
      ],
      [0, 0] as [number, number],
      (sub, validity, [ff, gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        const ffValue = ff.get();
        const gsValue = gs.get();
        sub.set(gpsValid && ffValue > 0 && gsValue >= 30 ? gsValue / ffValue : NaN);
      }
    );
  }
}

/**
 * Creates data models for Endurance navigation data bar fields.
 */
export class NavDataBarFieldEndModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Endurance, EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_usable_total'),
        this.sub.on('fuel_flow_total')
      ],
      [0, 0] as [number, number],
      (sub, validity, [fuelRemaining, fuelFlow]) => {
        let endurance = NaN;
        const fuelFlowGph = fuelFlow.get();
        if (fuelFlowGph > 0) {
          const fuelGal = fuelRemaining.get();
          endurance = fuelGal / fuelFlowGph;
        }
        sub.set(endurance);
      }
    );
  }
}

/**
 * Creates data models for Time To Destination navigation data bar fields.
 */
export class NavDataBarFieldEnrModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeToDestination, GNSSEvents & LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldEnrModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_destination_distance'),
      this.sub.on('ground_speed')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, distance, gs]) => {
        let time = NaN;
        const gpsValidityValue = validity.get();
        const gpsValid = gpsValidityValue === NavDataFieldGpsValidity.DeadReckoning || gpsValidityValue === NavDataFieldGpsValidity.Valid;


        if (gpsValid && isLNavIndexValid(this.lnavIndex) && isTracking.get()) {
          const distanceNM = distance.get();
          const gsKnots = gs.get();
          if (distanceNM >= 0 && gsKnots > 30) {
            time = distanceNM / gsKnots;
          }
        }
        sub.set(time);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Estimated Time of Arrival navigation data bar fields.
 */
export class NavDataBarFieldEtaModelFactory
  extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeOfWaypointArrival, GNSSEvents & LNavEvents & LNavDataEvents & ClockEvents> {

  /**
   * Creates a new instance of NavDataBarFieldEtaModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_waypoint_distance'),
      this.sub.on('ground_speed'),
      this.sub.on('simTime')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      consumers,
      [false, 0, 0, NaN] as [boolean, number, number, number],
      (sub, validity, [isTracking, distance, gs, time]) => {
        let eta = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          if (gsKnots > 30) {
            const distanceNM = distance.get();
            eta = UnitType.HOUR.convertTo(distanceNM / gsKnots, UnitType.MILLISECOND) + time.get();
          }
        }
        sub.set(eta);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Time To Waypoint navigation data bar fields.
 */
export class NavDataBarFieldEteModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeToWaypoint, GNSSEvents & LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldEteModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_waypoint_distance'),
      this.sub.on('ground_speed')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.HOUR.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, distance, gs]) => {
        let time = NaN;
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) {
          const gsKnots = gs.get();
          if (gsKnots > 30) {
            const distanceNM = distance.get();
            time = distanceNM / gsKnots;
          }
        }
        sub.set(time);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Fuel Flow navigation data bar fields.
 */
export class NavDataBarFieldFuelFlowModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelFlow, EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.WeightFlux>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.GPH_FUEL.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('fuel_flow_total'),
      ],
      [0] as [number],
      (sub, validity, [fuelFlow]) => {
        sub.set(fuelFlow.get());
      }
    );
  }
}

/**
 * Creates data models for Flight Level navigation data bar fields.
 */
export class NavDataBarFieldFlightLevelModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FlightLevel, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('gps-position'),
      ],
      [{ lat: 0, long: 0, alt: 0 }] as [LatLongAlt],
      (sub, validity, [latLongAlt]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? latLongAlt.get().alt : NaN);
      }
    );
  }
}

/**
 * Creates data models for Fuel on Board navigation data bar fields.
 */
export class NavDataBarFieldFobModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelOnBoard, EngineEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Weight>> {
    return new NavDataBarFieldConsumerValueNumberUnitModel(
      gpsValidity,
      this.sub.on('fuel_usable_total'), 0, UnitType.GALLON_FUEL
    );
  }
}

/**
 * Creates data models for Fuel Over Destination navigation data bar fields.
 */
export class NavDataBarFieldFodModelFactory
  extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.FuelOverDestination, GNSSEvents & LNavEvents & LNavDataEvents & EngineEvents> {

  /**
   * Creates a new instance of NavDataBarFieldFodModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Weight>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_destination_distance'),
      this.sub.on('ground_speed'),
      this.sub.on('fuel_usable_total'),
      this.sub.on('fuel_flow_total')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0, 0, 0, 0] as [boolean, number, number, number, number],
      (sub, validity, [isTracking, distance, gs, fuelRemaining, fuelFlow]) => {
        let fod = NaN;
        const gpsValidityValue = validity.get();
        const gpsValid = gpsValidityValue === NavDataFieldGpsValidity.DeadReckoning || gpsValidityValue === NavDataFieldGpsValidity.Valid;

        if (gpsValid && isLNavIndexValid(this.lnavIndex) && isTracking.get()) {
          const distanceNM = distance.get();
          const gsKnots = gs.get();
          const fuelFlowGph = fuelFlow.get();
          if (distanceNM >= 0 && gsKnots > 30 && fuelFlowGph > 0) {
            const fuelGal = fuelRemaining.get();
            fod = fuelGal - distanceNM / gsKnots * fuelFlowGph;
          }
        }
        sub.set(fod);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for G-Meter navigation data bar fields.
 */
export class NavDataBarFieldGMeterModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GMeter, AccelerometerEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('g_force'),
      ],
      [0] as [number],
      (sub, validity, [g]) => {
        sub.set(g.get());
      }
    );
  }
}

/**
 * Creates data models for GPS Altitude navigation data bar fields.
 */
export class NavDataBarFieldGpsAltitudeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GpsAltitude, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('gps-position'),
      ],
      [{ lat: 0, long: 0, alt: 0 }] as [LatLongAlt],
      (sub, validity, [latLongAlt]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? latLongAlt.get().alt : NaN);
      }
    );
  }
}

/**
 * Creates data models for Ground Speed navigation data bar fields.
 */
export class NavDataBarFieldGsModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GroundSpeed, GNSSEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ground_speed')
      ],
      [0],
      (sub, validity, [gs]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set(gpsValid ? gs.get() : NaN);
      }
    );
  }
}

/**
 * Creates data models for ISA navigation data bar fields.
 */
export class NavDataBarFieldIsaModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.ISA, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.TemperatureDelta>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.DELTA_CELSIUS.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ambient_temp_c'),
        this.sub.on('isa_temp_c')
      ],
      [0],
      (sub, validity, [sat, isa]) => {
        sub.set(sat.get() - isa.get());
      }
    );
  }
}

/**
 * Creates data models for Estimated Time of Arrival at Destination navigation data bar fields.
 */
export class NavDataBarFieldLdgModelFactory
  extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TimeOfDestinationArrival, GNSSEvents & LNavEvents & LNavDataEvents & ClockEvents> {

  /**
   * Creates a new instance of NavDataBarFieldLdgModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_destination_distance'),
      this.sub.on('ground_speed'),
      this.sub.on('simTime')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      consumers,
      [false, 0, 0, NaN] as [boolean, number, number, number],
      (sub, validity, [isTracking, distance, gs, time]) => {
        let eta = NaN;
        const gpsValidityValue = validity.get();
        const gpsValid = gpsValidityValue === NavDataFieldGpsValidity.DeadReckoning || gpsValidityValue === NavDataFieldGpsValidity.Valid;

        if (gpsValid && isLNavIndexValid(this.lnavIndex) && isTracking.get()) {
          const distanceNM = distance.get();
          const gsKnots = gs.get();
          if (distanceNM >= 0 && gsKnots > 30) {
            eta = UnitType.HOUR.convertTo(distanceNM / gsKnots, UnitType.MILLISECOND) + time.get();
          }
        }
        sub.set(eta);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Mach Number navigation data bar fields.
 */
export class NavDataBarFieldMachModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.MachNumber, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('mach_number'),
      ],
      [0] as [number],
      (sub, validity, [mach]) => {
        sub.set(mach.get());
      }
    );
  }
}

/**
 * Creates data models for Outside Air Temperature navigation data bar fields.
 */
export class NavDataBarFieldOatModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.OutsideTemperature, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Temperature>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ambient_temp_c'),
      ],
      [0] as [number],
      (sub, validity, [temp]) => {
        sub.set(temp.get());
      }
    );
  }
}

/**
 * Creates data models for Ram Air Temperature navigation data bar fields.
 */
export class NavDataBarFieldRatModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.RamAirTemperature, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Temperature>> {
    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN)),
      gpsValidity,
      [
        this.sub.on('ram_air_temp_c'),
      ],
      [0] as [number],
      (sub, validity, [temp]) => {
        sub.set(temp.get());
      }
    );
  }
}

/**
 * Creates data models for True Airspeed navigation data bar fields.
 */
export class NavDataBarFieldTasModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TrueAirspeed, AdcEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>> {
    return new NavDataBarFieldConsumerValueNumberUnitModel(
      gpsValidity,
      this.sub.on('tas'), 0, UnitType.KNOT
    );
  }
}

/**
 * Creates data models for Track Angle Error navigation data bar fields.
 */
export class NavDataBarFieldTkeModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.TrackAngleError, GNSSEvents & LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldTkeModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Angle>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_dtk_true'),
      this.sub.on('track_deg_true')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0, 0] as [boolean, number, number],
      (sub, validity, [isTracking, dtk, track]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) ? NavMath.diffAngle(dtk.get(), track.get()) : NaN);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Ground Track navigation data bar fields.
 */
export class NavDataBarFieldTrkModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.GroundTrack, GNSSEvents & AhrsEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>> {
    return new NavDataBarFieldConsumerValueModel(
      BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0)),
      gpsValidity,
      [
        this.sub.on('hdg_deg_true'),
        this.sub.on('ground_speed'),
        this.sub.on('track_deg_magnetic'),
        this.sub.on('magvar')
      ],
      [0, 0, 0, 0] as [number, number, number, number],
      (sub, validity, [hdg, gs, track, magVar]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;

        if (gs.get() < 5) {
          sub.set(gpsValid ? hdg.get() : NaN, magVar.get());
        } else {
          sub.set(gpsValid ? track.get() : NaN, magVar.get());
        }
      }
    );
  }
}

/**
 * Creates data models for UTC Time navigation data bar fields.
 */
export class NavDataBarFieldUtcModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.UtcTime, ClockEvents> {
  /** @inheritdoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<number> {
    return new NavDataBarFieldConsumerValueModel(
      Subject.create(NaN),
      gpsValidity,
      [
        this.sub.on('simTime')
      ],
      [NaN] as [number],
      (sub, validity, [time]) => {
        sub.set(time.get());
      }
    );
  }
}

/**
 * Creates data models for Vertical Speed Required navigation data bar fields.
 */
export class NavDataBarFieldVsrModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.VerticalSpeedRequired, GarminVNavEvents & GarminVNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldVsrModelFactory.
   * @param bus The event bus.
   * @param vnavIndex The index of the VNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly vnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>> {
    const consumers = [
      resolveVNavConsumer(this.vnavIndex, this.sub, 'vnav_required_vs'),
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.FPM.createNumber(NaN)),
      gpsValidity,
      consumers,
      [0],
      (sub, validity, [vsr]) => {
        if (isVNavIndexValid(this.vnavIndex)) {
          const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
          const vsrValue = vsr.get();
          sub.set((gpsValid && vsrValue !== 0) ? vsrValue : NaN);
        } else {
          sub.set(NaN);
        }
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Active Waypoint navigation data bar fields.
 */
export class NavDataBarFieldWptModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.Waypoint, LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldWptModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<string> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_waypoint_ident')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      Subject.create('_____'),
      gpsValidity,
      consumers,
      [''],
      (sub, validity, [identVal]) => {
        const ident = identVal.get();
        sub.set(!isLNavIndexValid(this.lnavIndex) || ident === '' ? '_____' : ident);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}

/**
 * Creates data models for Cross Track navigation data bar fields.
 */
export class NavDataBarFieldXtkModelFactory extends EventBusNavDataBarFieldTypeModelFactory<NavDataFieldType.CrossTrack, LNavEvents & LNavDataEvents> {
  /**
   * Creates a new instance of NavDataBarFieldXtkModelFactory.
   * @param bus The event bus.
   * @param lnavIndex The index of the LNAV from which to source data. Defaults to `0`.
   */
  public constructor(bus: EventBus, protected readonly lnavIndex: number | Subscribable<number> = 0) {
    super(bus);
  }

  /** @inheritDoc */
  public create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>> {
    const consumers = [
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnav_is_tracking'),
      resolveLNavConsumer(this.lnavIndex, this.sub, 'lnavdata_xtk')
    ] as const;

    return new NavDataBarFieldConsumerValueModel(
      NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)),
      gpsValidity,
      consumers,
      [false, 0] as [boolean, number],
      (sub, validity, [isTracking, xtk]) => {
        const gpsValid = validity.get() === NavDataFieldGpsValidity.DeadReckoning || validity.get() === NavDataFieldGpsValidity.Valid;
        sub.set((isLNavIndexValid(this.lnavIndex) && isTracking.get() && gpsValid) ? xtk.get() : NaN);
      },
      () => {
        for (const consumer of consumers) {
          if (SubscribableUtils.isSubscribable(consumer)) {
            consumer.destroy();
          }
        }
      }
    );
  }
}
