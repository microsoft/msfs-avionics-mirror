import { EventBus, GameStateProvider, SimVarValueType, Wait } from '@microsoft/msfs-sdk';

import { SpeedLimitEvents } from '../Instruments/SpeedLimit';

/** A controller to manage overriding the MSFS max speed. */
export class SpeedOverrideController {
  /**
   * Ctor.
   * @param bus The instrument event bus.
   */
  constructor(bus: EventBus) {
    Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.briefing || state === GameState.ingame, true).then(() => {
      bus.getSubscriber<SpeedLimitEvents>().on('speedlimit_max_ias').withPrecision(1).handle((v) =>
        SimVar.SetGameVarValue('AIRCRAFT_MAXSPEED_OVERRIDE', SimVarValueType.Knots, v - 5) // offset by 5kts to even out MSFS buffer (5kts)
      );
    });
  }
}
