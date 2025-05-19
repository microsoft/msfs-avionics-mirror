import { AuxPage } from '../AuxPages';
import { ComputedSubject, FocusPosition, FSComponent, GeoPoint, GNSSEvents, MagVar, Subject, VNode, VorFacility } from '@microsoft/msfs-sdk';
import { SelectableText } from '../../../Controls/SelectableText';
import { GNSUiControl } from '../../../GNSUiControl';
import { OptionDialog } from '../../../Controls/OptionDialog';
import { UnitsAltitudeSettingMode, UnitsDistanceSettingMode, UnitsFuelSettingMode, UnitsNavAngleSettingMode, UnitsTemperatureSettingMode } from '@microsoft/msfs-garminsdk';

import './UnitsPosition.css';

enum HeadingSetting {
  Magnetic = 'Magnetic',
  True = 'True',
}


enum DisSpdUnits {
  Metric = 'Metric (km, kph)',
  Nautical = 'Nautical (nm, kt)',
  Statute = 'Statute (mi, mph)'
}

enum AltVs {
  Feet = 'Feet (ft, fpm)',
  Meters = 'Meters (m, mpm)',
  Meters2 = 'Meters (m, mps)'
}

enum Pressure {
  Inches = 'Inches (hg)',
  Millibars = 'Millibars (mb)',
}

enum Temp {
  Celsius = 'Celsius (C)',
  Fahrenheit = 'Fahrenheit (F)',
}

enum Fuel {
  Gallons = 'Gallons (gl)',
  ImpGals = 'Imp Gals (ig)',
  Kilograms = 'Kilograms (kg)',
  Liters = 'Liters (lt)',
  Pounds = 'Pounds (lb)'
}

enum positionFormat {
  hdddmmmmm = 'hddd° mm.mmm\'',
  hdddmmsss = 'hddd°mm\'ss.s"',
  MGRS = 'MGRS',
  UTMUPS = 'UTM/UPS'
}

/**
 * Units / Position page.
 */
export class UnitsPosition extends AuxPage {
  private readonly scrollContainerRef = FSComponent.createRef<GNSUiControl>();

  private readonly unitsSettingsManager = this.props.settingsProvider.units;
  private readonly generalSettingsManager = this.props.settingsProvider.generalSettings;

  //all selectable text
  private readonly headingModeRef = FSComponent.createRef<SelectableText>();
  private readonly disSpdModeRef = FSComponent.createRef<SelectableText>();
  private readonly altVsModeRef = FSComponent.createRef<SelectableText>();
  private readonly pressureModeRef = FSComponent.createRef<SelectableText>();
  private readonly tempModeRef = FSComponent.createRef<SelectableText>();
  private readonly fuelModeRef = FSComponent.createRef<SelectableText>();
  private readonly positionFormatModeRef = FSComponent.createRef<SelectableText>();

  //makes all the modes the settings should be on (by default)
  private readonly headingMode = this.unitsSettingsManager.getSetting('unitsNavAngle').map(v => {
    switch (v) {
      case UnitsNavAngleSettingMode.Magnetic:
        return HeadingSetting.Magnetic;
      case UnitsNavAngleSettingMode.True:
        return HeadingSetting.True;
    }
  });

  private readonly disSpdMode = this.unitsSettingsManager.getSetting('unitsDistance').map(v => {
    switch (v) {
      case UnitsDistanceSettingMode.Metric:
        return DisSpdUnits.Metric;
      case UnitsDistanceSettingMode.Nautical:
        return DisSpdUnits.Nautical;
      case UnitsDistanceSettingMode.Statute:
        return DisSpdUnits.Statute;
    }
  });
  private readonly altVsMode = this.unitsSettingsManager.getSetting('unitsAltitude').map(v => {
    switch (v) {
      case UnitsAltitudeSettingMode.Feet:
        return AltVs.Feet;
      case UnitsAltitudeSettingMode.Meters:
        return AltVs.Meters;
      case UnitsAltitudeSettingMode.MetersMps:
        return AltVs.Meters2;
    }
  });

  private readonly pressureMode = this.generalSettingsManager.getSetting('baroHpa').map(v => {

    if (v) {
      return Pressure.Millibars;
    } else {
      return Pressure.Inches;
    }
  });
  private readonly tempMode = this.unitsSettingsManager.getSetting('unitsTemperature').map(v => {
    switch (v) {
      case UnitsTemperatureSettingMode.Celsius:
        return Temp.Celsius;
      case UnitsTemperatureSettingMode.Fahrenheit:
        return Temp.Fahrenheit;
    }
  });
  private readonly fuelMode = this.unitsSettingsManager.getSetting('unitsFuel').map(v => {
    switch (v) {
      case UnitsFuelSettingMode.ImpGal:
        return Fuel.ImpGals;
      case UnitsFuelSettingMode.Kilograms:
        return Fuel.Kilograms;
      case UnitsFuelSettingMode.Liters:
        return Fuel.Liters;
      case UnitsFuelSettingMode.Pounds:
        return Fuel.Pounds;
      default:
        return Fuel.Gallons;
    }
  });
  private readonly positionFormatMode = Subject.create(positionFormat.hdddmmmmm);

