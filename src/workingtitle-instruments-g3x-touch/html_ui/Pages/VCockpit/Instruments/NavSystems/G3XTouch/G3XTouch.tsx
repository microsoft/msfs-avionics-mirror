/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/avionics" />

import { FsBaseInstrument } from '@microsoft/msfs-sdk';

import { G3XTouchFsInstrument } from './Shared/G3XTouchFsInstrument';
import { G3XTouchPrimaryFsInstrument } from './Shared/G3XTouchPrimaryFsInstrument';
import { G3XTouchSecondaryFsInstrument } from './Shared/G3XTouchSecondaryFsInstrument';

import './G3XTouch.css';

/**
 * The base G3X Touch VCockpit instrument.
 */
export class G3XTouch extends FsBaseInstrument<G3XTouchFsInstrument> {

  /** @inheritDoc */
  get templateID(): string {
    return 'G3XTouch';
  }

  /** @inheritDoc */
  public get isInteractive(): boolean {
    return true;
  }

  /** @inheritDoc */
  public constructInstrument(): G3XTouchFsInstrument {
    return this.instrumentIndex === 1
      ? new G3XTouchPrimaryFsInstrument(this)
      : new G3XTouchSecondaryFsInstrument(this);
  }

  /**
   * Sets this instrument's sim assisted checklist highlight layer element.
   * @param element The sim assisted checklist highlight layer element.
   */
  public setHighlightElement(element: HTMLElement): void {
    this.highlightSvg = element;
  }

  /** @inheritDoc */
  public onPowerOn(): void {
    super.onPowerOn();

    this.fsInstrument.onPowerOn();
  }

  /** @inheritDoc */
  public onShutDown(): void {
    super.onShutDown();

    this.fsInstrument.onPowerOff();
  }
}

registerInstrument('wt-g3xtouch', G3XTouch);
