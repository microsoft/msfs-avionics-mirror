import {
  ComponentProps, DisplayComponent, FSComponent, NodeReference, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { NavDataBarFieldModel, NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { DataFieldContext } from './GNSDataFieldRenderer';

/**
 * Props on the GNSDataField component.
 */
interface GNSDataFieldProps extends ComponentProps {
  /** The type of the data field */
  type: NavDataFieldType | Subscribable<NavDataFieldType>

  /** The context used to render and manage the field. */
  context: DataFieldContext;

  /** The class to apply to this component. */
  class?: string;
}

/**
 * A component that displays a changeable settings driven data field.
 */
export class GNSDataField extends DisplayComponent<GNSDataFieldProps> {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private typeSub?: Subscription;

  private field?: DisplayComponent<any>;
  private model?: NavDataBarFieldModel<any>;

  /**
   * Gets the data field's root DOM element.
   * @returns The field's root DOM element.
   */
  public get element(): NodeReference<HTMLElement> {
    return this.el;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.typeSub = SubscribableUtils.toSubscribable(this.props.type, true).sub(this.onFieldTypeChanged.bind(this), true);
  }

  /**
   * A handler called when the data field type has changed.
   * @param type The type that the field has been changed to.
   */
  private onFieldTypeChanged(type: NavDataFieldType): void {
    this.el.instance.innerHTML = '';
    this.field?.destroy();

    this.model?.destroy();
    this.model = this.props.context.modelFactory.create(type);

    const node = this.props.context.renderer.render(type, this.model);
    this.field = node.instance as DisplayComponent<any>;

    FSComponent.render(node, this.el.instance);
  }

  /**
   * Updates the field from the model data.
   */
  public update(): void {
    this.model?.update();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.field?.destroy();
    this.model?.destroy();
    this.typeSub?.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`gns-data-field ${this.props.class ?? ''}`} ref={this.el} />
    );
  }
}