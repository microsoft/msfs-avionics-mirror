import { ClockEvents, ComponentProps, DisplayComponent, EventBus, FSComponent, SetSubject, SubscribableSet, Subscription, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { NavDataBarSettingTypes } from '../../settings/NavDataBarUserSettings';
import { NavDataField } from '../navdatafield/NavDataField';
import { NavDataFieldType } from '../navdatafield/NavDataFieldType';
import { NavDataBarFieldModel, NavDataBarFieldModelFactory } from './NavDataBarFieldModel';
import { NavDataFieldRenderer } from '../navdatafield/NavDataFieldRenderer';

/**
 * Component props for NavDataBar.
 */
export interface NavDataBarProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The number of navigation data fields displayed. */
  fieldCount: number;

  /** A navigation data bar field model factory. */
  modelFactory: NavDataBarFieldModelFactory;

  /** A navigation data field renderer. */
  fieldRenderer: NavDataFieldRenderer;

  /** A user setting manager for the settings that control the data bar's field types. */
  dataBarSettingManager: UserSettingManager<NavDataBarSettingTypes>;

  /** The update frequency of the data fields, in hertz. */
  updateFreq: number;

  /** CSS class(es) to add to the data bar's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A navigation data bar. Displays zero or more navigation data fields.
 *
 * The root element of the status bar contains the `nav-data-bar` CSS class by default.
 */
export class NavDataBar extends DisplayComponent<NavDataBarProps> {
  private static readonly RESERVED_CSS_CLASSES = ['nav-data-bar'];

  private readonly fieldCount = Math.max(0, this.props.fieldCount);
  private readonly fieldSlots: VNode[] = Array.from({ length: this.fieldCount }, () => <div />);
  private readonly fields: NavDataField<any>[] = [];
  private readonly models: NavDataBarFieldModel<any>[] = [];

  private readonly settingSubs: Subscription[] = [];
  private clockSub?: Subscription;
  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    for (let i = 0; i < this.fieldCount; i++) {
      this.settingSubs[i] = this.props.dataBarSettingManager.whenSettingChanged(`navDataBarField${i}`).handle(this.onFieldSettingChanged.bind(this, i));
    }

    this.clockSub = this.props.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(1000 / this.props.updateFreq).handle(this.onUpdated.bind(this));
  }

  /**
   * Responds to changes in field settings.
   * @param index The index of the field whose setting changed.
   * @param type The new setting.
   */
  private onFieldSettingChanged(index: number, type: NavDataFieldType): void {
    const slot = this.fieldSlots[index].instance as HTMLDivElement;

    slot.innerHTML = '';
    this.fields[index]?.destroy();
    this.models[index]?.destroy();

    const model = this.props.modelFactory.create(type);
    model.update();
    const field = this.props.fieldRenderer.render(type, model);

    this.models[index] = model;
    FSComponent.render(field, slot);
    this.fields[index] = field.instance as NavDataField<any>;
  }

  /**
   * Responds to update events.
   */
  private onUpdated(): void {
    for (let i = 0; i < this.fieldCount; i++) {
      this.models[i].update();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['nav-data-bar']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, NavDataBar.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'nav-data-bar';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ` ${FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !NavDataBar.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ')}`;
      }
    }

    return (
      <div class={cssClass}>{this.fieldSlots}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.clockSub?.destroy();

    for (let i = 0; i < this.fieldCount; i++) {
      this.settingSubs[i].destroy();
      this.fields[i]?.destroy();
      this.models[i]?.destroy();
    }

    this.cssClassSub?.destroy();

    super.destroy();
  }
}