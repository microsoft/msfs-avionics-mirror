import { Subject, Subscribable } from '@microsoft/msfs-sdk';

/**
 * A controller for G3X Touch navigation data bar editing state.
 */
export class G3XNavDataBarEditController {
  private readonly _isEditingActive = Subject.create(false);
  /** Whether editing is active. */
  public readonly isEditingActive = this._isEditingActive as Subscribable<boolean>;

  private readonly _editingIndex = Subject.create(-1);
  /** The index of the data field currently being edited, or `-1` if there is no such data field. */
  public readonly editingIndex = this._editingIndex as Subscribable<number>;

  /**
   * Activates editing.
   */
  public activateEditing(): void {
    this._isEditingActive.set(true);
  }

  /**
   * Deactivates editing. This will set the index of the data field being edited to `-1`.
   */
  public deactivateEditing(): void {
    this._editingIndex.set(-1);
    this._isEditingActive.set(false);
  }

  /**
   * Sets the index of the data field currently being edited. Has no effect if editing is not active.
   * @param index The index to set, or `-1` to set no data field being edited.
   */
  public setEditingIndex(index: number): void {
    if (!this._isEditingActive.get()) {
      return;
    }

    this._editingIndex.set(Math.max(-1, index));
  }
}