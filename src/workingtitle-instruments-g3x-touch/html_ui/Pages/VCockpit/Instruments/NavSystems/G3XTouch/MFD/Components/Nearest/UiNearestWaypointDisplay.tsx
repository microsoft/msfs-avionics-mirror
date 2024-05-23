/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AirportRunway, BasicNavAngleUnit, BitFlags, ComponentProps, DisplayComponent, FSComponent, Facility, FacilityType,
  FacilityUtils, FacilityWaypointUtils, ICAO, MagVar, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface,
  RunwayUtils, SetSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils,
  Subscription, ToggleableClassNameRecord, UnitType, VNode, Waypoint
} from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import { UiWaypointIcon } from '../../../Shared/Components/Waypoint/UiWaypointIcon';
import { G3XUnitFormatter } from '../../../Shared/Graphics/Text/G3XUnitFormatter';
import { G3XUnitsUserSettingManager } from '../../../Shared/Settings/G3XUnitsUserSettings';

import './UiNearestWaypointDisplay.css';

/**
 * Component props for {@link UiNearestWaypointDisplay}.
 */
export interface UiNearestWaypointDisplayProps extends ComponentProps {
  /** An information store for the waypoint to display. */
  waypointInfoStore: WaypointInfoStore;

  /**
   * Whether to display city information for applicable waypoints (airports, VORs, NDBs) instead of their names.
   * Defaults to `false`.
   */
  showCity?: boolean | Subscribable<boolean>;

  /** Whether to the hide the information displayed on the right side of the display. Defaults to `false`. */
  hideRightInfo?: boolean | Subscribable<boolean>;

  /**
   * Bit flags to use for filtering runways based on surface category when displaying longest runway information for
   * airports. Defaults to all flags set to `1` (`true`).
   */
  runwaySurfaceFilter?: number | Subscribable<number>;

  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;

  /** The CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * Displays information about a nearest waypoint.
 */
export class UiNearestWaypointDisplay extends DisplayComponent<UiNearestWaypointDisplayProps> {
  private static readonly RESERVED_CSS_CLASSES = ['ui-nearest-wpt-display'];

  private static readonly NAV_ANGLE_MAGNETIC = BasicNavAngleUnit.create(true);

  private static readonly UNIT_FORMATTER = G3XUnitFormatter.create();

  private static readonly RADIAL_FORMATTER = (magVar: number, radialSource: NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>): string => {
    const radial = Math.round(MagVar.trueToMagnetic(radialSource.asUnit(UiNearestWaypointDisplay.NAV_ANGLE_MAGNETIC), magVar));
    return `Radial ${radial === 0 ? 360 : radial.toString().padStart(3, '0')}°`;
  };

  private readonly iconRef = FSComponent.createRef<UiWaypointIcon>();

  private readonly bottomHidden = Subject.create(false);

  private readonly rightHidden = SubscribableUtils.isSubscribable(this.props.hideRightInfo)
    ? this.props.hideRightInfo.map(SubscribableMapFunctions.identity())
    : this.props.hideRightInfo ?? false;

  private readonly identText = Subject.create('');
  private readonly topRightText = Subject.create('');
  private readonly bottomLeftText = Subject.create('');

  private readonly facilityHandler = this.onFacilityChanged.bind(this);

  private readonly showCity = SubscribableUtils.toSubscribable(this.props.showCity ?? false, true);
  private readonly namePipe = this.props.waypointInfoStore.name.pipe(this.bottomLeftText, name => name ?? '', true);
  private readonly cityPipe = this.props.waypointInfoStore.city.pipe(this.bottomLeftText, city => city ?? '', true);

  private readonly runwaySurfaceFilter = SubscribableUtils.toSubscribable(this.props.runwaySurfaceFilter ?? ~0, true);
  private readonly runway = Subject.create<AirportRunway | null>(null);
  private readonly runwayPipe = this.runway.pipe(this.topRightText, runway => {
    if (!runway) {
      return '';
    }

    const displayUnit = this.props.unitsSettingManager.distanceUnitsSmall.get();
    const length = Math.round(UnitType.METER.convertTo(runway.length, displayUnit));
    const width = Math.round(UnitType.METER.convertTo(runway.width, displayUnit));

    return `${length}×${width}${UiNearestWaypointDisplay.UNIT_FORMATTER(displayUnit)}`;
  }, true);

  private readonly subscriptions: Subscription[] = [];

  private showCitySub?: Subscription;
  private runwaySurfaceFilterSub?: Subscription;
  private facilitySub?: Subscription;
  private topRightPipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.showCitySub = this.showCity.sub(this.onShowCityChanged.bind(this), false, true),

