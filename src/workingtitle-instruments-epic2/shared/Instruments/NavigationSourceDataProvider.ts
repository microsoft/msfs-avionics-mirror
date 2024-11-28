import {
  ConsumerSubject, EventBus, Instrument, LNavDataEvents, MappedSubject, NavEvents, NavSourceId, NavSourceType, Subject, Subscribable
} from '@microsoft/msfs-sdk';

import { Epic2ApPanelEvents, Epic2NavigationSourceEvents } from '../Autopilot';
import { Epic2BearingPointerNavIndicator, Epic2CourseNeedleNavIndicator, Epic2GhostNeedleNavIndicator, Epic2NavIndicators } from '../Navigation';
import { DefaultAutopilotDataProvider, Epic2ApLateralMode } from './AutopilotDataProvider';

export enum NAVSOURCE_TRACKING_STATE {
  None = 'None',
  Active = 'Active',
  Armed = 'Armed'
}

/** Interface for Nav Source Data Provider */
export interface NavigationSourceDataProvider {
  /** courseNeedle */
  courseNeedle: Subscribable<Epic2CourseNeedleNavIndicator>;
  /** ghostNeedle */
  ghostNeedle: Subscribable<Epic2GhostNeedleNavIndicator>;
  /** Bearing Pointer 1 */
  bearingPointer1: Subscribable<Epic2BearingPointerNavIndicator>;
  /** Bearing Pointer 2 */
  bearingPointer2: Subscribable<Epic2BearingPointerNavIndicator>;
  /** tracks whether the active nav source is armed or active in the AP */
  navsourceTrackingState: Subscribable<NAVSOURCE_TRACKING_STATE>;
  /** are the nav sources equal on both PFDs (besides FMS) */
  areNavSourcesEqual: Subscribable<boolean>;
  /** The current RNP (equal to 2 dots deflection on the CDI for LNAV), or null when invalid. */
  rnp: Subscribable<number | null>;
}

/** A navigation source data provider implementation. */
export class DefaultNavigationSourceDataProvider implements NavigationSourceDataProvider, Instrument {
  private readonly sub = this.bus.getSubscriber<LNavDataEvents>();

  private leftNavSource = Subject.create<NavSourceId | null>(null);
  private rightNavSource = Subject.create<NavSourceId | null>(null);

  private readonly fmsRnp = ConsumerSubject.create(this.sub.on('lnavdata_cdi_scale'), null);

  private readonly apNavSource = ConsumerSubject.create<NavSourceId>(null, { index: 1, type: NavSourceType.Gps });

  protected _courseNeedle = Subject.create(this.navIndicators.get('courseNeedle') as Epic2CourseNeedleNavIndicator);
  public readonly courseNeedle = this._courseNeedle as Subscribable<Epic2CourseNeedleNavIndicator>;

  protected _ghostNeedle = Subject.create(this.navIndicators.get('ghostNeedle') as Epic2GhostNeedleNavIndicator);
  public readonly ghostNeedle = this._ghostNeedle as Subscribable<Epic2GhostNeedleNavIndicator>;

  protected _bearingPointer1 = Subject.create(this.navIndicators.get('bearingPointer1') as Epic2BearingPointerNavIndicator);
  public readonly bearingPointer1 = this._bearingPointer1 as Subscribable<Epic2BearingPointerNavIndicator>;

  protected _bearingPointer2 = Subject.create(this.navIndicators.get('bearingPointer2') as Epic2BearingPointerNavIndicator);
  public readonly bearingPointer2 = this._bearingPointer2 as Subscribable<Epic2BearingPointerNavIndicator>;

  protected _areNavSourcesEqual = MappedSubject.create(
    ([leftNavSource, rightNavSource]) => {
      if (leftNavSource === null || rightNavSource === null) {
        return false;
      }
      return leftNavSource.type === rightNavSource.type &&
        leftNavSource.index === rightNavSource.index &&
        leftNavSource.type !== NavSourceType.Gps &&
        rightNavSource.type !== NavSourceType.Gps;
    },
    this.leftNavSource,
    this.rightNavSource
  );
  public readonly areNavSourcesEqual = this._areNavSourcesEqual as Subscribable<boolean>;

  protected _navsourceTrackingState = MappedSubject.create(
    ([lateralActive, lateralArmed, apNavSource, courseNeedle]) => {

      // is AP navsource the same as courseneedle's navsource?
      if (apNavSource.type === courseNeedle?.getType() && apNavSource.index === courseNeedle?.index) {
        // if the above is true, then is the mode armed or active?
        if (lateralActive === Epic2ApLateralMode.NavVorLnav || lateralActive === Epic2ApLateralMode.Localiser || lateralActive === Epic2ApLateralMode.LocaliserBackCourse) {
          return NAVSOURCE_TRACKING_STATE.Active;
        } else if (lateralArmed === Epic2ApLateralMode.NavVorLnav || lateralArmed === Epic2ApLateralMode.Localiser || lateralArmed === Epic2ApLateralMode.LocaliserBackCourse) {
          return NAVSOURCE_TRACKING_STATE.Armed;
        } else {
          return NAVSOURCE_TRACKING_STATE.None;
        }
      }
    },
    this.apDataProvider.lateralActive,
    this.apDataProvider.lateralArmed,
    this.apNavSource,
    this.courseNeedle.get().source
  );
  public readonly navsourceTrackingState = this._navsourceTrackingState as Subscribable<NAVSOURCE_TRACKING_STATE>;

  private readonly _rnp = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly rnp = this._rnp as Subscribable<number | null>;

  private readonly rnpPipe = this.fmsRnp.pipe(this._rnp, true);

  private readonly outputSubjects = [
    this._rnp,
  ];

  private readonly pausables = [
    this.rnpPipe,
  ];

  /** @inheritdoc */
  public constructor(
    private readonly bus: EventBus,
    protected readonly navIndicators: Epic2NavIndicators,
    private readonly apDataProvider: DefaultAutopilotDataProvider,
  ) {
    const sub = bus.getSubscriber<Epic2ApPanelEvents & Epic2NavigationSourceEvents>();
    sub.on('epic2_navsource_course_needle_left_source').handle((navSource) => {
      this.leftNavSource.set(navSource);
    });
    sub.on('epic2_navsource_course_needle_right_source').handle((navSource) => {
      this.rightNavSource.set(navSource);
    });
  }

  /** @inheritdoc */
  public init(): void {
    this.apNavSource.setConsumer(this.bus.getSubscriber<NavEvents>().on('cdi_select'));
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Resume the data outputs. */
  public resume(): void {
    for (const sub of this.pausables) {
      sub.resume(true);
    }
  }

  /** Pause the data outputs. */
  public pause(): void {
    for (const sub of this.pausables) {
      sub.pause();
    }

    for (const sub of this.outputSubjects) {
      sub.set(null);
    }
  }
}
