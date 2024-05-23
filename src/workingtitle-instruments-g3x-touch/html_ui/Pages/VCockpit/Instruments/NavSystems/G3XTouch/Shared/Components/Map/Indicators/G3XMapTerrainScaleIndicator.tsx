import { ComponentProps, DisplayComponent, FSComponent, NumberFormatter, SetSubject, Subscribable, Subscription, UnitType, VNode } from '@microsoft/msfs-sdk';

import { MapTerrainMode } from '@microsoft/msfs-garminsdk';

import { G3XNumberUnitDisplay } from '../../Common/G3XNumberUnitDisplay';

import './G3XMapTerrainScaleIndicator.css';

/**
 * Component props for G3XMapTerrainScaleIndicator.
 */
export interface G3XMapTerrainScaleIndicatorProps extends ComponentProps {
  /** The current map terrain mode. */
  terrainMode: Subscribable<MapTerrainMode>;
}

/**
 * Displays a terrain color scale for relative and ground terrain modes.
 */
export class G3XMapTerrainScaleIndicator extends DisplayComponent<G3XMapTerrainScaleIndicatorProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly rootCssClass = SetSubject.create(['map-terrainscale']);
  private readonly rootDisplay = this.props.terrainMode.map(
    terrainMode => terrainMode === MapTerrainMode.Relative || terrainMode === MapTerrainMode.Ground ? '' : 'none'
  ).pause();

  private readonly subscriptions: Subscription[] = [this.rootDisplay];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.rootDisplay.resume();

    this.subscriptions.push(
      this.props.terrainMode.sub(mode => {
        this.rootCssClass.toggle('map-terrainscale-rel', mode === MapTerrainMode.Relative);
        this.rootCssClass.toggle('map-terrainscale-ground', mode === MapTerrainMode.Ground);
      }, true)
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={{ 'display': this.rootDisplay }}>
        <div class='map-terrainscale-title'>Scale</div>
        <div class='map-terrainscale-scale terrainscale-rel'>
          <div class='map-terrainscale-color' style='background: #f80000' />
          <div class='map-terrainscale-color' style='background: #d2d200;'>
            <G3XNumberUnitDisplay
              value={UnitType.FOOT.createNumber(-100)}
              formatter={G3XMapTerrainScaleIndicator.FORMATTER}
              displayUnit={null}
              class='map-terrainscale-label'
            />
          </div>
          <div class='map-terrainscale-color map-terrainscale-color-last' style='background: #000000;'>
            <G3XNumberUnitDisplay
              value={UnitType.FOOT.createNumber(-1000)}
              formatter={G3XMapTerrainScaleIndicator.FORMATTER}
              displayUnit={null}
              class='map-terrainscale-label'
            />
          </div>
        </div>
        <div class='map-terrainscale-scale terrainscale-ground'>
          <div class='map-terrainscale-color' style='background: #f80000' />
          <div class='map-terrainscale-color' style='background: #000000;'>
            <G3XNumberUnitDisplay
              value={UnitType.FOOT.createNumber(400)}
              formatter={G3XMapTerrainScaleIndicator.FORMATTER}
              displayUnit={null}
              class='map-terrainscale-label'
            />
          </div>
          <div class='map-terrainscale-color' style='background: #000000;'>
            <G3XNumberUnitDisplay
              value={UnitType.FOOT.createNumber(-100)}
              formatter={G3XMapTerrainScaleIndicator.FORMATTER}
              displayUnit={null}
              class='map-terrainscale-label'
            />
          </div>
          <div class='map-terrainscale-color map-terrainscale-color-last' style='background: #000000;'>
            <G3XNumberUnitDisplay
              value={UnitType.FOOT.createNumber(-1000)}
              formatter={G3XMapTerrainScaleIndicator.FORMATTER}
              displayUnit={null}
              class='map-terrainscale-label'
            />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}