import {
  AdcEvents, ClockEvents, ConsumerSubject, DisplayField, EngineEvents, EventBus, Facility, FacilitySearchType, FmcRenderTemplate, GNSSEvents, ICAO,
  MappedSubject, NumberFormatter, Predictions, Subject, SubscribableMapFunctions, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { SensorsConfigBuilder, UnsFuelFlowSensor, UnsFuelFlowSensorIndex } from '../../Config/SensorsConfigBuilder';
import { UnsFms } from '../../Fms';
import { UnsElapsedFlightTimeEvents } from '../../Fms/Performance/UnsElapsedFlightTimeInstrument';
import { UnsFuelComputerEvents } from '../../Fms/Performance/UnsFuelComputerInstrument';
import { UnsPerformancePlan } from '../../Fms/Performance/UnsPerformancePlan';
import { UnsOverrideableTextInputField, UnsTextInputField, WritableUnsFieldState } from '../Components/UnsTextInputField';
import { UnsCduFormatters, UnsCduParsers } from '../UnsCduIOUtils';
import { UnsCduCursorPath, UnsFmcPage } from '../UnsFmcPage';

const INT_ROUND_DOWN_FORMATTER = NumberFormatter.create({ precision: 1, round: -1 });
const ISA_TEMP_FORMATTER = NumberFormatter.create({ pad: 2, precision: 1, forceSign: true, round: -1 });
const FUEL_ECON_FORMATTER = NumberFormatter.create({ precision: 0.001, round: -1 });

const clampToZero = (value: number): number => Math.max(value, 0);
const clampToZeroOrNull = (value: number | null): number | null => value === null ? null : clampToZero(value);

const sumOrNull = (sum: number | null, val: number | null): number | null => sum !== null && val !== null ? sum + val : null;
const productOrNull = (prod: number | null, val: number | null): number | null => prod !== null && val !== null ? prod * val : null;

/** Store for the UNS Fuel page */
class UnsFuelPageStore {
  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly perfPlan: UnsPerformancePlan, private readonly fms: UnsFms) {
  }

  public readonly simTimeMs = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1), 0);
  public readonly takeoffTime = ConsumerSubject.create(this.bus.getSubscriber<UnsElapsedFlightTimeEvents>().on('time_at_takeoff'), null);
  public readonly elapsedFlightTime = ConsumerSubject.create(this.bus.getSubscriber<UnsElapsedFlightTimeEvents>().on('time_elapsed_since_takeoff'), null);

  public readonly track = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('track_deg_magnetic').atFrequency(1), 0);
  public readonly windDirection = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_direction').atFrequency(1), 0);
  public readonly windVelocity = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_velocity').atFrequency(1), 0);
  public readonly ambientTemp = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('ambient_temp_c').atFrequency(1), 0);
  public readonly isaTemp = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('isa_temp_c').atFrequency(1), 0);

  public readonly groundSpeed = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed').atFrequency(3), 0);
  public readonly manualGroundSpeed = Subject.create<number | null>(null);
  public readonly groundSpeedProxy = MappedSubject.create(
    ([actual, manual]) => manual ?? actual,
    this.groundSpeed,
    this.manualGroundSpeed,
  );

  public readonly destinationPredictions = Subject.create<Readonly<Predictions> | undefined>(undefined);
  public destinationFacility = Subject.create<Facility | null>(null);
  public manualDestinationFacility = Subject.create<Facility | null>(null);
  public destinationFacilityProxy = MappedSubject.create(
    ([actual, manual]) =>  manual ?? actual,
    this.destinationFacility,
    this.manualDestinationFacility,
  );

  public distanceToDestination = this.destinationFacilityProxy.map(facility => {
    return facility === null ? null : UnitType.NMILE.convertFrom(this.fms.pposSub.get().distance(facility), UnitType.GA_RADIAN);
  });

  public readonly eteHrs = MappedSubject.create(
    ([distance, groundSpeed]) => (!distance || groundSpeed < 30) ? null : distance / groundSpeed,
    this.distanceToDestination,
    this.groundSpeedProxy,
  );

  public readonly etaSec = MappedSubject.create(
    ([
      fplDestPred,
      destinationProxy,
      manualDest,
      groundSpeedProxy,
      manualGroundSpeed,
      ppos,
      simTimeMs,
    ]): number | null => {
      if (fplDestPred && fplDestPred.valid && manualGroundSpeed === null) {
        const fplEta = fplDestPred.estimatedTimeOfArrival;
        if (Number.isFinite(fplEta)) {
          return fplEta;
        }
      } else if ((manualDest || manualGroundSpeed) && destinationProxy) {
        // 50 is arbitrary, but in place so ETE values don't blow up at taxi speeds
        if (groundSpeedProxy < 50) {
          return null;
        }

        const distanceNm = UnitType.NMILE.convertFrom(ppos.distance(destinationProxy), UnitType.GA_RADIAN);
        const eteHrs = distanceNm / groundSpeedProxy;
        return UnitType.SECOND.convertFrom(simTimeMs, UnitType.MILLISECOND) +
          UnitType.SECOND.convertFrom(eteHrs, UnitType.HOUR);
      }

      return null;
    },
    this.destinationPredictions,
    this.destinationFacilityProxy,
    this.manualDestinationFacility,
    this.groundSpeedProxy,
    this.manualGroundSpeed,
    this.fms.pposSub,
    this.simTimeMs,
  );

  public readonly fuelOnboard = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_total_weight').atFrequency(3), 0);
  public readonly fuelAtDeparture = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_at_departure'), null);
  public readonly totalFuelFlow = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_totalizer_flow_total'), 0);
  public readonly manualFuelFlow = Subject.create<number | null>(null);
  public readonly totalFuelUsed = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_totalizer_burned_total'), 0);

  public readonly fuelFlowProxy = MappedSubject.create(
    ([actual, manual]) => manual ?? actual,
    this.totalFuelFlow,
    this.manualFuelFlow,
  );


  public readonly paxWeightTotal = MappedSubject.create(
    SubscribableMapFunctions.reduce(productOrNull, 1),
    this.perfPlan.paxQuantity,
    this.perfPlan.paxAvgWeight,
  );

  public readonly zeroFuelWeight = MappedSubject.create(
    SubscribableMapFunctions.reduce(sumOrNull, 0),
    this.perfPlan.basicOperatingWeight,
    this.paxWeightTotal,
    this.perfPlan.cargoWeight,
  );

  public readonly grossWeight = MappedSubject.create(
    SubscribableMapFunctions.reduce(sumOrNull, 0),
    this.zeroFuelWeight,
    this.fuelOnboard,
  );

  public readonly fuelEconomyGs = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_economy_ground_speed'), 0);
  public readonly fuelEconomyTas = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('fuel_economy_true_air_speed'), 0);

  public readonly fuelRequired = MappedSubject.create(
    SubscribableMapFunctions.reduce(productOrNull, 1),
    this.fuelFlowProxy,
    this.eteHrs,
  );

  public readonly fuelOverhead = MappedSubject.create(
    ([onboard, required]) => required === null ? null : onboard - required,
    this.fuelOnboard,
    this.fuelRequired,
  );

  public readonly fuelReservesSum = MappedSubject.create(
    ([alt, hold, extra]) => alt + hold + extra,
    this.perfPlan.alternateFuel,
    this.perfPlan.holdFuel,
    this.perfPlan.extraFuel,
  );
  public fuelReservesProxy = MappedSubject.create(
    ([manual, sum]) => manual ?? sum,
    this.perfPlan.manualTotalReservesFuel,
    this.fuelReservesSum,
  );

  public readonly esad = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>().on('true_air_miles_flown'), 0);

  public readonly currentEndurance = MappedSubject.create(
    ([fuelRemaining, fuelFlow]) => {
      return fuelFlow ? fuelRemaining / fuelFlow : null;
    },
    this.fuelOnboard,
    this.fuelFlowProxy,
  );

  public readonly currentRange = MappedSubject.create(
    ([endurenceHrs, groundSpeed]) =>
      // 10 is arbitrary, but in place so range values don't show zero at standstill
      endurenceHrs === null || groundSpeed < 10 ? null : Math.floor(endurenceHrs * groundSpeed),
    this.currentEndurance,
    this.groundSpeedProxy,
  );

  public readonly subscriptions: Subscription[] = [
    this.ambientTemp,
    this.currentEndurance,
    this.currentRange,
    this.distanceToDestination,
    this.elapsedFlightTime,
    this.esad,
    this.etaSec,
    this.eteHrs,
    this.fuelEconomyGs,
    this.fuelEconomyTas,
    this.fuelFlowProxy,
    this.fuelOnboard,
    this.fuelOverhead,
    this.fuelRequired,
    this.fuelReservesProxy,
    this.fuelReservesSum,
    this.grossWeight,
    this.groundSpeed,
    this.groundSpeedProxy,
    this.isaTemp,
    this.paxWeightTotal,
    this.simTimeMs,
    this.takeoffTime,
    this.totalFuelFlow,
    this.totalFuelUsed,
    this.track,
    this.windDirection,
    this.windVelocity,
    this.zeroFuelWeight,
  ];
}

