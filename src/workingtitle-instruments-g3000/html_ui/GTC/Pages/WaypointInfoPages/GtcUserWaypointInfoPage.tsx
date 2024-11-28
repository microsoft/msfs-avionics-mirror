import {
  ArraySubject, BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, Facility, FacilityLoader,
  FacilitySearchType, FacilityType, FacilityUtils, FacilityWaypoint, FSComponent, GeoPoint, ICAO, IcaoValue, MagVar,
  MappedSubject, MutableSubscribable, NodeReference, NumberFormatter, NumberUnitSubject, SetSubject, Subject,
  Subscribable, SubscribableArray, SubscribableArrayEventType, Subscription, Unit, UnitFamily, UnitType, UserFacility,
  UserFacilityType, VNode
} from '@microsoft/msfs-sdk';

import { LatLonDisplayFormat, UnitsUserSettingManager, WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import { BearingDisplay, ControllableDisplayPaneIndex, DynamicListData, GarminLatLonDisplay, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcBearingArrow } from '../../Components/BearingArrow/GtcBearingArrow';
import { GtcList } from '../../Components/List/GtcList';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { TabbedContainer, TabConfiguration } from '../../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../../Components/Tabs/TabbedContent';
import { GtcWaypointDisplay } from '../../Components/Waypoint/GtcWaypointDisplay';
import { GtcUserWaypointDialog } from '../../Dialog/GtcUserWaypointDialog';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { GtcControlMode, GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcWaypointInfoPage, GtcWaypointInfoPageNoWaypointMessage, GtcWaypointInfoPageProps } from './GtcWaypointInfoPage';
import { GtcUserWaypointEditController } from '../../Navigation/GtcUserWaypointEditController';
import { GtcUserWaypointInfoOptionsPopup } from './GtcUserWaypointInfoOptionsPopup';

import './GtcUserWaypointInfoPage.css';

/**
 * Component props for GtcUserWaypointInfoPage.
 */
export interface GtcUserWaypointInfoPageProps extends GtcWaypointInfoPageProps {
  /** A controller for editing user waypoints. */
  controller: GtcUserWaypointEditController;

  /** An array of all existing user waypoints. */
  userWaypoints: SubscribableArray<FacilityWaypoint<UserFacility>>;

  /** A mutable subscribable from and to which to sync the page's selected user waypoint. */
  selectedUserWaypoint: MutableSubscribable<FacilityWaypoint<UserFacility> | null>;
}

/**
 * GTC view keys for popups owned by airport information pages.
 */
enum GtcUserWaypointInfoPagePopupKeys {
  Options = 'UserWaypointInfoOptions'
}

/**
 * A GTC user waypoint information page.
 */
export class GtcUserWaypointInfoPage extends GtcWaypointInfoPage<FacilitySearchType.User, GtcUserWaypointInfoPageProps> {
  protected readonly waypointSelectType = FacilitySearchType.User;
  protected readonly optionsPopupKey = GtcUserWaypointInfoPagePopupKeys.Options;

  private readonly tabContainerRef = FSComponent.createRef<TabbedContainer>();

  private readonly selectedRunwayIndex = Subject.create(-1);

  private readonly selectionState = MappedSubject.create(
    this.selectedFacility,
    this.selectedRunwayIndex
  );

  private initSelectionOpId = 0;

  private userWaypointArraySub?: Subscription;
  private selectedWaypointPipeOut?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('User Waypoint Information');

    this.userWaypointArraySub = this.props.userWaypoints.sub((index, type) => {
      if (type === SubscribableArrayEventType.Removed) {
        this.onWaypointRemoved(index);
      }
    });

    this.selectedWaypointPipeOut = this.selectedWaypoint.pipe(this.props.selectedUserWaypoint);

    this.selectionState.pipe(this.showOnMapData, ([facility, runwayIndex]) => {
      return { icao: facility?.icaoStruct ?? ICAO.emptyValue(), runwayIndex };
    });
  }

  /**
   * Responds to when a user waypoint is removed from the existing user waypoints array.
   * @param index The index of the removed waypoint.
   */
  private onWaypointRemoved(index: number): void {
    const selectedFacility = this.selectedFacility.get();

    if (selectedFacility === null) {
      return;
    }

    const userWaypointsArray = this.props.userWaypoints.getArray();

    // If the selected user waypoint was removed, attempt to select the previous waypoint in the array, or if that
    // does not exist, the next waypoint in the array. If neither exists, then set the selection to null.
    if (userWaypointsArray.findIndex(waypoint => waypoint.facility.get().icao === selectedFacility.icao) < 0) {
      const newSelectionIndex = Math.max(index - 1, 0);
      const newSelection = userWaypointsArray[newSelectionIndex];

      this.selectedWaypoint.set(newSelection ?? null);
    }
  }

  /**
   * Initializes this page's user waypoint selection. If the initial selected waypoint does not exist anymore, then
   * the selection will be set to the oldest existing user waypoint. If there are no existing user waypoints, the
   * selection will be set to `null`.
   * @param facility The user waypoint facility to select, or its ICAO. If not defined, the selection will be
   * initialized to the most recently selected user waypoint.
   */
  public async initSelection(facility?: UserFacility | IcaoValue): Promise<void> {
    const opId = ++this.initSelectionOpId;

    let selection: FacilityWaypoint<UserFacility> | null = null;

    if (facility === undefined) {
      selection = this.props.selectedUserWaypoint.get();
    } else {
      if (ICAO.isValue(facility)) {
        if (ICAO.isValueFacility(facility, FacilityType.USR)) {
          const userFacility = await this.props.facLoader.tryGetFacility(FacilityType.USR, facility);
          if (userFacility) {
            selection = this.facWaypointCache.get(userFacility);
          }
        }
      } else {
        selection = this.facWaypointCache.get(facility);
      }
    }

    if (opId !== this.initSelectionOpId) {
      return;
    }

    // We need to make sure that the initial selected waypoint still exists. If it doesn't attempt to select the
    // first waypoint in the existing user waypoints array. If the array is empty, initialize the selection to null.
    if (selection !== null && !this.props.controller.doesUserWaypointExist(selection.facility.get().icaoStruct)) {
      selection = this.props.userWaypoints.tryGet(0) ?? null;
    }

    this.selectedWaypoint.set(selection);
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    this.userWaypointArraySub?.resume();
    this.selectedWaypointPipeOut?.resume();

    this.tabContainerRef.instance.selectTab(1);
  }

  /** @inheritdoc */
  public onClose(): void {
    super.onClose();

    this.userWaypointArraySub?.pause();
    this.selectedWaypointPipeOut?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();

    this.tabContainerRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    super.onPause();

    this.tabContainerRef.instance.pause();
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'user-info-page';
  }

  /** @inheritdoc */
  protected renderContent(): VNode {
    return (
      <TabbedContainer ref={this.tabContainerRef} configuration={TabConfiguration.LeftRight4} class='user-info-page-tab-container'>
        {this.renderTab(1, 'Info', this.renderInfoTab.bind(this))}
        {this.renderTab(2, 'WPT List', this.renderWaypointListTab.bind(this))}
      </TabbedContainer>
    );
  }

  /**
   * Renders a tab for this page's tab container.
   * @param position The position of the tab.
   * @param label The tab label.
   * @param renderContent A function which renders the tab contents.
   * @returns A tab for this page's tab container, as a VNode.
   */
  private renderTab(
    position: number,
    label: string,
    renderContent?: (
      contentRef: NodeReference<GtcUserWaypointInfoPageTabContent>,
      sidebarState: Subscribable<SidebarState | null>
    ) => VNode
  ): VNode {
    const contentRef = FSComponent.createRef<GtcUserWaypointInfoPageTabContent>();
    const sidebarState = Subject.create<SidebarState | null>(null);

    return (
      <TabbedContent
        position={position}
        label={label}
        onPause={(): void => {
          this._activeComponent.set(null);
          sidebarState.set(null);
          contentRef.instance.onPause();
        }}
        onResume={(): void => {
          this._activeComponent.set(contentRef.getOrDefault());
          sidebarState.set(this._sidebarState);
          contentRef.instance.onResume();
        }}
        onDestroy={(): void => {
          contentRef.getOrDefault()?.destroy();
        }}
        disabled={renderContent === undefined}
      >
        {renderContent && renderContent(contentRef, sidebarState)}
      </TabbedContent>
    );
  }

  /**
   * Renders the info tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The info tab, as a VNode.
   */
  private renderInfoTab(
    contentRef: NodeReference<GtcUserWaypointInfoPageTabContent>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcUserWaypointInfoPageInfoTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        sidebarState={sidebarState}
        facLoader={this.props.facLoader}
        waypointInfo={this.selectedWaypointInfo}
        waypointRelativeBearing={this.selectedWaypointRelativeBearing}
        unitsSettingManager={this.unitsSettingManager}
      />
    );
  }

  /**
   * Renders the freq tab.
   * @param contentRef A reference to assign to the tab's content.
   * @param sidebarState The sidebar state to use.
   * @returns The freq tab, as a VNode.
   */
  private renderWaypointListTab(
    contentRef: NodeReference<GtcUserWaypointInfoPageTabContent>,
    sidebarState: Subscribable<SidebarState | null>
  ): VNode {
    return (
      <GtcUserWaypointInfoPageListTab
        ref={contentRef}
        gtcService={this.props.gtcService}
        waypoint={this.selectedWaypoint}
        facility={this.selectedFacility}
        sidebarState={sidebarState}
        userWaypoints={this.props.userWaypoints}
        onFacilitySelected={facility => {
          this.tabContainerRef.instance.selectTab(1);
          this.initSelection(facility);
        }}
      />
    );
  }

  /** @inheritdoc */
  protected renderOptionsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcUserWaypointInfoOptionsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        controller={this.props.controller}
        selectedWaypoint={this.selectedWaypoint}
        initSelection={this.initSelection.bind(this)}
        showOnMap={this.showOnMap}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tabContainerRef.getOrDefault()?.destroy();

    this.userWaypointArraySub?.destroy();
    this.selectedWaypointPipeOut?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GTC user waypoint information page tab contents.
 */
interface GtcUserWaypointInfoPageTabContentProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The selected waypoint. */
  waypoint: Subscribable<FacilityWaypoint<UserFacility> | null>;

  /** The facility associated with the selected waypoint. */
  facility: Subscribable<UserFacility | null>;

  /** The SidebarState to use. */
  sidebarState: Subscribable<SidebarState | null>;
}

/**
 * A content component for a GTC user waypoint information page tab.
 */
interface GtcUserWaypointInfoPageTabContent extends DisplayComponent<GtcUserWaypointInfoPageTabContentProps>, GtcInteractionHandler {
  /** A method which is called when this component's parent tab is paused. */
  onPause(): void;

  /** A method which is called when this component's parent tab is resumed. */
  onResume(): void;
}

/**
 * Component props for GtcUserWaypointInfoPageInfoTab.
 */
interface GtcUserWaypointInfoPageInfoTabProps extends GtcUserWaypointInfoPageTabContentProps {
  /** A facility loader. */
  facLoader: FacilityLoader;

  /** An information store for the selected user waypoint. */
  waypointInfo: WaypointInfoStore;

  /**
   * The bearing to the selected airport waypoint, relative to the airplane's current heading, or `NaN` if there is no
   * selected waypoint or position/heading data is invalid.
   */
  waypointRelativeBearing: Subscribable<number>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC user waypoint information page info tab.
 */
class GtcUserWaypointInfoPageInfoTab extends DisplayComponent<GtcUserWaypointInfoPageInfoTabProps> implements GtcUserWaypointInfoPageTabContent {
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private thisNode?: VNode;

