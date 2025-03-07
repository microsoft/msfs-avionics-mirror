import { AutothrottleOptions, ChartMetadata, EventBus, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { Epic2AvionicsPlugin, Epic2Fadec, Epic2PluginBinder, MfdAliasedUserSettingTypes, ModalService } from '@microsoft/msfs-epic2-shared';

import { Epic2ChartsProvider } from './Charts/Providers/Epic2ChartsProvider';

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

  /**
   * Allows the plugin to overwrite the autothrottle options for an aircraft.
   * @returns an instance of the autothrottle options.
   */
  getAutothrottleOptions?(): AutothrottleOptions;

  /**
   * Gets any available additional chart providers
   */
  getChartProviders?(): Record<string, Epic2ChartsProvider>;

  /**
   * Calls a chart viewer to be rendered
   * Note: When implementing, this will need to be hidden by the plugin based on the selected provider key
   */
  getChartViewers?(
    bus: EventBus,
    chart: Subscribable<ChartMetadata | null>,
    selectedProvider: Subscribable<string>,
    modalService: ModalService,
    settings: UserSettingManager<MfdAliasedUserSettingTypes>
  ): VNode[]
}
