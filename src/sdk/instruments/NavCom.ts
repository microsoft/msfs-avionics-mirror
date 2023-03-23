/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/avionics" />
import { ControlEvents } from '../data/ControlPublisher';
import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { EventSubscriber } from '../data/EventSubscriber';
import { HEvent } from '../data/HEventPublisher';
import { SimVarDefinition, SimVarValueType } from '../data/SimVars';
import { ComSpacingChangeEvent } from './';
import { BasePublisher, SimVarPublisher } from './BasePublishers';
import { NavEvents, NavSourceId, NavSourceType } from './NavProcessor';
import { AdfRadioIndex, ComRadioIndex, ComSpacing, FrequencyBank, NavRadioIndex, Radio, RadioEvents, RadioType } from './RadioCommon';

// There are two main componints to the Nav/Com system currently, because we
// can't rely on K events being processed synchronously.   Instead, we need
// to run a listener which picks up frequency change events, in additon to a
// setter that handles interavion events via H events.

// The first part of this file sets uf the simvar publisher.
// TODO Do we want to move this into a generalized publisher for other things to use?

/**
 * Nav radio tuning event roots.
 */
type NavRadioTuneEventsRoot = {
  /** Nav radio active frequency, in megahertz. */
  nav_active_frequency: number;

  /** Nav radio standby frequency, in megahertz. */
  nav_standby_frequency: number;

  /** Nav radio ident string. */
  nav_ident: string;

  /** Nav radio signal strength, in arbitrary units. A value of `0` indicates no signal. */
  nav_signal: number;

  /** Whether nav radio audio monitoring is enabled. */
  nav_sound: boolean;

  /** Nav radio volume, as a percentage (0-100). */
  nav_volume: number;
};

/**
 * Tuning events for an indexed nav radio.
 */
type NavRadioTuneEventsIndexed<Index extends NavRadioIndex> = {
  [Event in keyof NavRadioTuneEventsRoot as `${Event}_${Index}`]: NavRadioTuneEventsRoot[Event];
};

/**
 * Events related to nav radio tuning.
 */
export interface NavRadioTuneEvents extends
  NavRadioTuneEventsIndexed<1>,
  NavRadioTuneEventsIndexed<2>,
  NavRadioTuneEventsIndexed<3>,
  NavRadioTuneEventsIndexed<4> {
}

/**
 * Com radio tuning event roots.
 */
type ComRadioTuneEventsRoot = {
  /** Com radio active frequency, in megahertz. */
  com_active_frequency: number;

  /** Com radio standby frequency, in megahertz. */
  com_standby_frequency: number;

  /** Com radio active frequency facility name. */
  com_active_facility_name: string;

  /** Com radio active frequency facility type. */
  com_active_facility_type: string;

  /** Com radio active frequency facility ident. */
  com_active_facility_ident: string;

  /** Whether a com radio is set to receive. */
  com_receive: boolean;

  /** Com radio status. */
  com_status: number;

  /** Whether a com radio is set to transmit. */
  com_transmit: boolean;

  /** Com radio spacing mode. */
  com_spacing_mode: ComSpacing;

  /** Com radio volume, as a percentage (0-100). */
  com_volume: number;
};

/**
 * Tuning events for an indexed com radio.
 */
type ComRadioTuneEventsIndexed<Index extends ComRadioIndex> = {
  [Event in keyof ComRadioTuneEventsRoot as `${Event}_${Index}`]: ComRadioTuneEventsRoot[Event];
};

/**
 * Events related to com radio tuning.
 */
export interface ComRadioTuneEvents extends
  ComRadioTuneEventsIndexed<1>,
  ComRadioTuneEventsIndexed<2>,
  ComRadioTuneEventsIndexed<3> {
}

/**
 * ADF radio tuning event roots.
 */
type AdfRadioTuneEventsRoot = {
  /** ADF radio active frequency, in kilohertz. */
  adf_active_frequency: number;

  /** ADF radio standby frequency, in kilohertz. */
  adf_standby_frequency: number;

  /** Whether ADF radio audio monitoring is enabled. */
  adf_sound: boolean;

  /** ADF radio volume, as a percentage (0-100). */
  adf_volume: number;

  /** ADF radio ident, as a string. */
  adf_ident: string;

  /** ADF radio signal, as a number. */
  adf_signal: number;
};

