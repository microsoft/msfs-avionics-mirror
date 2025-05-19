import { Subject, Subscribable } from '@microsoft/msfs-sdk';
import { ChecklistViewBase } from './ChecklistViewBase';

export enum ViewId {
  ChecklistIndex,
  NormalChecklistPreamble,
  ChecklistMenu,
  ChecklistDisplay,
}

/**
 * A service for managing the state of checklist views.
 */
export class ChecklistViewService {
  private readonly _currentView = Subject.create<ViewId>(ViewId.ChecklistIndex);
  private readonly _preambleAcknowledged = Subject.create(false);
  private readonly _currentGroupIndex = Subject.create<number>(0);
  private readonly _currentListIndex = Subject.create<number>(0);

  private readonly viewMap = new Map<ViewId, ChecklistViewBase>();

  public readonly currentView = this._currentView as Subscribable<ViewId>;
  public readonly preambleAcknowledged = this._preambleAcknowledged as Subscribable<boolean>;
  public readonly currentGroupIndex = this._currentGroupIndex as Subscribable<number>;
  public readonly currentListIndex = this._currentListIndex as Subscribable<number>;

  /**
   * Registers a view with the service.
   * @param viewId The view ID to register.
   * @param view The view to register.
   */
  public registerView(viewId: ViewId, view: ChecklistViewBase): void {
    this.viewMap.set(viewId, view);
  }

  /**
   * Shows the specified view.
   * @param viewId The view ID to show.
   */
  public show<T extends ViewId>(viewId: T): void {
    this.viewMap.get(this.currentView.get())?.onHide();

    this._currentView.set(viewId);

    this.viewMap.get(viewId)?.onShow();
  }

  /**
   * Sets whether the checklist preamble has been acknowledged.
   * @param acknowledged Whether the preamble has been acknowledged.
   */
  public setPreambleAcknowledged(acknowledged: boolean): void {
    this._preambleAcknowledged.set(acknowledged);
  }

  /**
   * Show the checklist display with the specified list index.
   * @param listIndex The index of the checklist to show.
   */
  public showChecklist(listIndex: number): void {
    this._currentListIndex.set(listIndex);
    this.show(ViewId.ChecklistDisplay);
  }

  /**
   * Sets the current group index.
   * @param index The index to set.
   */
  public setGroupIndex(index: number): void {
    this._currentGroupIndex.set(index);
  }
}
