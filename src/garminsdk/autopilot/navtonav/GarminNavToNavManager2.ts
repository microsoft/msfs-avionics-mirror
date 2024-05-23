import {
  APLateralModes, APValues, APVerticalModes, Accessible, CdiControlEvents, CdiEvents, CdiUtils, ConsumerValue,
  EventBus, MathUtils, NavRadioIndex, NavSourceId, NavSourceType, NavToNavManager2, SimVarValueType
} from '@microsoft/msfs-sdk';

/**
 * Guidance data for {@link GarminNavToNavManager2}.
 */
export interface GarminNavToNavManager2Guidance {
  /** The ID of the CDI for which a CDI switch should be commanded. */
  readonly cdiId: Accessible<string>;

  /**
   * The index of the NAV radio that can be armed for a CDI source switch, or `-1` if a CDI source switch cannot be
   * armed.
   */
  readonly armableNavRadioIndex: Accessible<NavRadioIndex | -1>;

  /**
   * The autopilot lateral mode that can be armed prior to a CDI source switch, or `APLateralModes.NONE` if no modes
   * can be armed.
   */
  readonly armableLateralMode: Accessible<APLateralModes>;

  /**
   * The autopilot vertical mode that can be armed prior to a CDI source switch, or `APVerticalModes.NONE` if no modes
   * can be armed.
   */
  readonly armableVerticalMode: Accessible<APVerticalModes>;

  /** Whether a CDI source switch is allowed at the current time. */
  readonly canSwitchCdi: Accessible<boolean>;

  /** Whether an external entity is currently in the process of switching the autopilot's CDI source. */
  readonly isExternalCdiSwitchInProgress: Accessible<boolean>;
}

/**
 * Configuration options for {@link GarminNavToNavManager2}.
 */
export type GarminNavToNavManager2Options = {
  /**
   * A function that checks whether an armed autopilot lateral mode can be activated as part of a CDI source switch.
   * @param navRadioIndex The index of the NAV radio that is armed for a potential CDI source switch.
   * @param armedLateralMode The armed autopilot lateral mode.
   * @returns Whether the specified armed autopilot lateral mode can be activated as part of a CDI source switch.
   */
  canArmedModeActivate?: (navRadioIndex: NavRadioIndex, armedLateralMode: APLateralModes) => boolean;
};

/**
 * An implementation of `NavToNavManager2` that uses guidance data generated from an outside source to determine when
 * CDI source switching can be armed and triggered.
 */
export class GarminNavToNavManager2 implements NavToNavManager2 {
  /** @inheritDoc */
  public readonly isNavToNavManager2 = true;

  public onTransferred?: ((activateLateralMode: APLateralModes, activateVerticalMode: APVerticalModes) => void) | undefined;

  private readonly cdiSource = ConsumerValue.create<Readonly<NavSourceId> | undefined>(null, undefined);

  private readonly canArmedModeActivate: (navRadioIndex: NavRadioIndex, armedLateralMode: APLateralModes) => boolean;

  private isNavToNavInProgress = false;
  private navToNavInProgressCdiId: string | undefined = undefined;
  private navToNavInProgressLateralMode = APLateralModes.NONE;

  /**
   * Creates a new instance of GarminNavToNavManager2.
   * @param bus The event bus.
   * @param apValues Autopilot values from this manager's parent autopilot.
   * @param guidance The guidance data used by this manager.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
    private readonly guidance: GarminNavToNavManager2Guidance,
    options?: Readonly<GarminNavToNavManager2Options>
  ) {
    this.cdiSource.setConsumer(bus.getSubscriber<CdiEvents>().on(`cdi_select${CdiUtils.getEventBusTopicSuffix(apValues.cdiId)}`));

    this.canArmedModeActivate = options?.canArmedModeActivate ?? GarminNavToNavManager2.defaultCanArmedModeActivate;
  }

  /** @inheritDoc */
  public getArmableNavRadioIndex(): NavRadioIndex | -1 {
    return this.guidance.armableNavRadioIndex.get();
  }

  /** @inheritDoc */
  public getArmableLateralMode(): APLateralModes {
    return this.guidance.armableLateralMode.get();
  }

  /** @inheritDoc */
  public getArmableVerticalMode(): APVerticalModes {
    return this.guidance.armableVerticalMode.get();
  }

  /** @inheritDoc */
  public isTransferInProgress(): boolean {
    return this.isNavToNavInProgress || this.guidance.isExternalCdiSwitchInProgress.get();
  }

  /** @inheritDoc */
  public onBeforeUpdate(): void {
    // noop
  }

