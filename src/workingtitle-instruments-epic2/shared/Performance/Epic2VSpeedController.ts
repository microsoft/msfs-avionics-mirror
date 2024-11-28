import { EventBus, MutableSubscribable, Subject } from '@microsoft/msfs-sdk';

import { AirframeConfig } from '../AvionicsConfig';

export enum VSpeedType {
  Takeoff,
  Landing,
}

/** A definition for a vspeed entry used for sending data */
export interface BaseVSpeedDefinition {
  /** Whether the v speed is a landing or takeoff vspeed */
  type: VSpeedType,
  /** The v speed label, case sensitive. */
  label: string,
  /** The actual speed for this vspeed */
  speed: number | null,
}

/** A definition for a vspeed entry to be used with internal code */
export interface Epic2VSpeedDefinition {
  /** Whether the v speed is a landing or takeoff vspeed */
  type: VSpeedType,
  /** The v speed label, case sensitive. */
  label: string,
  /** The actual speed for this vspeed */
  speed: MutableSubscribable<number | null>,
}

/**
 * An interface used for sending events related to Epic 2 VSpeeds
 */
export interface Epic2VSpeedEvents {
  /** Updates the speed of an FMS speed definition */
  update_fms_speed_definition: BaseVSpeedDefinition;

  /** Updates the PFD speed definitions */
  update_pfd_speed_definition_of_type: VSpeedType
}

/** A controller that handles the Epic 2 VSpeeds */
export class Epic2VSpeedController {
  public readonly vSpeedDefinitions = [] as Epic2VSpeedDefinition[];
  public readonly pfdSpeedDefinitions = [] as Epic2VSpeedDefinition[];

  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly airframeConfig: AirframeConfig) {
    for (const definition of this.airframeConfig.vSpeeds) {
      const fmsSpeedSubject = Subject.create(definition.speed);
      this.vSpeedDefinitions.push({
        type: definition.type,
        label: definition.label,
        speed: fmsSpeedSubject
      });

      this.pfdSpeedDefinitions.push({
        type: definition.type,
        label: definition.label,
        speed: Subject.create(null)
      });

      fmsSpeedSubject.sub((speed) => this.bus.getPublisher<Epic2VSpeedEvents>().pub('update_fms_speed_definition', {
        type: definition.type,
        label: definition.label,
        speed
      }, true));
    }

    this.bus.getSubscriber<Epic2VSpeedEvents>().on('update_fms_speed_definition').whenChanged().handle((newDefinition) => {
      const defIndexToUpdate = this.vSpeedDefinitions.findIndex((def) => def.type === newDefinition.type && def.label === newDefinition.label);

      this.vSpeedDefinitions[defIndexToUpdate].speed.set(newDefinition.speed);
    });

    this.bus.getSubscriber<Epic2VSpeedEvents>().on('update_pfd_speed_definition_of_type').handle((speedType) => {
      for (const pfdDefinition of this.pfdSpeedDefinitions.filter((pfdDef) => pfdDef.type === speedType)) {
        const fmsDefinitionIndex = this.vSpeedDefinitions.findIndex((fmsDef) => fmsDef.type === pfdDefinition.type && fmsDef.label === pfdDefinition.label);

        pfdDefinition.speed.set(this.vSpeedDefinitions[fmsDefinitionIndex].speed.get());
      }
    });
  }
}
