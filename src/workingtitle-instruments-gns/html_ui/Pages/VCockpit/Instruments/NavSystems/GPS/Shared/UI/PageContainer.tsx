import {
  DefaultTcasAdvisoryDataProvider, DisplayComponent, Facility, FSComponent, GNSSEvents, GPSSatComputer, ICAO, LegDefinition, NearestContext,
  SubscribableSetEventType, VNode
} from '@microsoft/msfs-sdk';

import { Fms, FmsEvents, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { NavInfo } from '../../WT430/UI/Pages/Map/NavInfo';
import { ArcNavMap } from '../../WT530/UI/Pages/Map/ArcNavMap';
import { GNSSettingsProvider } from '../Settings/GNSSettingsProvider';
import { GNSType, PropsWithBus } from '../UITypes';
import { InteractionEvent } from './InteractionEvent';
import { AuxFlightPlanning } from './Pages/Auxiliary/AuxFlightPlanning';
import { AuxSetup1 } from './Pages/Auxiliary/AuxSetup1';
import { AuxSetup2 } from './Pages/Auxiliary/AuxSetup2';
import { AuxUtility } from './Pages/Auxiliary/AuxUtility';
import { ConfirmDialog } from './Pages/Dialogs/ConfirmDialog';
import { Dialog } from './Pages/Dialogs/Dialog';
import { DirectToDialog } from './Pages/Dialogs/DirectToDialog';
import { DupWaypoints } from './Pages/Dialogs/DupWaypoints';
import { MenuDialog } from './Pages/Dialogs/MenuDialog';
import { ObsDialog } from './Pages/Dialogs/ObsDialog';
import { TrafficAlertDialog } from './Pages/Dialogs/TrafficAlertDialog';
import { WaypointInfo } from './Pages/Dialogs/WaypointInfo';
import { FPLPage } from './Pages/FlightPlan/FPLPage';
import { GPSStatus } from './Pages/Map/GPSStatus';
import { StandardNavMap } from './Pages/Map/StandardNavMap';
import { TerrainMap } from './Pages/Map/TerrainMap';
import { TrafficMap } from './Pages/Map/TrafficMap';
import { NearestAirport } from './Pages/Nearest/NearestAirport';
import { NearestIntersection } from './Pages/Nearest/NearestIntersection';
import { NearestNdb } from './Pages/Nearest/NearestNdb';
import { NearestVor } from './Pages/Nearest/NearestVor';
import { MenuDefinition, MenuEntry, Page, PageGroup, ViewPresenter, ViewService } from './Pages/Pages';
import { ProcedurePage } from './Pages/Procedure/ProcedurePage';
import { WaypointPageGroup } from './Pages/Waypoint/WaypointPageGroup';
import { VnavPage } from './Pages/Vnav/VnavPage';
import { MessageDialog } from './Pages/Dialogs/MessageDialog';
import { AlertsSubject } from './Pages/Dialogs/AlertsSubject';
import { MainScreenOptions } from '../MainScreen';

/**
 * Props on the PageContainer component.
 */
interface PageContainerProps extends PropsWithBus {
  /** A callback called when the page group is changed. */
  onPageGroupChanged: (label: string, pages: number) => void;

  /** A callback called when the page is changed. */
  onPageChanged: (index: number) => void;

  /** Which type of GNS is in use. */
  gnsType: GNSType;

  /** Instance of FMS. */
  fms: Fms;

  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;

  /** Panel XML config document. */
  xmlConfig: Document;

  /** The GPS satellite position computer. */
  gpsSat: GPSSatComputer;

  /** An instance of the traffic system. */
  trafficSystem: TrafficSystem;

  /** the data array subject */
  alerts: AlertsSubject;

  /** The options for this GNS. */
  options: MainScreenOptions;
}

/**
 * An entry in the view page stack.
 */
interface PageStackEntry {
  /** The page group, if any. */
  pageGroup?: PageGroup;

  /** The page in the stack. */
  page: Page;

  /** Whether the entry is a dialog */
  isDialog?: boolean;
}

/**
 * A component that contains all the right side main screen pages.
 */
export class PageContainer extends DisplayComponent<PageContainerProps> implements ViewPresenter {
  private readonly pageGroups: PageGroup[] = [];
  private readonly pageGroupsByLabel = new Map<string, PageGroup>();

  private readonly pageStack: PageStackEntry[] = [];

  private readonly confirmDialog = FSComponent.createRef<ConfirmDialog>();
  private readonly waypointInfo = FSComponent.createRef<WaypointInfo>();
  private readonly dupWaypoints = FSComponent.createRef<DupWaypoints>();
  private readonly menuDialog = FSComponent.createRef<MenuDialog>();
  private readonly directToDialog = FSComponent.createRef<DirectToDialog>();
  private readonly obsDialog = FSComponent.createRef<ObsDialog>();

  private readonly trafficAlertDialog = FSComponent.createRef<TrafficAlertDialog>();
  private readonly tcasDataProvider = new DefaultTcasAdvisoryDataProvider(this.props.bus, this.props.trafficSystem);
  private currentGs = 0;
  private approachActive = false;
  private readonly messageDialog = FSComponent.createRef<MessageDialog>();

  private readonly screen = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    ViewService.setPresenter(this);
    FSComponent.visitNodes(node, childNode => {
      if (childNode.instance instanceof PageGroup) {
        this.pageGroupsByLabel.set(childNode.instance.props.label, childNode.instance);

        if (!childNode.instance.props.isDetached) {
          this.pageGroups.push(childNode.instance);
          if (this.pageStack.length === 0) {
            childNode.instance.resume();
            this.pageStack.push({ pageGroup: childNode.instance, page: childNode.instance.getPage(0) });
          }
        }

        return true;
      }

      return false;
    });

    this.screen.instance = document.querySelector('.mainscreen-right') as HTMLElement;

    //Handle the opening of the TA popup
    this.tcasDataProvider.taIntruders.sub((set, type) => {
      if (type === SubscribableSetEventType.Added
        && !this.pageGroupsByLabel.get('NAV')?.getPage(3).isActive
        && this.currentGs >= 30
        && !this.approachActive) {
        this.openDialog(this.trafficAlertDialog.instance);
      }
    });
    this.tcasDataProvider.init();

    this.props.bus.getSubscriber<GNSSEvents>().on('ground_speed').handle(gs => this.currentGs = gs);
    this.props.bus.getSubscriber<FmsEvents>().on('fms_flight_phase').handle(phase => this.approachActive = phase.isApproachActive);
  }

  /**
   * Intializes the page container.
   */
  public init(): void {
    const current = this.pageStack[this.pageStack.length - 1];
    if (current?.pageGroup !== undefined) {
      this.props.onPageGroupChanged(current.pageGroup.props.label, current.pageGroup.length);
      current.pageGroup.resume();
    }
  }

  /**
   * Handles when an interaction event is received.
   * @param evt The interaction event that was received.
   */
  public onInteractionEvent(evt: InteractionEvent): void {
    let handled = false;

    const current = this.pageStack[this.pageStack.length - 1];
    if (current?.pageGroup !== undefined) {
      handled = current.pageGroup.onInteractionEvent(evt);
    } else if (current?.page !== undefined) {
      handled = current.page.onInteractionEvent(evt);
    }

    if (!handled) {
      switch (evt) {
        case InteractionEvent.RightOuterInc:
          this.changePageGroup('inc');
          break;
        case InteractionEvent.RightOuterDec:
          this.changePageGroup('dec');
          break;
        case InteractionEvent.FPL:
          this.openPageGroup('FPL', false, 0);
          break;
        case InteractionEvent.VNAV:
          this.openPageGroup('VNAV', false, 0);
          break;
        case InteractionEvent.PROC:
          this.openPageGroup('PROC', false, 0);
          break;
        case InteractionEvent.CLR:
          this.back();
          break;
        case InteractionEvent.MSG:
          if (this.messageDialog.instance.isActive) {
            this.back();
            this.messageDialog.instance.onMessageDialogClosed();
          } else {
            this.openMessageDialog();
          }
          break;
        case InteractionEvent.DirectTo:
          if (this.directToDialog.instance.isActive) {
            this.back();
          } else {
            this.openDirectToDialogWithLeg();
          }
          break;
      }
    }
  }

  /**
   * Changes the active page group on the screen.
   * @param direction The direction to advance to.
   */
  private changePageGroup(direction: 'inc' | 'dec'): void {
    const current = this.pageStack[this.pageStack.length - 1];

    if (current?.pageGroup !== undefined && !current?.pageGroup.props.isDetached) {
      const currentGroupIndex = this.pageGroups.indexOf(current.pageGroup);
      const newGroupIndex = Utils.Clamp(currentGroupIndex + (direction === 'inc' ? 1 : -1), 0, this.pageGroups.length - 1);

      this.openPageGroup(this.pageGroups[newGroupIndex].props.label, true);
    }
  }

  /** @inheritdoc */
  public openPageGroup<T extends Page = Page>(group: string, replace: boolean, pageNumber?: number): T | undefined {
    const pageGroup = this.pageGroupsByLabel.get(group);

    if (pageGroup !== undefined) {
      const current = this.pageStack[this.pageStack.length - 1];
      if (current !== undefined) {
        // If we currently have a dialog open, we want to back out of it before opening the page group
        if (current.isDialog) {
          this.back();
          return this.openPageGroup(group, replace, pageNumber);
        }

        if (current.pageGroup !== undefined && current.pageGroup !== pageGroup) {
          current.pageGroup.suspend();

          if (pageGroup.props.isDetached && current.pageGroup.props.isDetached) {
            this.pageStack.pop();
          }
        } else {
          current.page.onSuspend();
        }
      }

      this.props.onPageGroupChanged(pageGroup.props.label, pageGroup.length);

      if (pageNumber !== undefined) {
        pageGroup.setPage(pageNumber);
      } else {
        pageGroup.resume();
      }

      const page = pageGroup.activePage as Page;
      if (replace) {
        this.pageStack[this.pageStack.length - 1] = { pageGroup, page };
      } else {
        this.pageStack.push({ pageGroup, page });
      }
      return page as T;
    }

  }

  /** @inheritdoc */
  public back(): void {
    if (this.pageStack.length > 1) {
      const currentPageEntry = this.pageStack.pop();

      if (currentPageEntry !== undefined) {
        if (currentPageEntry.pageGroup !== undefined) {
          currentPageEntry.pageGroup.suspend();
        } else {
          currentPageEntry.page.onSuspend();
        }
      }

      const pageEntry = this.pageStack[this.pageStack.length - 1];

      if (pageEntry !== undefined) {
        if (pageEntry.pageGroup !== undefined) {
          this.props.onPageGroupChanged(pageEntry.pageGroup.props.label, pageEntry.pageGroup.length);
          this.props.onPageChanged(pageEntry.pageGroup.indexOfPage(pageEntry.page));

          if (!(currentPageEntry?.page instanceof Dialog)) {
            pageEntry.pageGroup.resume();
          }

          pageEntry.pageGroup.activePage?.resumeAnimations();
        } else {
          if (!(pageEntry.page instanceof Dialog)) {
            pageEntry.page.onResume();
          }

          pageEntry.page.resumeAnimations();
        }
      }
    }
  }

  /** @inheritdoc */
  public default(): void {
    let current = this.pageStack.pop();
    while (current !== undefined) {
      if (current.pageGroup !== undefined) {
        current.pageGroup.suspend();
      } else {
        current.page.onSuspend();
      }

      current = this.pageStack.pop();
    }

    this.openPageGroup('NAV', false, 0);
  }

  /** @inheritdoc */
  public openConfirmDialog(title: string, body: string, resolve: (value: boolean | PromiseLike<boolean>) => void, reject: (reason: any) => void): void {
    try {
      this.confirmDialog.instance.setTitle(title);
      this.confirmDialog.instance.setBody(body);
      this.confirmDialog.instance.setResolve(val => {
        this.back();
        resolve(val);
      });

      this.openDialog(this.confirmDialog.instance);
    } catch (err) {
      reject(err);
    }
  }

  /** @inheritdoc */
  public openWaypointDialog(resolve: (value: Facility | PromiseLike<Facility>) => void, reject: (reason: any) => void): void {
    try {
      this.waypointInfo.instance.setResolve(val => {
        this.back();
        resolve(val);
      });

      this.openDialog(this.waypointInfo.instance);
    } catch (err) {
      reject(err);
    }
  }

  /** @inheritdoc */
  public openDupsDialog(ident: string, icaos: string[], resolve: (value: Facility | PromiseLike<Facility>) => void, reject: (reason: any) => void): void {
    try {
      this.dupWaypoints.instance.setIdent(ident);
      this.dupWaypoints.instance.setIcaos(icaos);
      this.dupWaypoints.instance.setResolve(val => {
        this.back();
        resolve(val);
      });

      this.openDialog(this.dupWaypoints.instance);
    } catch (err) {
      reject(err);
    }
  }

  /** @inheritDoc */
  public openDirectToDialogWithLeg(legDefinition?: LegDefinition): void {
    NearestContext.onInitialized(async () => {
      if (legDefinition) {
        const legFacilityIcao = legDefinition.leg.fixIcao;

        const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(legFacilityIcao), legFacilityIcao).catch((e) => {
          console.error('Could not get facility from leg fixIcao for opening DIRECT TO dialog. See error below');
          throw e;
        });

        this.directToDialog.instance.acceptPreviewFacility(facility, legDefinition);
        this.openDialog(this.directToDialog.instance);
      } else {
        if (this.props.gnsType === 'wt430') {
          this.props.onPageGroupChanged('DRCT', 1);
        }
        this.openDialog(this.directToDialog.instance);

      }
    });
  }

  /** @inheritDoc */
  public openDirectToDialogWithIcao(icao?: string): void {
    NearestContext.onInitialized(async () => {
      if (icao) {
        const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao).catch((e) => {
          console.error('Could not get facility from leg fixIcao for opening DIRECT TO dialog. See error below');
          throw e;
        });

        this.directToDialog.instance.acceptPreviewFacility(facility);
        this.openDialog(this.directToDialog.instance);
      } else {
        if (this.props.gnsType === 'wt430') {
          this.props.onPageGroupChanged('DRCT', 1);
        }
        this.openDialog(this.directToDialog.instance);

      }
    });
  }

  /** @inheritDoc */
  public openMessageDialog(): void {
    if (this.props.gnsType === 'wt430') {
      this.props.onPageGroupChanged('MSG', 1);
    }
    this.openDialog(this.messageDialog.instance);
  }

  /** @inheritDoc */
  public openObsDialog(): void {
    // noop
  }

  /**
   * Opens a dialog page.
   * @param dialog The dialog page to open.
   * @returns The currently open page, or undefined if none open.
   */
  private openDialog<T extends Dialog>(dialog: T): Page | undefined {
    this.screen.instance.removeChild(dialog.getRootElement());
    this.screen.instance.appendChild(dialog.getRootElement());

    const pageEntry = this.pageStack[this.pageStack.length - 1];
    if (pageEntry !== undefined) {
      pageEntry.page.freezeAnimations();
    }

    this.pageStack.push({ page: dialog, isDialog: true });
    dialog.onResume();

    return pageEntry?.page;
  }

  /** @inheritdoc */
  public openMenu(definition: MenuEntry[] | MenuDefinition, title?: string): MenuDialog {
    if (Array.isArray(definition)) {
      this.menuDialog.instance.setMenuItems(definition);
      if (title !== undefined) {
        this.menuDialog.instance.setTitle(title);
      }
    } else {
      definition.updateEntries();
      this.menuDialog.instance.setMenuItems(definition.entries);
      if (title !== undefined) {
        this.menuDialog.instance.setTitle(title);
      } else {
        this.menuDialog.instance.setTitle(definition.title);
      }
    }

    this.openDialog(this.menuDialog.instance);
    return this.menuDialog.instance;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        <PageGroup bus={this.props.bus} label='NAV' onPageChanged={this.props.onPageChanged}>
          {this.props.gnsType === 'wt530' ? (
            <ArcNavMap
              bus={this.props.bus}
              gnsType={this.props.gnsType}
              instrumentIndex={this.props.options.instrumentIndex}
              settingsProvider={this.props.settingsProvider}
              fms={this.props.fms}
              trafficSystem={this.props.trafficSystem}
              tcasDataProvider={this.tcasDataProvider}
            />
          ) : (
            <NavInfo
              gnsType={this.props.gnsType}
              bus={this.props.bus}
              fms={this.props.fms}
            />
          )}
          <StandardNavMap
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            instrumentIndex={this.props.options.instrumentIndex}
            fms={this.props.fms}
            settingsProvider={this.props.settingsProvider}
            flightPlanner={this.props.fms.flightPlanner}
            trafficSystem={this.props.trafficSystem}
            tcasDataProvider={this.tcasDataProvider}
          />
          <TerrainMap
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            instrumentIndex={this.props.options.instrumentIndex}
            fms={this.props.fms}
            settingsProvider={this.props.settingsProvider}
            flightPlanner={this.props.fms.flightPlanner}
          />
          <TrafficMap
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            trafficSystem={this.props.trafficSystem}
          />
          <GPSStatus bus={this.props.bus} gnsType={this.props.gnsType} sats={this.props.gpsSat} settingsProvider={this.props.settingsProvider} />
          {this.props.gnsType === 'wt430' && (
            <VnavPage bus={this.props.bus} gnsType={this.props.gnsType} />
          )}
        </PageGroup>
        <WaypointPageGroup
          bus={this.props.bus}
          settingsProvider={this.props.settingsProvider}
          label='WPT'
          onPageChanged={this.props.onPageChanged}
          onPopupDonePressed={(): void => this.back()}
          gnsType={this.props.gnsType}
          fms={this.props.fms}
          options={this.props.options}
        />
        <PageGroup bus={this.props.bus} label='AUX' onPageChanged={this.props.onPageChanged}>
          <AuxFlightPlanning bus={this.props.bus} gnsType={this.props.gnsType} settingsProvider={this.props.settingsProvider} />
          <AuxUtility bus={this.props.bus} gnsType={this.props.gnsType} />
          <AuxSetup1 bus={this.props.bus} gnsType={this.props.gnsType} xmlConfig={this.props.xmlConfig} fms={this.props.fms} settingsProvider={this.props.settingsProvider} />
          <AuxSetup2 bus={this.props.bus} gnsType={this.props.gnsType} xmlConfig={this.props.xmlConfig} settingsProvider={this.props.settingsProvider} />
        </PageGroup>
        <PageGroup bus={this.props.bus} label='NRST' onPageChanged={this.props.onPageChanged}>
          <NearestAirport
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            onAirportSelected={(): any => this.openPageGroup('WPT', false)}
            comIndex={this.props.options.comIndex}
            navIndex={this.props.options.navIndex}
          />
          <NearestIntersection
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            onIntersectionSelected={(): any => this.openPageGroup('WPT', false)}
            comIndex={this.props.options.comIndex}
            navIndex={this.props.options.navIndex}
          />
          <NearestNdb
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            onNdbSelected={(): any => this.openPageGroup('WPT', false)}
            comIndex={this.props.options.comIndex}
            navIndex={this.props.options.navIndex}
          />
          <NearestVor
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            onVorSelected={(): any => this.openPageGroup('WPT', false)}
            comIndex={this.props.options.comIndex}
            navIndex={this.props.options.navIndex}
          />
          {/* <NearestUser
            bus={this.props.bus}
            gnsType={this.props.gnsType}
            onUsrSelected={(): any => this.openPageGroup('WPT', false)}
          /> */}

        </PageGroup>
        <PageGroup bus={this.props.bus} label='FPL' onPageChanged={this.props.onPageChanged} isDetached>
          <FPLPage bus={this.props.bus} gnsType={this.props.gnsType} fms={this.props.fms} onPageSelected={<T extends Page = Page>(v: number): T | undefined => this.openPageGroup('WPT', false, v)} />
        </PageGroup>
        {this.props.gnsType === 'wt530' && (
          <PageGroup bus={this.props.bus} label='VNAV' onPageChanged={this.props.onPageChanged} isDetached>
            <VnavPage bus={this.props.bus} gnsType={this.props.gnsType} />
          </PageGroup>
        )}
        <PageGroup bus={this.props.bus} label='PROC' onPageChanged={this.props.onPageChanged} isDetached>
          <ProcedurePage bus={this.props.bus} fms={this.props.fms} gnsType={this.props.gnsType} onPageSelected={<T extends Page = Page>(v: number): T | undefined => this.openPageGroup('WPT', false, v)} />
        </PageGroup>
        <ConfirmDialog bus={this.props.bus} gnsType={this.props.gnsType} ref={this.confirmDialog} />
        <WaypointInfo bus={this.props.bus} gnsType={this.props.gnsType} ref={this.waypointInfo} fms={this.props.fms} />
        <DupWaypoints bus={this.props.bus} gnsType={this.props.gnsType} ref={this.dupWaypoints} fms={this.props.fms} />
        <MenuDialog bus={this.props.bus} gnsType={this.props.gnsType} ref={this.menuDialog} fms={this.props.fms} />
        <DirectToDialog bus={this.props.bus} gnsType={this.props.gnsType} ref={this.directToDialog} fms={this.props.fms} />
        <ObsDialog bus={this.props.bus} gnsType={this.props.gnsType} ref={this.obsDialog} />
        <TrafficAlertDialog bus={this.props.bus} gnsType={this.props.gnsType} trafficSystem={this.props.trafficSystem} ref={this.trafficAlertDialog} />
        <MessageDialog bus={this.props.bus} gnsType={this.props.gnsType} ref={this.messageDialog} alerts={this.props.alerts} />
      </>
    );
  }
}