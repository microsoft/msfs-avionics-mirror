import {
  Facility, FacilitySearchType, FocusPosition, FSComponent, NodeReference, GeoPoint, GeoPointSubject,
  GNSSEvents, ICAO, ImageCache, LatLonDisplay, NearestContext, NumberUnitSubject, Subject, Unit,
  UnitFamily, UnitType, VNode, ArraySubject, SubscribableArrayEventType, AirportFacility, LegType, BasicFacilityWaypoint, LegDefinition, Waypoint, FacilityWaypointUtils,
} from '@microsoft/msfs-sdk';

import { DirectToState, Fms } from '@microsoft/msfs-garminsdk';

import { MenuDefinition, MenuEntry, PageProps, ViewService } from '../Pages';
import { Dialog } from './Dialog';
import { AlphaNumInput } from '../../Controls/AlphaNumInput';
import { InteractionEvent } from '../../InteractionEvent';
import { SelectableText } from '../../Controls/SelectableText';
import { GNSNumberUnitInput } from '../../Controls/GNSNumberUnitInput';
import { GNSDigitInput } from '../../Controls/GNSDigitInput';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GnsDirectToStore } from '../../../Navigation/GnsDirectToStore';
import { GnsDirectToController } from '../../../Navigation/GnsDirectToController';
import { OptionDialog } from '../../Controls/OptionDialog';
import { Icons } from '../../Icons';

import './DirectToDialog.css';

/**
 * An object representing an entry in the FPL list of the DTO page
 */
interface DirectToFlightPlanWaypointEntry {
  /** Leg index in the flight plan */
  index: number,

  /** Leg ident */
  ident: string,

  /** FS ICAO of the facility to select */
  icao: string
}

/**
 * Menu for {@link DirectToDialog}
 */
class DirectToDialogMenu extends MenuDefinition {

  public entries: readonly MenuEntry[] = [
    {
      label: 'Cancel Direct-To NAV?',
      disabled: this.directToInactive,
      action: (): void => {
        this.cancelDirectTo();
        ViewService.back();
        ViewService.open('NAV', true, 1);
      }
    },
  ];


  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly directToInactive: Subject<boolean>, private cancelDirectTo: () => void) {

    super();
  }

}

/**
 * Props for {@link DirectToDialog}
 */
export interface DirectToProps extends PageProps {
  /**
   * An FMS
   */
  fms: Fms,
}

/**
 * DIRECT TO dialog
 */
export class DirectToDialog extends Dialog<DirectToProps> {
  private readonly nearestAirportInputRef = FSComponent.createRef<SelectableText>();
  private readonly nearestAirportDialogRef = FSComponent.createRef<OptionDialog>();

  private readonly flightPlanWaypointsInputRef = FSComponent.createRef<SelectableText>();
  private readonly flightPlanWaypointsDialogRef = FSComponent.createRef<OptionDialog>();

  private readonly directToInactive = Subject.create<boolean>(true);

  private menu = new DirectToDialogMenu(this.directToInactive, (): void => {
    return this.cancelDirectTo();
  });

  private pposSub = GeoPointSubject.create(new GeoPoint(0, 0));

  private previewFacility = Subject.create<Facility | null>(null);
  private previewWaypoint = this.previewFacility.map((it) => {
    if (it) {
      return new BasicFacilityWaypoint(it, this.props.bus);
    } else {
      return null;
    }
  });

  private store = new GnsDirectToStore(this.previewWaypoint, this.pposSub);
  private controller = new GnsDirectToController(this.store, this.props.fms, ViewService, () => {
    this.input.instance.blur();
    this.root.instance.focus(FocusPosition.Last);
  });

  private readonly angleUnit = Subject.create<Unit<UnitFamily.Angle>>(UnitType.DEGREE);

  // TODO extract all this to a component
  private debounceTimeout?: number;
  private readonly input = FSComponent.createRef<AlphaNumInput>();
  private readonly activatePromptContainer = FSComponent.createRef<HTMLDivElement>();
  private readonly activatePrompt = FSComponent.createRef<SelectableText>();

  private readonly name = Subject.create('____________________');
  private readonly city = Subject.create('____________________');
  private readonly region = Subject.create('__________');
  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  private readonly icon = FSComponent.createRef<HTMLImageElement>();

  private directToFacility?: Facility;
  private matchingIcaos: string[] = [];

  protected readonly nearestAirports = ArraySubject.create<AirportFacility>([]);
  protected readonly nearestAirportInput = Subject.create('');

