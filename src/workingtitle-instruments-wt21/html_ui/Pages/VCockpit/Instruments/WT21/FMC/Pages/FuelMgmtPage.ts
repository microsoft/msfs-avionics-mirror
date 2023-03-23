import {
  ClockEvents, EngineEvents, GNSSEvents, ICAO, GeoPoint, Subject, UnitType, DurationFormatter,
  Facility, FlightPlannerEvents, FlightPlanCopiedEvent
} from '@microsoft/msfs-sdk';

import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { FmcSelectKeysEvent } from '../FmcEvent';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { DisplayField } from '../Framework/Components/DisplayField';
import { ConvertableNumberAndUnitFormat, Formatter, NumberAndUnitFormat, SimpleStringFormat, StringInputFormat } from '../Framework/FmcFormats';
import { Binding, DataInterface } from '../Framework/FmcDataBinding';
import { DefaultsUserSettings } from '../../Shared/Profiles/DefaultsUserSettings';
import { TextInputField } from '../Framework/Components/TextInputField';
import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { WT21UnitsUtils } from '../../Shared/WT21UnitsUtils';


/** FMC format for fuel flow */
class TotalFuelFlowFormat implements Formatter<number> {
  private isMetric = WT21UnitsUtils.getIsMetric();
  nullValueString = '---';

  /** @inheritdoc */
  format(ff: number): string {
    return (this.isMetric) ? `${(Math.floor(ff / 10) * 10 / 2.205).toFixed(0).padEnd(4, ' ')} KG HR[s-text]` : `${(Math.floor(ff / 10) * 10).toFixed(0).padEnd(4, ' ')} LB HR[s-text]`;
  }
}

/** FMC format for ground speed */
class GroundSpeedFormat implements Formatter<number> {
  nullValueString = '---';

  /** @inheritdoc */
  format(gs: number): string {
    return `${gs.toFixed(0).padEnd(4, ' ')} KT[s-text]`;
  }
}

/** FMC format for time duration */
class DurationFormat implements Formatter<number> {
  private readonly DURATION_FORMATTER = DurationFormatter.create('{h}:{mm}', UnitType.MINUTE, 0, '--:--');
  nullValueString = '-:--';

  /** @inheritdoc */
  format(time: number): string {
    return (time > 0 && time !== Infinity) ? this.DURATION_FORMATTER(time) : this.nullValueString;
  }
}

/**
 * Fuel Management Page 1
 */
export class FuelMgmtPage extends FmcPage {

  private readonly perfMenuLink = PageLinkField.createLink(this, 'PERF MENU>', '/perf-menu');

  private readonly engEventsSub = this.eventBus.getSubscriber<EngineEvents>();
  private readonly clockEventsSub = this.eventBus.getSubscriber<ClockEvents>();
  private readonly gnssEventsSub = this.eventBus.getSubscriber<GNSSEvents>();

  private planOrigin: string | undefined;
  private readonly flightPlanCopiedConsumer = this.eventBus.getSubscriber<FlightPlannerEvents>().on('fplCopied');

  private readonly ffLeftConsumer = this.engEventsSub.on('fuel_flow_1').atFrequency(1);
  private readonly ffRightConsumer = this.engEventsSub.on('fuel_flow_2').atFrequency(1);
  private readonly ffTotalConsumer = this.engEventsSub.on('fuel_flow_total').atFrequency(1);
  private readonly fuelQtyTotalConsumer = this.engEventsSub.on('fuel_total').whenChangedBy(1);
  private readonly fuelQtyLeftConsumer = this.engEventsSub.on('fuel_left').whenChangedBy(1);
  private readonly fuelQtyRightConsumer = this.engEventsSub.on('fuel_right').whenChangedBy(1);
  private readonly fuelQtyLeftSubject = Subject.create(0);
  private readonly fuelQtyRightSubject = Subject.create(0);

  private readonly gsConsumer = this.gnssEventsSub.on('ground_speed').whenChanged();

  private readonly ffLeftSubject = Subject.create(0);
  private readonly ffRightSubject = Subject.create(0);
  private readonly ffTotalSubject = Subject.create(0);
  private readonly fuelQtySubject = Subject.create(0);

  private readonly currentGSSubject = Subject.create<number | null>(null);
  private readonly perfTripGSSubject = Subject.create<number>(250);

