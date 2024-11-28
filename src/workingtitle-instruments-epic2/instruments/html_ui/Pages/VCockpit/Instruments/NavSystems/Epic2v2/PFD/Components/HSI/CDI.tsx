import { DisplayComponent, FSComponent, MappedSubject, VNode, VorToFrom } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApLateralMode, Epic2Colors, HeadingDataProvider, NavigationSourceDataProvider } from '@microsoft/msfs-epic2-shared';

import './CDI.css';

/** The type definition for HSI Mode */
export type HsiMode = 'partial' | 'full';

/** The type definition for CDI Type  */
export type CdiType = 'primary' | 'preview';

/** The CDI needle paths type definition. */
type CdiNeedlePaths = {
  /** The needle head SVG path */
  head: string;
  /** The needle tail SVG path */
  tail: string;
  /** The needle deviaiton bar SVG path */
  deviationBar: string;
  /** The needle to-arrow SVG path */
  toArrow: string;
  /** The needle from-arrow SVG path */
  fromArrow: string;
}

/** The properties for the CDI component. */
interface CDIProps {
  /** The HSI mode. */
  hsiMode: HsiMode;
  /** The CDI type. */
  cdiType: CdiType;
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
  /** The autopilot data provider to use. */
  autopilotDataProvider: AutopilotDataProvider;
  /** The navigation source data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
}

/** The CDI component. */
export class CDI extends DisplayComponent<CDIProps> {

  /** The needle from the navigation source data provider. */
  private readonly needle = this.props.cdiType === 'primary' ?
    this.props.navigationSourceDataProvider.courseNeedle.get() :
    this.props.navigationSourceDataProvider.ghostNeedle.get();

  /** The heading that the course needle is pointing towards. [magnetic heading, degrees] */
  private readonly course = this.needle.course.map(course => course);

  /** The deviation from the selected course. [dots]
   * negative: aircraft right of course, deviation indicator left of needle
   * positive: aircraft left of course, deviation indicator right of needle */
  private readonly deviation = this.needle.lateralDeviation.map(
    deviation => deviation === null ? null : deviation * 2
  );

  /** The direction flag status.
   * To: course is pointing toward nav aid (+/- 90 degrees)
   * From: course is pointing away from nav aid (+/- 90 degrees) */
  private readonly direction = this.needle.toFrom.map(toFrom => toFrom);

  /** The color of the CDI needle */
  private readonly cdiColor = this.props.cdiType === 'primary' ?
    this.props.navigationSourceDataProvider.navsourceTrackingState.map(state => {
      switch (state) {
        case 'Active':
          return Epic2Colors.magenta;
        case 'Armed':
          return Epic2Colors.cyan;
        default:
          return Epic2Colors.white;
      }
    }) :
    MappedSubject.create(
      ([previewSource, armedLateralMode]): string => {
        return armedLateralMode === Epic2ApLateralMode.Localiser && previewSource?.isLocalizer ?
          Epic2Colors.cyan :
          Epic2Colors.white;
      },
      this.needle.source,
      this.props.autopilotDataProvider.lateralArmed,
    );

  /** CDI SVG ref */
  private readonly cdiRef = FSComponent.createRef<SVGElement>();

  /** The needle paths for full, partial, primary, and preview modes */
  private readonly fullPrimary: CdiNeedlePaths = {
    head: 'm130 19.187-8 14.289h4.6406v66.055l3.3594-5.8086 3.3574 5.8086v-66.055h4.6426z',
    tail: 'm130 160.5-3.3594 5.8086v76.986l3.3594-5.8086 3.3574 5.8086v-76.986z',
    deviationBar: 'm130 96.502-3.3594 5.8086v61.186l3.3594-5.8086 3.3574 5.8086v-61.186z',
    toArrow: 'm130 76.726-8.2637 12.816h16.527z',
    fromArrow: 'm130 89.542 8.2637-12.816h-16.527z',
  };
  private readonly partialPrimary: CdiNeedlePaths = {
    head: 'm130-71.813-8 14.289h4.6406v144.8l3.3594-5.8086 3.3574 5.8086v-144.8h4.6426z',
    tail: 'm130 172.72-3.3594 5.8086-.00044 155.77 3.3594-5.8086 3.3574 5.8086.00044-155.77z',
    deviationBar: 'm130 84.252-3.3594 5.8086v85.685l3.3594-5.8086 3.3574 5.8086v-85.685z',
    toArrow: 'm130 66.244-8.2637 12.816h16.527z',
    fromArrow: 'm130 79.06-8.2637-12.816h16.527z',
  };
  private readonly fullPreview: CdiNeedlePaths = {
    head: 'm130 96.502v-40.039h-11.225l11.225-19.799v-17.477 17.477l11.225 19.799h-11.225',
    tail: 'm130 163.5v77.315',
    deviationBar: 'm130 160.5.00084-60.995',
    toArrow: 'm130 76.726-8.2637 12.816h16.527z',
    fromArrow: 'm130 89.542 8.2637-12.816h-16.527z',
  };
  private readonly partialPreview: CdiNeedlePaths = {
    head: 'm130 84.254v-114.7h-11.225l11.225-19.799v-17.258 17.258l11.225 19.799h-11.225',
    tail: 'm130 175.72.00075 159.48',
    deviationBar: 'm130 87.407v85.184',
    toArrow: 'm130 66.244-8.2637 12.816h16.527z',
    fromArrow: 'm130 79.06-8.2637-12.816h16.527z',
  };

