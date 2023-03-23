import { AffineTransformPathStream, ComponentProps, DisplayComponent, EventBus, FSComponent, MathUtils, Subscribable, SvgPathStream, VNode } from '@microsoft/msfs-sdk';

import { HSICommon } from './HSICommon';

import './HSITcas.css';

/**
 * Component props for {@link HSITcas}
 */
interface HSITcasProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  // eslint-disable-next-line jsdoc/require-jsdoc
  svgViewBoxSize: number;

  /** A subscribable which provides the text for the map's current range. */
  mapRange: Subscribable<string>;
}

/** Rose format for the HSI. */
export class HSITcas extends DisplayComponent<HSITcasProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public constructor(props: HSITcasProps) {
    super(props);
  }

  /**
   * Sets the visibility of this component.
   * @param isVisible Whether this component should be visible.
   */
  public setVisibility(isVisible: boolean): void {
    this.rootRef.instance.classList.toggle('hidden', !isVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    const { svgViewBoxSize } = this.props;
    const center = svgViewBoxSize / 2;
    const innerRadius = 115;
    const outerRadius = 230;

    return (
      <div class='hsi-tcas' ref={this.rootRef}>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          {this.renderRosePath(center, center, innerRadius, 12, 6, true, 'hsi-tcas-rose hsi-tcas-inner-rose')}
          {this.renderRosePath(center, center, outerRadius, 12, 0, true, 'hsi-tcas-rose hsi-tcas-outer-rose')}
        </svg>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} class='hsi-tfc-ticks-25NM'>
          {this.renderRosePath(center, center, 34, 11, 5.5, false, 'hsi-tcas-rose')}
        </svg>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} class='hsi-tfc-ticks-10NM'>
          {this.renderRosePath(center, center, 68, 11, 5.5, false, 'hsi-tcas-rose')}
        </svg>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`} class='hsi-tfc-ticks-5NM'>
          {this.renderRosePath(center, center, 135, 11, 5.5, false, 'hsi-tcas-rose')}
        </svg>
        <svg viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}>
          <g transform={`translate(${center} ${center})`}>
            {HSICommon.hsiStickAircraftSymbolSVGPath()}
          </g>
        </svg>
        <div class='hsi-tcas-range-text'>
          <div class='hsi-tcas-range-text-outer'>{this.props.mapRange}</div>
        </div>
      </div>
    );
  }

  /**
   * Renders an SVG path for a rose with 12 ticks at the cardinal clock positions and an optional circle.
   * @param centerX The x coordinate of the rose's center.
   * @param centerY The y coordinate of the rose's center.
   * @param radius The radius of the rose.
   * @param tickLength The length of the each tick.
   * @param tickOffset The radial offset of each tick. An offset of `0` places the outside of the tick exactly at the
   * radius of the rose. A positive offset moves the tick outwards.
   * @param showCircle Whether the rose includes a circle.
   * @param cssClass The CSS class(es) to apply to the path, if any.
   * @returns The rendered rose, as a VNode.
   */
  private renderRosePath(
    centerX: number,
    centerY: number,
    radius: number,
    tickLength: number,
    tickOffset: number,
    showCircle: boolean,
    cssClass?: string
  ): VNode {
    const svgStream = new SvgPathStream(0.01);
    const transformStream = new AffineTransformPathStream(svgStream);

    // Translate origin to the center of the rose
    transformStream.addTranslation(centerX, centerY);

    transformStream.beginPath();

    if (showCircle) {
      // draw circle
      transformStream.arc(0, 0, radius, 0, MathUtils.TWO_PI);
    }

    // draw ticks
    for (let i = 0; i < 12; i++) {
      transformStream.moveTo(0, -radius - tickOffset);
      transformStream.lineTo(0, tickLength - radius - tickOffset);

      transformStream.addRotation(Math.PI / 6, 'before');
    }

    return (
      <path d={svgStream.getSvgPath()} class={cssClass ?? ''} />
    );
  }
}