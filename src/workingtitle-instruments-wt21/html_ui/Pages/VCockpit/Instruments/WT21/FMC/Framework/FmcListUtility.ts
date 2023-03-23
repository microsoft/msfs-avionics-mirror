import { SubscribableArray } from '@microsoft/msfs-sdk';

import { FmcPrevNextEvent, FmcSelectKeysEvent } from '../FmcEvent';
import { FmcRenderTemplateRow } from '../Framework/FmcRenderer';
import { FmcPage } from './FmcPage';

/**
 * Utility class to drive list
 */
export class FmcListUtility<T> {

  /**
   * FMC List Utility Class
   * @param page                  The Fmc Page
   * @param data                  The row input data (SubscribableArray<T>)
   * @param renderRow             Function to call when the list needs to be re-rendered with new data
   * @param size                  row count of the list per page
   * @param firstPageSize         row count of the first page of the list
   */
  constructor(
    protected readonly page: FmcPage,
    protected readonly data: SubscribableArray<T>,
    protected readonly renderRow: (page: FmcPage, data?: T, nextData?: T) => FmcRenderTemplateRow[],
    protected readonly size = 5,
    protected readonly firstPageSize: number | undefined = undefined
  ) {
  }

  /**
   * Returns a rendered list page for a specified page
   * @param page The page number to render
   * @returns The FmcRenderTemplate
   */
  public renderList(page: number): FmcRenderTemplateRow[] {
    const rows: FmcRenderTemplateRow[] = [];

    let startIndex = (page - 1) * this.size;

    if (this.firstPageSize !== undefined && page > 1) {
      startIndex = this.firstPageSize + ((page - 2) * this.size);
    }

    for (let i = startIndex; i < startIndex + this.size; i++) {
      const data = this.data.tryGet(i);
      const nextData = this.data.tryGet(i + 1);
      const subRows = this.renderRow(this.page, data, nextData);
      subRows.forEach(row => rows.push(row));
    }

    return rows;
  }

  /**
   * Handles when the Select Key is pressed.
   * @param event The Select Key Event.
   * @returns Whether the event was handled by this component.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean> {
    return false;

  }

  /**
   * Handles when the Scroll Key is pressed.
   * @param event The Scroll Key event.
   * @returns Whether the event was handled by this component.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleScrollKey(event: FmcPrevNextEvent): boolean {
    return false;
  }



}