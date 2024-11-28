import { APEvents, ArrayUtils, ClockEvents, ConsumerValue, EventBus, MappedValue, PlaneDirector, SimVarValueType, Subscription } from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from '@microsoft/msfs-garminsdk';

import { Sr22tCapsEvents } from '../../Shared/Caps/Sr22tCapsEvents';
import { Sr22tCapsState } from '../../Shared/Caps/Sr22tCapsTypes';

/**
 * An object that provides references to Cirrus SR22T CAPS autopilot mode directors.
 */
export type Sr22tCapsPlaneDirectors = {
  /** The lateral CAPS mode director, or `undefined` if the director has not been created yet. */
  lateral?: PlaneDirector;

  /** The vertical CAPS mode director, or `undefined` if the director has not been created yet. */
  vertical?: PlaneDirector;
}

/**
 * A system that manages the Cirrus SR22T CAPS.
 */
export class Sr22tCapsSystem {
  private static readonly HANDLE_SIMVAR = 'L:1:SR22T_CAPS_Handle_Position';

  private readonly publisher = this.bus.getPublisher<Sr22tCapsEvents>();

  private readonly parachuteSimVarId = SimVar.GetRegisteredId('PARACHUTE OPEN', SimVarValueType.Number, '');
  private readonly handleSimVarId = SimVar.GetRegisteredId(Sr22tCapsSystem.HANDLE_SIMVAR, SimVarValueType.Number, '');

  private readonly adcData = ArrayUtils.create(2, index => {
    return {
      index: index + 1,
      isAirspeedDataValid: ConsumerValue.create(null, false),
      isTemperatureDataValid: ConsumerValue.create(null, false),
      ias: ConsumerValue.create(null, 0),
      tas: ConsumerValue.create(null, 0)
    };
  });

  private readonly ias = MappedValue.create(
    ([isAdc1DataValid, adc1Ias, isAdc2DataValid, adc2Ias]) => isAdc1DataValid ? adc1Ias : isAdc2DataValid ? adc2Ias : 0,
    this.adcData[0].isAirspeedDataValid,
    this.adcData[0].ias,
    this.adcData[1].isAirspeedDataValid,
    this.adcData[1].ias,
  );
  private readonly tas = MappedValue.create(
    ([isAdc1DataValid, adc1Tas, isAdc2DataValid, adc2Tas]) => isAdc1DataValid ? adc1Tas : isAdc2DataValid ? adc2Tas : 0,
    this.adcData[0].isTemperatureDataValid,
    this.adcData[0].tas,
    this.adcData[1].isTemperatureDataValid,
    this.adcData[1].tas,
  );

  private readonly apMasterStatus = ConsumerValue.create(null, false);

  private state = Sr22tCapsState.Idle;

  private activatedTime = 0;
  private lastUpdateActiveSimDuration: number | undefined = undefined;

  private updateSub?: Subscription;

  /**
   * Creates a new instance of Sr22tCapsSystem.
   * @param bus The event bus.
   * @param apDirectors References to Cirrus SR22T CAPS autopilot mode directors.
   */
  public constructor(private readonly bus: EventBus, private readonly apDirectors: Readonly<Sr22tCapsPlaneDirectors>) {
    this.publisher.pub('sr22t_caps_state', Sr22tCapsState.Idle, true, true);
  }

  /**
   * Initializes this system.
   */
  public init(): void {
    const sub = this.bus.getSubscriber<ClockEvents & APEvents & AdcSystemEvents>();

    for (const data of this.adcData) {
      data.isAirspeedDataValid.setConsumer(sub.on(`adc_airspeed_data_valid_${data.index}`));
      data.isTemperatureDataValid.setConsumer(sub.on(`adc_temperature_data_valid_${data.index}`));
      data.ias.setConsumer(sub.on(`adc_ias_${data.index}`));
      data.tas.setConsumer(sub.on(`adc_tas_${data.index}`));
    }

    this.apMasterStatus.setConsumer(sub.on('ap_master_status'));

    this.updateSub = sub.on('activeSimDuration').handle(this.update.bind(this));
  }

  /**
   * Changes the state of CAPS.
   * @param newState The new state to set.
   */
  private changeState(newState: Sr22tCapsState): void {
    if (this.state === newState) {
      return;
    }

    this.state = newState;
    this.publisher.pub('sr22t_caps_state', this.state, true, true);
  }

  /**
   * Checks whether the parachute can be deployed.
   * @returns Whether the parachute can be deployed.
   */
  private canDeployParachute(): boolean {
    // Cirrus documentation says that CAPS has been successfull at speeds beyond 180kts, but recommended 140kts
    return this.ias.get() < 180 && this.tas.get() < 190;
  }

  /**
   * Updates this system.
   * @param activeSimDuration The total amount of simulated time, in milliseconds, that have elapsed in the current
   * simulation session.
   */
  private update(activeSimDuration: number): void {
    // If the parachute is already deployed, then immediately go to the deployed state.
    if (SimVar.GetSimVarValueFastReg(this.parachuteSimVarId) >= 0.5) {
      this.changeState(Sr22tCapsState.Deployed);
    }

    switch (this.state) {
      case Sr22tCapsState.Idle:
        this.updateIdle();
        break;
      case Sr22tCapsState.Activated: {
        const dt = this.lastUpdateActiveSimDuration === undefined ? 0 : Math.max(activeSimDuration - this.lastUpdateActiveSimDuration, 0);
        this.updateActivated(dt);
        break;
      }
      case Sr22tCapsState.Deploying:
        this.updateDeploying();
        break;
      case Sr22tCapsState.Deployed:
      default:
        this.updateSub!.destroy();
    }

    this.lastUpdateActiveSimDuration = activeSimDuration;
  }

  /**
   * Updates this system while CAPS is in the idle state.
   */
  private updateIdle(): void {
    if (SimVar.GetSimVarValueFastReg(this.handleSimVarId) !== 0) {
      // Handle is pulled. Check if we are within the CAPS deployment envelope. If data is unavailable, we will skip
      // the check and immediately deploy the parachute.

      if (this.canDeployParachute()) {
        this.changeState(Sr22tCapsState.Deploying);
      } else {
        this.changeState(Sr22tCapsState.Activated);
      }
    }
  }

  /**
   * Updates this system while CAPS is in the activated state.
   * @param dt The amount of time elapsed since the last update, in milliseconds.
   */
  private updateActivated(dt: number): void {
    this.activatedTime += dt;

    if (this.activatedTime >= 32000 || this.canDeployParachute()) {
      this.changeState(Sr22tCapsState.Deploying);
    } else {
      // if (!this.apMasterStatus.get()) {
      //   SimVar.SetSimVarValue('K:AUTOPILOT_ON', SimVarValueType.Number, 0);
      // }

      // if (this.apDirectors.lateral && this.apDirectors.lateral.state !== DirectorState.Active) {
      //   this.apDirectors.lateral.activate();
      // }

      // if (this.apDirectors.vertical && this.apDirectors.vertical.state !== DirectorState.Active) {
      //   this.apDirectors.vertical.activate();
      // }
    }
  }

  /**
   * Updates this system while CAPS is in the deploying state.
   */
  private updateDeploying(): void {
    if (SimVar.GetSimVarValueFastReg(this.parachuteSimVarId) >= 0.5) {
      this.changeState(Sr22tCapsState.Deployed);
    } else {
      SimVar.SetSimVarValue('PARACHUTE OPEN', SimVarValueType.Number, 1);
    }
  }
}
