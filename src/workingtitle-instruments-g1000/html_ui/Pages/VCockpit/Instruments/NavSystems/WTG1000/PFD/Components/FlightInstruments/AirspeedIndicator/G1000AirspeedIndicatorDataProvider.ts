import { EventBus } from '@microsoft/msfs-sdk';

import { DefaultAirspeedIndicatorDataProvider } from '@microsoft/msfs-garminsdk';

import { AirspeedIndicatorConfig } from '../../../../Shared/Profiles/AirspeedIndicator/AirspeedIndicatorConfig';

/**
 * A G1000 NXi provider of airspeed indicator data.
 */
export class G1000AirspeedIndicatorDataProvider extends DefaultAirspeedIndicatorDataProvider {
  /**
   * Creates a new instance of G1000AirspeedIndicatorDataProvider.
   * @param bus The event bus.
   * @param config A configuration object defining options for the airspeed indicator.
   */
  public constructor(bus: EventBus, config: AirspeedIndicatorConfig) {
    super(bus, 1, config.dataProviderOptions);
  }
}