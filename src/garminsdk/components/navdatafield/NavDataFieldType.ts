import { NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, UnitFamily } from '@microsoft/msfs-sdk';

import { NavDataFieldModel } from './NavDataFieldModel';

/**
 * The different types of navigation data fields.
 */
export enum NavDataFieldType {
  AboveGroundLevel = 'AGL',
  BearingToWaypoint = 'BRG',
  CabinAltitude = 'CAB',
  ClimbGradient = 'CLG',
  ClimbGradientPerDistance = 'CLM',
  CarbonMonoxide = 'CO',
  DensityAltitude = 'DA',
  Destination = 'DEST',
  DistanceToWaypoint = 'DIS',
  DistanceToDestination = 'DTG',
  DesiredTrack = 'DTK',
  FuelEconomy = 'ECO',
  Endurance = 'END',
  TimeToDestination = 'ENR',
  TimeOfWaypointArrival = 'ETA',
  TimeToWaypoint = 'ETE',
  EstimatedTimeToVnav = 'ETV',
  FuelFlow = 'FF',
  FlightLevel = 'FL',
  //FlightTimer = 'FLT', <-- Disabling this for now
  FuelOnBoard = 'FOB',
  FuelOverDestination = 'FOD',
  GMeter = 'G',
  GpsAltitude = 'GPSA',
  GlideRatio = 'GR',
  GroundSpeed = 'GS',
  ISA = 'ISA',
  LocalTime = 'LCL',
  TimeOfDestinationArrival = 'LDG',
  MachNumber = 'MACH',
  OutsideTemperature = 'OAT',
  RamAirTemperature = 'RAT',
  TrueAirspeed = 'TAS',
  TrackAngleError = 'TKE',
  GroundTrack = 'TRK',
  FuelUsed = 'USD',
  UtcTime = 'UTC',
  VerticalSpeedRequired = 'VSR',
  Waypoint = 'WPT',
  CrossTrack = 'XTK',
}

/**
 * A map from navigation data field type to data model type.
 */
export type NavDataFieldTypeModelMap = {
  /** Altitude above ground level. */
  [NavDataFieldType.AboveGroundLevel]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Bearing to next waypoint. */
  [NavDataFieldType.BearingToWaypoint]: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;

  /** Cabin altitude. */
  [NavDataFieldType.CabinAltitude]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Climb gradient. */
  [NavDataFieldType.ClimbGradient]: NavDataFieldModel<number>;

  /** Climb gradient (height per distance). */
  [NavDataFieldType.ClimbGradientPerDistance]: NavDataFieldModel<NumberUnitInterface<UnitFamily.DistanceRatio>>;

  /** Carbon monoxide sensor value. */
  [NavDataFieldType.CarbonMonoxide]: NavDataFieldModel<number>;

  /** Density altitude. */
  [NavDataFieldType.DensityAltitude]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Destination ident. */
  [NavDataFieldType.Destination]: NavDataFieldModel<string>;

  /** Distance to next waypoint. */
  [NavDataFieldType.DistanceToWaypoint]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Distance to destination. */
  [NavDataFieldType.DistanceToDestination]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Desired track. */
  [NavDataFieldType.DesiredTrack]: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;

  /** Fuel economy. */
  [NavDataFieldType.FuelEconomy]: NavDataFieldModel<NumberUnitInterface<UnitFamily.DistancePerWeight>>;

  /** Endurance (time to zero fuel). */
  [NavDataFieldType.Endurance]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>;

  /** Estimated time enroute to destination. */
  [NavDataFieldType.TimeToDestination]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>;

  /** Estimated time of arrival at next waypoint. */
  [NavDataFieldType.TimeOfWaypointArrival]: NavDataFieldModel<number>;

  /** Estimated time enroute to next waypoint. */
  [NavDataFieldType.TimeToWaypoint]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>;

  /** Estimated time to VNAV intercept. */
  [NavDataFieldType.EstimatedTimeToVnav]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>;

  /** Fuel flow. */
  [NavDataFieldType.FuelFlow]: NavDataFieldModel<NumberUnitInterface<UnitFamily.WeightFlux>>;

  /** Flight level. */
  [NavDataFieldType.FlightLevel]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Total fuel remaining. */
  [NavDataFieldType.FuelOnBoard]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>;

  /** Estimated fuel remaining at destination. */
  [NavDataFieldType.FuelOverDestination]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>;

  /** G meter. */
  [NavDataFieldType.GMeter]: NavDataFieldModel<number>;

  /** GPS Altitude. */
  [NavDataFieldType.GpsAltitude]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;

  /** Glide ratio. */
  [NavDataFieldType.GlideRatio]: NavDataFieldModel<number>;

  /** Ground speed. */
  [NavDataFieldType.GroundSpeed]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>;

  /** International standard atmosphere. */
  [NavDataFieldType.ISA]: NavDataFieldModel<NumberUnitInterface<UnitFamily.TemperatureDelta>>;

  /** Local time. */
  [NavDataFieldType.LocalTime]: NavDataFieldModel<number>;

  /** Estimated time of arrival at destination. */
  [NavDataFieldType.TimeOfDestinationArrival]: NavDataFieldModel<number>;

  /** Mach number. */
  [NavDataFieldType.MachNumber]: NavDataFieldModel<number>;

  /** Outside air temperature. */
  [NavDataFieldType.OutsideTemperature]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Temperature>>;

  /** Ram air temperature. */
  [NavDataFieldType.RamAirTemperature]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Temperature>>;

  /** True airspeed. */
  [NavDataFieldType.TrueAirspeed]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>;

  /** Track angle error. */
  [NavDataFieldType.TrackAngleError]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Angle>>;

  /** Ground track. */
  [NavDataFieldType.GroundTrack]: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;

  /** Fuel used. */
  [NavDataFieldType.FuelUsed]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>;

  /** UTC time. */
  [NavDataFieldType.UtcTime]: NavDataFieldModel<number>;

  /** Vertical speed required to meet next VNAV restriction. */
  [NavDataFieldType.VerticalSpeedRequired]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>;

  /** Next waypoint ident. */
  [NavDataFieldType.Waypoint]: NavDataFieldModel<string>;

  /** Cross-track error. */
  [NavDataFieldType.CrossTrack]: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>;
}