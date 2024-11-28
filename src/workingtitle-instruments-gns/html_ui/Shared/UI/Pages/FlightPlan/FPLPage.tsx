import {
  ActiveLegType, ArraySubject, BitFlags, FlightPlan, FlightPlanActiveLegEvent, FlightPlanCalculatedEvent, FlightPlanIndicationEvent,
  FlightPlanLegEvent, FlightPlanSegment, FlightPlanSegmentEvent, FlightPlanSegmentType, FocusPosition, FSComponent,
  GeoPoint, GNSSEvents, GPSSatComputerEvents, GPSSystemState, HardwareUiControl, ICAO, ImageCache, LegDefinitionFlags, LegEventType,
  MagVar, SegmentEventType, Subject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { DirectToState, Fms, FmsUtils, LegIndexes } from '@microsoft/msfs-garminsdk';

import { GNSScrollBar } from '../../GNSScrollBar';
import { GNSUiControl, GNSUiControlList } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuDefinition, MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { ProcApproachPage } from '../Waypoint/ProcApproachPage';
import { FPLEntry } from './FPLEntry';
import { FPLPageUtils } from './FPLPageUtils';
import { FPLSegment } from './FPLSegment';

import './FPLPage.css';

/** Props on the FPLPage component. */
export interface FPLPageProps extends PageProps {
  /**
   * Callback for when an airport is selected to be displayed on the WPT APT page
   */
  onPageSelected: <T extends Page = Page>(v: number) => T | undefined,


  /** The FMS. */
  fms: Fms;
}

/**
 * The GNS FPL page.
 */
export class FPLPage extends Page<FPLPageProps> {
  private readonly segments = ArraySubject.create<FlightPlanSegment>();

  private readonly fplnNameRegular = FSComponent.createRef<HTMLSpanElement>();
  private readonly fplnNameDto = FSComponent.createRef<HTMLSpanElement>();
  private readonly fplnNameDtoIcon = FSComponent.createRef<HTMLImageElement>();
  private readonly fplnNameDtoIdent = FSComponent.createRef<HTMLSpanElement>();

  private readonly segmentList = FSComponent.createRef<GNSUiControlList<FlightPlanSegment>>();
  private readonly rootControl = FSComponent.createRef<GNSUiControl>();
  private readonly scrollContainer = FSComponent.createRef<HTMLDivElement>();

  private readonly flightPlanName = Subject.create('_____ / _____');
  private readonly blankLines = ArraySubject.create<any>();
  private readonly blankLinesList = FSComponent.createRef<GNSUiControlList<FPLEntry>>();

  private readonly menu = new FPLPageMenu(this.props.fms);

  private currentSelectedControl?: FPLSegment;
  private readonly ppos = new GeoPoint(0, 0);
  private gpsIsValid = false;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.fms.flightPlanner.onEvent('fplIndexChanged').handle(this.onPlanIndexChanged.bind(this));
    this.props.fms.flightPlanner.onEvent('fplSegmentChange').handle(this.onSegmentChanged.bind(this));
    this.props.fms.flightPlanner.onEvent('fplLegChange').handle(e => this.onPlanChanged(e.planIndex, e));
    this.props.fms.flightPlanner.onEvent('fplActiveLegChange').handle(this.onActiveLegChanged.bind(this));
    this.props.fms.flightPlanner.onEvent('fplDeleted').handle(e => this.onPlanChanged(e.planIndex));
    this.props.fms.flightPlanner.onEvent('fplOriginDestChanged').handle(e => this.onPlanChanged(e.planIndex));

    this.props.fms.flightPlanner.onEvent('fplCopied').handle(this.onPlanLoadedOrCopied.bind(this));
    this.props.fms.flightPlanner.onEvent('fplLoaded').handle(this.onPlanLoadedOrCopied.bind(this));
    this.props.fms.flightPlanner.onEvent('fplCalculated').handle(this.onCalculated.bind(this));

    this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1).handle(pos => {
      this.ppos.set(pos.lat, pos.long);
      if (this.props.fms.hasPrimaryFlightPlan()) {
        this.updateLegCalculations(this.props.fms.getPrimaryFlightPlan());
      }
    });

    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(state => {
      this.gpsIsValid = state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired;
      if (this.props.fms.hasPrimaryFlightPlan()) {
        this.updateLegCalculations(this.props.fms.getPrimaryFlightPlan());
      }
    });

    this.reconcileBlankLines();
  }

  /**
   * Handles the active plan index changes in Flight Planner.
   * @param evt The event describing the active plan index change.
   */
  private onPlanIndexChanged(evt: FlightPlanIndicationEvent): void {
    if (evt.planIndex === Fms.DTO_RANDOM_PLAN_INDEX) {
      this.fplnNameRegular.instance.classList.add('hidden');
      this.fplnNameDto.instance.classList.remove('hidden');
      const directToIdent = ICAO.getIdent(this.props.fms.getDirectToTargetIcao() ?? ICAO.emptyIcao);
      this.fplnNameDtoIdent.instance.textContent = directToIdent;
    } else {
      this.fplnNameRegular.instance.classList.remove('hidden');
      this.fplnNameDto.instance.classList.add('hidden');
    }
  }

  /**
   * Handles when a segment is changed.
   * @param evt The event describing the segment change.
   */
  private onSegmentChanged(evt: FlightPlanSegmentEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
      switch (evt.type) {
        case SegmentEventType.Added:
        case SegmentEventType.Inserted:
          evt.segment && this.segments.insert(evt.segment, evt.segmentIndex);
          break;
        case SegmentEventType.Changed:
          this.segments.removeAt(evt.segmentIndex);
          evt.segment && this.segments.insert(evt.segment, evt.segmentIndex);
          break;
        case SegmentEventType.Removed:
          this.segments.removeAt(evt.segmentIndex);
          break;
      }

      this.reconcileBlankLines();
    }

    this.onPlanChanged(evt.planIndex);
  }

  /**
   * Handles when the active leg changes.
   * @param evt The active leg change event to process.
   */
  private onActiveLegChanged(evt: FlightPlanActiveLegEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX && evt.type === ActiveLegType.Lateral) {
      this.segmentList.instance.getChildInstance<FPLSegment>(evt.previousSegmentIndex)?.legs.get(evt.previousLegIndex)?.legDefinition.notify();
      this.segmentList.instance.getChildInstance<FPLSegment>(evt.segmentIndex)?.legs.get(evt.legIndex)?.legDefinition.notify();

      if (this.props.fms.getDirectToState() === DirectToState.TOEXISTING) {
        const plan = this.props.fms.getPrimaryFlightPlan();
        this.segmentList.instance.getChildInstance<FPLSegment>(plan.directToData.segmentIndex)?.legs.get(plan.directToData.segmentLegIndex)?.legDefinition.notify();
      } else {
        this.checkIfVtfLegIsActive();
      }

      if (!this.rootControl.instance.isFocused) {
        this.scrollToActive();
        this.rootControl.instance.blur();
      }
    }
  }

  /**
   * Handles when a plan change event is received.
   * @param planIndex The index of the plan change.
   * @param evt A FlightPlanLegEvent, if any.
   */
  private onPlanChanged(planIndex: number, evt?: FlightPlanLegEvent): void {
    if (planIndex === Fms.PRIMARY_PLAN_INDEX) {
      this.reconcileBlankLines();
      const plan = this.props.fms.getPrimaryFlightPlan();

      let originName = '_____';
      if (plan.originAirport !== undefined) {
        originName = ICAO.getIdent(plan.originAirport).trim();
      } else {
        originName = plan.tryGetLeg(0)?.name ?? '_____';
      }

      let destinationName = '_____';
      if (plan.length > 1) {
        if (plan.destinationAirport !== undefined) {
          destinationName = ICAO.getIdent(plan.destinationAirport).trim();
        } else {
          destinationName = plan.tryGetLeg(plan.length - 1)?.name ?? '_____';
        }
      }

      this.flightPlanName.set(`${originName} / ${destinationName}`);


      if (evt && evt.type === LegEventType.Removed) {

        if (evt.segmentIndex !== -1) {
          const segment = plan.getSegment(evt.segmentIndex);

          if (evt.legIndex < segment.legs.length) {
            this.onFocusLegIndex(segment, evt.legIndex);
          } else {
            this.onFocusLegIndex(segment, Math.max(0, evt.legIndex - 1));
          }
        }
      }
    }
  }

  /**
   * Handles updating leg calculations when the plan is calculated.
   * @param evt The flight plan calculated event to process.
   */
  private onCalculated(evt: FlightPlanCalculatedEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
      this.updateLegCalculations(this.props.fms.getPrimaryFlightPlan());
    }
  }

  /**
   * Reconciles the active leg index when a plan change occurs that does not fire the active leg changed event.
   * @param evt FlightPlanLegEvent.
   */
  private reconcileActiveLeg(evt: FlightPlanLegEvent): void {
    const prevSegmentIndex = evt.legIndex === 0 ? evt.segmentIndex - 1 : evt.segmentIndex;
    const plan = this.props.fms.getPrimaryFlightPlan();
    const legIndexes: LegIndexes = {
      segmentIndex: evt.segmentIndex,
      segmentLegIndex: evt.legIndex,
      globalLegIndex: FmsUtils.getGlobalLegIndex(plan, evt.segmentIndex, evt.legIndex)
    };
    prevSegmentIndex !== evt.segmentIndex && this.segmentList.instance.getChildInstance<FPLSegment>(prevSegmentIndex)?.reconcileActiveLeg(legIndexes);
    this.segmentList.instance.getChildInstance<FPLSegment>(evt.segmentIndex)?.reconcileActiveLeg(legIndexes);
  }

  /**
   * Checks if the VTF leg is active and, if so, sets the active leg arrow.
   */
  private checkIfVtfLegIsActive(): void {
    if (this.props.fms.isApproachVtf()) {
      const plan = this.props.fms.getPrimaryFlightPlan();
      const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
      const activeSegment = plan.tryGetSegment(activeSegmentIndex);
      if (activeSegment?.segmentType === FlightPlanSegmentType.Approach) {
        const activeLeg = plan.tryGetLeg(plan.activeLateralLeg);
        if (activeLeg && BitFlags.isAny(activeLeg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
          this.segmentList.instance.getChildInstance<FPLSegment>(activeSegmentIndex)?.legs.get(plan.activeLateralLeg - activeSegment.offset)?.legDefinition.notify();
        }
      }
    }
  }

  /**
   * Updates the leg calculations in the segment leg entries.
   * @param plan The plan to source from.
   */
  private updateLegCalculations(plan: FlightPlan): void {
    const activeLegIndex = plan.activeLateralLeg;
    const inDirectTo = this.props.fms.getDirectToState() === DirectToState.TOEXISTING;

    let currentLegIndex = 0;
    let cumulativeDistance = 0;

    for (let i = 0; i < this.segmentList.instance.length; i++) {
      const fplSegment = this.segmentList.instance.getChildInstance<FPLSegment>(i);
      if (fplSegment !== null) {
        const segmentIndex = fplSegment.props.segment.segmentIndex;

        for (let l = 0; l < fplSegment.legs.length; l++) {
          const leg = plan.getLeg(segmentIndex, l);
          const legDataItem = fplSegment.legs.get(l);

          if (leg.calculated !== undefined) {
            let legDistance = 0;

            if (currentLegIndex === activeLegIndex && leg.calculated.endLat !== undefined && leg.calculated.endLon !== undefined) {
              legDistance = UnitType.GA_RADIAN.convertTo(this.ppos.distance(leg.calculated.endLat, leg.calculated.endLon), UnitType.METER);
            } else if (currentLegIndex > activeLegIndex && !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo)) {
              legDistance = leg.calculated.distance;
            }

            if (currentLegIndex < activeLegIndex) {
              legDataItem.cumulativeDistance.set(NaN);
              legDataItem.distance.set(NaN);
              legDataItem.dtk.set(NaN);
            } else {
              cumulativeDistance += legDistance;

              if (this.gpsIsValid) {
                legDataItem.cumulativeDistance.set(cumulativeDistance, UnitType.METER);
                legDataItem.distance.set(legDistance, UnitType.METER);
              } else {
                legDataItem.cumulativeDistance.set(NaN);
                legDataItem.distance.set(NaN);
              }

              legDataItem.dtk.set(leg.calculated.initialDtk ?? NaN);
            }

            if (inDirectTo && currentLegIndex === activeLegIndex) {
              const directToTarget = fplSegment.legs.get(l - 3);

              const finalVector = leg.calculated.flightPath[leg.calculated.flightPath.length - 1];
              let dtk = finalVector !== undefined
                ? GeoPoint.initialBearing(finalVector.startLat, finalVector.startLon, finalVector.endLat, finalVector.endLon)
                : NaN;

              if (isFinite(dtk)) {
                dtk = MagVar.trueToMagnetic(dtk, finalVector.startLat, finalVector.startLon);
              }

              if (this.gpsIsValid) {
                directToTarget.cumulativeDistance.set(cumulativeDistance, UnitType.METER);
                directToTarget.distance.set(legDistance, UnitType.METER);
              } else {
                directToTarget.cumulativeDistance.set(NaN);
                directToTarget.distance.set(NaN);
              }

              directToTarget.dtk.set(dtk);
            }
          }

          currentLegIndex++;
        }
      }
    }
  }

  /**
   * Scrolls the FPL page to the active leg.
   */
  private scrollToActive(): void {
    if (!this.props.fms.hasPrimaryFlightPlan()) {
      return;
    }

    const plan = this.props.fms.getPrimaryFlightPlan();
    const directToState = this.props.fms.getDirectToState();
    const index = directToState === DirectToState.TOEXISTING ? plan.activeLateralLeg - 3 : plan.activeLateralLeg - 1;

    const prevLeg = plan.tryGetLeg(index);
    if (prevLeg !== null) {
      const segment = plan.getSegmentFromLeg(prevLeg);

      for (let i = 0; i < this.segments.length; i++) {
        if (segment === this.segments.get(i)) {
          const fplSegment = this.segmentList.instance.getChildInstance<FPLSegment>(i);
          if (fplSegment !== null) {
            fplSegment.scrollToLeg(index - segment.offset);
          }
        }
      }
    }
  }

  /**
   * Handles when a plan is loaded or copied.
   * @param evt The event describing the change.
   */
  public onPlanLoadedOrCopied(evt: FlightPlanIndicationEvent): void {
    if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
      this.segments.clear();

      const plan = this.props.fms.getPrimaryFlightPlan();
      for (const segment of plan.segments()) {
        this.segments.insert(segment, segment.segmentIndex);
      }

      this.reconcileBlankLines();
    }

    this.onPlanChanged(evt.planIndex);
  }

  /** @inheritDoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.RightKnobPush) {
      const root = this.rootControl.instance;
      if (!root.isFocused) {
        root.focus(FocusPosition.MostRecent);
      } else {
        this.scrollToActive();
        root.blur();
      }

      return true;
    }

    if (evt === InteractionEvent.FPL) {
      ViewService.back();
      return true;
    }

    let handled = false;
    if (this.rootControl.instance.isFocused) {
      handled = this.rootControl.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return true;
    } else if (evt === InteractionEvent.RightOuterInc || evt === InteractionEvent.RightOuterDec) {
      return true;
    } else if (evt === InteractionEvent.MENU) {
      ViewService.menu(this.menu);
      return true;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /** @inheritdoc */
  public onSuspend(): void {
    this.rootControl.instance.blur();
    super.onSuspend();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();

    this.scrollToActive();
    this.rootControl.instance.blur();
  }

  /**
   * A callback called when a segment in the plan is selected.
   * @param segment The segment that was selected.
   * @param control The segment control that was selected.
   */
  private onSegmentSelected(segment: FlightPlanSegment | null, control: HardwareUiControl | null): void {
    if (segment === null) {
      this.menu.segmentIndex = -1;
      this.menu.legIndex = -1;

      if (this.currentSelectedControl !== undefined) {
        this.currentSelectedControl.props.onSelected = undefined;
      }
    } else if (control !== null) {
      this.menu.segmentIndex = segment.segmentIndex;
      (control as FPLSegment).props.onSelected = (legIndex): any => this.menu.legIndex = legIndex;
    }
  }

  /**
   * Handles an event requesting a leg originally at an index in a segment be focused
   *
   * @param segment  the segment
   * @param legIndex the local index
   */
  private onFocusLegIndex(segment: FlightPlanSegment, legIndex: number): void {
    const globalIndex = (segment?.offset ?? 0) + legIndex;

    const plan = this.props.fms.getPrimaryFlightPlan();

    if (plan.length <= 0) {
      this.blankLinesList.instance.focus(FocusPosition.First);
      return;
    }

    const targetSegment = plan.getSegment(plan.getSegmentIndex(Math.min(globalIndex, plan.length - 1)));

    const targetSegmentElementIndex = this.segments.getArray().findIndex((it) => it === targetSegment);
    const targetSegmentElement = this.segmentList.instance.getChildInstance<FPLSegment>(targetSegmentElementIndex);

    const targetSegmentLocalLegIndex = legIndex - targetSegment.segmentIndex;

    targetSegmentElement?.focusLeg(targetSegmentLocalLegIndex);
  }

  /**
   * Reconciles the number of blank lines that should appear in the FPL page list.
   */
  private reconcileBlankLines(): void {
    let totalLines = 0;
    for (let i = 0; i < this.segmentList.instance.length; i++) {
      totalLines += this.segmentList.instance.getChildInstance<FPLSegment>(i)?.getLineCount() ?? 0;
    }

    const shouldRefocus = this.blankLinesList.instance.isFocused;

    const numBlankLines = Math.max(6 - totalLines, 1);
    while (this.blankLines.length !== numBlankLines) {
      if (this.blankLines.length < numBlankLines) {
        this.blankLines.insert({ i: this.blankLines.length });
      } else if (this.blankLines.length > numBlankLines) {
        this.blankLines.removeAt(0);
      }
    }

    for (let i = 0; i < this.blankLinesList.instance.length; i++) {
      this.blankLinesList.instance.getChild(i)?.setDisabled(i !== 0);
    }

    this.segmentList.instance.setDisabled(totalLines === 0);

    if (shouldRefocus) {
      this.blankLinesList.instance.focus(FocusPosition.First);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='page fpl-page hide-element' ref={this.el}>
        <div class='fpl-page-header'>
          <h2 class="page-header">ACTIVE FLIGHT PLAN</h2>
          <div class='fpl-storage-id'>00</div>
          <div class='fpl-name'>
            <span ref={this.fplnNameRegular} class="fpln-name-text">{this.flightPlanName}</span>
            <span ref={this.fplnNameDto} class="fpln-name-dto hidden">
              <img ref={this.fplnNameDtoIcon} class="fpl-name-dto-icon" src={ImageCache.get('LEGICON_DIRECTTO').src} />
              <span ref={this.fplnNameDtoIdent} class="fpln-name-dto-ident">B</span>
            </span>
          </div>
        </div>
        <div class='fpl-page-body'>
          <div class='fpl-page-table-header'>
            <span class='fpl-table-header-wpt'>WAYPOINT</span>
            <span class='fpl-table-header-dtk'>DTK</span>
            <span class='fpl-table-header-dis'>DIS</span>
            {this.props.gnsType === 'wt530' && (
              <span class='fpl-table-header-cum'>CUM</span>
            )}
          </div>
          <div class='fpl-page-table' ref={this.scrollContainer}>
            <GNSUiControl ref={this.rootControl} isolateScroll>
              <div>
                <GNSUiControlList<FlightPlanSegment>
                  data={this.segments}
                  renderItem={(data: FlightPlanSegment): VNode => (
                    <FPLSegment
                      segment={data}
                      bus={this.props.bus}
                      fms={this.props.fms}
                      gnsType={this.props.gnsType}
                      scrollContainer={this.scrollContainer}
                      onFocusLegIndex={this.onFocusLegIndex.bind(this, data)}
                    />
                  )}
                  ref={this.segmentList}
                  onItemSelected={this.onSegmentSelected.bind(this)}
                  disableContainerScroll
                  scrollContainer={this.scrollContainer}
                  hideScrollbar
                />
              </div>
              <div>
                <GNSUiControlList<any> data={this.blankLines} renderItem={(): VNode => <FPLEntry fms={this.props.fms} gnsType={this.props.gnsType} />}
                  ref={this.blankLinesList} scrollContainer={this.scrollContainer} hideScrollbar />
              </div>
            </GNSUiControl>
          </div>
          <GNSScrollBar />
        </div>
      </div>
    );
  }
}

