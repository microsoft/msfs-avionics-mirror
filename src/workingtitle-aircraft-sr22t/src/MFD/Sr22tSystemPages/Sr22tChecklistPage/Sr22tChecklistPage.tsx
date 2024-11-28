import { EventBus, FocusPosition, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';
import { FmsHEvent, G1000UiControl, MenuItemDefinition, MFDUiPage, MFDUiPageProps } from '@microsoft/msfs-wtg1000';

import {
  Sr22tChecklistCategory, Sr22tChecklistEvents, Sr22tChecklistItemState, Sr22tChecklistPageFocusableItemType, Sr22tChecklistRepository, Sr22tEmergencyChecklistNames,
  Sr22tNormalChecklistNames,
} from '../../../Shared/ChecklistSystem';
import { Sr22tChecklistCategorySelectionPopup, Sr22tChecklistDisplay, Sr22tChecklistPageMenuDialog, Sr22tChecklistSelectionPopup } from './Components';

import './Sr22tChecklistPage.css';

/** Component props for {@link Sr22tChecklistPage}. */
export interface Sr22tChecklistPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
  /** The checklist repository */
  repo: Sr22tChecklistRepository;
}

/** A page which displays the SR22T checklists. */
export class Sr22tChecklistPage extends MFDUiPage<Sr22tChecklistPageProps> {
  private readonly uiRoot = FSComponent.createRef<G1000UiControl>();
  private readonly activeChecklist = this.props.repo.activeChecklist;
  public readonly focusedItemType = Subject.create(Sr22tChecklistPageFocusableItemType.CheckboxUnchecked);

  private readonly checklistDisplayRef = FSComponent.createRef<Sr22tChecklistDisplay>();

  private readonly checklistEventPublisher = this.props.bus.getPublisher<Sr22tChecklistEvents>();
  private readonly subs: Subscription[] = [];

  private pageMenu: Sr22tChecklistPageMenuDialog | null = null;
  private readonly pageMenuItems: MenuItemDefinition[] = [
    {
      id: 'show-checklist-dropdown',
      renderContent: (): VNode => <span>Show Checklist Dropdown</span>,
      action: (): void => {
        this.openChecklistPopup('checklist');
      },
    },
    {
      id: 'show-group-dropdown',
      renderContent: (): VNode => <span>Show Group Dropdown</span>,
      action: (): void => {
        this.openChecklistPopup('category');
      },
    },
    {
      id: 'show-incomplete-checklists',
      closeAfterAction: false,
      renderContent: (): VNode => <span>Show Incomplete Checklists</span>,
      action: (): void => {
        this.openIncompleteChecklistsMenu();
      },
    },
    {
      id: 'check-all',
      renderContent: (): VNode => <span>Check All</span>,
      action: (): void => {
        const checklist = this.activeChecklist.get();
        checklist.items.forEach((item, index) => {
          this.checklistEventPublisher.pub('sr22t_checklist_event', {
            type: 'item_changed',
            checklistName: checklist.name,
            itemIndex: index,
            itemState: Sr22tChecklistItemState.Completed,
          });
        });
      },
    },
    {
      id: 'go-to-next-checklist',
      renderContent: (): VNode => <span>Go to Next Checklist</span>,
      action: (): void => {
        const checklist = this.activeChecklist.get();
        this.checklistEventPublisher.pub('sr22t_checklist_event', {
          type: 'next_checklist',
          checklistName: checklist.name,
          category: checklist.category,
        });
      },
    },
    {
      id: 'reset-checklist',
      renderContent: (): VNode => <span>Reset Checklist</span>,
      action: (): void => {
        const checklist = this.activeChecklist.get();
        this.checklistEventPublisher.pub('sr22t_checklist_event', {
          type: 'checklist_reset',
          checklistName: checklist.name,
        });
      },
    },
    {
      id: 'reset-all-checklists',
      renderContent: (): VNode => <span>Reset All Checklists</span>,
      action: (): void => {
        this.props.repo.resetAllChecklists();
      },
    },
    {
      id: 'exit-checklist',
      renderContent: (): VNode => <span>Exit Checklist</span>,
      action: (): void => {
        this.props.viewService.openLastPage();
      },
    },
    {
      id: 'emergency-checklists',
      renderContent: (): VNode => <span>Emergency</span>,
      action: (): void => {
        this.props.repo.setActiveChecklist(Sr22tEmergencyChecklistNames.AirspeedsForEmergencyOperations);
        this.openChecklistPopup('checklist');
      },
    },
  ];

