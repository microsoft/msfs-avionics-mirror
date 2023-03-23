import { PerformancePlan } from './PerformancePlan';
import { PerformancePlanData } from './PerformancePlanData';
import { ProxiedPerformancePlanProperty } from './ProxiedPerformancePlanProperty';

/**
 * Proxy for accessing the performance plan data for the currently used flight plan.
 *
 * This exposes all mutable subscribables defined in {@link PerformancePlanData}, but reflects them on the
 * appropriate flight plan automatically. It handles switching around subscriptions and notifying the FMS before editing a
 * value (so that a MOD plan can be created).
 *
 * This is used to tie FMC pages and FMC components to the relevant mutSubs without having to manually switch them around
 * depending on MOD/ACT.
 */
export class PerformancePlanProxy implements PerformancePlanData {
  public paxNumber = new ProxiedPerformancePlanProperty('paxNumber', this);

  public averagePassengerWeight = new ProxiedPerformancePlanProperty('averagePassengerWeight', this);

  public basicOperatingWeight = new ProxiedPerformancePlanProperty('basicOperatingWeight', this);

  public cargoWeight = new ProxiedPerformancePlanProperty('cargoWeight', this);

  public manualZfw = new ProxiedPerformancePlanProperty('manualZfw', this);

  public manualTow = new ProxiedPerformancePlanProperty('manualTow', this);

  public manualLw = new ProxiedPerformancePlanProperty('manualLw', this);

  public manualGw = new ProxiedPerformancePlanProperty('manualGw', this);

  public takeoffAirportIcao = new ProxiedPerformancePlanProperty('takeoffAirportIcao', this, true);

  public takeoffRunway = new ProxiedPerformancePlanProperty('takeoffRunway', this, true);

  public takeoffWind = new ProxiedPerformancePlanProperty('takeoffWind', this, true);

  public takeoffRunwayCondition = new ProxiedPerformancePlanProperty('takeoffRunwayCondition', this, true);

  public takeoffRunwaySlope = new ProxiedPerformancePlanProperty('takeoffRunwaySlope', this, true);

  public takeoffFlaps = new ProxiedPerformancePlanProperty('takeoffFlaps', this, true);

  public takeoffAntiIceOn = new ProxiedPerformancePlanProperty('takeoffAntiIceOn', this, true);

  public takeoffOat = new ProxiedPerformancePlanProperty('takeoffOat', this, true);

  public takeoffAutoQnh = new ProxiedPerformancePlanProperty('takeoffAutoQnh', this, true);

  public takeoffManualQnh = new ProxiedPerformancePlanProperty('takeoffManualQnh', this, true);

  public approachAirportIcao = new ProxiedPerformancePlanProperty('approachAirportIcao', this, true);

  public approachRunway = new ProxiedPerformancePlanProperty('approachRunway', this, true);

  public approachWind = new ProxiedPerformancePlanProperty('approachWind', this, true);

  public approachRunwayCondition = new ProxiedPerformancePlanProperty('approachRunwayCondition', this, true);

  public approachRunwaySlope = new ProxiedPerformancePlanProperty('approachRunwaySlope', this, true);

  public approachAntiIceOn = new ProxiedPerformancePlanProperty('approachAntiIceOn', this, true);

  public approachOat = new ProxiedPerformancePlanProperty('approachOat', this, true);

  public approachAutoQnh = new ProxiedPerformancePlanProperty('approachAutoQnh', this, true);

  public approachManualQnh = new ProxiedPerformancePlanProperty('approachManualQnh', this, true);

  public approachLandingFactor = new ProxiedPerformancePlanProperty('approachLandingFactor', this, true);

  public climbTargetSpeedIas = new ProxiedPerformancePlanProperty('climbTargetSpeedIas', this);

  public climbTargetSpeedMach = new ProxiedPerformancePlanProperty('climbTargetSpeedMach', this);

  public climbSpeedLimitIas = new ProxiedPerformancePlanProperty('climbSpeedLimitIas', this);

  public climbSpeedLimitAltitude = new ProxiedPerformancePlanProperty('climbSpeedLimitAltitude', this);

  public cruiseTargetSpeedIas = new ProxiedPerformancePlanProperty('cruiseTargetSpeedIas', this);

  public cruiseTargetSpeedMach = new ProxiedPerformancePlanProperty('cruiseTargetSpeedMach', this);

