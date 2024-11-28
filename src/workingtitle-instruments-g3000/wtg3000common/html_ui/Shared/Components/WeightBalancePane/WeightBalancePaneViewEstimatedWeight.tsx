import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, NumberFormatter,
  NumberUnitSubject, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { WeightBalanceConfig } from '../../Performance/WeightBalance/WeightBalanceConfig';
import { WeightFuelEvents } from '../../Performance/WeightFuel/WeightFuelEvents';
import { WeightBalanceUserSettingManager } from '../../Settings/WeightBalanceUserSettings';
import { WeightFuelUserSettingTypes } from '../../Settings/WeightFuelUserSettings';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { WeightBalancePaneViewPanel } from './WeightBalancePaneViewPanel';

import './WeightBalancePaneViewEstimatedWeight.css';
import './WeightBalancePaneViewSummary.css';

/**
 * Component props for {@link WeightBalancePaneViewEstimatedWeight}.
 */
export interface WeightBalancePaneViewEstimatedWeightProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight/fuel user settings. */
  weightFuelSettingManager: UserSettingManager<WeightFuelUserSettingTypes>;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * An estimated weight panel for the weight and balance pane.
 */
export class WeightBalancePaneViewEstimatedWeight extends DisplayComponent<WeightBalancePaneViewEstimatedWeightProps> implements WeightBalancePaneViewPanel {
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private thisNode?: VNode;

  private readonly landingWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly landingWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));
  private readonly isLandingWeightCaution = MappedSubject.create(
    ([envelopeDef, weight]) => {
      return !weight.isNaN() && weight.compare(envelopeDef.maxLandingWeight, UnitType.POUND) > 0;
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.landingWeightValue
  ).pause();

  private readonly landingFuelSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly landingFuelValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly fuelReservesValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly holdFuelSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly holdFuelValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly excessFuelSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly excessFuelValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly landingFuelAlertType = MappedSubject.create(
    ([landingWeight, excessFuel]) => {
      if (!landingWeight.isNaN() && !excessFuel.isNaN()) {
        if (landingWeight.number <= 0) {
          return 'warning';
        } else if (excessFuel.number <= 0) {
          return 'caution';
        }
      }

      return 'none';
    },
    this.landingWeightValue,
    this.excessFuelValue
  );
  private readonly isLandingFuelCaution = this.landingFuelAlertType.map(type => type === 'caution');
  private readonly isLandingFuelWarning = this.landingFuelAlertType.map(type => type === 'warning');

  private readonly subscriptions: Subscription[] = [
    this.landingWeightSource,
    this.landingFuelSource,
    this.holdFuelSource,
    this.excessFuelSource,
    this.isLandingWeightCaution
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const sub = this.props.bus.getSubscriber<WeightFuelEvents>();

    this.landingWeightSource.setConsumer(sub.on('weightfuel_landing_weight'));
    this.landingFuelSource.setConsumer(sub.on('weightfuel_landing_fuel'));
    this.holdFuelSource.setConsumer(sub.on('weightfuel_holding_fuel'));
    this.excessFuelSource.setConsumer(sub.on('weightfuel_excess_fuel'));

    const weightPipe = (value: number | null): number => value === null ? NaN : MathUtils.round(value, 1);

    this.landingWeightSource.pipe(this.landingWeightValue, weightPipe);
    this.landingFuelSource.pipe(this.landingFuelValue, weightPipe);
    this.holdFuelSource.pipe(this.holdFuelValue, weightPipe);
    this.excessFuelSource.pipe(this.excessFuelValue, weightPipe);

    this.subscriptions.push(
      this.props.weightFuelSettingManager.getSetting('weightFuelReserves').pipe(this.fuelReservesValue, true),
    );
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const sub of this.subscriptions) {
      sub.resume(true);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onUpdate(): void {
    // noop
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-pane-summary weight-balance-pane-est-weight'>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isLandingWeightCaution
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>Est Landing Weight</div>
          <NumberUnitDisplay
            value={this.landingWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewEstimatedWeight.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isLandingFuelCaution,
            'weight-balance-pane-summary-field-warning': this.isLandingFuelWarning
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>Est Landing Fuel</div>
          <NumberUnitDisplay
            value={this.landingFuelValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewEstimatedWeight.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div class='weight-balance-pane-summary-field weight-balance-pane-summary-field-cyan'>
          <div class='weight-balance-pane-summary-field-title'>Fuel Reserves</div>
          <NumberUnitDisplay
            value={this.fuelReservesValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewEstimatedWeight.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div class='weight-balance-pane-summary-field weight-balance-pane-summary-field-cyan'>
          <div class='weight-balance-pane-summary-field-title'>Hold Fuel</div>
          <NumberUnitDisplay
            value={this.holdFuelValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewEstimatedWeight.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isLandingFuelCaution,
            'weight-balance-pane-summary-field-warning': this.isLandingFuelWarning
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>Excess Fuel</div>
          <NumberUnitDisplay
            value={this.excessFuelValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewEstimatedWeight.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
