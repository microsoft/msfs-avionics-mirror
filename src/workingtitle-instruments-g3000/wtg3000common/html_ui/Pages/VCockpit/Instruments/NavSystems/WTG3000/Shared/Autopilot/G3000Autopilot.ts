import { APStateManager, EventBus, FlightPlanner, MetricAltitudeSettingsManager } from '@microsoft/msfs-sdk';
import { GarminAPConfigInterface, GarminAutopilot, MinimumsDataProvider } from '@microsoft/msfs-garminsdk';

/**
 * A G3000 autopilot.
 */
export class G3000Autopilot extends GarminAutopilot {

  /**
   * Creates a new instance of G3000Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param metricAltSettingsManager A manager of metric altitude mode user settings.
   * @param minimumsDataProvider A provider of minimums data.
   */
  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    config: GarminAPConfigInterface,
    stateManager: APStateManager,
    metricAltSettingsManager: MetricAltitudeSettingsManager,
    minimumsDataProvider: MinimumsDataProvider
  ) {
    super(bus, flightPlanner, config, stateManager, {
      metricAltSettingsManager,
      minimumsDataProvider,
      supportMachSelect: true
    });
  }
}