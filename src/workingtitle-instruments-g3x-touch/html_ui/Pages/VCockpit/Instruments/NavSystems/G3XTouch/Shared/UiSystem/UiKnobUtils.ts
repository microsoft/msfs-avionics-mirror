import { MappedSubject, MappedSubscribable, MutableSubscribableMap, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import {
  UiInnerKnobId, UiKnobGroup, UiKnobId, UiKnobIdGroupMap, UiKnobRequestedLabelState, UiOuterKnobId, UiPushKnobId,
  UiTurnKnobId
} from './UiKnobTypes';

/**
 * A utility class for working with G3X Touch bezel rotary knobs.
 */
export class UiKnobUtils {
  /** An array of all bezel rotary knob IDs. */
  public static readonly ALL_KNOB_IDS = [
    UiKnobId.SingleOuter,
    UiKnobId.SingleInner,
    UiKnobId.SingleInnerPush,
    UiKnobId.LeftOuter,
    UiKnobId.LeftInner,
    UiKnobId.LeftInnerPush,
    UiKnobId.RightOuter,
    UiKnobId.RightInner,
    UiKnobId.RightInnerPush,
  ] as const;

  /** An array of outer bezel rotary knob IDs. */
  public static readonly OUTER_KNOB_IDS = [
    UiKnobId.SingleOuter,
    UiKnobId.LeftOuter,
    UiKnobId.RightOuter,
  ] as const;

  /** An array of inner bezel rotary knob IDs. */
  public static readonly INNER_KNOB_IDS = [
    UiKnobId.SingleInner,
    UiKnobId.SingleInnerPush,
    UiKnobId.LeftInner,
    UiKnobId.LeftInnerPush,
    UiKnobId.RightInner,
    UiKnobId.RightInnerPush,
  ] as const;

  /** An array of IDs of bezel rotary knobs that can be turned. */
  public static readonly TURN_KNOB_IDS = [
    UiKnobId.SingleOuter,
    UiKnobId.SingleInner,
    UiKnobId.LeftOuter,
    UiKnobId.LeftInner,
    UiKnobId.RightOuter,
    UiKnobId.RightInner,
  ] as const;

  /** An array of IDs of bezel rotary knobs that can be pushed. */
  public static readonly PUSH_KNOB_IDS = [
    UiKnobId.SingleInnerPush,
    UiKnobId.LeftInnerPush,
    UiKnobId.RightInnerPush,
  ] as const;

  /** Mappings from G3X Touch bezel rotary knob IDs to the groups to which they belong. */
  public static readonly KNOB_ID_TO_KNOB_GROUP: UiKnobIdGroupMap = {
    [UiKnobId.SingleOuter]: UiKnobGroup.Single,
    [UiKnobId.SingleInner]: UiKnobGroup.Single,
    [UiKnobId.SingleInnerPush]: UiKnobGroup.Single,
    [UiKnobId.LeftOuter]: UiKnobGroup.Left,
    [UiKnobId.LeftInner]: UiKnobGroup.Left,
    [UiKnobId.LeftInnerPush]: UiKnobGroup.Left,
    [UiKnobId.RightOuter]: UiKnobGroup.Right,
    [UiKnobId.RightInner]: UiKnobGroup.Right,
    [UiKnobId.RightInnerPush]: UiKnobGroup.Right,
  };

  /**
   * Checks if a bezel rotary knob ID belongs to an outer knob.
   * @param knobId The bezel rotary knob ID to check.
   * @returns Whether the specified bezel rotary ID belongs to an outer knob.
   */
  public static isOuterKnobId(knobId: UiKnobId): knobId is UiOuterKnobId {
    return (UiKnobUtils.OUTER_KNOB_IDS as readonly UiKnobId[]).includes(knobId);
  }

  /**
   * Checks if a bezel rotary knob ID belongs to an inner knob.
   * @param knobId The bezel rotary knob ID to check.
   * @returns Whether the specified bezel rotary ID belongs to an inner knob.
   */
  public static isInnerKnobId(knobId: UiKnobId): knobId is UiInnerKnobId {
    return (UiKnobUtils.INNER_KNOB_IDS as readonly UiKnobId[]).includes(knobId);
  }

  /**
   * Checks if a bezel rotary knob ID belongs to a knob that can be turned.
   * @param knobId The bezel rotary knob ID to check.
   * @returns Whether the specified bezel rotary ID belongs to a knob that can be turned.
   */
  public static isTurnKnobId(knobId: UiKnobId): knobId is UiTurnKnobId {
    return (UiKnobUtils.TURN_KNOB_IDS as readonly UiKnobId[]).includes(knobId);
  }

  /**
   * Checks if a bezel rotary knob ID belongs to a knob that can be pushed.
   * @param knobId The bezel rotary knob ID to check.
   * @returns Whether the specified bezel rotary ID belongs to a knob that can be pushed.
   */
  public static isPushKnobId(knobId: UiKnobId): knobId is UiPushKnobId {
    return (UiKnobUtils.PUSH_KNOB_IDS as readonly UiKnobId[]).includes(knobId);
  }

  /**
   * Reconciles one or more requested knob label states and pipes the result into a {@link MutableSubscribableMap} of
   * knob label states.
   * @param knobIds The IDs of the knobs for which to reconcile label states.
   * @param pipeTo The map to which to pipe the reconciled requested label states.
   * @param paused Whether to initialize the label state pipe as paused.
   * @param requestedStates The requested knob label states to reconcile. Requested states that appear earlier in the
   * array have a higher priority. In other words, for each knob, the reconciled state will be selected from one of the
   * requested states if and only if no requested state with a lower index has requested a label for the same knob.
   * @returns A {@link Subscription} representing the created reconciled knob label state pipe.
   */
  public static reconcileRequestedLabelStates(
    knobIds: readonly UiKnobId[],
    pipeTo: MutableSubscribableMap<UiKnobId, string>,
    paused: boolean,
    ...requestedStates: Subscribable<UiKnobRequestedLabelState>[]
  ): Subscription {
    return new ReconciledLabelStateSubscription(knobIds, pipeTo, paused, requestedStates);
  }
}

/**
 * A {@link Subscription} which reconciles one or more requested knob label states and pipes the result into a
 * {@link MutableSubscribableMap} of knob label states.
 */
class ReconciledLabelStateSubscription implements Subscription {
  private _isAlive = true;
  /** @inheritDoc */
  public get isAlive(): boolean {
    return this._isAlive;
  }

  private _isPaused = true;
  /** @inheritDoc */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /** @inheritDoc */
  public readonly canInitialNotify = true;

  private readonly subject: MappedSubscribable<readonly UiKnobRequestedLabelState[]>;
  private readonly pipe: Subscription;

  /**
   * Creates a new instance of ReconciledLabelStateSubscription.
   * @param knobIds The IDs of the knobs for which to reconcile label states.
   * @param pipeTo The map to which to pipe the reconciled requested label states.
   * @param paused Whether to initialize the label state pipe as paused.
   * @param requestedStates The requested knob label states to reconcile. Requested states that appear earlier in the
   * array have a higher priority. In other words, for each knob, the reconciled state will be selected from one of the
   * requested states if and only if no requested state with a lower index has requested a label for the same knob.
   */
  public constructor(
    knobIds: readonly UiKnobId[],
    pipeTo: MutableSubscribableMap<UiKnobId, string>,
    paused: boolean,
    requestedStates: Subscribable<UiKnobRequestedLabelState>[]
  ) {
    this.subject = MappedSubject.create(...requestedStates).pause();
    this.pipe = this.subject.sub(states => {
      for (let i = 0; i < knobIds.length; i++) {
        const knobId = knobIds[i];

        let state: string | undefined;
        for (let j = 0; j < states.length; j++) {
          state = states[j].get(knobId);
          if (state !== undefined) {
            break;
          }
        }

        state === undefined ? pipeTo.delete(knobId) : pipeTo.setValue(knobId, state);
      }
    }, false, true);

    if (!paused) {
      this.resume(true);
    }
  }

  /** @inheritDoc */
  public pause(): this {
    if (!this._isAlive) {
      throw new Error('Subscription: cannot pause a dead Subscription.');
    }

    if (this._isPaused) {
      return this;
    }

    this._isPaused = true;

    this.subject.pause();
    this.pipe.pause();

    return this;
  }

  /** @inheritDoc */
  public resume(initialNotify = false): this {
    if (!this._isAlive) {
      throw new Error('Subscription: cannot resume a dead Subscription.');
    }

    if (!this._isPaused) {
      return this;
    }

    this._isPaused = false;

    this.subject.resume();
    this.pipe.resume(initialNotify);

    return this;
  }

  /** @inheritDoc */
  public destroy(): void {
    if (!this._isAlive) {
      return;
    }

    this._isAlive = false;
    this.subject.destroy();
  }
}