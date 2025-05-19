import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, NumberFormatter, NumberUnitSubject,
  SetSubject, Subscribable, Subscription, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { TemperatureInfoDataProvider } from './TemperatureInfoDataProvider';

import './TemperatureInfo.css';

/**
 * Display formats for {@link TemperatureInfo}.
 */
export enum TemperatureInfoFormat {
  /** Displays outside air temperature and delta ISA temperature. */
  Normal = 'Normal',

  /** Displays outside air temperature in degrees Celsius and degrees Fahrenheit. */
  Oat = 'Oat',
}

/**
 * Component props for {@link TemperatureInfo}.
 */
export interface TemperatureInfoProps extends ComponentProps {
  /** The format of the display. */
  format: TemperatureInfoFormat;

  /** A data provider for the display. */
  dataProvider: TemperatureInfoDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 temperature information display. Displays outside (static) air temperature and deviation from ISA.
 */
export class TemperatureInfo extends DisplayComponent<TemperatureInfoProps> {
  private readonly topRef = FSComponent.createRef<NumberUnitDisplay<any>>();
  private readonly bottomRef = FSComponent.createRef<NumberUnitDisplay<any>>();

  private readonly rootCssClass = SetSubject.create(['temperature-info']);

  private readonly oat = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(0));
  private readonly oatdegF = NumberUnitSubject.create(UnitType.FAHRENHEIT.createNumber(0));
  private readonly isa = NumberUnitSubject.create(UnitType.DELTA_CELSIUS.createNumber(0));

  private readonly dataSubs: Subscription[] = [];

  private isDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.props.format === TemperatureInfoFormat.Oat) {
      this.dataSubs.push(
        this.props.dataProvider.oat.sub(oat => {
          this.oat.set(MathUtils.round(oat, 0.1));
          this.oatdegF.set(MathUtils.round(UnitType.CELSIUS.convertTo(oat, UnitType.FAHRENHEIT), 0.1));
        }, false, true)
      );
    } else {
      const pipeFunc = ([oat, unit]: readonly [number, Unit<UnitFamily.TemperatureDelta>]): number => {
        return MathUtils.round(oat, unit.convertTo(0.1, UnitType.DELTA_CELSIUS));
      };

      const oatState = MappedSubject.create(
        this.props.dataProvider.oat,
        this.props.unitsSettingManager.temperatureDeltaUnits
      ).pause();

      const isaState = MappedSubject.create(
        this.props.dataProvider.deltaIsa,
        this.props.unitsSettingManager.temperatureDeltaUnits
      ).pause();

      this.dataSubs.push(
        oatState,
        isaState,
        oatState.pipe(this.oat, pipeFunc, true),
        isaState.pipe(this.isa, pipeFunc, true),
      );
    }

    this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(this.onDataFailedChanged.bind(this), false, true);

    this.declutterSub = this.props.declutter.sub(this.onDeclutterChanged.bind(this), true);
  }

  /**
   * Responds to when whether this display is decluttered changes.
   * @param declutter Whether this display is decluttered.
   */
  private onDeclutterChanged(declutter: boolean): void {
    if (declutter) {
      this.rootCssClass.add('hidden');

      this.isDataFailedSub!.pause();
      for (const sub of this.dataSubs) {
        sub.pause();
      }
    } else {
      this.rootCssClass.delete('hidden');

      this.isDataFailedSub!.resume(true);
    }
  }

  /**
   * Responds to when whether temperature data has failed changes.
   * @param isFailed Whether temperature data has failed.
   */
  private onDataFailedChanged(isFailed: boolean): void {
    if (isFailed) {
      for (const sub of this.dataSubs) {
        sub.pause();
      }

      this.rootCssClass.add('data-failed');
    } else {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }

      this.rootCssClass.delete('data-failed');
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return this.props.format === TemperatureInfoFormat.Oat ? this.renderOat() : this.renderNormal();
  }

  /**
   * Renders this display with the normal format.
   * @returns This display with the normal format, as a VNode.
   */
  private renderNormal(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='temperature-info-row temperature-info-row-top'>
          <div class='temperature-info-title'>OAT</div>
          <NumberUnitDisplay
            ref={this.topRef}
            value={this.oat}
            displayUnit={this.props.unitsSettingManager.temperatureUnits}
            formatter={TemperatureInfo.oatFormatter()}
            class='temperature-info-value'
          />

          <div class='failed-box-container'><div class='failed-box' /></div>
        </div>
        <div class='temperature-info-row temperature-info-row-bottom'>
          <div class='temperature-info-title'>ISA</div>
          <NumberUnitDisplay
            ref={this.bottomRef}
            value={this.isa}
            displayUnit={this.props.unitsSettingManager.temperatureDeltaUnits}
            formatter={TemperatureInfo.isaFormatter()}
            class='temperature-info-value'
          />

          <div class='failed-box-container'><div class='failed-box' /></div>
        </div>
      </div>
    );
  }

  /**
   * Renders this display with the double-OAT format.
   * @returns This display with the double-OAT format, as a VNode.
   */
  private renderOat(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='temperature-info-row temperature-info-row-top'>
          <div class='temperature-info-title'>OAT</div>
          <NumberUnitDisplay
            ref={this.topRef}
            value={this.oat}
            displayUnit={UnitType.CELSIUS}
            formatter={TemperatureInfo.oatFormatter()}
            class='temperature-info-value'
          />

          <div class='failed-box-container'><div class='failed-box' /></div>
        </div>
        <div class='temperature-info-row temperature-info-row-bottom'>
          <div class='temperature-info-title'>OAT</div>
          <NumberUnitDisplay
            ref={this.bottomRef}
            value={this.oatdegF}
            displayUnit={UnitType.FAHRENHEIT}
            formatter={TemperatureInfo.oatFormatter()}
            class='temperature-info-value'
          />

          <div class='failed-box-container'><div class='failed-box' /></div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.topRef.getOrDefault()?.destroy();
    this.bottomRef.getOrDefault()?.destroy();

    for (const sub of this.dataSubs) {
      sub.destroy();
    }

    this.isDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }

  /**
   * Creates a text formatter for outside air temperature.
   * @returns A new text formatter for outside air temperature.
   */
  private static oatFormatter(): (val: number) => string {
    return NumberFormatter.create({ precision: 1, hysteresis: 0.2 });
  }

  /**
   * Creates a text formatter for delta ISA temperature.
   * @returns A new text formatter for delta ISA temperature.
   */
  private static isaFormatter(): (val: number) => string {
    return NumberFormatter.create({ precision: 1, forceSign: true, hysteresis: 0.2 });
  }
}
