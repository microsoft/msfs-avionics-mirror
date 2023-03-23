import { EventBus, FSComponent, Subject, SubscribableUtils, Subscription, UserSetting, VNode } from '@microsoft/msfs-sdk';

import { NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { GNSDataField } from '../../DataFields/GNSDataField';
import { DataFieldContext } from '../../DataFields/GNSDataFieldRenderer';
import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { ViewService } from '../Pages';
import { FieldTypeMenu } from '../../DataFields/FieldTypeMenu';

/**
 * Props on the ArcMapField control.
 */
interface ArcMapFieldProps extends GNSUiControlProps {
  /** The type of the data field */
  type: NavDataFieldType | Subject<NavDataFieldType> | UserSetting<NavDataFieldType>

  /** The event bus to use with this field. */
  bus: EventBus;

  /** The context used to render and manage the field. */
  context: DataFieldContext;

  /** The class to apply to this data field. */
  class?: string;
}

/**
 * A control that displays a map page data field.
 */
export class MapPageDataField extends GNSUiControl<ArcMapFieldProps> {
  private readonly fieldEl = FSComponent.createRef<GNSDataField>();
  private readonly labelEl = FSComponent.createRef<HTMLDivElement>();

  private readonly labelText = Subject.create('');
  private fieldTypeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.fieldTypeSub = SubscribableUtils.toSubscribable(this.props.type, true).sub(this.onFieldTypeChanged.bind(this), true);
  }

  /**
   * A handler called when the data field type has changed.
   * @param type The type that the field has been changed to.
   */
  private onFieldTypeChanged(type: NavDataFieldType): void {
    this.labelText.set(type);
  }

  /**
   * Updates the field.
   */
  public update(): void {
    this.fieldEl.getOrDefault()?.update();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.fieldEl.getOrDefault()?.destroy();
    this.fieldTypeSub?.destroy();
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.labelEl.instance.classList.add('selected-cyan');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.labelEl.instance.classList.remove('selected-cyan');
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    return this.handleInnerKnob();
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    return this.handleInnerKnob();
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    this.scroll('forward');
    return true;
  }

  /**
   * Handles the inner knob being turned.
   * @returns True if handled, false otherwise.
   */
  private handleInnerKnob(): boolean {
    if ((this.props.type as UserSetting<NavDataFieldType>).isSubscribable) {
      // FIXME this can probably be optimized (FieldTypeMenu ctor re-creates all the action callbacks)
      ViewService.menu(new FieldTypeMenu(this.props.context.fieldTypeMenuEntries, this.props.type as UserSetting<NavDataFieldType>, () => {
        ViewService.back();
        this.scroll('forward');
      }));
      return true;
    }

    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`map-data-field ${this.props.class ?? ''}`}>
        <div class='map-data-field-label'><span ref={this.labelEl}>{this.labelText}</span></div>
        <GNSDataField class='map-data-field-field' context={this.props.context} type={this.props.type} ref={this.fieldEl} />
      </div>
    );
  }
}