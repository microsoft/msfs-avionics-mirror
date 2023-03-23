import { ComputedSubject } from '@microsoft/msfs-sdk';

/** Menu Item of each line */
export class FrequencieItemInformation {
  /** Name of menu item */
  public name = ComputedSubject.create<string | undefined, string>(undefined, (v) => {
    return v ?? 'noname';
  });

  public isSelectAble = true;

  /**
   * item for menu
   * @param name name of the option
   */
  constructor(name: string) {
    this.name.set(name);
  }
}