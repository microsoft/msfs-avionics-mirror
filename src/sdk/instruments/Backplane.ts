/**
 * An instrument supported by {@link InstrumentBackplane}.
 */
export interface Instrument {
  /** Initializes this instrument. */
  init(): void;

  /** Updates this instrument. */
  onUpdate(): void;
}

/**
 * A publisher supported by {@link BackplanePublisher}
 */
export interface BackplanePublisher {
  /** Sets this publisher to begin publishing. */
  startPublish(): void;

  /** Updates this publisher. */
  onUpdate(): void;
}

/**
 * InstrumentBackplane provides a common control point for aggregating and
 * managing any number of publishers.  This can be used as an "update loop"
 * corral", amongst other things.
 */
export class InstrumentBackplane {
  // TODO Simplify the backplane
  // Now that we've added instruments and have a lot of redundant
  // logic for them as compared to publishers, we should reconsider
  // how we want the backplane to work.
  private publishers: Map<string, BackplanePublisher>;
  private instruments: Map<string, Instrument>;

  /**
   * Create an InstrumentBackplane
   */
  public constructor() {
    this.publishers = new Map<string, BackplanePublisher>();
    this.instruments = new Map<string, Instrument>();
  }

  /**
   * Initialize all the things. This is initially just a proxy for the
   * private initPublishers() and initInstruments() methods.
   *
   * This should be simplified.
   */
  public init(): void {
    this.initPublishers();
    this.initInstruments();
  }

  /**
   * Update all the things.  This is initially just a proxy for the private
   * updatePublishers() and updateInstruments() methods.
   *
   * This should be simplified.
   */
  public onUpdate(): void {
    this.updatePublishers();
    this.updateInstruments();
  }

  /**
   * Add a publisher to this backplane.
   * @param name A symbolic name for the publisher for reference.
   * @param publisher The publisher to add.
   * @param override Whether to override any existing publishers added to this backplane under the same name. If
   * `true`, any existing publisher with the same name will removed from this backplane and the new one added in its
   * place. If `false`, the new publisher will not be added if this backplane already has a publisher with the same
   * name or a publisher of the same type. Defaults to `false`.
   */
  public addPublisher(name: string, publisher: BackplanePublisher, override = false): void {
    if (override || !InstrumentBackplane.checkAlreadyExists(name, publisher, this.publishers)) {
      this.publishers.set(name, publisher);
    }
  }

  /**
   * Add an instrument to this backplane.
   * @param name A symbolic name for the instrument for reference.
   * @param instrument The instrument to add.
   * @param override Whether to override any existing instruments added to this backplane under the same name. If
   * `true`, any existing instrument with the same name will removed from this backplane and the new one added in its
   * place. If `false`, the new instrument will not be added if this backplane already has an instrument with the same
   * name or an instrument of the same type. Defaults to `false`.
   */
  public addInstrument(name: string, instrument: Instrument, override = false): void {
    if (override || !InstrumentBackplane.checkAlreadyExists(name, instrument, this.instruments)) {
      this.instruments.set(name, instrument);
    }
  }

  /**
   * Gets a publisher from this backplane.
   * @param name The name of the publisher to get.
   * @returns The publisher in this backplane with the specified name, or `undefined` if there is no such publisher.
   */
  public getPublisher<T extends BackplanePublisher = BackplanePublisher>(name: string): T | undefined {
    return this.publishers.get(name) as T | undefined;
  }

  /**
   * Gets an instrument from this backplane.
   * @param name The name of the instrument to get.
   * @returns The instrument in this backplane with the specified name, or `undefined` if there is no such instrument.
   */
  public getInstrument<T extends Instrument = Instrument>(name: string): T | undefined {
    return this.instruments.get(name) as T | undefined;
  }

  /**
   * Checks for duplicate publishers or instruments of the same name or type.
   * @param name the name of the publisher or instrument
   * @param objToCheck the object to check
   * @param map the map to check
   * @returns true if the object is already in the map
   */
  private static checkAlreadyExists(name: string, objToCheck: any, map: Map<string, any>): boolean {
    if (map.has(name)) {
      console.warn(`${name} already exists in backplane.`);
      return true;
    }

    // check if there already is a publisher with the same type
    for (const p of map.values()) {
      if (p.constructor === objToCheck.constructor) {
        console.warn(`${name} already exists in backplane.`);
        return true;
      }
    }

    return false;
  }

  /**
   * Initialize all of the publishers that you hold.
   */
  private initPublishers(): void {
    for (const publisher of this.publishers.values()) {
      publisher.startPublish();
    }
  }

  /**
   * Initialize all of the instruments that you hold.
   */
  private initInstruments(): void {
    for (const instrument of this.instruments.values()) {
      instrument.init();
    }
  }

  /**
   * Update all of the publishers that you hold.
   */
  private updatePublishers(): void {
    for (const publisher of this.publishers.values()) {
      publisher.onUpdate();
    }
  }

  /**
   * Update all of the instruments that you hold.
   */
  private updateInstruments(): void {
    for (const instrument of this.instruments.values()) {
      instrument.onUpdate();
    }
  }
}