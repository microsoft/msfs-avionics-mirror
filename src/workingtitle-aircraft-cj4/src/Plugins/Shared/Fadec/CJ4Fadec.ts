import { EventBus, GameStateProvider, JetFadec, LerpLookupTable, SimVarDefinition, SimVarPublisher, SimVarValueType, ThrottleLeverManager, VirtualThrottleLeverEvents, Wait } from '@microsoft/msfs-sdk';

/**
 * Events published by the FADEC SimVar publisher.
 */
interface CJ4FadecEvents {
  /** A FADEC target N1 for engine 1, in percentage in hundreds. */
  'fadec_tgt_n1_1': number;

  /** A FADEC target N1 for engine 2, in percentage in hundreds. */
  'fadec_tgt_n1_2': number;
}

/**
 * A publisher that publishes FADEC simvar events.
 */
export class CJ4FadecPublisher extends SimVarPublisher<CJ4FadecEvents> {
  private static simvars = new Map<keyof CJ4FadecEvents, SimVarDefinition>([
    ['fadec_tgt_n1_1', { name: 'L:FADEC_TGT_N1_1', type: SimVarValueType.Percent }],
    ['fadec_tgt_n1_2', { name: 'L:FADEC_TGT_N1_2', type: SimVarValueType.Percent }],
  ]);

  /**
   * Creates an instance of the CJ4FadecPublisher.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(CJ4FadecPublisher.simvars, bus);
  }
}

/**
 * The CJ4 FADEC.
 */
export class CJ4Fadec {
  // This is pulled from the native sim code. Commonly used when correcting N1.
  private static readonly MSFS_STANDARD_SEA_LEVEL_TEMP_RANKINE = 518.69;

  private static readonly UPDATE_FREQ = 60; // hertz

  private static readonly TO_DETENT = 0.958;
  private static readonly CLB_DETENT = 0.776;
  private static readonly CRU_DETENT = 0.035;

  private static readonly CRU_RANGE = CJ4Fadec.CLB_DETENT;

  private static readonly THRUST_FACTOR = 0.93;
  private static readonly CLB_MAX_CRU_DELTA = 0.1; // difference between CLB N1 and max CRU N1, in percent
  private static readonly MIN_N1 = 24.5; // Target N1 value, in percent, at idle throttles
  private static readonly START_N1_BUFFER = 0.5; // Difference, in percent, between the engine low-idle N1 value and the maximum allowable corrected N1 value in START mode.

  private static readonly MAX_PID_OUTPUT = 0.4; // The maximum change in engine throttle per second commanded by PIDs

  // N1 lookup tables ([altitude (feet), OAT (C)] => N1)
  private static readonly TO_TABLE = new LerpLookupTable([
    [86, 0, -55], [100.2, 0, 25], [93.8, 0, 55],
    [88, 2000, -55], [101.4, 2000, 17], [93.8, 2000, 55],
    [90.2, 4000, -55], [102.4, 4000, 10], [93.8, 4000, 55],
    [93.2, 6000, -55], [104, 6000, 0], [93.8, 6000, 55],
    [96.6, 8000, -55], [104, 8000, -20], [104, 8000, -3], [95, 8000, 35],
    [102, 10000, -55], [104.8, 10000, -47], [104.8, 10000, -23], [104, 10000, -20],
  ]);
  private static readonly CLB_TABLE = new LerpLookupTable([
    [83, 0, -55], [94.2, 0, 9], [93, 0, 15], [93, 0, 25], [87, 0, 55],
    [88, 5000, -55], [97, 5000, -9], [94.4, 5000, 3], [94.4, 5000, 19], [89, 5000, 43],
    [94.2, 10000, -55], [100.2, 10000, -25], [95.6, 10000, -2], [95.6, 10000, 9], [90.8, 10000, 31],
    [97.6, 15000, -55], [100.6, 15000, -40], [98.8, 15000, -33], [96.8, 15000, -10], [96, 15000, -1], [92.2, 15000, 19],
    [98, 20000, -55], [102, 20000, -35], [97.4, 20000, -13], [93.6, 20000, 6],
    [98.6, 25000, -55], [100.4, 25000, -45], [100.6, 25000, -30], [94.8, 25000, -6],
    [99.4, 30000, -55], [101.2, 30000, -45], [100.8, 30000, -41], [100.8, 30000, -37], [95.8, 30000, -18],
    [97, 35000, -70], [100.8, 35000, -51], [101, 35000, -46], [96.2, 35000, -30],
    [98, 40000, -70], [100.8, 40000, -62], [101, 40000, -55], [94.6, 40000, -33],
    [99, 45000, -75], [100.8, 45000, -68], [101, 45000, -60], [93.2, 45000, -33],
  ]);

