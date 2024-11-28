import { AdcEvents, ConsumerSubject, ConsumerValue, EventBus, MappedSubject, MutableSubscribable, SimVarValueType, Subject, Subscribable, UnitType, WeightBalanceEvents } from '@microsoft/msfs-sdk';
import { FuelComputerSimVars, FuelTotalizerSimVars, G1000ControlEvents } from '@microsoft/msfs-wtg1000';

/** Distinct types of weights, which share the same moment arm. */
export enum WeightTypes {
  Pilot, Copilot, RearL, RearM, RearR, Baggage, TksFluid, Fuel, EmptyWeight
}

/** Data per station or mass point for the calculation */
type WeightDefinition = {
  /** Weight type of the moment arm. */
  type: WeightTypes;

  /** Station displacement in inches, positive numbers aft of the zero ref datum */
  weightDisplacement: number;
};

/** This dataset is used to export CG data for various conditions/weights */
export type WeightCgDataset = {
  /** Weight in pounds */
  weight: number;

  /** Position of cg in inches from zero ref datum */
  cgPosition: number;

  /** Position of cg in % of the MAC */
  cgPercentage: number;

  /** Is outside of valid CG envelope condition */
  isOutOfCGEnvelope: boolean;

  /** Is outside of valid weight limits */
  isWeightInvalid: boolean;
}

/** The store for the Weight & Balance data */
export class WeightBalanceStore {

  private readonly sub = this.bus.getSubscriber<FuelTotalizerSimVars & AdcEvents & WeightBalanceEvents & G1000ControlEvents>();
  private readonly onGround = ConsumerSubject.create(this.sub.on('on_ground'), true);

