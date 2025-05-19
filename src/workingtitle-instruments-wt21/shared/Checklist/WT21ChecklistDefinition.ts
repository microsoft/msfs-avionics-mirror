import { ChecklistItemTypeDefMap, ChecklistSetDef } from '@microsoft/msfs-sdk';

/**
 * A definition for a set of WT21 checklists.
 */
export type WT21ChecklistSetDef = ChecklistSetDef<ChecklistItemTypeDefMap, void, void, void, void> & {
  /** The array of checklist preamble lines. */
  preambleLines: string[] | undefined;
};
