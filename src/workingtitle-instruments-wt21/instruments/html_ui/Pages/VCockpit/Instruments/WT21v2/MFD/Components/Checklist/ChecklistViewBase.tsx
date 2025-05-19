import { WT21UiControl, WT21UiControlProps } from '@microsoft/msfs-wt21-shared';
import { Subject, VNode } from '@microsoft/msfs-sdk';
import { ChecklistViewService } from './ChecklistViewService';

/**
 * The properties for a Checklist View.
 */
export interface ChecklistViewBaseProps extends WT21UiControlProps {
  /** The view service. */
  readonly viewService: ChecklistViewService;
}

/**
 * The base class for Checklist views.
 * @template T The type of the props.
 */
export class ChecklistViewBase<T extends ChecklistViewBaseProps = ChecklistViewBaseProps> extends WT21UiControl<T> {
  public static readonly ROW_ITEM_HEIGHT_PX = 24;
  public static readonly ITEMS_PER_PAGE = 8;

  protected readonly hidden = Subject.create(true);

  /**
   * Callback invoked when the current view is shown.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onShow(): void {
    this.setDisabled(false);
    this.hidden.set(false);
  }

  /**
   * Callback invoked when the current view is hidden.
   */
  public onHide(): void {
    this.setDisabled(true);
    this.hidden.set(true);
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.setDisabled(true);
  }
}
