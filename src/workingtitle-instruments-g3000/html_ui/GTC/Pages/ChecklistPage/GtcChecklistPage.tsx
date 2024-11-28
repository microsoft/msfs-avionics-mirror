import {
  ChecklistController, ChecklistGroupDef, ChecklistListDef, ComponentProps, ConsumerSubject, DebounceTimer, DisplayComponent, EventBus, FSComponent,
  MappedSubject, Subject, Subscribable, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { GarminChecklistItemTypeDefMap } from '@microsoft/msfs-garminsdk';

import {
  ChecklistPaneStateEvents, ChecklistPaneViewEventTypes, ControllableDisplayPaneIndex, DisplayPaneControlEvents,
  DisplayPaneSettings, DisplayPanesUserSettings, DisplayPaneViewKeys, G3000ChecklistGroupMetadata, G3000ChecklistSetDef
} from '@microsoft/msfs-wtg3000-common';

import { GtcList } from '../../Components/List/GtcList';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcChecklistOptionsPopup } from './GtcChecklistOptionsPopup';

import './GtcChecklistPage.css';

/**
 * Component props for {@link GtcChecklistPage}.
 */
export interface GtcChecklistPageProps extends GtcViewProps {
  /** Whether electronic checklists are supported. */
  checklistDef: G3000ChecklistSetDef;
}

/**
 * GTC view keys for popups owned by the checklist page.
 */
enum GtcChecklistPagePopupKeys {
  Options = 'ChecklistOptions'
}

/**
 * A GTC checklist page.
 */
export class GtcChecklistPage extends GtcView<GtcChecklistPageProps> {
  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();
  private readonly optionsButtonRef = FSComponent.createRef<GtcTouchButton>();

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;
  private readonly displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;

  private readonly checklistController = new ChecklistController(1, this.props.gtcService.bus);

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 132 : 70;

  private readonly selectedGroupIndex = ConsumerSubject.create(null, -1);
  private readonly selectedListIndex = ConsumerSubject.create(null, -1);

  private readonly goToHomePageDebounce = new DebounceTimer();

  private readonly pauseable: Subscription[] = [];

  private displayPaneViewSub?: Subscription;

  /**
   * Constructor.
   * @param props This component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcChecklistPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcChecklistPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
    this.displayPaneSettingManager = DisplayPanesUserSettings.getDisplayPaneManager(this.bus, this.displayPaneIndex);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Checklist');

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcChecklistPagePopupKeys.Options,
      this.props.controlMode,
      this.renderOptionsPopup.bind(this),
      this.props.displayPaneIndex
    );

    const sub = this.props.gtcService.bus.getSubscriber<ChecklistPaneStateEvents>();

    this.selectedGroupIndex.setConsumer(sub.on(`checklist_pane_selected_group_index_${this.displayPaneIndex}`));
    this.selectedListIndex.setConsumer(sub.on(`checklist_pane_selected_list_index_${this.displayPaneIndex}`));

    this.pauseable.push(
      this.selectedGroupIndex.sub(this.onSelectedGroupIndexChanged.bind(this), false, true)
    );

    this.displayPaneViewSub = this.displayPaneSettingManager.getSetting('displayPaneView').sub(this.onDisplayPaneViewChanged.bind(this), false, true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.displayPaneSettingManager.getSetting('displayPaneDesignatedView').value = DisplayPaneViewKeys.Checklist;
    this.displayPaneSettingManager.getSetting('displayPaneView').value = DisplayPaneViewKeys.Checklist;
  }

  /** @inheritDoc */
  public onClose(): void {
  }

