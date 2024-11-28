import { ComponentProps, DisplayComponent, EventBus, FSComponent, HEvent, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Epic2PfdControlRadioEvents, NavComUserSettingManager } from '@microsoft/msfs-epic2-shared';

import {
  DetailPageOptionRow, DetailPagesController, DetailPageTextRow, DetailPageVNodeRow, RadioDetailSelectableValues, RadioDetailSelectedValue,
  RadioSubWindowDetailPage
} from '../DetailPagesController';

import './BaseDetailPage.css';

/** The properties for the {@link BaseDetailPage} component. */
export interface BaseDetailPageProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** Controls which Radio Management Detail Page to show in the subwindow and its display data. */
  readonly controller: DetailPagesController;
  /** The type of Radio Detail Page of this page. */
  readonly type: RadioSubWindowDetailPage;
  /** The settings manager to use. */
  readonly settings: NavComUserSettingManager;
}

/**
 * The BaseDetailPage component.
 * All Radio Management's Detail Pages will extend this BaseDetailPage component.
 * Defines basic layout and stylings of Detail Pages.
 */
export class BaseDetailPage<T extends BaseDetailPageProps> extends DisplayComponent<T> {

  private isPaused = true;

  protected pausables: Subscription[] = [];

  protected isXpdrDetailPage = false;                                     // XPDR Detail Page only
  protected readonly isVfrCodeEditable = Subject.create<boolean>(false);  // XPDR Detail Page only

  protected ROWS: (DetailPageOptionRow | DetailPageTextRow | DetailPageVNodeRow)[] = [];
  protected SELECTED_VALUES: RadioDetailSelectedValue<any>[] = [];
  protected SELECTABLE_VALUES: RadioDetailSelectableValues<any>[] = [];

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.controller.currentPage.sub(this.handleDetailPageSelected.bind(this), true);

    this.pausables = [
      this.props.bus.getSubscriber<HEvent>().on('hEvent').handle((event: string) => {
        this.props.controller.rows = this.ROWS;
        this.props.controller.handleHEvent(event);
      }, true),

      this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_push').handle(() => {
        this.props.controller.rows = this.ROWS;
        this.props.controller.handleSelKnobPressed();
      }, true),
    ];

    if (this.isXpdrDetailPage) {
      this.pausables.push(
        this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_coarse_increment').handle(() => {
          this.isVfrCodeEditable.get() && this.props.controller.handleVfrCodeChange('COARSE', 1);
        }, true),

        this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_coarse_decrement').handle(() => {
          this.isVfrCodeEditable.get() && this.props.controller.handleVfrCodeChange('COARSE', -1);
        }, true),

        this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_fine_increment').handle(() => {
          this.isVfrCodeEditable.get() && this.props.controller.handleVfrCodeChange('FINE', 1);
        }, true),

        this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_fine_decrement').handle(() => {
          this.isVfrCodeEditable.get() && this.props.controller.handleVfrCodeChange('FINE', -1);
        }, true),
      );
    }
  }

  /** Resumes this component. When the component is resumed, it will update its rendering. */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.pausables.map(sub => sub.resume());
  }

  /** Pauses this component. When the component is paused, it will not update its rendering. */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.pausables.map(sub => sub.pause());
  }

  /**
   * Handle Detail Pages (un)selection.
   * @param page The Radio Detail Page.
   */
  private handleDetailPageSelected(page: RadioSubWindowDetailPage): void {
    page !== this.props.type ? this.pause() : this.resume();
    this.props.ref?.instance.classList.toggle('hidden', page !== this.props.type);
  }

  /**
   * Renders an option row.
   * @param row A DetailPageOptionRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  public renderOptionRow(row: DetailPageOptionRow, isSelected: Subscribable<boolean>): VNode {
    return this.props.controller.renderOptionRow(row, isSelected);
  }

  /**
   * Renders a text row.
   * @param row A DetailPageOptionRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  public renderTextRow(row: DetailPageTextRow, isSelected: Subscribable<boolean>): VNode {
    return this.props.controller.renderTextRow(row, isSelected);
  }

  /**
   * Renders a text row.
   * @param row A DetailPageVNodeRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  public renderVNodeRow(row: DetailPageVNodeRow, isSelected: Subscribable<boolean>): VNode {
    return this.props.controller.renderVNodeRow(row, isSelected);
  }

  /** @inheritdoc */
  render(): VNode {
    return <></>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.pausables.map(sub => sub.destroy());
  }
}
