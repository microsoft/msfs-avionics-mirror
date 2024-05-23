import {
  BitFlags, ComponentProps, DisplayComponent, FSComponent, Facility, FacilityLoader, FacilityType, FacilityWaypoint,
  FixTypeFlags, FlightPlanLeg, ICAO, LegType, MappedSubject, MathUtils, SetSubject, Subject, Subscribable,
  SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { G3XFmsFplLoadedApproachData } from '../../FlightPlan/G3XFmsFplUserDataTypes';
import { G3XFmsUtils } from '../../FlightPlan/G3XFmsUtils';
import { UiWaypointIcon } from '../Waypoint/UiWaypointIcon';

import './UiFlightPlanLegDisplay.css';

/**
 * Component props for {@link UiFlightPlanLegDisplay}.
 */
export interface UiFlightPlanLegDisplayProps extends ComponentProps {
  /** The flight plan leg to display. */
  leg: FlightPlanLeg;

  /**
   * The ICAO of the waypoint fix associated with the displayed flight plan leg, or the empty string if no such
   * waypoint fix exists.
   */
  fixIcao: string;

  /**
   * Data describing the approach procedure associated with the displayed flight plan leg, or `undefined` if the leg
   * is not associated with an approach.
   */
  approachData?: Readonly<G3XFmsFplLoadedApproachData>;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** A cache used to retrieve waypoints. */
  facWaypointCache: GarminFacilityWaypointCache;

  /**
   * Whether to center the waypoint icon vertically within the display instead of aligning it with the top row text.
   * Defaults to `false`.
   */
  centerIconVertically?: boolean;

  /** The string to display in place of the ident when the displayed waypoint is `null`. Defaults to the empty string. */
  nullIdent?: string | Subscribable<string>;

  /** Whether to display shortened versions of special leg identifiers. Defaults to `false`. */
  useShortSpecialLegIdent?: boolean;

  /** The CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * Displays information about a flight plan leg.
 */
export class UiFlightPlanLegDisplay extends DisplayComponent<UiFlightPlanLegDisplayProps> {
  private static readonly RESERVED_CSS_CLASSES = ['ui-fpl-leg-display', 'ui-fpl-leg-display-center-icon', 'ui-fpl-leg-display-bottom-hidden'];

  private readonly iconRef = FSComponent.createRef<UiWaypointIcon>();

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly shouldRenderWaypoint = UiFlightPlanLegDisplay.shouldRenderWaypoint(this.props.leg);
  private readonly shouldRenderBottomText = UiFlightPlanLegDisplay.shouldRenderBottomText(this.props.leg);

  private readonly waypoint = this.shouldRenderWaypoint ? Subject.create<FacilityWaypoint | null>(null) : undefined;

  private readonly facility = this.shouldRenderWaypoint ? Subject.create<Facility | null>(null) : undefined;

  private readonly nullIdent = this.shouldRenderWaypoint ? SubscribableUtils.toSubscribable(this.props.nullIdent ?? '', true) : undefined;

  private readonly identText = this.facility && this.nullIdent ?
    MappedSubject.create(
      ([facility, nullIdent]) => {
        if (facility === null) {
          return nullIdent;
        } else {
          return ICAO.getIdent(facility.icao);
        }
      },
      this.facility,
      this.nullIdent
    )
    : undefined;

  private readonly bottomText = this.shouldRenderBottomText
    ? this.props.approachData
      ? UiFlightPlanLegDisplay.getApproachName(this.props.approachData)
      : this.facility?.map(facility => {
        if (facility === null) {
          return '';
        }

        switch (ICAO.getFacilityType(facility.icao)) {
          case FacilityType.Airport:
          case FacilityType.VOR:
          case FacilityType.NDB:
            return Utils.Translate(facility.name);
          default:
            return '';
        }
      })
    : undefined;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.waypoint && this.facility) {
      this.retrieveWaypoint();

      this.subscriptions.push(
        SubscribableUtils.pipeOptionalMappedSource(
          this.waypoint,
          this.facility,
          to => { to.set(null); },
          waypoint => waypoint ? waypoint.facility : undefined
        )
      );
    }

    if (this.bottomText) {
      this.bottomText.sub(text => { this.rootCssClass.toggle('ui-fpl-leg-display-bottom-hidden', text === ''); }, true);
    } else {
      this.rootCssClass.add('ui-fpl-leg-display-bottom-hidden');
    }
  }

  /**
   * Retrieves this list item's waypoint fix.
   */
  private async retrieveWaypoint(): Promise<void> {
    const fixIcao = this.props.fixIcao;
    if (!ICAO.isFacility(fixIcao)) {
      return;
    }

    try {
      const facility = await this.props.facLoader.getFacility(ICAO.getFacilityType(fixIcao), fixIcao);
      this.waypoint!.set(this.props.facWaypointCache.get(facility));
    } catch {
      // noop
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    this.rootCssClass.add('ui-fpl-leg-display');
    this.rootCssClass.toggle('ui-fpl-leg-display-center-icon', this.props.centerIconVertically ?? false);

    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, UiFlightPlanLegDisplay.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      if (this.props.class !== undefined && this.props.class.length > 0) {
        for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiFlightPlanLegDisplay.RESERVED_CSS_CLASSES.includes(classToFilter))) {
          this.rootCssClass.add(classToAdd);
        }
      }
    }

    return (
      <div class={this.rootCssClass}>
        {this.renderInner()}
      </div>
    );
  }

  /**
   * Renders this display's inner components.
   * @returns This display's inner components, as a VNode, or `null` if this display's flight plan leg type is not
   * recognized.
   */
  private renderInner(): VNode | null {
    switch (this.props.leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HM:
        return (
          <>
            {this.waypoint !== undefined && (
              <UiWaypointIcon ref={this.iconRef} waypoint={this.waypoint} class='ui-fpl-leg-display-icon' />
            )}
            <div class='ui-fpl-leg-display-top'>
              <div class='ui-fpl-leg-display-ident'>{this.identText ?? ''}</div>
              <div class='ui-fpl-leg-display-flag'>{UiFlightPlanLegDisplay.getFlagText(this.props.leg)}</div>
            </div>
            <div class='ui-fpl-leg-display-bottom'>{this.bottomText ?? ''}</div>
          </>
        );
      case LegType.FC: {
        // TODO: Need reference
        const legDistanceNM = Math.round(UnitType.METER.convertTo(this.props.leg.distance, UnitType.NMILE));
        const name = `D${this.props.leg.course.toFixed(0).padStart(3, '0')}${String.fromCharCode(64 + MathUtils.clamp(legDistanceNM, 1, 26))}`;
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident'>{name}</div>
            <div class='ui-fpl-leg-display-flag'>{UiFlightPlanLegDisplay.getFlagText(this.props.leg)}</div>
          </div>
        );
      }
      case LegType.CD:
      case LegType.FD:
      case LegType.VD: {
        // TODO: Need reference
        const legDistanceNM = UnitType.METER.convertTo(this.props.leg.distance, UnitType.NMILE);
        const name = `${ICAO.getIdent(this.props.leg.originIcao)}${legDistanceNM.toFixed(1)}`;
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident'>{name}</div>
            <div class='ui-fpl-leg-display-flag'>{UiFlightPlanLegDisplay.getFlagText(this.props.leg)}</div>
          </div>
        );
      }
      case LegType.CR:
      case LegType.VR: {
        // TODO: Need reference
        const name = `${ICAO.getIdent(this.props.leg.originIcao)}${this.props.leg.theta.toFixed(0).padStart(3, '0')}`;
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident'>{name}</div>
            <div class='ui-fpl-leg-display-flag'>{UiFlightPlanLegDisplay.getFlagText(this.props.leg)}</div>
          </div>
        );
      }
      case LegType.CA:
      case LegType.VA:
      case LegType.FA:
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident-special'>Altitude</div>
          </div>
        );
      case LegType.CI:
      case LegType.VI:
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident-special'>Intercept</div>
          </div>
        );
      case LegType.HF:
      case LegType.HA:
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident-special'>Hold</div>
          </div>
        );
      case LegType.PI:
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident-special'>{this.props.useShortSpecialLegIdent ? 'Proc. Turn' : 'Procedure Turn'}</div>
          </div>
        );
      case LegType.FM:
      case LegType.VM:
        return (
          <div class='ui-fpl-leg-display-top'>
            <div class='ui-fpl-leg-display-ident-special'>Vectors</div>
          </div>
        );
      default:
        return null;
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.iconRef.getOrDefault()?.destroy();

    this.identText?.destroy();

    if (SubscribableUtils.isSubscribable(this.bottomText)) {
      this.bottomText.destroy();
    }

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }

  /**
   * Checks whether waypoint information should be rendered for a given flight plan leg.
   * @param leg The flight plan leg to check.
   * @returns Whether waypoint information should be rendered for the specified flight plan leg.
   */
  private static shouldRenderWaypoint(leg: FlightPlanLeg): boolean {
    switch (leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HM:
        return true;
      default:
        return false;
    }
  }

  /**
   * Checks whether the the information in the bottom row of the display should be rendered for a given flight plan
   * leg.
   * @param leg The flight plan leg to check.
   * @returns Whether information in the bottom row of the display should be rendered for the specified flight plan
   * leg.
   */
  private static shouldRenderBottomText(leg: FlightPlanLeg): boolean {
    switch (leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
      case LegType.HM:
        return true;
      default:
        return false;
    }
  }

  /**
   * Gets the fix type flag text to display for a given flight plan leg.
   * @param leg The flight plan leg for which to get fix type flag text.
   * @returns The fix type flag text to display for the specified flight plan leg.
   */
  private static getFlagText(leg: FlightPlanLeg): string {
    if (BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.MAP)) {
      return 'MA';
    } else if (BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.FAF)) {
      return 'FA';
    } else if (BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.IAF)) {
      return 'IA';
    } else {
      return '';
    }
  }

  /**
   * Gets the name to display for a loaded approach.
   * @param approachData Data describing the loaded approach for which to get a name.
   * @returns The name to display for the specified loaded approach.
   */
  private static getApproachName(approachData: Readonly<G3XFmsFplLoadedApproachData>): string {
    return `${ICAO.getIdent(approachData.airportIcao)} - ${G3XFmsUtils.getVfrApproachName(approachData.approach)}`;
  }
}