  /** @inheritDoc */
  public onAfterUpdate(): void {
    const isExternalSwitchInProgress = this.guidance.isExternalCdiSwitchInProgress.get();

    if (this.isNavToNavInProgress) {
      if (isExternalSwitchInProgress) {
        this.cancelNavToNav();
      } else {
        this.updateInProgress();
      }
    } else {
      if (!isExternalSwitchInProgress) {
        this.updateDefault();
      }
    }
  }

  /**
   * Updates this manager in the default state while a CDI source switch is not in progress.
   */
  private updateDefault(): void {
    const armableNavRadioIndex = this.guidance.armableNavRadioIndex.get();
    const armableLateralMode = this.guidance.armableLateralMode.get();

    const isArmed
      = armableNavRadioIndex !== -1
      && armableLateralMode !== APLateralModes.NONE
      && this.cdiSource.get()?.type === NavSourceType.Gps
      && this.apValues.lateralActive.get() !== armableLateralMode
      && this.apValues.lateralArmed.get() === armableLateralMode;

    if (isArmed && this.guidance.canSwitchCdi.get() && this.canArmedModeActivate(armableNavRadioIndex, armableLateralMode)) {
      this.startNavToNav(this.guidance.cdiId.get(), armableNavRadioIndex, armableLateralMode);
    }
  }

  /**
   * Updates this manager while a CDI source switch is in progress.
   */
  private updateInProgress(): void {
    const cdiId = this.guidance.cdiId.get();

    if (cdiId !== this.navToNavInProgressCdiId) {
      this.cancelNavToNav();
    } else {
      if (this.cdiSource.get()?.type === NavSourceType.Nav) {
        this.completeNavToNav();
      }
    }
  }

  /**
   * Starts a CDI source switch.
   * @param cdiId The ID of the CDI for which to command the switch.
   * @param navRadioIndex The index of the NAV radio to which to switch the CDI.
   * @param armedLateralMode The armed autopilot lateral mode to activate as part of the switch.
   */
  private startNavToNav(cdiId: string, navRadioIndex: NavRadioIndex, armedLateralMode: APLateralModes): void {
    this.isNavToNavInProgress = true;
    this.navToNavInProgressCdiId = cdiId;
    this.navToNavInProgressLateralMode = armedLateralMode;

    this.bus.getPublisher<CdiControlEvents>().pub(
      `cdi_src_set${CdiUtils.getEventBusTopicSuffix(cdiId)}`,
      { type: NavSourceType.Nav, index: navRadioIndex },
      true,
      false
    );
  }

  /**
   * Cancels a CDI source switch.
   */
  private cancelNavToNav(): void {
    this.isNavToNavInProgress = false;
    this.navToNavInProgressCdiId = undefined;
    this.navToNavInProgressLateralMode = APLateralModes.NONE;
  }

  /**
   * Completes a CDI source switch.
   */
  private completeNavToNav(): void {
    const lateralMode = this.navToNavInProgressLateralMode;

    this.isNavToNavInProgress = false;
    this.navToNavInProgressCdiId = undefined;
    this.navToNavInProgressLateralMode = APLateralModes.NONE;

    this.onTransferred && this.onTransferred(lateralMode, APVerticalModes.NONE);
  }

  /**
   * Checks whether an armed autopilot lateral mode can be activated as part of a CDI source switch using criteria that
   * reproduce the default localizer capture criteria for the autopilot's LOC director.
   * @param navRadioIndex The index of the NAV radio that is armed for a potential CDI source switch.
   * @param armedLateralMode The armed autopilot lateral mode.
   * @returns Whether the specified armed autopilot lateral mode can be activated as part of a CDI source switch using
   * criteria that reproduce the default localizer capture criteria for the autopilot's LOC director.
   */
  private static defaultCanArmedModeActivate(navRadioIndex: NavRadioIndex, armedLateralMode: APLateralModes): boolean {
    if (armedLateralMode === APLateralModes.LOC) {
      const hasSignal = SimVar.GetSimVarValue(`NAV SIGNAL:${navRadioIndex}`, SimVarValueType.Number) > 0;
      if (hasSignal) {
        const isLocalizer = SimVar.GetSimVarValue(`NAV HAS LOCALIZER:${navRadioIndex}`, SimVarValueType.Bool) !== 0;
        if (isLocalizer) {
          const deviation = SimVar.GetSimVarValue(`NAV CDI:${navRadioIndex}`, SimVarValueType.Number);
          if (Math.abs(deviation) < 127) {
            const localizerCourse = SimVar.GetSimVarValue(`NAV LOCALIZER:${navRadioIndex}`, SimVarValueType.Degree);
            const planeHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', SimVarValueType.Degree);
            return MathUtils.diffAngleDeg(localizerCourse, planeHeading, false) < 110;
          }
        }
      }
    }

    return false;
  }
}
