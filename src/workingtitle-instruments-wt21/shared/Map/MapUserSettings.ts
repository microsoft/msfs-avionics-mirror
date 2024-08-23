import { AliasedUserSettingManager, DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

import { MfdIndexEvents } from '../MfdIndexEvents';

/** A format for the HSI compass. */
export type HSIFormat = typeof MapUserSettings.hsiFormatsAll[number];

/** TERR/WX state */
export type TerrWxState = typeof MapUserSettings.terrWxStates[number];

/** A format for the HSI compass. */
export type MapRange = typeof MapUserSettings.mapRanges[number];

// eslint-disable-next-line jsdoc/require-jsdoc
export type PfdOrMfd = 'PFD' | 'MFD';

/** Bitflags that describe which map waypoint types should be displayed. */
export enum MapWaypointsDisplay {
  None = 0,
  NearestAirports = 1 << 0,
  HiNavaids = 1 << 1,
  LoNavaids = 1 << 2,
  Intersections = 1 << 3,
  TerminalWaypoints = 1 << 4,
  ETA = 1 << 5,
  Speed = 1 << 6,
  Altitude = 1 << 7,
  Airports = 1 << 8,
  NDBs = 1 << 9,
  MissedApproach = 1 << 10,
}

const mapSettings = [
  {
    name: 'hsiFormatPFD',
    defaultValue: 'ARC' as HSIFormat
  },
  {
    name: 'hsiFormatMFD_1',
    defaultValue: 'PPOS' as HSIFormat
  },
  {
    name: 'hsiFormatMFD_2',
    defaultValue: 'PPOS' as HSIFormat
  },
  {
    name: 'mapRange_1',
    defaultValue: 5 as MapRange
  },
  {
    name: 'mapRange_2',
    defaultValue: 25 as MapRange
  },
  {
    name: 'tfcEnabledPFD',
    defaultValue: true as boolean
  },
  {
    name: 'tfcEnabledMFD_1',
    defaultValue: true as boolean
  },
  {
    name: 'tfcEnabledMFD_2',
    defaultValue: true as boolean
  },
  {
    name: 'mapAltitudeArcShowPFD',
    defaultValue: false as boolean
  },
  {
    name: 'mapAltitudeArcShowMFD_1',
    defaultValue: false as boolean
  },
  {
    name: 'mapAltitudeArcShowMFD_2',
    defaultValue: false as boolean
  },
  {
    name: 'terrWxStatePFD',
    defaultValue: 'OFF' as TerrWxState
  },
  {
    name: 'terrWxStateMFD_1',
    defaultValue: 'OFF' as TerrWxState
  },
  {
    name: 'terrWxStateMFD_2',
    defaultValue: 'OFF' as TerrWxState
  },
  {
    name: 'nexradEnabledMFD_1',
    defaultValue: false as boolean
  },
  {
    name: 'nexradEnabledMFD_2',
    defaultValue: false as boolean
  },
  {
    name: 'mapWaypointsDisplayPFD',
    defaultValue: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids
  },
  {
    name: 'mapWaypointsDisplayMFD_1',
    defaultValue: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids
  },
  {
    name: 'mapWaypointsDisplayMFD_2',
    defaultValue: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids
  },
  {
    name: 'mapExtendedMFD_1',
    defaultValue: false as boolean
  },
  {
    name: 'mapExtendedMFD_2',
    defaultValue: false as boolean
  }
] as const;

const mapSettingsPfdAliased = [
  {
    name: 'hsiFormat',
    defaultValue: 'ARC' as HSIFormat
  },
  {
    name: 'mapRange',
    defaultValue: 5 as MapRange
  },
  {
    name: 'tfcEnabled',
    defaultValue: true as boolean
  },
  {
    name: 'terrWxState',
    defaultValue: 'OFF' as TerrWxState
  },
  {
    name: 'mapAltitudeArcShow',
    defaultValue: false as boolean
  },
  {
    name: 'mapWaypointsDisplay',
    defaultValue: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids
  }
] as const;

const mapSettingsMfdAliased = [
  {
    name: 'hsiFormat',
    defaultValue: 'PPOS' as HSIFormat
  },
  {
    name: 'mapRange',
    defaultValue: 5 as MapRange
  },
  {
    name: 'tfcEnabled',
    defaultValue: true as boolean
  },
  {
    name: 'terrWxState',
    defaultValue: 'OFF' as TerrWxState
  },
  {
    name: 'nexradEnabled',
    defaultValue: false as boolean
  },
  {
    name: 'mapAltitudeArcShow',
    defaultValue: false as boolean
  },
  {
    name: 'mapWaypointsDisplay',
    defaultValue: MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids
  },
  {
    name: 'mapExtended',
    defaultValue: false as boolean
  }
] as const;

/** Type definitions for all map settings. */
export type MapSettings = {
  readonly [Item in typeof mapSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Type definitions for aliased PFD/MFD map settings. */
export type MapSettingsPfdAliased = {
  readonly [Item in typeof mapSettingsPfdAliased[number]as Item['name']]: Item['defaultValue'];
};

/** Type definitions for aliased PFD/MFD map settings. */
export type MapSettingsMfdAliased = {
  readonly [Item in typeof mapSettingsMfdAliased[number]as Item['name']]: Item['defaultValue'];
};

/** Utility class for retrieving map user setting managers. */
export class MapUserSettings {
  private static INSTANCE_MASTER: DefaultUserSettingManager<MapSettings> | undefined;
  private static INSTANCE_PFD: AliasedUserSettingManager<MapSettingsPfdAliased> | undefined;
  private static INSTANCE_MFD: AliasedUserSettingManager<MapSettingsMfdAliased> | undefined;

  public static readonly hsiFormatsAll = ['ROSE', 'ARC', 'PPOS', 'PLAN', 'GWX', 'TCAS'] as const;
  public static readonly hsiFormatsPFD = ['ROSE', 'ARC', 'PPOS'] as HSIFormat[];
  public static readonly hsiFormatsMFD = ['ROSE', 'ARC', 'PPOS', 'PLAN', 'GWX', 'TCAS'] as HSIFormat[];
  public static readonly terrWxStates = ['OFF', 'TERR', 'WX'] as const;
  public static readonly mapRanges = [5, 10, 25, 50, 100, 200, 300, 600] as const;

  /**
   * Retrieves a setting manager with all map user settings.
   * @param bus The event bus.
   * @returns A setting manager with all map user settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<MapSettings> {
    return MapUserSettings.INSTANCE_MASTER ??= new DefaultUserSettingManager(bus, mapSettings);
  }

  /* eslint-disable jsdoc/require-jsdoc */
  public static getAliasedManager(bus: EventBus, pfdOrMfd: 'PFD'): UserSettingManager<MapSettingsPfdAliased>;
  public static getAliasedManager(bus: EventBus, pfdOrMfd: 'MFD'): UserSettingManager<MapSettingsMfdAliased>;
  public static getAliasedManager(bus: EventBus, pfdOrMfd: PfdOrMfd): UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;
  /* eslint-enable jsdoc/require-jsdoc */

  /**
   * Retrieves a setting manager with aliased map user settings specific to the PFD or MFD.
   * @param bus The event bus.
   * @param pfdOrMfd Whether to get the PFD or MFD setting manager.
   * @returns A setting manager with aliased map user settings specific to the PFD or MFD.
   */
  public static getAliasedManager(bus: EventBus, pfdOrMfd: PfdOrMfd): UserSettingManager<MapSettingsPfdAliased> | UserSettingManager<MapSettingsMfdAliased> {
    return (pfdOrMfd === 'PFD' ? MapUserSettings.getPfdManager(bus) : MapUserSettings.getMfdManager(bus));
  }

  /**
   * Retrieves a setting manager with aliased PFD map user settings.
   * @param bus The event bus.
   * @returns A setting manager with aliased PFD map user settings.
   */
  public static getPfdManager(bus: EventBus): UserSettingManager<MapSettingsPfdAliased> {
    if (MapUserSettings.INSTANCE_PFD === undefined) {
      MapUserSettings.INSTANCE_PFD = new AliasedUserSettingManager<MapSettingsPfdAliased>(bus, mapSettingsPfdAliased);
      MapUserSettings.INSTANCE_PFD.useAliases(MapUserSettings.getMasterManager(bus), {
        hsiFormat: 'hsiFormatPFD',
        tfcEnabled: 'tfcEnabledPFD',
        terrWxState: 'terrWxStatePFD',
        mapWaypointsDisplay: 'mapWaypointsDisplayPFD',
        mapAltitudeArcShow: 'mapAltitudeArcShowPFD',
        mapRange: 'mapRange_1'
      });
    }

    return MapUserSettings.INSTANCE_PFD;
  }

  /**
   * Retrieves a setting manager with aliased MFD map user settings.
   * @param bus The event bus.
   * @returns A setting manager with aliased MFD map user settings.
   */
  public static getMfdManager(bus: EventBus): UserSettingManager<MapSettingsMfdAliased> {
    if (MapUserSettings.INSTANCE_MFD === undefined) {
      MapUserSettings.INSTANCE_MFD = new AliasedUserSettingManager<MapSettingsMfdAliased>(bus, mapSettingsMfdAliased);

      bus.getSubscriber<MfdIndexEvents>().on('mfd_index').handle(index => {
        MapUserSettings.INSTANCE_MFD?.useAliases(MapUserSettings.getMasterManager(bus), {
          hsiFormat: `hsiFormatMFD_${index}`,
          tfcEnabled: `tfcEnabledMFD_${index}`,
          terrWxState: `terrWxStateMFD_${index}`,
          nexradEnabled: `nexradEnabledMFD_${index}`,
          mapWaypointsDisplay: `mapWaypointsDisplayMFD_${index}`,
          mapAltitudeArcShow: `mapAltitudeArcShowMFD_${index}`,
          mapExtended: `mapExtendedMFD_${index}`,
          mapRange: `mapRange_${index}`
        });
      });
    }

    return MapUserSettings.INSTANCE_MFD;
  }
}
