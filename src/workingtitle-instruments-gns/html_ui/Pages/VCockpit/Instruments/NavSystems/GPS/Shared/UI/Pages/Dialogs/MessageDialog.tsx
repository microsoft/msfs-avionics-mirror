
import { VNode, FSComponent } from '@microsoft/msfs-sdk';
import { GNSUiControlList, GNSUiControlProps, GNSUiControl } from '../../GNSUiControl';
import { PageProps } from '../Pages';
import { AlertsSubject, AlertMessage } from './AlertsSubject';
import { Dialog } from './Dialog';
import './MessageDialog.css';

/**
 * The Message Dialog interface.
 */
export interface MessageDialogDefinition extends PageProps {

  /** The message string, if any */
  inputString?: string;

  /**
   * Renders the message content of the dialog.
   * @returns the message content for the dialog as a VNode.
   */
  renderContent?(): VNode;

  /** Whether to close this dialog after accept action */
  closeOnAccept?: boolean;

  /** The text for the confirm button */
  confirmButtonText?: string;

  /** Whether this dialog has a reject button */
  hasRejectButton?: boolean;

  /** The text for button 2, if any */
  rejectButtonText?: string;

  /** the data array subject */
  alerts: AlertsSubject;
}

/**
 * Confirmation dialog for generic messages.
 */
export class MessageDialog extends Dialog<MessageDialogDefinition> {
  private readonly messageDialogMenuItemsRef = FSComponent.createRef<GNSUiControlList<AlertsSubject>>();

  /**
   * Picks the next page to be loaded
   * @returns if the page has been loaded
   */
  public onListItemSelected = (): boolean => {
    //todo be able to select items?
    return true;
  };

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
  }

  /**
   * Method called when the message dialog is opened.
   */
  public onMessageDialogClosed(): void {
    this.props.alerts.onAlertsViewed();
  }

  /**
   * Renders the bottom text depending on the GNS type
   * @returns the bottom element
   */
  private renderBottomText(): VNode {
    if (this.props.gnsType !== 'wt430') {
      return (<div class='message-dialog-bottom-text'>
        Press
        <div class='message-dialog-boxed-msg'>MSG</div>
        to continue
      </div>);
    } else {
      return (<div></div>);
    }
  }

  /** @inheritdoc */
  protected renderDialog(): VNode | null {
    return (
      <div class='message-dialog '>
        <h2 class='message-dialog-title'>MESSAGES</h2>
        <div class='message-dialog-middle'>
          <div class='message-dialog-table'>
            <GNSUiControlList<AlertMessage>
              data={this.props.alerts}
              renderItem={(data: AlertMessage): VNode => <MessageDialogItem data={data.message} />}
              ref={this.messageDialogMenuItemsRef}
              hideScrollbar={true}
            />
          </div>
          {this.renderBottomText()}
        </div>
        <div class="white-box" />
      </div >
    );
  }
}

/** Props on the PageMenuItem component. */
export interface MessageDialogItemProps extends GNSUiControlProps {
  /** The leg data associated with this component. */
  data: string;
}

/**
 * A item that goes into the message Dialog.
 */
export class MessageDialogItem extends GNSUiControl<MessageDialogItemProps> {
  private readonly label = FSComponent.createRef<HTMLDivElement>();
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='message-dialog-item'>
        <div ref={this.label}>{this.props.data}</div>
      </div>
    );
  }
}
