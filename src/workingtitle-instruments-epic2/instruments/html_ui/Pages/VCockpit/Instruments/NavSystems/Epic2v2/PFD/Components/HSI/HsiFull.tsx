import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import {
  AutopilotDataProvider, CompassRoseNumbers, CompassRoseTicks, HeadingBug, HeadingDataProvider, MapDataProvider, NavigationSourceDataProvider
} from '@microsoft/msfs-epic2-shared';

import { BearingPointer } from './BearingPointer';
import { CDI } from './CDI';

import './HsiFull.css';

/** The properties for the heading bug component. */
interface HsiFullProps {
  /** The radius of the compass. [pixels] */
  compassRadius: number;
  /** The map data provider. */
  mapDataProvider: MapDataProvider;
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
  /** The autopilot data provider to use. */
  autopilotDataProvider: AutopilotDataProvider;
  /** The navigation source data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
}

/** The HSI heding bug indicator. */
export class HsiFull extends DisplayComponent<HsiFullProps> {

  /** airplane size [pixels] */
  private readonly airplaneSize = 50;

  /** @inheritdoc */
  public onAfterRender(): void {
    //
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="hsi-full-container">
        <svg
          viewBox={`0 0 ${this.props.compassRadius * 2} ${this.props.compassRadius * 2}`}
          width={this.props.compassRadius * 2}
          height={this.props.compassRadius * 2}
        >
          <CompassRoseTicks
            svgViewBoxSize={this.props.compassRadius * 2}
            ticksRadius={this.props.compassRadius}
            shortTickLength={8}
            longTickLength={8}
            tickDirection={'Outwards'}
            withCircle={false}
            degreesPerTick={45}
          />
        </svg>
        <HeadingBug
          compassRadius={this.props.compassRadius - 2}
          headingDataProvider={this.props.headingDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
        />
        <svg
          viewBox={`0 0 ${this.props.compassRadius * 2} ${this.props.compassRadius * 2}`}
          width={this.props.compassRadius * 2}
          height={this.props.compassRadius * 2}
          style={{
            transformOrigin: '50% 50%',
            transform: this.props.mapDataProvider.compassRotation
              .map(rot => `rotate3d(0, 0, 1, ${rot * -1}deg)`),
          }}
        >
          <defs>
            <radialGradient id="compassShadow">
              <stop offset="70%" stop-color={'#000000'} stop-opacity={0} />
              <stop offset="100%" stop-color={'#000000'} stop-opacity={0.5} />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r={this.props.compassRadius} fill="url('#compassShadow')" />
          <CompassRoseTicks
            svgViewBoxSize={this.props.compassRadius * 2}
            ticksRadius={this.props.compassRadius}
            shortTickLength={8}
            longTickLength={16}
            tickDirection={'Inwards'}
            withCircle={true}
            degreesPerTick={5}
          />
        </svg>
        <div style={{
          position: 'absolute',
          'top': this.props.compassRadius + 'px',
          'left': this.props.compassRadius + 'px',
        }}>
          <CompassRoseNumbers
            svgViewBoxSize={this.props.compassRadius * 2}
            numbersRadius={this.props.compassRadius - 35}
            rotation={this.props.mapDataProvider.compassRotation}
            alignNumbers={'Ticks'}
            largeCardinalDirections={true}
          />
        </div>
        <img
          src={'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/pc12-airplane-map.png'}
          style={{
            position: 'absolute',
            top: this.props.compassRadius - (this.airplaneSize / 2) + 'px',
            left: this.props.compassRadius - (this.airplaneSize / 2) + 'px',
            width: this.airplaneSize + 'px',
            height: this.airplaneSize + 'px',
          }}
        />
        <CDI
          hsiMode='full'
          cdiType='primary'
          headingDataProvider={this.props.headingDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        />
        <CDI
          hsiMode='full'
          cdiType='preview'
          headingDataProvider={this.props.headingDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        />
        <BearingPointer
          hsiMode='full'
          pointerType='primary'
          headingDataProvider={this.props.headingDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        />
        <BearingPointer
          hsiMode='full'
          pointerType='secondary'
          headingDataProvider={this.props.headingDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        />
      </div>
    );
  }
}