  public cruiseAltitude = new ProxiedPerformancePlanProperty('cruiseAltitude', this);

  public descentTargetSpeedIas = new ProxiedPerformancePlanProperty('descentTargetSpeedIas', this);

  public descentTargetSpeedMach = new ProxiedPerformancePlanProperty('descentTargetSpeedMach', this);

  public descentSpeedLimitIas = new ProxiedPerformancePlanProperty('descentSpeedLimitIas', this);

  public descentSpeedLimitAltitude = new ProxiedPerformancePlanProperty('descentSpeedLimitAltitude', this);

  public descentVPA = new ProxiedPerformancePlanProperty('descentVPA', this);

  public transitionAltitude = new ProxiedPerformancePlanProperty('transitionAltitude', this);

  public reserveFuel = new ProxiedPerformancePlanProperty('reserveFuel', this, true);


  /**
   * Ctor
   *
   * @param defaultValuesPlan plan containing default values
   * @param onBeforeEdit      callback fired before an edit is performed
   * @param onAfterEdit       callback fired after an edit is performed
   */
  constructor(
    public readonly defaultValuesPlan: PerformancePlanData,
    public readonly onBeforeEdit: (property: ProxiedPerformancePlanProperty<keyof PerformancePlanData>, newValue: any) => void = () => {},
    public readonly onAfterEdit: (property: ProxiedPerformancePlanProperty<keyof PerformancePlanData>, newValue: any) => void = () => {},
  ) {
  }

  /**
   * Switches the proxy to another performance plan
   *
   * @param plan the performance plan to switch to
   * @param initial whether this is the initial setting of the backing performance plan
   */
  public switchToPlan(plan: PerformancePlan, initial = false): void {
    // FIXME make this clear
    this.paxNumber.switchToPlan(plan);
    this.averagePassengerWeight.switchToPlan(plan);
    this.basicOperatingWeight.switchToPlan(plan);
    this.cargoWeight.switchToPlan(plan);
    this.manualZfw.switchToPlan(plan);
    this.manualGw.switchToPlan(plan);
    this.manualTow.switchToPlan(plan);
    this.manualLw.switchToPlan(plan);
    if (initial) {
      this.takeoffAirportIcao.switchToPlan(plan);
      this.takeoffRunway.switchToPlan(plan);
      this.takeoffWind.switchToPlan(plan);
      this.takeoffRunwayCondition.switchToPlan(plan);
      this.takeoffRunwaySlope.switchToPlan(plan);
      this.takeoffFlaps.switchToPlan(plan);
      this.takeoffAntiIceOn.switchToPlan(plan);
      this.takeoffOat.switchToPlan(plan);
      this.takeoffAutoQnh.switchToPlan(plan);
      this.takeoffManualQnh.switchToPlan(plan);
      this.approachAirportIcao.switchToPlan(plan);
      this.approachRunway.switchToPlan(plan);
      this.approachWind.switchToPlan(plan);
      this.approachRunwayCondition.switchToPlan(plan);
      this.approachRunwaySlope.switchToPlan(plan);
      this.approachAntiIceOn.switchToPlan(plan);
      this.approachOat.switchToPlan(plan);
      this.approachAutoQnh.switchToPlan(plan);
      this.approachManualQnh.switchToPlan(plan);
      this.approachLandingFactor.switchToPlan(plan);
    }
    this.climbTargetSpeedIas.switchToPlan(plan);
    this.climbTargetSpeedMach.switchToPlan(plan);
    this.climbSpeedLimitIas.switchToPlan(plan);
    this.climbSpeedLimitAltitude.switchToPlan(plan);
    this.cruiseTargetSpeedIas.switchToPlan(plan);
    this.cruiseTargetSpeedMach.switchToPlan(plan);
    this.cruiseAltitude.switchToPlan(plan);
    this.descentTargetSpeedIas.switchToPlan(plan);
    this.descentTargetSpeedMach.switchToPlan(plan);
    this.descentSpeedLimitIas.switchToPlan(plan);
    this.descentSpeedLimitAltitude.switchToPlan(plan);
    this.descentVPA.switchToPlan(plan);
    this.transitionAltitude.switchToPlan(plan);
    if (initial) {
      this.reserveFuel.switchToPlan(plan);
    }
  }

}