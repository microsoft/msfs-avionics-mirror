import {
  ComponentProps, DisplayComponent, FSComponent, MapSystemContext, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapRangeController, TouchButtonOnTouchedAction } from '@microsoft/msfs-garminsdk';

import { G3XTouchFilePaths } from '../../../G3XTouchFilePaths';
import { TouchButton } from '../../TouchButton/TouchButton';
import { MapDragPanController } from '../Controllers/MapDragPanController';
import { G3XMapKeys } from '../G3XMapKeys';
import { MapDragPanModule } from '../Modules/MapDragPanModule';

import './MapRangeTargetControlIndicator.css';

/**
 * Modules required for MapRangeTargetControlIndicator.
 */
export interface MapRangeTargetControlIndicatorModules {
  /** Map drag-to-pan module. */
  [G3XMapKeys.DragPan]?: MapDragPanModule;
}

/**
 * Controllers required for MapRangeTargetControlIndicator.
 */
export interface MapRangeTargetControlIndicatorControllers {
  /** Map range controller. */
  [GarminMapKeys.Range]: MapRangeController;

  /** Map drag-to-pan controller. */
  [G3XMapKeys.DragPan]?: MapDragPanController;
}

/**
 * Component props for MapRangeTargetControlIndicator.
 */
export interface MapRangeTargetControlIndicatorProps extends ComponentProps {
  /** The map's context. */
  context: MapSystemContext<MapRangeTargetControlIndicatorModules, any, MapRangeTargetControlIndicatorControllers>;
}

/**
 * Displays a set of touchscreen buttons which allow the user to control map range and optionally reset the map target
 * to follow the airplane.
 */
export class MapRangeTargetControlIndicator extends DisplayComponent<MapRangeTargetControlIndicatorProps> {
  private thisNode?: VNode;

  private readonly isTargetAirplaneButtonVisible = Subject.create(false);

  private dragPanActivePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.dragPanActivePipe = this.props.context.model.getModule(G3XMapKeys.DragPan)?.isActive.pipe(this.isTargetAirplaneButtonVisible);
  }

  /**
   * Responds to when one of this indicator's range control buttons is pressed.
   * @param direction The direction in which the pressed button changes the map range.
   */
  private onRangeButtonPressed(direction: 1 | -1): void {
    this.props.context.getController(GarminMapKeys.Range).changeRangeIndex(direction);
  }

  /**
   * Responds to when this indicator's target airplane button is pressed.
   */
  private onTargetAirplaneButtonPressed(): void {
    this.props.context.getController(G3XMapKeys.DragPan)?.setDragPanActive(false);
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
        <TouchButton
          isVisible={this.isTargetAirplaneButtonVisible}
          onTouched={() => TouchButtonOnTouchedAction.Press}
          onPressed={this.onTargetAirplaneButtonPressed.bind(this)}
          focusOnDrag
          class='map-range-target-control-button map-range-target-control-target-button'
        >
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airplane_generic.png`} class='map-range-target-control-target-button-img' />
        </TouchButton>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.dragPanActivePipe?.destroy();

    super.destroy();
  }
}