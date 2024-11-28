import {
  APEvents, APLateralModes, APVerticalModes, ConsumerSubject, ConsumerValue, FSComponent, SimVarValueType, Subject,
  SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { FmaData, FmaDataEvents, FmaVNavState, GarminAPEvents } from '@microsoft/msfs-garminsdk';

import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';

import './AfcsControlsView.css';

/**
 * Component props for {@link AfcsControlsView}.
 */
export interface AfcsControlsViewProps extends UiViewProps {
  /** Whether a yaw damper must be shown */
  hasYawDamper: boolean;
}

/**
 * An AFCS controls menu.
 */
export class AfcsControlsView extends AbstractUiView<AfcsControlsViewProps> {
  private thisNode?: VNode;

  private readonly apState = ConsumerSubject.create(null, false).pause();
  private readonly isFdActive = ConsumerSubject.create(null, false).pause();

  private readonly fmaData = ConsumerSubject.create<FmaData | undefined>(null, undefined).pause();
  private readonly hdgState = this.fmaData.map(fmaData => !!fmaData && (fmaData.lateralActive === APLateralModes.HEADING || fmaData.lateralArmed === APLateralModes.HEADING));
  private readonly trkState = this.fmaData.map(fmaData => !!fmaData && (fmaData.lateralActive === APLateralModes.TRACK || fmaData.lateralArmed === APLateralModes.TRACK));
  private readonly navState = ConsumerSubject.create(null, false);
  private readonly apprState = ConsumerSubject.create(null, false);
  private readonly iasState = this.fmaData.map(fmaData => !!fmaData && (fmaData.verticalActive === APVerticalModes.FLC || fmaData.verticalArmed === APVerticalModes.FLC));
  private readonly altState = this.fmaData.map(fmaData => !!fmaData && fmaData.verticalActive === APVerticalModes.ALT);
  private readonly vsState = this.fmaData.map(fmaData => !!fmaData && (fmaData.verticalActive === APVerticalModes.VS || fmaData.verticalArmed === APVerticalModes.VS));
  private readonly vnavState = this.fmaData.map(fmaData => !!fmaData && fmaData.vnavState !== FmaVNavState.OFF);

  private readonly selectedVs = ConsumerSubject.create(null, 0).pause();
  private readonly selectedVsDisplay = this.selectedVs.map((it) => `${it > 0 ? '+' : ''}${it.toFixed(0)}`);

  private readonly isSelectedSpeedInMach = ConsumerValue.create(null, false);

  private readonly subscriptions: Subscription[] = [
    this.apState,
    this.isFdActive,
    this.fmaData,
    this.navState,
    this.apprState,
    this.selectedVs,
    this.isSelectedSpeedInMach
  ];

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    this.thisNode = node;

    this.focusController.setActive(true);
    this.focusController.knobLabelState.pipe(this._knobLabelState);

    const sub = this.props.uiService.bus.getSubscriber<APEvents & GarminAPEvents & FmaDataEvents>();

    this.apState.setConsumer(sub.on('ap_master_status'));
    this.isFdActive.setConsumer(sub.on('flight_director_is_active_1'));
    this.fmaData.setConsumer(sub.on('fma_data'));
    this.navState.setConsumer(sub.on('ap_garmin_nav_mode_on'));
    this.apprState.setConsumer(sub.on('ap_garmin_approach_mode_on'));
    this.selectedVs.setConsumer(sub.on('ap_vs_selected'));
    this.isSelectedSpeedInMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
  }

  /** @inheritDoc */
  public onClose(): void {
    this.focusController.clearRecentFocus();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();

    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();

    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /**
   * Responds to when the AP button is pressed.
   */
  private onApPressed(): void {
    SimVar.SetSimVarValue('K:AP_MASTER', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the FD button is pressed.
   */
  private onFdPressed(): void {
    SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the HDG button is pressed.
   */
  private onHdgPressed(): void {
    SimVar.SetSimVarValue('K:AP_HDG_HOLD', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the NAV button is pressed.
   */
  private onNavPressed(): void {
    SimVar.SetSimVarValue('K:AP_NAV1_HOLD', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the APPR button is pressed.
   */
  private onApprPressed(): void {
    SimVar.SetSimVarValue('K:AP_APR_HOLD', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the IAS button is pressed.
   */
  private onIasPressed(): void {
    SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the ALT button is pressed.
   */
  private onAltPressed(): void {
    SimVar.SetSimVarValue('K:AP_ALT_HOLD', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the VS button is pressed.
   */
  private handleVsPressed(): void {
    SimVar.SetSimVarValue('K:AP_VS_HOLD', SimVarValueType.Number, 0);
  }

  /**
   * Responds to when the VNAV button is pressed.
   */
  private onVNavPressed(): void {
    // TODO: Refactor this to send a command to the autopilot instead of directly toggling the LVar.
    SimVar.SetSimVarValue('L:XMLVAR_VNAVButtonValue', SimVarValueType.Bool, SimVar.GetSimVarValue('L:XMLVAR_VNAVButtonValue', SimVarValueType.Bool) === 0);
  }

  /**
   * Responds to when the Nose Up button is pressed.
   */
  private handleNoseUpPressed(): void {
    const verticalActive = this.fmaData.get()?.verticalActive;
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
    const verticalActive = this.fmaData.get()?.verticalActive;
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
  public render(): VNode {
    return (
      <div class="afcs-controls ui-view-panel">
        <div class="afcs-controls-title">Automatic Flight Control System</div>

        <div class={{ 'afcs-controls-row': true, 'afcs-controls-row-1': true, 'with-yd': this.props.hasYawDamper }}>
          <UiToggleTouchButton label="AP" state={this.apState} onPressed={this.onApPressed.bind(this)} focusController={this.focusController} />
          <UiToggleTouchButton label="FD" state={this.isFdActive} onPressed={this.onFdPressed.bind(this)} focusController={this.focusController} />
          {this.props.hasYawDamper && <UiToggleTouchButton label="YD" state={this.apState} focusController={this.focusController} />}
          <UiToggleTouchButton label="ESP" state={Subject.create(false)} isEnabled={false} focusController={this.focusController} />
          <UiToggleTouchButton label="LVL" state={Subject.create(false)} isEnabled={false} focusController={this.focusController} />
        </div>

        <div class="afcs-controls-row afcs-controls-row-2">
          <UiToggleTouchButton label="HDG" state={this.hdgState} onPressed={this.onHdgPressed.bind(this)} focusController={this.focusController} />
          <UiToggleTouchButton label="TRK" state={this.trkState} isEnabled={false} focusController={this.focusController} />
          <UiToggleTouchButton label="NAV" state={this.navState} onPressed={this.onNavPressed.bind(this)} focusController={this.focusController} />
          <UiToggleTouchButton label="APPR" state={this.apprState} onPressed={this.onApprPressed.bind(this)} focusController={this.focusController} />
        </div>

        <div class="afcs-controls-row afcs-controls-row-3">
          <UiToggleTouchButton label="IAS" state={this.iasState} onPressed={this.onIasPressed.bind(this)} focusController={this.focusController} />
          <UiToggleTouchButton label="ALT" state={this.altState} onPressed={this.onAltPressed.bind(this)} focusController={this.focusController} />
          <UiToggleTouchButton label="VS" state={this.vsState} onPressed={this.handleVsPressed.bind(this)} focusController={this.focusController} />
          <UiToggleTouchButton label="VNAV" state={this.vnavState} onPressed={this.onVNavPressed.bind(this)} focusController={this.focusController} />
        </div>

        <div class="afcs-controls-row afcs-controls-row-4">
          <UiTouchButton label={'Nose\nUp'} onPressed={this.handleNoseUpPressed.bind(this)} focusController={this.focusController} />
          <UiTouchButton label={'Nose\nDown'} onPressed={this.handleNoseDownPressed.bind(this)} focusController={this.focusController} />

          <div class={{ 'afcs-up-down-state': true, 'visibility-hidden': this.vsState.map(SubscribableMapFunctions.not()) }}>
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

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}