import {
  AirportFacility, Facility, FacilityType, FacilityUtils, FlightPathUtils, FlightPlan, FlightPlanSegment,
  FlightPlanSegmentType, FlightPlanUtils, FSComponent, GeoPoint, ICAO, IntersectionFacility,
  LegDefinition, LegType, MagVar, MappedSubject, NdbFacility, Subject, Subscribable, UserFacility, VNode, VorFacility,
} from '@microsoft/msfs-sdk';

import { DirectToState, Fms, FmsUtils, UnitsNavAngleSettingMode, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { FlightPlanStore, FlightPlanListManager, FlightPlanLegListData, G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDirectToPage } from '../DirectToPage/GtcDirectToPage';
import { GtcHoldPage } from '../HoldPage/GtcHoldPage';
import { GtcAirportInfoPage, GtcIntersectionInfoPage, GtcNdbInfoPage, GtcUserWaypointInfoPage, GtcVorInfoPage } from '../WaypointInfoPages';
import { HoldController } from '../HoldPage/HoldController';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';

import './WaypointOptionsSlideoutMenu.css';

/**
 * The properties for the WaypointOptionsSlideoutMenu component.
 */
export interface WaypointOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The flight plan list manager. */
  listManager: FlightPlanListManager;

  /** Callback to call when a waypoint was inserted from this menu. */
  onWaypointInserted: (newLeg: LegDefinition) => void;

  /** Selects the next waypoint in the given direction. */
  selectNextWaypoint: (direction: 1 | -1) => void;

  /** Whether there are still waypoints still scroll up to. */
  canScrollUp: Subscribable<boolean>;

  /** Whether there are still waypoints still scroll down to. */
  canScrollDown: Subscribable<boolean>;
}

const supportedWaypointInfoTypes = [FacilityType.Airport, FacilityType.Intersection, FacilityType.NDB, FacilityType.VOR, FacilityType.USR] as readonly FacilityType[];

/**
 * Displays the loaded procedures and links to the procedure pages.
 */
export class WaypointOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanLegListData, WaypointOptionsSlideoutMenuProps> {
  private readonly segmentIndex = Subject.create<number | undefined>(undefined);
  private readonly segmentLegIndex = Subject.create<number | undefined>(undefined);
  private readonly globalLegIndex = Subject.create<number | undefined>(undefined);

  private readonly canActivate = Subject.create(false);
  private readonly canLoadAirway = Subject.create(false);

  private readonly isFlyOver = this.listItemData.map(data => !!data?.legData.leg.leg.flyOver);

  private readonly isHoldLeg = Subject.create(false);
  private readonly isSelectedLegEditableHold = Subject.create(false);
  private readonly isHoldButtonEnabled = Subject.create(false);
  private readonly holdButtonLabel = Subject.create('');

  private readonly facility = Subject.create<Facility | undefined>(undefined);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly scrollState = MappedSubject.create(this.props.canScrollUp, this.props.canScrollDown);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Waypoint Options');

    this._sidebarState.useWaypointArrowButtons.set(true);

    this.scrollState.sub(([canScrollUp, canScrollDown]) => {
      if (canScrollUp && canScrollDown) {
        this._sidebarState.slot5.set('arrowsBoth');
      } else if (!canScrollUp && !canScrollDown) {
        this._sidebarState.slot5.set('arrowsDisabled');
      } else if (canScrollUp) {
        this._sidebarState.slot5.set('arrowsUp');
      } else if (canScrollDown) {
        this._sidebarState.slot5.set('arrowsDown');
      }
    }, true);

