import { Subscribable } from '../sub';
import { Subject } from '../sub/Subject';


/**
 * Describes a temperature source in the temperature system.
 */
export interface TemperatureSource {

  /** The temperature, in degrees Celsius. */
  temperature: number;

  /** The node thermal conductivity, in watts per kelvin.  */
  conductivity: number;
}

/**
 * A closed heat system with temperature sources contributing to a volume.
 */
export class TemperatureSystem {
  private readonly sources: TemperatureSource[] = [];
  private readonly _value = Subject.create(0);

  /**
   * Gets the system's output value.
   * @returns The system's output temperature value, in degrees Celsius.
   */
  public get value(): Subscribable<number> {
    return this._value;
  }

  /**
   * Creates an instance of a TemperatureSystem.
   * @param capacity The heat capacity of the system, in joules per kelvin.
   */
  constructor(private capacity: number) { }

  /**
   * Directly sets the current temperature value.
   * @param value The temperature value, in degrees Celsius.
   */
  public set(value: number): void {
    this._value.set(Math.max(-273.15, value));
  }

  /**
   * Adds a temperature source.
   * @param source The temperature source.
   * @returns The index of the added temperature source.
   */
  public addSource(source: TemperatureSource): number {
    return this.sources.push(source) - 1;
  }

  /**
   * Sets the temperature of a temperature source.
   * @param index The index of the source.
   * @param temperature The temperature to set to, in degrees Celsius.
   */
  public setSourceTemp(index: number, temperature: number): void {
    const source = this.sources[index];
    if (source !== undefined) {
      source.temperature = temperature;
    }
  }

  /**
   * Sets the conductivity of a temperature source.
   * @param index The index of the source.
   * @param conductivity The conductivity to set to, in watts per meter-kelvin.
   */
  public setSourceConductivity(index: number, conductivity: number): void {
    const source = this.sources[index];
    if (source !== undefined) {
      source.conductivity = conductivity;
    }
  }

  /**
   * Sets the heat capacity of the system.
   * @param capacity The heat capacity of the system, in joules per kelvin.
   */
  public setCapacity(capacity: number): void {
    this.capacity = capacity;
  }

  /**
   * Updates the temperature of this system following a period of elapsed time. This method assumes that this system's
   * sources, their temperatures and conductivities, and this system's heat capacity at the time this method is called
   * all remained constant throughout the time elapsed.
   * @param deltaTime The elapsed time, in milliseconds.
   */
  public update(deltaTime: number): void {
    // If no time has elapsed, or if there are no heat sources/sinks, then the system temperature cannot change.
    if (deltaTime === 0 || this.sources.length === 0) {
      return;
    }

    // For each time step, assuming the temperature of the sources, their conductivities, and the system heat capacity
    // all remain constant, the total heat of the system, Q, is governed by the equation
    // dQ/dt = A + k_s * Q(t) / C
    // 
    // A = T_1 * k_1 + T_2 * k_2 + ... T_n * k_n,
    //   where T_i, k_i are the absolute temperature and thermal conductivity, respectively, of source i
    //
    // k_s = k_1 + k_2 + ... + k_n
    //
    // C is the system's heat capacity
    //
    // Solving the first-order DE above yields
    // Q(t) = A * C / k_s + (Q(0) - A * C / k_s) * e ^ (-k_s * t / C)

    const Q0 = (this._value.get() + 273.15) * this.capacity;

    let A = 0, k = 0;

    for (let i = 0; i < this.sources.length; i++) {
      const source = this.sources[i];
      A += Math.max(source.temperature + 273.15, 0) * source.conductivity;
      k += source.conductivity;
    }

    let Q: number;
    if (k === 0) {
      // If k_s equals 0, then the DE above simplifies to
      // dQ/dt = A
      //
      // Solving for Q(t) yields
      // Q(t) = Q(0) + A * t

      Q = Q0 + A * deltaTime / 1000;
    } else {
      const B = A * this.capacity / k;
      Q = B + (Q0 - B) * Math.exp(-k * deltaTime / 1000 / this.capacity);
    }

    this._value.set(Math.max(Q, 0) / this.capacity - 273.15);
  }
}