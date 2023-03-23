import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, SetSubject, Subscribable, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import {
  DateTimeUserSettingTypes, DmeUserSettingTypes, GpsIntegrityDataProvider, NavStatusBoxDataProvider, UnitsUserSettingManager, WindDataProvider
} from '@microsoft/msfs-garminsdk';
import {
  G3000DmeInfoNavIndicator, G3000NavIndicators, G3000NavInfoNavIndicator, IauUserSettingTypes, PfdAliasedUserSettingTypes, PfdIndex, RadiosConfig
} from '@microsoft/msfs-wtg3000-common';

import { PfdLayoutConfig } from '../../Config/PfdLayoutConfig';
import { NavDmeInfo } from '../NavDmeInfo/NavDmeInfo';
import { NavStatusBox } from '../NavStatusBox/NavStatusBox';
import { NavStatusBoxConfig } from '../NavStatusBox/NavStatusBoxConfig';
import { WindDisplay } from '../Wind/WindDisplay';
import { BearingInfo } from './BearingInfo/BearingInfo';
import { SpeedInfo } from './SpeedInfo/SpeedInfo';
import { DefaultSpeedInfoDataProvider } from './SpeedInfo/SpeedInfoDataProvider';
import { TemperatureInfo } from './TemperatureInfo/TemperatureInfo';
import { DefaultTemperatureInfoDataProvider } from './TemperatureInfo/TemperatureInfoDataProvider';
import { TimeInfo } from './TimeInfo/TimeInfo';
import { DefaultTimeInfoDataProvider } from './TimeInfo/TimeInfoDataProvider';

import './BottomInfoPanel.css';

/**
 * Component props for BottomInfoPanel.
 */
export interface BottomInfoPanelProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The index of the PFD to which the panel belongs. */
  pfdIndex: PfdIndex;

  /** The PFD layout configuration object. */
  layoutConfig: PfdLayoutConfig;

  /** The radios configuration object. */
  radiosConfig: RadiosConfig;

  /** The configuration object for the navigation status box. */
  navStatusBoxConfig: NavStatusBoxConfig;

  /** The nav indicator collection for the PFD to which the panel belongs. */
  navIndicators: G3000NavIndicators;

  /** A provider of GPS position integrity data. */
  gpsIntegrityDataProvider: GpsIntegrityDataProvider;

  /** A data provider for a navigation status box. */
  navStatusBoxDataProvider: NavStatusBoxDataProvider;

  /** A provider of wind data. */
  windDataProvider: WindDataProvider;

  /** A manager for IAU user settings. */
  iauSettingManager: UserSettingManager<IauUserSettingTypes>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** A manager for DME user settings. */
  dmeSettingManager: UserSettingManager<DmeUserSettingTypes>;

  /** A manager for display unit user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** Whether the panel's parent PFD is in split mode. */
  isInSplitMode: Subscribable<boolean>;

  /** Whether the panel should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 PFD bottom information panel.
 */
export class BottomInfoPanel extends DisplayComponent<BottomInfoPanelProps> {
  private readonly rootCssClass = SetSubject.create([
    'bottom-info',
    this.props.layoutConfig.includeSoftKeys ? 'bottom-info-softkey' : 'bottom-info-nosoftkey',
    this.props.layoutConfig.useBanners ? 'bottom-info-use-banners' : 'bottom-info-no-banners'
  ]);

  private readonly speedInfoDataProvider = new DefaultSpeedInfoDataProvider(
    this.props.bus,
    this.props.iauSettingManager.getSetting('iauAdcIndex'),
    this.props.pfdIndex
  );

  private readonly temperatureInfoDataProvider = this.props.layoutConfig.useBanners
    ? new DefaultTemperatureInfoDataProvider(
      this.props.bus,
      this.props.iauSettingManager.getSetting('iauAdcIndex')
    )
    : undefined;

  private readonly timeInfoDataProvider = new DefaultTimeInfoDataProvider(this.props.bus, 1);

  private readonly declutterNavDmeInfo = this.props.layoutConfig.useBanners
    ? undefined
    : MappedSubject.create(
      ([declutter, isInSplitMode]): boolean => declutter || isInSplitMode,
      this.props.declutter,
      this.props.isInSplitMode
    );

  private readonly declutterBearingInfo = this.props.layoutConfig.useBanners
    ? undefined
    : MappedSubject.create(
      ([declutter, isInSplitMode]): boolean => declutter || isInSplitMode,
      this.props.declutter,
      this.props.isInSplitMode
    );

  private thisNode?: VNode;

  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.speedInfoDataProvider.init();
    this.temperatureInfoDataProvider?.init();
    this.timeInfoDataProvider.init();