/**
 * The page menu for the FPL page.
 */
export class FPLPageMenu extends MenuDefinition {

  public segmentIndex = 0;
  public legIndex = 0;

  public readonly entries: readonly MenuEntry[] = [
    {
      label: 'Activate Leg?', disabled: Subject.create<boolean>(true), action: (): void => {
        const plan = this.fms.getPrimaryFlightPlan();
        const leg = plan.tryGetLeg(this.segmentIndex, this.legIndex);
        if (leg === null) {
          console.warn(`Trying to activate invalid leg from flight plan: segment ${this.segmentIndex} leg ${this.legIndex}`);
          ViewService.back();
        } else {
          ViewService.activateLegDialog(plan.getLegIndexFromLeg(leg));
        }
      }
    },
    { label: 'Crossfill?', disabled: Subject.create<boolean>(true), action: (): void => { } },
    { label: 'Copy Flight Plan?', disabled: Subject.create<boolean>(true), action: (): void => { } },
    { label: 'Invert Flight Plan?', disabled: Subject.create<boolean>(true), action: (): void => this.fms.invertFlightplan() },
    {
      label: 'Delete Flight Plan?',
      disabled: Subject.create<boolean>(true),
      action: (): Promise<void> => ViewService.confirm('DELETE FLIGHT PLAN', 'Delete all waypoints in flight plan.').then(confirm => {
        confirm && this.fms.emptyPrimaryFlightPlan().then(() => {
          ViewService.back();
        });
      })
    },
    {
      label: 'Select Approach?', disabled: false, action: (): void => {
        ViewService.back();
        ViewService.open<ProcApproachPage>('WPT', true, 3)?.openFromProcMenu();
      }
    },
    {
      label: 'Select Arrival?', disabled: false, action: (): void => {
        ViewService.back();
        ViewService.open<ProcApproachPage>('WPT', true, 4)?.openFromProcMenu();
      }
    },
    {
      label: 'Select Departure?', disabled: false, action: (): void => {
        ViewService.back();
        ViewService.open<ProcApproachPage>('WPT', true, 5)?.openFromProcMenu();
      }
    },
    { label: 'Remove Approach?', disabled: Subject.create<boolean>(true), action: (): Promise<void> => this.confirmApproachRemoval() },
    { label: 'Remove Arrival?', disabled: Subject.create<boolean>(true), action: (): Promise<void> => this.confirmArrivalRemoval() },
    { label: 'Remove Departure?', disabled: Subject.create<boolean>(true), action: (): Promise<void> => this.confirmDepartureRemoval() },
    { label: 'Closest Point of FPL?', disabled: Subject.create<boolean>(true), action: (): void => { } },
    { label: 'Parallel Track?', disabled: Subject.create<boolean>(true), action: (): void => { } },
    { label: 'Change Fields?', disabled: Subject.create<boolean>(true), action: (): void => { } },
    { label: 'Restore Defaults?', disabled: Subject.create<boolean>(true), action: (): void => { } },
  ];