  //all the unit selectors
  private readonly heading = FSComponent.createRef<OptionDialog>();
  private readonly disSpd = FSComponent.createRef<OptionDialog>();
  private readonly altVs = FSComponent.createRef<OptionDialog>();
  private readonly pressure = FSComponent.createRef<OptionDialog>();
  private readonly temp = FSComponent.createRef<OptionDialog>();
  private readonly fuel = FSComponent.createRef<OptionDialog>();
  private readonly positionFormat = FSComponent.createRef<OptionDialog>();

  private readonly ppos = new GeoPoint(0, 0);


  private readonly vor = Subject.create<VorFacility | undefined>(undefined);
  private readonly magvarRef = FSComponent.createRef<HTMLDivElement>();
  private readonly magvar = ComputedSubject.create<GeoPoint | undefined, string>(undefined, (v: GeoPoint | undefined): string => {

    if (v === undefined) {
      return '____°';
    }

    const value = MagVar.get(v.lat, v.lon);

    if (value >= 0) {
      return 'E' + (Math.abs(value)).toFixed(0).padStart(3, '0') + '°';
    } else {
      return 'W' + (Math.abs(value)).toFixed(0).padStart(3, '0') + '°';
    }
  });

  /**
   * Sets the heading type to use.
   * @param index The option the user selects.
   */
  private setHeading(index: number): void {

    if (index === 0) {
      this.unitsSettingsManager?.getSetting('unitsNavAngle').set(UnitsNavAngleSettingMode.Magnetic);
      if (this.vor !== undefined) {
        this.magvar.set(this.ppos);
        this.magvarRef.instance.classList.remove('hide-element');
      }
    } else if (index === 1) {
      this.magvarRef.instance.classList.add('hide-element');
      this.unitsSettingsManager?.getSetting('unitsNavAngle').set(UnitsNavAngleSettingMode.True);
    }

    this.heading.instance.closePopout();
    this.heading.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }
  /**
   * Sets the Dis Spd type to use.
   * @param index The option the user selects.
   */
  private setDisSpd(index: number): void {

    if (index === 0) {
      this.unitsSettingsManager?.getSetting('unitsDistance').set(UnitsDistanceSettingMode.Metric);
    } else if (index === 1) {
      this.unitsSettingsManager?.getSetting('unitsDistance').set(UnitsDistanceSettingMode.Nautical);
    } else if (index === 2) {
      this.unitsSettingsManager?.getSetting('unitsDistance').set(UnitsDistanceSettingMode.Statute);
    }

    this.disSpd.instance.closePopout();
    this.disSpd.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }

  /**
   * Sets the Alt Vs type to use.
   * @param index The option the user selects.
   */
  private setAltVsUnits(index: number): void {

    if (index === 0) {
      this.unitsSettingsManager?.getSetting('unitsAltitude').set(UnitsAltitudeSettingMode.Feet);
    } else if (index === 1) {
      this.unitsSettingsManager?.getSetting('unitsAltitude').set(UnitsAltitudeSettingMode.Meters);
    } else if (index === 2) {
      this.unitsSettingsManager?.getSetting('unitsAltitude').set(UnitsAltitudeSettingMode.Meters);
    }

    this.altVs.instance.closePopout();
    this.altVs.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }
  /**
   * Sets the pressure type to use.
   * @param index The option the user selects.
   */
  private setPressure(index: number): void {

    if (index === 0) {
      this.generalSettingsManager?.getSetting('baroHpa').set(false);
    } else if (index === 1) {
      this.generalSettingsManager?.getSetting('baroHpa').set(true);
    }

    this.pressure.instance.closePopout();
    this.pressure.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }

