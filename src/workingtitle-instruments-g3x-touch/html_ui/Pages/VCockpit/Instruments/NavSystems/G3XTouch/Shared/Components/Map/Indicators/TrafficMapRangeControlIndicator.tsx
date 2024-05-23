import {
  ComponentProps, DisplayComponent, FSComponent, MapSystemContext, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, TouchButtonOnTouchedAction, TrafficMapRangeController } from '@microsoft/msfs-garminsdk';

import { G3XTouchFilePaths } from '../../../G3XTouchFilePaths';
import { TouchButton } from '../../TouchButton/TouchButton';

import './MapRangeTargetControlIndicator.css';

/**
 * Controllers required for TrafficMapRangeControlIndicator.
 */
export interface TrafficMapRangeControlIndicatorControllers {
  /** Traffic map range controller. */
  [GarminMapKeys.TrafficRange]: TrafficMapRangeController;
}

/**
 * Component props for TrafficMapRangeControlIndicator.
 */
export interface TrafficMapRangeControlIndicatorProps extends ComponentProps {
  /** The map's context. */
  context: MapSystemContext<any, any, TrafficMapRangeControlIndicatorControllers>;
}

/**
 * Displays a set of touchscreen buttons which allow the user to control map range and optionally reset the map target
 * to follow the airplane.
 */
export class TrafficMapRangeControlIndicator extends DisplayComponent<TrafficMapRangeControlIndicatorProps> {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Responds to when one of this indicator's range control buttons is pressed.
   * @param direction The direction in which the pressed button changes the map range.
   */
  private onRangeButtonPressed(direction: 1 | -1): void {
    this.props.context.getController(GarminMapKeys.TrafficRange).changeRangeIndex(direction);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-range-target-control'>
        <TouchButton
          onTouched={() => TouchButtonOnTouchedAction.Press}
          onPressed={this.onRangeButtonPressed.bind(this, 1)}
          focusOnDrag
          class='map-range-target-control-button map-range-target-control-range-button map-range-target-control-range-button-minus'
        >
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_minus.png`} class='map-range-target-control-range-button-img' />
        </TouchButton>
        <TouchButton
          onTouched={() => TouchButtonOnTouchedAction.Press}
          onPressed={this.onRangeButtonPressed.bind(this, -1)}
          focusOnDrag
          class='map-range-target-control-button map-range-target-control-range-button map-range-target-control-range-button-plus'
        >
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_plus.png`} class='map-range-target-control-range-button-img' />
        </TouchButton>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}