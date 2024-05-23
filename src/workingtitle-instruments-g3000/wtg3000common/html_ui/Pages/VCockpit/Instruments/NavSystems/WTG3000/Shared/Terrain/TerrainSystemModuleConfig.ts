import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, TerrainSystemModule } from '@microsoft/msfs-garminsdk';

import { ResolvableConfig } from '../Config/Config';
import { G3000FlightPlannerId } from '../CommonTypes';

/**
 * A configuration object that defines a terrain alerting system module.
 */
export type TerrainSystemModuleConfig = ResolvableConfig<(bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule>;
