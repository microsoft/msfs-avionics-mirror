import { ComponentProps, DisplayComponent } from '@microsoft/msfs-sdk';

import { GarminChartDisplayProjection } from './GarminChartDisplayProjection';

/**
 * A layer in a Garmin terminal (airport) chart display.
 */
export interface GarminChartDisplayLayer extends DisplayComponent<ComponentProps> {
  /** Flags this object as a `GarminChartDisplayLayer`. */
  readonly isTerminalChartDisplayLayer: true;

  /**
   * A method that is called when this layer is attached to its parent display.
   * @param projection The projection of this layer's parent display.
   */
  onAttached(projection: GarminChartDisplayProjection): void;

  /**
   * A method that is called when the projection of this layer's parent display changes.
   * @param projection The projection of this layer's parent display.
   * @param changeFlags Bitflags describing the change to the projection.
   */
  onProjectionChanged(projection: GarminChartDisplayProjection, changeFlags: number): void;

  /**
   * A method that is called when this layer's parent display is updated.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   * @param projection The projection of this layer's parent display.
   */
  onUpdate(time: number, projection: GarminChartDisplayProjection): void;
}
