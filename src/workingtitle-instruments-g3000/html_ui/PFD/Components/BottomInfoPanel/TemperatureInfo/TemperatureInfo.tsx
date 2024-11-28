import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscribable, SubscribableMapFunctions, Subscription,
  UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { TemperatureInfoDataProvider } from './TemperatureInfoDataProvider';

import './TemperatureInfo.css';

/**
 * Component props for TemperatureInfo.
 */
export interface TemperatureInfoProps extends ComponentProps {
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
  private static readonly OAT_FORMATTER = NumberFormatter.create({ precision: 1 });
  private static readonly ISA_FORMATTER = NumberFormatter.create({ precision: 1, forceSign: true });

  private readonly oatRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Temperature>>();
  private readonly isaRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.TemperatureDelta>>();

  private readonly rootCssClass = SetSubject.create(['temperature-info']);

  private readonly precision = this.props.unitsSettingManager.temperatureDeltaUnits.map(unit => unit.convertTo(1, UnitType.DELTA_CELSIUS));

  private readonly oat = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(0));
  private readonly isa = NumberUnitSubject.create(UnitType.DELTA_CELSIUS.createNumber(0));

  private oatPipe?: Subscription;
  private isaPipe?: Subscription;
  private isDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const oatPipe = this.oatPipe = this.props.dataProvider.oat.pipe(this.oat, SubscribableMapFunctions.withPrecision(this.precision), true);
    const isaPipe = this.isaPipe = this.props.dataProvider.deltaIsa.pipe(this.isa, SubscribableMapFunctions.withPrecision(this.precision), true);

    const isDataFailedSub = this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        oatPipe.pause();
        isaPipe.pause();

        this.rootCssClass.add('data-failed');
      } else {
        oatPipe.resume(true);
        isaPipe.resume(true);

        this.rootCssClass.delete('data-failed');
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootCssClass.add('hidden');

        isDataFailedSub.pause();
        oatPipe.pause();
        isaPipe.pause();
      } else {
        this.rootCssClass.delete('hidden');

        isDataFailedSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='temperature-info-row temperature-info-oat'>
          <div class='temperature-info-title'>OAT</div>
          <NumberUnitDisplay
            ref={this.oatRef}
            value={this.oat}
            displayUnit={this.props.unitsSettingManager.temperatureUnits}
            formatter={TemperatureInfo.OAT_FORMATTER}
            class='temperature-info-value'
          />

          <div class='failed-box-container'><div class='failed-box' /></div>
        </div>
        <div class='temperature-info-row temperature-info-isa'>
          <div class='temperature-info-title'>ISA</div>
          <NumberUnitDisplay
            ref={this.isaRef}
            value={this.isa}
            displayUnit={this.props.unitsSettingManager.temperatureDeltaUnits}
            formatter={TemperatureInfo.ISA_FORMATTER}
            class='temperature-info-value'
          />

          <div class='failed-box-container'><div class='failed-box' /></div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.oatRef.getOrDefault()?.destroy();
    this.isaRef.getOrDefault()?.destroy();

    this.oatPipe?.destroy();
    this.isaPipe?.destroy();
    this.isDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}