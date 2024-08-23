import { BitFlags, DisplayField, FmcRenderTemplate, Formatter, MappedSubject, Subject, SwitchLabel, ToggleLabel } from '@microsoft/msfs-sdk';

import { MapUserSettings, MapWaypointsDisplay, MfdDisplayMode, MFDUpperWindowState, MFDUserSettings, WT21MfdTextPage } from '@microsoft/msfs-wt21-shared';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * Display Menu
 */
export class DisplayMenu extends WT21FmcPage {
  private readonly mapSettings = MapUserSettings.getMasterManager(this.bus);
  private readonly mfdSettings = MFDUserSettings.getMasterManager(this.bus);

  private readonly mfd1SelectedTextPageSetting = this.mfdSettings.getSetting('mfdSelectedTextPage_1');
  private readonly mfd2SelectedTextPageSetting = this.mfdSettings.getSetting('mfdSelectedTextPage_2');

  private readonly currentWaypointDisplaySettings = Subject.create<number>(0);
  private currentSource: 'PFD' | 'MFD_1' | 'MFD_2' = this.screen.fmcIndex === 1 ? 'MFD_1' : 'MFD_2';

  private readonly currentDisplay = Subject.create<number>(0);
  private readonly currentSide = Subject.create<number>(this.screen.fmcIndex - 1);

  private readonly fmsTextOption = Subject.create<number>(0);
  private readonly rngAltSelOption = Subject.create<boolean>(false);

  private readonly mfd1TextPageOption = Subject.create(WT21MfdTextPage.TakeoffRef);
  private readonly mfd2TextPageOption = Subject.create(WT21MfdTextPage.TakeoffRef);

  private readonly mfdTextPageOption = MappedSubject.create(([side, mfd1, mfd2]) => {
    return side === 0 ? mfd1 : mfd2;
  }, this.currentSide, this.mfd1TextPageOption, this.mfd2TextPageOption);

  // MAP OPTIONS FIELDS

  private readonly nearestAirports = this.createToggleField(MapWaypointsDisplay.NearestAirports, 'NEAREST APTS');
  private readonly hiNavaids = this.createToggleField(MapWaypointsDisplay.HiNavaids, 'HI NAVAIDS');
  private readonly loNavaids = this.createToggleField(MapWaypointsDisplay.LoNavaids, 'LO NAVAIDS');
  private readonly inters = this.createToggleField(MapWaypointsDisplay.Intersections, 'INTERS');
  private readonly terminalWpts = this.createToggleField(MapWaypointsDisplay.TerminalWaypoints, 'TERM WPTS');
  private readonly eta = this.createToggleField(MapWaypointsDisplay.ETA, 'ETA[disabled]');
  private readonly speed = this.createToggleField(MapWaypointsDisplay.Speed, 'SPEED[disabled]');
  private readonly altitude = this.createToggleField(MapWaypointsDisplay.Altitude, 'ALTITUDE[disabled]');
  private readonly airports = this.createToggleField(MapWaypointsDisplay.Airports, 'APTS');
  private readonly missedAppr = this.createToggleField(MapWaypointsDisplay.MissedApproach, 'MISS APPR');
  private readonly ndbs = this.createToggleField(MapWaypointsDisplay.NDBs, 'NDBS');
  private readonly altSelToggle = new ToggleLabel(this, {
    text: ['RNG: ALT SEL'],
    activeStyle: 'green',
  });

  // MFD TEXT PAGES FIELDS

  private readonly ToApprRef = this.createMfdTextPageField(WT21MfdTextPage.TakeoffRef, 'TO+APPR REF', true);
  private readonly FplnProg = this.createMfdTextPageField(WT21MfdTextPage.Progress, 'FPLN PROG', true);
  private readonly NavStatus = this.createMfdTextPageField(WT21MfdTextPage.NavStatus, 'NAV STATUS', true);
  private readonly PosSummary = this.createMfdTextPageField(WT21MfdTextPage.PosSummary, 'POS SUMMARY', false);
  private readonly PosReport = this.createMfdTextPageField(WT21MfdTextPage.PosReport, 'POS REPORT', true);
  private readonly VorStatus = this.createMfdTextPageField(WT21MfdTextPage.VorStatus, 'VOR STATUS', false);
  private readonly GnssStatus = this.createMfdTextPageField(WT21MfdTextPage.GnssStatus, 'GNSS STATUS', false);

