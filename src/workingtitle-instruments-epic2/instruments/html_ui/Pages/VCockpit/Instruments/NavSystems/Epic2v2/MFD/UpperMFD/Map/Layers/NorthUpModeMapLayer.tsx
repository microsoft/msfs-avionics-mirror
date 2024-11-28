import { EventBus, FSComponent, MapLayer, MapLayerProps, Subject, SVGUtils, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { MapDataProvider, MapSystemCommon, MfdAliasedUserSettingTypes, OutlinedElement } from '@microsoft/msfs-epic2-shared';

import { RangeNumbers } from '../Components/RangeNumbers';

import './NorthUpModeMapLayer.css';

/** The properties for the {@link NorthUpModeMapLayer} component. */
interface NorthUpModeMapLayerProps extends MapLayerProps<unknown> {
  /** The settings manager to use. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The event bus. */
  bus: EventBus;
  /** The map data provider. */
  readonly mapDataProvider: MapDataProvider;
}

/** The NorthUpModeMapLayer component. */
export class NorthUpModeMapLayer extends MapLayer<NorthUpModeMapLayerProps> {
  private readonly width = this.props.mapProjection.getProjectedSize()[0];
  private readonly height = this.props.mapProjection.getProjectedSize()[1];
  private readonly rangeRingRadius = MapSystemCommon.northUpCompassRadius;
  private readonly isHidden = Subject.create(true);
  private readonly isTrueNorth = Subject.create(false);

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.isHidden.set(!isVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    const rangeRingGapAngle = 6;

    return (
      <div class={{
        'north-up-overlay': true,
        'map-compass-overlay': true,
        'hidden': this.isHidden,
      }}>
        <div class="north-up-symbol">
          <div class={{
            'true-north-tag': true,
            'visibility-hidden': this.isTrueNorth.map(v => !v)
          }}>
            TRU
          </div>
          <svg
            class="north-up-arrow"
            viewBox="-4 -2 30 60"
            style={{
              width: '30px',
              height: '60px'
            }}
          >
            <path d="M 11 6 L 6 14 L 10 14 L 10 14 M 10 14 L 10 17 L 12 17 L 12 14 L 10 14 L 16 14 L 11 6 M 7 36 L 7 23 L 15 36 L 15 23 M 11 42 L 11 52" />
          </svg>
        </div>
        <svg class="range-ring">
          <OutlinedElement
            tag="path"
            outlineClass="map-path-shadow"
            d={SVGUtils.describeArc(this.width / 2, this.height / 2, this.rangeRingRadius, 90 + (rangeRingGapAngle / 2), 270 - (rangeRingGapAngle / 2))}
          />
          <OutlinedElement
            tag="path"
            outlineClass="map-path-shadow"
            d={SVGUtils.describeArc(this.width / 2, this.height / 2, this.rangeRingRadius, 270 + (rangeRingGapAngle / 2), 90 - (rangeRingGapAngle / 2))}
          />
        </svg>
        <RangeNumbers
          range={this.props.settings.getSetting('mapRange')}
          rangeString={this.props.mapDataProvider.rangeNumber}
          rangeRingRadius={this.rangeRingRadius}
          bus={this.props.bus}
        />
      </div>
    );
  }
}
