import { Subject, Subscription } from '@microsoft/msfs-sdk';
import { FmsHEvent, SoftKeyMenu, SoftKeyMenuSystem, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tMfdSoftkeyMenuTypes } from './Sr22tMfdMenuConstants';
import { Sr22tChecklistPage } from '../Sr22tChecklistPage/Sr22tChecklistPage';
import { Sr22tChecklistPageFocusableItemType, Sr22tChecklistRepository, Sr22tEmergencyChecklistNames } from '../../../Shared/ChecklistSystem';

export enum ChecklistActionLabel {
  Open = 'Open',
  Check = 'Check',
  Uncheck = 'Uncheck',
  Next = 'Next Item',
  ShowList = 'Show List',
}

/** The SR22T Softkey Checklist Menu. */
export class Sr22tMfdChecklistMenu extends SoftKeyMenu {
  private readonly actionLabel = Subject.create(ChecklistActionLabel.Open);

  private actionLabelSub: Subscription | undefined;
  private focusedItemSub: Subscription | undefined;

  /**
   * Creates an instance of the SR22T fuel softkey menu.
   * @param menuSystem The menu system.
   * @param viewService The MFD view service.
   * @param repo The checklist repository.
   */
  constructor(
    protected readonly menuSystem: SoftKeyMenuSystem,
    private readonly viewService: ViewService,
    private readonly repo: Sr22tChecklistRepository
  ) {
    super(menuSystem);

    this.addItem(0, 'Engine', this.onEngineKeyPressed.bind(this));
    this.addItem(2, 'Group', this.onGroupKeyPressed.bind(this));
    this.addItem(3, 'Checklist', this.onChecklistKeyPressed.bind(this));
    this.addItem(5, 'Action', this.onActionKeyPressed.bind(this));
    this.addItem(10, 'Exit', this.onExitKeyPressed.bind(this));
    this.addItem(11, 'EMER', this.onEmerKeyPressed.bind(this));

    this.initActionLabel();
  }

  /** Initializes the dynamic action label */
  private initActionLabel(): void {
    this.actionLabelSub?.destroy();
    this.actionLabelSub = this.actionLabel.sub(v => {
      this.getItem(5).label.set(v);
    }, true);
    this.viewService.openPage.sub(activePage => {
      const page = activePage as Sr22tChecklistPage;
      if (page && page.focusedItemType) {
        this.focusedItemSub?.destroy();
        this.focusedItemSub = page.focusedItemType.sub(v => {
          switch (v) {
            case Sr22tChecklistPageFocusableItemType.CheckboxChecked:
              this.actionLabel.set(ChecklistActionLabel.Uncheck);
              break;
            case Sr22tChecklistPageFocusableItemType.CheckboxUnchecked:
              this.actionLabel.set(ChecklistActionLabel.Check);
              break;
            case Sr22tChecklistPageFocusableItemType.Text:
              this.actionLabel.set(ChecklistActionLabel.Next);
              break;
            case Sr22tChecklistPageFocusableItemType.NextChecklist:
              this.actionLabel.set(ChecklistActionLabel.Open);
              break;
            case Sr22tChecklistPageFocusableItemType.SelectionList:
              this.actionLabel.set(ChecklistActionLabel.ShowList);
              break;
          }
        }, true);
      }
    }, true);
  }

  /** Navigates to engine page */
  private onEngineKeyPressed(): void {
    this.viewService.open('Sr22tEnginePage');
    this.menuSystem.replaceMenu(Sr22tMfdSoftkeyMenuTypes.Engine);
  }

  /** Opens group menu */
  private onGroupKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tChecklistPage;
    if (page && page.title.get() === 'CHKLST - Checklist') {
      page.openChecklistPopup('category');
    }
  }

  /** Opens checklist menu */
  private onChecklistKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tChecklistPage;
    if (page && page.title.get() === 'CHKLST - Checklist') {
      page.openChecklistPopup('checklist');
    }
  }

  /** Performs the action based on the active item type */
  private onActionKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tChecklistPage;
    if (page && page.processHEvent) {
      page.processHEvent(FmsHEvent.ENT);
    }
  }

  /** Closes the Checklist page */
  private onExitKeyPressed(): void {
    this.viewService.openLastPage();
  }

  /** Navigates to emergency checklists and opens emergency checklist menu */
  private onEmerKeyPressed(): void {
    const page = this.viewService.openPage.get() as Sr22tChecklistPage;
    if (page && page.title.get() === 'CHKLST - Checklist') {
      this.repo.setActiveChecklist(Sr22tEmergencyChecklistNames.AirspeedsForEmergencyOperations);
      page.openChecklistPopup('checklist');
    }
  }
}

export const replaceChecklistMenuItems = (menuSystem: SoftKeyMenuSystem, viewService: ViewService): void => {
  let menu: SoftKeyMenu;

  // Replace on the Select Procedure Root Menu
  menu = menuSystem.getMenu('selectproc-root');
  menu.addItem(11, 'Checklist', () => onChecklistKeyPressed(menuSystem, viewService));

  // Replace on the FPL Root Menu
  menu = menuSystem.getMenu('fpln-menu');
  menu.addItem(11, 'Checklist', () => onChecklistKeyPressed(menuSystem, viewService));

  // Replace on the Nearest Airports Root Menu
  menu = menuSystem.getMenu('nearest-airports-menu');
  menu.addItem(11, 'Checklist', () => onChecklistKeyPressed(menuSystem, viewService));

  // Replace on the Nearest VORs Root Menu
  menu = menuSystem.getMenu('nearest-vors-menu');
  menu.addItem(11, 'Checklist', () => onChecklistKeyPressed(menuSystem, viewService));

  // Replace on the MFD System Setup Root Menu
  menu = menuSystem.getMenu('systemsetup-root');
  menu.addItem(11, 'Checklist', () => onChecklistKeyPressed(menuSystem, viewService));
};

const onChecklistKeyPressed = (menuSystem: SoftKeyMenuSystem, viewService: ViewService): void => {
  viewService.open('Sr22tChecklistPage');
  menuSystem.pushMenu(Sr22tMfdSoftkeyMenuTypes.Checklist);
};