  private pfdSettingsHandler = (): any => this.currentSource === 'PFD' && this.notifySettingsChanged();
  private mfd1SettingsHandler = (): any => this.currentSource === 'MFD_1' && this.notifySettingsChanged();
  private mfd2SettingsHandler = (): any => this.currentSource === 'MFD_2' && this.notifySettingsChanged();

  private displayChangeHandler = (v: number): void => {
    if (v === 0) {
      this.currentSource = this.currentSide.get() === 0 ? 'MFD_1' : 'MFD_2';
    } else {
      this.currentSource = 'PFD';
    }

    this.notifySettingsChanged();
  };

  private sideChangeHandler = (v: number): void => {
    if (this.currentDisplay.get() === 0) {
      this.currentSource = v === 0 ? 'MFD_1' : 'MFD_2';
    } else {
      this.currentSource = 'PFD';
    }

    this.notifySettingsChanged();
  };

  private rngAltSelHandler = (v: boolean): void => {
    this.mapSettings.getSetting(`mapAltitudeArcShow${this.currentSource}`).set(v);
  };

  private fmsTextChangeHandler = (option: number): void => {
    let dataWindowSetting, vnavSetting;
    if (this.currentSource !== 'PFD') {
      const index = this.currentSource === 'MFD_1' ? 1 : 2;
      dataWindowSetting = this.mfdSettings.getSetting(`mfdUpperWindowState_${index}`);
      vnavSetting = this.mfdSettings.getSetting(`mfdUpperFmsTextVNavShow_${index}`);
    }

    if (!dataWindowSetting || !vnavSetting) {
      return;
    }

    switch (option) {
      case 0:
        if (dataWindowSetting.value === MFDUpperWindowState.FmsText) {
          dataWindowSetting.value = MFDUpperWindowState.Off;
        }
        break;
      case 1:
        dataWindowSetting.value = MFDUpperWindowState.FmsText;
        vnavSetting.value = false;
        break;
      case 2:
        dataWindowSetting.value = MFDUpperWindowState.FmsText;
        vnavSetting.value = true;
        break;
    }
  };

  private readonly displaySwitch = new SwitchLabel(this, {
    optionStrings: ['MFD', 'PFD'],
    caret: 'right',
  });

  private readonly SideSwitch = new SwitchLabel(this, {
    optionStrings: ['L', 'R'],
    caret: 'right',
  });

  private readonly fmsTextSwitch = new SwitchLabel(this, {
    optionStrings: ['OFF', 'ON', 'VNAV'],
  });

