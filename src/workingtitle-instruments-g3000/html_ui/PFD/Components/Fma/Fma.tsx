import {
  APAltitudeModes, APEvents, APLateralModes, APVerticalModes, ConsumerSubject, DisplayComponent, EventBus,
  FlightPlanner, FSComponent, ObjectSubject, SetSubject, Subject, Subscription, VNavEvents, VNavPathMode, VNode
} from '@microsoft/msfs-sdk';

import {
  FmaData, FmaDataEvents, FmaMasterSlot, FmaMasterSlotState, FmaModeSlot, FmaModeSlotActiveData, FmaVNavState
} from '@microsoft/msfs-garminsdk';

import {
  FmsConfig, G3000AutopilotUtils, G3000AutothrottleEvents, G3000AutothrottleFmaData, G3000AutothrottleStatus,
  G3000FlightPlannerId
} from '@microsoft/msfs-wtg3000-common';

import { AfcsStatusBoxPluginOptions } from './AfcsStatusBoxPluginOptions';

import './FmaMasterSlot.css';
import './FmaModeSlot.css';
import './Fma.css';

/**
 * Component props for Fma.
 */
export interface FmaProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** Whether the FMA supports autothrottle. */
  supportAutothrottle: boolean;

  /** The FMS configuration object. */
  fmsConfig: FmsConfig;

  /**
   * An array of options defined by plugins. The array should be ordered such that options defined by plugins that
   * were loaded earlier are positioned before options defined by plugins that were loaded later.
   */
  pluginOptions: readonly AfcsStatusBoxPluginOptions[];
}

/**
 * Types of vertical mode targets.
 */
enum VerticalModeTargetType {
  None = 'None',
  Altitude = 'Altitude',
  VerticalSpeed = 'VerticalSpeed',
  Airspeed = 'Airspeed'
}

/**
 * The G3000 FMA (aka AFCS status box).
 */
export class Fma extends DisplayComponent<FmaProps> {
  private static readonly MACH_FORMATTER = (mach: number): string => Math.min(mach, 0.999).toFixed(3).substring(1);

  private readonly verticalModeTargetArrowStyle = ObjectSubject.create({
    display: 'none',
    transform: 'rotate(0deg)'
  });

  private readonly autothrottleActiveCssClass = SetSubject.create(['fma-autothrottle-active']);
  private readonly autothrottleIasCssClass = SetSubject.create(['fma-autothrottle-ias']);
  private readonly autothrottleMachCssClass = SetSubject.create(['fma-autothrottle-mach']);

  private readonly lastData: FmaData = {
    verticalActive: APVerticalModes.NONE,
    verticalArmed: APVerticalModes.NONE,
    verticalApproachArmed: APVerticalModes.NONE,
    verticalAltitudeArmed: APAltitudeModes.NONE,
    altitudeCaptureArmed: false,
    altitudeCaptureValue: -1,
    lateralActive: APLateralModes.NONE,
    lateralArmed: APLateralModes.NONE,
    lateralModeFailed: false,
    vnavState: FmaVNavState.OFF
  };
  private lastVNavPathMode = VNavPathMode.None;

  private readonly fmaData = ConsumerSubject.create(null, this.lastData).pause();
  private readonly vnavPathMode = ConsumerSubject.create(null, this.lastVNavPathMode).pause();

  private readonly isApMasterActive = ConsumerSubject.create(null, false);
  private readonly isYdMasterActive = ConsumerSubject.create(null, false);

  private readonly apSlotState = this.isApMasterActive.map(isActive => isActive ? FmaMasterSlotState.On : FmaMasterSlotState.Off);
  private readonly ydSlotState = this.isYdMasterActive.map(isActive => isActive ? FmaMasterSlotState.On : FmaMasterSlotState.Off);

  private readonly tempSlotActiveData: FmaModeSlotActiveData = {
    active: '',
    armedTransition: undefined,
    secondaryArmedTransition: undefined,
    failed: undefined
  };

  private readonly lateralSlotActiveData = Subject.create<FmaModeSlotActiveData>({
    active: '',
    armedTransition: undefined,
    secondaryArmedTransition: undefined,
    failed: undefined
  }, (a, b) => a.active === b.active, (oldVal, newVal) => { Object.assign(oldVal, newVal); });

