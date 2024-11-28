import { Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry } from '../Pages';
/**
 * Waypoint usr page menu button
 */
export class WaypointUsrPageMenu extends MenuDefinition {

  public readonly entries: readonly MenuEntry[] = [
    { label: ' View User Waypoint List? ', disabled: Subject.create<boolean>(true), action: (): void => undefined },
    { label: ' Delete User Waypoint? ', disabled: Subject.create<boolean>(true), action: (): void => undefined },
    { label: ' Crossfill? ', disabled: Subject.create<boolean>(true), action: (): void => undefined },
  ];


  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}