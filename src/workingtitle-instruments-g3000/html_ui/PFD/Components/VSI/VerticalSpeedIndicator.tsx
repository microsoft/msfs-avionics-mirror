import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  DefaultVsiDataProvider, VerticalSpeedIndicator as BaseVerticalSpeedIndicator, VNavDataProvider, VsiScaleOptions,
  TcasRaCommandDataProvider
} from '@microsoft/msfs-garminsdk';

import { G3000FilePaths, PfdSensorsUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { VsiConfig } from './VsiConfig';

import './VerticalSpeedIndicator.css';

/**
 * Component props for VerticalSpeedIndicator.
 */
export interface VerticalSpeedIndicatorProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The configuration object for the indicator. */
  config: VsiConfig;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /**
   * A provider of TCAS-II resolution advisory vertical speed command data. If not defined, then the indicator will
   * not display resolution advisory commands.
   */
  tcasRaCommandDataProvider?: TcasRaCommandDataProvider;

  /** A manager for PFD sensors user settings. */
  pfdSensorsSettingManager: UserSettingManager<PfdSensorsUserSettingTypes>;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;

  /** Whether advanced vnav is enabled or not. */
  isAdvancedVnav: boolean;
}

/**
 * A G3000 vertical speed indicator.
 */
export class VerticalSpeedIndicator extends DisplayComponent<VerticalSpeedIndicatorProps> {
  private static readonly DEFAULT_OPTIONS = {
    scale: {
      maximum: 4000,
      majorTickInterval: 2000,
      minorTickFactor: 2
    } as VsiScaleOptions
  };

  private readonly ref = FSComponent.createRef<BaseVerticalSpeedIndicator>();

  private readonly dataProvider: DefaultVsiDataProvider;

  /** @inheritdoc */
  constructor(props: VerticalSpeedIndicatorProps) {
    super(props);

    const adcIndex = this.props.pfdSensorsSettingManager.getSetting('pfdAdcIndex');

    this.dataProvider = new DefaultVsiDataProvider(
      this.props.bus,
      adcIndex,
      this.props.vnavDataProvider
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    this.dataProvider.init();

    const scaleOptions = { ...VerticalSpeedIndicator.DEFAULT_OPTIONS.scale };
    for (const key in scaleOptions) {
      const configOption = this.props.config.scaleOptions[key as keyof typeof scaleOptions];
      if (configOption !== undefined) {
        scaleOptions[key as keyof typeof scaleOptions] = configOption as any;
      }
    }

    return (
      <div class='vsi-container'>
        <img src={`${G3000FilePaths.ASSETS_PATH}/Images/PFD/vsi_scale_background.png`} class='vsi-scale-background' />
        <BaseVerticalSpeedIndicator
          ref={this.ref}
          bus={this.props.bus}
          dataProvider={this.dataProvider}
          tcasRaCommandDataProvider={this.props.tcasRaCommandDataProvider}
          declutter={this.props.declutter}
          scaleOptions={scaleOptions}
          isAdvancedVnav={this.props.isAdvancedVnav}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();
    this.dataProvider.destroy();

    super.destroy();
  }
}
