import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { NavIndicatorContext } from '../../Navigation';
import { WT21CourseNeedleNavIndicator, WT21NavIndicators } from '../../Navigation/WT21NavIndicators';

import './NavSourcePreset.css';

/** @inheritdoc */
interface NavSourcePresetProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
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
    return (
      <div class="navSourcePreset" ref={this.navSourcePresetRef}>
        <div class="label">PRESET</div>
        <div class="box">
          <div class="standby">{courseNeedleIndicator.standbyPresetSourceLabel}</div>
        </div>
      </div>
    );
  }
}