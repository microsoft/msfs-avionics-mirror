import { ConsumerSubject, EventBus, FlightPlanner, Subscribable } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { G3XExternalNavigatorIndex } from '../CommonTypes';
import { G3XFplSourceDataProvider, G3XFplSourceDataProviderSourceDef } from './G3XFplSourceDataProvider';
import { G3XFplSourceEvents } from './G3XFplSourceEvents';
import { G3XFplSource } from './G3XFplSourceTypes';

/**
 * A default implementation of `G3XFplSourceDataProvider`.
 */
export class DefaultG3XFplSourceDataProvider implements G3XFplSourceDataProvider {

  /** @inheritDoc */
  public readonly externalSourceDefs: readonly (Readonly<G3XFplSourceDataProviderSourceDef> | undefined)[];

  /** @inheritDoc */
  public readonly externalSourceCount: 0 | 1 | 2;

  private readonly _source = ConsumerSubject.create(null, G3XFplSource.Internal);
  /** @inheritDoc */
  public readonly source = this._source as Subscribable<G3XFplSource>;

  private readonly def = this._source.map(source => {
    let def: Readonly<G3XFplSourceDataProviderSourceDef> | undefined = undefined;
    switch (source) {
      case G3XFplSource.External1:
        def = this.externalSourceDefs[1];
        break;
      case G3XFplSource.External2:
        def = this.externalSourceDefs[2];
        break;
    }

    return def ?? this.internalSourceDef;
  });

  /** @inheritDoc */
  public readonly navigatorIndex = this.def.map(def => def.externalNavigatorIndex ?? 0) as Subscribable<0 | G3XExternalNavigatorIndex>;

  /** @inheritDoc */
  public readonly fms = this.def.map(def => def.fms) as Subscribable<Fms>;

  /** @inheritDoc */
  public readonly fmsId = this.fms.map(fms => fms.flightPlanner.id);

  /** @inheritDoc */
  public readonly flightPlanner = this.fms.map(fms => fms.flightPlanner) as Subscribable<FlightPlanner>;

  /** @inheritDoc */
  public readonly lnavIndex = this.def.map(def => def.lnavIndex) as Subscribable<number>;

  /** @inheritDoc */
  public readonly vnavIndex = this.def.map(def => def.vnavIndex) as Subscribable<number>;

  /** @inheritDoc */
  public readonly cdiId = this.def.map(def => def.cdiId) as Subscribable<string>;

  private isInit = false;
  private isAlive = true;
  private isPaused = true;

  /**
   * Creates a new instance of DefaultG3XFplSourceDataProvider.
   * @param bus The event bus.
   * @param internalSourceDef The definition describing the internal flight plan source.
   * @param externalSourceDefs Definitions describing the external flight plan sources. The index of each definition
   * should correspond with the index of the source's external navigator.
   */
  public constructor(
    private readonly bus: EventBus,
    public readonly internalSourceDef: Readonly<G3XFplSourceDataProviderSourceDef>,
    externalSourceDefs: readonly (Readonly<G3XFplSourceDataProviderSourceDef> | undefined)[]
  ) {
    this.externalSourceDefs = Array.from(externalSourceDefs);
    this.externalSourceCount = this.externalSourceDefs.reduce((count, def) => count + (def ? 1 : 0), 0 as number) as 0 | 1 | 2;
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultG3XFplSourceDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<G3XFplSourceEvents>();

    this._source.setConsumer(sub.on('g3x_fpl_source_current'));

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultG3XFplSourceDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._source.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultG3XFplSourceDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this._source.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._source.destroy();
  }
}
