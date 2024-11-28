import { ComponentProps, ComSpacing, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { NavComUserSettingManager, Tab, TabContent } from '@microsoft/msfs-epic2-shared';

import { MenuTab } from './Components';
import { TscWindowTabs } from './Components/TscWindowTabs';
import { ComTabContent, DuAndCcdTabContent, HomeTabContent, NavTabContent, XpdrTabContent } from './Pages';
import { TawsWxLightningContainer } from './Pages/TawsWxLightning';
import { TscSvgs } from './Shared/TscSvgs';
import { DuAndCcdIcon } from './Shared';

/** Info Populated Into Each Menu Tab*/
interface MenuTabInfo extends ComponentProps {
  /** Label */
  tabLabel: string;
  /** Label Class Name */
  tabLabelClass: string;
  /** SVG */
  tabSvg: string | VNode;
  /** SVG Class Name */
  tabSvgClass: string;
}

/** Tsc Service */
export class TscService {

  public readonly tabIndexSubject = Subject.create(0);
  public readonly navScrollLabel = Subject.create<string>('NAV1');
  public readonly comScrollLabel = Subject.create<string>('COM1');

  private readonly menuTabs: MenuTabInfo[] = [
    { tabLabel: 'Home', tabLabelClass: 'tab-label', tabSvg: TscSvgs.homeSvg, tabSvgClass: 'tab-svg-1' },
    { tabLabel: 'DU & CCD', tabLabelClass: 'tab-label', tabSvg: <DuAndCcdIcon bus={this.bus} />, tabSvgClass: 'tab-svg-2' },
    { tabLabel: 'COM', tabLabelClass: 'tab-label', tabSvg: TscSvgs.comSvg, tabSvgClass: 'tab-svg-3' },
    { tabLabel: 'NAV', tabLabelClass: 'tab-label', tabSvg: TscSvgs.navSvg, tabSvgClass: 'tab-svg-4' },
    { tabLabel: 'XPDR', tabLabelClass: 'tab-label', tabSvg: TscSvgs.xpdrSvg, tabSvgClass: 'tab-svg-5' }
  ];

  /** @inheritdoc */
  constructor(
    private readonly bus: EventBus,
    private readonly navComUserSettingsManager: NavComUserSettingManager,
  ) {
    this.activeTab.sub(activeTab => {

      switch (activeTab) {
        case this.tabs.home:
          return this.tabIndexSubject.set(0);
        case this.tabs.duandccd:
          return this.tabIndexSubject.set(1);
        case this.tabs.com:
          return this.tabIndexSubject.set(2);
        case this.tabs.nav:
          return this.tabIndexSubject.set(3);
        case this.tabs.xpdr:
          return this.tabIndexSubject.set(4);
        default:
          return this.tabIndexSubject.set(-1);
      }
    }, true);
  }

  /** Go Back to Home Page */
  public goToHomePage(): void {
    this.activeTab.set(this.tabs.home);
  }

  /** Go to last viewed tab */
  public goToLastViewedTab(): void {
    this.activeTab.set(this.tabs.home);
  }

  /**
   * Formats COM frequencies to strings.
   * @param root0 Inputs
   * @param root0."0" The frequency.
   * @param root0."1" The channel spacing.
   * @param root0."2" If it's powered
   * @returns A formatted string.
   */
  public FrequencyFormatter([freq, spacing, powered]: readonly [number, ComSpacing, boolean]): string {
    // Convert to kHz so that all potentially significant digits lie to the left of the decimal point.
    // This prevents floating point rounding errors.
    if (!powered) { return '---.---'; }
    const freqKhz: number = Math.round(freq * 1e3);
    return spacing === ComSpacing.Spacing833Khz ?
      (freqKhz / 1000).toFixed(3) :
      // Truncate to 10 kHz
      (Math.trunc(freqKhz / 10) / 100).toFixed(2);
  }

  public readonly tabs: Readonly<Record<TscWindowTabs, Tab>> = {
    'home': {
      renderLabel: () => <MenuTab
        bus={this.bus}
        tabLabel={this.menuTabs[0].tabLabel}
        tabLabelClass={this.menuTabs[0].tabLabelClass}
        tabSvg={this.menuTabs[0].tabSvg}
        tabSvgClass={this.menuTabs[0].tabSvgClass} />,
      renderContent: () => <TabContent bus={this.bus}><HomeTabContent bus={this.bus} tscService={this} /></TabContent>,
    },
    'duandccd': {
      renderLabel: () => <MenuTab
        bus={this.bus}
        tabLabel={this.menuTabs[1].tabLabel}
        tabLabelClass={this.menuTabs[1].tabLabelClass}
        tabSvg={this.menuTabs[1].tabSvg}
        tabSvgClass={this.menuTabs[1].tabSvgClass} />,
      renderContent: () => <TabContent bus={this.bus}><DuAndCcdTabContent bus={this.bus} tscService={this} /></TabContent>,
    },
    'com': {
      renderLabel: () => <MenuTab
        bus={this.bus}
        tabLabel={this.menuTabs[2].tabLabel}
        tabLabelClass={this.menuTabs[2].tabLabelClass}
        tabSvg={this.menuTabs[2].tabSvg}
        tabSvgClass={this.menuTabs[2].tabSvgClass} />,
      renderContent: () =>
        <ComTabContent
          bus={this.bus}
          tscService={this}
          index={1}
          comScrollLabel={this.comScrollLabel} />,
    },
    'nav': {
      renderLabel: () => <MenuTab
        bus={this.bus}
        tabLabel={this.menuTabs[3].tabLabel}
        tabLabelClass={this.menuTabs[3].tabLabelClass}
        tabSvg={this.menuTabs[3].tabSvg}
        tabSvgClass={this.menuTabs[3].tabSvgClass} />,
      renderContent: () => <NavTabContent
        bus={this.bus}
        tscService={this}
        index={1}
        navScrollLabel={this.navScrollLabel} />,
    },
    'xpdr': {
      renderLabel: () => <MenuTab
        bus={this.bus}
        tabLabel={this.menuTabs[4].tabLabel}
        tabLabelClass={this.menuTabs[4].tabLabelClass}
        tabSvg={this.menuTabs[4].tabSvg}
        tabSvgClass={this.menuTabs[4].tabSvgClass} />,
      renderContent: () => <XpdrTabContent
        bus={this.bus}
        tscService={this}
        index={1}
        navComSettings={this.navComUserSettingsManager}
      />,
    },
    'tawsPage': {
      renderLabel: () => <></>,
      renderContent: () => <TawsWxLightningContainer bus={this.bus} />
    }
  };

  public lastViewedTab = Subject.create(this.tabs.home);

  public readonly activeTab = Subject.create(this.tabs.home);
}
