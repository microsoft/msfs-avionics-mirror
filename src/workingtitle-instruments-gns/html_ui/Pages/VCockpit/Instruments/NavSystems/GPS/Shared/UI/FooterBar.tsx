import {
  ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FlightPlanner, FSComponent, GNSSEvents, MagVar, Subject, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { ObsSuspModes, WaypointAlertComputer, WaypointAlertCourseType, WaypointAlertingState } from '@microsoft/msfs-garminsdk';

import { GnsObsEvents } from '../Navigation/GnsObsEvents';
import { GNSType } from '../UITypes';
import { PageIndicator } from './PageIndicator';
import { AlertMessageEvents, AlertsSubject, GNSAlertState } from './Pages/Dialogs/AlertsSubject';
import { SelectedCDIDisplaySource } from './SelectedCDIDisplaySource';

import './FooterBar.css';
import { GnsCdiMode } from '../Instruments/CDINavSource';

/**
 * Props on the FooterBarProps component.
 */
interface FooterBarProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,

  /** The type of GNS, 430 or 530. */
  gnsType: GNSType;

  /** Whether the owning instrument is the primary GPS */
  isPrimaryInstrument: boolean;

  /** Subject containing the current instrument-local CDI source */
  gnsCdiMode: Subscribable<GnsCdiMode>;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** The msg system */
  alerts: AlertsSubject;
}

/**
 * A component that displays the footer bar along the bottom of the GNS.
 */
export class FooterBar extends DisplayComponent<FooterBarProps> {
  private readonly pageIndicator = FSComponent.createRef<PageIndicator>();
  private readonly cdiEl = FSComponent.createRef<SelectedCDIDisplaySource>();
  private readonly obsLabel = FSComponent.createRef<HTMLDivElement>();
  private readonly obsLabelText = Subject.create('OBS');
  private msgRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.bus.getSubscriber<AlertMessageEvents>().on('alerts_status').handle(this.setMsgStatus.bind(this));

    this.props.bus.getSubscriber<GnsObsEvents>().on('obs_susp_mode').handle((mode) => {
      let showLabel = false;
      let labelText = 'OBS';

      switch (mode) {
        case ObsSuspModes.OBS:
          showLabel = true;
          labelText = 'OBS';
          break;
        case ObsSuspModes.SUSP:
          showLabel = true;
          labelText = 'SUSP';
          break;
        default:
        case ObsSuspModes.NONE:
          showLabel = false;
          break;
      }

      this.obsLabel.instance.classList.toggle('hidden-element', !showLabel);
      this.obsLabelText.set(labelText);
    });
  }

  /**
   * Handles when the page is changed.
   * @param index The new page index.
   */
  public onPageChanged(index: number): void {
    this.pageIndicator.instance.setPage(index);
  }

  /**
   * Handles when the page group is changed.
   * @param label The new page group label.
   * @param pages The new page group total number of pages.
   */
  public onPageGroupChanged(label: string, pages: number): void {
    this.pageIndicator.instance.setGroupData(label, pages);
  }

  /**
   * Sets the MSG text animation state.
   * @param state either the message is flashing or not
   */
  public setMsgStatus(state: GNSAlertState): void {
    switch (state) {
      case GNSAlertState.NEW_ALERTS:
        this.msgRef.instance.classList.remove('hidden-element');
        this.msgRef.instance.classList.add('selected-yellow');
        break;
      case GNSAlertState.PERSISTENT_ALERTS:
        this.msgRef.instance.classList.remove('hidden-element');
        this.msgRef.instance.classList.remove('selected-yellow');
        break;
      default:
        this.msgRef.instance.classList.remove('selected-yellow');
        this.msgRef.instance.classList.add('hidden-element');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <SelectedCDIDisplaySource
          ref={this.cdiEl}
          bus={this.props.bus}
          gnsCdiMode={this.props.gnsCdiMode}
        />
        <div class='obs-label hidden-element' ref={this.obsLabel}>{this.obsLabelText}</div>
        <div class='msg-label'>
          <span ref={this.msgRef} class='msg-yellow-box hidden-element'>
            MSG
          </span>
        </div>
        <PageIndicator ref={this.pageIndicator} />
        <WaypointAlerter bus={this.props.bus} gnsType={this.props.gnsType} flightPlanner={this.props.flightPlanner} />
      </>
    );
  }
}

/**
 * The props for the WaypointAlerter component.
 */