  protected readonly flightPlanWaypointChoices = ArraySubject.create<DirectToFlightPlanWaypointEntry>([]);
  protected readonly flightPlanWaypointInput = Subject.create('');

  /**
   * Accepts a facility to be the new preview facility and therefore waypoint
   *
   * @param facility The facility to set.
   * @param legDefinition The leg definition.
   */
  public acceptPreviewFacility(facility: Facility, legDefinition?: LegDefinition): void {
    this.previewFacility.set(facility);
    this.controller.directToExistingLegDefinition = legDefinition ?? null;
    this.input.instance.set(ICAO.getIdent(facility.icao));
    this.input.instance.focusSelf();
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<GNSSEvents>()
      .on('gps-position')
      .handle(pos => this.pposSub.set(pos.lat, pos.long));

    // Connect store waypoint to controller
    this.store.waypoint.sub((waypoint) => this.controller.waypointChangedHandler(waypoint));

    // Connect waypoint info
    this.controller.inputIcao.sub(async (icao) => {
      const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao);

      if (facility) {
        this.acceptPreviewFacility(facility);
      } else {
        console.error('Facility ICAO given by DTO controller could not be found');
      }
    });
    this.store.waypointInfoStore.name.sub((name) => this.name.set(name ?? '____________________'));
    this.store.waypointInfoStore.city.sub((name) => this.city.set(name ?? '____________________'));
    this.store.waypointInfoStore.region.sub((name) => this.region.set(name ?? '__________'));
    this.store.waypoint.sub((waypoint) => {
      if (waypoint?.location) {
        this.position.set(waypoint?.location.get());
      }
      this.updateIcon(waypoint);
    });

    // Connect `Activate?` prompt to controller state
    this.controller.canActivate.sub((canActivate) => {
      if (canActivate) {
        this.activatePromptContainer.instance.classList.remove('hidden-element');
        this.activatePrompt.instance.setDisabled(false);
      } else {
        this.activatePromptContainer.instance.classList.add('hidden-element');
        this.activatePrompt.instance.setDisabled(true);
      }
    });

    // Connect NearestContext airports to list
    NearestContext.onInitialized((instance) => {
      instance.airports.sub((index, type, item) => {
        switch (type) {
          case SubscribableArrayEventType.Added:
            this.nearestAirports.insert(item as AirportFacility, index);
            break;
          case SubscribableArrayEventType.Removed:
            this.nearestAirports.removeAt(index);
            break;
          case SubscribableArrayEventType.Cleared:
            this.nearestAirports.clear();
            break;
        }
      });
    });

    // Connect nearest airports list to dialog items
    this.nearestAirports.sub((_, __, ___, array) => {
      if (array.length > 0) {
        const first = array[0];

        this.nearestAirportInput.set(ICAO.getIdent(first.icao));
        this.nearestAirportInputRef.instance.setDisabled(false);
        this.nearestAirportDialogRef.instance.setItems(array.map((it) => ICAO.getIdent(it.icao)), false);
      } else {
        this.nearestAirportInput.set('');
        this.nearestAirportInputRef.instance.setDisabled(true);
        this.nearestAirportDialogRef.instance.setItems([], false);
      }
    });

    // Connect flight plan waypoint choices list to dialog items
    this.flightPlanWaypointChoices.sub((_, __, ___, array) => {
      if (array.length > 0) {
        const first = array[0];

        this.flightPlanWaypointInput.set(first.ident);
        this.flightPlanWaypointsInputRef.instance.setDisabled(false);
        this.flightPlanWaypointsDialogRef.instance.setItems(array.map((it) => it.ident), false);
      } else {
        this.flightPlanWaypointInput.set('');
        this.flightPlanWaypointsInputRef.instance.setDisabled(true);
        this.flightPlanWaypointsDialogRef.instance.setItems([], false);
      }
    });

    this.handleClosePopup(this.nearestAirportDialogRef);

    // Connect preview facility to what is currently blurred in the FPL and NRST selectors
    this.previewFacility.sub((facility) => {
      if (facility) {
        const ident = ICAO.getIdent(facility?.icao);

        const currentFplnIdent = this.flightPlanWaypointInput.get();

        this.flightPlanWaypointsInputRef.instance.setDarkened(ident !== currentFplnIdent);

        const currentNearestAirportIdent = this.nearestAirportInput.get();

        this.nearestAirportInputRef.instance.setDarkened(ident !== currentNearestAirportIdent);
      }
    });
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (this.nearestAirportDialogRef.instance.isFocused) {
      const handled = this.nearestAirportDialogRef.instance.onInteractionEvent(evt);

      if (handled) {
        return true;
      }
    }

