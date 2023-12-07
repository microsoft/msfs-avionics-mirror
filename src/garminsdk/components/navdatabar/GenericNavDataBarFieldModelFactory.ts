import { Subscribable } from '@microsoft/msfs-sdk';

import { NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import { NavDataBarFieldModelFactory, NavDataBarFieldTypeModelFactory, NavDataBarFieldTypeModelMap } from './NavDataBarFieldModel';

/**
 * A generic implementation of a factory for navigation data bar field data models. For each data field type, a
 * single-type model factory can be registered. Once registered, the single-type model factory is used to create data
 * models for its assigned data field type.
 */
export class GenericNavDataBarFieldModelFactory implements NavDataBarFieldModelFactory {
  private readonly factories = new Map<NavDataFieldType, NavDataBarFieldTypeModelFactory<NavDataFieldType>>();

  /**
   * Creates an instance of aGenericNavDataBarFieldModelFactory.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   */
  constructor(private readonly gpsValidity: Subscribable<NavDataFieldGpsValidity>) { }

  /**
   * Registers a single-type model factory with this factory.
   * @param type The data field type of the single-type model factory to register.
   * @param factory The single-type model factory to register.
   */
  public register<T extends NavDataFieldType>(type: T, factory: NavDataBarFieldTypeModelFactory<T>): void {
    this.factories.set(type, factory);
  }

  /**
   * Deregisters a single-type model factory from this factory.
   * @param type The data field type of the single-type model factory to deregister.
   * @returns Whether a single-type model factory was deregistered.
   */
  public deregister<T extends NavDataFieldType>(type: T): boolean {
    return this.factories.delete(type);
  }

  /**
   * Creates a navigation data bar field data model for a given type of field.
   * @param type A data bar field type.
   * @returns A navigation data bar field data model for the given field type.
   * @throws Error if an unsupported field type is specified.
   */
  public create<T extends NavDataFieldType>(type: T): NavDataBarFieldTypeModelMap[T] {
    const model = this.factories.get(type)?.create(this.gpsValidity);

    if (!model) {
      throw new Error(`GenericNavDataBarFieldModelFactory: no single-type model factory of data field type [${type}] is registered`);
    }

    return model as NavDataBarFieldTypeModelMap[T];
  }
}