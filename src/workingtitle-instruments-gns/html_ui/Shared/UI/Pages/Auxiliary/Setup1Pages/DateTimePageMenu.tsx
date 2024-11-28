import { Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry, ViewService } from '../../Pages';
/**
 * menu button popups barebones since no options are selectable in AUX menus
 */
export class DateTimePageMenu extends MenuDefinition {

  public readonly entries: readonly MenuEntry[] = [
    { label: 'Restore Defaults?', disabled: Subject.create<boolean>(false), action: (): void => { this.restoreDefaultValues(); ViewService.back(); } },
  ];


  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(
    private restoreDefaultValues: () => void) {
    super();
  }

  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}