  /** @inheritDoc */
  public onResume(): void {
    // If the selected display pane view is not the checklist view (this can happen if this GTC selects another pane,
    // another GTC changes the pane view, and this GTC re-selects the pane), then go back to the home page.
    if (this.displayPaneSettingManager.getSetting('displayPaneView').value !== DisplayPaneViewKeys.Checklist) {
      // Trying to manipulate the view stack in onResume() causes problems, so we will defer the operation by a frame.
      this.goToHomePageDebounce.schedule(this.props.gtcService.goBackToHomePage.bind(this.props.gtcService), 0);
    }

    this.displayPaneViewSub!.resume();

    for (const sub of this.pauseable) {
      sub.resume(true);
    }

    this.tabContainerRef.instance.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.goToHomePageDebounce.clear();

    this.displayPaneViewSub!.pause();

    for (const sub of this.pauseable) {
      sub.pause();
    }

    this.tabContainerRef.instance.pause();
  }

  /**
   * Responds to when the display pane associated with this page changes views.
   * @param viewKey The key of the new display pane view.
   */
  private onDisplayPaneViewChanged(viewKey: string): void {
    if (viewKey !== DisplayPaneViewKeys.Checklist && !this.goToHomePageDebounce.isPending()) {
      this.props.gtcService.goBackToHomePage();
    }
  }

  /**
   * Responds to when the index of the selected checklist group changes.
   * @param index The new index of the selected checklist group.
   */
  private onSelectedGroupIndexChanged(index: number): void {
    if (index < 0 || index >= Math.min(7, this.props.checklistDef.groups.length)) {
      return;
    }

    this.tabContainerRef.instance.selectTab(index + 1);
  }

  /**
   * Responds to when this page's options button is pressed.
   */
  private onOptionsPressed(): void {
    this.props.gtcService.openPopup(GtcChecklistPagePopupKeys.Options, 'slideout-right');
  }

  /**
   * Responds to when the reset current checklist button in this page's options popup is pressed.
   */
  private onResetCurrentChecklistPressed(): void {
    const groupIndex = this.selectedGroupIndex.get();
    const listIndex = this.selectedListIndex.get();

    if (groupIndex >= 0 && listIndex >= 0) {
      this.checklistController.resetList(groupIndex, listIndex);
    }

    this.props.gtcService.goBackTo((steps, stackPeeker) => stackPeeker(0)?.key === GtcViewKeys.Checklist);
  }

  /**
   * Responds to when the reset all checklists button in this page's options popup is pressed.
   */
  private onResetAllChecklistsPressed(): void {
    this.checklistController.resetAll();

    this.props.gtcService.goBackTo((steps, stackPeeker) => stackPeeker(0)?.key === GtcViewKeys.Checklist);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='checklist-page'>
        <TabbedContainer
          ref={this.tabContainerRef}
          configuration={TabConfiguration.LeftRight4}
          class='checklist-page-tab-container'
        >
          {this.props.checklistDef.groups.slice(0, 7).map(this.renderTab.bind(this))}
        </TabbedContainer>

        <GtcTouchButton
          ref={this.optionsButtonRef}
          label={'Checklist\nOptions'}
          onPressed={this.onOptionsPressed.bind(this)}
          class='checklist-page-options-button'
        />
      </div>
    );
  }

  /**
   * Renders a tab for a checklist group.
   * @param groupDef The definition for the group.
   * @param index The index of the group.
   * @returns A tab for the specified checklist group, as a VNode.
   */
  private renderTab(groupDef: ChecklistGroupDef<GarminChecklistItemTypeDefMap, G3000ChecklistGroupMetadata>, index: number): VNode {
    const contentRef = FSComponent.createRef<ChecklistTab>();

    const selectedListIndex = MappedSubject.create(
      ([groupIndex, listIndex]) => groupIndex === index ? listIndex : -1,
      this.selectedGroupIndex,
      this.selectedListIndex
    );

    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={index + 1}
        label={groupDef.metadata.tabLabel}
        onPause={() => {
          this._activeComponent.set(null);
          sidebarState.set(null);
          contentRef.instance.onPause();
        }}
        onResume={() => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
          contentRef.instance.onResume();
        }}
        onDestroy={() => {
          selectedListIndex.destroy();
        }}
      >
        <ChecklistTab
          ref={contentRef}
          bus={this.props.gtcService.bus}
          displayPaneIndex={this.displayPaneIndex}
          groupIndex={index}
          groupDef={groupDef}
          selectedListIndex={selectedListIndex}
          sidebarState={sidebarState}
          listItemHeight={this.listItemHeight}
          listItemSpacing={2}
        />
      </TabbedContent>
    );
  }

  /**
   * Renders this page's options popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's options popup, as a VNode.
   */
  private renderOptionsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: number): VNode {
    return (
      <GtcChecklistOptionsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        onResetCurrentPressed={this.onResetCurrentChecklistPressed.bind(this)}
        onResetAllPressed={this.onResetAllChecklistsPressed.bind(this)}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.goToHomePageDebounce.clear();

    this.tabContainerRef.getOrDefault()?.destroy();
    this.optionsButtonRef.getOrDefault()?.destroy();

    this.selectedGroupIndex.destroy();
    this.selectedListIndex.destroy();

    this.displayPaneViewSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ChecklistTab}.
 */
interface ChecklistTabProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The index of the display pane associated with the tab's parent view. */
  displayPaneIndex: ControllableDisplayPaneIndex;

  /** The index of the tab's checklist group. */
  groupIndex: number;

  /** The definition for the tab's checklist group. */
  groupDef: ChecklistGroupDef<GarminChecklistItemTypeDefMap>;

  /**
   * The index of the currently selected checklist within the tab's checklist group, or `-1` if none of the checklists
   * in the group is selected.
   */
  selectedListIndex: Subscribable<number>;

  /** The SidebarState to use. */
  sidebarState: Subscribable<SidebarState | null>;

  /** The height of each item in the tab's list, in pixels. */
  listItemHeight: number;

  /** The spacing between each item in the tab's list, in pixels. */
  listItemSpacing: number;
}

