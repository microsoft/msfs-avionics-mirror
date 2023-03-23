import { SubEvent, Subject } from '@microsoft/msfs-sdk';

import { SoftKeyMenuSystem } from './SoftKeyMenuSystem';

/**
 * A Garmin softkey menu item. Defines the display and behavior of a softkey.
 */
export interface SoftKeyMenuItem {

  /** The label for this menu item. */
  readonly label: Subject<string>;

  /** The handler to invoke when this menu item is pressed. */
  handler?: (menu: SoftKeyMenu) => void;

  /** Whether this menu item is disabled. */
  readonly disabled: Subject<boolean>;

  /** An event that fires when this menu item is pressed. */
  readonly pressed: SubEvent<SoftKeyMenu, void>;

  /** The value of this menu item, if any. */
  readonly value: Subject<boolean | string | undefined>;

  /** Whether this menu item is highlighted. */
  readonly highlighted: Subject<boolean>;
}

/**
 * A Garmin softkey menu. Each menu contains up to 12 indexed menu items, each of which defines the display and
 * behavior of a corresponding softkey.
 */
export class SoftKeyMenu {

  /** The number of softkeys in each menu. */
  public static readonly SOFTKEY_COUNT = 12;

  /** The menu items in this menu. */
  private readonly menuItems: (SoftKeyMenuItem | null)[] = Array.from({ length: SoftKeyMenu.SOFTKEY_COUNT }, () => null);

  /**
   * Creates an instance of a SoftKeyMenu.
   * @param menuSystem The menu system that will manage this menu.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem) { }

  /**
   * Adds a menu item to the softkey menu.
   * @param index The softkey index to add the menu item to. Must be between 0 and 11, inclusive.
   * @param label The label of the menu item.
   * @param handler The handler to call when the menu item is selected.
   * @param value The value of the menu item, if any.
   * @param disabled Whether or not the menu item is disabled.
   * @returns The new menu item.
   * @throws Error if `index` is out of bounds.
   */
  public addItem(
    index: number,
    label: string,
    handler?: (menu: SoftKeyMenu) => void,
    value?: boolean | string,
    disabled = false
  ): SoftKeyMenuItem {
    if (index < 0 || index >= SoftKeyMenu.SOFTKEY_COUNT) {
      throw new Error(`SoftKeyMenu: menu item index (${index}) out of bounds`);
    }

    return this.menuItems[index] = {
      label: Subject.create(label),
      handler,
      value: Subject.create(value),
      pressed: new SubEvent(),
      disabled: Subject.create(handler === undefined || disabled),
      highlighted: Subject.create<boolean>(false)
    };
  }

  /**
   * Removes a menu item from the menu.
   * @param index The softkey index to remove the menu item from. Must be between 0 and 11, inclusive.
   * @throws Error if `index` is out of bounds.
   */
  public removeItem(index: number): void {
    if (index < 0 || index >= SoftKeyMenu.SOFTKEY_COUNT) {
      throw new Error(`SoftKeyMenu: menu item index (${index}) out of bounds`);
    }

    this.menuItems[index] = null;
  }

  /**
   * Gets a menu item.
   * @param index The index of the menu item. Must be between 0 and 11, inclusive.
   * @returns The requested menu item.
   * @throws Error if `index` is out of bounds.
   */
  public getItem(index: number): SoftKeyMenuItem | null {
    if (index < 0 || index >= SoftKeyMenu.SOFTKEY_COUNT) {
      throw new Error(`SoftKeyMenu: menu item index (${index}) out of bounds`);
    }

    return this.menuItems[index];
  }

  /**
   * Handles a back menu action.
   */
  public handleBack(): void {
    this.menuSystem.back();
  }

  /**
   * Iterates over the menu items.
   * @param each The function to run over each menu item.
   */
  public forEach(each: (menuItem: SoftKeyMenuItem | null, index: number) => void): void {
    this.menuItems.forEach(each);
  }

  /**
   * Handles when a menu item is pressed.
   * @param index The index of the menu item that was pressed.
   */
  public handleItemPressed(index: number): void {
    const menuItem = this.menuItems[index];
    if (menuItem !== null && menuItem.handler && !menuItem.disabled.get()) {
      menuItem.pressed.notify(this, undefined);
      menuItem.handler(this);
    }
  }

  /**
   * Destroys this menu.
   */
  public destroy(): void {
    // noop
  }
}