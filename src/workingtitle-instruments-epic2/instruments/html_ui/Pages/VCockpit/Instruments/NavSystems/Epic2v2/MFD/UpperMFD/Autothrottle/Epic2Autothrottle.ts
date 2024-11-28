import {
  AdcEvents, APEvents, APVerticalModes, AutothrottleOptions, AutothrottleTargetMode, AutothrottleThrottleIndex, CasAlertTransporter, CasEvents,
  CasRegistrationManager, ClockEvents, ConsumerSubject, ConsumerValue, ControlSurfacesEvents, DebounceTimer, ElectricalEvents, EngineEvents, EventBus, HEvent,
  JetAutothrottle, KeyEventManager, KeyEvents, Lookahead, MappedSubject, MathUtils, ObjectSubject, SimVarValueType, Subject, Subscription,
  TurbopropAutothrottle, VirtualThrottleLeverEvents
} from '@microsoft/msfs-sdk';

import {
  AirGroundDataProvider, AirspeedDataProvider, AltitudeDataProvider, AutopilotDataProvider, AutothrottleConfig, Epic2ApVerticalMode, Epic2AutothrottleEvents,
  Epic2AutothrottleFmaData, Epic2AutothrottleModes, Epic2AutothrottleStatus, Epic2EngineType, Epic2Fadec, Epic2FadecModes, FlapWarningDataProvider,
  RadioAltimeterDataProvider
} from '@microsoft/msfs-epic2-shared';

// FIXME implement Epic2 logic and thrust director.

enum AtPhaseOfFlight {
  TakeoffClimbout,
  Cruise,
  Approach,
}

// TODO implement thrust director (need separate AbstractAutothrottle with fake thrust lever manager?)

/**
 * A Epic2 autothrottle system.
 */
export class Epic2Autothrottle {
  private static readonly UPDATE_FREQ = 60; // hertz
  private static readonly DEACTIVATE_WARNING_TIME = 10000; // ms

  private static iasOnSpeedCount = 0;
  private static isOnSpeed = false;
  private static lastIasUpdateTimestamp = 0;

  // TODO make configurable from panel.xml
  private static readonly OPTIONS: AutothrottleOptions = {
    useIndicatedMach: true,
    servoSpeed: 0.2,
    speedSmoothingConstant: 4 / Math.LN2,
    speedSmoothingVelocityConstant: 4 / Math.LN2,
    speedLookahead: 2,
    selectedSpeedAccelTarget: (iasError, targetIas, effectiveIas, effectiveAccel, accelCorrection) => {
      const sign = iasError < 0 ? -1 : 1;
      return sign * MathUtils.lerp(iasError * sign, 0.5, 20, 0, 2, true, true) + accelCorrection;
    },
    overspeedAccelTarget: (iasError, targetIas, effectiveIas, effectiveAccel, accelCorrection) => {
      if (iasError < 0) {
        return MathUtils.lerp(iasError, 0, -5, 0, -4, true, true) + accelCorrection;
      } else {
        return MathUtils.lerp(iasError, 2, 40, 0, 4, true, true) + accelCorrection;
      }
    },
    underspeedAccelTarget: (iasError, targetIas, effectiveIas, effectiveAccel, accelCorrection) => {
      if (iasError > 0) {
        return MathUtils.lerp(iasError, 0, 5, 0, 4, true, true) + accelCorrection;
      } else {
        return MathUtils.lerp(iasError, -2, -40, 0, -4, true, true) + accelCorrection;
      }
    },
    accelSmoothingConstant: 0.5 / Math.LN2,
    accelTargetSmoothingConstant: 0.5 / Math.LN2,
    selectedSpeedPowerCorrectionTransformer: (correction, iasError) => {
      return MathUtils.lerp(Math.abs(iasError), 0.5, 2, 0.25, 1, true, true) * correction;
    },
    overspeedPowerCorrectionTransformer: (correction, iasError) => {
      if (iasError < 0) {
        return MathUtils.lerp(iasError, 0, -0.5, 0.25, 1, true, true) * correction;
      } else {
        return MathUtils.lerp(iasError, 0.5, 2, 0.25, 1, true, true) * correction;
      }
    },
    underspeedPowerCorrectionTransformer: (correction, iasError) => {
      if (iasError > 0) {
        return MathUtils.lerp(iasError, 0, 0.5, 0.25, 1, true, true) * correction;
      } else {
        return MathUtils.lerp(iasError, -0.5, -2, 0.25, 1, true, true) * correction;
      }
    },
    powerTargetSmoothingConstant: 1 / Math.LN2,
    powerSmoothingConstant: 1 / Math.LN2,
    powerLookahead: 0,
    throttleSpeedSmoothingConstant: 0.5 / Math.LN2,
    hysteresis: 0.005,
    speedTargetPid: {
      kP: 5,
      kI: 0,
      kD: 15,
      maxOut: 50,
      minOut: -50
    },
    powerTargetPid: {
      kP: 0.01,
      kI: 0,
      kD: 0.015,
      maxOut: 0.2,
      minOut: -0.2
    },
    speedTargetChangeThreshold: 5,
    overspeedChangeThreshold: 5,
    underspeedChangeThreshold: 5
  };

  // TODO re-enable when FADEC implemented
  /** FADEC modes that prevent autothrottle arming and activation. */
  private static readonly UNSUPPORTED_FADEC_MODES = [
    // Epic2FadecModes.STOP,
    // Epic2FadecModes.START,
    // Epic2FadecModes.UNDEF,
  ] as string[];

  /** The minimum throttle lever position required to activate HOLD mode from an armed state. */
  private static readonly THROTTLE_LEVER_ACTIVATE_THRESHOLD = 0.5;

  /** The minimum throttle lever change required to activate the levers in HOLD mode. */
  private static readonly HOLD_THROTTLE_LEVER_ACTIVATION_THRESHOLD = 0.02;
  private static readonly HOLD_THRESHOLD_ALTITUDE = 400; // feet AGL

  /** Offset of overspeed protection limit from Vmo (or configuration speed limit), in knots. */
  private static readonly OVERSPEED_PROTECTION_OFFSET_IAS = 0;
  /** Offset of overspeed protection limit from Mmo. */
  private static readonly OVERSPEED_PROTECTION_OFFSET_MACH = 0.0;

