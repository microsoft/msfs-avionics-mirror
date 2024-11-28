import {
  FSComponent, VNode, NumberFormatter, DurationDisplay, DurationDisplayFormat, DurationDisplayDelim,
  VNavControlEvents, DisplayComponent, ComponentProps, SetSubject,
  Subscription, SpeedUnit, MappedSubject, UnitType,
} from '@microsoft/msfs-sdk';

import { Fms, NumberUnitDisplay, UnitsUserSettings, VNavDataProvider } from '@microsoft/msfs-garminsdk';

import {
  AltitudeConstraintDisplay, FlightPlanStore, FmsSpeedUserSettingManager, FmsSpeedTargetDataProvider,
  FmsSpeedTargetSource, FmsSpeedValue, FpaDisplay, LegNameDisplay, VnavProfileStore, G3000FilePaths
} from '@microsoft/msfs-wtg3000-common';

import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcFmsSpeedDialog } from '../../Dialog/GtcFmsSpeedDialog';
import { GtcVnavFlightPathAngleDialog } from '../../Dialog/GtcVnavFlightPathAngleDialog';
import { GtcService } from '../../GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcAdvancedVnavProfilePageTabContent } from './GtcAdvancedVnavProfilePageTabContent';
import { GtcFmsSpeedValueDisplay } from './GtcFmsSpeedValueDisplay';

import './GtcAdvancedVnavProfileTab.css';

/** The properties for the {@link GtcAdvancedVnavProfileTab} component. */
interface GtcAdvancedVnavProfileTabProps extends ComponentProps {
  /** The gtc service. */
  gtcService: GtcService;

  /** The GtcService instance */
  fms: Fms;

  /** The flight plan store to use. */
  store: FlightPlanStore;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /** A manager for FMS speed user settings. */
  fmsSpeedSettingManager: FmsSpeedUserSettingManager;

  /** A provider of FMS speed target data. */
  fmsSpeedTargetDataProvider: FmsSpeedTargetDataProvider;

  /** The vnav profile store. */
  vnavProfileStore: VnavProfileStore;
}

const VERTICAL_SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____', useMinusSign: true });
const FPA_FORMATTER = NumberFormatter.create({ precision: 0.01, nanString: '___', useMinusSign: true });
const ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____', useMinusSign: true });

/** The VnavProfilePage component. */
export class GtcAdvancedVnavProfileTab extends DisplayComponent<GtcAdvancedVnavProfileTabProps> implements GtcAdvancedVnavProfilePageTabContent {
  private static readonly FMS_SPEED_TARGET_SOURCE_TEXT: Record<FmsSpeedTargetSource, string> = {
    [FmsSpeedTargetSource.None]: '',
    [FmsSpeedTargetSource.Configuration]: 'Aircraft Configuration',
    [FmsSpeedTargetSource.Arrival]: 'Destination Terminal Area',
    [FmsSpeedTargetSource.Departure]: 'Departure Terminal Area',
    [FmsSpeedTargetSource.Altitude]: 'Altitude Speed Limit',
    [FmsSpeedTargetSource.Constraint]: 'Flight Plan Constraint',
    [FmsSpeedTargetSource.ClimbSchedule]: 'Climb Schedule',
    [FmsSpeedTargetSource.CruiseSchedule]: 'Cruise Schedule',
    [FmsSpeedTargetSource.DescentSchedule]: 'Descent Schedule'
  };

  private thisNode?: VNode;

  private readonly vnavProfileStore = this.props.vnavProfileStore;

  private readonly activeWaypointCssClass = SetSubject.create(['active-vnav-waypoint-row']);
  private readonly cruiseAltitudeCssClass = SetSubject.create(['active-vnav-waypoint-row']);

  private readonly fpaButtonCssClass = SetSubject.create(['flight-path-angle-button', 'touch-button-value']);

  private readonly targetSpeedButtonCssClass = SetSubject.create(['advanced-vnav-profile-tab-fms-speed', 'advanced-vnav-profile-tab-fms-speed-target-button']);
  private readonly targetSpeedLabelCssClass = SetSubject.create(['advanced-vnav-profile-tab-fms-speed', 'advanced-vnav-profile-tab-fms-speed-target-label']);
  private readonly userSpeedButtonCssClass = SetSubject.create(['advanced-vnav-profile-tab-fms-speed', 'advanced-vnav-profile-tab-fms-speed-user-button']);
  private readonly resumeSpeedButtonCssClass = SetSubject.create(['advanced-vnav-profile-tab-fms-speed', 'advanced-vnav-profile-tab-fms-speed-resume-button']);

