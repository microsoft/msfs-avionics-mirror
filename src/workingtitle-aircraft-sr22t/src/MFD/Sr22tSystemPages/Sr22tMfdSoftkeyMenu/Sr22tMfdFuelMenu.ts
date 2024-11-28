import { SoftKeyMenu, SoftKeyMenuSystem, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tFuelPage } from '../Sr22tFuelPage/Sr22tFuelPage';
import { Sr22tMfdSoftkeyMenuTypes } from './Sr22tMfdMenuConstants';

/**
 * The SR22T Softkey Engine Menu.
 */
export class Sr22tMfdFuelMenu extends SoftKeyMenu {
  /**
   * Creates an instance of the SR22T fuel softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem, private viewService: ViewService) {
    super(menuSystem);

    this.addItem(1, 'Full', this.onFullKeyPressed.bind(this));
    this.addItem(2, 'Tabs', this.onTabsKeyPressed.bind(this));
    this.addItem(9, 'Undo', this.onUndoKeyPressed.bind(this));
    this.addItem(10, 'W&B', this.onWBKeyPressed.bind(this));
  }

  /** Sets initial fuel to 92 Gallons */
  private onFullKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tFuelPage;
    if (!!page && page.temporaryUsableFuel !== undefined) {
      page.setTemporaryUsableFuel(92);
    }
  }

  /** Sets initial fuel to 60 Gallons */
  private onTabsKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tFuelPage;
    if (!!page && page.temporaryUsableFuel !== undefined) {
      page.setTemporaryUsableFuel(60);
    }
  }

  /** Resets the temporary usable fuel. */
  private onUndoKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tFuelPage;
    if (!!page && page.temporaryUsableFuel !== undefined) {
      page.resetTemporaryUsableFuel();
    }
  }

  /** Closes the fuel page and goes back to the W&B menu */
  private onWBKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tFuelPage;
    if (!!page && page.temporaryUsableFuel !== undefined) {
      page.saveInitialUsableFuel();
    }
    this.viewService.open('Sr22tWeightBalancePage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.WeightBalance);
  }
}
