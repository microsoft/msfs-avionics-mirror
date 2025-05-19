import { Accessible, LatLonInterface, Subscribable } from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '@microsoft/msfs-garminsdk';

import { G3XChartsSource } from '../../../Shared/Charts/G3XChartsSource';
import { G3XChartsDisplayColorMode, G3XChartsPageSelectionData } from '../../../Shared/Charts/G3XChartsTypes';

/**
 * A provider of data for a waypoint information chart display.
 */
export interface WaypointInfoChartDisplayDataProvider {
  /** A map to all available electronic charts sources from their unique IDs. */
  readonly chartsSources: ReadonlyMap<string, G3XChartsSource>;

  /**
   * A description of the chart page that is selected to be displayed, or `null` if no page has been selected to be
   * displayed.
   */
  readonly chartPageSelection: Subscribable<G3XChartsPageSelectionData | null>;

  /** Whether airport chart data is currently being loaded. */
  readonly isLoadingAirportData: Subscribable<boolean>;

  /** The active color mode with which to display charts. */
  readonly colorMode: Subscribable<G3XChartsDisplayColorMode>;

  /**
   * The airplane's current position. If the position is not available, then both latitude and longitude are equal to
   * `NaN`.
   */
  readonly planePosition: Accessible<Readonly<LatLonInterface>>;

  /** The airplane's current true heading, in degrees, or `NaN` if the heading is not available. */
  readonly planeHeading: Accessible<number>;

  /** The current distance units mode. */
  readonly unitsDistanceMode: Subscribable<UnitsDistanceSettingMode>;

  /**
   * Resumes this data provider. Once resumed, the provider will automatically update its data.
   */
  resume(): void;

  /**
   * Pauses this data provider. When paused, the provider stops updating its data until it is resumed.
   */
  pause(): void;

  /**
   * Destroys this data provider.
   */
  destroy(): void;
}
