import { Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry } from '../Pages';
/**
 * menu button popups barebones since no options are selectable in proc menus
 */
export class ProcedurePageMenu extends MenuDefinition {

  public readonly entries: readonly MenuEntry[] = [
    { label: ' (No Options) ', disabled: Subject.create<boolean>(true), action: (): void => undefined },
  ];


  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}
