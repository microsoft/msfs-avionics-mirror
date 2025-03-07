/* eslint-disable max-len */
import {
  AltitudeRestrictionType, BasicNavAngleUnit, DisplayComponent, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, EventBus, FSComponent,
  LatLonDisplay, LegTurnDirection, MappedSubject, NumberFormatter, NumberUnitInterface, NumberUnitSubject, SetSubject, SimpleUnit, SpeedRestrictionType,
  Subject, Subscription, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  BearingDisplay, FlightPlanLegListData, FlightPlanStore, ListItem, NumberDisplay, SectionOutline, TimeDisplay, TimeDisplayFormat
} from '@microsoft/msfs-epic2-shared';

import { LogControllerOptions } from '../../FlightPlanLogControllerSection';

import './FlightPlanLegListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanLegListItemProps {
  /** Data describing the list item's associated flight plan leg. */
  legListData: FlightPlanLegListData;

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The event bus */
  bus: EventBus;

  /** Log Controller Option List **/
  selectedLogControllerOption: Subject<LogControllerOptions>;
}

const WEIGHT_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '', round: -1 });

const FORMAT_WEIGHT = (weight: NumberUnitInterface<UnitFamily.Weight, SimpleUnit<UnitFamily.Weight>>): string =>
  WEIGHT_FORMATTER(weight.asUnit(UnitType.POUND) / 1000);

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanLegListItem extends DisplayComponent<FlightPlanLegListItemProps> {
  private readonly legData = this.props.legListData.legData;
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);
  private readonly classListControllerOption = this.props.selectedLogControllerOption.map(
    (logDataOption) => `list-view-${logDataOption.toLowerCase().replace(/\//g, '-')}`);

  private readonly classList = SetSubject.create(['flight-plan-leg-list-item']);
  private readonly upperTimeClassList = SetSubject.create(['time']);

  private readonly subs = [] as Subscription[];
  private readonly airwaySubs = [] as Subscription[];

  private readonly transitionAlt = this.props.store.perfPlanRepository.getActivePlan().transitionAltitude;

  private readonly isConstraintActive = this.props.legListData.legData.altDescDisplay.map((type) => type !== AltitudeRestrictionType.Unused);
  private readonly topConstraint = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly bottomConstraint = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly topConstraintText = MappedSubject.create(
    ([constraintAlt, transitionAlt]) => constraintAlt > transitionAlt ? `FL${(constraintAlt / 100).toFixed(0).padStart(3, '0')}` : (isNaN(constraintAlt) ? '' : constraintAlt.toFixed(0)),
    this.topConstraint.asUnit(UnitType.FOOT), this.transitionAlt
  );
  private readonly bottomConstraintText = MappedSubject.create(
    ([constraintAlt, transitionAlt]) => constraintAlt > transitionAlt ? `FL${(constraintAlt / 100).toFixed(0).padStart(3, '0')}` : (isNaN(constraintAlt) ? '' : constraintAlt.toFixed(0)),
    this.bottomConstraint.asUnit(UnitType.FOOT), this.transitionAlt
  );

  private readonly patternIconText = Subject.create<string | null>(null);
  private readonly turnIndicatorText = !this.legData.isArcLeg && !this.legData.isProcedureTurn && !this.legData.isHoldLeg
    ? (this.legData.leg.leg.turnDirection === LegTurnDirection.Left ? 'L' : (this.legData.leg.leg.turnDirection === LegTurnDirection.Right ? 'R' : null))
    : null;

  private readonly icaoText = MappedSubject.create(([departure, arrival, approach]) => {
    if (this.legData.isInDepartureSegment) {
      return departure;
    } else if (this.legData.isInArrivalSegment) {
      return arrival;
    } else if (this.legData.isInApproachSegment) {
      return approach;
    } else {
      return '';
    }
  }, this.props.store.departureString, this.props.store.arrivalString, this.props.store.approachName);

  /**
   * Determines the pattern icon text based on the leg type
   * @returns string corresponding to pattern icon text, or null if none are applicable
   */
  private getPatternIconText(): string | null {
    if (this.legData.isHoldLeg.get()) {
      return 'H';
    } else if (this.legData.isArcLeg) {
      return 'A';
    } else if (this.legData.isProcedureTurn) {
      return 'P';
    } else if (this.legData.isFlyover) {
      return 'F';
    } else {
      return null;
    }
  }

  /** Runs when the outlined element is selected */
  private onMouseDown(): void {
    const isThisSelected = this.props.store.selectedEnrouteWaypoint.get() == this.props.legListData;
    this.props.store.selectedEnrouteWaypoint.set(!isThisSelected ? this.props.legListData : undefined);
  }

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.props.legListData.legData.isActiveLeg.sub(isActiveLeg => this.classList.toggle('active-leg', isActiveLeg), true);
    this.props.legListData.legData.isFromLeg.sub(isFromLeg => this.classList.toggle('from-leg', isFromLeg), true);
    this.props.store.isLnavTracking.sub(isTracking => this.classList.toggle('lnav-tracking', isTracking), true);
    this.props.legListData.isNew.sub((isNew) => this.classList.toggle('adding-leg', isNew));

    this.props.legListData.legData.isBehindActiveLeg.sub(removing => this.classList.toggle('removing-leg', removing));
    this.props.legListData.isBeingRemoved.sub(removing => this.classList.toggle('removing-leg', removing));

    if (this.outlineRef.getOrDefault()) {
      this.outlineRef.instance.outlineElement.instance.addEventListener('mousedown', () => this.onMouseDown());
      this.props.store.selectedEnrouteWaypoint.sub((legListData) => {
        const isThisSelected = legListData == this.props.legListData;
        this.outlineRef.instance.forceOutline(isThisSelected);
      });
    }

    MappedSubject.create(([type, alt1, alt2]) => {
      this.bottomConstraint.set(type === AltitudeRestrictionType.Between ? alt2 : alt1);
      this.topConstraint.set(type === AltitudeRestrictionType.Between ? alt1 : UnitType.METER.createNumber(NaN));
    }, this.props.legListData.legData.altDescDisplay, this.props.legListData.legData.altitude1Display, this.props.legListData.legData.altitude2Display);
    this.patternIconText.set(this.getPatternIconText());
    this.legData.isHoldLeg.sub(() => this.patternIconText.set(this.getPatternIconText()));
    this.legData.isAltitudeTempCompensated.sub((v) => this.upperTimeClassList.toggle('hidden', v));
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    const { legListData } = this.props;
    const { legData } = legListData;

    // Some legs are never visible
    if (!legData.isVisibleLegType) {
      // Need to put something in the DOM so that it gets removed properly
      return <div class="hidden-leg" style="display: none;" />;
    }

    return (
      <ListItem
        ref={this.listItemRef}
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
        isVisible={this.props.legListData.isVisible}
      >
        <div class="left-box">
          <SectionOutline bus={this.props.bus} ref={this.outlineRef}>
            <div class="top-row">
              <div class={{ 'turn-direction': true, hidden: this.turnIndicatorText === null }}>{this.turnIndicatorText}</div>
              <BearingDisplay
                class="course"
                value={this.props.legListData.displayDtk}
                formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '' })}
                displayUnit={BasicNavAngleUnit.create(true)}
                hideDegreeSymbolWhenNan={true}
              />
              <NumberDisplay
                class="distance"
                value={this.props.legListData.legData.distance}
                displayUnit={UnitType.NMILE}
                formatter={NumberFormatter.create({ maxDigits: 3, precision: 0.1, nanString: '' })}
              />
            </div>
            <div class="bottom-row">
              <div class="leg-name">{this.props.legListData.legData.leg.name}</div>
              <div class={{ 'pattern-icon': true, hidden: this.patternIconText.map((text) => text === null) }}>{this.patternIconText}</div>
            </div>
          </SectionOutline>
        </div>
        <div class="right-box">
          <div class={this.classListControllerOption}>
            <div class={{
              'cross-items': true,
              hidden: this.props.selectedLogControllerOption.map(
                option => option !== LogControllerOptions.Cross),
            }}>
              <div class="top-row">
                <div class="speed">
                  {this.props.legListData.legData.speedUnit.map((x) => x)}
                </div>
                <div class={{ 't-comp': true, 'hidden': this.legData.isAltitudeTempCompensated.map((x) => !x) }}>
                  TComp
                </div>
                <DurationDisplay
                  class={this.upperTimeClassList}
                  value={this.props.legListData.legData.estimatedTimeEnrouteCumulative}
                  options={{
                    delim: DurationDisplayDelim.ColonOrCross,
                    format: DurationDisplayFormat.hh_mm,
                    nanString: '',
                  }}
                />
              </div>
              <div class="bottom-row">
                <div class={{ 'constraint-line': true, 'bottom': true, 'hidden': this.props.legListData.legData.altDescDisplay.map((type) => type === AltitudeRestrictionType.AtOrBelow || type === AltitudeRestrictionType.Unused) }} />
                <div class={{ 'altitude-lower': true, 'constraint': this.isConstraintActive }}>
                  {this.bottomConstraintText}
                </div>
                <div class={{ 'constraint-line': true, 'middle': true, 'hidden': this.props.legListData.legData.altDescDisplay.map((type) => type === AltitudeRestrictionType.AtOrAbove || type === AltitudeRestrictionType.Between || type === AltitudeRestrictionType.Unused) }} />
                <div class={{ 'altitude-upper': true, 'constraint': this.isConstraintActive }}>
                  {this.topConstraintText}
                </div>
                <div class={{ 'constraint-line': true, 'top': true, 'hidden': this.props.legListData.legData.altDescDisplay.map((type) => type !== AltitudeRestrictionType.Between) }} />
                <div class="angle">
                  {this.props.legListData.legData.fpa.map((x) => isNaN(x) ? '' : x.toFixed(2))}
                </div>
                <div class={{ 'speed-constraint-line': true, 'hidden': this.props.legListData.legData.speedDesc.map((type) => type === SpeedRestrictionType.Unused) }} />
                <div class={{ 'speed': true, 'constraint': this.props.legListData.legData.speedDesc.map((type) => type !== SpeedRestrictionType.Unused) }}>
                  {this.props.legListData.legData.speed.map((spd) => {
                    if (isNaN(spd)) { return '---'; }
                    if (spd < 1) { return spd.toFixed(2).substring(1); }
                    return spd;
                  })}
                </div>
                <TimeDisplay
                  suffixFormatter={() => ''}
                  class="time"
                  localOffset={0}
                  time={this.props.legListData.legData.estimatedTimeOfArrival}
                  format={TimeDisplayFormat.UTC}
                />
              </div>
            </div>
            <div class={{
              'wind-temp-isa-items': true,
              'hidden': true,
              // hidden: this.props.selectedLogControllerOption.map(
              //   option => option !== LogControllerOptions.WindTempIsa),
            }}>
              <div class="top-row"></div>
              <div class="bottom-row">
                {/* TODO */}
                <NumberDisplay
                  class="wind"
                  value={this.props.legListData.legData.wind}
                  displayUnit={UnitType.FOOT}
                  formatter={NumberFormatter.create({ precision: 1, nanString: 'wind' })}
                />
                {/* TODO */}
                <NumberDisplay
                  class="temperature"
                  value={this.props.legListData.legData.temperature}
                  displayUnit={UnitType.CELSIUS}
                  formatter={NumberFormatter.create({ precision: 1, nanString: 'temp' })}
                />
                {/* TODO */}
                <NumberDisplay
                  class="deviation"
                  value={this.props.legListData.legData.isa}
                  displayUnit={UnitType.DEGREE}
                  formatter={NumberFormatter.create({ precision: 1, nanString: 'dev' })}
                />
              </div>
            </div>
            <div class={{
              'spd-dist-time-items': true,
              hidden: this.props.selectedLogControllerOption.map(
                option => option !== LogControllerOptions.SpdDistTime),
            }}>
              <div class="top-row"></div>
              <div class="bottom-row">
                <div class="ground-speed">
                  {this.props.legListData.legData.speed.map(speed => isNaN(speed) ? '' : speed.toFixed())}
                </div>
                <NumberDisplay
                  class="distance-to-go"
                  value={this.props.legListData.legData.distanceCumulative}
                  displayUnit={UnitType.NMILE}
                  formatter={NumberFormatter.create({ maxDigits: 3, precision: 0.1, nanString: '' })}
                />
                <DurationDisplay
                  class="time-ete"
                  value={this.props.legListData.legData.estimatedTimeEnrouteCumulative}
                  options={{
                    delim: DurationDisplayDelim.ColonOrCross,
                    format: DurationDisplayFormat.hh_mm,
                    nanString: '',
                  }}
                />
              </div>
            </div>
            <div class={{
              'fuel-wt-items': true,
              hidden: this.props.selectedLogControllerOption.map(
                option => option !== LogControllerOptions.FuelWt),
            }}>
              <div class="top-row"></div>
              <div class="bottom-row">
                <div class="rem">
                  {this.props.legListData.legData.fuelRemaining.map(FORMAT_WEIGHT)}
                </div>
                <div class="gross">
                  {this.props.legListData.legData.grossWeight.map(FORMAT_WEIGHT)}
                </div>
              </div>
            </div>
            <div class={{
              'lat-lon-items': true,
              hidden: this.props.selectedLogControllerOption.map(
                option => option !== LogControllerOptions.LatLon),
            }}>
              <div class="top-row"></div>
              <div class="bottom-row">
                <LatLonDisplay
                  class='lat-lon-display'
                  minFracDigits={1}
                  location={this.props.legListData.legData.latLon}
                />
              </div>
            </div>
            <div class={{
              'route-items': true,
              hidden: this.props.selectedLogControllerOption.map(
                option => option !== LogControllerOptions.Route),
            }}>
              <div class="top-row">
                <div class="icao">
                  {this.icaoText}
                </div>
                <div class="sid">
                  {this.props.legListData.legData.isInDepartureSegment && 'SID'}
                  {this.props.legListData.legData.isInArrivalSegment && 'STAR'}
                  {this.props.legListData.legData.isInApproachSegment && 'APPR'}
                </div>
              </div>
              <div class="bottom-row">
                <div class="airway-name">
                  {this.props.legListData.legData.segmentData?.segment.airway ?? ''}
                </div>
                <div class="airway">
                  {this.props.legListData.legData.isInAirwaySegment.get() ? 'Airway' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.listItemRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });
    this.airwaySubs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}
