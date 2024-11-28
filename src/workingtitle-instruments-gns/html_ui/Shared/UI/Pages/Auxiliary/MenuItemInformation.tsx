import { ComputedSubject } from '@microsoft/msfs-sdk';

/** Menu Item of each line */
export class MenuItemInformation {
  /** Name of menu item */
  public name = ComputedSubject.create<string | undefined, string>(undefined, (v) => {
    return v ?? 'noname';
  });

  public isSelectAble = true;

  public pageToOpen = 0;

  /**
   * Item for menu.
   * @param name Name of the option.
   */
  constructor(name: string) {
    this.name.set(name);
    // this.pageToOpen = pageIndex;
  }
}