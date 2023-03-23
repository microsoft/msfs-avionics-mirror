import { EventBus, HEvent, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { SoftKeyMenu } from './SoftKeyMenu';

/**
 * A system that manages Garmin softkey menus.
 *
 * Individual softkey menus are registered with the menu system under a unique string name. After a menu is registered,
 * it can be pushed onto the system's menu stack. The top-most menu in the stack is considered the current menu. Menu
 * navigation is achieved using operations on the stack:
 * * push: navigates to a new menu while preserving history.
 * * replace: navigates to a new menu without preserving history.
 * * pop: return to the previous menu stored in history.
 * * clear: removes the current menu and clears all history.
 */
export class SoftKeyMenuSystem {

  /** This system's menu stack. */
  private readonly menuStack: SoftKeyMenu[] = [];

  /** This system's registered menus. */
  private readonly registeredMenus = new Map<string, SoftKeyMenu>();

  // eslint-disable-next-line jsdoc/require-returns
  /** The top element in this system's menu stack. */
  private get menuStackTop(): SoftKeyMenu | null {
    return this.menuStack[this.menuStack.length - 1] ?? null;
  }

  private readonly _currentMenu = Subject.create<SoftKeyMenu | null>(null);
  /** The current menu, or `null` if there is no current menu. */
  public readonly currentMenu = this._currentMenu as Subscribable<SoftKeyMenu | null>;

  /**
   * Creates an instance of SoftKeyMenuSystem.
   * @param bus The event bus to use with this instance.
   * @param hEventMap A function which maps H events to softkey indexes. The function should return the index of the
   * pressed softkey for softkey press H events, and `undefined` for all other H events.
   */
  constructor(public readonly bus: EventBus, hEventMap: (hEvent: string) => number | undefined) {
    bus.getSubscriber<HEvent>().on('hEvent').handle(hEvent => {
      const index = hEventMap(hEvent);
      if (index !== undefined) {
        this.onSoftKeyPressed(index);
      }
    });
  }

  /**
   * Registers a softkey menu with this menu system under a given name. If an existing menu is registered under the
   * same name, it will be replaced by the new menu.
   * @param name The name under which to register the menu.
   * @param factory A function which creates the menu to register.
   */
  public registerMenu(name: string, factory: (menuSystem: SoftKeyMenuSystem) => SoftKeyMenu): void {
    const existing = this.registeredMenus.get(name);
    if (existing) {
      existing.destroy();
    }

    this.registeredMenus.set(name, factory(this));
  }

  /**
   * Gets the softkey menu registered under a given name.
   * @param menuName The name of the menu.
   * @returns The softkey menu registered under the specified name, or `undefined` if there is no such menu.
   */
  public getMenu(menuName: string): SoftKeyMenu | undefined {
    return this.registeredMenus.get(menuName);
  }

  /**
   * Pushes a menu onto this system's menu stack. The pushed menu will become the new current menu.
   * @param name The name of the menu to push.
   * @throws Error if this system has no menu registered under the given name.
   */
  public pushMenu(name: string): void {
    const menu = this.registeredMenus.get(name);

    if (menu === undefined) {
      throw new Error(`SoftKeyMenuSystem: cannot find menu with name '${name}'`);
    }

    this.menuStack.push(menu);
    this._currentMenu.set(this.menuStackTop);
  }

  /**
   * Replaces the current menu with another menu. The current menu will be removed from the stack and the replacement
   * menu will become the new current menu.
   * @param name The name of the replacement menu.
   * @throws Error if this system has no menu registered under the given name.
   */
  public replaceMenu(name: string): void {
    const menu = this.registeredMenus.get(name);

    if (menu === undefined) {
      throw new Error(`SoftKeyMenuSystem: cannot find menu with name '${name}'`);
    }

    this.menuStack.pop();

    this.menuStack.push(menu);
    this._currentMenu.set(this.menuStackTop);
  }

  /**
   * Removes this system's current menu from the menu stack and makes the next highest menu on the stack the new
   * current menu.
   */
  public back(): void {
    this.menuStack.pop();
    this._currentMenu.set(this.menuStackTop);
  }

  /**
   * Clears this system's menu stack of all menus.
   */
  public clear(): void {
    this.menuStack.length = 0;
    this._currentMenu.set(null);
  }

  /**
   * Responds to when a softkey is pressed.
   * @param index The index of the pressed softkey.
   */
  private onSoftKeyPressed(index: number): void {
    this.currentMenu.get()?.handleItemPressed(index);
  }
}