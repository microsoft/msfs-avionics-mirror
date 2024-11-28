import { PfdInset } from './PfdInset';

/**
 * Size modes for PFD insets.
 */
export enum PfdInsetSizeMode {
  Full = 'Full',
  NarrowEis = 'NarrowEis',
  WideEis = 'WideEis'
}

/**
 * An entry describing a rendered PFD inset.
 */
export type PfdInsetEntry<T extends PfdInset = PfdInset> = {
  /** The key of the inset. */
  readonly key: string;

  /** A reference to the inset. */
  readonly inset: T;
}