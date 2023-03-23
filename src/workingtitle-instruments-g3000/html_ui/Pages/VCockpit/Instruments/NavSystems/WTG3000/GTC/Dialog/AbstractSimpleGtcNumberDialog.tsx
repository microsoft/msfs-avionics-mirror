import { FSComponent, MutableSubscribable, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcViewProps } from '../GtcService/GtcView';
import { AbstractGtcNumberDialog, GtcNumberDialogInput, GtcNumberDialogInputDefinition } from './AbstractGtcNumberDialog';
import { GtcDialogResult } from './GtcDialogView';

/**
 * An abstract implementation of a GTC dialog view which allows the user to select an arbitrary numeric value. The
 * dialog includes a 0-9 number pad and backspace button by default. It is up to subclasses to render the number input
 * component. Subclasses may also choose to render additional dialog content.
 */
export abstract class AbstractSimpleGtcNumberDialog
  <
    Input extends GtcNumberDialogInput = GtcNumberDialogInput,
    Output = number,
    P extends GtcViewProps = GtcViewProps
  >
  extends AbstractGtcNumberDialog<Input, Output, GtcNumberDialogInputDefinition, P> {

  protected readonly inputRef = FSComponent.createRef<NumberInput>();

  /** This dialog's current selected value. */
  protected readonly value = Subject.create(0);

  /** @inheritdoc */
  public constructor(props: P) {
    super(props);

    this.registerInputDefinition('default', {
      ref: this.inputRef,
      value: this.value,
      render: (ref, value, rootCssClassName) => this.renderInput(ref, value, rootCssClassName),
      isVisible: Subject.create(true)
    });
  }

  /** @inheritdoc */
  public request(input: Input): Promise<GtcDialogResult<Output>> {
    if (!this.isAlive) {
      throw new Error('AbstractSimpleGtcNumberDialog: cannot request from a dead dialog');
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