  private readonly verticalSlotActiveData = Subject.create<FmaModeSlotActiveData>({
    active: '',
    armedTransition: undefined,
    secondaryArmedTransition: undefined,
    failed: undefined
  }, (a, b) => a.active === b.active, (oldVal, newVal) => { Object.assign(oldVal, newVal); });

  private readonly lateralArmedText = Subject.create('');
  private readonly verticalArmedText = Subject.create('');
  private readonly verticalApproachArmedText = Subject.create('');

  private readonly vnavActiveText = Subject.create('');
  private readonly vnavArmedText = Subject.create('');

  private verticalModeTargetType = VerticalModeTargetType.None;
  private readonly altitudeCaptureValue = Subject.create(0);
  private readonly selectedVs = ConsumerSubject.create(null, 0).pause();
  private readonly selectedVsSign = this.selectedVs.map(vs => Math.abs(vs) < 1 ? 0 : Math.sign(vs));
  private readonly isSelectedSpeedInMach = ConsumerSubject.create(null, false).pause();
  private readonly selectedIas = ConsumerSubject.create(null, 0).pause();
  private readonly selectedMach = ConsumerSubject.create(null, 0).pause();

  private readonly verticalModeTargetNumber = Subject.create('');
  private readonly verticalModeTargetUnit = Subject.create('');

  private readonly autothrottleFmaData = ConsumerSubject.create<Readonly<G3000AutothrottleFmaData>>(null, {
    status: G3000AutothrottleStatus.Off,
    armedMode: '',
    activeMode: '',
    isActiveModeFail: false,
    targetIas: null,
    targetMach: null
  });

  private readonly atSlotState = this.autothrottleFmaData.map(data => {
    switch (data.status) {
      case G3000AutothrottleStatus.On:
        return FmaMasterSlotState.On;
      case G3000AutothrottleStatus.Disconnected:
        return FmaMasterSlotState.Failed;
      default:
        return FmaMasterSlotState.Off;
    }
  });

  private readonly autothrottleArmedModeText = Subject.create('');
  private readonly autothrottleActiveModeText = Subject.create('');
  private readonly autothrottleTargetIasText = Subject.create('');
  private readonly autothrottleTargetMachText = Subject.create('');

  private readonly pluginLateralActiveLabels = new Map<number, string>();
  private readonly pluginLateralArmedLabels = new Map<number, string>();
  private readonly pluginVerticalActiveLabels = new Map<number, string>();
  private readonly pluginVerticalArmedLabels = new Map<number, string>();

  private isFdActiveSub?: Subscription;
  private altitudeCaptureValuePipe?: Subscription;
  private selectedVsPipe?: Subscription;
  private selectedVsSignSub?: Subscription;
  private isSelectedSpeedInMachSub?: Subscription;
  private selectedIasPipe?: Subscription;
  private selectedMachPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.initPluginModeLabels();

    const sub = this.props.bus.getSubscriber<APEvents & VNavEvents & FmaDataEvents & G3000AutothrottleEvents>();

    this.isApMasterActive.setConsumer(sub.on('ap_master_status'));
    this.isYdMasterActive.setConsumer(sub.on('ap_yd_status'));

    this.selectedVs.setConsumer(sub.on('ap_vs_selected'));
    this.isSelectedSpeedInMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
    this.selectedIas.setConsumer(sub.on('ap_ias_selected'));
    this.selectedMach.setConsumer(sub.on('ap_mach_selected'));

    this.altitudeCaptureValuePipe = this.altitudeCaptureValue.pipe(this.verticalModeTargetNumber, alt => alt.toFixed(0), true);

    this.selectedVsPipe = this.selectedVs.pipe(this.verticalModeTargetNumber, vs => Math.abs(vs).toFixed(0), true);
    this.selectedVsSignSub = this.selectedVsSign.sub(sign => {
      if (sign === 0) {
        this.verticalModeTargetArrowStyle.set('display', 'none');
      } else {
        this.verticalModeTargetArrowStyle.set('display', '');
        this.verticalModeTargetArrowStyle.set('transform', `rotate(${sign < 0 ? 180 : 0}deg)`);
      }
    }, false, true);

