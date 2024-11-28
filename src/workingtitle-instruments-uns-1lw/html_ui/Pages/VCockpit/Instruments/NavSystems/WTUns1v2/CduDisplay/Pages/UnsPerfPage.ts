import {
  AdcEvents, ConsumerSubject, EngineEvents, EventBus, Facility, FmcRenderTemplate, GNSSEvents, ICAO, MappedSubject, NumberFormatter, Predictions, Subject,
  SubscribableMapFunctions, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { UnsFms } from '../../Fms';
import { UnsFuelComputerEvents } from '../../Fms/Performance/UnsFuelComputerInstrument';
import { UnsPerformancePlan } from '../../Fms/Performance/UnsPerformancePlan';
import { UnsDisplayField } from '../Components/UnsDisplayField';
import { UnsCduFormatters } from '../UnsCduIOUtils';
import { UnsFmcPage } from '../UnsFmcPage';

const INT_ROUND_DOWN_FORMATTER = NumberFormatter.create({ precision: 1, round: -1 });
const ISA_TEMP_FORMATTER = NumberFormatter.create({ pad: 2, precision: 1, forceSign: true, round: -1 });
const FUEL_ECON_FORMATTER = NumberFormatter.create({ precision: 0.001, round: -1 });

const clampToZero = (value: number): number => Math.max(value, 0);
const clampToZeroOrNull = (value: number | null): number | null => value === null ? null : clampToZero(value);

const productOrNull = (prod: number | null, val: number | null): number | null => prod !== null && val !== null ? prod * val : null;


/** Store for the UNS perf page */
class UnsPerfPageStore {
  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly perfPlan: UnsPerformancePlan, private readonly fms: UnsFms) {
  }

  public readonly track = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('track_deg_magnetic').atFrequency(1), 0);
  public readonly windDirection = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_direction').atFrequency(1), 0);
  public readonly windVelocity = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_velocity').atFrequency(1), 0);
  public readonly ambientTemp = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_temp_c').atFrequency(1), 0);
  public readonly isaTemp = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('isa_temp_c').atFrequency(1), 0);
  public readonly groundSpeed = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed').atFrequency(3), 0);

  public destinationFacility = Subject.create<Facility | null>(null);
  public readonly destinationPredictions = Subject.create<Readonly<Predictions> | undefined>(undefined);
  public distanceToDestination = this.destinationFacility.map(facility => {
    return facility === null ? null : UnitType.NMILE.convertFrom(this.fms.pposSub.get().distance(facility), UnitType.GA_RADIAN);
  });

  public readonly eteHrs = MappedSubject.create(
    ([distance, groundSpeed]) => (!distance || groundSpeed < 30) ? null : distance / groundSpeed,
    this.distanceToDestination,
    this.groundSpeed,
  );

  public readonly etaSec = this.destinationPredictions.map((fplDestPred) => {
    if (fplDestPred && fplDestPred.valid) {
      const fplEta = fplDestPred.estimatedTimeOfArrival;
      if (Number.isFinite(fplEta)) {
        return fplEta;
      }
    }

    return null;
  });

  public readonly fuelOnboard = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_total_weight').atFrequency(3), 0);
  public readonly totalFuelFlow = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_totalizer_flow_total'), 0);
  public readonly totalFuelUsed = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_totalizer_burned_total'), 0);

  public readonly zeroFuelWeight = this.perfPlan.zeroFuelWeight;

  public readonly grossWeight = MappedSubject.create(
    ([zfw, fuelOnboard]) => zfw ? zfw + fuelOnboard : null,
    this.zeroFuelWeight,
    this.fuelOnboard,
  );

  public readonly fuelEconomyGs = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_economy_ground_speed'), 0);

  public readonly fuelEconomyTas = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_economy_true_air_speed'), 0);

  public readonly fuelRequired = MappedSubject.create(
    SubscribableMapFunctions.reduce(productOrNull, 1),
    this.totalFuelFlow,
    this.eteHrs,
  );

  public readonly fuelOverhead = MappedSubject.create(
    ([onboard, required]) => required === null ? null : onboard - required,
    this.fuelOnboard,
    this.fuelRequired,
  );

  public readonly esad = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>()
    .on('true_air_miles_flown'), 0);

  public readonly currentEndurance = MappedSubject.create(
    ([fuelRemaining, fuelFlow]) => {
      return fuelFlow ? fuelRemaining / fuelFlow : null;
    },
    this.fuelOnboard,
    this.totalFuelFlow,
  );

  public readonly currentRange = MappedSubject.create(
    ([endurenceHrs, groundSpeed]) =>
      // 10 is arbitrary, but in place so range values don't show zero at standstill
      endurenceHrs === null || groundSpeed < 10 ? null : Math.floor(endurenceHrs * groundSpeed),
    this.currentEndurance,
    this.groundSpeed,
  );

  public readonly subscriptions: Subscription[] = [
    this.ambientTemp,
    this.currentEndurance,
    this.currentRange,
    this.distanceToDestination,
    this.esad,
    this.etaSec,
    this.eteHrs,
    this.fuelEconomyGs,
    this.fuelEconomyTas,
    this.fuelOnboard,
    this.fuelOverhead,
    this.fuelRequired,
    this.grossWeight,
    this.groundSpeed,
    this.isaTemp,
    this.totalFuelFlow,
    this.totalFuelUsed,
    this.track,
    this.windDirection,
    this.windVelocity,
  ];
}

