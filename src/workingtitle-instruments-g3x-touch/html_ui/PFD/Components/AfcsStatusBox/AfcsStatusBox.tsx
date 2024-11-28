import {
  APAltitudeModes, APEvents, APLateralModes, APVerticalModes, ArrayUtils, ComponentProps, ConsumerSubject,
  DebounceTimer, DisplayComponent, FSComponent, Subject, Subscribable, SubscribableUtils, Subscription, VNavEvents,
  VNavPathMode, VNode
} from '@microsoft/msfs-sdk';

import {
  FmaData, FmaDataEvents, FmaMasterSlot, FmaMasterSlotState, FmaModeSlot, FmaModeSlotActiveData, FmaVNavState
} from '@microsoft/msfs-garminsdk';

import { TouchButton } from '../../../Shared/Components/TouchButton/TouchButton';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';

import './AfcsStatusBox.css';
import './FmaMasterSlot.css';
import './FmaModeSlot.css';

/**
 * Component props for {@link AfcsStatusBox}.
 */
export interface AfcsStatusBoxProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;

  /** Whether the yaw damper indication is supported. */
  supportYawDamper: boolean;

  /**
   * The maximum number of available vertical mode slots to the right of the active mode indication. The number of
   * available slots determines how many vertical mode target (altitude, vertical speed, airspeed) and armed mode
   * indications can be displayed simultaneously. Each armed mode indication uses one slot. The airspeed target
   * indication uses one slot. The altitude and vertical speed indications each use 1.5 slots.
   */
  maxVerticalRightSlots: number | Subscribable<number>;
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
 * A G3X Touch AFCS status box.
 */
export class AfcsStatusBox extends DisplayComponent<AfcsStatusBoxProps> {
  private static readonly VERTICAL_MODE_TARGET_TRANSIENT_DURATION = 5000; // milliseconds

  private static readonly MACH_FORMATTER = (mach: number): string => Math.min(mach, 0.99).toFixed(2).substring(1);

  private readonly buttonRef = FSComponent.createRef<TouchButton>();

  private readonly isInnerHidden = Subject.create(false);

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

  private readonly fdActive = ConsumerSubject.create(null, false).pause();

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

  private readonly lateralArmedHidden = Subject.create(false);
  private readonly lateralArmedText = Subject.create('');

  private readonly maxVerticalRightSlots = SubscribableUtils.toSubscribable(this.props.maxVerticalRightSlots, true);
  private readonly maxVerticalRightSlotsStyle = this.maxVerticalRightSlots.map(slots => slots.toString());
  private readonly verticalRightSlots = ArrayUtils.create(2, () => {
    return {
      largeSize: Subject.create(false),
      hidden: Subject.create(false),
      armedHidden: Subject.create(false),
      armedText: Subject.create('')
    };
  });

  private readonly verticalArmedStringsCache: string[] = [];
  private readonly verticalArmedStrings: string[] = [];

  private verticalModeTargetType = VerticalModeTargetType.None;
  private readonly altitudeCaptureValue = Subject.create(0);
  private readonly selectedVs = ConsumerSubject.create(null, 0).pause();
  private readonly isSelectedSpeedInMach = ConsumerSubject.create(null, false).pause();
  private readonly selectedIas = ConsumerSubject.create(null, 0).pause();
  private readonly selectedMach = ConsumerSubject.create(null, 0).pause();

  private readonly verticalModeTargetHideDebounce = new DebounceTimer();
  private readonly verticalModeTargetHidden = Subject.create(false);
  private readonly verticalModeTargetNumber = Subject.create('');
  private readonly verticalModeTargetUnit = Subject.create('');
  private verticalModeTargetSlots: 0 | 1 | 1.5 = 0;
  private needHideVerticalModeTarget = false;

  private isAwake = false;

  private readonly subscriptions: Subscription[] = [
    this.fdActive,
    this.isApMasterActive,
    this.isYdMasterActive,
    this.fmaData,
    this.vnavPathMode,
    this.selectedVs,
    this.isSelectedSpeedInMach,
    this.selectedIas,
    this.selectedMach,
    this.maxVerticalRightSlotsStyle
  ];

  private fdSub?: Subscription;
  private fmaDataSub?: Subscription;
  private vnavPathModeSub?: Subscription;
  private maxVerticalArmedSlotsSub?: Subscription;

