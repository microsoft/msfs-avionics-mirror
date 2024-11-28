/* eslint-disable jsdoc/require-jsdoc */

import {
  DefaultLodBoundaryCache, FSComponent, MapIndexedRangeModule, MapLayerProps, MapSystemBuilder, MapSystemContext,
  MapSystemKeys, MapWxrModule, MutableSubscribable, ReadonlyFloat64Array, Subject, Subscribable, UserSettingManager,
  Vec2Math, VecNMath, VecNSubject
} from '@microsoft/msfs-sdk';

import {
  GarminAirspaceShowTypeMap, GarminMapBuilder, GarminMapBuilderWaypointsLayerOptions, GarminMapKeys,
  MapAirspaceVisUserSettings, MapDeclutterMode, MapNexradModule, MapOrientation,
  MapOrientationSettingsControllerSettings, MapPanningModule, MapPanningRTRController, MapPanningRTRControllerContext,
  MapPanningRTRControllerModules, MapSymbolVisController, MapSymbolVisControllerModules, MapWaypointDisplayBuilder,
  MapWaypointVisUserSettings, MapWaypointsModule, MapWxrController, MapWxrControllerModules
} from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../CommonTypes';
import { G3XTouchFilePaths } from '../../G3XTouchFilePaths';
import { G3XFacilityUtils } from '../../Navigation/G3XFacilityUtils';
import { GduUserSettingTypes } from '../../Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../Settings/MapUserSettings';
import {
  G3XMapOrientationModeController, G3XMapOrientationModeControllerContext, G3XMapOrientationModeControllerModules,
  G3XMapTrackVectorController, G3XMapTrackVectorControllerModules, G3XMapTrackVectorUserSettings,
  MapDataIntegrityController, MapDataIntegrityControllerModules, MapDragPanController, MapDragPanControllerModules,
  MapDragPanRTRController, MapDragPanRTRControllerModules, MapRangeEndpointsController, MapWaypointLabelTextController,
  MapWaypointLabelTextControllerModules, MapWaypointLabelTextUserSettings
} from './Controllers';
import { G3XMapNexradController, G3XMapNexradControllerModules, G3XMapNexradUserSettings } from './Controllers/G3XMapNexradController';
import { G3XMapAirspaceRendering } from './G3XMapAirspaceRendering';
import { G3XMapKeys } from './G3XMapKeys';
import {
  G3XMapCompassArcLayer, G3XMapCompassArcLayerModules, G3XMapCompassArcLayerProps, G3XMapMiniCompassLayer, G3XMapTrackVectorLayer,
  G3XMapTrackVectorLayerModules, G3XMapTrackVectorLayerProps
} from './Layers';
import { G3XMapCompassArcModule, G3XMapTrackVectorModule, MapDragPanModule, MapLabelTextModule, MapOrientationOverrideModule } from './Modules';

/**
 * G3X Touch user settings controlling the visibility of map waypoints.
 */
export type G3XMapWaypointVisUserSettings = MapWaypointVisUserSettings & Pick<G3XMapUserSettingTypes, 'mapRunwayLabelRangeIndex'>;

/**
 * Styling options for the map compass arc.
 */
export type G3XMapCompassArcOptions = Omit<G3XMapCompassArcLayerProps, keyof MapLayerProps<any>>;

/**
 * Options for the map track vector.
 */
export type G3XMapTrackVectorOptions = Omit<G3XMapTrackVectorLayerProps, keyof MapLayerProps<any>>;

/**
 * Options for the nearest waypoints layer.
 */
export type G3XMapWaypointsLayerOptions = Pick<GarminMapBuilderWaypointsLayerOptions, 'supportRunwayOutlines'>;

/**
 * A builder for G3X Touch maps.
 */
export class G3XMapBuilder {

