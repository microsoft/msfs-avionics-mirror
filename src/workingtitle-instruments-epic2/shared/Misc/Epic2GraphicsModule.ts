import { AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus } from '@microsoft/msfs-sdk';

import { GraphicsModuleDefinition } from '../AvionicsConfig';

/**
 * Advanced graphics module events
 */
export interface Epic2GraphicsModuleEvents {
  /** State of the AGM */
  [epic2_agm_state_: `epic2_agm_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * An advanced graphics module for the Epic 2.
 * AGM1 drives the pilot PFD and upper MFD. AGM2 drives the copilot PFD and lower MFD.
 * A repeater will allow for the pilot PFD to be displayed on the copilot PFD in the event of an AGM failure
 */
export class Epic2GraphicsModule extends BasicAvionicsSystem<Epic2GraphicsModuleEvents> {
  /** @inheritdoc */
  constructor (bus: EventBus, index: number, private readonly config: GraphicsModuleDefinition) {
    super(index, bus, `epic2_agm_state_${index}`);

    if (this.config.electricLogic) {
      this.connectToPower(this.config.electricLogic);
    }
  }

  /** AGMs can take anywhere between 17.5s to 21s */
  protected initializationTime = 17500 + Math.random() * 3500;

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.On) {
      this.initializationTime = 8500 + Math.random() * 4500;
    }
  }
}
