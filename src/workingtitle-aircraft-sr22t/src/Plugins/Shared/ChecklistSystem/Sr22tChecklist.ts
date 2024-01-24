import { ReadonlySubEvent, SubEvent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { ChecklistItemChangedEvent } from './Sr22tChecklistEvents';
import {
  Sr22tAbnormalChecklistNames, Sr22tChecklistIdentificationNames,
  Sr22tEmergencyChecklistNames, Sr22tNormalChecklistNames,
} from './Checklists';

/** The possible item types to focus on the softkey menu  */
export enum Sr22tChecklistPageFocusableItemType {
  CheckboxChecked,
  CheckboxUnchecked,
  Text,
  NextChecklist,
  SelectionList,
}

/** The possible Sr22t checklist categories, in the order they appear in the aircraft */
export enum Sr22tChecklistCategory {
  Emergency = 'Emergency Procedures',
  Abnormal = 'Abnormal Procedures',
  Normal = 'Normal Procedures',
  ChecklistIdentification = 'Checklist Identification',
  // CrewAlerting = 'Crew Alerting System Annunciations',
  // PerformanceData = 'Performance Data',
}

/** The possible Sr22t checklist names */
export type Sr22tChecklistNames =
  Sr22tAbnormalChecklistNames |
  Sr22tChecklistIdentificationNames |
  Sr22tEmergencyChecklistNames |
  Sr22tNormalChecklistNames;
  // Sr22tCrewAlertingChecklistNames |
  // Sr22tPerformanceDataChecklistNames;

/** The possible Sr22t checklist item types */
export enum Sr22tChecklistItemType {
  Section = 'section',
  Checkbox = 'checkbox',
  Text = 'text',
}

/** The possible states of an Sr22t checklist item */
export enum Sr22tChecklistItemState {
  Incomplete = 'Incomplete',
  Completed = 'Completed',
  NotApplicable = 'NotApplicable',
}

/** A checklist item that is readonly. */
export type Sr22tChecklistItemReadonly = Sr22tChecklistItem & {
  /** Readonly state. */
  readonly state: Subscribable<Sr22tChecklistItemState>;
}

/** Readonly checklist, with all items readonly. */
export type Sr22tChecklistReadonly = Pick<Sr22tChecklist, 'isComplete'| 'anyItemChanged' | 'name' | 'category' | 'isLastChecklist'> & {
  /** readonly items. */
  readonly items: readonly Sr22tChecklistItem[];
}

/** SR22T Checklist */
export class Sr22tChecklist {
  public readonly items: Sr22tChecklistItem[];

  private readonly _isComplete = Subject.create(false);
  public readonly isComplete = this._isComplete as Subscribable<boolean>;
  private readonly _anyItemChanged = new SubEvent<this, Omit<ChecklistItemChangedEvent, 'type' | 'mfdIndex'>>();
  public readonly anyItemChanged = this._anyItemChanged as ReadonlySubEvent<this, Omit<ChecklistItemChangedEvent, 'type' | 'mfdIndex'>>;

  /**
   * Creates a new instance of an SR22T Checklist
   * @param name The name of the checklist
   * @param category The category of the checklist
   * @param itemData The list of checklist items
   * @param isLastChecklist Whether this is the last checklist in the category
   */
  public constructor(
    public readonly name: Sr22tChecklistNames,
    public readonly category: Sr22tChecklistCategory,
    itemData: Array<Sr22tChecklistItemData>,
    public readonly isLastChecklist = false
  ) {
    this.items = itemData.map(data => {
      return new Sr22tChecklistItem(
        data.type,
        data.type === Sr22tChecklistItemType.Checkbox || data.type === Sr22tChecklistItemType.Section ? data.title : undefined,
        data.type === Sr22tChecklistItemType.Checkbox ? data.action : undefined,
        data.type === Sr22tChecklistItemType.Text ? data.text : undefined,
        data.type === Sr22tChecklistItemType.Checkbox ? data.level : undefined,
        data.extendedMarginBelow
      );
    });

    this.items.forEach((v, i) => {
      v.state.sub(this.handleItemsStateChange(i));
    });
  }

  private readonly handleItemsStateChange = (itemIndex: number) => (itemState: Sr22tChecklistItemState): void => {
    const everyItemIsCompleted = this.items.every((v) => {
      return v.state.get() !== Sr22tChecklistItemState.Incomplete;
    });
    this._isComplete.set(everyItemIsCompleted);

    this._anyItemChanged.notify(this, {
      checklistName: this.name,
      itemIndex,
      itemState,
    });
  };

}

/** An Sr22t checklist item */
export class Sr22tChecklistItem {
  public readonly state = Subject.create(this.type === Sr22tChecklistItemType.Checkbox ? Sr22tChecklistItemState.Incomplete : Sr22tChecklistItemState.NotApplicable);

  /**
   * Creates a new Sr22tChecklistItem
   * @param type The type of the checklist item
   * @param title The name of the checklist item (may be undefined)
   * @param action The task description (may be undefined or null)
   * @param textNode (optional) A VNode containing the text for text nodes
   * @param level The level of the checklist item (only required for checkboxes)
   * @param extendedMarginBelow Whether the margin below this item should be extended when rendered
   */
  public constructor(
    public readonly type: Sr22tChecklistItemType,
    public readonly title: string | undefined,
    public readonly action: string | undefined | null,
    public readonly textNode: (() => VNode) | undefined,
    public readonly level?: number,
    public readonly extendedMarginBelow?: boolean,
  ) {
    // check for validity of properties for the different types
    if (!title && (
        type === Sr22tChecklistItemType.Checkbox ||
        type === Sr22tChecklistItemType.Section
    )) {
      throw new Error('Title must be defined for Checkbox and Section type items');
    }
    if (!textNode && type === Sr22tChecklistItemType.Text) {
      throw new Error('Text VNode must be defined for Text type items');
    }
    // if there are other, non-relevant fields defined for the item, they will be ignored on render
  }
}

/** An interface describing an SR22T Checklist Checkbox Item */
export interface Sr22tChecklistCheckboxItemData {
  /** The type of checklist item */
  type: Sr22tChecklistItemType.Checkbox
  /**
   * The title of the checklist item.
   * Add \n to the place of the first line break to apply proper formatting.
   */
  title: string;
  /**
   * The action to perform when the checkbox is checked (optional)
   * Add \n to the place of the first line break to apply proper formatting.
   */
  action?: string | null;
  /** The level of the checklist item (optional, defaults to 1) */
  level?: number;
  /** Whether or not to add an extended margin below the checklist item */
  extendedMarginBelow?: boolean;
}

/** An interface describing an SR22T Checklist Section Item */
export interface Sr22tChecklistSectionItemData {
  /** The type of checklist item */
  type: Sr22tChecklistItemType.Section
  /**
   * The title of the checklist item.
   */
  title: string;
}

/** An interface describing an SR22T Checklist Text Item */
export interface Sr22tChecklistTextItemData {
  /** The type of checklist item */
  type: Sr22tChecklistItemType.Text
  /** The text VNode of the checklist item (only required for Text items) */
  text: () => VNode;
}

/** An interface describing an SR22T Checklist Item */
export type Sr22tChecklistItemData = (Sr22tChecklistCheckboxItemData | Sr22tChecklistSectionItemData | Sr22tChecklistTextItemData) & {
  /** Whether or not to add an extended margin below the checklist item */
  extendedMarginBelow?: boolean;
}
