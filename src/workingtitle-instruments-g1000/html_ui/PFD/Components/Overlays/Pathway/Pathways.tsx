import { ClockEvents, ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent, HEvent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { PathwaysDataProvider } from './PathwaysDataProvider';

/** The properties for the {@link NdInfomation} component. */
export interface PathwaysInformationProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner;

  /** The fms. */
  fms: Fms;
}


/** The NdInfomation component. */
export class Pathways extends DisplayComponent<PathwaysInformationProps> {

  // Constants:
  private readonly pathwaysUpdateRate = 20;    // [Hz]

  private readonly dataProvider = new PathwaysDataProvider(this.props.bus, this.props.flightPlanner, this.props.fms);

  // UI elements:
  private readonly pathwaysBkgCanvas = FSComponent.createRef<HTMLCanvasElement>();

  // Geometry dimensions, in pixels, initially 1024, us width to calibrate angular deviations with the flight path marker:
  private pathwaysContainerWidth = 1174;
  private halfPathwaysContainerWidth = this.pathwaysContainerWidth / 2.0;
  private pathwaysContainerHeight = this.pathwaysContainerWidth * 0.75;
  private halfPathwaysContainerHeight = this.pathwaysContainerHeight / 2.0;

  // @1024: -47px left and -107px top:
  private canvasStyle = 'position: absolute; left: -127px; top: -160px; z-index: 0;';

  // Graphical constants:
  private lineWidth = 2.2;
  private outlineFactor = 2.3;

  // CSS colors (for the selection with BoxesColors, containing Magenta, Green, White, Grey):
  private cssColors = ['magenta', 'lime', 'white', 'darkgrey'];

  // Update ticker:
  private clockSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.setCanvasSize();

    this.clockSub = this.props.bus.getSubscriber<ClockEvents>()
      .on('realTime')
      .atFrequency(this.pathwaysUpdateRate)
      .handle(() => { this.update(); }, true);

    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(hEvent => {
      if (hEvent === 'AS1000_PFD_SOFTKEYS_1') {
        // Utility handler, to be used for calibration or other tuning tasks.
      }
    });