/** A UNS Perf page */
export class UnsPerfPage extends UnsFmcPage {
  protected pageTitle = '   PERF';

  private readonly store = new UnsPerfPageStore(this.bus, this.fms.activePerformancePlan, this.fms);

  private readonly GroundSpeedField = new UnsDisplayField<number>(this, {
    formatter: ([gs]) => `GS[cyan s-text]${gs.toFixed(0).padStart(7, ' ')}[d-text]`
  }).bindWrappedData(this.store.groundSpeed);

  private readonly HeadwindField = new UnsDisplayField<readonly [number, number, number]>(this, {
    formatter: ([data]) => UnsCduFormatters.Headwind(2, 'white d-text')(data),
  }).bindWrappedData(MappedSubject.create(
    this.store.track,
    this.store.windDirection,
    this.store.windVelocity,
  ));

  private readonly EsadField = new UnsDisplayField<number>(this, {
    formatter: ([esad]) => `ESAD[cyan s-text]${esad.toFixed(0).padStart(5, ' ')}[d-text]`,
    style: '[d-text]',
  }).bindWrappedData(this.store.esad);

  private readonly IsaDeviationField = new UnsDisplayField<readonly [number, number]>(this, {
    formatter: ([[ambient, isa]]) => `TEMP[cyan s-text]   ISA${ISA_TEMP_FORMATTER(ambient - isa)}`,
  }).bindWrappedData(MappedSubject.create(
    this.store.ambientTemp,
    this.store.isaTemp,
  ));

  private readonly DistanceField = new UnsDisplayField<number | null>(this, {
    formatter: {
      nullValueString: '-----',
      format: ([distance]) => `DIST[cyan s-text]  ${distance ? INT_ROUND_DOWN_FORMATTER(distance).padStart(3, ' ') : '---'}[d-text]`,
    },
  }).bindWrappedData(this.store.distanceToDestination);

  private readonly EteField = new UnsDisplayField<number | null>(this, {
    formatter: ([ete]) => `ETE[cyan s-text]  ${UnsCduFormatters.Time('ete', UnitType.HOUR)(ete).slice(1)}[d-text]`,
  }).bindWrappedData(this.store.eteHrs);

  private readonly GsFuelEconField = new UnsDisplayField<number>(this, {
    formatter: ([fuelEconomyGroundspeed]) => `GND[cyan s-text] NM/LB[s-text]${FUEL_ECON_FORMATTER(fuelEconomyGroundspeed).slice(1)}[d-text]`,
  }).bindWrappedData(this.store.fuelEconomyGs);

  private readonly AirFuelEconField = new UnsDisplayField<number>(this, {
    formatter: ([fuelEconomyGroundspeed]) => `AIR[cyan s-text] NM/LB[s-text]${FUEL_ECON_FORMATTER(fuelEconomyGroundspeed).slice(1)}[d-text]`,
  }).bindWrappedData(this.store.fuelEconomyTas);

  private readonly EtaUtcField = new UnsDisplayField<number | null>(this, {
    formatter: ([eta]) => `     ETA[cyan s-text] ${UnsCduFormatters.Time('eta', UnitType.SECOND)(eta)}[white d-text] UTC[cyan s-text]`,
    suffix: '        ',
  }).bindWrappedData(this.store.etaSec);

