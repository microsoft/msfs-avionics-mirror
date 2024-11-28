import { AutothrottleThrottleIndex, EventBus, GameStateProvider, JetFadec, ThrottleLeverManager, Wait } from '@microsoft/msfs-sdk';

import { Epic2EngineType, Epic2Fadec, Epic2FadecConfig, Epic2FadecModes } from '@microsoft/msfs-epic2-shared';

/**
 * A default FADEC for a turboprop engined plane.
 * Useful during early development but planes should implement a FADEC plugin.
 */
export class Epic2JetFadec extends JetFadec implements Epic2Fadec {
  private static readonly UPDATE_FREQ = 60;

  private readonly config: Required<Epic2FadecConfig>;

  private isThrottleLeverManagerInit = false;

  private isGameStateInit = false;

  public readonly throttleLeverManager = new ThrottleLeverManager(
    this.bus,
    () => {
      this.isThrottleLeverManagerInit = true;

      if (this.isGameStateInit) {
        this.start(Epic2JetFadec.UPDATE_FREQ);
      }
    },
    {
      throttleLeverHandler: this.onThrottleLeverPosRequested.bind(this)
    }
  );


  public climbThrottlePosition = 1;
  public takeoffThrottlePosition = 1;
  public idleThrottlePosition = 0;

  /**
   * A function which handles throttle lever input key events. The function takes in the index of the throttle, the
   * current and requested throttle lever positions (both in the range -1 to +1), and the name of the key event, and
   * should return the desired actual position to set (also in the range -1 to +1).
   */
  public onThrottleLeverKeyEvent?: (index: AutothrottleThrottleIndex, currentPos: number, newPos: number, keyEvent: string) => number;

  /**
   * Ctor.
   * @param bus The event bus.
   * @param config The configuration for the FADEC.
   */
  constructor(
    bus: EventBus,
    config?: Partial<Epic2FadecConfig>,
  ) {
    const numberOfEngines = config?.numberOfEngines ?? 1;

    super(bus,
      [
        {
          name: Epic2FadecModes.TO,

          /** @inheritdoc */
          accept: (): boolean => true,

          /** @inheritdoc */
          computeDesiredThrottle: (index: number, throttleLeverPos: number): number => throttleLeverPos,

          /** @inheritdoc */
          getVisibleThrottlePos: (index: number, throttleLeverPos: number): number => throttleLeverPos,
        },
      ],
      Array.from({ length: numberOfEngines }, (_, i) => ({ index: i + 1, leverPosTopic: `v_throttle_lever_pos_${i + 1}`, visiblePosSimVar: `L:XMLVAR_ThrottlePosition_${i + 1}` })),
    );

    this.config = {
      numberOfEngines,
    };

    Wait.awaitSubscribable(GameStateProvider.get(), (state) => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      this.isGameStateInit = true;

      if (this.isThrottleLeverManagerInit) {
        this.start(Epic2JetFadec.UPDATE_FREQ);
      }
    });
  }

  /**
   * Responds to when a throttle lever position is requested.
   * @param index The index of the throttle lever.
   * @param currentPos The current position of the throttle lever, from -1 to +1.
   * @param newPos The requested new position, from -1 to +1.
   * @param keyEvent The key event that triggered the request.
   * @returns The actual throttle lever position to set.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onThrottleLeverPosRequested(index: number, currentPos: number, newPos: number, keyEvent?: string): number {
    if (index > this.config.numberOfEngines) {
      return 0;
    }

    if (this.onThrottleLeverKeyEvent && keyEvent !== undefined) {
      newPos = this.onThrottleLeverKeyEvent(index as AutothrottleThrottleIndex, currentPos, newPos, keyEvent);
    }

    return newPos;
  }

  /** @inheritdoc */
  public get engineType(): Epic2EngineType {
    return Epic2EngineType.Jet;
  }

  /**
   * The number of engines configured for this plane.
   * @returns the number of engines configured for this plane.
   */
  public get numberOfEngines(): AutothrottleThrottleIndex {
    return this.config.numberOfEngines;
  }
}
