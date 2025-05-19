import { EventBus, FSComponent, MapLayer, MapLayerProps, Subject, SVGUtils, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  AltitudeArc, AltitudeDataProvider, AutopilotDataProvider, CompassRoseNumbers, CompassRoseTicks, CurrentHeadingDisplay, HeadingBug, HeadingBugArrow,
  HeadingDataProvider, HeadingFailureFlag, InertialDataProvider, MapCompassArcMask, MapCompassOffset, MapDataProvider, MapSystemCommon,
  MfdAliasedUserSettingTypes, OutlinedElement
} from '@microsoft/msfs-epic2-shared';

import { RangeNumbers } from '../Components/RangeNumbers';

import './HdgTrkUpModeMapLayer.css';

/** The properties for the {@link HdgTrkUpModeMapLayer} component. */
interface HdgTrkUpModeMapLayerProps extends MapLayerProps<unknown> {
  /** The settings manager to use. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The event bus. */
  readonly bus: EventBus;
  /** The map data provider. */
  readonly mapDataProvider: MapDataProvider;
  /** The heading data provider to use. */
  readonly headingDataProvider: HeadingDataProvider;
  /** The heading data provider to use. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** The altitude data provider to use. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** The inertial data provider to use. */
  readonly inertialDataProvider: InertialDataProvider;
}

/** The HdgTrkUpModeMapLayer component. */
export class HdgTrkUpModeMapLayer extends MapLayer<HdgTrkUpModeMapLayerProps> {
  private readonly width = this.props.mapProjection.getProjectedSize()[0];
  private readonly height = this.props.mapProjection.getProjectedSize()[1];
  private readonly rangeRingRadius = MapSystemCommon.hdgTrkUpCompassRadius / 2;
  private readonly isHidden = Subject.create(true);
  private readonly compassSvgSize = this.width;
  private readonly half = this.compassSvgSize / 2;
  private readonly compassRotatingSvgRef = FSComponent.createRef<SVGElement>();
  private readonly hdgBugRef = FSComponent.createRef<HeadingBug>();

  private readonly targetProjectedOffsetY = this.props.settings.getSetting('vsdEnabled').map((v) => v ? 104 : MapSystemCommon.hdgTrkUpOffsetY);

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.isHidden.set(!isVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    const rangeRingGapAngle = 13;

    return (
      <div
        class={{
          'hdk-trk-up-overlay': true,
          'map-compass-overlay': true,
          'hidden': this.isHidden,
        }}
      >
        <MapCompassOffset compassSvgSize={this.compassSvgSize} targetProjectedOffsetY={this.targetProjectedOffsetY}>
          <HeadingFailureFlag headingDataProvider={this.props.headingDataProvider} isMfd={true} />
          <AltitudeArc
            bus={this.props.bus}
            compassRadius={MapSystemCommon.hdgTrkUpCompassRadius}
            range={this.props.settings.getSetting('mapRange')}
            autopilotDataProvider={this.props.autopilotDataProvider}
            altitudeDataProvider={this.props.altitudeDataProvider}
            inertialDataProvider={this.props.inertialDataProvider}
          />
          <MapCompassArcMask isEnabled={true} maskHeightPx={MapSystemCommon.mapCompassMaskHeight} innerHeightPx={this.compassSvgSize}>
            <HeadingBug
              compassRadius={MapSystemCommon.hdgTrkUpCompassRadius}
              headingDataProvider={this.props.headingDataProvider}
              autopilotDataProvider={this.props.autopilotDataProvider}
              screenAngleLimit={83}
              ref={this.hdgBugRef}
            />
            <svg
              ref={this.compassRotatingSvgRef}
              class="compass-circle-ticks"
              viewBox={`0 0 ${this.compassSvgSize} ${this.compassSvgSize}`}
              width={this.compassSvgSize}
              height={this.compassSvgSize}
              style={{
                position: 'absolute',
                transform: this.props.mapDataProvider.compassRotation
                  .map(rot => `rotate3d(0, 0, 1, ${rot * -1}deg)`),
              }}
            >
              <CompassRoseTicks
                svgViewBoxSize={this.compassSvgSize}
                ticksRadius={MapSystemCommon.hdgTrkUpCompassRadius}
                shortTickLength={6}
                longTickLength={12}
                tickDirection={'Inwards'}
                withCircle={true}
                degreesPerTick={5}
              />
            </svg>
            <CompassRoseNumbers
              svgViewBoxSize={this.compassSvgSize}
              numbersRadius={MapSystemCommon.hdgTrkUpCompassRadius - 27}
              rotation={this.props.mapDataProvider.compassRotation}
            />
          </MapCompassArcMask>
          <svg class="range-ring">
            <OutlinedElement
              tag="path"
              outlineClass="map-path-shadow"
              d={SVGUtils.describeArc(this.half, this.half, this.rangeRingRadius, 90 + (rangeRingGapAngle / 2), 270 - (rangeRingGapAngle / 2))}
            />
            <OutlinedElement
              tag="path"
              outlineClass="map-path-shadow"
              d={SVGUtils.describeArc(this.half, this.half, this.rangeRingRadius, 270 + (rangeRingGapAngle / 2), 90 - (rangeRingGapAngle / 2))}
            />
          </svg>
          <RangeNumbers
            range={this.props.settings.getSetting('mapRange')}
            rangeString={this.props.mapDataProvider.halfRangeNumber}
            rangeRingRadius={this.rangeRingRadius}
            bus={this.props.bus}
          />
          <CurrentHeadingDisplay headingDataProvider={this.props.headingDataProvider} />
          <HeadingBugArrow
            arrowDirection='down'
            arrowPosition='left'
            headingBugHidden={this.hdgBugRef.instance.hidden}
            headingBugDirection={this.hdgBugRef.instance.direction}
            headingBugColor={this.hdgBugRef.instance.color}
          />
          <HeadingBugArrow
            arrowDirection='down'
            arrowPosition='right'
            headingBugHidden={this.hdgBugRef.instance.hidden}
            headingBugDirection={this.hdgBugRef.instance.direction}
            headingBugColor={this.hdgBugRef.instance.color}
          />
        </MapCompassOffset>
      </div>
    );
  }
}
