import { AnnunciationType, ChecklistSetDef, ChecklistItemTypeDefMap } from '@microsoft/msfs-sdk';

/**
 * Metadata for a set of Epic2 checklists.
 */
export type Epic2ChecklistMetadata = void

/**
 * Metadata for Epic2 checklist groups.
 */
export type Epic2ChecklistGroupMetadata = void;

/**
 * Metadata for Epic2 checklist lists
 */
export interface Epic2ChecklistListMetadata {
  /** An array of the names of linked CAS messages */
  casMessages: string[]

  /** The severity of the active CAS message */
  casSeverity?: AnnunciationType
}

/**
 * A definition for a set of Epic2 checklists.
 */
export type Epic2ChecklistDef = ChecklistSetDef<ChecklistItemTypeDefMap, Epic2ChecklistMetadata, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata>