/**
 * Tuning events for an indexed ADF radio.
 */
type AdfRadioTuneEventsIndexed<Index extends AdfRadioIndex> = {
  [Event in keyof AdfRadioTuneEventsRoot as `${Event}_${Index}`]: AdfRadioTuneEventsRoot[Event];
};

/**
 * Events related to ADF radio tuning.
 */
export interface AdfRadioTuneEvents extends
  AdfRadioTuneEventsIndexed<1>,
  AdfRadioTuneEventsIndexed<2> {
}

/**
 * Events related to marker beacon tuning.
 */
export interface MarkerBeaconTuneEvents {
  /** Whether the marker beacon receiver is in high sensitivity mode. */
  marker_beacon_hisense_on: boolean;

  /** Whether marker beacon audio monitoring is enabled. */
  marker_beacon_sound: boolean;
}

/**
 * Events related to tuning nav, com, and ADF radios.
 */
export interface NavComSimVars extends ComRadioTuneEvents, NavRadioTuneEvents, AdfRadioTuneEvents, MarkerBeaconTuneEvents {
}

/**
 * A publisher of NAV, COM, ADF radio and marker beacon tuning-related sim var events.
 */
export class NavComSimVarPublisher extends SimVarPublisher<NavComSimVars> {
  private static readonly simvars = new Map<keyof NavComSimVars, SimVarDefinition>([
    ...NavComSimVarPublisher.createNavRadioDefinitions(1),
    ...NavComSimVarPublisher.createNavRadioDefinitions(2),
    ...NavComSimVarPublisher.createNavRadioDefinitions(3),
    ...NavComSimVarPublisher.createNavRadioDefinitions(4),
    ...NavComSimVarPublisher.createComRadioDefinitions(1),
    ...NavComSimVarPublisher.createComRadioDefinitions(2),
    ...NavComSimVarPublisher.createComRadioDefinitions(3),
    ...NavComSimVarPublisher.createAdfRadioDefinitions(1),
    ...NavComSimVarPublisher.createAdfRadioDefinitions(2),
    ['marker_beacon_hisense_on', { name: 'MARKER BEACON SENSITIVITY HIGH', type: SimVarValueType.Bool }],
    ['marker_beacon_sound', { name: 'MARKER SOUND', type: SimVarValueType.Bool }]
  ]);

  /**
   * Create a NavComSimVarPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the pace of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<NavComSimVars> | undefined = undefined) {
    super(NavComSimVarPublisher.simvars, bus, pacer);
  }

  /**
   * Creates an array of nav radio sim var event definitions for an indexed nav radio.
   * @param index The index of the nav radio.
   * @returns An array of nav radio sim var event definitions for the specified nav radio.
   */
  private static createNavRadioDefinitions<Index extends NavRadioIndex>(index: Index): [keyof NavRadioTuneEventsIndexed<Index>, SimVarDefinition][] {
    return [
      [`nav_active_frequency_${index}`, { name: `NAV ACTIVE FREQUENCY:${index}`, type: SimVarValueType.MHz }],
      [`nav_standby_frequency_${index}`, { name: `NAV STANDBY FREQUENCY:${index}`, type: SimVarValueType.MHz }],
      [`nav_signal_${index}`, { name: `NAV SIGNAL:${index}`, type: SimVarValueType.Number }],
      [`nav_sound_${index}`, { name: `NAV SOUND:${index}`, type: SimVarValueType.Bool }],
      [`nav_ident_${index}`, { name: `NAV IDENT:${index}`, type: SimVarValueType.String }],
      [`nav_volume_${index}`, { name: `NAV VOLUME:${index}`, type: SimVarValueType.Percent }],
    ];
  }

