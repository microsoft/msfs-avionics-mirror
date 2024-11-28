import { Epic2AvionicsPlugin, Epic2Fadec, Epic2PluginBinder } from '@microsoft/msfs-epic2-shared';

/** A plugin binder for Epic2 Upper MFD plugins. */
export type Epic2UpperMfdPluginBinder = Epic2PluginBinder;

/**
 * A Epic2 Upper MFD plugin.
 */
export abstract class Epic2UpperMfdAvionicsPlugin extends Epic2AvionicsPlugin<Epic2UpperMfdPluginBinder> {
  /**
   * Allows the plugin to provide a FADEC implementation that will override the default one.
   * @returns An instance of a FADEC.
   */
  getFadec?(): Epic2Fadec;

  /**
   * Gets a predicted climb rate based on pressure altitude and weight
   * @returns The climb rate for the given parameters
   */
  getClimbRate?(pressureAlt: number, weight: number): number
}