  private readonly defaultsSettings = DefaultsUserSettings.getManager(this.eventBus);

  private readonly timeToReserveSubject = Subject.create<number | null>(null);
  private readonly rangeToReserveSubject = Subject.create<number | null>(null);
  private readonly specificRangeSubject = Subject.create<number | null>(null);

  private readonly fuelUnit = WT21UnitsUtils.getIsMetric() ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);

  private readonly fuelQtyField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0 }),
  }).bind(this.fuelQtySubject);

  private readonly reserveFuelInput = new TextInputField(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, maxValue: 5828 }),
    onDelete: async (): Promise<string | boolean> => { this.resetReserveFuel(); return true; }
  }).bind(this.fms.performancePlanProxy.reserveFuel);

  private readonly ffLeftField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: false }),
  }).bind(this.ffLeftSubject);

  private readonly ffRightField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: false }),
  }).bind(this.ffRightSubject);

  private readonly fuelFlowTotalField = new DisplayField<number>(this, {
    formatter: new TotalFuelFlowFormat(),
  }).bind(this.ffTotalSubject);

  private readonly ffTotal2Field = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: false }),
  }).bind(this.ffTotalSubject);

  private readonly fuelUsedLeftField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: false }),
  }).bind(this.baseInstrument.flightLogger.fuelUsedLeft);

  private readonly fuelUsedRightField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: false }),
  }).bind(this.baseInstrument.flightLogger.fuelUsedRight);

  private readonly fuelUsedTotalField = new DisplayField<number>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0, showUnit: false }),
  }).bind(this.baseInstrument.flightLogger.fuelUsedTotal);

  private readonly timeToReserveField = new DisplayField<number | null>(this, {
    formatter: new DurationFormat(),
  }).bind(this.timeToReserveSubject);

  private readonly rangeToReserveField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat('NM', { padStart: 4, minValue: 0, maxValue: 10000, precision: 0, spaceBetween: false }),
  }).bind(this.rangeToReserveSubject);

  private readonly specificRangeField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat(`${WT21UnitsUtils.getIsMetric() ? 'NM/KG' : 'NM/LB'}`, { padStart: 4, minValue: 0, maxValue: 10.0, precision: 2, spaceBetween: false }),
  }).bind(this.specificRangeSubject);

  private readonly groundSpeedField = new DisplayField<number | null>(this, {
    formatter: new GroundSpeedFormat(),
  }).bind(this.currentGSSubject);

  private readonly perfTripGroundSpeedField = new DisplayField<number | null>(this, {
    formatter: new GroundSpeedFormat(),
  }).bind(this.perfTripGSSubject);

  private readonly FmsPposField = new DisplayField<string | null>(this, {
    formatter: new SimpleStringFormat('PPOS>'),
    onSelected: async (): Promise<string | boolean> => {
      this.setTripPerfPpos();
      return true;
    }
  });

  private readonly perfTripClearField = new DisplayField<string | null>(this, {
    formatter: new SimpleStringFormat('<CLEAR'),
    onSelected: async (): Promise<string | boolean> => {
      this.onTripPerfClear();
      return true;
    }
  });

  // PERF TRIP

  private readonly fromWptField = new TextInputField<string | null>(this, {
    formatter: new StringInputFormat({ nullValueString: '-----', maxLength: 5 }),
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {

        const fromWaypoint = this.fromWaypoint.get();

        if (fromWaypoint !== null) {
          return fromWaypoint;
        }
        const plan = this.fms.getPlanForFmcRender();

        if (plan.originAirport) {
          return ICAO.getIdent(plan.originAirport);
        }
      }
      return false;
    },
    deleteAllowed: true,
    clearScratchpadOnSelectedHandled: false,
  });

  private readonly toWptField = new TextInputField<string | null>(this, {
    formatter: new StringInputFormat({ nullValueString: '-----', maxLength: 5 }),
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {

        const toWaypoint = this.toWaypoint.get();

        if (toWaypoint !== null) {
          return toWaypoint;
        }

        const plan = this.fms.getPlanForFmcRender();

        if (plan.destinationAirport) {
          return ICAO.getIdent(plan.destinationAirport);
        }
      }
      return false;
    },
    deleteAllowed: true,
    clearScratchpadOnSelectedHandled: false,
  });

  private readonly distField = new TextInputField<number | null>(this, {
    formatter: new NumberAndUnitFormat('NM', { padStart: 4, minValue: 0, maxValue: 9999, precision: 0, spaceBetween: true }),
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length > 0) {
        if (parseInt(scratchpadContents) > 0 && parseInt(scratchpadContents) < 9999) {
          return false;
        }
      }
      return Promise.reject('INVALID DISTANCE');
    },
    deleteAllowed: false,
    clearScratchpadOnSelectedHandled: false,
  });

  private readonly fromWaypoint = Subject.create<string | null>(null);
  private readonly fromFacility = Subject.create<Facility | undefined>(undefined);
  private readonly toWaypoint = Subject.create<string | null>(null);
  private readonly toFacility = Subject.create<Facility | undefined>(undefined);
  private readonly perfTripDistance = Subject.create<number | null>(null);
  private readonly perfTripInPposMode = Subject.create<boolean>(false);
  private readonly presentPos = new GeoPoint(0, 0);
  private readonly perfTripInDistanceMode = Subject.create<boolean>(false);
  private readonly perfTripEteSubject = Subject.create<number | null>(null);
  private readonly perfTripFuelReqSubject = Subject.create<number | null>(null);

  private readonly perfTripEteField = new DisplayField<number | null>(this, {
    formatter: new DurationFormat(),
  }).bind(this.perfTripEteSubject);

  private readonly perfTripFuelReqField = new DisplayField<number | null>(this, {
    formatter: new ConvertableNumberAndUnitFormat(UnitType.POUND, UnitType.KILOGRAM, { padStart: 4, minValue: 0 }),
  }).bind(this.perfTripFuelReqSubject);

  /**
   * On Resume Method
   */
  protected onResume(): void {
    super.onResume();
    if (this.fromWaypoint.get() === null || this.toWaypoint.get() === null) {
      this.trySetOriginDestination();
    }
  }

  /**
   * Method to clear TRIP PERF inputs.
   */
  private onTripPerfClear(): void {
    this.perfTripInDistanceMode.set(false);
    this.perfTripInPposMode.set(false);
    this.toFacility.set(undefined);
    this.toWaypoint.set(null);
    this.fromFacility.set(undefined);
    this.fromWaypoint.set(null);
    this.trySetOriginDestination();
  }

  /**
   * Method to set PPOS and PPOS mode for TRIP PERF.
   */
  private setTripPerfPpos(): void {
    this.perfTripInPposMode.set(true);
    this.presentPos.set(this.fms.ppos.lat, this.fms.ppos.lon);
    this.fromWaypoint.set('PPOS');
    this.fromFacility.set(undefined);
    this.calcPerfTrip();
  }

  /**
   * Attempts to set the flight plan origin and destination in TRIP PERF.
   */
  private trySetOriginDestination(): void {
    if (this.fms.facilityInfo.originFacility !== undefined) {
      this.fromFacility.set(this.fms.facilityInfo.originFacility);
      this.fromWaypoint.set(ICAO.getIdent(this.fms.facilityInfo.originFacility.icao));
    }
    if (this.fms.facilityInfo.destinationFacility !== undefined) {
      this.perfTripInDistanceMode.set(false);
      this.toFacility.set(this.fms.facilityInfo.destinationFacility);
      this.toWaypoint.set(ICAO.getIdent(this.fms.facilityInfo.destinationFacility.icao));
    }
    this.calcPerfTrip();
  }

  /**
   * Sets the from or to facility in TRIP PERF.
   * @param isTo Whether this is the to facility.
   * @param ident The ident to set as the facility.
   * @returns Whether setting the facility was successful.
   */
  private async setFacility(isTo: boolean, ident: string): Promise<boolean> {

    if (ident !== null && ident.length > 0) {

      const facility = await this.pageManager.selectWptFromIdent(ident, this.fms.ppos);

      if (facility !== null) {
        if (isTo) {
          this.perfTripInDistanceMode.set(false);
          this.toFacility.set(facility);
          this.toWaypoint.set(ident);
          this.calcPerfTrip();
          return Promise.resolve(true);
        } else {
          this.perfTripInPposMode.set(false);
          this.fromFacility.set(facility);
          this.fromWaypoint.set(ident);
          this.calcPerfTrip();
          return Promise.resolve(true);
        }
      }
    }

    this.showScratchpadError('FACILITY NOT FOUND');
    return Promise.resolve(false);
  }

  /**
   * Sets the TRIP PERF manual distance.
   * @param distance The distance, in NM, or null.
   * @returns The promise.
   */
  private setPerfTripDistance(distance: number | null): Promise<void> {
    if (distance) {
      this.perfTripInDistanceMode.set(true);
      this.perfTripDistance.set(distance);
      this.toFacility.set(undefined);
      this.toWaypoint.set(null);
      this.calcPerfTrip();
    }

    return Promise.resolve();
  }

  /**
   * Calculates the TRIP PERF values.
   */
  private calcPerfTrip(): void {
    if (this.perfTripInDistanceMode.get() === false) {
      const toFacility = this.toFacility.get();
      if (this.perfTripInPposMode.get() === true && toFacility !== undefined) {
        const pposDistance = UnitType.GA_RADIAN.convertTo(this.presentPos.distance(toFacility.lat, toFacility.lon), UnitType.NMILE);
        this.perfTripDistance.set(pposDistance);
      } else {
        this.perfTripDistance.set(this.getDistance());
      }
    }

    const distance = this.perfTripDistance.get();
    const gs = this.perfTripGSSubject.get();

    if (distance !== null && gs > 40) {
      const hours = distance / gs;
      const flow = this.ffTotalSubject.get();

      this.perfTripEteSubject.set(60 * hours);
      this.perfTripFuelReqSubject.set(flow * hours);
    }
  }

  /**
   * A method for getting the distance between two points in Nautical Miles.
   * @returns the distance in NM.
   */
  private getDistance(): number {
    const from = this.fromFacility.get();
    const to = this.toFacility.get();
    let distance = 0;
    if (from !== undefined && to !== undefined) {
      const fromGeoPoint = new GeoPoint(from.lat, from.lon);
      distance = UnitType.GA_RADIAN.convertTo(fromGeoPoint.distance(to.lat, to.lon), UnitType.NMILE);
    }
    return distance;
  }

  /**
   * A method for converting a number to the tens precision.
   * @param value The passed value
   * @returns The value but to the tens precision
   */
  private getTensPrecision(value: number): number {
    return (Math.floor(value / 10) * 10);
  }

  /** @inheritdoc */
  protected onInit(): void {
    // fuel flow
    this.addBinding(new Binding(this.ffLeftConsumer, (v: number) => {
      this.ffLeftSubject.set(this.getTensPrecision(UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND)));
    }));

    this.addBinding(new Binding(this.ffRightConsumer, (v: number) => {
      this.ffRightSubject.set(this.getTensPrecision(UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND)));
    }));

    this.addBinding(new Binding(this.ffTotalConsumer, (v: number) => {
      this.ffTotalSubject.set(this.getTensPrecision(UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND)));
    }));

    this.addBinding(new Binding(this.fuelQtyTotalConsumer, (v: number) => {
      this.fuelQtySubject.set(this.getTensPrecision(UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND)));
    }));

    this.addBinding(this.clockEventsSub.on('simTime').atFrequency(1).handle(this.computeValues.bind(this)));

    this.addBinding(new Binding(this.gsConsumer, (v: number) => {
      this.currentGSSubject.set(v > 0 ? v : null);
      this.perfTripGSSubject.set(Math.max(250, v));

    }));

    this.addBinding(new Binding(this.fuelQtyLeftConsumer, (v: number) => {
      this.fuelQtyLeftSubject.set(this.getTensPrecision(UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND)));
    }));
    this.addBinding(new Binding(this.fuelQtyRightConsumer, (v: number) => {
      this.fuelQtyRightSubject.set(this.getTensPrecision(UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND)));
    }));

    // Input Data
    this.toWptField.bindSource(new DataInterface(this.toWaypoint, (v) => this.setFacility(true, v)));
    this.fromWptField.bindSource(new DataInterface(this.fromWaypoint, (v) => this.setFacility(false, v)));
    this.distField.bindSource(new DataInterface(this.perfTripDistance, (v) => this.setPerfTripDistance(v)));

    // reserves
    // this.resetReserveFuel();

    // new flight plan
    this.addBinding(new Binding(this.flightPlanCopiedConsumer, (evt: FlightPlanCopiedEvent) => {
      if (evt.targetPlanIndex === WT21Fms.PRIMARY_ACT_PLAN_INDEX) {
        // HINT: Debounce because we can't be sure the FMS received the facility information before us
        setTimeout(() => {
          const plan = this.fms.getPrimaryFlightPlan();
          if (this.planOrigin !== plan.originAirport) {
            this.planOrigin = plan.originAirport;
          }
          if (this.perfTripInPposMode.get() === false) {
            this.trySetOriginDestination();
          }
        }, 100);
      }
    }));
  }

  /**
   * Computes and updates the fuel based calcs.
   */
  private computeValues(): void {
    const reserveFuel = this.fms.performancePlanProxy.reserveFuel.get() ?? 0;

    const fuelToReserve = this.fms.basePerformanceManager.sensedFuelWeight.get() - reserveFuel;

    const timeToReserve = 60 * (fuelToReserve / this.ffTotalSubject.get());
    this.timeToReserveSubject.set(timeToReserve);

    const gs = this.perfTripGSSubject.get() ?? 0;
    const rangeToReserve = (timeToReserve / 60) * gs;
    this.rangeToReserveSubject.set(rangeToReserve);

    const fuelFlowTotal = WT21UnitsUtils.getIsMetric() ? UnitType.POUND.convertTo(this.ffTotalSubject.get(), UnitType.KILOGRAM) : this.ffTotalSubject.get();

    const specificRange = ((1 / fuelFlowTotal) * gs);
    this.specificRangeSubject.set(specificRange);
  }

  /**
   * Resets the reserve fuel setting to the value from defaults.
   */
  private resetReserveFuel(): void {
    this.fms.performancePlanProxy.reserveFuel.set(this.defaultsSettings.getSetting('reserveFuel').value);
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', this.PagingIndicator, 'FUEL MGMT[blue]'],
        [' FUEL[blue]', 'TIME TO RESV [blue]'],
        [this.fuelQtyField, this.timeToReserveField],
        [' FUEL FLOW[blue]', 'RNG TO RESV [blue]'],
        [this.fuelFlowTotalField, this.rangeToReserveField],
        [' RESERVES[blue]', 'SP RNG GS [blue]'],
        [this.reserveFuelInput, this.specificRangeField],
        [' GND SPD[blue]', ''],
        [this.groundSpeedField, ''],
        ['', ''],
        ['', ''],
        ['', '', '------------------------[blue]'],
        ['', this.perfMenuLink]
      ],
      [
        ['', this.PagingIndicator, 'FUEL MGMT[blue]'],
        [' ENGINE[blue]', 'FLOW-FUEL-USED [blue]'],
        ['', `${this.fuelUnit} `, `${this.fuelUnit}/HR `],
        ['   1', this.fuelUsedLeftField, this.ffLeftField],
        ['   2', this.fuelUsedRightField, this.ffRightField],
        [' TOTAL', this.fuelUsedTotalField, this.ffTotal2Field],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', '------------------------[blue]'],
        ['', this.perfMenuLink]
      ],
      [
        ['', this.PagingIndicator, 'PERF TRIP[blue]'],
        [' FROM[blue]', ''],
        [this.fromWptField, this.FmsPposField],
        [' TO[blue]', ''],
        [this.toWptField, ''],
        [' DIST[blue]', '', ''],
        [this.distField, ''],
        [' GND SPD[blue]', 'FUEL FLOW [blue]'],
        [this.perfTripGroundSpeedField, this.fuelFlowTotalField],
        [' ETE[blue]', 'FUEL REQ [blue]'],
        [this.perfTripEteField, this.perfTripFuelReqField],
        ['', '', '------------------------[blue]'],
        [this.perfTripClearField, this.perfMenuLink]
      ]
    ];
  }

  /** @inheritDoc */
  public async handleSelectKey(event: FmcSelectKeysEvent): Promise<string | boolean> {

    if (event === FmcSelectKeysEvent.RSK_6) {
      this.router.activeRouteSubject.set('/perf-menu');
      return true;
    }


    return false;
  }


}
