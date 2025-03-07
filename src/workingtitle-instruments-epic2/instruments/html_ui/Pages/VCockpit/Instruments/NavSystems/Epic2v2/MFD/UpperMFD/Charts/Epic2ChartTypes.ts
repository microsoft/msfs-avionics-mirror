import { AirportFacility, ChartMetadata } from '@microsoft/msfs-sdk';

import { DynamicListData } from '@microsoft/msfs-epic2-shared';

/** A type that describes a chart to be listed */
export interface Epic2ChartListType extends DynamicListData {
  /** Chart */
  chart: ChartMetadata
}

/** A type that describes an airport to be listed in an airport chart search */
export interface Epic2ChartAirportListType extends DynamicListData {
  /** Chart */
  airport: AirportFacility
}

export enum Epic2ChartDisplayCategories {
  Airport = 'Arpt',
  SID = 'SID',
  STAR = 'STAR',
  Approach = 'Appr',
  Noise = 'Noise',
  NOTAM = 'NOTAM',
  Airspace = 'Airsp'
}

export enum ChartAreaViewPages {
  ChartSelection,
  ChartViewer,
}