  private readonly OvhdField = new UnsDisplayField<Facility | null>(this, {
    formatter: {
      format: ([facilty]) => `OVHD[cyan s-text] ${facilty ? ICAO.getIdent(facilty.icao).padStart(5, ' ') : '-----'}[d-text]`,
    },
  }).bindWrappedData(this.store.destinationFacility);

  private readonly CurrentWeightField = new UnsDisplayField<number | null>(this, {
    formatter: ([range]) => `${UnsCduFormatters.NumberHyphen(5, 'readonly')(range)}[d-text]`,
    prefix: ' ',
  }).bindWrappedData(this.store.grossWeight);

  private readonly OverheadWeightField = new UnsDisplayField<number | null>(this, {
    formatter: ([range]) => UnsCduFormatters.NumberHyphen(5, 'readonly')(range),
    prefix: ' ',
  }).bindWrappedData(MappedSubject.create(
    ([zfw, fuelOverhead]) => zfw && fuelOverhead ? zfw + fuelOverhead : null,
    this.store.zeroFuelWeight,
    this.store.fuelOverhead,
  ));

  private readonly FuelOnboardField = new UnsDisplayField<number>(this, {
    formatter: ([fuel]) => INT_ROUND_DOWN_FORMATTER(fuel).padStart(6, ' '),
    style: '[d-text]',
  }).bindWrappedData(this.store.fuelOnboard.map(clampToZero));

  private readonly FuelOverheadField = new UnsDisplayField<number | null>(this, {
    formatter: ([fuel]) => UnsCduFormatters.NumberHyphenReadonlyFlash(5)(fuel),
  }).bindWrappedData(this.store.fuelOverhead);

  private readonly CurrentEnduranceField = new UnsDisplayField<number | null>(this, {
    formatter: ([ete]) => UnsCduFormatters.Time('ete', UnitType.HOUR)(ete),
    prefix: ' ',
  }).bindWrappedData(this.store.currentEndurance.map(clampToZeroOrNull));

  private readonly OverheadEnduranceField = new UnsDisplayField<number | null>(this, {
    formatter: ([ete]) => UnsCduFormatters.Time('ete', UnitType.HOUR)(ete),
    prefix: ' ',
  }).bindWrappedData(MappedSubject.create(
    ([endurance, ete]) => endurance && ete ? clampToZero(endurance - ete) : null,
    this.store.currentEndurance,
    this.store.eteHrs,
  ));

  private readonly CurrentRangeField = new UnsDisplayField<number | null>(this, {
    formatter: ([range]) => UnsCduFormatters.NumberHyphen(5, 'readonly')(range),
    prefix: ' ',
  }).bindWrappedData(this.store.currentRange.map(clampToZeroOrNull));

  private readonly OverheadRangeField = new UnsDisplayField<number | null>(this, {
    formatter: ([range]) => UnsCduFormatters.NumberHyphen(5, 'readonly')(range),
    prefix: ' ',
  }).bindWrappedData(MappedSubject.create(
    ([range, dist]) => range && dist ? clampToZero(range - dist) : null,
    this.store.currentRange,
    this.store.distanceToDestination,
  ));

  /** @inheritDoc */
  override onInit(): void {
    for (const subscription of this.store.subscriptions) {
      this.addBinding(subscription);
    }

    this.fms.destinationFacilityChanged.on((sender, facility) => this.store.destinationFacility.set(facility ?? null));
    this.fms.predictor.onPredictionsUpdated.on(() => this.store.destinationPredictions.set(this.fms.predictor.getDestinationPredictions()));
    this.store.destinationFacility.set(this.fms.facilityInfo.destinationFacility ?? null);
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        [this.GroundSpeedField, this.HeadwindField],
        [this.EsadField, this.IsaDeviationField],
        [this.DistanceField, this.GsFuelEconField],
        [this.EteField, this.AirFuelEconField],
        [this.EtaUtcField],
        ['   NOW[s-text]', this.OvhdField],
        [this.CurrentWeightField, this.OverheadWeightField, ['WT[cyan s-text] LBS[magenta d-text]  WT[cyan s-text]', 7]],
        [this.FuelOnboardField, this.FuelOverheadField, ['FUEL ONBRD[cyan s-text]', 7]],
        [this.CurrentEnduranceField, this.OverheadEnduranceField, ['ENDURANCE[cyan]', 7]],
        [this.CurrentRangeField, this.OverheadRangeField, ['RANGE[cyan s-text]', 7]],
      ],
    ];
  }
}
