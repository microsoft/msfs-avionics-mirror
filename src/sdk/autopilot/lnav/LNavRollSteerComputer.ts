import { NavMath } from '../../geo/NavMath';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { Accessible } from '../../sub/Accessible';
import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { ArcTurnController } from '../calculators/ArcTurnController';
import { LNavRollSteerCommand, LNavSteerCommand } from './LNavTypes';

/**
 * A provider of data for {@link LNavRollSteerComputer}.
 */
export interface LNavRollSteerComputerDataProvider {
  /** The current LNAV steering command. */
  readonly lnavSteerCommand: Accessible<Readonly<LNavSteerCommand>>;

  /** The airplane's ground speed, in knots, or `null` if data is not available. */
  readonly gs: Accessible<number | null>;

  /** The airplane's true ground track, in degrees, or `null` if data is not available. */
  readonly track: Accessible<number | null>;

  /** The airplane's true heading, in degrees, or `null` if data is not available. */
  readonly heading: Accessible<number | null>;
}

/**
 * Configuration options for {@link LNavRollSteerComputer}.
 */
export type LNavRollSteerComputerOptions = {
  /**
   * The maximum bank angle, in degrees, that the computer is allowed to command, or a function which returns it.
   * Defaults to `30`.
   */
  maxBankAngle?: number | (() => number);
};

/**
 * A computer that generates roll-steering commands from LNAV steering commands.
 */
export class LNavRollSteerComputer {
  private readonly arcController = new ArcTurnController();

  private readonly maxBankAngleFunc: () => number;

  private readonly steerCommandBuffer: [LNavRollSteerCommand, LNavRollSteerCommand] = [
    { isValid: false, isHeading: false, courseToSteer: 0, trackRadius: 0, dtk: 0, xtk: 0, tae: 0, desiredBankAngle: 0 },
    { isValid: false, isHeading: false, courseToSteer: 0, trackRadius: 0, dtk: 0, xtk: 0, tae: 0, desiredBankAngle: 0 }
  ];

  private readonly _steerCommand = Subject.create(
    this.steerCommandBuffer[0],
    (a, b) => {
      if (!a.isValid && !b.isValid) {
        return true;
      }

      return a.isValid === b.isValid
        && a.isHeading === b.isHeading
        && a.courseToSteer === b.courseToSteer
        && a.trackRadius === b.trackRadius
        && a.dtk === b.dtk
        && a.xtk === b.xtk
        && a.tae === b.tae;
    }
  );
  /** The current roll steering command calculated by this computer. */
  public readonly steerCommand = this._steerCommand as Subscribable<Readonly<LNavRollSteerCommand>>;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of LNavRollSteerComputer.
   * @param dataProvider A provider of data for this computer.
   * @param options Options with which to configure the computer.
   */
  public constructor(
    private readonly dataProvider: LNavRollSteerComputerDataProvider,
    options?: Readonly<LNavRollSteerComputerOptions>
  ) {
    const maxBankAngleOpt = options?.maxBankAngle ?? undefined;
    switch (typeof maxBankAngleOpt) {
      case 'number':
        this.maxBankAngleFunc = () => maxBankAngleOpt;
        break;
      case 'function':
        this.maxBankAngleFunc = maxBankAngleOpt;
        break;
      default:
        this.maxBankAngleFunc = () => 30;
    }
  }

  /**
   * Resets this computer.
   */
  public reset(): void {
    this.arcController.reset();
    this.lastUpdateTime = undefined;
  }

  /**
   * Updates this computer.
   * @param time The current timestamp, in milliseconds.
   */
  public update(time: number): void {
    // TODO: make the arc controller use the time passed into update() instead of hardcoding it to use operating system
    // time (via Date()).

    const lnavSteerCommand = this.dataProvider.lnavSteerCommand.get();

    if (lnavSteerCommand.isValid) {
      const desiredBankAngle = this.getDesiredBankAngle();
      if (desiredBankAngle === undefined) {
        this.arcController.reset();
        this.setSteerCommand(lnavSteerCommand, false, 0);
      } else {
        this.setSteerCommand(lnavSteerCommand, true, desiredBankAngle);
      }
    } else {
      this.arcController.reset();
      this.setSteerCommand(lnavSteerCommand, false, 0);
    }

    this.lastUpdateTime = time;
  }

