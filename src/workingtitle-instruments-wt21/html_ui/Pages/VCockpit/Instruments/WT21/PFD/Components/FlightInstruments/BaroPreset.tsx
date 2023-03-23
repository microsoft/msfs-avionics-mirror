import { AdcEvents, ComponentProps, ControlEvents, DisplayComponent, EventBus, FSComponent, HEvent, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

import { PerformancePlan } from '../../../Shared/Performance/PerformancePlan';
import { PFDUserSettings } from '../../PFDUserSettings';

import './BaroPreset.css';

/**
 * The properties for the Baro Preset component.
 */
interface BaroPresetProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The active performance plan */
  performancePlan: PerformancePlan;
}

/**
 * The BaroPreset component.
 */
export class BaroPreset extends DisplayComponent<BaroPresetProps> {
  private baroCurrentSubject = Subject.create('');
  private baroCurrentUnitSubject = Subject.create('');
  private baroPresetSubject = Subject.create('');
  private baroPresetUnitSubject = Subject.create('');
  private presetBoxRef = FSComponent.createRef<HTMLDivElement>();
  private baroValueCurrentRef = FSComponent.createRef<HTMLDivElement>();
  private presetBoxVisible = Subject.create(false);
  private doFlAlert = Subject.create(false);
  private currentIndicatedAltitude = 0;
  private presetManuallyChanged = false;

  private currentBaro = {
    units_hpa: false,
    standard: false,
    settingIn: 0,
    presetSettingIn: 0
  };

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);
    pfdSettingsManager.whenSettingChanged('pressureUnitHPA').handle(this.updateBaroUnits.bind(this));

    this.props.bus.getSubscriber<ControlEvents>().on('baro_set')
      .handle(() => this.handleBaroSetEvent());

    const adc = this.props.bus.getSubscriber<AdcEvents>();
    adc.on('altimeter_baro_setting_inhg_1')
      .withPrecision(2)
      .handle(this.updateKohlsmanSetting.bind(this));

    adc.on('altimeter_baro_preselect_inhg_1')
      .withPrecision(2)
      .handle(v => {
        this.currentBaro.presetSettingIn = v;
      });

    adc.on('altimeter_baro_is_std_1').whenChanged().handle(v => {
      this.currentBaro.standard = v;
      this.updateBaroDisplay();
      this.presetManuallyChanged = false;
      if (!v) {
        this.presetBoxVisible.set(false);
      }
    });

    adc.on('indicated_alt').withPrecision(0).handle(v => {
      const shouldAlertFL = (pfdSettingsManager.getSetting('flightLevelAlert').value)
        && ((!this.currentBaro.standard && v > this.props.performancePlan.transitionAltitude.get())
          || (this.currentBaro.standard && v < this.props.performancePlan.transitionAltitude.get()));
      this.doFlAlert.set(shouldAlertFL);
      this.currentIndicatedAltitude = v;
    });

    const hEvent = this.props.bus.getSubscriber<HEvent>();
    hEvent.on('hEvent').handle((e: string) => {
      if (e === 'AP_BARO_Up') {
        this.handleBaroChange(true);
      } else if (e === 'AP_BARO_Down') {
        this.handleBaroChange(false);
      }
    });

    this.presetBoxVisible.sub(v => this.presetBoxRef.instance.classList.toggle('hidden', !v));

    this.doFlAlert.sub(v => {
      this.baroValueCurrentRef.instance.classList.toggle('blink', v);
    });
  }


  /**
   * Updates the kohlsman value when it changes.
   * @param kohlsmanSetting The new selected baro value.
   */
  private updateKohlsmanSetting(kohlsmanSetting: number): void {
    this.currentBaro.settingIn = kohlsmanSetting;
    this.updateBaroDisplay();
  }

  /**
   * Updates the kohlsman value when it changes.
   * @param baroUnits The new selected altitude value.
   */
  private updateBaroUnits(baroUnits: boolean): void {
    this.currentBaro.units_hpa = baroUnits;
    this.updateBaroDisplay();
  }

  /**
   * Handle when the we detect that the user pressed the 'B' key to set the barometric pressure.
   * It will use the sim's fixed transition altitude otherwise it doesn't match the sim behavior.
   */
  private handleBaroSetEvent(): void {
    if (this.currentIndicatedAltitude > this.props.performancePlan.transitionAltitude.get()) {
      if (!this.currentBaro.standard) {
        SimVar.SetSimVarValue('L:XMLVAR_Baro1_SavedPressure', SimVarValueType.Number, this.currentBaro.settingIn / 0.02953 * 16);
        SimVar.SetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', SimVarValueType.Bool, true);
      }
      SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', 29.92 / 0.02953 * 16);
    } else {
      if (this.currentBaro.standard) {
        SimVar.SetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', SimVarValueType.Bool, false);
        if (this.presetManuallyChanged === true) {
          SimVar.SetSimVarValue('K:KOHLSMAN_SET', 'number', this.currentBaro.presetSettingIn / 0.02953 * 16);
        }
      }
    }
  }

  /**
   * Updates the kohlsman display value.
   */
  private updateBaroDisplay(): void {
    if (this.currentBaro.units_hpa) {
      this.baroCurrentSubject.set(Math.round(33.864 * this.currentBaro.settingIn).toString());
      this.baroCurrentUnitSubject.set(this.currentBaro.standard ? ' STD' : ' HPA');
      this.baroPresetSubject.set(Math.round(33.864 * this.currentBaro.presetSettingIn).toString());
      this.baroPresetUnitSubject.set(' HPA');
    } else {
      this.baroCurrentSubject.set(this.currentBaro.settingIn.toFixed(2));
      this.baroCurrentUnitSubject.set(this.currentBaro.standard ? ' STD' : ' IN');
      this.baroPresetSubject.set(this.currentBaro.presetSettingIn.toFixed(2));
      this.baroPresetUnitSubject.set(' IN');
    }
  }

  /**
   * Handles a Baro settings knob rotation.
   * @param increase A boolean indicating whether the baro setting was increased.
   */
  private handleBaroChange(increase: boolean): void {
    if (this.currentBaro.standard) {
      this.presetManuallyChanged = true;
      const delta = this.currentBaro.units_hpa ? 0.02953 : 0.01;
      this.currentBaro.presetSettingIn = increase ? this.currentBaro.presetSettingIn + delta : this.currentBaro.presetSettingIn - delta;
      SimVar.SetSimVarValue('L:XMLVAR_Baro1_SavedPressure', SimVarValueType.Number, this.currentBaro.presetSettingIn / 0.02953 * 16);

      this.updateBaroDisplay();
      this.presetBoxVisible.set(true);
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div>
        <div class="baro-preset-box hidden" ref={this.presetBoxRef}>
          <div class="baro-preset-value">{this.baroPresetSubject}<span class="baro-preset-units">{this.baroPresetUnitSubject}</span></div>
          <div class="baro-preset-arrow">
            <svg>
              <path d="M 4 12 l 0 -5 l -4 0 l 5.5 -7 l 5.5 7 l -4 0 l 0 10 l 4 0 l -5.5 7 l -5.5 -7 l 4 0 z" fill="var(--wt21-colors-white)" />
            </svg>
          </div>
        </div>
        <div class="baro-preset-current" ref={this.baroValueCurrentRef}>{this.baroCurrentSubject}<span class="baro-preset-units">{this.baroCurrentUnitSubject}</span></div>
      </div>
    );
  }
}