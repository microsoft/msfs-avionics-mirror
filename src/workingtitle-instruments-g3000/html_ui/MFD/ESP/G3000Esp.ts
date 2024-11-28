import { EventBus, Subscribable, UserSetting } from '@microsoft/msfs-sdk';

import { Esp, EspControlInputManager, EspDataProvider, EspModule, EspOperatingMode } from '@microsoft/msfs-garminsdk';

import { EspUserSettings, G3000EspDefinition } from '@microsoft/msfs-wtg3000-common';

import { G3000EspInterface } from './G3000EspInterface';

/**
 * A G3000 electronic stability and protection (ESP) system.
 */
export class G3000Esp implements G3000EspInterface {
  private readonly esp: Esp;

  private readonly controlInputManager?: EspControlInputManager;

  private isAvionicsPowered = false;
  private readonly isEnabled: UserSetting<boolean>;

  /** @inheritDoc */
  public readonly operatingMode: Subscribable<EspOperatingMode>;

  /** @inheritDoc */
  public readonly pitchAxisForce: Subscribable<number>;

  /** @inheritDoc */
  public readonly rollAxisForce: Subscribable<number>;

  /** @inheritDoc */
  public readonly engagementTimeWindow: number;

  /** @inheritDoc */
  public readonly engagementTimeFraction: Subscribable<number>;

  /**
   * Creates a new instance of G3000Esp. The system is created in a paused state. Initializing the system and calling
   * `update()` will resume it.
   * @param bus The event bus.
   * @param dataProvider A provider of ESP data.
   * @param def A definition that describes how to create the system.
   */
  public constructor(bus: EventBus, dataProvider: EspDataProvider, def: G3000EspDefinition) {
    this.esp = new Esp(dataProvider, {
      armAglThreshold: def.armAglThreshold,
      disarmAglThreshold: def.disarmAglThreshold,
      canArmWhenAglInvalid: def.canArmWhenAglInvalid,
      armMinPitchLimit: def.armMinPitchLimit,
      armMaxPitchLimit: def.armMaxPitchLimit,
      armRollLimit: def.armRollLimit,
      pitchAxisMaxForceUp: def.pitchAxisMaxForceUp,
      pitchAxisMaxForceDown: def.pitchAxisMaxForceDown,
      pitchAxisForceRate: def.pitchAxisForceRate,
      pitchAxisUnloadRate: def.pitchAxisUnloadRate,
      rollAxisMaxForce: def.rollAxisMaxForce,
      rollAxisForceRate: def.rollAxisForceRate,
      rollAxisUnloadRate: def.rollAxisUnloadRate,
      engagementTimeWindow: def.engagementTimeWindow
    });

    for (const factory of def.moduleFactories) {
      this.esp.addModule(factory());
    }

    this.isEnabled = EspUserSettings.getManager(bus).getSetting('espEnabled');
    this.isEnabled.sub(this.updateMaster.bind(this), true);

    this.operatingMode = this.esp.operatingMode;
    this.pitchAxisForce = this.esp.pitchAxisForce;
    this.rollAxisForce = this.esp.rollAxisForce;
    this.engagementTimeWindow = this.esp.engagementTimeWindow;
    this.engagementTimeFraction = this.esp.engagementTimeFraction;

    if (!def.omitControlInputManager) {
      this.controlInputManager = new EspControlInputManager(
        bus,
        {
          pitchAxisForce: def.controlInputManagerOptions?.omitPitchAxis === true ? undefined : this.esp.pitchAxisForce,
          rollAxisForce: def.controlInputManagerOptions?.omitRollAxis === true ? undefined : this.esp.rollAxisForce
        },
        def.controlInputManagerOptions
      );
    }
  }

  /**
   * Updates the master state of this system.
   */
  private updateMaster(): void {
    this.esp.setMaster(this.isAvionicsPowered && this.isEnabled.value);
  }

  /** @inheritDoc */
  public getAllModules(): readonly EspModule[] {
    return this.esp.getAllModules();
  }

  /** @inheritDoc */
  public getModule(id: string): EspModule | undefined {
    return this.esp.getModule(id);
  }

  /**
   * Initializes this system. Once the system is initialized, it can be updated by calling `update()`.
   */
  public init(): void {
    this.esp.init();
    this.controlInputManager?.init();
  }

  /**
   * Sets whether avionics are powered.
   * @param powered Whether avionics are powered.
   */
  public setAvionicsPowered(powered: boolean): void {
    this.isAvionicsPowered = powered;
    this.updateMaster();
  }

  /** @inheritDoc */
  public setInterrupt(interrupt: boolean): void {
    this.esp.setInterrupt(interrupt);
  }

  /** @inheritDoc */
  public setFailed(failed: boolean): void {
    this.esp.setFailed(failed);
  }

  /**
   * Updates this system.
   */
  public update(): void {
    this.esp.update();
  }

  /**
   * Pauses this system. The system will be resumed the next time `update()` is called.
   */
  public pause(): void {
    this.esp.pause();
  }
}
