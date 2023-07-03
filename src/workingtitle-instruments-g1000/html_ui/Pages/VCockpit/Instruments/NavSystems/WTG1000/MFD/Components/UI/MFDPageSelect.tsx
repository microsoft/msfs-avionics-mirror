import { ArraySubject, FSComponent, NodeReference, PluginSystem, VNode } from '@microsoft/msfs-sdk';

import { G1000AvionicsPlugin, G1000PluginBinder } from '../../../Shared';
import { MenuItemDefinition, PopoutMenuItem } from '../../../Shared/UI/Dialogs/PopoutMenuItem';
import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { List } from '../../../Shared/UI/List';
import { UiControl } from '../../../Shared/UI/UiControl';
import { ScrollableControl, UiView, UiViewProps } from '../../../Shared/UI/UiView';

import './MFDPageSelect.css';

/**
 * The definition of an individual item from a menu selection list.
 */
type PageListItemDef = {
  /** The name of the page for the menu. */
  name: string;

  /** The key of UI view to open when selected. */
  key: string;
}

/**
 * The definition for a menu page group, containing a list of items.
 */
type PageListDef = {
  /** The text label for the page list */
  label: string;

  /** The items in the page list */
  items: (PageListItemDef | undefined)[]
};

/**
 * Component props for MFDPageSelect.
 */
export interface MFDPageSelectProps extends Omit<UiViewProps, 'upperKnobCanScroll'> {
  /** Whether to support the weather radar page. */
  supportWeatherRadarPage: boolean;

  /** The menu system. */
  menuSystem: PageSelectMenuSystem;

  /** The plugin system, for sending initialization info. */
  pluginSystem: PluginSystem<G1000AvionicsPlugin, G1000PluginBinder>
}

/**
 * A class that manages the data and logic for the MFD page selection menu system.
 */
export class PageSelectMenuSystem {
  private pageSelectView?: MFDPageSelect;
  private pageListDefs: PageListDef[] = [];
  private lastSelectedIndex: number[] = [];

  /**
   * Attach a rendered page select menu to this controller.
   * @param mfdPageSelect The page select element.
   */
  public attachPageSelectView(mfdPageSelect: MFDPageSelect): void {
    this.pageSelectView = mfdPageSelect;
  }

  /**
   * Get the page list definitions for a page list index.
   * @param index The index to retrieve.
   * @returns The definition at the given index.
   */
  public getPageList(index: number): PageListDef {
    return this.pageListDefs[index];
  }

  /**
   * Set the contents of a page list index.
   * @param index The index to set.
   * @param pageList The new pagelist for this index.
   */
  public setPageList(index: number, pageList: PageListDef): void {
    this.pageListDefs[index] = pageList;
  }

