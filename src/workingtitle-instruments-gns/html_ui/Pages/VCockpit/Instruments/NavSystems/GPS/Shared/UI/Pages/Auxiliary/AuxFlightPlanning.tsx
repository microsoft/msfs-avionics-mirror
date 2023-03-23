import { FSComponent, ArraySubject, FocusPosition, VNode, Subject } from '@microsoft/msfs-sdk';
import { GNSUiControlList, GNSUiControlListProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { PageMenuItem } from '../PageMenu/PageMenuItem';
import { MenuItemInformation } from './MenuItemInformation';
import { AuxPageMenu } from './AuxPageMenu';
import { AuxPageGroup } from './AuxPages';
import { FuelPlanning } from './Page1Pages/FuelPlanning';
import { TripPlanning } from './Page1Pages/TripPlanning';
import { DensityAltTasWinds } from './Page1Pages/DensityAltTasWinds';
import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';

import './AuxPageItems.css';

/**
 * Props for {@link AuxSetup1}
 */
export interface AuxSetupProps extends PageProps {
  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;
}


/**
 * Flight planning page for Aux group of pages
 */
export class AuxFlightPlanning extends Page<AuxSetupProps> {

  private page1OptionsArray: MenuEntry[] = [
    {
      label: 'Fuel Planning', disabled: false, action: (): void => {
        this.changePage('fuel-planning');
      }
    },
    {
      label: 'Trip Planning', disabled: false, action: (): void => {
        this.changePage('trip-planning');
      }
    },
    {
      label: 'Density Alt / TAS / Winds', disabled: false, action: (): void => {
        this.changePage('density-alt-tas-winds');
      }
    },
    {
      label: 'Scheduler', disabled: true, action: (): void => {
        //TODO finish the scheduler
      }
    },
    {
      label: 'Crossfill', disabled: true, action: (): void => {

      }
    },
  ];

  private readonly menu = new AuxPageMenu();
  private readonly auxPageGroupRef = FSComponent.createRef<AuxPageGroup>();
  private page1Options = ArraySubject.create(this.page1OptionsArray);
  private readonly auxFlightPlanningMenuItems = FSComponent.createRef<GNSUiControlList<MenuItemInformation, GNSUiControlListProps<MenuItemInformation>>>();

  /**
   * Return the aux page group in this page
   *
   * @returns the aux page group
   */
  private get auxPageGroup(): AuxPageGroup {
    return this.auxPageGroupRef.instance;
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    const list = this.auxFlightPlanningMenuItems.instance;

    if (this.auxPageGroup.currentPageFocused()) {
      return this.auxPageGroup.onInteractionEvent(evt);
    }

    if (evt === InteractionEvent.RightKnobPush) {
      if (!list.isFocused) {
        list.focus(FocusPosition.MostRecent);
      } else {
        list.blur();
      }
      return true;
    } else if (evt === InteractionEvent.MENU) {
      ViewService.menu(this.menu);
      return true;
    }

    let handled = false;
    if (this.auxFlightPlanningMenuItems.instance.isFocused) {
      handled = this.auxFlightPlanningMenuItems.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (([InteractionEvent.RightOuterInc, InteractionEvent.RightOuterDec, InteractionEvent.RightInnerDec, InteractionEvent.RightInnerInc].includes(evt))) {
      return this.auxFlightPlanningMenuItems.instance.isFocused;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /** @inheritDoc */
  get isActive(): boolean {
    return super.isActive || (this.auxPageGroup?.currentPage?.isVisible ?? false);
  }

  /** @inheritDoc */
  onSuspend(): void {
    super.onSuspend();

    this.auxPageGroup.blur();
  }

  /**
   * Change the currently displayed page of the aux page group
   *
   * @param key the page key
   */
  private changePage(key: string): void {
    this.onSuspend();
    this.auxPageGroup.setPage(key);
  }

  /**
   * Picks the next page to be loaded
   * @param listMenuItem the menuEntry
   * @returns if the page has been loaded
   */
  public onListItemSelected = (listMenuItem: PageMenuItem): boolean => {
    const menuEntry = listMenuItem.props.data;
    if (menuEntry !== null) {
      if (menuEntry.action instanceof Subject) {
        const action = menuEntry.action.get();
        action();
      } else {
        menuEntry.action();
      }
    }
    return true;
  };

  onSubpageClr = (): void => {
    const list = this.auxFlightPlanningMenuItems.instance;

    this.auxPageGroup.blur();
    this.onResume();

    list.focus(FocusPosition.MostRecent);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <div class='page aux-page hide-element' ref={this.el}>
          <div class='aux-page-header'>
            <h2>FLIGHT PLANNING</h2>
          </div>
          <div class='aux-table aux-table-full-width aux-table-full-height'>
            <GNSUiControlList<MenuEntry, GNSUiControlListProps<MenuEntry>>
              data={this.page1Options}
              renderItem={(data: MenuEntry): VNode => <PageMenuItem data={data} onSelected={this.onListItemSelected} />}
              ref={this.auxFlightPlanningMenuItems}
              hideScrollbar={true}
              class="aux-page-menu-list"
            />
          </div>
        </div>

        <AuxPageGroup ref={this.auxPageGroupRef}>
          <FuelPlanning key={'fuel-planning'} bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
          <TripPlanning key={'trip-planning'} bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
          <DensityAltTasWinds key={'density-alt-tas-winds'} bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
        </AuxPageGroup>
      </div>
    );
  }
}
