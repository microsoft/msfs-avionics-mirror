import { DefaultUserSettingManager, EventBus, UserSettingDefinition, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

import { NavDataBarSettingTypes, NavDataFieldType } from '@microsoft/msfs-garminsdk';

/**
 * CNS data bar full/split mode button screen side setting modes.
 */
export enum CnsDataBarModeButtonSideSettingMode {
  Auto = 'Auto',
  Left = 'Left',
  Right = 'Right'
}

/**
 * CNS data bar screen side setting modes.
 */
export enum CnsDataBarScreenSideSettingMode {
  Left = 'Left',
  Right = 'Right'
}

/**
 * CNS data bar button show setting modes.
 */
export enum CnsDataBarShowSettingMode {
  Hide = 'Hide',
  Left = 'Left',
  Right = 'Right'
}

/**
 * CNS data bar button size setting modes.
 */
export enum CnsDataBarButtonSizeSettingMode {
  Normal = 'Normal',
  Minimized = 'Minimized'
}

/**
 * Aliased CNS data bar user settings.
 */
export type CnsDataBarUserSettingTypes = NavDataBarSettingTypes & {
  /** The screen side on which to position the Full/Split button on the CNS data bar. */
  cnsDataBarSplitButtonSide: CnsDataBarModeButtonSideSettingMode;

  /** The screen side on which to position the COM radio buttons on the CNS data bar. */
  cnsDataBarComRadioScreenSide: CnsDataBarScreenSideSettingMode;

  /** The size mode with which to render the COM radio buttons on the CNS data bar. */
  cnsDataBarComRadioButtonSize: CnsDataBarButtonSizeSettingMode;

  /** The screen side on which to position the NAV radio buttons on the CNS data bar. */
  cnsDataBarNavRadioScreenSide: CnsDataBarScreenSideSettingMode;

  /** The size mode with which to render the NAV radio buttons on the CNS data bar. */
  cnsDataBarNavRadioButtonSize: CnsDataBarButtonSizeSettingMode;

  /** The screen side on which to position the audio panel button on the CNS data bar. */
  cnsDataBarAudioButtonScreenSide: CnsDataBarScreenSideSettingMode;

  /** The size mode with which to render the audio panel button on the CNS data bar. */
  cnsDataBarAudioButtonSize: CnsDataBarButtonSizeSettingMode;

  /** The screen side on which to position the transponder button on the CNS data bar. */
  cnsDataBarTransponderScreenSide: CnsDataBarScreenSideSettingMode;

  /** The screen side on which to show the user timer button. */
  cnsDataBarUserTimerShow: CnsDataBarShowSettingMode;

  /** The maximum number of visible CNS data bar fields. */
  cnsDataBarMaxFieldCount: number;

  /** Volume indicator mode for radio CNS data bar buttons. */
  cnsDataBarRadioVolumeShow: boolean;

  /** Volume Shortcut View mode. */
  cnsDataBarRadioVolumeShortcutShow: boolean;
};

/**
 * True CNS data bar user settings.
 */
export type CnsDataBarTrueUserSettingTypes = {
  [P in keyof CnsDataBarUserSettingTypes as `${P}_g3x`]: CnsDataBarUserSettingTypes[P];
};

/**
 * A utility class for retrieving CNS data bar user setting managers.
 */
export class CnsDataBarUserSettings {
  private static INSTANCE: UserSettingManager<CnsDataBarUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for CNS data bar user settings.
   * @param bus The event bus.
   * @returns a manager for CNS data bar user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<CnsDataBarUserSettingTypes> {
    return CnsDataBarUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      CnsDataBarUserSettings.getSettingDefs(),
      true
    ).mapTo(CnsDataBarUserSettings.getAliasMap());
  }

  /**
   * Gets the default values for a full set of aliased CNS data bar settings.
   * @returns The default values for a full set of aliased CNS data bar settings.
   */
  private static getDefaultValues(): CnsDataBarUserSettingTypes {
    return {
      ['cnsDataBarSplitButtonSide']: CnsDataBarModeButtonSideSettingMode.Auto,
      ['cnsDataBarComRadioScreenSide']: CnsDataBarScreenSideSettingMode.Left,
      ['cnsDataBarComRadioButtonSize']: CnsDataBarButtonSizeSettingMode.Normal,
      ['cnsDataBarNavRadioScreenSide']: CnsDataBarScreenSideSettingMode.Left,
      ['cnsDataBarNavRadioButtonSize']: CnsDataBarButtonSizeSettingMode.Normal,
      ['cnsDataBarAudioButtonScreenSide']: CnsDataBarScreenSideSettingMode.Left,
      ['cnsDataBarAudioButtonSize']: CnsDataBarButtonSizeSettingMode.Normal,
      ['cnsDataBarTransponderScreenSide']: CnsDataBarScreenSideSettingMode.Left,
      ['cnsDataBarUserTimerShow']: CnsDataBarShowSettingMode.Hide,
      ['cnsDataBarMaxFieldCount']: 8,
      ['cnsDataBarRadioVolumeShow']: true,
      ['cnsDataBarRadioVolumeShortcutShow']: true,
      ['navDataBarField0']: NavDataFieldType.Waypoint,
      ['navDataBarField1']: NavDataFieldType.BearingToWaypoint,
      ['navDataBarField2']: NavDataFieldType.DistanceToWaypoint,
      ['navDataBarField3']: NavDataFieldType.TimeToWaypoint,
      ['navDataBarField4']: NavDataFieldType.GroundSpeed,
      ['navDataBarField5']: NavDataFieldType.GroundTrack,
      ['navDataBarField6']: NavDataFieldType.TimeToDestination,
      ['navDataBarField7']: NavDataFieldType.TimeOfDestinationArrival,
    };
  }

  /**
   * Gets an array of definitions for true CNS data bar settings.
   * @returns An array of definitions for true CNS data bar settings.
   */
  private static getSettingDefs(): readonly UserSettingDefinition<CnsDataBarUserSettingTypes[keyof CnsDataBarUserSettingTypes]>[] {
    const values = CnsDataBarUserSettings.getDefaultValues();
    return Object.keys(values).map(name => {
      return {
        name: `${name}_g3x`,
        defaultValue: values[name as keyof typeof values]
      };
    });
  }

  /**
   * Gets a setting name alias mapping from aliased to true CNS data bar settings.
   * @returns A setting name alias mapping from aliased to true CNS data bar settings.
   */
  private static getAliasMap(): UserSettingMap<CnsDataBarUserSettingTypes, CnsDataBarTrueUserSettingTypes> {
    const map: UserSettingMap<CnsDataBarUserSettingTypes, CnsDataBarTrueUserSettingTypes> = {};

    for (const name of Object.keys(CnsDataBarUserSettings.getDefaultValues()) as (keyof CnsDataBarUserSettingTypes)[]) {
      map[name] = `${name}_g3x`;
    }

    return map;
  }
}