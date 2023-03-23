import { ComponentProps, DisplayComponent, EventBus, FSComponent, SetSubject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';
import { GpsIntegrityDataProvider, NavStatusBoxDataProvider, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { NavStatusBox } from './NavStatusBox';
import { NavStatusBoxConfig } from './NavStatusBoxConfig';

import './NavStatusBoxBanner.css';

/**
 * Component props for NavStatusBoxBanner.
 */
export interface NavDmeInfoBoxProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The configuration object for the banner. */
  config: NavStatusBoxConfig;

  /** A data provider for the banner. */
  dataProvider: NavStatusBoxDataProvider;

  /** A provider of GPS position integrity data. */
  gpsIntegrityDataProvider: GpsIntegrityDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the HSI map is enabled. */
  isHsiMapEnabled: Subscribable<boolean>;

  /** Whether the banner should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 navigation status box banner.
 */
export class NavStatusBoxBanner extends DisplayComponent<NavDmeInfoBoxProps> {
  private static readonly BACKGROUND_PATH_NORMAL = 'M 324 49 l 0 -46 a 2 2 90 0 0 -2 -2 l -271 0 a 165 165 90 0 1 22 50 L 322 51 a 2 2 90 0 0 2 -2';
  private static readonly BACKGROUND_PATH_HSI_MAP = 'M 324 49 l 0 -46 a 2 2 90 0 0 -2 -2 l -321 0 a 177 177 90 0 1 55.9 50 L 322 51 a 2 2 90 0 0 2 -2';

  private readonly boxRef = FSComponent.createRef<NavStatusBox>();

  private readonly rootCssClass = SetSubject.create(['nav-status-banner']);

  private readonly backgroundPath = this.props.isHsiMapEnabled.map(isEnabled => {
    return isEnabled ? NavStatusBoxBanner.BACKGROUND_PATH_HSI_MAP : NavStatusBoxBanner.BACKGROUND_PATH_NORMAL;
  });

  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.declutterSub = this.props.declutter.sub(declutter => {
      this.rootCssClass.toggle('hidden', declutter);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <svg viewBox='0 0 325 52' class='nav-status-banner-background'>
          <path d={this.backgroundPath} vector-effect='non-scaling-stroke' />
        </svg>
        <NavStatusBox
          ref={this.boxRef}
          bus={this.props.bus}
          config={this.props.config}
          dataProvider={this.props.dataProvider}
          gpsIntegrityDataProvider={this.props.gpsIntegrityDataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.props.declutter}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.boxRef.getOrDefault()?.destroy();

    this.backgroundPath.destroy();

    this.declutterSub?.destroy();

    super.destroy();
  }
}