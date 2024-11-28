import { FSComponent, VNode, DisplayComponent, ComponentProps } from '@microsoft/msfs-sdk';
import { Fms, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { FmsSpeedUserSettingManager, FlightPlanStore } from '@microsoft/msfs-wtg3000-common';
import { GtcDialogChainStep, GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcDialogResult, GtcDialogResultSubmitted } from '../../Dialog/GtcDialogView';
import { GtcFmsSpeedDialog, GtcFmsSpeedDialogOutput } from '../../Dialog/GtcFmsSpeedDialog';
import { GtcListDialog } from '../../Dialog/GtcListDialog';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcAdvancedVnavAltitudeLimitButton } from './GtcAdvancedVnavAltitudeLimitButton';
import { GtcAdvancedVnavProfilePageTabContent } from './GtcAdvancedVnavProfilePageTabContent';
import { GtcAdvancedVnavScheduleButton } from './GtcAdvancedVnavScheduleButton';
import { GtcAdvancedVnavTerminalLimitButton } from './GtcAdvancedVnavTerminalLimitButton';
import { GtcAdvancedVnavTransitionButton } from './GtcAdvancedVnavTransitionButton';
import { GtcFmsSpeedScheduleDisplay } from './GtcFmsSpeedScheduleDisplay';

import './GtcAdvancedVnavScheduleDialog.css';
import './GtcAdvancedVnavClimbTab.css';

/** The properties for the {@link GtcAdvancedVnavClimbTab} component. */
interface GtcAdvancedVnavClimbTabProps extends ComponentProps {
  /** The gtc service. */
  gtcService: GtcService;

  /** The GtcService instance */
  fms: Fms;

  /** The flight plan store to use. */
  store: FlightPlanStore;

  /** A manager for FMS speed user settings. */
  fmsSpeedSettingManager: FmsSpeedUserSettingManager;
}

/**
 * The Climb tab of the advanced VNAV profile page.
 */
export class GtcAdvancedVnavClimbTab extends DisplayComponent<GtcAdvancedVnavClimbTabProps> implements GtcAdvancedVnavProfilePageTabContent {
  private thisNode?: VNode;

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);

  private readonly dialogListItemHeightPx = this.props.gtcService.isHorizontal ? 129 : 69;
  private readonly dialogListItemSpacingPx = this.props.gtcService.isHorizontal ? 2 : 1;

  // The schedule at index 0 is an auto-generated default schedule.
  private readonly selectScheduleInputData = this.props.fmsSpeedSettingManager.climbSchedules.slice(1).map((schedule, index) => {
    return {
      value: index + 1,
      labelRenderer: () => <GtcFmsSpeedScheduleDisplay schedule={schedule} />
    };
  });

  private readonly dialogChainSteps: [GtcDialogChainStep<GtcListDialog>, GtcDialogChainStep<GtcFmsSpeedDialog>, GtcDialogChainStep<GtcFmsSpeedDialog>] = [
    {
      key: GtcViewKeys.ListDialog1,
      popupType: 'normal',
      input: () => {
        return {
          inputData: this.selectScheduleInputData,
          selectedValue: this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbScheduleIndex').value,
          listItemHeightPx: this.dialogListItemHeightPx,
          listItemSpacingPx: this.dialogListItemSpacingPx,
          class: 'advanced-vnav-schedule-dialog'
        };
      },
      onResult: (result: GtcDialogResult<any>) => {
        if (result.wasCancelled) {
          return false;
        } else {
          if ((result.payload as number) === this.props.fmsSpeedSettingManager.climbSchedules.length - 1) {
            // Pilot-defined schedule was selected. Continue to the IAS/mach dialogs.
            return true;
          } else {
            // Pre-defined schedule was selected. Set IAS/mach values from the schedule and do not continue to the
            // IAS/mach dialogs.

            let index = (result.payload as number);

            if (index < 0 || index >= this.props.fmsSpeedSettingManager.climbSchedules.length) {
              index = 0;
            }

            const schedule = this.props.fmsSpeedSettingManager.climbSchedules[index];

            this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbScheduleIndex').value = index;
            this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbIas').value = schedule.ias;
            this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbMach').value = schedule.mach;

            return false;
          }
        }
      },
      delay: 150
    },
    {
      key: GtcViewKeys.FmsSpeedDialog,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        return {
          title: 'Climb Speed IAS',
          initialValue: this.props.fmsSpeedSettingManager.getSetting('fmsSpeedPilotClimbIas').value,
          unitsAllowed: 'ias'
        };
      },
      delay: 150
    },
    {
      key: GtcViewKeys.FmsSpeedDialog,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        return {
          title: 'Climb Speed Mach',
          initialValue: this.props.fmsSpeedSettingManager.getSetting('fmsSpeedPilotClimbMach').value,
          unitsAllowed: 'mach',
        };
      }
    }
  ];

  private readonly schedule = this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbScheduleIndex').map(index => {
    const schedules = this.props.fmsSpeedSettingManager.climbSchedules;

    return schedules[Math.min(index, schedules.length)] ?? schedules[0];
  });

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Opens a dialog to allow the user to select a climb schedule.
   */
  private async selectSchedule(): Promise<void> {
    const result = await GtcDialogs.openDialogChain(this.props.gtcService, this.dialogChainSteps);

    if (!result.wasCancelled) {
      // If the entire chain completed, a pilot-defined schedule was selected.
      const index = (result.payload[0] as GtcDialogResultSubmitted<number>).payload;
      const ias = (result.payload[1] as GtcDialogResultSubmitted<GtcFmsSpeedDialogOutput>).payload.value;
      const mach = (result.payload[2] as GtcDialogResultSubmitted<GtcFmsSpeedDialogOutput>).payload.value;

      this.props.fmsSpeedSettingManager.getSetting('fmsSpeedPilotClimbIas').value = ias;
      this.props.fmsSpeedSettingManager.getSetting('fmsSpeedPilotClimbMach').value = mach;

      this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbScheduleIndex').value = index;
      this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbIas').value = ias;
      this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbMach').value = mach;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="advanced-vnav-climb-tab">
        <GtcAdvancedVnavScheduleButton
          gtcService={this.props.gtcService}
          label='Climb Schedule'
          schedule={this.schedule}
          iasSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbIas')}
          machSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbMach')}
          onPressed={this.selectSchedule.bind(this)}
        />
        <GtcAdvancedVnavTransitionButton
          gtcService={this.props.gtcService}
          unitSettingManager={this.unitsSettingManager}
          isEnabled={false}
        />
        <GtcAdvancedVnavAltitudeLimitButton
          gtcService={this.props.gtcService}
          speedLimitSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbAltitudeLimit')}
          ceilingSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedClimbAltitudeCeiling')}
          unitSettingManager={this.unitsSettingManager}
        />
        <GtcAdvancedVnavTerminalLimitButton
          gtcService={this.props.gtcService}
          speedLimitSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedDepartureLimit')}
          ceilingSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedDepartureCeiling')}
          radiusSetting={this.props.fmsSpeedSettingManager.getSetting('fmsSpeedDepartureRadius')}
          ident={this.props.store.originIdent}
          unitSettingManager={this.unitsSettingManager}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onResume(): void {
    // noop
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.schedule.destroy();

    super.destroy();
  }
}