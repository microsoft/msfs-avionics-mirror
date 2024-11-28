import {
  BasicNavAngleSubject, Facility, FacilityLoader, FacilityRepository, FacilitySearchType, FacilityType, FacilityUtils,
  FSComponent, GeoPointSubject, ICAO, IcaoType, IcaoValue, LatLonInterface, MagVar, NearestSubscription, NumberFormatter,
  NumberUnitSubject, SetSubject, Subject, UnitFamily, UnitType, UserFacility, UserFacilityUtils, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import {
  BearingDisplay, LatLonDisplay, LatLonDisplayFormat, NumberUnitDisplay, UnitsDistanceSettingMode, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';

import { G3000FacilityUtils, G3000FilePaths, G3000NearestContext } from '@microsoft/msfs-wtg3000-common';

import { GtcListSelectTouchButton } from '../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { GtcValueTouchButton } from '../Components/TouchButton/GtcValueTouchButton';
import { GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcPositionHeadingDataProvider } from '../Navigation/GtcPositionHeadingDataProvider';
import { GtcUserWaypointEditController, UserWaypointFlightPlanStatus } from '../Navigation/GtcUserWaypointEditController';
import { GtcCourseDialog } from './GtcCourseDialog';
import { GtcDialogs } from './GtcDialogs';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { GtcDistanceDialog } from './GtcDistanceDialog';
import { GtcLatLonDialog } from './GtcLatLonDialog';
import { GtcTextDialog } from './GtcTextDialog';
import { GtcUserWaypointDialogStore, GtcUserWaypointType } from './GtcUserWaypointDialogStore';
import { GtcWaypointDialog } from './GtcWaypointDialog';

import './GtcUserWaypointDialog.css';

/**
 * A request for {@link GtcUserWaypointDialog} to edit an existing user waypoint facility.
 */
export type GtcUserWaypointDialogEditInput = {
  /** The facility to edit, or the ICAO of the facility to edit. */
  editFacility: IcaoValue | UserFacility;
}

/**
 * A request for {@link GtcUserWaypointDialog} to create a new user waypoint.
 */
export type GtcUserWaypointDialogCreateInput = {
  /**
   * The latitude/longitude coordinates initially loaded into the dialog at the start of the request. If defined, the
   * dialog will also initialize to LAT/LON mode. If not defined, the dialog will initialize to RAD/DIS mode with the
   * initial coordinates set to match the airplane's current position.
   */
  initialLatLon?: LatLonInterface;
}

/**
 * A request input for {@link GtcUserWaypointDialog}.
 */
export type GtcUserWaypointDialogInput = GtcUserWaypointDialogEditInput | GtcUserWaypointDialogCreateInput;

/**
 * Component props for GtcUserWaypointDialog.
 */
export interface GtcUserWaypointDialogProps extends GtcViewProps {
  /** The facility repository. */
  facRepo: FacilityRepository;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A controller for editing user waypoints. */
  controller: GtcUserWaypointEditController;

  /** A provider of airplane position data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/**
 * A GTC dialog which allows the user to create and edit user waypoints.
 */
export class GtcUserWaypointDialog extends GtcView<GtcUserWaypointDialogProps> implements GtcDialogView<GtcUserWaypointDialogInput, UserFacility> {
  private static readonly REFERENCE_FORMATTER = (reference: Facility | null): string => reference === null ? '______' : ICAO.getIdent(reference.icao);
  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3 });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3 });

  private static readonly MAX_DISTANCE = 8130; // same value for nm and km

  private thisNode?: VNode;

  private readonly rootCssClass = SetSubject.create(['usr-wpt-dialog']);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  private readonly store = new GtcUserWaypointDialogStore(
    this.props.facRepo,
    this.props.facLoader,
    this.props.posHeadingDataProvider.ppos,
    this.unitsSettingManager
  );

  private readonly editingFacility = Subject.create<UserFacility | null>(null);

  private nearestVors?: NearestSubscription<VorFacility>;
  private readonly nearestSortFunc = (a: Facility, b: Facility): number => {
    const ppos = this.props.posHeadingDataProvider.ppos.get();
    return ppos.distance(a.lat, a.lon) - ppos.distance(b.lat, b.lon);
  };

  protected resolveFunction?: (value: any) => void;
  protected resultObject: GtcDialogResult<UserFacility | null> = {
    wasCancelled: true,
  };

  protected isAlive = true;

  /** @inheritdoc */
  public constructor(props: GtcUserWaypointDialogProps) {
    super(props);

    G3000NearestContext.getInstance().then(context => { this.nearestVors = context.vors; });
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.editingFacility.sub(fac => this._title.set(fac === null ? 'Create User Waypoint' : 'Edit User Waypoint'), true);

    this._sidebarState.slot1.set('cancel');
    this._sidebarState.slot5.set('enterEnabled');

    this.store.type.sub(type => {
      this.rootCssClass.toggle('usr-wpt-dialog-rad-dis', type === GtcUserWaypointType.RadialDistance);
      this.rootCssClass.toggle('usr-wpt-dialog-rad-rad', type === GtcUserWaypointType.RadialRadial);
      this.rootCssClass.toggle('usr-wpt-dialog-lat-lon', type === GtcUserWaypointType.LatLon || type === GtcUserWaypointType.PPos);
    }, true);
  }

  /** @inheritdoc */
  public request(input: GtcUserWaypointDialogInput): Promise<GtcDialogResult<UserFacility>> {
    if (!this.isAlive) {
      throw new Error('GtcUserWaypointDialog: cannot request from a dead dialog');
    }

    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      const ppos = this.props.posHeadingDataProvider.ppos.get();
      this.store.resetAutoComment();
      this.store.setAutoIdent();
      this.store.syncFromLatLon(ppos.lat, ppos.lon);
      this.store.type.set(GtcUserWaypointType.RadialDistance);

      let nearestVors: VorFacility[] | undefined;
      if (this.nearestVors !== undefined) {
        nearestVors = Array.from(this.nearestVors.getArray()).sort(this.nearestSortFunc);
      }

      this.store.ref1.set(nearestVors?.[0] ?? null);
      this.store.ref2.set(nearestVors?.[1] ?? null);

      if ('editFacility' in input) {
        this._sidebarState.enterButtonLabel.set('Save');

        // edit facility
        this.initEditing(input.editFacility);
      } else {
        // create new facility

        this._sidebarState.enterButtonLabel.set('Create');

        if (input.initialLatLon !== undefined) {
          this.store.syncFromLatLon(input.initialLatLon.lat, input.initialLatLon.lon);
        }
      }
    });
  }

  /**
   * Initializes this view to edit an existing user waypoint.
   * @param fac The existing user waypoint facility to edit, or its ICAO string.
   */
  private async initEditing(fac: IcaoValue | UserFacility): Promise<void> {
    if (ICAO.isValue(fac)) {
      if (!ICAO.isValueFacility(fac, FacilityType.USR)) {
        return;
      }

      const retrievedFac = this.props.facRepo.get(fac) as UserFacility | undefined;
      if (retrievedFac === undefined) {
        return;
      }

      fac = retrievedFac;
    }

    if (!FacilityUtils.isFacilityType(fac, FacilityType.USR)) {
      return;
    }

    this.editingFacility.set(fac);
    await this.store.syncFromFacility(fac);
  }

  /** @inheritdoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    if (event === GtcInteractionEvent.ButtonBarEnterPressed) {
      this.tryCreateWaypoint();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Attempts to create a new user waypoint with the currently selected parameters and add the new waypoint facility
   * to the facility repository. If this view is in editing mode, then the new facility will replace the edited
   * facility.
   */
  private async tryCreateWaypoint(): Promise<void> {
    if (this.props.controller.isUserWaypointCountAtLimit()) {
      GtcDialogs.openMessageDialog(this.props.gtcService, 'User waypoint limit reached.', false);
      return;
    }

    if (this.store.ident.get().length === 0) {
      GtcDialogs.openMessageDialog(this.props.gtcService, 'Invalid user waypoint identifier.', false);
      return;
    }

    const icaoValue = ICAO.value(
      IcaoType.User,
      '',
      G3000FacilityUtils.USER_FACILITY_SCOPE,
      this.store.ident.get()
    );

    const icao = ICAO.valueToStringV1(icaoValue);

    const editingFacility = this.editingFacility.get();

    // Do not allow replacing an existing user facility unless we are editing that facility.
    if (this.props.controller.doesUserWaypointExist(icaoValue) && (!editingFacility || !ICAO.valueEquals(icaoValue, editingFacility.icaoStruct))) {
      GtcDialogs.openMessageDialog(this.props.gtcService, `The user waypoint identifier\n${this.store.ident.get()} is already assigned.\nCannot create waypoint.`, false);
      return;
    }

    let facility: UserFacility;

    switch (this.store.type.get()) {
      case GtcUserWaypointType.RadialDistance: {
        const reference = this.store.ref1.get();

        if (reference === null) {
          GtcDialogs.openMessageDialog(this.props.gtcService, 'Invalid reference waypoint.', false);
          return;
        }

        facility = UserFacilityUtils.createFromRadialDistance(
          icao,
          reference,
          this.store.rad1.get().number,
          this.store.dis1.get().number,
          true,
          this.store.comment.get()
        );
        break;
      }
      case GtcUserWaypointType.RadialRadial: {
        const reference1 = this.store.ref1.get();
        const reference2 = this.store.ref2.get();

        if (reference1 === null) {
          GtcDialogs.openMessageDialog(this.props.gtcService, 'First reference waypoint is invalid.', false);
          return;
        }
        if (reference2 === null) {
          GtcDialogs.openMessageDialog(this.props.gtcService, 'Second reference waypoint is invalid.', false);
          return;
        }

        const createdFacility = UserFacilityUtils.createFromRadialRadial(
          icao,
          reference1,
          this.store.rad1.get().number,
          reference2,
          this.store.rad2.get().number,
          true,
          this.store.comment.get()
        );

        if (createdFacility === undefined) {
          GtcDialogs.openMessageDialog(this.props.gtcService, 'The radials entered do not\nintersect', false);
          return;
        }

        facility = createdFacility;
        break;
      }
      default: {
        const latLon = this.store.latLon.get();

        facility = UserFacilityUtils.createFromLatLon(
          icao,
          latLon.lat,
          latLon.lon,
          true,
          this.store.comment.get()
        );
      }
    }

    if (editingFacility !== null) {
      const result = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Are you sure you want to modify\nthis waypoint?');

      if (!result) {
        return;
      }

      // Check if the user facility is part of the flight plan.

      const flightPlanStatus = this.props.controller.getWaypointFlightPlanStatus(editingFacility.icaoStruct);

      if (flightPlanStatus === UserWaypointFlightPlanStatus.ActiveLeg) {
        GtcDialogs.openMessageDialog(this.props.gtcService, `The user waypoint ${this.store.ident.get()} is part of the active leg in the flight plan and cannot be modified.`, false);
        return;
      } else if (flightPlanStatus === UserWaypointFlightPlanStatus.InFlightPlan) {
        // TODO: Garmin actually allows you to edit user waypoints in a flight plan as long as it's not part of the
        // active leg. However, that's a huge pain to implement so I'm going to disallow that for now.
        GtcDialogs.openMessageDialog(this.props.gtcService, 'User waypoint is part of at least one flight plan and cannot be modified.', false);
        return;
      }

      this.props.controller.editUserFacility(editingFacility.icaoStruct, facility);
    } else {
      this.props.controller.addUserFacility(facility);
    }

    this.resultObject = {
      wasCancelled: false,
      payload: facility
    };

    this.props.gtcService.goBack();
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.editingFacility.set(null);

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Opens a dialog to allow the user to select an ident.
   */
  private async selectIdent(): Promise<void> {
    const result = await this.props.gtcService.openPopup<GtcTextDialog>(GtcViewKeys.TextDialog, 'normal', 'hide')
      .ref.request({
        label: 'Enter New Wpt Name',
        allowSpaces: false,
        maxLength: 6
      });

    if (!result.wasCancelled && result.payload.length > 0) {
      this.store.ident.set(result.payload);
    }
  }

  /**
   * Opens a dialog to allow the user to select a comment.
   */
  private async selectComment(): Promise<void> {
    const result = await this.props.gtcService.openPopup<GtcTextDialog>(GtcViewKeys.TextDialog, 'normal', 'hide')
      .ref.request({
        label: 'Enter Comments',
        allowSpaces: true,
        maxLength: 26,
        initialValue: this.store.comment.get()
      });

    if (!result.wasCancelled) {
      this.store.comment.set(result.payload);
    }
  }

  /**
   * Opens a dialog to allow the user to select a reference facility.
   * @param subject The subject in which to store the selected reference facility.
   */
  private async selectReference(subject: Subject<Facility | null>): Promise<void> {
    const initialValue = subject.get();

    const result = await this.props.gtcService.openPopup<GtcWaypointDialog>(GtcViewKeys.WaypointDialog, 'normal', 'hide')
      .ref.request({
        searchType: FacilitySearchType.AllExceptVisual,
        emptyLabelText: 'Waypoint Identifier Lookup',
        initialValue: initialValue ?? undefined
      });

    if (!result.wasCancelled) {
      subject.set(result.payload);
    }
  }

  /**
   * Opens a dialog to allow the user to select a radial.
   * @param reference The radial's reference facility. If `null`, the dialog will not be opened.
   * @param subject The subject in which to store the selected radial.
   */
  private async selectRadial(reference: Facility | null, subject: BasicNavAngleSubject): Promise<void> {
    const initialValue = Math.round(subject.get().asUnit(this.unitsSettingManager.navAngleUnits.get())) % 360;

    const result = await this.props.gtcService.openPopup<GtcCourseDialog>(GtcViewKeys.CourseDialog, 'normal', 'hide')
      .ref.request({
        title: `${GtcUserWaypointDialog.REFERENCE_FORMATTER(reference)} Radial`,
        initialValue: initialValue === 0 ? 360 : initialValue
      });

    if (!result.wasCancelled) {
      const value = this.unitsSettingManager.navAngleUnits.get().isMagnetic()
        ? result.payload
        : MagVar.trueToMagnetic(result.payload, subject.get().unit.magVar);

      subject.set(value);
    }
  }

  /**
   * Opens a dialog to allow the user to select a distance.
   * @param subject The subject in which to store the selected distance.
   */
  private async selectDistance(subject: NumberUnitSubject<UnitFamily.Distance>): Promise<void> {
    const result = await this.props.gtcService.openPopup<GtcDistanceDialog>(GtcViewKeys.DistanceDialog1, 'normal', 'hide')
      .ref.request({
        title: 'Distance',
        initialValue: subject.get().number,
        initialUnit: UnitType.NMILE,
        unitType: this.unitsSettingManager.getSetting('unitsDistance').value === UnitsDistanceSettingMode.Metric ? UnitType.KILOMETER : UnitType.NMILE,
        minimumValue: 0,
        maximumValue: GtcUserWaypointDialog.MAX_DISTANCE
      });

    if (!result.wasCancelled) {
      subject.set(result.payload.value, result.payload.unit);
    }
  }

  /**
   * Opens a dialog to allow the user to select a set of latitude/longitude coordinates.
   * @param subject The subject in which to store the selected coordinates.
   */
  private async selectLatLon(subject: GeoPointSubject): Promise<void> {
    const result = await this.props.gtcService.openPopup<GtcLatLonDialog>(GtcViewKeys.LatLonDialog, 'normal', 'hide')
      .ref.request({
        title: 'LAT / LON',
        initialValue: subject.get(),
        format: LatLonDisplayFormat.HDDD_MMmm
      });

    if (!result.wasCancelled) {
      subject.set(result.payload);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='usr-wpt-dialog-top-row'>
          <GtcTouchButton
            class='usr-wpt-dialog-ident-button'
            onPressed={this.selectIdent.bind(this)}
          >
            <div class='usr-wpt-dialog-ident-button-container'>
              <div class='usr-wpt-dialog-ident-button-ident'>{this.store.ident.map(ident => ident.length === 0 ? '______' : ident)}</div>
              <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_small_user.png`} class='usr-wpt-dialog-ident-button-icon' />
            </div>
          </GtcTouchButton>
          <GtcToggleTouchButton
            state={this.store.isTemporary}
            label='Temporary'
            isEnabled={false}
            class='usr-wpt-dialog-temp-button'
          />
        </div>
        <GtcListSelectTouchButton
          gtcService={this.props.gtcService}
          listDialogKey={GtcViewKeys.ListDialog1}
          state={this.store.type}
          label='Type'
          listParams={{
            title: 'Select User Waypoint Type',
            inputData: [
              {
                value: GtcUserWaypointType.RadialDistance,
                labelRenderer: () => GtcUserWaypointType.RadialDistance
              },
              {
                value: GtcUserWaypointType.RadialRadial,
                labelRenderer: () => GtcUserWaypointType.RadialRadial
              },
              {
                value: GtcUserWaypointType.LatLon,
                labelRenderer: () => GtcUserWaypointType.LatLon
              },
              {
                value: GtcUserWaypointType.PPos,
                labelRenderer: () => GtcUserWaypointType.PPos
              }
            ],
            class: 'gtc-list-dialog-wide'
          }}
          class='usr-wpt-dialog-type-button'
        />
        <div class='usr-wpt-dialog-params'>
          <div class='usr-wpt-dialog-params-type usr-wpt-dialog-params-rad-dis'>
            <GtcValueTouchButton
              state={this.store.ref1}
              label='REF'
              renderValue={GtcUserWaypointDialog.REFERENCE_FORMATTER}
              onPressed={this.selectReference.bind(this, this.store.ref1)}
              class='usr-wpt-dialog-ref-button'
            />
            <GtcValueTouchButton
              state={this.store.rad1}
              label='RAD'
              renderValue={
                <BearingDisplay
                  value={this.store.rad1}
                  displayUnit={this.unitsSettingManager.navAngleUnits}
                  formatter={GtcUserWaypointDialog.BEARING_FORMATTER}
                />
              }
              onPressed={() => { this.selectRadial(this.store.ref1.get(), this.store.rad1); }}
              class='usr-wpt-dialog-rad-button'
            />
            <GtcValueTouchButton
              state={this.store.dis1}
              label='DIS'
              renderValue={
                <NumberUnitDisplay
                  value={this.store.dis1}
                  displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                  formatter={GtcUserWaypointDialog.DISTANCE_FORMATTER}
                />
              }
              onPressed={() => { this.selectDistance(this.store.dis1); }}
              class='usr-wpt-dialog-dis-button'
            />
          </div>
          <div class='usr-wpt-dialog-params-type usr-wpt-dialog-params-rad-rad'>
            <div class='usr-wpt-dialog-params-rad-rad-row'>
              <GtcValueTouchButton
                state={this.store.ref1}
                label='REF1'
                renderValue={GtcUserWaypointDialog.REFERENCE_FORMATTER}
                onPressed={this.selectReference.bind(this, this.store.ref1)}
                class='usr-wpt-dialog-ref-button'
              />
              <GtcValueTouchButton
                state={this.store.rad1}
                label='RAD1'
                renderValue={
                  <BearingDisplay
                    value={this.store.rad1}
                    displayUnit={this.unitsSettingManager.navAngleUnits}
                    formatter={GtcUserWaypointDialog.BEARING_FORMATTER}
                  />
                }
                onPressed={() => { this.selectRadial(this.store.ref1.get(), this.store.rad1); }}
                class='usr-wpt-dialog-rad-button'
              />
            </div>
            <div class='usr-wpt-dialog-params-rad-rad-row'>
              <GtcValueTouchButton
                state={this.store.ref2}
                label='REF2'
                renderValue={GtcUserWaypointDialog.REFERENCE_FORMATTER}
                onPressed={this.selectReference.bind(this, this.store.ref2)}
                class='usr-wpt-dialog-ref-button'
              />
              <GtcValueTouchButton
                state={this.store.rad2}
                label='RAD2'
                renderValue={
                  <BearingDisplay
                    value={this.store.rad2}
                    displayUnit={this.unitsSettingManager.navAngleUnits}
                    formatter={GtcUserWaypointDialog.BEARING_FORMATTER}
                  />
                }
                onPressed={() => { this.selectRadial(this.store.ref2.get(), this.store.rad2); }}
                class='usr-wpt-dialog-rad-button'
              />
            </div>
          </div>
          <div class='usr-wpt-dialog-params-type usr-wpt-dialog-params-lat-lon'>
            <GtcValueTouchButton
              state={this.store.latLon}
              label='LAT / LON'
              renderValue={
                <LatLonDisplay
                  value={this.store.latLon}
                  format={LatLonDisplayFormat.HDDD_MMmm}
                  class='usr-wpt-dialog-latlon-button-value'
                />
              }
              onPressed={() => { this.selectLatLon(this.store.latLon); }}
              isEnabled={this.store.type.map(type => type === GtcUserWaypointType.LatLon)}
              class='usr-wpt-dialog-latlon-button'
            />
          </div>
        </div>
        <GtcValueTouchButton
          state={this.store.comment}
          label='Comment'
          onPressed={this.selectComment.bind(this)}
          class='usr-wpt-dialog-comment-button'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