  /**
   * Creates an array of com radio sim var event definitions for an indexed com radio.
   * @param index The index of the com radio.
   * @returns An array of com radio sim var event definitions for the specified com radio.
   */
  private static createComRadioDefinitions<Index extends ComRadioIndex>(index: Index): [keyof ComRadioTuneEventsIndexed<Index>, SimVarDefinition][] {
    return [
      [`com_active_frequency_${index}`, { name: `COM ACTIVE FREQUENCY:${index}`, type: SimVarValueType.MHz }],
      [`com_standby_frequency_${index}`, { name: `COM STANDBY FREQUENCY:${index}`, type: SimVarValueType.MHz }],
      [`com_active_facility_name_${index}`, { name: `COM ACTIVE FREQ NAME:${index}`, type: SimVarValueType.String }],
      [`com_active_facility_type_${index}`, { name: `COM ACTIVE FREQ TYPE:${index}`, type: SimVarValueType.String }],
      [`com_active_facility_ident_${index}`, { name: `COM ACTIVE FREQ IDENT:${index}`, type: SimVarValueType.String }],
      // Note: 'COM RECEIVE' is whether the radio is receiving OR transmitting,
      // whereas 'COM RECEIVE EX1' is exclusively its receiving state.
      [`com_receive_${index}`, { name: `COM RECEIVE EX1:${index}`, type: SimVarValueType.Bool }],
      [`com_status_${index}`, { name: `COM STATUS:${index}`, type: SimVarValueType.Number }],
      [`com_transmit_${index}`, { name: `COM TRANSMIT:${index}`, type: SimVarValueType.Bool }],
      [`com_spacing_mode_${index}`, { name: `COM SPACING MODE:${index}`, type: SimVarValueType.Enum }],
      [`com_volume_${index}`, { name: `COM VOLUME:${index}`, type: SimVarValueType.Percent }],
    ];
  }

  /**
   * Creates an array of ADF radio sim var event definitions for an indexed ADF radio.
   * @param index The index of the ADF radio.
   * @returns An array of ADF radio sim var event definitions for the specified ADF radio.
   */
  private static createAdfRadioDefinitions<Index extends AdfRadioIndex>(index: Index): [keyof AdfRadioTuneEventsIndexed<Index>, SimVarDefinition][] {
    return [
      [`adf_active_frequency_${index}`, { name: `ADF ACTIVE FREQUENCY:${index}`, type: SimVarValueType.KHz }],
      [`adf_standby_frequency_${index}`, { name: `ADF STANDBY FREQUENCY:${index}`, type: SimVarValueType.KHz }],
      [`adf_sound_${index}`, { name: `ADF SOUND:${index}`, type: SimVarValueType.Bool }],
      [`adf_volume_${index}`, { name: `ADF VOLUME:${index}`, type: SimVarValueType.Percent }],
      [`adf_ident_${index}`, { name: `ADF IDENT:${index}`, type: SimVarValueType.String }],
      [`adf_signal_${index}`, { name: `ADF SIGNAL:${index}`, type: SimVarValueType.Number }],
    ];
  }
}


/**
 * A convenience class for creating a radio configuration set.
 *
 * Implementers should instantiate this and then populate the various maps
 * with the H events that their radio sends and which displays they affect.
 */
export class NavComConfig {
  public navSwitchEvents = new Map<string, string>();
  public navSelectorEvents = new Map<string, string>();
  public navWholeIncEvents = new Map<string, string>();
  public navWholeDecEvents = new Map<string, string>();
  public navFractionIncEvents = new Map<string, string>();
  public navFractionDecEvents = new Map<string, string>();
  public comSwitchEvents = new Map<string, string>();
  public comSelectorEvents = new Map<string, string>();
  public comWholeIncEvents = new Map<string, string>();
  public comWholeDecEvents = new Map<string, string>();
  public comFractionIncEvents = new Map<string, string>();
  public comFractionDecEvents = new Map<string, string>();
  public comVolumeIncEvents = new Map<string, string>();
  public comVolumeDecEvents = new Map<string, string>();
  public navVolumeIncEvents = new Map<string, string>();
  public navVolumeDecEvents = new Map<string, string>();
}

