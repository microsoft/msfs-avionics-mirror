import { FocusPosition, FSComponent, SubEvent, VNode } from '@microsoft/msfs-sdk';

import { MenuViewService } from './MenuViewService';
import { WT21UiControl, WT21UiControlProps } from './WT21UiControl';

/**
 * The properties for the GuiDialog component.
 */
export interface GuiDialogProps extends WT21UiControlProps {
  /** The menu view service. */
  viewService: MenuViewService
}

/**
 * The WT21 GuiDialog component.
 */
export abstract class GuiDialog<T extends GuiDialogProps = GuiDialogProps> extends WT21UiControl<T> {
  private rootElement: HTMLElement | undefined;
  public readonly onOpen;
  public readonly onClose;

  /**
   * Ctor
   * @param props The component properties.
   */
  constructor(props: T) {
    props.isolateScroll = true;
    super(props);
    this.onOpen = new SubEvent<this, void>();
    this.onClose = new SubEvent<this, void>();
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    // find root element
    FSComponent.visitNodes(node, (_node: VNode): boolean => {
      if (_node.instance instanceof HTMLElement) {
        this.rootElement = _node.instance;
        this.close();
      }
      return this.rootElement !== undefined;
    });

    this.focus(FocusPosition.First);
  }

  /**
   * Shows the dialog.
   */
  public open(): void {
    this.rootElement?.classList.remove('hidden');
    this.onOpen.notify(this);
  }

  /**
   * Hides the dialog.
   */
  public close(): void {
    this.rootElement?.classList.add('hidden');
    this.onClose.notify(this);

  }
}