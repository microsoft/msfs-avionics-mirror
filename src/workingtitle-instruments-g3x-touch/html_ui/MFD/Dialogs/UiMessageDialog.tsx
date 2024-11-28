import { DebounceTimer, FSComponent, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import { UiTouchButton } from '../../Shared/Components/TouchButton/UiTouchButton';
import { AbstractUiView } from '../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../Shared/UiSystem/UiDialogView';

import './UiMessageDialog.css';

/**
 * A request input for {@link UiMessageDialog}.
 */
export type UiMessageDialogInput = {
  /** The message to display. */
  message: string | VNode;

  /** Whether to show the reject button. */
  showRejectButton: boolean;

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
export class UiMessageDialog extends AbstractUiView implements UiDialogView<UiMessageDialogInput, boolean> {
  private static readonly RESERVED_CLASSES = ['ui-message-dialog', 'ui-view-panel'];

  private readonly contentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly acceptButtonRef = FSComponent.createRef<UiTouchButton>();
  private readonly acceptButtonLabelRef = FSComponent.createRef<HTMLDivElement>();
  private readonly rejectButtonRef = FSComponent.createRef<UiTouchButton>();
  private readonly rejectButtonLabelRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['ui-message-dialog', 'ui-view-panel']);

  private readonly isCancelButtonVisible = Subject.create(false);

  private readonly cleanupDebounceTimer = new DebounceTimer();

  private cssClassesToAdd?: string[];

  private renderedContent?: string | VNode;
  private renderedOkLabel?: string | VNode;
  private renderedCancelLabel?: string | VNode;

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<boolean> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.focusController.setActive(true);

    this.focusController.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public request(input: UiMessageDialogInput): Promise<UiDialogResult<boolean>> {
    if (!this.isAlive) {
      throw new Error('UiMessageDialog: cannot request from a dead dialog');
    }

    return new Promise<UiDialogResult<boolean>>((resolve) => {
      this.closeRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      const { message, showRejectButton, acceptButtonLabel = 'OK', rejectButtonLabel = 'Cancel', class: cssClassesToAdd } = input;

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
        this.cssClassesToAdd = FSComponent.parseCssClassesFromString(cssClassesToAdd).filter(cssClass => !UiMessageDialog.RESERVED_CLASSES.includes(cssClass));

        for (const cssClass of this.cssClassesToAdd) {
          this.rootCssClass.add(cssClass);
        }
      }

      this.acceptButtonRef.instance.focusSelf();
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    // Delay clearing the message so that any view closing animation has time to complete.
    this.closeRequest(1000);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /**
   * Resolves the pending request Promise if one exists and clears this dialog's message after an optional delay.
   * @param cleanupDelay The amount of time to wait before clearing this dialog's message, in milliseconds. Defaults to
   * `0`.
   */
  private closeRequest(cleanupDelay = 0): void {
    if (cleanupDelay > 0) {
      this.cleanupDebounceTimer.schedule(this.cleanupMessage.bind(this), cleanupDelay);
    } else {
      this.cleanupDebounceTimer.clear();
      this.cleanupMessage();
    }

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Clears this dialog's message.
   */
  private cleanupMessage(): void {
    if (this.renderedContent !== undefined) {
      if (typeof this.renderedContent === 'object') {
        FSComponent.shallowDestroy(this.renderedContent);
      }

      this.contentRef.instance.innerHTML = '';
      this.renderedContent = undefined;
    }

    if (this.renderedOkLabel !== undefined) {
      if (typeof this.renderedOkLabel === 'object') {
        FSComponent.shallowDestroy(this.renderedOkLabel);
      }

      this.acceptButtonLabelRef.instance.innerHTML = '';
      this.renderedOkLabel = undefined;
    }

    if (this.renderedCancelLabel !== undefined) {
      if (typeof this.renderedCancelLabel === 'object') {
        FSComponent.shallowDestroy(this.renderedCancelLabel);
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
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div ref={this.contentRef} class='ui-message-dialog-content' />
        <div class='ui-message-dialog-buttons'>
          <UiTouchButton
            ref={this.rejectButtonRef}
            isVisible={this.isCancelButtonVisible}
            label={<div ref={this.rejectButtonLabelRef} class='ui-message-dialog-reject-label' />}
            onPressed={(): void => {
              this.resultObject = {
                wasCancelled: false,
                payload: false,
              };
              this.props.uiService.goBackMfd();
            }}
            focusController={this.focusController}
            class='ui-message-dialog-button ui-message-dialog-reject-button'
          />
          <UiTouchButton
            ref={this.acceptButtonRef}
            label={<div ref={this.acceptButtonLabelRef} class='ui-message-dialog-accept-label' />}
            onPressed={(): void => {
              this.resultObject = {
                wasCancelled: false,
                payload: true,
              };
              this.props.uiService.goBackMfd();
            }}
            focusController={this.focusController}
            class='ui-message-dialog-button ui-message-dialog-accept-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.closeRequest();

    this.acceptButtonRef.getOrDefault()?.destroy();
    this.rejectButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}