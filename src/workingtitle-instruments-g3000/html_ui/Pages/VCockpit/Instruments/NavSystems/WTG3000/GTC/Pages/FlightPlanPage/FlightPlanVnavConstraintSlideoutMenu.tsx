/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  VNode, FSComponent, Subject, VerticalFlightPhase,
  NumberUnitSubject, UnitType, NumberFormatter, AltitudeRestrictionType, SetSubject,
  MappedSubject, UnitFamily, SimpleUnit, NumberUnitInterface, ICAO, FacilityType, StringUtils,
} from '@microsoft/msfs-sdk';
import { Fms, FmsUtils, NumberUnitDisplay } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanLegData, AltitudeConstraintDisplay } from '@microsoft/msfs-wtg3000-common';
import { GtcViewProps, GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcListDialogParams } from '../../Dialog/GtcListDialog';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcMessageDialog } from '../../Dialog/GtcMessageDialog';
import { GtcVnavAltitudeDialog, GtcVnavAltitudeDialogResultSet } from '../../Dialog/GtcVnavAltitudeDialog';
import './FlightPlanVnavConstraintSlideoutMenu.css';

/** The properties for the {@link FlightPlanVnavConstraintSlideoutMenu} component. */
export interface FlightPlanVnavConstraintSlideoutMenuProps extends GtcViewProps {
  /** An instance of the Fms. */
  fms: Fms;
  /** Which flight plan index to work with. */
  planIndex: number;
  /** The flight plan store. */
  store: FlightPlanStore;
}

const DISTANCE_FORMATTER = NumberFormatter.create({ precision: 1 });
const DISTANCE_FORMATTER_SIGN = NumberFormatter.create({ precision: 1, useMinusSign: true, forceSign: true });

/** Slideount menu showing options for creating/changing an advanced vnav altitude constraint. */
export class FlightPlanVnavConstraintSlideoutMenu extends GtcView<FlightPlanVnavConstraintSlideoutMenuProps> {
  private thisNode?: VNode;

  private readonly classList = SetSubject.create(['gtc-popup-panel', 'gtc-panel', 'gtc-slideout', 'vnav-constraint-slideout-menu']);

  private readonly legListData = Subject.create<FlightPlanLegData | undefined>(undefined);

