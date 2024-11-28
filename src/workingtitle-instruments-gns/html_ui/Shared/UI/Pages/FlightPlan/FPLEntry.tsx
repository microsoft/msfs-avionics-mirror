import {
  AirportFacility, BitFlags, Facility, FacilityType, FlightPlanSegmentType, FlightPlanUtils, FSComponent, ICAO, LegDefinition, LegDefinitionFlags, NumberFormatter,
  NumberUnitSubject, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { WaypointLeg } from '../Map/WaypointLeg';
import { ViewService } from '../Pages';
import { FPLLegArrow, LegArrowType } from './FPLLegArrow';
import { GnsLegDataItem } from './GnsLegDataItem';
import { GNSType } from '../../../UITypes';

import './FPLEntry.css';

/** Props on the FPLEntry component. */
export interface FPLEntryProps extends GNSUiControlProps {
  /** The GNS type */
  gnsType: GNSType;

  /** The leg data associated with this component. */
  data?: GnsLegDataItem;

  /** The flight plan management system. */
  fms: Fms;
}

/**
 * A UI control that display a flight plan entry line within the plan table.
 */
export class FPLEntry extends GNSUiControl<FPLEntryProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly leg = FSComponent.createRef<WaypointLeg>();
  private readonly legArrow = FSComponent.createRef<FPLLegArrow>();

  private legSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    if (this.props.data !== undefined) {
      this.legSub = this.props.data.legDefinition.sub(this.onLegDefinitionChanged.bind(this), true);
    }
  }

  /**
   * Sets the leg arrow to be displayed with this entry.
   * @param type The type of arrow to display.
   */
  public setLegArrow(type: LegArrowType): void {
    this.legArrow.instance.set(type);
  }

  /**
   * Handles when the leg defintion changes.
   * @param legDefinition The new leg definition.
   */
  private onLegDefinitionChanged(legDefinition: LegDefinition): void {
    if (FlightPlanUtils.isDiscontinuityLeg(legDefinition.leg.type) ||
      BitFlags.isAny(legDefinition.flags, LegDefinitionFlags.DirectTo)) {
      this.el.instance.classList.add('hide-element');
      this.setDisabled(true);
    } else {
      this.el.instance.classList.remove('hide-element');
      this.setDisabled(false);
    }

    this.leg.instance.setLeg(legDefinition);
  }

  /** @inheritDoc */
  onDirectTo(sender: GNSUiControl): boolean {
    const legDefinition = this.props.data?.legDefinition.get();

    if (legDefinition) {
      ViewService.directToDialogWithLeg(legDefinition);
      return true;
    }

    return super.onDirectTo(sender);
  }

  /** @inheritDoc */
  public onClr(): boolean {
    if (this.props.data !== undefined) {
      const legData = this.props.data;
      ViewService.confirm('REMOVE WAYPOINT', legData.name.get())
        .then(confirmed => {
          if (confirmed) {
            const plan = this.props.fms.getPrimaryFlightPlan();
            const segment = plan.getSegmentFromLeg(legData.legDefinition.get());
            const legIndex = segment?.legs.indexOf(legData.legDefinition.get());

            if (segment !== null && legIndex !== undefined) {
              this.props.fms.removeWaypoint(segment.segmentIndex, legIndex);
              if (segment.segmentType === FlightPlanSegmentType.Destination) {
                const lastLegInPlan = plan.length > 1 && plan.tryGetLeg(plan.length - 1);
                if (lastLegInPlan && ICAO.getFacilityType(lastLegInPlan.leg.fixIcao) === FacilityType.Airport) {
                  this.props.fms.facLoader.getFacility(FacilityType.Airport, lastLegInPlan.leg.fixIcao).then(airport => {
                    this.props.fms.setDestination(airport);
                  });
                } else {
                  this.props.fms.setDestination(undefined);
                }
              }
            }
          }
        });
    }

    return true;
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    return this.handleInnerKnobScroll();
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    return this.handleInnerKnobScroll();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.legSub?.destroy();
  }

  /**
   * Handles when the inner knob is turned.
   * @returns True as it will always be handled.
   */
  private handleInnerKnobScroll(): boolean {
    ViewService.getWaypoint().then(facility => {
      this.insertWaypoint(facility);
    });

    return true;
  }

  /**
   * Inserts a waypoint into the flight plan.
   * @param facility The facility to insert into the plan.
   */
  private insertWaypoint(facility: Facility): void {
    const plan = this.props.fms.getPrimaryFlightPlan();
    const isAirport = ICAO.getFacilityType(facility.icao) === FacilityType.Airport;

    if (plan.length === 0) {
      if (isAirport) {
        this.props.fms.setDestination(facility as AirportFacility);
      } else {
        this.props.fms.insertWaypoint([...plan.segmentsOfType(FlightPlanSegmentType.Enroute)][0].segmentIndex, facility);
      }
    } else if (plan.length === 1) {
      if (isAirport) {
        if (this.isDestinationAirport()) {
          this.props.fms.setOrigin(facility as AirportFacility);
        } else {
          this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.getLeg(0).leg.fixIcao).then(oldFac => {
            this.props.fms.setDestination(facility as AirportFacility);
            this.props.fms.setOrigin(oldFac);
          });
        }
      } else {
        if (!this.isDestinationAirport()) {
          this.props.fms.facLoader.getFacility(FacilityType.Airport, plan.getLeg(0).leg.fixIcao).then(oldFac => {
            this.props.fms.setOrigin(oldFac);
            this.props.fms.setDestination(undefined);
          });
        }

        this.props.fms.insertWaypoint([...plan.segmentsOfType(FlightPlanSegmentType.Enroute)][0].segmentIndex, facility);
      }
    } else {
      const segment = this.props.data !== undefined
        ? plan.getSegmentFromLeg(this.props.data.legDefinition.get())
        : plan.getSegment(plan.segmentCount - 1);

      const isDestinationSegment = segment?.segmentType === FlightPlanSegmentType.Destination;

      const legIndex = this.props.data !== undefined
        ? segment?.legs.indexOf(this.props.data.legDefinition.get())
        : undefined;

      if (segment !== null) {
        if (isDestinationSegment) {

          if (legIndex === undefined) {
            this.props.fms.moveCurrentDestinationLegToEnroute();
            if (isAirport) {
              this.props.fms.setDestination(facility as AirportFacility);
            } else {
              this.props.fms.insertWaypoint(segment.segmentIndex, facility);
            }

          } else {
            const lastEnrouteSegmentIndex = this.props.fms.findLastEnrouteSegmentIndex(plan);
            this.props.fms.insertWaypoint(lastEnrouteSegmentIndex, facility);
          }
        } else {
          this.props.fms.insertWaypoint(segment.segmentIndex, facility, legIndex);
        }
      }
    }
  }

  /**
   * Checks to see if the FPL entry is the destination airport.
   * @returns If there is a distionation airport.
   */
  private isDestinationAirport(): boolean {
    if (this.props.data !== undefined) {
      const segment = this.props.fms.getPrimaryFlightPlan().getSegmentFromLeg(this.props.data.legDefinition.get());
      if (segment !== null) {
        return segment.segmentType === FlightPlanSegmentType.Destination
          && ICAO.getFacilityType(this.props.data.legDefinition.get().leg.fixIcao) === FacilityType.Airport;
      }
    }

    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='fpl-entry' ref={this.el}>
        <FPLLegArrow ref={this.legArrow} />
        <WaypointLeg class='fpl-entry-name' ref={this.leg} />
        <div class='fpl-entry-col1'>
          <GNSNumberUnitDisplay
            formatter={NumberFormatter.create({ pad: 3, precision: 1, forceDecimalZeroes: false, maxDigits: 3, nanString: '___' })}
            value={this.props.data?.dtk ?? NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN))}
            displayUnit={UnitType.DEGREE}
          />
        </div>
        <div class='fpl-entry-col2'>
          <GNSNumberUnitDisplay
            formatter={NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: true, maxDigits: 3, nanString: '__._' })}
            value={this.props.data?.distance ?? NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN))}
            displayUnit={UnitType.NMILE}
          />
        </div>
        {this.props.gnsType === 'wt530' && (
          <div class='fpl-entry-col3'>
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({
                precision: 0.1,
                forceDecimalZeroes: true,
                maxDigits: 3,
                nanString: '__._'
              })}
              value={this.props.data?.cumulativeDistance ?? NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN))}
              displayUnit={UnitType.NMILE}
            />
          </div>
        )}
      </div>
    );
  }
}