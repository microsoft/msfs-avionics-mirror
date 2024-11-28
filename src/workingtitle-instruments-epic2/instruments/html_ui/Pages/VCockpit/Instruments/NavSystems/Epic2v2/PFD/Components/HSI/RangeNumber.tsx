import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './RangeNumber.css';

/** The range number props. */
export interface RangeNumberProps extends ComponentProps {
  /** The map range in NM. */
  readonly range: Subscribable<number>;
  /** The radius of the range ring where the range numbers will be displayed. */
  readonly rangeRingRadius: number;
}

/** A component to display the current map half-range. */
export class RangeNumber extends DisplayComponent<RangeNumberProps> {
  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class="hsi-range-number shaded-box">
          {this.props.range.map((v) => v < 100 ? (v / 2).toFixed(1) : (v / 2).toFixed(0))}
      </div>
    );
  }
}
