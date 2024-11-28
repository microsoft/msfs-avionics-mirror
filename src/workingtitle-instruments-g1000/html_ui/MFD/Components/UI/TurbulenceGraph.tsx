import { ClockEvents, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { MFDUiPage, MFDUiPageProps } from './MFDUiPage';

/**
 * Props on the TurbulenceGraph component.
 */
interface TurbulenceGraphProps extends MFDUiPageProps {
  /** An instance of the EventBus. */
  bus: EventBus;
}

/**
 * A graph of turbulence.
 */
export class TurbulenceGraph extends MFDUiPage<TurbulenceGraphProps> {

  private readonly canvas = FSComponent.createRef<HTMLCanvasElement>();
  private readonly samples: number[] = [];

  private average = Subject.create(0);
  private max = Subject.create(0);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.props.bus.getSubscriber<ClockEvents>().on('realTime').handle(() => {
      const acceleration = SimVar.GetSimVarValue('ACCELERATION BODY Y', 'meters per second squared') / 9.6;
      if (this.samples.length > 60) {
        this.samples.shift();
      }

      this.samples.push(acceleration);
      if (this.max.get() < Math.abs(acceleration)) {
        this.max.set(Math.abs(acceleration));
      }

      this.average.set(this.samples.reduce((prev, curr) => prev + Math.abs(curr)) / this.samples.length);
      this.draw();
    });
  }

  /**
   * Draws the graph.
   */
  private draw(): void {
    const context = this.canvas.instance.getContext('2d');
    if (context) {
      const width = context.canvas.width;
      const height = context.canvas.height;

      context.clearRect(0, 0, width, height);
      context.beginPath();

      this.drawScaleLine(context, 0.05);
      this.drawScaleLine(context, 0.2);
      this.drawScaleLine(context, 0.5);
      this.drawScaleLine(context, 1.5);
      context.stroke();

      context.beginPath();
      context.strokeStyle = 'white';

      for (let i = 0; i < this.samples.length; i++) {
        const sample = Math.abs(this.samples[i]);
        const x = i * (width / 60);
        const y = height - ((sample / 2) * height);

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
    }

  }

  /**
   * Draws a scale line.
   * @param context The context.
   * @param accel The acceleration.
   */
  private drawScaleLine(context: CanvasRenderingContext2D, accel: number): void {
    context.strokeStyle = 'red';
    context.lineWidth = 1;

    context.moveTo(0, context.canvas.height - ((accel / 2) * context.canvas.height));
    context.lineTo(context.canvas.width, context.canvas.height - ((accel / 2) * context.canvas.height));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-page' ref={this.viewContainerRef}>
        <div class='mfd-dark-background wide'>
          <div>---</div>
          <div>Avg: <span>{this.average}</span></div>
          <div>Max: <span>{this.max}</span></div>
          <canvas width='436' height='436' ref={this.canvas} />
        </div>
      </div>
    );
  }
}