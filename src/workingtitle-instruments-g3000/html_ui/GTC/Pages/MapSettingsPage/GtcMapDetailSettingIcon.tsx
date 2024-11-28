import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableSet, VNode } from '@microsoft/msfs-sdk';

import { MapDeclutterSettingMode } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

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
    [MapDeclutterSettingMode.All]: `${G3000FilePaths.ASSETS_PATH}/Images/GTC/map_declutter_03.png`,
    [MapDeclutterSettingMode.Level3]: `${G3000FilePaths.ASSETS_PATH}/Images/GTC/map_declutter_02.png`,
    [MapDeclutterSettingMode.Level2]: `${G3000FilePaths.ASSETS_PATH}/Images/GTC/map_declutter_01.png`,
    [MapDeclutterSettingMode.Level1]: `${G3000FilePaths.ASSETS_PATH}/Images/GTC/map_declutter_00.png`
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