  private readonly needlePaths: CdiNeedlePaths = this.props.hsiMode === 'full' ?
    this.props.cdiType === 'primary' ? this.fullPrimary : this.fullPreview :
    this.props.cdiType === 'primary' ? this.partialPrimary : this.partialPreview;

  /**
   * The angle by which to rotate the CDI about the center of the compass.
   * = 0 degrees: 12 o'clock (or straight ahead) position
   * > 0 degrees: clockwise
   * < 0 degrees: counterclockwise
   */
  private readonly cdiScreenRotationAngle = MappedSubject.create(
    ([course, magneticHeading]): number | null => {
      if (
        course === undefined ||
        course === null ||
        magneticHeading === null
      ) { return null; }
      let angle = course - magneticHeading;
      // Limit angle range: -180 to 180 degrees
      if (angle > 180) { angle -= 360; }
      if (angle < -180) { angle += 360; }
      return angle;
    },
    this.course,
    this.props.headingDataProvider.magneticHeading,
  );

  /** The amount by which to shift the direction flag along the course needle */
  private readonly directionFlagShift = this.cdiScreenRotationAngle.map(angle => {
    const shiftAmount = this.props.hsiMode === 'full' ? 94 : 115;
    const shift = angle !== null && (angle < -90 || 90 < angle) ? shiftAmount : 0;
    return 'translate(0 ' + shift + ')';
  });

  /** The lateral position of the deviation bar from the center of the course needle. [SVG coordinates] */
  private readonly deviationBarScreenPosition = this.deviation.map(deviation => {
    if (deviation === null) { return null; }
    // Limit bar position
    if (deviation > 2.5) { deviation = 2.5; }
    if (deviation < -2.5) { deviation = -2.5; }
    // convert from NM to SVG coordinates
    return deviation * 34;
  });

  /** The CSS transform for the course deviation bar. */
  private readonly deviationBarTransform = this.deviationBarScreenPosition.map(position => {
    if (position === null) { position = 0; } // center the bar
    return 'translate(' + position + ' 0)';
  });

  /** @inheritdoc */
  public onAfterRender(): void {

    // Set CDI center of rotation
    this.cdiRef.instance.style.transformOrigin = '50% 50%';

    // Update CDI rotation
    this.cdiScreenRotationAngle.sub((angle) => {
      if (angle === null) { angle = 0; }  // point to top top of screen
      this.cdiRef.instance.style.transform = `rotate3d(0, 0, 1, ${angle}deg)`;
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'cdi-container': true,
        'cdi-primary': this.props.cdiType === 'primary' ? true : false,
        'cdi-preview': this.props.cdiType === 'preview' ? true : false,
        hidden: this.props.cdiType === 'primary' ? false : this.needle.source.map(source => source === null ? true : false)
      }}>
        <svg
          ref={this.cdiRef}
          width={130 * 2}
          height={130 * 2}
          viewBox={`0 0 ${130 * 2} ${130 * 2}`}
        >
          <g class={{
            'cdi-dots': true,
            hidden: this.props.cdiType === 'primary' ? false : true
          }}>
            <circle cx={130 - (34 * 2)} cy={130} r={5} />
            <circle cx={130 - 34} cy={130} r={5} />
            <circle cx={130 + 34} cy={130} r={5} />
            <circle cx={130 + (34 * 2)} cy={130} r={5} />
          </g>
          <g
            class={{
              'hidden': this.cdiScreenRotationAngle.map(angle => angle === null ? true : false)
            }}
            style={{
              fill: this.props.cdiType === 'primary' ? this.cdiColor : 'none',
              stroke: this.props.cdiType === 'primary' ? 'rgba(0, 0, 0, .8)' : this.cdiColor,
            }}
          >
            <path d={this.needlePaths.head} />
            <path d={this.needlePaths.tail} />
            <g
              class='cdi-direction-flag'
              style={{
                stroke: this.props.hsiMode === 'full' || this.props.cdiType === 'preview' ? this.cdiColor : 'rgba(0, 0, 0, .8)',
                fill: this.cdiColor,
              }}
              transform={this.directionFlagShift}
            >
              <path
                class={{ hidden: this.direction.map(dir => dir === VorToFrom.TO ? false : true) }}
                d={this.needlePaths.toArrow}
              />
              <path
                class={{ hidden: this.direction.map(dir => dir === VorToFrom.FROM ? false : true) }}
                d={this.needlePaths.fromArrow}
              />
            </g>
            <path
              class={{
                'cdi-deviation-bar': true,
                'hidden': this.deviationBarScreenPosition.map(position => position === null ? true : false),
              }}
              transform={this.deviationBarTransform}
              d={this.needlePaths.deviationBar}
            />
          </g>
        </svg>
      </div>
    );
  }
}
