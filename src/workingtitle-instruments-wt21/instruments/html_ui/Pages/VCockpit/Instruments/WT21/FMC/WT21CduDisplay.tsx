import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MfdDisplayMode, MFDUserSettings } from '@microsoft/msfs-wt21-shared';

import { FmcPageEvent, FmcPrevNextEvent, FmcSelectKeysEvent } from './FmcEvent';
import { FmcSelectWptPopup } from './Framework/FmcSelectWptPage';
import { AtcControlPage } from './Pages/AtcControlPage';
import { CommunicationTypePage } from './Pages/CommunicationTypePage';
import { DatabasePage } from './Pages/DatabasePage';
import { DataLinkMenuPage } from './Pages/DataLinkMenuPage';
import { DefaultsPage } from './Pages/DefaultsPage';
import { DefinePilotWptPage } from './Pages/DefinePilotWptPage';
import { DepArrPage } from './Pages/DepArrPage';
import { DirectToHistoryPage } from './Pages/DirectToHistoryPage';
import { DirectToPage } from './Pages/DirectToPage';
import { DisplayMenu } from './Pages/DisplayMenuPage';
import { FixInfoPage } from './Pages/FixInfo/FixInfoPage';
import { FlightLogPage } from './Pages/FlightLogPage';
import { FplnHoldPage } from './Pages/FplnHoldPage';
import { FplnPage } from './Pages/FplnPage';
import { FrequencyPage } from './Pages/FrequencyPage';
import { FuelMgmtPage } from './Pages/FuelMgmtPage';
import { GNSS1POSPage } from './Pages/GNSS1POSPage';
import { GNSSCTLPage } from './Pages/GNSSCTLPage';
import { HoldListPage } from './Pages/HoldListPage';
import { IndexPage } from './Pages/IndexPage';
import { LegsPage } from './Pages/LegsPage';
import { MCDUMenuPage } from './Pages/MCDUMenuPage';
import { MessagesPage } from './Pages/MessagesPage';
import { MFDAdvPage } from './Pages/MFDAdvPage';
import { NearestAirportsPage } from './Pages/NearestAirportsPage';
import { PerfInitPage } from './Pages/PerfInitPage';
import { PerfMenuPage } from './Pages/PerfMenuPage';
import { PilotWptListPage } from './Pages/PilotWptListPage';
import { PosInitPage } from './Pages/PosInitPage';
import { ProgPage } from './Pages/ProgPage';
import { RouteMenuPage } from './Pages/RouteMenuPage';
import { StatusPage } from './Pages/StatusPage';
import { TCASPage } from './Pages/TCASPage';
import { TunePage } from './Pages/TunePage';
import { UserSettingsPage } from './Pages/UserSettingsPage';
import { VNAVSetupPage } from './Pages/VNAVSetupPage';
import { VORDMECTLPage } from './Pages/VORDMECTLPage';
import { WeatherPage } from './Pages/WeatherPage';
import { WeatherRequestTermWxPage } from './Pages/WeatherRequestTermWxPage';
import { WeatherViewSingleTermWxPage } from './Pages/WeatherViewSingleTermWxPage';
import { WeatherViewTermWxPage } from './Pages/WeatherViewTermWxPage';
import { WT21_FMC_Instrument } from './WT21_FMC_Instrument';
import { WT21FmcScreen } from './WT21FmcScreen';
import { WT21Fms } from './FlightPlan/WT21Fms';

/**
 * Props for {@link WT21CduDisplay}
 */
export interface WT21CduDisplayProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,

  /**
   * The FMC base instrument
   * @deprecated
   */
  baseInstrument: WT21_FMC_Instrument,

  /** The fms */
  fms: WT21Fms,

  /** The fmc index */
  fmcIndex: 1 | 2,
}

/**
 * WT21 CDU display
 */
export class WT21CduDisplay extends DisplayComponent<WT21CduDisplayProps> {
  private readonly root = FSComponent.createRef<HTMLDivElement>();

