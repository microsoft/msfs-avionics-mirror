import { Subject } from '@microsoft/msfs-sdk';
import { MenuDefinition, MenuEntry } from '../Pages';
/**
 * Waypoint ndb page menu button (no options)
 */
export class WaypointNonDirectionalBeaconMenu extends MenuDefinition {

  public readonly entries: readonly MenuEntry[] = [
    { label: ' (No Options) ', disabled: Subject.create<boolean>(true), action: (): void => undefined },
  ];


  /** @inheritdoc */
  public updateEntries(): void {
    //nothing needs to be here?
  }
}