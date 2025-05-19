import { ChecklistItemTypeDefMap, ChecklistStateProvider } from '@microsoft/msfs-sdk';

/**
 * A provider of WT21 checklist state.
 */
export type WT21ChecklistStateProvider = ChecklistStateProvider<ChecklistItemTypeDefMap, void, void, void, void>;
