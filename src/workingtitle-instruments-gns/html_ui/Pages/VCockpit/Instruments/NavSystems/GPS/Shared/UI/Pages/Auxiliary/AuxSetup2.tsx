
import { ArraySubject, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSUiControlList, GNSUiControlListProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { PageMenuItem } from '../PageMenu/PageMenuItem';
import { MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { AuxPageGroup } from './AuxPages';
import { MenuItemInformation } from './MenuItemInformation';
import { SbasSelectionPage } from './Setup2Pages/SbasSelectionPage';

import './AuxPageItems.css';
import { AuxPageMenu } from './AuxPageMenu';
import { ComConfiguration } from './Setup1Pages/ComConfiguration';
import { DisplayBacklight } from './Setup1Pages/DisplayBacklight';
import { NearestAirportCriteria } from './Setup1Pages/NearestAirportCriteria';

/**
 * Props for the AuxSetup2 page.
 */
interface AuxSetup2Props extends PageProps {
  /** An instance of the settings provider. */
  settingsProvider: GNSSettingsProvider;

  /**
   * Panel XML config document
   */
  xmlConfig: Document,
}

/**
 * setup 2 page for Aux group of pages
 */
export class AuxSetup2 extends Page<AuxSetup2Props> {
  private readonly menu = new AuxPageMenu();
  private readonly auxPageGroupRef = FSComponent.createRef<AuxPageGroup>();

  private page4OptionsArray430: MenuEntry[] = [
    {
      label: 'Display', disabled: false, action: () => {
        this.changePage('display-backlight');
      }
    },
    {
      label: 'NearestAirport Criteria', disabled: false, action: (): void => {
        this.changePage('nearest-airport-criteria');
      }
    },
    {
      label: 'SBAS Selection', disabled: false, action: () => this.changePage('sbas-selection')
    },
    {
      label: 'COM Configuration', disabled: false, action: () => {
        this.changePage('com-configuration');
      }
    },
  ];

  private page4OptionsArray530: MenuEntry[] = [
    {
      label: 'SBAS Selection', disabled: false, action: () => this.changePage('sbas-selection')
    },
  ];
  private page4Options530 = ArraySubject.create(this.page4OptionsArray530);
  private page4Options430 = ArraySubject.create(this.page4OptionsArray430);
  private readonly AuxSetup2MenuItems = FSComponent.createRef<GNSUiControlList<MenuItemInformation, GNSUiControlListProps<MenuItemInformation>>>();

  /**
   * Return the aux page group in this page
   *
   * @returns the aux page group
   */
  private get auxPageGroup(): AuxPageGroup {
    return this.auxPageGroupRef.instance;
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    const list = this.AuxSetup2MenuItems.instance;

    if (this.auxPageGroupRef.instance.currentPageFocused()) {
      return this.auxPageGroupRef.instance.onInteractionEvent(evt);
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
    if (this.AuxSetup2MenuItems.instance.isFocused) {
      handled = this.AuxSetup2MenuItems.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (([InteractionEvent.RightOuterInc, InteractionEvent.RightOuterDec, InteractionEvent.RightInnerDec, InteractionEvent.RightInnerInc].includes(evt))) {
      return this.AuxSetup2MenuItems.instance.isFocused;
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
    this.auxPageGroupRef.instance.setPage(key);
  }

  /**
   * Handles when an aux subpage CLR is pressed.
   * @returns True.
   */
  private onSubpageClr(): boolean {
    const list = this.AuxSetup2MenuItems.instance;

    this.auxPageGroupRef.instance.blur();
    this.onResume();

    list.focus(FocusPosition.MostRecent);
    return true;
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='page aux-page hide-element' ref={this.el}>
          <div class='aux-page-header'>
            <h2>SETUP 2</h2>
          </div>
          <div class='aux-table aux-table-full-width aux-table-full-height'>
            <GNSUiControlList<MenuEntry, GNSUiControlListProps<MenuEntry>>
              data={this.props.gnsType === 'wt430' ? this.page4Options430 : this.page4Options530}
              renderItem={(data: MenuEntry): VNode => <PageMenuItem data={data} onSelected={this.onListItemSelected} />}
              ref={this.AuxSetup2MenuItems}
              hideScrollbar={true}
              class="aux-page-menu-list"
            />
          </div>
        </div>

        <AuxPageGroup ref={this.auxPageGroupRef}>
          <SbasSelectionPage key='sbas-selection' bus={this.props.bus} gnsType={this.props.gnsType}
            settingsProvider={this.props.settingsProvider} onDisabled={this.onSubpageClr.bind(this)} isolateScroll />
          <DisplayBacklight key="display-backlight" bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr.bind(this)} xmlConfig={this.props.xmlConfig} settingsProvider={this.props.settingsProvider} isolateScroll />
          <NearestAirportCriteria key="nearest-airport-criteria" bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr.bind(this)} settingsProvider={this.props.settingsProvider} isolateScroll />
          <ComConfiguration key="com-configuration" bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr.bind(this)} settingsProvider={this.props.settingsProvider} isolateScroll />

        </AuxPageGroup>
      </>
    );
  }
}
