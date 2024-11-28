import { DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, NavMath, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApLateralMode, NavigationSourceDataProvider } from '@microsoft/msfs-epic2-shared';

import './ExpandedLocalizerDisplay.css';

/** The properties for the expanded localizer component. */
interface ExpandedLocalizerDisplayProps {
  /** The autopilot data provider to use. */
  autopilotDataProvider: AutopilotDataProvider;
  /** The heading data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
  /** The event bus. */
  bus: EventBus
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The horizon expanded localizer component. */
export class ExpandedLocalizerDisplay extends DisplayComponent<ExpandedLocalizerDisplayProps> {
  // 0% = 0 DDM
  // 100% = 0.0775 DDM (1 dot)
  // 125% = 0.096875 DDM
  // 150% = 0.116250 DDM
  private static LOC_SCALE = 0.155 / 0.0775;

  private isLocFailed = MappedSubject.create(
    ([lateralDeviation, isLocalizer]) => {
      return isLocalizer && lateralDeviation === null;
    },
    this.props.navigationSourceDataProvider.courseNeedle.get().lateralDeviation,
    this.props.navigationSourceDataProvider.courseNeedle.get().isLocalizer
  );

  private isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.navigationSourceDataProvider.courseNeedle.get().hasLocalizer.map((v) => !v),
    this.props.declutter
  );

  private locIsBackcourseSubj = MappedSubject.create(
    ([localizerCourse, course]) => {
      if (localizerCourse !== null && course !== null && Math.abs(NavMath.diffAngle(localizerCourse, course)) > 105) {
        return true;
      }
      return false;
    },
    this.props.navigationSourceDataProvider.courseNeedle.get().localizerCourse,
    this.props.navigationSourceDataProvider.courseNeedle.get().course
  );

  private readonly isLocLatActive = this.props.autopilotDataProvider.lateralActive.map((v) => v === Epic2ApLateralMode.Localiser || v === Epic2ApLateralMode.LocaliserBackCourse);

  private readonly isLocOrBcArmed = this.props.autopilotDataProvider.lateralArmed.map((v) => v === Epic2ApLateralMode.Localiser || v === Epic2ApLateralMode.LocaliserBackCourse);

  // -1 is the left dot, 1 is the right dot.
  private locDeviationDots = MappedSubject.create(([lateralDeviation, locIsBC]) => {
    const d = (lateralDeviation !== null ? lateralDeviation : 0) * (locIsBC ? -1 : 1);
    return MathUtils.clamp(d * ExpandedLocalizerDisplay.LOC_SCALE * 35, -48, 48);
  },
    this.props.navigationSourceDataProvider.courseNeedle.get().lateralDeviation,
    this.locIsBackcourseSubj
  ).pause();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isHidden.sub(isHidden => {
      if (isHidden) {
        this.locDeviationDots.pause();
      } else {
        this.locDeviationDots.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'expanded-localizer-outer-container': true,
          'hidden': this.isHidden,
        }}
      >
        <div
          class={{
            'loc-back-course-label': true,
            'hidden': this.locIsBackcourseSubj.map((v) => v === false),
          }}
        >
          BC
        </div>
        <div class="expanded-localizer-inner-container">
          <div class="loc-deviation-pip-container">
            <div class="loc-deviation-pip"></div>
            <div class="loc-deviation-middle-pip"></div>
            <div class="loc-deviation-pip"></div>
          </div>
          <svg
            class="loc-failed-overlay"
            viewBox="12 4 110 26"
            style={{
              width: '110px',
              height: '26px',
              display: this.isLocFailed.map(v => v === true ? 'block' : 'none'),
            }}
          >
            <path d="M 19 9 l 84 18 m -84 0 l 84 -18" />
          </svg>
          <div
            class={{
              'loc-deviation-arrow': true,
              'hidden': this.isHidden.map((v) => v === true),
              'magenta': this.isLocLatActive,
              'cyan': this.isLocOrBcArmed,
            }}
            style={{
              transform: this.locDeviationDots.map((v) => `translateX(${v}px)`),
            }}
          >
            <svg
              viewBox="-8 0 16 28"
              style={{
                'width': '16px',
                'height': '28px'
              }}
            >
              <path
                d="M 0 2 l 3.5 6 l 0 17 l -3.5 -5 l -3.5 5 l 0 -17 z"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
}
