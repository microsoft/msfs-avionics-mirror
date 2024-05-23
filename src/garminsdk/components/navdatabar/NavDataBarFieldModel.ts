import {
  Consumer, ConsumerSubject, ConsumerValue, NumberUnitSubject, ReadonlyConsumerValue, Subscribable, SubscribableType,
  SubscribableUtils, Subscription, Unit
} from '@microsoft/msfs-sdk';

import { NavDataFieldModel, NavDataFieldGpsValidity } from '../navdatafield/NavDataFieldModel';
import { NavDataFieldType, NavDataFieldTypeModelMap } from '../navdatafield/NavDataFieldType';

/**
 * A data model for a navigation data bar field.
 */
export interface NavDataBarFieldModel<T> extends NavDataFieldModel<T> {
  /**
   * Updates this model.
   */
  update(): void;

  /**
   * Destroys this model.
   */
  destroy(): void;
}

/** A map from navigation data field type to navigation data bar field data model type. */
export type NavDataBarFieldTypeModelMap = {
  [Type in keyof NavDataFieldTypeModelMap]: NavDataBarFieldModel<NavDataFieldTypeModelMap[Type] extends NavDataFieldModel<infer T> ? T : never>;
}

/**
 * A factory for navigation data bar field data models.
 */
export interface NavDataBarFieldModelFactory {
  /**
   * Creates a navigation data bar field data model for a given type of field.
   * @param type A data field type.
   * @returns A navigation data bar field data model for the given field type.
   */
  create<T extends NavDataFieldType>(type: T): NavDataBarFieldTypeModelMap[T];
}

/**
 * A factory which creates data models for a single type of navigation data bar field.
 */
export interface NavDataBarFieldTypeModelFactory<T extends NavDataFieldType> {
  /**
   * Creates a navigation data bar field data model for this factory's data field type.
   * @param gpsValidity The subscribable that provides the validity of the GPS data for the models.
   * @returns A navigation data bar field data model for this factory's data field type.
   */
  create(gpsValidity: Subscribable<NavDataFieldGpsValidity>): NavDataBarFieldTypeModelMap[T];
}

/**
 * A navigation data bar field data model which uses an arbitrary subscribable to provide its value and function to
 * update the value.
 */
export class NavDataBarFieldGenericModel<
  S extends Subscribable<any>,
  U extends (sub: S, gpsValidity: Subscribable<NavDataFieldGpsValidity>, ...args: any[]) => void = (sub: S) => void
>
  implements NavDataBarFieldModel<SubscribableType<S>> {

  public readonly value: Subscribable<SubscribableType<S>>;

  /**
   * Constructor.
   * @param sub The subscribable used to provide this model's value.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param updateFunc The function used to update this model's value. Can take an arbitrary number of arguments, but
   * the first must be the subscribable used to provide this model's value, and the second the model's GPS validity.
   * @param destroyFunc A function which is executed when this model is destroyed.
   */
  constructor(sub: S, public readonly gpsValidity: Subscribable<NavDataFieldGpsValidity>, protected readonly updateFunc: U, protected readonly destroyFunc?: () => void) {
    this.value = sub;
  }

  /** @inheritdoc */
  public update(): void {
    this.updateFunc(this.value as S, this.gpsValidity);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.destroyFunc && this.destroyFunc();
  }
}

/**
 * Extracts the length property from a tuple.
 */
// eslint-disable-next-line jsdoc/require-jsdoc
type TupleLength<T extends readonly [...any[]]> = { length: T['length'] };

/**
 * Maps a tuple of types to a tuple of Consumers of the same types.
 */
type ConsumerTypeMap<Types extends readonly [...any[]]> = {
  readonly [Index in keyof Types]: Consumer<Types[Index]>;
} & TupleLength<Types>;

/**
 * Maps a tuple of types to a tuple of Consumers of the same types or Subscribables of Consumers of the same types.
 */
type OptionalSubscribableConsumerTypeMap<Types extends readonly [...any[]]> = {
  readonly [Index in keyof Types]: Consumer<Types[Index]> | Subscribable<Consumer<Types[Index]> | null>;
} & TupleLength<Types>;

