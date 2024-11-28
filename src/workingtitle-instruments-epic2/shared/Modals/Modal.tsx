import { ComponentProps, DisplayComponent, EventBus } from '@microsoft/msfs-sdk';

import { ModalService } from './ModalService';

import './Modal.css';

/** The properties for the {@link Modal} component. */
export interface ModalProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** An instance of the event bus. */
  readonly modalService: ModalService;
}

/** The Modal component. */
export abstract class Modal<P extends ModalProps = ModalProps> extends DisplayComponent<P> {
  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** Called when modal is opened. */
  public onResume(): void {
    // noop
  }

  /** Called when modal is closed. */
  public onPause(): void {
    // noop
  }

  /** Closes this modal. */
  protected close(): void {
    this.props.modalService.closeByRef(this);
  }
}