  /**
   * Configures a map builder to generate a map which supports different orientations, as enumerated by
   * {@link MapOrientation}. Each orientation defines a different rotation behavior and target offset.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.RotationControl]: ResourceModerator<void>`
   * * `[GarminMapKeys.OrientationControl]: ResourceModerator<void>`
   * * `[GarminMapKeys.DesiredOrientationControl]: ResourceModerator<void>`
   *
   * Modules:
   * * `[MapSystemKeys.Rotation]: MapRotationModule`
   * * `[GarminMapKeys.Orientation]: MapOrientationModule`
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule`
   * * `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`
   *
   * Controllers:
   * * `[G3XMapKeys.RangeEndpoints]: MapRangeEndpointsController`
   * * `[MapSystemKeys.Rotation]: MapRotationController`
   * * `[GarminMapKeys.OrientationRTR]: MapOrientationRTRController`
   * * `[GarminMapKeys.Orientation]: G3XMapOrientationModeController`
   * * `[GarminMapKeys.DesiredOrientation]: MapDesiredOrientationController`
   * * `[GarminMapKeys.OrientationSettings]: MapOrientationSettingsController` (only with user setting support)
   * @param mapBuilder The map builder to configure.
   * @param projectedRange The projected scale of the map's nominal range, in pixels.
   * @param nominalTargetOffsets The nominal projected target offsets defined by each orientation. Each target offset
   * is a 2-tuple `[x, y]`, where each component is expressed relative to the width or height of the map's projected
   * window, *excluding* the dead zone. If an orientation does not have a defined offset, it will default to `[0, 0]`.
   * @param settingManager A setting manager containing user settings used to control the map orientation. If not
   * defined, map orientation will not be bound to user settings.
   * @returns The map builder, after it has been configured.
   */
  public static orientation<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    projectedRange: number | Subscribable<number>,
    nominalTargetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    settingManager?: UserSettingManager<Partial<MapOrientationSettingsControllerSettings>>
  ): MapBuilder {
    const nominalRangeEndpoints = VecNSubject.create(VecNMath.create(4));

    return mapBuilder
      .withController(G3XMapKeys.RangeEndpoints, context => new MapRangeEndpointsController(context, projectedRange, nominalRangeEndpoints))
      .with(GarminMapBuilder.orientation,
        nominalTargetOffsets,
        {
          [MapOrientation.NorthUp]: nominalRangeEndpoints,
          [MapOrientation.TrackUp]: nominalRangeEndpoints,
          [MapOrientation.DtkUp]: nominalRangeEndpoints
        },
        settingManager
      )
      .withController<
        G3XMapOrientationModeController,
        G3XMapOrientationModeControllerModules, any, any, G3XMapOrientationModeControllerContext
      >(
        GarminMapKeys.Orientation,
        context => new G3XMapOrientationModeController(context)
      );
  }

  /**
   * Configures a map builder to generate a map which supports different orientations, as enumerated by
   * {@link MapOrientation}. Each orientation defines a different rotation behavior and target offset.
   *
   * Adds the module `[G3XMapKeys.OrientationOverride]: MapOrientationOverrideModule`.
   * @param mapBuilder The map builder to configure.
   * @returns The map builder, after it has been configured.
   */
  public static orientationOverride<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder
  ): MapBuilder {
    return mapBuilder
      .withModule(G3XMapKeys.OrientationOverride, () => new MapOrientationOverrideModule());
  }

  /**
   * Configures a map builder to generate a map which supports data integrity state. During loss of valid heading
   * information, the map will default to North Up orientation, and the player airplane icon will optionally be changed
   * to reflect this state. During loss of valid GPS signal, the map will stop attempting to follow the player
   * airplane, and the player airplane icon will be hidden.
   * @param mapBuilder The map builder to configure.
   * @param gduIndex The index of the GDU from which the map sources data.
   * @param gduSettingManager A manager for GDU user settings.
   * @param airplaneIconSrc A mutable subscribable which controls the player airplane icon's image source URI.
   * Required for this controller to change the player airplane icon.
   * @param airplaneIconAnchor A mutable subscribable which controls the anchor point of the player airplane icon.
   * Required for this controller to change the player airplane icon.
   * @param normalIconSrc The URI of the normal player airplane icon's image source, or a subscribable which provides
   * it. Required for the player airplane icon to change during loss of valid heading information.
   * @returns The map builder, after it has been configured.
   */
  public static dataIntegrity<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    gduIndex: number,
    gduSettingManager: UserSettingManager<GduUserSettingTypes>,
    airplaneIconSrc?: MutableSubscribable<string>,
    airplaneIconAnchor?: MutableSubscribable<ReadonlyFloat64Array>,
    normalIconSrc?: string | Subscribable<string>
  ): MapBuilder {
    return mapBuilder
      .with(GarminMapBuilder.dataIntegrity,
        airplaneIconSrc, airplaneIconAnchor,
        normalIconSrc, Vec2Math.create(0.5, 0.5),
        `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airplane_nohdg.svg`, Vec2Math.create(0.5, 0.5)
      )
      .withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, gduIndex, gduSettingManager)
      );
  }

  /**
   * Configures a map builder to generate a map which supports NEXRAD, and optionally binds the display of NEXRAD to
   * user settings.
   *
   * Requires the module `[MapSystemKeys.Weather]: MapWxrModule`.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule`
   * * `[GarminMapKeys.Nexrad]: MapNexradModule`
   *
   * Controllers:
   * * `[MapSystemKeys.Weather]: MapWxrController`
   * * `[GarminMapKeys.Nexrad]: G3XMapNexradController`
   * @param mapBuilder The map builder to configure.
   * @param minRangeIndex The minimum range index, inclusive, at which NEXRAD is visible. Defaults to `0`.
   * @param settingManager A user setting manager containing settings which control NEXRAD. If not defined, NEXRAD will
   * not be controlled by user settings.
   * @param colors The color array for the NEXRAD overlay. If not defined, default colors will be applied.
   * @returns The map builder, after it has been configured.
   */
  public static nexrad<MapBuilder extends MapSystemBuilder<{ [MapSystemKeys.Weather]: MapWxrModule }>>(
    mapBuilder: MapBuilder,
    minRangeIndex = 0,
    settingManager?: UserSettingManager<Partial<G3XMapNexradUserSettings>>,
    colors?: readonly (readonly [number, number])[]
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
      .withModule(GarminMapKeys.Nexrad, () => new MapNexradModule())
      .withController<MapWxrController, MapWxrControllerModules>(MapSystemKeys.Weather, context => new MapWxrController(context))
      .withController<G3XMapNexradController, G3XMapNexradControllerModules>(GarminMapKeys.Nexrad, context => {
        return new G3XMapNexradController(context, minRangeIndex, settingManager);
      })
      .withInit<{ [GarminMapKeys.Nexrad]: MapNexradModule }>(GarminMapKeys.Nexrad, context => {
        if (colors !== undefined) {
          context.model.getModule(GarminMapKeys.Nexrad).colors.set(colors);
        }
      });
  }

  /**
   * Configures a map builder to generate a map which displays a compass arc. The compass arc is displayed only in
   * Heading Up and Track Up orientation while the map is following the player airplane.
   *
   * Requires the following...
   *
   * Modules:
   * * `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`
   * * `[MapSystemKeys.AutopilotProps]: MapGarminAutopilotPropsModule` (only if the heading bug is shown)
   * * `[MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule`
   * * `[GarminMapKeys.Orientation]: MapOrientationModule`
   * * `[GarminMapKeys.Units]: MapUnitsModule` (only if magnetic/true bearing toggle is desired)
   *
   * Adds the following...
   *
   * Modules:
   * * `[G3XMapKeys.CompassArc]: G3XMapCompassArcModule`
   *
   * Layers:
   * * `[G3XMapKeys.CompassArc]: G3XMapCompassArcLayer`
   *
   * Controllers:
   * * `[G3XMapKeys.CompassArc]: MapRangeCompassController`
   * @param mapBuilder The map builder to configure.
   * @param options Styling options for the compass arc.
   * @param order The order to assign to the compass arc layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static compassArc<
    MapBuilder extends MapSystemBuilder<Omit<G3XMapCompassArcLayerModules, typeof G3XMapKeys.CompassArc>>
  >(
    mapBuilder: MapBuilder,
    options: Readonly<G3XMapCompassArcOptions>,
    order?: number
  ): MapBuilder {
    return mapBuilder
      .withModule(G3XMapKeys.CompassArc, () => new G3XMapCompassArcModule())
      .withLayer<G3XMapCompassArcLayer, G3XMapCompassArcLayerModules>(G3XMapKeys.CompassArc, context => {
        return (
          <G3XMapCompassArcLayer
            model={context.model}
            mapProjection={context.projection}
            {...options}
          />
        );
      }, order);
  }

  /**
   * Configures a map builder to generate a map which supports the display of waypoints located within the boundaries
   * of the map's projected window. Waypoints displayed in this manner are rendered by a `MapWaypointRenderer` under
   * the role `MapWaypointRenderRole.Normal`. Optionally binds the visibility of waypoints to user settings.
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
   * * `[G3XMapKeys.LabelText]: G3XMapLabelTextModule`
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
   * * `[G3XMapKeys.WaypointLabelText]: MapWaypointLabelTextController` (only if user settings are supported)
   * @param mapBuilder The map builder to configure.
   * @param configure A function used to configure the display and styling of waypoint icons and labels.
   * @param settingManager A setting manager containing the user settings controlling waypoint visibility and label
   * text. If not defined, waypoint visibility and label text will not be bound to user settings.
   * @param options Options with which to configure the layer.
   * @param order The order to assign to the waypoint layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static waypoints<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    configure: (builder: MapWaypointDisplayBuilder, context: MapSystemContext<any, any, any, any>) => void,
    settingManager?: UserSettingManager<Partial<G3XMapWaypointVisUserSettings & MapWaypointLabelTextUserSettings>>,
    options?: Readonly<G3XMapWaypointsLayerOptions>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withModule(G3XMapKeys.LabelText, () => new MapLabelTextModule())
      .with(GarminMapBuilder.waypoints, configure, undefined, {
        ...options,
        userFacilityScopeFilter: scope => scope === G3XFacilityUtils.USER_FACILITY_SCOPE
      }, order);

    if (settingManager) {
      mapBuilder.with(GarminMapBuilder.waypointVisSettings, settingManager, {
        vorMaxDeclutterMode: MapDeclutterMode.Level2,
        ndbMaxDeclutterMode: MapDeclutterMode.Level2,
        intMaxDeclutterMode: MapDeclutterMode.Level2
      });

      if (options?.supportRunwayOutlines) {
        const trueSubject = Subject.create(true);
        const maxSafeIntegerSubject = Subject.create(Number.MAX_SAFE_INTEGER);
        const runwayLabelRangeIndexSetting = settingManager?.tryGetSetting('mapRunwayLabelRangeIndex') ?? maxSafeIntegerSubject;

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
              runwayLabelRangeIndexSetting,
              MapDeclutterMode.Level2,
              context.model.getModule(MapSystemKeys.NearestWaypoints).runwayLabelShow
            );
          });
      }

      mapBuilder.withController<MapWaypointLabelTextController, MapWaypointLabelTextControllerModules>(G3XMapKeys.WaypointLabelText, context => {
        return new MapWaypointLabelTextController(context, settingManager);
      });
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which displays airspaces, and optionally binds the visibility of
   * airspaces to user settings.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.AirspaceManager]: GenericAirspaceRenderManager`
   *
   * Modules:
   * * `[MapSystemKeys.Airspace]: MapAirspaceModule`
   *
   * Layers:
   * * `[MapSystemKeys.Airspace]: MapAirspaceLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.AirspaceVisibility]: MapAirspaceVisController` (only with user settings support)
   * @param mapBuilder The map builder to configure.
   * @param gduFormat The format of the map's parent GDU.
   * @param settingManager A setting manager containing the user settings controlling airspace visibility. If not
   * defined, airspace visibility will not be controlled by user settings.
   * @param order The order to assign to the airspace layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static airspaces<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    gduFormat: GduFormat,
    settingManager?: UserSettingManager<Partial<MapAirspaceVisUserSettings>>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withAirspaces(
        DefaultLodBoundaryCache.getCache(),
        GarminAirspaceShowTypeMap.MAP,
        G3XMapAirspaceRendering.selectRenderer.bind(undefined, gduFormat),
        G3XMapAirspaceRendering.renderOrder,
        undefined,
        order
      );

    if (settingManager !== undefined) {
      mapBuilder.with(GarminMapBuilder.airspaceVisSettings, settingManager);
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map with a track vector, and optionally binds the display options of the
   * vector to user settings.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.TrackVector]: G3XMapTrackVectorModule`
   *
   * Layers:
   * * `[GarminMapKeys.TrackVector]: G3XMapTrackVectorLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.TrackVector]: G3XMapTrackVectorController` (only if user settings are supported)
   * @param mapBuilder The map builder to configure.
   * @param options Options for the track vector.
   * @param settingManager A setting manager containing user settings used to control the track vector. If not defined,
   * the track vector will not be bound to user settings.
   * @param order The order to assign to the track vector layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static trackVector<MapBuilder extends MapSystemBuilder<Omit<G3XMapTrackVectorLayerModules, typeof GarminMapKeys.TrackVector>>>(
    mapBuilder: MapBuilder,
    options: G3XMapTrackVectorOptions,
    settingManager?: UserSettingManager<Partial<G3XMapTrackVectorUserSettings>>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withModule(GarminMapKeys.TrackVector, () => new G3XMapTrackVectorModule())
      .withLayer<G3XMapTrackVectorLayer, G3XMapTrackVectorLayerModules>(GarminMapKeys.TrackVector, context => {
        return (
          <G3XMapTrackVectorLayer
            model={context.model}
            mapProjection={context.projection}
            {...options}
          />
        );
      }, order);

    if (settingManager) {
      mapBuilder.withController<G3XMapTrackVectorController, G3XMapTrackVectorControllerModules>(GarminMapKeys.TrackVector, context => {
        return new G3XMapTrackVectorController(context, settingManager);
      });
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which displays a miniature compass.
   *
   * Adds the layer `GarminMapKeys.MiniCompass: G3XMapMiniCompassLayer`.
   * @param mapBuilder The map builder to configure.
   * @param supportOrientationToggle Whether the compass should support the orientation toggle feature. If defined,
   * then the compass will function as a touchscreen button. If not defined, then the compass will not function as a
   * button. The orientation toggle feature requires the following modules:
   *
   * * `[GarminMapKeys.Orientation]: MapOrientationModule`
   * * `[G3XMapKeys.OrientationOverride]: MapOrientationOverrideModule`
   *
   * Defaults to `false`.
   * @param order The order to assign to the mini-compass layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static miniCompass<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    supportOrientationToggle?: boolean,
    order?: number
  ): MapBuilder {
    return mapBuilder.withLayer(GarminMapKeys.MiniCompass, context => {
      return (
        <G3XMapMiniCompassLayer
          model={context.model}
          mapProjection={context.projection}
          supportOrientationToggle={supportOrientationToggle}
        />
      );
    }, order);
  }

  /**
   * Configures a map builder to generate a map with drag-to-pan support. Activating drag-to-pan allows the user to
   * control map panning by dragging the map and stops the map from actively rotating.
   *
   * If map target, orientation, or rotation control resource moderators exist on the map context, the panning RTR
   * controller will attempt to claim those resources with a priority of `100`. Otherwise, the controller assumes
   * nothing else controls the map target or rotation.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Panning]: MapPanningModule`
   * * `[G3XMapKeys.DragPan]: MapDragPanModule`
   *
   * Controllers:
   * * `[GarminMapKeys.PanningRTR]: MapPanningRTRController`
   * * `[G3XMapKeys.DragPan]: MapDragPanController` (can be used to control the behavior of drag-to-pan)
   * * `[G3XMapKeys.DragPanRTR]: MapDragPanRTRController`
   * @param mapBuilder The map builder to configure.
   * @returns The map builder, after it has been configured.
   */
  public static dragPan<MapBuilder extends MapSystemBuilder<any, any, any, MapPanningRTRControllerContext>>(
    mapBuilder: MapBuilder
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.Panning, () => new MapPanningModule())
      .withModule(G3XMapKeys.DragPan, () => new MapDragPanModule())
      .withController<MapPanningRTRController, MapPanningRTRControllerModules, any, any, MapPanningRTRControllerContext>(
        GarminMapKeys.PanningRTR,
        context => new MapPanningRTRController(context)
      )
      .withController<MapDragPanController, MapDragPanControllerModules>(G3XMapKeys.DragPan, context => new MapDragPanController(context))
      .withController<MapDragPanRTRController, MapDragPanRTRControllerModules>(G3XMapKeys.DragPanRTR, context => new MapDragPanRTRController(context));
  }
}
