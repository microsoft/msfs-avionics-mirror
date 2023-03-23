import { Consumer } from '../../data/Consumer';
import { SubEvent } from '../../sub/SubEvent';
import { MappedSubscribable, MutableSubscribable } from '../../sub/Subscribable';
import { AbstractFmcPage } from '../AbstractFmcPage';
import { DataInterface, TwoWayBinding } from '../FmcDataBinding';
import { LineSelectKeyEvent } from '../FmcInteractionEvents';
import { DisplayField, DisplayFieldOptions } from './DisplayField';

/**
 * Input field options
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditableFieldOptions<T> extends DisplayFieldOptions<T> {

}

/**
 * An {@link FmcComponent} for displaying and accepting new values according to a validator and formatter.
 *
 * ## deleteAllowed
 * This class deals with LSK presses that have the DELETE flag active using a default implementation
 * of {@link FmcComponentOptions.onDelete}, which checks `options.deleteAllowed` - if `true` or not set,the `onValidLskInput` subject
 * is set to `null` - if `false`, the "INVALID DELETE" scratchpad message is returned and handled by {@link FmcComponent.handleSelectKey}.
 *
 * ## onModified
 * This class also introduces another LSK handler, {@link EditableFieldOptions.onModified}, which is run after a value has been
 * validated (it is not called for invalid values) and applies return value logic. This runs after the flow
 * described for {@link FmcComponent}.
 */
export abstract class EditableField<T, V = T> extends DisplayField<T> {
  protected readonly valueChanged = new SubEvent<typeof this, V>();

  /** @inheritDoc */
  public constructor(
    protected page: AbstractFmcPage,
    protected readonly options: EditableFieldOptions<T>,
  ) {
    super(page, options);
  }

  /**
   * Binds the input field to a mutable subscribable.
   * @param subscribable the mutable subscribable
   * @returns the instance of this {@link EditableField}
   */
  public bind(subscribable: MutableSubscribable<any, T> | MappedSubscribable<T>): EditableField<T, V> {
    return this.bindSource(DataInterface.fromMutSubscribable(subscribable as MutableSubscribable<any, T>));
  }

  /**
   * Binds the input field to a Consumer.
   * @param consumer the consumer to bind to (get)
   * @param modifier the modifier to use when the value is modified (set)
   * @returns the instance of this {@link EditableField}
   */
  public bindConsumer(consumer: Consumer<T>, modifier: (value: T) => void): EditableField<T, V> {
    return this.bindSource(DataInterface.fromConsumer(consumer, modifier));
  }

  /**
   * Binds the input field to a data interface.
   * @param source the data interface
   * @returns the instance of this {@link EditableField}
   */
  public bindSource(source: DataInterface<T, any>): EditableField<T, V> {
    const binding = new TwoWayBinding(source, (value) => this.takeValue(value, true), this.valueChanged);

    this.page.addBinding(binding);
    return this;
  }

  /** @inheritDoc */
  protected abstract onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string>;
}
