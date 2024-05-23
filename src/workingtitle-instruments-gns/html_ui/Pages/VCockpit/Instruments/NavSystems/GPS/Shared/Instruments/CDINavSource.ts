import {
  CdiControlEvents, CdiEvents, CdiUtils, EventBus, NavRadioIndex, NavSourceId, NavSourceType, SimVarValueType,
  Subject, Subscribable
} from '@microsoft/msfs-sdk';

import { GNSType } from '../UITypes';

/** Possible GNS CDI Modes */
export enum GnsCdiMode {
  VLOC,
  GPS
}

/**
 * An instrument that aggregates and manages CDI source navigation data.
 */
export class CDINavSource {

  private readonly publisher = this.bus.getPublisher<CdiEvents>();

  private readonly cdiId = `gns${this.navIndex}`;

  private readonly cdiSelectTopic = `cdi_select${CdiUtils.getEventBusTopicSuffix(this.cdiId)}` as const;
  private readonly cdiSimVar = `L:AS${this.gnsType === 'wt430' ? '430' : '530'}_CDI_Source_${this.instrumentIndex}`;

  private readonly _gnsCdiMode = Subject.create(GnsCdiMode.GPS);
  /** The current CDI mode. */
  public readonly gnsCdiMode = this._gnsCdiMode as Subscribable<GnsCdiMode>;

  /**
   * Creates an instance of CDINavSource.
   * @param gnsType The GNS type of this class's parent instrument.
   * @param instrumentIndex The index of this class's parent instrument.
   * @param navIndex The NAV radio index of this class's parent instrument.
   * @param bus The event bus to use with this instance.
   */
  constructor(
    private readonly gnsType: GNSType,
    private readonly instrumentIndex: number,
    private readonly navIndex: NavRadioIndex,
    private readonly bus: EventBus
  ) {
    this.gnsCdiMode.sub(this.publishCdiSource.bind(this), true);

    const sub = this.bus.getSubscriber<CdiControlEvents>();

    const cdiTopicSuffix = CdiUtils.getEventBusTopicSuffix(this.cdiId);

    sub.on(`cdi_src_gps_toggle${cdiTopicSuffix}`).handle(this.toggleMode.bind(this));
    sub.on(`cdi_src_set${cdiTopicSuffix}`).handle(this.setCdiSource.bind(this));

    SimVar.SetSimVarValue(`L:AS${gnsType}_CDI_Source_${this.instrumentIndex}`, SimVarValueType.Bool, true);
  }

  /**
   * Toggles the CDI source between GPS and NAV.
   */
  private toggleMode(): void {
    this._gnsCdiMode.set(this.gnsCdiMode.get() === GnsCdiMode.GPS ? GnsCdiMode.VLOC : GnsCdiMode.GPS);
  }

  /**
   * Sets the CDI source.
   * @param source The source to set.
   */
  private setCdiSource(source: Readonly<NavSourceId>): void {
    if (source.type === NavSourceType.Gps) {
      this._gnsCdiMode.set(GnsCdiMode.GPS);
    } else {
      this._gnsCdiMode.set(GnsCdiMode.VLOC);
    }
  }

  /**
   * Publishes a CDI source based on a CDI mode.
   * @param mode The CDI mode to publish.
   */
  private publishCdiSource(mode: GnsCdiMode): void {
    const isGps = mode === GnsCdiMode.GPS;
    SimVar.SetSimVarValue(this.cdiSimVar, SimVarValueType.Bool, isGps);
    this.publisher.pub(this.cdiSelectTopic, { type: isGps ? NavSourceType.Gps : NavSourceType.Nav, index: this.navIndex }, true, true);
  }
}