import { UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { DateTimeUserSettingTypes } from '../../settings/DateTimeUserSettings';
import { UnitsUserSettingManager } from '../../settings/UnitsUserSettings';
import { NavDataFieldType, NavDataFieldTypeModelMap } from '../navdatafield/NavDataFieldType';
import { NavDataFieldRenderer } from '../navdatafield/NavDataFieldRenderer';
import { GenericNavDataFieldRenderer } from '../navdatafield/GenericNavDataFieldRenderer';
import {
  NextGenNavDataFieldBrgRenderer, NextGenNavDataFieldDestRenderer, NextGenNavDataFieldDisRenderer, NextGenNavDataFieldDtgRenderer,
  NextGenNavDataFieldDtkRenderer, NextGenNavDataFieldEndRenderer, NextGenNavDataFieldEtaRenderer, NextGenNavDataFieldEteRenderer, NextGenNavDataFieldFobRenderer,
  NextGenNavDataFieldFodRenderer, NextGenNavDataFieldGsRenderer, NextGenNavDataFieldIsaRenderer, NavDataFieldLdgRenderer, NextGenNavDataFieldTasRenderer,
  NextGenNavDataFieldTkeRenderer, NextGenNavDataFieldTrkRenderer, NextGenNavDataFieldVsrRenderer, NextGenNavDataFieldXtkRenderer, NextGenNavDataFieldEnrRenderer
} from '../navdatafield/NextGenNavDataFieldTypeRenderers';

/**
 * A next-generation (NXi, G3000, etc) implementation of {@link NavDataFieldRenderer} which supports all navigation
 * data bar field types.
 */
export class NextGenNavDataBarFieldRenderer implements NavDataFieldRenderer {
  protected readonly renderer: GenericNavDataFieldRenderer;

  /**
   * Constructor.
   * @param unitsSettingManager A display units user setting manager.
   * @param dateTimeSettingManager A date/time user setting manager.
   */
  constructor(
    unitsSettingManager: UnitsUserSettingManager,
    dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>
  ) {
    this.renderer = new GenericNavDataFieldRenderer();

    this.renderer.register(NavDataFieldType.BearingToWaypoint, new NextGenNavDataFieldBrgRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Destination, new NextGenNavDataFieldDestRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToWaypoint, new NextGenNavDataFieldDisRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToDestination, new NextGenNavDataFieldDtgRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DesiredTrack, new NextGenNavDataFieldDtkRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Endurance, new NextGenNavDataFieldEndRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeToDestination, new NextGenNavDataFieldEnrRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeOfWaypointArrival, new NextGenNavDataFieldEtaRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.TimeToWaypoint, new NextGenNavDataFieldEteRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOnBoard, new NextGenNavDataFieldFobRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOverDestination, new NextGenNavDataFieldFodRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.GroundSpeed, new NextGenNavDataFieldGsRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.ISA, new NextGenNavDataFieldIsaRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeOfDestinationArrival, new NavDataFieldLdgRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.TrueAirspeed, new NextGenNavDataFieldTasRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TrackAngleError, new NextGenNavDataFieldTkeRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.GroundTrack, new NextGenNavDataFieldTrkRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.VerticalSpeedRequired, new NextGenNavDataFieldVsrRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.CrossTrack, new NextGenNavDataFieldXtkRenderer(unitsSettingManager));
  }

  /** @inheritdoc */
  public render<T extends NavDataFieldType>(type: T, model: NavDataFieldTypeModelMap[T]): VNode {
    return this.renderer.render(type, model);
  }
}