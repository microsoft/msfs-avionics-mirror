import { ComponentProps, DisplayComponent, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { Modal } from './Modal';
import { ModalKey, ModalPosition } from './ModalTypes';

/** Contains info about a registered Modal. */
interface ModalEntry<M extends Modal = Modal> {
  /** The Modal insance. */
  modal: M;
  /** The position of the modal */
  position: ModalPosition
  /** The modal wrapper div element. */
  wrapperDiv: HTMLDivElement;
}

/** Stores, hides, and reveals modals. */
export class ModalService {
  private readonly modals = new Map<ModalKey, ModalEntry>();

  /**
   * ctor
   * @param container The element to put modals in.
   */
  public constructor(private readonly container: HTMLElement) { }

  /**
   * Registers a modal with a key.
   * @param key The modal key.
   * @param position The position of the modal
   * @param modalBuilder A function returning a Modal VNode.
   */
  public registerModal(key: ModalKey, position: ModalPosition, modalBuilder: () => VNode): void {
    const vnode = modalBuilder();
    const wrapperRef = FSComponent.createRef<HTMLDivElement>();
    FSComponent.render(<ModalWrapper divRef={wrapperRef}>{vnode}</ModalWrapper>, this.container);

    this.modals.set(key, {
      modal: vnode.instance as Modal,
      position,
      wrapperDiv: wrapperRef.instance,
    });
  }

  /**
   * Opens a modal and calls its onResume method.
   * @param key The modal key to open.
   * @throws error if modal doesn't exist.
   * @returns An object containing the modal instance.
   */
  public open<M extends Modal = Modal>(key: ModalKey): ModalEntry<M> {
    const entry = this.modals.get(key);
    if (!entry) {
      throw new Error('[open] modal not found with key: ' + key);
    }
    this.closeModalsInPosition(entry.position);
    entry.wrapperDiv.style.display = 'block';
    entry.modal.onResume();

    return entry as ModalEntry<M>;
  }

  /**
   * Closes any open modals that are in the specified position
   * @param position The position
   */
  public closeModalsInPosition(position: ModalPosition): void {
    for (const [modalKey, modal] of this.modals) {
      if (modal.position === position && modal.wrapperDiv.style.display === 'block') {
        this.close(modalKey);
      }
    }
  }

  /**
   * Hides a modal by key, and calls its onPause method.
   * @param key The modal to close.
   * @throws error if modal doesn't exist.
   */
  public close(key: ModalKey): void {
    const entry = this.modals.get(key);
    if (!entry) {
      throw new Error('[close] modal not found with key: ' + key);
    }
    if (entry) {
      entry.modal.onPause();
      entry.wrapperDiv.style.display = 'none';
    }
  }

  /**
   * Hides a modal by reference, and calls its onPause method.
   * Only meant to be used by the Modal itself.
   * @param modal The modal to close.
   */
  public closeByRef(modal: Modal): void {
    for (const [key, entry] of this.modals) {
      if (entry.modal === modal) {
        this.close(key);
        return;
      }
    }
    console.error('[closeByRef] modal not found by reference: ', modal);
  }
}

/** Props for ModalWrapper. */
interface ModalWrapperProps extends ComponentProps {
  /** The root modal wrapper div ref. */
  readonly divRef: NodeReference<HTMLDivElement>;
}

/** Wraps a Modal to control its visibility. */
class ModalWrapper extends DisplayComponent<ModalWrapperProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="modal-wrapper" style="display: none;" ref={this.props.divRef}>
        {this.props.children}
      </div>
    );
  }
}