      this.runwaySurfaceFilterSub = this.runwaySurfaceFilter.sub(this.updateRunway.bind(this), false, true),

      this.props.waypointInfoStore.waypoint.sub(this.onWaypointChanged.bind(this), true),
    );
  }

  /**
   * Responds to when this display's waypoint changes.
   * @param waypoint The new waypoint to display.
   */
  private onWaypointChanged(waypoint: Waypoint | null): void {
    this.facilitySub?.destroy();

    if (waypoint == null || !FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
      this.facilitySub = undefined;

      this.topRightPipe?.destroy();
      this.topRightPipe = undefined;

      this.identText.set('');
      this.topRightText.set('');

      this.bottomHidden.set(true);
      this.bottomLeftText.set('');
    } else {
      this.facilitySub = waypoint.facility.sub(this.facilityHandler, true);
    }
  }

  /**
   * Responds to when the facility associated with this display's waypoint changes.
   * @param facility The new facility associated with this display's waypoint.
   */
  private onFacilityChanged(facility: Facility): void {
    this.showCitySub!.pause();
    this.namePipe.pause();
    this.cityPipe.pause();

    this.runwaySurfaceFilterSub!.pause();
    this.runwayPipe.pause();

    this.topRightPipe?.destroy();
    this.topRightPipe = undefined;

    this.identText.set(ICAO.getIdent(facility.icao));

    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
        this.runwaySurfaceFilterSub!.resume(true);
        this.runwayPipe.resume(true);

        this.bottomHidden.set(false);
        this.showCitySub!.resume(true);
        break;
      case FacilityType.VOR:
        if (FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
          this.topRightPipe = this.props.waypointInfoStore.radial.pipe(this.topRightText, UiNearestWaypointDisplay.RADIAL_FORMATTER.bind(undefined, -facility.magneticVariation));
        } else {
          this.topRightText.set('');
        }

        this.bottomHidden.set(false);
        this.showCitySub!.resume(true);
        break;
      case FacilityType.NDB:
        this.topRightText.set('');

        this.bottomHidden.set(false);
        this.showCitySub!.resume(true);
        break;
      default:
        this.topRightText.set('');

        this.bottomHidden.set(true);
        this.bottomLeftText.set('');
    }
  }

  /**
   * Responds to when whether to show city information instead of waypoint name changes.
   * @param showCity Whether to show city information instead of waypoint name.
   */
  private onShowCityChanged(showCity: boolean): void {
    if (showCity) {
      this.namePipe.pause();
      this.cityPipe.resume(true);
    } else {
      this.cityPipe.pause();
      this.namePipe.resume(true);
    }
  }

  /**
   * Updates the runway for which to display information. If the display's waypoint is not an airport, then the runway
   * will be set to `null`.
   */
  private updateRunway(): void {
    const facility = this.props.waypointInfoStore.facility.get();

    if (!facility || !FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      this.runway.set(null);
      return;
    }

    const filter = this.runwaySurfaceFilter.get();

    let longestRunway: AirportRunway | null = null;
    let longestRunwayLength = 0;

    for (let i = 0; i < facility.runways.length; i++) {
      const runway = facility.runways[i];
      if (BitFlags.isAny(RunwayUtils.getSurfaceCategory(runway), filter)) {
        if (runway.length > longestRunwayLength) {
          longestRunway = runway;
          longestRunwayLength = runway.length;
        }
      }
    }

    this.runway.set(longestRunway);
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('ui-nearest-wpt-display');

      const sub = FSComponent.bindCssClassSet(cssClass, this.props.class, UiNearestWaypointDisplay.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      cssClass = 'ui-nearest-wpt-display';
      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !UiNearestWaypointDisplay.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <div class={cssClass}>
        <div class='ui-nearest-wpt-display-top'>
          <UiWaypointIcon ref={this.iconRef} waypoint={this.props.waypointInfoStore.waypoint} class='ui-nearest-wpt-display-icon' />
          <div class='ui-nearest-wpt-display-ident'>{this.identText}</div>
          <div class={{ 'ui-nearest-wpt-display-top-right': true, 'hidden': this.rightHidden }}>{this.topRightText}</div>
        </div>
        <div class={{ 'ui-nearest-wpt-display-bottom': true, 'hidden': this.bottomHidden }}>
          <div class='ui-nearest-wpt-display-bottom-left'>{this.bottomLeftText}</div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.iconRef.getOrDefault()?.destroy();

    this.namePipe.destroy();
    this.cityPipe.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    if (typeof this.rightHidden === 'object') {
      this.rightHidden.destroy();
    }

    this.facilitySub?.destroy();
    this.topRightPipe?.destroy();

    super.destroy();
  }
}