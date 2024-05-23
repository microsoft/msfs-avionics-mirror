import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { MapDeclutterMode } from '@microsoft/msfs-garminsdk';

import './G3XMapDetailIndicator.css';

/**
 * Component props for G3XMapDetailIndicator.
 */
export interface G3XMapDetailIndicatorProps extends ComponentProps {
  /** The map's current declutter mode. */
  declutterMode: Subscribable<MapDeclutterMode>;
}

/**
 * Displays map detail level.
 */
export class G3XMapDetailIndicator extends DisplayComponent<G3XMapDetailIndicatorProps> {
  private readonly rootDisplay = this.props.declutterMode.map(mode => mode === MapDeclutterMode.All ? 'none' : '');
  private readonly detailLevelText = this.props.declutterMode.map(mode => (-mode).toString());

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-detail' style={{ 'display': this.rootDisplay }}>
        Detail {this.detailLevelText}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.rootDisplay.destroy();
    this.detailLevelText.destroy();

    super.destroy();
  }
}