  /**
   * Sets this computer's roll steering command.
   * @param lnavSteerCommand The LNAV steering command from which the roll steering command was generated.
   * @param isValid Whether the roll steering command is valid.
   * @param desiredBankAngle The command's desired bank angle, in degrees. Positive values indicate leftward bank.
   */
  private setSteerCommand(
    lnavSteerCommand: Readonly<LNavSteerCommand>,
    isValid: boolean,
    desiredBankAngle: number
  ): void {
    const steerCommandBufferActiveIndex = this._steerCommand.get() === this.steerCommandBuffer[0] ? 0 : 1;
    const command = this.steerCommandBuffer[(steerCommandBufferActiveIndex + 1) % 2];

    command.isValid = isValid;
    command.isHeading = lnavSteerCommand.isHeading;
    command.courseToSteer = lnavSteerCommand.courseToSteer;
    command.trackRadius = lnavSteerCommand.trackRadius;
    command.dtk = lnavSteerCommand.dtk;
    command.xtk = lnavSteerCommand.xtk;
    command.tae = lnavSteerCommand.tae;
    command.desiredBankAngle = desiredBankAngle;

    this._steerCommand.set(command);
  }

  /**
   * Gets the desired bank angle, in degrees, for this computer's current LNAV steering command.
   * @returns The desired bank angle, in degrees, for this computer's current LNAV steering command, or `undefined` if
   * a bank angle could not be computed. Positive values indicate leftward bank.
   */
  private getDesiredBankAngle(): number | undefined {
    const command = this.dataProvider.lnavSteerCommand.get();

    let trackToUse: number;
    let gsToUse = 0;

    if (command.isHeading) {
      const heading = this.dataProvider.heading.get();

      if (heading === null) {
        return undefined;
      }

      trackToUse = heading;
    } else {
      const track = this.dataProvider.track.get();
      const gs = this.dataProvider.gs.get();

      if (track === null || gs === null) {
        return undefined;
      }

      trackToUse = track;
      gsToUse = gs;
    }

    const maxBankAngle = this.maxBankAngleFunc();
    let desiredBankAngle = this.getDesiredBankAngleForTrack(command.courseToSteer, trackToUse, maxBankAngle);

    if (command.isHeading || command.trackRadius === MathUtils.HALF_PI) {
      this.arcController.reset();
    } else {
      desiredBankAngle = this.adjustDesiredBankAngleForTurn(command, desiredBankAngle, gsToUse, maxBankAngle);
    }

    return desiredBankAngle;
  }

  /**
   * Gets the desired bank angle, in degrees, to follow a great-circle track.
   * @param desiredTrack The desired track, in degrees.
   * @param track The plane's current track, in degrees.
   * @param maxBankAngle The maximum allowed bank angle, in degrees.
   * @returns The desired bank angle, in degrees, to follow the specified great-circle track. Positive values indicate
   * leftward bank.
   */
  private getDesiredBankAngleForTrack(desiredTrack: number, track: number, maxBankAngle: number): number {
    const turnDirection = NavMath.getTurnDirection(track, desiredTrack);
    const headingDiff = MathUtils.angularDistanceDeg(track, desiredTrack, 0);

    let baseBank = Math.min(1.25 * headingDiff, maxBankAngle);
    baseBank *= (turnDirection === 'left' ? 1 : -1);

    return baseBank;
  }

  /**
   * Adjusts a desired bank angle to follow a turning path defined by an LNAV steering command.
   * @param command The LNAV steering command that defines the turning path to follow.
   * @param desiredBankAngle The desired bank angle, in degrees, before adjusting for the turning path. Positive values
   * indicate leftward bank.
   * @param gs The plane's current ground speed, in knots.
   * @param maxBankAngle The maximum allowed bank angle, in degrees.
   * @returns The adjusted desired bank angle to follow the specified turning path, in degrees. Positive values
   * indicate leftward bank.
   */
  private adjustDesiredBankAngleForTurn(
    command: Readonly<LNavSteerCommand>,
    desiredBankAngle: number,
    gs: number,
    maxBankAngle: number
  ): number {
    const trackTurnRadiusMeters = UnitType.GA_RADIAN.convertTo(Math.min(command.trackRadius, Math.PI - command.trackRadius), UnitType.METER);

    const xtkMeters = UnitType.NMILE.convertTo(command.xtk, UnitType.METER);
    const bankAdjustment = this.arcController.getOutput(xtkMeters);

    const turnBankAngle = NavMath.bankAngle(gs, trackTurnRadiusMeters) * (command.trackRadius < MathUtils.HALF_PI ? 1 : -1);
    const turnRadius = NavMath.turnRadius(gs, maxBankAngle);

    const bankBlendFactor = Math.max(1 - (Math.abs(xtkMeters) / turnRadius), 0);

    return MathUtils.clamp(
      (desiredBankAngle * (1 - bankBlendFactor)) + (turnBankAngle * bankBlendFactor) + bankAdjustment,
      -maxBankAngle,
      maxBankAngle
    );
  }
}
