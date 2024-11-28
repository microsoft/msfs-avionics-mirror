import { FocusPosition, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { Page, PageProps } from '../Pages';

import './Dialog.css';

/**
 * A page that displays a modal dialog.
 */
export class Dialog<P extends PageProps = PageProps> extends Page<P> {
  protected readonly root = FSComponent.createRef<GNSUiControl>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.onSuspend();
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    let handled = false;
    if (this.root.instance.isFocused) {
      handled = this.root.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.root.instance.focus(FocusPosition.First);
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.root.instance.blur();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='dialog' ref={this.el}>
        <GNSUiControl ref={this.root} isolateScroll>
          <div class='dialog-box'>
            <div class='dialog-box-inner'>
              {this.renderDialog()}
            </div>
          </div>
        </GNSUiControl>
        {this.renderOuterDialog()}
      </div>
    );
  }

  /**
   * Renders the dialog box content.
   * @returns The content of the dialog box.
   */
  protected renderDialog(): VNode | null {
    return null;
  }

  /**
   * Renders the outside of the dialog box content.
   * @returns The content of the outer dialog box.
   */
  protected renderOuterDialog(): VNode | null {
    return null;
  }
}