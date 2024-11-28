import { SoftKeyMenuSystem } from '../SoftKeyMenuSystem';
import { SoftKeyMenu } from '../SoftKeyMenu';

/**
 * An MFD page root softkey menu.
 */
export abstract class MFDRootMenu extends SoftKeyMenu {
  /**
   * Creates an instance of an MFD page root softkey menu.
   * @param menuSystem The menu system.
   */
  constructor(menuSystem: SoftKeyMenuSystem) {
    super(menuSystem);

    this.addItem(0, 'Engine', () => menuSystem.pushMenu('engine-menu'));
  }
}
