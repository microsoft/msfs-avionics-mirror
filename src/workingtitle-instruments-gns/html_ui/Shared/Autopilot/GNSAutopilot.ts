import {
  AltitudeSelectManagerOptions, APAltitudeModes, APConfig, APLateralModes, APStateManager, APVerticalModes, Autopilot, DirectorState, EventBus, FlightPlanner,
  MetricAltitudeSettingsManager, Subject, UnitType
} from '@microsoft/msfs-sdk';
import { GNSAPConfig } from './GNSAPConfig';

/**
 * A Garmin GNS Generic autopilot.
 */
export class GNSAutopilot extends Autopilot {
  private static readonly ALT_SELECT_OPTIONS: AltitudeSelectManagerOptions = {
    supportMetric: true,
    minValue: UnitType.FOOT.createNumber(-1000),
    maxValue: UnitType.FOOT.createNumber(50000),
    inputIncrLargeThreshold: 999,
    incrSmall: UnitType.FOOT.createNumber(100),
    incrLarge: UnitType.FOOT.createNumber(1000),
    incrSmallMetric: UnitType.METER.createNumber(50),
    incrLargeMetric: UnitType.METER.createNumber(500),
    initToIndicatedAlt: true
  };

  public readonly externalAutopilotInstalled = Subject.create<boolean>(false);

  // protected readonly altSelectManager = new AltitudeSelectManager(this.bus, this.settingsManager, GNSAutopilot.ALT_SELECT_OPTIONS);

  private fmaUpdateDebounce: NodeJS.Timeout | undefined;

  /**
   * Creates an instance of the GNS Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param settingsManager The settings manager to pass to altitude preselect system.
   */
  constructor(bus: EventBus, flightPlanner: FlightPlanner, config: APConfig, stateManager: APStateManager,
    private readonly settingsManager?: MetricAltitudeSettingsManager) {
    super(bus, flightPlanner, config, stateManager);
  }

  /** @inheritdoc */
  protected onAfterUpdate(): void {
    if (!this.externalAutopilotInstalled.get()) {
      this.updateFma();
    }
  }

  /** @inheritdoc */
  protected onInitialized(): void {
    this.bus.pub('vnav_enabled', true);

    this.monitorAdditionalEvents();
  }

  /** @inheritdoc */
  protected handleApFdStateChange(): void {
    const ap = this.stateManager.apMasterOn.get();
    const fd = this.stateManager.isFlightDirectorOn.get();
    const apConfig = this.config as GNSAPConfig;
    if (ap && !fd) {
      this.stateManager.setFlightDirector(true);
    } else if (!ap && !fd) {
      this.lateralModes.forEach((mode) => {
        if (mode.state !== DirectorState.Inactive) {
          mode.deactivate();
        }
      });
      this.verticalModes.forEach((mode) => {
        if (mode.state !== DirectorState.Inactive) {
          mode.deactivate();
        }
      });
      this.apValues.lateralActive.set(APLateralModes.NONE);
      this.apValues.lateralArmed.set(APLateralModes.NONE);
      this.apValues.verticalActive.set(APVerticalModes.NONE);
      this.apValues.verticalArmed.set(APVerticalModes.NONE);
      this.verticalApproachArmed = APVerticalModes.NONE;
      this.verticalAltitudeArmed = APAltitudeModes.NONE;
      this.altCapArmed = false;
    } else if (!ap && fd && !apConfig.supportFlightDirector) {
      this.stateManager.setFlightDirector(false);
    }
  }

  /** @inheritdoc */
  protected monitorAdditionalEvents(): void {
    //noop
  }

  /**
   * Publishes data for the FMA.
   */
  private updateFma(): void {
    //noop
  }
}