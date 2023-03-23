import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { HSITickDirection } from './HSICommon';

// eslint-disable-next-line jsdoc/require-jsdoc
interface CompassRoseProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  shortTickLength: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  longTickLength: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  ticksRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  lettersRadius: number;
  // eslint-disable-next-line jsdoc/require-jsdoc
  tickDirection: HSITickDirection;
}

/** A compass rose display component. */
export class CompassRose extends DisplayComponent<CompassRoseProps> {

  /** Builds the compass rose tick marks.
   * @returns A collection of rose tick line elements. */
  private buildRose(): SVGLineElement[] {
    const { ticksRadius, shortTickLength, longTickLength, tickDirection } = this.props;
    const half = this.props.svgViewBoxSize / 2;

    const lines: SVGLineElement[] = [];

    const direction = tickDirection === 'Inwards' ? 1 : -1;
    const radialOffset = tickDirection === 'Inwards' ? 0 : 1;

    for (let i = 0; i < 360; i += 5) {
      const length = (i % 10 == 0 ? longTickLength : shortTickLength) * direction;

      const startX = half + (ticksRadius - length + radialOffset) * Math.cos(i * Avionics.Utils.DEG2RAD);
      const startY = half + (ticksRadius - length + radialOffset) * Math.sin(i * Avionics.Utils.DEG2RAD);

      const endX = startX + (length * Math.cos(i * Avionics.Utils.DEG2RAD));
      const endY = startY + (length * Math.sin(i * Avionics.Utils.DEG2RAD));

      lines.push(
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--wt21-colors-white)"
          stroke-linecap="round"
        />
      );
    }
    return lines;
  }

  /** Builds the compass rose letter markings.
   * @returns A collection of letter marking text elements. */
  private buildRoseMarkings(): SVGTextElement[] {
    const { svgViewBoxSize, lettersRadius } = this.props;
    const half = svgViewBoxSize / 2;

    const texts = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'];

    return texts.map((text, i) => {
      const angle = i * (360 / texts.length);

      return (
        <text
          x={half}
          y={half - lettersRadius}
          transform={`rotate(${angle}, ${half}, ${half})`}
          fill="var(--wt21-colors-white)"
          text-anchor="middle"
          font-size="25"
          stroke="none"
        >
          {text}
        </text>
      ) as SVGTextElement;
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <g>
        {this.buildRose()}
        {this.buildRoseMarkings()}
      </g>
    );
  }
}