    this.listItemData.sub(async data => {
      const plan = this.props.fms.getFlightPlan(this.props.planIndex);
      const indexes = data === null ? undefined : FmsUtils.getLegIndexes(plan, data.legData.leg);

      if (indexes !== undefined && data) {
        const legData = data.legData;
        const leg = legData.leg;

        const { segmentIndex, segmentLegIndex, globalLegIndex } = indexes;
        const segment = plan.getSegment(segmentIndex);
        this.segmentIndex.set(segmentIndex);
        this.segmentLegIndex.set(segmentLegIndex);
        this.globalLegIndex.set(globalLegIndex);
        this.canActivate.set(this.props.fms.canActivateLeg(segmentIndex, segmentLegIndex));

        // Holds
        const isLegActiveDirectTo = segmentIndex === plan.directToData.segmentIndex && segmentLegIndex === plan.directToData.segmentLegIndex;
        const prevLegInSegment = plan.tryGetLeg(segmentIndex, segmentLegIndex - 1);
        const nextLegInSegment = plan.tryGetLeg(segmentIndex, segmentLegIndex + 1 + (isLegActiveDirectTo ? 3 : 0));
        const isSelectedLegEditableHold = !!(leg && prevLegInSegment && FlightPlanUtils.isHoldLeg(leg.leg.type) && leg.leg.fixIcao === prevLegInSegment.leg.fixIcao);
        const isNextLegEditableHold = !!(leg && nextLegInSegment && FlightPlanUtils.isHoldLeg(nextLegInSegment.leg.type) && nextLegInSegment.leg.fixIcao === leg.leg.fixIcao);
        const isEdit = isSelectedLegEditableHold || isNextLegEditableHold;
        const enableHoldButton = !!(leg && globalLegIndex > 0 && (isSelectedLegEditableHold || this.canHoldAtWaypoint(leg)));

        this.isHoldLeg.set(legData.isHoldLeg);
        this.isSelectedLegEditableHold.set(isSelectedLegEditableHold);
        this.holdButtonLabel.set(isEdit ? 'Edit Hold' : 'Hold at\nWaypoint');
        this.isHoldButtonEnabled.set(enableHoldButton);

        this.loadFacility(leg);

        // Airway
        this.canLoadAirway.set(false);
        const canLoadAirway = await this.canAirwayInsert(plan, leg, segment);

        // Since this is async, a new leg could have been selected by now
        if (this.listItemData.get() !== data) {
          return;
        }

        this.canLoadAirway.set(canLoadAirway);
      } else {
        this.segmentIndex.set(undefined);
        this.segmentLegIndex.set(undefined);
        this.globalLegIndex.set(undefined);
        this.canActivate.set(false);
        this.canLoadAirway.set(false);
        this.isHoldLeg.set(false);
        this.isSelectedLegEditableHold.set(false);
        this.holdButtonLabel.set('Hold at\nWaypoint');
        this.isHoldButtonEnabled.set(false);
        this.facility.set(undefined);
      }
    });
  }

  /** @inheritdoc */
  public override onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.ButtonBarUpPressed: this.props.selectNextWaypoint(-1);
        return true;
      case GtcInteractionEvent.ButtonBarDownPressed: this.props.selectNextWaypoint(1);
        return true;
      default:
        return false;
    }
  }

  /**
   * Loads the leg's facility, if it has one.
   * @param leg The leg.
   */
  private async loadFacility(leg: LegDefinition): Promise<void> {
    this.facility.set(undefined);

    if (!ICAO.isFacility(leg.leg.fixIcao)) { return; }

    const type = ICAO.getFacilityType(leg.leg.fixIcao);

    const facility = await this.props.fms.facLoader.getFacility(type, leg.leg.fixIcao);

    // Since this is async, a new leg could have been selected by now
    if (leg !== this.listItemData.get()?.legData.leg) {
      return;
    }

    this.facility.set(facility);
  }

  // TODO Sidebar state up down waypoint buttons

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid waypoint-options' >
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Insert\nBefore'}
            onPressed={async () => {
              const newLeg = await GtcFlightPlanDialogs.insertWaypointBeforeAfter(
                this.gtcService, this.props.fms, this.props.planIndex, this.listItemData.get()!.legData.leg, 'before');
              if (newLeg) {
                this.closeMenu();
                this.props.onWaypointInserted(newLeg);
              }
            }}
          />
          <GtcTouchButton
            label={'Insert\nAfter'}
            onPressed={async () => {
              const newLeg = await GtcFlightPlanDialogs.insertWaypointBeforeAfter(
                this.gtcService, this.props.fms, this.props.planIndex, this.listItemData.get()!.legData.leg, 'after');
              if (newLeg) {
                this.closeMenu();
                this.props.onWaypointInserted(newLeg);
              }
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            class="direct-to-button"
            label={<img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_direct_to.png`} />}
            onPressed={() => {
              const plan = this.props.fms.getFlightPlan(this.props.planIndex);
              const indexes = FmsUtils.getLegIndexes(plan, this.listItemData.get()!.legData.leg);

              if (!indexes) { return; }

              this.closeMenu();

              if (
                this.props.store.directToState.get() === DirectToState.TOEXISTING
                && indexes.segmentIndex === plan.directToData.segmentIndex
                && indexes.segmentLegIndex === plan.directToData.segmentLegIndex
              ) {
                // If this leg is the active direct to, then let the direct to page load the info itself
                this.gtcService.changePageTo<GtcDirectToPage>(GtcViewKeys.DirectTo).ref.setWaypoint({});
              } else {
                this.gtcService.changePageTo<GtcDirectToPage>(GtcViewKeys.DirectTo).ref.setWaypoint({
                  segmentIndex: indexes.segmentIndex,
                  segmentLegIndex: indexes.segmentLegIndex
                });
              }
            }}
          />
          <GtcTouchButton
            label={'Activate Leg\nto Waypoint'}
            isEnabled={this.canActivate}
            onPressed={async () => {
              const segmentIndex = this.segmentIndex.get();
              const segmentLegIndex = this.segmentLegIndex.get();
              if (segmentIndex !== undefined && segmentLegIndex !== undefined) {
                const activated = await GtcFlightPlanDialogs.activateLegToWaypoint(
                  this.gtcService,
                  this.props.fms,
                  segmentIndex,
                  segmentLegIndex,
                  this.unitsSettingManager.getSetting('unitsNavAngle').value === UnitsNavAngleSettingMode.True
                );
                if (activated) {
                  this.closeMenu();
                }
              }
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Load\nAirway'}
            isEnabled={this.canLoadAirway}
            onPressed={async () => {
              const data = this.listItemData.get();
              const plan = this.props.fms.getFlightPlan(this.props.planIndex);
              const indexes = data ? FmsUtils.getLegIndexes(plan, data.legData.leg) : undefined;
              if (data && indexes) {
                const segment = plan.getSegment(indexes.segmentIndex);
                if (await this.canAirwayInsert(plan, data.legData.leg, segment)) {
                  const index = await GtcFlightPlanDialogs.loadAirway(
                    this.props.gtcService,
                    this.props.fms,
                    this.props.planIndex,
                    data.legData.leg,
                    this.props.listManager
                  );

                  if (index >= 0) {
                    this.closeMenu();
                  }
                }
              }
            }}
          />
          <GtcTouchButton
            label={'Along Track\nWaypoint'}
            isEnabled={false}
            onPressed={() => { }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={this.holdButtonLabel}
            isEnabled={this.isHoldButtonEnabled}
            onPressed={async () => {
              const segmentIndex = this.segmentIndex.get();
              let segmentLegIndex = this.segmentLegIndex.get();

              if (segmentIndex === undefined || segmentLegIndex === undefined) { return; }

              const plan = this.props.fms.getFlightPlan(this.props.planIndex);

              // If user clicked the Edit Hold button on an existing hold leg, we want to use the previous leg
              segmentLegIndex = segmentLegIndex - (this.isSelectedLegEditableHold.get() ? 1 : 0);

              // If the selected leg is the target of a DTO existing sequence,
              // shift the leg index so the hold is inserted after the DTO legs
              if (plan.directToData.segmentIndex === segmentIndex && plan.directToData.segmentLegIndex === segmentLegIndex) {
                segmentLegIndex += 3;
              }

              const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

              if (leg?.name === undefined || leg?.calculated?.endLat === undefined || leg?.calculated?.endLon === undefined) { return; }

              const nextLeg = plan.getNextLeg(segmentIndex, segmentLegIndex);
              let existingHoldLeg: LegDefinition | undefined;
              // If next leg is a hold leg with the same fix ICAO, then there is an existing hold for this leg
              if (nextLeg && FlightPlanUtils.isHoldLeg(nextLeg.leg.type) && nextLeg.leg.fixIcao === leg.leg.fixIcao) {
                existingHoldLeg = nextLeg;
              }

              // First try to calc a course from the final vector of the leg's flight path
              let courseTrue = FlightPathUtils.getLegFinalCourse(leg.calculated);

              // If leg doesn't have calculated vectors, then calculate a course from the end of the previous leg
              if (courseTrue === undefined) {
                const prevLeg = plan.getPrevLeg(segmentIndex, segmentLegIndex);
                if (prevLeg?.calculated && prevLeg.calculated.endLat !== undefined && prevLeg.calculated.endLon !== undefined) {
                  courseTrue = GeoPoint.finalBearing(
                    prevLeg.calculated.endLat, prevLeg.calculated.endLon,
                    leg.calculated.endLat, leg.calculated.endLon
                  );

                  if (isNaN(courseTrue)) {
                    courseTrue = undefined;
                  }
                }
              }

              const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(leg.leg.fixIcao), leg.leg.fixIcao);

              // This makes sure we use the VOR magvar, just in case it is a VOR
              const magVar = FacilityUtils.getMagVar(facility);

              const courseMagnetic = courseTrue === undefined ? 0 : MagVar.trueToMagnetic(courseTrue, magVar);

              // Close the menu before going to the hold page
              this.closeMenu();

              const result = await this.gtcService.changePageTo<GtcHoldPage>(GtcViewKeys.Hold).ref.request({
                planIndex: this.props.planIndex,
                facility,
                legName: leg.name,
                courseMagnetic,
                existingHoldLeg,
              });

              if (result.wasCancelled) { return; }

              if (result.payload === 'cancel-hold') {
                if (existingHoldLeg) {
                  const holdLegIndexes = FmsUtils.getLegIndexes(plan, existingHoldLeg);

                  if (!holdLegIndexes) { return; }

                  this.props.fms.removeWaypoint(holdLegIndexes.segmentIndex, holdLegIndexes.segmentLegIndex);
                }
              } else {
                HoldController.createAndInsertHold(this.props.fms, this.props.planIndex, result.payload, leg.leg.fixIcaoStruct, segmentIndex, segmentLegIndex);
              }
            }}
          />
          <GtcTouchButton
            label={'Waypoint\nInfo'}
            isEnabled={this.facility.map(fac => {
              return fac !== undefined && supportedWaypointInfoTypes.includes(ICAO.getFacilityType(fac.icao));
            })}
            onPressed={() => {
              const facility = this.facility.get();

              if (!facility) { return; }

              this.closeMenu();

              const type = ICAO.getFacilityType(facility.icao);

              switch (type) {
                case FacilityType.Airport:
                  this.gtcService.changePageTo<GtcAirportInfoPage>(GtcViewKeys.AirportInfo).ref.initSelection(facility as AirportFacility);
                  break;
                case FacilityType.Intersection:
                  this.gtcService.changePageTo<GtcIntersectionInfoPage>(GtcViewKeys.IntersectionInfo).ref.initSelection(facility as IntersectionFacility);
                  break;
                case FacilityType.NDB:
                  this.gtcService.changePageTo<GtcNdbInfoPage>(GtcViewKeys.NdbInfo).ref.initSelection(facility as NdbFacility);
                  break;
                case FacilityType.VOR:
                  this.gtcService.changePageTo<GtcVorInfoPage>(GtcViewKeys.VorInfo).ref.initSelection(facility as VorFacility);
                  break;
                case FacilityType.USR:
                  this.gtcService.changePageTo<GtcUserWaypointInfoPage>(GtcViewKeys.UserWaypointInfo).ref.initSelection(facility as UserFacility);
                  break;
              }
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={this.isHoldLeg.map(isHoldLeg => isHoldLeg ? 'Remove\nHold' : 'Remove\nWaypoint')}
            onPressed={async () => {
              const segment = this.listItemData.get()?.legData.segment;
              const leg = this.listItemData.get()?.legData.leg;
              if (segment && leg) {
                // TODO "Invalid flight plan modification." dialog
                const legName = this.isHoldLeg.get() ? 'Holding Pattern' : undefined;
                const removed = await GtcFlightPlanDialogs.removeWaypoint(this.gtcService, this.props.fms, this.props.store, segment, leg, legName);
                if (removed) {
                  this.closeMenu();
                }
              }
            }}
          />
          <GtcToggleTouchButton
            label={'Fly Over\nWaypoint'}
            isEnabled={false}
            state={this.isFlyOver}
          />
        </div>
      </div>
    );
  }

  /**
   * Checks whether an airway can be inserted from this selected index and there are routes from this leg.
   * @param plan The flight plan.
   * @param leg The leg.
   * @param segment The segment.
   * @returns True if can load airway at this leg.
   */
  private async canAirwayInsert(plan: FlightPlan, leg: LegDefinition, segment: FlightPlanSegment): Promise<boolean> {
    if (segment.segmentType !== FlightPlanSegmentType.Enroute && segment.segmentType !== FlightPlanSegmentType.Departure) {
      return false;
    }

    if (!ICAO.isStringV1Facility(leg.leg.fixIcao)) {
      return false;
    }

    switch (ICAO.getFacilityTypeFromStringV1(leg.leg.fixIcao)) {
      case FacilityType.VOR:
      case FacilityType.NDB:
      case FacilityType.Intersection:
        break;
      default:
        return false;
    }

    const fac = await this.props.fms.facLoader.getFacility(FacilityType.Intersection, leg.leg.fixIcao);

    if (fac.routes.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if a hold-at-waypoint can be inserted after a flight plan leg.
   * @param leg A flight plan leg.
   * @returns Whether a hold-at-waypoint can be inserted after the flight plan leg.
   */
  private canHoldAtWaypoint(leg: LegDefinition): boolean {
    switch (leg.leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
        return true;
    }

    return false;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.scrollState.destroy();

    super.destroy();
  }
}
