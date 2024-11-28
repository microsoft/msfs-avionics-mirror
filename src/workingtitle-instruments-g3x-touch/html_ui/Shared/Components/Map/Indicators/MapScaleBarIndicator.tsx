import {
  ComponentProps, DisplayComponent, FSComponent, NumberUnitInterface, Subscribable, SubscribableUtils, Unit,
  UnitFamily, VNode
} from '@microsoft/msfs-sdk';

import { G3XMapRangeValueDisplay } from '../../Common/G3XMapRangeValueDisplay';

import './MapScaleBarIndicator.css';

/**
 * Component props for MapScaleBarIndicator.
 */
export interface MapScaleBarIndicatorProps extends ComponentProps {
  /** The map's nominal range. */
  range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The unit type in which to display the range. */
  displayUnit: Subscribable<Unit<UnitFamily.Distance> | null>;

  /** The projected scale of the map's nominal range, in pixels. */
  projectedRange: number | Subscribable<number>;
}

/**
 * Displays a map scale bar.
 */
export class MapScaleBarIndicator extends DisplayComponent<MapScaleBarIndicatorProps> {
  private readonly valueRef = FSComponent.createRef<G3XMapRangeValueDisplay>();

  private readonly barWidth = SubscribableUtils.isSubscribable(this.props.projectedRange)
    ? this.props.projectedRange.map(range => `${range}px`)
    : `${this.props.projectedRange}px`;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-scale-bar'>
        <div class='map-scale-bar-bar' style={{ 'width': this.barWidth }}>
          <div class='map-scale-bar-bar-child map-scale-bar-bar-outline' />
          <div class='map-scale-bar-bar-child map-scale-bar-bar-stroke' />
        </div>
        <G3XMapRangeValueDisplay
          ref={this.valueRef}
          range={this.props.range}
          displayUnit={this.props.displayUnit}
          class='map-scale-bar-value'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.valueRef.getOrDefault()?.destroy();

    if (SubscribableUtils.isSubscribable(this.barWidth)) {
      this.barWidth.destroy();
    }

    super.destroy();
  }
}