interface WaypointAlerterProps extends ComponentProps {

  /** An instance of the event bus. */
  bus: EventBus;

  /** The type of GNS unit displaying this component. */
  gnsType: GNSType;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;
}

/**
 * A component that alerts when the waypoint is about to change.
 */
export class WaypointAlerter extends DisplayComponent<WaypointAlerterProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly message = Subject.create('');

  private readonly magVar = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('magvar'), 0);
  private readonly alertComputer = new WaypointAlertComputer(this.props.bus, this.props.flightPlanner, 10);
  private readonly timeRemaining = Subject.create(NaN);

  private alertingState = WaypointAlertingState.None;
  private course? = NaN;
  private courseType? = WaypointAlertCourseType.DesiredTrack;

  private dtkFormatter = (dtk: number | undefined): string => {
    if (dtk === undefined) {
      return '___';
    }

    let rounded = Math.round(MagVar.trueToMagnetic(dtk, this.magVar.get()));
    rounded = rounded === 0 ? 360 : rounded;

    return `${rounded.toString().padStart(3, '0')}°`;
  };

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<ClockEvents>().on('realTime').handle(() => {
      this.alertComputer.update();
    });

    this.alertComputer.timeRemaining.sub(v => this.timeRemaining.set(Math.ceil(v.number)));
    this.alertComputer.onStateChanged.on((s, ev) => {
      this.alertingState = ev.newState;
      this.course = ev.course;
      this.courseType = ev.courseType;
    });

    this.timeRemaining.sub(() => this.onUpdated());
  }

  /**
   * Responds to changes in the distance remaining to the next egress transition.
   */
  private onUpdated(): void {
    if (this.alertingState !== WaypointAlertingState.None) {
      this.el.instance.classList.remove('hide-element');

      switch (this.alertingState) {
        case WaypointAlertingState.ArrivingAtWaypoint:
          if (this.timeRemaining.get() > 3) {
            this.el.instance.classList.add('flashing');
          } else {
            this.el.instance.classList.remove('flashing');
          }

          this.message.set(this.props.gnsType === 'wt430' ? 'ARRIVING WPT' : 'Arriving at waypoint');
          break;
        case WaypointAlertingState.CourseInSeconds:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `DTK ${this.dtkFormatter(this.course)} ${this.timeRemaining.get()} S`
            : `Next DTK ${this.dtkFormatter(this.course)} in ${this.timeRemaining.get()} sec`);
          break;
        case WaypointAlertingState.CourseNow:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `DTK ${this.dtkFormatter(this.course)} NOW`
            : `DTK ${this.dtkFormatter(this.course)} now`);
          break;
        case WaypointAlertingState.HoldDirect:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? 'HOLD DIRECT'
            : 'Hold direct');
          break;
        case WaypointAlertingState.HoldParallel:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? 'HOLD PARALLEL'
            : 'Hold parallel');
          break;
        case WaypointAlertingState.HoldTeardrop:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? 'HOLD TEARDROP'
            : 'Hold teardrop');
          break;
        case WaypointAlertingState.LeftTurnInSeconds:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `LT TO ${this.dtkFormatter(this.course)} ${this.timeRemaining.get()} S`
            : `Left to ${this.dtkFormatter(this.course)} in ${this.timeRemaining.get()} sec`);
          break;
        case WaypointAlertingState.LeftTurnNow:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `LT TO ${this.dtkFormatter(this.course)} NOW`
            : `Left to ${this.dtkFormatter(this.course)} now`);
          break;
        case WaypointAlertingState.ParallelTrackEnd:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `PTK END ${this.timeRemaining.get()} S`
            : `PTK end in ${this.timeRemaining.get()} sec`);
          break;
        case WaypointAlertingState.RightTurnInSeconds:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `RT TO ${this.dtkFormatter(this.course)} ${this.timeRemaining.get()} S`
            : `Right to ${this.dtkFormatter(this.course)} in ${this.timeRemaining.get()} sec`);
          break;
        case WaypointAlertingState.RightTurnNow:
          this.el.instance.classList.add('flashing');
          this.message.set(this.props.gnsType === 'wt430'
            ? `RT TO ${this.dtkFormatter(this.course)} NOW`
            : `Right to ${this.dtkFormatter(this.course)} now`);
          break;
      }
    } else {
      this.el.instance.classList.add('hide-element');
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class='waypoint-alerter hide-element' ref={this.el}>{this.message}</div>
    );
  }
}