/** A UNS Fuel page */
export class UnsFuelPage extends UnsFmcPage {
  protected override pageTitle = '  FUEL  ';
  protected override menuRoute = Subject.create('/fuel-options');

  private readonly perfPlan = this.fms.activePerformancePlan;

  private readonly store = new UnsFuelPageStore(this.bus, this.perfPlan, this.fms);

  private etaLclOffsetSignTemp = Subject.create<1 | -1>(+1);
  private etaLclOffsetSign = Subject.create<1 | -1>(+1);
  private etaLclOffsetMagnitude = Subject.create<number | null>(null);

  private inhibitManualResetsOnPause = Subject.create(false);

  // TODO Make weight units follow game units

  /** @inheritDoc */
  override onInit(): void {
    for (const subscription of this.store.subscriptions) {
      this.addBinding(subscription);
    }

    this.addBinding(this.store.zeroFuelWeight.pipe(this.perfPlan.zeroFuelWeight));

    this.addBinding(this.store.destinationFacilityProxy.sub(() => {
        // TODO The sign will prefill with a minus (-) when the longitude of the TO
        //  waypoint location is W and prefill with a plus (+) when the longitude is E.
        this.etaLclOffsetSign.set(1);
        this.etaLclOffsetSignTemp.set(1);
        this.etaLclOffsetMagnitude.set(null);
      })
    );

    this.fms.destinationFacilityChanged.on((sender, facility) => this.store.destinationFacility.set(facility ?? null));
    this.fms.predictor.onPredictionsUpdated.on(() => this.store.destinationPredictions.set(this.fms.predictor.getDestinationPredictions()));
    this.store.destinationFacility.set(this.fms.facilityInfo.destinationFacility ?? null);
  }

