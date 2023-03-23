import { DisplayComponent, Facility, FSComponent, LegDefinition, Subject, VNode } from '@microsoft/msfs-sdk';

import { GNSType, PropsWithBus } from '../../UITypes';
import { InteractionEvent } from '../InteractionEvent';

import './Pages.css';

/**
 * An entry in the menu dialog.
 */
export interface MenuEntry {
  /** The label of the menu entry to display. */
  label: string | Subject<string>;

  /** Whether or not the menu entry is disabled. */
  disabled: boolean | Subject<boolean>;

  /** The action to run when the menu entry is selected. */
  action: (() => void) | Subject<() => void>;
}

/**
 * A definition of a dialog menu.
 */
export abstract class MenuDefinition {
  /** The entries in this dialog menu. */
  public abstract entries: readonly MenuEntry[];

  /**
   * Updates the entries in this menu.
   */
  public updateEntries(): void { /** virtual */ }

  /**
   * The title of the menu.
   */
  public title = 'Page Menu';

  /**
   * Sets the label of a menu entry.
   * @param index The index of the menu entry.
   * @param val The value to set.
   */
  public setEntryLabel(index: number, val: string): void {
    const entry = this.entries[index];
    if (typeof entry.label === 'string') {
      entry.label = val;
    } else {
      entry.label.set(val);
    }
  }

  /**
   * Sets the disabled status of a menu entry.
   * @param index The index of the menu entry.
   * @param val The value to set.
   */
  public setEntryDisabled(index: number, val: boolean): void {
    const entry = this.entries[index];
    if (typeof entry.disabled === 'boolean') {
      entry.disabled = val;
    } else {
      entry.disabled.set(val);
    }
  }

  /**
   * Sets the action of a menu entry.
   * @param index The index of the menu entry.
   * @param val The value to set.
   */
  public setEntryAction(index: number, val: () => void): void {
    const entry = this.entries[index];
    if (typeof entry.action === 'function') {
      entry.action = val;
    } else {
      entry.action.set(val);
    }
  }
}

/**
 * A service that directs views to open or close.
 */
export interface ViewPresenter {
  openConfirmDialog(title: string, body: string, resolve: (value: boolean | PromiseLike<boolean>) => void, reject: (reason: any) => void): void;
  openWaypointDialog(resolve: (value: Facility | PromiseLike<Facility>) => void, reject: (reason: any) => void): void;
  openDupsDialog(ident: string, icaos: readonly string[], resolve: (value: Facility | PromiseLike<Facility>) => void, reject: (reason: any) => void): void;
  openDirectToDialogWithLeg(legDefinition: LegDefinition): void;
  openDirectToDialogWithIcao(icao: string): void;
  openObsDialog(): void;
  openMenu(definition: MenuEntry[] | MenuDefinition, title?: string): Page;
  openPageGroup<T extends Page = Page>(group: string, replace: boolean, pageNumber?: number): T | undefined;
  back(): void;
  default(): void;
}

/**
 * A service that controls open pages and menus.
 */
export class ViewService {
  private static presenter?: ViewPresenter;

  /**
   * Sets the current view service presenter.
   * @param presenter The presenter to set.
   */
  public static setPresenter(presenter: ViewPresenter): void {
    this.presenter = presenter;
  }

  /**
   * Confirms an action with a confirmation dialog box.
   * @param title The title of the dialog.
   * @param body The body of the dialog.
   * @returns True if confirmed, false if No was answered.
   */
  public static confirm(title: string, body: string): Promise<boolean> {
    if (this.presenter !== undefined) {
      return new Promise<boolean>((resolve, reject) => this.presenter?.openConfirmDialog(title, body, resolve, reject));
    }

    return Promise.reject('The view presenter was not yet available.');
  }

  /**
   * Gets a waypoint using the waypoint info dialog box.
   * @returns The facility selected by the user.
   */
  public static getWaypoint(): Promise<Facility> {
    if (this.presenter !== undefined) {
      return new Promise<Facility>((resolve, reject) => this.presenter?.openWaypointDialog(resolve, reject));
    }

    return Promise.reject('The view presenter was not yet available.');
  }

