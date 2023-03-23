import { BitFlags, FSComponent, MapLayer, MapLayerProps, MapProjection, MapProjectionChangeType, Subject, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { GNSMapModules } from './GNSMapSystem';

import './CompassNorthLayer.css';

/**
 * A map layer that displays the north compass arrow.
 */
export class CompassNorthLayer extends MapLayer<MapLayerProps<GNSMapModules>> {
  private readonly arrowEl = FSComponent.createRef<HTMLDivElement>();
  private readonly mapRotation = Subject.create(0);

  /** @inheritdoc */
  public onAttached(): void {
    this.mapRotation.map(SubscribableMapFunctions.withPrecision(1)).sub(rotation => {
      this.arrowEl.instance.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
    });
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.Rotation)) {
      this.mapRotation.set(mapProjection.getRotation() * Avionics.Utils.RAD2DEG);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-compass-north'>
        <div class='map-compass-north-arrow' ref={this.arrowEl}>
          <svg viewBox='0 0 24 24'>
            <path d='M 4 22 L 12 1 L 20 22 L 12 18 Z' stroke='black' stroke-width='4px' />
            <path d='M 4 22 L 12 1 L 20 22 L 12 18 Z' stroke='white' fill='black' stroke-width='1px' />
          </svg>
        </div>
        <div class='map-compass-north-label'>N</div>
      </div>
    );
  }
}