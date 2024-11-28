import { BaseChecklistItemTypeDefMap } from './ChecklistDefinitions';
import { ChecklistSet } from './ChecklistState';

/**
 * A provider of state for a checklist set.
 * @template I A map from checklist item types to checklist item definitions used by the checklists contained in the
 * provider's checklist set. Defaults to `BaseChecklistItemTypeDefMap`.
 * @template S The metadata attached to the provider's checklist set.
 * @template G The metadata attached to the checklist groups contained in the provider's checklist set.
 * @template L The metadata attached to the checklist lists contained in the provider's checklist set.
 * @template B The metadata attached to the checklist branches contained in the provider's checklist set.
 */
export interface ChecklistStateProvider<I extends BaseChecklistItemTypeDefMap = BaseChecklistItemTypeDefMap, S = unknown, G = unknown, L = unknown, B = unknown> {
  /** The index of this provider's checklist set. */
  readonly index: number;

  /** The current checklist state. */
  readonly state: ChecklistSet<I, S, G, L, B>;
}
