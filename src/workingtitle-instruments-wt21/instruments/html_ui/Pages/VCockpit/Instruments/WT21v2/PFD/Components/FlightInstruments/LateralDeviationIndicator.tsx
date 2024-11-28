import { ComponentProps, DisplayComponent, EventBus, FSComponent, NavSourceType, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  MapSettingsPfdAliased, NavIndicatorAnimator, NavIndicatorContext, WT21CourseNeedleNavIndicator, WT21GhostNeedleNavIndicator, WT21NavIndicators, WT21NavSource
} from '@microsoft/msfs-wt21-shared';

import './LateralDeviationIndicator.css';

/** The properties for the LateralDeviationIndicator component. */
interface LateralDeviationIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The map user settings */
  mapSettingsManager: UserSettingManager<MapSettingsPfdAliased>
}

/** The LateralDeviationIndicator component. */
export class LateralDeviationIndicator extends DisplayComponent<LateralDeviationIndicatorProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly lateralDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly activeNavSourceDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly activeNavSourceTranslatableRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ghostNeedleDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ghostNeedleTranslatableRef = FSComponent.createRef<HTMLDivElement>();
  private readonly isVisible = Subject.create(false);
  private readonly courseDeviationAnimator = new NavIndicatorAnimator();
  private readonly ghostDeviationAnimator = new NavIndicatorAnimator();
  private readonly isCourseVisible = Subject.create(false);
  private readonly isGhostVisible = Subject.create(false);
  private courseNeedleIndicator!: WT21CourseNeedleNavIndicator;
  private ghostNeedleIndicator!: WT21GhostNeedleNavIndicator;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.courseNeedleIndicator = this.getContext(NavIndicatorContext).get().get('courseNeedle') as WT21CourseNeedleNavIndicator;
    this.courseNeedleIndicator.source.sub(this.handleNewActiveNavSource, true);
    this.courseNeedleIndicator.lateralDeviation.sub(x => this.courseDeviationAnimator.setTargetValue(x === null ? 0 : x), true);
    this.courseNeedleIndicator.lateralDeviation.sub(x => this.isCourseVisible.set(x === null ? false : true), true);

    this.courseDeviationAnimator.output.sub(this.handleActiveNavSourceDeviation);
    this.courseDeviationAnimator.start();

    this.ghostNeedleIndicator = this.getContext(NavIndicatorContext).get().get('ghostNeedle') as WT21GhostNeedleNavIndicator;
    this.ghostNeedleIndicator.lateralDeviation.sub(x => this.ghostDeviationAnimator.setTargetValue(x === null ? 0 : x), true);
    this.ghostNeedleIndicator.lateralDeviation.sub(this.updateGhostVisibility, true);
    this.ghostNeedleIndicator.isVisible.sub(this.updateGhostVisibility, true);

    this.isCourseVisible.sub(this.setCourseVisibility, true);
    this.isGhostVisible.sub(this.setGhostVisibility, true);

    this.ghostDeviationAnimator.output.sub(this.handleGhostDeviation);
    this.ghostDeviationAnimator.start();

    this.courseNeedleIndicator.isLocalizer.sub(this.updateVisibility, true);
    this.props.mapSettingsManager.whenSettingChanged('hsiFormat').handle(this.updateVisibility);
    this.ghostNeedleIndicator.isVisible.sub(this.updateVisibility, true);
    this.updateVisibility();

    this.isVisible.sub(isVisible => this.lateralDeviationRef.instance.classList.toggle('hidden', !isVisible), true);
  }

  private readonly handleNewActiveNavSource = (source: WT21NavSource | null): void => {
    if (!source) {
      throw new Error('This should not happen');
    } else {
      switch (source.getType()) {
        case NavSourceType.Nav:
          this.activeNavSourceDeviationRef.instance.classList.toggle('NAV', true);
          this.activeNavSourceDeviationRef.instance.classList.toggle('FMS', false);
          break;
        case NavSourceType.Gps:
          this.activeNavSourceDeviationRef.instance.classList.toggle('NAV', false);
          this.activeNavSourceDeviationRef.instance.classList.toggle('FMS', true);
          break;
        default: throw new Error('unexpected nav source type');
      }
    }
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly updateVisibility = (): void => {
    // TODO Ghost needle/nav-to-nav stuff/see manual
    const isPfdPpos = this.props.mapSettingsManager.getSetting('hsiFormat').value === 'PPOS';
    const isLocalizerActiveNavSource = !!this.courseNeedleIndicator.isLocalizer.get();
    const isGhostNeedleActive = this.ghostNeedleIndicator.isVisible.get();
    const shouldBeVisible = (isPfdPpos && this.isCourseVisible.get()) || isLocalizerActiveNavSource || isGhostNeedleActive;
    this.isVisible.set(shouldBeVisible);
  };

  /** Set the deviation in terms of a percentage of the max deviation that can be displayed for the given NAV source.
   * @param deviation The normalized deviation (-1, 1). */
  private readonly handleActiveNavSourceDeviation = (deviation: number): void => {
    // Course needle always has a source
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const maxTranslation = this.courseNeedleIndicator.source.get()!.getType() === NavSourceType.Gps
      ? 44.5
      : 42;
    this.activeNavSourceTranslatableRef.instance.style.transform = `translate3d(${deviation * maxTranslation}%, 0, 0)`;
    this.activeNavSourceDeviationRef.instance.classList.toggle('maxDeviationLeft', deviation === null || deviation <= -1);
    this.activeNavSourceDeviationRef.instance.classList.toggle('maxDeviationRight', deviation !== null && deviation >= 1);
  };

  /** Set the deviation in terms of a percentage of the max deviation that can be displayed for the given NAV source.
   * @param deviation The normalized deviation (-1, 1). */
  private readonly handleGhostDeviation = (deviation: number): void => {
    this.ghostNeedleTranslatableRef.instance.style.transform = `translate3d(${deviation * 42}%, 0, 0)`;
    this.ghostNeedleDeviationRef.instance.classList.toggle('maxDeviationLeft', deviation === null || deviation <= -1);
    this.ghostNeedleDeviationRef.instance.classList.toggle('maxDeviationRight', deviation !== null && deviation >= 1);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly updateGhostVisibility = (): void => {
    const ghostIndicatorIsVisible = this.ghostNeedleIndicator.isVisible.get();
    const vdev = this.ghostNeedleIndicator.lateralDeviation.get();
    const shouldBeVisible = ghostIndicatorIsVisible && vdev !== null;
    this.isGhostVisible.set(shouldBeVisible);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly setCourseVisibility = (isVisible: boolean): void => {
    this.activeNavSourceDeviationRef.instance.classList.toggle('hidden', !isVisible);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly setGhostVisibility = (isVisible: boolean): void => {
    this.ghostNeedleDeviationRef.instance.classList.toggle('hidden', !isVisible);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="lateral-deviation-box">
        <div class="lateral-deviation-indicator" ref={this.lateralDeviationRef}>
          <svg class="dots" width="100%" height="100%">
            <g stroke="var(--wt21-colors-dark-gray)" fill="none" stroke-width="2">
              {[-2, -1, 1, 2].map(position =>
                <circle cx={`${(position * 20) + 50}%`} cy="50%" r="4" />
              )}
              <line x1="50%" y1="22%" x2="50%" y2="78%" />
            </g>
          </svg>
          <div class="ghostNeedleDeviation" ref={this.ghostNeedleDeviationRef}>
            <div class="translatable" ref={this.ghostNeedleTranslatableRef}>
              <Diamond />
            </div>
            <DiamondLeftRight />
          </div>
          <div class="activeNavSourceDeviation" ref={this.activeNavSourceDeviationRef}>
            <div class="translatable" ref={this.activeNavSourceTranslatableRef}>
              <Diamond />
              <Waypoint />
            </div>
            <DiamondLeftRight />
          </div>
        </div>
        <div class="fail-box-small">
          LOC
        </div>
      </div>
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
class Waypoint {
  /** @inheritdoc */
  render(): VNode {
    return (
      <svg class="waypoint" width="50%" height="100%">
        <g
          fill="none"
          stroke="var(--wt21-colors-magenta)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            class="shadow"
            d="M 0 -12 L 2.5 -2.5 L 12 0 L 2.5 2.5 L 0 12 L -2.5 2.5 L -12 0 L -2.5 -2.5 Z"
          />
          <path
            d="M 0 -12 L 2.5 -2.5 L 12 0 L 2.5 2.5 L 0 12 L -2.5 2.5 L -12 0 L -2.5 -2.5 Z"
          />
        </g>
      </svg>
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
class Diamond {
  /** @inheritdoc */
  render(): VNode {
    return (
      <svg class="diamond" width="50%" height="100%">
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            class="shadow"
            d="M 0 -8.8 L 17 0 L 0 8.8 L -17 0 Z"
          />
          <path
            d="M 0 -8.8 L 17 0 L 0 8.8 L -17 0 Z"
          />
        </g>
      </svg>
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
class DiamondLeftRight {
  /** @inheritdoc */
  render(): VNode {
    return (
      <>
        <svg class="diamondLeft" width="50%" height="100%">
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="shadow"
              d="M 0 -8.8 L -15.4 0 L 0 8.8"
            />
            <path
              d="M 0 -8.8 L -15.4 0 L 0 8.8"
            />
          </g>
        </svg>
        <svg class="diamondRight" width="50%" height="100%">
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="shadow"
              d="M 0 -8.8 L 15.4 0 L 0 8.8"
            />
            <path
              d="M 0 -8.8 L 15.4 0 L 0 8.8"
            />
          </g>
        </svg>
      </>
    );
  }
}
