/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/core/vcockpit" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import { AvionicsConfig, WTG3000BaseInstrument } from '@microsoft/msfs-wtg3000-common';

import { PfdConfig } from './Config/PfdConfig';
import { WTG3000PfdInstrument } from './WTG3000PfdInstrument';

/**
 * A G3000/5000 PFD BaseInstrument.
 */
class WTG3000_PFD extends WTG3000BaseInstrument<WTG3000PfdInstrument> {
  /** @inheritdoc */
  public get isInteractive(): boolean {
    return false;
  }

  /** @inheritdoc  */
  public constructInstrument(): WTG3000PfdInstrument {
    return new WTG3000PfdInstrument(this, new AvionicsConfig(this, this.xmlConfig), new PfdConfig(this.xmlConfig, this.instrumentXmlConfig));
  }

  /** @inheritdoc */
  get templateID(): string {
    return 'WTG3000_PFD';
  }
}

registerInstrument('wtg3000-pfd', WTG3000_PFD);