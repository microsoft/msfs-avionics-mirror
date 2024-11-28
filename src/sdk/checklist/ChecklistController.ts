
import { EventBus, Publisher } from '../data/EventBus';
import { BaseChecklistControlEvents, ChecklistControlEvents } from './ChecklistControlEvents';

/**
 * A controller for a checklist set. The controller provides a convenient interface for publishing the control
 * events defined in `ChecklistControlEvents`.
 */
export class ChecklistController {
  private readonly publisher: Publisher<ChecklistControlEvents>;

  private readonly eventTopicMap: {
    [Topic in keyof Omit<BaseChecklistControlEvents, 'checklist_state_request'>]: `${Topic}_${number}`;
  };

  /**
   * Creates a new instance of ChecklistController.
   * @param index The index of the checklist set on which this controller operates.
   * @param bus The event bus.
   */
  public constructor(public readonly index: number, bus: EventBus) {
    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`ChecklistController: invalid index ${index} (must be a positive integer)`);
    }

    this.eventTopicMap = {
      'checklist_reset_all': `checklist_reset_all_${index}`,
      'checklist_reset_group': `checklist_reset_group_${index}`,
      'checklist_reset_list': `checklist_reset_list_${index}`,
      'checklist_reset_item': `checklist_reset_item_${index}`,
      'checklist_complete_list': `checklist_complete_list_${index}`,
      'checklist_complete_item': `checklist_complete_item_${index}`,
      'checklist_toggle_item': `checklist_toggle_item_${index}`
    };

    this.publisher = bus.getPublisher<ChecklistControlEvents>();
  }

  /**
   * Resets all checklists in the checklist set.
   */
  public resetAll(): void {
    this.publisher.pub(this.eventTopicMap['checklist_reset_all'], undefined, true, false);
  }

  /**
   * Resets all checklists in a single checklist group.
   * @param groupIndex The index of the group to reset.
   */
  public resetGroup(groupIndex: number): void {
    this.publisher.pub(this.eventTopicMap['checklist_reset_group'], groupIndex, true, false);
  }

  /**
   * Resets all actionable items in a single checklist.
   * @param groupIndex The index of the checklist group containing the checklist to reset.
   * @param listIndex The index of the checklist to reset within its group.
   */
  public resetList(groupIndex: number, listIndex: number): void {
    this.publisher.pub(this.eventTopicMap['checklist_reset_list'], [groupIndex, listIndex], true, false);
  }

  /**
   * Completes all actionable items in a single checklist.
   * @param groupIndex The index of the checklist group containing the checklist to complete.
   * @param listIndex The index of the checklist to complete within its group.
   */
  public completeList(groupIndex: number, listIndex: number): void {
    this.publisher.pub(this.eventTopicMap['checklist_complete_list'], [groupIndex, listIndex], true, false);
  }

  /**
   * Toggles whether an actionable item is completed.
   * @param groupIndex The index of the checklist group containing the item to toggle.
   * @param listIndex The index of the checklist containing the item to toggle within its group.
   * @param branchIndex The index of the branch containing the item to toggle within its list, or `-1` if the item is
   * not contained in a branch.
   * @param itemIndex The index of the item to toggle within its checklist.
   * @param force The state to force onto the item. If `true`, then the item will be completed. If `false`, then the
   * item will be reset. If `undefined`, then the item will be toggled to the opposite of its current state.
   */
  public toggleItem(groupIndex: number, listIndex: number, branchIndex: number, itemIndex: number, force?: boolean): void {
    const topic = force === undefined
      ? 'checklist_toggle_item'
      : force === true
        ? 'checklist_complete_item'
        : 'checklist_reset_item';

    this.publisher.pub(this.eventTopicMap[topic], [groupIndex, listIndex, branchIndex, itemIndex], true, false);
  }
}