  /**
   * Sets the fuel type to use.
   * @param index The option the user selects.
   */
  private setFuel(index: number): void {

    if (index === 0) {
      this.unitsSettingsManager?.getSetting('unitsFuel').set(UnitsFuelSettingMode.Gallons);
    } else if (index === 1) {
      this.unitsSettingsManager?.getSetting('unitsFuel').set(UnitsFuelSettingMode.ImpGal);
    } else if (index === 2) {
      this.unitsSettingsManager?.getSetting('unitsFuel').set(UnitsFuelSettingMode.Kilograms);
    } else if (index === 3) {
      this.unitsSettingsManager?.getSetting('unitsFuel').set(UnitsFuelSettingMode.Liters);
    } else if (index === 4) {
      this.unitsSettingsManager?.getSetting('unitsFuel').set(UnitsFuelSettingMode.Pounds);
    }

    this.fuel.instance.closePopout();
    this.fuel.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }

  /**
   * Sets the temp type to use.
   * @param index The option the user selects.
   */
  private setTemp(index: number): void {
    if (index === 0) {
      this.unitsSettingsManager?.getSetting('unitsTemperature').set(UnitsTemperatureSettingMode.Celsius);
    } else if (index === 1) {
      this.unitsSettingsManager?.getSetting('unitsTemperature').set(UnitsTemperatureSettingMode.Fahrenheit);
    }

    this.temp.instance.closePopout();
    this.temp.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }

  /**
   * Sets the position type to use.
   * @param index The option the user selects.
   */
  private setPositionFormat(index: number): void {
    if (index === 0) {
      this.positionFormatMode.set(positionFormat.hdddmmmmm);
    } else if (index === 1) {
      this.positionFormatMode.set(positionFormat.hdddmmsss);
    } else if (index === 2) {
      this.positionFormatMode.set(positionFormat.MGRS);
    } else if (index === 3) {
      this.positionFormatMode.set(positionFormat.UTMUPS);
    }

    this.positionFormat.instance.closePopout();
    this.positionFormat.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }

  onDialogBoxClr = (): void => {
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
  };

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    if (this.props.gnsType === 'wt530') {
      this.positionFormatModeRef.instance.setDisabled(true);
    }
    this.heading.instance.setItems([HeadingSetting.Magnetic, HeadingSetting.True], false);
    this.disSpd.instance.setItems([DisSpdUnits.Metric, DisSpdUnits.Nautical, DisSpdUnits.Statute], false);
    this.altVs.instance.setItems([AltVs.Feet, AltVs.Meters, AltVs.Meters2], false);
    this.pressure.instance.setItems([Pressure.Inches, Pressure.Millibars], false);
    this.temp.instance.setItems([Temp.Celsius, Temp.Fahrenheit], false);
    this.fuel.instance.setItems([Fuel.Gallons, Fuel.ImpGals, Fuel.Kilograms, Fuel.Liters, Fuel.Pounds], false);
    this.positionFormat.instance.setItems([positionFormat.hdddmmmmm, positionFormat.hdddmmsss, positionFormat.MGRS, positionFormat.UTMUPS], false);

