import { EventBus, Subscribable } from '@microsoft/msfs-sdk';

import { Fms } from '../../flightplan/Fms';
import { NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import { GenericNavDataBarFieldModelFactory } from './GenericNavDataBarFieldModelFactory';
import { NavDataBarFieldModelFactory, NavDataBarFieldTypeModelMap } from './NavDataBarFieldModel';
import {
  NavDataBarFieldBrgModelFactory, NavDataBarFieldDestModelFactory, NavDataBarFieldDisModelFactory, NavDataBarFieldDtgModelFactory,
  NavDataBarFieldDtkModelFactory, NavDataBarFieldEndModelFactory, NavDataBarFieldEnrModelFactory, NavDataBarFieldEtaModelFactory,
  NavDataBarFieldEteModelFactory, NavDataBarFieldFobModelFactory, NavDataBarFieldFodModelFactory, NavDataBarFieldGsModelFactory,
  NavDataBarFieldIsaModelFactory, NavDataBarFieldLdgModelFactory, NavDataBarFieldTasModelFactory, NavDataBarFieldTkeModelFactory,
  NavDataBarFieldTrkModelFactory, NavDataBarFieldVsrModelFactory, NavDataBarFieldWptModelFactory, NavDataBarFieldXtkModelFactory
} from './NavDataBarFieldTypeModelFactories';

/**
 * Configuration options for {@link DefaultNavDataBarFieldModelFactory}.
 */
export type DefaultNavDataBarFieldModelFactoryOptions = {
  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;
};

/**
 * A default implementation of NavDataBarFieldModelFactory.
 */
export class DefaultNavDataBarFieldModelFactory implements NavDataBarFieldModelFactory {
  protected readonly factory: GenericNavDataBarFieldModelFactory;

  /**
   * Creates a new instance of DefaultNavDataBarFieldModelFactory.
   * @param bus The event bus.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   * @param options Options with which to configure the factory.
   */
  public constructor(
    bus: EventBus,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    options?: Readonly<DefaultNavDataBarFieldModelFactoryOptions>
  );
  /**
   * Creates a new instance of DefaultNavDataBarFieldModelFactory.
   * @param bus The event bus.
   * @param fms The flight management system.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   * @param options Options with which to configure the factory.
   * @deprecated Please use the constructor overload without the `fms` parameter, since that parameter is no longer
   * used.
   */
  public constructor(
    bus: EventBus,
    fms: Fms,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    options?: Readonly<DefaultNavDataBarFieldModelFactoryOptions>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    bus: EventBus,
    arg2: Fms | Subscribable<NavDataFieldGpsValidity>,
    arg3?: Subscribable<NavDataFieldGpsValidity> | Readonly<DefaultNavDataBarFieldModelFactoryOptions>,
    arg4?: Readonly<DefaultNavDataBarFieldModelFactoryOptions>
  ) {
    let gpsValidity: Subscribable<NavDataFieldGpsValidity>;
    let options: Readonly<DefaultNavDataBarFieldModelFactoryOptions> | undefined;

    if (arg2 instanceof Fms) {
      gpsValidity = arg3 as Subscribable<NavDataFieldGpsValidity>;
      options = arg4;
    } else {
      gpsValidity = arg2;
      options = arg3 as Readonly<DefaultNavDataBarFieldModelFactoryOptions> | undefined;
    }

    this.factory = new GenericNavDataBarFieldModelFactory(gpsValidity);

    const lnavIndex = options?.lnavIndex ?? 0;
    const vnavIndex = options?.vnavIndex ?? 0;

    this.factory.register(NavDataFieldType.BearingToWaypoint, new NavDataBarFieldBrgModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.Destination, new NavDataBarFieldDestModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.DistanceToWaypoint, new NavDataBarFieldDisModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.DistanceToDestination, new NavDataBarFieldDtgModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.DesiredTrack, new NavDataBarFieldDtkModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.Endurance, new NavDataBarFieldEndModelFactory(bus));
    this.factory.register(NavDataFieldType.TimeToDestination, new NavDataBarFieldEnrModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.TimeOfWaypointArrival, new NavDataBarFieldEtaModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.TimeToWaypoint, new NavDataBarFieldEteModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.FuelOnBoard, new NavDataBarFieldFobModelFactory(bus));
    this.factory.register(NavDataFieldType.FuelOverDestination, new NavDataBarFieldFodModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.GroundSpeed, new NavDataBarFieldGsModelFactory(bus));
    this.factory.register(NavDataFieldType.ISA, new NavDataBarFieldIsaModelFactory(bus));
    this.factory.register(NavDataFieldType.TimeOfDestinationArrival, new NavDataBarFieldLdgModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.TrueAirspeed, new NavDataBarFieldTasModelFactory(bus));
    this.factory.register(NavDataFieldType.TrackAngleError, new NavDataBarFieldTkeModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.GroundTrack, new NavDataBarFieldTrkModelFactory(bus));
    this.factory.register(NavDataFieldType.VerticalSpeedRequired, new NavDataBarFieldVsrModelFactory(bus, vnavIndex));
    this.factory.register(NavDataFieldType.Waypoint, new NavDataBarFieldWptModelFactory(bus, lnavIndex));
    this.factory.register(NavDataFieldType.CrossTrack, new NavDataBarFieldXtkModelFactory(bus, lnavIndex));
  }

  /**
   * Creates a navigation data bar field data model for a given type of field.
   * @param type A data bar field type.
   * @returns A navigation data bar field data model for the given field type.
   * @throws Error if an unsupported field type is specified.
   */
  public create<T extends NavDataFieldType>(type: T): NavDataBarFieldTypeModelMap[T] {
    return this.factory.create(type);
  }
}