/**
 * Sends radio events from the nav/com controller to subscribers.
 */
class NavComPublisher extends BasePublisher<RadioEvents>{
  private sync: boolean;

  /**
   * Creates a NavComPublisher
   * @param bus The event bus to publish to.
   * @param pacer An optional pace to use to control the rate of publishing.
   * @param sync Whether to use synced events.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<RadioEvents>, sync = true) {
    super(bus, pacer);
    this.sync = sync;
  }

  /**
   * Publish a radio state event.
   *
   * This sets the complete state of a radio for initialzation or resync.
   * @param radio The Radio data to publish.
   */
  public publishRadioState(radio: Radio | undefined): void {
    if (radio !== undefined) {
      super.publish('set_radio_state', radio, this.sync);
    }
  }

  /**
   * Publish a frequency change event.
   *
   * Unlike a radio state event, this just changes a specific frequency.
   * We provide this to avoid issues with potentially conflicting updates
   * if active and standby get updated quickly and we send a snapshot after
   * each.
   * @param radio The Radio to change.
   * @param bank The frequency bank to update.
   * @param frequency The new frequency to set.
   */
  public publishFreqChange(radio: Radio, bank: FrequencyBank, frequency: number): void {
    if (radio !== undefined) {
      super.publish('set_frequency', { radio: radio, bank: bank, frequency: frequency }, this.sync);
    }
  }

  /**
   * Publish the ident of the currently tuned station.
   * @param index The index number of the tuned radio.
   * @param ident The ident as a string.
   */
  public publishIdent(index: number, ident: string): void {
    super.publish('set_ident', { index: index, ident: ident }, this.sync);
  }
  /**
   * Publish the signal strength of the currently tuned station.
   * @param index The index number of the tuned radio.
   * @param strength The signal strength as a number.
   */
  public publishSignalStrength(index: number, strength: number): void {
    super.publish('set_signal_strength', strength, this.sync);
  }
  /**
   * Publish the ADF1 Active Frequency in Khz.
   * @param freq The active frequency in Khz.
   */
  public publishAdfActiveFrequencySet(freq: number): void {
    super.publish('adf_active_frequency_1', freq, false);
  }
  /**
   * Publish the ADF1 Standby Frequency in Khz.
   * @param freq The standby frequency in Khz.
   */
  public publishAdfStandbyFrequencySet(freq: number): void {
    super.publish('adf_standby_frequency_1', freq, false);
  }
}

/**
 * The core instrument that will drive all of a system's radios.
 */
export class NavComInstrument {
  private bus: EventBus;
  private hevents: EventSubscriber<HEvent>;
  private publisher: NavComPublisher;
  private simVarPublisher: NavComSimVarPublisher;
  private simVarSubscriber: EventSubscriber<NavComSimVars>;
  private controlSubscriber: EventSubscriber<ControlEvents>;

  private navRadios = new Array<Radio>();
  private comRadios = new Array<Radio>();
  private config?: NavComConfig;

  /**
   * Create a NavComController.
   * @param bus The event bus to publish to.
   * @param config A NavComConfig object defining the radio configuration.
   * @param numNavRadios The number of nav radios in the system.
   * @param numComRadios The number of com radios in the system.
   * @param sync Whether to sync events or not, default true.
   */
  public constructor(bus: EventBus, config: NavComConfig | undefined, numNavRadios: number, numComRadios: number, sync = true) {
    this.bus = bus;
    this.config = config;

    // Populate our radio arrays.
    for (let i = 1; i <= numNavRadios; i++) {
      this.navRadios.push({
        index: i,
        activeFrequency: 0,
        ident: null,
        signal: 0,
        standbyFrequency: 0,
        radioType: RadioType.Nav,
        selected: false
      });
    }
    for (let i = 1; i <= numComRadios; i++) {
      this.comRadios.push({
        index: i,
        activeFrequency: 0,
        ident: null,
        signal: 0,
        standbyFrequency: 0,
        radioType: RadioType.Com,
        selected: false
      });
    }

    // Create our publishers and subscribers.
    this.hevents = this.bus.getSubscriber<HEvent>();
    this.publisher = new NavComPublisher(bus, undefined, sync);
    this.simVarPublisher = new NavComSimVarPublisher(this.bus);
    this.simVarSubscriber = new EventSubscriber<NavComSimVars>(this.bus);
    this.controlSubscriber = bus.getSubscriber<ControlEvents>();
  }

