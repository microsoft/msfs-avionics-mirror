import { BasicNavAngleSubject, NumberUnitSubject, Subject, UnitFamily } from '@microsoft/msfs-sdk';

/**
 * Flight plan data field types.
 */
export enum FlightPlanDataFieldType {
  CumulativeDistance = 'CumulativeDistance',
  CumulativeEte = 'CumulativeEte',
  CumulativeFuel = 'CumulativeFuel',
  Eta = 'Eta',
  FuelRemaining = 'FuelRemaining',
  Dtk = 'Dtk',
  LegDistance = 'LegDistance',
  LegEte = 'LegEte',
  LegFuel = 'LegFuel',
  Sunrise = 'Sunrise',
  Sunset = 'Sunset'
}

/**
 * A map from flight plan data field type to data value type.
 */
export type FlightPlanDataFieldTypeValueMap = {
  /** Cumulative distance. */
  [FlightPlanDataFieldType.CumulativeDistance]: NumberUnitSubject<UnitFamily.Distance>;

  /** Cumulative estimated time enroute. */
  [FlightPlanDataFieldType.CumulativeEte]: NumberUnitSubject<UnitFamily.Duration>;

  /** Cumulative fuel burn. */
  [FlightPlanDataFieldType.CumulativeFuel]: NumberUnitSubject<UnitFamily.Weight>;

  /** Estimated time of arrival. */
  [FlightPlanDataFieldType.Eta]: Subject<number>;

  /** Fuel remaining. */
  [FlightPlanDataFieldType.FuelRemaining]: NumberUnitSubject<UnitFamily.Weight>;

  /** Desired track. */
  [FlightPlanDataFieldType.Dtk]: BasicNavAngleSubject;

  /** Leg distance. */
  [FlightPlanDataFieldType.LegDistance]: NumberUnitSubject<UnitFamily.Distance>;

  /** Leg estimated time enroute. */
  [FlightPlanDataFieldType.LegEte]: NumberUnitSubject<UnitFamily.Duration>;

  /** Leg fuel burn. */
  [FlightPlanDataFieldType.LegFuel]: NumberUnitSubject<UnitFamily.Weight>;

  /** Time of sunrise. */
  [FlightPlanDataFieldType.Sunrise]: Subject<number>;

  /** Time of sunset. */
  [FlightPlanDataFieldType.Sunset]: Subject<number>;
};

/**
 * A flight plan data field.
 */
export interface FlightPlanDataField<T extends FlightPlanDataFieldType = FlightPlanDataFieldType> {
  /** The type of this data field. */
  readonly type: T;

  /** The value of this data field. */
  readonly value: FlightPlanDataFieldTypeValueMap[T];
}