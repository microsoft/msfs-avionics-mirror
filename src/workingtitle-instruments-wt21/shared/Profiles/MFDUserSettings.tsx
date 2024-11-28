import { AliasedUserSettingManager, DefaultUserSettingManager, EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

import { HSIFormat, TerrWxState } from '../Map';
import { WT21MfdTextPage } from '../WT21MfdTextPageEvents';

export enum EngineIndicationDisplayMode {
  Compressed,
  Expanded,
}

/**
 * Display state of the MFD upper data window.
 */
export enum MFDUpperWindowState {
  Off,
  FmsText,
  Checklist,
  PassBrief,
  Systems,
}

/** Represents the state of the Memory Buttons. See WT21 manual, page 6-18 */
export interface MemButtonState {
  /** Engine display mode */
  engineState: EngineIndicationDisplayMode;
  /** MFD upper window state */
  upperFormat: MFDUpperWindowState;
  /** HSI format */
  lowerFormat: HSIFormat;
  /** Terrain/Wx state */
  terrWxState: TerrWxState;
  /** Is traffic enabled */
  tfcEnabled: boolean;
}

export enum MfdDisplayMode {
  Map,
  Text,
}

const mem1defaultValue: MemButtonState = {
  engineState: EngineIndicationDisplayMode.Compressed,
  upperFormat: MFDUpperWindowState.FmsText,
  lowerFormat: 'PPOS',
  terrWxState: 'OFF',
  tfcEnabled: true,
};

const mem2defaultValue: MemButtonState = {
  engineState: EngineIndicationDisplayMode.Compressed,
  upperFormat: MFDUpperWindowState.Systems,
  lowerFormat: 'PLAN',
  terrWxState: 'OFF',
  tfcEnabled: false,
};

const mem3defaultValue: MemButtonState = {
  engineState: EngineIndicationDisplayMode.Compressed,
  upperFormat: MFDUpperWindowState.Systems,
  lowerFormat: 'ROSE',
  terrWxState: 'OFF',
  tfcEnabled: true,
};

const mfdSettings = [
  {
    name: 'mfdUpperWindowState_1',
    defaultValue: MFDUpperWindowState.FmsText as MFDUpperWindowState,
  },
  {
    name: 'mfdUpperWindowState_2',
    defaultValue: MFDUpperWindowState.FmsText as MFDUpperWindowState,
  },
  {
    name: 'mfdEisState_1',
    defaultValue: EngineIndicationDisplayMode.Compressed as EngineIndicationDisplayMode,
  },
  {
    name: 'mfdEisState_2',
    defaultValue: EngineIndicationDisplayMode.Compressed as EngineIndicationDisplayMode,
  },
  {
    name: 'mfdUpperFmsTextVNavShow_1',
    defaultValue: false as boolean,
  },
  {
    name: 'mfdUpperFmsTextVNavShow_2',
    defaultValue: false as boolean,
  },
  {
    name: 'mfdDisplayMode_1',
    defaultValue: MfdDisplayMode.Map as MfdDisplayMode,
  },
  {
    name: 'mfdDisplayMode_2',
    defaultValue: MfdDisplayMode.Map as MfdDisplayMode,
  },
  {
    name: 'mfdSelectedTextPage_1',
    defaultValue: WT21MfdTextPage.TakeoffRef as WT21MfdTextPage,
  },
  {
    name: 'mfdSelectedTextPage_2',
    defaultValue: WT21MfdTextPage.TakeoffRef as WT21MfdTextPage,
  },
  {
    name: 'memButton1_1',
    defaultValue: JSON.stringify(mem1defaultValue),
  },
  {
    name: 'memButton2_1',
    defaultValue: JSON.stringify(mem2defaultValue),
  },
  {
    name: 'memButton3_1',
    defaultValue: JSON.stringify(mem3defaultValue),
  },
  {
    name: 'memButton1_2',
    defaultValue: JSON.stringify(mem1defaultValue),
  },
  {
    name: 'memButton2_2',
    defaultValue: JSON.stringify(mem2defaultValue),
  },
  {
    name: 'memButton3_2',
    defaultValue: JSON.stringify(mem3defaultValue),
  },
] as const;

const mfdSettingsAliased = [
  {
    name: 'mfdUpperWindowState',
    defaultValue: MFDUpperWindowState.FmsText as MFDUpperWindowState,
  },
  {
    name: 'mfdEisState',
    defaultValue: EngineIndicationDisplayMode.Compressed as EngineIndicationDisplayMode,
  },
  {
    name: 'mfdUpperFmsTextVNavShow',
    defaultValue: false as boolean,
  },
  {
    name: 'mfdDisplayMode',
    defaultValue: MfdDisplayMode.Map as MfdDisplayMode,
  },
  {
    name: 'mfdSelectedTextPage',
    defaultValue: WT21MfdTextPage.TakeoffRef as WT21MfdTextPage,
  },
  {
    name: 'memButton1',
    defaultValue: JSON.stringify(mem1defaultValue),
  },
  {
    name: 'memButton2',
    defaultValue: JSON.stringify(mem2defaultValue),
  },
  {
    name: 'memButton3',
    defaultValue: JSON.stringify(mem3defaultValue),
  },
] as const;

/** Generates the UserSettingDefinition type based on the settings object */
export type MFDSettings = {
  readonly [Item in typeof mfdSettings[number]as Item['name']]: Item['defaultValue'];
};

/** Generates the UserSettingDefinition type based on the settings object */
export type MFDSettingsAliased = {
  readonly [Item in typeof mfdSettingsAliased[number]as Item['name']]: Item['defaultValue'];
};

/**
 * Utility class for retrieving MFD setting managers.
 */
export class MFDUserSettings {
  private static INSTANCE_MASTER: DefaultUserSettingManager<MFDSettings> | undefined;
  private static INSTANCE_ALIASED = [] as AliasedUserSettingManager<MFDSettingsAliased>[];

  /**
   * Retrieves a setting manager with all MFD user settings.
   * @param bus The event bus.
   * @returns A setting manager with all MFD user settings.
   */
  public static getMasterManager(bus: EventBus): UserSettingManager<MFDSettings> {
    return MFDUserSettings.INSTANCE_MASTER ??= new DefaultUserSettingManager(bus, mfdSettings);
  }

  /**
   * Retrieves a setting manager with aliased MFD user settings.
   * @param bus The event bus.
   * @param index The instrument index
   * @returns A setting manager with aliased MFD user settings.
   */
  public static getAliasedManager(bus: EventBus, index: 1 | 2): UserSettingManager<MFDSettingsAliased> {
    if (MFDUserSettings.INSTANCE_ALIASED[index] === undefined) {
      MFDUserSettings.INSTANCE_ALIASED[index] = new AliasedUserSettingManager<MFDSettingsAliased>(bus, mfdSettingsAliased);

      MFDUserSettings.INSTANCE_ALIASED[index].useAliases(MFDUserSettings.getMasterManager(bus), {
        mfdUpperWindowState: `mfdUpperWindowState_${index}`,
        mfdEisState: `mfdEisState_${index}`,
        mfdUpperFmsTextVNavShow: `mfdUpperFmsTextVNavShow_${index}`,
        mfdDisplayMode: `mfdDisplayMode_${index}`,
        mfdSelectedTextPage: `mfdSelectedTextPage_${index}`,
        memButton1: `memButton1_${index}`,
        memButton2: `memButton2_${index}`,
        memButton3: `memButton3_${index}`,
      });
    }

    return MFDUserSettings.INSTANCE_ALIASED[index];
  }
}
