import {
  AirportFacility, AirportPrivateType, ComponentProps, DisplayComponent, FSComponent, Facility, FacilityType,
  FacilityUtils, FacilityWaypoint, ICAO, MappedSubject, MappedSubscribable, SetSubject, Subject, Subscribable,
  SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode, VorType
} from '@microsoft/msfs-sdk';

import { UiWaypointIcon } from './UiWaypointIcon';

import './UiWaypointDisplay.css';

/**
 * Component props for {@link UiWaypointDisplay}.
 */
export interface UiWaypointDisplayProps extends ComponentProps {
  /** The waypoint to display. */
  waypoint: FacilityWaypoint | null | Subscribable<FacilityWaypoint | null>;

  /** The string to display in place of the ident when the displayed waypoint is `null`. Defaults to the empty string. */
  nullIdent?: string | Subscribable<string>;

  /** The string to display in place of the name when the displayed waypoint is `null`. Defaults to the empty string. */
  nullName?: string | Subscribable<string>;

  /** Whether to the hide the information displayed on the right side of the display. Defaults to `false`. */
  hideRightInfo?: boolean | Subscribable<boolean>;

  /** The CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * Displays information about a waypoint, including its identifier, name, type, and city.
 */
export class UiWaypointDisplay extends DisplayComponent<UiWaypointDisplayProps> {
  private static readonly RESERVED_CSS_CLASSES = ['ui-wpt-display'];

  private static readonly VOR_TYPE_TEXT: Record<VorType, string> = {
    [VorType.VOR]: 'VOR',
    [VorType.DME]: 'DME',
    [VorType.VORDME]: 'VOR-DME',
    [VorType.TACAN]: 'TACAN',
    [VorType.VORTAC]: 'VORTAC',
    [VorType.ILS]: 'ILS',
    [VorType.VOT]: 'VOT',
    [VorType.Unknown]: 'UNKNOWN',
  };

  private readonly iconRef = FSComponent.createRef<UiWaypointIcon>();

  private readonly waypoint = SubscribableUtils.toSubscribable(this.props.waypoint, true) as Subscribable<FacilityWaypoint | null>;

  private readonly facility = Subject.create<Facility | null>(null);

  private readonly nullIdent = SubscribableUtils.toSubscribable(this.props.nullIdent ?? '', true);
  private readonly nullName = SubscribableUtils.toSubscribable(this.props.nullName ?? '', true);

  private readonly identText = MappedSubject.create(
    ([facility, nullIdent]) => {
      if (facility === null) {
        return nullIdent;
      } else {
        return ICAO.getIdent(facility.icao);
      }
    },
    this.facility,
    this.nullIdent
  );

  private readonly nameText = MappedSubject.create(
    ([facility, nullName]) => {
      if (facility === null) {
        return nullName;
      }

      switch (ICAO.getFacilityType(facility.icao)) {
        case FacilityType.Airport:
        case FacilityType.VOR:
        case FacilityType.NDB:
          return Utils.Translate(facility.name);
        default:
          return '';
      }
    },
    this.facility,
    this.nullName
  );
  private readonly nameTextHidden = MappedSubject.create(
    ([facility, nullName]) => {
      if (facility === null) {
        return nullName === '';
      }

      switch (ICAO.getFacilityType(facility.icao)) {
        case FacilityType.Airport:
        case FacilityType.VOR:
        case FacilityType.NDB:
          return false;
        default:
          return true;
      }
    },
    this.facility,
    this.nullName
  );

  private readonly rightHidden = (
    SubscribableUtils.isSubscribable(this.props.hideRightInfo)
      ? this.props.hideRightInfo.map(SubscribableMapFunctions.identity())
      : SubscribableUtils.toSubscribable(this.props.hideRightInfo ?? false, true)
  ) as Subscribable<boolean> | MappedSubscribable<boolean>;

  private readonly typeText = this.facility.map(facility => {
    if (facility === null) {
      return '';
    }

    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
        switch ((facility as AirportFacility).airportPrivateType) {
          case AirportPrivateType.Public:
            return 'Public Airport';
          case AirportPrivateType.Private:
            return 'Private Airport';
          case AirportPrivateType.Military:
            return 'Military Airport';
          default:
            return 'Unknown Airport';
        }
      case FacilityType.VOR:
        if (FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
          return UiWaypointDisplay.VOR_TYPE_TEXT[facility.type];
        } else {
          // This is the sim's intersection version of a VOR facility.
          return 'Unknown';
        }
      case FacilityType.NDB:
        return 'NDB';
      case FacilityType.Intersection:
      case FacilityType.RWY:
      case FacilityType.VIS:
        return 'Intersection';
      case FacilityType.USR:
        return 'User Waypoint';
      default:
        return 'Unknown';
    }
  }).pause();

  private readonly cityText = this.facility.map(facility => {
    if (facility === null) {
      return '';
    }

    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
      case FacilityType.VOR:
      case FacilityType.NDB:
        if (facility.city.length > 0) {
          const separatedCity = facility.city.split(', ');
          const city = separatedCity.length > 1 ? Utils.Translate(separatedCity[0]) + ' ' + Utils.Translate(separatedCity[1]) : Utils.Translate(facility.city);
          if (city) {
            return city;
          }
        }

        return '––––';
      default:
        return true;
    }
  }).pause();
  private readonly cityTextHidden = this.facility.map(facility => {
    if (facility === null) {
      return true;
    }

    switch (ICAO.getFacilityType(facility.icao)) {
      case FacilityType.Airport:
      case FacilityType.VOR:
      case FacilityType.NDB:
        return false;
      default:
        return true;
    }
  }).pause();

  private readonly subscriptions: Subscription[] = [
    this.identText,
    this.nameText,
    this.nameTextHidden
  ];

  private facilityPipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.waypoint.sub(waypoint => {
        this.facilityPipe?.destroy();

        if (waypoint === null) {
          this.facility.set(null);
        } else {
          this.facilityPipe = waypoint.facility.pipe(this.facility);
        }
      }, true),

      this.rightHidden.sub(hidden => {
        if (hidden) {
          this.typeText.pause();
          this.cityText.pause();
          this.cityTextHidden.pause();
        } else {
          this.typeText.resume();
          this.cityText.resume();
          this.cityTextHidden.resume();
        }
      }, true)
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('ui-wpt-display');

      const sub = FSComponent.bindCssClassSet(cssClass, this.props.class, UiWaypointDisplay.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      cssClass = 'ui-wpt-display';
      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !UiWaypointDisplay.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <div class={cssClass}>
        <UiWaypointIcon ref={this.iconRef} waypoint={this.waypoint} class='ui-wpt-display-icon' />
        <div class='ui-wpt-display-left'>
          <div class='ui-wpt-display-ident'>{this.identText}</div>
          <div class={{ 'ui-wpt-display-name': true, 'hidden': this.nameTextHidden }}>{this.nameText}</div>
        </div>
        <div class={{ 'ui-wpt-display-right': true, 'hidden': this.rightHidden }}>
          <div class='ui-wpt-display-type'>{this.typeText}</div>
          <div class={{ 'ui-wpt-display-city': true, 'hidden': this.cityTextHidden }}>{this.cityText}</div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.iconRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    if ('destroy' in this.rightHidden) {
      this.rightHidden.destroy();
    }

    this.facilityPipe?.destroy();

    super.destroy();
  }
}