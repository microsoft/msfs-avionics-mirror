import {
  ArraySubject, FSComponent, Subject, SubscribableArrayEventType, SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths, InitializationControlEvents, InitializationTaskData } from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcView } from '../../GtcService/GtcView';

import './GtcInitializationPage.css';

/**
 * A GTC initialization page.
 */
export class GtcInitializationPage extends GtcView {
  private thisNode?: VNode;

  private readonly listRef = FSComponent.createRef<GtcList<InitializationTaskData & DynamicListData>>();

  private readonly listData = ArraySubject.create<InitializationTaskData & DynamicListData>();
  private isListDataPending = false;

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 158 : 86;
  private readonly listItemSpacing = this.props.gtcService.isHorizontal ? 2 : 1;

  private isOpen = false;

  private tasksSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Initialization');

    this.tasksSub = this.props.gtcService.initializationDataProvider.tasks.sub(this.onTasksChanged.bind(this), true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isOpen = true;

    if (this.isListDataPending) {
      this.isListDataPending = false;
      this.refreshTaskData();
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;
  }

  /**
   * Responds to when the initialization task data array changes.
   * @param index The index at which the change occurred.
   * @param type The type of change that occurred.
   * @param item The item or items that changed.
   */
  private onTasksChanged(
    index: number,
    type: SubscribableArrayEventType,
    item?: (InitializationTaskData & DynamicListData) | readonly (InitializationTaskData & DynamicListData)[]
  ): void {
    if (this.isOpen) {
      switch (type) {
        case SubscribableArrayEventType.Added:
          if (item) {
            if (Array.isArray(item)) {
              this.listData.insertRange(index, item);
            } else {
              this.listData.insert(item as InitializationTaskData & DynamicListData, index);
            }
          }
          break;
        case SubscribableArrayEventType.Removed:
          if (Array.isArray(item)) {
            for (let i = index + item.length - 1; i >= index; i--) {
              this.listData.removeAt(i);
            }
          } else {
            this.listData.removeAt(index);
          }
          break;
        case SubscribableArrayEventType.Cleared:
          this.listData.clear();
          break;
      }
    } else {
      this.isListDataPending = true;
    }
  }

  /**
   * Refreshes this page's task data array with the current initialization task data array.
   */
  private refreshTaskData(): void {
    this.listData.set(this.props.gtcService.initializationDataProvider.tasks.getArray());
  }

  /**
   * Responds to when this page's reset initialization button is pressed.
   */
  private async onResetPressed(): Promise<void> {
    const result = await GtcDialogs.openMessageDialog(
      this.props.gtcService,
      this.props.gtcService.initializationDataProvider.resetMessage.get() ?? '',
      true
    );

    if (result) {
      this.props.gtcService.bus.getPublisher<InitializationControlEvents>().pub('g3000_init_reset', undefined, true, false);
    }
  }

  /**
   * Responds to when this page's accept initialization button is pressed.
   */
  private async onAcceptPressed(): Promise<void> {
    if (!this.props.gtcService.initializationDataProvider.areAllTasksCompleted.get()) {
      const result = await GtcDialogs.openMessageDialog(
        this.props.gtcService,
        'Init process not completed.\nConfirm that the initialization process should be exited.',
        true
      );

      if (!result) {
        return;
      }
    }

    this.props.gtcService.bus.getPublisher<InitializationControlEvents>().pub('g3000_init_accept', undefined, true, false);

    this.props.gtcService.goToHomePage();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='init-page'>
        <GtcValueTouchButton
          state={Subject.create('DEFAULT PROFILE')}
          label='Crew Profile'
          isEnabled={false}
          class='init-page-left-button init-page-profile-button'
        />

        <GtcTouchButton
          label={'Reset\nInitialization'}
          isEnabled={this.props.gtcService.initializationDataProvider.isEnabled}
          onPressed={this.onResetPressed.bind(this)}
          class='init-page-left-button init-page-reset-init-button'
        />

        <GtcTouchButton
          label={'Accept\nInitialization'}
          isEnabled={this.props.gtcService.initializationDataProvider.isEnabled}
          onPressed={this.onAcceptPressed.bind(this)}
          class='init-page-left-button init-page-accept-init-button'
        />

        <div class='init-page-list-panel gtc-panel'>
          <div class='init-page-list-header'>
            <div class='init-page-list-header-task'>Task</div>
            <div class='init-page-list-header-completed'>Completed</div>
          </div>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.listData}
            renderItem={this.renderTaskItem.bind(this)}
            itemsPerPage={4}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={this.listItemSpacing}
            maxRenderedItemCount={20}
            sidebarState={this._sidebarState}
            class='init-page-list'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders an initialization task item in this page's task list.
   * @param taskData Data describing the task for which to render an item.
   * @returns An initialization task item for the specified task data, as a VNode.
   */
  private renderTaskItem(taskData: InitializationTaskData): VNode {
    const checkIconHidden = taskData.isCompleted.map(SubscribableMapFunctions.not());

    return (
      <GtcListButton
        fullSizeButton
        onPressed={() => { this.props.gtcService.loadInitializationTask(taskData.taskDef.uid); }}
        onDestroy={() => { checkIconHidden.destroy(); }}
      >
        <div class='init-page-task-item'>
          <div class='init-page-task-item-left'>
            <img src={taskData.taskDef.iconSrc} class='init-page-task-item-icon' />
            <div class='init-page-task-item-name'>{taskData.taskDef.label}</div>
          </div>
          <div class='init-page-task-item-check-box gtc-panel'>
            <img
              src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_check.png`}
              class={{ 'init-page-task-item-check-icon': true, 'hidden': checkIconHidden }}
            />
          </div>
        </div>
      </GtcListButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.tasksSub?.destroy();

    super.destroy();
  }
}
