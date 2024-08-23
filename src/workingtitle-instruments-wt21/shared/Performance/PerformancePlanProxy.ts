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

  public manualLw = new ProxiedPerformancePlanProperty('manualLw', this);

  public manualGw = new ProxiedPerformancePlanProperty('manualGw', this);

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
    this.manualLw.switchToPlan(plan);
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
