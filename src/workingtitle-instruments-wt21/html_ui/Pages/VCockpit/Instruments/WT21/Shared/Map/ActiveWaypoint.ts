import { MapProjection, MapWaypointImageIcon, Waypoint } from '@microsoft/msfs-sdk';

/**
 * An active map flightplan waypoint icon that can be set to flash for the WT21.
 */
export class ActiveWaypointIcon extends MapWaypointImageIcon<Waypoint> {
  private isDisplayed = true;

  /**
   * Sets whether or not the icon is displayed.
   * @param isDisplayed Whether or not the icon is displayed.
   */
  public setDisplayed(isDisplayed: boolean): void {
    this.isDisplayed = isDisplayed;
  }

  /** @inheritdoc */
  public drawIconAt(context: CanvasRenderingContext2D, mapProjection: MapProjection, left: number, top: number): void {
    if (this.isDisplayed) {
      super.drawIconAt(context, mapProjection, left, top);
    }
  }
}