  /**
   * Remove a page list from the menu system.
   * @param index The index to remove.
   * @returns True if that index was found and removed, false otherwise.
   */
  public removePageList(index: number): boolean {
    if (this.pageListDefs.length >= index + 1) {
      this.pageListDefs.splice(index, 1);
      this.lastSelectedIndex.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Insert a page list at a given index in the menu system.
   * @param index The index to insert at.
   * @param pageList The list to insert.
   */
  public addPageList(index: number, pageList: PageListDef): void {
    this.pageListDefs.splice(index, 0, pageList);
    this.lastSelectedIndex.splice(index, 0, 0);
  }

  /**
   * Push a new page list to the end of the menu system.
   * @param pageList The list to push.
   */
  public pushPageList(pageList: PageListDef): void {
    this.pageListDefs.push(pageList);
    this.lastSelectedIndex.push(0);
  }

  /**
   * Return the full collection page lists
   * @returns A list of page lists.
   */
  public getPageLists(): PageListDef[] {
    return this.pageListDefs;
  }

  /**
   * Re-compute the page select menu
   */
  public compute(): void {
    this.pageSelectView?.compute();
  }
}

/**
 * A pop-up which allows the user to select the open MFD page.
 */
export class MFDPageSelect extends UiView<MFDPageSelectProps> {
  private static readonly OPEN_TIME = 3000; // ms

  private readonly listRef = FSComponent.createRef<List>();
  private tabRefs: NodeReference<HTMLDivElement>[] = [];
  private tabListRef = FSComponent.createRef<HTMLDivElement>();

  // A data structure containing the stock menu items.
  private readonly pageGroups = [
    [
      { name: 'Navigation Map', key: 'NavMapPage' },
      { name: 'IFR/VFR Charts', key: '' },
      { name: 'Traffic Map', key: 'TrafficPage' },
      this.props.supportWeatherRadarPage ? { name: 'Weather Radar', key: 'WeatherRadarPage' } : undefined,
      { name: 'Weather Data Link', key: '' },
      { name: 'TAWS-B', key: '' }
    ],
    [
      { name: 'Airport Information', key: 'AirportInformation' },
      { name: 'Intersection Information', key: 'IntersectionInformation' },
      { name: 'NDB Information', key: 'NdbInformation' },
      { name: 'VOR Information', key: 'VorInformation' },
      { name: 'VRP Information', key: '' },
      { name: 'User WPT Information', key: '' }
    ],
    [
      { name: 'Trip Planning', key: '' },
      { name: 'Utility', key: '' },
      { name: 'GPS Status', key: '' },
      { name: 'System Setup', key: 'SystemSetupPage' },
      { name: 'XM Radio', key: '' },
      { name: 'System Status', key: '' },
      { name: 'Connext Setup', key: '' },
      { name: 'Databases', key: '' }
    ],
    [
      { name: 'Active Flight Plan', key: 'FPLPage' },
      { name: 'Flight Plan Catalog', key: '' }
    ],
    [
      { name: 'Nearest Airports', key: 'NearestAirports' },
      { name: 'Nearest Intersections', key: 'NearestIntersections' },
      { name: 'Nearest NDB', key: 'NearestNDBs' },
      { name: 'Nearest VOR', key: 'NearestVORs' },
      { name: 'Nearest VRP', key: '' },
      { name: 'Nearest User WPTs', key: '' },
      { name: 'Nearest Frequencies', key: '' },
      { name: 'Nearest Airspaces', key: '' }
    ]
  ];

  private listItemDefs: MenuItemDefinition[][] = [];

  private readonly listDataSub = ArraySubject.create<MenuItemDefinition>();

  private activeGroupIndex = -1;

  private ignoreSelection = false;

  private openTimer: NodeJS.Timeout | null = null;

  /** @inheritdoc */
  constructor(props: MFDPageSelectProps) {
    super(props);

    this.props.menuSystem.attachPageSelectView(this);

    (props as UiViewProps).upperKnobCanScroll = true;

    // Initialize the default menu items.
    this.props.menuSystem.pushPageList({ label: 'Map', items: this.pageGroups[0] });
    this.props.menuSystem.pushPageList({ label: 'WPT', items: this.pageGroups[1] });
    this.props.menuSystem.pushPageList({ label: 'Aux', items: this.pageGroups[2] });
    this.props.menuSystem.pushPageList({ label: 'FPL', items: this.pageGroups[3] });
    this.props.menuSystem.pushPageList({ label: 'NRST', items: this.pageGroups[4] });
    this.compute();

    // Now plugins can modify things.
    this.props.pluginSystem.callPlugins(p => p.onPageSelectMenuSystemInitialized());
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onAfterRender(): void {

    const pageList = this.props.menuSystem.getPageLists();
    for (let i = 0; i < pageList.length; i++) {
      FSComponent.render(<div ref={this.tabRefs[i]}>{pageList[i].label}</div>, this.tabListRef.getOrDefault());
    }

    this.props.viewService.openPageKey.sub(key => {
      let itemIndex = -1;
      const groupIndex = this.listItemDefs.findIndex(defs => (itemIndex = defs.findIndex(def => def.isEnabled && def.id === key)) >= 0);
      if (groupIndex >= 0) {
        this.setActiveGroup(groupIndex, itemIndex);
      }
    }, true);
  }

  /**
   * Compute the content of the menu based upon the menu definition data.
   */
  public compute(): void {
    this.listItemDefs = [];
    this.tabRefs = [];

    for (const defs of this.props.menuSystem.getPageLists()) {
      this.listItemDefs.push((defs.items.filter(def => def !== undefined) as PageListItemDef[]).map(this.buildListItemDefinition.bind(this)));
      this.tabRefs.push(FSComponent.createRef<HTMLDivElement>());
    }

    if (this.tabListRef.getOrDefault() !== null) {
      this.tabListRef.instance.innerHTML = '';
      const pageList = this.props.menuSystem.getPageLists();
      for (let i = 0; i < pageList.length; i++) {
        FSComponent.render(<div ref={this.tabRefs[i]}>{pageList[i].label}</div>, this.tabListRef.getOrDefault());
      }
      this.setActiveGroup(0);
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
      case FmsHEvent.CLR:
        this.close();
        return true;
    }

    return false;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected processScrollEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_INC:
        this.listRef.instance.processHEvent(FmsHEvent.LOWER_INC);
        break;
      case FmsHEvent.UPPER_DEC:
        this.listRef.instance.processHEvent(FmsHEvent.LOWER_DEC);
        break;
      case FmsHEvent.LOWER_INC:
        this.cycleActiveGroup(1);
        break;
      case FmsHEvent.LOWER_DEC:
        this.cycleActiveGroup(-1);
        break;
    }

    this.resetOpenTimer();

    return true;
  }

  /**
   * Cycles through the list of page groups to set the active page group.
   * @param delta The direction in which to cycle through the groups.
   */
  private cycleActiveGroup(delta: 1 | -1): void {
    this.setActiveGroup(Utils.Clamp(this.activeGroupIndex + delta, 0, this.listItemDefs.length - 1));
  }

  /**
   * Sets the active page group.
   * @param groupIndex The index of the new active group.
   * @param itemIndex The index of the group list item to which to initially scroll. Defaults to 0.
   */
  private setActiveGroup(groupIndex: number, itemIndex?: number): void {
    if (groupIndex === this.activeGroupIndex) {
      return;
    }

    const originalGroupIndex = this.activeGroupIndex;
    this.activeGroupIndex = groupIndex;

    this.ignoreSelection = true;
    this.listDataSub.set(this.listItemDefs[groupIndex]);

    // We need access to lastSelectedIndex but don't want plugins to have it.
    this.listRef.instance.scrollToIndex(itemIndex ?? (this.props.menuSystem as any).lastSelectedIndex[groupIndex]);
    this.ignoreSelection = false;

    const index = this.listRef.instance.getSelectedIndex();
    this.onListItemSelected(this.listDataSub.tryGet(index) ?? null, this.listRef.instance.getListItemInstance(index), index);

    this.tabRefs[originalGroupIndex]?.instance.classList.remove('active-tab');
    this.tabRefs[groupIndex]?.instance.classList.add('active-tab');

    this.activeGroupIndex = groupIndex;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected onViewOpened(): void {
    this.resetOpenTimer();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected onViewClosed(): void {
    this.clearOpenTimer();
  }

  /**
   * Resets the open timer.
   */
  private resetOpenTimer(): void {
    this.clearOpenTimer();

    this.openTimer = setTimeout(() => {
      this.openTimer = null;
      this.close();
    }, MFDPageSelect.OPEN_TIME);
  }

  /**
   * Clears the open timer.
   */
  private clearOpenTimer(): void {
    if (this.openTimer !== null) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  /**
   * Builds a MenuItemDefinition from a page list item definition.
   * @param def A page list item definition.
   * @returns A MenuItemDefinition.
   */
  private buildListItemDefinition(def: PageListItemDef): MenuItemDefinition {
    return {
      id: def.key,
      renderContent: (): VNode => <span>{def.name}</span>,
      isEnabled: def.key !== '',
      action: (): void => {
        this.props.viewService.open(def.key);
      }
    };
  }

  /**
   * Renders a list item.
   * @param d The item definition.
   * @param registerFn The register function.
   * @returns The rendered list item.
   */
  private renderListItem(d: MenuItemDefinition, registerFn: (ctrl: UiControl) => void): VNode {
    return <PopoutMenuItem onRegister={registerFn} parent={this} def={d} />;
  }

  /**
   * A callback which is called when a list item is selected.
   * @param d The selected item.
   * @param element The control associated with the selected item.
   * @param index The index of the selected item.
   */
  private onListItemSelected(d: MenuItemDefinition | null, element: ScrollableControl | null, index: number): void {
    if (this.ignoreSelection || !d) {
      return;
    }

    // We need access to lastSelectedIndex but don't want plugins to have it.
    (this.props.menuSystem as any).lastSelectedIndex[this.activeGroupIndex] = index;

    if (this.props.viewService.openPageKey.get() === d.id) {
      return;
    }

    this.props.viewService.open(d.id);
    this.props.viewService.open('PageSelect');
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='popout-dialog mfd-pageselect'>
        <List
          ref={this.listRef}
          data={this.listDataSub}
          renderItem={this.renderListItem.bind(this)}
          onItemSelected={this.onListItemSelected.bind(this)}
          class='mfd-pageselect-group'
        />
        <div class='mfd-pageselect-tabs' ref={this.tabListRef} />
      </div>
    );
  }
}
