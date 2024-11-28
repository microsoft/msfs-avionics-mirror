import { Subject } from '@microsoft/msfs-sdk';

/**
 * Map label text size modes.
 */
export enum MapLabelTextSizeMode {
  None = 'None',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large'
}

/**
 * A module describing the map's label text.
 */
export class MapLabelTextModule {
  public readonly airportLargeTextSize = Subject.create(MapLabelTextSizeMode.None);

  public readonly airportMediumTextSize = Subject.create(MapLabelTextSizeMode.None);

  public readonly airportSmallTextSize = Subject.create(MapLabelTextSizeMode.None);

  public readonly vorTextSize = Subject.create(MapLabelTextSizeMode.None);

  public readonly ndbTextSize = Subject.create(MapLabelTextSizeMode.None);

  public readonly intTextSize = Subject.create(MapLabelTextSizeMode.None);

  public readonly userTextSize = Subject.create(MapLabelTextSizeMode.None);
}