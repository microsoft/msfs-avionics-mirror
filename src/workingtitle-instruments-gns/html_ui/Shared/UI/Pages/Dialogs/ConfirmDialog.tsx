import { FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { Dialog } from './Dialog';

import './ConfirmDialog.css';

/**
 *
 */
export class ConfirmDialog extends Dialog {
  private readonly resolve = Subject.create<(value: boolean | PromiseLike<boolean>) => void>(() => { });
  private readonly title = Subject.create('');
  private readonly body = Subject.create('');

  /**
   * Sets the promise resolution function for this dialog.
   * @param resolve The promise resolution function.
   */
  public setResolve(resolve: (value: boolean | PromiseLike<boolean>) => void): void {
    this.resolve.set(resolve);
  }

  /**
   * Sets the title of the dialog.
   * @param title The title of the dialog.
   */
  public setTitle(title: string): void {
    this.title.set(title);
  }

  /**
   * Sets the body of the dialog.
   * @param body The body of the dialog.
   */
  public setBody(body: string): void {
    this.body.set(body);
  }

  /** @inheritdoc */
  public renderDialog(): VNode {
    return (
      <>
        <h2 class="cyan">{this.title}</h2>
        <hr />
        <p>{this.body}</p>
        <hr />
        <DialogControl resolve={this.resolve} value={true}>Yes?</DialogControl>
        <span> or </span>
        <DialogControl resolve={this.resolve} value={false}>No?</DialogControl>
      </>
    );
  }
}

/**
 * Props on the DialogControl component.
 */
interface DialogControlProps extends GNSUiControlProps {
  /** A function that resolves the dialog. */
  resolve: Subscribable<(value: boolean | PromiseLike<boolean>) => void>;

  /** The value to resolve with when selected. */
  value: boolean;
}

/**
 * A control on a confirmation dialog.
 */
class DialogControl extends GNSUiControl<DialogControlProps> {
  private readonly el = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add('selected-white');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove('selected-white');
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    this.props.resolve.get()(this.props.value);
    return true;
  }

  /** @inheritdoc */
  public onRightKnobPush(): boolean {
    this.props.resolve.get()(false);
    return true;
  }

  /** @inheritdoc */
  public onClr(): boolean {
    this.props.resolve.get()(false);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span class='confirm-dialog-control' ref={this.el}>{this.props.children}</span>
    );
  }
}