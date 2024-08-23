import {
  ConsumerSubject, ControlEvents, DataInterface, DebounceTimer, ElectricalEvents, FmcRenderTemplate, Formatter, MappedSubject, NavComSimVars, NumberFormatter,
  PageLinkField, SwitchLabel, TextInputField, Validator, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { FgpUserSettings, TcasOperatingModeSetting, TrafficUserSettings, VorTuningMode } from '@microsoft/msfs-wt21-shared';

import { ComFrequencyFormat, NavFrequencyFormat, TransponderCodeFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 * {@link FmcFormat} for parsing and displaying a adf frequency
 * Accepts an XXX.Y string
 */
export class AdfFrequencyFormat implements Validator<number>, Formatter<number> {

  private readonly FREQUENCY_REGEX = /^(\d{3,4})(\.\d){0,1}$/;
  private formatter = NumberFormatter.create({ precision: 0.1 });
  nullValueString = '---.-';

  /** @inheritDoc */
  format(freq: number): string {
    return this.formatter(freq).padStart(6, ' ');
  }

  /** @inheritDoc */
  parse(freq: string): number | null {
    const parsed = this.FREQUENCY_REGEX.test(freq);

    if (parsed) {
      const float = parseFloat(freq);
      return ((float >= 200.0 && float <= 999.9) || (float >= 1000.0 && float <= 1699.9)) ? float : null;
    } else {
      return null;
    }
  }
}

/**
 * TUNE apge
 */
export class TunePage extends WT21FmcPage {
  private static readonly MODE_MAP = [
    TcasOperatingModeSetting.TAOnly,
    TcasOperatingModeSetting.TA_RA,
    TcasOperatingModeSetting.Standby,
  ];
  private readonly trafficSettings = TrafficUserSettings.getManager(this.bus);

  private readonly fgpSettings = FgpUserSettings.getManager(this.bus);
  private nav1VorTuningMode = this.fgpSettings.getSetting('nav1VorTuningMode');
  private nav2VorTuningMode = this.fgpSettings.getSetting('nav2VorTuningMode');

  private readonly nav1ActiveData = new DataInterface(MappedSubject.create(([freq, mode]) => {
    return { freq, mode };
  },
    ConsumerSubject.create(this.bus.getSubscriber<NavComSimVars>().on('nav_active_frequency_1').whenChanged(), 0),
    this.nav1VorTuningMode,
  ),
    (freq: number) => {
      this.nav1VorTuningMode.set(VorTuningMode.Manual);
      SimVar.SetSimVarValue('K:NAV1_RADIO_SET_HZ', 'number', freq * 1_000_000);
    },
  );

  private readonly nav2ActiveData = new DataInterface(MappedSubject.create(([freq, mode]) => {
    return { freq, mode };
  },
    ConsumerSubject.create(this.bus.getSubscriber<NavComSimVars>().on('nav_active_frequency_2').whenChanged(), 0),
    this.nav2VorTuningMode,
  ),
    (freq: number) => {
      this.nav2VorTuningMode.set(VorTuningMode.Manual);
      SimVar.SetSimVarValue('K:NAV2_RADIO_SET_HZ', 'number', freq * 1_000_000);
    },
  );

  private readonly com1Field = new TextInputField(this, {
    formatter: new ComFrequencyFormat(),
    deleteAllowed: false,
    style: '[green]',
  }).bindConsumer(this.bus.getSubscriber<NavComSimVars>().on('com_active_frequency_1').whenChanged(),
    (value) => { this.setComFrequency(1, value); });

  private readonly com2Field = new TextInputField(this, {
    formatter: new ComFrequencyFormat(),
    deleteAllowed: false,
    style: '[green]',
  }).bindConsumer(this.bus.getSubscriber<NavComSimVars>().on('com_active_frequency_2').whenChanged(),
    (value) => { this.setComFrequency(2, value); });

  private readonly com1StandbyField = new TextInputField(this, {
    formatter: new ComFrequencyFormat(),
    deleteAllowed: false,
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {
        this.swapRadio(1);
        return true;
      }
      return false;
    },
  }).bindConsumer(this.bus.getSubscriber<NavComSimVars>().on('com_standby_frequency_1').whenChanged(),
    (value) => { this.setComFrequency(1, value, true); });

  private readonly com2StandbyField = new TextInputField(this, {
    formatter: new ComFrequencyFormat(),
    deleteAllowed: false,
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {
        this.swapRadio(2);
        return true;
      }
      return false;
    },
  }).bindConsumer(this.bus.getSubscriber<NavComSimVars>().on('com_standby_frequency_2').whenChanged(),
    (value) => { this.setComFrequency(2, value, true); });

  private readonly nav1ActiveField = new TextInputField(this, {
    formatter: new NavFrequencyFormat(this.fms, 1),
    // HINT: We don't to the NAV Control page, so we allow DEL to go back to Auto
    onDelete: async () => {
      this.nav1VorTuningMode.set(VorTuningMode.Auto);
      return true;
    },
  }).bindSource(this.nav1ActiveData);

  private readonly nav2ActiveField = new TextInputField(this, {
    formatter: new NavFrequencyFormat(this.fms, 2),
    // HINT: We don't to the NAV Control page, so we allow DEL to go back to Auto
    onDelete: async () => {
      this.nav2VorTuningMode.set(VorTuningMode.Auto);
      return true;
    },
  }).bindSource(this.nav2ActiveData);

  private readonly xpdrCodeField = new TextInputField(this, {
    formatter: new TransponderCodeFormat(),
    deleteAllowed: false,
    style: '[green]',
    onSelected: async (scratchpadContents): Promise<string | boolean> => {
      if (scratchpadContents.length === 0) {
        this.screen.navigateTo('/atc');
        return true;
      }

      return false;
    },
  }).bindConsumer(this.bus.getSubscriber<XPDRSimVarEvents>().on('xpdr_code_1').whenChanged(),
    (value) => { this.bus.getPublisher<ControlEvents>().pub('publish_xpdr_code_1', value); });

  private readonly adfFreqField = new TextInputField(this, {
    formatter: new AdfFrequencyFormat(),
    deleteAllowed: false,
    style: '[green]',
  }).bindConsumer(this.bus.getSubscriber<NavComSimVars>().on('adf_active_frequency_1').whenChanged(),
    (value) => { SimVar.SetSimVarValue('K:ADF_COMPLETE_SET', 'Frequency ADF BCD32', Avionics.Utils.make_adf_bcd32(value * 1000)); });

  private readonly modeSetting = this.trafficSettings.getSetting('trafficOperatingMode');
  private readonly tcasModeSwitch = new SwitchLabel(this, {
    optionStrings: ['TA', 'RA', 'STBY'],
    activeStyle: 'blue',
  }).bindSource(new DataInterface(this.modeSetting.map((input) => TunePage.MODE_MAP.indexOf(input)), (input) => {
    this.modeSetting.value = TunePage.MODE_MAP[input];
  }));

  private readonly tcasLink = PageLinkField.createLink(this, 'TCAS>', '/tcas');

  private isCom2Available = true;
  private com2Timer = new DebounceTimer();

  /** @inheritDoc */
  protected onInit(): void {
    const sub = this.bus.getSubscriber<ElectricalEvents>();
    this.addBinding(sub.on('elec_circuit_navcom2_on').whenChanged().handle((v: boolean) => {
      this.com2Timer.clear();
      this.isCom2Available = v;
      if (v) {
        this.com2Timer.schedule(() => {
          this.invalidate();
        }, 3000);
      } else {
        this.invalidate();
      }
    }));
  }

  /**
   * Sets the COM frequency.
   * @param com The COM index to set.
   * @param freq The frequency to set.
   * @param isStandby Whether the frequency is a standby frequency.
   */
  private setComFrequency(com: number, freq: number, isStandby = false): void {
    const comStr = (com === 1) ? '' : '2';
    if (isStandby) {
      SimVar.SetSimVarValue(`K:COM${comStr}_STBY_RADIO_SET_HZ`, 'Megahertz', freq * 1_000_000);
    } else {
      // FIXME get this in another way - an oldValue parameter on the datasource modifier, or some other way...
      const currentFreq = SimVar.GetSimVarValue(`COM ACTIVE FREQUENCY:${com}`, 'Hz');

      SimVar.SetSimVarValue(`K:COM${comStr}_RADIO_SET_HZ`, 'Megahertz', freq * 1_000_000);
      SimVar.SetSimVarValue(`K:COM${comStr}_STBY_RADIO_SET_HZ`, 'Megahertz', currentFreq);
    }
  }

  /**
   * Swaps the given radio's frequencies.
   * @param com the COM to set
   */
  private swapRadio(com: number): void {
    SimVar.SetSimVarValue(`K:COM${com}_RADIO_SWAP`, 'number', 0);
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return this.isCom2Available ? [
      [
        ['', this.PagingIndicator, 'TUNE[blue]'],
        [' COM1', 'COM2 '],
        [this.com1Field, this.com2Field],
        [' RECALL', 'RECALL '],
        [this.com1StandbyField, this.com2StandbyField],
        [' NAV1', 'NAV2 '],
        // TODO AUTO/MAN tuning mode selection
        [this.nav1ActiveField, this.nav2ActiveField],
        [' DME1', 'DME2 '],
        ['HOLD[s-text]', 'HOLD[s-text]'],
        [' ATC1', 'TCAS MODE '],
        [this.xpdrCodeField, this.tcasModeSwitch],
        [' ADF', ''],
        [this.adfFreqField, this.tcasLink],
      ]] : [
      [
        ['', this.PagingIndicator, 'TUNE[blue]'],
        [' COM1', ''],
        [this.com1Field, 'CROSS-SIDE[yellow]'],
        [' RECALL', ''],
        [this.com1StandbyField, 'TUNING[yellow]'],
        [' NAV1', ''],
        // TODO AUTO/MAN tuning mode selection
        [this.nav1ActiveField, 'INOPERATIVE[yellow]'/*, 'AUTO  AUTO[blue s-text]'*/],
        // ['117.10[green] AUTO[blue]', 'AUTO[blue] 117.10[green]'],
        [' DME1', ''],
        ['HOLD[s-text]', ''],
        [' ATC1', ''],
        [this.xpdrCodeField, ''],
        [' ADF', ''],
        [this.adfFreqField, ''],
      ],
    ];
  }
}
