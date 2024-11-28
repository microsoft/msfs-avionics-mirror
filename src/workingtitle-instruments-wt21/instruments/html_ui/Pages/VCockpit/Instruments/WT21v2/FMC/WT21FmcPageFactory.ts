import { EventBus, FmcPageFactory, FmcRenderCallback } from '@microsoft/msfs-sdk';

import { WT21_FMC_Instrument } from './WT21_FMC_Instrument';
import { WT21FmcPage } from './WT21FmcPage';
import { WT21FmcScreen } from './WT21FmcScreen';
import { WT21Fms } from './FlightPlan/WT21Fms';

/**
 * FMC page factory for {@link WT21FmcPage}
 */
export class WT21FmcPageFactory extends FmcPageFactory<WT21FmcPage> {
  /**
   * Ctor
   * @param baseInstrument the FMC base instrument
   * @param fms the FMS
   */
  constructor(
    /** @deprecated */
    private readonly baseInstrument: WT21_FMC_Instrument,
    private readonly fms: WT21Fms,
  ) {
    super();
  }

  /** @inheritDoc */
  createPage<U extends object | null>(pageCtor: typeof WT21FmcPage<U>, bus: EventBus, screen: WT21FmcScreen, props: U, renderCallback: FmcRenderCallback): WT21FmcPage<U> {
    return new pageCtor(bus, screen, props, this.fms, this.baseInstrument, renderCallback);
  }
}
