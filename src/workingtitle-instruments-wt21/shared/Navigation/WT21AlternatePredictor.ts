import {
  ActiveOrUpcomingLegPredictions, AirportFacility, FacilityLoader, FacilityType, FlightPlanner, FlightPlanPredictor, GeoPoint, ICAO, UnitType
} from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '../Systems/FMS/WT21FmsUtils';

/**
 * Utility for predicting ALTN data
 */
export class WT21AlternatePredictor {
  /**
   * The current predictions for the alternate destination
   */
  private alternateData: ActiveOrUpcomingLegPredictions = {
    kind: 'activeOrUpcoming',
    ident: '',
    distance: 0,
    fob: 0,
    estimatedTimeEnroute: 0,
    estimatedTimeOfArrival: 0,
  };

  public alternatePredictions: ActiveOrUpcomingLegPredictions | null = null;

  private _cachedDestinationFacility: AirportFacility | null = null;

  private _cachedAlternateFacility: AirportFacility | null = null;

  private _destinationPos = new GeoPoint(0, 0);

  private _alternatePos = new GeoPoint(0, 0);

  /**
   * Ctor
   * @param planner the flight planner
   * @param facLoader the facility loader
   * @param predictor the flight plan predictor
   */
  constructor(
    private readonly planner: FlightPlanner,
    private readonly facLoader: FacilityLoader,
    private readonly predictor: FlightPlanPredictor,
  ) {
  }

  /**
   * Update loop
   */
  public async update(): Promise<void> {
    if (this.planner.hasFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX)) {
      const plan = this.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

      const destinationFacilityIcao = plan.destinationAirport;

      if (destinationFacilityIcao && destinationFacilityIcao !== ICAO.emptyIcao) {
        let destinationFacility = this._cachedDestinationFacility;

        if (!destinationFacility || destinationFacility.icao !== destinationFacilityIcao) {
          destinationFacility = await this.facLoader.getFacility(FacilityType.Airport, destinationFacilityIcao);
          this._cachedDestinationFacility = destinationFacility;
        }

        if (destinationFacility) {
          this._destinationPos.set(destinationFacility.lat, destinationFacility.lon);

          const destinationPredictions = this.predictor.getDestinationPrediction(destinationFacility);

          if (destinationPredictions) {
            const destinationDistance = destinationPredictions.distance;

            const altnFacilityIcao = plan.getUserData(WT21FmsUtils.USER_DATA_KEY_ALTN) as string;

            if (altnFacilityIcao && altnFacilityIcao !== ICAO.emptyIcao) {
              let altnFacility = this._cachedAlternateFacility;

              if (!altnFacility || altnFacility.icao !== altnFacilityIcao) {
                altnFacility = await this.facLoader.getFacility(FacilityType.Airport, altnFacilityIcao);
                this._cachedAlternateFacility = altnFacility;
              }

              if (altnFacility) {
                this._alternatePos.set(altnFacility.lat, altnFacility.lon);
                this.alternateData.ident = ICAO.getIdent(altnFacilityIcao);

                const destinationToAlternateDistance = this._destinationPos.distance(this._alternatePos);
                const destinationToAlternateDistanceNM = UnitType.NMILE.convertFrom(destinationToAlternateDistance, UnitType.GA_RADIAN);
                const totalDistanceToAlternate = destinationDistance + destinationToAlternateDistanceNM;

                this.alternateData.distance = totalDistanceToAlternate;

                this.predictor.applyPredictionsForDistance(totalDistanceToAlternate, this.alternateData);

                this.alternatePredictions = this.alternateData;
                return;
              }
            }
          }
        }
      }
    }

    this.alternatePredictions = null;
  }
}
