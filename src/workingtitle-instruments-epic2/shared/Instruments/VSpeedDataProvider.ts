import { DebounceTimer, EventBus, Instrument, MappedSubject, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { FmsMessageKey, FmsMessageTransmitter } from '../FmsMessageSystem';
import { Epic2VSpeedController, Epic2VSpeedDefinition, VSpeedType } from '../Performance';
import { AirGroundDataProvider } from './AirGroundDataProvider';
import { AirspeedDataProvider } from './AirspeedDataProvider';

/** Provides vspeed bug data. */
export interface VSpeedBugData {
  /** The bug airspeed in knots, or null if none (bug will be hidden). */
  bugAirspeed: Subscribable<number | null>;

  /** The bugs display label. */
  label: string;
}

/** Provides vspeeds. */
export interface VSpeedDataProvider {
  /** The speed bugs to be created. */
  speedBugs: Readonly<VSpeedBugData[]>;

  /** Whether the takeoff speeds are parked or not. */
  takeoffSpeedsParked: Subscribable<boolean>;

  /** VSpeed definitions */
  vSpeedDefinitions: Epic2VSpeedDefinition[];
}

/** A vspeed data provider implementation. */
export class DefaultVSpeedDataProvider implements Instrument, VSpeedDataProvider {
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.bus);

  private readonly diffCheckDebounce = new DebounceTimer();
  private readonly onGroundDebounce = new DebounceTimer();
  private readonly isOnGroundDebounced = Subject.create(false);

  public readonly vSpeedDefinitions = this.vSpeedController.pfdSpeedDefinitions;

  private readonly highestTakeoffSpeed = Subject.create<number>(0);

  private readonly highestLandingSpeed = Subject.create<number>(0);

  private readonly shouldClearTakeoffSpeeds = MappedSubject.create(
    ([highestSpeed, cas, isOnGround]) => cas !== null && highestSpeed > 0 && cas > highestSpeed + 10 && !isOnGround,
    this.highestTakeoffSpeed,
    this.airspeedDataProvider.cas,
    this.airGroundDataProvider.isOnGround,
  );

  private readonly shouldClearLandingSpeeds = MappedSubject.create(
    ([highestSpeed, isOnGround]) => highestSpeed > 0 && isOnGround,
    this.highestLandingSpeed,
    this.isOnGroundDebounced,
  );

  private readonly takeoffSpeedsVisible = MappedSubject.create(
    ([highestSpeed, cas, isOnGround], previousValue) =>
      cas !== null && highestSpeed > 0 && (isOnGround || previousValue),
    this.highestTakeoffSpeed,
    this.airspeedDataProvider.cas,
    this.airGroundDataProvider.isOnGround,
  );

  private readonly landingSpeedsVisible = MappedSubject.create(
    ([cas, highestLandingSpeed, takeoffSpeedsVisible], previousValue) =>
      !takeoffSpeedsVisible && cas !== null && ((previousValue && highestLandingSpeed > 0) || cas < highestLandingSpeed + 40),
    this.airspeedDataProvider.cas,
    this.highestLandingSpeed,
    this.takeoffSpeedsVisible,
  );

  private readonly takeoffSpeedBugsVisible = MappedSubject.create(
    ([takeoffSpeedVisible, cas]) => cas !== null && cas >= 45 && takeoffSpeedVisible,
    this.takeoffSpeedsVisible,
    this.airspeedDataProvider.cas,
  ) as Subscribable<boolean>;

  public readonly takeoffSpeedsParked = MappedSubject.create(
    ([takeoffSpeedVisible, cas]) => (cas === null || cas < 45) && takeoffSpeedVisible,
    this.takeoffSpeedsVisible,
    this.airspeedDataProvider.cas,
  ) as Subscribable<boolean>;

  public readonly speedBugs = [] as VSpeedBugData[];

  /**
   * The logic constructor.
   * @param bus The event bus.
   * @param airspeedDataProvider The airspeedDataProvider to use.
   * @param airGroundDataProvider The airGroundDataProvider to use.
   * @param vSpeedController The vspeed controller
   */
  constructor(
    private readonly bus: EventBus,
    private readonly airspeedDataProvider: AirspeedDataProvider,
    private readonly airGroundDataProvider: AirGroundDataProvider,
    private readonly vSpeedController: Epic2VSpeedController
  ) {
    for (const definition of this.vSpeedDefinitions) {
      this.speedBugs.push({
        bugAirspeed: MappedSubject.create(
          ([bugVisible, v1Speed]) => bugVisible && v1Speed !== null ? v1Speed : null,
          definition.type === VSpeedType.Takeoff ? this.takeoffSpeedBugsVisible : this.landingSpeedsVisible,
          definition.speed
        ),
        label: definition.label
      });
    }

    MappedSubject.create(
      (inputs) => inputs.reduce((highest: number, v) => v !== null ? Math.max(highest, v) : highest, 0),
      ...this.vSpeedDefinitions.filter((def) => def.type === VSpeedType.Takeoff).map((def) => def.speed)
    ).pipe(this.highestTakeoffSpeed);

    MappedSubject.create(
      (inputs) => inputs.reduce((highest: number, v) => v !== null ? Math.max(highest, v) : highest, 0),
      ...this.vSpeedDefinitions.filter((def) => def.type === VSpeedType.Landing).map((def) => def.speed)
    ).pipe(this.highestLandingSpeed);

    this.airGroundDataProvider.isOnGround.sub(v => {
      if (v) {
        this.onGroundDebounce.schedule(() => this.isOnGroundDebounced.set(true), 5000);
      } else {
        this.onGroundDebounce.clear();
        this.isOnGroundDebounced.set(false);
      }
    }, true);
  }

  /**
   * Checks the PFD VSpeeds against the FMS vspeeds for any differences between them
   */
  private checkVSpeedDifferences(): void {
    const doTakeoffSpeeds = this.takeoffSpeedBugsVisible.get() || this.takeoffSpeedsParked.get();
    const doLandingSpeeds = this.landingSpeedsVisible.get();

    const fmsSpeeds = this.vSpeedController.vSpeedDefinitions.filter(
      (def) => (doTakeoffSpeeds && def.type === VSpeedType.Takeoff) || (doLandingSpeeds && def.type === VSpeedType.Landing));

    let sendCheckMessage = false;
    for (const definition of fmsSpeeds) {
      const pfdDefinitionIndex = this.vSpeedDefinitions.findIndex((currentDef) => currentDef.label === definition.label && currentDef.type === definition.type);
      const fmsSpeed = definition.speed.get();
      const pfdSpeed = this.vSpeedDefinitions[pfdDefinitionIndex].speed.get();

      if (pfdSpeed && fmsSpeed && Math.abs(fmsSpeed - pfdSpeed) > 2) {
        sendCheckMessage = true;
      }
    }

    if (sendCheckMessage) {
      this.fmsMessageTransmitter.sendMessage(FmsMessageKey.CheckVSpeeds);
    } else {
      this.fmsMessageTransmitter.clearMessage(FmsMessageKey.CheckVSpeeds);
    }
  }

  /** @inheritdoc */
  init(): void {
    this.shouldClearTakeoffSpeeds.sub(shouldClear => {
      if (shouldClear) {
        for (const definition of this.vSpeedDefinitions) {
          if (definition.type === VSpeedType.Takeoff) {
            definition.speed.set(null);
          }
        }
      }
    }, true);

    this.shouldClearLandingSpeeds.sub(shouldClear => {
      if (shouldClear) {
        for (const definition of this.vSpeedDefinitions) {
          if (definition.type === VSpeedType.Landing) {
            definition.speed.set(null);
          }
        }
      }
    }, true);

    // Check whether there are any differences in the vspeeds used by the FMS and PFD
    // This check is done when the takeoff/landing bugs change visibility or when the VSpeeds are changed
    MappedSubject.create(
      () => this.diffCheckDebounce.schedule(() => this.checkVSpeedDifferences(), 500),
      this.takeoffSpeedBugsVisible,
      this.takeoffSpeedsParked,
      this.landingSpeedsVisible,
      ...this.vSpeedController.pfdSpeedDefinitions.map((def) => def.speed),
      ...this.vSpeedController.vSpeedDefinitions.map((def) => def.speed),
    );
  }

  /** @inheritdoc */
  onUpdate(): void {
    //noop
  }
}