  /** Offset of overspeed protection mode (MAX SPD) target from Vmo (or configuration speed limit), in knots. */
  private static readonly OVERSPEED_PROTECTION_MODE_TARGET_OFFSET_IAS = -10;
  /** Offset of overspeed protection mode (MAX SPD) target from Mmo. */
  private static readonly OVERSPEED_PROTECTION_MODE_TARGET_OFFSET_MACH = -0.03;

  /** The hysteresis applied to the underspeed protection mode IAS limit, in knots, once underspeed protection mode (MIN SPD) is active. */
  private static readonly UNDERSPEED_PROTECTION_IAS_HYSTERESIS = 5;

  /** Offset of underspeed protection mode (MIN SPD) target from the angle of attack limit, in knots. */
  private static readonly UNDERSPEED_PROTECTION_MODE_TARGET_OFFSET_IAS = 15;

  private static readonly UNDERSPEED_PROT_DISABLED_MODES = [Epic2AutothrottleModes.TO, Epic2AutothrottleModes.CLIMB];

  private static readonly ENVELOPE_SPEED_PROTECTION_LOOKAHEAD = 5000; // milliseconds
  private static readonly ENVELOPE_SPEED_PROTECTION_INPUT_TAU = 2000; // milliseconds
  private static readonly ENVELOPE_SPEED_PROTECTION_TREND_TAU = 1000; // milliseconds

  private static readonly ENVELOPE_SPEED_PROTECTION_HYSTERESIS_TIME = 5000; // milliseconds

  /**
   * The decay time constant for cumulative throttle lever position displacement used to determine if the autothrottle
   * should be disconnected due to user force override.
   */
  private static readonly FORCE_DC_DISPLACEMENT_DECAY_TAU = 500 / Math.LN2;

  /** The throttle lever position displacement credit to assign to increase/decrease throttle key events. */
  private static readonly FORCE_DC_INC_DEC_DISPLACEMENT = 0.02;

  /** The amount of cumulative throttle lever position displacement required to disconnect the autothrottle. */
  private static readonly FORCE_DC_DISPLACEMENT_THRESHOLD = 0.2;

  private static readonly STATUS_SIMVAR_ENUM_MAP = {
    [Epic2AutothrottleStatus.Off]: 0,
    [Epic2AutothrottleStatus.Disconnected]: 1,
    [Epic2AutothrottleStatus.Armed]: 2,
    [Epic2AutothrottleStatus.On]: 3
  };

  private readonly autothrottle: Epic2JetAutothrottle | Epic2TurbopropAutothrottle;

  private readonly publisher = this.bus.getPublisher<Epic2AutothrottleEvents & CasEvents>();

  private readonly casManager = new CasRegistrationManager(this.bus);
  private readonly casAlertTransporters: CasAlertTransporter[] = [];

  private keyEventManager?: KeyEventManager;

  private isPowered = false;
  private isAvionicsPowered = false;
  private readonly electricLogic = this.config.electricLogic;

  private readonly status = Subject.create(Epic2AutothrottleStatus.Off);
  private readonly activeMode = Subject.create(Epic2AutothrottleModes.NONE);

  private readonly isAtCommandActive = Subject.create(false);
  private readonly servosActiveCommand = MappedSubject.create(
    ([atActive, atStatus]) => atActive && atStatus === Epic2AutothrottleStatus.On,
    this.isAtCommandActive,
    this.status,
  );

  private readonly engineIndices = Array.from({ length: this.fadec.numberOfEngines }).map((_, i) => i + 1 as AutothrottleThrottleIndex);
  private readonly canServoActivate = this.engineIndices.map(() => Subject.create(false));
  private readonly servoActive = this.engineIndices.map(
    (_, i) => MappedSubject.create(([command, canActivate]) => command && canActivate, this.servosActiveCommand, this.canServoActivate[i])
  );

  private autoGroundDisengagePrimedDuration = 0;

  private readonly simTime = ConsumerValue.create(null, 0);
  private lastUpdateSimTime?: number;

  private readonly isOnGround = this.airGroundDataProvider.isOnGround;
  private readonly radioAlt = this.radioAltDataProvider.radioAltitude;
  private readonly flapPos = this.flapWarningDataProvider.highestFlapAngle;

  private readonly indicatedAlt = this.altDataProvider.altitude;
  private readonly selectedAlt = this.apDataProvider.selectedAltitude;

  private readonly cas = this.airspeedDataProvider.cas;
  private readonly mach = this.airspeedDataProvider.mach;

  private readonly isAltCapActive = this.apDataProvider.rawVerticalActive.map((v) => v === APVerticalModes.CAP);
  private readonly isFlcActive = this.apDataProvider.verticalActive.map((v) =>
    v === Epic2ApVerticalMode.FlightLevelChange || v === Epic2ApVerticalMode.VnavFlightLevelChange
    || v === Epic2ApVerticalMode.Speed || v === Epic2ApVerticalMode.VnavSpeed
  );
  private readonly isToGaActive = this.apDataProvider.verticalActive.map((v) => v === Epic2ApVerticalMode.GoAround);

  private readonly targetCas = this.apDataProvider.targetCas;
  private readonly targetMach = this.apDataProvider.targetMach;
  private readonly targetSpeedIsMach = this.apDataProvider.targetSpeedIsMach;

  private readonly engines = this.engineIndices.map((engineIndex, i) => ({
    index: engineIndex,
    fadecMode: ConsumerSubject.create<string>(null, Epic2FadecModes.STOP),
    fadecClbN1: ConsumerValue.create(null, 0),
    engineN1: ConsumerValue.create(null, 0),
    throttleLeverPosition: ConsumerValue.create(null, 0),
    canServoActivate: this.canServoActivate[i],
    servoActive: this.servoActive[i],
    forceDisconnectData: {
      servoActive: this.servoActive[i],
      lastInputTime: undefined as number | undefined,
      lastSetInputPos: undefined as number | undefined,
      cumulativeDisplacement: 0
    },
    holdData: {
      firstManualInput: undefined as number | undefined,
      leversActive: true,
    },
  }));

  private readonly minimumIas = this.config.speedProtectionAvailable ? this.airspeedDataProvider.cautionSpeed : Subject.create(0);
  private readonly maximumIas = this.airspeedDataProvider.maxSpeed;