    this.declutterSub = this.props.declutter.sub(declutter => {
      this.rootCssClass.toggle('hidden', declutter);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return this.props.layoutConfig.includeSoftKeys
      ? (
        <div class={this.rootCssClass}>
          <svg viewBox='0 0 1280 53' preserveAspectRatio='none' class='bottom-info-softkey-background'>
            <path d='M 0 0 l 0 53 l 1280 0 l 0 -53 m -553 0 a 150 150 0 0 1 -174 0 L 0 0' class='bottom-info-softkey-background-fill' />
            <path d='M 553 0 a 150 150 0 0 0 174 0' vector-effect='non-scaling-stroke' class='bottom-info-softkey-background-arc-outline' />
          </svg>
          {this.renderSeparators()}
          {this.renderSpeedInfo()}
          {this.renderTemperatureInfo()}
          {this.renderWindDisplay()}
          {this.renderTimeInfo()}
          {this.renderNavStatusBox()}
          {this.renderNavDmeInfo()}
          {this.renderBearingInfos()}
        </div>
      ) : (
        <div class={this.rootCssClass}>
          {this.renderSeparators()}
          {this.renderSpeedInfo()}
          {this.renderTemperatureInfo()}
          {this.renderWindDisplay()}
          {this.renderTimeInfo()}
          {this.renderNavStatusBox()}
          {this.renderNavDmeInfo()}
          {this.renderBearingInfos()}
        </div>
      );
  }

  /**
   * Renders this panel's separators.
   * @returns This panel's separators, as a VNode.
   */
  private renderSeparators(): VNode {
    return (
      <>
        <div class='bottom-info-separator bottom-info-separator-1' />
        <div class='bottom-info-separator bottom-info-separator-2' />
        <div class='bottom-info-separator bottom-info-separator-3' />
        {
          !this.props.layoutConfig.useBanners && (
            <div class='bottom-info-separator bottom-info-separator-4' />
          )
        }
      </>
    );
  }

  /**
   * Renders this panel's speed information display.
   * @returns This panel's speed information display, as a VNode.
   */
  private renderSpeedInfo(): VNode {
    return (
      <SpeedInfo
        dataProvider={this.speedInfoDataProvider}
        unitsSettingManager={this.props.unitsSettingManager}
        declutter={this.props.declutter}
      />
    );
  }

  /**
   * Renders this panel's temperature information display.
   * @returns This panel's temperature information display, as a VNode, or `null` if this panel does not have such a
   * display.
   */
  private renderTemperatureInfo(): VNode | null {
    if (this.temperatureInfoDataProvider === undefined) {
      return null;
    }

    return (
      <TemperatureInfo
        dataProvider={this.temperatureInfoDataProvider}
        unitsSettingManager={this.props.unitsSettingManager}
        declutter={this.props.declutter}
      />
    );
  }

  /**
   * Renders this panel's wind display.
   * @returns This panel's wind display, as a VNode, or `null` if this panel does not have such a display.
   */
  private renderWindDisplay(): VNode | null {
    if (this.props.layoutConfig.useBanners) {
      return null;
    }

    return (
      <WindDisplay
        dataProvider={this.props.windDataProvider}
        windDisplaySettingManager={this.props.pfdSettingManager}
        unitsSettingManager={this.props.unitsSettingManager}
        declutter={this.props.declutter}
      />
    );
  }

  /**
   * Renders this panel's time information display.
   * @returns This panel's time information display, as a VNode.
   */
  private renderTimeInfo(): VNode {
    return (
      <TimeInfo
        dataProvider={this.timeInfoDataProvider}
        dateTimeSettingManager={this.props.dateTimeSettingManager}
        declutter={this.props.declutter}
      />
    );
  }

  /**
   * Renders this panel's navigation status box.
   * @returns This panel's navigation status box, as a VNode, or `null` if this panel does not have such a
   * display.
   */
  private renderNavStatusBox(): VNode | null {
    if (this.props.layoutConfig.useBanners) {
      return null;
    }

    return (
      <div class='bottom-info-nav-status-container'>
        <NavStatusBox
          bus={this.props.bus}
          config={this.props.navStatusBoxConfig}
          dataProvider={this.props.navStatusBoxDataProvider}
          gpsIntegrityDataProvider={this.props.gpsIntegrityDataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.props.declutter}
        />
      </div>
    );
  }

  /**
   * Renders this panel's NAV/DME information display.
   * @returns This panel's NAV/DME information display, as a VNode, or `null` if this panel does not have such a
   * display.
   */
  private renderNavDmeInfo(): VNode | null {
    if (this.props.layoutConfig.useBanners) {
      return null;
    }

    return (
      <div class='bottom-info-nav-dme-info-container'>
        <NavDmeInfo
          navInfoIndicator={this.props.navIndicators.get('navInfo') as G3000NavInfoNavIndicator}
          dmeInfoIndicator={this.props.navIndicators.get('dmeInfo') as G3000DmeInfoNavIndicator}
          dmeRadioCount={this.props.radiosConfig.dmeCount}
          dmeSettingManager={this.props.dmeSettingManager}
          unitsSettingManager={this.props.unitsSettingManager}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          declutter={this.declutterNavDmeInfo!}
        />
      </div>
    );
  }

  /**
   * Renders this panel's bearing info displays.
   * @returns This panel's bearing info displays, as a VNode.
   */
  private renderBearingInfos(): VNode {
    return (
      <div class='bottom-info-bearing-info-container'>
        <BearingInfo
          bus={this.props.bus}
          index={1}
          adfRadioCount={this.props.radiosConfig.adfCount}
          indicator={this.props.navIndicators.get('bearingPointer1')}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.declutterBearingInfo ?? this.props.declutter}
          mode={this.props.layoutConfig.useBanners ? 'center' : 'offset'}
          side={'left'}
        />
        <BearingInfo
          bus={this.props.bus}
          index={2}
          adfRadioCount={this.props.radiosConfig.adfCount}
          indicator={this.props.navIndicators.get('bearingPointer2')}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.declutterBearingInfo ?? this.props.declutter}
          mode={this.props.layoutConfig.useBanners ? 'center' : 'offset'}
          side={'right'}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.thisNode !== undefined) {
      FSComponent.visitNodes(this.thisNode, node => {
        if (node !== this.thisNode && node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        } else {
          return false;
        }
      });
    }

    this.declutterSub?.destroy();

    super.destroy();
  }
}