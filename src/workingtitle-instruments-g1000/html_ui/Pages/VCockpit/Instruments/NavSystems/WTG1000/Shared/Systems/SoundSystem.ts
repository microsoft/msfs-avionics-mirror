import { EventBus, SoundServer } from '@microsoft/msfs-sdk';
import { BasicAvionicsSystem } from './BasicAvionicsSystem';
import { AvionicsSystemState, AvionicsSystemStateEvent } from './G1000AvionicsSystem';

/**
 * A simple system to control the power state of the sound server.
 */
export class SoundSystem extends BasicAvionicsSystem<SoundSystemEvents> {
  private soundServer: SoundServer;
  /**
   * Creates an instance of the SoundSystem.
   * @param index The index of the system.
   * @param bus The system's event bus.
   * @param soundServer The instantiated sound server to control.
   */
  constructor(index: number, bus: EventBus, soundServer: SoundServer) {
    super(index, bus, 'soundsystem_state');
    this.soundServer = soundServer;
    this.connectToPower('elec_av1_bus');
  }

  /** @inheritdoc */
  protected setState(state: AvionicsSystemState): void {
    super.setState(state);

    if (state === AvionicsSystemState.On) {
      this.soundServer.wake();
    } else {
      this.soundServer.sleep();
    }
  }
}

/**
 * Events fired by the sound system.
 */
export interface SoundSystemEvents {
  /** AN event fired when the sound system state changes. */
  'soundsystem_state': AvionicsSystemStateEvent
}