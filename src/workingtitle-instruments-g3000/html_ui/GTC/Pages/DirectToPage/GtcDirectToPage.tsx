import {
  AltitudeRestrictionType, BasicNavAngleSubject, BasicNavAngleUnit, FacilitySearchType, FacilityWaypoint,
  FSComponent, GeoPoint, GeoPointSubject, ICAO, MagVar, MappedSubject, NavMath, NumberFormatter, NumberUnitSubject,
  SetSubject, StringUtils, Subject, SubscribableUtils, Subscription, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import {
  BearingDisplay, Fms, GarminFacilityWaypointCache, NumberUnitDisplay, UnitsUserSettings, WaypointInfoStore,
} from '@microsoft/msfs-garminsdk';

import { AltitudeConstraintDisplay, FlightPlanStore } from '@microsoft/msfs-wtg3000-common';
import { GtcBearingArrow } from '../../Components/BearingArrow/GtcBearingArrow';
import { GtcNearestTab } from '../../Components/Nearest/GtcNearestTab';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcWaypointButton } from '../../Components/TouchButton/GtcWaypointButton';
import { GtcWaypointSelectButton } from '../../Components/TouchButton/GtcWaypointSelectButton';
import { GtcCourseDialog } from '../../Dialog/GtcCourseDialog';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcListDialog } from '../../Dialog/GtcListDialog';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcPositionHeadingDataProvider } from '../../Navigation/GtcPositionHeadingDataProvider';
import { GtcHoldPage } from '../HoldPage/GtcHoldPage';
import { HoldCourseDirection } from '../HoldPage/HoldStore';
import { DirectToController, DirectToInputData } from './DirectToController';
import { DirectToStore } from './DirectToStore';

import './GtcDirectToPage.css';

/** Props for the direct to page. */
export interface GtcDirectToPageProps extends GtcViewProps {
  /** An FMS controller */
  fms: Fms;

  /** A provider of position and heading data for the page's main tab. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;

  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;
}

/**
 * A GTC Direct-To page.
 */
export class GtcDirectToPage extends GtcView<GtcDirectToPageProps> {
  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();
  private readonly nearestTabRef = FSComponent.createRef<GtcNearestTab>();
  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.bus);

  private readonly ppos = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  private readonly planeHeadingTrue = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  private readonly selectedWaypointInfo = new WaypointInfoStore(null, this.ppos);
  private readonly store = new DirectToStore(this.ppos, this.selectedWaypointInfo);

  private readonly controller = new DirectToController(this.store, this.props.fms, this.waypointCache);

  private pposPipe?: Subscription;
  private headingPipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this._title.set('Direct To');

    this.pposPipe = this.props.posHeadingDataProvider.pposWithFailure.pipe(this.ppos, true);
    this.headingPipe = this.props.posHeadingDataProvider.headingTrueWithFailure.pipe(this.planeHeadingTrue, true);
  }

  /** @inheritDoc */
  public override onOpen(): void {
    this.tabsRef.instance.selectTab(1);
    this.nearestTabRef.instance.resetNearestWaypointFilter();
  }

  /** @inheritDoc */
  public override onResume(): void {
    super.onResume();
    this.tabsRef.instance.resume();
    this.pposPipe?.resume(true);
    this.headingPipe?.resume(true);
  }

  /** @inheritDoc */
  public override onPause(): void {
    super.onPause();
    this.tabsRef.instance.pause();
    this.pposPipe?.pause();
    this.headingPipe?.pause();
  }

  /**
   * Sets the target waypoint to be displayed on this page.
   * @param input Data describing the target waypoint. If the data does not define a target, then one will
   * automatically be selected.
   * @returns A Promise which is fulfilled when the target waypoint has been set.
   */
  public setWaypoint(input: DirectToInputData): Promise<void> {
    return this.controller.initializeTarget(input);
  }

  /**
   * Responds to when a waypoint is selected.
   * @param waypoint The selected waypoint.
   */
  private onWaypointSelected(waypoint: FacilityWaypoint): void {
    this.tabsRef.instance.selectTab(1);
    this.selectedWaypointInfo.waypoint.set(waypoint);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gtc-direct-to">
        <TabbedContainer
          ref={this.tabsRef}
          initiallySelectedTabPosition={1}
          configuration={TabConfiguration.Left5}
        >

          <TabbedContent position={1} label="Waypoint">
            <GtcDirectToPageWaypointTab
              fms={this.props.fms}
              gtcService={this.props.gtcService}
              controlMode={this.props.controlMode}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
              selectedWaypoint={this.selectedWaypointInfo.waypoint as Subject<FacilityWaypoint | null>}
              waypointCache={this.waypointCache}
              selectedWaypointInfo={this.selectedWaypointInfo}
              controller={this.controller}
              flightPlanStore={this.props.flightPlanStore}
              directToStore={this.store}
            />
          </TabbedContent>

          <TabbedContent position={2} label="Flight<br/>Plan" disabled={true}>Flight Plan Content</TabbedContent>

          <TabbedContent
            position={3}
            label='Nearest'
            onPause={() => this.nearestTabRef.instance?.onPause()}
            onResume={() => this.nearestTabRef.instance?.onResume()}
          >
            <GtcNearestTab
              ref={this.nearestTabRef}
              bus={this.bus}
              activeComponent={this._activeComponent}
              sidebarState={this._sidebarState}
              gtcService={this.props.gtcService}
              controlMode={this.props.controlMode}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
              onSelected={this.onWaypointSelected.bind(this)}
              facilitySearchType={FacilitySearchType.AllExceptVisual}
            />
          </TabbedContent>

          <TabbedContent position={4} label="Recent" disabled={true}>Recent Content</TabbedContent>

        </TabbedContainer>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabsRef.getOrDefault()?.destroy();

    this.selectedWaypointInfo.destroy();

    this.pposPipe?.destroy();
    this.headingPipe?.destroy();

    super.destroy();
  }
}