  /**
   * Opens the waypoint duplicates resolution dialog box.
   * @param ident The ident of the duplicate waypoint.
   * @param icaos The icaos of all the duplicate waypoints to load.
   * @returns The facility selected by the user.
   */
  public static resolveDups(ident: string, icaos: readonly string[]): Promise<Facility> {
    if (this.presenter !== undefined) {
      return new Promise<Facility>((resolve, reject) => this.presenter?.openDupsDialog(ident, icaos, resolve, reject));
    }

    return Promise.reject('The view presenter was not yet available.');
  }

  /**
   * Goes back to the previously opened page group.
   */
  public static back(): void {
    if (this.presenter !== undefined) {
      this.presenter.back();
    }
  }

  /**
   * Opens the DIRECT TO dialog.
   * @param legDefinition the leg definition to preselect a waypoint from in the DIRECT TO dialog.
   */
  public static directToDialogWithLeg(legDefinition: LegDefinition): void {
    this.presenter?.openDirectToDialogWithLeg(legDefinition);
  }

  /**
   * Opens the DIRECT TO dialog.
   * @param icao The icao of a facility
   */
  public static directToDialogWithIcao(icao: string): void {
    this.presenter?.openDirectToDialogWithIcao(icao);
  }

  /**
   * Opens the OBS dialog.
   */
  public static obsDialog(): void {
    this.presenter?.openObsDialog();
  }

  /**
   * Opens a menu dialog.
   * @param definition The menu definition to open the menu with.
   * @param title The optional title of the menu.
   * @returns The open menu dialog.
   */
  public static menu(definition: MenuEntry[] | MenuDefinition, title?: string): Page | undefined {
    if (this.presenter !== undefined) {
      return this.presenter.openMenu(definition, title);
    }
    return undefined;
  }

  /**
   * Opens a page group.
   * @param group The name of the page group to open.
   * @param replace Whether or not to replace the current view on the stack.
   * @param pageNumber The page number to open. If omitted, this will open the most recently opened page of the group.
   * @returns Undefined or the page it's going to open.
   */
  public static open<T extends Page = Page>(group: string, replace: boolean, pageNumber?: number): T | undefined {
    if (this.presenter !== undefined) {
      return this.presenter.openPageGroup(group, replace, pageNumber);
    }
    return undefined;
  }

  /**
   * Resets the views to the default page and group.
   */
  public static default(): void {
    if (this.presenter !== undefined) {
      this.presenter.default();
    }
  }
}

/** Props on the Page component. */
export interface PageProps extends PropsWithBus {
  /** Which type of GNS is in use. */
  gnsType: GNSType;
}

/**
 * A component that represents a GNS display page.
 */
export class Page<P extends PageProps = PageProps> extends DisplayComponent<P> {

  /** The page container element. */
  protected el = FSComponent.createRef<HTMLElement>();

  public active = false;

  /**
   * Whether the page is currently active
   *
   * @returns a boolean
   */
  public get isActive(): boolean {
    return this.active;
  }

  /**
   * A callback fired when the page has been suspended and is no longer visible.
   */
  public onSuspend(): void {
    this.el.instance.classList.add('hide-element');
    this.active = false;
  }

  /**
   * A callback fired when the page has been resumed as is now visible.
   */
  public onResume(): void {
    this.el.instance.classList.remove('hide-element');
    this.active = true;
  }

  /**
   * Pauses all active animations on the page.
   */
  public freezeAnimations(): void {
    this.el.instance.classList.add('paused');
  }

  /**
   * Resumes all active animations on the page.
   */
  public resumeAnimations(): void {
    this.el.instance.classList.remove('paused');
  }

  /**
   * Focuses the page.
   * @returns True if the page could be focused, false otherwise.
   */
  public focus(): boolean { return false; }

  /**
   * Blurs the page.
   */
  public blur(): void { /* virtual */ }

  /**
   * Handles when an interaction event is received.
   * @param evt The interaction event that was received.
   * @returns True if the event was handled, false otherwise.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInteractionEvent(evt: InteractionEvent): boolean { return false; }

  /**
   * Gets the root element of this page.
   * @returns The page's root element.
   */
  public getRootElement(): HTMLElement {
    return this.el.instance;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page-empty' ref={this.el} />
    );
  }
}

/**
 * Props on the PageGroup component.
 */
export interface PageGroupProps extends PropsWithBus {
  /** The label on this page group. */
  label: string;

