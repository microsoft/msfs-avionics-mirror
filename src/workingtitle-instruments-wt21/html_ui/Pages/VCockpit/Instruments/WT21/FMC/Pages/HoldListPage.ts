import { ICAO, LegDefinition, Subject } from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';
import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcComponent, FmcComponentOptions } from '../Framework/Components/FmcComponent';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate, FmcRenderTemplateRow } from '../Framework/FmcRenderer';

/**
 * Options for {@link HoldListEntry} component
 */
interface HoldListEntryOptions extends FmcComponentOptions {
  /**
   * Ident of the hold leg to edit
   */
  legIdent: string,

  /**
   * Plan index of the hold leg to edit
   */
  legPlanIndex: number,
}

/**
 * FMC Component for HOLD LIST entry
 */
class HoldListEntry extends FmcComponent {
  /**
   * Ctor
   *
   * @param page    {@link FmcPage} containing this component
   * @param options options for the component
   */
  constructor(
    page: FmcPage,
    readonly options: HoldListEntryOptions,
  ) {
    super(page, options);
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate | string {
    return `<${this.options.legIdent}`;
  }

  /** @inheritDoc */
  async onHandleSelectKey(): Promise<boolean | string> {
    this.page.setActiveRoute('/fpln-hold', { atLeg: this.options.legPlanIndex });

    return true;
  }
}

/**
 * ACT HOLD LIST page
 */
export class HoldListPage extends FmcPage {

  private readonly FlightPlanHolds = Subject.create<LegDefinition[]>([]);

  /** @inheritDoc */
  init(): void {
    this.addBinding(this.FlightPlanHolds.sub(() => this.invalidate()));
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        ['ACT[blue]', '', 'HOLD LIST[blue]'], // TODO figure out if MOD HOLD LIST is a thing
        [''],
        ...this.renderHoldRows(),
      ]
    ];
  }

  /** @inheritDoc */
  async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean | string> {
    if (event === FmcSelectKeysEvent.RSK_6) {
      this.setActiveRoute('/legs', { isForHoldSelection: true }); // TODO Temporary
      return true;
    }

    return false;
  }

  /**
   * Renders all row for showing holds in flight plan
   *
   * @returns a list of template rows
   */
  private renderHoldRows(): FmcRenderTemplateRow[] {
    const allFlightPLanHolds = WT21FmsUtils.getPlanHolds(this.fms.getPlanForFmcRender());

    const rows: FmcRenderTemplateRow[] = [];

    for (let i = 0; i < Math.min(6, allFlightPLanHolds.length); i++) {
      const hold = allFlightPLanHolds[i];
      const holdPlanIndex = this.fms.getPlanForFmcRender().getLegIndexFromLeg(hold);

      const component = new HoldListEntry(this, {
        legIdent: hold.leg.fixIcao === ICAO.emptyIcao ? 'PPOS' : ICAO.getIdent(hold.leg.fixIcao),
        legPlanIndex: holdPlanIndex
      });

      rows.push([component], ['']);
    }

    while (rows.length < 6 * 2) {
      rows.push(['']);
    }

    rows[10][1] = 'NEW HOLD>';

    return rows;
  }

}
