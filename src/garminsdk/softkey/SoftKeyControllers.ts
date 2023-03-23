import { MutableSubscribable, Subscription } from '@microsoft/msfs-sdk';

import { SoftKeyMenu, SoftKeyMenuItem } from './SoftKeyMenu';

/**
 * A controller which binds a softkey to a boolean state. Once bound, the softkey will display the bound state and
 * each press of the softkey will toggle the value of the state.
 */
export class SoftKeyBooleanController {
  private item?: SoftKeyMenuItem;

  private statePipe?: Subscription;

  private isAlive = true;
  private isInit = false;

  /**
   * Constructor.
   * @param softkeyMenu The softkey menu to which this controller's softkey belongs.
   * @param softkeyIndex The index in the softkey menu at which this controller's softkey is located.
   * @param softkeyLabel The text label of this controller's softkey.
   * @param state The state bound to this controller's softkey.
   */
  constructor(
    private readonly softkeyMenu: SoftKeyMenu,
    private readonly softkeyIndex: number,
    private readonly softkeyLabel: string,
    private readonly state: MutableSubscribable<boolean>
  ) {
  }

  /**
   * Initializes this controller. This will create a softkey menu item and bind it to this controller's state.
   * @returns The softkey menu item bound to this controller's state.
   * @throws Error if this controller has been destroyed.
   */
  public init(): SoftKeyMenuItem {
    if (!this.isAlive) {
      throw new Error('SoftKeyBooleanController: cannot initialize a dead controller');
    }

    if (this.isInit) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.item!;
    }

    this.item = this.softkeyMenu.addItem(this.softkeyIndex, this.softkeyLabel, () => { this.state.set(!this.state.get()); });
    this.statePipe = this.state.pipe(this.item.value);

    this.isInit = true;

    return this.item;
  }

  /**
   * Destroys this controller. This will remove the softkey menu item bound to this controller's state.
   */
  public destroy(): void {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    if (!this.isInit) {
      return;
    }

    this.softkeyMenu.removeItem(this.softkeyIndex);
    this.statePipe?.destroy();
  }
}

/**
 * A controller which binds a softkey to a state which can take one of several enumerated values. Once bound, the
 * softkey will display the bound state and each press of the softkey will cycle the state through possible values.
 */
export class SoftKeyEnumController<T> {
  private item?: SoftKeyMenuItem;

  private statePipe?: Subscription;

  private isAlive = true;
  private isInit = false;

  /**
   * Constructor.
   * @param softkeyMenu The softkey menu to which this controller's softkey belongs.
   * @param softkeyIndex The index in the softkey menu at which this controller's softkey is located.
   * @param softkeyLabel The text label of this controller's softkey.
   * @param state The state bound to this controller's softkey.
   * @param textMap A function which maps values to their text representations.
   * @param nextFunc A function which gets the next value given the current value.
   */
  constructor(
    private readonly softkeyMenu: SoftKeyMenu,
    private readonly softkeyIndex: number,
    private readonly softkeyLabel: string,
    private readonly state: MutableSubscribable<T>,
    private readonly textMap: (value: T) => string,
    private readonly nextFunc: (currentValue: T) => T
  ) {
  }

  /**
   * Initializes this controller. This will create a softkey menu item and bind it to this controller's state.
   * @returns The softkey menu item bound to this controller's state.
   * @throws Error if this controller has been destroyed.
   */
  public init(): SoftKeyMenuItem {
    if (!this.isAlive) {
      throw new Error('SoftKeyEnumController: cannot initialize a dead controller');
    }

    if (this.isInit) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.item!;
    }

    this.item = this.softkeyMenu.addItem(this.softkeyIndex, this.softkeyLabel, () => { this.state.set(this.nextFunc(this.state.get())); });
    this.statePipe = this.state.pipe(this.item.value, this.textMap);

    this.isInit = true;

    return this.item;
  }

  /**
   * Destroys this controller. This will remove the softkey menu item bound to this controller's state.
   */
  public destroy(): void {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    if (!this.isInit) {
      return;
    }

    this.softkeyMenu.removeItem(this.softkeyIndex);
    this.statePipe?.destroy();

    this.isInit = false;
  }
}

/**
 * A definition for a softkey bound to a state by MultipleSoftKeyEnumController.
 */
export type MultipleSoftkeyEnumDef<V> = {
  /** The index of the softkey. */
  index: number,

  /** The label of the softkey. */
  label: string,

  /** The setting value bound to the softkey. */
  value: V
}

/**
 * A controller which binds one or more softkeys to a state which can take one or more enumerated values. Each
 * softkey is bound to a specific value. Once bound, each softkey will display whether the state is equal to its bound
 * value, and each press of the softkey will set the state to its bound value.
 */
export class MultipleSoftKeyEnumController<T> {
  private readonly menuItems: SoftKeyMenuItem[] = [];
  private readonly statePipes: Subscription[] = [];

  private isAlive = true;
  private isInit = false;

  /**
   * Constructor.
   * @param softkeyMenu The softkey menu to which this controller's bound softkeys belong.
   * @param state The state bound to this controller's softkeys.
   * @param softkeyDefs The definitions for the softkeys bound to this controller's setting.
   */
  constructor(
    private readonly softkeyMenu: SoftKeyMenu,
    private readonly state: MutableSubscribable<T>,
    private readonly softkeyDefs: MultipleSoftkeyEnumDef<T>[]
  ) {
  }

  /**
   * Initializes this controller. This will create softkey menu items and bind them to this controller's state.
   * @returns The softkey menu items bound to this controller's state. The order of the items is the same as the order
   * of the softkey definitions passed to this controller's constructor.
   * @throws Error if this controller has been destroyed.
   */
  public init(): readonly SoftKeyMenuItem[] {
    if (!this.isAlive) {
      throw new Error('MultipleSoftKeyEnumController: cannot initialize a dead controller');
    }

    if (this.isInit) {
      return this.menuItems;
    }

    for (let i = 0; i < this.softkeyDefs.length; i++) {
      const def = this.softkeyDefs[i];
      const item = this.softkeyMenu.addItem(def.index, def.label, () => { this.state.set(def.value); });
      this.menuItems.push(item);
      this.statePipes.push(this.state.pipe(item.value, value => value === def.value));
    }

    this.isInit = true;

    return this.menuItems;
  }

  /**
   * Destroys this controller. This will remove the softkey menu items bound to this controller's state.
   */
  public destroy(): void {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    if (!this.isInit) {
      return;
    }

    this.softkeyDefs.forEach(def => { this.softkeyMenu.removeItem(def.index); });
    this.statePipes.forEach(pipe => { pipe.destroy(); });

    this.isInit = false;
  }
}