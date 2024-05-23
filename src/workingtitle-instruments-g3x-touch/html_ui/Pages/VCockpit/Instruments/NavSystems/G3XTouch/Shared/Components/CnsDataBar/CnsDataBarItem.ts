import { DynamicListData } from '@microsoft/msfs-garminsdk';

/**
 * Types of CNS data bar items.
 */
export enum CnsDataBarItemType {
  Split = 'split',
  Com = 'com',
  Nav = 'nav',
  NavMinimized = 'nav-minimized',
  ComMinimized = 'com-minimized',
  Xpdr = 'xpdr',
  Audio = 'audio',
  AudioMinimized = 'audio-minimized',
  AudioOnly = 'audio-only',
  Timer = 'timer',
}

/**
 * A definition describing a CNS data bar simple item.
 */
export type CnsDataBarSimpleItemDef = {
  /** The type of the item. */
  type: CnsDataBarItemType.Split
  | CnsDataBarItemType.Xpdr
  | CnsDataBarItemType.Timer;
};

/**
 * A definition describing a CNS data bar radio item.
 */
type CnsDataBarRadioItemDef = {
  /** The index of the item's associated radio. */
  index: 1 | 2;
};

/**
 * A definition describing a CNS data bar COM radio item.
 */
export type CnsDataBarComRadioItemDef = CnsDataBarRadioItemDef & {
  /** The type of the item. */
  type: CnsDataBarItemType.Com | CnsDataBarItemType.ComMinimized;
};

/**
 * A definition describing a CNS data bar NAV radio item.
 */
export type CnsDataBarNavRadioItemDef = CnsDataBarRadioItemDef & {
  /** The type of the item. */
  type: CnsDataBarItemType.Nav | CnsDataBarItemType.NavMinimized;
};

/**
 * A definition describing a CNS data bar audio item.
 */
export type CnsDataBarAudioItemDef = {
  /** The type of the item. */
  type: CnsDataBarItemType.Audio | CnsDataBarItemType.AudioOnly | CnsDataBarItemType.AudioMinimized;
  /** The shape of selection indicator. */
  shape: 'square' | 'triangle';
}

/**
 * A definition describing a CNS data bar item.
 */
export type CnsDataBarItemDef = CnsDataBarSimpleItemDef | CnsDataBarComRadioItemDef | CnsDataBarNavRadioItemDef | CnsDataBarAudioItemDef;

/**
 * A dynamic list data object describing a rendered CNS data bar item.
 */
export type CnsDataBarItemData<T extends CnsDataBarItemDef = CnsDataBarItemDef> = DynamicListData & T & {
  /** The width of the item, in pixels. */
  width: number;
};