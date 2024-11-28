import {
  FSComponent, VNode, NumberFormatter, DurationDisplay, StringUtils, DurationDisplayFormat, DurationDisplayDelim,
  VNavControlEvents, ICAO, SetSubject,
} from '@microsoft/msfs-sdk';
import { Fms, NumberUnitDisplay, UnitsUserSettings, VNavDataProvider } from '@microsoft/msfs-garminsdk';
import {
  FlightPlanLegData, AltitudeConstraintDisplay, SimpleAltitudeConstraintDisplay,
  FlightPlanStore, LegNameDisplay, VnavProfileStore, FpaDisplay
} from '@microsoft/msfs-wtg3000-common';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcVnavFlightPathAngleDialog } from '../../Dialog/GtcVnavFlightPathAngleDialog';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcListDialog, ListDialogItemDefinition } from '../../Dialog/GtcListDialog';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import './GtcVnavProfilePage.css';

/** The properties for the {@link GtcVnavProfilePage} component. */
interface GtcVnavProfilePageProps extends GtcViewProps {
  /** The GtcService instance */
  fms: Fms;

  /** The flight plan store to use. */
  store: FlightPlanStore;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;
}

const VERTICAL_SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____', useMinusSign: true });
const FPA_FORMATTER = NumberFormatter.create({ precision: 0.01, nanString: '___', useMinusSign: true });
const ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____', useMinusSign: true });

/** The VnavProfilePage component. */
export class GtcVnavProfilePage extends GtcView<GtcVnavProfilePageProps> {
  private thisNode?: VNode;

  private readonly vnavProfileStore = new VnavProfileStore(this.bus, this.props.store, this.gtcService.isAdvancedVnav, this.props.vnavDataProvider);

