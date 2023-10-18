import { Consumer } from '../../data/Consumer';
import { SubEvent } from '../../sub/SubEvent';
import { MutableSubscribable, Subscribable } from '../../sub/Subscribable';
import { AbstractFmcPage } from '../AbstractFmcPage';
import { DataInterface } from '../FmcDataBinding';
import { LineSelectKeyEvent } from '../FmcInteractionEvents';
import { DisplayField, DisplayFieldOptions } from './DisplayField';
import { SubscribableUtils } from '../../sub';

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
  protected readonly valueChanged = new SubEvent<EditableField<T, V>, V>();

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
  public bind(subscribable: MutableSubscribable<T, V> | Subscribable<T>): this {
    if (SubscribableUtils.isMutableSubscribable(subscribable)) {
      this.bindSource(DataInterface.fromMutSubscribable(subscribable));
    } else {
      super.bind(subscribable);
    }

    return this;
  }

  /**
   * Binds the input field to a Consumer.
   * @param consumer the consumer to bind to (get)
   * @param modifier the modifier to use when the value is modified (set)
   * @returns the instance of this {@link EditableField}
   */
  public bindConsumer(consumer: Consumer<T>, modifier: (value: V) => void): this {
    return this.bindSource(DataInterface.fromConsumer(consumer, modifier));
  }

  /**
   * Binds the input field to a data interface.
   * @param source the data interface
   * @returns the instance of this {@link EditableField}
   */
  public bindSource(source: DataInterface<T, V>): this {
    if (SubscribableUtils.isSubscribable(source.input)) {
      this.page.addBinding(source.input.sub((value) => this.takeValue(value, true), true));
    } else {
      this.page.addBinding(source.input.handle((value) => this.takeValue(value, true)));
    }

    this.page.addBinding(this.valueChanged.on((sender, data) => source.modify(data)));

    return this;
  }

  /** @inheritDoc */
  protected abstract onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string>;
}