  /**
   * Initialize the instrument.
   */
  public init(): void {
    // Start our two publishers.

    this.publisher.startPublish();
    this.simVarPublisher.startPublish();

    // Set up our event handlers, for both H events and simvar updates.
    this.hevents.on('hEvent').handle(this.eventHandler);
    const navProcessorSubscriber = this.bus.getSubscriber<NavEvents>();
    navProcessorSubscriber.on('cdi_select').handle(this.setActiveRadio.bind(this));

    this.controlSubscriber.on('publish_radio_states').handle(this.publishRadioStates.bind(this));
    this.controlSubscriber.on('standby_com_freq').handle(this.setStandbyFreq.bind(this, RadioType.Com));
    this.controlSubscriber.on('com_spacing_set').handle(this.setComSpacing.bind(this));
    this.controlSubscriber.on('standby_nav_freq').handle(this.setStandbyFreq.bind(this, RadioType.Nav));

    this.simVarSubscriber.on('nav_active_frequency_1').whenChangedBy(0.01).handle((data) => {
      this.updateRadioFreqCb(RadioType.Nav, 0, FrequencyBank.Active, data);
    });
    this.simVarSubscriber.on('nav_standby_frequency_1').whenChangedBy(0.01).handle((data) => {
      this.updateRadioFreqCb(RadioType.Nav, 0, FrequencyBank.Standby, data);
    });
    this.simVarSubscriber.on('nav_active_frequency_2').whenChangedBy(0.01).handle((data) => {
      this.updateRadioFreqCb(RadioType.Nav, 1, FrequencyBank.Active, data);
    });
    this.simVarSubscriber.on('nav_standby_frequency_2').whenChangedBy(0.01).handle((data) => {
      this.updateRadioFreqCb(RadioType.Nav, 1, FrequencyBank.Standby, data);
    });
    this.simVarSubscriber.on('com_active_frequency_1').whenChangedBy(0.001).handle((data) => {
      this.updateRadioFreqCb(RadioType.Com, 0, FrequencyBank.Active, data);
    });
    this.simVarSubscriber.on('com_standby_frequency_1').whenChangedBy(0.001).handle((data) => {
      this.updateRadioFreqCb(RadioType.Com, 0, FrequencyBank.Standby, data);
    });
    this.simVarSubscriber.on('com_active_frequency_2').whenChangedBy(0.001).handle((data) => {
      this.updateRadioFreqCb(RadioType.Com, 1, FrequencyBank.Active, data);
    });
    this.simVarSubscriber.on('com_standby_frequency_2').whenChangedBy(0.001).handle((data) => {
      this.updateRadioFreqCb(RadioType.Com, 1, FrequencyBank.Standby, data);
    });
    this.simVarSubscriber.on('nav_ident_1').whenChanged().handle((data) => {
      this.navRadios[0].ident = data;
      this.publisher.publishIdent(1, data);
    });
    this.simVarSubscriber.on('nav_ident_2').whenChanged().handle((data) => {
      this.navRadios[1].ident = data;
      this.publisher.publishIdent(2, data);
    });
    this.simVarSubscriber.on('nav_signal_1').withPrecision(0).handle((data) => {
      this.navRadios[0].signal = data;
      this.publisher.publishSignalStrength(1, data);
    });
    this.simVarSubscriber.on('nav_signal_2').withPrecision(0).handle((data) => {
      this.navRadios[1].signal = data;
      this.publisher.publishSignalStrength(2, data);
    });
    this.simVarSubscriber.on('adf_active_frequency_1').whenChanged().handle((freq) => {
      this.publisher.publishAdfActiveFrequencySet(freq);
    });
    this.simVarSubscriber.on('adf_standby_frequency_1').whenChanged().handle((freq) => {
      this.publisher.publishAdfStandbyFrequencySet(freq);
    });


    // Configure and publish the initial state of all our radios.
    this.navRadios[0].selected = true;
    this.comRadios[0].selected = true;
    for (let i = 0; i < this.navRadios.length; i++) {
      this.updateAndPublish(this.navRadios[i]);
    }

    for (let i = 0; i < this.comRadios.length; i++) {
      this.updateAndPublish(this.comRadios[i]);
    }
  }

