import { FsBaseInstrument } from '@microsoft/msfs-sdk';
import { WTG3000FsInstrument } from './WTG3000FsInstrument';

/**
 * A G3000 BaseInstrument.
 */
export abstract class WTG3000BaseInstrument<T extends WTG3000FsInstrument> extends FsBaseInstrument<T> {
  /**
   * Sets this instrument's checklist highlight layer element.
   * @param element The checklist highlight layer element.
   */
  public setHighlightElement(element: HTMLElement): void {
    this.highlightSvg = element;
  }

  /** @inheritdoc */
  public onPowerOn(): void {
    super.onPowerOn();

    this.fsInstrument.onPowerOn();
  }

  /** @inheritdoc */
  public onShutDown(): void {
    super.onShutDown();

    this.fsInstrument.onPowerOff();
  }
}