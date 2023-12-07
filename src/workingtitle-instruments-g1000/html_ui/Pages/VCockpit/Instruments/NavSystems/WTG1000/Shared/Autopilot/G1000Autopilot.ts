import { APAltitudeModes, APLateralModes, APStateManager, APVerticalModes, EventBus, FlightPlanner, Subject } from '@microsoft/msfs-sdk';

import { FmaDataEvents, GarminAPConfigInterface, GarminAutopilot, GarminAutopilotOptions } from '@microsoft/msfs-garminsdk';

import { G1000ControlEvents } from '../G1000Events';
import { G1000APSimVarEvents } from '../Instruments/G1000APPublisher';

/**
 * A Garmin GFC700 autopilot.
 */
export class G1000Autopilot extends GarminAutopilot {
  public readonly externalAutopilotInstalled = Subject.create<boolean>(false);
  protected readonly lateralArmedModeSubject = Subject.create<APLateralModes>(APLateralModes.NONE);
  protected readonly altArmedSubject = Subject.create<boolean>(false);

  private fmaUpdateDebounce: NodeJS.Timeout | undefined;

  /**
   * Creates an instance of the G1000Autopilot.
   * @param bus The event bus.
   * @param flightPlanner This autopilot's associated flight planner.
   * @param config This autopilot's configuration.
   * @param stateManager This autopilot's state manager.
   * @param options Options with which to configure the new autopilot.
   */
  constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner,
    config: GarminAPConfigInterface,
    stateManager: APStateManager,
    options?: Readonly<GarminAutopilotOptions>
  ) {
    super(bus, flightPlanner, config, stateManager, options);

    const publisher = this.bus.getPublisher<G1000ControlEvents & FmaDataEvents>();
    this.fmaData.sub(() => {
      // dirty debounce, need better ObjectSubject
      if (this.fmaUpdateDebounce) {
        return;
      }

      this.fmaUpdateDebounce = setTimeout(() => {
        this.fmaUpdateDebounce = undefined;
        publisher.pub('fma_modes', this.fmaData.get(), true);
        publisher.pub('fma_data', Object.assign({}, this.fmaData.get()), true, true); //For GoAroundManager
      }, 0);
    }, true);
  }

  /** @inheritdoc */
  protected onAfterUpdate(): void {
    if (!this.externalAutopilotInstalled.get()) {
      this.updateG1000Fma();
    } else {
      this.lateralArmedModeSubject.set(this.apValues.lateralArmed.get());
      this.altArmedSubject.set(this.altCapArmed);
    }
  }

  /** @inheritdoc */
  protected monitorAdditionalEvents(): void {
    super.monitorAdditionalEvents();

    //check for KAP140 installed
    const g1000APSimvars = this.bus.getSubscriber<G1000APSimVarEvents>();
    g1000APSimvars.on('kap_140_installed').whenChanged().handle(this.setExternalAutopilotInstalled.bind(this));
    g1000APSimvars.on('kap_140_installed_old').whenChanged().handle(this.setExternalAutopilotInstalled.bind(this));
  }

  /**
   * Called when an external AP installed event is received from the bus.
   * @param installed Whether an external AP is installed.
   */
  private setExternalAutopilotInstalled(installed: boolean): void {

    if (installed) {
      this.externalAutopilotInstalled.set(installed);
      this.config.defaultVerticalMode = APVerticalModes.VS;
      this.config.defaultLateralMode = APLateralModes.LEVEL;
      this.altSelectManager.setEnabled(false);
      this.handleApFdStateChange();
      this.updateG1000Fma(true);
      this.bus.getPublisher<G1000ControlEvents>().pub('fd_not_installed', true, true);
    }

  }

  /**
   * Publishes data for the FMA.
   * @param clear Is to clear the FMA
   */
  private updateG1000Fma(clear = false): void {
    const fmaTemp = this.fmaData;
    fmaTemp.set('verticalApproachArmed', (clear ? APVerticalModes.NONE : this.verticalApproachArmed));
    fmaTemp.set('verticalArmed', (clear ? APVerticalModes.NONE : this.apValues.verticalArmed.get()));
    fmaTemp.set('verticalActive', (clear ? APVerticalModes.NONE : this.apValues.verticalActive.get()));
    fmaTemp.set('verticalAltitudeArmed', (clear ? APAltitudeModes.NONE : this.verticalAltitudeArmed));
    fmaTemp.set('altitideCaptureArmed', (clear ? false : this.altCapArmed));
    fmaTemp.set('altitideCaptureValue', (clear ? -1 : this.apValues.capturedAltitude.get()));
    fmaTemp.set('lateralActive', (clear ? APLateralModes.NONE : this.apValues.lateralActive.get()));
    fmaTemp.set('lateralArmed', (clear ? APLateralModes.NONE : this.apValues.lateralArmed.get()));
    fmaTemp.set('lateralModeFailed', (clear ? false : this.lateralModeFailed));
  }
}