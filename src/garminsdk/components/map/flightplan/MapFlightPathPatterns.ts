import { PathPattern, PathStream } from '@microsoft/msfs-sdk';

/**
 * A repeating pattern of triangular arrows pointing in the direction of the input path.
 */
export class FlightPathArrowPattern implements PathPattern {
  /** @inheritDoc */
  public readonly anchor = 0.5;

  /** The canvas 2D rendering context to which to render. */
  public context: CanvasRenderingContext2D | null = null;

  /** The color of the arrows to render. */
  public color = 'white';

  private readonly halfArrowLength: number;
  private readonly halfArrowWidth: number;

  /**
   * Creates a new instance of FlightPathArrowPattern.
   * @param length The along-path length of each repeating unit of this pattern, in pixels.
   * @param arrowLength The length of the arrow, in pixels.
   * @param arrowWidth The width of the arrow, in pixels.
   */
  public constructor(
    public readonly length: number,
    arrowLength: number,
    arrowWidth: number
  ) {
    this.halfArrowLength = arrowLength / 2;
    this.halfArrowWidth = arrowWidth / 2;
  }

  /** @inheritDoc */
  public draw(stream: PathStream): void {
    if (!this.context) {
      return;
    }

    stream.moveTo(this.halfArrowLength, 0);
    stream.lineTo(-this.halfArrowLength, -this.halfArrowWidth);
    stream.lineTo(-this.halfArrowLength, this.halfArrowWidth);
    stream.closePath();

    this.context.fillStyle = this.color;
    this.context.fill();
  }
}