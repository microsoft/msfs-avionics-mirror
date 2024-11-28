import { NavReferenceSource } from '@microsoft/msfs-garminsdk';

/**
 * A manager that automatically slews a selected CDI course setting for a navigation radio to the localizer course when
 * a localizer is tuned and received.
 */
export class CdiAutoSlewManager {
  /**
   * Creates a new instance of CdiAutoSlewManager.
   * @param navSource The navigation reference source associated with the navigation radio to manage.
   */
  public constructor(private readonly navSource: NavReferenceSource<any>) {
    const trySlewObs = this.trySlewObs.bind(this);
    navSource.localizerCourse.sub(trySlewObs);
    navSource.hasLocalizer.sub(trySlewObs);
  }

  /**
   * Attempts to slew the selected CDI course to the course of the tuned localizer, if one exists.
   */
  private trySlewObs(): void {
    const course = this.navSource.localizerCourse.get();
    if (this.navSource.hasLocalizer.get() && course !== null) {
      SimVar.SetSimVarValue(`K:VOR${this.navSource.index}_SET`, 'number', Math.round(course));
    }
  }
}
