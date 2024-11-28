import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { UnsFmsConfigInterface } from '../Config/FmsConfigBuilder';
import { UnsFms } from '../Fms/UnsFms';
import { UnsPowerEvents } from '../WTUns1FsInstrument';
import { UnsAPDebugPage } from './Pages/UnsAPDebugPage';
import { UnsArrivalPage } from './Pages/UnsArrivalPage';
import { UnsDataMaintenancePage } from './Pages/UnsDataMaintenancePage';
import { UnsNavDataPage } from './Pages/UnsDataNavPage';
import { UnsDataPage } from './Pages/UnsDataPage';
import { UnsDeparturePage } from './Pages/UnsDeparturePage';
import { UnsDtoPage } from './Pages/UnsDtoPage';
import { UnsFplMenuPage } from './Pages/UnsFplMenuPage';
import { UnsFplPage } from './Pages/UnsFplPage';
import { UnsFuelOptionsPage } from './Pages/UnsFuelOptionsPage';
import { UnsFuelPage } from './Pages/UnsFuelPage';
import { UnsHoldFixPage } from './Pages/UnsHoldFixPage';
import { UnsHoldingPage } from './Pages/UnsHoldingPage';
import { UnsInitPage } from './Pages/UnsInitPage';
import { UnsLNavDebugPage } from './Pages/UnsLNavDebugPage';
import { UnsManeuverPage } from './Pages/UnsManeuverPage';
import { UnsMessagePage } from './Pages/UnsMessagePage';
import { UnsNavLegPage } from './Pages/UnsNavLegPage';
import { UnsNavPage } from './Pages/UnsNavPage';
import { UnsNormalListPage } from './Pages/UnsNormalListPage';
import { UnsPerfPage } from './Pages/UnsPerfPage';
import { UnsPowerFailPage } from './Pages/UnsPowerFailPage';
import { UnsPVorPage } from './Pages/UnsPVorPage';
import { UnsSelfTestPage } from './Pages/UnsSelfTestPage';
import { UnsTunePage } from './Pages/UnsTunePage';
import { UnsSoftwareVersionPage } from './Pages/UnsVersionPage';
import { UnsVnavPathPage } from './Pages/UnsVnavPathPage';
import { UnsWaypointIdentPage } from './Pages/UnsWaypointIdentPage';
import { UnsFmcEvents, UnsModeKey } from './UnsFmcEvents';
import { UnsFmcScreen } from './UnsFmcScreen';

import './UnsCduDisplay.css';

export enum UnsChars {
  ArrowLeft = '\u2190',
  ArrowUp = '\u2191',
  ArrowRight = '\u2192',
  ArrowDown = '\u2193',
  BoxedM = '\u24C2',
}

/**
 * Props for {@link UnsCduDisplay}
 */
export interface UnsCduDisplayProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,

  /** The FMS */
  fms: UnsFms,

  /** The FMS config */
  fmsConfig: UnsFmsConfigInterface,

  /** The FMS config errors map */
  fmsConfigErrors: ReadonlyMap<string, boolean>,
}

/**
 * UNS CDU display component
 */
export class UnsCduDisplay extends DisplayComponent<UnsCduDisplayProps> {
  private readonly powerPublisher = this.props.bus.getPublisher<UnsPowerEvents>();
  private readonly fmcScreenRef = FSComponent.createRef<HTMLDivElement>();

  private readonly cduPageOverlayContainerRef = FSComponent.createRef<HTMLDivElement>();

  private fmcScreen: UnsFmcScreen | undefined;

  private previousRoute = '';

  /** @inheritDoc */
  public override onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.fmcScreen = new UnsFmcScreen(
      this.props.bus,
      this.props.fms,
      this.cduPageOverlayContainerRef,
      this.props.fmsConfig,
      this.props.fmsConfigErrors,
      this.fmcScreenRef.instance,
    );

    this.props.bus.getSubscriber<UnsFmcEvents>().on('mode_key').handle(this.handleUnsFmcEvent.bind(this));

