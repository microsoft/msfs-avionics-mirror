import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FlightPlannerEvents, FSComponent, LNavDataEvents, MappedSubject, Subject, Subscribable,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { TripPlanningStore } from '../../../Stores';
import { DisplayFieldData, DisplayFieldFormat, Sr22tTPDisplayField } from '../Shared/Fields/Sr22tTPDisplayField';
import { coordinate, getLegsDistance, getWaypointCoord, getWptsDistance } from '../Shared/TripPlanningCalcs/TripPlanningCalcs';
import { FixModes } from '../../Sr22tTripPlanningModes';

import '../../Sr22tTripPlanningPage.css';

/** The properties for a Fuel Stats Panel component. */
interface FuelStatsPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The flight management system. */
  fms: Fms;
  /** The Trip Planning store. */
  store: TripPlanningStore;
}

/** Fuel Stats Panel component for the Trip Planning page. */
export class FuelStatsPanel extends DisplayComponent<FuelStatsPanelProps> {

  private subs: Subscription[] = [];

  // Mode subjects
  private inputMode = this.props.store.inputMode;
  private fixModeSubject = this.props.store.fixMode;
  private legModeSubject = this.props.store.legMode;
  private selectedLegSubject = this.props.store.selectedLeg;

  // Waypoint subjects
  private fromWpt = this.props.store.fromWpt;
  private toWpt = this.props.store.toWpt;
  private fromCoord: Subject<coordinate> = Subject.create({ lat: 0, lon: 0, });
  private toCoord: Subject<coordinate> = Subject.create({ lat: 0, lon: 0, });

  // Data output source from the store (sensor or user)
  private data = this.props.store.inputData;

