import {
  ArrayUtils, ClockEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, NodeReference,
  SetSubject, Subscribable, SubscribableSet, Subscription, ToggleableClassNameRecord, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  NavDataBarFieldModel, NavDataBarFieldModelFactory, NavDataBarSettingTypes, NavDataField, NavDataFieldRenderer,
  NavDataFieldType
} from '@microsoft/msfs-garminsdk';

import { TouchButton } from '../../TouchButton/TouchButton';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';

import './G3XNavDataBar.css';

/**
 * Component props for G3XNavDataBar.
 */
export interface G3XNavDataBarProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** A navigation data bar field model factory. */
  modelFactory: NavDataBarFieldModelFactory;

  /** A navigation data field renderer. */
  fieldRenderer: NavDataFieldRenderer;

  /** A user setting manager for the settings that control the data bar's field types. */
  dataBarSettingManager: UserSettingManager<NavDataBarSettingTypes>;

  /** The number of data fields that are visible. */
  visibleDataFieldCount: Subscribable<number>;

  /**
   * Whether data field editing is active. While editing is active, the fields are rendered and act as touchscreen
   * buttons which the user can press.
   */
  isEditingActive: Subscribable<boolean>;

  /**
   * A callback function to execute when a data field is pressed during editing.
   */
  onEditPressed?: (index: number) => void;

  /** The update frequency of the data fields, in hertz. */
  updateFreq: number;

  /** CSS class(es) to add to the data bar's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An entry for a navigation data bar field.
 */
type FieldEntry = {
  /** A reference to the field button. */
  buttonRef: NodeReference<TouchButton>;

  /** A reference to the field slot. */
  slotRef: NodeReference<HTMLDivElement>;

  /** The field's data model. */
  model?: NavDataBarFieldModel<any>;

  /** The rendered field. */
  field?: NavDataField<any>;

  /** Subscriptions associated with this entry. */
  subscriptions: Subscription[];
};

/**
 * A G3X Touch navigation data bar. Displays zero or more navigation data fields.
 *
 * The root element of the status bar contains the `nav-data-bar` CSS class by default.
 */
export class G3XNavDataBar extends DisplayComponent<G3XNavDataBarProps> {
  private static readonly FIELD_COUNT = 8;

  private static readonly RESERVED_CSS_CLASSES = ['g3x-nav-data-bar', 'g3x-nav-data-bar-noedit'];

  private readonly rootCssClass = SetSubject.create(['g3x-nav-data-bar']);

  private readonly fieldEntries: FieldEntry[] = [];

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    for (let i = 0; i < G3XNavDataBar.FIELD_COUNT; i++) {
      this.fieldEntries[i].subscriptions.push(
        this.props.dataBarSettingManager.getSetting(`navDataBarField${i}`).sub(this.onFieldSettingChanged.bind(this, i), true)
      );
    }

    this.subscriptions.push(
      this.props.isEditingActive.sub(isEditingActive => { this.rootCssClass.toggle('g3x-nav-data-bar-noedit', !isEditingActive); }, true),

      this.props.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(1000 / this.props.updateFreq).handle(this.onUpdated.bind(this))
    );
  }

  /**
   * Responds to changes in field settings.
   * @param index The index of the field whose setting changed.
   * @param type The new setting.
   */
  private onFieldSettingChanged(index: number, type: NavDataFieldType): void {
    const entry = this.fieldEntries[index];

    entry.slotRef.instance.innerHTML = '';
    entry.field?.destroy();
    entry.model?.destroy();

    const model = this.props.modelFactory.create(type);
    model.update();
    const field = this.props.fieldRenderer.render(type, model);

    entry.model = model;
    FSComponent.render(field, entry.slotRef.instance);
    entry.field = field.instance as NavDataField<any>;
  }

  /**
   * Responds to update events.
   */
  private onUpdated(): void {
    for (let i = 0; i < this.props.visibleDataFieldCount.get(); i++) {
      this.fieldEntries[i].model?.update();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, G3XNavDataBar.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !G3XNavDataBar.RESERVED_CSS_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <CombinedTouchButton orientation='row' class={this.rootCssClass}>
        {ArrayUtils.create(G3XNavDataBar.FIELD_COUNT, index => {
          const cssClass = SetSubject.create<string>();
          cssClass.add('g3x-nav-data-bar-field-button');

          const buttonRef = FSComponent.createRef<TouchButton>();
          const slotRef = FSComponent.createRef<HTMLDivElement>();
          const isVisible = this.props.visibleDataFieldCount.map(count => index < count);

          const isLastVisibleSub = this.props.visibleDataFieldCount.sub(count => {
            cssClass.toggle('g3x-nav-data-bar-field-button-last-visible', count === index + 1);
          }, true);

          this.fieldEntries.push({
            buttonRef,
            slotRef,
            subscriptions: [isVisible, isLastVisibleSub],
          });

          return (
            <TouchButton
              ref={buttonRef}
              isVisible={isVisible}
              isEnabled={this.props.isEditingActive}
              onPressed={() => { this.props.onEditPressed && this.props.onEditPressed(index); }}
              class={cssClass}
            >
              <div ref={slotRef} class='g3x-nav-data-bar-field-slot'>
              </div>
            </TouchButton>
          );
        })}
      </CombinedTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    for (const entry of this.fieldEntries) {
      entry.buttonRef.getOrDefault()?.destroy();

      for (const sub of entry.subscriptions) {
        sub.destroy();
      }

      entry.field?.destroy();
      entry.model?.destroy();
    }

    super.destroy();
  }
}