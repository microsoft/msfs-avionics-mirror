import { ChecklistStateProvider } from '@microsoft/msfs-sdk';

import { GarminChecklistItemTypeDefMap } from '@microsoft/msfs-garminsdk';

import { G3000ChecklistGroupMetadata, G3000ChecklistMetadata } from './G3000ChecklistDefinition';

/**
 * A provider of G3000 checklist state.
 */
export type G3000ChecklistStateProvider = ChecklistStateProvider<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>;
