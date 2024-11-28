import { EventBus, Subscribable } from '@microsoft/msfs-sdk';

import {
  DefaultNavDataBarFieldModelFactory, DefaultNavDataBarFieldModelFactoryOptions, NavDataBarFieldAglModelFactory,
  NavDataBarFieldCabinAltitudeModelFactory, NavDataBarFieldClgModelFactory, NavDataBarFieldClmModelFactory,
  NavDataBarFieldDensityAltitudeModelFactory, NavDataBarFieldEcoModelFactory, NavDataBarFieldFlightLevelModelFactory,
  NavDataBarFieldFuelFlowModelFactory, NavDataBarFieldGMeterModelFactory, NavDataBarFieldGpsAltitudeModelFactory,
  NavDataBarFieldMachModelFactory, NavDataBarFieldOatModelFactory, NavDataBarFieldRatModelFactory,
  NavDataBarFieldUtcModelFactory, NavDataFieldGpsValidity, NavDataFieldType
} from '@microsoft/msfs-garminsdk';

/**
 * A G3X implementation of NavDataBarFieldModelFactory.
 */
export class G3XNavDataBarFieldModelFactory extends DefaultNavDataBarFieldModelFactory {
  /**
   * Creates a new instance of G3XNavDataBarFieldModelFactory.
   * @param bus The event bus.
   * @param gpsValidity The GPS validity state to pass to the models created by the factory.
   * @param options Options with which to configure the factory.
   */
  public constructor(
    bus: EventBus,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    options?: Readonly<DefaultNavDataBarFieldModelFactoryOptions>
  ) {
    super(bus, gpsValidity, options);

    this.factory.register(NavDataFieldType.AboveGroundLevel, new NavDataBarFieldAglModelFactory(bus));
    this.factory.register(NavDataFieldType.CabinAltitude, new NavDataBarFieldCabinAltitudeModelFactory(bus));
    this.factory.register(NavDataFieldType.ClimbGradient, new NavDataBarFieldClgModelFactory(bus));
    this.factory.register(NavDataFieldType.ClimbGradientPerDistance, new NavDataBarFieldClmModelFactory(bus));
    this.factory.register(NavDataFieldType.DensityAltitude, new NavDataBarFieldDensityAltitudeModelFactory(bus));
    this.factory.register(NavDataFieldType.FuelEconomy, new NavDataBarFieldEcoModelFactory(bus));
    this.factory.register(NavDataFieldType.FlightLevel, new NavDataBarFieldFlightLevelModelFactory(bus));
    this.factory.register(NavDataFieldType.FuelFlow, new NavDataBarFieldFuelFlowModelFactory(bus));
    this.factory.register(NavDataFieldType.GMeter, new NavDataBarFieldGMeterModelFactory(bus));
    this.factory.register(NavDataFieldType.GpsAltitude, new NavDataBarFieldGpsAltitudeModelFactory(bus));
    this.factory.register(NavDataFieldType.LocalTime, new NavDataBarFieldUtcModelFactory(bus));
    this.factory.register(NavDataFieldType.MachNumber, new NavDataBarFieldMachModelFactory(bus));
    this.factory.register(NavDataFieldType.OutsideTemperature, new NavDataBarFieldOatModelFactory(bus));
    this.factory.register(NavDataFieldType.RamAirTemperature, new NavDataBarFieldRatModelFactory(bus));
    this.factory.register(NavDataFieldType.UtcTime, new NavDataBarFieldUtcModelFactory(bus));
  }
}