  // Other data source subjects
  private flightPlanCalcSubject = ConsumerSubject.create(this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplCalculated'), null);
  private activeLegMilesRemSubject = ConsumerSubject.create(this.props.bus.getSubscriber<LNavDataEvents>().on('lnavdata_waypoint_distance').withPrecision(1), 0);  // NM


  // Calculated subjects

  private efficiencySubject = MappedSubject.create( // NM/gal
    ([groundSpeed, fuelFlow]): number => {
      if (groundSpeed < 1) { return 0; }
      return groundSpeed / fuelFlow;
    },
    this.data.groundSpeed, this.data.fuelFlow,
    this.inputMode,
  );

  private totalEnduranceSubject = MappedSubject.create( // hours
    ([fuelOnBoard, fuelFlow]): number => {
      return fuelOnBoard / fuelFlow;
    },
    this.data.fuelOnBoard, this.data.fuelFlow,
    this.inputMode,
  );

  private distanceRemSubject = MappedSubject.create(  // NM
    ([fixMode, legMode, selectedLeg, activeLegMiles, fromCoord, toCoord]): number => {
      if (fixMode === FixModes.FPL) {
        return getLegsDistance(this.props.fms.getFlightPlan(), legMode, selectedLeg, activeLegMiles);
      } else {
        return getWptsDistance(fromCoord, toCoord);
      }
    },
    this.fixModeSubject,
    this.legModeSubject,
    this.selectedLegSubject,
    this.activeLegMilesRemSubject,
    this.fromCoord,
    this.toCoord,
    this.flightPlanCalcSubject,
  );

  private remFuelSubject = MappedSubject.create(  // gallons
    ([distanceRem, fuelOnBoard, groundSpeed, fuelFlow]): number => {
      if (groundSpeed < 1 || distanceRem <= 0) { return -1; }
      return (fuelOnBoard) - ((distanceRem / groundSpeed) * fuelFlow);
    },
    this.distanceRemSubject,
    this.data.fuelOnBoard,
    this.data.groundSpeed,
    this.data.fuelFlow,
    this.inputMode,
  );

  private remEnduranceSubject = MappedSubject.create(  // hours
    ([totalEndurance, distanceRem, groundSpeed]): number => {
      if (groundSpeed < 1 || distanceRem <= 0) { return -1; }
      return totalEndurance - (distanceRem / groundSpeed);
    },
    this.totalEnduranceSubject,
    this.distanceRemSubject,
    this.data.groundSpeed,
    this.inputMode,
  );

  private fuelReqSubject = MappedSubject.create(  // gallons
    ([distanceRem, groundSpeed, fuelFlow]): number => {
      if (groundSpeed < 1 || distanceRem <= 0) { return -1; }
      return (distanceRem / groundSpeed) * fuelFlow;
    },
    this.distanceRemSubject,
    this.data.groundSpeed,
    this.data.fuelFlow,
    this.inputMode
  );

  private totalRangeSubject = MappedSubject.create( // NM
    ([totalEndurance, groundSpeed]): number => {
      if (groundSpeed < 1) { return 0; }
      return totalEndurance * groundSpeed;
    },
    this.totalEnduranceSubject,
    this.data.groundSpeed,
    this.inputMode,
  );


  // Data field properties

  private efficiency: DisplayFieldData = {
    title: 'Efficiency',
    value: this.efficiencySubject as Subscribable<number>,
    unit: 'NM/GAL',
    decimals: 1,
    minDigits: 1,
    maxDigits: 3,
    format: DisplayFieldFormat.value,
  };

  private totalEndurance: DisplayFieldData = {
    title: 'Total Endurance',
    value: this.totalEnduranceSubject as Subscribable<number>,
    unit: undefined,
    decimals: undefined,
    minDigits: undefined,
    maxDigits: 2,
    format: DisplayFieldFormat.timePlus,
  };

  private remainingFuel: DisplayFieldData = {
    title: 'Remaining Fuel',
    value: this.remFuelSubject as Subscribable<number>,
    unit: 'GAL',
    decimals: 0,
    minDigits: 1,
    maxDigits: 5,
    format: DisplayFieldFormat.value,
  };

  private remainingEndurance: DisplayFieldData = {
    title: 'Remaining Endurance',
    value: this.remEnduranceSubject as Subscribable<number>,
    unit: undefined,
    decimals: undefined,
    minDigits: undefined,
    maxDigits: undefined,
    format: DisplayFieldFormat.timePlus,
  };

  private fuelRequired: DisplayFieldData = {
    title: 'Fuel Required',
    value: this.fuelReqSubject as Subscribable<number>,
    unit: 'GAL',
    decimals: 1,
    minDigits: 1,
    maxDigits: 5,
    format: DisplayFieldFormat.value,
  };

  private totalRange: DisplayFieldData = {
    title: 'Total Range',
    value: this.totalRangeSubject as Subscribable<number>,
    unit: 'NM',
    decimals: 0,
    minDigits: 1,
    maxDigits: 4,
    format: DisplayFieldFormat.value,
  };

  /** @inheritdoc
   */
  public onAfterRender(): void {

    // Add subscriptions to subs array
    this.subs.push(
      this.flightPlanCalcSubject,
      this.activeLegMilesRemSubject,
      this.fromWpt.sub(async (n) => {
        this.fromCoord.set(await getWaypointCoord(this.props.bus, n));
      }, true),
      this.toWpt.sub(async (n) => {
        this.toCoord.set(await getWaypointCoord(this.props.bus, n));
      }, true),
    );
  }

  /** @inheritdoc */
  public render(): VNode {

    return (
      <div class='sr22t-system-page-section sr22t-tp-page-fuel-stats'>
        <div class='sr22t-system-page-section-title'>Fuel Stats</div>
        <div class='sr22t-system-page-section-content'>
          <div class="tp-page-section-column-full" >
            <Sr22tTPDisplayField data={this.efficiency} />
            <Sr22tTPDisplayField data={this.totalEndurance} />
            <Sr22tTPDisplayField data={this.remainingFuel} />
            <Sr22tTPDisplayField data={this.remainingEndurance} />
            <Sr22tTPDisplayField data={this.fuelRequired} />
            <Sr22tTPDisplayField data={this.totalRange} />
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public pause(): void {
    this.subs.forEach(sub => sub.pause());
  }

  /** @inheritdoc */
  public resume(): void {
    this.subs.forEach(sub => sub.resume(true));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