  /** @inheritdoc */
  protected onInit(): void {
    [
      this.nearestAirports,
      this.hiNavaids,
      this.hiNavaids,
      this.loNavaids,
      this.inters,
      this.terminalWpts,
      this.eta,
      this.speed,
      this.altitude,
      this.airports,
      this.missedAppr,
      this.ndbs,
    ].forEach((it) => it.bind(this.currentWaypointDisplaySettings));

    [
      this.ToApprRef,
      this.FplnProg,
      this.NavStatus,
      this.PosSummary,
      this.PosReport,
      this.VorStatus,
      this.GnssStatus,
    ].forEach((it) => it.bind(this.mfdTextPageOption));

    // Send MFD Text page switch events
    this.mfdTextPageOption.sub((option) => {
      let setting;
      if (this.currentSide.get() === 0) {
        setting = this.mfd1SelectedTextPageSetting;
      } else {
        setting = this.mfd2SelectedTextPageSetting;
      }

      setting.set(option);
    });

    // Sync the setting values
    this.mfd1SelectedTextPageSetting.sub((page) => this.mfd1TextPageOption.set(page));
    this.mfd2SelectedTextPageSetting.sub((page) => this.mfd2TextPageOption.set(page));

    this.addBinding(this.mapSettings.whenSettingChanged('mapWaypointsDisplayPFD').handle(this.pfdSettingsHandler));
    this.addBinding(this.mapSettings.whenSettingChanged('mapWaypointsDisplayMFD_1').handle(this.mfd1SettingsHandler));
    this.addBinding(this.mapSettings.whenSettingChanged('mapWaypointsDisplayMFD_2').handle(this.mfd2SettingsHandler));

    this.addBinding(this.mapSettings.whenSettingChanged('mapAltitudeArcShowPFD').handle(this.pfdSettingsHandler));
    this.addBinding(this.mapSettings.whenSettingChanged('mapAltitudeArcShowMFD_1').handle(this.mfd1SettingsHandler));
    this.addBinding(this.mapSettings.whenSettingChanged('mapAltitudeArcShowMFD_2').handle(this.mfd2SettingsHandler));

    this.addBinding(this.mfdSettings.whenSettingChanged('mfdUpperWindowState_1').handle(this.mfd1SettingsHandler));
    this.addBinding(this.mfdSettings.whenSettingChanged('mfdUpperFmsTextVNavShow_1').handle(this.mfd1SettingsHandler));
    this.addBinding(this.mfdSettings.whenSettingChanged('mfdUpperWindowState_2').handle(this.mfd2SettingsHandler));
    this.addBinding(this.mfdSettings.whenSettingChanged('mfdUpperFmsTextVNavShow_2').handle(this.mfd2SettingsHandler));

    this.addBinding(this.currentDisplay.sub(this.displayChangeHandler));
    this.addBinding(this.currentSide.sub(this.sideChangeHandler));
    this.addBinding(this.fmsTextOption.sub(this.fmsTextChangeHandler));
    this.addBinding(this.rngAltSelOption.sub(this.rngAltSelHandler));

    const leftSetting = this.mfdSettings.getSetting('mfdDisplayMode_1');
    const rightSetting = this.mfdSettings.getSetting('mfdDisplayMode_2');

    this.addBinding(leftSetting.sub(() => {
      if (this.currentSide.get() === 0) {
        this.invalidate();
      }
    }));

    this.addBinding(rightSetting.sub(() => {
      if (this.currentSide.get() === 1) {
        this.invalidate();
      }
    }));

    this.displaySwitch.bind(this.currentDisplay);
    this.SideSwitch.bind(this.currentSide);
    this.fmsTextSwitch.bind(this.fmsTextOption);
    this.altSelToggle.bind(this.rngAltSelOption);

    this.SideSwitch.takeValue(this.screen.fmcIndex - 1);

    this.notifySettingsChanged();
  }

  /**
   * Notifies that the settings have changed.
   */
  private notifySettingsChanged(): void {
    this.currentWaypointDisplaySettings.set(this.mapSettings.getSetting(`mapWaypointsDisplay${this.currentSource}`).value);
    this.rngAltSelOption.set(this.mapSettings.getSetting(`mapAltitudeArcShow${this.currentSource}`).value);

    if (this.currentSource !== 'PFD') {
      const index = this.currentSource === 'MFD_1' ? 1 : 2;
      const dataWindowSetting = this.mfdSettings.getSetting(`mfdUpperWindowState_${index}`);
      const vnavSetting = this.mfdSettings.getSetting(`mfdUpperFmsTextVNavShow_${index}`);

      this.fmsTextOption.set(dataWindowSetting.value === MFDUpperWindowState.FmsText ? vnavSetting.value ? 2 : 1 : 0);
    }

    this.invalidate();
  }

  /**
   * Creates a formatter for formatting the map display toggles.
   * @param flag The map wapoints display flag to consider.
   * @param text The text to display.
   * @returns A new formatter.
   */
  private formatToggleValue(flag: number, text: string): Formatter<number | null> {
    return {
      nullValueString: text,
      format: (val: number | null): string => {
        if (val && (val & flag)) {
          return `${text}[green]`;
        }

        return `${text}[s-text]`;
      },
    };
  }

