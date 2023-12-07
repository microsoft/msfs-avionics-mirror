import { EventBus, Subscribable } from '@microsoft/msfs-sdk';

import { NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import { NavDataBarFieldTypeModelFactory, NavDataBarFieldTypeModelMap } from './NavDataBarFieldModel';

/**
 * An abstract implementation of {@link NavDataBarFieldTypeModelFactory} which accesses data from the event bus to use
 * to create its data models.
 */
export abstract class EventBusNavDataBarFieldTypeModelFactory<T extends NavDataFieldType, E> implements NavDataBarFieldTypeModelFactory<T> {
  protected readonly sub = this.bus.getSubscriber<E>();

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
  }

  /** @inheritdoc */
  public abstract create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldTypeModelMap[T];
}