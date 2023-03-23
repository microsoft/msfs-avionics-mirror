/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  AhrsEvents, APLateralModes, APValues, ControlEvents, EventBus, NavEvents, NavMath, NavProcSimVars, NavSourceId, NavSourceType,
  NavToNavManager,
  Subject
} from '@microsoft/msfs-sdk';
import { WT21FmsUtils } from '../../Shared/FlightPlan/WT21FmsUtils';

import { FMS_MESSAGE_ID } from '../../Shared/MessageSystem/MessageDefinitions';
import { MessageService } from '../../Shared/MessageSystem/MessageService';
import { WT21GhostNeedleControlEvents } from '../../Shared/Navigation/WT21NavIndicators';
import { FgpUserSettings, VorTuningMode } from '../../Shared/Profiles/FgpUserSettings';
import { WT21ControlEvents } from '../../Shared/WT21ControlEvents';
import { CDIScaleLabel, WT21LNavDataEvents } from './WT21LNavDataEvents';

/** NavToNav manager using the state pattern */
export class WT21NavToNavManager implements NavToNavManager {
  public onTransferred = (): void => { };
  private currentState: NavToNavState;
  private approachFrequency = Subject.create<number | null>(null);
  private scalingLabel?: CDIScaleLabel;
  private localizerCourse = 0;
  private nav1LateralDeviation = 0;
  private activeNavSourceType?: NavSourceType;
  private currentHeading = 0;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    public readonly apValues: APValues,
    public readonly messageService: MessageService,
  ) {
    this.currentState = new NavToNavOff(this, bus);
    this.currentState.enter();
    this.approachFrequency.sub(() => {
      this.currentState.onApproachFrequencyChange();
    });
    this.bus.getSubscriber<WT21ControlEvents>().on('approach_details_set').handle(x => {
      if (WT21FmsUtils.isLocalizerApproach(x.approachType)) {
        this.approachFrequency.set(x.referenceFacility?.freqMHz ?? null);
      } else {
        this.approachFrequency.set(null);
      }
    });
    this.bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_cdi_scale_label').whenChanged().handle(x => {
      this.scalingLabel = x;
      this.currentState.onScalingLabelChange();
    });
    this.bus.getSubscriber<NavProcSimVars>().on('nav_localizer_crs_1').whenChanged().handle(x => {
      this.localizerCourse = x ? x * Avionics.Utils.RAD2DEG : x;
      this.currentState.onLocalizerCourseChange();
    });
    this.bus.getSubscriber<NavProcSimVars>().on('nav_cdi_1').whenChanged().handle(x => {
      this.nav1LateralDeviation = x;
      this.currentState.onLateralDeviationChange();
    });
    this.bus.getSubscriber<NavEvents>().on('cdi_select').handle(x => {
      this.activeNavSourceType = x.type ? x.type : undefined;
      this.currentState.onActiveSourceChange();
    });
    this.bus.getSubscriber<AhrsEvents>().on('hdg_deg').withPrecision(0).handle(x => {
      this.currentHeading = x;
      this.currentState.onCurrentHeadingChange();
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public getApproachFrequency(): number | null {
    return this.approachFrequency.get();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public getScalingLabel(): CDIScaleLabel | undefined {
    return this.scalingLabel;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public getLocalizerCourse(): number {
    return this.localizerCourse;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public getNav1LateralDeviation(): number {
    return this.nav1LateralDeviation;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public getActiveNavSourceType(): NavSourceType | undefined {
    return this.activeNavSourceType;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public getCurrentHeading(): number {
    return this.currentHeading;
  }

  /** Changes to next state. Meant to be called by the state instances themselves.
   * @param newState newState */
  public changeState(newState: NavToNavState): void {
    this.currentState.exit();
    this.currentState = newState;
    this.currentState.enter();
  }

  /** @inheritdoc */
  public readonly canLocArm = (): boolean => {
    return this.currentState.canLocArm();
  };

  /** @inheritdoc */
  public readonly canLocActivate = (): boolean => {
    return this.currentState.canLocArm();
  };
}

/** A NavToNav state in the state pattern. */
abstract class NavToNavState {
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    protected readonly navToNav: WT21NavToNavManager,
    protected readonly bus: EventBus
  ) { }

  /** Is called when it becomes the current state */
  public enter(): void { }
  /** Is called just before moving to a new state */
  public exit(): void { }

  /** Used by autopilot to determine if LOC can arm.
   * Needs to keep returning true if you want LOC to stay activated.
   * @returns Whether LOC can arm */
  public readonly canLocArm = (): boolean => { return false; };

  /** Used by autopilot to determine if LOC can activate.
   * Not actually used by anything at the moment, but it's here just in case.
   * @returns Whether LOC can activate */
  public readonly canLocActivate = (): boolean => { return false; };

  public onApproachFrequencyChange = (): void => { };
  public onScalingLabelChange = (): void => { };
  public onLocalizerCourseChange = (): void => { };
  public onLateralDeviationChange = (): void => { };
  public onActiveSourceChange = (): void => { };
  public onCurrentHeadingChange = (): void => { };

  protected deactivateIfFmsIsNotActiveSource = (): void => {
    if (this.navToNav.getActiveNavSourceType() !== NavSourceType.Gps) {
      this.navToNav.changeState(new NavToNavOff(this.navToNav, this.bus));
    }
  };
}

/** NavToNav is OFF and waiting to turn on once in terminal area with localizer approach in flight plan. */
class NavToNavOff extends NavToNavState {
  /** @inheritdoc */
  public enter(): void {
    this.onApproachFrequencyChange = this.tryGoToNextState;
    this.onScalingLabelChange = this.tryGoToNextState;
    this.onActiveSourceChange = this.tryGoToNextState;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly tryGoToNextState = (): void => {
    const isTerminalArrival = this.navToNav.getScalingLabel() === CDIScaleLabel.TerminalArrival;
    const hasApproachFrequency = !!this.navToNav.getApproachFrequency();
    const isFmsActiveSource = this.navToNav.getActiveNavSourceType() === NavSourceType.Gps;
    // When to move to next state?
    // 1. within 31 NM of runway (TERMINAL area/scaling)
    // 2. approach freq is available (this means that an localizer approach is in the flight plan)
    if (isTerminalArrival && hasApproachFrequency && isFmsActiveSource) {
      this.navToNav.changeState(new NavToNavTunePending(this.navToNav, this.bus));
    }
  };
}

/** Tunes the nav radios to the localizer. */
class NavToNavTunePending extends NavToNavState {
  private locWillBeTunedTimeout?: number;

  /** @inheritdoc */
  public enter(): void {
    this.onActiveSourceChange = this.deactivateIfFmsIsNotActiveSource;

    // TODO Check if AUTO
    const isAutoTuning = false;

    // If radios are AUTO, tune them and move to next state,
    // otherwise show LOC_WILL_BE_TUNED message for 30 seconds first
    if (isAutoTuning) {
      this.navToNav.changeState(new NavToNavArmed(this.navToNav, this.bus));
    } else {
      this.navToNav.messageService.post(FMS_MESSAGE_ID.LOC_WILL_BE_TUNED);
      this.locWillBeTunedTimeout = window.setTimeout(() => {
        this.navToNav.changeState(new NavToNavArmed(this.navToNav, this.bus));
      }, 30_000);
    }
  }

  /** @inheritdoc */
  public exit(): void {
    SimVar.SetSimVarValue('K:NAV1_STBY_SET_HZ', 'Hz', this.navToNav.getApproachFrequency()! * 1000000);
    SimVar.SetSimVarValue('K:NAV1_RADIO_SWAP', 'Bool', 1);
    SimVar.SetSimVarValue('K:NAV2_STBY_SET_HZ', 'Hz', this.navToNav.getApproachFrequency()! * 1000000);
    SimVar.SetSimVarValue('K:NAV2_RADIO_SWAP', 'Bool', 1);

    // HINT: This is not exactly as IRL, but it's close enough for now.
    // IRL, the radios are tuned to the localizer frequency, but the VOR tuning mode is still set to AUTO.
    // In fact when in AUTO the whole LOC_WILL_BE_TUNED message is not shown.
    const fgpSettings = FgpUserSettings.getManager(this.bus);
    fgpSettings.getSetting('nav1VorTuningMode').set(VorTuningMode.Manual);
    fgpSettings.getSetting('nav2VorTuningMode').set(VorTuningMode.Manual);

    this.navToNav.messageService.clear(FMS_MESSAGE_ID.LOC_WILL_BE_TUNED);

    if (this.locWillBeTunedTimeout !== undefined) {
      window.clearTimeout(this.locWillBeTunedTimeout);
    }
  }
}

/** Ghost needle is displayed. */
class NavToNavArmed extends NavToNavState {
  /** When NavToNav is armed, we show the ghost indicators on the PFD.
   * (ghost needle on HSI, lateral dev and vertical dev on upper PFD). */
  public enter(): void {
    this.onActiveSourceChange = this.deactivateIfFmsIsNotActiveSource;
    this.setCourseToLocalizerCourse();
    this.setGhostIndicatorsArmed(true);

    this.onLocalizerCourseChange = this.tryGoToNextState;
    this.onCurrentHeadingChange = this.tryGoToNextState;
    this.onLateralDeviationChange = this.tryGoToNextState;
    this.navToNav.apValues.lateralArmed.sub(this.tryGoToNextState);
  }

  /** @inheritdoc */
  public exit(): void {
    // Hide ghost indicators, they are only ever visible in this state
    this.setGhostIndicatorsArmed(false);
    this.navToNav.apValues.lateralArmed.unsub(this.tryGoToNextState);
  }

  /** In the Armed state, LOC can be armed, because we know that a NAV radio is tuned to a localizer.
   * @returns boolean */
  public readonly canLocArm = (): boolean => { return true; };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setCourseToLocalizerCourse(): void {
    const course = this.navToNav.getLocalizerCourse();
    SimVar.SetSimVarValue('K:VOR1_SET', 'number', Math.round(course));
    SimVar.SetSimVarValue('K:VOR2_SET', 'number', Math.round(course));
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setGhostIndicatorsArmed(isArmed: boolean): void {
    this.bus.getPublisher<WT21GhostNeedleControlEvents>()
      .pub('nav_ind_ghostNeedle_set_isArmed', isArmed, true);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly tryGoToNextState = (): void => {
    const cdiDeviation = this.navToNav.getNav1LateralDeviation();
    const localizerCourse = this.navToNav.getLocalizerCourse();
    const currentHeading = this.navToNav.getCurrentHeading();

    // This basically checks that the APPR button has been pressed
    if (this.navToNav.apValues.lateralArmed.get() !== APLateralModes.LOC) {
      return;
    }

    let isDeviationGood = false;

    // This makes sure that the plane is generally pointed in the right direction to capture the LOC
    if (Math.abs(cdiDeviation) < 127 && localizerCourse) {
      const headingDiff = NavMath.diffAngle(currentHeading, localizerCourse);
      if (cdiDeviation > 0 && cdiDeviation < 65 && headingDiff < 0 && headingDiff > -90) {
        isDeviationGood = true;
      } else if (cdiDeviation < 0 && cdiDeviation > -65 && headingDiff > 0 && headingDiff < 90) {
        isDeviationGood = true;
      } else if (Math.abs(cdiDeviation) < 35 && Math.abs(headingDiff) < 20) {
        isDeviationGood = true;
      }
    }

    if (isDeviationGood) {
      this.navToNav.changeState(new NavToNavTransferred(this.navToNav, this.bus));
    }
  };
}

/** We are switching the active nav source to be the localizer. */
class NavToNavTransferred extends NavToNavState {
  private cdiSelectConsumer?= this.bus.getSubscriber<NavEvents>().on('cdi_select');
  private readonly navSourceToTransferTo: NavSourceId = {
    index: 1,
    type: NavSourceType.Nav,
  };

  /** @inheritdoc */
  public enter(): void {
    // Setup a handler to reset nav to nav if approach freq changes
    this.onApproachFrequencyChange = (): void => this.navToNav.changeState(new NavToNavOff(this.navToNav, this.bus));

    // Setup handler to handle cdi_select event which will confirm
    // that the active nav source has been switched over.
    // We need to wait for cdi_select before calling onTransferred,
    // because switching the nav source disables any autopilot modes.
    this.cdiSelectConsumer!.handle(this.handleCdiSelect);

    // Send the event to change the active source, then wait for cdi_select event to come in
    this.setNav1AsActiveSource();
  }

  /** @inheritdoc */
  public exit(): void {
    if (this.cdiSelectConsumer) {
      this.cdiSelectConsumer.off(this.handleCdiSelect);
    }
  }

  private readonly handleCdiSelect = (newSource: NavSourceId): void => {
    if (newSource.index === this.navSourceToTransferTo.index && newSource.type === this.navSourceToTransferTo.type) {
      // We can safely transfer now that we know that the nav source has changed
      this.navToNav.onTransferred();
      if (this.cdiSelectConsumer !== undefined) {
        this.cdiSelectConsumer.off(this.handleCdiSelect);
        delete this.cdiSelectConsumer;
      }
    }
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setNav1AsActiveSource(): void {
    this.bus.getPublisher<ControlEvents>().pub('cdi_src_set', this.navSourceToTransferTo, true);
  }

  /** @inheritdoc */
  public canLocArm = (): boolean => { return true; };

  /** @inheritdoc */
  public canLocActivate = (): boolean => { return true; };
}
