import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, FacilityLoader, FSComponent, MagVar,
  Metar, MetarWindSpeedUnits, NavMath, NumberFormatter, NumberUnitSubject, OneWayRunway,
  SetSubject, Subject, Subscribable, Subscription, Unit, UnitFamily, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import { AirportWaypoint, BearingDisplay, NumberUnitDisplay, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { ControllableDisplayPaneIndex, ToldRunwaySurfaceCondition, ToldUserSettingTypes } from '@microsoft/msfs-wtg3000-common';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcBaroPressureDialog } from '../../Dialog/GtcBaroPressureDialog';
import { GtcCourseDialog } from '../../Dialog/GtcCourseDialog';
import { GtcDialogChainStep, GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcDialogResultSubmitted } from '../../Dialog/GtcDialogView';
import { GtcSpeedDialog, GtcSpeedDialogOutput } from '../../Dialog/GtcSpeedDialog';
import { GtcTemperatureDialog } from '../../Dialog/GtcTemperatureDialog';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcToldOriginDestDisplay } from './GtcToldOriginDestDisplay';

import './GtcToldDataPageWeatherTab.css';

/**
 * Component props for GtcToldDataPageWeatherTab.
 */
export interface GtcToldDataPageWeatherTabProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The GTC control mode to which the tab's parent view belongs. */
  controlMode: GtcControlMode;

  /** The index of the display pane that the tab's parent view is tied to. */
  displayPaneIndex?: ControllableDisplayPaneIndex;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** The selected airport. */
  selectedAirport: Subscribable<AirportWaypoint | null>;

  /** The selected runway. */
  selectedRunway: Subscribable<OneWayRunway | null>;

  /** The magnetic variation, in degrees, at the selected runway or airport. */
  magVar: Subscribable<number>;

  /** A manager for TOLD performance calculation user settings. */
  toldSettingManager: UserSettingManager<ToldUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the tab is for the takeoff data page. */
  isTakeoff: boolean;
}

/**
 * GTC view keys for popups owned by TOLD data page weather tabs.
 */
enum GtcToldDataPageWeatherTabPopupKeys {
  ToldMetar = 'ToldMetar'
}

/**
 * A GTC TOLD (takeoff/landing) data page weather tab.
 */
