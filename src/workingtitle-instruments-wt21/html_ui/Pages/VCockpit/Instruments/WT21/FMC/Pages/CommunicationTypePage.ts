import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate, FmcRenderTemplateRow } from '../Framework/FmcRenderer';
import { FacilityFrequency, FacilityFrequencyType, ICAO } from '@microsoft/msfs-sdk';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { FmcSelectKeysEvent } from '../FmcEvent';
import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';

const NUM_FREQUENCY_ROWS = 10;

/**
 * Page for `<MULTIPLE` links in the FREQUENCY DATA page
 */
export class CommunicationTypePage extends FmcPage {
  private frequencyTable: number[] = [];

  private readonly FrequencyPageLink = PageLinkField.createLink(this, '<FREQUENCY', '/freq');

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    const airportIdent = this.router.params['airportIdent'] as string;
    const frequencies = this.router.params['frequencies'] as FacilityFrequency[];

    const header = WT21FmsUtils.formatFacilityFrequencyType(frequencies[0], 'ILS/LOC');

    const numPages = Math.ceil(frequencies.length / 5);

    const pages = [];

    for (let i = 0; i < numPages; i++) {
      pages.push(
        [
          [`${airportIdent}[blue]`, this.PagingIndicator, `${header}[blue]`],
          ...this.renderFrequencyRows(frequencies, i),
          ['', '', '------------------------[blue]'],
          [this.FrequencyPageLink, ''],
        ],
      );
    }

    return pages;
  }

  /**
   * Renders rows showing the airport frequencies
   *
   * @param frequencies the frequencies
   * @param pageIndex   the page index to render the list for
   *
   * @returns fmc template rows
   */
  private renderFrequencyRows(frequencies: FacilityFrequency[], pageIndex: number): FmcRenderTemplateRow[] {
    const isVisiblePage = pageIndex === this.router.currentSubpageIndex.get() - 1;

    if (isVisiblePage) {
      this.frequencyTable = [];
    }

    const rows: FmcRenderTemplateRow[] = [];

    const start = pageIndex * 5;
    const end = start + 5;

    for (let i = start; i < end && i < frequencies.length && rows.length < NUM_FREQUENCY_ROWS; i++) {
      const frequency = frequencies[i];

      let title = '';
      if (frequency.type === FacilityFrequencyType.None) {
        const runway = frequency.name.match(/.*RW(\d{2}[LRCT]?).*/)?.[1];

        if (runway) {
          const ident = ICAO.getIdent(frequency.icao);

          title = `LOC RW${runway} ${ident}`;
        }
      }

      rows.push(
        [` ${title}[blue]`],
        [frequency.freqMHz.toFixed(3)],
      );

      if (isVisiblePage) {
        this.setLskFrequency(i, frequency.freqMHz);
      }
    }

    for (let i = rows.length; i < NUM_FREQUENCY_ROWS; i++) {
      rows.push(['']);
    }

    return rows;
  }

  /**
   * Sets the frequency for an LSK, given its sequential index from the start of the list on the page and a frequency
   *
   * @param listStartIndex the index
   * @param frequency the frequency
   */
  private setLskFrequency(listStartIndex: number, frequency: number): void {
    const actionTableRow = listStartIndex % 5;

    this.frequencyTable[actionTableRow] = frequency;
  }

  /**
   * Gets a frequency from an LSK event;
   * @param event the LSK event
   * @returns the frequency or `undefined`
   */
  private getLskFrequency(event: FmcSelectKeysEvent): number | undefined {
    const lskSide = Array.from(FmcSelectKeysEvent[event])[0];
    const lskNum = Array.from(FmcSelectKeysEvent[event])[4];

    if (lskSide !== 'L') {
      return undefined;
    }

    const lskNumber = parseInt(lskNum);

    if (Number.isFinite(lskNumber)) {
      const frequencyTableRow = lskNumber - 1;

      if (frequencyTableRow >= 0 && frequencyTableRow <= 4) {
        const frequency = this.frequencyTable[frequencyTableRow];

        return frequency;
      }
    }
    return undefined;
  }

  /** @inheritDoc */
  async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean | string> {
    const frequencyAtLsk = this.getLskFrequency(event);

    if (frequencyAtLsk !== undefined) {
      return frequencyAtLsk.toFixed(3);
    }

    return false;
  }
}