/**
 * Maps a tuple of types to a tuple of ConsumerSubjects providing the same types.
 */
type ConsumerSubjectTypeMap<Types extends readonly [...any[]]> = {
  readonly [Index in keyof Types]: ConsumerSubject<Types[Index]>;
} & TupleLength<Types>;

/**
 * Maps a tuple of types to a tuple of Subscribables providing the same types.
 */
type SubscribableTypeMap<Types extends readonly [...any[]]> = {
  readonly [Index in keyof Types]: Subscribable<Types[Index]>;
} & TupleLength<Types>;

/**
 * A navigation data bar field data model which uses an arbitrary subscribable to provide its value and function to
 * update the value using data cached from one or more event bus consumers.
 * @deprecated Please use {@link NavDataBarFieldConsumerValueModel} instead.
 */
export class NavDataBarFieldConsumerModel<S extends Subscribable<any>, C extends [...any[]]>
  extends NavDataBarFieldGenericModel<S, (sub: S, gpsValidity: Subscribable<NavDataFieldGpsValidity>, consumerSubs: SubscribableTypeMap<C>) => void> {

  protected readonly consumerSubs: ConsumerSubjectTypeMap<C>;

  /**
   * Constructor.
   * @param sub The subscribable used to provide this model's value.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param consumers The event bus consumers used by this model.
   * @param initialValues The initial consumer values with which to initialize this model. These values will be used
   * until they are replaced by consumed values from the event bus.
   * @param updateFunc The function used to update this model's value. The first argument taken by the function is the
   * subscribable used to provide this model's value. The second argument is a tuple of Subscribables providing the
   * cached values from this model's consumers.
   */
  constructor(
    sub: S,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    consumers: ConsumerTypeMap<C>,
    initialValues: C,
    updateFunc: (sub: S, gpsValidity: Subscribable<NavDataFieldGpsValidity>, consumerSubs: SubscribableTypeMap<C>) => void
  ) {
    super(sub, gpsValidity, updateFunc, () => {
      for (let i = 0; i < this.consumerSubs.length; i++) {
        this.consumerSubs[i].destroy();
      }
    });

    this.consumerSubs = consumers.map((consumer, index) => ConsumerSubject.create(consumer, initialValues[index])) as unknown as ConsumerSubjectTypeMap<C>;
  }

  /** @inheritdoc */
  public update(): void {
    this.updateFunc(this.value as S, this.gpsValidity, this.consumerSubs);
  }
}

/**
 * A navigation data bar field data model which provides a {@link NumberUnitInterface} value that is derived directly
 * from an event bus consumer.
 * @deprecated Please use {@link NavDataBarFieldConsumerValueNumberUnitModel} instead.
 */
export class NavDataBarFieldConsumerNumberUnitModel<F extends string, U extends Unit<F> = Unit<F>> extends NavDataBarFieldConsumerModel<NumberUnitSubject<F, U>, [number]> {
  /**
   * Constructor.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param consumer The event bus consumer used to derive this model's value.
   * @param initialVal The initial consumer value with which to initialize this model. This value will be used until it
   * is replaced by a consumed value from the event bus.
   * @param consumerUnit The unit type of the values consumed from the event bus.
   */
  constructor(gpsValidity: Subscribable<NavDataFieldGpsValidity>, consumer: Consumer<number>, initialVal: number, consumerUnit: U) {
    super(
      NumberUnitSubject.create(consumerUnit.createNumber(initialVal)),
      gpsValidity,
      [consumer],
      [initialVal],
      (sub, validity, consumerSubs) => { sub.set(consumerSubs[0].get()); }
    );
  }
}

/**
 * Maps a tuple of types to a tuple of ConsumerValues providing the same types.
 */
type ConsumerValueTypeMap<Types extends readonly [...any[]]> = {
  readonly [Index in keyof Types]: ConsumerValue<Types[Index]>;
} & TupleLength<Types>;

/**
 * Maps a tuple of types to a tuple of ReadonlyConsumerValues providing the same types.
 */
