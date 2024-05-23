import { BasicNavAngleSubject, BasicNavAngleUnit, NumberUnitSubject, Subject, SubscribableUtils, UnitType } from '@microsoft/msfs-sdk';

import { FlightPlanDataField, FlightPlanDataFieldType, FlightPlanDataFieldTypeValueMap } from './FlightPlanDataField';
import { FlightPlanDataFieldFactory } from './FlightPlanDataFieldFactory';

/**
 * A default implementation of `FlightPlanDataFieldFactory`.
 */
export class DefaultFlightPlanDataFieldFactory implements FlightPlanDataFieldFactory {
  /** @inheritDoc */
  public create<T extends FlightPlanDataFieldType>(type: T): FlightPlanDataField<T> | null {
    let value: FlightPlanDataFieldTypeValueMap[T];

    switch (type) {
      case FlightPlanDataFieldType.CumulativeDistance:
      case FlightPlanDataFieldType.LegDistance:
        value = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN)) as unknown as FlightPlanDataFieldTypeValueMap[T];
        break;
      case FlightPlanDataFieldType.CumulativeEte:
      case FlightPlanDataFieldType.LegEte:
        value = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN)) as unknown as FlightPlanDataFieldTypeValueMap[T];
        break;
      case FlightPlanDataFieldType.CumulativeFuel:
      case FlightPlanDataFieldType.FuelRemaining:
      case FlightPlanDataFieldType.LegFuel:
        value = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN)) as unknown as FlightPlanDataFieldTypeValueMap[T];
        break;
      case FlightPlanDataFieldType.Eta:
      case FlightPlanDataFieldType.Sunrise:
      case FlightPlanDataFieldType.Sunset:
        value = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY) as unknown as FlightPlanDataFieldTypeValueMap[T];
        break;
      case FlightPlanDataFieldType.Dtk:
        value = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN)) as unknown as FlightPlanDataFieldTypeValueMap[T];
        break;
      default:
        return null;
    }

    return { type, value };
  }
}