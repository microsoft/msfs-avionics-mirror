import {
  ComponentProps, DisplayComponent, EventBus, FlightPlannerEvents, FSComponent, GPSSatComputerEvents, GPSSystemState, LNavDataEvents, NavMath, NodeReference,
  NumberFormatter, Subject, VNode
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

/**
 * Props on the ArcCdi component.
 */
interface ArcCdiProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the FMS. */
  fms: Fms;
}

/**
 * A component that displays the CDI on the arc map page.
 */
export abstract class ArcCdi extends DisplayComponent<ArcCdiProps> {
  protected readonly toFlag = FSComponent.createRef<SVGPathElement>();
  protected readonly fromFlag = FSComponent.createRef<SVGPathElement>();
  protected readonly rightArrow = FSComponent.createRef<SVGPathElement>();
  protected readonly leftArrow = FSComponent.createRef<SVGPathElement>();
  protected readonly needle = FSComponent.createRef<HTMLElement>();
  protected readonly xtkLabelLeft = FSComponent.createRef<HTMLElement>();
  protected readonly xtkLabelRight = FSComponent.createRef<HTMLElement>();

  private currentBearing = 0;
  private currentDtk = 0;
  private currentXtk = 0;
  private cdiScale = 2;
  private hasActiveLeg = false;

  private readonly toFlagVisible = Subject.create(false);
  private readonly fromFlagVisible = Subject.create(false);
  private readonly rightArrowVisible = Subject.create(false);
  private readonly leftArrowVisible = Subject.create(false);
  private readonly needleVisible = Subject.create(false);
  protected readonly xtkLabel = Subject.create('');

  private readonly xtkLabelFormatter = NumberFormatter.create({ precision: 0.1, maxDigits: 3 });
  private gpsIsValid = false;

  protected abstract cdiWidth: number;

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<LNavDataEvents & FlightPlannerEvents & GPSSatComputerEvents>();
    sub.on('lnavdata_cdi_scale').whenChanged().handle(this.onCdiScaleChanged.bind(this));
    sub.on('lnavdata_dtk_true').withPrecision(0).handle(this.onDtkChanged.bind(this));
    sub.on('lnavdata_waypoint_bearing_true').withPrecision(0).handle(this.onWaypointBearingChanged.bind(this));
    sub.on('lnavdata_xtk').withPrecision(3).atFrequency(6).handle(this.onXtkChanged.bind(this));
    sub.on('lnavdata_xtk').withPrecision(1).atFrequency(6).handle(xtk => this.xtkLabel.set(this.xtkLabelFormatter(Math.abs(xtk))));
    sub.on('fplActiveLegChange').handle(this.onActiveLegChanged.bind(this));

    this.toFlagVisible.sub(this.setElementVisibility(this.toFlag), true);
    this.fromFlagVisible.sub(this.setElementVisibility(this.fromFlag), true);
    this.rightArrowVisible.sub(this.setElementVisibility(this.rightArrow), true);
    this.rightArrowVisible.sub(this.setElementVisibility(this.xtkLabelRight), true);
    this.leftArrowVisible.sub(this.setElementVisibility(this.leftArrow), true);
    this.leftArrowVisible.sub(this.setElementVisibility(this.xtkLabelLeft), true);
    this.needleVisible.sub(this.setElementVisibility(this.needle), true);

    sub.on('gps_system_state_changed_1').handle(state => {
      this.gpsIsValid = state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired;
      this.onWaypointBearingChanged(this.currentBearing);
      this.onXtkChanged(this.currentXtk);
    });
  }

  /**
   * Handles when the bearing to the current waypoint changes.
   * @param bearing The new bearing to the current waypoint, in degrees true.
   */
  private onWaypointBearingChanged(bearing: number): void {
    if (this.hasActiveLeg && this.gpsIsValid) {
      const angleDiff = NavMath.diffAngle(this.currentDtk, bearing);
      if (Math.abs(angleDiff) <= 90) {
        this.toFlagVisible.set(true);
        this.fromFlagVisible.set(false);
      } else {
        this.fromFlagVisible.set(true);
        this.toFlagVisible.set(false);
      }
    } else {
      this.toFlagVisible.set(false);
      this.fromFlagVisible.set(false);
    }

    this.currentBearing = bearing;
  }

  /**
   * Handles when the CDI scale changes.
   * @param cdiScale The new CDI scale, in nautical miles.
   */
  private onCdiScaleChanged(cdiScale: number): void {
    this.cdiScale = cdiScale;
    this.onXtkChanged(this.currentXtk);
  }

  /**
   * Handles when the XTK changes.
   * @param xtk The new XTK, in nautical miles.
   */
  private onXtkChanged(xtk: number): void {
    if (this.hasActiveLeg && this.gpsIsValid) {
      if (Math.abs(xtk) <= this.cdiScale) {
        this.needleVisible.set(true);
        this.leftArrowVisible.set(false);
        this.rightArrowVisible.set(false);

        const mid = (this.cdiWidth / 2);
        const percentScale = -xtk / this.cdiScale;
        const centerPos = mid + (percentScale * mid);
        const leftPos = centerPos - 3;

        this.needle.instance.style.transform = `translate3d(${leftPos}px, 0, 0)`;
      } else if (xtk > this.cdiScale) {
        this.needleVisible.set(false);
        this.leftArrowVisible.set(true);
        this.rightArrowVisible.set(false);
      } else if (xtk < -this.cdiScale) {
        this.needleVisible.set(false);
        this.leftArrowVisible.set(false);
        this.rightArrowVisible.set(true);
      } else {
        this.needleVisible.set(false);
        this.leftArrowVisible.set(false);
        this.rightArrowVisible.set(false);
      }
    } else {
      this.needleVisible.set(false);
      this.leftArrowVisible.set(false);
      this.rightArrowVisible.set(false);
    }

    this.currentXtk = xtk;
  }

  /**
   * Creates a function that sets element visibility.
   * @param el The element to apply to.
   * @returns The built function.
   */
  private setElementVisibility(el: NodeReference<HTMLElement | SVGElement>): (isVisible: boolean) => void {
    return (isVisible) => {
      if (isVisible) {
        el.instance.classList.remove('hide-element');
      } else {
        el.instance.classList.add('hide-element');
      }
    };
  }

  /**
   * Handles when the DTK changes.
   * @param dtk The new DTK, in degrees true.
   */
  private onDtkChanged(dtk: number): void {
    this.currentDtk = dtk;
    this.onWaypointBearingChanged(this.currentBearing);
  }

  /**
   * Handles when the active leg changes.
   */
  private onActiveLegChanged(): void {
    if (this.props.fms.hasPrimaryFlightPlan() && this.props.fms.getPrimaryFlightPlan().length > 1) {
      this.hasActiveLeg = true;
    } else {
      this.hasActiveLeg = false;
    }

    this.onWaypointBearingChanged(this.currentBearing);
    this.onXtkChanged(this.currentXtk);
  }

  /** @inheritdoc */
  public abstract render(): VNode;
}