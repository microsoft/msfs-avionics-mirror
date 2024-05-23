import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, Subject, Subscribable,
  SubscribableMapFunctions, Subscription, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { TemperatureInfoDataProvider } from '../../../DataProviders';
import { G3XFailureBox } from '../../Common/G3XFailureBox';
import { G3XNumberUnitDisplay } from '../../Common/G3XNumberUnitDisplay';

import './StatusBarOat.css';

/**
 * Component props for {@link StatusBarOat}.
 */
export interface StatusBarOatProps extends ComponentProps {
  /** A data provider for the display. */
  dataProvider: TemperatureInfoDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3X temperature information display. Displays outside (static) air temperature.
 */
export class StatusBarOat extends DisplayComponent<StatusBarOatProps> {
  private static readonly OAT_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly oatRef = FSComponent.createRef<G3XNumberUnitDisplay<UnitFamily.Temperature>>();

  private readonly hidden = Subject.create(false);
  private readonly showFailureBox = Subject.create(false);

  private readonly precision = this.props.unitsSettingManager.temperatureDeltaUnits.map(unit => unit.convertTo(1, UnitType.DELTA_CELSIUS));

  private readonly oat = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(0));

  private oatPipe?: Subscription;
  private isDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const oatPipe = this.oatPipe = this.props.dataProvider.oat.pipe(this.oat, SubscribableMapFunctions.withPrecision(this.precision), true);

    const isDataFailedSub = this.isDataFailedSub = this.props.dataProvider.isDataFailed.sub(isFailed => {
      if (isFailed) {
        oatPipe.pause();
        this.showFailureBox.set(true);
      } else {
        oatPipe.resume(true);
        this.showFailureBox.set(false);
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.hidden.set(true);

        isDataFailedSub.pause();
        oatPipe.pause();
      } else {
        this.hidden.set(false);

        isDataFailedSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'status-bar-oat': true, 'hidden': this.hidden, 'data-failed': this.showFailureBox }}>
        <G3XFailureBox
          show={this.showFailureBox}
          class='status-bar-oat-failure-box'
        />

        <div class='status-bar-oat-main'>
          <div class='status-bar-oat-title'>OAT</div>
          <G3XNumberUnitDisplay
            ref={this.oatRef}
            value={this.oat}
            displayUnit={this.props.unitsSettingManager.temperatureUnits}
            formatter={StatusBarOat.OAT_FORMATTER}
            useBasicUnitFormat
            class='status-bar-oat-value'
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.oatRef.getOrDefault()?.destroy();

    this.oatPipe?.destroy();
    this.isDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}