import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the SpeedBug component.
 */
export interface SpeedBugProps extends ComponentProps {
  /** The default speed the range is set to */
  defaultSpeed?: number;
}

/**
 * The SpeedBug component.
 */
export abstract class SpeedBug<T extends SpeedBugProps = SpeedBugProps> extends DisplayComponent<T> {
  /** This manages the bug's visibility based on isVisible and if its visible on the tape currently. */
  private readonly renderVisibility = Subject.create(false);

  protected readonly bugSpeed = Subject.create(this.props.defaultSpeed ? this.props.defaultSpeed : 100);
  protected readonly isVisible = Subject.create(false);
  protected readonly isModified = Subject.create(false);

  protected readonly bugContainerRef = FSComponent.createRef<HTMLDivElement>();

  private pixelPerTick = 0.405;

  /**
   * Sets the speed where the bug should be displayed on the airspeed tape.
   * @param speed The bug speed.
   */
  public setBugSpeed(speed: number): void {
    this.bugSpeed.set(speed);
  }

  /**
   * Sets this bug's visibility.
   * @param visible The bug visibility.
   */
  public setIsVisible(visible: boolean): void {
    this.isVisible.set(visible);
  }

  /**
   * Sets a value indicating if this bug was modified.
   * @param modified The modified value.
   */
  public setIsModified(modified: boolean): void {
    this.isModified.set(modified);
  }

  /**
   * A method called to update the location of a bug on the tape.
   * @param ias The current indicated air speed.
   */
  public updateBug(ias: number): void {
    const deltaBug = ias >= 40 ? this.bugSpeed.get() - ias : this.bugSpeed.get() - 40;
    if (this.isVisible.get() && this.bugSpeed.get() >= 40 && this.bugSpeed.get() <= 499 && Math.abs(deltaBug) < 50) {
      this.bugContainerRef.instance.style.transform = `translate3d(0,${-this.pixelPerTick * deltaBug * 10}px,0)`;
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
      this.bugContainerRef.instance.classList.toggle('hidden', !v);
    });

    this.isModified.sub((v: boolean) => {
      this.bugContainerRef.instance.classList.toggle('modified', v);
    });
  }

  /** @inheritdoc */
  abstract render(): VNode;

}