import { BitFlags, EventBus, PublishPacer, SimVarPublisher, SimVarPublisherEntry, SimVarValueType } from '@microsoft/msfs-sdk';
import { Epic2MaxBankIndex } from './Epic2VariableBankManager';

export enum FlightDirectorCouplingFlags {
  Left = 1 << 0,
  Right = 1 << 1,
  Both = Left | Right,
}

/** Events from the Epic2 AP Panel Lvars. */
export interface Epic2ApPanelEvents {
  /** Whether a half bank mode is on. Full bank mode when false. */
  epic2_ap_half_bank_mode: Epic2MaxBankIndex,
  /** Whether FMS mode is selected. Manual speed target mode when false. */
  epic2_ap_fms_man_selector: boolean,
  /** Whether track mode is selected. Heading mode when false. */
  epic2_ap_hdg_trk_selector: boolean,
  /** The flight director coupling. Can be left, right, or both only on ILS approaches. */
  epic2_ap_fd_coupling: FlightDirectorCouplingFlags,
}

/** A publisher for Epic2 AP panel Lvars. */
export class Epic2ApPanelPublisher extends SimVarPublisher<Epic2ApPanelEvents> {
  /**
   * Create a Epic2ApPanelPublisher.
   * @param bus The EventBus to use for publishing.
   * @param pacer An optional pacer to control the rate of publishing.
   */
  constructor(bus: EventBus, pacer?: PublishPacer<Epic2ApPanelEvents>) {
    super(new Map<keyof Epic2ApPanelEvents, SimVarPublisherEntry<any>>([
      ['epic2_ap_half_bank_mode', { name: 'L:WT_Epic2_Half_Bank_Mode', type: SimVarValueType.Enum }],
      ['epic2_ap_fms_man_selector', { name: 'L:XMLVAR_FMS_MAN', type: SimVarValueType.Bool }],
      ['epic2_ap_hdg_trk_selector', { name: 'L:XMLVAR_HDG_TRK', type: SimVarValueType.Bool }],
      ['epic2_ap_fd_coupling', { name: 'L:XMLVAR_AUTOPILOT_LR', type: SimVarValueType.Enum, map: Epic2ApPanelPublisher.mapFdCoupling }],
    ]), bus, pacer);
  }

  /**
   * Maps only valid FD coupling flags.
   * @param couplingFlags The coupling flags to map.
   * @returns The input value if valid, else FlightDirectorCouplingFlags.Left.
   */
  private static mapFdCoupling(couplingFlags: number): FlightDirectorCouplingFlags {
    if (BitFlags.isAny(couplingFlags, FlightDirectorCouplingFlags.Both)) {
      return couplingFlags & FlightDirectorCouplingFlags.Both;
    }
    return FlightDirectorCouplingFlags.Left;
  }
}
