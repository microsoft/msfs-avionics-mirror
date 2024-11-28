import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, SetSubject, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { DmeUserSettingTypes, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { G3000DmeInfoNavIndicator, G3000NavInfoNavIndicator } from '@microsoft/msfs-wtg3000-common';

import { NavDmeInfo } from './NavDmeInfo';

import './NavDmeInfoBanner.css';

/**
 * Component props for NavDmeInfoBanner.
 */
export interface NavDmeInfoBannerProps extends ComponentProps {
  /** The nav info nav indicator. */
  navInfoIndicator: G3000NavInfoNavIndicator;

  /** The DME info nav indicator. */
  dmeInfoIndicator: G3000DmeInfoNavIndicator;

  /** The number of supported DME radios. */
  dmeRadioCount: 0 | 1 | 2;

  /** A manager for DME user settings. */
  dmeSettingManager: UserSettingManager<DmeUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the HSI map is enabled. */
  isHsiMapEnabled: Subscribable<boolean>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;

  /** The position of the banner. */
  position: 'upper' | 'lower' | 'lower-softkey'
}

/**
 * A G3000 NAV/DME information display banner.
 */
export class NavDmeInfoBanner extends DisplayComponent<NavDmeInfoBannerProps> {
  private static readonly BACKGROUND_STYLES = {
    ['upper']: {
      viewBox: '0 0 201 50',
      pathNormal: 'M 0 2 l 0 46 a 2 2 0 0 0 2 2 l 199 0 a 165 165 0 0 1 -15 -50 L 2 0 a 2 2 0 0 0 -2 2',
      hsiMap: 'M 0 2 l 0 46 a 2 2 0 0 0 2 2 l 175.2 0 a 177 177 0 0 1 4.9 -50 L 2 0 a 2 2 0 0 0 -2 2'
    },

    ['lower']: {
      viewBox: '0 0 352 50',
      pathNormal: 'M 0 2 l 0 46 a 2 2 0 0 0 2 2 l 350 0 a 173 173 0 0 1 -119.66 -50 L 2 0 a 2 2 0 0 0 -2 2',
      hsiMap: 'M 0 2 l 0 46 a 2 2 0 0 0 2 2 l 215.77 0 a 177 177 0 0 1 -29.17 -50 L 2 0 a 2 2 0 0 0 -2 2'
    },

    ['lower-softkey']: {
      viewBox: '0 0 241 50',
      pathNormal: 'M 0 2 l 0 46 a 2 2 0 0 0 2 2 l 238.75 0 a 165 165 0 0 1 -36.17 -50 L 2 0 a 2 2 0 0 0 -2 2',
      hsiMap: 'M 0 2 l 0 46 a 2 2 0 0 0 2 2 l 185.48 0 a 177 177 0 0 1 -10.2 -50 L 2 0 a 2 2 0 0 0 -2 2'
    }
  } as const;

  private readonly infoRef = FSComponent.createRef<NavDmeInfo>();

  private readonly rootCssClass = SetSubject.create(['nav-dme-info-banner', `nav-dme-info-banner-${this.props.position}`]);

  private readonly backgroundStyles = NavDmeInfoBanner.BACKGROUND_STYLES[this.props.position];

  private readonly backgroundPath = this.props.isHsiMapEnabled.map(isEnabled => {
    return isEnabled ? this.backgroundStyles.hsiMap : this.backgroundStyles.pathNormal;
  });

  private readonly isVisible = MappedSubject.create(
    ([declutter, navSource]): boolean => {
      return !declutter && navSource !== null;
    },
    this.props.declutter,
    this.props.navInfoIndicator.source
  ).pause();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVisible.resume();

    this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.rootCssClass.delete('hidden');
      } else {
        this.rootCssClass.add('hidden');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <svg viewBox={this.backgroundStyles.viewBox} class='nav-dme-info-banner-background'>
          <path d={this.backgroundPath} vector-effect='non-scaling-stroke' />
        </svg>
        <NavDmeInfo
          ref={this.infoRef}
          navInfoIndicator={this.props.navInfoIndicator}
          dmeInfoIndicator={this.props.dmeInfoIndicator}
          dmeRadioCount={this.props.dmeRadioCount}
          dmeSettingManager={this.props.dmeSettingManager}
          unitsSettingManager={this.props.unitsSettingManager}
          declutter={this.props.declutter}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.infoRef.getOrDefault()?.destroy();

    this.backgroundPath.destroy();
    this.isVisible.destroy();

    super.destroy();
  }
}