type ReadonlyConsumerValueTypeMap<Types extends readonly [...any[]]> = {
  readonly [Index in keyof Types]: ReadonlyConsumerValue<Types[Index]>;
} & TupleLength<Types>;

/**
 * A navigation data bar field data model which uses an arbitrary subscribable to provide its value and function to
 * update the value using data cached from one or more event bus consumers.
 */
export class NavDataBarFieldConsumerValueModel<S extends Subscribable<any>, C extends readonly [...any[]]>
  extends NavDataBarFieldGenericModel<S, (sub: S, gpsValidity: Subscribable<NavDataFieldGpsValidity>, consumerValues: ReadonlyConsumerValueTypeMap<C>) => void> {

  protected readonly consumerValues: ConsumerValueTypeMap<C>;
  protected readonly consumerSubs: Subscription[] = [];

  /**
   * Creates a new instance of NavDataBarFieldConsumerValueModel.
   * @param sub The subscribable used to provide this model's value.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param consumers The event bus consumers used by this model.
   * @param initialValues The initial consumer values with which to initialize this model. These values will be used
   * until they are replaced by consumed values from the event bus.
   * @param updateFunc The function used to update this model's value. The first argument taken by the function is the
   * subscribable used to provide this model's value. The second argument is a tuple of {@link ReadonlyConsumerValue}
   * objects providing the cached values from this model's consumers.
   * @param onDestroy A function which will be called when the model is destroyed.
   */
  public constructor(
    sub: S,
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    consumers: OptionalSubscribableConsumerTypeMap<C>,
    initialValues: C,
    updateFunc: (sub: S, gpsValidity: Subscribable<NavDataFieldGpsValidity>, consumerSubs: ReadonlyConsumerValueTypeMap<C>) => void,
    onDestroy?: () => void
  ) {
    super(sub, gpsValidity, updateFunc, () => {
      onDestroy && onDestroy();

      for (const subs of this.consumerSubs) {
        subs.destroy();
      }

      for (const values of this.consumerValues) {
        values.destroy();
      }
    });

    this.consumerValues = consumers.map((consumer, index) => {
      if (SubscribableUtils.isSubscribable(consumer)) {
        const value = ConsumerValue.create(consumer.get(), initialValues[index]);
        this.consumerSubs.push(
          consumer.sub(c => {
            value.setConsumer(c);
          })
        );
        return value;
      } else {
        return ConsumerValue.create(consumer, initialValues[index]);
      }
    }) as unknown as ConsumerValueTypeMap<C>;
  }

  /** @inheritdoc */
  public update(): void {
    this.updateFunc(this.value as S, this.gpsValidity, this.consumerValues);
  }
}

/**
 * A navigation data bar field data model which provides a {@link NumberUnitInterface} value that is derived directly
 * from an event bus consumer.
 */
export class NavDataBarFieldConsumerValueNumberUnitModel<F extends string, U extends Unit<F> = Unit<F>>
  extends NavDataBarFieldConsumerValueModel<NumberUnitSubject<F, U>, [number]> {

  /**
   * Creates a new instance of NavDataBarFieldConsumerValueNumberUnitModel.
   * @param gpsValidity The current validity state of the GPS data for this model.
   * @param consumer The event bus consumer used to derive this model's value.
   * @param initialVal The initial consumer value with which to initialize this model. This value will be used until it
   * is replaced by a consumed value from the event bus.
   * @param consumerUnit The unit type of the values consumed from the event bus.
   * @param onDestroy A function which will be called when the model is destroyed.
   */
  public constructor(
    gpsValidity: Subscribable<NavDataFieldGpsValidity>,
    consumer: Consumer<number> | Subscribable<Consumer<number> | null>,
    initialVal: number,
    consumerUnit: U,
    onDestroy?: () => void
  ) {
    super(
      NumberUnitSubject.create(consumerUnit.createNumber(initialVal)),
      gpsValidity,
      [consumer],
      [initialVal],
      (sub, validity, consumerValues) => { sub.set(consumerValues[0].get()); },
      onDestroy
    );
  }
}