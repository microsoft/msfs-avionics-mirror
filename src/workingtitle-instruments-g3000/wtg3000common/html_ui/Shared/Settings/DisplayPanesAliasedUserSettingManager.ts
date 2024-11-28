import { AliasedUserSettingManager, Consumer, EventBus, UserSetting, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue } from '@microsoft/msfs-sdk';
import { DisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { DisplayPaneUtils } from '../Components/DisplayPanes/DisplayPaneUtils';
import { DisplayPaneViewKeys } from '../Components/DisplayPanes/DisplayPaneViewKeys';
import { DisplayPaneSettings, DisplayPanesUserSettings } from './DisplayPanesUserSettings';

/**
 * An aliased map user setting manager which can switch the true settings from which its aliased settings are sourced.
 * The supported sources are:
 * * Each set of display pane settings.
 */
export class DisplayPanesAliasedUserSettingManager implements UserSettingManager<DisplayPaneSettings> {
  private static readonly EMPTY_MAP = {};

  private readonly displayPaneManagers: UserSettingManager<DisplayPaneSettings>[];

  private readonly aliasedManager: AliasedUserSettingManager<DisplayPaneSettings>;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.displayPaneManagers = DisplayPaneUtils.ALL_INDEXES.map(index => DisplayPanesUserSettings.getDisplayPaneManager(bus, index));

    this.aliasedManager = new AliasedUserSettingManager(bus, [
      {
        name: 'displayPaneVisible',
        defaultValue: true
      },
      {
        name: 'displayPaneView',
        defaultValue: DisplayPaneViewKeys.NavigationMap
      },
      {
        name: 'displayPaneDesignatedView',
        defaultValue: DisplayPaneViewKeys.NavigationMap
      },
      {
        name: 'displayPaneDesignatedWeatherView',
        defaultValue: DisplayPaneViewKeys.WeatherMap
      },
      {
        name: 'displayPaneController',
        defaultValue: -1
      },
      {
        name: 'displayPaneHalfSizeOnly',
        defaultValue: false
      },
      {
        name: 'displayPaneMapPointerActive',
        defaultValue: false
      }
    ]);
  }

  /**
   * Switches the source of this manager's settings to a set of display pane settings.
   * @param index The index of the display pane.
   * @returns Itself.
   */
  public useDisplayPaneSettings(index: DisplayPaneIndex): DisplayPanesAliasedUserSettingManager {
    this.aliasedManager.useAliases(this.displayPaneManagers[index], DisplayPanesAliasedUserSettingManager.EMPTY_MAP);
    return this;
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof DisplayPaneSettings ? UserSetting<DisplayPaneSettings[K]> : undefined {
    return this.aliasedManager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof DisplayPaneSettings & string>(name: K): UserSetting<NonNullable<DisplayPaneSettings[K]>> {
    return this.aliasedManager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof DisplayPaneSettings & string>(name: K): Consumer<NonNullable<DisplayPaneSettings[K]>> {
    return this.aliasedManager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.aliasedManager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, DisplayPaneSettings>): UserSettingManager<M & DisplayPaneSettings> {
    return this.aliasedManager.mapTo(map);
  }
}