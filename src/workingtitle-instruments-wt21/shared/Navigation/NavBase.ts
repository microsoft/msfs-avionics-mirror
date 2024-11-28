import { ExtractSubjectType, Subject, Subscription, VorToFrom } from '@microsoft/msfs-sdk';

// TODO Add FMS LVars to field jsdocs
/** These are the fields that should be exposed by NavSources and NavIndicators.
 * Not all fields will be used by all the different Nav Sources.
 * To add a new field, just add it to NavBaseFields,
 * then add some code to each of the different NavSources to keep that field updated.
 * Don't use this class directly.
 * Every Subject should be able to be set to null, so that when the source is set to null, all the fields cna be nulled.
 * This isn't abstract so that we can instantiate it in one place to help generate setters. */
export class NavBaseFields {
  /** Always points to the curently tuned station or next waypoint/fix.
   * NAV RADIAL, ADF RADIAL */
  public readonly bearing = Subject.create<number | null>(null);

  /** Either points towards the next waypoint (GPS/FMS),
   * displays the course selected by the course knob (VOR),
   * or displays the fixed course of a localizer (ILS).
   * NAV OBS, L:WTAP_LNav_DTK_Mag */
  public readonly course = Subject.create<number | null>(null);

  /** The fixed course of a localizer when available (ILS).
   * Is null when `hasLocalizer` is false.
   * Only for NAV source types.
   * NAV LOCALIZER */
  public readonly localizerCourse = Subject.create<number | null>(null);

  /** Whether the tuned station is a localizer or not.
   * This can be true even if `hasLocalizer` is false,
   * because this can be based on the frequency alone.
   * Only for NAV source types.
   * NAV LOCALIZER. */
  public readonly isLocalizer = Subject.create<boolean | null>(null);

  /** Whether the nav source is receiving a valid localizer signal.
   * Only for NAV source types.
   * NAV HAS LOCALIZER */
  public readonly hasLocalizer = Subject.create<boolean | null>(null);

  /** DME, distance to the station or next waypoint.
   * Is null when source is NAV and `hasDme` is false.
   * NAV DME, ADF DISTANCE, L:WTAP_LNav_DIS */
  public readonly distance = Subject.create<number | null>(null);

  /** Whether the source is receiving a valid DME signal.
   * Only for NAV source types.
   * NAV HAS DME */
  public readonly hasDme = Subject.create<boolean | null>(null);

  /** The ICAO ident of the station or waypoint.
   * NAV IDENT, or flight plan */
  public readonly ident = Subject.create<string | null>(null);

  /** Whether the source is receiving a nav signal.
   * Only for NAV source types.
   * NAV HAS NAV. */
  public readonly hasNav = Subject.create<boolean | null>(null);

  /** The active frequency that the nav source is tuned to.
   * Only for NAV and ADF source types.
   * NAV ACTIVE FREQUENCY, ADF ACTIVE FREQUENCY. */
  public readonly activeFrequency = Subject.create<number | null>(null);

  /** Normalized and scaled lateral deviation (-1, 1).
   * NAV CDI, L:WTAP_LNav_XTK */
  public readonly lateralDeviation = Subject.create<number | null>(null);

  /** Normalized and scaled vertical deviation (-1, 1).
   * NAV GLIDE SLOPE ERROR, L:WTAP_VNav_Vertical_Deviation, L:WTAP_LPV_Vertical_Deviation */
  public readonly verticalDeviation = Subject.create<number | null>(null);

  /** Whether the source is receiving glideslope information.
   * Only for NAV source types.
   * NAV HAS GLIDE SLOPE. */
  public readonly hasGlideSlope = Subject.create<boolean | null>(null);

  /** TTG, estimated time remaining until aircraft reaches next fix. // TODO Implement this */
  public readonly timeToGo = Subject.create<number | null>(null);

  /** Whether course is pointing TO or FROM the station (VOR),
   * or if the aircraft heading is within 90 degress of the desired track (GPS).
   * NAV TOFROM, // TODO FMS VAR? */
  public readonly toFrom = Subject.create<VorToFrom | null>(null);

  /** The current CDI scale, in nautical miles.
   * Only for GPS source types.
   * L:WTAP_LNav_CDI_Scale */
  public readonly lateralDeviationScaling = Subject.create<number | null>(null);

  /** A readable string/enum that shows the name of current scaling being applied to lateral deviation.
   * Only for GPS source types.
   * L:WTAP_LNav_CDI_Scale_Label */
  public readonly lateralDeviationScalingLabel = Subject.create<string | null>(null);
}

/** Generates event types for each field. */
export type NavBaseEvents<Prefix extends string, T extends NavBaseFields> = {
  readonly [Item in Extract<keyof T, string> as `${Prefix}_${Item}`]: ExtractSubjectType<T[Item]>;
}

/** Generates control event types for each field. */
export type NavBaseControlEvents<Prefix extends string, T extends { [key: string]: any }> = {
  readonly [Item in Extract<keyof T, string> as `${Prefix}_set_${Item}`]: T[Item];
}

/** Base class for NavSourceBase and NavIndicator. */
export abstract class NavBase extends NavBaseFields {
  /** An automatically generated map of setters to make it easy to set, sub, and unsub,
   * getting around having to call .bind(). */
  protected readonly setters = new Map<(keyof NavBaseFields), {
    /** The setter function. */
    setter: (value: any) => void;

    /** The subscription for which the setter is a handler. */
    sub?: Subscription;
  }>();

  /** Creates a Map of setters to make unsubbing and subbing easy. */
  public constructor() {
    super();
    (Object.keys(new NavBaseFields()) as Array<keyof NavBaseFields>).forEach((key) => {
      this.setters.set(key, { setter: this[key].set.bind(this[key]) });
    });
  }
}