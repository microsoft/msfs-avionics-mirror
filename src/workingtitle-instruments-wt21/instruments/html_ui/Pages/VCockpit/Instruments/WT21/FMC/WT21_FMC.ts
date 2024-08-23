/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/core/vcockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/coherent/facilities" />

import { FsBaseInstrument } from '@microsoft/msfs-sdk';

import { WT21_FMC_Instrument } from './WT21_FMC_Instrument';

/**
 * The WT21_FMC Baseinstrument
 */
class WT21_FMC extends FsBaseInstrument<WT21_FMC_Instrument> {
  /** @inheritdoc */
  constructInstrument(): WT21_FMC_Instrument {
    this.electricity.classList.toggle('hidden', true);
    return new WT21_FMC_Instrument(this);
  }

  /** @inheritdoc */
  get templateID(): string {
    return 'WT21_FMC';
  }

  /** @inheritdoc */
  public get isInteractive(): boolean {
    return true;
  }

  /** @inheritdoc */
  public onPowerOn(): void {
    super.onPowerOn();
    this.electricity.classList.toggle('hidden', false);
  }

  /** @inheritdoc */
  public onShutDown(): void {
    super.onShutDown();
    this.electricity.classList.toggle('hidden', true);
  }
}

registerInstrument('wt21-fmc', WT21_FMC);