    this.props.bus.getSubscriber<GNSSEvents>()
      .on('gps-position')
      .handle(pos => { this.ppos.set(pos.lat, pos.long); this.magvar.set(this.ppos); });
  }

  /**
   * this renders the bottom part of the page.
   * The 430 dose not have the lower half.
   * @returns the bottom half of the page
   */
  private renderBottom(): VNode {
    if (this.props.gnsType !== 'wt430') {
      return (<>
        <div class="units-position-position-format-title">
          POSITION FORMAT
          <div class="aux-table units-position-position-format">
            <SelectableText

              ref={this.positionFormatModeRef}
              class="aux-entry com-configuration-spacing"
              data={this.positionFormatMode}
              onRightInnerInc={(): boolean => {
                this.scrollContainerRef.instance.blur();
                this.positionFormat.instance.openPopout(0);
                this.positionFormat.instance.focus(FocusPosition.First);
                return true;
              }}
              onRightInnerDec={(): boolean => {
                this.scrollContainerRef.instance.blur();
                this.positionFormat.instance.openPopout(0);
                this.positionFormat.instance.focus(FocusPosition.First);
                return true;
              }}
            />
          </div>
        </div>
        <div class="units-position-position-map-title">
          MAP DATUM
          <div class="aux-table units-position-map-datum-format">
            WGS 84
          </div>
        </div></>
      );
    } else {
      //return nothing since this part does not show in the 430
      return (<></>);
    }
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class="page aux-page hide-element" ref={this.el}>
        <div class='aux-page-header'>
        </div>
        <div class='aux-table-header'>
          UNITS / POSITION
        </div>

        <div class="units-position-container">
          <div class="units-position-side-title cyan">HEADING</div>
          <div class="units-position-side-title cyan">DIS, SPD</div>
          <div class="units-position-side-title cyan">ALT, VS</div>
          <div class="units-position-side-title cyan">PRESSURE</div>
          <div class="units-position-side-title cyan">TEMP</div>
          <div class="units-position-side-title cyan">FUEL</div>
        </div>
        <div>
          <GNSUiControl ref={this.scrollContainerRef} isolateScroll>
            <div class="aux-table units-position-table">
              <SelectableText
                ref={this.headingModeRef}
                class="aux-entry com-configuration-spacing"
                data={this.headingMode}
                onRightInnerInc={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.heading.instance.openPopout(0);
                  this.heading.instance.focus(FocusPosition.First);
                  return true;
                }}
                onRightInnerDec={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.heading.instance.openPopout(0);
                  this.heading.instance.focus(FocusPosition.First);
                  return true;
                }}
              />
              <SelectableText
                ref={this.disSpdModeRef}
                class="aux-entry com-configuration-spacing"
                data={this.disSpdMode}
                onRightInnerInc={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.disSpd.instance.openPopout(0);
                  this.disSpd.instance.focus(FocusPosition.First);
                  return true;
                }}
                onRightInnerDec={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.disSpd.instance.openPopout(0);
                  this.disSpd.instance.focus(FocusPosition.First);
                  return true;
                }}
              />
              <SelectableText
                ref={this.altVsModeRef}
                class="aux-entry com-configuration-spacing"
                data={this.altVsMode}
                onRightInnerInc={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.altVs.instance.openPopout(0);
                  this.altVs.instance.focus(FocusPosition.First);
                  return true;
                }}
                onRightInnerDec={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.altVs.instance.openPopout(0);
                  this.altVs.instance.focus(FocusPosition.First);
                  return true;
                }}
              />
              <SelectableText
                ref={this.pressureModeRef}
                class="aux-entry com-configuration-spacing"
                data={this.pressureMode}
                onRightInnerInc={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.pressure.instance.openPopout(0);
                  this.pressure.instance.focus(FocusPosition.First);
                  return true;
                }}
                onRightInnerDec={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.pressure.instance.openPopout(0);
                  this.pressure.instance.focus(FocusPosition.First);
                  return true;
                }}
              />
              <SelectableText
                ref={this.tempModeRef}
                class="aux-entry com-configuration-spacing"
                data={this.tempMode}
                onRightInnerInc={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.temp.instance.openPopout(0);
                  this.temp.instance.focus(FocusPosition.First);
                  return true;
                }}
                onRightInnerDec={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.temp.instance.openPopout(0);
                  this.temp.instance.focus(FocusPosition.First);
                  return true;
                }}
              />
              <SelectableText
                ref={this.fuelModeRef}
                class="aux-entry com-configuration-spacing"
                data={this.fuelMode}
                onRightInnerInc={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.fuel.instance.openPopout(0);
                  this.fuel.instance.focus(FocusPosition.First);
                  return true;
                }}
                onRightInnerDec={(): boolean => {
                  this.scrollContainerRef.instance.blur();
                  this.fuel.instance.openPopout(0);
                  this.fuel.instance.focus(FocusPosition.First);
                  return true;
                }}
              />
            </div>
          </GNSUiControl>
        </div>
        <OptionDialog class='units-position-dialog-heading' label='HEADING MODE' onSelected={(index): void => this.setHeading(index)} ref={this.heading} onClosed={this.onDialogBoxClr} />
        <OptionDialog class='units-position-dialog-disspf' label='DIS, SPD UNITS' onSelected={(index): void => this.setDisSpd(index)} ref={this.disSpd} onClosed={this.onDialogBoxClr} />
        <OptionDialog class='units-position-dialog-altvs' label='ALT, VS UNITS' onSelected={(index): void => this.setAltVsUnits(index)} ref={this.altVs} onClosed={this.onDialogBoxClr} />
        <OptionDialog class='units-position-dialog-pressure' label='PRESSURE UNITS' onSelected={(index): void => this.setPressure(index)} ref={this.pressure} onClosed={this.onDialogBoxClr} />
        <OptionDialog class='units-position-dialog-temp' label='TEMP UNITS' onSelected={(index): void => this.setTemp(index)} ref={this.temp} onClosed={this.onDialogBoxClr} />
        <OptionDialog class='units-position-dialog-fuel' label='FUEL UNITS' onSelected={(index): void => this.setFuel(index)} ref={this.fuel} onClosed={this.onDialogBoxClr} />
        <OptionDialog class='units-position-dialog-position' label='POSITION FORMAT' onSelected={(index): void => this.setPositionFormat(index)} ref={this.positionFormat} onClosed={this.onDialogBoxClr} />
        <div ref={this.magvarRef} class={'units-position-magvar'}>
          {this.magvar}
        </div>
        {this.renderBottom()}
      </div>
    );
  }

}