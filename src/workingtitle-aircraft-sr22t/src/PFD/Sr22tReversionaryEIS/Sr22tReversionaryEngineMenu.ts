import { G1000ControlPublisher, G1000ControlEvents, EISPageTypes, SoftKeyMenu, SoftKeyMenuSystem } from '@microsoft/msfs-wtg1000';

/** The SR22T PFD's reversionary engine softkey menu. */
export class Sr22tReversionaryEngineMenu extends SoftKeyMenu {

  /**
   * Creates an instance of the PFD reversionary engine menu.
   * @param menuSystem The menu system.
   * @param publisher A publisher to use for sending control events
   */
  constructor(protected menuSystem: SoftKeyMenuSystem, private readonly publisher: G1000ControlPublisher) {
    super(menuSystem);

    this.addItem(0, 'Engine', () => {
      publisher.publishEvent<keyof G1000ControlEvents>('eis_reversionary_tab_select', 0 as EISPageTypes);
      this.getItem(0)?.value.set(true);
      this.getItem(1)?.value.set(false);
    }, true);

    this.addItem(1, 'System', () => {
      publisher.publishEvent<keyof G1000ControlEvents>('eis_reversionary_tab_select', 2 as EISPageTypes);
      this.getItem(0)?.value.set(false);
      this.getItem(1)?.value.set(true);
    }, false);

    this.addItem(10, 'Back', () => {
      this.selectPage(0 as EISPageTypes);
      menuSystem.back();
    });
  }

  /**
   * Handle a menu item being selected.
   * @param selectedPage The selected item.
   */
  private selectPage(selectedPage: EISPageTypes): void {
    this.publisher.publishEvent('eis_reversionary_tab_select', selectedPage);

    switch (selectedPage) {
      case 0 as EISPageTypes:
        this.menuSystem.replaceMenu('engine-menu'); break;
      case 2 as EISPageTypes:
        this.menuSystem.replaceMenu('system-menu'); break;
    }
  }
}
