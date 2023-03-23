import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for HsiCompass.
 */
export interface HsiCompassProps extends ComponentProps {
  /** The size of the compass, in pixels. */
  size: number;

  /** The length of the major compass ticks, in pixels. */
  majorTickLength: number;

  /** The length of the minor compass ticks, in pixels. */
  minorTickLength: number;

  /** The offset, in pixels, of the compass labels from the edge of the compass. */
  labelOffset: number;
}

/**
 * A compass display for a next-generation (NXi, G3000, etc) HSI.
 *
 * The compass display depicts a circular compass rose with minor tick marks every 5 degrees and major tick marks every
 * 10 degrees. The cardinal directions are labeled N/E/S/W, with numeric labels (3, 6, 12, ...) at every hour position
 * that does not represent a cardinal direction.
 *
 * The compass also optionally displays a single continuous circular line of arbitrary radius within the rose.
 */
export class HsiCompass extends DisplayComponent<HsiCompassProps> {

  /** @inheritdoc */
  public render(): VNode {
    const halfSize = this.props.size / 2;

    return (
      <svg viewBox={`${-halfSize} ${-halfSize} ${this.props.size} ${this.props.size}`} class="hsi-compass" >
        <circle cx={0} cy={0} r={halfSize} class="hsi-compass-background" />
        <g class="hsi-compass-ticks">
          {this.renderTicks()}
        </g>
        <g class="hsi-compass-labels">
          {this.renderLabels()}
        </g>
      </svg>
    );
  }

  /**
   * Renders this compass's tick marks.
   * @returns This compass's tick marks, as an array of VNodes.
   */
  private renderTicks(): VNode[] {
    const lines: VNode[] = [];

    for (let i = 0; i < 360; i += 5) {
      const isMajor = i % 10 === 0;

      lines.push(
        <line
          x1={0} y1={0}
          x2={0} y2={isMajor ? this.props.majorTickLength : this.props.minorTickLength}
          transform={`rotate(${i}) translate(0, ${-this.props.size / 2})`}
          class={`hsi-compass-tick hsi-compass-tick-${isMajor ? 'major' : 'minor'}`}
        />
      );
    }

    return lines;
  }

  /**
   * Renders this compass's labels.
   * @returns This compass's labels, as an array of VNodes.
   */
  private renderLabels(): VNode[] {
    const texts = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'];
    const letters: VNode[] = [];

    const increment = 360 / texts.length;

    let angle = 0;
    for (let i = 0; i < texts.length; i++) {
      letters.push(
        <text
          x={0}
          y={0}
          text-anchor="middle"
          dominant-baseline="hanging"
          transform={`rotate(${angle}) translate(0, ${-this.props.size / 2 + this.props.labelOffset})`}
          class={`hsi-compass-label hsi-compass-label-${i % 3 === 0 ? 'major' : 'minor'}`}
        >{texts[i]}</text>
      );
      angle += increment;
    }

    return letters;
  }
}