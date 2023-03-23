import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * Active navigation sources for Garmin avionics.
 */
export enum ActiveNavSource {
  Nav1,
  Nav2,
  Gps1,
  Gps2
}

/**
 * Sim var names for Garmin navigation data.
 */
export enum GarminNavVars {
  /** The active navigation source for the pilot. */
  ActiveNavSource1 = 'L:WTGarmin_Nav_ActiveNavSource:1',

  /** The active navigation source for the copilot. */
  ActiveNavSource2 = 'L:WTGarmin_Nav_ActiveNavSource:2'
}

/**
 * Garmin events related to navigation.
 */
export interface GarminNavEvents {
  /** The active navigation source for the pilot. */
  active_nav_source_1: ActiveNavSource;

  /** The active navigation source for the copilot. */
  active_nav_source_2: ActiveNavSource;
}

/**
 * A publisher for Garmin navigation sim var events.
 */
export class GarminNavSimVarPublisher extends SimVarPublisher<GarminNavEvents> {
  private static readonly simvars = new Map<keyof GarminNavEvents, SimVarDefinition>([
    ['active_nav_source_1', { name: GarminNavVars.ActiveNavSource1, type: SimVarValueType.Number }],
    ['active_nav_source_2', { name: GarminNavVars.ActiveNavSource2, type: SimVarValueType.Number }]
  ]);

  /**
   * Constructor.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    super(GarminNavSimVarPublisher.simvars, bus);
  }
}