  private readonly fpaButtonCssClass = SetSubject.create(['flight-path-angle-button', 'touch-button-value']);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('VNAV Profile');
  }

  /** @inheritdoc */
  public onResume(): void {
    this.vnavProfileStore.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.vnavProfileStore.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="vnav-profile-page gtc-panel">
        <GtcToggleTouchButton
          class="vnav-enabled-button"
          label={'VNAV\nEnabled'}
          state={this.vnavProfileStore.vnavEnabled}
          onPressed={() => {
            this.bus.getPublisher<VNavControlEvents>().pub('vnav_set_state', !this.vnavProfileStore.vnavEnabled.get(), true);
          }}
        />
        <div class="active-vnav-waypoint-box">
          <div class="title">Active VNAV Waypoint</div>
          <div class="row">
            <div class="waypoint-ident">
              <LegNameDisplay
                leg={this.vnavProfileStore.activeVnavWaypoint}
                gtcOrientation={this.props.gtcService.orientation}
              />
            </div>
            <AltitudeConstraintDisplay
              altDesc={this.vnavProfileStore.altDesc}
              altitude1={this.vnavProfileStore.altitude1}
              altitude2={this.vnavProfileStore.altitude2}
              displayAltitude1AsFlightLevel={this.vnavProfileStore.displayAltitude1AsFlightLevel}
              displayAltitude2AsFlightLevel={this.vnavProfileStore.displayAltitude2AsFlightLevel}
              isEdited={this.vnavProfileStore.isAltitudeEdited}
            />
          </div>
        </div>
        <div class="row second-row">
          <GtcTouchButton
            class="vertical-speed-target-button touch-button-value"
            isEnabled={false}
            // isEnabled={this.vnavProfileStore.isPathEditButtonEnabled}
            // TODO
            onPressed={() => { }}
          >
            <div class="touch-button-label">{'Vertical Speed\nTarget'}</div>
            <NumberUnitDisplay
              class="touch-button-value-value"
              displayUnit={this.unitsSettingManager.verticalSpeedUnits}
              formatter={VERTICAL_SPEED_FORMATTER}
              value={this.vnavProfileStore.verticalSpeedTarget}
            />
          </GtcTouchButton>
          <GtcTouchButton
            class={this.fpaButtonCssClass}
            isEnabled={this.vnavProfileStore.isPathEditButtonEnabled}
            onPressed={async () => {
              const initialFpa = this.props.vnavDataProvider.fpa.get();

              if (initialFpa === null) {
                return;
              }

              const result = await this.gtcService.openPopup<GtcVnavFlightPathAngleDialog>(GtcViewKeys.VnavFlightPathAngleDialog, 'normal', 'hide').ref.request({
                initialValue: initialFpa * 100,
              });

              if (result.wasCancelled) { return; }

              const plan = this.props.fms.getPrimaryFlightPlan();
              const leg = this.props.vnavDataProvider.activeConstraintLeg.get();

              if (leg === null) {
                return;
              }

              const globalLegIndex = plan.getLegIndexFromLeg(leg);

              if (globalLegIndex < 0) {
                return;
              }

              const segmentIndex = plan.getSegmentIndex(globalLegIndex);
              const segmentLegIndex = plan.getSegmentLegIndex(globalLegIndex);

              this.props.fms.setUserFpa(Fms.PRIMARY_PLAN_INDEX, segmentIndex, segmentLegIndex, result.payload / 100);
            }}
          >
            <div class="touch-button-label">{'Flight Path\nAngle'}</div>
            <div class="touch-button-value-value">
              <FpaDisplay
                fpa={this.vnavProfileStore.fpa}
                showClimb={this.vnavProfileStore.fpaShowClimb}
                formatter={FPA_FORMATTER}
              />
            </div>
          </GtcTouchButton>
        </div>
        <div class="main-data-row">
          <div class="box">
            <div class="label">{'Vertical Speed\nRequired'}</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.verticalSpeedUnits}
              formatter={VERTICAL_SPEED_FORMATTER}
              value={this.vnavProfileStore.verticalSpeedRequired}
            />
          </div>
          <div class="box">
            <div class="label">{this.vnavProfileStore.timeToLabelExtended}</div>
            <DurationDisplay
              class="data"
              value={this.vnavProfileStore.timeToValue}
              options={{
                pad: 2,
                format: DurationDisplayFormat.hh_mm_or_mm_ss,
                delim: DurationDisplayDelim.ColonOrCross,
                nanString: '__:__',
              }}
            />
          </div>
          <div class="box">
            <div class="label">{'Vertical\nDeviation'}</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.distanceUnitsSmall}
              formatter={ALTITUDE_FORMATTER}
              value={this.vnavProfileStore.verticalDeviation}
            />
          </div>
        </div>
        <GtcTouchButton
          class="vnav-direct-to-button"
          label={`VNAV\n${StringUtils.DIRECT_TO}`}
          isEnabled={this.vnavProfileStore.isVnavDirectToButtonEnabled}
          onPressed={async () => {
            const legs = this.vnavProfileStore.getVnavDirectToLegs();

            if (legs.length === 0) { return; }

            const result = await this.gtcService.openPopup<GtcListDialog>(GtcViewKeys.ListDialog1, 'normal', 'hide').ref.request({
              selectedValue: legs[0],
              title: 'Select VNAV Direct To',
              inputData: legs.map((legData): ListDialogItemDefinition<FlightPlanLegData> => ({
                value: legData,
                labelRenderer: () => (
                  <div>
                    <SimpleAltitudeConstraintDisplay
                      altitude1={legData.altitude1}
                      displayAltitude1AsFlightLevel={legData.displayAltitude1AsFlightLevel}
                    />
                    <span> at </span>
                    <span>{ICAO.getIdent(legData.leg.leg.fixIcao)}</span>
                  </div>
                )
              })),
            });

            if (result.wasCancelled) { return; }

            const legData = result.payload;

            const message = (
              <div>
                <div>Activate vertical {StringUtils.DIRECT_TO}</div>
                <div>
                  <SimpleAltitudeConstraintDisplay
                    altitude1={legData.altitude1}
                    displayAltitude1AsFlightLevel={legData.displayAltitude1AsFlightLevel}
                  />
                  <span> at {ICAO.getIdent(legData.leg.leg.fixIcao)} ?</span>
                </div>
              </div>
            );

            const accepted = await GtcDialogs.openMessageDialog(this.gtcService, message);

            if (!accepted) { return; }

            const plan = this.props.fms.getPrimaryFlightPlan();
            const globalIndex = plan.getLegIndexFromLeg(legData.leg);

            if (globalIndex < 0) { return; }

            const targetAltitude = legData.altitude1.get().number;
            const isFlightLevel = legData.displayAltitude1AsFlightLevel.get();

            const fpa = await this.props.fms.getVerticalDirectRequiredFpa(globalIndex, targetAltitude);

            // If the required FPA is > 6 degrees, then show a dialog prompting the user to accept clamping the FPA
            // to 6 degrees.
            if (fpa !== undefined && fpa > 6) {
              const accept = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Vertical Ð FPA steeper than \n−6.00° limit.\nSet to −6.00°?', true);

              if (!accept) {
                return;
              }
            }

            // If the leg indexes have changed, abort.
            if (plan.tryGetLeg(globalIndex) !== legData.leg) {
              return;
            }

            this.props.fms.activateVerticalDirect(globalIndex, targetAltitude, isFlightLevel, fpa);

            this.vnavProfileStore.update();
          }}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.vnavProfileStore.destroy();

    super.destroy();
  }
}