    if (this.flightPlanWaypointsDialogRef.instance.isFocused) {
      const handled = this.flightPlanWaypointsDialogRef.instance.onInteractionEvent(evt);

      if (handled) {
        return true;
      }
    }

    if (evt === InteractionEvent.CLR) {
      if (this.isInputActive()) {
        this.input.instance.focusSelf();
        this.clear();

        return true;
      } else {
        return false;
      }
    }

    if (evt === InteractionEvent.DirectTo) {
      if (this.controller.directToExistingLegDefinition !== null) {
        ViewService.activateLegDialog(this.props.fms.getPrimaryFlightPlan().getLegIndexFromLeg(this.controller.directToExistingLegDefinition));
        return true;
      } else {
        ViewService.back();
        return true;
      }
    }

    if (evt === InteractionEvent.FPL || evt === InteractionEvent.VNAV || evt === InteractionEvent.PROC || evt === InteractionEvent.OBS) {
      ViewService.back();
    }

    if (evt === InteractionEvent.MENU) {
      switch (this.props.fms.getDirectToState()) {
        case DirectToState.TOEXISTING:
        case DirectToState.TORANDOM:
          this.directToInactive.set(false);
          break;
        default:
          this.directToInactive.set(true);
      }
      ViewService.menu(this.menu);
      return true;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.input.instance.enableSlots();

    // We only want to start with a region letter input if there wasn't already a preview facility set by something else, for example,
    // a FPL page action
    if (!this.previewFacility.get()) {
      this.trySetActiveLegAsPreviewTarget().then((set) => {
        if (!set) {
          const inputPrefix = NearestContext.getInstance().getRegionIdent();

          if (inputPrefix !== undefined) {
            this.input.instance.set(inputPrefix);
            this.onIdentChanged(inputPrefix);
          }
        }
        this.prepareFlightPlanLegChoices();
        super.onResume();
      });
    } else {
      this.prepareFlightPlanLegChoices();
      super.onResume();
    }
  }

  /** @inheritDoc */
  public onSuspend(): void {
    super.onSuspend();
    this.clear();
  }

  /**
   * Checks to see if the input is active by checking if any character slots
   * are focused.
   * @returns True if active, false otherwise.
   */
  private isInputActive(): boolean {
    for (let i = 0; i < this.input.instance.length; i++) {
      if (this.input.instance.getChild(i)?.isFocused) {
        return true;
      }
    }

    return false;
  }

  public cancelDirectTo = (): void => {

    switch (this.props.fms.getDirectToState()) {
      case DirectToState.TOEXISTING: {
        const plan = this.props.fms.getPrimaryFlightPlan();
        plan.directToData.segmentIndex > -1 && this.props.fms.activateLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
      }
        break;
      case DirectToState.TORANDOM:
        if (!this.props.fms.activateNearestLeg()) {
          this.props.fms.cancelDirectTo();
        }

    }

  };

  /**
   * Clears the waypoint info display.
   */
  private clear(): void {
    this.previewFacility.set(null);
    this.directToFacility = undefined;
    this.activatePromptContainer.instance.classList.add('hidden-element');
    this.activatePrompt.instance.setDisabled(true);
    this.matchingIcaos.length = 0;
    this.input.instance.set('');
    this.controller.matchedWaypointsChangedHandler([]);
  }

  /**
   * Handles when the ident is changed in the input control.
   * @param ident The new ident.
   */
  private async onIdentChanged(ident: string): Promise<void> {
    this.previewFacility.set(null);
    this.controller.matchedWaypointsChangedHandler([]);

    if (this.debounceTimeout !== undefined) {
      window.clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(() => this.loadIdent(ident), 250);
  }

  /**
   * Loads an ident into the waypoint display.
   * @param ident The ident to search for.
   */
  private async loadIdent(ident: string): Promise<void> {
    const icaos = await this.props.fms.facLoader.searchByIdent(FacilitySearchType.All, ident, 10);

    if (icaos.length !== 0) {
      const facilityIdent = ICAO.getIdent(icaos[0]).trim();

      this.matchingIcaos = icaos.filter(icao => ICAO.getIdent(icao).trim() === facilityIdent);

      const facilities: Facility[] = await Promise.all(this.matchingIcaos.map(icao => this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao)));

      this.previewFacility.set(facilities.sort((a, b) => this.orderByPPosDistance(a, b))[0]);

      const waypoints = facilities.map((it) => new BasicFacilityWaypoint(it, this.props.bus));

      this.controller.matchedWaypointsChangedHandler(waypoints);
    }
  }