  /** @inheritDoc */
  override onResume(): void {
    if (this.store.grossWeight.get() && this.screen.currentSubpageIndex.get() !== 2) {
      this.screen.navigateTo('/fuel#2');
    }

    // TODO The BASIC OP WT and reserves plan values will be prefilled with the values last used.
  }

  /** @inheritDoc */
  override onPause(): void {
    if (!this.inhibitManualResetsOnPause.get()) {
      this.store.manualFuelFlow.set(null);
      this.store.manualGroundSpeed.set(null);
      this.store.manualDestinationFacility.set(null);
    }

    this.inhibitManualResetsOnPause.set(false);
  }

  /** @inheritDoc */
  override async onHandleListPressed(): Promise<boolean> {
    if (this.ToField.isHighlighted.get()) {
      this.inhibitManualResetsOnPause.set(true);

      const facility: Facility | null = await this.screen.invokeNormalListPage('apt');

      if (facility) {
        this.store.manualDestinationFacility.set(facility);
      }
    }

    return true;
  }

  // Page 1

  private readonly BasicWeightField = new UnsTextInputField<number | null>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(6),
      format: UnsCduFormatters.NumberHyphen(6, 'input'),
    },
    maxInputCharacterCount: 6,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.BasicWeightField);
      return true;
    },
    prefix: ' [d-text]',
  }).bindWrappedData(this.perfPlan.basicOperatingWeight);

  private readonly PaxHeader = new UnsTextInputField<readonly [number | null, number | null], number>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(3),
      format: ([[quantity, weight], isHighlighted, typedText]: WritableUnsFieldState<readonly [number | null, number | null]>): string => {
        const quantStr: string = UnsCduFormatters.NumberHyphen(3, 'input')(
          [quantity, isHighlighted, typedText]);
        const weightStr: string = UnsCduFormatters.NumberHyphen(3, 'input')(
          [quantity === null ? null : weight, false, '']);
        return `PAX([cyan]${quantStr})@[cyan]${weightStr}`;
      },
    },
    onModified: async (quantity: number) => {
      this.perfPlan.paxQuantity.set(quantity);
      return true;
    },
    maxInputCharacterCount: 3,
  }).bindWrappedData(MappedSubject.create(
    this.perfPlan.paxQuantity,
    this.perfPlan.paxAvgWeight,
  ));

  // TODO There are two methods of entering the total passenger
  //  weight. The number of passengers (up to 999) can be entered in the
  //  PAX field. The computer multiplies the number of passengers by the
  //  default weight per passenger. This weight may be changed on the
  //  FUEL OPTIONS paged. Total passenger weight is also manually
  //  enterable in the passenger weight field. This method will recalculate
  //  the displayed average passenger weight.
  // TODO LSK will navigate to the header. Cursor path should proceed from the header to the field?
  private readonly PaxField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(6, 'readonly'),
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.PaxHeader);
      return true;
    },
    prefix: ' [d-text]',
  }).bind(this.store.paxWeightTotal);

  private readonly CargoWeightField = new UnsTextInputField<number | null>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(6),
      format: UnsCduFormatters.NumberHyphen(6, 'input'),
    },
    maxInputCharacterCount: 6,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.CargoWeightField);
      return true;
    },
    prefix: ' [d-text]',
  }).bindWrappedData(this.perfPlan.cargoWeight);

  // TODO The Zero Fuel Weight is automatically calculated based upon
  //  the three prior entries. If desired, this value may be directly entered.
  //  If desired, this value may be directly entered (max 999999).
  private readonly ZfwField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(7, 'readonly'),
  }).bind(this.store.zeroFuelWeight);

  private readonly GrossWtField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(7, 'readonly'),
  }).bind(this.store.grossWeight);

  private readonly AlternateField = new UnsTextInputField<number | null>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(6),
      format: UnsCduFormatters.NumberHyphen(6, 'input'),
    },
    maxInputCharacterCount: 6,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.AlternateField);
      return true;
    },
    onModified: async () => {
      this.perfPlan.manualTotalReservesFuel.set(null);
      return false;
    },
  }).bindWrappedData(this.perfPlan.alternateFuel);

  private readonly HoldField = new UnsTextInputField<number | null>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(6),
      format: UnsCduFormatters.NumberHyphen(6, 'input'),
    },
    maxInputCharacterCount: 6,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.HoldField);
      return true;
    },
    onModified: async () => {
      this.perfPlan.manualTotalReservesFuel.set(null);
      return false;
    },
  }).bindWrappedData(this.perfPlan.holdFuel);

  private readonly ExtraField = new UnsTextInputField<number | null>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(6),
      format: UnsCduFormatters.NumberHyphen(6, 'input'),
    },
    maxInputCharacterCount: 6,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.ExtraField);
      return true;
    },
    onModified: async () => {
      this.perfPlan.manualTotalReservesFuel.set(null);
      return false;
    },
  }).bindWrappedData(this.perfPlan.extraFuel);

  private readonly TotalReservesField = new UnsTextInputField<number | null>(this, {
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositiveBounded(6, 1, 299997),
      format: UnsCduFormatters.NumberHyphen(6, 'input'),
    },
    maxInputCharacterCount: 6,
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.TotalReservesField);
      return true;
    },
    onModified: async (newValue) => {
      this.perfPlan.alternateFuel.set(0);
      this.perfPlan.holdFuel.set(0);
      this.perfPlan.extraFuel.set(0);
      this.perfPlan.manualTotalReservesFuel.set(newValue);

      return true;
    },
  }).bindWrappedData(this.store.fuelReservesProxy);

  private readonly FuelOnboardField = new DisplayField<number>(this, {
    formatter: fuel => INT_ROUND_DOWN_FORMATTER(fuel).padStart(6, ' '),
    style: '[d-text]',
  }).bind(this.store.fuelOnboard.map(clampToZero));

  // Page 2

  private readonly FuelFlowField = new UnsOverrideableTextInputField<number>(this, {
    defaultValue: this.store.totalFuelFlow,
    overrideValue: this.store.manualFuelFlow,
    parseFunction: UnsCduParsers.NumberIntegerPositive(6),
    maxInputCharacterCount: 6,
    nullValueString: '',
    defaultValFormatter: defaultVal => `${INT_ROUND_DOWN_FORMATTER(defaultVal).padStart(6, ' ')}`,
    typedTextFormatter: typedText => `${typedText.padStart(6, ' ')}[r-white]`,
    overrideValFormatter: overrideVal => `${INT_ROUND_DOWN_FORMATTER(overrideVal).padStart(6, ' ')}[d-text] (EST)[s-text]`,
    overrideValHighlightedFormatter: overrideVal => `${INT_ROUND_DOWN_FORMATTER(overrideVal).padStart(6, ' ')}[r-white d-text] (EST)[s-text]`,
  });

  private readonly GroundSpeedField = new UnsOverrideableTextInputField<number>(this, {
    defaultValue: this.store.groundSpeed,
    overrideValue: this.store.manualGroundSpeed,
    parseFunction: UnsCduParsers.NumberIntegerPositive(3),
    maxInputCharacterCount: 3,
    nullValueString: '',
    defaultValFormatter: defaultVal => defaultVal.toFixed().padStart(3, ' '),
    typedTextFormatter: typedText => `${typedText.padStart(3, ' ')}[r-white]`,
    overrideValFormatter: overrideVal => `'(EST) [s-text]${overrideVal.toFixed().padStart(3, ' ')}[d-text]`,
    overrideValHighlightedFormatter: overrideVal => `'(EST) [s-text]${overrideVal.toFixed().padStart(3, ' ')}[r-white d-text]`,
  });

  private readonly TakeoffTimeField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('eta', UnitType.MILLISECOND),
    prefix: 'T/O[cyan s-text] ',
  }).bind(this.store.takeoffTime);

  private readonly ElapsedTimeField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('ete', UnitType.MILLISECOND),
    prefix: 'ELAPSED[cyan s-text] ',
  }).bind(this.store.elapsedFlightTime);

  private readonly ToField = new UnsOverrideableTextInputField<Facility | null>(this, {
    defaultValue: this.store.destinationFacility,
    overrideValue: this.store.manualDestinationFacility,
    parseFunction: async (input: string): Promise<Facility | null> => {
      this.inhibitManualResetsOnPause.set(true);

      return await this.screen.searchFacilityByIdent(
        input,
        this.fms.pposSub.get(),
        FacilitySearchType.Airport,
      );
    },
    maxInputCharacterCount: 5,
    nullValueString: '-----',
    defaultValFormatter: defaultVal => `${ICAO.getIdent(defaultVal.icao).padStart(5, ' ')}`,
    typedTextFormatter: typedText => `${typedText.padStart(5, ' ')}[r-white]`,
    overrideValFormatter: overrideVal => `${ICAO.getIdent(overrideVal.icao).padStart(5, ' ')}[d-text](A)[s-text]`,
    overrideValHighlightedFormatter: overrideVal => `${ICAO.getIdent(overrideVal.icao).padStart(5, ' ')}[r-white d-text](A)[s-text]`,
    prefix: 'TO [cyan s-text]',
  });

  private readonly EteField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('ete', UnitType.HOUR),
  }).bind(this.store.eteHrs);

  private readonly DistanceField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: '-----',
      format: distance => `${INT_ROUND_DOWN_FORMATTER(distance)}[d-text]`,
    },
    suffix: 'NM[s-text]',
  }).bind(this.store.distanceToDestination);

  private readonly EtaUtcField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('eta', UnitType.SECOND),
    suffix: '        ',
  }).bind(this.store.etaSec);

  private readonly EtaLclOffsetField = new UnsTextInputField<readonly [-1 | 1, number | null], number | null>(this, {
    maxInputCharacterCount: 2,
    acceptEmptyInput: true,
    formatter: {
      parse: (input) => {
        const currentMagnitude = this.etaLclOffsetMagnitude.get();
        const parsedMagnitude = UnsCduParsers.NumberIntegerPositiveBounded(2, 1, 13)(input);

        const signHasChanged = this.etaLclOffsetSignTemp.get() !== this.etaLclOffsetSign.get();
        const parsedInputIsNullBecauseInputIsEmpty = parsedMagnitude === null && input === '';
        const fieldAlreadyHasValidMagnitude = currentMagnitude !== null;

        // Allow sign to change even if the magnitude (which is the parsed value) doesn't
        if (signHasChanged && parsedInputIsNullBecauseInputIsEmpty && fieldAlreadyHasValidMagnitude) {
          // Set sign and reparse current (valid) magnitude
          this.etaLclOffsetSign.set(this.etaLclOffsetSignTemp.get());
          return currentMagnitude;
        }

        return parsedMagnitude;
      },
      format: ([[sign, offset], isHighlighted, typedText]: WritableUnsFieldState<readonly [-1 | 1, number | null]>) => {
        const magnitudeStr: string = typedText || (offset === null ? (isHighlighted ? '  ' : '--') : Math.abs(offset).toFixed());
        return `${(sign < 0 ? '-' : '+')}${magnitudeStr.padStart(2, ' ')}${isHighlighted ? '[r-white]' : '[white]'}`;
      },
    },
    suffix: ' LCL[cyan s-text]',
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.EtaLclOffsetField);
      this.etaLclOffsetSignTemp.set(this.etaLclOffsetSign.get());
      return true;
    },
    onPlusMinusPressed: async () => {
      this.etaLclOffsetSignTemp.set(-1 * this.etaLclOffsetSignTemp.get() as -1 | 1);
      return true;
    },
    onModified: async (value) => {
      if (value !== null) {
        this.etaLclOffsetMagnitude.set(value);
        this.etaLclOffsetSign.set(this.etaLclOffsetSignTemp.get());
      }

      this.screen.toggleFieldFocused(this.EtaLclOffsetField);
      return true;
    },
  }).bindWrappedData(MappedSubject.create(
    this.etaLclOffsetSignTemp,
    this.etaLclOffsetMagnitude,
  ));

  private readonly etaLclField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('eta', UnitType.SECOND),
    suffix: '        ',
  }).bind(MappedSubject.create(
    ([sign, magnitude, eta]) => magnitude !== null && eta !== null ? eta + (sign * magnitude * 60 * 60) : null,
    this.etaLclOffsetSign,
    this.etaLclOffsetMagnitude,
    this.store.etaSec,
  ));

  private readonly OvhdField = new DisplayField<Facility | null>(this, {
    formatter: {
      nullValueString: '-----',
      format: (facilty) => ICAO.getIdent(facilty.icao).padStart(5, ' '),
    },
  }).bind(this.store.destinationFacilityProxy);

  private readonly CurrentEnduranceField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('ete', UnitType.HOUR),
    prefix: ' ',
  }).bind(this.store.currentEndurance.map(clampToZeroOrNull));

  private readonly OverheadEnduranceField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.Time('ete', UnitType.HOUR),
    prefix: ' ',
  }).bind(MappedSubject.create(
    ([endurance, ete]) =>
      endurance !== null && ete !== null ? clampToZero(endurance - ete) : null,
    this.store.currentEndurance,
    this.store.eteHrs,
  ));

  private readonly CurrentRangeField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(5, 'readonly'),
    prefix: ' ',
  }).bind(this.store.currentRange.map(clampToZeroOrNull));

  private readonly OverheadRangeField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(5, 'readonly'),
    prefix: ' ',
  }).bind(MappedSubject.create(
    ([range, dist]) =>
      range !== null && dist !== null ? clampToZero(range - dist) : null,
    this.store.currentRange,
    this.store.distanceToDestination,
  ));

  // Page 3

  private readonly FuelAtDepartureField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: '------',
      format: INT_ROUND_DOWN_FORMATTER,
    },
  }).bind(this.store.fuelAtDeparture);

  private readonly FuelRequiredField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(6, 'readonly'),
  }).bind(this.store.fuelRequired);

  private readonly FuelOverheadField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphenReadonlyFlash(6),
  }).bind(this.store.fuelOverhead);

  private readonly FuelExcessField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphenReadonlyFlash(6),
  }).bind(MappedSubject.create(
    ([overhead, reserves]) =>
      overhead === null ? null : overhead - reserves,
    this.store.fuelOverhead,
    this.store.fuelReservesProxy,
  ));

  // Page 4 (all fields are readonly)

  private readonly LandingWeightField = new DisplayField<number | null>(this, {
    formatter: UnsCduFormatters.NumberHyphen(6, 'readonly'),
  }).bind(MappedSubject.create(
    ([gw, requiredFuel]) => gw !== null && requiredFuel !== null ? gw - requiredFuel : null,
    this.store.grossWeight,
    this.store.fuelRequired,
  ));

  private readonly GsFuelEconField = new DisplayField<number>(this, {
    formatter: FUEL_ECON_FORMATTER,
  }).bind(this.store.fuelEconomyGs);


  private readonly TasFuelEconField = new DisplayField<number>(this, {
    formatter: FUEL_ECON_FORMATTER,
    style: '[d-text]',
  }).bind(this.store.fuelEconomyTas);

  private readonly HeadwindField = new DisplayField<readonly [number, number, number]>(this, {
    formatter: UnsCduFormatters.Headwind(13, 'white d-text'),
  }).bind(MappedSubject.create(
    this.store.track,
    this.store.windDirection,
    this.store.windVelocity,
  ));

  private readonly EsadField = new DisplayField<number>(this, {
    formatter: esad => esad.toFixed(),
    style: '[d-text]',
  }).bind(this.store.esad);

  private readonly IsaDeviationField = new DisplayField<readonly [number, number]>(this, {
    formatter: ([ambient, isa]) => `ISA${ISA_TEMP_FORMATTER(ambient - isa)}`,
  }).bind(MappedSubject.create(
    this.store.ambientTemp,
    this.store.isaTemp,
  ));

  // Page 5

  /**
   * Generate fuel flow fields.
   * @returns Two render template rows per fuel sensor.
   */
  private fuelSensorFields: FmcRenderTemplate = ([1, 2, 3, 4] as UnsFuelFlowSensorIndex[])
    .reduce<FmcRenderTemplate>((template: FmcRenderTemplate, index: UnsFuelFlowSensorIndex): FmcRenderTemplate => {
      const sensor: UnsFuelFlowSensor | undefined = this.fmsConfig.sensors.fuelFlow.sensors.get(index);

      if (sensor) {
        const fuelFlowTopic = SensorsConfigBuilder.isLegacyFuelSystemFlowSensor(sensor) ?
          `fuel_flow_pph_${sensor.simEngineIndex}` as const :
          `fuel_flow_pph_${sensor.fuelLineIndex}` as const;
        const fuelFlow = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>()
          .on(fuelFlowTopic), 0);

        const fuelFlowField = new DisplayField<number>(this, {
          formatter: (flow: number): string =>
            `${sensor.label}[s-text cyan]${INT_ROUND_DOWN_FORMATTER(flow).padStart(7, ' ')}[d-text white]`,
        }).bind(fuelFlow);

        const fuelBurned = ConsumerSubject.create(this.bus.getSubscriber<UnsFuelComputerEvents>()
          .on(`fuel_totalizer_burned_${sensor.index}`), 0
        );

        const fuelUsedField = new DisplayField<number>(this, {
          formatter: (burned: number): string => `${INT_ROUND_DOWN_FORMATTER(burned)}[d-text white]`,
        }).bind(fuelBurned);

        template.push([fuelFlowField, fuelUsedField]);
      } else {
        template.push(['']);
      }

      template.push(['']);

      return template;
    }, []);

  private readonly TotalFuelFlowField = new DisplayField<number>(this, {
    formatter: (flow: number): string => `TOTAL[cyan]${INT_ROUND_DOWN_FORMATTER(flow).padStart(7, ' ')}[white]`,
  }).bind(this.store.totalFuelFlow);

  private readonly TotalFuelUsedField = new DisplayField<number>(this, {
    formatter: (used: number): string => `${INT_ROUND_DOWN_FORMATTER(used)}[d-text white]`,
  }).bind(this.store.totalFuelUsed);

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [ // Page 1
        [this.TitleField],
        ['BASIC WT[cyan]  LBS[magenta d-text]', 'ALTERNATE[cyan]'],
        [this.BasicWeightField, this.AlternateField],
        [this.PaxHeader, 'HOLD[cyan]'],
        [this.PaxField, this.HoldField],
        ['CARGO[cyan]', 'EXTRA[cyan]'],
        [this.CargoWeightField, this.ExtraField],
        ['ZFW[cyan]', 'TOTAL RESRVS[cyan]'],
        [this.ZfwField, this.TotalReservesField],
        ['GROSS WT[cyan]', 'FUEL ONBOARD[cyan]'],
        [this.GrossWtField, this.FuelOnboardField],
      ],
      [ // Page 2
        [this.TitleField],
        ['FUELFLOW[cyan]  LBS[magenta d-text]', 'GS[cyan]'],
        [this.FuelFlowField, this.GroundSpeedField],
        [this.TakeoffTimeField, this.ElapsedTimeField],
        [this.ToField, this.DistanceField, [this.EteField, 11]],
        ['ETA UTC[cyan]', this.EtaUtcField],
        [this.EtaLclOffsetField, this.etaLclField],
        ['   NOW[cyan]', this.OvhdField, ['OVHD[cyan s-text]', 14]],
        [this.FuelOnboardField, this.FuelOverheadField, ['FUEL ONBRD[cyan s-text]', 7]],
        [this.CurrentEnduranceField, this.OverheadEnduranceField, ['ENDURANCE[cyan]', 7]],
        [this.CurrentRangeField, this.OverheadRangeField, ['RANGE[cyan s-text]', 7]],
      ],
      [ // Page 3
        [this.TitleField],
        ['FUELFLOW[cyan]  LBS[magenta d-text]', 'GS[cyan]'],
        [this.FuelFlowField, this.GroundSpeedField],
        ['FUEL[cyan]'],
        [' AT DEPARTURE[cyan s-text]', this.FuelAtDepartureField],
        [' USED[cyan]', this.TotalFuelUsedField],
        [' ONBOARD[cyan s-text]', this.FuelOnboardField],
        [' REQUIRED[cyan]', this.FuelRequiredField],
        [' OVERHEAD[cyan s-text]', this.FuelOverheadField, [this.OvhdField, 9]],
        [' RESERVES[cyan]', this.TotalReservesField],
        [' EXCESS[cyan s-text]', this.FuelExcessField],
      ],
      [ // Page 4
        [this.TitleField],
        ['          LBS[magenta d-text]'],
        ['GROSS WT[cyan s-text]', this.GrossWtField],
        ['FUEL ONBOARD[cyan]', this.FuelOnboardField],
        ['LANDING WT[cyan s-text]', this.LandingWeightField],
        ['OVERHEAD[cyan]', this.FuelOverheadField, [this.OvhdField, 9]],
        ['GND NM/LB[cyan s-text]', this.GsFuelEconField],
        ['AIR NM/LB[cyan]', this.TasFuelEconField],
        [this.HeadwindField],
        ['ESAD[cyan]', this.EsadField],
        ['TEMP[cyan s-text]', this.IsaDeviationField],
      ],
      [ // Page 5
        [this.TitleField],
        ['        FLOW[s-text cyan]  LBS[magenta d-text]', 'USED[s-text cyan]'],
        ...this.fuelSensorFields,
        [this.TotalFuelFlowField, this.TotalFuelUsedField],
      ],
    ];
  }

  public override cursorPath: UnsCduCursorPath | null = {
    initialPosition: this.PaxHeader,
    rules: new Map([
      [this.BasicWeightField as UnsTextInputField<any, any>, this.PaxHeader as UnsTextInputField<any, any>],
      [this.PaxHeader as UnsTextInputField<any, any>, this.CargoWeightField as UnsTextInputField<any, any>],
      // Not sure if the path below is accurate, but it's logical.
      [this.AlternateField as UnsTextInputField<any, any>, this.HoldField as UnsTextInputField<any, any>],
      [this.HoldField as UnsTextInputField<any, any>, this.ExtraField as UnsTextInputField<any, any>],
      [this.ExtraField as UnsTextInputField<any, any>, this.TotalReservesField as UnsTextInputField<any, any>],
    ]),
  };
}
