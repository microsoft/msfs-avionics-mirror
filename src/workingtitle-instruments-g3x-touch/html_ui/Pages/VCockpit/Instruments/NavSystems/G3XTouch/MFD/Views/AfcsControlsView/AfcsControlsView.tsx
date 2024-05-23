import {
  APAltitudeModes, APEvents, APLateralModes, APVerticalModes, ConsumerSubject, ConsumerValue, FSComponent, SimVarValueType, Subject,
  Subscribable, VNode,
} from '@microsoft/msfs-sdk';

import { FmaData, FmaDataEvents, FmaVNavState } from '@microsoft/msfs-garminsdk';

import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';

import './AfcsControlsView.css';

const EMPTY_FMA: FmaData = {
  verticalActive: APVerticalModes.NONE,
  verticalArmed: APVerticalModes.NONE,
  verticalApproachArmed: APVerticalModes.NONE,
  verticalAltitudeArmed: APAltitudeModes.NONE,
  altitideCaptureArmed: false,
  altitideCaptureValue: -1,
  lateralActive: APLateralModes.NONE,
  lateralArmed: APLateralModes.NONE,
  lateralModeFailed: false,
  vnavState: FmaVNavState.OFF
};

/**
 * Props for {@link AfcsControlsView}
 */
export interface AfcsControlsViewProps extends UiViewProps {
  /** Whether a yaw damper must be shown */
  hasYawDamper: boolean,
}

/**
 * AFCS controls dialog
 */
export class AfcsControlsView extends AbstractUiView<AfcsControlsViewProps> {
  private static readonly NAV_MODES = new Set([
    APLateralModes.NAV,
    APLateralModes.GPSS,
    APLateralModes.VOR,
    APLateralModes.LOC,
    APLateralModes.BC,
  ]);

  private thisNode?: VNode;

  private readonly apState = ConsumerSubject.create(null, false).pause();
  private readonly isFdActive = ConsumerSubject.create(null, false).pause();

  private readonly fmaData = ConsumerSubject.create<FmaData>(null, EMPTY_FMA).pause();
  private readonly hdgState = this.fmaData.map((it) => it.lateralActive === APLateralModes.HEADING || it.lateralArmed === APLateralModes.HEADING);
  private readonly trkState = this.fmaData.map((it) => it.lateralActive === APLateralModes.TRACK || it.lateralArmed === APLateralModes.TRACK);
  private readonly navState = this.fmaData.map((it) => AfcsControlsView.NAV_MODES.has(it.lateralActive) || AfcsControlsView.NAV_MODES.has(it.lateralArmed));
  private readonly iasState = this.fmaData.map((it) => it.verticalActive === APVerticalModes.FLC || it.verticalArmed === APVerticalModes.FLC);
  private readonly altState = this.fmaData.map((it) => it.verticalActive === APVerticalModes.ALT);
  private readonly vsState = this.fmaData.map((it) => it.verticalActive === APVerticalModes.VS || it.verticalArmed === APVerticalModes.VS);
  private readonly vnavState = this.fmaData.map((it) => {
    return (it.verticalActive === APVerticalModes.PATH || it.verticalArmed === APVerticalModes.PATH) && it.vnavState !== FmaVNavState.OFF;
  });

  private readonly selectedVs = ConsumerSubject.create(null, 0).pause();
  private readonly selectedVsDisplay = this.selectedVs.map((it) => `${it > 0 ? '+' : ''}${it.toFixed(0)}`);

  private readonly isSelectedSpeedInMach = ConsumerValue.create(null, false);

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    this.thisNode = node;

    const sub = this.props.uiService.bus.getSubscriber<APEvents & FmaDataEvents>();

