import { ComponentProps, DisplayComponent, FSComponent, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { FlightPlanDataField } from '../../../../../Shared/FlightPlan/FlightPlanDataField';
import { MfdFplPageDataFieldRenderer } from './MfdFplPageDataFieldRenderer';

/**
 * Component props for {@link MfdFplPageDataFieldSlot}.
 */
export interface MfdFplPageDataFieldSlotProps extends ComponentProps {
  /** The index of the slot's data field. */
  index: number;

  /** The data field to display in the slot. */
  dataField: Subscribable<FlightPlanDataField | null>;

  /** The renderer to use to render the slot's data fields. */
  renderer: MfdFplPageDataFieldRenderer;
}

/**
 * A slot for an MFD FPL page flight plan data field.
 */
export class MfdFplPageDataFieldSlot extends DisplayComponent<MfdFplPageDataFieldSlotProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private renderedDataFieldNode: VNode | null = null;

  private dataFieldSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.dataFieldSub = this.props.dataField.sub(this.onDataFieldChanged.bind(this), true);
  }

  /**
   * Responds to when this slot's data field changes.
   * @param dataField The new data field.
   */
  private onDataFieldChanged(dataField: FlightPlanDataField | null): void {
    this.renderedDataFieldNode && FSComponent.shallowDestroy(this.renderedDataFieldNode);
    this.rootRef.instance.innerHTML = '';

    if (dataField) {
      this.renderedDataFieldNode = this.props.renderer.render(dataField);
    } else {
      this.renderedDataFieldNode = null;
    }

    if (this.renderedDataFieldNode) {
      FSComponent.render(this.renderedDataFieldNode, this.rootRef.instance);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        ref={this.rootRef}
        class={`mfd-fpl-page-data-field-slot mfd-fpl-page-data-field-slot-${this.props.index + 1}`}
      >
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.dataFieldSub?.destroy();

    this.renderedDataFieldNode && FSComponent.shallowDestroy(this.renderedDataFieldNode);

    super.destroy();
  }
}