  /**
   * Perform events for the update loop.
   */
  public onUpdate(): void {
    // Currently, we just need to update our simvar publisher so it polls.
    this.simVarPublisher.onUpdate();
  }

  /**
   * Get the current frequency of a radio.
   * @param radioType The RadioType to query.
   * @param index The index number of the desired radio.
   * @param bank The FrequencyBank to query.
   * @returns The frequency in MHz.
   */
  private getFrequency(radioType: RadioType, index: number, bank: FrequencyBank): number {
    return SimVar.GetSimVarValue(`${radioType == RadioType.Com ? 'COM' : 'NAV'} ${bank == FrequencyBank.Active ? 'ACTIVE' : 'STANDBY'} FREQUENCY:${index}`, 'MHz');
  }

  /**
   * React to a change on a radio frequency simvar.
   * @param type The RadioType to update.
   * @param index Index of the radio in the internal array.
   * @param bank The FrequencyBank in the selected radio to update.
   * @param freq The new frequency in MHz.
   */
  private updateRadioFreqCb(type: RadioType, index: number, bank: FrequencyBank, freq: number): void {
    // Note: 'index' here is the index of the radio in our internal array,
    // not the device index.  This is confusing, and we should probably use
    // different words for each of the two data points.
    // TODO Disambigurate radio device number"index" from index in internal array.
    const radioArr = type == RadioType.Nav ? this.navRadios : this.comRadios;
    switch (bank) {
      case FrequencyBank.Active:
        radioArr[index].activeFrequency = freq;
        this.publisher.publishFreqChange(radioArr[index], FrequencyBank.Active, freq);
        break;
      case FrequencyBank.Standby:
        radioArr[index].standbyFrequency = freq;
        this.publisher.publishFreqChange(radioArr[index], FrequencyBank.Standby, freq);
        break;
    }
  }

  /**
   * Handle an hEvent.
   * @param hEvent The event that needs to be handled.
   */
  private eventHandler = (hEvent: string): void => {
    if (this.config !== undefined) {
      // We can't use a switch statement here because of the need to retrieve
      // the key from each map.  Sorry it's so ugly.
      if (this.config.navSwitchEvents?.has(hEvent)) {
        this.swapFreqs(this.getSelectedRadio(this.navRadios));
      } else if (this.config.navSelectorEvents?.has(hEvent)) {
        this.swapSelection(this.navRadios);
      } else if (this.config.navWholeIncEvents?.has(hEvent)) {
        this.wholeInc(this.getSelectedRadio(this.navRadios));
      } else if (this.config.navWholeDecEvents?.has(hEvent)) {
        this.wholeDec(this.getSelectedRadio(this.navRadios));
      } else if (this.config.navFractionIncEvents?.has(hEvent)) {
        this.fractInc(this.getSelectedRadio(this.navRadios));
      } else if (this.config.navFractionDecEvents?.has(hEvent)) {
        this.fractDec(this.getSelectedRadio(this.navRadios));
      } else if (this.config.comSwitchEvents?.has(hEvent)) {
        this.swapFreqs(this.getSelectedRadio(this.comRadios));
      } else if (this.config.comSelectorEvents?.has(hEvent)) {
        this.swapSelection(this.comRadios);
      } else if (this.config.comWholeIncEvents?.has(hEvent)) {
        this.wholeInc(this.getSelectedRadio(this.comRadios));
      } else if (this.config.comWholeDecEvents?.has(hEvent)) {
        this.wholeDec(this.getSelectedRadio(this.comRadios));
      } else if (this.config.comFractionIncEvents?.has(hEvent)) {
        this.fractInc(this.getSelectedRadio(this.comRadios));
      } else if (this.config.comFractionDecEvents?.has(hEvent)) {
        this.fractDec(this.getSelectedRadio(this.comRadios));
      } else if (this.config.comVolumeIncEvents?.has(hEvent)) {
        this.volumeInc(this.getSelectedRadio(this.comRadios));
      } else if (this.config.comVolumeDecEvents?.has(hEvent)) {
        this.volumeDec(this.getSelectedRadio(this.comRadios));
      } else if (this.config.navVolumeIncEvents?.has(hEvent)) {
        this.volumeInc(this.getSelectedRadio(this.navRadios));
      } else if (this.config.navVolumeDecEvents?.has(hEvent)) {
        this.volumeDec(this.getSelectedRadio(this.navRadios));
      }
    }
  };

