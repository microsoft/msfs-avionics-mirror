import {
  AirportRunway, BingComponent, FlightPlanner, FlightPlannerEvents, GeoPoint, GeoPointInterface, GPSSatComputerEvents, GPSSystemState, LNavEvents, MapRotation,
  MapSystemContext, MapSystemController, MapSystemKeys, MapTrafficAlertLevelVisibility, NavEvents, NavMath, NumberUnitInterface, ResourceConsumer, Unit,
  UnitFamily, UnitType, UserSetting, UserSettingValueFilter, Vec2Math
} from '@microsoft/msfs-sdk';

import {
  AirportSize, AirportWaypoint, GarminMapKeys, LNavDataEvents, MapTrafficAltitudeRestrictionMode, MapTrafficMotionVectorMode
} from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { MapDeclutterLevel, MapSettings, MapSettingsRanges, MapSettingsRangesMapNM, MapTrafficMode } from '../../../Settings/MapSettingsProvider';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from './GNSMapSystem';

/**
 * A class that holds the GNS map terrain color definitions.
 */
class TerrainColors {
  public static readonly Relative = {
    colors: BingComponent.createEarthColorsArray('#0000ff', [
      {
        elev: 0,
        color: '#ff0000'
      },
      {
        elev: 99,
        color: '#ff0000'
      },
      {
        elev: 100,
        color: '#ffff00'
      },
      {
        elev: 999,
        color: '#ffff00'
      },
      {
        elev: 1000,
        color: '#000000'
      },
    ], 0, 1000, 11),

    elevationRange: Vec2Math.create(0, 1000)
  };

  public static readonly None = {
    colors: BingComponent.createEarthColorsArray('#0000ff', [
      {
        elev: 0,
        color: '#000000'
      },
    ], 0, 1000, 1),

    elevationRange: Vec2Math.create(0, 30000)
  };
}

/**
 * A controller that handles maps on the GNS units.
 */
export class GNSMapController extends MapSystemController<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps> {
  private readonly rangeObject = { range: UnitType.NMILE.createNumber(5).asUnit(UnitType.GA_RADIAN) };
  private readonly airportFocusTargetConsumer: ResourceConsumer = {
    priority: 100,
    onAcquired: () => this.onAirportFocusClaimed(),
    onCeded: () => { }
  };

  private focusedAirport?: AirportWaypoint;
  private focusedRunwayIndex = -1;

  private nexradEnabled = false;

