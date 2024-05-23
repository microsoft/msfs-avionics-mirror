import { Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing the map compass arc.
 */
export class G3XMapCompassArcModule {
  /** Whether to show the compass arc. */
  public readonly show = Subject.create(false);

  /** Whether to show the compass arc's minor bearing labels. */
  public readonly showMinorBearingLabels = Subject.create(false);

  /** Whether to show the compass arc's digital heading/track readout. */
  public readonly showReadout = Subject.create(false);

  /**
   * Whether to show the compass arc's selected heading bug. Showing the selected heading bug requires a
   * `MapGarminAutopilotPropsModule` to be added to the map under the key `MapSystemKeys.AutopilotProps`.
   */
  public readonly showHeadingBug = Subject.create(true);
}