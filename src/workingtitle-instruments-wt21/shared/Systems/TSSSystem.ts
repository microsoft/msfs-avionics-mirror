import { AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, DebounceTimer, EventBus } from '@microsoft/msfs-sdk';

import { TDRSystemEvents } from './TDRSystem';

/**
 * The TSS system.
 */
export class TSSSystem extends BasicAvionicsSystem<TSSSystemEvents> {
  protected initializationTime = 500;
  private tdrState: AvionicsSystemState | undefined;
  /** A timeout after which failed state will occur. */
  protected readonly failureTimer = new DebounceTimer();

  /**
   * Creates an instance of the TSS System.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly bus: EventBus) {
    super(index, bus, 'tss_state');
    this.connectToPower('elec_av1_bus');

    this.bus.getSubscriber<TDRSystemEvents>()
      .on('tdr_state')
      .whenChanged()
      .handle(evt => {
        this.tdrState = evt.current;
        this.evaluateState(this.state);
      });
  }

  /**
   * Starts the initialization logic for this system.
   */
  private startInitializing(): void {
    this.failureTimer.clear();
    this.setState(AvionicsSystemState.Initializing);
    this.initializationTimer.schedule(() => {
      this.setState(AvionicsSystemState.On);
    }, this.initializationTime);
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    this.evaluateState(currentState);
  }

  /**
   * Checks if the System is read to initialize
   * @param currentState The current state of the system.
   */
  private evaluateState(currentState: AvionicsSystemState | undefined): void {
    if (currentState !== AvionicsSystemState.Off) {
      if (this.tdrState !== AvionicsSystemState.On) {
        if (currentState !== AvionicsSystemState.Failed) {
          this.setState(AvionicsSystemState.Off);
          this.initializationTimer.clear();
          this.failureTimer.schedule(() => {
            this.setState(AvionicsSystemState.Failed);
          }, 1000);
        }
      } else if (currentState !== AvionicsSystemState.On) {
        this.startInitializing();
      }
    } else {
      this.failureTimer.clear();
      this.initializationTimer.clear();
    }
  }
}

/**
 * Events fired by the TSS system.
 */
export interface TSSSystemEvents {
  /** An event fired when the TSS system state changes. */
  'tss_state': AvionicsSystemStateEvent;
}