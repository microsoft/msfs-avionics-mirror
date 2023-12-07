/* eslint-disable jsdoc/require-jsdoc */

import { MapSystemBuilder, MapSystemContext, MapSystemKeys, Subject, UserSettingManager } from '@microsoft/msfs-sdk';

import { MapSymbolVisController, MapSymbolVisControllerModules, MapWaypointVisUserSettings } from './controllers';
import { GarminMapBuilder } from './GarminMapBuilder';
import { GarminMapKeys } from './GarminMapKeys';
import { MapWaypointDisplayBuilder } from './MapWaypointDisplayBuilder';
import { MapDeclutterMode, MapWaypointsModule } from './modules';

/**
 * A builder for next-generation (NXi, G3000, etc) Garmin maps.
 */
export class NextGenGarminMapBuilder {

  /**
   * Configures a map builder to generate a map which supports the display of waypoints located within the boundaries
   * of the map's projected window. Waypoints displayed in this manner are rendered by a {@link MapWaypointRenderer}
   * under the role {@link MapWaypointRenderRole.Normal}. Optionally binds the visibility of waypoints to user
   * settings.
   *
   * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
   * waypoint layer. Otherwise, a text layer will be added to the builder after the waypoint layer.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
   * * `[MapSystemKeys.WaypointRenderer]: MapWaypointRenderer`
   * * `[GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilder`
   *
   * Modules:
   * * `[MapSystemKeys.NearestWaypoints]: MapWaypointsModule`
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule` (only if user settings are supported)
   *
   * Layers:
   * * `[MapSystemKeys.NearestWaypoints]: MapWaypointsLayer`
   * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
   *
   * Controllers:
   * * `[MapSystemKeys.WaypointRenderer]: MapSystemCustomController` (handles initialization and updating of the
   * waypoint renderer)
   * * `[GarminMapKeys.WaypointsVisibility]: MapWaypointsVisController` (only if user settings are supported)
   * * `[GarminMapKeys.RunwayVisibility]: MapSymbolVisController` (only if runway outlines are supported)
   * * `[GarminMapKeys.RunwayLabelVisibility]: MapSymbolVisController` (only if runway outlines are supported)
   * @param mapBuilder The map builder to configure.
   * @param configure A function used to configure the display and styling of waypoint icons and labels.
   * @param supportRunwayOutlines Whether to support the rendering of airport runway outlines.
   * @param settingManager A setting manager containing the user settings controlling waypoint visibility. If not
   * defined, waypoint visibility will not be bound to user settings.
   * @param order The order to assign to the waypoint layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static waypoints<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    configure: (builder: MapWaypointDisplayBuilder, context: MapSystemContext<any, any, any, any>) => void,
    supportRunwayOutlines: boolean,
    settingManager?: UserSettingManager<Partial<MapWaypointVisUserSettings>>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .with(GarminMapBuilder.waypoints, configure, supportRunwayOutlines, settingManager, order);

    if (supportRunwayOutlines && settingManager) {
      const trueSubject = Subject.create(true);
      const maxSafeIntegerSubject = Subject.create(Number.MAX_SAFE_INTEGER);

      mapBuilder
        .withController<
          MapSymbolVisController, MapSymbolVisControllerModules & { [MapSystemKeys.NearestWaypoints]: MapWaypointsModule }
        >(GarminMapKeys.RunwayVisibility, context => {
          return new MapSymbolVisController(
            context,
            trueSubject,
            maxSafeIntegerSubject,
            MapDeclutterMode.Level2,
            context.model.getModule(MapSystemKeys.NearestWaypoints).runwayShow
          );
        })
        .withController<
          MapSymbolVisController, MapSymbolVisControllerModules & { [MapSystemKeys.NearestWaypoints]: MapWaypointsModule }
        >(GarminMapKeys.RunwayLabelVisibility, context => {
          return new MapSymbolVisController(
            context,
            trueSubject,
            maxSafeIntegerSubject,
            MapDeclutterMode.Level2,
            context.model.getModule(MapSystemKeys.NearestWaypoints).runwayLabelShow
          );
        });
    }

    return mapBuilder;
  }
}