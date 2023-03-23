import { ComponentProps, DisplayComponent, FSComponent, SimpleMovingAverage, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the AirspeedTrendVector component.
 */
export type AirspeedTrendVectorProps = ComponentProps

/**
 * The AirspeedTrendVector component.
 */
export class AirspeedTrendVector extends DisplayComponent<AirspeedTrendVectorProps> {
  /** This manages the vector's visibility based on isVisible and if its visible on the tape currently. */
  private readonly renderVisibility = Subject.create(false);
  protected readonly vectorSpeed = Subject.create(0);
  protected readonly isVisible = Subject.create(false);

  protected readonly vectorContainerRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly vectorLine = FSComponent.createRef<SVGElement>();
  protected readonly trendVectorLine = FSComponent.createRef<SVGElement>();
  private readonly trendAverage = new SimpleMovingAverage(10);

  /**
   * Sets the speed where the vector should be displayed on the airspeed tape.
   * @param speed The vector speed.
   */
  public setVectorSpeed(speed: number): void {
    this.vectorSpeed.set(speed);
  }

  /**
   * Sets this vector's visibility.
   * @param visible The vector visibility.
   */
  public setIsVisible(visible: boolean): void {
    this.isVisible.set(visible);
  }

  /**
   * A method called to update the location of a vector on the tape.
   * @param ias The current indicated air speed.
   * @param trend The current 10s trend for the indicated air speed.
   */
  public updateVector(ias: number, trend: number): void {
    const currentTrend = this.trendAverage.getAverage((ias >= 20) ? trend * 4 : 0);
    if (this.isVisible.get() && Math.abs(currentTrend) > 1) {
      const verticalOffset = -129 - Math.max(0, currentTrend);
      const verticalOffsetLine = (-129 - currentTrend);
      this.vectorLine.instance.setAttribute('y', verticalOffset.toString());
      this.vectorLine.instance.setAttribute('height', Math.abs(currentTrend).toString());
      this.trendVectorLine.instance.setAttribute('y', verticalOffsetLine.toString());
      this.renderVisibility.set(true);
    } else {
      this.renderVisibility.set(false);
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.renderVisibility.sub((v: boolean) => {
      this.vectorContainerRef.instance.classList.toggle('hidden', !v);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="airspeed-trend-vector hidden" ref={this.vectorContainerRef}>
        <div style="height: 466px; width: 70px;">
          <svg height="466px" width="70px" viewBox="0 -400 125 800">
            <rect ref={this.vectorLine} x="110" y="-117" width="5" height="0" fill="var(--wt21-colors-magenta)" />
            <rect ref={this.trendVectorLine} x="90" y="-117" width="24" height="4" fill="var(--wt21-colors-magenta)" />
          </svg>
        </div>
      </div>
    );
  }
}