import { ControlEvents, EventBus, EventSubscriber, NavEvents, NavSourceId, NavSourceType, Publisher, SimVarValueType, Subject } from '@microsoft/msfs-sdk';
import { GNSEvents } from '../GNSEvents';


/** Possible GNS CDI Modes */
export enum GnsCdiMode {
  VLOC,
  GPS
}

/**
 * An instrument that aggregates and manages CDI source navigation data.
 */
export class CDINavSource {

  private readonly nav1Source: NavSourceId = {
    type: NavSourceType.Nav,
    index: 1
  };
  private readonly nav2Source: NavSourceId = {
    type: NavSourceType.Nav,
    index: 2
  };
  private currentSource: NavSourceId = {
    type: NavSourceType.Nav,
    index: 1
  };

  private controlSub: EventSubscriber<GNSEvents>;
  private navEventPub: Publisher<NavEvents>;

  /**
   * Creates an instance of CDINavSource.
   * @param bus The event bus to use with this instance.
   * @param gnsCdiMode A subject identifying what the current CDI source for this instrument is.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly gnsCdiMode: Subject<GnsCdiMode>
  ) {

    this.bus.getSubscriber<NavEvents>().on('cdi_select').handle(source => {
      this.currentSource = source;
    });

    const gpsDrivesNav1 = SimVar.GetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool);
    this.bus.getPublisher<NavEvents>().pub('cdi_select', gpsDrivesNav1 ?
      {
        type: NavSourceType.Gps,
        index: 1
      }
      : {
        type: NavSourceType.Nav,
        index: 1
      },
      false,
      true);

    this.bus.getSubscriber<ControlEvents>().on('cdi_src_set').handle(this.handleSrcSet.bind(this));

    this.gnsCdiMode.sub(v => {
      SimVar.SetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool, v === GnsCdiMode.GPS);
    });

    this.controlSub = this.bus.getSubscriber<GNSEvents>();
    this.navEventPub = this.bus.getPublisher<NavEvents>();

    this.controlSub.on('set_ap_nav_source').handle(this.handleApNavSet.bind(this));

    this.controlSub.on('gns_cdi_mode').handle(v => {
      if (v.navIndex === 1) {
        this.nav1Source.type = v.gnsCdiMode === GnsCdiMode.GPS ? NavSourceType.Gps : NavSourceType.Nav;
      } else if (v.navIndex === 2) {
        this.nav2Source.type = v.gnsCdiMode === GnsCdiMode.GPS ? NavSourceType.Gps : NavSourceType.Nav;
      }

      if (v.navIndex === this.currentSource.index) {
        this.currentSource = v.navIndex === 1 ? this.nav1Source : this.nav2Source;
        this.navEventPub.pub('cdi_select', this.currentSource, false, true);
        SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, v.navIndex);
      }
    });
  }

  /**
   * Handle an AP nav set event.
   * @param index The index of the new AP nav source.
  .*/
  private handleApNavSet(index: number): void {

    if (index === 1) {
      this.currentSource = this.nav1Source;
    } else if (index === 2) {
      this.currentSource = this.nav2Source;
    }

    this.navEventPub.pub('cdi_select', this.currentSource, false, true);
    SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, index);
  }

  /**
   * Handles when the CDI source set event is recieved.
   * @param navSource The NavSourceId.
   */
  private handleSrcSet(navSource: NavSourceId): void {
    // const previousSourceType = this.currentSource.type;

    if (navSource.index === 1) {
      this.nav1Source.type = navSource.type;
      this.currentSource = this.nav1Source;
    } else if (navSource.index === 2) {
      this.nav2Source.type = navSource.type;
      this.currentSource = this.nav2Source;
    }
    this.navEventPub.pub('cdi_select', this.currentSource, false, true);
    SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, this.currentSource.index);
  }
}