  private readonly userSpeedPencilCssClass = SetSubject.create(['advanced-vnav-profile-tab-fms-speed-user-pencil']);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);

  private readonly speedSourceText = this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeedSource.map(source => {
    return GtcAdvancedVnavProfileTab.FMS_SPEED_TARGET_SOURCE_TEXT[source];
  });

  private readonly isUserSpeedEdited = MappedSubject.create(
    ([computed, user]) => computed.value !== user.value || computed.unit !== user.unit,
    this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed,
    this.props.fmsSpeedTargetDataProvider.nominalUserTargetSpeed
  );

  private showCruiseAltitudeSub?: Subscription;
  private hasTargetSpeedSub?: Subscription;
  private userSpeedActiveSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.showCruiseAltitudeSub = this.vnavProfileStore.showCruiseAltitude.sub(show => {
      this.activeWaypointCssClass.toggle('hidden', show);
      this.cruiseAltitudeCssClass.toggle('hidden', !show);
    }, false, true);

    const userSpeedActiveSub = this.userSpeedActiveSub = this.props.fmsSpeedTargetDataProvider.isUserTargetSpeedActive.sub(isActive => {
      if (isActive) {
        this.targetSpeedButtonCssClass.add('hidden');
        this.userSpeedButtonCssClass.delete('hidden');
        this.resumeSpeedButtonCssClass.delete('hidden');
      } else {
        this.userSpeedButtonCssClass.add('hidden');
        this.resumeSpeedButtonCssClass.add('hidden');
        this.targetSpeedButtonCssClass.delete('hidden');
      }
    }, false, true);

    this.hasTargetSpeedSub = this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed.sub(value => {
      if (value.value < 0) {
        userSpeedActiveSub.pause();

        this.userSpeedButtonCssClass.add('hidden');
        this.resumeSpeedButtonCssClass.add('hidden');
        this.targetSpeedButtonCssClass.add('hidden');

        this.targetSpeedLabelCssClass.delete('hidden');
      } else {
        this.targetSpeedLabelCssClass.add('hidden');

        userSpeedActiveSub.resume(true);
      }
    }, true);

    this.isUserSpeedEdited.sub(isEdited => {
      this.userSpeedPencilCssClass.toggle('hidden', !isEdited);
    }, true);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.showCruiseAltitudeSub?.resume(true);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.showCruiseAltitudeSub?.pause();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /**
   * Opens a dialog to allow the user to select an FMS speed override.
   * @param initialValue The value to initialize the dialog to.
   */
  private async openUserSpeedDialog(initialValue: FmsSpeedValue): Promise<void> {
    if (initialValue.value < 0) {
      return;
    }

    let computedTarget = this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed.get();

    if (computedTarget.value < 0) {
      return;
    }

    const result = await this.props.gtcService.openPopup<GtcFmsSpeedDialog>(GtcViewKeys.FmsSpeedDialog, 'normal', 'hide')
      .ref.request({
        title: 'FMS Speed',
        initialValue: initialValue.value,
        initialUnit: initialValue.unit,
        unitsAllowed: 'both'
      });

    computedTarget = this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed.get();

    if (computedTarget.value < 0) {
      return;
    }

    if (!result.wasCancelled) {
      if (result.payload.unit === SpeedUnit.IAS) {
        this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIas').value = result.payload.value;
        this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIsMach').value = false;
      } else {
        this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetMach').value = result.payload.value;
        this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIsMach').value = true;
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="advanced-vnav-profile-tab">
        <div class="active-vnav-waypoint-box">
          <div class="title">Active VNAV Waypoint</div>
          <div class={this.activeWaypointCssClass}>
            <div class="active-vnav-waypoint-row-left">
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
          <div class={this.cruiseAltitudeCssClass}>
            <div class="active-vnav-waypoint-row-left">CRZ ALT</div>
            <NumberUnitDisplay
              value={this.vnavProfileStore.cruiseAltitude}
              displayUnit={UnitType.FOOT}
              formatter={ALTITUDE_FORMATTER}
              class="active-vnav-waypoint-row-crz-alt-value"
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
            <div class="touch-button-label">VS Target</div>
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

              const result = await this.props.gtcService.openPopup<GtcVnavFlightPathAngleDialog>(GtcViewKeys.VnavFlightPathAngleDialog, 'normal', 'hide').ref.request({
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
            <div class="touch-button-label">FPA</div>
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
            <div class="label">VS REQ</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.verticalSpeedUnits}
              formatter={VERTICAL_SPEED_FORMATTER}
              value={this.vnavProfileStore.verticalSpeedRequired}
            />
          </div>
          <div class="box">
            <div class="label">{this.vnavProfileStore.timeToLabel}</div>
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
            <div class="label">{'V DEV'}</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.distanceUnitsSmall}
              formatter={ALTITUDE_FORMATTER}
              value={this.vnavProfileStore.verticalDeviation}
            />
          </div>
        </div>

        <GtcToggleTouchButton
          class="vnav-enabled-button"
          label={'VNAV\nEnabled'}
          state={this.vnavProfileStore.vnavEnabled}
          onPressed={() => {
            this.props.gtcService.bus.getPublisher<VNavControlEvents>().pub('vnav_set_state', !this.vnavProfileStore.vnavEnabled.get(), true);
          }}
        />

        <div class="active-speed-target-row">
          <div class="label">Active Speed Target</div>
          <div class="active-speed-target">{this.speedSourceText}</div>
        </div>

        <div class="fms-speed-row">
          <div class='advanced-vnav-profile-tab-fms-speed-cell'>
            <GtcTouchButton
              onPressed={() => {
                this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIas').value = -1;
                this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetMach').value = -1;
                this.props.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIsMach').value = false;
              }}
              class={this.resumeSpeedButtonCssClass}
            >
              <div class='advanced-vnav-profile-tab-fms-speed-label'>Resume</div>
              <GtcFmsSpeedValueDisplay
                value={this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed}
                class='advanced-vnav-profile-tab-fms-speed-value'
              />
            </GtcTouchButton>
          </div>

          <div class='advanced-vnav-profile-tab-fms-speed-cell'>
            <GtcTouchButton
              onPressed={() => {
                this.openUserSpeedDialog(this.props.fmsSpeedTargetDataProvider.nominalUserTargetSpeed.get());
              }}
              class={this.userSpeedButtonCssClass}
            >
              <div class='advanced-vnav-profile-tab-fms-speed-label'>FMS Speed</div>
              <div class='advanced-vnav-profile-tab-fms-speed-user-button-value-row'>
                <GtcFmsSpeedValueDisplay
                  value={this.props.fmsSpeedTargetDataProvider.nominalUserTargetSpeed}
                  class='advanced-vnav-profile-tab-fms-speed-value advanced-vnav-profile-tab-fms-speed-user-button-value'
                />
                <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_pencil.png`} class={this.userSpeedPencilCssClass} />
              </div>
            </GtcTouchButton>
            <GtcTouchButton
              onPressed={() => {
                this.openUserSpeedDialog(this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed.get());
              }}
              class={this.targetSpeedButtonCssClass}
            >
              <div class='advanced-vnav-profile-tab-fms-speed-label'>FMS Speed</div>
              <GtcFmsSpeedValueDisplay
                value={this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed}
                class='advanced-vnav-profile-tab-fms-speed-value'
              />
            </GtcTouchButton>
            <div class={this.targetSpeedLabelCssClass}>
              <div class="advanced-vnav-profile-tab-fms-speed-label">FMS Speed</div>
              <GtcFmsSpeedValueDisplay
                value={this.props.fmsSpeedTargetDataProvider.nominalComputedTargetSpeed}
                class='advanced-vnav-profile-tab-fms-speed-value'
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.speedSourceText.destroy();
    this.isUserSpeedEdited.destroy();

    this.showCruiseAltitudeSub?.destroy();
    this.userSpeedActiveSub?.destroy();
    this.hasTargetSpeedSub?.destroy();

    super.destroy();
  }
}
