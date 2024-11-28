import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { TerrainSystemStateDataProvider, TerrainSystemType } from '@microsoft/msfs-garminsdk';

import { ControllableDisplayPaneIndex, TerrainSystemConfig } from '@microsoft/msfs-wtg3000-common';

import { TerrainSettingsDisplay } from '../../Components/Terrain/TerrainSettingsDisplay';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcTerrainSettingsPage.css';

/**
 * Component props for {@link GtcTerrainSettingsPage}.
 */
export interface GtcTerrainSettingsPageProps extends GtcViewProps {
  /** A terrain system config object. */
  terrainConfig: TerrainSystemConfig;

  /** A provider of terrain system state data. */
  terrainSystemStateDataProvider: TerrainSystemStateDataProvider;
}

/**
 * A GTC terrain settings page.
 */
export class GtcTerrainSettingsPage extends GtcView<GtcTerrainSettingsPageProps> {
  private readonly settingsDisplay = FSComponent.createRef<TerrainSettingsDisplay>();
  private readonly aviationDataButton = FSComponent.createRef<GtcToggleTouchButton<any>>();

  private readonly displayPaneIndex: ControllableDisplayPaneIndex;

  /**
   * Creates a new instance of GtcTerrainSettingsPage.
   * @param props The component's props.
   * @throws Error if a display pane index is not defined for this view.
   */
  public constructor(props: GtcTerrainSettingsPageProps) {
    super(props);

    if (this.props.displayPaneIndex === undefined) {
      throw new Error('GtcTerrainSettingsPage: display pane index was not defined');
    }

    this.displayPaneIndex = this.props.displayPaneIndex;
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    let titlePrefix: string;
    switch (this.props.terrainConfig.type) {
      case TerrainSystemType.TawsA:
      case TerrainSystemType.TawsB:
        titlePrefix = 'TAWS';
        break;
      default:
        titlePrefix = 'Terrain';
    }

    this._title.set(`${titlePrefix} Settings`);
  }

  /** @inheritDoc */
  public render(): VNode | null {
    if (this.props.terrainConfig.type === null) {
      return null;
    }

    return (
      <div class='terrain-settings-page'>
        <div class='terrain-settings-page-main gtc-panel'>
          <TerrainSettingsDisplay
            ref={this.settingsDisplay}
            gtcService={this.props.gtcService}
            terrainConfig={this.props.terrainConfig}
            terrainSystemStateDataProvider={this.props.terrainSystemStateDataProvider}
          />
          <GtcToggleTouchButton
            ref={this.aviationDataButton}
            state={Subject.create(false)}
            label={'Show Aviation\nData'}
            isEnabled={false}
            class='terrain-settings-page-show-aviation-data-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.settingsDisplay.getOrDefault()?.destroy();
    this.aviationDataButton.getOrDefault()?.destroy();

    super.destroy();
  }
}