    this.clockSub.resume();
  }

  /**
   * Configure all size related variables.
   */
  public setCanvasSize(): void {
    this.pathwaysBkgCanvas.instance.width = this.pathwaysContainerWidth;
    this.pathwaysBkgCanvas.instance.height = this.pathwaysContainerHeight;
  }

  /** Called by the update ticker at a fix rate */
  private update(): void {
    requestAnimationFrame(this.drawCanvas.bind(this));
  }

  /** Drawing method for the canvas.   */
  public drawCanvas(): void {
    const ctx = this.pathwaysBkgCanvas.instance.getContext('2d');
    if (ctx !== null) {
      ctx.clearRect(0, 0, this.pathwaysContainerWidth, this.pathwaysContainerHeight);

      const [screenCoords, screenCoordsIndex, opacities, colors, hasPointers, renderedBoxCount] = this.dataProvider.renderBoxesInScreenCoordinates();
      if (screenCoords.length > 0) {
        // We traverse from the last to the first box:
        let coordinatesIndex = screenCoordsIndex;
        for (let boxIndex = renderedBoxCount - 1; boxIndex >= 0; boxIndex--) {
          const boxHasPointers = hasPointers[boxIndex];
          coordinatesIndex -= boxHasPointers ? 32 : 16;
          const
            ulx = this.normalizedToScreenX(screenCoords[coordinatesIndex]),        // Upper left corner x
            uly = this.normalizedToScreenY(screenCoords[coordinatesIndex + 1]),    //    "    "     "   y
            llx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 4]),    // Lower left corner x
            lly = this.normalizedToScreenY(screenCoords[coordinatesIndex + 5]),    //    "    "     "   y
            lrx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 8]),    // Same on the right side...
            lry = this.normalizedToScreenY(screenCoords[coordinatesIndex + 9]),    //    "    "     "     "
            urx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 12]),   //    "    "     "     "
            ury = this.normalizedToScreenY(screenCoords[coordinatesIndex + 13]);   //    "    "     "     "

          let pulx = 0, puly = 0, pllx = 0, plly = 0, plrx = 0, plry = 0, purx = 0, pury = 0;
          if (boxHasPointers) {
            pulx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 16]);  // Upper left corner x
            puly = this.normalizedToScreenY(screenCoords[coordinatesIndex + 17]);  //    "    "     "   y
            pllx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 20]);  // Lower left corner x
            plly = this.normalizedToScreenY(screenCoords[coordinatesIndex + 21]);  //    "    "     "   y
            plrx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 24]);  // Same on the right side...
            plry = this.normalizedToScreenY(screenCoords[coordinatesIndex + 25]);  //    "    "     "     "
            purx = this.normalizedToScreenX(screenCoords[coordinatesIndex + 28]);  //    "    "     "     "
            pury = this.normalizedToScreenY(screenCoords[coordinatesIndex + 29]);  //    "    "     "     "
          }

          // Use a hyperbola formula to increase the linewidth for closer boxes, between 1/2 and full of the nominal linewidth:
          const lineWidth = this.lineWidth * ((1 / (boxIndex + 1)) + 1.0) / 2.0;

          // Draw a box:
          ctx.globalAlpha = opacities[boxIndex];

          // Black outline:
          ctx.lineWidth = lineWidth * this.outlineFactor;
          ctx.strokeStyle = 'black';
          ctx.lineCap = 'square';
          this.drawBox(ctx, ulx, uly, llx, lly, lrx, lry, urx, ury, boxHasPointers, pulx, puly, pllx, plly, plrx, plry, purx, pury);

          // Colored lines outline:
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = this.cssColors[colors[boxIndex]];
          this.drawBox(ctx, ulx, uly, llx, lly, lrx, lry, urx, ury, boxHasPointers, pulx, puly, pllx, plly, plrx, plry, purx, pury);
        }
      }
    }
  }

  /**
   * Draw a box with the raw data provided.
   * @param ctx context
   * @param ulx upper left x on the screen
   * @param uly upper left y on the screen
   * @param llx lower left x on the screen
   * @param lly lower left y on the screen
   * @param lrx lower right x on the screen
   * @param lry lower right y on the screen
   * @param urx upper right x on the screen
   * @param ury upper right y on the screen
   * @param hasPointers float 64 array with pointer corners
   * @param pulx upper left pointer x on the screen
   * @param puly upper left pointer y on the screen
   * @param pllx lower left pointer x on the screen
   * @param plly lower left pointer y on the screen
   * @param plrx lower right pointer x on the screen
   * @param plry lower right pointer y on the screen
   * @param purx upper right pointer x on the screen
   * @param pury upper right pointer y on the screen
   */
  private drawBox(ctx: CanvasRenderingContext2D,
    ulx: number, uly: number, llx: number, lly: number, lrx: number, lry: number, urx: number, ury: number,
    hasPointers: boolean,
    pulx: number, puly: number, pllx: number, plly: number, plrx: number, plry: number, purx: number, pury: number): void {
    ctx.beginPath();
    // Draw the rectangle of the box:
    ctx.moveTo(ulx, uly);
    ctx.lineTo(llx, lly);
    ctx.lineTo(lrx, lry);
    ctx.lineTo(urx, ury);
    ctx.lineTo(ulx, uly);

    // Draw the pointers of the box if required:
    if (hasPointers) {
      ctx.moveTo(pulx, puly);
      ctx.lineTo(ulx, uly);
      ctx.moveTo(pllx, plly);
      ctx.lineTo(llx, lly);
      ctx.moveTo(plrx, plry);
      ctx.lineTo(lrx, lry);
      ctx.moveTo(purx, pury);
      ctx.lineTo(urx, ury);
    }
    ctx.stroke();
  }

  /**
   * Translate the normalized x to screen x.
   * @param normalizedX Normalized (as rendered) x
   * @returns the screen x coordinate.
   */
  private normalizedToScreenX(normalizedX: number): number {
    return (normalizedX + 1.0) * this.halfPathwaysContainerWidth;
  }

  /**
   * Translate the normalized y to screen y.
   * @param normalizedY Normalized (as rendered) y
   * @returns the screen y coordinate.
   */
  private normalizedToScreenY(normalizedY: number): number {
    return -1 * this.halfPathwaysContainerHeight * (normalizedY - 1.0);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='pathways-container' id='pathways-id'>
        <canvas id='pathways-canvas' ref={this.pathwaysBkgCanvas} style={this.canvasStyle} />
      </div>
    );
  }
}
