import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, Tcas, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { DefaultVsiDataProvider, VerticalSpeedIndicator as BaseVerticalSpeedIndicator, VNavDataProvider, VsiScaleOptions } from '@microsoft/msfs-garminsdk';
import { IauUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

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
   * The TCAS from which to source resolution advisory fly-to commands. If not defined, the VSI will not display RA
   * fly-to commands.
   */
  tcas?: Tcas;

  /** A manager for IAU user settings. */
  iauSettingManager: UserSettingManager<IauUserSettingTypes>;

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

    const adcIndex = this.props.iauSettingManager.getSetting('iauAdcIndex');

    this.dataProvider = new DefaultVsiDataProvider(
      this.props.bus,
      adcIndex,
      this.props.vnavDataProvider,
      this.props.tcas
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
        <img src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/PFD/vsi_scale_background.png' class='vsi-scale-background' />
        <BaseVerticalSpeedIndicator
          ref={this.ref}
          bus={this.props.bus}
          dataProvider={this.dataProvider}
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