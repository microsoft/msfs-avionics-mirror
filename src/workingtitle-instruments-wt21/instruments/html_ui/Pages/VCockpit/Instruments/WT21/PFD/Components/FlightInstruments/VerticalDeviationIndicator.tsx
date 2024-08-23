import { ComponentProps, DisplayComponent, EventBus, FSComponent, NavSourceType, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  NavIndicatorAnimator, NavIndicatorContext, WT21CourseNeedleNavIndicator, WT21GhostNeedleNavIndicator, WT21NavIndicators, WT21NavSource
} from '@microsoft/msfs-wt21-shared';

import './VerticalDeviationIndicator.css';

/** The properties for the VerticalDeviationIndicator component. */
interface VerticalDeviationIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

const maxTranslationForDiamond = 42;
const maxTranslationForStar = 44.5;

/** The VerticalDeviationIndicator component. */
export class VerticalDeviationIndicator extends DisplayComponent<VerticalDeviationIndicatorProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly verticalDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly activeNavSourceDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly activeNavSourceTranslatableRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ghostNeedleDeviationRef = FSComponent.createRef<HTMLDivElement>();
  private readonly ghostNeedleTranslatableRef = FSComponent.createRef<HTMLDivElement>();
  private readonly courseAnimator = new NavIndicatorAnimator();
  private readonly ghostAnimator = new NavIndicatorAnimator();
  private readonly isGhostVisible = Subject.create(false);
  private readonly isCourseVisible = Subject.create(false);
  private courseNeedleIndicator!: WT21CourseNeedleNavIndicator;
  private ghostNeedleIndicator!: WT21GhostNeedleNavIndicator;

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO Do we need to be able to display green diamond an purple star at same time before capturing GS?
    this.courseNeedleIndicator = this.getContext(NavIndicatorContext).get().get('courseNeedle') as WT21CourseNeedleNavIndicator;
    this.courseNeedleIndicator.source.sub(this.handleNewActiveNavSource, true);
    this.courseNeedleIndicator.verticalDeviation.sub(x => this.courseAnimator.setTargetValue(x === null ? 0 : x), true);
    this.courseNeedleIndicator.verticalDeviation.sub(x => this.isCourseVisible.set(x === null ? false : true), true);

    this.ghostNeedleIndicator = this.getContext(NavIndicatorContext).get().get('ghostNeedle') as WT21GhostNeedleNavIndicator;
    this.ghostNeedleIndicator.verticalDeviation.sub(x => this.ghostAnimator.setTargetValue(x === null ? 0 : x), true);
    this.ghostNeedleIndicator.verticalDeviation.sub(this.updateGhostVisibility, true);
    this.ghostNeedleIndicator.isVisible.sub(this.updateGhostVisibility, true);

    // TODO Hide when back course is detected?
    this.isGhostVisible.sub(this.setGhostVisibility, true);
    this.isCourseVisible.sub(this.setCourseVisibility, true);

    this.isGhostVisible.sub(this.updateVisibility, true);
    this.isCourseVisible.sub(this.updateVisibility, true);

    this.courseAnimator.output.sub(this.handleActiveNavSourceDeviation);
    this.ghostAnimator.output.sub(this.handleGhostDeviation);

    this.courseAnimator.start();
    this.ghostAnimator.start();
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

  /** Set the deviation in terms of a percentage of the max deviation that can be displayed for the given NAV source.
   * @param deviation The normalized deviation (-1, 1). */
  private readonly handleActiveNavSourceDeviation = (deviation: number): void => {
    // Course needle always has a source
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const maxTranslation = this.courseNeedleIndicator.source.get()!.getType() === NavSourceType.Gps
      ? maxTranslationForStar
      : maxTranslationForDiamond;
    this.activeNavSourceTranslatableRef.instance.style.transform = `translate3d(0, ${deviation * maxTranslation}%, 0)`;
    this.activeNavSourceDeviationRef.instance.classList.toggle('maxDeviationDown', deviation >= 1);
    this.activeNavSourceDeviationRef.instance.classList.toggle('maxDeviationUp', deviation <= -1);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly updateVisibility = (): void => {
    const shouldBeVisible = this.isCourseVisible.get() || this.isGhostVisible.get();
    this.verticalDeviationRef.instance.classList.toggle('hidden', !shouldBeVisible);
    if (shouldBeVisible) {
      this.courseAnimator.start();
      this.ghostAnimator.start();
    } else {
      this.courseAnimator.stop();
      this.ghostAnimator.stop();
    }
  };

  /** Set the deviation in terms of a percentage of the max deviation that can be displayed for the given NAV source.
   * @param deviation The normalized deviation (-1, 1). */
  private readonly handleGhostDeviation = (deviation: number): void => {
    this.ghostNeedleTranslatableRef.instance.style.transform = `translate3d(0, ${deviation * maxTranslationForDiamond}%, 0)`;
    this.ghostNeedleDeviationRef.instance.classList.toggle('maxDeviationDown', deviation >= 1);
    this.ghostNeedleDeviationRef.instance.classList.toggle('maxDeviationUp', deviation <= -1);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly updateGhostVisibility = (): void => {
    const ghostIndicatorIsVisible = this.ghostNeedleIndicator.isVisible.get();
    const vdev = this.ghostNeedleIndicator.verticalDeviation.get();
    const shouldBeVisible = ghostIndicatorIsVisible && vdev !== null;
    this.isGhostVisible.set(shouldBeVisible);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly setGhostVisibility = (isVisible: boolean): void => {
    this.ghostNeedleDeviationRef.instance.classList.toggle('hidden', !isVisible);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly setCourseVisibility = (isVisible: boolean): void => {
    this.activeNavSourceDeviationRef.instance.classList.toggle('hidden', !isVisible);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="vertical-deviation-box">
        <div class="vertical-deviation-indicator" ref={this.verticalDeviationRef}>
          <svg class="dots" width="100%" height="100%">
            <g stroke="var(--wt21-colors-dark-gray)" fill="none" stroke-width="2">
              {[-2, -1, 1, 2].map(position =>
                <circle cx="50%" cy={`${(position * 20) + 50}%`} r="3.5" />
              )}
              <line x1="10%" y1="50%" x2="100%" y2="50%" />
            </g>
          </svg>
          <div class="ghostNeedleDeviation" ref={this.ghostNeedleDeviationRef}>
            <div class="translatable" ref={this.ghostNeedleTranslatableRef}>
              <Diamond />
            </div>
            <DiamondUpDown />
          </div>
          <div class="activeNavSourceDeviation" ref={this.activeNavSourceDeviationRef}>
            <div class="translatable" ref={this.activeNavSourceTranslatableRef}>
              <Diamond />
              <Waypoint />
            </div>
            <DiamondUpDown />
          </div>
        </div>
        <div class="fail-box-small">
          GS
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
      <svg class="waypoint" width="100%" height="50%">
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
      <svg class="diamond" width="100%" height="50%">
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            class="shadow"
            d="M -8.8 0 L 0 17 L 8.8 0 L 0 -17 Z"
          />
          <path
            d="M -8.8 0 L 0 17 L 8.8 0 L 0 -17 Z"
          />
        </g>
      </svg>
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
class DiamondUpDown {
  /** @inheritdoc */
  render(): VNode {
    return (
      <>
        <svg class="diamondDown" width="100%" height="50%">
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="shadow"
              d="M -8.8 0 L 0 15.4 L 8.8 0"
            />
            <path
              d="M -8.8 0 L 0 15.4 L 8.8 0"
            />
          </g>
        </svg>
        <svg class="diamondUp" width="100%" height="50%">
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="shadow"
              d="M -8.8 0 L 0 -15.4 L 8.8 0"
            />
            <path
              d="M -8.8 0 L 0 -15.4 L 8.8 0"
            />
          </g>
        </svg>
      </>
    );
  }
}