  private readonly minimumIasOffset = Subject.create(0);
  private readonly maximumIasOffset = Subject.create(Epic2Autothrottle.OVERSPEED_PROTECTION_OFFSET_IAS);
  private readonly maximumMachOffset = Subject.create(Epic2Autothrottle.OVERSPEED_PROTECTION_OFFSET_MACH);

  private readonly canOverspeedProtActivate = MappedSubject.create(
    ([maxIas, activeMode, onGround]) => this.config.speedProtectionAvailable && maxIas !== null && activeMode !== Epic2AutothrottleModes.DESC && !onGround,
    this.maximumIas,
    this.activeMode,
    this.isOnGround
  );

  private readonly underspeedProtActiveCommand = Subject.create(false);
  private readonly canUnderspeedProtActivate = MappedSubject.create(
    ([minIas, activeMode, onGround]) => minIas !== null && !Epic2Autothrottle.UNDERSPEED_PROT_DISABLED_MODES.includes(activeMode) && !onGround,
    this.minimumIas,
    this.activeMode,
    this.isOnGround
  );
  private readonly underspeedProtActive = MappedSubject.create(
    ([command, canActivate]) => this.config.speedProtectionAvailable && command && canActivate,
    this.underspeedProtActiveCommand,
    this.canUnderspeedProtActivate,
  );

  private readonly activeMinimumIas = MappedSubject.create(
    ([ias, offset]) => ias !== null ? ias + offset : 0,
    this.minimumIas,
    this.minimumIasOffset
  );
  private readonly activeMaximumIas = MappedSubject.create(
    ([ias, offset]) => ias + offset,
    this.maximumIas,
    this.maximumIasOffset,
  );

  private readonly activeTargetCas = MappedSubject.create(
    ([mode, targetSpeedIsMach, selectedIas]) => mode === Epic2AutothrottleModes.SPD && !targetSpeedIsMach ? selectedIas : -1,
    this.activeMode,
    this.targetSpeedIsMach,
    this.targetCas
  );
  private readonly activeTargetMach = MappedSubject.create(
    ([mode, targetSpeedIsMach, selectedMach]) => mode === Epic2AutothrottleModes.SPD && targetSpeedIsMach ? selectedMach : -1,
    this.activeMode,
    this.targetSpeedIsMach,
    this.targetMach
  );

  private readonly maxThrottlePos = MappedSubject.create(
    ([mode]) => {
      if (mode === Epic2AutothrottleModes.MIN_SPD || mode === Epic2AutothrottleModes.TO || mode === Epic2AutothrottleModes.HOLD) {
        return this.fadec.takeoffThrottlePosition;
      } else {
        return this.fadec.climbThrottlePosition;
      }
    },
    this.activeMode,
  );

  private readonly iasLookahead = new Lookahead(
    Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_LOOKAHEAD,
    Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_INPUT_TAU,
    Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_TREND_TAU
  );
  private readonly machLookahead = new Lookahead(
    Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_LOOKAHEAD,
    Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_INPUT_TAU,
    Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_TREND_TAU
  );

  private readonly thrustDirectorSpeed = Subject.create(0);

  private isMaxSpdArmed = false;
  private maxSpdHysteresisTime = 0;
  private isMinSpdArmed = false;
  private minSpdHysteresisTime = 0;

  private readonly fmaData = ObjectSubject.create<Epic2AutothrottleFmaData>({
    status: Epic2AutothrottleStatus.Off,
    activeMode: Epic2AutothrottleModes.NONE,
    targetIas: null,
    targetMach: null
  });
  private needPublishFmaData = false;

  private atPhaseOfFlight = AtPhaseOfFlight.Cruise;

  private readonly deactiveWarningTimer = new DebounceTimer();
  private readonly deactivateWarning = Subject.create(false);

  private isAlive = true;
  private isInit = false;

  private avionicsGlobalPowerSub?: Subscription;

  private radarAltSub?: Subscription;
  private radarAltimeterStateSub?: Subscription;

  private pressureAltSub?: Subscription;
  private adcStateSub?: Subscription;

  private hEventSub?: Subscription;

