import { Subject } from '@microsoft/msfs-sdk';

/**
 * A module for the map crosshair.
 */
export class MapCrosshairModule {
  public readonly show = Subject.create<boolean>(false);
}