  private readonly fadec: JetFadec;
  private readonly throttleLeverManager: ThrottleLeverManager;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.fadec = new JetFadec(bus, [
      {
        name: 'START',

        /** @inheritdoc */
        accept(index: number, throttleLeverPos: number, throttle: number, thrust: number, n1: number, n1Corrected: number): boolean {
          return n1Corrected < SimVar.GetSimVarValue(`TURB ENG LOW IDLE:${index}`, SimVarValueType.Percent) - CJ4Fadec.START_N1_BUFFER;
        },

        /** @inheritdoc */
        computeDesiredThrottle(): number {
          return 0;
        },

        /** @inheritdoc */
        getVisibleThrottlePos(index: number, throttleLeverPos: number): number {
          if (throttleLeverPos >= CJ4Fadec.TO_DETENT) {
            return CJ4Fadec.TO_DETENT;
          } else if (throttleLeverPos >= CJ4Fadec.CLB_DETENT) {
            return CJ4Fadec.CLB_DETENT;
          } else {
            return throttleLeverPos;
          }
        },
      },
      {
        name: 'TO',

        /** @inheritdoc */
        accept(index: number, throttleLeverPos: number): boolean {
          return throttleLeverPos >= CJ4Fadec.TO_DETENT;
        },

        /** @inheritdoc */
        computeDesiredThrottle(index: number): number {
          const targetN1 = CJ4Fadec.getTargetN1(CJ4Fadec.TO_TABLE);
          SimVar.SetSimVarValue(`L:FADEC_TGT_N1_${index}`, SimVarValueType.Percent, targetN1);

          return CJ4Fadec.adjustThrottleForN1(targetN1, index);
        },

        /** @inheritdoc */
        getVisibleThrottlePos(): number {
          return 1;
        },
      },
      {
        name: 'GROUND',

        /** @inheritdoc */
        accept(): boolean {
          return SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool);
        },

        /** @inheritdoc */
        computeDesiredThrottle(index: number, throttleLeverPos: number): number {
          const toTargetN1 = CJ4Fadec.getTargetN1(CJ4Fadec.TO_TABLE);
          const targetN1 = CJ4Fadec.calcCruN1(toTargetN1, throttleLeverPos);
          SimVar.SetSimVarValue(`L:FADEC_TGT_N1_${index}`, SimVarValueType.Percent, toTargetN1);

          return CJ4Fadec.adjustThrottleForN1(targetN1, index);
        },

        /** @inheritdoc */
        getVisibleThrottlePos(index: number, throttleLeverPos: number): number {
          return Math.min(throttleLeverPos, CJ4Fadec.CLB_DETENT);
        },
      },
      {
        name: 'CLB',

        /** @inheritdoc */
        accept(index: number, throttleLeverPos: number): boolean {
          return throttleLeverPos >= CJ4Fadec.CLB_DETENT;
        },

        /** @inheritdoc */
        computeDesiredThrottle(index: number): number {
          const targetN1 = CJ4Fadec.getTargetN1(CJ4Fadec.CLB_TABLE);
          SimVar.SetSimVarValue(`L:FADEC_TGT_N1_${index}`, SimVarValueType.Percent, targetN1);

          return CJ4Fadec.adjustThrottleForN1(targetN1, index);
        },

        /** @inheritdoc */
        getVisibleThrottlePos(): number {
          return CJ4Fadec.CLB_DETENT;
        },
      },
      {
        name: 'CRU',

        /** @inheritdoc */
        accept(): boolean {
          return true;
        },

        /** @inheritdoc */
        computeDesiredThrottle(index: number, throttleLeverPos: number): number {
          const clbTargetN1 = CJ4Fadec.getTargetN1(CJ4Fadec.CLB_TABLE);
          const targetN1 = CJ4Fadec.calcCruN1(clbTargetN1, throttleLeverPos);
          SimVar.SetSimVarValue(`L:FADEC_TGT_N1_${index}`, SimVarValueType.Percent, clbTargetN1 - CJ4Fadec.CLB_MAX_CRU_DELTA);

          return CJ4Fadec.adjustThrottleForN1(targetN1, index);
        },

        /** @inheritdoc */
        getVisibleThrottlePos(index: number, throttleLeverPos: number): number {
          return throttleLeverPos;
        },
      },
      {
        name: 'UNDEF',

        /** @inheritdoc */
        accept(): boolean {
          return true;
        },

        /** @inheritdoc */
        computeDesiredThrottle(index: number, throttleLeverPos: number): number {
          return throttleLeverPos / CJ4Fadec.CRU_RANGE * CJ4Fadec.THRUST_FACTOR;
        },

        /** @inheritdoc */
        getVisibleThrottlePos(index: number, throttleLeverPos: number): number {
          return throttleLeverPos;
        },
      },
    ], [
      { index: 1, leverPosTopic: 'v_throttle_lever_pos_1', visiblePosSimVar: 'L:XMLVAR_ThrottlePosition_1' },
      { index: 2, leverPosTopic: 'v_throttle_lever_pos_2', visiblePosSimVar: 'L:XMLVAR_ThrottlePosition_2' },
    ]);