  private readonly isPhaseEditable = Subject.create(false);
  private readonly phase = Subject.create(VerticalFlightPhase.Descent);
  private readonly alongTrack = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));
  private readonly altDesc = Subject.create(AltitudeRestrictionType.At);

  private readonly altitude1Meters = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly isAltitude1FlightLevel = Subject.create(false);

  private readonly altitude2Meters = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly isAltitude2FlightLevel = Subject.create(false);

  private readonly altitude1Desc = MappedSubject.create(([altitude1Meters, altDesc]) => {
    return altitude1Meters.isNaN()
      ? AltitudeRestrictionType.Unused
      : altDesc === AltitudeRestrictionType.Between
        ? AltitudeRestrictionType.AtOrBelow
        : altDesc;
  }, this.altitude1Meters, this.altDesc);

  private readonly altitude2Desc = MappedSubject.create(([altitude2Meters, altDesc]) => {
    return altitude2Meters.isNaN()
      ? AltitudeRestrictionType.Unused
      : altDesc === AltitudeRestrictionType.Between
        ? AltitudeRestrictionType.AtOrAbove
        : altDesc;
  }, this.altitude2Meters, this.altDesc);

  private readonly allowVnavDto = MappedSubject.create(
    ([altDesc, phase, altitude1Meters, isDtoRandomActive]) => {
      return !isDtoRandomActive
        && altDesc !== AltitudeRestrictionType.Between
        && phase === VerticalFlightPhase.Descent
        && !altitude1Meters.isNaN();
    },
    this.altDesc,
    this.phase,
    this.altitude1Meters,
    this.props.store.isDirectToRandomActive
  );

  private readonly isDifferentFromPublished = Subject.create(false);
  private readonly isDesignatedConstraint = Subject.create(false);

  private readonly showRevertButton = Subject.create(false);

  private publishedAltDesc!: AltitudeRestrictionType;
  private publishedAltitude1Feet!: number;
  private publishedAltitude2Feet!: number;
  private publishedAltitude1Meters!: number;
  private publishedAltitude2Meters!: number;
  private fixElevationMeters?: number;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Active Flight Plan');

    // TODO Shows cancel if constraint doesn't exist, or if selected options are different from existing constraint
    // this._sidebarState.slot1.set('cancel');
    // TODO Shows "Create" button when constraint does not exist
    // TODO Shows "Save" button when editing existing constraint, only enabled if selected options are different from existing constraint
    this._sidebarState.slot5.set('enterEnabled');

    this.altDesc.sub(type => {
      this.classList.toggle('At', type === AltitudeRestrictionType.At);
      this.classList.toggle('AtOrAbove', type === AltitudeRestrictionType.AtOrAbove);
      this.classList.toggle('AtOrBelow', type === AltitudeRestrictionType.AtOrBelow);
      this.classList.toggle('Between', type === AltitudeRestrictionType.Between);
    }, true);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    if (event === GtcInteractionEvent.ButtonBarEnterPressed) {
      this.setConstraintAndClose();
      return true;
    }
    return false;
  }

  /** Sets the constraint on the leg and closes the menu. */
  private setConstraintAndClose(): void {
    const legListData = this.legListData.get();
    if (!legListData) { return; }

    const indexes = FmsUtils.getLegIndexes(this.props.fms.getFlightPlan(this.props.planIndex), legListData.leg);
    if (!indexes) { return; }

    const altDesc = this.altDesc.get();
    const altitude1Meters = this.altitude1Meters.get().asUnit(UnitType.METER);
    const altitude2Meters = altDesc === AltitudeRestrictionType.Between ? this.altitude2Meters.get().asUnit(UnitType.METER) : undefined;
    const flightLevel1 = this.isAltitude1FlightLevel.get();
    const flightLevel2 = altDesc === AltitudeRestrictionType.Between ? this.isAltitude2FlightLevel.get() : undefined;

    this.props.fms.setUserConstraintAdvanced(
      indexes.segmentIndex, indexes.segmentLegIndex,
      this.phase.get(), altDesc,
      altitude1Meters, flightLevel1,
      altitude2Meters, flightLevel2
    );

    this.gtcService.goBack();
  }

  /**
   * Pass initial leg list data to use.
   * @param legListData The leg list data.
   */
  public request(legListData: FlightPlanLegData): void {
    this.legListData.set(legListData);

    this.publishedAltDesc = legListData.leg.leg.altDesc;
    this.publishedAltitude1Feet = UnitType.METER.convertTo(legListData.leg.leg.altitude1, UnitType.FOOT);
    this.publishedAltitude2Feet = UnitType.METER.convertTo(legListData.leg.leg.altitude2, UnitType.FOOT);
    this.publishedAltitude1Meters = legListData.leg.leg.altitude1;
    this.publishedAltitude2Meters = legListData.leg.leg.altitude2;

    this.isDifferentFromPublished.set(legListData.isAltitudeEdited.get());
    this.isDesignatedConstraint.set(legListData.isAltitudeDesignated.get());

    if (legListData.altDesc.get() === AltitudeRestrictionType.Unused) {
      this.altDesc.set(AltitudeRestrictionType.At);
    } else {
      this.altDesc.set(legListData.altDesc.get());
    }

    const hasPublishedAltitude = this.publishedAltDesc !== AltitudeRestrictionType.Unused;
    const legListDataNotShowingPublished = legListData.altDesc.get() === AltitudeRestrictionType.Unused;
    const showRevertButton = !this.isDesignatedConstraint.get() && hasPublishedAltitude && legListDataNotShowingPublished;

    this.showRevertButton.set(showRevertButton);

    const altitude1Meters = legListData.altitude1.get().asUnit(UnitType.METER);
    const altitude2Meters = legListData.altitude2.get().asUnit(UnitType.METER);

    this.altitude1Meters.set(altitude1Meters, UnitType.METER);
    this.altitude2Meters.set(altitude2Meters, UnitType.METER);

    this.isAltitude1FlightLevel.set(legListData.displayAltitude1AsFlightLevel.get());
    this.isAltitude2FlightLevel.set(legListData.displayAltitude2AsFlightLevel.get());

    this.isPhaseEditable.set(!legListData.isInMissedApproach);
    this.phase.set(legListData.vnavPhase.get());

    this.startSelectionChain();
  }

  /** Starts the selection chain, opening the first dialog if needed. */
  private async startSelectionChain(): Promise<void> {
    const fixIcao = this.legListData.get()!.leg.leg.fixIcao;
    const facType = ICAO.getFacilityType(fixIcao);

    if (facType === FacilityType.Airport) {
      const fac = await this.props.fms.facLoader.getFacility(FacilityType.Airport, fixIcao);
      this.fixElevationMeters = fac.runways[0]?.elevation;
    } else if (facType === FacilityType.RWY) {
      const fac = await this.props.fms.facLoader.getFacility(FacilityType.RWY, fixIcao);
      this.fixElevationMeters = fac.runway.elevation;
    } else {
      this.fixElevationMeters = undefined;
    }

    if (this.altitude1Meters.get().isNaN()) {
      this.openAltitude1Dialog();
    }
  }

  /**
   * Called when alt desc has been selected from the list dialog.
   * @param valueChanged Whether the value changed.
   * @param oldAltDesc The previous alt desc.
   */
  private onAltDescSelected(valueChanged: boolean, oldAltDesc: AltitudeRestrictionType): void {
    if (valueChanged) {
      if (this.altDesc.get() === AltitudeRestrictionType.Between) {
        this.altitude2Meters.set(this.altitude1Meters.get());
        this.isAltitude2FlightLevel.set(this.isAltitude1FlightLevel.get());
        this.openAltitude1Dialog();
      } else if (oldAltDesc === AltitudeRestrictionType.Between) {
        this.openAltitude1Dialog();
      } else if (this.altitude1Meters.get().isNaN()) {
        this.openAltitude1Dialog();
      }
    } else if (this.altitude1Meters.get().isNaN()) {
      this.openAltitude1Dialog();
    }
  }

  /** Called when alt 1 has been selected from the altitude dialog. */
  private onAlt1Selected(): void {
    if (this.altDesc.get() === AltitudeRestrictionType.Between) {
      // After selecting the first altitude, if it is less than alt 2, reset alt 2 to NaN
      if (this.altitude1Meters.get() < this.altitude2Meters.get()) {
        this.altitude2Meters.set(NaN);
        this.openAltitude2Dialog(this.altitude1Meters.get());
      } else {
        this.openAltitude2Dialog();
      }
    }
  }

  /**
   * Removes or reverts the altitude constraint and closes the menu if successful.
   * @param operation Whether to remove or revert.
   */
  private removeOrRevertConstraintAndClose(operation: 'remove' | 'revert'): void {
    const leg = this.legListData.get()?.leg;
    if (!leg) {
      console.error('[removeConstraintAndClose] expected leg, but did not have one.');
      return;
    }

    const indexes = FmsUtils.getLegIndexes(this.props.fms.getFlightPlan(this.props.planIndex), leg);
    if (!indexes) {
      console.error('[removeConstraintAndClose] expected indexes, but did not have them.');
      return;
    }

    if (operation === 'remove') {
      this.props.fms.setUserConstraint(indexes.segmentIndex, indexes.segmentLegIndex);
    } else {
      this.props.fms.revertAltitudeConstraint(indexes.segmentIndex, indexes.segmentLegIndex);
    }

    this.gtcService.goBack();
  }

  /** Opens the altitude dialog for altitude 1. */
  private readonly openAltitude1Dialog = async (): Promise<void> => {
    const altitude1Meters = this.altitude1Meters.get();
    const initialValueFeet = altitude1Meters.isNaN() ? 0 : altitude1Meters.asUnit(UnitType.FOOT);
    const title = this.altDesc.get() === AltitudeRestrictionType.Between ? 'Enter Ceiling Altitude' : undefined;

    const result = await this.openAltitudeDialog(initialValueFeet, this.isAltitude1FlightLevel.get(), undefined, undefined, title);

    if (!result) { return; }

    this.altitude1Meters.set(UnitType.FOOT.convertTo(result.altitudeFeet, UnitType.METER));
    this.isAltitude1FlightLevel.set(result.isFlightLevel);

    this.onAlt1Selected();
  };

  /**
   * Opens the altitude dialog for altitude 2.
   * @param initialValueMeters The initial value to use, if undefined, will use altitude 2.
   */
  private readonly openAltitude2Dialog = async (initialValueMeters?: NumberUnitInterface<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>): Promise<void> => {
    const altitude2Meters = initialValueMeters ?? this.altitude2Meters.get();
    const initialValueFeet = altitude2Meters.isNaN() ? 0 : altitude2Meters.asUnit(UnitType.FOOT);
    const title = this.altDesc.get() === AltitudeRestrictionType.Between ? 'Enter Floor Altitude' : undefined;

    const result = await this.openAltitudeDialog(
      initialValueFeet, this.isAltitude2FlightLevel.get(), this.altitude1Meters.get().asUnit(UnitType.FOOT), this.isAltitude1FlightLevel.get(), title);

    if (!result) { return; }

    this.altitude2Meters.set(UnitType.FOOT.convertTo(result.altitudeFeet, UnitType.METER));
    this.isAltitude2FlightLevel.set(result.isFlightLevel);
  };

  /**
   * Opens the altitude dialog.
   * @param initialValueFeet The initial altitude to show, in feet.
   * @param isFlightLevel Whether to display as flight level.
   * @param maxAltitudeFeet Max altitude in feet. If undefined, no max will be used.
   * @param isMaxAltitudeFlightLevel Whether max altitude is a flight level.
   * @param title The title bar title to use.
   * @returns A promise that resolves to the result of the dialog.
   */
  private async openAltitudeDialog(initialValueFeet: number, isFlightLevel: boolean, maxAltitudeFeet?: number, isMaxAltitudeFlightLevel = false, title = 'Enter Altitude'): Promise<GtcVnavAltitudeDialogResultSet | undefined> {
    const result = await this.gtcService.openPopup<GtcVnavAltitudeDialog>(GtcViewKeys.VnavAltitudeDialog).ref.request({
      initialAltitudeFeet: initialValueFeet,
      isFlightLevel,
      isAdvancedMode: true,
      isDesignatedConstraint: false,
      isDifferentFromPublished: false,
      legName: '',
      title,
      maxAltitudeFeet,
      isMaxAltitudeFlightLevel,
      fixElevationMeters: this.fixElevationMeters,
    });

    if (result.wasCancelled || result.payload.result !== 'set') { return; }

    return result.payload;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <div class="gtc-panel-title">VNAV Constraint</div>
        <div class="main">
          <div class="row">
            <GtcListSelectTouchButton
              gtcService={this.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              isEnabled={this.isPhaseEditable}
              state={this.phase}
              label="Phase"
              renderValue={value => {
                switch (value) {
                  case VerticalFlightPhase.Climb: return 'Climb';
                  case VerticalFlightPhase.Descent: return 'Descent';
                }
              }}
              listParams={(): GtcListDialogParams<VerticalFlightPhase> => {
                return {
                  title: 'Select Phase',
                  inputData: [
                    {
                      value: VerticalFlightPhase.Climb,
                      labelRenderer: () => 'Climb',
                    },
                    {
                      value: VerticalFlightPhase.Descent,
                      labelRenderer: () => 'Descent',
                    }
                  ],
                  selectedValue: this.phase
                };
              }}
            />
            <GtcValueTouchButton
              state={this.alongTrack}
              label="Along Track"
              // TODO?
              isEnabled={false}
              renderValue={value => {
                return (
                  <NumberUnitDisplay
                    value={value}
                    displayUnit={null}
                    formatter={value.number === 0 ? DISTANCE_FORMATTER : DISTANCE_FORMATTER_SIGN}
                  />
                );
              }}
            />
          </div>
          <div class="row">
            <GtcListSelectTouchButton
              gtcService={this.gtcService}
              listDialogKey={GtcViewKeys.ListDialog1}
              state={this.altDesc}
              label="Type"
              renderValue={value => {
                switch (value) {
                  case AltitudeRestrictionType.At: return 'At';
                  case AltitudeRestrictionType.AtOrAbove: return 'Above';
                  case AltitudeRestrictionType.AtOrBelow: return 'Below';
                  case AltitudeRestrictionType.Between: return 'Between';
                  case AltitudeRestrictionType.Unused: return 'Unused';
                }
              }}
              listParams={(state): GtcListDialogParams<AltitudeRestrictionType> => {
                return {
                  title: 'Select Phase',
                  inputData: [{
                    value: AltitudeRestrictionType.At,
                    labelRenderer: () => 'At',
                  }, {
                    value: AltitudeRestrictionType.AtOrAbove,
                    labelRenderer: () => 'At or Above',
                  }, {
                    value: AltitudeRestrictionType.AtOrBelow,
                    labelRenderer: () => 'At or Below',
                  }, {
                    value: AltitudeRestrictionType.Between,
                    labelRenderer: () => 'Between',
                  }],
                  selectedValue: state.get(),
                };
              }}
              onSelected={(newAltDesc, state) => {
                const oldAltDesc = state.get();
                const changed = newAltDesc !== oldAltDesc;
                state.set(newAltDesc);
                this.onAltDescSelected(changed, oldAltDesc);
              }}
            />
            <div class="altitude-column">
              <GtcTouchButton
                label={(
                  <AltitudeConstraintDisplay
                    isCyan={true}
                    altDesc={this.altitude1Desc}
                    altitude1={this.altitude1Meters}
                    displayAltitude1AsFlightLevel={this.isAltitude1FlightLevel}
                  />
                )}
                onPressed={() => this.openAltitude1Dialog()}
              />
              <GtcTouchButton
                class="bottom-altitude-button"
                label={(
                  <AltitudeConstraintDisplay
                    isCyan={true}
                    altDesc={this.altitude2Desc}
                    altitude1={this.altitude2Meters}
                    displayAltitude1AsFlightLevel={this.isAltitude2FlightLevel}
                  />
                )}
                onPressed={() => this.openAltitude2Dialog()}
              />
            </div>
          </div>
          <div class="row bottom-row">
            <GtcTouchButton
              label={`VNAV\n${StringUtils.DIRECT_TO}`}
              isEnabled={this.allowVnavDto}
              onPressed={async () => {
                const lateralPlan = this.props.fms.getFlightPlan(this.props.planIndex);

                const legListData = this.legListData.get();
                if (!legListData) { return; }

                const indexes = FmsUtils.getLegIndexes(lateralPlan, legListData.leg);
                if (!indexes) { return; }

                const targetAltitude = this.altitude1Meters.get().number;
                const isFlightLevel = this.isAltitude1FlightLevel.get();

                const fpa = await this.props.fms.getVerticalDirectRequiredFpa(indexes.globalLegIndex, targetAltitude);

                // If the popup is no longer the active view, abort.
                if (this.gtcService.activeView.get().ref !== this) {
                  return;
                }

                // If the required FPA is > 6 degrees, then show a dialog prompting the user to accept clamping the FPA
                // to 6 degrees.
                if (fpa !== undefined && fpa > 6) {
                  const accept = await GtcDialogs.openMessageDialog(this.gtcService, 'Vertical Ð FPA steeper than \n−6.00° limit.\nSet to −6.00°?', true);

                  // If the user rejected the dialog or the popup is no longer the active view, abort.
                  if (!accept || this.gtcService.activeView.get().ref !== this) {
                    return;
                  }
                }

                // If the leg indexes have changed, abort.
                if (lateralPlan.tryGetLeg(indexes.globalLegIndex) !== legListData.leg) {
                  return;
                }

                this.props.fms.activateVerticalDirect(indexes.globalLegIndex, this.altitude1Meters.get().number, isFlightLevel, fpa);
                this.gtcService.goBack();
              }}
            />
            <GtcTouchButton
              label={'Remove\nConstraint'}
              isVisible={this.showRevertButton.map(x => !x)}
              isEnabled={this.isDesignatedConstraint}
              onPressed={async () => {
                if (this.publishedAltDesc !== AltitudeRestrictionType.Unused && this.isDifferentFromPublished.get()) {
                  let normal: VNode;
                  if (FmsUtils.displayAltitudeAsFlightLevel(this.publishedAltitude1Meters ?? 0)) {
                    normal = <span>VNAV altitude of FL{Math.round(this.publishedAltitude1Feet / 100).toFixed(0)}?</span>;
                  } else {
                    normal = <span>VNAV altitude of {this.publishedAltitude1Feet.toFixed(0)}<span class="numberunit-unit-small">FT</span>?</span>;
                  }

                  const between1 = FmsUtils.displayAltitudeAsFlightLevel(this.publishedAltitude1Meters ?? 0)
                    ? <span>FL{Math.round(this.publishedAltitude1Feet / 100).toFixed(0)}</span>
                    : <span>{this.publishedAltitude1Feet.toFixed(0)}<span class="numberunit-unit-small">FT</span></span>;

                  const between2 = FmsUtils.displayAltitudeAsFlightLevel(this.publishedAltitude2Meters ?? 0)
                    ? <span>FL{Math.round(this.publishedAltitude2Feet / 100).toFixed(0)}?</span>
                    : <span>{this.publishedAltitude2Feet.toFixed(0)}<span class="numberunit-unit-small">FT</span>?</span>;

                  const between = (
                    <>
                      <span>VNAV altitude between</span>
                      <span>{between1} and {between2}</span>
                    </>
                  );
                  const message = (
                    <>
                      <span>Remove or Revert to published</span>
                      {this.publishedAltDesc === AltitudeRestrictionType.Between ? between : normal}
                    </>
                  );
                  const result =
                    await this.gtcService.openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
                      .ref.request({
                        message,
                        showRejectButton: true,
                        acceptButtonLabel: 'Remove',
                        rejectButtonLabel: 'Revert',
                      });
                  if (!result.wasCancelled) {
                    if (result.payload === true) {
                      this.removeOrRevertConstraintAndClose('remove');
                    } else {
                      this.removeOrRevertConstraintAndClose('revert');
                    }
                  }
                } else {
                  const accepted = await GtcDialogs.openMessageDialog(this.gtcService, 'Remove Altitude Constraint?');
                  if (accepted) {
                    this.removeOrRevertConstraintAndClose('remove');
                  }
                }
              }}
            />
            <GtcTouchButton
              label={'Revert\nConstraint'}
              isVisible={this.showRevertButton}
              onPressed={async () => {
                const accepted = await GtcDialogs.openMessageDialog(this.gtcService, 'Revert Altitude Constraint?');
                if (accepted) {
                  this.removeOrRevertConstraintAndClose('revert');
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.allowVnavDto.destroy();

    super.destroy();
  }
}
