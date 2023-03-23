import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the SpeedRange component.
 */
interface SpeedRangeProps extends ComponentProps {
  /** A boolean specifiying whether the range should enter the speedtape from the top */
  fromTop: boolean;

  /** The default speed the range is set to */
  defaultSpeed: number;

  /** A css class that can be set on the speed range */
  cssClass: string;
}

/**
 * The SpeedRange component.
 */
export abstract class SpeedRange<T extends SpeedRangeProps = SpeedRangeProps> extends DisplayComponent<T> {
  /** This manages the bug's visibility based on isVisible and if its visible on the tape currently. */
  private readonly renderVisibility = Subject.create(false);

  protected readonly rangeSpeed = Subject.create(this.props.defaultSpeed);
  protected readonly isVisible = Subject.create(false);
  protected readonly isEmphasized = Subject.create(false);

  protected readonly rangeRef = FSComponent.createRef<HTMLDivElement>();

  private pixelPerTick = 0.405;
  private speedTapeHeight = 1984;
  // private speedTapeHeight = 324;

  /**
   * Sets the speed where the range should be displayed on the airspeed tape.
   * @param speed The range speed.
   */
  public setRangeSpeed(speed: number): void {
    this.rangeSpeed.set(speed);
  }

  /**
   * Sets this range's visibility.
   * @param visible The range visibility.
   */
  public setIsVisible(visible: boolean): void {
    this.isVisible.set(visible);
  }

  /**
   * Sets a value indicating if this speedrange is in emphasized display mode.
   * @param emphasized The value which is true when the range is emphasized.
   */
  public setisEmphasized(emphasized: boolean): void {
    this.isEmphasized.set(emphasized);
  }

  /**
   * A method called to update the location of a range on the tape.
   * @param ias The current indicated air speed.
   */
  public updateRange(ias: number): void {
    const rangeOffset = this.props.fromTop ? this.speedTapeHeight : 0;
    const deltaBug = ias >= 40 ? this.rangeSpeed.get() - ias : this.rangeSpeed.get() - 40;
    // const deltaBug = ias >= 40 ? NavMath.clamp(this.rangeSpeed.get() - ias, -40, 40) : this.rangeSpeed.get() - 40;
    if (this.isVisible.get()) {
      // if (this.isVisible.get() && ((deltaBug <= 40 && this.props.fromTop) || (deltaBug >= -40 && !this.props.fromTop))) {
      this.rangeRef.instance.style.transform = `translate3d(0,${-this.pixelPerTick * deltaBug * 10 - rangeOffset}px,0)`;
      this.renderVisibility.set(true);
    } else {
      this.renderVisibility.set(false);
    }
  }

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.renderVisibility.sub((v: boolean) => {
      this.rangeRef.instance.classList.toggle('hidden', !v);
    });

    this.isEmphasized.sub((v: boolean) => {
      this.rangeRef.instance.classList.toggle('emphasized', v);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={'speedrange hidden ' + this.props.cssClass} ref={this.rangeRef}></div>
    );
  }

}