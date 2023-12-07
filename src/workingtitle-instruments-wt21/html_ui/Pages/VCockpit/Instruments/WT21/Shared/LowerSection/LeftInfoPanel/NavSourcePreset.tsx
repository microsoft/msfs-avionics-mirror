import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation';
import { WT21CourseNeedleNavIndicator, WT21NavIndicators } from '../../Navigation/WT21NavIndicators';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';

import './NavSourcePreset.css';

/** @inheritdoc */
interface NavSourcePresetProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The display unit layout */
  displayUnitLayout: DisplayUnitLayout;
}

/**
 * The NavSourcePreset component.
 */
export class NavSourcePreset extends DisplayComponent<NavSourcePresetProps, [WT21NavIndicators]> {
  public readonly contextType = [NavIndicatorContext] as const;
  private readonly navSourcePresetRef = FSComponent.createRef<HTMLDivElement>();

  public readonly setVisibility = (isVisible: boolean): void => {
    this.navSourcePresetRef.instance.classList.toggle('hidden', !isVisible);
  };

  /** @inheritdoc */
  public render(): VNode {
    const navIndicators = this.getContext(NavIndicatorContext).get();
    const courseNeedleIndicator = navIndicators.get('courseNeedle') as WT21CourseNeedleNavIndicator;

    const isUsingSoftkeys = this.props.displayUnitLayout === DisplayUnitLayout.Softkeys;

    return (
        <div class={{ 'navSourcePreset': true, 'navSourcePreset-side-buttons': isUsingSoftkeys }} ref={this.navSourcePresetRef}>
          <div class="navSourcePreset-upper">
            {isUsingSoftkeys && (
              <svg class="navSourcePreset-arrow" viewBox="0 0 10 14">
                <path d="M 7, 2 l -4, 5 l 4, 5" stroke-width={1.5} stroke="white" />
              </svg>
            )}

            <div class="label">PRESET</div>
          </div>

          <div class="box">
            <div class="standby">{courseNeedleIndicator.standbyPresetSourceLabel}</div>
          </div>
        </div>
      );
  }
}