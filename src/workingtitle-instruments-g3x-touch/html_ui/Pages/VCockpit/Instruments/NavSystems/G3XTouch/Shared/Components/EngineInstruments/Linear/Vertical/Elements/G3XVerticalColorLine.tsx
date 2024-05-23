import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { G3XHorizontalColorLine } from '../../Horizontal/Elements/G3XHorizontalColorLine';

/** A single, thick colored stroke at a specific value. */
export class G3XVerticalColorLine extends G3XHorizontalColorLine {
  /** @inheritDoc */
  protected updatePosition(position: number): void {
    const min = this.props.geometry.minValue.get(); // - 0
    const max = this.props.geometry.maxValue.get(); // - 100
    const translation = this.props.scaleHeight - (((position - min) / (max - min)) * this.props.scaleHeight);
    this.lineRef.instance.style.transform = `translate3d(0px, ${translation}px, 0px)`;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <line
        class='color-line'
        ref={this.lineRef}
        x1={0}
        y1={0}
        x2={this.props.scaleWidth}
        y2={0}
        stroke={this.props.color}
        stroke-width={2}
        vector-effect='non-scaling-stroke'
      />
    );
  }
}