import { UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  DateTimeUserSettingTypes, GenericNavDataFieldRenderer, NavDataFieldRenderer, NavDataFieldType, NavDataFieldTypeModelMap
} from '@microsoft/msfs-garminsdk';

import { G3XUnitsUserSettingManager } from '../../../Settings/G3XUnitsUserSettings';
import {
  G3XNavDataFieldAglRenderer, G3XNavDataFieldBrgRenderer, G3XNavDataFieldCabinAltitudeRenderer, G3XNavDataFieldClgRenderer, G3XNavDataFieldClmRenderer,
  G3XNavDataFieldDensityAltitudeRenderer, G3XNavDataFieldDistRenderer, G3XNavDataFieldDistdRenderer, G3XNavDataFieldDtkRenderer, G3XNavDataFieldEcoRenderer,
  G3XNavDataFieldEdrRenderer, G3XNavDataFieldEtaRenderer, G3XNavDataFieldEtadRenderer, G3XNavDataFieldEteRenderer, G3XNavDataFieldEtedRenderer,
  G3XNavDataFieldFlightLevelRenderer, G3XNavDataFieldFodRenderer, G3XNavDataFieldFuelFlowRenderer, G3XNavDataFieldGMeterRenderer,
  G3XNavDataFieldGpsAltitudeRenderer, G3XNavDataFieldGsRenderer, G3XNavDataFieldIsaRenderer, G3XNavDataFieldLclRenderer, G3XNavDataFieldMachRenderer,
  G3XNavDataFieldOatRenderer, G3XNavDataFieldRatRenderer, G3XNavDataFieldRemRenderer, G3XNavDataFieldTasRenderer, G3XNavDataFieldTrkRenderer,
  G3XNavDataFieldUtcRenderer, G3XNavDataFieldVsrRenderer, G3XNavDataFieldWptRenderer, G3XNavDataFieldXtkRenderer
} from '../../NavDataField/G3XNavDataFieldTypeRenderers';

/**
 * A G3X implementation of {@link NavDataFieldRenderer} which supports all navigation data bar field types.
 */
export class G3XNavDataBarFieldRenderer implements NavDataFieldRenderer {
  private readonly renderer = new GenericNavDataFieldRenderer();

  /** @inheritDoc */
  constructor(
    unitsSettingManager: G3XUnitsUserSettingManager,
    dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>
  ) {
    this.renderer.register(NavDataFieldType.AboveGroundLevel, new G3XNavDataFieldAglRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.BearingToWaypoint, new G3XNavDataFieldBrgRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.CabinAltitude, new G3XNavDataFieldCabinAltitudeRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.ClimbGradient, new G3XNavDataFieldClgRenderer());
    this.renderer.register(NavDataFieldType.ClimbGradientPerDistance, new G3XNavDataFieldClmRenderer(unitsSettingManager));
    // this.renderer.register(NavDataFieldType.CarbonMonoxide, ); // TODO: simulate? or fixed 0?
    this.renderer.register(NavDataFieldType.DensityAltitude, new G3XNavDataFieldDensityAltitudeRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToWaypoint, new G3XNavDataFieldDistRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToDestination, new G3XNavDataFieldDistdRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DesiredTrack, new G3XNavDataFieldDtkRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Endurance, new G3XNavDataFieldEdrRenderer());
    this.renderer.register(NavDataFieldType.TimeOfWaypointArrival, new G3XNavDataFieldEtaRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.TimeOfDestinationArrival, new G3XNavDataFieldEtadRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.TimeToWaypoint, new G3XNavDataFieldEteRenderer());
    this.renderer.register(NavDataFieldType.TimeToDestination, new G3XNavDataFieldEtedRenderer());
    this.renderer.register(NavDataFieldType.FuelEconomy, new G3XNavDataFieldEcoRenderer(unitsSettingManager));
    // this.renderer.register(NavDataFieldType.EnrouteSafeAlt, ); // NO DATA, CAN'T IMPLEMENT
    // this.renderer.register(NavDataFieldType.EstimatedTimeToVNAV, ); // TODO: does VNAV provide this?
    this.renderer.register(NavDataFieldType.FlightLevel, new G3XNavDataFieldFlightLevelRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelFlow, new G3XNavDataFieldFuelFlowRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOverDestination, new G3XNavDataFieldFodRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.GMeter, new G3XNavDataFieldGMeterRenderer());
    this.renderer.register(NavDataFieldType.GpsAltitude, new G3XNavDataFieldGpsAltitudeRenderer(unitsSettingManager));
    // this.renderer.register(NavDataFieldType.GlideRatio, ); // TODO: How to calculate this?
    this.renderer.register(NavDataFieldType.GroundSpeed, new G3XNavDataFieldGsRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.ISA, new G3XNavDataFieldIsaRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.LocalTime, new G3XNavDataFieldLclRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.MachNumber, new G3XNavDataFieldMachRenderer());
    // this.renderer.register(NavDataFieldType.MinimumSafeAlt, ); // NO DATA, CAN'T IMPLEMENT
    this.renderer.register(NavDataFieldType.OutsideTemperature, new G3XNavDataFieldOatRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.RamAirTemperature, new G3XNavDataFieldRatRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOnBoard, new G3XNavDataFieldRemRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TrueAirspeed, new G3XNavDataFieldTasRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.GroundTrack, new G3XNavDataFieldTrkRenderer(unitsSettingManager));
    // this.renderer.register(NavDataFieldType.UsedFuel, ); // TODO: Need to track this somewhere
    this.renderer.register(NavDataFieldType.UtcTime, new G3XNavDataFieldUtcRenderer());
    this.renderer.register(NavDataFieldType.VerticalSpeedRequired, new G3XNavDataFieldVsrRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Waypoint, new G3XNavDataFieldWptRenderer());
    // this.renderer.register(NavDataFieldType.WXAltimeter, ); // NO DATA, CAN'T IMPLEMENT
    // this.renderer.register(NavDataFieldType.WXWind, ); // NO DATA, CAN'T IMPLEMENT
    this.renderer.register(NavDataFieldType.CrossTrack, new G3XNavDataFieldXtkRenderer(unitsSettingManager));
  }

  /** @inheritdoc */
  public render<T extends NavDataFieldType>(type: T, model: NavDataFieldTypeModelMap[T]): VNode {
    return this.renderer.render(type, model);
  }
}