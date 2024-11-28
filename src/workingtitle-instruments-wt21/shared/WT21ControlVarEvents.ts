import { EventBus, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * WT21 specific events controlled by simvars
 */
export interface WT21ControlSimVarEvents {
  /** Is the aircraft in dispatch mode? */
  wt21_dispatch_mode_enabled: boolean
}

export enum WT21ControlVars {
  DispatchMode = 'L:1:WT21_Dispatch_Mode'
}

/**
 * A publisher for WT21 control events from lvars
 */
export class WT21ControlSimVarPublisher extends SimVarPublisher<WT21ControlSimVarEvents> {
  /** @inheritdoc */
  public constructor(bus: EventBus) {
    super([
      ['wt21_dispatch_mode_enabled', { name: WT21ControlVars.DispatchMode, type: SimVarValueType.Bool }],
    ], bus);
  }
}
