import { Sr22tChecklistCategory, Sr22tChecklistItemState, Sr22tChecklistNames } from './Sr22tChecklist';

/** Active checklist changed Event. */
export interface ActiveChecklistChangedEvent {
  /** The event type. */
  readonly type: 'active_checklist_changed';
  /** New active checklist. */
  readonly newActiveChecklistName: Sr22tChecklistNames;
}

/** Checklist reset event. */
export interface ChecklistResetEvent {
  /** The event type. */
  readonly type: 'checklist_reset';
  /** Name of the checklist that was reset. */
  readonly checklistName: Sr22tChecklistNames;
}

/** Checklist item changed event. */
export interface ChecklistItemChangedEvent {
  /** The event type. */
  readonly type: 'item_changed';
  /** The name of the checklist containing the changed item. */
  readonly checklistName: Sr22tChecklistNames;
  /** The index of the checklist item. */
  readonly itemIndex: number;
  /** The state of the checklist item. */
  readonly itemState: Sr22tChecklistItemState;
}

/** Next checklist in category event. */
export interface NextChecklistInCategory {
  /** The event type. */
  readonly type: 'next_checklist';
  /** The name of the current checklist. */
  readonly checklistName: Sr22tChecklistNames;
  /** The category of the current checklist. */
  readonly category: Sr22tChecklistCategory;
}

/** Sr22t checklist event. */
type Sr22tChecklistEvent = ActiveChecklistChangedEvent | ChecklistResetEvent | ChecklistItemChangedEvent | NextChecklistInCategory;

/** Interface of the Sr22t checklist events. */
export interface Sr22tChecklistEvents {
  /** Sr22t checklist event. */
  readonly sr22t_checklist_event: Sr22tChecklistEvent;
}