/**
 *
 */
class ChecklistTab extends DisplayComponent<ChecklistTabProps> implements GtcInteractionHandler {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.props.selectedListIndex.sub(this.onSelectedListIndexChanged.bind(this), false, true)
    );
  }

  /**
   * A method which is called when this component's parent tab is resumed.
   */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /**
   * A method which is called when this component's parent tab is paused.
   */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /**
   * Responds to when the index of the selected list within this tab's checklist group changes.
   * @param index The new index of the selected list.
   */
  private onSelectedListIndexChanged(index: number): void {
    if (index < 0) {
      return;
    }

    this.listRef.instance.scrollToIndex(index, 2, true, true);
  }

  /**
   * Responds to when a button in this tab's list is pressed.
   * @param index The index of the checklist associated with the button that was pressed.
   */
  private onButtonPressed(index: number): void {
    this.props.bus.getPublisher<DisplayPaneControlEvents<ChecklistPaneViewEventTypes>>()
      .pub('display_pane_view_event', {
        displayPaneIndex: this.props.displayPaneIndex,
        eventType: 'display_pane_checklist_select_list',
        eventData: [this.props.groupIndex, index]
      }, true, false);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='checklist-page-tab'>
        <GtcList
          ref={this.listRef}
          bus={this.props.bus}
          itemsPerPage={5}
          listItemHeightPx={this.props.listItemHeight}
          listItemSpacingPx={this.props.listItemSpacing}
          maxRenderedItemCount={25}
          sidebarState={this.props.sidebarState}
          class='checklist-page-tab-list'
        >
          {this.props.groupDef.lists.map(this.renderItem.bind(this))}
        </GtcList>
      </div>
    );
  }

  /**
   * Renders a list item for a checklist.
   * @param listDef The definition for the checklist.
   * @param index The index of the checklist.
   * @returns A list item for the specified checklist, as a VNode.
   */
  private renderItem(listDef: ChecklistListDef<GarminChecklistItemTypeDefMap>, index: number): VNode {
    const isHighlighted = this.props.selectedListIndex.map(selectedIndex => selectedIndex === index).pause();

    this.subscriptions.push(isHighlighted);

    return (
      <GtcListButton
        label={listDef.name}
        fullSizeButton
        onPressed={this.onButtonPressed.bind(this, index)}
        isHighlighted={isHighlighted}
        touchButtonClasses='checklist-page-tab-list-button'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
