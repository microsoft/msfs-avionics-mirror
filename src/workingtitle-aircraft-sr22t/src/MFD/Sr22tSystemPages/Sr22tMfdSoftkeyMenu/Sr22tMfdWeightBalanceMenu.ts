import { SoftKeyMenu, SoftKeyMenuSystem, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tMfdSoftkeyMenuTypes } from './Sr22tMfdMenuConstants';
import { Sr22tWeightBalancePage } from '../Sr22tWeightBalancePage/Sr22tWeightBalancePage';

/**
 * The SR22T Softkey Weight&Balance Menu.
 */
export class Sr22tMfdWeightBalanceMenu extends SoftKeyMenu {
  /**
   * Creates an instance of the SR22T weight&balance softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem, private viewService: ViewService) {
    super(menuSystem);

    this.addItem(0, 'Engine', this.onEngineKeyPressed.bind(this));
    this.addItem(2, 'Graph', this.onGraphKeyPressed.bind(this));
    this.addItem(6, 'Fuel', this.onFuelKeyPressed.bind(this));
    this.addItem(10, 'Confirm', this.onConfirmKeyPressed.bind(this));
    this.addItem(11, 'Checklist', this.onChecklistKeyPressed.bind(this));
  }

  /** Opens the engine page and the engine menu */
  private onEngineKeyPressed(): void {
    this.viewService.open('Sr22tEnginePage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Engine);
  }

  /** Graph softkey press handler */
  private onGraphKeyPressed(): void {
    this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.WBGraph);
  }

  /** Fuel softkey press handler */
  private onFuelKeyPressed(): void {
    this.viewService.open('Sr22tFuelPage');
    this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.Fuel);
  }

  /** Confirm softkey press handler */
  private onConfirmKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tWeightBalancePage;
    if (!!page && page.onConfirm !== undefined) {
      page.onConfirm();
    }
    this.viewService.open('NavMapPage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Root);
  }

  /** Checklist softkey press handler */
  private onChecklistKeyPressed(): void {
    this.viewService.open('Sr22tChecklistPage');
    this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.Checklist);
  }
}

/** The SR22T Softkey Weight&Balance Graph Menu. */
export class Sr22tMfdWeightBalanceGraphMenu extends SoftKeyMenu {
  private zoomed = false;

  /**
   * Creates an instance of the SR22T weight&balance softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem, private viewService: ViewService) {
    super(menuSystem);

    this.addItem(2, 'Zoom', this.onZoomKeyPressed.bind(this), this.zoomed);
    this.addItem(10, 'Back', this.onBackKeyPressed.bind(this));
  }

  /** Zoom softkey press handler */
  private onZoomKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tWeightBalancePage;
    if (!!page && page.isGraphZoomed !== undefined) {
      page.toggleGraphZoom();
      this.zoomed = page.isGraphZoomed;
      this.getItem(2).value.set(page.isGraphZoomed);
    }
  }

  /** Back softkey press handler */
  private onBackKeyPressed(): void {
    this.menuSystem.back();
  }
}
