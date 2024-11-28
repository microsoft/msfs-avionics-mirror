import { AltitudeRestrictionType, LegDefinition, MapFlightPlanModule, MapSystemController, MapSystemKeys } from '@microsoft/msfs-sdk';

import { Epic2FlightPlans } from '../../Fms';
import { EpicMapKeys } from '../EpicMapKeys';
import { MapUtils } from '../MapUtils';
import { VNavDataModule } from '../Modules/VNavDataModule';

/** Modules required by {@link VNavDataController}. */
export interface VNavDataControllerModules {
  /** Plan module. */
  [MapSystemKeys.FlightPlan]: MapFlightPlanModule;
  /** VNavData module. */
  [EpicMapKeys.VNavData]: VNavDataModule;
}

/** Updates the VNavData module. */
export class VNavDataController extends MapSystemController<VNavDataControllerModules> {
  protected readonly flightPlanModule = this.context.model.getModule(MapSystemKeys.FlightPlan);
  protected readonly vnavDataModule = this.context.model.getModule(EpicMapKeys.VNavData);

  private activeRoutePlanSubject = this.flightPlanModule.getPlanSubjects(Epic2FlightPlans.Active);

  /** @inheritdoc */
  public override onAfterMapRender(): void {
    this.activeRoutePlanSubject.activeLeg.sub(this.updateNextConstraint.bind(this));
    this.activeRoutePlanSubject.flightPlan.sub(this.updateNextConstraint.bind(this));
    this.activeRoutePlanSubject.planChanged.on(this.updateNextConstraint.bind(this));

    this.updateNextConstraint();
  }

  /** Updates the next constraint. */
  private updateNextConstraint(): void {
    this.vnavDataModule.nextConstraintLegDefForMap.set(this.getNextConstraint());
  }

  /**
   * Gets the next constraint.
   * @returns the next constraint leg def.
   */
  private getNextConstraint(): LegDefinition | undefined {
    const planSubject = this.flightPlanModule.getPlanSubjects(Epic2FlightPlans.Active);
    const activeLeg = planSubject.activeLeg.get();
    const plan = planSubject.flightPlan.get();

    if (!plan) {
      return undefined;
    }

    for (const leg of plan.legs(false, activeLeg)) {
      if (MapUtils.showAltitudeForLeg(leg) === false) {
        continue;
      }
      if (leg.verticalData.altDesc !== AltitudeRestrictionType.Unused) {
        return leg;
      }
    }

    return undefined;
  }
}