  /**
   * Creates an instance of the GNSMapController.
   * @param context The map system context to use with this controller.
   * @param settingProvider The GNS settings provider to use with this controller.
   * @param flightPlanner The GNS FMS flight planner.
   * @param forceTrackUp Whether or not the map is forced into track up mode.
   */
  constructor(context: MapSystemContext<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps>,
    private readonly settingProvider: GNSSettingsProvider,
    private readonly flightPlanner: FlightPlanner,
    private readonly forceTrackUp?: boolean) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    const rangeModule = this.context.model.getModule(GNSMapKeys.Range);
    const rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);

    this.handleRangeChange(rangeModule.nominalRange.get());
    rangeModule.nominalRange.sub(this.handleRangeChange.bind(this));

    if (this.forceTrackUp) {
      rotationModule.rotationType.set(MapRotation.TrackUp);
    } else {
      this.settingProvider.map.getSetting('map_orientation').sub(r => rotationModule.rotationType.set(r), true);
    }

    this.context.bus.getSubscriber<LNavDataEvents>().on('lnavdata_waypoint_bearing_true').whenChanged().handle(brg => this.onWaypointBearingChanged(brg));
    this.context.bus.getSubscriber<FlightPlannerEvents>().on('fplActiveLegChange')
      .handle(() => this.onWaypointBearingChanged(this.context.model.getModule(GNSMapKeys.WaypointBearing)?.waypointBearing.get()));

    this.settingProvider.map.getAllSettings().forEach(s => s.sub(() => this.syncElementVisibilities(rangeModule.nominalRange.get()), true));
    this.context.model.getModule(GNSMapKeys.Declutter)?.declutterLevel.sub(() => this.syncElementVisibilities(rangeModule.nominalRange.get()), true);
    rotationModule.rotationType.sub(this.onRotationChanged.bind(this), true);

    this.context.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(state => {
      this.context.model.getModule(MapSystemKeys.DataIntegrity).gpsSignalValid.set(
        state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired
      );
    });

    this.context.model.getModule(MapSystemKeys.DataIntegrity).gpsSignalValid.sub(valid => {
      if (valid) {
        this.context.model.getModule(MapSystemKeys.OwnAirplaneIcon)?.show.set(true);

        if (this.forceTrackUp) {
          rotationModule.rotationType.set(MapRotation.TrackUp);
        } else {
          rotationModule.rotationType.set(this.settingProvider.map.getSetting('map_orientation').get());
        }
      } else {
        this.context.model.getModule(MapSystemKeys.OwnAirplaneIcon)?.show.set(false);
        rotationModule.rotationType.set(MapRotation.NorthUp);
      }
    }, true);

    //Kick the plan calculated event when the LNAV transition mode changes in order to force
    //a flight plan redraw (needed for switching draw styles during holds)
    this.context.bus.getSubscriber<LNavEvents>().on('lnav_transition_mode').whenChanged().handle(() => {
      this.context.model.getModule('flightPlan').getPlanSubjects(0).planCalculated.notify(undefined);
    });

    this.context.bus.getSubscriber<NavEvents>().on('gps_obs_active').whenChanged().handle(this.onObsActiveChanged.bind(this));
  }

  /**
   * Handles when the active waypoint bearing changes.
   * @param brg The new active waypoint bearing.
   */
  private onWaypointBearingChanged(brg: number | undefined): void {
    const dtkModule = this.context.model.getModule(GNSMapKeys.WaypointBearing);

    if (dtkModule !== undefined) {
      if (this.flightPlanner.hasActiveFlightPlan() && this.flightPlanner.getActiveFlightPlan().length > 1) {
        dtkModule.waypointBearing.set(brg);
      } else {
        dtkModule.waypointBearing.set(undefined);
      }
    }
  }

  /**
   * Handles when the map rotation changes.
   * @param type The type of rotation that was changed to.
   */
  private onRotationChanged(type: MapRotation): void {
    if (!this.forceTrackUp) {
      if (type === MapRotation.NorthUp) {
        this.context.projection.setQueued({ targetProjectedOffset: new Float64Array([0, 0]) });
      } else {
        this.context.projection.setQueued({ targetProjectedOffset: new Float64Array([0, 34]) });
      }
    }
  }

  /**
   * Sets the map range.
   * @param range The range to set the map projection to.
   */
  private handleRangeChange(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    this.rangeObject.range = range.asUnit(UnitType.GA_RADIAN) * 1.075;
    this.context.projection.setQueued(this.rangeObject);
    this.syncElementVisibilities(range);
  }

  /**
   * Increases the map range.
   */
  public increaseRange(): void {
    const rangeModule = this.context.model.getModule(GNSMapKeys.Range);
    rangeModule.setNominalRangeIndex(NavMath.clamp(rangeModule.nominalRangeIndex.get() + 1, 0, rangeModule.nominalRanges.get().length - 1));
  }

  /**
   * Decreases the map range.
   */
  public decreaseRange(): void {
    const rangeModule = this.context.model.getModule(GNSMapKeys.Range);
    rangeModule.setNominalRangeIndex(NavMath.clamp(rangeModule.nominalRangeIndex.get() - 1, 0, rangeModule.nominalRanges.get().length - 1));
  }

  /**
   * Changes the current provided setting's declutter level.
   * @param setting The declutter user setting to change.
   */
  public changeDeclutter(setting: UserSetting<MapDeclutterLevel>): void {
    const declutterLevel = setting.get();
    switch (declutterLevel) {
      case MapDeclutterLevel.None:
        setting.set(MapDeclutterLevel.One);
        break;
      case MapDeclutterLevel.One:
        setting.set(MapDeclutterLevel.Two);
        break;
      case MapDeclutterLevel.Two:
        setting.set(MapDeclutterLevel.Three);
        break;
      case MapDeclutterLevel.Three:
        setting.set(MapDeclutterLevel.None);
        break;
    }
  }

  /**
   * Targets the map on the airport and automatically sets the range so the selected
   * runway at the runway index is within the map range.
   * @param airport The airport to focus on.
   * @param runwayIndex The index of the runway to focus on.
   */
  public focusAirport(airport: AirportWaypoint, runwayIndex: number): void {
    this.focusedAirport = airport;
    this.focusedRunwayIndex = runwayIndex;

    const runwaysModule = this.context.model.getModule(GNSMapKeys.Runways);
    runwaysModule.focusAirport.set(this.focusedAirport);

    this.context.targetControlModerator.forfeit(this.airportFocusTargetConsumer);
    this.context.targetControlModerator.claim(this.airportFocusTargetConsumer);
  }

  /**
   * Unfocuses from an airport and runway, and resumes own aircraft following.
   */
  public unfocusAirport(): void {
    this.focusedAirport = undefined;
    this.focusedRunwayIndex = -1;

    const runwaysModule = this.context.model.getModule(GNSMapKeys.Runways);
    runwaysModule.focusAirport.set(undefined);

    this.context.targetControlModerator.forfeit(this.airportFocusTargetConsumer);
  }

  /**
   * Overrides the default map rotation settings for the map.
   * @param rotation The rotation to set.
   */
  public overrideRotation(rotation: MapRotation): void {
    this.context.model.getModule(MapSystemKeys.Rotation).rotationType.set(rotation);
  }

  /**
   * Sets whether or not NEXRAD should be visible on the map.
   * @param isVisible Whether or not NEXRAD is visible.
   */
  public setNexradVisible(isVisible: boolean): void {
    this.nexradEnabled = isVisible;

    const rangeModule = this.context.model.getModule(GNSMapKeys.Range);
    this.syncNexradVisibility(rangeModule.nominalRange.get());
  }

  /**
   * Sets whether or not the terrain display is enabled.
   * @param enabled Whether or not terrain display is enabled.
   */
  public setTerrainEnabled(enabled: boolean): void {
    const terrainModule = this.context.model.getModule(MapSystemKeys.TerrainColors);
    if (enabled) {
      terrainModule.reference.set(EBingReference.PLANE);
      terrainModule.colors.set(TerrainColors.Relative.colors);
      terrainModule.colorsElevationRange.set(TerrainColors.Relative.elevationRange);
    } else {
      terrainModule.reference.set(EBingReference.SEA);
      terrainModule.colors.set(TerrainColors.None.colors);
      terrainModule.colorsElevationRange.set(TerrainColors.None.elevationRange);
    }
  }

  /**
   * A callback called when airport focus is claimed.
   */
  private onAirportFocusClaimed(): void {
    if (this.focusedAirport !== undefined) {
      const runwaysModule = this.context.model.getModule(GNSMapKeys.Runways);
      runwaysModule.focusAirport.set(this.focusedAirport);
      this.context.projection.setQueued({ target: this.focusedAirport.location.get() });


      const rotationModule = this.context.model.getModule(MapSystemKeys.Rotation);
      rotationModule.rotationType.set(MapRotation.NorthUp);

      const runway = this.focusedAirport.facility.get().runways[this.focusedRunwayIndex];
      let distance = 0;
      let center = this.focusedAirport.location.get();

      if (runway === undefined) {
        distance = this.getMaxRunwayDistanceFromPoint(this.focusedAirport.facility.get().runways, this.focusedAirport.location.get());
      } else {
        center = new GeoPoint(runway.latitude, runway.longitude);
        distance = this.getMaxRunwayDistanceFromPoint([runway], center);
      }

      const minRange = distance * 2.33;
      const rangeModule = this.context.model.getModule(GNSMapKeys.Range);
      const ranges = rangeModule.nominalRanges.get();

      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i].asUnit(UnitType.GA_RADIAN);
        if (range > minRange) {
          rangeModule.setNominalRangeIndex(i);
          break;
        }
      }

      this.context.projection.setQueued({ target: center });
    }
  }

  /**
   * Gets the maximum runway extend distance from a supplied point.
   * @param runways The runways to get distances for.
   * @param point The point to reference against.
   * @returns The maximum runway extent distance, in GA radians.
   */
  private getMaxRunwayDistanceFromPoint(runways: AirportRunway[], point: GeoPointInterface): number {
    const primaryEnd = new GeoPoint(0, 0);
    const secondaryEnd = new GeoPoint(0, 0);
    let distance = 0;

    for (let i = 0; i < runways.length; i++) {
      const runway = runways[i];
      point.offset(runway.direction, UnitType.METER.convertTo(runway.length / 2, UnitType.GA_RADIAN), primaryEnd);
      point.offset(NavMath.normalizeHeading(runway.direction + 180), UnitType.METER.convertTo(runway.length / 2, UnitType.GA_RADIAN), secondaryEnd);

      distance = Math.max(distance, point.distance(primaryEnd), point.distance(secondaryEnd));
    }

    return distance;
  }

  /**
   * Synchronizes all map element visibilities when the map range changes.
   * @param range The new map range.
   */
  private syncElementVisibilities(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    this.syncWaypointVisibilities(range);
    this.syncAirspaceVisibilities(range);
    this.syncRunwayVisibilities(range);
    this.syncNexradVisibility(range);
    this.syncTrafficVisibility(range);
  }

  /**
   * Syncs the vectorized runway display visibilities when the map range changes.
   * @param range The new map range.
   */
  private syncRunwayVisibilities(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    const runwaysModule = this.context.model.getModule(GNSMapKeys.Runways);
    const declutterLevel = this.context.model.getModule(GNSMapKeys.Declutter)?.declutterLevel.get();
    const removeRunways = declutterLevel === MapDeclutterLevel.Three;

    const shouldDisplayRunways = range.compare(UnitType.NMILE.createNumber(10)) <= 0 && !removeRunways;
    const shouldDisplayRunwayLabels = range.compare(UnitType.NMILE.createNumber(5)) <= 0 && !removeRunways;

    runwaysModule.displayRunways.set(shouldDisplayRunways);
    runwaysModule.displayLabels.set(shouldDisplayRunwayLabels);
  }

  /**
   * Syncs the airspace display visibilities when the map range changes.
   * @param range The new map range.
   */
  private syncAirspaceVisibilities(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    const airspaceModule = this.context.model.getModule(MapSystemKeys.Airspace);

    let removeNormAirspace = false;
    let removeRestricted = false;

    const declutterLevel = this.context.model.getModule(GNSMapKeys.Declutter)?.declutterLevel.get();
    if (declutterLevel === MapDeclutterLevel.Two) {
      removeNormAirspace = true;
    } else if (declutterLevel === MapDeclutterLevel.Three) {
      removeNormAirspace = true;
      removeRestricted = true;
    }

    const shouldDisplayClassB = range.compare(this.getSettingDistance('airspace_classb_range')) <= 0 && !removeNormAirspace;
    const shouldDisplayClassC = range.compare(this.getSettingDistance('airspace_classc_range')) <= 0 && !removeNormAirspace;
    const shouldDisplayClassD = range.compare(this.getSettingDistance('airspace_classd_range')) <= 0 && !removeNormAirspace;
    const shouldDisplayMoa = range.compare(this.getSettingDistance('airspace_moa_range')) <= 0 && !removeNormAirspace;
    const shouldDisplayRestriced = range.compare(this.getSettingDistance('airspace_restricted_range')) <= 0 && !removeRestricted;
    const shouldDisplayOther = range.compare(this.getSettingDistance('airspace_other_range')) <= 0;

    airspaceModule.show.ClassB.set(shouldDisplayClassB);
    airspaceModule.show.ClassC.set(shouldDisplayClassC);
    airspaceModule.show.ClassD.set(shouldDisplayClassD);
    airspaceModule.show.MOA.set(shouldDisplayMoa);
    airspaceModule.show.Other.set(shouldDisplayOther);
    airspaceModule.show.Restricted.set(shouldDisplayRestriced);
  }

  /**
   * Syncs the waypoint display visibilities when the map range changes.
   * @param range The new map range.
   */
  private syncWaypointVisibilities(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    const waypointModule = this.context.model.getModule(MapSystemKeys.NearestWaypoints);
    let removeLevelTwo = false;
    let removeAll = false;

    const declutterLevel = this.context.model.getModule('declutter')?.declutterLevel.get();
    if (declutterLevel === MapDeclutterLevel.Two) {
      removeLevelTwo = true;
    } else if (declutterLevel === MapDeclutterLevel.Three) {
      removeLevelTwo = true;
      removeAll = true;
    }

    const shouldDisplayInt = range.compare(this.getSettingDistance('wpt_int_range')) <= 0 && !removeLevelTwo;
    waypointModule.showIntersections.set(() => shouldDisplayInt);
    waypointModule.numIntersections.set(250);

    const shouldDisplayNdb = range.compare(this.getSettingDistance('wpt_ndb_range')) <= 0 && !removeLevelTwo;
    waypointModule.showNdbs.set(() => shouldDisplayNdb);

    const shouldDisplayVor = range.compare(this.getSettingDistance('wpt_vor_range')) <= 0 && !removeAll;
    waypointModule.showVors.set(() => shouldDisplayVor);

    const shouldDisplayLargeApt = range.compare(this.getSettingDistance('wpt_large_apt_range')) <= 0 && !removeAll;
    const shouldDisplayMediumApt = range.compare(this.getSettingDistance('wpt_medium_apt_range')) <= 0 && !removeAll;
    const shouldDisplaySmallApt = range.compare(this.getSettingDistance('wpt_small_apt_range')) <= 0 && !removeAll;

    waypointModule.showAirports.set(f => {
      const airport = f as AirportWaypoint;
      switch (airport.size) {
        case AirportSize.Small:
          return shouldDisplaySmallApt;
        case AirportSize.Medium:
          return shouldDisplayMediumApt;
        case AirportSize.Large:
          return shouldDisplayLargeApt;
      }
    });
  }

  /**
   * Syncs visibility of the NEXRAD weather display.
   * @param range The new map range.
   */
  private syncNexradVisibility(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    const weatherModule = this.context.model.getModule(MapSystemKeys.Weather);
    if (this.nexradEnabled && range.compare(UnitType.NMILE.createNumber(10)) >= 0) {
      weatherModule.weatherRadarMode.set(EWeatherRadar.TOPVIEW);
      weatherModule.isEnabled.set(true);
    } else {
      weatherModule.isEnabled.set(false);
    }
  }

  /**
   * Syncs visibility of the traffic elements.
   * @param range The new map range.
   */
  private syncTrafficVisibility(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    const garminTrafficModule = this.context.model.getModule(GarminMapKeys.Traffic);
    const trafficModule = this.context.model.getModule(MapSystemKeys.Traffic);

    if (garminTrafficModule !== undefined && trafficModule !== undefined) {
      garminTrafficModule.altitudeRestrictionMode.set(MapTrafficAltitudeRestrictionMode.Unrestricted);
      garminTrafficModule.motionVectorMode.set(MapTrafficMotionVectorMode.Absolute);

      const trafficModeSetting = this.settingProvider.map.getSetting('map_traffic_mode');
      switch (trafficModeSetting.get()) {
        case MapTrafficMode.All:
          trafficModule.alertLevelVisibility.set(MapTrafficAlertLevelVisibility.All);
          break;
        case MapTrafficMode.TAAndProximity:
          trafficModule.alertLevelVisibility.set(MapTrafficAlertLevelVisibility.ProximityAdvisory | MapTrafficAlertLevelVisibility.TrafficAdvisory);
          break;
        case MapTrafficMode.TAOnly:
          trafficModule.alertLevelVisibility.set(MapTrafficAlertLevelVisibility.TrafficAdvisory);
          break;
      }

      const showTraffic = range.compare(this.getSettingDistance('map_traffic_symbol_range')) <= 0;
      const showTrafficLabels = range.compare(this.getSettingDistance('map_traffic_label_range')) <= 0;

      garminTrafficModule.show.set(showTraffic);
      garminTrafficModule.showIntruderLabel.set(showTrafficLabels);
    }
  }

  /**
   * Gets the distance unit from a map setting key.
   * @param name The name of the map settin key.
   * @returns The setting distance unit.
   * @throws An error if the setting could not be converted to a distance unit.
   */
  private getSettingDistance<K extends keyof UserSettingValueFilter<MapSettings, MapSettingsRanges>>(name: K): NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>> {
    const value = this.settingProvider.map.getSetting(name).get();
    const range = MapSettingsRangesMapNM.get(value);

    if (range === undefined) {
      throw new Error(`Range enum ${value} could not be converted into a valid range.`);
    }

    return range;
  }

  /**
   * Handles when OBS becomes active or inactive.
   * @param isActive Whether or not OBS is active.
   */
  private onObsActiveChanged(isActive: boolean): void {
    this.context.getLayer('flightPlan0')?.setVisible(!isActive);
    this.context.getLayer('flightPlan1')?.setVisible(!isActive);
    this.context.getLayer(GNSMapKeys.Obs)?.setVisible(isActive);
  }

  /** @inheritdoc */
  public onWake(): void {
    this.context.model.getModule(GNSMapKeys.Range).updateMapRangeSimvar();
  }
}