import { BitFlags, FSComponent, MapDataIntegrityModule, MapLayer, MapLayerProps, MapProjection, MapProjectionChangeType, MapSystemKeys, VNode } from '@microsoft/msfs-sdk';

import './NoGpsPositionLayer.css';

/**
 * Required modules for the layer.
 */
interface RequiredModules {
  /** The map data integrity module. */
  [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule;
}

/**
 * A layer that displays the NO GPS POSITION banner when GPS integrity is lost.
 */
export class NoGpsPositionLayer extends MapLayer<MapLayerProps<RequiredModules>> {
  private readonly dataIntegrityModule = this.props.model.getModule(MapSystemKeys.DataIntegrity);
  private readonly el = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.dataIntegrityModule.gpsSignalValid.sub(valid => {
      if (valid) {
        this.el.instance.classList.add('hide-element');
      } else {
        this.el.instance.classList.remove('hide-element');
      }

      this.onMapProjectionChanged(this.props.mapProjection, MapProjectionChangeType.ProjectedSize);
    }, true);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    super.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      const size = mapProjection.getProjectedSize();
      this.el.instance.style.width = `${size[0]}px`;
      this.el.instance.style.height = `${size[1]}px`;

      this.el.instance.style.paddingTop = `${(size[1] / 2) - 8}px`;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-no-gps-position' ref={this.el}>NO GPS POSITION</div>
    );
  }
}