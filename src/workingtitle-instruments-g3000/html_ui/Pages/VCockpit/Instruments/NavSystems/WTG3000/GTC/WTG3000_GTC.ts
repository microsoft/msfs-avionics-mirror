/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/core/vcockpit" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import { AvionicsConfig, WTG3000BaseInstrument } from '@microsoft/msfs-wtg3000-common';

import { GtcConfig } from './Config/GtcConfig';
import { WTG3000GtcInstrument } from './WTG3000GtcInstrument';

/**
 * A G3000/5000 GTC BaseInstrument.
 */
class WTG3000_GTC extends WTG3000BaseInstrument<WTG3000GtcInstrument> {
  /** @inheritdoc */
  public get isInteractive(): boolean {
    return true;
  }

  /** @inheritdoc */
  public constructInstrument(): WTG3000GtcInstrument {
    return new WTG3000GtcInstrument(this, new AvionicsConfig(this, this.xmlConfig), new GtcConfig(this.xmlConfig, this.instrumentXmlConfig));
  }

  /** @inheritdoc */
  get templateID(): string {
    return 'WTG3000_GTC';
  }
}

registerInstrument('wtg3000-gtc', WTG3000_GTC);