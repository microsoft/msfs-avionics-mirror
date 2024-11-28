import { Accessible, LerpLookupTable, LNavRollSteerCommand, MathUtils, NavMath, Subscribable } from '@microsoft/msfs-sdk';

/**
 * UNS LNAV commanded heading mode steer command
 */
export class UnsLnavHeadingSteerCommand implements Accessible<Readonly<LNavRollSteerCommand>> {
  private static readonly MAX_COMMANDED_BANK_DEGREES = 30;

  private lastHeadingDiff: number | undefined = undefined;
  private readonly turnReversalThreshold = 360;
  private lockedTurnDirection: 'left' | 'right' | undefined = undefined;

  private readonly command: LNavRollSteerCommand = {
    isValid: false,
    isHeading: false,
    courseToSteer: 0,
    trackRadius: 0,
    dtk: 0,
    xtk: 0,
    tae: 0,
    desiredBankAngle: 0
  };

  /**
   * Constructor
   * @param commandedHeadingSub a subscribable to the current commanded heading, or `null` if invalid
   * @param commandedTurnDirectionSub a subscribable to the current commanded turn direction
   * @param planeHeadingSub a subscribable to the current magnetic plane heading, or `null` if invalid
   * @param planeAltitudeSub a subscribable to the current pressure plane altitude, or `null if invalid`
   * @param maxBankAngleTable a 1D lerp lookup table of altitude to max bank angle
   */
  constructor(
    private readonly commandedHeadingSub: Subscribable<number | null>,
    private readonly commandedTurnDirectionSub: Subscribable<'left' | 'right' | null>,
    private readonly planeHeadingSub: Subscribable<number | null>,
    private readonly planeAltitudeSub: Subscribable<number | null>,
    private readonly maxBankAngleTable: LerpLookupTable | undefined,
  ) {
  }

  /** @inheritDoc */
  get(): Readonly<LNavRollSteerCommand> {
    const commandedHeading = this.commandedHeadingSub.get();
    const commandedTurnDirection = this.commandedTurnDirectionSub.get();

    this.lockedTurnDirection = commandedTurnDirection ?? undefined;

    if (commandedHeading === null || this.planeHeadingSub.get() === null || this.planeAltitudeSub.get() === null) {
      this.command.isValid = false;
      return this.command;
    }

    this.command.isValid = true;
    this.command.isHeading = true;
    this.command.courseToSteer = commandedHeading;
    this.command.trackRadius = 0;
    this.command.desiredBankAngle = this.desiredBank(commandedHeading);
    this.command.dtk = commandedHeading;
    this.command.xtk = 0;
    this.command.tae = 0;
    return this.command;
  }

  /**
   * Returns the currently applicable max bank angle depending on altitude, or `15`
   *
   * @returns a number
   */
  private maxBankAngle(): number {
    const altitude = this.planeAltitudeSub.get();

    if (altitude === null) {
      return UnsLnavHeadingSteerCommand.MAX_COMMANDED_BANK_DEGREES;
    }

    let value = Number.MAX_SAFE_INTEGER;
    if (this.maxBankAngleTable) {
      value = this.maxBankAngleTable.get(altitude);
    }

    return Math.min(UnsLnavHeadingSteerCommand.MAX_COMMANDED_BANK_DEGREES, value);
  }

  /**
   * Gets a desired bank from a Target Selected Heading.
   * @param targetHeading The target heading.
   * @returns The desired bank angle.
   */
  private desiredBank(targetHeading: number): number {
    const currentHeading = this.planeHeadingSub.get();

    if (currentHeading === null) {
      return NaN;
    }

    const headingDiff = MathUtils.diffAngleDeg(currentHeading, targetHeading);

    let turnDirection: 'left' | 'right' | undefined = undefined;
    let directionalHeadingDiff: number;

    if (this.lockedTurnDirection !== undefined) {
      turnDirection = this.lockedTurnDirection;
      directionalHeadingDiff = turnDirection === 'left' ? (360 - headingDiff) % 360 : headingDiff;

      if (directionalHeadingDiff >= this.turnReversalThreshold) {
        turnDirection = undefined;
      } else if (this.lastHeadingDiff !== undefined) {
        // Check if the heading difference passed through zero in the positive to negative direction since the last
        // update. If so, we may need to issue a turn reversal.
        const headingDiffDelta = (MathUtils.diffAngleDeg(this.lastHeadingDiff, directionalHeadingDiff) + 180) % 360 - 180; // -180 to +180
        if (this.lastHeadingDiff + headingDiffDelta < 0) {
          turnDirection = undefined;
        }
      }
    }

    if (turnDirection === undefined) {
      turnDirection = NavMath.getTurnDirection(currentHeading, targetHeading);
      directionalHeadingDiff = turnDirection === 'left' ? (360 - headingDiff) % 360 : headingDiff;
    }

    if (this.turnReversalThreshold > 180) {
      this.lockedTurnDirection = turnDirection;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.lastHeadingDiff = directionalHeadingDiff!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let baseBank = Math.min(1.25 * directionalHeadingDiff!, this.maxBankAngle());
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
  }
}
