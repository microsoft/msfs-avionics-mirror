import {
  ChecklistSetDef, ChecklistActionableItemDef, ChecklistItem, ChecklistItemDef, type ChecklistItemType,
  ChecklistItemTypeMap, ChecklistNoteItemDef, ChecklistTitleItemDef,
  ChecklistBranchItemDef,
  ChecklistLinkItemDef
} from '@microsoft/msfs-sdk';

/**
 * A definition for a set of Garmin checklists.
 * @template S The metadata attached to the checklist set.
 * @template G The metadata attached to the checklist groups contained in the definition.
 * @template L The metadata attached to the checklist lists contained in the definition.
 * @template B The metadata attached to the checklist branches contained in the definition.
 */
export type GarminChecklistSetDef<S = unknown, G = unknown, L = unknown, B = unknown> = ChecklistSetDef<GarminChecklistItemTypeDefMap, S, G, L, B>

/**
 * Garmin checklist item text colors.
 */
export enum GarminChecklistItemTextColor {
  White = 'White',
  Silver = 'Silver',
  Gray = 'Gray',
  Navy = 'Navy',
  Cyan = 'Cyan',
  Lime = 'Lime',
  Green = 'Green',
  Yellow = 'Yellow',
  Olive = 'Olive',
  Red = 'Red',
  Maroon = 'Maroon',
  Magenta = 'Magenta',
}

/**
 * A definition for a Garmin actionable checklist item.
 */
export type GarminChecklistActionableItemDef = ChecklistActionableItemDef & {
  /** The indentation level of the item. */
  readonly indent: 1 | 2 | 3 | 4;

  /** The item's text color. */
  readonly textColor: GarminChecklistItemTextColor;
};

/**
 * A definition for a Garmin note checklist item.
 */
export type GarminChecklistBranchItemDef = ChecklistBranchItemDef & {
  /** The unique ID of the item. */
  readonly uid?: string;

  /** Whether to omit the checkbox when rendering the item. */
  readonly omitCheckbox: boolean;

  /** The indentation level of the item. */
  readonly indent: 0 | 1 | 2 | 3 | 4;

  /** The item's text color. */
  readonly textColor: GarminChecklistItemTextColor;
};

/**
 *
 */
export enum GarminChecklistLinkItemType {
  Normal = 'Normal',
  BranchItem = 'BranchItem'
}

/**
 * A definition for a normal Garmin link checklist item.
 */
export type GarminChecklistNormalLinkItemDef = ChecklistLinkItemDef & {
  /** The link type of the item. */
  readonly linkType: GarminChecklistLinkItemType.Normal;

  /** The indentation level of the item. */
  readonly indent: 0 | 1 | 2 | 3 | 4;

  /** The item's text color. */
  readonly textColor: GarminChecklistItemTextColor;

  /** The item's text justification. */
  readonly justify: 'left' | 'center' | 'right';
};

/**
 * A definition for a Garmin link checklist item that targets a branch linked to a branch item.
 */
export type GarminChecklistBranchItemLinkItemDef = ChecklistLinkItemDef & {
  /** The link type of the item. */
  readonly linkType: GarminChecklistLinkItemType.BranchItem;

  /** The unique ID of the item's parent branch item. */
  readonly branchItem: string;

  /** The index of the item's target branch in the parent branch item's branch array. */
  readonly linkIndex: number;
};

/**
 * A definition for a Garmin link checklist item.
 */
export type GarminChecklistLinkItemDef = GarminChecklistNormalLinkItemDef | GarminChecklistBranchItemLinkItemDef;

/**
 * A definition for a Garmin note checklist item.
 */
export type GarminChecklistNoteItemDef = ChecklistNoteItemDef & {
  /** The indentation level of the item. */
  readonly indent: 0 | 1 | 2 | 3 | 4;

  /** The item's text color. */
  readonly textColor: GarminChecklistItemTextColor;

  /** The item's text justification. */
  readonly justify: 'left' | 'center' | 'right';
};

/**
 * A definition for a Garmin title checklist item.
 */
export type GarminChecklistTitleItemDef = ChecklistTitleItemDef & {
  /** The indentation level of the item. */
  readonly indent: 0 | 1 | 2 | 3 | 4;

  /** The item's text color. */
  readonly textColor: GarminChecklistItemTextColor;
};

/**
 * A definition for a Garmin spacer checklist item.
 */
export type GarminChecklistSpacerItemDef = {
  /** The type of the item. */
  readonly type: ChecklistItemType.Spacer;

  /** The height of the item, as a multiple of the checklist's line height. */
  readonly height: number;
};

/**
 * A map from checklist item types to Garmin checklist item definitions.
 */
export type GarminChecklistItemTypeDefMap = {
  /** A type definition for an actionable item. */
  [ChecklistItemType.Actionable]: GarminChecklistActionableItemDef;

  /** A type definition for a branch item. */
  [ChecklistItemType.Branch]: GarminChecklistBranchItemDef;

  /** A type definition for a branch item. */
  [ChecklistItemType.Link]: GarminChecklistLinkItemDef;

  /** A type definition for a note item. */
  [ChecklistItemType.Note]: GarminChecklistNoteItemDef;

  /** A type definition for a title item. */
  [ChecklistItemType.Title]: GarminChecklistTitleItemDef;

  /** A type definition for a spacer item. */
  [ChecklistItemType.Spacer]: GarminChecklistSpacerItemDef;
};

/**
 * A map from checklist item type to Garmin checklist items.
 */
export type GarminChecklistItemTypeMap = ChecklistItemTypeMap<GarminChecklistItemTypeDefMap>;

/**
 * A utility type that returns a union type of Garmin checklist item definitions for a given set of checklist item types.
 * @template T The checklist item types to include in the returned union type. Defaults to `ChecklistItemType` (i.e.
 * the union of all checklist item types).
 */
export type GarminChecklistItemDef<T extends ChecklistItemType = ChecklistItemType> = ChecklistItemDef<GarminChecklistItemTypeDefMap, T>;

/**
 * A utility type that returns a union type of Garmin checklist items for a given set of checklist item types.
 * @template T The checklist item types to include in the returned union type. Defaults to `ChecklistItemType` (i.e.
 * the union of all checklist item types).
 */
export type GarminChecklistItem<T extends ChecklistItemType = ChecklistItemType> = ChecklistItem<GarminChecklistItemTypeDefMap, T>;
