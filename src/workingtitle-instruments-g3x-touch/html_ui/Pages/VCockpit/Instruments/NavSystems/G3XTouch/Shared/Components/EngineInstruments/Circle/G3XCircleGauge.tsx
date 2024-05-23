import { DisplayComponent, Fragment, FSComponent, NodeReference, Subject, Subscription, VNode, XMLGaugeColorZone, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { G3XBaseGauge } from '../G3XBaseGauge';
import { G3XCircleGaugeProps } from '../../G3XGaugesConfigFactory/Gauges/G3XCircleGaugeProps';
import { G3XGaugeColorZoneColor } from '../../G3XGaugesConfigFactory';
import { G3XGaugeColorLine } from '../../G3XGaugesConfigFactory/Definitions/G3XGaugeColorLine';

import './G3XCircleGauge.css';

/**
 * The minimum and maximum values of an arc.
 */
type PathValues = {
  /** The minimum value. */
  min: number,
  /** The maximum value. */
  max: number,
  /** The color of the path. */
  color: string
}

/** A cartesian coordinate pair. */
type Cartesian = {
  /** X, indexed from top left. */
  x: number,
  /** Y, indexed from top left. */
  y: number
}

/** The geometry specification for a dial gauge's arc */
type ArcGeometry = {
  /** The origin point for the arcs. */
  origin: Cartesian,
  /** The radius of the color band arcs. */
  radius: number,
  /** The beginning angle. */
  beginAngle: number,
  /** The ending angle */
  endAngle: number
  /** The minimum value */
  minValue: Subject<number>,
  /** The maximum value */
  maxValue: Subject<number>
}

/** Color zone properties. */
interface ColorZoneProps {
  /** The geometry of the gauge. */
  geometry: ArcGeometry,
  /** The stroke width in pixels */
  stroke: number,
  /** The color zone configuration. */
  colorZones?: Array<XMLGaugeColorZone>
}

/**
 * A class that manages the logic for drawing the colored arcs on a dial gauge.
 */
class ColorZones extends DisplayComponent<ColorZoneProps & XMLHostedLogicGauge> {
  private readonly pathRefs = new Array<NodeReference<SVGPathElement>>();
  private readonly groupRef = FSComponent.createRef<SVGGElement>();
  private readonly pathValues = new Array<PathValues>();

  private readonly arcDegrees = this.props.geometry.endAngle - this.props.geometry.beginAngle;

  private minValue = 0;
  private maxValue = 0;

  private readonly subscriptions: Subscription[] = [];

  /** Set initial values then define and draw our color zones. */
  public onAfterRender(): void {
    this.subscriptions.push(this.props.geometry.minValue.sub(n => this.updateMinValue(n), true));
    this.subscriptions.push(this.props.geometry.maxValue.sub(n => this.updateMaxValue(n), true));

    if (this.props.colorZones) {
      for (let i = 0; i < this.props.colorZones.length; i++) {
        const zone = this.props.colorZones[i];
        const path = FSComponent.createRef<SVGPathElement>();
        this.pathRefs[i] = path;
        this.pathValues[i] = { min: 0, max: 0, color: zone.color !== undefined ? zone.color : 'white' };

        FSComponent.render(
          <path ref={path} stroke={this.pathValues[i].color} stroke-width={`${this.props.stroke}px`} />,
          this.groupRef.instance
        );

        if (zone.begin !== undefined) {
          this.pathValues[i].min = this.props.logicHost?.addLogicAsNumber(
            zone.begin,
            (begin: number) => {
              this.pathValues[i].min = begin;
              this.redrawArcs();
            },
            2,
            zone.smoothFactor
          );
        }
        if (zone.end !== undefined) {
          this.pathValues[i].max = this.props.logicHost?.addLogicAsNumber(
            zone.end,
            (end: number) => {
              this.pathValues[i].max = end;
              this.redrawArcs();
            },
            2,
            zone.smoothFactor
          );
        }
      }
      this.redrawArcs();
    }
  }

  /** Draw all the arc in our color zones. */
  private redrawArcs(): void {
    const valueRange = this.maxValue - this.minValue;

    for (let i = 0; i < this.pathRefs.length; i++) {
      let startAngle: number;
      let endAngle: number;

      if (valueRange === 0) {
        startAngle = this.props.geometry.beginAngle;
        endAngle = this.props.geometry.beginAngle;
      } else {
        startAngle = this.props.geometry.beginAngle +
          (((this.pathValues[i].min - this.minValue) / valueRange) * this.arcDegrees);
        endAngle = this.props.geometry.beginAngle +
          (((this.pathValues[i].max - this.minValue) / valueRange) * this.arcDegrees);
      }

      this.pathRefs[i].instance.setAttribute(
        'd',
        G3XCircleGauge.describeArc(
          this.props.geometry.origin,
          this.props.geometry.radius - this.props.stroke / 2,
          startAngle,
          endAngle
        )
      );
    }
  }

  /**
   * Update the maximum value.
   * @param max The new max value.
   */
  public updateMaxValue(max: number): void {
    this.maxValue = max;
    this.redrawArcs();
  }

  /**
   * Update the minimum value.
   * @param min The new min value.
   */
  public updateMinValue(min: number): void {
    this.minValue = min;
    this.redrawArcs();
  }

  /**
   * Render the gauge.
   * @returns A VNode
   */
  public render(): VNode {
    return <g class='color-zones' ref={this.groupRef} />;
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.subscriptions.forEach((subscription) => subscription.destroy());
  }
}

/** Properties for a color line component.  */
interface ColorLineProps extends Partial<G3XCircleGaugeProps> {
  /** The geometry of the gauge. */
  geometry: ArcGeometry,
  /** The color of the line. */
  color: string,
  /** Length of the line, in pixels. */
  length: number,
  /** Width of the line, in pixels. */
  width: number
  /** The position of the line. */
  position: CompositeLogicXMLElement
  /** An optional smoothing factor. */
  smoothFactor?: number
}

/** A single color line. */
class ColorLine extends DisplayComponent<ColorLineProps & XMLHostedLogicGauge> {
  private readonly lineRef = FSComponent.createRef<SVGLineElement>();
  private readonly arcDegrees = this.props.geometry.endAngle - this.props.geometry.beginAngle;
  private readonly subscriptions: Subscription[] = [];

  /** Set up position updates. */
  public onAfterRender(): void {
    if (this.props.position) {
      this.props.logicHost?.addLogicAsNumber(
        this.props.position,
        (position: number) => this.updatePosition(position),
        2,
        this.props.smoothFactor
      );
    }

    this.subscriptions.push(this.props.geometry.maxValue.sub(() => this.updatePosition(this.props.position.getValueAsNumber()), true));
    this.subscriptions.push(this.props.geometry.maxValue.sub(() => this.updatePosition(this.props.position.getValueAsNumber()), true));
  }

  /**
   * Update the position of the line.
   * @param position The new position.
   */
  private updatePosition(position: number): void {
    const rotation = this.props.geometry.beginAngle + ((position / (this.props.geometry.maxValue.get() - this.props.geometry.minValue.get())) * this.arcDegrees);
    this.lineRef.instance.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;
  }

  /**
   * Render a color line.
   * @returns A VNode
   */
  public render(): VNode {
    return (
      <Fragment>
        <line
          ref={this.lineRef}
          x1={this.props.geometry.origin.x} y1={this.props.geometry.origin.y - this.props.geometry.radius}
          x2={this.props.geometry.origin.x}
          y2={this.props.geometry.origin.y - this.props.geometry.radius + this.props.length}
          stroke={this.props.color} stroke-width={this.props.width}
          vector-effect='non-scaling-stroke'
          style={`transform-origin: ${this.props.geometry.origin.x}px ${this.props.geometry.origin.y}px`}
        />
      </Fragment>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.subscriptions.forEach((subscription) => subscription.destroy());
  }
}

/** props for the color line set */
interface ColorLineSetProps extends Partial<G3XCircleGaugeProps> {
  /** The geometry of the gauge. */
  geometry: ArcGeometry,
  /** The color lines. */
  colorLines?: Array<G3XGaugeColorLine>
}

/** Color lines on a cicular gauge. */
class ColorLines extends DisplayComponent<ColorLineSetProps & XMLHostedLogicGauge> {
  private readonly groupRef = FSComponent.createRef<SVGGElement>();

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.props.colorLines) {
      for (let i = 0; i < this.props.colorLines.length; i++) {
        FSComponent.render(
          <ColorLine
            logicHost={this.props.logicHost}
            geometry={this.props.geometry}
            color={this.props.colorLines[i].color}
            position={this.props.colorLines[i].position}
            smoothFactor={this.props.colorLines[i].smoothFactor}
            length={15} width={2}
          />,
          this.groupRef.instance
        );
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (<g class='color-lines' ref={this.groupRef} />);
  }
}

/** A new circular gauge */
export class G3XCircleGauge extends G3XBaseGauge<Partial<G3XCircleGaugeProps> & XMLHostedLogicGauge> {

  static readonly DEFAULT_ZONE_COLOR = 'var(--g3x-color-white)';

  private readonly radius = 70;
  private readonly whiteStrokeWidth = 3;
  private readonly origin: Cartesian = { x: this.radius, y: this.radius };
  private readonly arcRadius = this.radius - this.whiteStrokeWidth / 2;

  private geometry: ArcGeometry;

  // Engine 1
  private readonly footerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly value1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly relativeValue1Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly needle1Ref = FSComponent.createRef<SVGElement>();

  // Engine 2
  private readonly value2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly relativeValue2Ref = FSComponent.createRef<HTMLDivElement>();
  private readonly needle2Ref = FSComponent.createRef<SVGElement>();

  private readonly titleRef = FSComponent.createRef<HTMLDivElement>();
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly maxValue = Subject.create(0);
  private readonly minValue = Subject.create(0);

  private readonly beginAngle = this.props.style?.beginAngle !== undefined ? this.props.style.beginAngle - 90 : -105;
  private readonly endAngle = this.props.style?.endAngle !== undefined ? this.props.style.endAngle - 90 : 105;
  private readonly arcDegrees = this.endAngle - this.beginAngle;
  private readonly displayRelativeValue = !!this.props.style?.displayRelativeValue;

  private readonly value1ZoneColorSubject = Subject.create<G3XGaugeColorZoneColor | undefined>(undefined);
  private readonly value2ZoneColorSubject = Subject.create<G3XGaugeColorZoneColor | undefined>(undefined);


  protected readonly textColor1Subject = this.value1ZoneColorSubject.map(
    (zoneColor) => zoneColor === undefined
      ? G3XCircleGauge.DEFAULT_ZONE_COLOR
      : zoneColor === G3XGaugeColorZoneColor.Red
        ? 'var(--g3x-color-white)'
        : 'var(--g3x-color-black)'
  );
  protected readonly textColor2Subject = this.value2ZoneColorSubject.map(
    (zoneColor) => zoneColor === undefined
      ? G3XCircleGauge.DEFAULT_ZONE_COLOR
      : zoneColor === G3XGaugeColorZoneColor.Red
        ? 'var(--g3x-color-white)'
        : 'var(--g3x-color-black)'
  );

  protected readonly backgroundColor1Subject = this.value1ZoneColorSubject.map(
    (zoneColor) => zoneColor === undefined
      ? 'none'
      : zoneColor,
  );

  protected readonly backgroundColor2Subject = this.value2ZoneColorSubject.map(
    (zoneColor) => zoneColor === undefined
      ? 'none'
      : zoneColor,
  );

  /**
   * Create an XMLCircleGaugue.
   * @param props The properties for the gauge.
   */
  constructor(props: Partial<G3XCircleGaugeProps> & XMLHostedLogicGauge) {
    super(props);
    this.geometry = {
      origin: this.origin,
      radius: this.arcRadius,
      beginAngle: this.beginAngle,
      endAngle: this.endAngle,
      minValue: this.minValue,
      maxValue: this.maxValue
    };
  }

  /** @inheritDoc */
  protected initGauge(): void {
    if (this.props.value1) {
      this.updateValue1(this.props.logicHost?.addLogicAsNumber(
        this.props.value1,
        (value: number) => this.updateValue1(value),
        this.props.style?.valuePrecision ?? 2,
        this.props.smoothFactor
      ));
    }

    if (this.props.value2 && this.props.isTwinEngine) {
      this.updateValue2(this.props.logicHost?.addLogicAsNumber(
        this.props.value2,
        (value: number) => this.updateValue2(value),
        this.props.style?.valuePrecision ?? 2,
        this.props.smoothFactor
      ));
    }

    if (this.props.value1 || (this.props.value2 && this.props.isTwinEngine)) {
      if (this.props.maximum) {
        this.updateMaxValue(this.props.logicHost?.addLogicAsNumber(
          this.props.maximum,
          (max: number) => this.updateMaxValue(max),
          2,
          this.props.smoothFactor
        ));
      }
      if (this.props.minimum) {
        this.updateMinValue(this.props.logicHost?.addLogicAsNumber(
          this.props.minimum,
          (min: number) => this.updateMinValue(min),
          2,
          this.props.smoothFactor
        ));
      }
      if (this.props.redBlink) {
        this.props.logicHost?.addLogicAsNumber(
          this.props.redBlink,
          (value: number) => this.setAlertState(value),
          0
        );
      }
    }
  }

  /**
   * Update the value1.
   * @param value The new value to set.
   */
  public updateValue1(value: number): void {

    const clampedValue = Utils.Clamp(value, this.minValue.get(), this.maxValue.get());
    const relativeValue = clampedValue / (this.maxValue.get() - this.minValue.get());
    const rotation = this.beginAngle + (relativeValue * this.arcDegrees);
    this.needle1Ref.instance.style.transform = `rotate3d(0, 0, 1, ${rotation}deg)`;

    const textValue = this.precise(clampedValue);

    if (this.value1Ref.instance.textContent !== `${textValue}`) {
      this.value1Ref.instance.textContent = `${textValue}`;
    }

    const relativeTextValue = `${(relativeValue * 100).toFixed(0)}%`;
    if (this.displayRelativeValue && this.relativeValue1Ref.instance.textContent !== relativeTextValue) {
      this.relativeValue1Ref.instance.textContent = relativeTextValue;
    }

    if (this.props.colorZones) {
      let colorSet = false;
      for (const range of this.props.colorZones) {
        if (value >= range.begin.getValueAsNumber() && value <= range.end.getValueAsNumber() && this.mapColorToIsWarningZoneValue(range.color)) {
          this.value1ZoneColorSubject.set(range.color);
          colorSet = true;
          break;
        }
      }
      if (!colorSet) {
        this.value1ZoneColorSubject.set(undefined);
      }
    }
  }

  /**
   * Update the value2.
   * @param value The new value to set.
   */
  public updateValue2(value: number): void {

    const clampedValue = Utils.Clamp(value, this.minValue.get(), this.maxValue.get());
    const textValue = this.precise(clampedValue);
    const relativeValue = clampedValue / (this.maxValue.get() - this.minValue.get());
    const rotation = this.beginAngle + (relativeValue * this.arcDegrees);

    if (this.needle2Ref.instance) {
      this.needle2Ref.instance.style.transform = `rotate3d(0, 0, 1, ${-rotation}deg)`;
    }

    if (this.value2Ref.instance && this.value2Ref.instance.textContent !== `${textValue}`) {
      this.value2Ref.instance.textContent = `${textValue}`;
    }

    const relativeTextValue = `${(relativeValue * 100).toFixed(0)}%`;

    if (this.displayRelativeValue && this.relativeValue2Ref.instance && this.relativeValue2Ref.instance.textContent !== relativeTextValue) {
      this.relativeValue2Ref.instance.textContent = relativeTextValue;
    }

    if (this.props.colorZones) {
      let colorSet = false;
      for (const range of this.props.colorZones) {
        if (value >= range.begin.getValueAsNumber() && value <= range.end.getValueAsNumber() && this.mapColorToIsWarningZoneValue(range.color)) {
          this.value2ZoneColorSubject.set(range.color);
          colorSet = true;
          break;
        }
      }
      if (!colorSet) {
        this.value2ZoneColorSubject.set(undefined);
      }
    }
  }

  /**
   * Update the maximum value.
   * @param max The new max value.
   */
  public updateMaxValue(max: number): void {
    this.maxValue.set(max);
  }

  /**
   * Update the minimum value.
   * @param min The new min value.
   */
  public updateMinValue(min: number): void {
    this.minValue.set(min);
  }

  /**
   * Handle changes in the alert state.
   * @param alerting True if alerting.
   */
  private setAlertState(alerting: number): void {
    if (alerting !== 0) {
      this.titleRef.instance.style.animation = 'gauge-alert-blink-red 1s infinite step-end';
      this.footerRef.instance.style.animation = 'gauge-alert-blink-red 1s infinite step-end';
      this.value1Ref.instance.style.animation = 'gauge-alert-blink-red 1s infinite step-end';
    } else {
      this.titleRef.instance.style.animation = '';
      this.footerRef.instance.style.animation = '';
      this.value1Ref.instance.style.animation = '';
    }
  }

  /**
   * Given a cartesian origin and a set of polar coordinates, find the cartesian
   * point that represents the polar location in the cartesian grid.
   * @param center The cartesian center.
   * @param radius The radiun in pixels.
   * @param azimuth The angle coordinate in degrees.
   * @returns The cartesian point represented by the polar one.
   */
  public static polarToCartesian(center: Cartesian, radius: number, azimuth: number): Cartesian {
    const azimuthRad = (azimuth - 90) * Math.PI / 180.0;
    return {
      x: center.x + (radius * Math.cos(azimuthRad)),
      y: center.y + (radius * Math.sin(azimuthRad))
    };
  }


  /**
   * Construct an SVG path string for a given arc based on its coordinates and radius.
   @param center The cartesian center of the arc.
   * @param radius The radius in pixels.
   * @param startAngle The starting azimuth of the arc in degrees.
   * @param endAngle The final azimuth of the arc in degrees.
   * @returns A string describing an SVG path.
   */
  public static describeArc(center: Cartesian, radius: number, startAngle: number, endAngle: number): string {
    const start = G3XCircleGauge.polarToCartesian(center, radius, startAngle);
    const end = G3XCircleGauge.polarToCartesian(center, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(' ');
  }

  /**
   * Determine the height "below the line" of the arc in pixels.
   @param center The cartesian center of the arc.
   * @param radius The radius in pixels.
   * @param startAngle The starting azimuth of the arc in degrees.
   * @param endAngle The final azimuth of the arc in degrees
   * @returns An integer with the pixels.
   */
  public static heightOfArc(center: Cartesian, radius: number, startAngle: number, endAngle: number): number {
    return G3XCircleGauge.distanceFromYOrigin(center, radius, Math.max(Math.abs(startAngle), Math.abs(endAngle)));
  }

  /**
   * Determine how far from the Y origin a cartesian point is.
   * @param center The cartesian center.
   * @param radius The radius in pixels.
   * @param angle The angle in degrees.
   * @returns The distance from the origin in pixels.
   */
  public static distanceFromYOrigin(center: Cartesian, radius: number, angle: number): number {
    const theta = Math.abs(angle);
    const cos = Math.cos(theta * Avionics.Utils.DEG2RAD);
    return radius * cos;
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    const isTwin = !!this.props.isTwinEngine;
    let headerLabel = this.props.title;
    if (this.props.unit) {
      headerLabel += ` ${this.props.unit}`;
    }

    return (
      <div
        class={{
          'circle_gauge_container': true,
          twin: isTwin,
        }}
        ref={this.containerRef}
      >
        <div class={{
          'circle_gauge': !isTwin,
          'circle_gauge_1': isTwin,
        }}>
          {this.renderGaugeCopy(false, this.needle1Ref)}
        </div>
        {isTwin &&
          <div class='circle_gauge_2'>
            {this.renderGaugeCopy(true, this.needle2Ref)}
          </div>
        }
        <div
          class={{
            'footer': !isTwin,
            'footer_dual': isTwin,
          }}
        >
          <div
            class='footer_content'
            ref={this.footerRef}
            style={{
              color: this.textColor1Subject,
              background: this.backgroundColor1Subject
            }}
          >
            <div class='gauge_units'>
              {headerLabel}
            </div>
            <div class='gauge_values'>
              <div
                class='gauge_value'
                ref={this.value1Ref}
                {...isTwin ? {
                  color: this.textColor1Subject,
                  background: this.backgroundColor1Subject
                } : {}}
              />
              {isTwin && (
                <div
                  class='gauge_value'
                  ref={this.value2Ref}
                  {...isTwin ? {
                    color: this.textColor2Subject,
                    background: this.backgroundColor2Subject
                  } : {}}
                />
              )}
            </div>
          </div>
        </div>
        {this.props.style?.displayRelativeValue && <div class={{ 'relative_value': !isTwin, 'relative_value_left': isTwin }} ref={this.relativeValue1Ref} />}
        {this.props.style?.displayRelativeValue && isTwin && <div class='relative_value_right' ref={this.relativeValue2Ref} />}
      </div>
    );
  }

  /**
   * Render the SVG for the gauge.
   * @param mirror True if the gauge should be mirrored.
   * @param needleRef A reference to the needle.
   * @returns A VNode
   */
  private renderGaugeCopy(
    mirror: boolean,
    needleRef: NodeReference<SVGElement>,
  ): VNode {
    const ticks = new Array<number>();
    const maximum = this.props.maximum?.getValueAsNumber();
    const minimum = this.props.minimum?.getValueAsNumber();

    if (this.props.graduationLength !== undefined && maximum !== undefined && minimum !== undefined) {
      const graduations = Math.trunc((maximum - minimum) / this.props.graduationLength);
      if (graduations > 1) {
        const spacing = this.arcDegrees / graduations;
        for (let i = 1; i < graduations; i++) {
          ticks.push(this.beginAngle + spacing * i);
        }
      }
    }

    return <Fragment>
      <svg
        viewBox='0 0 140 140'
        style={{ transform: `scale(${mirror ? -1 : 1}, 1)` }}
      >
        <ColorZones
          logicHost={this.props.logicHost}
          geometry={{
            ...this.geometry,
            radius: this.arcRadius - 2
          }}
          colorZones={this.props.colorZones}
          stroke={7}
        />
        <path
          vector-effect='non-scaling-stroke'
          fill='none'
          stroke='white'
          stroke-width='3px'
          d={G3XCircleGauge.describeArc(this.origin, this.arcRadius, this.beginAngle, this.endAngle)}
        />
        <path vector-effect='non-scaling-stroke' class='inner_circle' d='M 70 70 m -7 0 a 7 7 78 0 1 14 0' />
        <g class='tick-marks'>
          {ticks.map((tick) => {
            const pointA = G3XCircleGauge.polarToCartesian(this.origin, this.arcRadius - 15, tick);
            const pointB = G3XCircleGauge.polarToCartesian(this.origin, this.arcRadius, tick);
            return <line
              x1={pointA.x}
              y1={pointA.y}
              x2={pointB.x}
              y2={pointB.y}
              vector-effect='non-scaling-stroke'
              stroke='white'
              stroke-width='1px'
              shape-rendering='crispEdges'
            />;
          })}
        </g>
        <ColorLines
          logicHost={this.props.logicHost}
          geometry={this.geometry}
          colorLines={this.props.colorLines}
        />
      </svg>
      <svg class='gauge_pointer' viewBox='0 0 140 140' ref={needleRef}>
        <path
          d={
            'M 65 70 A 1 1 0 0 0 75 70 L 71 8 L 69 8 L 65 70 Z'
          }
          fill='white'
        />
        <path
          d={
            'M 65 70 A 1 1 0 0 0 75 70 L 71 8 M 69 8 L 65 70 Z'
          }
          vector-effect='non-scaling-stroke'
          fill={'none'}
          stroke-width={0.5}
          stroke='black'
        />
      </svg>
    </Fragment>;
  }
}