  /**
   * Get the current selected radio in a collection of radios.
   * @param radios An array of Radios.
   * @returns The selected Radio in the array.
   */
  private getSelectedRadio(radios: Array<Radio>): Radio | undefined {
    for (const radio of radios) {
      if (radio.selected) {
        return radio;
      }
    }
    return undefined;
  }

  /**
   * Swap frequencies in a radio.
   * @param radio The radio whose frequencies we want to swap.
   */
  private swapFreqs(radio: Radio | undefined): void {
    if (radio !== undefined) {
      this.setKVar('SWAP', radio);
    }
  }

  /**
   * Update the frequencies in a radio from simvars.
   *
   * This is useful for snapshot updates as long as we're not worried
   * about one of the frequencies being updated while the snapshot is in
   * flight.
   * @param radio the radio to update
   */
  private updateAndPublish(radio: Radio | undefined): void {
    if (radio !== undefined) {
      radio.activeFrequency = this.getFrequency(radio.radioType,
        radio.index,
        FrequencyBank.Active);
      radio.standbyFrequency = this.getFrequency(radio.radioType,
        radio.index,
        FrequencyBank.Standby);
    }

    switch (radio?.radioType) {
      case RadioType.Com:
        this.comRadios[radio.index - 1] = radio;
        break;
      case RadioType.Nav:
        this.navRadios[radio.index - 1] = radio;
        break;
    }
    this.publisher.publishRadioState(radio);
  }


  /**
   * Explicitly set a new selected nav radio.
   * @param navSourceId An array of Radios to toggle.
   */
  private setActiveRadio(navSourceId: NavSourceId): void {
    if (navSourceId.type === NavSourceType.Nav) {
      for (let i = 0; i < this.navRadios.length; i++) {
        const radio = this.navRadios[i];
        if (radio.index == navSourceId.index) {
          radio.selected = true;
        } else {
          radio.selected = false;
        }
        this.publisher.publishRadioState(radio);
      }
    }
  }

  /**
   * Increase the volume of the selected nav or com radio.
   * @param radio The radio whose volume we want to increase.
   */
  private volumeInc(radio: Radio | undefined): void {
    if (radio !== undefined) {
      SimVar.SetSimVarValue(`K:${radio.radioType}${radio.index}_VOLUME_INC`, 'number', 0);
    }
  }

  /**
   * Increase the volume of the selected nav or com radio.
   * @param radio The radio whose volume we want to increase.
   */
  private volumeDec(radio: Radio | undefined): void {
    if (radio !== undefined) {
      SimVar.SetSimVarValue(`K:${radio.radioType}${radio.index}_VOLUME_DEC`, 'number', 0);
    }
  }

  /**
   * Increase the integer portion of a frequency.
   * @param radio The Radio to update.
   */
  private wholeInc(radio: Radio | undefined): void {
    this.setKVar('WHOLE_INC', radio);
  }

  /**
   * Decrease the integer portion of a frequency.
   * @param radio The Radio to update.
   */
  private wholeDec(radio: Radio | undefined): void {
    this.setKVar('WHOLE_DEC', radio);
  }

  /**
   * Increase the decimal portion of a frequency.
   * @param radio The Radio to update.
   */
  private fractInc(radio: Radio | undefined): void {
    this.setKVar('FRACT_INC', radio);
  }

