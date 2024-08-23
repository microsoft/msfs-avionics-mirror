import { BitFlags, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { CheckBox, GuiDialog, GuiDialogProps, MapUserSettings, MapWaypointsDisplay, PopupSubMenu } from '@microsoft/msfs-wt21-shared';

/**
 * The properties for the {@link MfdLwrMapSymbolsMenu} component.
 */
interface MfdLwrMapSymbolsMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The MfdLwrMapSymbolsMenu component.
 */
export class MfdLwrMapSymbolsMenu extends GuiDialog<MfdLwrMapSymbolsMenuProps> {
  private readonly geoPolOption = Subject.create(false);
  private readonly airspaceOption = Subject.create(false);
  private readonly tfrsOption = Subject.create(false);
  private readonly nearestAptsOption = Subject.create(false);
  private readonly hiNavaidsOption = Subject.create(false);
  private readonly loNavaidsOption = Subject.create(false);
  private readonly intersOption = Subject.create(false);
  private readonly termWptsOption = Subject.create(false);
  private readonly aptsOption = Subject.create(false);
  private readonly ndbsOption = Subject.create(false);
  private readonly etaOption = Subject.create(false);
  private readonly speedOption = Subject.create(false);
  private readonly altitudeOption = Subject.create(false);
  private readonly missApprOption = Subject.create(false);
  private readonly altnFplnOption = Subject.create(false);
  private readonly rngAltSelOption = Subject.create(false);
  private readonly lrnPosOption = Subject.create(false);
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.props.bus, 'MFD');
  private readonly mapSymbolsSetting = this.mapSettingsManager.getSetting('mapWaypointsDisplay');

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.linkHiNavaidsOption();
    this.linkLoNavaidsOption();
    this.linkIntersOption();
    // this.linkNearestAptsOption();
    this.linkTermWptsOption();
    this.linkAptsOption();
    this.linkNdbsOption();
    this.linkEtaOption();
    this.linkSpeedOption();
    this.linkAltitudeOption();
    this.linkMissApprOption();
    this.linkRngAltSelApprOption();

    this.mapSettingsManager.whenSettingChanged('mapWaypointsDisplay').handle(x => {
      this.nearestAptsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.NearestAirports));
      this.hiNavaidsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.HiNavaids));
      this.loNavaidsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.LoNavaids));
      this.intersOption.set(BitFlags.isAll(x, MapWaypointsDisplay.Intersections));
      // this.nearestAptsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.NearestAirports));
      this.termWptsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.TerminalWaypoints));
      this.aptsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.Airports));
      this.ndbsOption.set(BitFlags.isAll(x, MapWaypointsDisplay.NDBs));
      this.etaOption.set(BitFlags.isAll(x, MapWaypointsDisplay.ETA));
      this.speedOption.set(BitFlags.isAll(x, MapWaypointsDisplay.Speed));
      this.altitudeOption.set(BitFlags.isAll(x, MapWaypointsDisplay.Altitude));
      this.missApprOption.set(BitFlags.isAll(x, MapWaypointsDisplay.MissedApproach));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  // private linkNearestAptsOption(): void {
  //   this.nearestAptsOption.sub(v => {
  //     this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true
  // ? MapWaypointsDisplay.NearestAirports : 0, MapWaypointsDisplay.NearestAirports);
  //   });
  // }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkHiNavaidsOption(): void {
    this.hiNavaidsOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.HiNavaids : 0, MapWaypointsDisplay.HiNavaids);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkLoNavaidsOption(): void {
    this.loNavaidsOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.LoNavaids : 0, MapWaypointsDisplay.LoNavaids);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkIntersOption(): void {
    this.intersOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.Intersections : 0, MapWaypointsDisplay.Intersections);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkTermWptsOption(): void {
    this.termWptsOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.TerminalWaypoints : 0, MapWaypointsDisplay.TerminalWaypoints);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkAptsOption(): void {
    this.aptsOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.Airports : 0, MapWaypointsDisplay.Airports);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkNdbsOption(): void {
    this.ndbsOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.NDBs : 0, MapWaypointsDisplay.NDBs);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkEtaOption(): void {
    this.etaOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.ETA : 0, MapWaypointsDisplay.ETA);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkSpeedOption(): void {
    this.speedOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.Speed : 0, MapWaypointsDisplay.Speed);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkAltitudeOption(): void {
    this.altitudeOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.Altitude : 0, MapWaypointsDisplay.Altitude);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkMissApprOption(): void {
    this.missApprOption.sub(v => {
      this.mapSymbolsSetting.value = BitFlags.set(this.mapSymbolsSetting.value, v === true ? MapWaypointsDisplay.MissedApproach : 0, MapWaypointsDisplay.MissedApproach);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkRngAltSelApprOption(): void {
    this.rngAltSelOption.sub(v => {
      this.mapSettingsManager.getSetting('mapAltitudeArcShow').set(!!v);
    });
    this.mapSettingsManager.whenSettingChanged('mapAltitudeArcShow').handle(x => {
      this.rngAltSelOption.set(x);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupSubMenu label='LWR MENU' sublabel='MAP SYMBOLS' class="mfd-lwr-popup-menu-map-symbols">
          <CheckBox label='GEO-POL' checkedDataRef={this.geoPolOption} disabled={true}></CheckBox>
          <CheckBox label='AIRSPACE' checkedDataRef={this.airspaceOption} disabled={true}></CheckBox>
          <CheckBox label='AIRWAYS' checkedDataRef={this.tfrsOption} disabled={true}></CheckBox>
          <CheckBox label='TFRS' checkedDataRef={this.tfrsOption} disabled={true}></CheckBox>
          <CheckBox label='NEAREST APTS' checkedDataRef={this.nearestAptsOption} disabled={true}></CheckBox>
          <CheckBox label='HI NAVAIDS' checkedDataRef={this.hiNavaidsOption}></CheckBox>
          <CheckBox label='LO NAVAIDS' checkedDataRef={this.loNavaidsOption}></CheckBox>
          <CheckBox label='INTERS' checkedDataRef={this.intersOption}></CheckBox>
          <CheckBox label='TERM WPTS' checkedDataRef={this.termWptsOption}></CheckBox>
          <CheckBox label='APTS' checkedDataRef={this.aptsOption}></CheckBox>
          <CheckBox label='NDBS' checkedDataRef={this.ndbsOption}></CheckBox>
          <CheckBox label='ETA' checkedDataRef={this.etaOption}></CheckBox>
          <CheckBox label='SPEED' checkedDataRef={this.speedOption}></CheckBox>
          <CheckBox label='ALTITUDE' checkedDataRef={this.altitudeOption}></CheckBox>
          <CheckBox label='MISS APPR' checkedDataRef={this.missApprOption}></CheckBox>
          <CheckBox label='ALTN FPLN' checkedDataRef={this.altnFplnOption} disabled={true}></CheckBox>
          <CheckBox label='RNG: ALT SEL' checkedDataRef={this.rngAltSelOption}></CheckBox>
          <CheckBox label='LRN POS' checkedDataRef={this.lrnPosOption} disabled={true}></CheckBox>
        </PopupSubMenu>
      </>
    );
  }
}
