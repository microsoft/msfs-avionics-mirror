import { ConsumerSubject, EngineEvents, EventBus, Instrument, SimVarValueType } from '@microsoft/msfs-sdk';

/** An instrument to simulate engine temperature data in the Cirrus SR22T */
export class Sr22tEngineTemperatureDataInstrument implements Instrument {
  private readonly chtPctMaxVariation = 3;  // %, maximum percent variation from average CHT for the most extreme cylinder (hottest and coldest)
  private readonly titPctMaxVariation = 2;  // %, maximum percent variation from average TIT for the most extreme turbine  (hottest and coldest)
  private readonly egtPctMaxVariation = 2;  // %, maximum percent variation from average EGT for the most extreme cylinder (hottest and coldest)


  // Source Engine Sim Vars
  private readonly CHT_Subject = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('cylinder_head_temp_avg_1').withPrecision(0), 0);  // Fahrenheit
  private readonly EGT_Subject = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('egt_1').withPrecision(0), 0);                     // Fahrenheit
  private readonly TIT_Subject = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('recip_turbine_inlet_temp_avg_1').withPrecision(0), 0);  // Fahrenheit

  private cylinderArray = [
    // cylinder 1
    {
      tempOrder: 3, // coldest to hottest
    },
    // cylinder 2
    {
      tempOrder: 2, // coldest to hottest
    },
    // cylinder 3
    {
      tempOrder: 6, // coldest to hottest
    },
    // cylinder 4
    {
      tempOrder: 4, // coldest to hottest
    },
    // cylinder 5
    {
      tempOrder: 1, // coldest to hottest
    },
    // cylinder 6
    {
      tempOrder: 5, // coldest to hottest
    },
  ];

  private turbineArray = [
    // Turbine 1
    {
      tempOrder: 2, // coldest to hottest
    },
    // Turbine 2
    {
      tempOrder: 1, // coldest to hottest
    },
  ];


  /**
   * Ctor
   * @param bus The event bus
   */
  constructor(private readonly bus: EventBus) {
    // noop
  }

  /** @inheritDoc */
  public init(): void {
    this.CHT_Subject.sub(this.simulateCHTs.bind(this), true);
    this.TIT_Subject.sub(this.simulateTITs.bind(this), true);
    this.EGT_Subject.sub(this.simulateEGTs.bind(this), true);
  }

  /** @inheritDoc */
  public onUpdate(): void {
    // noop
  }

  /**
   * Simulates CHT temperatures
   * @param cht The global CHT value as basis
   */
  private simulateCHTs(cht: number): void {

    for (let cylinderIndex = 0; cylinderIndex < this.cylinderArray.length; cylinderIndex++) {

      const tempVariationFactor = (this.cylinderArray[cylinderIndex].tempOrder - (this.cylinderArray.length / 2)) / (this.cylinderArray.length / 2);
      const cylinderCHT = cht + (cht * (this.chtPctMaxVariation / 100) * tempVariationFactor);

      const simVarName = `L:C${cylinderIndex + 1}_HEAD_TEMP`;
      SimVar.SetSimVarValue(simVarName, SimVarValueType.Farenheit, cylinderCHT);
    }
  }

  /**
   * Simulates TIT temperatures
   * @param tit The global TIT value as basis
   */
  private simulateTITs(tit: number): void {

    for (let tubineIndex = 0; tubineIndex < this.turbineArray.length; tubineIndex++) {

      const tempVariationFactor = (this.turbineArray[tubineIndex].tempOrder - (this.turbineArray.length / 2)) / (this.turbineArray.length / 2);
      const turbineTIT = tit + (tit * (this.titPctMaxVariation / 100) * tempVariationFactor);

      const simVarName = `L:T${tubineIndex + 1}_INLET_TEMP`;
      SimVar.SetSimVarValue(simVarName, SimVarValueType.Farenheit, turbineTIT);
    }
  }

  /**
   * Simulates EGT temperatures
   * @param egt The global TIT value as basis
   */
  private simulateEGTs(egt: number): void {

    for (let cylinderIndex = 0; cylinderIndex < this.cylinderArray.length; cylinderIndex++) {

      const tempVariationFactor = (this.cylinderArray[cylinderIndex].tempOrder - (this.cylinderArray.length / 2)) / (this.cylinderArray.length / 2);
      const cylinderEGT = egt + (egt * (this.egtPctMaxVariation / 100) * tempVariationFactor);

      const simVarName = `L:C${cylinderIndex + 1}_EXHAUST_TEMP`;
      SimVar.SetSimVarValue(simVarName, SimVarValueType.Farenheit, cylinderEGT);
    }
  }

}