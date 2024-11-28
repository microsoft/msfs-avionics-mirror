import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  BaroCorrectionUnit, HeadingFormat, PfdUserSettingManager, Tab, TabbedContentContainer, TabContent, TabContentProps, WindFormat
} from '@microsoft/msfs-epic2-shared';

import { PfdSettingsTabs } from '../SystemConfigWindowTabs';
import { PfdSettingsRow } from './PfdSettingsRow';

import './PfdSettings.css';

/** Props for PFD Settings. */
export interface PfdSettingsProps extends TabContentProps {
  /** The aliased PFD settings manager. */
  pfdSettingsManager: PfdUserSettingManager;
}

/** PFD Settings. */
export class PfdSettings extends TabContent<PfdSettingsProps> {
  private readonly tabContainerRef = FSComponent.createRef<TabbedContentContainer>();

  private readonly tabs: Readonly<Record<PfdSettingsTabs, Tab>> = {
    'settings': {
      renderLabel: () => '',
      renderContent: () => <PfdSettingsPage bus={this.props.bus} pfdSettingsManager={this.props.pfdSettingsManager} switchPage={this.switchPage.bind(this)} />,
    },
    'status': {
      renderLabel: () => '',
      renderContent: () => <PfdStatusPage bus={this.props.bus} pfdSettingsManager={this.props.pfdSettingsManager} switchPage={this.switchPage.bind(this)} />,
    },
  };

  /** Active Tab **/
  private readonly activeTab = Subject.create(this.tabs.settings);

  /** @inheritdoc */
  public onLineSelectKey(key: number): void {
    this.tabContainerRef.getOrDefault()?.onLineSelectKey(key);
  }

  /** Switches the active page. */
  private switchPage(): void {
    this.activeTab.set(this.activeTab.get() === this.tabs.settings ? this.tabs.status : this.tabs.settings);
  }

  /** @inheritdoc */
  public render(): VNode {
    return <TabbedContentContainer
      ref={this.tabContainerRef}
      bus={this.props.bus}
      tabs={Object.values(this.tabs)}
      activeTab={this.activeTab}
      className="avionics-window-main-tabbed-content-container"
    />;
  }
}

/** Props for PFD Settings pages. */
export interface PfdSettingsPageProps extends PfdSettingsProps {
  /** Handler to switch pages. */
  switchPage: () => void;
}

/** PFD Settings. */
class PfdSettingsPage extends TabContent<PfdSettingsPageProps> {
  private nextButtonRef = FSComponent.createRef<HTMLElement>();

  private readonly onNextClickedHandler = this.props.switchPage.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.nextButtonRef.instance.addEventListener('click', this.onNextClickedHandler);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.nextButtonRef.instance.removeEventListener('click', this.onNextClickedHandler);
  }

  /** @inheritdoc */
  public onLineSelectKey(key: number): void {
    switch (key) {
      case 0: {
        const setting = this.props.pfdSettingsManager.getSetting('baroCorrectionUnit');
        setting.set(setting.get() === BaroCorrectionUnit.Hpa ? BaroCorrectionUnit.In : BaroCorrectionUnit.Hpa);
      }
        break;
      case 1: {
        const setting = this.props.pfdSettingsManager.getSetting('altMetric');
        setting.set(!setting.get());
      }
        break;
      case 2: {
        const setting = this.props.pfdSettingsManager.getSetting('windFormat');
        setting.set(setting.get() === WindFormat.Vector ? WindFormat.Xy : WindFormat.Vector);
      }
        break;
      case 3: {
        const setting = this.props.pfdSettingsManager.getSetting('headingFormat');
        setting.set(setting.get() === HeadingFormat.True ? HeadingFormat.Magnetic : HeadingFormat.True);
      }
        break;
      case 4: {
        const setting = this.props.pfdSettingsManager.getSetting('baroSynchEnabled');
        setting.set(!setting.get());
      }
        break;
      case 5:
        this.props.switchPage();
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="pfd-settings-window">
      <PfdSettingsRow label={'Baro\nCorr'} selectedValue={this.props.pfdSettingsManager.getSetting('baroCorrectionUnit')} valueLabels={[['IN', BaroCorrectionUnit.In], ['HPA', BaroCorrectionUnit.Hpa]]} />
      <div class='divider-line' />
      <PfdSettingsRow label={'Met\nAlt'} selectedValue={this.props.pfdSettingsManager.getSetting('altMetric')} valueLabels={[['Disable', false], ['Enable', true]]} />
      <div class='divider-line' />
      <PfdSettingsRow label={'Wind'} selectedValue={this.props.pfdSettingsManager.getSetting('windFormat')} valueLabels={[['Vector', WindFormat.Vector], ['X-Y', WindFormat.Xy]]} />
      <div class='divider-line' />
      <PfdSettingsRow label={'Hdg'} selectedValue={this.props.pfdSettingsManager.getSetting('headingFormat')} valueLabels={[['True', HeadingFormat.True], ['Magnetic', HeadingFormat.Magnetic]]} />
      <div class='divider-line' />
      <PfdSettingsRow label={'Baro\nSynch'} selectedValue={this.props.pfdSettingsManager.getSetting('baroSynchEnabled')} valueLabels={[['Disable', false], ['Enable', true]]} />
      <div class='divider-line' />
      <div class='next-prev-button' ref={this.nextButtonRef}>
        <span>Next</span>
        <svg style="width: 20px; height: 20px" viewBox="-2 -10 20 20">
          <path d="M 0 -8 l 15 8 l -15 8 z" />
        </svg>
      </div>
    </div>;
  }
}

/** PFD Status. */
class PfdStatusPage extends TabContent<PfdSettingsPageProps> {
  private prevButtonRef = FSComponent.createRef<HTMLElement>();

  private readonly onPrevClickedHandler = this.props.switchPage.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.prevButtonRef.instance.addEventListener('click', this.onPrevClickedHandler);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.prevButtonRef.instance.removeEventListener('click', this.onPrevClickedHandler);
  }

  /** @inheritdoc */
  public onLineSelectKey(key: number): void {
    switch (key) {
      case 5:
        this.props.switchPage();
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="pfd-settings-window">
      <div class='avionics-settings-row pfd-status-title'><span>PFD Statuses</span></div>
      <div class='divider-line' />
      <ul class='pfd-status'>
        <li>RVSM Enabled</li>
        <li>TAWS Class A</li>
        <li>Tactile Feedback Enabled</li>
      </ul>
      <div class='next-prev-button' ref={this.prevButtonRef}>
        <span>Prev</span>
        <svg style="width: 20px; height: 20px" viewBox="-2 -10 20 20">
          <path d="M 15 -8 l -15 8 l 15 8 z" />
        </svg>
      </div>
    </div>;
  }
}
