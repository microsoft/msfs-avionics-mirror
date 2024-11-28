import { EventBus, Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { Sr22tAbnormalChecklists, Sr22tChecklistIdentification, Sr22tEmergencyChecklists, Sr22tNormalChecklists } from './Checklists';
import { Sr22tChecklist, Sr22tChecklistCategory, Sr22tChecklistItemState, Sr22tChecklistNames, Sr22tChecklistReadonly } from './Sr22tChecklist';
import { Sr22tChecklistEvents } from './Sr22tChecklistEvents';

/**
 * The Repo class for the checklists.
 */
export class Sr22tChecklistRepository {
  private readonly abnormalChecklists = Sr22tAbnormalChecklists.getChecklists();
  private readonly checklistIdentification = Sr22tChecklistIdentification.getChecklists();
  private readonly emergencyChecklists = Sr22tEmergencyChecklists.getChecklists();
  private readonly normalChecklists = Sr22tNormalChecklists.getChecklists();
  // crew alerting and performance data checklist currently disabled
  // private readonly crewAlertingChecklists = Sr22tCrewAlertingChecklists.getChecklists();
  // private readonly performanceDataChecklists = Sr22tPerformanceDataChecklists.getChecklists();

  private readonly _activeChecklistName = Subject.create(this.normalChecklists[2].name);
  public readonly activeChecklistName = this._activeChecklistName as Subscribable<string>;

  public readonly activeChecklist = this._activeChecklistName.map(this.getChecklistByName.bind(this)) as Subscribable<Sr22tChecklistReadonly>;

  public readonly isActiveChecklistComplete = Subject.create(false);
  private isActiveChecklistCompletePipe?: Subscription;

  private readonly incompleteChecklists = new Set<Sr22tChecklistNames>();

  private readonly publisher = this.bus.getPublisher<Sr22tChecklistEvents>();

  /**
   * Builds the Repo for the checklists.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    const sub = this.bus.getSubscriber<Sr22tChecklistEvents>();

    this.activeChecklist.sub(activeChecklist => {
      this.isActiveChecklistCompletePipe?.destroy();
      this.isActiveChecklistCompletePipe = activeChecklist.isComplete.pipe(this.isActiveChecklistComplete);
    }, true);

    sub.on('sr22t_checklist_event').handle(event => {
      switch (event.type) {
        case 'active_checklist_changed':
          this.setActiveChecklist(event.newActiveChecklistName, false);
          break;
        case 'checklist_reset':
          this.resetChecklist(event.checklistName, false);
          break;
        case 'item_changed':
          this.setChecklistItemState(event.checklistName, event.itemIndex, event.itemState, false);
          break;
        case 'next_checklist':
          this.nextChecklistInCategory(event.checklistName, event.category);
          break;
      }
    });
  }

  /**
   * Get the names of the incomplete checklists sorted by category order then checklist order as they appear in lists.
   * @returns The names of the incomplete checklists.
   */
  public get incompleteChecklistNames(): Sr22tChecklistNames[] {
    return [...this.incompleteChecklists].sort((a, b) => {
      const categories = Object.values(Sr22tChecklistCategory);
      const categoryNameA = this.getReadonlyChecklistByName(a).category;
      const categoryNameB = this.getReadonlyChecklistByName(b).category;
      const categoryIndexA = categories.indexOf(categoryNameA);
      const categoryIndexB = categories.indexOf(categoryNameB);
      if (categoryIndexA !== categoryIndexB) {
        return categoryIndexA - categoryIndexB;
      }
      const checklists = this.getChecklistsByCategory(categoryNameB);
      const indexA = checklists.findIndex(cl => cl.name === a);
      const indexB = checklists.findIndex(cl => cl.name === b);
      return indexA - indexB;
    });
  }

    /**
     * Get the Checklist searched by name.
     * @param name The name of the checklist.
     * @returns The Checklist that holds the given name.
     */
  private getChecklistByName(name: string): Sr22tChecklist {
    const checklist =
      this.normalChecklists.find(x => x.name === name) ||
      this.abnormalChecklists.find(x => x.name === name) ||
      this.checklistIdentification.find(x => x.name === name) ||
      this.emergencyChecklists.find(x => x.name === name);
      // this.crewAlertingChecklists.find(x => x.name === name) ||
      // this.performanceDataChecklists.find(x => x.name === name);

    return checklist ?? this.normalChecklists[0];
  }

  /**
   * Get the checklists by category.
   * @param category The category of the checklists.
   * @returns The checklists in the given category.
   */
  public getChecklistsByCategory(category: Sr22tChecklistCategory): Sr22tChecklist[] {
    switch (category) {
      case Sr22tChecklistCategory.Abnormal:
        return this.abnormalChecklists;
      case Sr22tChecklistCategory.ChecklistIdentification:
        return this.checklistIdentification;
      case Sr22tChecklistCategory.Emergency:
        return this.emergencyChecklists;
      case Sr22tChecklistCategory.Normal:
        return this.normalChecklists;
      // case Sr22tChecklistCategory.CrewAlerting:
      //   return this.crewAlertingChecklists;
      // case Sr22tChecklistCategory.PerformanceData:
      //   return this.performanceDataChecklists;
    }
  }

  /**
   * Get the readonly Checklist searched by name.
   * @param name The name of the checklist.
   * @returns The readonly Checklist that holds the given name.
   */
  public getReadonlyChecklistByName(name: Sr22tChecklistNames): Sr22tChecklistReadonly {
    return this.getChecklistByName(name) as Sr22tChecklistReadonly;
  }

  /**
   * Sets the new active checklist and sends the bus event.
   * @param name Name of new active checklist.
   * @param notify Whether to send the bus event. Defaults to true.
   */
  public setActiveChecklist(name: Sr22tChecklistNames, notify = true): void {
    this._activeChecklistName.set(name);

    if (notify) {
      this.publisher.pub('sr22t_checklist_event', {
        type: 'active_checklist_changed',
        newActiveChecklistName: this._activeChecklistName.get(),
      }, true);
    }
  }

  /**
   * Sets the new active checklist and sends the bus event.
   * @param checklistName The name of the checklist containing the item.
   * @param itemIndex The item index.
   * @param itemState The new item state.
   * @param notify Whether to send the bus event. Defaults to true.
   */
  public setChecklistItemState(checklistName: Sr22tChecklistNames, itemIndex: number, itemState: Sr22tChecklistItemState, notify = true): void {
    const checklist = this.getChecklistByName(checklistName);
    checklist.items[itemIndex].state.set(itemState);
    const anyItemChecked = checklist.items.some(x => x.state.get() === Sr22tChecklistItemState.Completed);
    if (anyItemChecked && !checklist.isComplete.get()) {
      this.incompleteChecklists.add(checklistName);
    } else {
      this.incompleteChecklists.delete(checklistName);
    }

    if (notify) {
      this.publisher.pub('sr22t_checklist_event', {
        type: 'item_changed',
        checklistName,
        itemIndex,
        itemState,
      }, true);
    }
  }

  /**
   * Changes the active checklist to the next checklist in the category.
   * @param checklistName The name of the current checklist.
   * @param category The category of the current checklist.
   */
  private nextChecklistInCategory(checklistName: Sr22tChecklistNames, category: Sr22tChecklistCategory): void {
    switch (category) {
      case Sr22tChecklistCategory.Abnormal:
        this.setActiveChecklist(this.findNextChecklist(checklistName, this.abnormalChecklists));
        break;
      case Sr22tChecklistCategory.ChecklistIdentification:
        this.setActiveChecklist(this.findNextChecklist(checklistName, this.checklistIdentification));
        break;
      case Sr22tChecklistCategory.Emergency:
        this.setActiveChecklist(this.findNextChecklist(checklistName, this.emergencyChecklists));
        break;
      case Sr22tChecklistCategory.Normal:
        this.setActiveChecklist(this.findNextChecklist(checklistName, this.normalChecklists));
        break;
      // case Sr22tChecklistCategory.CrewAlerting:
      //   this.setActiveChecklist(this.findNextChecklist(checklistName, this.crewAlertingChecklists));
      //   break;
      // case Sr22tChecklistCategory.PerformanceData:
      //   this.setActiveChecklist(this.findNextChecklist(checklistName, this.performanceDataChecklists));
      //   break;
    }
  }

  /**
   * Utility function to find the next checklist in an array of checklists.
   * @param currentName The name of the current checklist.
   * @param checklists The array of checklists.
   * @returns The name of the next checklist, or if there is none, the last checklist.
   */
  private findNextChecklist(currentName: Sr22tChecklistNames, checklists: Sr22tChecklist[]): Sr22tChecklistNames {
    const currentChecklistIndex = checklists.findIndex(x => x.name === currentName);
    // Find the next checklists, or if there is none, the last checklist.
    return checklists[currentChecklistIndex + 1]?.name ?? checklists[checklists.length - 1].name;
  }

  /**
   * Resets all items in a checklist to incomplete.
   * @param checklistName The checklist name.
   * @param notify Whether to send the bus event. Defaults to true.
   */
  public resetChecklist(checklistName: Sr22tChecklistNames, notify = true): void {
    const checklist = this.getChecklistByName(checklistName);
    checklist.items.forEach(x => x.state.set(Sr22tChecklistItemState.Incomplete));

    if (notify) {
      this.publisher.pub('sr22t_checklist_event', {
        type: 'checklist_reset',
        checklistName,
      }, true);
    }
  }

  /** Resets all checklists in the given category
   * @param category The category to reset.
   */
  public resetChecklistByCategory(category: Sr22tChecklistCategory): void {
    switch (category) {
      case Sr22tChecklistCategory.Abnormal:
        this.abnormalChecklists.forEach(x => this.resetChecklist(x.name));
        break;
      case Sr22tChecklistCategory.ChecklistIdentification:
        this.checklistIdentification.forEach(x => this.resetChecklist(x.name));
        break;
      case Sr22tChecklistCategory.Emergency:
        this.emergencyChecklists.forEach(x => this.resetChecklist(x.name));
        break;
      case Sr22tChecklistCategory.Normal:
        this.normalChecklists.forEach(x => this.resetChecklist(x.name));
        break;
      // case Sr22tChecklistCategory.CrewAlerting:
      //   this.crewAlertingChecklists.forEach(x => this.resetChecklist(x.name));
      //   break;
      // case Sr22tChecklistCategory.PerformanceData:
      //   this.performanceDataChecklists.forEach(x => this.resetChecklist(x.name));
      //   break;
    }
  }

  /** Resets all checklists. */
  public resetAllChecklists(): void {
    this.abnormalChecklists.forEach(x => this.resetChecklist(x.name));
    this.checklistIdentification.forEach(x => this.resetChecklist(x.name));
    this.emergencyChecklists.forEach(x => this.resetChecklist(x.name));
    this.normalChecklists.forEach(x => this.resetChecklist(x.name));
    // this.crewAlertingChecklists.forEach(x => this.resetChecklist(x.name));
    // this.performanceDataChecklists.forEach(x => this.resetChecklist(x.name));
  }
}