  private readonly pilotWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_1'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:1', SimVarValueType.Pounds));
  private readonly copilotWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_2'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:2', SimVarValueType.Pounds));
  private readonly tksFluidWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_7'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:7', SimVarValueType.Pounds));
  private readonly passMidWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_5'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:5', SimVarValueType.Pounds));
  private readonly passLeftWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_3'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:3', SimVarValueType.Pounds));
  private readonly passRightWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_4'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:4', SimVarValueType.Pounds));
  private readonly baggageWeightSimValue = ConsumerValue.create(this.sub.on('payload_station_weight_6'), SimVar.GetSimVarValue('PAYLOAD STATION WEIGHT:6', SimVarValueType.Pounds));

  private readonly _fuelInitializedGallons = Subject.create(SimVar.GetSimVarValue(FuelComputerSimVars.Remaining, SimVarValueType.GAL));

  // The aircraft load weight entries.
  private readonly _pilotWeight = Subject.create(this.pilotWeightSimValue.get());
  private readonly _copilotWeight = Subject.create(this.copilotWeightSimValue.get());
  private readonly _tksFluidWeight = Subject.create(this.tksFluidWeightSimValue.get());
  private readonly _passMidWeight = Subject.create(this.passMidWeightSimValue.get());
  private readonly _passLeftWeight = Subject.create(this.passLeftWeightSimValue.get());
  private readonly _passRightWeight = Subject.create(this.passRightWeightSimValue.get());
  private readonly _baggageWeight = Subject.create(this.baggageWeightSimValue.get());
  private readonly _aircraftLoad = MappedSubject.create<number[], number>(
    (weights) => weights.reduce((acc, current) => acc + current, 0),
    this._pilotWeight,
    this._copilotWeight,
    this._tksFluidWeight,
    this._passLeftWeight,
    this._passMidWeight,
    this._passRightWeight,
    this._baggageWeight
  );

  private readonly _taxiFuelWeight = Subject.create(0);

  // The aircraft load weight temporary values from Weight&Balance page inputs.
  private readonly _pilotWeightInput = Subject.create(this.pilotWeightSimValue.get());
  private readonly _copilotWeightInput = Subject.create(this.copilotWeightSimValue.get());
  private readonly _tksFluidWeightInput = Subject.create(this.tksFluidWeightSimValue.get());
  private readonly _passMidWeightInput = Subject.create(this.passMidWeightSimValue.get());
  private readonly _passLeftWeightInput = Subject.create(this.passLeftWeightSimValue.get());
  private readonly _passRightWeightInput = Subject.create(this.passRightWeightSimValue.get());
  private readonly _baggageWeightInput = Subject.create(this.baggageWeightSimValue.get());
  private readonly _taxiFuelWeightInput = Subject.create<number>(this._taxiFuelWeight.get());

  // The weights displayed in `Aircraft Weight and Balance` section of the page.
  /**Source https://en.wikipedia.org/wiki/Cirrus_SR22, SR22T section */
  private readonly _basicEmptyWeight = Subject.create(2348);
  private readonly _zeroFuelWeight = MappedSubject.create<number[], number>(
    ([basicEmptyWeight, aircraftLoad]) => Math.round(basicEmptyWeight + aircraftLoad),
    this._basicEmptyWeight,
    this._aircraftLoad
  );
  private readonly _fuelOnBoardGallons = ConsumerSubject.create<number>(
    this.sub.on('remainingFuel').withPrecision(1),
    SimVar.GetSimVarValue(FuelComputerSimVars.Remaining, SimVarValueType.GAL)
  );
  private readonly _fuelOnBoard = this._fuelOnBoardGallons.map((gal) => UnitType.GALLON_FUEL.convertTo(gal, UnitType.POUND));
  private readonly _estimatedFuelAtLanding = Subject.create(-1);

  private readonly _rampWeight = MappedSubject.create<number[], number>(
    ([zfw, initialFuel]) => zfw + UnitType.GALLON_FUEL.convertTo(initialFuel, UnitType.POUND),
    this._zeroFuelWeight,
    this._fuelInitializedGallons
  );

  private readonly _takeoffWeight = MappedSubject.create<number[], number>(
    ([rampWeight, taxiFuelWeight]) => rampWeight - taxiFuelWeight,
    this._rampWeight,
    this._taxiFuelWeightInput
  );
  private readonly _currentWeight = MappedSubject.create<number[], number>(
    ([zeroFuelWeight, currentFuelOnBoard]) => zeroFuelWeight + currentFuelOnBoard,
    this._zeroFuelWeight,
    this._fuelOnBoard
  );
  private readonly _station = Subject.create<number>(0);
  private readonly _macPercent = Subject.create<number>(0);

  // The proxies to access the respective privately calculated weights.
  public readonly basicEmptyWeight = this._basicEmptyWeight as Subscribable<number>;
  public readonly zeroFuelWeight = this._zeroFuelWeight as Subscribable<number>;
  public readonly fuelOnBoard = this._fuelOnBoard as Subscribable<number>;
  public readonly rampWeight = this._rampWeight as Subscribable<number>;
  public readonly takeoffWeight = this._takeoffWeight as Subscribable<number>;
  public readonly currentWeight = this._currentWeight as Subscribable<number>;
  public readonly station = this._station as Subscribable<number>;
  public readonly macPercent = this._macPercent as Subscribable<number>;

  // Moment arms for the CG calculation:
  private readonly sr22tStations: WeightDefinition[] = [
    { type: WeightTypes.Pilot, weightDisplacement: 140.5 },
    { type: WeightTypes.Copilot, weightDisplacement: 140.5 },
    { type: WeightTypes.RearL, weightDisplacement: 180.0 },
    { type: WeightTypes.RearM, weightDisplacement: 180.0 },
    { type: WeightTypes.RearR, weightDisplacement: 180.0 },
    { type: WeightTypes.Baggage, weightDisplacement: 208.0 },
    { type: WeightTypes.TksFluid, weightDisplacement: 140.0 },
    { type: WeightTypes.Fuel, weightDisplacement: 154.9 },
    { type: WeightTypes.EmptyWeight, weightDisplacement: 140.0 },
  ];

  // Public subscribables for CG conditions:
  public readonly cgAtTakeOff = Subject.create<WeightCgDataset | undefined>(undefined);
  public readonly cgCurrent = MappedSubject.create<number[], WeightCgDataset>(
    ([pilotWeight, copilotWeight, tksFluidWeight, passLWeight, passMWeight, passRWeight, baggageWeight, fuelWeight]) => {
      return this.getCgData(pilotWeight, copilotWeight, tksFluidWeight, passLWeight, passMWeight, passRWeight, baggageWeight, fuelWeight);
    },
    this._pilotWeightInput,
    this._copilotWeightInput,
    this._tksFluidWeightInput,
    this._passLeftWeightInput,
    this._passMidWeightInput,
    this._passRightWeightInput,
    this._baggageWeightInput,
    this._fuelOnBoard
  );
  public readonly cgAtLanding = MappedSubject.create<number[], WeightCgDataset>(
    ([pilotWeight, copilotWeight, tksFluidWeight, passLWeight, passMWeight, passRWeight, baggageWeight, fuelWeight]) => {
      return this.getCgData(pilotWeight, copilotWeight, tksFluidWeight, passLWeight, passMWeight, passRWeight, baggageWeight, fuelWeight);
    },
    this._pilotWeightInput,
    this._copilotWeightInput,
    this._tksFluidWeightInput,
    this._passLeftWeightInput,
    this._passMidWeightInput,
    this._passRightWeightInput,
    this._baggageWeightInput,
    this._estimatedFuelAtLanding
  );
  public readonly cgZeroFuel = MappedSubject.create<number[], WeightCgDataset>(
    ([pilotWeight, copilotWeight, tksFluidWeight, passLWeight, passMWeight, passRWeight, baggageWeight]) => {
      return this.getCgData(pilotWeight, copilotWeight, tksFluidWeight, passLWeight, passMWeight, passRWeight, baggageWeight, 0);
    },
    this._pilotWeightInput,
    this._copilotWeightInput,
    this._tksFluidWeightInput,
    this._passLeftWeightInput,
    this._passMidWeightInput,
    this._passRightWeightInput,
    this._baggageWeightInput,
  );

  /**
   * Calculates the CG data for a given set of weights:
   * @param pilotWeight pilot weight
   * @param copilotWeight copilot weight
   * @param tksFluidWeight tks fluid weight
   * @param passLWeight left rear passenger weight
   * @param passMWeight mid rear passenger weight
   * @param passRWeight right rear passenger weight
   * @param baggageWeight baggage weight
   * @param fuelWeight fuel weight
   * @returns a weight and CG dataset. CG in inches.
   */
  private getCgData(
    pilotWeight: number,
    copilotWeight: number,
    tksFluidWeight: number,
    passLWeight: number,
    passMWeight: number,
    passRWeight: number,
    baggageWeight: number,
    fuelWeight: number): WeightCgDataset {
    // If the fuel weight is negative, the data is invalid (e.g. no landing data available).
    if (fuelWeight < 0) {
      return { weight: 0, cgPosition: 0, cgPercentage: 0, isOutOfCGEnvelope: false, isWeightInvalid: false };
    }
    const emptyWeight = this._basicEmptyWeight.get();
    const totalWeight = pilotWeight + copilotWeight + tksFluidWeight + passLWeight + passMWeight + passRWeight + baggageWeight + fuelWeight + emptyWeight;
    const cg =
      (pilotWeight * this.sr22tStations[WeightTypes.Pilot].weightDisplacement +
        copilotWeight * this.sr22tStations[WeightTypes.Copilot].weightDisplacement +
        tksFluidWeight * this.sr22tStations[WeightTypes.TksFluid].weightDisplacement +
        passLWeight * this.sr22tStations[WeightTypes.RearL].weightDisplacement +
        passMWeight * this.sr22tStations[WeightTypes.RearM].weightDisplacement +
        passRWeight * this.sr22tStations[WeightTypes.RearR].weightDisplacement +
        baggageWeight * this.sr22tStations[WeightTypes.Baggage].weightDisplacement +
        fuelWeight * this.sr22tStations[WeightTypes.Fuel].weightDisplacement +
        emptyWeight * this.sr22tStations[WeightTypes.EmptyWeight].weightDisplacement) / totalWeight;
    const cgPercent = 100 * (cg - 133.1) / 47.7; // POH, pg 6-3
    // We now need to check, whether the point is laying withing the valid CG envelope, which is defined as follows:
    const posAftMin = 137.4;
    const posAftMinAtSlopeChange = 138.8;
    const posAftMinAtMaxWeight = 143;
    const posAftMax = 148.1;
    const weightMin = 2090;
    const weightAtSlopeChange = 2760;
    const weightMax = 3600;
    const isWeightInvalid = totalWeight < weightMin || totalWeight > weightMax;
    let isOutsideEnvelope = true;
    if ((weightMin <= totalWeight) && (totalWeight < weightAtSlopeChange)) {
      // Check for the band below the slope change:
      if ((posAftMin + (posAftMinAtSlopeChange - posAftMin) * (totalWeight - weightMin) / (weightAtSlopeChange - weightMin) < cg)
        && cg < posAftMax) {
        isOutsideEnvelope = false;
      }
    } else if ((weightAtSlopeChange <= totalWeight) && (totalWeight <= weightMax)) {
      // Check for the band above the slope change:
      if ((posAftMinAtSlopeChange + (posAftMinAtMaxWeight - posAftMinAtSlopeChange) * (totalWeight - weightAtSlopeChange) / (weightMax - weightAtSlopeChange) < cg)
        && cg < posAftMax) {
        isOutsideEnvelope = false;
      }
    }
    return { weight: totalWeight, cgPosition: cg, cgPercentage: cgPercent, isOutOfCGEnvelope: isOutsideEnvelope, isWeightInvalid };
  }

  /**
   * Creates an instace of the WeightBalanceStore.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
    // Update the take off CG data, if the on ground condition changes or a new takeoff weight is available:
    MappedSubject.create(this.onGround, this._takeoffWeight).sub(() => {
      this.cgAtTakeOff.set(
        this.getCgData(
          this._pilotWeightInput.get(),
          this._copilotWeightInput.get(),
          this._tksFluidWeightInput.get(),
          this._passLeftWeightInput.get(),
          this._passMidWeightInput.get(),
          this._passRightWeightInput.get(),
          this._baggageWeightInput.get(),
          UnitType.GALLON_FUEL.convertTo(this._fuelInitializedGallons.get(), UnitType.POUND) - this._taxiFuelWeightInput.get()));
    }, true);

    this.cgCurrent.sub((v: WeightCgDataset) => {
      this._macPercent.set(v.cgPercentage);
      this._station.set(v.cgPosition);
    }, true);

    this.sub.on('fuel_adjusted_qty').handle((adjustedFuel) => {
      this._fuelInitializedGallons.set(adjustedFuel);
    });
  }

  /* STORED SUBJECT */

  /** The pilot's weight subscribable. */
  public readonly pilotWeight = this._pilotWeight as Subscribable<number>;

  /** The copilot's weight subscribable. */
  public readonly copilotWeight = this._copilotWeight as Subscribable<number>;

  /** The TKS Fluid weight subscribable. */
  public readonly tksFluidWeight = this._tksFluidWeight as Subscribable<number>;

  /** The middle passenger's weight subscribable. */
  public readonly passMidWeight = this._passMidWeight as Subscribable<number>;

  /** The left passenger's weight subscribable. */
  public readonly passLeftWeight = this._passLeftWeight as Subscribable<number>;

  /** The right passenger's weight subscribable. */
  public readonly passRightWeight = this._passRightWeight as Subscribable<number>;

  /** The baggage weight subscribable. */
  public readonly baggageWeight = this._baggageWeight as Subscribable<number>;

  /** The taxi fuel weight subscribable. */
  public readonly taxiFuelWeight = this._taxiFuelWeight as Subscribable<number>;

  /* TEMPORARY INPUT SUBJECT */

  /** The temporary pilot's weight subscribable. */
  public readonly pilotWeightInput = this._pilotWeightInput as MutableSubscribable<number>;

  /** The temporary copilot's weight subscribable. */
  public readonly copilotWeightInput = this._copilotWeightInput as MutableSubscribable<number>;

  /** The temporary TKS Fluid weight subscribable. */
  public readonly tksFluidWeightInput = this._tksFluidWeightInput as MutableSubscribable<number>;

  /** The temporary middle passenger's weight subscribable.*/
  public readonly passMidWeightInput = this._passMidWeightInput as MutableSubscribable<number>;

  /** The temporary left passenger's weight subscribable. */
  public readonly passLeftWeightInput = this._passLeftWeightInput as MutableSubscribable<number>;

  /** The temporary right passenger's weight subscribable. */
  public readonly passRightWeightInput = this._passRightWeightInput as MutableSubscribable<number>;

  /** The temporary baggage weight subscribable. */
  public readonly baggageWeightInput = this._baggageWeightInput as MutableSubscribable<number>;

  /** The temporary taxi fuel weight subscribable. */
  public readonly taxiFuelWeightInput = this._taxiFuelWeightInput as MutableSubscribable<number>;

  /** The estimated fuel weight at landing subscribable. */
  public readonly estimatedFuelAtLanding = this._estimatedFuelAtLanding as MutableSubscribable<number>;

  /** Resets temporary subject values to the currently stored values */
  public resetTemporaryWeights(): void {
    this._pilotWeightInput.set(this.pilotWeight.get());
    this._copilotWeightInput.set(this.copilotWeight.get());
    this._tksFluidWeightInput.set(this.tksFluidWeight.get());
    this._passMidWeightInput.set(this.passMidWeight.get());
    this._passLeftWeightInput.set(this.passLeftWeight.get());
    this._passRightWeightInput.set(this.passRightWeight.get());
    this._baggageWeightInput.set(this.baggageWeight.get());
    this._taxiFuelWeightInput.set(this.taxiFuelWeight.get());
  }

  /** Stores temporary subject values to the stored subjects */
  public storeTemporaryWeights(): void {
    this._pilotWeight.set(this.pilotWeightInput.get());
    this._copilotWeight.set(this.copilotWeightInput.get());
    this._tksFluidWeight.set(this.tksFluidWeightInput.get());
    this._passMidWeight.set(this.passMidWeightInput.get());
    this._passLeftWeight.set(this.passLeftWeightInput.get());
    this._passRightWeight.set(this.passRightWeightInput.get());
    this._baggageWeight.set(this.baggageWeightInput.get());
    this._taxiFuelWeight.set(this.taxiFuelWeightInput.get());
  }
}