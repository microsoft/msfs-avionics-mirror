import { UserSetting } from '@microsoft/msfs-sdk';

import { NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { MenuDefinition, MenuEntry } from '../Pages/Pages';

export enum FieldTypeMenuPreset {
  ArcNavMap,
  StandardMap,
}

/**
 *
 */
export interface FieldTypeMenuPresetEntry {
  /** Label */
  label: string,

  /** Disabled */
  disabled: boolean,

  /** Field Type */
  type: NavDataFieldType,
}

/**
 * A menu that changes the data field type of a setting.
 */
export class FieldTypeMenu extends MenuDefinition {

  public title = 'SELECT FIELD TYPE';

  public entries: readonly MenuEntry[];

  /**
   * Creates a new FieldTypeMenu.
   * @param menuEntries the field type menu entries to show
   * @param setting The setting to set when a field type is picked.
   * @param onSet A callback called when the setting is set.
   */
  constructor(
    private readonly menuEntries: FieldTypeMenuPresetEntry[],
    private readonly setting: UserSetting<NavDataFieldType>,
    private readonly onSet: () => void,
  ) {
    super();

    this.entries = menuEntries.map((entry) => ({ ...entry, action: () => this.setSetting(entry.type) }));
  }

  /**
   * Sets the supplied setting to the specified field type.
   * @param type The field type to set to.
   */
  private setSetting(type: NavDataFieldType): void {
    this.setting.set(type);
    this.onSet();
  }

  /** @inheritdoc */
  public updateEntries(): void {
    /** no-op */
  }
}