    const selectedIasPipe = this.selectedIasPipe = this.selectedIas.pipe(this.verticalModeTargetNumber, ias => ias.toFixed(0), true);
    const selectedMachPipe = this.selectedMachPipe = this.selectedMach.pipe(this.verticalModeTargetNumber, mach => `M${Fma.MACH_FORMATTER(mach)}`, true);
    this.isSelectedSpeedInMachSub = this.isSelectedSpeedInMach.sub(isInMach => {
      if (isInMach) {
        this.verticalModeTargetUnit.set('');
        selectedIasPipe.pause();
        this.selectedIas.pause();
        this.selectedMach.resume();
        selectedMachPipe.resume(true);
      } else {
        this.verticalModeTargetUnit.set('KT');
        selectedMachPipe.pause();
        this.selectedMach.pause();
        this.selectedIas.resume();
        selectedIasPipe.resume(true);
      }
    }, false, true);

    this.fmaData.setConsumer(sub.on('fma_data'));
    const fmaDataSub = this.fmaData.sub(data => {
      const vnavPathMode = this.vnavPathMode.get();
      this.updateFromFmaData(data, vnavPathMode, this.lastData, this.lastVNavPathMode);
      Object.assign(this.lastData, data);
      this.lastVNavPathMode = vnavPathMode;
    }, false, true);

    this.vnavPathMode.setConsumer(sub.on('vnav_path_mode'));

    const vnavPathModeSub = this.vnavPathMode.sub(mode => {
      this.updateFromFmaData(this.fmaData.get(), mode, this.lastData, this.lastVNavPathMode);
    }, false, true);

    this.isFdActiveSub = sub.on('flight_director_is_active_1').whenChanged().handle(isActive => {
      if (isActive) {
        this.fmaData.resume();
        this.vnavPathMode.resume();

        const fmaData = this.fmaData.get();
        const vnavPathMode = this.vnavPathMode.get();

        this.updateFromFmaData(fmaData, vnavPathMode);
        Object.assign(this.lastData, fmaData);
        this.lastVNavPathMode = vnavPathMode;

        fmaDataSub.resume();
        vnavPathModeSub.resume();
      } else {
        this.fmaData.pause();
        this.vnavPathMode.pause();

        fmaDataSub.pause();
        vnavPathModeSub.pause();

        this.tempSlotActiveData.active = '';
        this.tempSlotActiveData.armedTransition = undefined;
        this.tempSlotActiveData.secondaryArmedTransition = undefined;

        this.lateralSlotActiveData.set(this.tempSlotActiveData);
        this.verticalSlotActiveData.set(this.tempSlotActiveData);

        this.lateralArmedText.set('');
        this.verticalArmedText.set('');
        this.verticalApproachArmedText.set('');

        this.vnavActiveText.set('');
        this.vnavArmedText.set('');

        this.setVerticalModeTargetType(VerticalModeTargetType.None);
      }
    });

