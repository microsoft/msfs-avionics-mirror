import { EventBus, FSComponent, MapLayer, MapLayerProps, MappedSubject, Subject, SVGUtils, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  AutopilotDataProvider, CompassRoseNumbers, CompassRoseTicks, HeadingBug, HeadingBugArrow, HeadingDataProvider, HeadingFailureFlag, MapCompassArcMask,
  MapCompassOffset, MapDataProvider, MapSystemCommon, NavigationSourceDataProvider, OutlinedElement, PfdAliasedUserSettingTypes
} from '@microsoft/msfs-epic2-shared';

import { BearingPointer } from './BearingPointer';
import { CDI } from './CDI';
import { RangeNumber } from './RangeNumber';
import { TCASRing } from './TCASRing';

import './HsiMapLayer.css';

/** The properties for the {@link HsiMapLayer} component. */
interface HsiMapLayerProps extends MapLayerProps<unknown> {
  /** The settings manager to use. */
  readonly settings: UserSettingManager<PfdAliasedUserSettingTypes>;
  /** The event bus. */
  readonly bus: EventBus;
  /** The map data provider. */
  readonly mapDataProvider: MapDataProvider;
  /** The heading data provider to use. */
  readonly headingDataProvider: HeadingDataProvider;
  /** The autopilot data provider to use. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** The navigation source data provider to use. */
  readonly navigationSourceDataProvider: NavigationSourceDataProvider;
}

/** The HsiMapLayer component. */
export class HsiMapLayer extends MapLayer<HsiMapLayerProps> {
  private readonly width = this.props.mapProjection.getProjectedSize()[0];
  private readonly height = this.props.mapProjection.getProjectedSize()[1];
  private readonly rangeRingRadius = MapSystemCommon.hsiCompassRadius / 2;
  private readonly isHidden = Subject.create(true);
  private readonly isHeadingInvalid = this.props.headingDataProvider.trueHeading.map((v) => !v);
  private readonly compassSvgSize = this.width;
  private readonly half = this.compassSvgSize / 2;
  private readonly compassRotatingSvgRef = FSComponent.createRef<SVGElement>();
  private readonly hdgBugRef = FSComponent.createRef<HeadingBug>();

  /** The HSI map scale in px/NM. */
  private readonly mapScalePx = this.props.settings.getSetting('hsiRange').map((v) => MapSystemCommon.hsiCompassRadius / v);

  private readonly isTcasRingHidden = MappedSubject.create(
    ([trafficEnabled, range]) => !trafficEnabled || range >= 12.5,
    this.props.settings.getSetting('trafficEnabled'),
    this.props.settings.getSetting('hsiRange'),
  );

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.isHidden.set(!isVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    const rangeRingGapAngle = 30;

    return (
      <div
        class={{
          'hsi-map-overlay': true,
          'map-compass-overlay': true,
          'hidden': this.isHidden,
        }}
      >
        <MapCompassOffset compassSvgSize={this.compassSvgSize} targetProjectedOffsetY={MapSystemCommon.hsiOffsetY}>
          <HeadingFailureFlag headingDataProvider={this.props.headingDataProvider} isMfd={true} />
          <MapCompassArcMask isEnabled={true} maskHeightPx={MapSystemCommon.hsiCompassMaskHeight} maskWidth={'395px'} innerHeightPx={this.compassSvgSize} >
            <svg
              viewBox={`0 0 ${this.compassSvgSize} ${this.compassSvgSize}`}
              width={this.compassSvgSize}
              height={this.compassSvgSize}
            >
              <CompassRoseTicks
                svgViewBoxSize={this.compassSvgSize}
                ticksRadius={MapSystemCommon.hsiCompassRadius}
                shortTickLength={12}
                longTickLength={12}
                tickDirection={'Outwards'}
                withCircle={false}
                degreesPerTick={45}
              />
            </svg>
            <HeadingBug
              compassRadius={MapSystemCommon.hsiCompassRadius}
              headingDataProvider={this.props.headingDataProvider}
              autopilotDataProvider={this.props.autopilotDataProvider}
              screenAngleLimit={48}
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
                ticksRadius={MapSystemCommon.hsiCompassRadius}
                shortTickLength={12}
                longTickLength={24}
                tickDirection={'Inwards'}
                withCircle={true}
                degreesPerTick={5}
              />
            </svg>
            <div class={{ 'hidden': this.isHeadingInvalid }}>
              <CompassRoseNumbers
                svgViewBoxSize={this.compassSvgSize}
                numbersRadius={MapSystemCommon.hsiCompassRadius - 41}
                rotation={this.props.mapDataProvider.compassRotation}
                alignNumbers='Ticks'
              />
            </div>
          </MapCompassArcMask>
          <svg class="range-ring">
            <OutlinedElement
              tag="path"
              outlineClass="map-path-shadow"
              d={SVGUtils.describeArc(this.half, this.half, this.rangeRingRadius, 270 + (rangeRingGapAngle / 2), 90 - (rangeRingGapAngle / 2))}
            />
          </svg>
          <div class={{ 'hidden': this.isHeadingInvalid }}>
            <RangeNumber
              range={this.props.settings.getSetting('hsiRange')}
              rangeRingRadius={this.rangeRingRadius}
            />
          </div>
          <BearingPointer
            hsiMode='partial'
            pointerType='primary'
            headingDataProvider={this.props.headingDataProvider}
            navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          />
          <BearingPointer
            hsiMode='partial'
            pointerType='secondary'
            headingDataProvider={this.props.headingDataProvider}
            navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          />
          <CDI
            hsiMode='partial'
            cdiType='primary'
            headingDataProvider={this.props.headingDataProvider}
            autopilotDataProvider={this.props.autopilotDataProvider}
            navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          />
          <CDI
            hsiMode='partial'
            cdiType='preview'
            headingDataProvider={this.props.headingDataProvider}
            autopilotDataProvider={this.props.autopilotDataProvider}
            navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          />
          <TCASRing
            isHidden={this.isTcasRingHidden}
            mapScale={this.mapScalePx}
          />
          <HeadingBugArrow
            arrowDirection='left'
            arrowPosition='left'
            headingBugHidden={this.hdgBugRef.instance.hidden}
            headingBugDirection={this.hdgBugRef.instance.direction}
            headingBugColor={this.hdgBugRef.instance.color}
          />
          <HeadingBugArrow
            arrowDirection='right'
            arrowPosition='right'
            headingBugHidden={this.hdgBugRef.instance.hidden}
            headingBugDirection={this.hdgBugRef.instance.direction}
            headingBugColor={this.hdgBugRef.instance.color}
          />
        </MapCompassOffset>
        <div class="lat-dev-fail-parent-div">
          <svg
            class="lat-dev-failed-overlay"
            viewBox="-3 -3 159 32"
            style={{
              width: '159px',
              height: '32px',
              display: this.props.navigationSourceDataProvider.courseNeedle.get().lateralDeviation.map((v) => v === null ? 'block' : 'none'),
            }}
          >
            <path d="M 0 0 L 156 26 M 156 0 L 0 26" />
          </svg>
        </div>
      </div>
    );
  }
}