  /** The default page to start on if this group has not yet been navigated to. */
  defaultPage?: number;

  /** A callback called when the page is changed. */
  onPageChanged: (index: number) => void;

  /** Whether or not this page group can be selected by scrolling with the outer knob. */
  isDetached?: boolean;
}

/**
 * A component that displays a particular page group.
 */
export class PageGroup<P extends PageGroupProps = PageGroupProps> extends DisplayComponent<P> {
  private pages: Page[] = [];
  private currentPage: Page | undefined;

  /** Whether or not the page group has focus. */
  public isFocused = false;

  /**
   * Gets the length of the page group.
   * @returns The page group length.
   */
  public get length(): number {
    return this.pages.length;
  }

  /**
   * Gets the currently active page, if any.
   * @returns The currently active page, or undefined.
   */
  public get activePage(): Page<PageProps> | undefined {
    return this.currentPage;
  }

  /**
   * Resumes the page group.
   */
  public resume(): void {
    if (this.currentPage === undefined) {
      const defaultPage = this.props.defaultPage === undefined ? 0 : this.props.defaultPage;
      const page = this.pages[defaultPage];

      if (page !== undefined) {
        this.currentPage = page;

        this.props.onPageChanged(this.pages.indexOf(this.currentPage));
        this.currentPage.onResume();
        this.currentPage.active = true;
      }
    } else {
      this.props.onPageChanged(this.pages.indexOf(this.currentPage));
      this.currentPage.onResume();
      this.currentPage.active = true;
    }
  }

  /**
   * Suspends the page group.
   */
  public suspend(): void {
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      if (page.isActive) {
        page.blur();
        page.onSuspend();
        page.active = false;
      }
    }

    this.isFocused = false;
  }

  /**
   * Focuses the page group.
   */
  public focus(): void {
    if (this.currentPage !== undefined && this.currentPage.focus()) {
      this.isFocused = true;
    }
  }

  /**
   * Focuses the page group.
   */
  public blur(): void {
    if (this.currentPage !== undefined) {
      this.currentPage.blur();
    }

    this.isFocused = false;
  }

  /**
   * Handles when an interaction event is received.
   * @param evt The interaction event that was received.
   * @returns True if the event was handled, false otherwise.
   */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    let handled = false;
    if (this.currentPage !== undefined) {
      handled = this.currentPage.onInteractionEvent(evt);
    }

    if (!handled) {
      switch (evt) {
        case InteractionEvent.RightInnerInc:
          this.changePage('inc');
          return true;
        case InteractionEvent.RightInnerDec:
          this.changePage('dec');
          return true;
        case InteractionEvent.CLRLong:
          ViewService.default();
          return true;
      }
    }

    return handled;
  }

  /**
   * Changes the active page.
   * @param direction The direction to advance the pages in.
   */
  private changePage(direction: 'inc' | 'dec'): void {
    if (this.currentPage !== undefined) {
      const currentPageIndex = this.pages.indexOf(this.currentPage);
      const newPageIndex = Utils.Clamp(currentPageIndex + (direction === 'inc' ? 1 : -1), 0, this.pages.length - 1);

      ViewService.open(this.props.label, true, newPageIndex);
    }
  }

  /**
   * Sets the current active page in the group.
   * @param page The number of the page to set as active.
   */
  public setPage(page: number): void {
    const newPageIndex = Utils.Clamp(page, 0, this.pages.length - 1);

    if (this.currentPage !== undefined) {
      const currentPageIndex = this.pages.indexOf(this.currentPage);

      if (currentPageIndex !== newPageIndex) {
        this.currentPage.blur();
        this.currentPage.onSuspend();

      }
    }

    this.currentPage = this.pages[newPageIndex];
    this.currentPage.onResume();

    this.props.onPageChanged(newPageIndex);
  }

  /**
   * Gets a page from the page group.
   * @param index The index of the page.
   * @returns The requested page.
   */
  public getPage<T extends Page = Page>(index: number): T {
    return this.pages[index] as T;
  }

  /**
   * Gets the index of a page in the page group.
   * @param page The page to search for.
   * @returns The index if found, or -1 if not found.
   */
  public indexOfPage(page: Page): number {
    return this.pages.indexOf(page);
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    FSComponent.visitNodes(node, childNode => {
      if (childNode.instance instanceof Page) {
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