  private altitudeCaptureValueSub?: Subscription;
  private selectedVsSub?: Subscription;
  private isSelectedSpeedInMachSub?: Subscription;
  private selectedIasSub?: Subscription;
  private selectedMachSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    const sub = this.props.uiService.bus.getSubscriber<APEvents & VNavEvents & FmaDataEvents>();

    this.isApMasterActive.setConsumer(sub.on('ap_master_status'));

    if (this.props.supportYawDamper) {
      this.isYdMasterActive.setConsumer(sub.on('ap_yd_status'));
    }

    this.selectedVs.setConsumer(sub.on('ap_vs_selected'));
    this.isSelectedSpeedInMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
    this.selectedIas.setConsumer(sub.on('ap_ias_selected'));
    this.selectedMach.setConsumer(sub.on('ap_mach_selected'));

    this.altitudeCaptureValueSub = this.altitudeCaptureValue.sub(this.onAltitudeCaptureValueChanged.bind(this), false, true);

    this.selectedVsSub = this.selectedVs.sub(this.onSelectedVsChanged.bind(this), false, true);

    const selectedIasPipe = this.selectedIasSub = this.selectedIas.sub(this.onSelectedIasChanged.bind(this), false, true);
    const selectedMachPipe = this.selectedMachSub = this.selectedMach.sub(this.onSelectedMachChanged.bind(this), false, true);
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
    this.fmaDataSub = this.fmaData.sub(data => {
      const vnavPathMode = this.vnavPathMode.get();
      this.updateFromFmaData(data, vnavPathMode, this.lastData, this.lastVNavPathMode);
      Object.assign(this.lastData, data);
      this.lastVNavPathMode = vnavPathMode;
    }, false, true);

    this.vnavPathMode.setConsumer(sub.on('vnav_path_mode'));

    this.vnavPathModeSub = this.vnavPathMode.sub(mode => {
      this.updateFromFmaData(this.fmaData.get(), mode, this.lastData, this.lastVNavPathMode);
    }, false, true);

    this.maxVerticalArmedSlotsSub = this.maxVerticalRightSlots.sub(maxSlots => {
      this.resolveVerticalRightSlots(this.verticalModeTargetType, this.verticalArmedStrings, maxSlots);
    }, false, true);

    this.fdActive.setConsumer(sub.on('flight_director_is_active_1'));
    this.fdSub = this.fdActive.sub(this.onFdActiveChanged.bind(this), this.isAwake, !this.isAwake);