  private updateSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fadec The FADEC.
   * @param config The autothrottle panel config
   * @param airspeedDataProvider The airspeed data provider.
   * @param airGroundDataProvider The air/ground data provider.
   * @param altDataProvider The altitude data provider.
   * @param apDataProvider The autopilot data provider.
   * @param flapWarningDataProvider The flap warning data provider.
   * @param radioAltDataProvider The radio altimeter data provider.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fadec: Epic2Fadec,
    private readonly config: AutothrottleConfig,
    private readonly airspeedDataProvider: AirspeedDataProvider,
    private readonly airGroundDataProvider: AirGroundDataProvider,
    private readonly altDataProvider: AltitudeDataProvider,
    private readonly apDataProvider: AutopilotDataProvider,
    private readonly flapWarningDataProvider: FlapWarningDataProvider,
    private readonly radioAltDataProvider: RadioAltimeterDataProvider,
  ) {
    if (this.fadec.engineType === Epic2EngineType.Turboprop) {
      this.autothrottle = new Epic2TurbopropAutothrottle(
        bus,
        1,
        this.engines.map((engine) => ({
          index: engine.index,
          isVirtual: true,
          idlePosition: 0,
          maxThrustPosition: 1
        })),
        Epic2Autothrottle.OPTIONS,
        fadec.throttleLeverManager
      );
    } else {
      this.autothrottle = new Epic2JetAutothrottle(
        bus,
        1,
        this.engines.map((engine) => ({
          index: engine.index,
          isVirtual: true,
          idlePosition: 0,
          maxThrustPosition: 1
        })),
        Epic2Autothrottle.OPTIONS,
        fadec.throttleLeverManager
      );
    }

    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;

      manager.interceptKey('AUTO_THROTTLE_ARM', false);
      manager.interceptKey('AUTO_THROTTLE_DISCONNECT', false);
      manager.interceptKey('AUTO_THROTTLE_TO_GA', false);

      bus.getSubscriber<KeyEvents>().on('key_intercept').handle(data => {
        switch (data.key) {
          case 'AUTO_THROTTLE_ARM':
            // This is the AT button on the AP panel.
            if (this.isPowered && this.isAvionicsPowered) {
              const status = this.status.get();

              if (status === Epic2AutothrottleStatus.Off || status === Epic2AutothrottleStatus.Disconnected) {
                this.arm();
              } else {
                this.deactiveWarningTimer.schedule(() => this.deactivateWarning.set(false), Epic2Autothrottle.DEACTIVATE_WARNING_TIME);

                this.deactivate(false);
              }
            }
            break;
          case 'AUTO_THROTTLE_DISCONNECT':
            // This is the AT disconnect button on the PCL, or AP quick disconnect on the yoke
            if (this.isAvionicsPowered) {
              const status = this.status.get();
              // clear the deactivate warning if AT is already off, otherwise schedule it's deactivation
              if (status === Epic2AutothrottleStatus.Off) {
                this.deactivateWarning.set(false);
              } else if (status === Epic2AutothrottleStatus.On) {
                this.deactiveWarningTimer.schedule(() => this.deactivateWarning.set(false), Epic2Autothrottle.DEACTIVATE_WARNING_TIME);
              }

              this.deactivate(status !== Epic2AutothrottleStatus.Disconnected);
            }
            break;
        }
      });
    });
  }

  /**
   * Initializes this autothrottle.
   * @throws Error if this autothrottle has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('Epic2Autothrottle: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    // Publish status.
    this.status.sub(status => {
      this.publisher.pub('epic2_at_status', status, true, true);
      this.fmaData.set('status', status);
      SimVar.SetSimVarValue('L:WT_Epic2_Autothrottle_Status', SimVarValueType.Number, Epic2Autothrottle.STATUS_SIMVAR_ENUM_MAP[status]);
    }, true);

    // Initialize mode topic.
    this.publisher.pub('epic2_at_mode_active', this.activeMode.get(), true, true);

    // Respond to active mode changes.
    this.activeMode.sub(mode => {
      this.publisher.pub('epic2_at_mode_active', mode, true, true);
      this.onActiveModeChanged(mode);
    });

    // Respond to maximum throttle position changes.
    this.maxThrottlePos.sub(pos => { this.autothrottle.setMaxThrottlePos(pos); }, true);

    // Because we start in an power-off state, initialize the failed topic to true.
    this.publisher.pub('epic2_at_failed', true, true, true);
    // eslint-disable-next-line max-len
    // this.publisher.pub('cas_activate_alert', { key: { uuid: Epic2AutothrottleCrewAlertIDs.AtFail }, priority: AnnunciationType.Advisory }, true, false);

    // Resume CAS alert transporters.
    this.casAlertTransporters.forEach(transporter => { transporter.resume(); });



    // Set over/underspeed protection limits.

    this.activeMinimumIas.sub(ias => { this.autothrottle.setMinIas(ias); }, true);
    this.activeMaximumIas.sub(ias => { this.autothrottle.setMaxIas(ias); }, true);
    this.autothrottle.setMaxMach(1);

    // Respond to servo activation changes.
    this.engines.forEach((engine) => engine.servoActive.sub((active) => this.autothrottle.setServoActive(engine.index, active), true));

    // Respond to underspeed protection activation changes.
    this.underspeedProtActive.sub(active => { this.autothrottle.setUnderspeedProtActive(active); }, true);
    // Respond to underspeed protection activation changes.
    this.canOverspeedProtActivate.sub(active => { this.autothrottle.setOverspeedProtActive(active); }, true);

    // Set up data subs.

    const sub = this.bus.getSubscriber<
      ClockEvents & AdcEvents & APEvents
      & EngineEvents & ControlSurfacesEvents & VirtualThrottleLeverEvents & HEvent & ElectricalEvents
    >();

    this.avionicsGlobalPowerSub = sub.on('elec_circuit_avionics_on_1').handle(v => {
      if (v) {
        this.isAvionicsPowered = true;
      } else {
        this.isAvionicsPowered = false;
        this.deactivate(false);
        this.reset();
      }
    });

    this.simTime.setConsumer(sub.on('simTime'));

    this.engines.forEach((engine) => {
      engine.engineN1.setConsumer(sub.on(`n1_${engine.index}`));
      engine.throttleLeverPosition.setConsumer(sub.on(`v_throttle_lever_pos_${engine.index}`));
      // TODO remove this hack
      engine.canServoActivate.set(true);
      engine.fadecMode.pipe(engine.canServoActivate, (mode) => !Epic2Autothrottle.UNSUPPORTED_FADEC_MODES.includes(mode));
    });

    // Set speed targets.

    this.targetCas.sub(ias => { this.autothrottle.setSelectedIas(ias ?? -1); }, true);
    this.targetMach.sub(mach => { this.autothrottle.setSelectedMach(mach ?? -1); }, true);
    this.targetSpeedIsMach.sub(isMach => { this.autothrottle.setSelectedSpeedIsMach(isMach); }, true);

    // Publish active speed targets.

    this.activeTargetCas.sub(ias => {
      this.publisher.pub('epic2_at_target_cas', ias ?? -1, true, true);
      this.fmaData.set('targetIas', ias);
    }, true);
    this.activeTargetMach.sub(mach => {
      this.publisher.pub('epic2_at_target_mach', mach ?? -1, true, true);
      this.fmaData.set('targetMach', mach);
    }, true);

    // Schedule FMA data publish.

    this.fmaData.sub(() => { this.needPublishFmaData = true; });
    this.needPublishFmaData = true;

    // Set up throttle key event handlers.

    this.fadec.onThrottleLeverKeyEvent = this.handleThrottleLeverInput.bind(this);
    this.hEventSub = sub.on('hEvent').handle(hEvent => {
      // Inc/Dec H events are sent via modelbehaviors to notify us when a throttle INC/DEC key event has been
      // intercepted and turned into a SET event.

      switch (hEvent) {
        case 'WT_Epic_Throttle_1_Inc':
        case 'WT_Epic_Throttle_1_Dec':
        case 'WT_Epic2_Throttle_1_Inc':
        case 'WT_Epic2_Throttle_1_Dec':
          this.handleThrottleLeverIncDec(1);
          break;
        case 'WT_Epic_Throttle_2_Inc':
        case 'WT_Epic_Throttle_2_Dec':
        case 'WT_Epic2_Throttle_2_Inc':
        case 'WT_Epic2_Throttle_2_Dec':
          this.handleThrottleLeverIncDec(2);
          break;
      }
    });

    this.engines.forEach((engine) => {
      engine.servoActive.sub((active) => {
        if (!active) {
          engine.forceDisconnectData.lastInputTime = undefined;
          engine.forceDisconnectData.lastSetInputPos = undefined;
          engine.forceDisconnectData.cumulativeDisplacement = 0;
        }
      }, true);
    });

    this.thrustDirectorSpeed.sub((v) => this.publisher.pub('epic2_at_target_throttle_speed', v, true, true), true);

    this.deactivateWarning.sub((v) => this.publisher.pub('epic2_at_deactivate_warning', v, true, true), true);

    // Start autothrottle and update loop.

    this.autothrottle.start(Epic2Autothrottle.UPDATE_FREQ);

    this.updateSub = sub.on('realTime').handle(this.update.bind(this));
  }

  /**
   * Handles throttle input key events.
   * @param index The index of the throttle.
   * @param currentPos The current position of the throttle lever, in the range -1 to +1.
   * @param newPos The requested new position of the throttle lever, in the range -1 to +1.
   * @param keyEvent The key event.
   * @returns The desired throttle lever position to set, in the range -1 to +1.
   */
  private handleThrottleLeverInput(index: AutothrottleThrottleIndex, currentPos: number, newPos: number, keyEvent: string): number {
    const engine = this.engines[index - 1];
    const disconnectData = engine.forceDisconnectData;

    if (!disconnectData.servoActive.get()) {
      const holdData = engine.holdData;
      if (holdData) {
        if (holdData.firstManualInput === undefined) {
          holdData.firstManualInput = newPos;
        }

        // Require a minimum amount of lever input in HOLD mode before the levers are controlled manually.
        // This ensures noisy hardware doesn't erroneously change the thrust lever position.
        holdData.leversActive ||= Math.abs(holdData.firstManualInput - newPos) >= Epic2Autothrottle.HOLD_THROTTLE_LEVER_ACTIVATION_THRESHOLD;

        const activeMode = this.activeMode.get();
        const holdModeActive = activeMode === Epic2AutothrottleModes.HOLD;

        if (holdModeActive && !holdData.leversActive) {
          return currentPos;
        }
      }

      return newPos;
    }

    const time = Date.now();

    if (disconnectData.cumulativeDisplacement === undefined || disconnectData.lastInputTime === undefined) {
      disconnectData.cumulativeDisplacement = 0;
    } else {
      const dt = time - disconnectData.lastInputTime;
      disconnectData.cumulativeDisplacement *= Math.exp(-dt / Epic2Autothrottle.FORCE_DC_DISPLACEMENT_DECAY_TAU);
    }

    if (keyEvent.search('SET') >= 0) {
      // SET event -> need to handle potential noisy hardware throttles that continuously send key events. (Note also
      // that modelbehaviors will intercept most throttle key events and turn them into SET events.)

      // The amount we add to cumulative displacement will be equal to the difference between the requested position of
      // the current SET event and the last SET event. For noisy hardware, their set events should be distributed
      // randomly around a constant value if the throttle is not in motion, so over time the cumulative displacement
      // tends toward 0.

      if (disconnectData.lastInputTime === undefined || time - disconnectData.lastInputTime > 200) {
        disconnectData.lastSetInputPos = undefined;
      }

      const deltaPos = newPos - (disconnectData.lastSetInputPos ?? newPos);
      disconnectData.cumulativeDisplacement += deltaPos;

      disconnectData.lastSetInputPos = newPos;
    } else {
      // INC, DEC, or event that targets a constant throttle position -> no need to handle noisy hardware since they
      // shouldn't be sending these types of events.

      disconnectData.cumulativeDisplacement += Epic2Autothrottle.FORCE_DC_INC_DEC_DISPLACEMENT;
    }

    if (Math.abs(disconnectData.cumulativeDisplacement) > Epic2Autothrottle.FORCE_DC_DISPLACEMENT_THRESHOLD) {
      this.deactivate(true);
    }

    disconnectData.lastInputTime = time;

    return currentPos;
  }

  /**
   * Handles throttle lever increase/decrease events.
   * @param index The index of the throttle.
   */
  private handleThrottleLeverIncDec(index: AutothrottleThrottleIndex): void {
    const engine = this.engines[index - 1];
    const data = engine.forceDisconnectData;

    if (!data.servoActive.get()) {
      return;
    }

    const time = Date.now();

    if (data.cumulativeDisplacement === undefined || data.lastInputTime === undefined) {
      data.cumulativeDisplacement = 0;
    } else {
      const dt = time - data.lastInputTime;
      data.cumulativeDisplacement *= Math.exp(-dt / Epic2Autothrottle.FORCE_DC_DISPLACEMENT_DECAY_TAU);
    }

    data.cumulativeDisplacement += Epic2Autothrottle.FORCE_DC_INC_DEC_DISPLACEMENT;

    if (Math.abs(data.cumulativeDisplacement) > Epic2Autothrottle.FORCE_DC_DISPLACEMENT_THRESHOLD) {
      this.deactivate(true);
    }
  }

  /**
   * Attempts to arm this autothrottle.
   */
  private arm(): void {
    const status = this.status.get();

    if ((status !== Epic2AutothrottleStatus.Off && status !== Epic2AutothrottleStatus.Disconnected) || !this.canArm()) {
      return;
    }

    this.activeMode.set(this.atPhaseOfFlight === AtPhaseOfFlight.TakeoffClimbout ? Epic2AutothrottleModes.TO : Epic2AutothrottleModes.NONE);
    this.status.set(Epic2AutothrottleStatus.Armed);
  }

  /**
   * Attempts to activate this autothrottle.
   * @param mode The mode to activate. Defaults to {@link Epic2AutothrottleModes.NONE}.
   */
  private activate(mode = Epic2AutothrottleModes.NONE): void {
    if (this.status.get() === Epic2AutothrottleStatus.On) {
      return;
    }

    this.activeMode.set(mode);
    this.status.set(Epic2AutothrottleStatus.On);
  }

  /**
   * Attempts to activate this autothrottle's overspeed protection mode.
   */
  private activateMaxSpd(): void {
    if (this.status.get() === Epic2AutothrottleStatus.On) {
      return;
    }

    this.status.set(Epic2AutothrottleStatus.On);
    this.activeMode.set(Epic2AutothrottleModes.MAX_SPD);
  }

  /**
   * Attempts to activate this autothrottle's underspeed protection mode.
   */
  private activateMinSpd(): void {
    if (this.status.get() === Epic2AutothrottleStatus.On) {
      return;
    }

    this.status.set(Epic2AutothrottleStatus.On);
    this.activeMode.set(Epic2AutothrottleModes.MIN_SPD);
  }

  /**
   * Attempts to deactivate this autothrottle. If the autothrottle is already deactivated, then this method has no
   * effect other than to change the status from disconnected to off if the `disconnect` argument is `false`.
   * @param disconnect Whether the autothrottle should enter the disconnect state when deactivated.
   */
  private deactivate(disconnect: boolean): void {
    if (this.status.get() === Epic2AutothrottleStatus.Off) {
      return;
    }

    this.deactivateWarning.set(true);

    this.activeMode.set(Epic2AutothrottleModes.NONE);
    this.status.set(disconnect ? Epic2AutothrottleStatus.Disconnected : Epic2AutothrottleStatus.Off);
  }

  /**
   * Resets all aspects of this autothrottle's state that are not tied to a specific operating status or mode.
   */
  private reset(): void {
    this.iasLookahead.reset();
    this.machLookahead.reset();

    this.isMaxSpdArmed = false;
    this.maxSpdHysteresisTime = 0;
    this.isMinSpdArmed = false;
    this.minSpdHysteresisTime = 0;
  }

  /** Initialise hold modes on entry */
  private initialiseHoldMode(): void {
    for (const engine of this.engines) {
      const holdData = engine.holdData;
      if (holdData) {
        holdData.firstManualInput = undefined;
        holdData.leversActive = false;
      }
    }
  }

  /**
   * Responds to changes in this autothrottle's active mode.
   * @param mode The active mode.
   */
  private onActiveModeChanged(mode: Epic2AutothrottleModes): void {
    let isAtCommandActive = false;
    let isUnderspeedProtActive = false;

    let minIasOffset = 0;
    let maxIasOffset = Epic2Autothrottle.OVERSPEED_PROTECTION_OFFSET_IAS;
    let maxMachOffset = Epic2Autothrottle.OVERSPEED_PROTECTION_OFFSET_MACH;

    switch (mode) {
      case Epic2AutothrottleModes.NONE:
      // fallthrough
      case Epic2AutothrottleModes.HOLD:
        this.autoGroundDisengagePrimedDuration = 0;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.None);
        this.initialiseHoldMode();
        break;
      case Epic2AutothrottleModes.CLIMB:
        isAtCommandActive = true;
        isUnderspeedProtActive = true;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.ThrottlePos);
        this.autothrottle.setSelectedThrottlePos(this.fadec.climbThrottlePosition);
        break;
      case Epic2AutothrottleModes.DESC:
        isAtCommandActive = true;
        isUnderspeedProtActive = true;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.ThrottlePos);
        this.autothrottle.setSelectedThrottlePos(this.fadec.idleThrottlePosition);
        break;
      case Epic2AutothrottleModes.TO:
        isAtCommandActive = true;
        isUnderspeedProtActive = true;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.ThrottlePos);
        this.autothrottle.setSelectedThrottlePos(this.fadec.takeoffThrottlePosition);
        break;
      case Epic2AutothrottleModes.SPD:
        isAtCommandActive = true;
        isUnderspeedProtActive = true;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.Speed);
        break;
      case Epic2AutothrottleModes.MAX_SPD:
        isAtCommandActive = true;
        isUnderspeedProtActive = true;
        maxIasOffset = Epic2Autothrottle.OVERSPEED_PROTECTION_MODE_TARGET_OFFSET_IAS;
        maxMachOffset = Epic2Autothrottle.OVERSPEED_PROTECTION_MODE_TARGET_OFFSET_MACH;
        this.autoGroundDisengagePrimedDuration = 0;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.None);
        break;
      case Epic2AutothrottleModes.MIN_SPD:
        isAtCommandActive = true;
        isUnderspeedProtActive = true;
        minIasOffset = Epic2Autothrottle.UNDERSPEED_PROTECTION_MODE_TARGET_OFFSET_IAS;
        this.autoGroundDisengagePrimedDuration = 0;
        this.autothrottle.setTargetMode(AutothrottleTargetMode.None);
        break;
    }

    this.isAtCommandActive.set(isAtCommandActive);
    this.underspeedProtActiveCommand.set(isUnderspeedProtActive);

    this.minimumIasOffset.set(minIasOffset);
    this.maximumIasOffset.set(maxIasOffset);
    this.maximumMachOffset.set(maxMachOffset);

    this.fmaData.set('activeMode', mode);
  }

  /**
   * Updates this autothrottle.
   */
  private update(): void {
    const isPowered = this.electricLogic ? this.electricLogic.getValue() !== 0 : true;
    if (isPowered !== this.isPowered) {
      this.isPowered = isPowered;

      if (!isPowered) {
        this.deactivate(this.isAvionicsPowered);
        this.reset();
      }

      this.publisher.pub('epic2_at_failed', !this.isPowered, true, true);

      /* this.publisher.pub(this.isPowered ? 'cas_deactivate_alert' : 'cas_activate_alert', {
        key: { uuid: Epic2AutothrottleCrewAlertIDs.AtFail },
        priority: AnnunciationType.Advisory
      }, true, false); */
    }

    this.lastUpdateSimTime ??= this.simTime.get();
    const simTime = this.simTime.get();
    const dt = Math.max(simTime - this.lastUpdateSimTime, 0);

    if (this.isPowered && this.isAvionicsPowered) {
      this.updatePhaseOfFlight();

      this.updateSpeedLookahead();

      const status = this.status.get();

      switch (status) {
        case Epic2AutothrottleStatus.Armed:
          this.isMaxSpdArmed = false;
          this.isMinSpdArmed = false;
          if (!this.canArm()) {
            this.deactivate(true);
          } else {
            this.updateArmed();
          }
          break;
        case Epic2AutothrottleStatus.On:
          this.isMaxSpdArmed = false;
          this.isMinSpdArmed = false;
          if (!this.canArm()) {
            this.deactivate(true);
          } else {
            switch (this.activeMode.get()) {
              case Epic2AutothrottleModes.NONE:
                this.updateNoneMode();
                break;
              case Epic2AutothrottleModes.HOLD:
                this.updateHoldMode();
                break;
              case Epic2AutothrottleModes.TO:
                this.updateToMode();
                break;
              case Epic2AutothrottleModes.CLIMB:
                this.updateClimbMode();
                break;
              case Epic2AutothrottleModes.DESC:
                this.updateDescendMode();
                break;
              case Epic2AutothrottleModes.SPD:
                this.updateSpeedMode();
                break;
              case Epic2AutothrottleModes.MAX_SPD:
                this.updateMaxSpdMode(dt);
                break;
              case Epic2AutothrottleModes.MIN_SPD:
                this.updateMinSpdMode(dt);
                break;
            }
          }
          break;
        default:
          this.updateOff();
      }

    }

    if (this.needPublishFmaData) {
      this.needPublishFmaData = false;
      this.publisher.pub('epic2_at_fma_data', this.fmaData.get(), true, true);
    }

    this.thrustDirectorSpeed.set(MathUtils.round(this.autothrottle.thrustDirectorSpeed, 0.0005));

    this.lastUpdateSimTime = simTime;
  }

  /**
   * Updates this autothrottle's IAS and mach speed lookahead values.
   */
  private updateSpeedLookahead(): void {
    const simTime = this.simTime.get();
    const dt = simTime - (this.lastUpdateSimTime ?? simTime);

    const cas = this.cas.get();
    if (cas !== null) {
      this.iasLookahead.next(cas, dt);
    } else {
      this.iasLookahead.reset();
    }

    const mach = this.mach.get();
    if (mach !== null) {
      this.machLookahead.next(mach, dt);
    } else {
      this.machLookahead.reset();
    }
  }

  // TODO should this go in the FADEC?
  /**
   * Updates the current phase of flight.
   */
  private updatePhaseOfFlight(): void {
    const flapPos = this.flapPos.get();
    const radioAlt = this.radioAlt.get();
    const onGround = this.isOnGround.get();

    if (onGround) {
      this.atPhaseOfFlight = AtPhaseOfFlight.TakeoffClimbout;
    } else if ((radioAlt === null || radioAlt > 1500) && (flapPos === null || flapPos < 5)) {
      this.atPhaseOfFlight = AtPhaseOfFlight.Cruise;
    } else if (this.atPhaseOfFlight === AtPhaseOfFlight.Cruise && (radioAlt !== null || (flapPos !== null && flapPos > 0))) {
      this.atPhaseOfFlight = AtPhaseOfFlight.Approach;
    }
  }

  /**
   * Checks whether this autothrottle can enter the armed state.
   * @returns Whether this autothrottle can enter the armed state.
   */
  private canArm(): boolean {
    if (
      !this.isPowered
      || !this.isAvionicsPowered
      || this.engines.some((engine) => Epic2Autothrottle.UNSUPPORTED_FADEC_MODES.includes(engine.fadecMode.get()))
    ) {
      return false;
    }

    const radioAlt = this.radioAlt.get();
    const status = this.status.get();

    if (this.atPhaseOfFlight === AtPhaseOfFlight.TakeoffClimbout) {
      const cas = this.airspeedDataProvider.cas.get();
      return (cas !== null && cas < 50)
        || (radioAlt !== null && radioAlt > Epic2Autothrottle.HOLD_THRESHOLD_ALTITUDE)
        || status === Epic2AutothrottleStatus.Armed
        || status === Epic2AutothrottleStatus.On;
    }

    return (radioAlt ?? Infinity) > 50 || this.apDataProvider.verticalActive.get() === Epic2ApVerticalMode.GoAround;
  }

  /**
   * Updates this autothrottle when in the off or disconnected state.
   */
  private updateOff(): void {
    if (
      !this.isPowered
      || !this.isAvionicsPowered
      || this.engines.some((engine) => Epic2Autothrottle.UNSUPPORTED_FADEC_MODES.includes(engine.fadecMode.get()))
    ) {
      return;
    }

    if (this.apDataProvider.apEngaged.get() && this.config.speedProtectionAvailable) {
      // Autothrottle speed protection logic

      const ias = this.iasLookahead.last(true);

      if (this.isMaxSpdArmed) {
        if (ias !== null && ias > this.maximumIas.get() + Epic2Autothrottle.OVERSPEED_PROTECTION_OFFSET_IAS) {
          this.activateMaxSpd();
          return;
        }
      } else {
        this.isMaxSpdArmed = ias === null || ias <= this.maximumIas.get();
      }

      const minSpeed = this.minimumIas.get();
      if (this.isMinSpdArmed) {
        if (minSpeed !== null) {
          if (ias !== null && ias < minSpeed) {
            this.activateMinSpd();
            return;
          }
        } else {
          this.isMinSpdArmed = false;
        }
      } else {
        this.isMinSpdArmed = minSpeed !== null && (ias === null || ias >= minSpeed);
      }
    }
  }

  /**
   * Updates this autothrottle when in the armed state.
   */
  private updateArmed(): void {
    let canActivate = true;
    let modeToActivate: Epic2AutothrottleModes | undefined;

    if (this.atPhaseOfFlight === AtPhaseOfFlight.TakeoffClimbout) {
      modeToActivate = Epic2AutothrottleModes.TO;

      const cas = this.airspeedDataProvider.cas.get();
      canActivate = cas !== null && cas < 60 && this.engines.every((engine) => engine.throttleLeverPosition.get() >= Epic2Autothrottle.THROTTLE_LEVER_ACTIVATE_THRESHOLD);
    }

    if (canActivate) {
      this.activate(modeToActivate);
    }
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is NONE.
   */
  private updateNoneMode(): void {
    const radioAltitude = this.radioAlt.get();

    if (this.isOnGround.get() || (radioAltitude !== null && radioAltitude < Epic2Autothrottle.HOLD_THRESHOLD_ALTITUDE)) {
      this.activeMode.set(Epic2AutothrottleModes.HOLD);
    } else {
      this.selectTargetingMode();
    }
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is HOLD.
   */
  private updateHoldMode(): void {
    const radioAltitude = this.radioAlt.get();

    // Enter TO mode if radar altitude is >= 400 feet or if HOLD has been active for more than 90 seconds.
    if (
      (radioAltitude !== null && radioAltitude >= Epic2Autothrottle.HOLD_THRESHOLD_ALTITUDE)
    ) {
      this.activeMode.set(Epic2AutothrottleModes.TO);
    }
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is TO.
   */
  private updateToMode(): void {
    const radioAltitude = this.radioAlt.get();
    const cas = this.airspeedDataProvider.cas.get();

    // TODO probably should consider baro altitude above takeoff point as a backup
    if (cas !== null && cas > 60 && radioAltitude !== null && radioAltitude < Epic2Autothrottle.HOLD_THRESHOLD_ALTITUDE) {
      this.activate(Epic2AutothrottleModes.HOLD);
    } else if (radioAltitude !== null && radioAltitude > Epic2Autothrottle.HOLD_THRESHOLD_ALTITUDE) {
      this.selectTargetingMode();
    }
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is CLIMB.
   */
  private updateClimbMode(): void {
    if (this.tryAutoGroundDisengage()) {
      return;
    }

    this.selectTargetingMode();
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is DESCEND.
   */
  private updateDescendMode(): void {
    if (this.tryAutoGroundDisengage()) {
      return;
    }

    this.selectTargetingMode();
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is SPEED.
   */
  private updateSpeedMode(): void {
    if (this.tryAutoGroundDisengage()) {
      return;
    }

    this.selectTargetingMode();
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is MAX SPD.
   * @param dt The elapsed time, in milliseconds, since the last update.
   */
  private updateMaxSpdMode(dt: number): void {
    if (this.tryAutoGroundDisengage()) {
      return;
    }

    const ias = this.iasLookahead.last(true);
    const mach = this.machLookahead.last(true);

    if ((ias !== null && ias <= this.maximumIas.get()) && (mach !== null && mach <= 0.84)) {
      this.maxSpdHysteresisTime += dt;
    } else {
      this.maxSpdHysteresisTime = 0;
    }

    if (this.maxSpdHysteresisTime >= Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_HYSTERESIS_TIME) {
      this.maxSpdHysteresisTime = 0;
      this.deactivate(false);
    }
  }

  /**
   * Updates this autothrottle when in the on state and the active mode is MIN SPD.
   * @param dt The elapsed time, in milliseconds, since the last update.
   */
  private updateMinSpdMode(dt: number): void {
    if (this.tryAutoGroundDisengage()) {
      return;
    }

    const ias = this.iasLookahead.last(true);

    const minimumCas = this.minimumIas.get();

    if (minimumCas !== null && ias !== null && ias >= minimumCas + Epic2Autothrottle.UNDERSPEED_PROTECTION_IAS_HYSTERESIS) {
      this.minSpdHysteresisTime += dt;
    } else {
      this.minSpdHysteresisTime = 0;
    }

    if (minimumCas === null || this.minSpdHysteresisTime >= Epic2Autothrottle.ENVELOPE_SPEED_PROTECTION_HYSTERESIS_TIME) {
      this.minSpdHysteresisTime = 0;
      this.deactivate(false);
    }
  }

  /**
   * Selects an appropriate speed/power/throttle position-targeting mode (CLIMB, DESC, SPD, or TO) for the current
   * situation.
   *
   * TO mode is selected if the autopilot/flight director is also in TO mode. CLIMB or DESCENT modes is selected if
   * the autopilot/flight director is in FLC mode and the pre-selected altitude is above or below the airplane's
   * current indicated altitude, respectively. SPD mode is selected in all other situations.
   * @returns The selected speed/power/throttle position-targeting mode (CLIMB, DESC, SPD, or TO).
   */
  private selectTargetingMode(): Epic2AutothrottleModes {
    if (this.isToGaActive.get()) {
      const radioAlt = this.radioAlt.get();
      const flapPos = this.flapPos.get();

      if ((radioAlt === null || radioAlt > 1500) && (flapPos === null || flapPos < 5)) {
        this.activeMode.set(Epic2AutothrottleModes.CLIMB);
      } else {
        this.activeMode.set(Epic2AutothrottleModes.TO);
      }
    } else if (this.isAltCapActive.get()) {
      // make sure we don't pass our speed target in alt cap
      this.activeMode.set(Epic2AutothrottleModes.SPD);
    } else if (this.isFlcActive.get()) {
      const alt = this.indicatedAlt.get();
      const selectedAlt = this.selectedAlt.get();
      if (alt !== null && selectedAlt !== null && alt < selectedAlt) {
        this.activeMode.set(Epic2AutothrottleModes.CLIMB);
      } else {
        this.activeMode.set(Epic2AutothrottleModes.DESC);
      }
    } else {
      this.activeMode.set(Epic2AutothrottleModes.SPD);
    }

    return this.activeMode.get();
  }

  /**
   * Attempts to automatically disengage the autothrottle when the plane is below 50 feet RA or on the ground.
   * @returns Whether the autothrottle was disengaged.
   */
  private tryAutoGroundDisengage(): boolean {
    const ra = this.radioAlt.get();
    const onGround = this.isOnGround.get();

    if ((ra !== null && ra < 50) || onGround) {
      this.deactivate(false);
      return true;
    }

    return false;
  }

  /**
   * Destroys this autothrottle.
   */
  public destroy(): void {
    this.isAlive = false;

    this.autothrottle.destroy();

    this.casAlertTransporters.forEach(transporter => { transporter.destroy(); });

    this.isAltCapActive.destroy();
    this.isFlcActive.destroy();
    this.isToGaActive.destroy();
    this.engines.forEach((engine) => {
      engine.fadecMode.destroy();
      engine.fadecClbN1.destroy();
      engine.engineN1.destroy();
      engine.throttleLeverPosition.destroy();
    });

    this.avionicsGlobalPowerSub?.destroy();
    this.radarAltSub?.destroy();
    this.radarAltimeterStateSub?.destroy();
    this.pressureAltSub?.destroy();
    this.adcStateSub?.destroy();
    this.hEventSub?.destroy();
    this.updateSub?.destroy();
  }
}

/** @inheritdoc */
export class Epic2TurbopropAutothrottle extends TurbopropAutothrottle {
  /**
   * Get the desired speed of the throttle(s).
   * @returns the desired speed of the throttle(s).
   */
  get thrustDirectorSpeed(): number {
    let sum = 0;
    for (const throttle of this.throttles) {
      sum += this.hysteresisRecord[throttle.index];
    }
    return sum / this.throttles.length;
  }
}

/** @inheritdoc */
export class Epic2JetAutothrottle extends JetAutothrottle {
  /**
   * Get the desired speed of the throttle(s).
   * @returns the desired speed of the throttle(s).
   */
  get thrustDirectorSpeed(): number {
    let sum = 0;
    for (const throttle of this.throttles) {
      sum += this.hysteresisRecord[throttle.index];
    }
    return sum / this.throttles.length;
  }
}
