import { EventBus } from '@microsoft/msfs-sdk';
import { G1000ControlEvents, SoftKeyMenu, SoftKeyMenuSystem, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tMfdSoftkeyMenuTypes } from './Sr22tMfdMenuConstants';

/**
 * The SR22T Softkey Engine Menu.
 */
export class Sr22tMfdEngineMenu extends SoftKeyMenu {

  private leanAssistActivate = false;

  /**
   * Creates an instance of the SR22T engine softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   * @param bus The Event Bus.
   */
  constructor(
    protected menuSystem: SoftKeyMenuSystem,
    private viewService: ViewService,
    private readonly bus: EventBus,
  ) {
    super(menuSystem);

    this.addItem(0, 'Engine', this.onEngineKeyPressed.bind(this), true);
    this.addItem(1, 'Anti-Ice', this.onAntiIceKeyPressed.bind(this));
    this.addItem(3, 'DCLTR', this.onDeclutterKeyPressed.bind(this));
    this.addItem(5, 'Assist', this.onAssistKeyPressed.bind(this));
    this.addItem(10, 'Fuel-W&B', this.onFuelKeyPressed.bind(this));
  }

  /** Closes the engine page and goes back to the root menu */
  private onEngineKeyPressed(): void {
    this.viewService.open('NavMapPage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Root);
  }

  /** Anti-Ice softkey press handler */
  private onAntiIceKeyPressed(): void {
    this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.AntiIce);
  }

  /** Declutter softkey press handler */
  private onDeclutterKeyPressed(): void {
    //inop
  }

  /** Assist softkey press handler */
  private onAssistKeyPressed(): void {
    this.leanAssistActivate = !this.leanAssistActivate;
    this.bus.getPublisher<G1000ControlEvents>().pub('eis_lean_assist', this.leanAssistActivate);
    this.getItem(5)?.value.set(this.leanAssistActivate);
  }

  /** Fuel softkey press handler */
  private onFuelKeyPressed(): void {
    this.viewService.open('Sr22tFuelPage');
    this.menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.Fuel);
  }
}

/**
 * Replace the base NXI Engine softkey on some menus with the SR22T Engine softkey.
 * @param menuSystem An instance of the Garmin softkey menu system.
 * @param viewService An instance of the ViewService.
 */
export const replaceEngineSoftkeys = (menuSystem: SoftKeyMenuSystem, viewService: ViewService): void => {
  let menu: SoftKeyMenu;

  // Replace on the Select Procedure Root Menu
  menu = menuSystem.getMenu('selectproc-root');
  menu.addItem(0, 'Engine', () => onEngineKeyPressed(menuSystem, viewService));

  // Replace on the FPL Root Menu
  menu = menuSystem.getMenu('fpln-menu');
  menu.addItem(0, 'Engine', () => onEngineKeyPressed(menuSystem, viewService));

  // Replace on the Nearest Airports Root Menu
  menu = menuSystem.getMenu('nearest-airports-menu');
  menu.addItem(0, 'Engine', () => onEngineKeyPressed(menuSystem, viewService));

  // Replace on the Nearest VORs Root Menu
  menu = menuSystem.getMenu('nearest-vors-menu');
  menu.addItem(0, 'Engine', () => onEngineKeyPressed(menuSystem, viewService));

  // Replace on the MFD System Setup Root Menu
  menu = menuSystem.getMenu('systemsetup-root');
  menu.addItem(0, 'Engine', () => onEngineKeyPressed(menuSystem, viewService));
};

const onEngineKeyPressed = (menuSystem: SoftKeyMenuSystem, viewService: ViewService): void => {
  viewService.open('Sr22tEnginePage');
  menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Engine);
};