/** Component props for the waypoint tab. */
export interface GtcDirectToPageWaypointTabProps extends GtcViewProps {
  /** An FMS state manager. */
  fms: Fms;
  /** A provider for position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
  /** The selected waypoint for the direct to page. */
  selectedWaypoint: Subject<FacilityWaypoint | null>;
  /** The waypoint cache. */
  waypointCache: GarminFacilityWaypointCache;
  /** The waypoint info store. */
  selectedWaypointInfo: WaypointInfoStore;
  /** The direct to controller. */
  controller: DirectToController;
  /** The flight plan store. */
  flightPlanStore: FlightPlanStore;
  /** The direct to store. */
  directToStore: DirectToStore;
}

/** Direct to waypoint tab. */
export class GtcDirectToPageWaypointTab extends GtcView<GtcDirectToPageWaypointTabProps> {
  private readonly vnavAltButton = FSComponent.createRef<GtcTouchButton>();
  private readonly vnavOffsetButton = FSComponent.createRef<GtcTouchButton>();
  private readonly courseButton = FSComponent.createRef<GtcTouchButton>();
  private readonly holdButton = FSComponent.createRef<GtcTouchButton>();
  private readonly cancelButton = FSComponent.createRef<GtcTouchButton>();
  private readonly activateInsertButton = FSComponent.createRef<GtcTouchButton>();
  private readonly activateButton = FSComponent.createRef<GtcTouchButton>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);

  private readonly selectedWaypointIdent = this.props.selectedWaypointInfo.facility.map(x => x ? x.icaoStruct.ident : '______');
  private readonly selectedWaypointCity = this.props.selectedWaypointInfo.city.map(x => x ?? '');
  private readonly selectedWaypointRegion = this.props.selectedWaypointInfo.region.map(x => x ?? '');

  private readonly buttonClassList = SetSubject.create(['select-waypoint-button']);

  private readonly courseButtonValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  private courseButtonAutoValuePipe?: Subscription;

  private readonly holdButtonValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  private readonly relativeBearing = MappedSubject.create(
    ([bearing, planeHeading]) => bearing.number - planeHeading,
    SubscribableUtils.NUMERIC_NAN_EQUALITY,
    this.props.selectedWaypointInfo.bearing,
    this.props.posHeadingDataProvider.headingTrue
  );
  private readonly activeDirectToIdent = MappedSubject.create(([directToExistingLeg, directToRandomLegListData]) => {
    return directToRandomLegListData?.leg.name ?? directToExistingLeg?.name ?? '_____';
  }, this.props.flightPlanStore.directToExistingLeg, this.props.flightPlanStore.directToRandomLegData);

  private readonly canCancel = MappedSubject.create(([isDirectToExistingActive, isDirectToRandomActive]) => {
    return isDirectToExistingActive || isDirectToRandomActive;
  }, this.props.flightPlanStore.isDirectToExistingActive, this.props.flightPlanStore.isDirectToRandomActive);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.selectedWaypoint.sub(waypoint => {
      if (waypoint === null) {
        this.buttonClassList.delete('waypoint-selected');
      } else {
        this.buttonClassList.add('waypoint-selected');
      }
    }, true);

    this.props.directToStore.userCourseMagnetic.sub(this.updateCourse.bind(this), true);
    this.props.directToStore.autoCourseValue.sub(this.updateCourse.bind(this), true);
    this.props.directToStore.holdInfo.sub(this.updateHoldCourse.bind(this), true);
  }

  /**
   * Updates the value for the course button.
   */
  private updateCourse(): void {
    const userCourseMagnetic = this.props.directToStore.userCourseMagnetic.get();

    if (userCourseMagnetic !== undefined) {
      this.courseButtonAutoValuePipe?.destroy();
      this.courseButtonAutoValuePipe = undefined;

      this.courseButtonValue.set(userCourseMagnetic, this.props.directToStore.autoCourseValue.get().unit.magVar);
    } else if (this.courseButtonAutoValuePipe === undefined) {
      this.courseButtonAutoValuePipe = this.props.directToStore.autoCourseValue.pipe(this.courseButtonValue);
    }
  }

  /** Updates the data source for the hold button value. */
  private updateHoldCourse(): void {
    const holdInfo = this.props.directToStore.holdInfo.get();
    if (holdInfo) {
      if (holdInfo.holdCourseDirection === HoldCourseDirection.Outbound) {
        this.holdButtonValue.set(NavMath.normalizeHeading(holdInfo.course.number + 180), holdInfo.course.unit.magVar);
      } else {
        this.holdButtonValue.set(holdInfo.course);
      }
    } else {
      this.holdButtonValue.set(NaN);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    // TODO:
    //  * enable "activate and insert to fp" only when fp loaded
    return (
      <div class="gtc-direct-to-waypoint-tab">
        <GtcWaypointSelectButton
          gtcService={this.props.gtcService}
          type={FacilitySearchType.AllExceptVisual}
          waypoint={this.props.selectedWaypoint}
          waypointCache={this.props.waypointCache}
          nullLabel='Select Waypoint'
          class={this.buttonClassList}
        />
        <div class="gtc-direct-to-waypoint-data">
          <div class='waypoint-location'>{this.selectedWaypointCity}<br />{this.selectedWaypointRegion}</div>
          <div class='waypoint-bearing'>
            <div class='waypoint-bearing-header'>BRG</div>
            <BearingDisplay
              value={this.props.selectedWaypointInfo.bearing}
              formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
              displayUnit={this.unitsSettingManager.navAngleUnits}
              class='bearing-display'
            />
            <GtcBearingArrow
              relativeBearing={this.relativeBearing}
            />
          </div>
          <div class='waypoint-distance'>
            <div class='waypoint-distance-header'>DIS</div>
            <NumberUnitDisplay
              value={this.props.selectedWaypointInfo.distance}
              formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' })}
              displayUnit={this.unitsSettingManager.distanceUnitsLarge}
              class='distance-display'
            />
          </div>
        </div>
        <div class="gtc-direct-to-button-grid">
          <div class="button-grid-row button-grid-row-1">
            <GtcTouchButton
              ref={this.vnavAltButton}
              class="button-grid-button touch-button-value"
              isEnabled={false}
            >
              <div class="touch-button-label">VNAV Altitude</div>
              <AltitudeConstraintDisplay
                altDesc={Subject.create(AltitudeRestrictionType.Unused)}
                altitude1={NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN))}
                displayAltitude1AsFlightLevel={Subject.create(false)}
                isEdited={Subject.create(false)}
                isCyan={true}
              />
            </GtcTouchButton>
            <GtcTouchButton
              ref={this.vnavOffsetButton}
              class="button-grid-button touch-button-value"
              isEnabled={false}
            >
              <div class="touch-button-label">VNAV Offset</div>
              <NumberUnitDisplay
                class="touch-button-value-value"
                value={UnitType.NMILE.createNumber(NaN)}
                displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                formatter={NumberFormatter.create({ precision: 1, pad: 1, nanString: '––– ' })}
              />
            </GtcTouchButton>
          </div>
          <div class="button-grid-row button-grid-row-2">
            <GtcTouchButton
              ref={this.courseButton}
              class="button-grid-button touch-button-value"
              isEnabled={this.props.controller.canActivate}
              onPressed={async () => {
                const initialValue = Math.round(this.courseButtonValue.get().asUnit(this.unitsSettingManager.navAngleUnits.get())) % 360;

                const result = await this.props.gtcService.openPopup<GtcCourseDialog>(GtcViewKeys.CourseDialog, 'normal', 'darken')
                  .ref.request({
                    title: 'Course',
                    initialValue: initialValue === 0 ? 360 : initialValue
                  });

                if (!result.wasCancelled) {
                  const value = this.unitsSettingManager.navAngleUnits.get().isMagnetic()
                    ? result.payload
                    : MagVar.trueToMagnetic(result.payload, this.props.directToStore.autoCourseValue.get().unit.magVar);

                  this.props.directToStore.userCourseMagnetic.set(value);
                }
              }}
            >
              <div class="touch-button-label">Course</div>
              <BearingDisplay
                class="touch-button-value-value"
                value={this.courseButtonValue}
                displayUnit={this.unitsSettingManager.navAngleUnits}
                formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '–––' })}
                hideDegreeSymbolWhenNan={true}
              />
            </GtcTouchButton>
            <GtcTouchButton
              ref={this.holdButton}
              class="button-grid-button touch-button-value"
              isEnabled={this.props.controller.canActivate}
              onPressed={async () => {
                const facility = this.props.selectedWaypoint.get()?.facility.get();

                if (!facility) { return; }

                const holdInfo = this.props.directToStore.holdInfo.get();

                const result = await this.gtcService.changePageTo<GtcHoldPage>(GtcViewKeys.Hold).ref.request({
                  planIndex: this.props.directToStore.directToExistingData.get() === null ? Fms.DTO_RANDOM_PLAN_INDEX : Fms.PRIMARY_PLAN_INDEX,
                  courseMagnetic: this.courseButtonValue.get().number,
                  legName: this.selectedWaypointIdent.get(),
                  facility,
                  existingHoldLeg: holdInfo?.existingHoldLeg,
                  holdInfo,
                  forceAllowEdit: true,
                  title: 'Direct To Hold',
                });

                if (result.wasCancelled) { return; }

                if (result.payload === 'cancel-hold') {
                  this.props.directToStore.holdInfo.set(undefined);
                } else {
                  this.props.directToStore.holdInfo.set(result.payload);
                }
              }}
            >
              <div class="touch-button-label">Hold</div>
              <BearingDisplay
                class="touch-button-value-value"
                value={this.holdButtonValue}
                displayUnit={this.unitsSettingManager.navAngleUnits}
                formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '–––' })}
                hideDegreeSymbolWhenNan={true}
              />
            </GtcTouchButton>
          </div>
        </div>
        <div class="spacer"><hr /></div>
        <div class="gtc-direct-to-button-row-bottom">
          <GtcValueTouchButton
            state={this.activeDirectToIdent}
            isEnabled={this.canCancel}
            ref={this.cancelButton}
            class="button-grid-button cancel-button"
            label="Cancel Ð"
            onPressed={async () => {
              const directToRandomLegData = this.props.flightPlanStore.directToRandomLegData.get();
              const directToExistingLeg = this.props.flightPlanStore.directToExistingLeg.get();
              if (directToRandomLegData) {
                const accepted = await GtcDialogs.openMessageDialog(this.gtcService, `Cancel ${StringUtils.DIRECT_TO} ${directToRandomLegData.leg.name}?`);
                if (accepted && this.props.fms.cancelDirectTo()) {
                  this.gtcService.goBack();
                }
              } else if (directToExistingLeg) {
                const accepted = await GtcDialogs.openMessageDialog(this.gtcService, `Cancel ${StringUtils.DIRECT_TO} ${directToExistingLeg.name}?`);
                if (accepted && this.props.fms.cancelDirectTo()) {
                  this.gtcService.goBack();
                }
              }
            }}
          />
          <GtcTouchButton
            ref={this.activateInsertButton}
            class="button-grid-button"
            label="Activate and<br/>Insert in<br/>Flight Plan"
            isEnabled={false}
            // isEnabled={this.props.controller.canActivate}
            onPressed={async () => {
              const waypoints: FacilityWaypoint[] = [];

              for (const leg of this.props.fms.getFlightPlan(0).legs()) {
                const icao = leg.leg.fixIcao;
                waypoints.push(this.props.waypointCache.get(await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao)));
              }

              const inputData = waypoints.map(waypoint => ({
                value: waypoint,
                labelRenderer: () => <GtcWaypointButton waypoint={waypoint} />
              }));

              // TODO
              this.props.gtcService.openPopup<GtcListDialog>(GtcViewKeys.ListDialog1).ref.request({
                title: `Insert and Activate Ð ${this.selectedWaypointIdent.get()} Before?`,
                selectedValue: inputData[0].value,
                inputData: inputData,
              });
            }}
          />
          <GtcValueTouchButton
            state={this.selectedWaypointIdent}
            isEnabled={this.props.controller.canActivate}
            ref={this.activateButton}
            class="button-grid-button touch-button-special"
            label="Activate Ð"
            onPressed={() => {
              this.props.controller.activateSelected();
              this.gtcService.goBack();
            }}
          />
        </div>
      </div>
    );
  }
}