  private readonly mfdSettings = MFDUserSettings.getMasterManager(this.props.bus);

  public fmcScreen: WT21FmcScreen | undefined;

  /** @inheritDoc */
  public override onAfterRender(): void {
    this.fmcScreen = new WT21FmcScreen(this.props.bus, this.props.baseInstrument, this.props.fms, this.props.fmcIndex, this.root.instance);

    this.fmcScreen.addLskEvents([
      [FmcSelectKeysEvent.LSK_1, 2, 0], [FmcSelectKeysEvent.RSK_1, 2, 1],
      [FmcSelectKeysEvent.LSK_2, 4, 0], [FmcSelectKeysEvent.RSK_2, 4, 1],
      [FmcSelectKeysEvent.LSK_3, 6, 0], [FmcSelectKeysEvent.RSK_3, 6, 1],
      [FmcSelectKeysEvent.LSK_4, 8, 0], [FmcSelectKeysEvent.RSK_4, 8, 1],
      [FmcSelectKeysEvent.LSK_5, 10, 0], [FmcSelectKeysEvent.RSK_5, 10, 1],
      [FmcSelectKeysEvent.LSK_6, 12, 0], [FmcSelectKeysEvent.RSK_6, 12, 1],
    ]);

    this.fmcScreen.addPagingEvents({
      pageLeft: FmcPrevNextEvent.BTN_PREV,
      pageRight: FmcPrevNextEvent.BTN_NEXT,
    });

    this.fmcScreen.onPrefixedEvent('scratchpad_type').handle((char) => {
      this.fmcScreen?.scratchpad.typeContents(char);
    });

    this.fmcScreen.onPrefixedEvent('clear_del').handle(() => {
      if (this.fmcScreen?.scratchpad) {
        if (this.fmcScreen.scratchpad.contents.get().length > 0) {
          this.fmcScreen.scratchpad.backspace();
        } else {
          this.fmcScreen.scratchpad.delete();
        }
      }
    });

    this.fmcScreen.onPrefixedEvent('clear_del_long').handle(() => {
      if (this.fmcScreen?.scratchpad) {
        this.fmcScreen.scratchpad.clear(true);
      }
    });

    this.fmcScreen?.onPrefixedEvent(FmcPageEvent.PAGE_MFDDATA).handle(() => {
      const setting = this.mfdSettings.getSetting(`mfdDisplayMode_${this.props.fmcIndex}`);

      if (setting.get() === MfdDisplayMode.Map) {
        setting.set(MfdDisplayMode.Text);
      } else {
        setting.set(MfdDisplayMode.Map);
      }
    });
  }

