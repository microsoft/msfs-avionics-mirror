/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/core/vcockpit" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import { AvionicsConfig, WTG3000BaseInstrument } from '@microsoft/msfs-wtg3000-common';

import { MfdConfig } from './Config';
import { WTG3000MfdInstrument } from './WTG3000MfdInstrument';

/**
 * A G3000 MFD BaseInstrument.
 */
class WTG3000_MFD extends WTG3000BaseInstrument<WTG3000MfdInstrument> {
  /** @inheritdoc */
  public get isInteractive(): boolean {
    return false;
  }

  /** @inheritdoc */
  public constructInstrument(): WTG3000MfdInstrument {
    return new WTG3000MfdInstrument(this, new AvionicsConfig(this, this.xmlConfig), new MfdConfig(this.xmlConfig, this.instrumentXmlConfig));
  }

  /** @inheritdoc */
  get templateID(): string {
    return 'WTG3000_MFD';
  }
}

registerInstrument('wtg3000-mfd', WTG3000_MFD);