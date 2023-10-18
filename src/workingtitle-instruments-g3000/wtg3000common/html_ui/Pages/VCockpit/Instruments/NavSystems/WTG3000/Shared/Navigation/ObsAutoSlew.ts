import { NavReferenceSource } from '@microsoft/msfs-garminsdk';

/**
 * Auto slews OBS when a NavSource is tuned to a localizer.
 */
export class ObsAutoSlew {
  /** Creates an ObsAutoSlew instance which will subscribe to a
   * given NavSource, and auto slew OBS to the localizer course.
   * @param navSource The NavSource to listen to.
   */
  public constructor(private readonly navSource: NavReferenceSource<any>) {
    navSource.localizerCourse.sub(this.trySlewObs);
    navSource.isLocalizer.sub(this.trySlewObs);
  }

  /** The user may change the course manually after slewing, this is fine.
   * It won't affect guidance or the deviation indicators. */
  private readonly trySlewObs = (): void => {
    const course = this.navSource.localizerCourse.get();
    if (this.navSource.hasLocalizer.get() && course !== null) {
      SimVar.SetSimVarValue(`K:VOR${this.navSource.index}_SET`, 'number', Math.round(course));
    }
  };
}