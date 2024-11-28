import { EventBus, NavSourceId, NavSourceType, Subject } from '@microsoft/msfs-sdk';
import { Epic2ApPanelEvents, FlightDirectorCouplingFlags } from './Epic2ApPanelPublisher';
import { Epic2NavigationSourceEvents } from './Epic2NavSourceEvents';

/**
 * An Epic 2 autopilot/flight director nav source controller.
 */
export class Epic2APNavSourceController {

  private static Epic2DefaultNavSource: NavSourceId = { index: 1, type: NavSourceType.Gps };

  private couplingState = FlightDirectorCouplingFlags.Left;
  private leftPfdNavSource = Epic2APNavSourceController.Epic2DefaultNavSource;
  private rightPfdNavSource = Epic2APNavSourceController.Epic2DefaultNavSource;

  public readonly activeApNavSource = Subject.create(Epic2APNavSourceController.Epic2DefaultNavSource);

  /**
   * ctor
   * @param bus The Event Bus
   */
  constructor(private readonly bus: EventBus) {
    const sub = bus.getSubscriber<Epic2ApPanelEvents & Epic2NavigationSourceEvents>();
    sub.on('epic2_ap_fd_coupling').whenChanged().handle(this.onCouplingChanged);
    sub.on('epic2_navsource_course_needle_left_source').handle(this.onLeftPfdNavSourceChanged);
    sub.on('epic2_navsource_course_needle_right_source').handle(this.onRightPfdNavSourceChanged);
    this.update();
  }

  private onCouplingChanged = (coupling: FlightDirectorCouplingFlags): void => {
    this.couplingState = coupling;
    this.update();
  };

  private onLeftPfdNavSourceChanged = (navSource: NavSourceId): void => {
    this.leftPfdNavSource = navSource;
    this.update();
  };

  private onRightPfdNavSourceChanged = (navSource: NavSourceId): void => {
    this.rightPfdNavSource = navSource;
    this.update();
  };

  public handleToggleGpsDrivesNav1 = (): void => {
    //what to do when we receive a TOGGLE_GPS_DRIVES_NAV1 key event

    const topic = this.couplingState === FlightDirectorCouplingFlags.Left ? 'epic2_navsource_course_needle_left_source_set' : 'epic2_navsource_course_needle_right_source_set';
    const navSource: NavSourceId = { type: NavSourceType.Gps, index: 1 };

    if (this.activeApNavSource.get().type === NavSourceType.Gps) {
      navSource.type = NavSourceType.Nav;
    }

    this.bus.getPublisher<Epic2NavigationSourceEvents>().pub(topic, navSource, true, false);
  };

  public handleApNavSelectSet = (value: number): void => {
    //what to do when we receive a AP_NAV_SELECT_SET key event

    const topic = this.couplingState === FlightDirectorCouplingFlags.Left ? 'epic2_navsource_course_needle_left_source_set' : 'epic2_navsource_course_needle_right_source_set';
    const navSource: NavSourceId = { type: NavSourceType.Nav, index: value };
    this.bus.getPublisher<Epic2NavigationSourceEvents>().pub(topic, navSource, true, false);
  };

  /**
   * Update method when any source data changes.
   */
  private update(): void {
    this.activeApNavSource.set(this.couplingState === FlightDirectorCouplingFlags.Left ? this.leftPfdNavSource : this.rightPfdNavSource);
  }

}