    if (this.props.supportAutothrottle) {
      this.autothrottleFmaData.setConsumer(sub.on('g3000_at_fma_data'));
      this.autothrottleFmaData.sub(this.updateFromAutothrottleFmaData.bind(this), true);
    }
  }

  /**
   * Initializes the mode labels defined by plugins for this status box.
   */
  private initPluginModeLabels(): void {
    for (const options of this.props.pluginOptions) {
      if (options.getAdditionalLateralModeLabels) {
        for (const label of options.getAdditionalLateralModeLabels()) {
          if (!G3000AutopilotUtils.RESTRICTED_LATERAL_MODES.includes(label.mode)) {
            this.pluginLateralActiveLabels.set(label.mode, label.activeLabel);
            this.pluginLateralArmedLabels.set(label.mode, label.armedLabel);
          }
        }
      }

      if (options.getAdditionalVerticalModeLabels) {
        for (const label of options.getAdditionalVerticalModeLabels()) {
          if (!G3000AutopilotUtils.RESTRICTED_VERTICAL_MODES.includes(label.mode)) {
            this.pluginVerticalActiveLabels.set(label.mode, label.activeLabel);
            this.pluginVerticalArmedLabels.set(label.mode, label.armedLabel);
          }
        }
      }
    }
  }

  /**
   * Updates this FMA from a specific set of data.
   * @param data The FMA data from which to update.
   * @param vnavPathMode The VNAV path mode.
   * @param lastData The previous FMA data.
   * @param lastVNavPathMode The previous VNAV path mode.
   */
  private updateFromFmaData(data: FmaData, vnavPathMode: VNavPathMode, lastData?: FmaData, lastVNavPathMode?: VNavPathMode): void {
    let isLateralModeFailed = false;
    let isVerticalModeFailed = false;

    if (data.lateralModeFailed) {
      isLateralModeFailed = true;
      isVerticalModeFailed = lastData !== undefined && (lastData.verticalActive === APVerticalModes.GP || lastData.verticalActive === APVerticalModes.GS);
    }

    if (data.lateralActive !== lastData?.lateralActive) {
      this.tempSlotActiveData.active = this.getLateralActiveString(data.lateralActive);
      if (lastData === undefined) {
        this.tempSlotActiveData.armedTransition = undefined;
      } else {
        this.tempSlotActiveData.armedTransition = this.getLateralArmedString(lastData.lateralArmed);
      }
      this.tempSlotActiveData.secondaryArmedTransition = undefined;
      this.tempSlotActiveData.failed = isLateralModeFailed && lastData !== undefined
        ? this.getLateralActiveString(lastData.lateralActive)
        : undefined;

      this.lateralSlotActiveData.set(this.tempSlotActiveData);
    }

    if (data.verticalActive !== lastData?.verticalActive) {
      this.tempSlotActiveData.active = this.getVerticalActiveString(data.verticalActive, data.verticalAltitudeArmed);

      if (lastData === undefined || lastVNavPathMode === undefined) {
        this.tempSlotActiveData.armedTransition = undefined;
        this.tempSlotActiveData.secondaryArmedTransition = undefined;
      } else {
        this.tempSlotActiveData.armedTransition = this.getVerticalArmedString(
          lastData.verticalArmed,
          lastData.verticalActive,
          lastData.altitudeCaptureArmed,
          lastData.verticalAltitudeArmed,
          lastVNavPathMode
        );
        this.tempSlotActiveData.secondaryArmedTransition = this.getVerticalApproachArmedString(
          lastData.verticalApproachArmed,
          lastData.verticalArmed,
          lastData.altitudeCaptureArmed
        );
      }

      this.tempSlotActiveData.failed = isVerticalModeFailed && lastData !== undefined
        ? this.getVerticalActiveString(lastData.verticalActive, lastData.verticalAltitudeArmed)
        : undefined;

      this.altitudeCaptureValue.set(data.altitudeCaptureValue);
      this.verticalSlotActiveData.set(this.tempSlotActiveData);
    }

    this.lateralArmedText.set(this.getLateralArmedString(data.lateralArmed));
    this.verticalArmedText.set(this.getVerticalArmedString(
      data.verticalArmed,
      data.verticalActive,
      data.altitudeCaptureArmed,
      data.verticalAltitudeArmed,
      vnavPathMode
    ));
    this.verticalApproachArmedText.set(this.getVerticalApproachArmedString(
      data.verticalApproachArmed,
      data.verticalArmed,
      data.altitudeCaptureArmed
    ));

    switch (data.verticalActive) {
      case APVerticalModes.ALT:
      case APVerticalModes.CAP:
        this.setVerticalModeTargetType(VerticalModeTargetType.Altitude);
        break;
      case APVerticalModes.VS:
        this.setVerticalModeTargetType(VerticalModeTargetType.VerticalSpeed);
        break;
      case APVerticalModes.FLC:
        this.setVerticalModeTargetType(VerticalModeTargetType.Airspeed);
        break;
      default:
        this.setVerticalModeTargetType(VerticalModeTargetType.None);
    }

    switch (data.vnavState) {
      case FmaVNavState.ACTIVE:
        this.vnavActiveText.set('V');
        this.vnavArmedText.set('');
        break;
      case FmaVNavState.ARMED:
        this.vnavActiveText.set('');
        this.vnavArmedText.set('V');
        break;
      default:
        this.vnavActiveText.set('');
        this.vnavArmedText.set('');
    }
  }

  /**
   * Sets the vertical mode target type. The vertical mode target display will be automatically updated with the
   * appropriate information based on the target type.
   * @param type A vertical mode target type.
   */
  private setVerticalModeTargetType(type: VerticalModeTargetType): void {
    if (type === this.verticalModeTargetType) {
      return;
    }

    switch (this.verticalModeTargetType) {
      case VerticalModeTargetType.Altitude:
        this.altitudeCaptureValuePipe?.pause();
        break;
      case VerticalModeTargetType.VerticalSpeed:
        this.verticalModeTargetArrowStyle.set('display', 'none');
        this.selectedVs.pause();
        this.selectedVsPipe?.pause();
        this.selectedVsSignSub?.pause();
        break;
      case VerticalModeTargetType.Airspeed:
        this.isSelectedSpeedInMach.pause();
        this.isSelectedSpeedInMachSub?.pause();
        this.selectedIas.pause();
        this.selectedMach.pause();
        this.selectedIasPipe?.pause();
        this.selectedMachPipe?.pause();
    }

    this.verticalModeTargetType = type;

    switch (type) {
      case VerticalModeTargetType.Altitude:
        this.verticalModeTargetUnit.set('FT');
        this.altitudeCaptureValuePipe?.resume(true);
        break;
      case VerticalModeTargetType.VerticalSpeed:
        this.verticalModeTargetUnit.set('FPM');
        this.selectedVs.resume();
        this.selectedVsPipe?.resume(true);
        this.selectedVsSignSub?.resume(true);
        break;
      case VerticalModeTargetType.Airspeed:
        this.isSelectedSpeedInMach.resume();
        this.isSelectedSpeedInMachSub?.resume(true);
        break;
      default:
        this.verticalModeTargetNumber.set('');
        this.verticalModeTargetUnit.set('');
    }
  }

  /**
   * Gets the display text for an active autopilot vertical mode given a specific altitude capture mode.
   * @param mode An active autopilot vertical mode.
   * @param altCapMode An altitude capture mode.
   * @returns The display text for the specified active autopilot vertical mode and altitude capture mode.
   */
  private getVerticalActiveString(mode: number, altCapMode: APAltitudeModes): string {
    switch (mode) {
      case APVerticalModes.VS:
        return 'VS';
      case APVerticalModes.FLC:
        return 'FLC';
      case APVerticalModes.ALT:
        return 'ALT';
      case APVerticalModes.GS:
        return 'GS';
      case APVerticalModes.PATH:
        return 'PATH';
      case APVerticalModes.GP:
        return 'GP';
      case APVerticalModes.PITCH:
        return 'PIT';
      case APVerticalModes.LEVEL:
        return 'LVL';
      case APVerticalModes.TO:
        return 'TO';
      case APVerticalModes.GA:
        return 'GA';
      case APVerticalModes.CAP: {
        return altCapMode === APAltitudeModes.ALTS ? 'ALTS' : altCapMode === APAltitudeModes.ALTV ? 'ALTV' : 'ALT';
      }
      default:
        return this.pluginVerticalActiveLabels.get(mode) ?? '';
    }
  }

  /**
   * Gets the display text for an armed autopilot vertical mode given a specific active vertical mode, armed altitude
   * capture mode, and VNAV path mode.
   * @param mode An armed autopilot vertical mode.
   * @param activeMode An active autopilot vertical mode.
   * @param isAltCapArmed Whether altitude capture mode is armed.
   * @param altCapMode An altitude capture mode.
   * @param vnavPathMode A VNAV path mode.
   * @returns The display text for the specified armed autopilot vertical mode, active vertical mode, armed altitude
   * capture mode, and VNAV path mode.
   */
  private getVerticalArmedString(mode: number, activeMode: number, isAltCapArmed: boolean, altCapMode: APAltitudeModes, vnavPathMode: VNavPathMode): string {
    if (isAltCapArmed || activeMode === APVerticalModes.PATH) {
      return altCapMode === APAltitudeModes.ALTS ? 'ALTS' : altCapMode === APAltitudeModes.ALTV ? 'ALTV' : 'ALT';
    }
    switch (mode) {
      case APVerticalModes.ALT:
        return 'ALT';
      case APVerticalModes.PATH:
        return vnavPathMode === VNavPathMode.PathArmed ? 'PATH' : '';
      case APVerticalModes.FLC:
        return 'FLC';
      default:
        return this.pluginVerticalArmedLabels.get(mode) ?? '';
    }
  }

  /**
   * Gets the display text for an armed autopilot vertical approach mode given a specific armed vertical mode and
   * altitude capture mode arm state.
   * @param mode An armed autopilot vertical approach mode.
   * @param verticalArmedMode An armed autopilot vertical mode.
   * @param isAltCapArmed Whether altitude capture mode is armed.
   * @returns The display text for the specified armed autopilot vertical approach mode, armed vertical mode and
   * altitude capture mode arm state.
   */
  private getVerticalApproachArmedString(mode: number, verticalArmedMode: number, isAltCapArmed: boolean): string {
    switch (mode) {
      case APVerticalModes.GP:
        if (isAltCapArmed && verticalArmedMode === APVerticalModes.PATH) {
          return 'GP/V';
        }
        return 'GP';
      case APVerticalModes.GS:
        if (isAltCapArmed && verticalArmedMode === APVerticalModes.PATH) {
          return 'GS/V';
        }
        return 'GS';
      default:
        if (isAltCapArmed && verticalArmedMode === APVerticalModes.PATH) {
          return 'PATH';
        } else {
          return '';
        }
    }
  }

  /**
   * Gets the display text for an active autopilot lateral mode.
   * @param mode An active autopilot lateral mode.
   * @returns The display text for the specified active autopilot lateral mode.
   */
  private getLateralActiveString(mode: number): string {
    switch (mode) {
      case APLateralModes.HEADING:
        return 'HDG';
      case APLateralModes.LOC:
        return 'LOC';
      case APLateralModes.BC:
        return 'BC';
      case APLateralModes.VOR:
        return 'VOR';
      case APLateralModes.GPSS:
        return this.props.fmsConfig.navSourceLabelText;
      case APLateralModes.ROLL:
        return 'ROL';
      case APLateralModes.LEVEL:
        return 'LVL';
      case APLateralModes.TO:
        return 'TO';
      case APLateralModes.GA:
        return 'GA';
      default:
        return this.pluginLateralActiveLabels.get(mode) ?? '';
    }
  }

  /**
   * Gets the display text for an armed autopilot lateral mode.
   * @param mode An armed autopilot lateral mode.
   * @returns The display text for the specified armed autopilot lateral mode.
   */
  private getLateralArmedString(mode: number): string {
    switch (mode) {
      case APLateralModes.HEADING:
        return 'HDG';
      case APLateralModes.LOC:
        return 'LOC';
      case APLateralModes.VOR:
        return 'VOR';
      case APLateralModes.GPSS:
        return this.props.fmsConfig.navSourceLabelText;
      case APLateralModes.ROLL:
        return 'ROL';
      case APLateralModes.LEVEL:
        return 'LVL';
      case APLateralModes.BC:
        return 'BC';
      default:
        return this.pluginLateralArmedLabels.get(mode) ?? '';
    }
  }

  /**
   * Updates this FMA from a specific set of autothrottle data.
   * @param data The autothrottle FMA data from which to update.
   */
  private updateFromAutothrottleFmaData(data: Readonly<G3000AutothrottleFmaData>): void {
    this.autothrottleArmedModeText.set(data.armedMode);
    this.autothrottleActiveModeText.set(data.activeMode);
    this.autothrottleActiveCssClass.toggle('fma-autothrottle-active-fail', data.isActiveModeFail);

    if (data.targetIas === null) {
      this.autothrottleIasCssClass.add('hidden');
    } else {
      this.autothrottleIasCssClass.delete('hidden');
      this.autothrottleTargetIasText.set(data.targetIas.toFixed(0));
    }

    if (data.targetMach === null) {
      this.autothrottleMachCssClass.add('hidden');
    } else {
      this.autothrottleMachCssClass.delete('hidden');
      this.autothrottleTargetMachText.set(Fma.MACH_FORMATTER(data.targetMach));
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='fma' data-checklist='checklist-afcs-status'>
        {this.props.supportAutothrottle && (
          <>
            <div class='fma-autothrottle' data-checklist='checklist-afcs-status-autothrottle'>
              <div class='fma-autothrottle-top'>
                <div class={this.autothrottleActiveCssClass}>{this.autothrottleActiveModeText}</div>
                <div class={this.autothrottleIasCssClass}>{this.autothrottleTargetIasText}<span class='numberunit-unit-small'>KT</span></div>
                <div class={this.autothrottleMachCssClass}>M {this.autothrottleTargetMachText}</div>
              </div>
              <div class='fma-autothrottle-bottom'>
                {this.autothrottleArmedModeText}
              </div>
            </div>
            <div class='fma-separator fma-separator-autothrottle' />
          </>
        )}
        <div class='fma-lateral' data-checklist='checklist-afcs-status-lateral'>
          <FmaModeSlot
            active={this.lateralSlotActiveData}
            class='fma-lateral-active'
          />
          <div class='fma-armed fma-lateral-armed'>{this.lateralArmedText}</div>
        </div>
        <div class='fma-separator fma-separator-lateral' />
        <div class='fma-center' data-checklist='checklist-afcs-status-center'>
          <div class='fma-center-top'>
            <FmaMasterSlot state={this.apSlotState} class='fma-master-ap'>AP</FmaMasterSlot>
            <FmaMasterSlot state={this.ydSlotState} class='fma-master-yd'>YD</FmaMasterSlot>
          </div>
          {this.props.supportAutothrottle && (
            <div class='fma-center-bottom'>
              <FmaMasterSlot state={this.atSlotState} class='fma-master-at'>AT</FmaMasterSlot>
            </div>
          )}
        </div>
        <div class='fma-separator fma-separator-vertical' />
        <div class='fma-vertical' data-checklist='checklist-afcs-status-vertical'>
          <div class='fma-vertical-col fma-vertical-vnav'>
            <div class='fma-vertical-vnav-active'>{this.vnavActiveText}</div>
            <div class='fma-armed fma-vertical-vnav-armed'>{this.vnavArmedText}</div>
          </div>
          <div class='fma-vertical-col fma-vertical-main'>
            <FmaModeSlot
              active={this.verticalSlotActiveData}
              class='fma-vertical-main-active'
            />
            <div class='fma-armed fma-vertical-main-armed'>{this.verticalArmedText}</div>
          </div>
          <div class='fma-vertical-col fma-vertical-right'>
            <div class='fma-vertical-target'>
              <svg viewBox='0 0 12 22' class='fma-vertical-target-arrow' style={this.verticalModeTargetArrowStyle}>
                <path d='M 6 18 l -1 0 l 0 -12 l -3 3 l -1.333 -1.344 l 5.333 -5.656 l 5.333 5.656 l -1.333 1.344 l -3 -3 l 0 12 z' />
              </svg>
              <div class='fma-vertical-target-value'>
                <span class='fma-vertical-target-number'>{this.verticalModeTargetNumber}</span>
                <span class='fma-vertical-target-unit'>{this.verticalModeTargetUnit}</span>
              </div>
            </div>
            <div class='fma-armed fma-vertical-appr-armed'>{this.verticalApproachArmedText}</div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isApMasterActive.destroy();
    this.isYdMasterActive.destroy();
    this.fmaData.destroy();
    this.vnavPathMode.destroy();
    this.selectedVs.destroy();
    this.isSelectedSpeedInMach.destroy();
    this.selectedIas.destroy();
    this.selectedMach.destroy();

    this.autothrottleFmaData.destroy();

    this.isFdActiveSub?.destroy();

    super.destroy();
  }
}
