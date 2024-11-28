import { Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry } from '../../Pages';
/**
 * menu button popups barebones since no options are selectable in AUX menus
 */
export class FuelPlanningMenu extends MenuDefinition {

  public readonly entries: readonly MenuEntry[] = [
    { label: 'Flight Plan?', disabled: Subject.create<boolean>(false), action: (): void => { } },
    { label: 'Change Fields?', disabled: Subject.create<boolean>(false), action: (): void => { } },
    { label: 'Restore Defaults?', disabled: Subject.create<boolean>(false), action: (): void => { } },
  ];


  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}