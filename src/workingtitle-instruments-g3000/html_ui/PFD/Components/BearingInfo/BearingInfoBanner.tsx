import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, SetSubject, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { FmsConfig, G3000NavIndicators, RadiosConfig } from '@microsoft/msfs-wtg3000-common';

import { BearingInfo } from './BearingInfo';

import './BearingInfoBanner.css';

/**
 * Component props for BearingInfoBanner.
 */
export interface BearingInfoBannerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The radios configuration object. */
  radiosConfig: RadiosConfig;

  /** The FMS configuration object. */
  fmsConfig: FmsConfig;

  /** The nav indicator collection for the PFD to which the display belongs. */
  navIndicators: G3000NavIndicators;

  /** A manager for display unit user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the HSI map is enabled. */
  isHsiMapEnabled: Subscribable<boolean>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;

  /** Whether the display's parent PFD includes the softkey menu. */
  softkey: boolean;
}

/**
 * A G3000 bearing info display banner.
 */
export class BearingInfoBanner extends DisplayComponent<BearingInfoBannerProps> {
  private static readonly BACKGROUND_STYLES = {
    ['no-softkey']: {
      viewBox: '0 0 410 50',
      pathNormal: 'M 410 48 l 0 -46 a 2 2 90 0 0 -2 -2 l -288.34 0 a 173 173 90 0 1 -119.66 50 L 408 50 a 2 2 90 0 0 2 -2',
      hsiMap: 'M 410 48 l 0 -46 a 2 2 90 0 0 -2 -2 l -244.59 0 a 177 177 90 0 1 -29.18 50 L 408 50 a 2 2 90 0 0 2 -2'
    },

    ['softkey']: {
      viewBox: '0 0 299 50',
      pathNormal: 'M 299 48 l 0 -46 a 2 2 90 0 0 -2 -2 l -260.58 0 a 165 165 90 0 1 -36.42 50 L 297 50 a 2 2 90 0 0 2 -2',
      hsiMap: 'M 299 48 l 0 -46 a 2 2 90 0 0 -2 -2 l -235.28 0 a 177 177 90 0 1 -10.2 50 L 297 50 a 2 2 90 0 0 2 -2'
    },
  } as const;

  private readonly info1Ref = FSComponent.createRef<BearingInfo>();
  private readonly info2Ref = FSComponent.createRef<BearingInfo>();

  private readonly rootCssClass = SetSubject.create(['bearing-info-banner', `bearing-info-banner-${this.props.softkey ? 'softkey' : 'no-softkey'}`]);

  private readonly backgroundStyles = BearingInfoBanner.BACKGROUND_STYLES[this.props.softkey ? 'softkey' : 'no-softkey'];

  private readonly backgroundPath = this.props.isHsiMapEnabled.map(isEnabled => {
    return isEnabled ? this.backgroundStyles.hsiMap : this.backgroundStyles.pathNormal;
  });

  private readonly isVisible = MappedSubject.create(
    ([declutter, pointer1Source, pointer2Source]): boolean => {
      return !declutter && (pointer1Source !== null || pointer2Source !== null);
    },
    this.props.declutter,
    this.props.navIndicators.get('bearingPointer1').source,
    this.props.navIndicators.get('bearingPointer2').source
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
        <svg viewBox={this.backgroundStyles.viewBox} class='bearing-info-banner-background'>
          <path d={this.backgroundPath} vector-effect='non-scaling-stroke' />
        </svg>
        <div class='bearing-info-banner-row-container'>
          <div class='bearing-info-banner-row'>
            <BearingInfo
              ref={this.info1Ref}
              bus={this.props.bus}
              index={1}
              radiosConfig={this.props.radiosConfig}
              fmsConfig={this.props.fmsConfig}
              indicator={this.props.navIndicators.get('bearingPointer1')}
              unitsSettingManager={this.props.unitsSettingManager}
              declutter={this.props.declutter}
              mode='offset'
            />
          </div>
          <div class='bearing-info-banner-row'>
            <BearingInfo
              ref={this.info2Ref}
              bus={this.props.bus}
              index={2}
              radiosConfig={this.props.radiosConfig}
              fmsConfig={this.props.fmsConfig}
              indicator={this.props.navIndicators.get('bearingPointer2')}
              unitsSettingManager={this.props.unitsSettingManager}
              declutter={this.props.declutter}
              mode='offset'
            />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.info1Ref.getOrDefault()?.destroy();
    this.info2Ref.getOrDefault()?.destroy();

    this.backgroundPath.destroy();
    this.isVisible.destroy();

    super.destroy();
  }
}
