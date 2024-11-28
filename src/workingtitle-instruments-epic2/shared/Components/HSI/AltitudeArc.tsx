import {
  AffineTransformPathStream, ClockEvents, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, MutableSubscribable, Subject, SvgPathStream,
  VNode
} from '@microsoft/msfs-sdk';

import { AltitudeDataProvider } from '../../Instruments/AltitudeDataProvider';
import { AutopilotDataProvider } from '../../Instruments/AutopilotDataProvider';
import { InertialDataProvider } from '../../Instruments/InertialDataProvider';

import './AltitudeArc.css';

/** The properties for the altitude arc component. */
interface AltitudeArcProps {
  /** The event bus. */
  bus: EventBus;
  /** The radius of the compass. [pixels] */
  compassRadius: number;
  /** The radius of the range ring. [NM] */
  range: MutableSubscribable<number>;
  /** The autopilot data provider to use. */
  autopilotDataProvider: AutopilotDataProvider;
  /** The altitude data provider to use. */
  altitudeDataProvider: AltitudeDataProvider;
  /** The inertial data provider to use. */
  inertialDataProvider: InertialDataProvider;
}

/** The Altitude Arc. */
export class AltitudeArc extends DisplayComponent<AltitudeArcProps> {

  /** Altitude Arc Div ref */
  private altArcRef = FSComponent.createRef<HTMLDivElement>();

  /** SVG sizes */
  private readonly svgWidth = 200;  // pixels
  private readonly svgHeight = this.props.compassRadius + 10; // pixels

  // 10 Hz sim time subject
  private readonly simTime = ConsumerSubject.create(
    this.props.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(10, true), 0
  );

  /** groundspeed [NM/hour] */
  private readonly groundSpeed = Subject.create<number | null>(null);
  /** vertical speed [Ft/minute] */
  private readonly verticalSpeed = Subject.create<number | null>(null);
  /** altitude [Ft] */
  private readonly altitude = Subject.create<number | null>(null);
  /** selected altitude [Ft] */
  private readonly selectedAltitude = Subject.create<number | null>(null);

  /** Distance between the current aircraft position and the altitude arc [NM] */
  private readonly distanceToArc = MappedSubject.create(
    ([groundSpeed, verticalSpeed, altitude, selectedAltitude]): number | null => {

      /** return null in following conditions */
      if (
        groundSpeed === null ||
        verticalSpeed === null ||
        altitude === null ||
        selectedAltitude === null ||
        Math.abs(selectedAltitude - altitude) <= 50 ||
        Math.abs(verticalSpeed) <= 300
      ) { return null; }

      /** time will be negative if vertical speed is in the wrong direction for altitude capture */
      const timeToSelAlt = (selectedAltitude - altitude) / verticalSpeed; // [minutes]
      const distanceToSelAlt = groundSpeed * (timeToSelAlt / 60); // [NM]
      return distanceToSelAlt > 0 ? distanceToSelAlt : null;
    },
    this.groundSpeed,
    this.verticalSpeed,
    this.altitude,
    this.selectedAltitude,
  );

  /** returns the Y coordinate for the altitude arc screen position [pixels] */
  private readonly arcScreenPosition = MappedSubject.create(
    ([arcDistanceNM, rangeRingRadiusNM]): number | null => {
      if (arcDistanceNM === null) { return null; }
      const rangeRingRadiusPx = this.props.compassRadius / 2;  // [pixels]
      const arcDistancePx = (arcDistanceNM / rangeRingRadiusNM) * rangeRingRadiusPx;
      const yAircraftOriginPx = 332;  // pixels
      const yPosPx = yAircraftOriginPx - arcDistancePx; // pixels
      return yPosPx > -190 ? yPosPx : null; // return null if higher than top of screen
    },
    this.distanceToArc,
    this.props.range,
  );

  /** Array of arc segment start and stop angles [degrees] */
  private readonly arcSegmentAngles = [
    [-15, -12.5],
    [-10, -7.5],
    [-5, -2.5],
    [2.5, 5],
    [7.5, 10],
    [12.5, 15],
  ];

  // Path Streams
  private readonly svgPathStream = new SvgPathStream(0.01);
  private readonly transformPathStream = new AffineTransformPathStream(this.svgPathStream);

  /** @inheritdoc */
  public onAfterRender(): void {

    // Pull from data providers at set frequency to avoid updating altitutde arc more than necessary
    this.simTime.sub(() => {
      this.groundSpeed.set(this.props.inertialDataProvider.groundSpeed.get());
      this.verticalSpeed.set(this.props.altitudeDataProvider.verticalSpeed.get());
      this.altitude.set(this.props.altitudeDataProvider.altitude.get());
      this.selectedAltitude.set(this.props.autopilotDataProvider.selectedAltitude.get());
    }, true);

    // Hide/show and update screen position of altitude arc
    this.arcScreenPosition.sub((position) => {
      if (position === null) {
        this.altArcRef.instance.classList.add('hidden');
      } else {
        this.altArcRef.instance.classList.remove('hidden');
        this.altArcRef.instance.style.top = position + 'px';
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {

    // Draw arc segment paths
    const arcSegmentPaths: VNode[] = [];
    for (let i = 0; i < this.arcSegmentAngles.length; i++) {
      this.transformPathStream.resetTransform();
      this.transformPathStream.beginPath();
      this.transformPathStream.addTranslation(this.svgWidth / 2, this.svgHeight);   // move to center of rotation
      this.transformPathStream.addRotation(-90 * Avionics.Utils.DEG2RAD, 'before'); // rotate to 12 o-clock position
      this.transformPathStream.arc(
        0,
        0,
        this.props.compassRadius,
        this.arcSegmentAngles[i][0] * Avionics.Utils.DEG2RAD, // start angle
        this.arcSegmentAngles[i][1] * Avionics.Utils.DEG2RAD  // stop angle
      );  // draw arc segment
      arcSegmentPaths.push(<path d={this.svgPathStream.getSvgPath()} />);
    }

    return (
      <div ref={this.altArcRef} class='altitude-arc-container'>
        <svg
          width={this.svgWidth}
          height={this.svgHeight}
          viewBox={`0 0 ${this.svgWidth} ${this.svgHeight}`}
        >
          {arcSegmentPaths}
        </svg>
      </div>
    );
  }
}
