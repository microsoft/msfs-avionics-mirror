/**
 * An FMC line select key
 */
export interface LineSelectKeyEvent {
  /** The LSK row */
  row: number,

  /** The LSK column */
  col: number,

  /** The scratchpad contents at the time of pressing the LSK */
  scratchpadContents: string,

  /** Whether the CLEAR/DELETE key (if applicable) was activated */
  isDelete: boolean,
}

/**
 * Paging events for an FMC screen
 */
export interface FmcPagingEvents<E> {
  /** Page left / previous page */
  pageLeft?: keyof E & string,

  /** Page right / next page */
  pageRight?: keyof E & string,

  /** Page up / slew up */
  pageUp?: keyof E & string,

  /** Page down / slew down */
  pageDown?: keyof E & string,
}