  /**
   * Method to be called after the plugin system is initialized
   */
  public afterPluginSystemInitialized(): void {
    if (!this.fmcScreen) {
      return;
    }

    this.fmcScreen.processPluginPageAdditions();

    this.fmcScreen.addPageRoute('/mcdu-menu', MCDUMenuPage, FmcPageEvent.PAGE_MCDUMENU);
    this.fmcScreen.addPageRoute('/index', IndexPage, FmcPageEvent.PAGE_INDEX);
    this.fmcScreen.addPageRoute('/status', StatusPage, FmcPageEvent.PAGE_STATUS);
    this.fmcScreen.addPageRoute('/pos-init', PosInitPage, FmcPageEvent.PAGE_POSINIT);
    this.fmcScreen.addPageRoute('/route', FplnPage, FmcPageEvent.PAGE_FPLN);
    this.fmcScreen.addPageRoute('/fpln-hold', FplnHoldPage);
    this.fmcScreen.addPageRoute('/hold-list', HoldListPage);
    this.fmcScreen.addPageRoute('/tune/1', TunePage, FmcPageEvent.PAGE_TUNE);
    this.fmcScreen.addPageRoute('/tune/2', TunePage); // FIXME why is this duplicated?
    this.fmcScreen.addPageRoute('/atc', AtcControlPage);
    this.fmcScreen.addPageRoute('/tcas', TCASPage);
    this.fmcScreen.addPageRoute('/legs', LegsPage, FmcPageEvent.PAGE_LEGS);
    this.fmcScreen.addPageRoute('/datalink-menu', DataLinkMenuPage, FmcPageEvent.PAGE_DATALINKMENU);
    this.fmcScreen.addPageRoute('/route-menu', RouteMenuPage);
    this.fmcScreen.addPageRoute('/dl-weather', WeatherPage);
    this.fmcScreen.addPageRoute('/dl-terminalwx-req', WeatherRequestTermWxPage);
    this.fmcScreen.addPageRoute('/dl-terminalwx-view', WeatherViewTermWxPage);
    this.fmcScreen.addPageRoute('/dl-terminalwx-single-view', WeatherViewSingleTermWxPage);
    this.fmcScreen.addPageRoute('/vor-dme-ctl', VORDMECTLPage);
    this.fmcScreen.addPageRoute('/gnss-ctl', GNSSCTLPage);
    this.fmcScreen.addPageRoute('/gnss1-pos', GNSS1POSPage);
    this.fmcScreen.addPageRoute('/freq', FrequencyPage, FmcPageEvent.PAGE_FREQ);
    this.fmcScreen.addPageRoute('/comm-type', CommunicationTypePage);
    this.fmcScreen.addPageRoute('/fix', FixInfoPage, FmcPageEvent.PAGE_FIX);
    this.fmcScreen.addPageRoute('/prog', ProgPage, FmcPageEvent.PAGE_PROG);
    this.fmcScreen.addPageRoute('/user-set', UserSettingsPage, FmcPageEvent.PAGE_USERSETTINGS);
    this.fmcScreen.addPageRoute('/perf-menu', PerfMenuPage, FmcPageEvent.PAGE_PERF);
    this.fmcScreen.addPageRoute('/perf-init', PerfInitPage, FmcPageEvent.PAGE_PERFINIT);
    this.fmcScreen.addPageRoute('/defaults', DefaultsPage, FmcPageEvent.PAGE_DEFAULTS);
    this.fmcScreen.addPageRoute('/vnav-setup', VNAVSetupPage, FmcPageEvent.PAGE_VNAVSETUP);
    this.fmcScreen.addPageRoute('/fuel-mgmt', FuelMgmtPage, FmcPageEvent.PAGE_FUELMGMT1);
    this.fmcScreen.addPageRoute('/flt-log', FlightLogPage, FmcPageEvent.PAGE_FLTLOG);
    this.fmcScreen.addPageRoute('/database', DatabasePage);
    this.fmcScreen.addPageRoute('/pilot-wpt-list', PilotWptListPage);
    this.fmcScreen.addPageRoute('/define-pilot-wpt', DefinePilotWptPage);
    this.fmcScreen.addPageRoute('/dep-arr', DepArrPage, FmcPageEvent.PAGE_DEPARRIDX);
    this.fmcScreen.addPageRoute('/dspl-menu-1', DisplayMenu, FmcPageEvent.PAGE_DSPLMENU1);
    this.fmcScreen.addPageRoute('/mfd-adv', MFDAdvPage, FmcPageEvent.PAGE_MFDADV);
    this.fmcScreen.addPageRoute('/direct-to', DirectToPage, FmcPageEvent.PAGE_DIR);
    this.fmcScreen.addPageRoute('/direct-to-history', DirectToHistoryPage);
    this.fmcScreen.addPageRoute('/nearest-airports', NearestAirportsPage);
    this.fmcScreen.addPageRoute('/msg', MessagesPage, FmcPageEvent.PAGE_MSG);
    this.fmcScreen.addPageRoute('/select-wpt', FmcSelectWptPopup);

    this.fmcScreen.processPluginPageReplacements();

    this.fmcScreen.navigateTo('/status');
  }

  /** @inheritDoc */
  public override render(): VNode | null {
    return (
      <div ref={this.root} id="fmc-container" />
    );
  }
}
