import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the VSpeedValue component.
 */
interface VSpeedValueProps extends ComponentProps {
  /** The V speed name */
  name: string;
}

/**
 * The VSpeedValue component.
 */
export abstract class VSpeedValue<T extends VSpeedValueProps = VSpeedValueProps> extends DisplayComponent<T> {

  protected readonly speed = ComputedSubject.create<number, string>(100, (v: number) => {
    return v.toFixed(0);
  });
  protected readonly isVisible = Subject.create(false);
  protected readonly isModified = Subject.create(false);

  protected readonly valueContainerRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * Sets the speed this V speed value should display.
   * @param speed The bug speed.
   */
  public setVSpeed(speed: number): void {
    this.speed.set(speed);
  }

  /**
   * Sets this V speed's visibility.
   * @param visible The bug visibility.
   */
  public setIsVisible(visible: boolean): void {
    this.isVisible.set(visible);
  }

  /**
   * Sets a value indicating if this value was modified.
   * @param modified The modified value.
   */
  public setIsModified(modified: boolean): void {
    this.isModified.set(modified);
  }

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    this.isVisible.sub((v: boolean) => {
      this.valueContainerRef.instance.classList.toggle('hidden', !v);
    });

    this.isModified.sub((v: boolean) => {
      this.valueContainerRef.instance.classList.toggle('modified', v);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="vspeed-value hidden" ref={this.valueContainerRef}>
        <span>V</span>
        <span class="name">{this.props.name}</span>
        <span class="value">{this.speed}</span>
      </div>
    );
  }
}