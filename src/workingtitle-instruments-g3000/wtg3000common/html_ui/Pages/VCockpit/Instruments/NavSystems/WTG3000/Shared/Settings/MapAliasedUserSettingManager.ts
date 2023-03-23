import { AliasedUserSettingManager, Consumer, EventBus, UserSetting, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue } from '@microsoft/msfs-sdk';

import { PfdIndex } from '../CommonTypes';
import { ControllableDisplayPaneIndex, DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { G3000MapUserSettingTypes, MapUserSettings } from './MapUserSettings';

/**
 * An aliased map user setting manager which can switch the true settings from which its aliased settings are sourced.
 * The supported sources are:
 * * Each set of display pane map settings.
 * * Each set of PFD map settings.
 */
export class MapAliasedUserSettingManager implements UserSettingManager<G3000MapUserSettingTypes> {
  private static readonly EMPTY_MAP = {};

  private readonly displayPaneManagers: Record<ControllableDisplayPaneIndex, UserSettingManager<G3000MapUserSettingTypes>>;
  private readonly pfdManagers: Record<PfdIndex, UserSettingManager<G3000MapUserSettingTypes>>;

  private readonly aliasedManager: AliasedUserSettingManager<G3000MapUserSettingTypes>;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.displayPaneManagers = {
      [DisplayPaneIndex.LeftPfd]: MapUserSettings.getDisplayPaneManager(bus, DisplayPaneIndex.LeftPfd),
      [DisplayPaneIndex.LeftMfd]: MapUserSettings.getDisplayPaneManager(bus, DisplayPaneIndex.LeftMfd),
      [DisplayPaneIndex.RightMfd]: MapUserSettings.getDisplayPaneManager(bus, DisplayPaneIndex.RightMfd),
      [DisplayPaneIndex.RightPfd]: MapUserSettings.getDisplayPaneManager(bus, DisplayPaneIndex.RightPfd),
    };

    this.pfdManagers = {
      [1]: MapUserSettings.getPfdManager(bus, 1),
      [2]: MapUserSettings.getPfdManager(bus, 2)
    };

    this.aliasedManager = new AliasedUserSettingManager(bus, MapUserSettings.getAliasedSettingDefs());
  }

  /**
   * Switches the source of this manager's settings to a set of display pane map settings.
   * @param index The index of the display pane.
   */
  public useDisplayPaneSettings(index: ControllableDisplayPaneIndex): void {
    this.aliasedManager.useAliases(this.displayPaneManagers[index], MapAliasedUserSettingManager.EMPTY_MAP);
  }

  /**
   * Switches the source of this manager's settings to a set of PFD map settings.
   * @param index The index of the PFD.
   */
  public usePfdSettings(index: PfdIndex): void {
    this.aliasedManager.useAliases(this.pfdManagers[index], MapAliasedUserSettingManager.EMPTY_MAP);
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof G3000MapUserSettingTypes ? UserSetting<G3000MapUserSettingTypes[K]> : undefined {
    return this.aliasedManager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof G3000MapUserSettingTypes & string>(name: K): UserSetting<NonNullable<G3000MapUserSettingTypes[K]>> {
    return this.aliasedManager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof G3000MapUserSettingTypes & string>(name: K): Consumer<NonNullable<G3000MapUserSettingTypes[K]>> {
    return this.aliasedManager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.aliasedManager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, G3000MapUserSettingTypes>): UserSettingManager<M & G3000MapUserSettingTypes> {
    return this.aliasedManager.mapTo(map);
  }
}