  /**
   * Creates a formatter for formatting the MFD text page selectable fields
   * @param page the page to select
   * @param text The text to display.
   * @param enabled whether the page is available
   * @returns A new formatter.
   */
  private formatSelectableValue(page: WT21MfdTextPage, text: string, enabled: boolean): Formatter<number | null> {
    return {
      nullValueString: text,
      format: (val: number | null): string => {
        if (!enabled) {
          return `${text}[disabled]`;
        }

        if (val === page) {
          return `${text}[green]`;
        }

        return `${text}[s-text]`;
      },
    };
  }


  /**
   * Creates a toggle field for toggling settings on and off.
   * @param flag The flag for the map waypoints display to toggle.
   * @param text The text to display.
   * @returns A new display field.
   */
  private createToggleField(flag: number, text: string): DisplayField<number> {
    return new DisplayField<number>(this, {
      formatter: this.formatToggleValue(flag, text),
      onSelected: async (): Promise<boolean> => {
        const setting = this.mapSettings.getSetting(`mapWaypointsDisplay${this.currentSource}`);
        setting.value = BitFlags.not(setting.value, flag);
        return true;
      },
    });
  }

  /**
   * Creates a selectable field to select an MFD text page
   * @param page the page to select
   * @param text The text to display.
   * @param enabled whether the page is available
   * @returns A new display field.
   */
  private createMfdTextPageField(page: WT21MfdTextPage, text: string, enabled: boolean): DisplayField<number> {
    return new DisplayField<number>(this, {
      formatter: this.formatSelectableValue(page, text, enabled),
      onSelected: async (): Promise<boolean> => {
        if (!enabled) {
          return false;
        }

        if (this.currentSide.get() === 0) {
          this.mfd1SelectedTextPageSetting.set(page);
        } else {
          this.mfd2SelectedTextPageSetting.set(page);
        }
        return true;
      },
    });
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    const index = this.currentSide.get() + 1 as 1 | 2;

    const mfdMode = this.mfdSettings.getSetting(`mfdDisplayMode_${index}`).value;

    const title = ` ${this.currentSide.get() === 0 ? 'LEFT' : 'RIGHT'} DISPLAY MENU[blue]`;

    let display: string;
    if (this.currentDisplay.get() === 0) {
      if (mfdMode === MfdDisplayMode.Map) {
        display = 'MFD MAP DISPLAY[blue]';
      } else {
        display = 'TEXT DISPLAY[blue]';
      }
    } else {
      display = 'PFD MAP DISPLAY[blue]';
    }

    if (mfdMode === MfdDisplayMode.Map) {
      return [
        [
          [title, '1/2 [blue]', ''],
          ['', '', display],
          ['NEAREST APTS[s-text disabled]', 'ETA[s-text disabled]'],
          ['', ''],
          [this.hiNavaids, this.speed],
          ['', ''],
          [this.loNavaids, this.altitude],
          ['', ''],
          [this.inters, this.airports],
          ['', 'DISPLAY [blue]'],
          ['TERM WPTS[s-text disabled]', this.displaySwitch],
          [this.currentSource === 'PFD' ? '' : ' WINDOW[blue]', 'SIDE [blue]'],
          [this.currentSource === 'PFD' ? '' : this.fmsTextSwitch, this.SideSwitch],
        ],
        [
          [title, '2/2 [blue]', ''],
          ['', '', `${display} MAP DISPLAY[blue]`],
          [this.missedAppr, ''],
          ['', ''],
          [this.ndbs, ''],
          ['', ''],
          [this.altSelToggle, ''],
          ['', ''],
          ['GNSS POS[s-text disabled]', ''],
          ['', 'DISPLAY [blue]'],
          ['ALTN FPLN[s-text disabled]', this.displaySwitch],
          ['', 'SIDE [blue]'],
          ['', this.SideSwitch],
        ],
      ];
    } else {
      return [
        [
          [title],
          ['', '', display],
          [this.ToApprRef, this.GnssStatus],
          [''],
          [this.FplnProg],
          [''],
          [this.NavStatus],
          [''],
          [this.PosSummary],
          [''],
          [this.PosReport],
          ['', 'SIDE [blue]'],
          [this.VorStatus, this.SideSwitch],
        ],
      ];
    }
  }
}
