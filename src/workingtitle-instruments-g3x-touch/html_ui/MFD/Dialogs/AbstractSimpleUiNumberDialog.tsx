import { FSComponent, MutableSubscribable, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { NumberInput } from '../../Shared/Components/NumberInput/NumberInput';
import { UiDialogResult } from '../../Shared/UiSystem/UiDialogView';
import { UiViewProps } from '../../Shared/UiSystem/UiView';
import { AbstractUiNumberDialog, UiNumberDialogInput, UiNumberDialogInputDefinition } from './AbstractUiNumberDialog';

/**
 * An abstract implementation of a UI dialog view that allows the user to select an arbitrary numeric value. The dialog
 * includes a 0-9 number pad and backspace button by default. It is up to subclasses to render the number input
 * component. Subclasses may also choose to render additional dialog content.
 */
export abstract class AbstractSimpleUiNumberDialog
  <
    Input extends UiNumberDialogInput = UiNumberDialogInput,
    Output = number,
    P extends UiViewProps = UiViewProps
  >
  extends AbstractUiNumberDialog<Input, Output, UiNumberDialogInputDefinition, P> {

  protected readonly inputRef = FSComponent.createRef<NumberInput>();

  /** This dialog's current selected value. */
  protected readonly value = Subject.create(0);

  /** @inheritDoc */
  public constructor(props: P) {
    super(props);

    this.registerInputDefinition('default', {
      ref: this.inputRef,
      value: this.value,
      render: (ref, value, rootCssClassName) => this.renderInput(ref, value, rootCssClassName),
      isVisible: Subject.create(true)
    });
  }

  /** @inheritDoc */
  public request(input: Input): Promise<UiDialogResult<Output>> {
    if (!this.isAlive) {
      throw new Error('AbstractSimpleUiNumberDialog: cannot request from a dead dialog');
    }

    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      const initialValue = this.onRequest(input);

      this.resetActiveInput('default', initialValue, true);
    });
  }

  /**
   * A callback method which is called when this dialog receives a request.
   * @param input The input for the request.
   * @returns The initial numeric value to load into this dialog's number input.
   */
  protected onRequest(input: Input): number {
    return input.initialValue;
  }

  /**
   * Renders this dialog's number input.
   * @param ref The reference to which to assign the rendered input.
   * @param valueToBind The value to bind to the input.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's number input, as a VNode.
   */
  protected abstract renderInput(ref: NodeReference<NumberInput>, valueToBind: MutableSubscribable<number>, rootCssClassName: string | undefined): VNode;
}