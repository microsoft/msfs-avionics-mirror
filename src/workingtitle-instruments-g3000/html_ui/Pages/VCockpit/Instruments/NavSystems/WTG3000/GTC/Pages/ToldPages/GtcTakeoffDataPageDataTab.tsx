/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  BitFlags, ComponentProps, ComputedSubject, DisplayComponent, FSComponent, MappedSubject, NumberFormatter, NumberUnitSubject, OneWayRunway,
  SetSubject, Subject, Subscribable, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import { AirportWaypoint, NumberUnitDisplay, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { ToldLimitExceedance, ToldTakeoffPerformanceResult, ToldUserSettingTypes, VSpeedGroup, VSpeedUserSettingManager } from '@microsoft/msfs-wtg3000-common';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcToldDataPageTabContent } from './GtcToldDataPageTabContent';
import { GtcToldOriginDestDisplay } from './GtcToldOriginDestDisplay';

import './GtcToldDataPageDataTab.css';
import './GtcTakeoffDataPageDataTab.css';

/**
 * Component props for GtcTakeoffDataPageDataTab.
 */
export interface GtcTakeoffDataPageDataTabProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The avionics system's defined takeoff reference V-speed group. */
  takeoffVSpeedGroup: VSpeedGroup | undefined;

  /** The selected origin airport. */
  selectedAirport: Subscribable<AirportWaypoint | null>;

  /** The selected origin runway. */
  selectedRunway: Subscribable<OneWayRunway | null>;

  /** The calculated takeoff performance result. */
  result: Subscribable<ToldTakeoffPerformanceResult | null>;

  /** A manager for TOLD performance calculation user settings. */
  toldSettingManager: UserSettingManager<ToldUserSettingTypes>;

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC takeoff data page data tab.
 */