  /**
   * Creates an instance of the FPLPageMenu.
   * @param fms An instance of the flight plan management system.
   */
  constructor(private readonly fms: Fms) {
    super();
  }

  /**
   * Confirms removal of the flight plan approach.
   */
  private async confirmApproachRemoval(): Promise<void> {
    const names = await FPLPageUtils.getApproachNames(this.fms);
    if (names !== undefined) {
      const confirmed = await ViewService.confirm('REMOVE APPROACH', `Remove ${names.long} from flight plan.`);
      if (confirmed) {
        await this.fms.removeApproach();
        ViewService.back();
      }
    }
  }

  /**
   * Confirms removal of the flight plan arrival.
   */
  private async confirmArrivalRemoval(): Promise<void> {
    const names = await FPLPageUtils.getArrivalNames(this.fms);
    if (names !== undefined) {
      const confirmed = await ViewService.confirm('REMOVE ARRIVAL', `Remove ${names.long} from flight plan.`);
      if (confirmed) {
        await this.fms.removeArrival();
        ViewService.back();
      }
    }
  }

  /**
   * Confirms removal of the flight plan departure.
   */
  private async confirmDepartureRemoval(): Promise<void> {
    const names = await FPLPageUtils.getDepartureNames(this.fms);
    if (names !== undefined) {
      const confirmed = await ViewService.confirm('REMOVE DEPARTURE', `Remove ${names.long} from flight plan.`);
      if (confirmed) {
        await this.fms.removeDeparture();
        ViewService.back();
      }
    }
  }

  /** @inheritdoc */
  public updateEntries(): void {
    const hasPlan = this.fms.hasPrimaryFlightPlan() && this.fms.getPrimaryFlightPlan().length !== 0;

    this.setEntryDisabled(0, !this.fms.canActivateLeg(this.segmentIndex, this.legIndex));
    this.setEntryDisabled(3, !hasPlan);
    this.setEntryDisabled(4, !hasPlan);




    this.setEntryDisabled(8, hasPlan && this.fms.getPrimaryFlightPlan().procedureDetails.approachIndex === -1);
    this.setEntryDisabled(9, hasPlan && this.fms.getPrimaryFlightPlan().procedureDetails.arrivalIndex === -1);
    this.setEntryDisabled(10, hasPlan && this.fms.getPrimaryFlightPlan().procedureDetails.departureIndex === -1);
  }
}