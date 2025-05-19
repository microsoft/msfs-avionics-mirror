import { Accessible, LatLonInterface, Subscribable } from '@microsoft/msfs-sdk';

import { UnitsDistanceSettingMode } from '@microsoft/msfs-garminsdk';

import { G3000ChartsSource } from '../../Charts/G3000ChartsSource';
import { G3000ChartsDisplayLightMode, G3000ChartsPageSelectionData } from '../../Charts/G3000ChartsTypes';

/**
 * A provider of data for an electronic charts display pane view.
 */
export interface ChartsPaneViewDataProvider {
  /** All available charts sources. */
  readonly chartsSources: Iterable<G3000ChartsSource>;

  /**
   * A description of the chart page that is selected to be displayed, or `null` if no page has been selected to be
   * displayed.
   */
  readonly chartPageSelection: Subscribable<G3000ChartsPageSelectionData | null>;

  /** The ID of the active chart page section. */
  readonly chartPageSection: Subscribable<string>;

  /** The active light mode with which to display charts. */
  readonly lightMode: Subscribable<G3000ChartsDisplayLightMode>;

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
