import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, NumberFormatter, ObjectSubject, SetSubject,
  Subject, Subscribable, SubscribableUtils, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { WaypointAlertingState, WaypointAlertStateEvent } from '../../../navigation/WaypointAlertComputer';
import { BearingDisplay } from '../../common/BearingDisplay';
import { NavStatusBoxDataProvider } from './NavStatusBoxDataProvider';

/**
 * The props for the NavStatusBoxDtkAlert component.
 */
export interface NavStatusBoxDtkAlertProps extends ComponentProps {
  /** A data provider for the alert display. */
  dataProvider: NavStatusBoxDataProvider;

  /** Whether to use magnetic bearings. */
  useMagnetic: Subscribable<boolean>;

  /** A mutable subscribable to bind to this component's active state. */
  isActive?: MutableSubscribable<boolean>;
}

/**
 * A component that alerts when the waypoint is about to change.
 */
export class NavStatusBoxDtkAlert extends DisplayComponent<NavStatusBoxDtkAlertProps> {
  private static readonly TRUE_COURSE = BasicNavAngleUnit.create(false);
  private static readonly MAG_COURSE = BasicNavAngleUnit.create(true);
  private static readonly COURSE_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '' });

  private static readonly SHOW_COURSE_STATES = [
    WaypointAlertingState.CourseInSeconds,
    WaypointAlertingState.CourseNow,
    WaypointAlertingState.LeftTurnInSeconds,
    WaypointAlertingState.LeftTurnNow,
    WaypointAlertingState.RightTurnInSeconds,
    WaypointAlertingState.RightTurnNow
  ];
  private static readonly SHOW_TIME_STATES = [
    WaypointAlertingState.CourseInSeconds,
    WaypointAlertingState.LeftTurnInSeconds,
    WaypointAlertingState.RightTurnInSeconds
  ];
  private static readonly SHOW_NOW_STATES = [
    WaypointAlertingState.CourseNow,
    WaypointAlertingState.LeftTurnNow,
    WaypointAlertingState.RightTurnNow
  ];

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['nav-status-alert']);

  private readonly beforeCourseText = Subject.create('');
  private readonly afterCourseText = Subject.create('');
  private readonly course = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  private readonly courseUnit = Subject.create(NavStatusBoxDtkAlert.MAG_COURSE);
  private readonly seconds = Subject.create<number>(0, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private isPaused = true;

  private alertStateSub?: Subscription;
  private courseSub?: Subscription;
  private timePipe?: Subscription;
  private secondsPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.courseSub = this.props.useMagnetic.sub(this.onUseMagneticChanged.bind(this), false, true);
    this.timePipe = this.props.dataProvider.waypointAlertTime.pipe(this.seconds, time => Math.floor(time.asUnit(UnitType.SECOND)), true);
    this.secondsPipe = this.seconds.pipe(this.afterCourseText, seconds => ` in ${isNaN(seconds) ? '_' : seconds} ${seconds === 1 ? 'second' : 'seconds'}`, true);
    this.alertStateSub = this.props.dataProvider.waypointAlertState.sub(this.onAlertStateChanged.bind(this), !this.isPaused, this.isPaused);
  }

  /**
   * Resumes this component. Once resumed, this component will automatically update.
   */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.alertStateSub?.resume(true);
  }

  /**
   * Pauses this component. This component will not update while it is paused.
   */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.alertStateSub?.pause();
    this.courseSub?.pause();
    this.timePipe?.pause();
    this.secondsPipe?.pause();
  }

  /**
   * Responds to when the waypoint alert state changes.
   * @param stateEvent The alert state change event.
   */
  private onAlertStateChanged(stateEvent: Readonly<WaypointAlertStateEvent>): void {
    const state = stateEvent.newState;

    this.courseSub?.pause();
    this.timePipe?.pause();
    this.secondsPipe?.pause();

    if (NavStatusBoxDtkAlert.SHOW_COURSE_STATES.includes(state)) {
      this.courseSub?.resume(true);
    } else {
      this.course.set(NaN);
    }

    if (NavStatusBoxDtkAlert.SHOW_TIME_STATES.includes(state)) {
      this.timePipe?.resume(true);
      this.secondsPipe?.resume(true);
    } else if (NavStatusBoxDtkAlert.SHOW_NOW_STATES.includes(state)) {
      this.afterCourseText.set(' now');
    } else {
      this.afterCourseText.set('');
    }

    switch (state) {
      case WaypointAlertingState.CourseInSeconds:
      case WaypointAlertingState.CourseNow:
        this.beforeCourseText.set('Next DTK ');
        break;
      case WaypointAlertingState.LeftTurnInSeconds:
      case WaypointAlertingState.LeftTurnNow:
        this.beforeCourseText.set('Turn left to ');
        break;
      case WaypointAlertingState.RightTurnInSeconds:
      case WaypointAlertingState.RightTurnNow:
        this.beforeCourseText.set('Turn right to ');
        break;
      case WaypointAlertingState.ArrivingAtWaypoint:
        this.beforeCourseText.set('Arriving at waypoint');
        break;
      case WaypointAlertingState.HoldDirect:
        this.beforeCourseText.set('Hold direct');
        break;
      case WaypointAlertingState.HoldTeardrop:
        this.beforeCourseText.set('Hold teardrop');
        break;
      case WaypointAlertingState.HoldParallel:
        this.beforeCourseText.set('Hold parallel');
        break;
    }

    const isActive = state !== WaypointAlertingState.None;

    this.rootStyle.set('display', isActive ? '' : 'none');
    this.rootCssClass.toggle('nav-status-alert-flash', isActive);
    this.props.isActive?.set(isActive);
  }

  /**
   * Responds to when whether to display magnetic course changes.
   * @param useMagnetic Whether to display magnetic course.
   */
  private onUseMagneticChanged(useMagnetic: boolean): void {
    if (useMagnetic) {
      this.course.set(this.props.dataProvider.waypointAlertState.get().courseMag ?? NaN);
      this.courseUnit.set(NavStatusBoxDtkAlert.MAG_COURSE);
    } else {
      this.course.set(this.props.dataProvider.waypointAlertState.get().course ?? NaN);
      this.courseUnit.set(NavStatusBoxDtkAlert.TRUE_COURSE);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='nav-status-alert-text'>
          <span>{this.beforeCourseText}</span>
          <BearingDisplay
            value={this.course}
            displayUnit={this.courseUnit}
            formatter={NavStatusBoxDtkAlert.COURSE_FORMATTER}
            hideDegreeSymbolWhenNan
            class='nav-status-alert-course'
          />
          <span>{this.afterCourseText}</span>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.alertStateSub?.destroy();
    this.courseSub?.destroy();
    this.timePipe?.destroy();

    super.destroy();
  }
}