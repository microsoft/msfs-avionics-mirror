/* eslint-disable max-len */
import { BitFlags, ComponentProps, DisplayComponent, FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  BarTouchButton, BarTouchButtonArrow, ButtonMenu, CheckBox, MapWaypointsDisplay, MfdAliasedUserSettingTypes, RadioButton, ScrollableBarTouchButton,
  TouchButton, WeatherMode
} from '@microsoft/msfs-epic2-shared';

import './MfdMapTopButtons.css';

/** Props for MfdMapTopButtons. */
interface MfdMapTopButtonProps extends ComponentProps {
  /** The settings manager to use. */
  settings: UserSettingManager<MfdAliasedUserSettingTypes>;
}

/** The Map Top Buttons component. */
export class MfdMapTopButtons extends DisplayComponent<MfdMapTopButtonProps> {
  private readonly waypointDisplaySettings = this.props.settings.getSetting('mapWaypointsDisplay');
  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.settings.getSetting('airportEnabled').sub((v: boolean) => {
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.Airports : 0, MapWaypointsDisplay.Airports
      ));
    }, true);
    this.props.settings.getSetting('vorEnabled').sub((v: boolean) => {
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.HiNavaids : 0, MapWaypointsDisplay.HiNavaids
      ));
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.LoNavaids : 0, MapWaypointsDisplay.LoNavaids
      ));
    }, true);
    this.props.settings.getSetting('ndbEnabled').sub((v: boolean) => {
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.NDBs : 0, MapWaypointsDisplay.NDBs
      ));
    }, true);
    this.props.settings.getSetting('intersectionEnabled').sub((v: boolean) => {
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.Intersections : 0, MapWaypointsDisplay.Intersections
      ));
    }, true);
    this.props.settings.getSetting('constraintsEnabled').sub((v: boolean) => {
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.Altitude : 0, MapWaypointsDisplay.Altitude
      ));
    }, true);
    this.props.settings.getSetting('missedAppEnabled').sub((v: boolean) => {
      this.props.settings.getSetting('mapWaypointsDisplay').set(BitFlags.set(
        this.waypointDisplaySettings.value, v ? MapWaypointsDisplay.MissedApproach : 0, MapWaypointsDisplay.MissedApproach
      ));
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="mfd-map-top-buttons">
        <ButtonMenu
          class="aeronautical-map-button"
          menuClass={'button-menu-aero'}
          position={'bottom'}
          buttons={[
            <BarTouchButton label={'Airports'} onPressed={() => this.props.settings.getSetting('airportEnabled').set(!this.props.settings.getSetting('airportEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('airportEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'VOR'} onPressed={() => this.props.settings.getSetting('vorEnabled').set(!this.props.settings.getSetting('vorEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('vorEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'NDB'} onPressed={() => this.props.settings.getSetting('ndbEnabled').set(!this.props.settings.getSetting('ndbEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('ndbEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'Intersection'} onPressed={() => this.props.settings.getSetting('intersectionEnabled').set(!this.props.settings.getSetting('intersectionEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('intersectionEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'P-E Waypoints'} onPressed={() => this.props.settings.getSetting('pilotEnteredEnabled').set(!this.props.settings.getSetting('pilotEnteredEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('pilotEnteredEnabled')} /></BarTouchButton>,
            <ButtonMenu
              position={'right-down'}
              buttons={[
                <BarTouchButton isEnabled={false} label={'HI ALT'} onPressed={() => this.props.settings.getSetting('hiAltAirwaysEnabled').set(!this.props.settings.getSetting('hiAltAirwaysEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('hiAltAirwaysEnabled')} /></BarTouchButton>,
                <BarTouchButton isEnabled={false} label={'LOW ALT'} onPressed={() => this.props.settings.getSetting('loAltAirwaysEnabled').set(!this.props.settings.getSetting('loAltAirwaysEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('loAltAirwaysEnabled')} /></BarTouchButton>
              ]}
            >
              <BarTouchButton label={'Airways'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
            </ButtonMenu>,
            <ButtonMenu
              position={'right'}
              buttons={[
                <BarTouchButton isEnabled={false} label={'Air Space 1'} onPressed={() => this.props.settings.getSetting('specialAirspacesEnabled').set(!this.props.settings.getSetting('specialAirspacesEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('specialAirspacesEnabled')} /></BarTouchButton>
              ]}
            >
              <BarTouchButton label={'Airspaces'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
            </ButtonMenu>,
            <TouchButton label={'INFO'} variant={'bar'} />,
          ]}
        >
          <BarTouchButton label={'Aeronautical'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
        </ButtonMenu>
        <ButtonMenu
          class="fpln-map-button"
          menuClass={'button-menu-aero'}
          position={'bottom'}
          buttons={[
            <BarTouchButton label={'Missed App'} onPressed={() => this.props.settings.getSetting('missedAppEnabled').set(!this.props.settings.getSetting('missedAppEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('missedAppEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'Alternate'} isEnabled={false} onPressed={() => this.props.settings.getSetting('alternateEnabled').set(!this.props.settings.getSetting('alternateEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('alternateEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'Constraints'} onPressed={() => this.props.settings.getSetting('constraintsEnabled').set(!this.props.settings.getSetting('constraintsEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('constraintsEnabled')} /></BarTouchButton>,
          ]}
        >
          <BarTouchButton label={'FPLN'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
        </ButtonMenu>
        <ButtonMenu
          class="geo-map-button"
          menuClass={'button-menu-aero-geo'}
          position={'bottom'}
          isEnabled={false}
          buttons={[
            <BarTouchButton isEnabled={false} label={'Boundaries'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            <BarTouchButton isEnabled={false} label={'Major Roadways'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            <BarTouchButton isEnabled={false} label={'Minor Roadways'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            <BarTouchButton isEnabled={false} label={'Cities'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            <BarTouchButton isEnabled={false} label={'Railways'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            <BarTouchButton isEnabled={false} label={'VFR REF Points'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            <BarTouchButton isEnabled={false} label={'Water Highlight'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
          ]}
        >
          <BarTouchButton isEnabled={false} label={'GEO'}><BarTouchButtonArrow isRightArrow isDisabled /></BarTouchButton>
        </ButtonMenu>
        <ButtonMenu
          class="terr-map-button"
          menuClass={'button-menu-aero-terr'}
          position={'bottom'}
          buttons={[
            <ScrollableBarTouchButton label={'Terrain'} onPressed={() => this.props.settings.getSetting('terrainEnabled').set(!this.props.settings.getSetting('terrainEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('terrainEnabled')} /></ScrollableBarTouchButton>,
            <ScrollableBarTouchButton label={'SA Terrain'} onPressed={() => this.props.settings.getSetting('saTerrainEnabled').set(!this.props.settings.getSetting('saTerrainEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('saTerrainEnabled')} /></ScrollableBarTouchButton>
          ]}
        >
          <BarTouchButton label={'TERR'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
        </ButtonMenu>
        <ButtonMenu
          class="wx-map-button"
          menuClass={'button-menu-aero-wx'}
          position={'bottom'}
          buttons={[
            // <ButtonMenu
            //   menuClass={'button-menu-aero'}
            //   position={'left-down'}
            //   buttons={[
            //     <BarTouchButton isEnabled={false} label={'NEXRAD'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={true} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'Satellite'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'Winds'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'StormTops'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'Lightning'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'Turbulence'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'Echo Tops'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'TFR'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'AIRMET'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'SIGMET'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //     <BarTouchButton isEnabled={false} label={'Legend'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
            //   ]}
            // >
            //   <SxmRadioBarTouchButton isEnabled={false} class="wx-tall-button" />
            // </ButtonMenu>,
            <BarTouchButton class="wx-tall-button" label={'Nexrad WX'} onPressed={() => this.props.settings.getSetting('weatherMode').set(WeatherMode.SxmWeather)}><RadioButton value={WeatherMode.SxmWeather} selectedValue={this.props.settings.getSetting('weatherMode')} /></BarTouchButton>,
            <ButtonMenu
              menuClass={'button-menu-aero'}
              position={'left'}
              buttons={[
                <BarTouchButton isEnabled={false} label={'UPLINK'}><CheckBox isChecked={Subject.create<boolean>(false)} isEnabled={false} /></BarTouchButton>,
              ]}
            >
            </ButtonMenu>,
            <ScrollableBarTouchButton class="wx-tall-button" label={'WX Radar'} onPressed={() => this.props.settings.getSetting('weatherMode').set(WeatherMode.WxRadar)}><RadioButton value={WeatherMode.WxRadar} selectedValue={this.props.settings.getSetting('weatherMode')} /></ScrollableBarTouchButton>,
            <BarTouchButton label={'All WX Off'} onPressed={() => this.props.settings.getSetting('weatherMode').set(WeatherMode.Off)}><RadioButton value={WeatherMode.Off} selectedValue={this.props.settings.getSetting('weatherMode')} /></BarTouchButton>,
          ]}
        >
          <BarTouchButton label={'WX'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
        </ButtonMenu>
        <ButtonMenu
          class="tcas-map-button"
          menuClass={'button-menu-aero'}
          position={'bottom-offset'}
          buttons={[
            <BarTouchButton label={'ON'} onPressed={() => this.props.settings.getSetting('trafficEnabled').set(!this.props.settings.getSetting('trafficEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('trafficEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'FLIGHT ID'} isEnabled={false} ><CheckBox isEnabled={false} isChecked={Subject.create(false)} /></BarTouchButton>,
            <BarTouchButton label={'TREND VECTOR'} onPressed={() => this.props.settings.getSetting('tcasTrendVectorEnabled').set(!this.props.settings.getSetting('tcasTrendVectorEnabled').get())}><CheckBox isChecked={this.props.settings.getSetting('tcasTrendVectorEnabled')} /></BarTouchButton>,
            <BarTouchButton label={'GND TRAFFIC'} isEnabled={false} ><CheckBox isEnabled={false} isChecked={Subject.create(false)} /></BarTouchButton>,
          ]}
        >
          <BarTouchButton label={'TCAS'}><BarTouchButtonArrow isRightArrow /></BarTouchButton>
        </ButtonMenu>
      </div >
    );
  }
}
