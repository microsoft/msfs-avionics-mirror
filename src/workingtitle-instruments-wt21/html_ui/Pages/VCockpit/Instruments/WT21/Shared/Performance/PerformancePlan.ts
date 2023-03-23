import { EventBus, MutableSubscribable, OneWayRunway, SimVarValueType, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { DefaultsUserSettings } from '../Profiles/DefaultsUserSettings';
import { WindEntry } from '../Types';
import { PerformancePlanData } from './PerformancePlanData';
/**
 * Contains performance data tied to a flight plan
 */
export class PerformancePlan implements PerformancePlanData {
  public paxNumber = Subject.create<number | null>(0);

  public averagePassengerWeight = Subject.create<number>(-1);

  public basicOperatingWeight = Subject.create<number>(-1);

  public cargoWeight = Subject.create<number | null>(0);

  public manualZfw = Subject.create<number | null>(null);

  public manualGw = Subject.create<number | null>(null);

  public manualTow = Subject.create<number | null>(null);

  public manualLw = Subject.create<number | null>(null);

  public takeoffAirportIcao = Subject.create<string | null>(null);

  public takeoffRunway = Subject.create<OneWayRunway | null>(null);

  public takeoffWind = Subject.create<WindEntry | null>(null);

  public takeoffRunwayCondition = Subject.create<number | null>(0);

  public takeoffRunwaySlope = Subject.create<number | null>(null);

  public takeoffFlaps = Subject.create<number | null>(0);

  public takeoffAntiIceOn = Subject.create<number | null>(0);

  public takeoffOat = Subject.create<number | null>(null);

  public takeoffAutoQnh = Subject.create<number | null>(null);

  public takeoffManualQnh = Subject.create<number | null>(null);

  public approachAirportIcao = Subject.create<string | null>(null);

  public approachRunway = Subject.create<OneWayRunway | null>(null);

  public approachWind = Subject.create<WindEntry | null>(null);

  public approachRunwayCondition = Subject.create<number | null>(0);

  public approachRunwaySlope = Subject.create<number | null>(null);

  public approachAntiIceOn = Subject.create<number | null>(0);

  public approachOat = Subject.create<number | null>(null);

  public approachAutoQnh = Subject.create<number | null>(null);

  public approachManualQnh = Subject.create<number | null>(null);

  public approachLandingFactor = Subject.create<number | null>(0);

  public climbTargetSpeedIas = Subject.create<number>(-1);

  public climbTargetSpeedMach = Subject.create<number>(-1);

  public climbSpeedLimitIas = Subject.create<number>(-1);

  public climbSpeedLimitAltitude = Subject.create<number>(-1);

  public cruiseTargetSpeedIas = Subject.create<number>(-1);

  public cruiseTargetSpeedMach = Subject.create<number>(-1);

  public cruiseAltitude = Subject.create<number | null>(null);

  public descentTargetSpeedIas = Subject.create<number>(-1);

  public descentTargetSpeedMach = Subject.create<number>(-1);

  public descentSpeedLimitIas = Subject.create<number>(-1);

  public descentSpeedLimitAltitude = Subject.create<number>(-1);

  public descentVPA = Subject.create<number>(-1);

  public transitionAltitude = Subject.create<number>(-1);

  public reserveFuel = Subject.create<number>(-1);

  /**
   * Serializes this plan.
   * @returns the serialized JSOn string
   */
  public serialize(): string {
    const tmpObj: Record<string, string> = {};
    Object.keys(this).forEach((key: string) => {
      const value = (this[key as keyof PerformancePlan] as Subscribable<any>).get();
      tmpObj[key] = value;
    });
    return JSON.stringify(tmpObj);
  }

  /**
   * Deserializes a serialized performance plan into this plan.
   * @param data the serialized data string
   */
  public deserializeInto(data: string): void {
    const customData = JSON.parse(data);

    Object.keys(this).forEach((key) => {
      const value = customData[key];
      if (value !== undefined) {
        (this[key as keyof this] as unknown as MutableSubscribable<any>).set(value);
      }
    });
  }

  /**
   * Creates a performance plan from the current default user settings
   * @param bus the event bus
   * @returns the plan filled with default values
   */
  static createFromDefaults(bus: EventBus): PerformancePlan {
    const plan = new PerformancePlan();
    const defaultsSettings = DefaultsUserSettings.getManager(bus);

    // From current data
    plan.takeoffAutoQnh.set(SimVar.GetSimVarValue('KOHLSMAN SETTING HG:1', SimVarValueType.InHG));
    plan.approachAutoQnh.set(SimVar.GetSimVarValue('KOHLSMAN SETTING HG:1', SimVarValueType.InHG));

    // From default settings
    plan.averagePassengerWeight.set(defaultsSettings.getSetting('averagePassengerWeight').get());
    plan.basicOperatingWeight.set(defaultsSettings.getSetting('basicOperatingWeight').get());
    plan.takeoffFlaps.set(defaultsSettings.getSetting('takeoffFlaps').get());
    plan.climbTargetSpeedIas.set(defaultsSettings.getSetting('climbTargetSpeedIas').get());
    plan.climbTargetSpeedMach.set(defaultsSettings.getSetting('climbTargetSpeedMach').get());
    plan.climbSpeedLimitIas.set(defaultsSettings.getSetting('speedLimitIas').get());
    plan.climbSpeedLimitAltitude.set(defaultsSettings.getSetting('altitudeLimit').get());
    plan.cruiseTargetSpeedIas.set(defaultsSettings.getSetting('cruiseTargetSpeedIas').get());
    plan.cruiseTargetSpeedMach.set(defaultsSettings.getSetting('cruiseTargetSpeedMach').get());
    plan.descentTargetSpeedIas.set(defaultsSettings.getSetting('descentTargetSpeedIas').get());
    plan.descentTargetSpeedMach.set(defaultsSettings.getSetting('descentTargetSpeedMach').get());
    plan.descentSpeedLimitIas.set(defaultsSettings.getSetting('speedLimitIas').get());
    plan.descentSpeedLimitAltitude.set(defaultsSettings.getSetting('altitudeLimit').get());
    plan.descentVPA.set(defaultsSettings.getSetting('descentVPA').get());
    plan.transitionAltitude.set(defaultsSettings.getSetting('transitionAltitude').get());
    plan.reserveFuel.set(defaultsSettings.getSetting('reserveFuel').get());

    return plan;
  }
}