    this.throttleLeverManager = new ThrottleLeverManager(bus, this.init.bind(this));

    // Publish virtual throttle lever positions for the benefit of modelbehaviors.
    const sub = bus.getSubscriber<VirtualThrottleLeverEvents>();

    sub.on('v_throttle_lever_pos_1').whenChanged().handle(CJ4Fadec.publishThrottleLeverPosSimVar.bind(undefined, 1));
    sub.on('v_throttle_lever_pos_2').whenChanged().handle(CJ4Fadec.publishThrottleLeverPosSimVar.bind(undefined, 2));
  }

  /**
   * Publishes a virtual throttle lever position to a simvar.
   * @param index The index of the throttle lever.
   * @param position The position to publish, in the range -1 to 1.
   */
  private static publishThrottleLeverPosSimVar(index: 1 | 2, position: number): void {
    SimVar.SetSimVarValue(`L:WT_Virtual_Throttle_Lever_Pos_${index}`, SimVarValueType.Percent, position * 100);
  }

  /**
   * Initializes this FADEC.
   */
  private async init(): Promise<void> {
    await Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.ingame, true);
    this.fadec.start(CJ4Fadec.UPDATE_FREQ);
  }

  /**
   * Gets the target N1 setting from a lookup table based on the current outside air temperature and altitude at the
   * airplane's position.
   * @param table The table to get the N1 from.
   * @returns The CLB target N1 setting, in percent.
   */
  private static getTargetN1(table: LerpLookupTable): number {
    const temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', SimVarValueType.Celsius);
    const alt = SimVar.GetSimVarValue('INDICATED ALTITUDE CALIBRATED', SimVarValueType.Feet);

    return table.get(alt, temp);
  }

  /**
   * Calculates the CRU range target N1 setting.
   * @param clbN1 The current CLB N1 target, in percent.
   * @param throttleLeverPos The current throttle lever position.
   * @returns The CRU target N1 setting, in percent.
   */
  private static calcCruN1(clbN1: number, throttleLeverPos: number): number {
    const cruPercentage = Utils.Clamp(throttleLeverPos / CJ4Fadec.CRU_RANGE, 0, 1);
    return CJ4Fadec.MIN_N1 + (cruPercentage * (clbN1 - CJ4Fadec.MIN_N1)) - CJ4Fadec.CLB_MAX_CRU_DELTA;
  }

  /**
   * Adjusts an engine throttle setting to target a specific N1 setting.
   * @param targetN1 The target N1 value, in percent.
   * @param index The engine index.
   * @returns The adjusted engine throttle setting.
   */
  private static adjustThrottleForN1(targetN1: number, index: number): number {
    const inletTemp = SimVar.GetSimVarValue(`TURB ENG INLET TEMPERATURE:${index}`, 'Rankine');
    const thetaTotalTempRatio = inletTemp / CJ4Fadec.MSFS_STANDARD_SEA_LEVEL_TEMP_RANKINE; //Divide by sim normal SL temp constant to get thetaTTR
    const uncorrectedN1 = targetN1 * Math.sqrt(thetaTotalTempRatio);

    const throttlePct = (uncorrectedN1 - CJ4Fadec.MIN_N1) / (100 - CJ4Fadec.MIN_N1);
    return throttlePct;
  }
}
