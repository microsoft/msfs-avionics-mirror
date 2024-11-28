import { DisplayComponent, FSComponent, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';
import { TouchButton } from '../Components/TouchButton/TouchButton';
import { GtcView } from '../GtcService/GtcView';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';

import './GtcMessageDialog.css';

/**
 * A request input for {@link GtcMessageDialog}.
 */
export type GtcMessageDialogInput = {
  /** The message to display. */
  message: string | VNode;

  /** Whether to show the reject button. */
  showRejectButton: boolean;

  /** The GTC view title to display with the message. */
  title?: string;

  /** The label to display for the accept button. Defaults to `'OK'`. */
  acceptButtonLabel?: string | VNode;

  /** The label to display for the reject button. Defaults to `'Cancel'`. */
  rejectButtonLabel?: string | VNode;

  /** CSS class(es) to apply to the dialog's root element. */
  class?: string;
};

/**
 * A pop-up dialog which allows the user to accept or optionally reject a displayed message.
 */
export class GtcMessageDialog extends GtcView implements GtcDialogView<GtcMessageDialogInput, boolean> {
  private readonly contentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly acceptButtonRef = FSComponent.createRef<TouchButton>();
  private readonly acceptButtonLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rejectButtonRef = FSComponent.createRef<TouchButton>();
  private readonly rejectButtonLabelRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['message-dialog']);

  private readonly isCancelButtonVisible = Subject.create(false);

  private cssClassesToAdd?: string[];

  private renderedContent?: string | VNode;
  private renderedOkLabel?: string | VNode;
  private renderedCancelLabel?: string | VNode;

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<boolean> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public request(input: GtcMessageDialogInput): Promise<GtcDialogResult<boolean>> {
    if (!this.isAlive) {
      throw new Error('GtcMessageDialog: cannot request from a dead dialog');
    }

    return new Promise<GtcDialogResult<boolean>>((resolve) => {
      this.cleanupMessage();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      const { message, showRejectButton, title, acceptButtonLabel = 'OK', rejectButtonLabel = 'Cancel', class: cssClassesToAdd } = input;

      if (typeof message === 'object') {
        FSComponent.render(message, this.contentRef.instance);
      } else {
        this.contentRef.instance.textContent = message;
      }
      this.renderedContent = message;

      if (typeof acceptButtonLabel === 'object') {
        FSComponent.render(acceptButtonLabel, this.acceptButtonLabelRef.instance);
      } else {
        this.acceptButtonLabelRef.instance.textContent = acceptButtonLabel;
      }
      this.renderedOkLabel = acceptButtonLabel;

      if (showRejectButton) {
        if (typeof rejectButtonLabel === 'object') {
          FSComponent.render(rejectButtonLabel, this.rejectButtonLabelRef.instance);
        } else {
          this.rejectButtonLabelRef.instance.textContent = rejectButtonLabel;
        }
        this.renderedCancelLabel = rejectButtonLabel;
      }

      this.isCancelButtonVisible.set(showRejectButton);

      if (cssClassesToAdd !== undefined) {
        this.cssClassesToAdd = FSComponent.parseCssClassesFromString(cssClassesToAdd).filter(cssClass => cssClass !== 'message-dialog');

        for (const cssClass of this.cssClassesToAdd) {
          this.rootCssClass.add(cssClass);
        }
      }

      this._title.set(title);
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupMessage();
  }

  /**
   * Clears this dialog's message and resolves the pending request Promise if one exists.
   */
  private cleanupMessage(): void {
    if (this.renderedContent !== undefined) {
      if (typeof this.renderedContent === 'object') {
        FSComponent.visitNodes(this.renderedContent, node => {
          if (node.instance instanceof DisplayComponent) {
            node.instance.destroy();
            return true;
          }

          return false;
        });
      }

      this.contentRef.instance.innerHTML = '';
      this.renderedContent = undefined;
    }

    if (this.renderedOkLabel !== undefined) {
      if (typeof this.renderedOkLabel === 'object') {
        FSComponent.visitNodes(this.renderedOkLabel, node => {
          if (node.instance instanceof DisplayComponent) {
            node.instance.destroy();
            return true;
          }

          return false;
        });
      }

      this.acceptButtonLabelRef.instance.innerHTML = '';
      this.renderedOkLabel = undefined;
    }

    if (this.renderedCancelLabel !== undefined) {
      if (typeof this.renderedCancelLabel === 'object') {
        FSComponent.visitNodes(this.renderedCancelLabel, node => {
          if (node.instance instanceof DisplayComponent) {
            node.instance.destroy();
            return true;
          }

          return false;
        });
      }

      this.rejectButtonLabelRef.instance.innerHTML = '';
      this.renderedCancelLabel = undefined;
    }


    if (this.cssClassesToAdd !== undefined) {
      for (const cssClass of this.cssClassesToAdd) {
        this.rootCssClass.delete(cssClass);
      }

      this.cssClassesToAdd = undefined;
    }

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div ref={this.contentRef} class='message-dialog-content' />
        <div class='message-dialog-buttons'>
          <TouchButton
            ref={this.acceptButtonRef}
            label={<div ref={this.acceptButtonLabelRef} class='message-dialog-accept-label' />}
            onPressed={(): void => {
              this.resultObject = {
                wasCancelled: false,
                payload: true,
              };
              this.props.gtcService.goBack();
            }}
            class='message-dialog-button message-dialog-accept-button'
          />
          <TouchButton
            ref={this.rejectButtonRef}
            isVisible={this.isCancelButtonVisible}
            label={<div ref={this.rejectButtonLabelRef} class='message-dialog-reject-label' />}
            onPressed={(): void => {
              this.resultObject = {
                wasCancelled: false,
                payload: false,
              };
              this.props.gtcService.goBack();
            }}
            class='message-dialog-button message-dialog-reject-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.acceptButtonRef.getOrDefault()?.destroy();
    this.rejectButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}