  /** @inheritDoc */
  constructor(props: Sr22tChecklistPageProps) {
    super(props);

    this._title.set('CHKLST - Checklist');
  }

  /** @inheritdoc */
  public processHEvent(evt: FmsHEvent): boolean {
    const selectedGroup = this.checklistDisplayRef.instance;
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
        if (!selectedGroup.isFocused) {
          selectedGroup.focus(FocusPosition.MostRecent);
          this.setScrollEnabled(true);
        } else {
          selectedGroup.blur();
          this.setScrollEnabled(false);
        }
        return true;
    }

    if (this.checklistDisplayRef.instance.onInteractionEvent(evt)) {
      return true;
    }
    return super.processHEvent(evt);
  }

  /** @inheritDoc */
  public onViewClosed(): void {
    super.onViewClosed();
    this.subs.forEach(s => s.pause());
  }

  /** @inheritDoc */
  public onViewResumed(): void {
    super.onViewResumed();
    this.setScrollEnabled(true);
    this.checklistDisplayRef.instance.focus(FocusPosition.MostRecent);
    this.subs.forEach(s => s.resume(true));
  }

  /** @inheritDoc */
  protected onViewPaused(): void {
    super.onViewPaused();
    this.uiRoot.instance.blur();
  }

  /** @inheritdoc */
  protected onMenuPressed(): boolean {
    this.props.menuSystem.pushMenu('empty');
    this.pageMenu = (this.props.viewService.open('ChecklistPageMenuDialog') as Sr22tChecklistPageMenuDialog);
    this.pageMenu.setMenuItems(this.pageMenuItems);
    this.pageMenu.title.set('Page Menu');
    this.pageMenu.setItemTwoLines(false);
    this.pageMenu.onClose.on(() => {
      this.props.menuSystem.back();
      this.pageMenu = null;
    });
    return true;
  }

  /** Opens the incomplete checklists menu. */
  private openIncompleteChecklistsMenu(): void {
    const menuItems = this.props.repo.incompleteChecklistNames.length > 0 ?
      this.props.repo.incompleteChecklistNames.map((name): MenuItemDefinition => {
        const category = this.props.repo.getReadonlyChecklistByName(name).category;
        return {
          id: name,
          renderContent: (): VNode => <div>{category}<br />{name}</div>,
          action: (): void => {
            this.props.repo.setActiveChecklist(name);
          },
        };
      }) : [
        {
          id: 'no-incomplete-checklists',
          isEnabled: false,
          renderContent: (): VNode => <div class="no-incomplete-checklists">None</div>,
        }
      ];
    this.pageMenu?.setItemTwoLines(true);
    this.pageMenu?.title.set('Incomplete Checklists');
    this.pageMenu?.setMenuItems(menuItems);
  }

  /**
   * Opens the checklist/category selection popup
   * @param type The type of popup to open. Valid values are 'category' and 'checklist'.
   */
  public openChecklistPopup(type: 'category' | 'checklist'): void {
    if (type === 'category') {
      this.props.viewService
        .open<Sr22tChecklistCategorySelectionPopup>('Sr22tChecklistCategorySelectionPopup', true)
        .setInput(this.props.repo.activeChecklist.get().category)
        .onAccept.on(
          (view, result) => {
            this.props.repo.setActiveChecklist(this.props.repo.getChecklistsByCategory(result || Sr22tChecklistCategory.Normal)[0].name);
            this.openChecklistPopup('checklist');
          },
        );
    } else {
      this.props.viewService
        .open<Sr22tChecklistSelectionPopup>('Sr22tChecklistSelectionPopup', true)
        .setInput(this.props.repo.activeChecklist.get())
        .onAccept.on(
          (view, result) => {
            this.props.repo.setActiveChecklist(result || Sr22tNormalChecklistNames.BeforeStartingEngine);
          },
        );
    }

  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="mfd-page" ref={ this.viewContainerRef }>
        <G1000UiControl ref={ this.uiRoot } innerKnobScroll>
          <Sr22tChecklistDisplay
            bus={ this.props.bus }
            ref={ this.checklistDisplayRef }
            focusedItemType={ this.focusedItemType }
            repo={ this.props.repo }
            checklist={ this.activeChecklist }
            isChecklistCompleted={ this.props.repo.isActiveChecklistComplete }
            openChecklistPopup={ this.openChecklistPopup.bind(this) }
            innerKnobScroll
          />
        </G1000UiControl>
      </div>
    );
  }

  /** @inheritDoc */
  public onDestroy(): void {
    this.subs.forEach(s => s.destroy());
  }
}
