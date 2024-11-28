import { Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry } from '../Pages';
/**
 * Waypoint vor page menu button (no options)
 */
export class WaypointVorPageMenu extends MenuDefinition {

  public readonly entries: readonly MenuEntry[] = [
    { label: ' (No Options) ', disabled: Subject.create<boolean>(true), action: (): void => undefined },
  ];


  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}