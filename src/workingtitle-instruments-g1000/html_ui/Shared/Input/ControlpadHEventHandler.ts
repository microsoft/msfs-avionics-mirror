/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FmsHEvent } from '../UI/FmsHEvent';

export enum ControlPadKeyOperations {
  None,
  InsertCharacter,
  ApplyBackSpace,
  ReverseSign,
}

/**
 *
 */
interface KeyboardEventTranslationResult {
  /** The operation found by the evaluation */
  KeyboardOperation: ControlPadKeyOperations,
  /** Pressed key as string, to be inserted e.g. into InputComponent */
  ReceivedKey: string | null
}

/**
 * Handling the raw H-events, coming from the control pad (e.g. of the SR22).
 * This provides an abstraction for the 40 raw events, which are translated into three operations:
 * - insert character
 * - backspace
 * - signReversal (+/-)
 */
export class ControlpadHEventHandler {

  private static prefetchedCharacter: string | undefined;

  private static readonly touchPadKeyMap = new Map<FmsHEvent, string>([
    [FmsHEvent.A, 'A'],
    [FmsHEvent.B, 'B'],
    [FmsHEvent.C, 'C'],
    [FmsHEvent.D, 'D'],
    [FmsHEvent.E, 'E'],
    [FmsHEvent.F, 'F'],
    [FmsHEvent.G, 'G'],
    [FmsHEvent.H, 'H'],
    [FmsHEvent.I, 'I'],
    [FmsHEvent.J, 'J'],
    [FmsHEvent.K, 'K'],
    [FmsHEvent.L, 'L'],
    [FmsHEvent.M, 'M'],
    [FmsHEvent.N, 'N'],
    [FmsHEvent.O, 'O'],
    [FmsHEvent.P, 'P'],
    [FmsHEvent.Q, 'Q'],
    [FmsHEvent.R, 'R'],
    [FmsHEvent.S, 'S'],
    [FmsHEvent.T, 'T'],
    [FmsHEvent.U, 'U'],
    [FmsHEvent.V, 'V'],
    [FmsHEvent.W, 'W'],
    [FmsHEvent.X, 'X'],
    [FmsHEvent.Y, 'Y'],
    [FmsHEvent.Z, 'Z'],
    [FmsHEvent.SPC, ' '],
    [FmsHEvent.D0, '0'],
    [FmsHEvent.D1, '1'],
    [FmsHEvent.D2, '2'],
    [FmsHEvent.D3, '3'],
    [FmsHEvent.D4, '4'],
    [FmsHEvent.D5, '5'],
    [FmsHEvent.D6, '6'],
    [FmsHEvent.D7, '7'],
    [FmsHEvent.D8, '8'],
    [FmsHEvent.D9, '9'],
    [FmsHEvent.Dot, '.'],
  ]);


  /**
   * Checks an FmsHEvent whether it represents a character key from the controlpad keyboard
   * @param evt FmsHEvent, which needs to be checked
   * @returns boolean result of check
   */
  public static isKeyboardTextInput(evt: FmsHEvent): boolean {
    return this.touchPadKeyMap.has(evt);
  }

  /**
   * Translate an FmsHEvent into one of the keyboard operations insert character, backspace or +/-
   * @param evt FmsHEvent, which needs to be translated
   * @returns the found keyboard input operation and the key as string argument if available
   */
  public static evaluateKeyboardInput(evt: FmsHEvent): KeyboardEventTranslationResult {
    const containedCharacter = this.touchPadKeyMap.get(evt);
    if (containedCharacter !== undefined) {
      ControlpadHEventHandler.prefetchedCharacter = containedCharacter;
      return { KeyboardOperation: ControlPadKeyOperations.InsertCharacter, ReceivedKey: containedCharacter };
    } else {
      switch (evt) {
        case FmsHEvent.BKSP:
          return { KeyboardOperation: ControlPadKeyOperations.ApplyBackSpace, ReceivedKey: null };
        case FmsHEvent.PlusMinus:
          return { KeyboardOperation: ControlPadKeyOperations.ReverseSign, ReceivedKey: null };
        default:
          return { KeyboardOperation: ControlPadKeyOperations.None, ReceivedKey: null };
      }
    }
  }

  /**
   * This static method returns the character, which was evaluated the last time, when evaluateKeyboardInput was called.
   * @returns prefetched character.
   */
  public static getPrefetchedCharacter(): string | undefined {
    const prefetchedCharacter = ControlpadHEventHandler.prefetchedCharacter;
    ControlpadHEventHandler.prefetchedCharacter = undefined;
    return prefetchedCharacter;
  }

  /** This static method clears the character, which was evaluated when evaluateKeyboardInput was called the last time.   */
  public static clearPrefetchedCharacter(): void {
    ControlpadHEventHandler.prefetchedCharacter = undefined;
  }

}

