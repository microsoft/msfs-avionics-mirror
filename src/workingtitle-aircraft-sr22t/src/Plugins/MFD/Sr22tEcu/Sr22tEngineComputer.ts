import {
  AdcEvents, ClockEvents, ConsumerValue, EngineEvents, EventBus, GameStateProvider, KeyEventData, KeyEventManager, KeyEvents, LerpLookupTable, MathUtils,
  SimVarValueType, Subject, TemperatureSystem, UnitType, Wait
} from '@microsoft/msfs-sdk';

/**
 * SR22 engine computer events.
 */
export interface Sr22tEngineComputerEvents {
  /** The top of the green fuel flow band. */
  'ecu-fuelflow-max': number;

  /** The bottom of the green fuel flow band. */
  'ecu-fuelflow-min': number;

  /** The cyan fuel flow target. Zero if the current power settings have no cyan target. */
  'ecu-fuelflow-target': number;

  /** The current computed percent power. */
  'ecu-percent-power': number;
}

/**
 * The engine computer for the SR22T G6.
 */
export class Sr22tEngineComputer {

  private inputMixture = Subject.create(16384);
  private outputMixture = Subject.create(16384);
  private previousTimestamp = -1;

  private readonly map = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('eng_manifold_pressure_1'), 0);
  private readonly ff = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('fuel_flow_total'), 0);
  private readonly combustion = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('eng_combustion_1'), false);
  private readonly oat = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('ambient_temp_c'), 0);
  private readonly oilTemp = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('oil_temp_1'), 0);
  private readonly rpm = ConsumerValue.create(this.bus.getSubscriber<EngineEvents>().on('rpm_1'), 0);
  private readonly ias = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('ias'), 0);

  private wastegatePos = 0;

  private readonly percentPowerTable = new LerpLookupTable([
    [0, 0, 1000, 0], [0, 11.1, 1000, 0], [0, 13.4, 1000, 0], [0, 24, 1000, 0], [0, 30.7, 1000, 0], [0, 36, 1000, 0],
    [0, 0, 1000, 2], [6, 11.1, 1000, 2], [8, 13.4, 1000, 2], [62, 24, 1000, 16], [82, 30.7, 1000, 17.3], [47.5, 36, 1000, 8.5],
    [0, 0, 1000, 2.5], [6, 11.1, 1000, 2.5], [10, 13.4, 1000, 2.5], [65, 24, 1000, 18], [90, 30.7, 1000, 20], [95, 36, 1000, 17],
    [0, 0, 1000, 3.4], [6, 11.1, 1000, 3.4], [8, 13.4, 1000, 3.4], [62, 24, 1000, 24], [83.5, 30.7, 1000, 29], [100, 36, 1000, 37],
    [0, 0, 2500, 0], [0, 11.1, 2500, 0], [0, 13.4, 2500, 0], [0, 24, 2500, 0], [0, 30.7, 2500, 0], [0, 36, 2500, 0],
    [0, 0, 2500, 2], [22, 11.1, 2500, 7], [30, 13.4, 2500, 7.6], [63, 24, 2500, 16], [82, 30.7, 2500, 17.3], [47.5, 36, 2500, 8.5],
    [0, 0, 2500, 2.5], [26, 11.1, 2500, 9.5], [35, 13.4, 2500, 10], [66, 24, 2500, 18], [90, 30.7, 2500, 20], [95, 36, 2500, 17],
    [0, 0, 2500, 3.4], [22, 11.1, 2500, 12], [30, 13.4, 2500, 15], [63, 24, 2500, 26], [83.5, 30.7, 2500, 29], [100, 36, 2500, 37]
  ]);

  private readonly mixtureMaxTable = new LerpLookupTable([
    [0.52, 0], [0.83, 24.1], [0.83, 30.7], [1, 36]
  ]);

  private readonly ffMaxTable = new LerpLookupTable([
    [23.8, 0], [23.8, 26.3], [28.8, 30.7], [39, 36]
  ]);

  private readonly ffMinTable = new LerpLookupTable([
    [10, 0], [10, 30.7], [22, 30.75], [35, 36]
  ]);

  private readonly ffTargetTable = new LerpLookupTable([
    [0, 0], [0, 24.045], [15.6, 24.1], [18.3, 30.7], [0, 30.75], [0, 36]
  ]);

  private readonly egtTable = new LerpLookupTable([
    [0, 0], [1030, 8], [1150, 15], [1215, 55], [1420, 70], [1215, 100]
  ]);

  private readonly chtTable = new LerpLookupTable([
    [0, 0], [270, 8], [335, 55], [350, 100]
  ]);

  private readonly ffMaxSub = Subject.create(0);
  private readonly ffMinSub = Subject.create(0);
  private readonly ffTargetSub = Subject.create(0);
  private readonly percentPowerSub = Subject.create(0);

  private readonly egtTempSystem = new TemperatureSystem(1000);
  private readonly chtTempSystem = new TemperatureSystem(25000);

  private engineHealth = 100;
  private readonly engineFailed = Subject.create(false);

  /**
   * Creates an instance of the Sr22tEngineComputer.
   * @param bus An instance of the event bus.
   */
  constructor(private readonly bus: EventBus) {
    KeyEventManager.getManager(bus).then(km => {
      this.initKeyEvents(km);

      this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.onKeyIntercepted.bind(this));
      this.inputMixture.sub(v => SimVar.SetSimVarValue('L:WT_SR22T_MIXTURE_LEVER_POS', SimVarValueType.Number, v), true);
      this.outputMixture.sub(v => km.triggerKey('MIXTURE_SET', true, v), true);

      this.initEventSubs();

      Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true)
        .then(() => {
          this.engineFailed.set(SimVar.GetSimVarValue('GENERAL ENG FAILED:1', SimVarValueType.Bool) === 1);
          this.engineFailed.sub(() => SimVar.SetSimVarValue('K:TOGGLE_ENGINE1_FAILURE', SimVarValueType.Number, 1));

          this.egtTempSystem.set(SimVar.GetSimVarValue('GENERAL ENG EXHAUST GAS TEMPERATURE:1', SimVarValueType.Farenheit));
          this.egtTempSystem.addSource({ temperature: this.oat.get(), conductivity: 100 });

          this.chtTempSystem.set(SimVar.GetSimVarValue('ENG CYLINDER HEAD TEMPERATURE:1', SimVarValueType.Farenheit));
          this.chtTempSystem.addSource({ temperature: this.oat.get(), conductivity: 100 });
          this.chtTempSystem.addSource({ temperature: this.oat.get(), conductivity: 1000 });

          this.bus.getSubscriber<ClockEvents>().on('simTimeHiFreq').handle(this.update.bind(this));
        });
    });
  }

  /**
   * Initializes the key intercepts.
   * @param keyEventManager The key event manager to use.
   */
  private initKeyEvents(keyEventManager: KeyEventManager): void {
    keyEventManager.interceptKey('AXIS_MIXTURE_SET', false);
    keyEventManager.interceptKey('AXIS_MIXTURE1_SET', false);
    keyEventManager.interceptKey('MIXTURE_DECR', false);
    keyEventManager.interceptKey('MIXTURE1_DECR', false);
    keyEventManager.interceptKey('MIXTURE_DECR_SMALL', false);
    keyEventManager.interceptKey('MIXTURE1_DECR_SMALL', false);
    keyEventManager.interceptKey('MIXTURE_INCR', false);
    keyEventManager.interceptKey('MIXTURE1_INCR', false);
    keyEventManager.interceptKey('MIXTURE_INCR_SMALL', false);
    keyEventManager.interceptKey('MIXTURE1_INCR_SMALL', false);
    keyEventManager.interceptKey('MIXTURE_LEAN', false);
    keyEventManager.interceptKey('MIXTURE1_LEAN', false);
    keyEventManager.interceptKey('MIXTURE_RICH', false);
    keyEventManager.interceptKey('MIXTURE1_RICH', false);
    keyEventManager.interceptKey('MIXTURE_SET', false);
    keyEventManager.interceptKey('MIXTURE1_SET', false);
    keyEventManager.interceptKey('MIXTURE_SET_BEST', false);
  }

  /**
   * Initializes subs to ECU event publishers.
   */
  private initEventSubs(): void {
    const publisher = this.bus.getPublisher<Sr22tEngineComputerEvents>();

    this.ffMaxSub.sub(v => publisher.pub('ecu-fuelflow-max', v, true, true), true);
    this.ffMinSub.sub(v => publisher.pub('ecu-fuelflow-min', v, true, true), true);
    this.ffTargetSub.sub(v => publisher.pub('ecu-fuelflow-target', v, true, true), true);
    this.percentPowerSub.sub(v => publisher.pub('ecu-percent-power', v, true, true), true);
  }

  /**
   * Updates the engine computer.
   * @param timestamp The current simtime timestamp.
   */
  private update(timestamp: number): void {
    if (this.previousTimestamp === -1) {
      this.previousTimestamp = timestamp;
    }

    const deltaTime = MathUtils.clamp(timestamp - this.previousTimestamp, 0, 1000);

    const mapInHg = SimVar.GetSimVarValue('RECIP ENG MANIFOLD PRESSURE:1', SimVarValueType.InHG);
    const mixtureMax = this.mixtureMaxTable.get(mapInHg);
    this.outputMixture.set(this.inputMixture.get() * mixtureMax);

    this.ffMaxSub.set(this.ffMaxTable.get(mapInHg));
    this.ffMinSub.set(this.ffMinTable.get(mapInHg));
    this.ffTargetSub.set(this.ffTargetTable.get(mapInHg));

    if (this.ff.get() < 3.5 && this.rpm.get() < 900) {
      this.percentPowerSub.set(MathUtils.lerp(this.ff.get(), 3.5, 0, 8, 0, true, true));
    } else {
      const percentPower = this.percentPowerTable.get(mapInHg, this.rpm.get(), this.ff.get());
      this.percentPowerSub.set(percentPower);
    }

    this.simulateWastegate(deltaTime);

    this.calculateEgt(deltaTime, mapInHg);
    this.calculateCht(deltaTime, mapInHg);
    this.simulateCombustionErrors(deltaTime, mapInHg);

    this.previousTimestamp = timestamp;
  }

  /**
   * Simulates the boost and wastegate system.
   * @param deltaTime The delta time, in milliseconds sim time.
   */
  private simulateWastegate(deltaTime: number): void {
    const throttlePos = SimVar.GetSimVarValue('GENERAL ENG THROTTLE LEVER POSITION:1', SimVarValueType.PercentOver100);
    const targetMap = (throttlePos * 23) + 13;
    const deltaTarget = MathUtils.lerp(this.oilTemp.get(), -3, 100, 0.3, 0, true, true) - MathUtils.lerp(this.oat.get(), 25, 40, 0, 0.3, true, true);
    const boostLevel = MathUtils.lerp(this.rpm.get(), 900, 2000, 0, 1, true, true);

    const boostMultiplier = 2.511;
    const ambientInHg = SimVar.GetSimVarValue('AMBIENT PRESSURE', SimVarValueType.InHG);
    const requiredBoost = Math.max((targetMap + deltaTarget) / ambientInHg, 0.8);
    const targetWastegatePos = 1 - Math.min(requiredBoost / boostMultiplier, 1);

    const wastegatePosError = targetWastegatePos - this.wastegatePos;
    this.wastegatePos = Math.min(this.wastegatePos + (wastegatePosError * (2 * (deltaTime / 1000))), boostLevel);

    SimVar.SetSimVarValue('RECIP ENG WASTEGATE POSITION:1', SimVarValueType.PercentOver100, MathUtils.clamp(boostLevel - this.wastegatePos, 0, 1));
  }

  /**
   * Calculates the current EGT.
   * @param deltaTime The delta time in milliseconds sim time.
   * @param mapInHg The current manifold pressure, in inHg.
   */
  private calculateEgt(deltaTime: number, mapInHg: number): void {
    const power = this.percentPowerSub.get();
    const egtBase = this.egtTable.get(power);
    const oat = UnitType.CELSIUS.convertTo(this.oat.get(), UnitType.FAHRENHEIT);

    const ffMin = this.ffMinSub.get();
    const ffMax = this.ffMaxSub.get();
    const ff = this.ff.get();

    if (!this.combustion.get()) {
      this.egtTempSystem.setSourceTemp(0, oat);
      this.egtTempSystem.setSourceConductivity(0, 100);
    } else if (power < 5) {
      this.egtTempSystem.setSourceTemp(0, MathUtils.lerp(power, 0, 8, oat, 1030 + (0.1 * oat)));
      this.egtTempSystem.setSourceConductivity(0, 100);
    } else {
      let egtDelta = 0;
      if (mapInHg >= 30.7) {
        if (ff >= (ffMin - 10)) {
          egtDelta = MathUtils.lerp(ff, ffMin, ffMin - 10, 0, 600, true, true);
        } else {
          egtDelta = MathUtils.lerp(ff, ffMin - 10, ffMin - 15, 600, 0, true, true);
        }
      } else if (mapInHg < 30.7 && mapInHg > 24) {
        const ffTargetPct = (this.ffTargetSub.get() - ffMin) / (ffMax - ffMin);
        const ffPct = (ff - ffMin) / (ffMax - ffMin);

        if (ffPct >= (ffTargetPct + 0.1)) {
          egtDelta = MathUtils.lerp(ffPct, 1, ffTargetPct + 0.1, 0, 170, true, true);
        } else {
          egtDelta = MathUtils.lerp(ffPct, ffTargetPct + 0.1, 0.1, 170, 0, true, true);
        }
      }

      this.egtTempSystem.setSourceTemp(0, egtBase + (0.1 * oat) + egtDelta);
      this.egtTempSystem.setSourceConductivity(0, power < 12 ? 100 : 1000);
    }

    this.egtTempSystem.update(deltaTime);
    SimVar.SetSimVarValue('GENERAL ENG EXHAUST GAS TEMPERATURE:1', SimVarValueType.Farenheit, this.egtTempSystem.value.get());
  }

  /**
   * Calculates the current CHT.
   * @param deltaTime The delta time in milliseconds sim time.
   * @param mapInHg The current manifold pressure, in inHg.
   */
  private calculateCht(deltaTime: number, mapInHg: number): void {
    const power = this.percentPowerSub.get();
    const cht = this.chtTable.get(power);
    const oat = UnitType.CELSIUS.convertTo(this.oat.get(), UnitType.FAHRENHEIT);

    const ffMin = this.ffMinSub.get();
    const ffMax = this.ffMaxSub.get();
    const ff = this.ff.get();

    let chtDelta = 0;
    if (mapInHg >= 30.7) {
      if (ff >= (ffMin - 10)) {
        chtDelta = MathUtils.lerp(ff, ffMin, ffMin - 10, 0, 150, true, true);
      } else {
        chtDelta = MathUtils.lerp(ff, ffMin - 10, ffMin - 15, 150, 0, true, true);
      }
    } else if (mapInHg < 30.7 && mapInHg > 24) {
      const ffTargetPct = (this.ffTargetSub.get() - ffMin) / (ffMax - ffMin);
      const ffPct = (ff - ffMin) / (ffMax - ffMin);

      if (ffPct >= (ffTargetPct + 0.1)) {
        chtDelta = MathUtils.lerp(ffPct, 1, ffTargetPct + 0.1, 0, 25, true, true);
      } else {
        chtDelta = MathUtils.lerp(ffPct, ffTargetPct + 0.1, 0, 25, 0, true, true);
      }
    }

    const airConductivity = MathUtils.lerp(this.ias.get(), 0, 200, 25, 35, true, true);
    this.chtTempSystem.setSourceConductivity(0, airConductivity);
    this.chtTempSystem.setSourceTemp(0, oat);

    const engineConductivity = this.combustion.get() ? MathUtils.lerp(power, 0, 3, 0, 250, true, true) : 0;
    this.chtTempSystem.setSourceConductivity(1, engineConductivity);

    this.chtTempSystem.setSourceTemp(1, cht + chtDelta);
    this.chtTempSystem.update(deltaTime);
    SimVar.SetSimVarValue('RECIP ENG CYLINDER HEAD TEMPERATURE:1', SimVarValueType.Farenheit, this.chtTempSystem.value.get());
  }

  /**
   * Simulates engine combustion errors.
   * @param deltaTime The delta time, in milliseconds sim time.
   * @param mapInHg The current manifold pressure, in inHg.
   */
  private simulateCombustionErrors(deltaTime: number, mapInHg: number): void {
    let isLeanMisfire = false;
    let misfireChance = 0;
    let isDetonation = false;
    let detonationChance = 0;

    if (mapInHg >= 30.7) {
      const ffMisfireMin = this.ffMinSub.get() * 0.92;
      misfireChance = MathUtils.lerp(this.ff.get(), ffMisfireMin - 10, ffMisfireMin - 15, 0, 0.02, true);
      isLeanMisfire = Math.random() <= (Math.pow(misfireChance * 100, 2) / 100);
    }

    const cht = this.chtTempSystem.value.get();
    if (cht >= 410) {
      detonationChance = MathUtils.lerp(cht, 410, 435, 0, 0.02, true);
      isDetonation = Math.random() <= (Math.pow(detonationChance * 100, 2) / 100);
    }

    if (isLeanMisfire || isDetonation) {
      const firepower = isLeanMisfire ? misfireChance : detonationChance;
      SimVar.SetSimVarValue('ENG TORQUE:1', SimVarValueType.FtLb, -500 + (firepower * -25000));
    }

    if (detonationChance > 0) {
      const damage = (detonationChance * 100) * (deltaTime / 1000) * 2;
      this.engineHealth = Math.max(this.engineHealth - damage, 0);
    }

    if (this.engineHealth <= 0) {
      this.engineFailed.set(true);
    } else {
      this.engineFailed.set(false);
    }
  }

  /**
   * Handles when keys are intercepted.
   * @param data The data for the intercepted key.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'AXIS_MIXTURE_SET':
      case 'AXIS_MIXTURE1_SET':
        this.inputMixture.set(((data.value0 ?? 0) + 16384) / 2);
        break;
      case 'MIXTURE_SET':
      case 'MIXTURE1_SET':
        this.inputMixture.set(data.value0 ?? 0);
        break;
      case 'MIXTURE_DECR':
      case 'MIXTURE1_DECR':
        this.incrementMixture(false, false);
        break;
      case 'MIXTURE_INCR':
      case 'MIXTURE1_INCR':
        this.incrementMixture(true, false);
        break;
      case 'MIXTURE_DECR_SMALL':
      case 'MIXTURE1_DECR_SMALL':
        this.incrementMixture(false, true);
        break;
      case 'MIXTURE_INCR_SMALL':
      case 'MIXTURE1_INCR_SMALL':
        this.incrementMixture(true, true);
        break;
      case 'MIXTURE_LEAN':
      case 'MIXTURE1_LEAN':
        this.inputMixture.set(0);
        break;
      case 'MIXTURE_RICH':
      case 'MIXTURE1_RICH':
        this.inputMixture.set(16384);
        break;
    }
  }

  /**
   * Increments the mixture input.
   * @param up Whether the increment direction is up.
   * @param small Whether the increment is small.
   */
  private incrementMixture(up: boolean, small: boolean): void {
    const increment = small ? 64 : 128;
    const sign = up ? 1 : -1;

    this.inputMixture.set(MathUtils.clamp(this.inputMixture.get() + (increment * sign), 0, 16384));
  }
}