export class GtcTakeoffDataPageDataTab extends DisplayComponent<GtcTakeoffDataPageDataTabProps> implements GtcToldDataPageTabContent {
  private static readonly V_SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  private static readonly LENGTH_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  private static readonly WIND_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '__' });
  private static readonly TEMP_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '__' });
  private static readonly TEMP_LIMIT_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '__._' });

  private thisNode?: VNode;

  private readonly chkFlapsCssClass = SetSubject.create(['told-data-page-data-chk-flaps']);
  private readonly rightCssClass = SetSubject.create(['told-data-page-data-right', 'gtc-panel']);

  private readonly vSpeedValues = this.props.takeoffVSpeedGroup?.vSpeedDefinitions.map(def => {
    return {
      name: def.name,
      value: NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN))
    };
  }) ?? [];

  private readonly vSpeedFmsConfigMiscompareSettings = this.props.takeoffVSpeedGroup?.vSpeedDefinitions.map(def => {
    return this.props.vSpeedSettingManager.getSetting(`vSpeedFmsConfigMiscompare_${def.name}`);
  }) ?? [];

  private readonly fmsConfigMiscompare = MappedSubject.create(
    (miscompareSettings: readonly boolean[]) => miscompareSettings.includes(true),
    ...this.vSpeedFmsConfigMiscompareSettings
  );

  private readonly takeoffLengthAvailValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly takeoffLengthRequiredValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private readonly takeoffWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly headwindTitleText = ComputedSubject.create(0, val => val < 0 ? 'Tailwind' : 'Headwind');
  private readonly crosswindTitleText = ComputedSubject.create(0, val => val === 0 ? 'XWIND' : val < 0 ? 'R-XWIND' : 'L-XWIND');
  private readonly headwindValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly crosswindValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly weightLimitValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly runwayWeightLimitValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly pressureAltitudeTitleText = Subject.create('');
  private readonly pressureAltitudeValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly pressureAltitudeLimitValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private readonly temperatureTitleText = Subject.create('');
  private readonly temperatureValue = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN));
  private readonly temperatureLimitValue = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN));

  private readonly windLimitTitleText = Subject.create('');
  private readonly windExceededValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly windLimitValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private readonly canAcceptSpeeds = Subject.create(false);

  private lastDisplayedResult: ToldTakeoffPerformanceResult | null = null;

  private resultSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.resultSub = this.props.result.sub(this.onResultChanged.bind(this), false, true);
    this.fmsConfigMiscompare.sub(miscompare => { this.chkFlapsCssClass.toggle('hidden', !miscompare); }, true);
  }

  /**
   * Responds to when the calculated takeoff performance result changes.
   * @param result The new calculated takeoff performance result.
   */
  private onResultChanged(result: ToldTakeoffPerformanceResult | null): void {
    this.lastDisplayedResult = result;

    this.rightCssClass.delete('takeoff-data-result-valid');
    this.rightCssClass.delete('takeoff-data-result-length');
    this.rightCssClass.delete('takeoff-data-result-weight');
    this.rightCssClass.delete('takeoff-data-result-alt');
    this.rightCssClass.delete('takeoff-data-result-temp');
    this.rightCssClass.delete('takeoff-data-result-wind');

    if (result === null) {
      this.displayNullResult();
      return;
    }

    if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.Weight)) {
      this.showWeightExceededResult(result);
    } else if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.PressureAltitudeHigh | ToldLimitExceedance.PressureAltitudeLow)) {
      this.showPressureAltExceededResult(result);
    } else if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.TemperatureHigh | ToldLimitExceedance.TemperatureLow)) {
      this.showTemperatureExceededResult(result);
    } else if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.Headwind | ToldLimitExceedance.Tailwind)) {
      this.showWindExceededResult(result);
    } else if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.FieldLength)) {
      this.showLengthExceededResult(result);
    } else {
      this.showValidResult(result);
    }
  }

  /**
   * Displays a valid calculated takeoff performance result.
   * @param result The result to display.
   */
  private showValidResult(result: ToldTakeoffPerformanceResult): void {
    this.rightCssClass.add('takeoff-data-result-valid');

    this.canAcceptSpeeds.set(true);

    for (let i = 0; i < this.vSpeedValues.length; i++) {
      this.vSpeedValues[i].value.set(result.vSpeeds[i]?.value ?? NaN);
    }

    this.takeoffLengthAvailValue.set(result.runwayLengthAvailable ?? NaN);
    this.takeoffLengthRequiredValue.set(result.runwayLengthRequired < 0 ? NaN : result.runwayLengthRequired);

    this.takeoffWeightValue.set(result.weight ?? NaN);

    this.headwindTitleText.set(result.headwind ?? 0);
    this.crosswindTitleText.set(Math.round(result.crosswind ?? 0));
    this.headwindValue.set(Math.abs(result.headwind ?? NaN));
    this.crosswindValue.set(Math.abs(result.crosswind ?? NaN));
  }

  /**
   * Displays a takeoff performance result that has exceeded the runway length limit.
   * @param result The result to display.
   */
  private showLengthExceededResult(result: ToldTakeoffPerformanceResult): void {
    this.rightCssClass.add('takeoff-data-result-length');

    this.canAcceptSpeeds.set(false);

    for (let i = 0; i < this.vSpeedValues.length; i++) {
      this.vSpeedValues[i].value.set(result.vSpeeds[i]?.value ?? NaN);
    }

    this.takeoffLengthAvailValue.set(result.runwayLengthAvailable ?? NaN);
    this.takeoffLengthRequiredValue.set(result.runwayLengthRequired < 0 ? NaN : result.runwayLengthRequired);

    this.takeoffWeightValue.set(result.weight ?? NaN);

    this.runwayWeightLimitValue.set(result.maxRunwayWeight < 0 ? NaN : result.maxRunwayWeight);
  }

  /**
   * Displays a takeoff performance result that has exceeded a pressure altitude limit.
   * @param result The result to display.
   */
  private showPressureAltExceededResult(result: ToldTakeoffPerformanceResult): void {
    this.rightCssClass.add('takeoff-data-result-alt');

    this.canAcceptSpeeds.set(false);

    let text: string;
    let limit: number;
    if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.PressureAltitudeHigh)) {
      text = 'LIMIT EXCEEDED';
      limit = result.maxPressureAltitude ?? NaN;
    } else {
      text = 'BELOW MINIMUM';
      limit = result.minPressureAltitude ?? NaN;
    }

    this.pressureAltitudeTitleText.set(text);
    this.pressureAltitudeValue.set(result.pressureAltitude ?? NaN);
    this.pressureAltitudeLimitValue.set(limit);
  }

  /**
   * Displays a takeoff performance result that has exceeded a temperature limit.
   * @param result The result to display.
   */
  private showTemperatureExceededResult(result: ToldTakeoffPerformanceResult): void {
    this.rightCssClass.add('takeoff-data-result-temp');

    this.canAcceptSpeeds.set(false);

    let text: string;
    let limit: number;
    if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.TemperatureHigh)) {
      text = 'LIMIT EXCEEDED';
      limit = result.maxTemperature ?? NaN;
    } else {
      text = 'BELOW MINIMUM';
      limit = result.minTemperature ?? NaN;
    }

    this.temperatureTitleText.set(text);
    this.temperatureValue.set(result.temperature ?? NaN);
    this.pressureAltitudeValue.set(result.pressureAltitude ?? NaN);
    this.temperatureLimitValue.set(limit);
  }

  /**
   * Displays a takeoff performance result that has exceeded a wind limit.
   * @param result The result to display.
   */
  private showWindExceededResult(result: ToldTakeoffPerformanceResult): void {
    this.rightCssClass.add('takeoff-data-result-wind');

    this.canAcceptSpeeds.set(false);

    // Headwind/tailwind exceedance takes precedence over crosswind
    if (BitFlags.isAny(result.limitsExceeded, ToldLimitExceedance.Headwind | ToldLimitExceedance.Tailwind)) {
      const headwind = result.headwind ?? NaN;

      this.windLimitTitleText.set(headwind < 0 ? 'Tailwind' : 'Headwind');
      this.windExceededValue.set(Math.abs(headwind));
      this.windLimitValue.set((headwind < 0 ? result.maxTailwind : result.maxHeadwind) ?? NaN);
    } else {
      this.windLimitTitleText.set('Crosswind');
      this.windExceededValue.set(Math.abs(result.crosswind ?? NaN));
      this.windLimitValue.set(result.maxCrosswind ?? NaN);
    }
  }

  /**
   * Displays a takeoff performance result that has exceeded the maximum takeoff weight limit.
   * @param result The result to display.
   */
  private showWeightExceededResult(result: ToldTakeoffPerformanceResult): void {
    this.rightCssClass.add('takeoff-data-result-weight');

    this.canAcceptSpeeds.set(false);

    this.takeoffWeightValue.set(result.weight ?? NaN);
    this.weightLimitValue.set(result.maxWeight);
  }

  /**
   * Displays a null takeoff performance result.
   */
  private displayNullResult(): void {
    this.rightCssClass.add('takeoff-data-result-valid');

    this.canAcceptSpeeds.set(false);

    for (let i = 0; i < this.vSpeedValues.length; i++) {
      this.vSpeedValues[i].value.set(NaN);
    }

    this.takeoffLengthAvailValue.set(NaN);
    this.takeoffLengthRequiredValue.set(NaN);
    this.takeoffWeightValue.set(NaN);
    this.headwindTitleText.set(0);
    this.crosswindTitleText.set(0);
    this.headwindValue.set(NaN);
    this.crosswindValue.set(NaN);
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(): boolean {
    return false;
  }

  /** @inheritdoc */
  public onPause(): void {
    this.resultSub?.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.resultSub?.resume(this.props.result.get() !== this.lastDisplayedResult);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-data-page-data takeoff-data-page-data'>
        <div class='told-data-page-data-left'>
          <GtcToldOriginDestDisplay
            selectedAirport={this.props.selectedAirport}
            selectedRunway={this.props.selectedRunway}
            runwayLengthDisplayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
            includeDisplacedThreshold={true}
          />
          <GtcToggleTouchButton
            state={this.props.toldSettingManager.getSetting('toldTakeoffVSpeedsAccepted')}
            label='Accept<br>Takeoff<br>Speeds'
            isEnabled={this.canAcceptSpeeds}
            class='told-data-page-data-left-button told-data-page-data-accept-speeds-button'
          />
          <div class={this.chkFlapsCssClass}>CHK FLAPS</div>
        </div>
        <div class={this.rightCssClass}>
          {this.renderValidResult()}
          {this.renderFieldLengthExceededResult()}
          {this.renderWeightLimitExceededResult()}
          {this.renderPressureAltLimitExceededResult()}
          {this.renderTemperatureLimitExceededResult()}
          {this.renderWindLimitExceededResult()}
        </div>
      </div>
    );
  }

  /**
   * Renders the valid result panel.
   * @returns The valid result panel, as a VNode.
   */
  private renderValidResult(): VNode {
    return (
      <div class='told-data-page-data-right-result takeoff-data-page-data-result-valid'>
        <div class='told-data-page-data-result-section-bottom-sep told-data-page-data-result-vspeed-section'>
          {this.vSpeedValues.map(value => {
            return (
              <div class='told-data-page-data-vspeed'>
                <div class='told-data-page-data-vspeed-name'>V{value.name}</div>
                <NumberUnitDisplay
                  value={value.value}
                  displayUnit={null}
                  formatter={GtcTakeoffDataPageDataTab.V_SPEED_FORMATTER}
                  class='told-data-page-data-result-value told-data-page-data-vspeed-value'
                />
              </div>
            );
          })}
        </div>
        <div class='told-data-page-data-result-section-bottom-sep takeoff-data-page-data-result-length-section'>
          <div class='told-data-page-data-result-title takeoff-data-page-data-result-length-section-title'>Takeoff Field Length</div>
          <div class='takeoff-data-page-data-result-length-fields'>
            <div class='told-data-page-data-result-field takeoff-data-page-data-result-length-field'>
              <div class='told-data-page-data-result-title'>Available</div>
              <NumberUnitDisplay
                value={this.takeoffLengthAvailValue}
                displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                formatter={GtcTakeoffDataPageDataTab.LENGTH_FORMATTER}
                class='told-data-page-data-result-value takeoff-data-page-data-result-length-avail-value'
              />
            </div>
            <div class='told-data-page-data-result-field takeoff-data-page-data-result-length-field'>
              <div class='told-data-page-data-result-title'>Required</div>
              <NumberUnitDisplay
                value={this.takeoffLengthRequiredValue}
                displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                formatter={GtcTakeoffDataPageDataTab.LENGTH_FORMATTER}
                class='told-data-page-data-result-value takeoff-data-page-data-result-length-required-value'
              />
            </div>
          </div>
        </div>
        <div class='told-data-page-data-result-section-bottom-sep takeoff-data-page-data-result-valid-wind-section'>
          <div class='told-data-page-data-result-field takeoff-data-page-data-result-wind-field'>
            <div class='told-data-page-data-result-title'>{this.headwindTitleText}</div>
            <NumberUnitDisplay
              value={this.headwindValue}
              displayUnit={this.props.unitsSettingManager.speedUnits}
              formatter={GtcTakeoffDataPageDataTab.WIND_FORMATTER}
              class='told-data-page-data-result-value takeoff-data-page-data-result-wind-value'
            />
          </div>
          <div class='told-data-page-data-result-field takeoff-data-page-data-result-wind-field'>
            <div class='told-data-page-data-result-title'>{this.crosswindTitleText}</div>
            <NumberUnitDisplay
              value={this.crosswindValue}
              displayUnit={this.props.unitsSettingManager.speedUnits}
              formatter={GtcTakeoffDataPageDataTab.WIND_FORMATTER}
              class='told-data-page-data-result-value takeoff-data-page-data-result-wind-value'
            />
          </div>
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-weight-section'>
          <div class='told-data-page-data-result-title'>Takeoff Weight</div>
          <NumberUnitDisplay
            value={this.takeoffWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcTakeoffDataPageDataTab.WEIGHT_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-result-weight-value'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the field length exceeded result panel.
   * @returns The field length exceeded result panel, as a VNode.
   */
  private renderFieldLengthExceededResult(): VNode {
    return (
      <div class='told-data-page-data-right-result takeoff-data-page-data-result-length'>
        <div class='told-data-page-data-result-section-bottom-sep told-data-page-data-invalid-result-title-section'>
          FIELD LENGTH EXCEEDED
        </div>
        <div class='told-data-page-data-result-section-bottom-sep takeoff-data-page-data-result-length-section'>
          <div class='told-data-page-data-result-title takeoff-data-page-data-result-length-section-title'>Takeoff Field Length</div>
          <div class='takeoff-data-page-data-result-length-fields'>
            <div class='told-data-page-data-result-field takeoff-data-page-data-result-length-field'>
              <div class='told-data-page-data-result-title'>Available</div>
              <NumberUnitDisplay
                value={this.takeoffLengthAvailValue}
                displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                formatter={GtcTakeoffDataPageDataTab.LENGTH_FORMATTER}
                class='told-data-page-data-result-value takeoff-data-page-data-result-length-avail-value'
              />
            </div>
            <div class='told-data-page-data-result-field takeoff-data-page-data-result-length-field'>
              <div class='told-data-page-data-result-title'>Required</div>
              <NumberUnitDisplay
                value={this.takeoffLengthRequiredValue}
                displayUnit={this.props.unitsSettingManager.distanceUnitsSmall}
                formatter={GtcTakeoffDataPageDataTab.LENGTH_FORMATTER}
                class='told-data-page-data-result-value takeoff-data-page-data-result-length-required-value'
              />
            </div>
          </div>
        </div>
        <div class='told-data-page-data-result-field told-data-page-data-result-section-bottom-sep takeoff-data-page-data-result-weight-section'>
          <div class='told-data-page-data-result-title'>Takeoff Weight</div>
          <NumberUnitDisplay
            value={this.takeoffWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcTakeoffDataPageDataTab.WEIGHT_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-result-weight-value'
          />
        </div>
        <div class='takeoff-data-page-data-result-runway-weight-limit-section'>
          <div class='told-data-page-data-result-title'>Available Runway<br />Maximum Weight</div>
          <NumberUnitDisplay
            value={this.runwayWeightLimitValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcTakeoffDataPageDataTab.WEIGHT_FORMATTER}
            class='told-data-page-data-result-value'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the weight limit exceeded result panel.
   * @returns The weight limit exceeded result panel, as a VNode.
   */
  private renderWeightLimitExceededResult(): VNode {
    return (
      <div class='told-data-page-data-right-result takeoff-data-page-data-result-weight'>
        <div class='told-data-page-data-result-section-bottom-sep told-data-page-data-invalid-result-title-section'>
          WEIGHT LIMIT EXCEEDED
        </div>
        <div class='told-data-page-data-result-field told-data-page-data-result-section-bottom-sep takeoff-data-page-data-result-weight-section'>
          <div class='told-data-page-data-result-title'>Takeoff Weight</div>
          <NumberUnitDisplay
            value={this.takeoffWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcTakeoffDataPageDataTab.WEIGHT_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-result-weight-value'
          />
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-weight-limit-section'>
          <div class='told-data-page-data-result-title'>Takeoff Weight Limit</div>
          <NumberUnitDisplay
            value={this.weightLimitValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={GtcTakeoffDataPageDataTab.WEIGHT_FORMATTER}
            class='told-data-page-data-result-value'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the pressure altitude limit exceeded result panel.
   * @returns The pressure altitude limit exceeded result panel, as a VNode.
   */
  private renderPressureAltLimitExceededResult(): VNode {
    return (
      <div class='told-data-page-data-right-result takeoff-data-page-data-result-alt'>
        <div class='told-data-page-data-result-section-bottom-sep told-data-page-data-invalid-result-title-section'>
          PRESSURE<br />ALTITUDE<br />{this.pressureAltitudeTitleText}
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-alt-section'>
          <div class='told-data-page-data-result-title'>Takeoff Pressure<br />Altitude</div>
          <NumberUnitDisplay
            value={this.pressureAltitudeValue}
            displayUnit={this.props.unitsSettingManager.altitudeUnits}
            formatter={GtcTakeoffDataPageDataTab.ALTITUDE_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-result-alt-value'
          />
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-alt-limit-section'>
          <div class='told-data-page-data-result-title'>Pressure Altitude<br />Limit</div>
          <NumberUnitDisplay
            value={this.pressureAltitudeLimitValue}
            displayUnit={this.props.unitsSettingManager.altitudeUnits}
            formatter={GtcTakeoffDataPageDataTab.ALTITUDE_FORMATTER}
            class='told-data-page-data-result-value'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the temperature limit exceeded result panel.
   * @returns The temperature limit exceeded result panel, as a VNode.
   */
  private renderTemperatureLimitExceededResult(): VNode {
    return (
      <div class='told-data-page-data-right-result takeoff-data-page-data-result-temp'>
        <div class='told-data-page-data-result-section-bottom-sep told-data-page-data-invalid-result-title-section'>
          TEMPERATURE<br />{this.temperatureTitleText}
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-temp-section'>
          <div class='told-data-page-data-result-title'>Takeoff Temperature</div>
          <NumberUnitDisplay
            value={this.temperatureValue}
            displayUnit={this.props.unitsSettingManager.temperatureUnits}
            formatter={GtcTakeoffDataPageDataTab.TEMP_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-result-temp-value'
          />
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-temp-limit-section'>
          <div class='told-data-page-data-result-title'>Temperature Limit At</div>
          <NumberUnitDisplay
            value={this.pressureAltitudeValue}
            displayUnit={this.props.unitsSettingManager.altitudeUnits}
            formatter={GtcTakeoffDataPageDataTab.ALTITUDE_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-temp-result-alt-value'
          />
          <NumberUnitDisplay
            value={this.temperatureLimitValue}
            displayUnit={this.props.unitsSettingManager.temperatureUnits}
            formatter={GtcTakeoffDataPageDataTab.TEMP_LIMIT_FORMATTER}
            class='told-data-page-data-result-value'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the wind limit exceeded result panel.
   * @returns The wind limit exceeded result panel, as a VNode.
   */
  private renderWindLimitExceededResult(): VNode {
    return (
      <div class='told-data-page-data-right-result takeoff-data-page-data-result-wind'>
        <div class='told-data-page-data-result-section-bottom-sep told-data-page-data-invalid-result-title-section'>
          WIND LIMIT EXCEEDED
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-wind-section'>
          <div class='told-data-page-data-result-title'>{this.windLimitTitleText}</div>
          <NumberUnitDisplay
            value={this.windExceededValue}
            displayUnit={this.props.unitsSettingManager.speedUnits}
            formatter={GtcTakeoffDataPageDataTab.WIND_FORMATTER}
            class='told-data-page-data-result-value takeoff-data-page-data-result-wind-value'
          />
        </div>
        <div class='told-data-page-data-result-field takeoff-data-page-data-result-wind-limit-section'>
          <div class='told-data-page-data-result-title'>Maximum<br />{this.windLimitTitleText}</div>
          <NumberUnitDisplay
            value={this.windLimitValue}
            displayUnit={this.props.unitsSettingManager.speedUnits}
            formatter={GtcTakeoffDataPageDataTab.WIND_FORMATTER}
            class='told-data-page-data-result-value'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.fmsConfigMiscompare.destroy();

    this.resultSub?.destroy();

    super.destroy();
  }
}