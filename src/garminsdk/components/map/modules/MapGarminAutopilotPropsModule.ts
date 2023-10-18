import { MapAutopilotPropsModule, SubEvent, Subject } from '@microsoft/msfs-sdk';

/**
 * A module describing the state of a Garmin autopilot.
 */
export class MapGarminAutopilotPropsModule extends MapAutopilotPropsModule {
  /** Whether automatic adjustment of selected heading during a turn is active. */
  public readonly isTurnHdgAdjustActive = Subject.create(false);

  /** Whether HDG sync mode is active. */
  public readonly isHdgSyncModeActive = Subject.create(false);

  /** An event that is triggered when the selected heading is changed manually. */
  public readonly manualHeadingSelect = new SubEvent<void, void>();
}