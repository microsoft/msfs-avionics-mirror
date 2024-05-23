import { DebounceTimer, EventBus, Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { AvionicsConfig } from '../AvionicsConfig/AvionicsConfig';
import { GduConfig } from '../AvionicsConfig/GduDefsConfig';
import { AvionicsStatusChangeEvent, AvionicsStatusEvents } from '../AvionicsStatus/AvionicsStatusEvents';
import { AvionicsStatus } from '../AvionicsStatus/AvionicsStatusTypes';

/**
 * A manager that tracks whether reversionary mode should be active for a GDU.
 */
export class ReversionaryModeManager {
  private static readonly DEBOUNCE_DELAY = 3000;

  private readonly pairedGduDef: GduConfig | undefined;

  private readonly debounceTimer = new DebounceTimer();
  private isReversionaryModeArmed = false;
  private readonly setReversionaryModeFunc = this.setReversionaryMode.bind(this);

  private readonly _isReversionaryMode = Subject.create(false);
  /** Whether reversionary mode should be active. */
  public readonly isReversionaryMode = this._isReversionaryMode as Subscribable<boolean>;

  private isAlive = true;
  private isActive = false;

  private readonly pairedStatusSub?: Subscription;

  /**
   * Creates a new instance of ReversionaryModeManager.
   * @param bus The event bus.
   * @param config The general avionics configuration object.
   * @param gduIndex The index of this manager's parent GDU.
   */
  public constructor(
    private readonly bus: EventBus,
    config: AvionicsConfig,
    private readonly gduIndex: number
  ) {
    const selfGduDef = config.gduDefs.definitions[this.gduIndex];

    // A GDU should enter reversionary mode if its paired GDU is not functioning properly. For any GDU, its paired GDU
    // is the GDU with the opposite instrument type that has the highest type index less than or equal to the original
    // GDU's type index. Note that pairings are not necessarily symmetric.
    // For example, in an installation with PFD1, MFD1, and PFD2, paired GDU assignments are as follows:
    // - PFD1's paired GDU is MFD1
    // - MFD1's paired GDU is PFD1
    // - PFD2's paired GDU is MFD1
    const pairedType = selfGduDef.type === 'PFD' ? 'MFD' : 'PFD';
    this.pairedGduDef = config.gduDefs.definitions.reduce<GduConfig | undefined>(
      (paired, def) => {
        return def
          && def.type === pairedType
          && def.typeIndex <= selfGduDef.typeIndex
          && (!paired || def.typeIndex > paired.typeIndex)
          ? def : paired;
      },
      undefined
    );

    if (this.pairedGduDef) {
      const sub = this.bus.getSubscriber<AvionicsStatusEvents>();
      this.pairedStatusSub = sub.on(`avionics_status_${this.pairedGduDef.index}`).handle(this.onPairedGduStatusChanged.bind(this), true);
    }
  }

  /**
   * Activates this manager. While activated, this manager will automatically keep track of whether reversionary mode
   * should be active for its parent GDU.
   * @throws Error if this manager has been destroyed.
   */
  public activate(): void {
    if (!this.isAlive) {
      throw new Error('ReversionaryModeManager: cannot activate a dead manager');
    }

    if (this.isActive) {
      return;
    }

    this.isActive = true;

    this.pairedStatusSub?.resume(true);
  }

  /**
   * Deactivates this manager. While deactivated, this manager will not automatically keep track of whether reversionary mode
   * should be active for its parent GDU, and the value of the `this.isReversionaryMode` subscribable is set to `false`.
   * @throws Error if this manager has been destroyed.
   */
  public deactivate(): void {
    if (!this.isAlive) {
      throw new Error('ReversionaryModeManager: cannot deactivate a dead manager');
    }

    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    this.pairedStatusSub?.pause();
    this.debounceTimer.clear();
    this.isReversionaryModeArmed = false;
    this._isReversionaryMode.set(false);
  }

  /**
   * Responds to when the avionics status of this manager's paired GDU changes.
   * @param event The event describing the avionics status change.
   */
  private onPairedGduStatusChanged(event: Readonly<AvionicsStatusChangeEvent>): void {
    const isReversionaryMode = this._isReversionaryMode.get();
    const needReversionaryMode = event.current !== AvionicsStatus.On && event.current !== AvionicsStatus.Reversionary;

    if (needReversionaryMode === isReversionaryMode) {
      this.debounceTimer.clear();
      this.isReversionaryModeArmed = false;
    } else {
      if (needReversionaryMode) {
        if (!this.isReversionaryModeArmed || !this.debounceTimer.isPending()) {
          this.isReversionaryModeArmed = true;
          this.debounceTimer.schedule(this.setReversionaryModeFunc, ReversionaryModeManager.DEBOUNCE_DELAY);
        }
      } else {
        this.debounceTimer.clear();
        this.isReversionaryModeArmed = false;
        this._isReversionaryMode.set(false);
      }
    }
  }

  /**
   * Sets this manager to request that reversionary mode should be active if reversionary mode is armed.
   */
  private setReversionaryMode(): void {
    if (this.isReversionaryModeArmed) {
      this.isReversionaryModeArmed = false;
      this._isReversionaryMode.set(true);
    }
  }

  /**
   * Destroys this manager. After this manager is destroyed, it will no longer keep track of whether reversionary mode
   * should be active and can no longer be activated or deactivated.
   */
  public destroy(): void {
    this.isAlive = false;

    this.debounceTimer.clear();

    this.pairedStatusSub?.destroy();
  }
}