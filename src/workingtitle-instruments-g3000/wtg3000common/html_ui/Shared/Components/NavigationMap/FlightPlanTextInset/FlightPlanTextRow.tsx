import {
  AirportFacility, AltitudeRestrictionType, ApproachProcedure, BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps,
  DisplayComponent, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, EventBus,
  FSComponent, FlightPlanSegmentType, LegType, MappedSubject, NumberFormatter, NumberUnitSubject, SetSubject,
  Subject, Subscribable, Subscription, UnitType, UserSettingManager, VNode,
} from '@microsoft/msfs-sdk';

import {
  ApproachNameDisplay, BearingDisplay, DateTimeFormatSettingMode, DateTimeUserSettingTypes, FmsUtils, NumberUnitDisplay,
  TimeDisplay, TimeDisplayFormat, UnitsUserSettingManager,
} from '@microsoft/msfs-garminsdk';

import { FlightPlanLegListData } from '../../../FlightPlan/FlightPlanLegListData';
import { FlightPlanSegmentListData } from '../../../FlightPlan/FlightPlanSegmentListData';
import { FlightPlanStore } from '../../../FlightPlan/FlightPlanStore';
import { FlightPlanTextData, FlightPlanTextRowData } from '../../../FlightPlan/FlightPlanTextUpdater';
import { AltitudeConstraintDisplay } from '../../Constraints/AltitudeConstraintDisplay';
import { LegNameDisplay } from '../../Leg/LegNameDisplay';

import './FlightPlanTextRow.css';

/**
 * The properties for the {@link FlightPlanTextRow} component.
 */
export interface FlightPlanTextRowProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The row index. */
  index: number;
  /** The units settings manager. */
  unitsSettingManager: UnitsUserSettingManager;
  /** The date time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;
  /** The flight plan text data. */
  data: Subscribable<FlightPlanTextData | undefined>;
  /** The selected row. */
  selectedRow: Subscribable<FlightPlanTextRowData | undefined>;
  /** The flight plan store. */
  store: FlightPlanStore;
  /** Whether to use cumulative distance or not. */
  mapInsetTextCumulativeSetting: Subscribable<boolean>;
}

const DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '____' });
const BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
const FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });
const DATE_TIME_FORMAT_SETTING_MAP = {
  [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
  [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
  [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
};

/**
 * A single row in a flight plan text panel. Displays information on a single flight plan leg or a header describing a
 * flight plan segment.
 */
export class FlightPlanTextRow extends DisplayComponent<FlightPlanTextRowProps> {
  private readonly rowData = this.props.data.map(x => x?.rows[this.props.index]);

  private readonly isSelected = MappedSubject.create(([rowData, selectedRow]) => {
    return rowData && rowData === selectedRow;
  }, this.rowData, this.props.selectedRow);

  private readonly name = Subject.create('');

  // Segment
  private readonly segmentListData = Subject.create<FlightPlanSegmentListData | undefined>(undefined);
  private readonly segmentListDataPipes = [] as Subscription[];

  // Approach
  private readonly approach = Subject.create<ApproachProcedure | undefined>(undefined);
  private readonly approachAirport = Subject.create<AirportFacility | undefined>(undefined);
  private readonly approachPrefix = Subject.create('');

  // Leg
  private readonly legListData = Subject.create<FlightPlanLegListData | undefined>(undefined);
  private readonly legDefinition = this.legListData.map(x => x?.legData.leg);
  private readonly isAirwayLeg = Subject.create(false);
  private readonly isActiveLeg = Subject.create(false);
  private readonly isHeadingLeg = this.legListData.map(x => !!x?.legData.isHeadingLeg);
  private readonly isHoldLeg = this.legListData.map(x => !!x?.legData.isHoldLeg);
  private readonly isHoldTimeLeg = this.legListData.map(x => !!(x?.legData.isHoldLeg && x.legData.leg.leg.distanceMinutes));
  private readonly isFirstLegInPlan = Subject.create(false);
  private readonly isDmeArcLeg = this.legListData.map(x => x?.legData.leg.leg.type === LegType.AF);
  private readonly fuelRemaining = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN));
  private readonly estimatedTimeEnroute = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  private readonly estimatedTimeEnrouteCumulative = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  private readonly eteFinal = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  private readonly estimatedTimeOfArrival = Subject.create(NaN);
  private readonly airwayExitText = Subject.create('');

  private readonly legListDataPipes = [] as Subscription[];

  // Leg altitude
  private readonly isAltitudeCyan = Subject.create(false);
  private readonly altDescDisplay = Subject.create(AltitudeRestrictionType.Unused);
  private readonly isAltitudeEditedDisplay = Subject.create(false);
  private readonly isAltitudeInvalidDisplay = Subject.create(false);
  private readonly altitude1Display = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly altitude2Display = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly displayAltitude1AsFlightLevelDisplay = Subject.create(false);
  private readonly displayAltitude2AsFlightLevelDisplay = Subject.create(false);
  private readonly isAltitudeVisible = Subject.create(false);
  private readonly legSuffix = Subject.create('');

  // Leg data fields
  private readonly displayDtk = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  private readonly dtkString = Subject.create('');
  private readonly distanceString = Subject.create('');
  private readonly displayDistance = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly distanceCumulative = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly distanceFinal = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly cumulativePipes = [] as Subscription[];

  private readonly timeFormat = this.props.dateTimeSettingManager.getSetting('dateTimeFormat').map(setting => {
    return DATE_TIME_FORMAT_SETTING_MAP[setting] ?? TimeDisplayFormat.UTC;
  });

  private readonly classList = SetSubject.create(['flight-plan-text-row']);

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.props.data.sub(data => {
      const row = data?.rows[this.props.index];

      this.legListData.set(row?.type === 'leg' ? row : undefined);
      this.segmentListData.set(row?.type === 'segment' ? row : undefined);

      const isApproach = row?.type === 'segment' && row.segmentData.segment.segmentType === FlightPlanSegmentType.Approach;

      this.classList.toggle('leg', row?.type === 'leg');
      this.classList.toggle('segment', row?.type === 'segment' && !isApproach);
      this.classList.toggle('approach', isApproach);
      this.classList.toggle('selected', !!(row && row === this.props.selectedRow.get()));
      this.classList.toggle('direct-to-random-leg', row?.type === 'leg' && row.legData.isDirectToRandom);
      this.classList.toggle('hidden', !row);
    }, true));

    this.segmentListData.sub(segmentListData => {
      this.segmentListDataPipes.forEach(x => x.destroy());
      this.segmentListDataPipes.length = 0;

      if (segmentListData) {
        const segment = segmentListData.segmentData.segment;

        if (segment.segmentType === FlightPlanSegmentType.Departure) {
          this.segmentListDataPipes.push(this.props.store.departureTextOneLine.pipe(this.name));
        } else if (segment.segmentType === FlightPlanSegmentType.Arrival) {
          this.segmentListDataPipes.push(this.props.store.arrivalStringFull.pipe(this.name));
        } else if (segment.segmentType === FlightPlanSegmentType.Destination) {
          this.segmentListDataPipes.push(this.props.store.destinationString.pipe(this.name));
        } else if (segment.segmentType === FlightPlanSegmentType.Approach) {
          this.segmentListDataPipes.push(this.props.store.approachProcedure.pipe(this.approach));
          this.segmentListDataPipes.push(this.props.store.destinationFacility.pipe(this.approachAirport));
          this.segmentListDataPipes.push(this.props.store.approachStringPrefix.pipe(this.approachPrefix));
        } else if (segment.airway !== undefined) {
          this.segmentListDataPipes.push(segmentListData.airwayText.pipe(this.name));
        } else {
          this.name.set('Enroute');
        }
      } else {
        this.resetSegmentData();
      }
    }, true);

    this.legListData.sub(legListData => {
      this.legListDataPipes.forEach(x => x.destroy());
      this.legListDataPipes.length = 0;

      if (legListData) {
        const leg = legListData.legData.leg;
        this.legListDataPipes.push(legListData.legData.isInAirwaySegment.pipe(this.isAirwayLeg));
        this.legListDataPipes.push(legListData.legData.isActiveLeg.pipe(this.isActiveLeg));
        this.legListDataPipes.push(legListData.legData.isAltitudeCyan.pipe(this.isAltitudeCyan));
        this.legListDataPipes.push(legListData.legData.altDescDisplay.pipe(this.altDescDisplay));
        this.legListDataPipes.push(legListData.legData.isAltitudeEditedDisplay.pipe(this.isAltitudeEditedDisplay));
        this.legListDataPipes.push(legListData.legData.isAltitudeInvalidDisplay.pipe(this.isAltitudeInvalidDisplay));
        this.legListDataPipes.push(legListData.legData.altitude1Display.pipe(this.altitude1Display));
        this.legListDataPipes.push(legListData.legData.altitude2Display.pipe(this.altitude2Display));
        this.legListDataPipes.push(legListData.legData.displayAltitude1AsFlightLevelDisplay.pipe(this.displayAltitude1AsFlightLevelDisplay));
        this.legListDataPipes.push(legListData.legData.displayAltitude2AsFlightLevelDisplay.pipe(this.displayAltitude2AsFlightLevelDisplay));
        this.legListDataPipes.push(legListData.legData.isAltitudeVisible.pipe(this.isAltitudeVisible));
        this.legListDataPipes.push(legListData.legData.fuelRemaining.pipe(this.fuelRemaining));
        this.legListDataPipes.push(legListData.displayEte.pipe(this.estimatedTimeEnroute));
        this.legListDataPipes.push(legListData.legData.estimatedTimeEnrouteCumulative.pipe(this.estimatedTimeEnrouteCumulative));
        this.legListDataPipes.push(legListData.legData.estimatedTimeOfArrival.pipe(this.estimatedTimeOfArrival));
        this.legListDataPipes.push(legListData.airwayExitText.pipe(this.airwayExitText));
        this.legListDataPipes.push(legListData.airwayExitText.pipe(this.name));
        this.legListDataPipes.push(legListData.legData.isFirstLegInPlan.pipe(this.isFirstLegInPlan));
        this.legSuffix.set(FmsUtils.getSequenceLegFixTypeSuffix(legListData.legData.leg, false));

        // DTK
        if (legListData.legData.isHeadingLeg) {
          this.legListDataPipes.push(legListData.legData.isBehindActiveLeg.sub(isBehind => {
            if (isBehind) {
              this.displayDtk.set(NaN);
            } else {
              this.displayDtk.set(legListData.legData.courseRounded);
            }
          }, true));
        } else if (legListData.legData.isHoldLeg) {
          this.name.set('HOLD');
          this.legListDataPipes.push(legListData.displayDtk.pipe(this.displayDtk));
          // TODO DME ARC
          // } else if (leg.leg.type === LegType.AF) {
          //   this.name.set('DME ARC');
          //   this.dtkString.set(ICAO.getIdent(leg.leg.originIcao));
          //   // The other part is in the render method
          //   // this.superLabelAfter.set(' Arc ' + ICAO.getIdent(leg.leg.originIcao));
        } else {
          this.legListDataPipes.push(legListData.displayDtk.pipe(this.displayDtk));
        }

        // DIS
        if (legListData.legData.isHoldLeg) {
          if (leg.leg.distanceMinutes) {
            const seconds = Math.round(leg.leg.distance * 60);

            const minutesPart = Math.floor(seconds / 60);
            const secondsPart = seconds - minutesPart * 60;

            // TODO Should count up when in the hold
            this.distanceString.set(`${minutesPart.toFixed(0).padStart(2, '0')}:${secondsPart.toFixed(0).padStart(2, '0')}`);
          } else {
            this.distanceFinal.set(leg.leg.distance);
          }
        } else {
          this.legListDataPipes.push(legListData.displayDistance.pipe(this.displayDistance));
          this.legListDataPipes.push(legListData.legData.distanceCumulative.pipe(this.distanceCumulative));
        }
      } else {
        this.resetLegData();
      }
    }, true);

    this.isAirwayLeg.sub(isAirwayLeg => {
      this.classList.toggle('airway-leg', isAirwayLeg);
    }, true);

    this.isActiveLeg.sub(isActive => {
      this.classList.toggle('active-leg', isActive);
    }, true);

    this.isHeadingLeg.sub(isHeadingLeg => {
      this.classList.toggle('hdg', isHeadingLeg);
    }, true);

    this.isHoldLeg.sub(isHoldLeg => {
      this.classList.toggle('hold', isHoldLeg);
    }, true);

    this.isHoldTimeLeg.sub(isHoldTimeLeg => {
      this.classList.toggle('hold-time', isHoldTimeLeg);
    }, true);

    this.isFirstLegInPlan.sub(isFirstLegInPlan => {
      this.classList.toggle('first-leg', isFirstLegInPlan);
    }, true);

    this.isDmeArcLeg.sub(isDmeArcLeg => {
      this.classList.toggle('dme-arc', isDmeArcLeg);
    }, true);

    this.isAltitudeVisible.sub(isVisible => {
      this.classList.toggle('show-altitude', isVisible);
    }, true);

    this.isSelected.sub(isSelected => {
      this.classList.toggle('selected', !!isSelected);
    }, true);

    this.airwayExitText.sub(airwayExitText => {
      this.classList.toggle('use-airway-exit', !!airwayExitText);
    }, true);

    this.subs.push(this.props.mapInsetTextCumulativeSetting.sub(cumulative => {
      this.cumulativePipes.forEach(x => x.destroy());
      if (cumulative) {
        this.cumulativePipes.push(this.distanceCumulative.pipe(this.distanceFinal));
        this.cumulativePipes.push(this.estimatedTimeEnrouteCumulative.pipe(this.eteFinal));
      } else {
        this.cumulativePipes.push(this.displayDistance.pipe(this.distanceFinal));
        this.cumulativePipes.push(this.estimatedTimeEnroute.pipe(this.eteFinal));
      }
    }, true));
  }

  /**
   * Resets this row's segment data.
   */
  private resetSegmentData(): void {
    this.approach.set(undefined);
    this.approachAirport.set(undefined);
    this.approachPrefix.set('');
  }

  /**
   * Resets this row's leg data.
   */
  private resetLegData(): void {
    this.isAirwayLeg.set(false);
    this.isActiveLeg.set(false);
    this.isAltitudeCyan.set(false);
    this.altDescDisplay.set(AltitudeRestrictionType.Unused);
    this.isAltitudeEditedDisplay.set(false);
    this.isAltitudeInvalidDisplay.set(false);
    this.altitude1Display.set(NaN);
    this.altitude2Display.set(NaN);
    this.displayAltitude1AsFlightLevelDisplay.set(false);
    this.displayAltitude2AsFlightLevelDisplay.set(false);
    this.isAltitudeVisible.set(false);
    this.fuelRemaining.set(NaN);
    this.estimatedTimeEnroute.set(NaN);
    this.estimatedTimeEnrouteCumulative.set(NaN);
    this.estimatedTimeOfArrival.set(NaN);
    this.airwayExitText.set('');
    this.isFirstLegInPlan.set(false);
    this.legSuffix.set('');
    this.displayDtk.set(NaN);
    this.displayDistance.set(NaN);
    this.distanceCumulative.set(NaN);
    this.distanceString.set('');
    this.distanceFinal.set(NaN);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <div class="name">
          <span class="normal-name">{this.name}</span>
          <span class="leg-name">
            <LegNameDisplay leg={this.legDefinition} />
            <span class="leg-suffix">{this.legSuffix}</span>
          </span>
          <ApproachNameDisplay
            approach={this.approach}
            airport={this.approachAirport}
            prefix={this.approachPrefix}
          />
        </div>
        <div class="hdg data-field">hdg</div>
        <div class="dtk data-field">
          <BearingDisplay
            class="bearing-display"
            value={this.displayDtk}
            formatter={BEARING_FORMATTER}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
          />
          <span class="dtk-string">{this.dtkString}</span>
        </div>
        <div class="distance data-field">
          <NumberUnitDisplay
            class="distance-display"
            value={this.distanceFinal}
            formatter={DISTANCE_FORMATTER}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
          />
          <span class="distance-string">{this.distanceString}</span>
        </div>
        <div class="altitude data-field">
          <AltitudeConstraintDisplay
            altDesc={this.altDescDisplay}
            isEdited={this.isAltitudeEditedDisplay}
            isInvalid={this.isAltitudeInvalidDisplay}
            altitude1={this.altitude1Display}
            altitude2={this.altitude2Display}
            displayAltitude1AsFlightLevel={this.displayAltitude1AsFlightLevelDisplay}
            displayAltitude2AsFlightLevel={this.displayAltitude2AsFlightLevelDisplay}
            isCyan={this.isAltitudeCyan}
          />
        </div>
        <NumberUnitDisplay
          class="fuel data-field"
          value={this.fuelRemaining}
          formatter={FUEL_FORMATTER}
          displayUnit={this.props.unitsSettingManager.fuelUnits}
        />
        <DurationDisplay
          class="ete data-field"
          value={this.eteFinal}
          options={{
            format: DurationDisplayFormat.hh_mm_or_mm_ss,
            delim: DurationDisplayDelim.ColonOrCross,
            pad: 2,
            nanString: '__:__',
          }}
        />
        <TimeDisplay
          class="eta data-field"
          time={this.estimatedTimeOfArrival}
          format={this.timeFormat}
          localOffset={this.props.dateTimeSettingManager.getSetting('dateTimeLocalOffset')}
        />
      </div>
    );
  }

  /** Destroys subs and comps. */
  public destroy(): void {
    this.rowData.destroy();
    this.isSelected.destroy();
    this.timeFormat.destroy();

    this.subs.forEach(sub => { sub.destroy(); });
    this.segmentListDataPipes.forEach(pipe => { pipe.destroy(); });
    this.legListDataPipes.forEach(pipe => { pipe.destroy(); });
  }
}