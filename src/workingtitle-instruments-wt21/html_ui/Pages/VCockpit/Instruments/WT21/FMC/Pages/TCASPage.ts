import { Subject } from '@microsoft/msfs-sdk';

import { TcasOperatingModeSetting, TrafficUserSettings } from '../../Shared/Traffic/TrafficUserSettings';
import { SwitchLabel } from '../Framework/Components/SwitchLabel';
import { ToggleLabel } from '../Framework/Components/ToggleLabel';
import { DataInterface } from '../Framework/FmcDataBinding';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * The FMC TCAS page.
 */
export class TCASPage extends FmcPage {
  private static readonly MODE_MAP = [
    TcasOperatingModeSetting.TAOnly,
    TcasOperatingModeSetting.TA_RA,
    TcasOperatingModeSetting.Standby
  ];

  private readonly trafficSettings = TrafficUserSettings.getManager(this.eventBus);

  private readonly normAltLimitSub = Subject.create(false);

  private readonly modeSwitch = new SwitchLabel(this, {
    optionStrings: ['TA', 'RA', 'STBY'],
    activeStyle: 'blue'
  });
  private readonly relativeAltSwitch = new SwitchLabel(this, {
    optionStrings: ['REL', 'ABS'],
    activeStyle: 'blue'
  });
  private readonly otherTrafficSwitch = new SwitchLabel(this, {
    optionStrings: ['ON', 'OFF'],
    activeStyle: 'blue'
  });
  private readonly aboveSwitch = new ToggleLabel(this, {
    text: ['ABOVE'],
    activeStyle: 'blue'
  });
  private readonly normSwitch = new ToggleLabel(this, {
    text: ['NORM'],
    activeStyle: 'blue'
  });
  private readonly belowSwitch = new ToggleLabel(this, {
    text: ['BELOW'],
    activeStyle: 'blue'
  });


  /** @inheritdoc */
  protected onInit(): void {
    const modeSetting = this.trafficSettings.getSetting('trafficOperatingMode');
    const relativeAltSetting = this.trafficSettings.getSetting('trafficAltitudeRelative');
    const showOtherSetting = this.trafficSettings.getSetting('trafficShowOther');

    // TODO find a way to bind the setting directly

    this.modeSwitch.bindSource(
      new DataInterface(
        modeSetting.map(settingValue => TCASPage.MODE_MAP.indexOf(settingValue)),
        input => { modeSetting.value = TCASPage.MODE_MAP[input]; }
      ),
    );

    this.relativeAltSwitch.bindSource(
      new DataInterface(
        relativeAltSetting.map(settingValue => settingValue ? 0 : 1),
        input => { relativeAltSetting.value = input === 0; }
      ),
    );

    this.otherTrafficSwitch.bindSource(
      new DataInterface(
        showOtherSetting.map(settingValue => settingValue ? 0 : 1),
        input => { showOtherSetting.value = input === 0; }
      ),
    );

    this.aboveSwitch.bind(this.trafficSettings.getSetting('trafficShowAbove'));
    this.belowSwitch.bind(this.trafficSettings.getSetting('trafficShowBelow'));

    const normAltLimitHandler = (): void => {
      this.normAltLimitSub.set(!this.trafficSettings.getSetting('trafficShowAbove').value && !this.trafficSettings.getSetting('trafficShowBelow').value);
    };

    this.addBinding(this.trafficSettings.whenSettingChanged('trafficShowAbove').handle(normAltLimitHandler));
    this.addBinding(this.trafficSettings.whenSettingChanged('trafficShowBelow').handle(normAltLimitHandler));

    this.normAltLimitSub.sub(value => {
      if (value) {
        this.trafficSettings.getSetting('trafficShowAbove').value = false;
        this.trafficSettings.getSetting('trafficShowBelow').value = false;
      }
    });

    this.normSwitch.bind(this.normAltLimitSub);
    this.normSwitch.takeValue(this.normAltLimitSub.get());
  }

  /** @inheritdoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['TCAS CONTROL[blue]'],
        [' MODE', 'ALT TAG '],
        [this.modeSwitch, this.relativeAltSwitch],
        [''],
        ['', 'TEST[s-text]'],
        [' ⬦[blue]TRAFFIC[white]', 'EXT TEST '],
        [this.otherTrafficSwitch, 'ON[s-text]/[d-text white]OFF[d-text blue]'],
        ['', 'ALT LIMITS '],
        ['', this.aboveSwitch],
        [''],
        ['', this.normSwitch],
        [''],
        ['', this.belowSwitch]
      ]
    ];
  }
}