  private readonly paramsPosSectionCssClass = SetSubject.create([
    'user-info-page-info-section',
    'user-info-page-info-section-bottom-separator',
    'user-info-page-info-params-pos']
  );
  private readonly paramsSectionCssClass = SetSubject.create([
    'user-info-page-info-section',
    'user-info-page-info-section-bottom-separator',
    'user-info-page-info-params']
  );
  private readonly posSectionCssClass = SetSubject.create([
    'user-info-page-info-section',
    'user-info-page-info-section-bottom-separator',
    'user-info-page-info-pos']
  );
  private readonly coordsSectionCssClass = SetSubject.create([
    'user-info-page-info-section',
    'user-info-page-info-section-bottom-separator',
    'user-info-page-info-coords']
  );

  private readonly paramsRow2CssClass = SetSubject.create(['user-info-page-info-params-row']);

  private readonly paramsDis1CssClass = SetSubject.create(['user-info-page-info-params-dis']);

  private facilityOpId = 0;
  private facility?: UserFacility;

  private readonly type = Subject.create('');

  private readonly ref1 = Subject.create<Facility | null>(null);
  private readonly rad1 = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));
  private readonly dis1 = NumberUnitSubject.create<UnitFamily.Distance, Unit<UnitFamily.Distance>>(UnitType.NMILE.createNumber(0));

  private readonly ref2 = Subject.create<Facility | null>(null);
  private readonly rad2 = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  private sidebarStateSub?: Subscription;
  private facilitySub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.sidebarStateSub = this.props.sidebarState.sub(sidebarState => {
      sidebarState?.slot5.set(null);
    }, true);

    this.facilitySub = this.props.facility.sub(this.onFacilityChanged.bind(this), false, true);
  }

  /**
   * Responds to when the selected user facility changes.
   * @param facility The selected user facility.
   */
  private async onFacilityChanged(facility: UserFacility | null): Promise<void> {
    if (facility === null || facility === this.facility) {
      return;
    }

    if (facility.userFacilityType === UserFacilityType.LAT_LONG) {
      this.paramsSectionCssClass.add('hidden');
      this.posSectionCssClass.add('hidden');
      this.coordsSectionCssClass.add('hidden');
      this.paramsPosSectionCssClass.delete('hidden');
    } else {
      const opId = ++this.facilityOpId;

      let ref1: Facility | null = null;
      let ref2: Facility | null = null;
      if (facility.reference1Icao !== undefined && ICAO.isFacility(facility.reference1Icao)) {
        ref1 = await this.getReference(facility.reference1Icao);
      }
      if (facility.reference2Icao !== undefined && ICAO.isFacility(facility.reference2Icao)) {
        ref2 = await this.getReference(facility.reference2Icao);
      }

      if (opId !== this.facilityOpId) {
        return;
      }

      if (facility.userFacilityType === UserFacilityType.RADIAL_DISTANCE) {
        this.type.set('RAD / DIS');

        this.ref1.set(ref1);
        this.setReferenceRadial(facility, ref1, facility.reference1Radial, facility.reference1MagVar, this.rad1);
        this.setReferenceDistance(facility, ref1, facility.reference1Distance, this.dis1);

        this.paramsDis1CssClass.delete('hidden');
        this.paramsRow2CssClass.add('hidden');
      } else {
        this.type.set('RAD / RAD');

        this.ref1.set(ref1);
        this.setReferenceRadial(facility, ref1, facility.reference1Radial, facility.reference1MagVar, this.rad1);
        this.ref2.set(ref2);
        this.setReferenceRadial(facility, ref2, facility.reference2Radial, facility.reference2MagVar, this.rad2);

        this.paramsRow2CssClass.delete('hidden');
        this.paramsDis1CssClass.add('hidden');
      }

      this.paramsPosSectionCssClass.add('hidden');
      this.paramsSectionCssClass.delete('hidden');
      this.posSectionCssClass.delete('hidden');
      this.coordsSectionCssClass.delete('hidden');
    }

    this.facility = facility;
  }

  /**
   * Attempts to retrieve a reference facility.
   * @param icao The ICAO of the reference facility to retrieve.
   * @returns A Promise which is fulfilled with the requested facility, or `null` if it could not be retrieved.
   */
  private async getReference(icao: string): Promise<Facility | null> {
    try {
      return await this.props.facLoader.getFacility(ICAO.getFacilityType(icao), icao);
    } catch {
      return null;
    }
  }

  /**
   * Sets a reference radial for a user facility. If the reference facility is `null` or a unique radial could not be
   * calculated, the user facility's stored value for the radial will be used (if the stored value does not exist, then
   * the radial will be set to zero degrees magnetic).
   * @param facility A user facility.
   * @param reference The reference facility.
   * @param storedRadial The user facility's stored magnetic radial, in degrees, for the reference.
   * @param storedMagVar The user facility's stored magnetic variation, in degrees, for the reference.
   * @param subject The subject to which to write the radial.
   */
  private setReferenceRadial(
    facility: UserFacility,
    reference: Facility | null,
    storedRadial: number | undefined,
    storedMagVar: number | undefined,
    subject: BasicNavAngleSubject
  ): void {
    let trueRadial: number | undefined;
    let magVar = storedMagVar ?? 0;
    if (reference !== null) {
      magVar = FacilityUtils.getMagVar(reference);

      const radial = GeoPoint.initialBearing(reference.lat, reference.lon, facility.lat, facility.lon);
      if (!isNaN(radial)) {
        trueRadial = radial;
      }
    }

    if (trueRadial === undefined) {
      subject.set(storedRadial ?? 0, magVar);
    } else {
      subject.set(MagVar.trueToMagnetic(trueRadial, magVar), magVar);
    }
  }

  /**
   * Sets a reference radial for a user facility. If the reference facility is `null`, the user facility's stored value
   * for the distance will be used (if the stored value does not exist, then the distance will be set to zero).
   * @param facility A user facility.
   * @param reference The reference facility.
   * @param storedDistance The user facility's stored distance, in nautical miles, from the reference.
   * @param subject The subject to which to write the distance.
   */
  private setReferenceDistance(
    facility: UserFacility,
    reference: Facility | null,
    storedDistance: number | undefined,
    subject: NumberUnitSubject<UnitFamily.Distance>
  ): void {
    let distance: number;
    if (reference === null) {
      distance = storedDistance ?? 0;
    } else {
      distance = UnitType.GA_RADIAN.convertTo(GeoPoint.distance(facility.lat, facility.lon, reference?.lat, reference.lon), UnitType.NMILE);
    }

    subject.set(distance);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.facilitySub?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.facilitySub?.resume(true);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='user-info-page-tab user-info-page-info'>
          <div class={this.paramsPosSectionCssClass}>
            <div class='user-info-page-info-params-pos-type'>LAT / LON</div>
            <div class='user-info-page-info-params-pos-values'>
              <GarminLatLonDisplay
                value={this.props.waypointInfo.location}
                format={LatLonDisplayFormat.HDDD_MMmm}
                class='user-info-page-info-params-pos-coords'
              />
              <div class='user-info-page-info-params-pos-pos'>
                <div class='user-info-page-info-params-pos-field'>
                  <div class='user-info-page-info-params-pos-field-title'>DIS: </div>
                  <NumberUnitDisplay
                    value={this.props.waypointInfo.distance}
                    displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                    formatter={GtcUserWaypointInfoPageInfoTab.DISTANCE_FORMATTER}
                  />
                </div>
                <div class='user-info-page-info-params-pos-field'>
                  <div class='user-info-page-info-params-pos-field-title'>BRG: </div>
                  <div class='user-info-page-bearing'>
                    <BearingDisplay
                      value={this.props.waypointInfo.bearing}
                      displayUnit={this.props.unitsSettingManager.navAngleUnits}
                      formatter={GtcUserWaypointInfoPageInfoTab.BEARING_FORMATTER}
                    />
                    <GtcBearingArrow
                      relativeBearing={this.props.waypointRelativeBearing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class={this.paramsSectionCssClass}>
            <div class='user-info-page-info-params-type'>{this.type}</div>
            <div class='user-info-page-info-params-row'>
              <div class='user-info-page-info-params-ref'>{' 1)'}{this.ref1.map(ref => ref === null ? '______' : ICAO.getIdent(ref.icao))}</div>
              <BearingDisplay
                value={this.rad1}
                displayUnit={this.props.unitsSettingManager.navAngleUnits}
                formatter={GtcUserWaypointInfoPageInfoTab.BEARING_FORMATTER}
                class='user-info-page-info-params-rad'
              />
              <NumberUnitDisplay
                value={this.dis1}
                displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                formatter={GtcUserWaypointInfoPageInfoTab.DISTANCE_FORMATTER}
                class={this.paramsDis1CssClass}
              />
            </div>
            <div class={this.paramsRow2CssClass}>
              <div class='user-info-page-info-params-ref'>{' 2)'}{this.ref2.map(ref => ref === null ? '______' : ICAO.getIdent(ref.icao))}</div>
              <BearingDisplay
                value={this.rad2}
                displayUnit={this.props.unitsSettingManager.navAngleUnits}
                formatter={GtcUserWaypointInfoPageInfoTab.BEARING_FORMATTER}
                class='user-info-page-info-params-rad'
              />
            </div>
          </div>
          <div class={this.posSectionCssClass}>
            <div class='user-info-page-info-field'>
              <div class='user-info-page-info-field-title'>BRG</div>
              <div class='user-info-page-bearing'>
                <BearingDisplay
                  value={this.props.waypointInfo.bearing}
                  displayUnit={this.props.unitsSettingManager.navAngleUnits}
                  formatter={GtcUserWaypointInfoPageInfoTab.BEARING_FORMATTER}
                />
                <GtcBearingArrow
                  relativeBearing={this.props.waypointRelativeBearing}
                />
              </div>
            </div>
            <div class='user-info-page-info-field'>
              <div class='user-info-page-info-field-title'>DIS</div>
              <NumberUnitDisplay
                value={this.props.waypointInfo.distance}
                displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                formatter={GtcUserWaypointInfoPageInfoTab.DISTANCE_FORMATTER}
              />
            </div>
          </div>
          <GarminLatLonDisplay
            value={this.props.waypointInfo.location}
            format={LatLonDisplayFormat.HDDD_MMmm}
            class={this.coordsSectionCssClass}
          />
        </div>
        <GtcWaypointInfoPageNoWaypointMessage selectedWaypoint={this.props.waypoint as Subscribable<FacilityWaypoint<Facility> | null>}>
          No User Waypoint Available
        </GtcWaypointInfoPageNoWaypointMessage>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (this.thisNode !== undefined) {
      FSComponent.visitNodes(this.thisNode, node => {
        if (node !== this.thisNode && node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        } else {
          return false;
        }
      });
    }

    this.sidebarStateSub?.destroy();
    this.facilitySub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for GtcUserWaypointInfoPageListTab.
 */
interface GtcUserWaypointInfoPageListTabProps extends GtcUserWaypointInfoPageTabContentProps {
  /** An array of all existing user waypoints. */
  userWaypoints: SubscribableArray<FacilityWaypoint<UserFacility>>;

  /** A callback function to execute when a user waypoint facility is selected from the tab's list. */
  onFacilitySelected: (facility: UserFacility) => void;
}

/**
 * An entry for the user waypoint information page waypoint list representing the Add User Waypoint button.
 */
type ListAddWaypointEntry = {
  /** Flags this object as an add waypoint entry object. */
  addWaypoint: true;
};

/**
 * A GTC user waypoint information page waypoint list tab.
 */
class GtcUserWaypointInfoPageListTab extends DisplayComponent<GtcUserWaypointInfoPageListTabProps> implements GtcUserWaypointInfoPageTabContent {
  private readonly listRef = FSComponent.createRef<GtcList<(FacilityWaypoint<UserFacility> | ListAddWaypointEntry) & DynamicListData>>();
  private readonly noWaypointRef = FSComponent.createRef<GtcWaypointInfoPageNoWaypointMessage>();

  private readonly listItemHeight = this.props.gtcService.isHorizontal ? 130 : 69;

  private readonly listData = ArraySubject.create<(FacilityWaypoint<UserFacility> | ListAddWaypointEntry) & DynamicListData>([{ addWaypoint: true }]);

  private waypointsSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.waypointsSub = this.props.userWaypoints.sub((index, type, item) => {
      switch (type) {
        case SubscribableArrayEventType.Added:
          if (Array.isArray(item)) {
            this.listData.insertRange(index, item);
          } else if (item !== undefined) {
            this.listData.insert(item as FacilityWaypoint<UserFacility>, index);
          }
          break;
        case SubscribableArrayEventType.Removed: {
          const end = index + (Array.isArray(item) ? item.length : 1);
          for (let i = index; i < end; i++) {
            this.listData.removeAt(index);
          }
          break;
        }
        case SubscribableArrayEventType.Cleared:
          this.listData.clear();
          this.listData.insert({ addWaypoint: true });
          break;
      }
    }, true);
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    this.listRef.instance.scrollToIndex(0, 0, false);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class='user-info-page-tab user-info-page-list'>
          <GtcList
            ref={this.listRef}
            bus={this.props.gtcService.bus}
            data={this.listData}
            renderItem={data => {
              if ('addWaypoint' in data) {
                return (
                  <GtcListButton
                    label='Add User Waypoint'
                    fullSizeButton
                    onPressed={async () => {
                      const result = await this.props.gtcService.openPopup<GtcUserWaypointDialog>(GtcViewKeys.UserWaypointDialog, 'slideout-right-full')
                        .ref.request({});

                      if (!result.wasCancelled) {
                        this.props.onFacilitySelected(result.payload);
                      }
                    }}
                  />
                );
              } else {
                const ref = FSComponent.createRef<GtcWaypointDisplay>();
                return (
                  <GtcListButton
                    onPressed={() => { this.props.onFacilitySelected(data.facility.get()); }}
                    onDestroy={() => { ref.getOrDefault()?.destroy(); }}
                    touchButtonClasses='user-info-page-list-wpt-button'
                  >
                    <GtcWaypointDisplay ref={ref} waypoint={data} />
                  </GtcListButton>
                );
              }
            }}
            sidebarState={this.props.sidebarState}
            listItemHeightPx={this.listItemHeight}
            listItemSpacingPx={1}
            itemsPerPage={4}
            class='user-info-page-list-list'
          />
        </div>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();
    this.noWaypointRef.getOrDefault()?.destroy();

    this.waypointsSub?.destroy();

    super.destroy();
  }
}
