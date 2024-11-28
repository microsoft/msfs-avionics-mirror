import { MfdPage } from './MfdPage';

/**
 * Size modes for MFD pages.
 */
export enum MfdPageSizeMode {
  Full = 'Full',
  Half = 'Half'
}

/**
 * An entry describing a rendered MFD page.
 */
export type MfdPageEntry<T extends MfdPage = MfdPage> = {
  /** The key of the page. */
  readonly key: string;

  /** A reference to the page. */
  readonly page: T;
}