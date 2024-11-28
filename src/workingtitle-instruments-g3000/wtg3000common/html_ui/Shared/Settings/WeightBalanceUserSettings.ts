import {
  Consumer, DefaultUserSettingManager, EventBus, Subscribable, UserSetting, UserSettingDefinition, UserSettingManager,
  UserSettingMap, UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';

import { WeightBalanceConfig } from '../Performance/WeightBalance/WeightBalanceConfig';
import { WeightBalanceEnvelopeDef, WeightBalanceLoadStationDef } from '../Performance/WeightBalance/WeightBalanceTypes';

/**
 * Weight and balance user settings.
 */
export type WeightBalanceUserSettingTypes = {
  /** The index of the active weight and balance envelope. */
  weightBalanceActiveEnvelopeIndex: number;

  /** The empty weight of a load station, in pounds. */
  [loadStationEmptyWeight: `weightBalanceLoadStationEmptyWeight_${string}`]: number;

  /** The moment-arm of the empty weight of a load station, in inches. */
  [loadStationEmptyArm: `weightBalanceLoadStationEmptyArm_${string}`]: number;

  /** The moment-arm of the load weight of a load station, in inches. */
  [loadStationLoadArm: `weightBalanceLoadStationLoadArm_${string}`]: number;

  /** Whether a load station is enabled. */
  [loadStationEnabled: `weightBalanceLoadStationEnabled_${string}`]: boolean;

  /** The load weight of a load station, in pounds. */
  [loadStationLoadWeight: `weightBalanceLoadStationLoadWeight_${string}`]: number;
};

/**
 * A manager for weight and balance user settings.
 */
export class WeightBalanceUserSettingManager implements UserSettingManager<WeightBalanceUserSettingTypes> {
  /** An array of definitions for the load stations supported by this manager. */
  public readonly loadStationDefs: readonly Readonly<WeightBalanceLoadStationDef>[];

  /** An array of definitions for the envelopes supported by this manager. */
  public readonly envelopeDefs: readonly Readonly<WeightBalanceEnvelopeDef>[];

  /** The definition for the active envelope. */
  public readonly activeEnvelopeDef: Subscribable<Readonly<WeightBalanceEnvelopeDef>>;

  private readonly manager: DefaultUserSettingManager<WeightBalanceUserSettingTypes>;

  /**
   * Creates a new instance of WeightBalanceSettingManager.
   * @param bus The event bus.
   * @param config A weight and balance configuration object.
   */
  public constructor(bus: EventBus, config: WeightBalanceConfig) {
    const settingDefs: UserSettingDefinition<any>[] = [];

    this.loadStationDefs = config.loadStationDefs.slice();
    this.envelopeDefs = config.envelopeOptions.defs.slice();

    for (const def of config.loadStationDefs) {
      settingDefs.push(
        {
          name: `weightBalanceLoadStationEmptyWeight_${def.id}`,
          defaultValue: def.defaultEmptyWeight
        },
        {
          name: `weightBalanceLoadStationEmptyArm_${def.id}`,
          defaultValue: def.defaultArm
        },
        {
          name: `weightBalanceLoadStationLoadArm_${def.id}`,
          defaultValue: def.defaultArm
        },
        {
          name: `weightBalanceLoadStationEnabled_${def.id}`,
          defaultValue: def.defaultEnabled
        },
        {
          name: `weightBalanceLoadStationLoadWeight_${def.id}`,
          defaultValue: 0
        }
      );
    }

    settingDefs.push(
      {
        name: 'weightBalanceActiveEnvelopeIndex',
        defaultValue: config.envelopeOptions.defaultIndex
      },
    );

    this.manager = new DefaultUserSettingManager(bus, settingDefs);

    this.activeEnvelopeDef = this.manager.getSetting('weightBalanceActiveEnvelopeIndex').map(index => {
      return this.envelopeDefs[index] ?? this.envelopeDefs[0];
    });
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof WeightBalanceUserSettingTypes ? UserSetting<WeightBalanceUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof WeightBalanceUserSettingTypes & string>(name: K): UserSetting<NonNullable<WeightBalanceUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof WeightBalanceUserSettingTypes & string>(name: K): Consumer<NonNullable<WeightBalanceUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, WeightBalanceUserSettingTypes>): UserSettingManager<M & WeightBalanceUserSettingTypes> {
    return this.manager.mapTo(map);
  }
}