export class GtcToldDataPageWeatherTab extends DisplayComponent<GtcToldDataPageWeatherTabProps> implements GtcToldDataPageTabContent {
  private static readonly RUNWAY_SURFACE_CONDITION_MAP = (condition: ToldRunwaySurfaceCondition): string => {
    return condition === ToldRunwaySurfaceCondition.Wet ? 'Wet' : 'Dry';
  };

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '__' });
  private static readonly TEMPERATURE_FORMATTER = NumberFormatter.create({ precision: 1, useMinusSign: true, nanString: '___' });
  private static readonly INHG_FORMATTER = NumberFormatter.create({ precision: 0.01, nanString: '__.__' });
  private static readonly HPA_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private thisNode?: VNode;

  private readonly ratCssClass = SetSubject.create(['told-data-page-weather-temperature-button-value-rat']);

  private readonly settingString = this.props.isTakeoff ? 'Takeoff' : 'Landing';

  private readonly windDirectionSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}WindDirection`);
  private readonly windSpeedSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}WindSpeed`);
  private readonly temperatureSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}Temperature`);
  private readonly pressureSetting = this.props.toldSettingManager.getSetting(`told${this.settingString}Pressure`);

  private readonly windDialogChainSteps: [GtcDialogChainStep<GtcCourseDialog>, GtcDialogChainStep<GtcSpeedDialog>] = [
    {
      key: GtcViewKeys.CourseDialog,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        // Convert the initial direction to magnetic or true degrees depending on the current nav angle setting.
        // If the direction is uninitialized, then set the initial value to 0 (360) degrees in the current nav angle unit.
        const isMagnetic = this.props.unitsSettingManager.navAngleUnits.get().isMagnetic();
        const initialValueTrueDeg = Math.max(0, this.windDirectionSetting.value);
        const initialValue = Math.round(
          isMagnetic ? MagVar.trueToMagnetic(initialValueTrueDeg, this.props.magVar.get()) : initialValueTrueDeg
        ) % 360;
        return {
          title: 'Wind Direction',
          initialValue: initialValue === 0 ? 360 : initialValue
        };
      },
      delay: 150
    },
    {
      key: GtcViewKeys.SpeedDialog1,
      popupType: 'normal',
      popupOcclusionType: 'hide',
      input: () => {
        const unitType = this.props.unitsSettingManager.speedUnits.get();
        return {
          title: 'Wind Speed',
          initialValue: Math.max(this.windSpeedSetting.value, 0),
          initialUnit: UnitType.KNOT,
          unitType,
          minimumValue: 0,
          maximumValue: Math.round(UnitType.KNOT.convertTo(99, unitType))
        };
      }
    }
  ];

  private readonly windDirection = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(0));
  private readonly windSpeed = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly temperature = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(0));
  private readonly pressure = NumberUnitSubject.create(UnitType.HPA.createNumber(0));

  private readonly hasMetar = Subject.create(false);
  private lastMetarIcao?: string;
  private checkMetarOpId = 0;

  private loadMetarOpId = 0;
  private showMetarOpId = 0;

  private airportSub?: Subscription;
  private magVarSub?: Subscription;
  private windDirectionPipe?: Subscription;
  private windSpeedPipe?: Subscription;
  private temperaturePipe?: Subscription;
  private pressurePipe?: Subscription;
  private useRatSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcToldDataPageWeatherTabPopupKeys.ToldMetar,
      this.props.controlMode,
      (gtcService, controlMode, displayPaneIndex) => <GtcToldMetarPopup gtcService={gtcService} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />,
      this.props.displayPaneIndex
    );

    this.airportSub = this.props.selectedAirport.sub(async airport => {
      if (airport === null) {
        this.lastMetarIcao = undefined;
        this.hasMetar.set(false);
      } else {
        const opId = ++this.checkMetarOpId;
        let metar: Metar | undefined;

        try {
          metar = await this.props.facLoader.getMetar(airport.facility.get());
        } catch {
          // noop
        }

        if (opId !== this.checkMetarOpId) {
          return;
        }

        this.lastMetarIcao = airport.facility.get().icao;
        this.hasMetar.set(metar !== undefined);
      }
    }, false, true);

    this.magVarSub = this.props.magVar.sub(magVar => {
      this.windDirection.set(this.windDirection.get().number, magVar);
    }, true);

    this.windDirectionPipe = this.windDirectionSetting.pipe(this.windDirection, value => value < 0 ? NaN : value, true);
    this.windSpeedPipe = this.windSpeedSetting.pipe(this.windSpeed, value => value < 0 ? NaN : value, true);

    this.temperaturePipe = this.temperatureSetting.pipe(this.temperature, value => value <= Number.MIN_SAFE_INTEGER ? NaN : value, true);

    if (this.props.isTakeoff) {
      this.useRatSub = this.props.toldSettingManager.getSetting('toldTakeoffUseRat').sub(useRat => {
        this.ratCssClass.toggle('hidden', !useRat);
      }, false, true);
    } else {
      this.ratCssClass.add('hidden');

      this.pressurePipe = this.pressureSetting.pipe(this.pressure, value => value < 0 ? NaN : value, true);
    }
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public onPause(): void {
    this.airportSub?.pause();
    this.windDirectionPipe?.pause();
    this.windSpeedPipe?.pause();
    this.temperaturePipe?.pause();
    this.useRatSub?.pause();
    this.pressurePipe?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    if (this.props.selectedAirport.get()?.facility.get().icao === this.lastMetarIcao) {
      this.airportSub?.resume();
    } else {
      this.hasMetar.set(false);
      this.airportSub?.resume(true);
    }

    this.windDirectionPipe?.resume(true);
    this.windSpeedPipe?.resume(true);
    this.temperaturePipe?.resume(true);
    this.useRatSub?.resume(true);
    this.pressurePipe?.resume(true);
  }

  /**
   * Loads METAR data into this tab's wind parameters.
   */
  private async loadMetarData(): Promise<void> {
    const airport = this.props.selectedAirport.get();

    if (airport === null) {
      return;
    }

    const opId = ++this.loadMetarOpId;

    let metar: Metar | undefined;

    try {
      metar = await this.props.facLoader.getMetar(airport.facility.get());
    } catch {
      // noop
    }

    if (metar === undefined || opId !== this.loadMetarOpId) {
      return;
    }

    const windSpeed = metar.windSpeed;

    let windSpeedUnit: Unit<UnitFamily.Speed>;
    switch (metar.windSpeedUnits) {
      case MetarWindSpeedUnits.KilometerPerHour:
        windSpeedUnit = UnitType.KPH;
        break;
      case MetarWindSpeedUnits.MeterPerSecond:
        windSpeedUnit = UnitType.MPS;
        break;
      default:
        windSpeedUnit = UnitType.KNOT;
    }

    this.windDirectionSetting.value = NavMath.normalizeHeading(metar.windDir);
    this.windSpeedSetting.value = windSpeedUnit.convertTo(windSpeed, UnitType.KNOT);

    if (!this.props.isTakeoff) {
      this.temperatureSetting.value = metar.temp;

      const baro = metar.altimeterA !== undefined
        ? UnitType.IN_HG.convertTo(metar.altimeterA, UnitType.HPA)
        : metar.altimeterQ;

      if (baro !== undefined) {
        this.pressureSetting.value = baro;
      }
    }
  }

  /**
   * Opens a popup to show the current raw METAR data for the selected airport.
   */
  private async showMetarData(): Promise<void> {
    const airport = this.props.selectedAirport.get();

    if (airport === null) {
      return;
    }

    const opId = ++this.showMetarOpId;

    let metar: Metar | undefined;

    try {
      metar = await this.props.facLoader.getMetar(airport.facility.get());
    } catch {
      // noop
    }

    if (metar === undefined || opId !== this.showMetarOpId) {
      return;
    }

    this.props.gtcService.openPopup<GtcToldMetarPopup>(GtcToldDataPageWeatherTabPopupKeys.ToldMetar, 'normal', 'hide')
      .ref.setMetar(metar);
  }

  /**
   * Opens a dialog chain to select this tab's wind parameters.
   */
  private async selectWind(): Promise<void> {
    const result = await GtcDialogs.openDialogChain(this.props.gtcService, this.windDialogChainSteps);
    if (!result.wasCancelled) {
      const direction = (result.payload[0] as GtcDialogResultSubmitted<number>).payload;

      this.windDirectionSetting.value = this.props.unitsSettingManager.navAngleUnits.get().isMagnetic()
        ? MagVar.magneticToTrue(direction, this.props.magVar.get())
        : direction;

      const speed = (result.payload[1] as GtcDialogResultSubmitted<GtcSpeedDialogOutput>).payload;

      this.windSpeedSetting.value = speed.unit.convertTo(speed.value, UnitType.KNOT);
    }
  }

  /**
   * Opens a dialog chain to select this tab's temperature parameter.
   */
  private async selectTemperature(): Promise<void> {
    const initialValue = this.temperatureSetting.value;
    const unitType = this.props.unitsSettingManager.temperatureUnits.get();

    const result = await this.props.gtcService.openPopup<GtcTemperatureDialog>(GtcViewKeys.TemperatureDialog1)
      .ref.request({
        title: 'Temperature',
        initialValue: initialValue <= Number.MIN_SAFE_INTEGER ? 15 : initialValue,
        initialUnit: UnitType.CELSIUS,
        unitType,
        minimumValue: Math.round(UnitType.CELSIUS.convertTo(-99, unitType)),
        maximumValue: Math.round(UnitType.CELSIUS.convertTo(99, unitType))
      });

    if (!result.wasCancelled) {
      if (this.props.isTakeoff) {
        this.props.toldSettingManager.getSetting('toldTakeoffUseRat').value = false;
      }
      this.temperatureSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.CELSIUS);
    }
  }

  /**
   * Opens a dialog chain to select this tab's barometric pressure parameter.
   */
  private async selectPressure(): Promise<void> {
    const initialValue = this.pressureSetting.value;

    const result = await this.props.gtcService.openPopup<GtcBaroPressureDialog>(GtcViewKeys.BaroPressureDialog1)
      .ref.request({
        title: 'Barometric Pressure',
        initialValue: initialValue < 0 ? 1013.25 : initialValue,
        initialUnit: UnitType.HPA,
        unitsMode: 'inhg',
        minimumValue: 25,
        maximumValue: 35
      });

    if (!result.wasCancelled) {
      this.pressureSetting.value = result.payload.unit.convertTo(result.payload.value, UnitType.HPA);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-data-page-weather'>
        <div class='told-data-page-weather-left'>
          <GtcToldOriginDestDisplay
            selectedAirport={this.props.selectedAirport}
            selectedRunway={this.props.selectedRunway}
            runwayLengthDisplayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
            includeDisplacedThreshold={this.props.isTakeoff}
          />
          <div class='told-data-page-weather-left-buttons'>
            <GtcTouchButton
              label={`Load<br>METAR<br>${this.props.isTakeoff ? 'Wind' : 'Data'}`}
              isEnabled={this.hasMetar}
              onPressed={this.loadMetarData.bind(this)}
              class='told-data-page-weather-left-button'
            />
            {this.props.isTakeoff && (
              <GtcToggleTouchButton
                state={this.props.toldSettingManager.getSetting('toldTakeoffUseRat')}
                label='Use RAT'
                isEnabled={this.props.toldSettingManager.getSetting('toldTakeoffCanUseRat')}
                class='told-data-page-weather-left-button'
              />
            )}
            <GtcTouchButton
              label='Show<br>METAR'
              isEnabled={this.hasMetar}
              onPressed={this.showMetarData.bind(this)}
              class='told-data-page-weather-left-button'
            />
          </div>
        </div>
        <div class='told-data-page-weather-right gtc-panel'>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            label='Runway Surface'
            state={this.props.toldSettingManager.getSetting(`told${this.settingString}RunwaySurface`)}
            renderValue={GtcToldDataPageWeatherTab.RUNWAY_SURFACE_CONDITION_MAP}
            listParams={state => {
              return {
                title: 'Runway Surface',
                inputData: [
                  {
                    value: ToldRunwaySurfaceCondition.Dry,
                    labelRenderer: () => GtcToldDataPageWeatherTab.RUNWAY_SURFACE_CONDITION_MAP(ToldRunwaySurfaceCondition.Dry)
                  },
                  {
                    value: ToldRunwaySurfaceCondition.Wet,
                    labelRenderer: () => GtcToldDataPageWeatherTab.RUNWAY_SURFACE_CONDITION_MAP(ToldRunwaySurfaceCondition.Wet)
                  }
                ],
                selectedValue: state
              };
            }}
            class='told-data-page-weather-right-button told-data-page-weather-surface-button'
          />
          <GtcTouchButton
            label='Wind'
            onPressed={this.selectWind.bind(this)}
            class='told-data-page-weather-right-button told-data-page-weather-wind-button'
          >
            <div class='touch-button-value-value told-data-page-weather-wind-button-value'>
              <BearingDisplay
                value={this.windDirection}
                displayUnit={this.props.unitsSettingManager.navAngleUnits}
                formatter={GtcToldDataPageWeatherTab.BEARING_FORMATTER}
              />
              <div class='told-data-page-weather-wind-button-value-sep'> @ </div>
              <NumberUnitDisplay
                value={this.windSpeed}
                displayUnit={this.props.unitsSettingManager.speedUnits}
                formatter={GtcToldDataPageWeatherTab.SPEED_FORMATTER}
              />
            </div>
          </GtcTouchButton>
          <GtcTouchButton
            label='Temperature'
            onPressed={this.selectTemperature.bind(this)}
            class='told-data-page-weather-right-button told-data-page-weather-temperature-button'
          >
            <div class='touch-button-value-value told-data-page-weather-temperature-button-value'>
              <NumberUnitDisplay
                value={this.temperature}
                displayUnit={this.props.unitsSettingManager.temperatureUnits}
                formatter={GtcToldDataPageWeatherTab.TEMPERATURE_FORMATTER}
                class='told-data-page-weather-temperature-button-value-number'
              />
              <div class={this.ratCssClass}>(RAT)</div>
            </div>
          </GtcTouchButton>
          {!this.props.isTakeoff && (
            <GtcTouchButton
              label='Barometric Pressure'
              onPressed={this.selectPressure.bind(this)}
              class='told-data-page-weather-right-button told-data-page-weather-baro-button'
            >
              <div class='touch-button-value-value told-data-page-weather-baro-button-value'>
                <NumberUnitDisplay
                  value={this.pressure}
                  displayUnit={UnitType.IN_HG}
                  formatter={GtcToldDataPageWeatherTab.INHG_FORMATTER}
                  class='told-data-page-weather-baro-button-value-number'
                />
              </div>
            </GtcTouchButton>
          )}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.airportSub?.destroy();
    this.magVarSub?.destroy();
    this.windDirectionPipe?.destroy();
    this.windSpeedPipe?.destroy();
    this.temperaturePipe?.destroy();
    this.useRatSub?.destroy();
    this.pressurePipe?.destroy();

    super.destroy();
  }
}

/**
 * A GTC popup which displays raw METAR data.
 */
class GtcToldMetarPopup extends GtcView {
  private readonly text = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('METAR Information');
  }

  /**
   * Sets the METAR to display.
   * @param metar The METAR to display. If `null`, the popup will display no text.
   */
  public setMetar(metar: Metar | null): void {
    this.text.set(metar?.metarString ?? '');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-metar-popup'>
        {this.text}
      </div>
    );
  }
}