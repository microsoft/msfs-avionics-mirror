import { ClockEvents, ConsumerSubject, DebounceTimer, EventBus, GameStateProvider, GNSSEvents, MappedSubject, Subject, Wait } from '@microsoft/msfs-sdk';

/**
 * Describes the landing light system state.
 */
enum LandingLightsState {
  Off,
  On,
  Left,
  Right
}

/**
 * The lighting system in the SR22T.
 */
export class Sr22tLightsSystem {
  private readonly agl = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('above_ground_height').atFrequency(2), 0);
  private readonly landingSwitchOn = Subject.create(false);
  private readonly strobeSwitchOn = Subject.create(false);
  private readonly haloLightsOn = Subject.create(true);

  private readonly haloLightDebounce = new DebounceTimer();
  private readonly wigWagDebounce = new DebounceTimer();

  private previousTimestamp = -1;
  private wigWagTimer = -1;
  private landingLights = Subject.create(LandingLightsState.Off);

  /**
   * Creates an instance of the Sr22tHaloLightsSystem
   * @param bus The event bus to use with this instance.
   */
  constructor(private readonly bus: EventBus) {
    Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true).then(() => {
      MappedSubject.create(([agl, strobe, landing]) => this.onStatesChanged(agl, strobe, landing), this.agl, this.strobeSwitchOn, this.landingSwitchOn);
      this.haloLightsOn.sub(this.onLightsChanged.bind(this), true);
      this.landingLights.sub(this.onLandingLightsChanged.bind(this), true);

      this.bus.getSubscriber<ClockEvents>().on('simTime').handle(this.update.bind(this));
    });
  }

  /**
   * Updates the lights system.
   * @param timestamp The timestamp, in milliseconds simtime.
   */
  private update(timestamp: number): void {
    if (this.previousTimestamp === -1) {
      this.previousTimestamp = timestamp;
    }

    this.strobeSwitchOn.set(SimVar.GetSimVarValue('LIGHT STROBE', 'bool') === 1);
    this.landingSwitchOn.set(SimVar.GetSimVarValue('LIGHT LANDING:1', 'bool') === 1);

    const deltaTime = timestamp - this.previousTimestamp;
    if (this.wigWagTimer !== -1) {
      this.wigWagTimer = Math.max(0, this.wigWagTimer - deltaTime);

      if (this.wigWagTimer === 0) {
        this.toggleWigWag();
      }
    }

    this.previousTimestamp = timestamp;
  }

  /**
   * Toggles the wigwag lights.
   */
  private toggleWigWag(): void {
    this.landingLights.set(this.landingLights.get() === LandingLightsState.Left ? LandingLightsState.Right : LandingLightsState.Left);
    this.wigWagTimer = 1000;
  }

  /**
   * Handles when the landing light state changes.
   * @param state The new state.
   */
  private onLandingLightsChanged(state: LandingLightsState): void {
    switch (state) {
      case LandingLightsState.Off:
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_OFF', 'number', 1);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_OFF', 'number', 2);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_OFF', 'number', 3);
        this.wigWagTimer = -1;
        break;
      case LandingLightsState.On:
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 1);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 2);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 3);
        this.wigWagTimer = -1;
        break;
      case LandingLightsState.Left:
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 1);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 2);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_OFF', 'number', 3);
        break;
      case LandingLightsState.Right:
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 1);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_OFF', 'number', 2);
        SimVar.SetSimVarValue('K:LANDING_LIGHTS_ON', 'number', 3);
        break;
    }
  }

  /**
   * Handles when the input states change.
   * @param agl The current AGL in feet.
   * @param isStrobeOn Whether or not the strobe light switch is on.
   * @param isLandingOn Whether or not the landing light switch is on.
   */
  private onStatesChanged(agl: number, isStrobeOn: boolean, isLandingOn: boolean): void {
    if (!this.haloLightDebounce.isPending()) {
      if (agl >= 300 && this.haloLightsOn.get()) {
        this.haloLightDebounce.schedule(() => this.haloLightsOn.set(false), 500);
      } else if (agl < 270 && !this.haloLightsOn.get()) {
        this.haloLightDebounce.schedule(() => this.haloLightsOn.set(true), 500);
      }
    }

    const areInWigWag = this.landingLights.get() === LandingLightsState.Left || this.landingLights.get() === LandingLightsState.Right;
    const areOn = this.landingLights.get() === LandingLightsState.On;
    if (isLandingOn) {
      if (!this.wigWagDebounce.isPending()) {
        if (agl >= 300 && isStrobeOn && !areInWigWag) {
          this.wigWagDebounce.schedule(() => this.toggleWigWag(), 500);
        } else if ((agl < 270 && !areOn) || !isStrobeOn) {
          this.wigWagDebounce.schedule(() => this.landingLights.set(LandingLightsState.On), 500);
        }
      }
    } else {
      this.landingLights.set(LandingLightsState.Off);
    }
  }

  /**
   * Handles when the halo light state changes.
   * @param on Whether or not they should be on.
   */
  private onLightsChanged(on: boolean): void {
    if (on) {
      SimVar.SetSimVarValue('K:LIGHT_POTENTIOMETER_2_SET', 'number', 100);
    } else {
      SimVar.SetSimVarValue('K:LIGHT_POTENTIOMETER_2_SET', 'number', 0);
    }
  }
}