    this.apState.setConsumer(sub.on('ap_master_status'));
    this.isFdActive.setConsumer(sub.on('flight_director_is_active_1'));
    this.fmaData.setConsumer(sub.on('fma_data'));
    this.selectedVs.setConsumer(sub.on('ap_vs_selected'));
    this.isSelectedSpeedInMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
  }

  /** @inheritDoc */
  public onResume(): void {
    this.apState.resume();
    this.isFdActive.resume();
    this.fmaData.resume();
    this.selectedVs.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.apState.pause();
    this.isFdActive.resume();
    this.fmaData.pause();
    this.selectedVs.pause();
  }

  /**
   * Responds to when the AP button is pressed.
   * @param button The button that was pressed.
   * @param state The autopilot master state.
   */
  private onApPressed(button: any, state: Subscribable<boolean>): void {
    SimVar.SetSimVarValue(`K:AUTOPILOT_${state.get() ? 'OFF' : 'ON'}`, SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the FD button is pressed.
   */
  private onFdPressed(): void {
    SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the HDG button is pressed.
   * @param button The button that was pressed.
   * @param state Whether HDG mode is armed or active.
   */
  private onHdgPressed(button: any, state: Subscribable<boolean>): void {
    SimVar.SetSimVarValue(`K:AP_HDG_HOLD_${state.get() ? 'OFF' : 'ON'}`, SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the NAV button is pressed.
   * @param button The button that was pressed.
   * @param state Whether a NAV mode is armed or active.
   */
  private onNavPressed(button: any, state: Subscribable<boolean>): void {
    SimVar.SetSimVarValue(`K:AP_NAV1_HOLD_${state.get() ? 'OFF' : 'ON'}`, SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the IAS button is pressed.
   * @param button The button that was pressed.
   * @param state Whether IAS mode is armed or active.
   */
  private onIasPressed(button: any, state: Subscribable<boolean>): void {
    SimVar.SetSimVarValue(`K:FLIGHT_LEVEL_CHANGE_${state.get() ? 'OFF' : 'ON'}`, SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the ALT button is pressed.
   * @param button The button that was pressed.
   * @param state Whether ALT mode is active.
   */
  private onAltPressed(button: any, state: Subscribable<boolean>): void {
    SimVar.SetSimVarValue(`K:AP_ALT_HOLD_${state.get() ? 'OFF' : 'ON'}`, SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the VS button is pressed.
   * @param button The button that was pressed.
   * @param state Whether VS mode is armed or active.
   */
  private handleVsPressed(button: any, state: Subscribable<boolean>): void {
    SimVar.SetSimVarValue(`K:AP_VS_${state.get() ? 'OFF' : 'ON'}`, SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the Nose Up button is pressed.
   */
  private handleNoseUpPressed(): void {
    const verticalActive = this.fmaData.get().verticalActive;
    switch (verticalActive) {
      case APVerticalModes.PITCH:
        SimVar.SetSimVarValue('K:AP_PITCH_REF_INC_UP', SimVarValueType.Number, 0);
        break;
      case APVerticalModes.VS:
        SimVar.SetSimVarValue('K:AP_VS_VAR_INC', SimVarValueType.Number, 0);
        break;
      case APVerticalModes.FLC:
        if (this.isSelectedSpeedInMach.get()) {
          SimVar.SetSimVarValue('K:AP_MACH_VAR_DEC', SimVarValueType.Number, 0);
        } else {
          SimVar.SetSimVarValue('K:AP_SPD_VAR_DEC', SimVarValueType.Number, 0);
        }
        break;
    }
  }

  /**
   * Responds to when the Nose Down button is pressed.
   */
  private handleNoseDownPressed(): void {
    const verticalActive = this.fmaData.get().verticalActive;
    switch (verticalActive) {
      case APVerticalModes.PITCH:
        SimVar.SetSimVarValue('K:AP_PITCH_REF_INC_DN', SimVarValueType.Number, 0);
        break;
      case APVerticalModes.VS:
        SimVar.SetSimVarValue('K:AP_VS_VAR_DEC', SimVarValueType.Number, 0);
        break;
      case APVerticalModes.FLC:
        if (this.isSelectedSpeedInMach.get()) {
          SimVar.SetSimVarValue('K:AP_MACH_VAR_INC', SimVarValueType.Number, 0);
        } else {
          SimVar.SetSimVarValue('K:AP_SPD_VAR_INC', SimVarValueType.Number, 0);
        }
        break;
    }
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class="afcs-controls ui-view-panel">
        <div class="afcs-controls-title">Automatic Flight Control System</div>

        <div class={{ 'afcs-controls-row': true, 'afcs-controls-row-1': true, 'with-yd': this.props.hasYawDamper }}>
          <UiToggleTouchButton label="AP" state={this.apState} onPressed={this.onApPressed.bind(this)} />
          <UiToggleTouchButton label="FD" state={this.isFdActive} onPressed={this.onFdPressed.bind(this)} />
          {this.props.hasYawDamper && <UiToggleTouchButton label="YD" state={this.apState} />}
          <UiToggleTouchButton label="ESP" state={Subject.create(false)} isEnabled={false} />
          <UiToggleTouchButton label="LVL" state={Subject.create(false)} isEnabled={false} />
        </div>

        <div class="afcs-controls-row afcs-controls-row-2">
          <UiToggleTouchButton label="HDG" state={this.hdgState} onPressed={this.onHdgPressed.bind(this)} />
          <UiToggleTouchButton label="TRK" state={this.trkState} isEnabled={false} />
          <UiToggleTouchButton label="NAV" state={this.navState} onPressed={this.onNavPressed.bind(this)} />
          <UiToggleTouchButton label="APPR" state={Subject.create(false)} isEnabled={false} />
        </div>

        <div class="afcs-controls-row afcs-controls-row-3">
          <UiToggleTouchButton label="IAS" state={this.iasState} onPressed={this.onIasPressed.bind(this)} />
          <UiToggleTouchButton label="ALT" state={this.altState} onPressed={this.onAltPressed.bind(this)} />
          <UiToggleTouchButton label="VS" state={this.vsState} onPressed={this.handleVsPressed.bind(this)} />
          <UiToggleTouchButton label="VNAV" state={this.vnavState} />
        </div>

        <div class="afcs-controls-row afcs-controls-row-4">
          <UiTouchButton label={'Nose\nUp'} onPressed={this.handleNoseUpPressed.bind(this)} />
          <UiTouchButton label={'Nose\nDown'} onPressed={this.handleNoseDownPressed.bind(this)} />

          <div class={{ 'afcs-up-down-state': true, 'visibility-hidden': this.vsState.map((it) => !it) }}>
            <div class="afcs-up-down-label">Vertical Speed</div>

            <div class="afcs-up-down-value">{this.selectedVsDisplay}</div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.apState.destroy();
    this.isFdActive.destroy();
    this.fmaData.destroy();
    this.selectedVs.destroy();
    this.isSelectedSpeedInMach.destroy();

    super.destroy();
  }
}