  /**
   * Updates the waypoint icon display.
   * @param waypoint The waypoint to get the icon for.
   */
  private updateIcon(waypoint: Waypoint | null): void {
    if (waypoint !== null && FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
      this.icon.instance.src = Icons.getByFacility(waypoint.facility.get()).src;
    } else {
      this.icon.instance.src = '';
    }
  }


  /**
   * Orders facilities by their distance to the plane PPOS.
   * @param a The first facility.
   * @param b The second facility.
   * @returns The comparison order number.
   */
  private orderByPPosDistance(a: Facility, b: Facility): number {
    const aDist = this.pposSub.get().distance(a.lat, a.lon);
    const bDist = this.pposSub.get().distance(b.lat, b.lon);

    if (aDist < bDist) {
      return -1;
    }

    if (aDist > bDist) {
      return 1;
    }

    return 0;
  }

  /**
   * Handles ENT being pressed on the ident input
   *
   * @returns true
   */
  private handleIdentInputEnt(): boolean {
    this.controller.inputEnterPressedHandler();
    return true;
  }

  /**
   * Handles opening a popup
   *
   * @param popup the popup to open
   *
   * @returns true
   */
  private handleOpenPopup(popup: NodeReference<OptionDialog>): boolean {
    this.root.instance.blur();
    popup.instance.openPopout(0);
    popup.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * Handles closing a popup
   *
   * @param popup the popup to close
   *
   * @returns true
   */
  private handleClosePopup(popup: NodeReference<OptionDialog>): boolean {
    popup.instance.closePopout();
    popup.instance.blur();
    this.root.instance.focus(FocusPosition.MostRecent);
    return true;
  }

  /**
   * Prepares the dialog list of flight plan legs for the FPL selection
   */
  private prepareFlightPlanLegChoices(): void {
    if (this.props.fms.hasPrimaryFlightPlan()) {
      const plan = this.props.fms.getPrimaryFlightPlan();

      this.flightPlanWaypointChoices.clear();

      const legs = Array.from(plan.legs());

      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];

        const isEligible = [LegType.CF, LegType.DF, LegType.IF, LegType.TF].includes(leg.leg.type);

        if (!isEligible) {
          continue;
        }

        this.flightPlanWaypointChoices.insert({ index: i, ident: leg?.name ?? 'noname', icao: leg.leg.fixIcao });
      }
    }
  }


  /**
   * Trys to set the active leg as the preview facility.
   * @returns Whether the active leg was set as the preview facility.
   */
  private async trySetActiveLegAsPreviewTarget(): Promise<boolean> {
    if (this.props.fms.flightPlanner.hasActiveFlightPlan()) {
      const plan = this.props.fms.flightPlanner.getActiveFlightPlan();
      const leg = plan.tryGetLeg(plan.activeLateralLeg);
      if (leg) {
        const legFacilityIcao = leg.leg.fixIcao;

        const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(legFacilityIcao), legFacilityIcao).catch((e) => {
          console.error('Could not get facility from leg fixIcao for opening DIRECT TO dialog. See error below');
          throw e;
        });

        this.acceptPreviewFacility(facility, leg);
        return true;
      }
    }
    return false;
  }

  /** @inheritDoc */
  protected renderDialog(): VNode | null {
    return (
      <div class="dto-dialog">
        <h2 class="white">
          SELECT
          <img class="dto-title-icon" src={ImageCache.get('LEGICON_DIRECTTO_WHITE').src} />
          WAYPOINT
        </h2>
        <hr class='hide-title' />

        <div class='dto-waypoint-info'>
          <h2 class="cyan hide-title">IDENT, FACILITY, & CITY</h2>
          <div class='dto-waypoint-info-identbox'>
            <AlphaNumInput
              class='dto-waypoint-info-input'
              onChanged={this.onIdentChanged.bind(this)}
              ref={this.input}
              onEnt={this.handleIdentInputEnt.bind(this)}
              gnsType={this.props.gnsType}
              enableKeyboard
            />
            <div class='dto-waypoint-info-icon'>
              <img ref={this.icon} />
            </div>
            <div class='dto-waypoint-info-region'>{this.region}</div>
            <div class='dto-waypoint-info-name'>{this.name}</div>
            <div class='dto-waypoint-info-city'>{this.city}</div>
          </div>
        </div>

        <div class="dto-separator"></div>

        <div class="dto-middle-container">
          <h2 class="cyan dto-fpln-title">FPL</h2>
          <div class="aux-table dto-fpln">
            <SelectableText
              ref={this.flightPlanWaypointsInputRef}
              data={this.flightPlanWaypointInput}
              onRightInnerDec={() => {
                this.prepareFlightPlanLegChoices();
                this.handleOpenPopup(this.flightPlanWaypointsDialogRef);
                return true;
              }}
              onRightInnerInc={() => {
                this.prepareFlightPlanLegChoices();
                this.handleOpenPopup(this.flightPlanWaypointsDialogRef);
                return true;
              }}
              class={'dto-fpln-nrst-inside'}
              darkenedClass="darkened-green"
            />
          </div>

          <h2 class="cyan dto-nrst-title">NRST</h2>
          <div class="aux-table dto-nrst">
            <SelectableText
              ref={this.nearestAirportInputRef}
              data={this.nearestAirportInput}
              onRightInnerDec={this.handleOpenPopup.bind(this, this.nearestAirportDialogRef)}
              onRightInnerInc={this.handleOpenPopup.bind(this, this.nearestAirportDialogRef)}
              class={'dto-fpln-nrst-inside'}
              darkenedClass="darkened-green"
            />
          </div>
        </div>

        <div class="dto-separator"></div>

        <div class="dto-bottom-container">
          <h2 class="cyan  hide-title">POSITION</h2>
          <h2 class="cyan crs-position">CRS</h2>
          <LatLonDisplay class="aux-table dto-waypoint-info-posbox" location={this.position} />
          <div>
            <div class="aux-table dto-course">
              <GNSNumberUnitInput
                data={this.store.courseInputValue as unknown as NumberUnitSubject<UnitFamily.Angle>}
                displayUnit={this.angleUnit}
                digitizer={(value, signValues, digitValues): void => {
                  digitValues[0].set(Math.floor(value / 10) * 10);
                  digitValues[1].set(Math.floor(value % 10));
                }}
                editOnActivate={false}
                class=''
                renderInactiveValue={(value): VNode => (
                  <div>
                    {value.toFixed(0).padStart(3, '0')}
                    <GNSVerticalUnitDisplay unit={this.angleUnit} />
                  </div>
                )}
                onInputAccepted={(v): void => {
                  this.store.course.set(v);
                }}
              >
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={36} increment={1} scale={10} wrap={true} formatter={(v) => v.toString().padStart(2, '0')} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                <GNSVerticalUnitDisplay unit={this.angleUnit} />
              </GNSNumberUnitInput>
            </div>

            <div ref={this.activatePromptContainer}>
              <SelectableText
                ref={this.activatePrompt}
                class="dto-activate-prompt"
                selectedClass="selected-white"
                data={Subject.create('Activate?')}
                onEnt={() => {
                  this.controller.activateSelected();
                  ViewService.back();
                  return true;
                }}
              />
            </div>

          </div>
        </div>
        <div class="white-box" />
      </div>
    );
  }

  /** @inheritDoc */
  protected renderOuterDialog(): VNode | null {
    return (
      <>
        <OptionDialog
          ref={this.nearestAirportDialogRef}
          class="dto-nearest-airport-dialog"
          label="NEAREST"
          onSelected={(index): void => {
            const airport = this.nearestAirports.get(index);

            this.nearestAirportInput.set(ICAO.getIdent(airport.icao));

            this.acceptPreviewFacility(airport);

            this.handleClosePopup(this.nearestAirportDialogRef);
          }}
        />

        <OptionDialog
          ref={this.flightPlanWaypointsDialogRef}
          class="dto-flight-plan-waypoints-dialog"
          label="FPL"
          onSelected={(index): void => {
            const leg = this.flightPlanWaypointChoices.get(index);

            this.flightPlanWaypointInput.set(leg.ident);

            this.props.fms.facLoader.getFacility(ICAO.getFacilityType(leg.icao), leg.icao).then((facility) => {
              this.acceptPreviewFacility(facility);
            });

            this.handleClosePopup(this.flightPlanWaypointsDialogRef);
          }}
        />
      </>
    );
  }
}