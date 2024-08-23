import { AbstractFmcPage, DisplayField, EventBus, FmcRenderCallback, FmcRenderTemplate, Formatter, MappedSubject } from '@microsoft/msfs-sdk';

import { WT21Fms } from './FlightPlan/WT21Fms';
import { WT21_FMC_Instrument } from './WT21_FMC_Instrument';
import { WT21FmcScreen } from './WT21FmcScreen';

/**
 * WT21 FMC page
 */
export class WT21FmcPage<T extends object | null = null> extends AbstractFmcPage<T> {
  /**
   * Ctor
   *
   * @param bus the event bus
   * @param screen the FMC screen instance
   * @param props the props to create the page with
   * @param fms the fms to use
   * @param baseInstrument the base FMC instrument
   * @param renderCallback the render callback
   */
  constructor(
    public readonly bus: EventBus,
    public readonly screen: WT21FmcScreen,
    props: T,
    public readonly fms: WT21Fms,
    /** @deprecated */
    public readonly baseInstrument: WT21_FMC_Instrument, // TODO we should really not have this here
    public readonly renderCallback: FmcRenderCallback,
  ) {
    super(bus, screen, props);

    this.fms = fms;
  }

  protected readonly PagingFormat: Formatter<readonly [number, number]> = {
    nullValueString: '',

    /** @inheritDoc */
    format(value: readonly [number, number]): string {
      return `${value[0]}/${value[1]}[s-text] `;
    },
  };

  public readonly PagingIndicator = new DisplayField(this, {
    formatter: this.PagingFormat,
  }).bind(MappedSubject.create(this.screen.currentSubpageIndex, this.screen.currentSubpageCount));

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [];
  }
}