    this.subscriptions.push(
      this.maxVerticalArmedSlotsSub
    );
  }

  /**
   * Wakes this status box. When awake, the status box will automatically update its display based on the current
   * flight director and autopilot state.
   */
  public wake(): void {
    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.fdActive.resume();
    this.fdSub?.resume(true);
  }

  /**
   * Puts this status box to sleep. When asleep, the status box will not display any information.
   */
  public sleep(): void {
    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.fdActive.pause();
    this.fdSub?.pause();

    this.fmaData.pause();
    this.vnavPathMode.pause();

    this.fmaDataSub?.pause();
    this.vnavPathModeSub?.pause();
    this.maxVerticalArmedSlotsSub?.pause();

    this.clearDisplay();
  }

  /**
   * Clears this status box's displayed information.
   */
  private clearDisplay(): void {
    this.tempSlotActiveData.active = '';
    this.tempSlotActiveData.armedTransition = undefined;
    this.tempSlotActiveData.secondaryArmedTransition = undefined;

    this.lateralSlotActiveData.set(this.tempSlotActiveData);
    this.verticalSlotActiveData.set(this.tempSlotActiveData);

    this.lateralArmedHidden.set(true);
    this.lateralArmedText.set('');

    this.verticalModeTargetHideDebounce.clear();
    this.setVerticalModeTargetType(VerticalModeTargetType.None);

    this.isInnerHidden.set(true);
  }

  /**
   * Responds to when whether the flight director is active changes.
   * @param isActive Whether the flight director is active.
   */
  private onFdActiveChanged(isActive: boolean): void {
    if (isActive) {
      this.fmaData.resume();
      this.vnavPathMode.resume();

      const fmaData = this.fmaData.get();
      const vnavPathMode = this.vnavPathMode.get();

      this.updateFromFmaData(fmaData, vnavPathMode);
      Object.assign(this.lastData, fmaData);
      this.lastVNavPathMode = vnavPathMode;

      this.fmaDataSub!.resume();
      this.vnavPathModeSub!.resume();
      this.maxVerticalArmedSlotsSub!.resume();

      this.isInnerHidden.set(false);
    } else {
      this.fmaData.pause();
      this.vnavPathMode.pause();

      this.fmaDataSub!.pause();
      this.vnavPathModeSub!.pause();
      this.maxVerticalArmedSlotsSub!.pause();

      this.clearDisplay();
    }
  }

  /**
   * Updates this status box from a specific set of data.
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
        const lastArmedStrings = this.getVerticalArmedStrings(
          lastData.verticalActive,
          lastData.verticalArmed,
          lastData.verticalApproachArmed,
          lastData.altitudeCaptureArmed,
          lastData.verticalAltitudeArmed,
          lastVNavPathMode,
          this.verticalArmedStringsCache
        );

        if (lastArmedStrings.includes(this.tempSlotActiveData.active)) {
          this.tempSlotActiveData.armedTransition = this.tempSlotActiveData.active;
        } else {
          this.tempSlotActiveData.armedTransition = undefined;
        }
      }

      this.tempSlotActiveData.failed = isVerticalModeFailed && lastData !== undefined
        ? this.getVerticalActiveString(lastData.verticalActive, lastData.verticalAltitudeArmed)
        : undefined;

      this.altitudeCaptureValue.set(data.altitudeCaptureValue);
      this.verticalSlotActiveData.set(this.tempSlotActiveData);
    }

    const lateralArmedString = this.getLateralArmedString(data.lateralArmed);
    this.lateralArmedHidden.set(lateralArmedString === '');
    this.lateralArmedText.set(lateralArmedString);

    const verticalArmedStrings = this.getVerticalArmedStrings(
      data.verticalActive,
      data.verticalArmed,
      data.verticalApproachArmed,
      data.altitudeCaptureArmed,
      data.verticalAltitudeArmed,
      vnavPathMode,
      this.verticalArmedStringsCache
    );
    ArrayUtils.shallowCopy(verticalArmedStrings, this.verticalArmedStrings);

    let verticalTargetType: VerticalModeTargetType;
    switch (data.verticalActive) {
      case APVerticalModes.ALT:
        verticalTargetType = VerticalModeTargetType.Altitude;
        break;
      case APVerticalModes.VS:
        verticalTargetType = VerticalModeTargetType.VerticalSpeed;
        break;
      case APVerticalModes.FLC:
        verticalTargetType = VerticalModeTargetType.Airspeed;
        break;
      default:
        verticalTargetType = VerticalModeTargetType.None;
    }

    this.resolveVerticalRightSlots(verticalTargetType, verticalArmedStrings, this.maxVerticalRightSlots.get());
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
        return 'GPS';
      case APLateralModes.ROLL:
        return 'ROL';
      case APLateralModes.LEVEL:
        return 'LVL';
      case APLateralModes.TO:
        return 'TO';
      case APLateralModes.GA:
        return 'GA';
      default:
        return '';
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
        return 'GPS';
      case APLateralModes.ROLL:
        return 'ROL';
      case APLateralModes.LEVEL:
        return 'LVL';
      case APLateralModes.BC:
        return 'BC';
      default:
        return '';
    }
  }

  /**
   * Gets the display text for an active autopilot vertical mode.
   * @param mode An active autopilot vertical mode.
   * @param altCapMode The altitude capture mode associated with the active vertical mode.
   * @returns The display text for the specified active autopilot vertical mode and altitude capture mode.
   */
  private getVerticalActiveString(mode: number, altCapMode: APAltitudeModes): string {
    switch (mode) {
      case APVerticalModes.VS:
        return 'VS';
      case APVerticalModes.FLC:
        return 'IAS';
      case APVerticalModes.ALT:
        return 'ALT';
      case APVerticalModes.GS:
        return 'GS';
      case APVerticalModes.PATH:
        return 'VNAV';
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
        return '';
    }
  }

  /**
   * Gets a list of armed autopilot vertical mode display texts for a given autopilot state.
   * @param activeMode The active autopilot vertical mode in the autopilot state for which to get the display texts.
   * @param armedMode The armed autopilot vertical mode in the autopilot state for which to get the display texts.
   * @param armedApproachMode The armed autopilot approach vertical mode in the autopilot state for which to get the
   * display texts.
   * @param altCapArmed Whether altitude capture is armed in the autopilot state for which to get the display texts.
   * @param altCapMode The altitude capture mode in the autopilot state for which to get the display texts.
   * @param vnavPathMode The VNAV path mode in the autopilot state for which to get the display texts.
   * @param out The array to which to write the results.
   * @returns An array containing a list of armed autopilot vertical mode display texts for the specified autopilot
   * state.
   */
  private getVerticalArmedStrings(
    activeMode: number,
    armedMode: number,
    armedApproachMode: number,
    altCapArmed: boolean,
    altCapMode: APAltitudeModes,
    vnavPathMode: VNavPathMode,
    out: string[]
  ): string[] {
    let armedApproachString: string | undefined = undefined;
    let armedString: string | undefined = undefined;
    let armedAltCapString: string | undefined = undefined;

    if (armedApproachMode === APVerticalModes.GS) {
      armedApproachString = 'GS';
    } else if (armedApproachMode === APVerticalModes.GP) {
      armedApproachString = 'GP';
    }

    if (armedMode === APVerticalModes.PATH && vnavPathMode === VNavPathMode.PathArmed) {
      armedString = 'VNAV';
    } else if (armedMode === APVerticalModes.FLC) {
      armedString = 'IAS';
    }

    if (altCapArmed || activeMode === APVerticalModes.PATH) {
      armedAltCapString = altCapMode === APAltitudeModes.ALTS ? 'ALTS' : altCapMode === APAltitudeModes.ALTV ? 'ALTV' : 'ALT';
    } else if (armedMode === APVerticalModes.ALT) {
      armedAltCapString = 'ALT';
    }

    let index = 0;
    if (armedApproachString) {
      out[index++] = armedApproachString;
    }
    if (armedString) {
      out[index++] = armedString;
    }
    if (armedAltCapString) {
      out[index++] = armedAltCapString;
    }
    out.length = index;

    return out;
  }

  /**
   * Resolves the state of this status box's vertical mode slots to the right of the active mode indication.
   * @param targetType The target type of the autopilot's current active vertical mode.
   * @param armedStrings An array of armed autopilot vertical mode display texts for the current autopilot state.
   * @param maxSlots The maximum number of available slots.
   */
  private resolveVerticalRightSlots(targetType: VerticalModeTargetType, armedStrings: readonly string[], maxSlots: number): void {
    const armedSlotsNeeded = armedStrings.length;

    let targetSlotsNeeded: 0 | 1 | 1.5;
    switch (targetType) {
      case VerticalModeTargetType.Altitude:
      case VerticalModeTargetType.VerticalSpeed:
        targetSlotsNeeded = 1.5;
        break;
      case VerticalModeTargetType.Airspeed:
        targetSlotsNeeded = 1;
        break;
      default:
        targetSlotsNeeded = 0;
    }

    this.verticalModeTargetSlots = targetSlotsNeeded;

    // If the target type has changed, then we will reset the timer so that any refreshes of the target indication are
    // not carried forward.
    if (targetType !== this.verticalModeTargetType) {
      this.verticalModeTargetHideDebounce.clear();
    }

    if (targetSlotsNeeded > 0) {
      if (targetSlotsNeeded + armedSlotsNeeded <= maxSlots) {
        // All desired indications can fit in the vertical mode section, so immediately fill the slots with all desired
        // indications. We will also make sure that the target indication is not hidden.
        this.needHideVerticalModeTarget = false;
        this.fillVerticalRightSlots(targetSlotsNeeded, armedStrings, maxSlots);
      } else {
        // Not all desired indications can fit in the vertical mode section. In this case, the target indication needs
        // to be hidden to unmask as many armed mode indications as possible. If the latest refresh of the target
        // indication has not expired (i.e. if the debounce timer is pending), then we will show the target indication
        // and let the timer hide the target indication once it expires. Otherwise, we will immediately hide the target
        // indication. Note that if we switched to a new target type, downstream code in setVerticalModeTargetType()
        // will trigger an immediate refresh of the target indication, which will lead to the desired behavior of
        // initially displaying the target indication when a new vertical mode is activated.
        this.needHideVerticalModeTarget = true;
        if (this.verticalModeTargetHideDebounce.isPending()) {
          this.fillVerticalRightSlots(targetSlotsNeeded, armedStrings, maxSlots);
        } else {
          this.fillVerticalRightSlots(0, armedStrings, maxSlots);
        }
      }
    } else {
      // There is no target indication to display. Therefore, we will immediately attempt to fill the slots with all
      // desired armed mode indications. We will also clear the timer that hides the target indication since the target
      // indication should always be hidden.
      this.verticalModeTargetHideDebounce.clear();
      this.needHideVerticalModeTarget = false;
      this.fillVerticalRightSlots(0, armedStrings, maxSlots);
    }

    this.setVerticalModeTargetType(targetType);
  }

  /**
   * Fills this status box's vertical mode slots to the right of the active mode indication.
   * @param targetSlots The number of slots taken up by the vertical mode target indication, or `0` if the target
   * indication should not be displayed.
   * @param armedStrings An array of armed autopilot vertical mode display texts to write to the slots.
   * @param maxSlots The maximum number of available slots.
   */
  private fillVerticalRightSlots(targetSlots: 0 | 1 | 1.5, armedStrings: readonly string[], maxSlots: number): void {
    const armedSlotsAvailable = maxSlots - targetSlots;
    const armedSlotOffset = targetSlots === 0
      ? 0
      : Number.isInteger(armedSlotsAvailable) ? 1 : Math.ceil(targetSlots);
    const visibleSlotCount = armedSlotOffset + Math.floor(armedSlotsAvailable);

    this.verticalModeTargetHidden.set(targetSlots === 0);

    for (let i = 0; i < this.verticalRightSlots.length; i++) {
      const slot = this.verticalRightSlots[i];
      if (i < visibleSlotCount) {
        slot.hidden.set(false);

        slot.largeSize.set(
          i === 0
          && (
            (armedSlotOffset === 1 && targetSlots === 1.5)
            || (maxSlots === 1.5 && (armedStrings.length > 0 || armedSlotOffset === 1))
          )
        );

        if (i < armedSlotOffset) {
          slot.armedHidden.set(true);
        } else {
          slot.armedHidden.set(false);
          slot.armedText.set(armedStrings[i - armedSlotOffset]);
        }
      } else {
        slot.hidden.set(true);
      }
    }
  }

  /**
   * Sets the target type of the current autopilot active vertical mode. Once a target type is set, this status box
   * will be automatically updated when the corresponding target value changes.
   * @param type The vertical mode target type to set.
   */
  private setVerticalModeTargetType(type: VerticalModeTargetType): void {
    if (type === this.verticalModeTargetType) {
      return;
    }

    switch (this.verticalModeTargetType) {
      case VerticalModeTargetType.Altitude:
        this.altitudeCaptureValueSub?.pause();
        break;
      case VerticalModeTargetType.VerticalSpeed:
        this.selectedVs.pause();
        this.selectedVsSub?.pause();
        break;
      case VerticalModeTargetType.Airspeed:
        this.isSelectedSpeedInMach.pause();
        this.isSelectedSpeedInMachSub?.pause();
        this.selectedIas.pause();
        this.selectedMach.pause();
        this.selectedIasSub?.pause();
        this.selectedMachSub?.pause();
    }

    this.verticalModeTargetType = type;

    switch (type) {
      case VerticalModeTargetType.Altitude:
        this.verticalModeTargetUnit.set('FT');
        this.altitudeCaptureValueSub?.resume(true);
        break;
      case VerticalModeTargetType.VerticalSpeed:
        this.verticalModeTargetUnit.set('FPM');
        this.selectedVs.resume();
        this.selectedVsSub?.resume(true);
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
   * Responds to when the autopilot's altitude capture target changes.
   * @param altitude The new altitude capture target, in feet.
   */
  private onAltitudeCaptureValueChanged(altitude: number): void {
    this.verticalModeTargetNumber.set(altitude.toFixed(0));
    this.refreshVerticalModeTargetVisibility();
  }

  /**
   * Responds to when the autopilot's selected vertical speed target changes.
   * @param vs The new selected vertical speed target, in feet per minute.
   */
  private onSelectedVsChanged(vs: number): void {
    const vsRounded = Math.round(vs);
    const prefix = vsRounded > 0 ? '↑' : vsRounded < 0 ? '↓' : '';
    this.verticalModeTargetNumber.set(`${prefix}${Math.abs(vsRounded)}`);
    this.refreshVerticalModeTargetVisibility();
  }

  /**
   * Responds to when the autopilot's selected indicated airspeed target changes.
   * @param ias The new selected indicated airspeed target, in knots.
   */
  private onSelectedIasChanged(ias: number): void {
    this.verticalModeTargetNumber.set(Math.min(ias, 999).toFixed(0));
    this.refreshVerticalModeTargetVisibility();
  }

  /**
   * Responds to when the autopilot's selected mach target changes.
   * @param mach The new selected mach target.
   */
  private onSelectedMachChanged(mach: number): void {
    this.verticalModeTargetNumber.set(`M${AfcsStatusBox.MACH_FORMATTER(mach)}`);
    this.refreshVerticalModeTargetVisibility();
  }

  /**
   * Refreshes the visibility of this status box's vertical mode target indication. This method will immediately make
   * the target indication visible if it is not already visible. After a five-second delay, the target indication will
   * be hidden if doing so is required to unmask a vertical armed mode indication.
   */
  private refreshVerticalModeTargetVisibility(): void {
    if (this.verticalModeTargetHidden.get()) {
      this.fillVerticalRightSlots(this.verticalModeTargetSlots, this.verticalArmedStrings, this.maxVerticalRightSlots.get());
    }

    this.verticalModeTargetHideDebounce.schedule(() => {
      if (this.needHideVerticalModeTarget) {
        this.fillVerticalRightSlots(0, this.verticalArmedStrings, this.maxVerticalRightSlots.get());
      }
    }, AfcsStatusBox.VERTICAL_MODE_TARGET_TRANSIENT_DURATION);
  }

  /**
   * Responds to when this status box is pressed.
   */
  private onPressed(): void {
    // Close AFCS controls view if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.AfcsControlsView)) {
      return;
    }

    this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.AfcsControlsView, true, { popupType: 'slideout-bottom-full' });
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <TouchButton
        ref={this.buttonRef}
        onPressed={this.onPressed.bind(this)}
        class='afcs-box pfd-touch-button'
      >
        <div
          class={{ 'afcs-box-inner': true, 'hidden': this.isInnerHidden }}
          style={{ '--afcs-box-inner-max-vertical-right-slots': this.maxVerticalRightSlotsStyle }}
        >
          <div class={`afcs-box-master${this.props.supportYawDamper ? ' afcs-box-master-double' : ''}`}>
            <FmaMasterSlot state={this.apSlotState} class='afcs-box-master-ap'>AP</FmaMasterSlot>
            {this.props.supportYawDamper && (
              <FmaMasterSlot state={this.ydSlotState} class='afcs-box-master-yd'>YD</FmaMasterSlot>
            )}
          </div>
          <div class='afcs-box-separator' />
          <div class='afcs-box-lateral'>
            <FmaModeSlot
              active={this.lateralSlotActiveData}
              class='afcs-box-lateral-active'
            />
            <div class={{ 'afcs-box-armed': true, 'afcs-box-lateral-armed': true, 'hidden': this.lateralArmedHidden }}>
              {this.lateralArmedText}
            </div>
          </div>
          <div class='afcs-box-separator' />
          <div class='afcs-box-vertical'>
            <div class='afcs-box-vertical-active-container'>
              <FmaModeSlot
                active={this.verticalSlotActiveData}
                class='afcs-box-vertical-active'
              />
            </div>
            {this.verticalRightSlots.map((slot, index) => {
              return (
                <div
                  class={{
                    'afcs-box-vertical-right-slot': true,
                    'afcs-box-vertical-right-slot-large': slot.largeSize,
                    'hidden': slot.hidden
                  }}
                >
                  <div class={{ 'afcs-box-armed': true, 'afcs-box-vertical-armed': true, 'hidden': slot.armedHidden }}>
                    {slot.armedText}
                  </div>
                  {index === 0 && (
                    <div class={{ 'afcs-box-vertical-target': true, 'hidden': this.verticalModeTargetHidden }}>
                      <span class='afcs-box-vertical-target-number'>{this.verticalModeTargetNumber}</span>
                      <span class='afcs-box-vertical-target-unit'>{this.verticalModeTargetUnit}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </TouchButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.verticalModeTargetHideDebounce.clear();

    this.buttonRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
