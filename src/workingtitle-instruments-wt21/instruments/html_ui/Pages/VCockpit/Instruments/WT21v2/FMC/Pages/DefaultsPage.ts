import { DataInterface, FmcRenderTemplate, MappedSubject, SwitchLabel, TextInputField } from '@microsoft/msfs-sdk';

import { DefaultsUserSettings } from '@microsoft/msfs-wt21-shared';

import { AltitudeInputFormat, IasMachEntry, IasMachFormat, NumberAndUnitFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 * Abstract for pages on the DEFAULTS page.
 */
abstract class AbstractDefaultsPage {
  /**
   * Ctor
   * @param page The DEFAULTS page instance
   */
  constructor(protected readonly page: DefaultsPage) {
    // noop
  }

  public abstract render(): FmcRenderTemplate;
}

/**
 * The FMC DEFAULT page.
 * HINT: we allow DELETE so people can go back to the real defaults
 */
export class DefaultsPage extends WT21FmcPage {

  public defaultsSettings = DefaultsUserSettings.getManager(this.bus);
  private readonly pageOne = new DefaultsPageOne(this);
  private readonly pageTwo = new DefaultsPageTwo(this);
  private readonly pageThree = new DefaultsPageThree(this);
  private readonly pageFour = new DefaultsPageFour(this);

  /** @inheritdoc */
  protected onInit(): void {
    // noop
  }

  /** @inheritdoc */
  public render(): FmcRenderTemplate[] {
    return [
      this.pageOne.render(),
      this.pageTwo.render(),
      this.pageThree.render(),
      this.pageFour.render(),
    ];
  }
}

/**
 * Page one of the FMC DEFAULT page.
 */
class DefaultsPageOne extends AbstractDefaultsPage {
  private readonly bowSetting = this.page.defaultsSettings.getSetting('basicOperatingWeight');
  private readonly passWeightSetting = this.page.defaultsSettings.getSetting('averagePassengerWeight');
  private readonly reserveFuelSetting = this.page.defaultsSettings.getSetting('reserveFuel');
  private readonly maxSymbolSetting = this.page.defaultsSettings.getSetting('maxMapSymbols');

  private readonly bowInput = new TextInputField(this.page, {
    formatter: new NumberAndUnitFormat('LB', { padStart: 4, minValue: 0, maxValue: 20000 }),
    onDelete: async (): Promise<string | boolean> => { this.bowSetting.resetToDefault(); return true; },
  }).bind(this.bowSetting);

  private readonly passWeightInput = new TextInputField(this.page, {
    formatter: new NumberAndUnitFormat('LB', { padStart: 4, minValue: 0, maxValue: 500 }),
    onDelete: async (): Promise<string | boolean> => { this.passWeightSetting.resetToDefault(); return true; },
  }).bind(this.passWeightSetting);

  private readonly reserveFuelInput = new TextInputField(this.page, {
    formatter: new NumberAndUnitFormat('LB', { padStart: 4, minValue: 0, maxValue: 5828 }),
    onDelete: async (): Promise<string | boolean> => { this.reserveFuelSetting.resetToDefault(); return true; },
  }).bind(this.reserveFuelSetting);

  private readonly maxSymbInput = new TextInputField(this.page, {
    formatter: new NumberAndUnitFormat('LB', { padStart: 4, minValue: 10, maxValue: 40 }),
    onDelete: async (): Promise<string | boolean> => { this.maxSymbolSetting.resetToDefault(); return true; },
  }).bind(this.maxSymbolSetting);

  /** @inheritdoc */
  public render(): FmcRenderTemplate {
    return [
      ['', this.page.PagingIndicator, 'DEFAULTS[blue]'],
      ['BOW[blue]'],
      [this.bowInput],
      ['AVG PASS WT[blue]'],
      [this.passWeightInput],
      ['RESERVE FUEL[blue]'],
      [this.reserveFuelInput],
      [''],
      [''],
      [''],
      [''],
      [' MAX MAP SYMB[blue]'],
      [this.maxSymbInput],
    ];
  }
}

/**
 * Page one of the FMC DEFAULT page.
 */
class DefaultsPageTwo extends AbstractDefaultsPage {
  private readonly climbIasSetting = this.page.defaultsSettings.getSetting('climbTargetSpeedIas');
  private readonly climbMachSetting = this.page.defaultsSettings.getSetting('climbTargetSpeedMach');
  private readonly cruiseIasSetting = this.page.defaultsSettings.getSetting('cruiseTargetSpeedIas');
  private readonly cruiseMachSetting = this.page.defaultsSettings.getSetting('cruiseTargetSpeedMach');
  private readonly descentIasSetting = this.page.defaultsSettings.getSetting('descentTargetSpeedIas');
  private readonly descentMachSetting = this.page.defaultsSettings.getSetting('descentTargetSpeedMach');
  private readonly descentVpaSetting = this.page.defaultsSettings.getSetting('descentVPA');
  // private readonly speedLimitIasSetting = this.page.defaultsSettings.getSetting('speedLimitIas');
  // private readonly altitudeLimitSetting = this.page.defaultsSettings.getSetting('altitudeLimit');
  private readonly transitionAltSetting = this.page.defaultsSettings.getSetting('transitionAltitude');

  private readonly climbSpeedSub = MappedSubject.create(this.climbIasSetting, this.climbMachSetting);
  private readonly cruiseSpeedSub = MappedSubject.create(this.cruiseIasSetting, this.cruiseMachSetting);
  private readonly descentSpeedSub = MappedSubject.create(this.descentIasSetting, this.descentMachSetting);

  private readonly climbSpeedInput = new TextInputField(this.page, {
    formatter: new IasMachFormat(),
    onDelete: async (): Promise<string | boolean> => { this.climbIasSetting.resetToDefault(); this.climbMachSetting.resetToDefault(); return true; },
  }).bindSource(new DataInterface<IasMachEntry>(this.climbSpeedSub, (value: IasMachEntry) => {
    this.climbIasSetting.value = value[0] ?? this.climbIasSetting.value;
    this.climbMachSetting.value = value[1] ?? this.climbMachSetting.value;
  }));

  private readonly cruiseSpeedInput = new TextInputField(this.page, {
    formatter: new IasMachFormat(),
    onDelete: async (): Promise<string | boolean> => { this.cruiseIasSetting.resetToDefault(); this.cruiseMachSetting.resetToDefault(); return true; },
  }).bindSource(new DataInterface<IasMachEntry>(this.cruiseSpeedSub, (value: IasMachEntry) => {
    this.cruiseIasSetting.value = value[0] ?? this.cruiseIasSetting.value;
    this.cruiseMachSetting.value = value[1] ?? this.cruiseMachSetting.value;
  }));

  private readonly descentSpeedInput = new TextInputField(this.page, {
    formatter: new IasMachFormat(),
    onDelete: async (): Promise<string | boolean> => { this.descentIasSetting.resetToDefault(); this.descentMachSetting.resetToDefault(); return true; },
  }).bindSource(new DataInterface<IasMachEntry>(this.descentSpeedSub, (value: IasMachEntry) => {
    this.descentIasSetting.value = value[0] ?? this.descentIasSetting.value;
    this.descentMachSetting.value = value[1] ?? this.descentMachSetting.value;
  }));

  private readonly descentVpaInput = new TextInputField(this.page, {
    formatter: new NumberAndUnitFormat('°', { precision: 1, minValue: 1, maxValue: 6, spaceBetween: false }),
    onDelete: async (): Promise<string | boolean> => { this.descentVpaSetting.resetToDefault(); return true; },
  }).bind(this.descentVpaSetting);

  private readonly transitionAltInput = new TextInputField(this.page, {
    formatter: new AltitudeInputFormat(),
    onDelete: async (): Promise<string | boolean> => { this.transitionAltSetting.resetToDefault(); return true; },
  }).bind(this.transitionAltSetting);


  /** @inheritdoc */
  public render(): FmcRenderTemplate {
    return [
      ['', this.page.PagingIndicator, 'DEFAULTS[blue]'],
      [' CLIMB SPEED[blue]'],
      [this.climbSpeedInput],
      [' CRUISE SPEED[blue]'],
      [this.cruiseSpeedInput],
      [' DESCENT SPEED[blue]'],
      [this.descentSpeedInput],
      [' DESCENT ANGLE[blue]'],
      [this.descentVpaInput],
      [''],
      [''],
      // [' SPD/ALT LIMIT[blue]'], // I don't think we want this
      // [''],
      [' FL/TRANS ALT[blue]'],
      [this.transitionAltInput],
    ];
  }
}

/**
 * Page three of the FMC DEFAULT page.
 */
class DefaultsPageThree extends AbstractDefaultsPage {
  // private readonly dmeUsageSetting = this.page.defaultsSettings.getSetting('dmeUsage');
  // private readonly vorUsageSetting = this.page.defaultsSettings.getSetting('vorUsage');
  // private readonly nearestRwySetting = this.page.defaultsSettings.getSetting('nearestAirportsMinRunway');
  private readonly flightLogSetting = this.page.defaultsSettings.getSetting('flightLogOnLanding');
  private readonly mappedFlightLogSetting = this.flightLogSetting.map(fl => fl ? 0 : 1);
  private readonly flightLogSwitch = new SwitchLabel(this.page, { optionStrings: ['YES', 'NO'] }).bind(this.mappedFlightLogSetting);

  // TODO all hardcoded for now, since we don't know what to do with them yet

  /** @inheritdoc */
  public render(): FmcRenderTemplate {
    return [
      ['', this.page.PagingIndicator, 'DEFAULTS[blue]'],
      ['DME USAGE[blue]'],
      ['YES[green]/[d-text]NO[s-text]'],
      ['VOR USAGE[blue]'],
      ['YES[green]/[d-text]NO[s-text]'],
      ['NEAREST APTS MIN RWY[blue]'],
      ['---- FT'],
      ['FLIGHT LOG ON LDG[blue]'],
      [this.flightLogSwitch],
      [''],
      [''],
      [''],
      [''],
    ];
  }
}

/**
 * Page four of the FMC DEFAULT page.
 */
class DefaultsPageFour extends AbstractDefaultsPage {
  private readonly flapsSetting = this.page.defaultsSettings.getSetting('takeoffFlaps');
  private readonly antiIceSetting = this.page.defaultsSettings.getSetting('takeoffAntiIce');
  private readonly mappedAntiIceSetting = this.antiIceSetting.map(ai => ai ? 1 : 0);

  private readonly flapsSwitch = new SwitchLabel(this.page, { optionStrings: ['0', '15'] }).bind(this.flapsSetting);
  private readonly aiSwitch = new SwitchLabel(this.page, { optionStrings: ['OFF', 'ON'] }).bindSource(new DataInterface(this.mappedAntiIceSetting, (value: number) => { this.antiIceSetting.value = value === 1; }));

  /** @inheritdoc */
  public render(): FmcRenderTemplate {
    return [
      ['', this.page.PagingIndicator, 'DEFAULTS[blue]'],
      ['', '', 'TAKEOFF / APPROACH REF[blue]'],
      [''],
      ['T/O FLAPS[blue]'],
      [this.flapsSwitch],
      ['A/I[blue]'],
      [this.aiSwitch],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
    ];
  }
}
