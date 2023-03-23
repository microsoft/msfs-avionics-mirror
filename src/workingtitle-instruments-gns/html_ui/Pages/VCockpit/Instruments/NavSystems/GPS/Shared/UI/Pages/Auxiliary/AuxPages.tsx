import { ComponentProps, EventBus, FocusPosition, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSType } from '../../../UITypes';
import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuDefinition, ViewService } from '../Pages';

/**
 * Props for {@link AuxPage}
 */
export interface AuxPageProps extends GNSUiControlProps {
  /**
   * Key for this AUX page
   */
  key: string,

  /** The event bus */
  bus: EventBus,

  /** GNS type */
  gnsType: GNSType,

  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;
}

/**
 * Page in AUX groups
 */
export abstract class AuxPage<T extends AuxPageProps = AuxPageProps> extends GNSUiControl<T> {
  /**
   * Page root element
   */
  protected readonly el = FSComponent.createRef<HTMLDivElement>();

  /**
   * Menu button dialog
   */
  protected readonly menu: MenuDefinition | undefined = undefined;

  /** @inheritDoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
    } else {
      this.el.instance.classList.add('hide-element');
    }
  }

  /**
   * Whether the page is currently visible
   *
   * @returns a boolean
   */
  public get isVisible(): boolean {
    return !this.el.instance.classList.contains('hide-element');
  }

  /** @inheritDoc */
  public onRightKnobPush(): boolean {
    if (this.isFocused) {
      this.setVisible(false);
      this.blur();
      this.props.onDisabled && this.props.onDisabled(this);
      return true;
    }
    return false;
  }

  /** @inheritDoc */
  public onClr(): boolean {
    if (this.isFocused) {
      this.setVisible(false);
      this.blur();
      this.props.onDisabled && this.props.onDisabled(this);
      return true;
    }
    return false;
  }

  /** @inheritDoc */
  public onEnt(): boolean {
    if (this.isFocused) {
      this.scroll('forward');
      return true;
    }
    return false;
  }

  /** @inheritDoc */
  public onMenu(): boolean {
    if (this.menu && this.isFocused) {
      ViewService.menu(this.menu);
      return true;
    }
    return false;
  }
}

/**
 * Group of AUX pages
 */
export class AuxPageGroup extends GNSUiControl<ComponentProps> {
  private pages: AuxPage[] = [];

  public currentPage: AuxPage | undefined;

  /**
   * Gets the length of the page group.
   * @returns The page group length.
   */
  public get length(): number {
    return this.pages.length;
  }

  /** @inheritDoc */
  onInteractionEvent(evt: InteractionEvent): boolean {
    if (this.currentPage && this.currentPageFocused()) {
      return this.currentPage.onInteractionEvent(evt);
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritDoc */
  focus(focusPosition: FocusPosition): boolean {
    const focused = super.focus(focusPosition);

    if (focused && this.currentPage) {
      this.showCurrentPage();
    }

    return focused;
  }

  /** @inheritDoc */
  blur(): void {
    super.blur();
    this.hideCurrentPage();
  }

  /**
   * Shows the currently selected page
   */
  private showCurrentPage(): void {
    if (this.currentPage) {
      this.currentPage.setVisible(true);
      this.currentPage.focus(FocusPosition.First);
    }
  }

  /**
   * Hides the currently selected page
   */
  private hideCurrentPage(): void {
    if (this.currentPage) {
      this.currentPage.setVisible(false);
      this.currentPage.blur();
    }
  }

  /**
   * Sets the current active page in the group.
   *
   * @param key The id of the page to set as active.
   */
  public setPage(key: string): void {
    this.hideCurrentPage();

    const newPage = this.pages.find((it) => it.props.key === key);

    if (newPage) {
      this.currentPage = newPage;
      this.showCurrentPage();
    }
  }

  /**
   * Whether the current selected page is focused
   *
   * @returns boolean
   */
  public currentPageFocused(): boolean {
    if (this.currentPage) {
      return this.currentPage.isFocused;
    }

    return false;
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    FSComponent.visitNodes(node, childNode => {
      if (childNode.instance instanceof AuxPage) {
        this.pages.push(childNode.instance);
        return true;
      }

      return false;
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}
