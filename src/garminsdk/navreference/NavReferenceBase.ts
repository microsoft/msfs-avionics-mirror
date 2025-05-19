import { ComputedSubject, GeoPoint, GeoPointInterface, LatLonInterface, MutableSubscribable, Subject, Subscribable, VorToFrom } from '@microsoft/msfs-sdk';

/**
 * Information pertaining to a navigation reference. A navigation reference consists of a geographic position and
 * optionally a lateral course defining a great-circle path passing through the reference position, and a vertical
 * path profile.
 */
export interface NavReferenceBase {
  /** The ident of the reference. */
  readonly ident: Subscribable<string | null>;

  /** Signal strength received from the reference. A value of zero indicates no signal. */
  readonly signalStrength: Subscribable<number | null>;

  /** The magnetic bearing, in degrees, from the airplane to the reference position. */
  readonly bearing: Subscribable<number | null>;

  /** The distance, in nautical miles, from the airplane to the reference position. */
  readonly distance: Subscribable<number | null>;

  /** The magnetic bearing, in degrees, of the reference course at the reference position. */
  readonly course: Subscribable<number | null>;

  /** Whether the reference course is a heading instead of a track. */
  readonly isCourseHeading: Subscribable<boolean | null>;

  /** The fixed magnetic course, in degrees, of the reference localizer. Only available if the reference is a localizer. */
  readonly localizerCourse: Subscribable<number | null>;

  /** The location of the reference position. */
  readonly location: Subscribable<GeoPointInterface | null>;

  /** Whether the reference is a localizer. */
  readonly isLocalizer: Subscribable<boolean | null>;

  /** Whether the reference has a VOR component. */
  readonly hasNav: Subscribable<boolean | null>;

  /** Whether the reference has a DME component. */
  readonly hasDme: Subscribable<boolean | null>;

  /** Whether the reference has a localizer component. */
  readonly hasLocalizer: Subscribable<boolean | null>;

  /** Whether the reference has a glideslope component. */
  readonly hasGlideSlope: Subscribable<boolean | null>;

  /** The radio frequency of the reference. Only available if the reference is a navaid. */
  readonly activeFrequency: Subscribable<number | null>;

  /** Whether the airplane is heading TO or FROM the reference position as judged from the reference course. */
  readonly toFrom: Subscribable<VorToFrom | null>;

  /**
   * Lateral deviation from the reference course scaled such that a value of +/-1 is equal to full-scale CDI deflection
   * (i.e. the `lateralDeviationScaling` value). Positive values indicate deflection of the CDI to the right (i.e. the
   * airplane is situated to the left of the reference).
   */
  readonly lateralDeviation: Subscribable<number | null>;

  /** The magnitude of full-scale CDI deflection, in nautical miles. */
  readonly lateralDeviationScale: Subscribable<number | null>;

  /** The lateral deviation scaling mode. */
  readonly lateralDeviationScalingMode: Subscribable<number | null>;

  /**
   * Vertical deviation from the reference vertical path profile scaled such that a value of +/-1 is equal to full-
   * scale VDI deflection (i.e. the `verticalDeviationScaling` value). Positive values indicate upward deflection of
   * the VDI (i.e. the airplane is situated below the reference).
   */
  readonly verticalDeviation: Subscribable<number | null>;

  /** The magnitude of full-scale VDI deflection, in feet. */
  readonly verticalDeviationScale: Subscribable<number | null>;
}

/**
 * An abstract implementation of {@link NavReferenceBase}.
 */
export abstract class AbstractNavReferenceBase implements NavReferenceBase {
  /** @inheritdoc */
  public readonly ident = Subject.create<string | null>(null);

  /** @inheritdoc */
  public readonly signalStrength = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly bearing = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly distance = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly course = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly isCourseHeading = Subject.create<boolean | null>(null);

  /** @inheritdoc */
  public readonly localizerCourse = Subject.create<number | null>(null);

  // This is a hacky way to get a mutable subscribable to support both input and output type GeoPointInterface | null
  // without requiring a new GeoPoint object be created with every call to .set(). We maintain two instances of
  // GeoPoint, and when we detect that a new non-null input is different from the current value, we swap the two
  // GeoPoint instances, making sure that the incoming instance is set equal to the input. If an input is equal to the
  // value, we leave the GeoPoint instances in place. Because ComputedSubject uses strict equality checks, this ensures
  // that subscribers will be notified if and only if the input is different from the current value.
  private readonly _locationRefs = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private _locationRefPointer = 0;
  /** @inheritdoc */
  public readonly location = ComputedSubject.create<LatLonInterface | null, GeoPointInterface | null>(
    null,
    input => {
      if (input === null) {
        return null;
      } else {
        if (this._locationRefs[this._locationRefPointer].equals(input)) {
          return this._locationRefs[this._locationRefPointer];
        } else {
          this._locationRefPointer = (this._locationRefPointer + 1) % 2;
          return this._locationRefs[this._locationRefPointer].set(input);
        }
      }
    }
  );

  /** @inheritdoc */
  public readonly isLocalizer = Subject.create<boolean | null>(null);

  /** @inheritdoc */
  public readonly hasNav = Subject.create<boolean | null>(null);

  /** @inheritdoc */
  public readonly hasDme = Subject.create<boolean | null>(null);

  /** @inheritdoc */
  public readonly hasLocalizer = Subject.create<boolean | null>(null);

  /** @inheritdoc */
  public readonly hasGlideSlope = Subject.create<boolean | null>(null);

  /** @inheritdoc */
  public readonly activeFrequency = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly toFrom = Subject.create<VorToFrom | null>(null);

  /** @inheritdoc */
  public readonly lateralDeviation = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly lateralDeviationScale = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly lateralDeviationScalingMode = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly verticalDeviation = Subject.create<number | null>(null);

  /** @inheritdoc */
  public readonly verticalDeviationScale = Subject.create<number | null>(null);

  protected readonly fields = new Map<keyof NavReferenceBase, MutableSubscribable<any>>([
    ['ident', this.ident],
    ['signalStrength', this.signalStrength],
    ['bearing', this.bearing],
    ['distance', this.distance],
    ['course', this.course],
    ['isCourseHeading', this.isCourseHeading],
    ['localizerCourse', this.localizerCourse],
    ['location', this.location],
    ['isLocalizer', this.isLocalizer],
    ['hasDme', this.hasDme],
    ['hasNav', this.hasNav],
    ['hasLocalizer', this.hasLocalizer],
    ['hasGlideSlope', this.hasGlideSlope],
    ['activeFrequency', this.activeFrequency],
    ['toFrom', this.toFrom],
    ['lateralDeviation', this.lateralDeviation],
    ['lateralDeviationScale', this.lateralDeviationScale],
    ['lateralDeviationScalingMode', this.lateralDeviationScalingMode],
    ['verticalDeviation', this.verticalDeviation],
    ['verticalDeviationScale', this.verticalDeviationScale],
  ]);

  /**
   * Sets all fields to `null`.
   */
  protected clearAll(): void {
    for (const field of this.fields.values()) {
      field.set(null);
    }
  }
}