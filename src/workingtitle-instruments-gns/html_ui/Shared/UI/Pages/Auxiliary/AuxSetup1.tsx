import { ArraySubject, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { GNSUiControlList, GNSUiControlListProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { PageMenuItem } from '../PageMenu/PageMenuItem';
import { MenuItemInformation } from './MenuItemInformation';
import { AuxPageGroup } from './AuxPages';
import { AuxPageMenu } from './AuxPageMenu';
import { DisplayBacklight } from './Setup1Pages/DisplayBacklight';
import { NearestAirportCriteria } from './Setup1Pages/NearestAirportCriteria';
import { ComConfiguration } from './Setup1Pages/ComConfiguration';
import { DateTimePage } from './Setup1Pages/DateTimePage';
import { UnitsPosition } from './Setup1Pages/UnitsPosition';
import { Fms } from '@microsoft/msfs-garminsdk';
import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { PositionMapDatum } from './Setup1Pages/PosistionMapDatum';
import './AuxPageItems.css';

/**
 * Props for {@link AuxSetup1}
 */
export interface AuxSetupProps extends PageProps {
  /**
   * Panel XML config document
   */
  xmlConfig: Document,

  /**
   *the fms needed for vor on units/positions
   */
  fms: Fms;

  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;
}

/**
 * setup 1 page for Aux group of pages
 */
export class AuxSetup1 extends Page<AuxSetupProps> {

  private page3OptionsArray430: MenuEntry[] = [
    {
      label: 'Airspace Alarms', disabled: true, action: (): void => {

      }
    },
    {
      label: 'CDI / Alarms', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Units / Mag Var', disabled: false, action: (): void => {
        this.changePage('units-position');
      }
    },
    {
      label: 'Position / Map Datum', disabled: false, action: (): void => {
        this.changePage('position-mapdatum');
      }
    },
    {
      label: 'Date / Time', disabled: false, action: (): void => {
        this.changePage('date-time');
      }
    }
  ];
  private page3OptionsArray530: MenuEntry[] = [
    {
      label: 'CDI / Alarms', disabled: true, action: (): void => {

      }
    },
    {
      label: 'Units / Position', disabled: false, action: (): void => {
        this.changePage('units-position');
      }
    },
    {
      label: 'Date / Time', disabled: false, action: (): void => {
        this.changePage('date-time');
      }
    },
    {
      label: 'Display Backlight', disabled: false, action: (): void => {
        this.changePage('display-backlight');
      }
    },
    {
      label: 'Nearest Airport Criteria', disabled: false, action: (): void => {
        this.changePage('nearest-airport-criteria');
      }
    },
    {
      label: 'Data Field Configuration', disabled: true, action: (): void => {

      }
    },
    {
      label: 'COM Configuration', disabled: false, action: (): void => {
        this.changePage('com-configuration');
      }
    }
  ];

  private readonly menu = new AuxPageMenu();
  private readonly auxPageGroupRef = FSComponent.createRef<AuxPageGroup>();
  private page3Options430 = ArraySubject.create(this.page3OptionsArray430);
  private page3Options530 = ArraySubject.create(this.page3OptionsArray530);
  private readonly auxSetup1MenuItems = FSComponent.createRef<GNSUiControlList<MenuItemInformation, GNSUiControlListProps<MenuItemInformation>>>();

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
    const list = this.auxSetup1MenuItems.instance;

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
    if (this.auxSetup1MenuItems.instance.isFocused) {
      handled = this.auxSetup1MenuItems.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (([InteractionEvent.RightOuterInc, InteractionEvent.RightOuterDec, InteractionEvent.RightInnerDec, InteractionEvent.RightInnerInc].includes(evt))) {
      return this.auxSetup1MenuItems.instance.isFocused;
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
    const list = this.auxSetup1MenuItems.instance;

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
            <h2>SETUP 1</h2>
          </div>
          <div class='aux-table aux-table-full-width aux-table-full-height'>
            <GNSUiControlList<MenuEntry, GNSUiControlListProps<MenuEntry>>
              data={this.props.gnsType === 'wt430' ? this.page3Options430 : this.page3Options530}
              renderItem={(data: MenuEntry): VNode => <PageMenuItem data={data} onSelected={this.onListItemSelected} />}
              ref={this.auxSetup1MenuItems}
              hideScrollbar={true}
              class="aux-page-menu-list"
            />
          </div>
        </div>
        <AuxPageGroup ref={this.auxPageGroupRef}>
          <DateTimePage key={'date-time'} bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
          <UnitsPosition key={'units-position'} bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
          <PositionMapDatum key={'position-mapdatum'} bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
          <DisplayBacklight key="display-backlight" bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} xmlConfig={this.props.xmlConfig} settingsProvider={this.props.settingsProvider} isolateScroll />
          <NearestAirportCriteria key="nearest-airport-criteria" bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
          <ComConfiguration key="com-configuration" bus={this.props.bus} gnsType={this.props.gnsType} onDisabled={this.onSubpageClr} settingsProvider={this.props.settingsProvider} isolateScroll />
        </AuxPageGroup>
      </div>
    );
  }
}