  /**
   * Decrease the decimal portion of a frequency.
   * @param radio The Radio to update.
   */
  private fractDec(radio: Radio | undefined): void {
    this.setKVar('FRACT_DEC', radio);
  }

  /**
   * Set the standby frequency of the currently selected nav or com radio.
   * @param radioType The radio type we want to set standby for.
   * @param frequency The frequency in MHz as a string.
   */
  private setStandbyFreq(radioType: RadioType, frequency: string): void {
    let radio: Radio | undefined;
    switch (radioType) {
      case RadioType.Com:
        radio = this.getSelectedRadio(this.comRadios);
        break;
      case RadioType.Nav:
        radio = this.getSelectedRadio(this.navRadios);
        break;
    }
    this.freqSet(radio, FrequencyBank.Standby, frequency);
  }

  /**
   * Toggle which of the radios is selected.
   * @param radios An array of Radios to toggle.
   */
  private swapSelection(radios: Array<Radio>): void {
    // TODO It would be nice to extend this to handle systems with more than 2 radios
    for (let i = 0; i < radios.length; i++) {
      radios[i].selected = !radios[i].selected;
      this.publisher.publishRadioState(radios[i]);
    }
  }


  /**
   * Set the full frequency of a radio.
   * @param radio The Radio to update.
   * @param bank The FrequencyBank to update.
   * @param freq The new frequency in MHz as a string.
   */
  private freqSet(radio: Radio | undefined, bank: FrequencyBank, freq: string): void {
    if (!radio) {
      return;
    }

    let radioId: string;
    if (radio.radioType == RadioType.Com) {
      const first = radio.index == 1 ? 'COM' : `COM${radio.index}`;
      const second = bank == FrequencyBank.Active ? 'RADIO' : 'STBY_RADIO';
      radioId = `${first}_${second}`;
    } else {
      radioId = `NAV${radio.index}_${bank == FrequencyBank.Active ? 'RADIO' : 'STBY'}`;
    }

    const freqMhz = Math.round(parseFloat(freq) * 1000) / 1000;
    SimVar.SetSimVarValue(`K:${radioId}_SET_HZ`, 'Hz', (Math.round(freqMhz * 1_000_000)));
  }

  /**
   * Set the K var for a frequency event
   * @param action A string defining whole/fract and inc/dec.
   * @param radio The radio this frequency is for.
   */
  private setKVar(action: string, radio: Radio | undefined): void {
    if (radio == undefined) {
      return;
    }
    let device: string;
    switch (radio.radioType) {
      case RadioType.Nav:
        device = `NAV${radio.index}`;
        break;
      case RadioType.Com:
        if (action == 'SWAP') {
          // Com radios break the naming pattern for swap events. :(
          device = radio.index == 1 ? 'COM_STBY' : `COM${radio.index}`;
        } else {
          device = radio.index == 1 ? 'COM' : `COM${radio.index}`;
        }
        break;
      default: // this should never happen
        return;
    }
    SimVar.SetSimVarValue(`K:${device}_RADIO_${action}`, 'number', 0);
  }

  /**
   * Send an update of all our radio states.
   * @param data True if we really want to do this.  (We need to support non-paramaterized commands.())
   */
  private publishRadioStates(data: boolean): void {
    if (!data) { return; }
    for (const radio of this.navRadios) {
      this.publisher.publishRadioState(radio);
    }
    for (const radio of this.comRadios) {
      this.publisher.publishRadioState(radio);
    }
  }

  /**
   * Sets the COM frequency spacing.
   * @param evt The event that is setting the spacing.
   */
  private setComSpacing(evt: ComSpacingChangeEvent): void {
    const currentSpacing = SimVar.GetSimVarValue(`COM SPACING MODE:${evt.index}`, SimVarValueType.Enum);
    if (currentSpacing !== evt.spacing) {
      SimVar.SetSimVarValue(`K:COM_${evt.index.toFixed(0)}_SPACING_MODE_SWITCH`, 'number', 0);
    }
  }
}
