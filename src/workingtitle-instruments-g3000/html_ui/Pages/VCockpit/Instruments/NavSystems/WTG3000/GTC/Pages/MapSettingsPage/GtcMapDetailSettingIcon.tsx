import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableSet, VNode } from '@microsoft/msfs-sdk';
import { MapDeclutterSettingMode } from '@microsoft/msfs-garminsdk';

/**
 * Component props for GtcMapDetailSettingIcon.
 */
export interface GtcMapDetailSettingIconProps extends ComponentProps {
  /** The map detail setting mode to display. */
  mode: Subscribable<MapDeclutterSettingMode>;

  /** CSS class(es) to apply to the icon's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * An icon which displays a graphical representation of a map detail setting mode.
 */
export class GtcMapDetailSettingIcon extends DisplayComponent<GtcMapDetailSettingIconProps> {
  private static readonly SRC_MAP: Record<MapDeclutterSettingMode, string> = {
    [MapDeclutterSettingMode.All]: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/map_declutter_03.png',
    [MapDeclutterSettingMode.Level3]: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/map_declutter_02.png',
    [MapDeclutterSettingMode.Level2]: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/map_declutter_01.png',
    [MapDeclutterSettingMode.Level1]: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/map_declutter_00.png'
  };

  private readonly imgSrc = this.props.mode.map(mode => GtcMapDetailSettingIcon.SRC_MAP[mode] ?? '');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <img src={this.imgSrc} class={this.props.class ?? ''} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.imgSrc.destroy();

    super.destroy();
  }
}