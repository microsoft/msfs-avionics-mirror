
import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import './HsiCompass.css';

/**
 * Component props for HsiCompass.
 */
export interface HsiCompassProps extends ComponentProps {
  /** The size of the compass, in pixels. */
  size: number;

  /** The offset, in pixels, of the compass labels from the edge of the compass. */
  labelOffset: number;

  /** The length of the small compass ticks, in pixels. */
  tickLengthSmall: number;

  /** The length of the medium compass ticks, in pixels. */
  tickLengthMedium: number;

  /** The length of the large compass ticks, in pixels. */
  tickLengthLarge: number;

  /** The rotation of the compass, in degrees. */
  rotation: Subscribable<number>;
}

/**
 * A compass display for a G3X Touch HSI.
 *
 * The compass display depicts a circular compass rose with minor tick marks every 5 degrees and major tick marks every
 * 10 degrees. The cardinal directions are labeled N/E/S/W, with numeric labels (3, 6, 12, ...) at every hour position
 * that does not represent a cardinal direction.
 *
 * The compass also optionally displays a single continuous circular line of arbitrary radius within the rose.
 */
export class HsiCompass extends DisplayComponent<HsiCompassProps> {

  private readonly labelTransform = CssTransformSubject.create(CssTransformBuilder.concat(CssTransformBuilder.translate('%', '%'), CssTransformBuilder.rotate3d('deg')));

  /** @inheritdoc */
  public onAfterRender(): void {
    this.labelTransform.transform.getChild(0).set(-50, -50);
    this.props.rotation.sub((rotation) => {
      this.labelTransform.transform.getChild(1).set(0, 0, 1, rotation * -1);
      this.labelTransform.resolve();
    }, true);

  }

  /** @inheritdoc */
  public render(): VNode {
    const halfSize = this.props.size / 2;

    return (
      <div class='hsi-compass' style={`width: ${this.props.size}px; height: ${this.props.size}px`}>
        <svg viewBox={`${-halfSize} ${-halfSize} ${this.props.size} ${this.props.size}`}>
          <circle cx={0} cy={0} r={halfSize} class='hsi-compass-background' />
          <g class='hsi-compass-ticks'>
            {this.renderTicks()}
          </g>
        </svg>
        {this.renderLabels()}
      </div>
    );
  }

  /**
   * Renders this compass's tick marks.
   * @returns This compass's tick marks, as an array of VNodes.
   */
  private renderTicks(): VNode[] {
    const lines: VNode[] = [];


    for (let i = 0; i < 360; i += 5) {
      const isMajor = i % 30 === 0;

      lines.push(
        <line
          x1={0} y1={0}
          x2={0} y2={this.getTickLength(i)}
          transform={`rotate(${i}) translate(0, ${-this.props.size / 2})`}
          class={`hsi-compass-tick hsi-compass-tick-${isMajor ? 'major' : 'minor'}`}
        />
      );
    }

    return lines;
  }

  /**
   * Gets the length of a tick mark based on the loop index.
   * @param index The loop index of the requested tick mark
   * @returns The length of the requested tick mark
   */
  private getTickLength(index: number): number {
    if (index % 30 === 0) { return this.props.tickLengthLarge; }
    if (index % 10 === 0) { return this.props.tickLengthMedium; }
    return this.props.tickLengthSmall;
  }

  /**
   * Renders this compass's labels.
   * @returns This compass's labels, as an array of VNodes.
   */
  private renderLabels(): VNode[] {
    const texts = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'];
    const letters: VNode[] = [];
    const radius = this.props.size / 2;

    const increment = 360 / texts.length;

    let heading = 0;
    const labelRadius = this.props.size / 2 - this.props.labelOffset;

    for (let i = 0; i < texts.length; i++) {
      const angle = heading - 90;
      const x = Math.cos(angle * Avionics.Utils.DEG2RAD) * labelRadius + radius;
      const y = Math.sin(angle * Avionics.Utils.DEG2RAD) * labelRadius + radius;

      letters.push(
        <div
          class='hsi-compass-label'
          style={{ 'position': 'absolute', 'left': `${x}px`, 'top': `${y}px`, 'transform': this.labelTransform }}
        >
          {texts[i]}
        </div>
      );
      heading += increment;
    }

    return letters;
  }
}
