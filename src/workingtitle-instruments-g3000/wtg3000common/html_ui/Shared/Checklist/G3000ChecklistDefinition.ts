import { GarminChecklistSetDef } from '@microsoft/msfs-garminsdk';

/**
 * Metadata for a set of G3000 checklists.
 */
export interface G3000ChecklistMetadata {
  /**
   * The index of the default checklist group. The default group is the group that is automatically selected when
   * opening the checklist pane for the first time after a system power cycle.
   */
  readonly defaultGroupIndex: number;

  /**
   * The index of the default checklist within its group. The default checklist is the checklist that is automatically
   * selected when opening the checklist pane for the first time after a system power cycle.
   */
  readonly defaultListIndex: number;
}

/**
 * Metadata for G3000 checklist groups.
 */
export interface G3000ChecklistGroupMetadata {
  /**
   * The tab label text to display for the checklist group in the GTC checklist page.
   */
  readonly tabLabel: string;
}

/**
 * A definition for a set of G3000 checklists.
 */
export type G3000ChecklistSetDef = GarminChecklistSetDef<G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>