    this.fmcScreen && this.initialiseFmcScreen(this.fmcScreen);
  }

  /**
   * Initialises the FMC screen
   * @param fmcScreen The UnsFmcScreen instance
   */
  private initialiseFmcScreen(fmcScreen: UnsFmcScreen): void {
    fmcScreen.addLskEvents([
      ['lsk_1_l', 2, 0], ['lsk_1_r', 2, 1],
      ['lsk_2_l', 4, 0], ['lsk_2_r', 4, 1],
      ['lsk_3_l', 6, 0], ['lsk_3_r', 6, 1],
      ['lsk_4_l', 8, 0], ['lsk_4_r', 8, 1],
      ['lsk_5_l', 10, 0], ['lsk_5_r', 10, 1],
    ]);

    fmcScreen.addPagingEvents({
      pageLeft: 'prev_page',
      pageRight: 'next_page',
    });

    fmcScreen.addPageRoute('/self-test', UnsSelfTestPage);
    fmcScreen.addPageRoute('/init', UnsInitPage);
    fmcScreen.addPageRoute('/message', UnsMessagePage);
    fmcScreen.addPageRoute('/data', UnsDataPage);
    fmcScreen.addPageRoute('/data/maint', UnsDataMaintenancePage);
    fmcScreen.addPageRoute('/data/version', UnsSoftwareVersionPage);
    fmcScreen.addPageRoute('/data/nav', UnsNavDataPage);
    fmcScreen.addPageRoute('/nav', UnsNavPage);
    fmcScreen.addPageRoute('/nav/legs', UnsNavLegPage);
    fmcScreen.addPageRoute('/fuel', UnsFuelPage);
    fmcScreen.addPageRoute('/fuel-options', UnsFuelOptionsPage);
    fmcScreen.addPageRoute('/fpl', UnsFplPage);
    fmcScreen.addPageRoute('/fpl-menu', UnsFplMenuPage);
    fmcScreen.addPageRoute('/vnav-path', UnsVnavPathPage);
    fmcScreen.addPageRoute('/dto', UnsDtoPage);
    fmcScreen.addPageRoute('/perf', UnsPerfPage);
    fmcScreen.addPageRoute('/tune', UnsTunePage);
    fmcScreen.addPageRoute('/depart', UnsDeparturePage);
    fmcScreen.addPageRoute('/arrive', UnsArrivalPage);
    fmcScreen.addPageRoute('/maneuver', UnsManeuverPage);
    fmcScreen.addPageRoute('/hold-fix', UnsHoldFixPage);
    fmcScreen.addPageRoute('/hold-definition', UnsHoldingPage);
    fmcScreen.addPageRoute('/waypoint-ident', UnsWaypointIdentPage);
    fmcScreen.addPageRoute('/maneuver', UnsManeuverPage);
    fmcScreen.addPageRoute('/hold-fix', UnsHoldFixPage);
    fmcScreen.addPageRoute('/hold-definition', UnsHoldingPage);
    fmcScreen.addPageRoute('/pvor', UnsPVorPage);
    fmcScreen.addPageRoute('/normal-list', UnsNormalListPage);
    fmcScreen.addPageRoute('/power-fail', UnsPowerFailPage);
    // Debug pages
    fmcScreen.addPageRoute('/debug/ap', UnsAPDebugPage);
    fmcScreen.addPageRoute('/debug/lnav', UnsLNavDebugPage);

    this.props.bus.getSubscriber<UnsPowerEvents>().on('uns_power_fail').handle((duration) => {
      if (duration >= 7 * 60) {
        this.fmcScreen?.navigateTo('/self-test');
      } else {
        this.fmcScreen?.navigateTo('/power-fail', { duration });
      }

      this.fmcScreen?.setBrightness(1);
    });

    fmcScreen.navigateTo('/self-test');
  }

  /**
   * Handle an H event sent to this CDU
   * @param event The H event string
   */
  private handleUnsFmcEvent(event: (keyof UnsFmcEvents) | UnsModeKey): void {
    if (!this.fmcScreen) {
      return;
    }

    // TODO Inhibit function keys if currently on the initialization page until data has been accepted

    switch (event) {
      // ===================================
      // CONTROL KEY LOGIC (Ops Manual, p40)
      // ===================================
      case 'pwr_dim':
        // if power off
        //   SELF TEST page (6387)
        //   Animate tests
        // else
        //   Control window (6425) appears on right side of the active page with dimming and power options
        if (document.querySelector('#Electricity')?.classList.contains('hidden')) {
          this.powerPublisher.pub('set_uns_power', true);
          this.fmcScreen.navigateTo('/self-test');
        } else {
          this.fmcScreen.handlePowerDim();
        }

        break;
      case 'MSG':
        if (this.fmcScreen.currentRoute.get() !== '/message') {
          this.previousRoute = this.fmcScreen.currentRoute.get();
          // MESSAGE page (6361)
          this.fmcScreen.navigateTo('/message');
        } else {
          this.fmcScreen.navigateTo(this.previousRoute);
          this.previousRoute = '';
        }
        break;
      case 'LIST':
        this.fmcScreen.handleList();
        break;
      case 'MENU':
        // Applicable for the FUEL, FPL, and TUNE pages
        // FPL Menu pages (6375, 6377)
        this.props.bus.getPublisher<UnsFmcEvents>().pub('menu', undefined);
        break;
      case 'DATA':
        // DATA pages (6337, 6340, 6341, 6342)
        this.fmcScreen.navigateTo('/data');
        break;
      case 'NAV':
        // NAV pages (6343, 6344, 6365)
        this.fmcScreen.navigateTo('/nav');
        break;
      case 'VNAV':
        // VNAV PATH pages (6427)
        this.fmcScreen.navigateTo('/vnav-path');
        break;
      case 'DTO':
        // DTO pages (6367)
        this.fmcScreen.navigateTo('/dto');
        break;
      case 'FUEL':
        // FUEL pages (6415)
        this.fmcScreen.navigateTo('/fuel');
        break;
      case 'FPL':
        if (this.fmcScreen.currentRoute.get().includes('/fpl') && !this.fmcScreen.currentRoute.get().includes('/fpl-menu')) {
          // https://youtu.be/g4KGa-WiQrk?t=556
          this.props.bus.getPublisher<UnsFmcEvents>().pub('next_page', undefined);
        } else {
          // FPL pages (6371)
          this.fmcScreen.navigateTo('/fpl#1');
        }
        // FPL Summary page (6373)
        //   This page is accessed from the Flight Plan (FPL) mode by using the PREV and NEXT keys.
        //   The FPL SUMMARY page is located following the last flight plan page.
        break;
      case 'PERF':
        // PERF page (6379)
        this.fmcScreen.navigateTo('/perf');
        break;
      case 'TUNE':
        // TUNE page (6381)
        this.fmcScreen.navigateTo('/tune');
        break;
    }
  }

  /** @inheritDoc */
  public override render(): VNode | null {
    return (
      <>
        <div ref={this.fmcScreenRef} />

        <div id="fmc-container-underlay" ref={this.cduPageOverlayContainerRef} />
      </>
    );
  }
}
