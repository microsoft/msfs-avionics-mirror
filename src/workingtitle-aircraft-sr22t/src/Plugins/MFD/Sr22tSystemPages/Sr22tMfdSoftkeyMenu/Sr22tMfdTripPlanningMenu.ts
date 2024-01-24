import { SoftKeyMenu, SoftKeyMenuSystem, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tMfdSoftkeyMenuTypes } from './Sr22tMfdMenuConstants';
import { TripPlanningStore } from '../Stores';
import { FixModes, InputModes } from '../Sr22tTripPlanningPage/Sr22tTripPlanningModes';

/**
 * The SR22T Softkey Trip Planning Menu.
 */
export class Sr22tMfdTripPlanningMenu extends SoftKeyMenu {

  /**
   * Creates an instance of the SR22T Trip Planning softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   * @param store The Trip Planning store.
   */
  constructor(protected menuSystem: SoftKeyMenuSystem, private viewService: ViewService, private store: TripPlanningStore) {
    super(menuSystem);

    this.addItem(0, 'Engine', this.onEngineKeyPressed.bind(this));
    this.addItem(2, 'Map Opt', () => { }, undefined, true);
    this.addItem(4, 'Auto', this.onAutoKeyPressed.bind(this), true);
    this.addItem(5, 'Manual', this.onManualKeyPressed.bind(this), false);
    this.addItem(7, 'FPL', this.onFplKeyPressed.bind(this), true);
    this.addItem(8, 'WPTs', this.onWptsKeyPressed.bind(this), false, true);
    this.addItem(11, 'Checklist', () => { }, undefined, true);
  }

  /** Opens the engine page and the engine menu */
  private onEngineKeyPressed(): void {
    this.viewService.open('Sr22tEnginePage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Engine);
  }

  /** Handles Auto key */
  private onAutoKeyPressed(): void {
    this.store.inputMode.set(InputModes.Auto);
    this.getItem(4).value.set(true);
    this.getItem(5).value.set(false);
  }

  /** Handles Manual key */
  private onManualKeyPressed(): void {
    this.store.inputMode.set(InputModes.Manual);
    this.getItem(4).value.set(false);
    this.getItem(5).value.set(true);
  }

  /** Handles FPL key */
  private onFplKeyPressed(): void {
    this.store.fixMode.set(FixModes.FPL);
    this.getItem(7).value.set(true);
    this.getItem(8).value.set(false);
  }

  /** Handles WPTs key */
  private onWptsKeyPressed(): void {
    this.store.fixMode.set(FixModes.WPT);
    this.getItem(7).value.set(false);
    this.getItem(8).value.set(true);
  }

}
