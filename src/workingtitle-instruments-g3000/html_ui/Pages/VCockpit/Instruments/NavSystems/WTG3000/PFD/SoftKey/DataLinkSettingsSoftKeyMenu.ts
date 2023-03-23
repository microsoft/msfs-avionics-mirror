import { SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-garminsdk';

/**
 * The data link settings softkey menu.
 */
export class DataLinkSettingsSoftKeyMenu extends SoftKeyMenu {
  /**
   * Creates an instance of the data link settings softkey menu.
   * @param menuSystem The softkey menu system.
   * @param isSplit Whether the menu is a split-mode menu.
   */
  constructor(
    menuSystem: SoftKeyMenuSystem,
    isSplit: boolean
  ) {
    super(menuSystem);

    this.addItem(0, 'Data Link', undefined, 'Connext', true);
    this.addItem(isSplit ? 2 : 5, 'Source');
    this.addItem(isSplit ? 3 : 6, 'Storm Cell\nMovement');
    this.addItem(isSplit ? 5 : 10, 'Back', () => { menuSystem.back(); });
  }
}