import {
  ComponentProps, DisplayComponent, DmsFormatter2, FSComponent, LatLonInterface, MappedSubject, Subject,
  Subscribable, SubscribableSet, SubscribableUtils, UnitType, VNode
} from '@microsoft/msfs-sdk';

/**
 * Display formats for {@link LatLonDisplay}.
 */
export enum LatLonDisplayFormat {
  /** HDDD° MM.MM' */
  HDDD_MMmm = 'HDDD° MM.MM\'',

  /** HDDD° MM.MMM' */
  HDDD_MMmmm = 'HDDD° MM.MMM\'',

  /** HDDD° MM' SS.S */
  HDDD_MM_SSs = 'HDDD° MM\' SS.S'
}

/**
 * Component props for LatLonDisplay.
 */
export interface LatLonDisplayProps extends ComponentProps {
  /** The location for which to display coordinates. */
  value: LatLonInterface | null | Subscribable<LatLonInterface | null>;

  /** The format to use to display the coordinates. */
  format: LatLonDisplayFormat | Subscribable<LatLonDisplayFormat>;

  /** Whether to split the prefix into a separate `span` element within the `div.g-latlon-coord`. Defaults to `false`. */
  splitPrefix?: boolean;

  /** Whether to format prefix text as an underscore when the coordinate value is equal to `NaN`. Defaults to `false`. */
  blankPrefixWhenNaN?: boolean;

  /** CSS class(es) to add to the component's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays Garmin-style lat/lon coordinates.
 */
export class LatLonDisplay extends DisplayComponent<LatLonDisplayProps> {
  private static readonly LAT_FORMATTERS = LatLonDisplay.createLatFormatters(false);
  private static readonly BLANK_PREFIX_LAT_FORMATTERS = LatLonDisplay.createLatFormatters(true);

  private static readonly LON_FORMATTERS = LatLonDisplay.createLonFormatters(false);
  private static readonly BLANK_PREFIX_LON_FORMATTERS = LatLonDisplay.createLonFormatters(true);

  private readonly value = SubscribableUtils.toSubscribable(this.props.value, true) as Subscribable<LatLonInterface | null>;
  private readonly format = SubscribableUtils.toSubscribable(this.props.format, true);

  private readonly valueState = MappedSubject.create(
    this.value,
    this.format
  );

  private readonly latText = Subject.create('');
  private readonly latPrefixText = this.props.splitPrefix ? this.latText.map((it) => it[0]) : undefined;
  private readonly latNumberText = this.props.splitPrefix ? this.latText.map((it) => it.substring(2)) : undefined;

  private readonly lonText = Subject.create('');
  private readonly lonPrefixText = this.props.splitPrefix ? this.lonText.map((it) => it[0]) : undefined;
  private readonly lonNumberText = this.props.splitPrefix ? this.lonText.map((it) => it.substring(1)) : undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    const latFormatters = this.props.blankPrefixWhenNaN ? LatLonDisplay.BLANK_PREFIX_LAT_FORMATTERS : LatLonDisplay.LAT_FORMATTERS;
    const lonFormatters = this.props.blankPrefixWhenNaN ? LatLonDisplay.BLANK_PREFIX_LON_FORMATTERS : LatLonDisplay.LON_FORMATTERS;

    this.valueState.sub(([value, format]) => {
      const lat = value?.lat ?? NaN;
      const lon = value?.lon ?? NaN;

      this.latText.set(latFormatters[format](lat * 3600));
      this.lonText.set(lonFormatters[format](lon * 3600));
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''}>
        {this.props.splitPrefix ? (
          <>
            <div class='g-latlon-coord g-latlon-lat'>
              <span class="g-latlon-prefix">{this.latPrefixText}</span>
              <span class="g-latlon-num">{this.latNumberText}</span>
            </div>
            <div class='g-latlon-coord g-latlon-lon'>
              <span class="g-latlon-prefix">{this.lonPrefixText}</span>
              <span class="g-latlon-num">{this.lonNumberText}</span>
            </div>
          </>
        ) : (
          <>
            <div class='g-latlon-coord g-latlon-lat'>{this.latText}</div>
            <div class='g-latlon-coord g-latlon-lon'>{this.lonText}</div>
          </>
        )}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.valueState.destroy();

    super.destroy();
  }

  /**
   * Creates a record of latitude formatters keyed by display format.
   * @param blankPrefixWhenNaN Whether the formatters should format prefix text as an underscore when latitude is equal
   * to `NaN`.
   * @returns A record of latitude formatters keyed by display format.
   */
  private static createLatFormatters(blankPrefixWhenNaN: boolean): Record<LatLonDisplayFormat, (angle: number) => string> {
    const nanPrefix = blankPrefixWhenNaN ? '_' : 'N';

    return {
      [LatLonDisplayFormat.HDDD_MMmm]: DmsFormatter2.create('{+[N]-[S]} {dd}°{mm.mm}\'', UnitType.ARC_SEC, 0.6, `${nanPrefix} __°__.__'`),
      [LatLonDisplayFormat.HDDD_MMmmm]: DmsFormatter2.create('{+[N]-[S]} {dd}°{mm.mmm}\'', UnitType.ARC_SEC, 0.6, `${nanPrefix} __°__.___'`),
      [LatLonDisplayFormat.HDDD_MM_SSs]: DmsFormatter2.create('{+[N]-[S]} {dd}°{mm}\'{ss.s}"', UnitType.ARC_SEC, 0.1, `${nanPrefix} __°__'__._"`),
    };
  }

  /**
   * Creates a record of longitude formatters keyed by display format.
   * @param blankPrefixWhenNaN Whether the formatters should format prefix text as an underscore when longitude is
   * equal to `NaN`.
   * @returns A record of longitude formatters keyed by display format.
   */
  private static createLonFormatters(blankPrefixWhenNaN: boolean): Record<LatLonDisplayFormat, (angle: number) => string> {
    const nanPrefix = blankPrefixWhenNaN ? '_' : 'E';

    return {
      [LatLonDisplayFormat.HDDD_MMmm]: DmsFormatter2.create('{+[E]-[W]}{ddd}°{mm.mm}\'', UnitType.ARC_SEC, 0.6, `${nanPrefix}___°__.__'`),
      [LatLonDisplayFormat.HDDD_MMmmm]: DmsFormatter2.create('{+[E]-[W]}{ddd}°{mm.mmm}\'', UnitType.ARC_SEC, 0.6, `${nanPrefix}___°__.___'`),
      [LatLonDisplayFormat.HDDD_MM_SSs]: DmsFormatter2.create('{+[E]-[W]}{ddd}°{mm}\'{ss.s}"', UnitType.ARC_SEC, 0.1, `${nanPrefix}___°__'__._"`),
    };
  }
}