import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, MathUtils, NumberFormatter,
  NumberUnitSubject, Subscription, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { G3000WeightBalanceEvents } from '../../Performance/WeightBalance/G3000WeightBalanceEvents';
import { WeightBalanceConfig } from '../../Performance/WeightBalance/WeightBalanceConfig';
import { WeightFuelEvents } from '../../Performance/WeightFuel/WeightFuelEvents';
import { WeightBalanceUserSettingManager } from '../../Settings/WeightBalanceUserSettings';
import { WeightFuelUserSettingTypes } from '../../Settings/WeightFuelUserSettings';
import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';
import { WeightBalancePaneViewPanel } from './WeightBalancePaneViewPanel';

import './WeightBalancePaneViewSummary.css';
import './WeightBalancePaneViewWeightBalance.css';

/**
 * Component props for {@link WeightBalancePaneViewWeightBalance}.
 */
export interface WeightBalancePaneViewWeightBalanceProps extends ComponentProps {
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
 * An aircraft weight and balance panel for the weight and balance pane.
 */
export class WeightBalancePaneViewWeightBalance extends DisplayComponent<WeightBalancePaneViewWeightBalanceProps> implements WeightBalancePaneViewPanel {
  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });
  private static readonly ARM_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '____' });
  private static readonly MAC_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '____' });

  private thisNode?: VNode;

  private readonly basicEmptyWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly zeroFuelWeightSource = ConsumerSubject.create(null, 0).pause();
  private readonly zeroFuelWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));
  private readonly isZeroFuelWeightCaution = MappedSubject.create(
    ([envelopeDef, weight]) => {
      return !weight.isNaN() && weight.compare(envelopeDef.maxZeroFuelWeight, UnitType.POUND) > 0;
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.zeroFuelWeightValue
  ).pause();

  private readonly fobSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly fobValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly rampWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly rampWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));
  private readonly isRampWeightCaution = MappedSubject.create(
    ([envelopeDef, weight]) => {
      return !weight.isNaN() && weight.compare(envelopeDef.maxRampWeight, UnitType.POUND) > 0;
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.rampWeightValue
  ).pause();

  private readonly taxiFuelValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly takeoffWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly takeoffWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));
  private readonly isTakeoffWeightCaution = MappedSubject.create(
    ([envelopeDef, weight]) => {
      return !weight.isNaN() && weight.compare(envelopeDef.maxTakeoffWeight, UnitType.POUND) > 0;
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.takeoffWeightValue
  ).pause();

  private readonly currentWeightSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly currentWeightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  private readonly currentArmSource = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly currentArmValue = NumberUnitSubject.create(UnitType.INCH.createNumber(NaN));
  private readonly currentArmUnit = this.props.unitsSettingManager.weightUnits.map(weightUnit => {
    if (weightUnit.equals(UnitType.KILOGRAM)) {
      return UnitType.CENTIMETER;
    } else {
      return UnitType.INCH;
    }
  });

  private readonly currentMacValueText = this.props.weightBalanceConfig.macArm
    ? this.currentArmValue.map(arm => {
      const mac = MathUtils.lerp(arm.number, this.props.weightBalanceConfig.macArm![0], this.props.weightBalanceConfig.macArm![1], 0, 100);
      return WeightBalancePaneViewWeightBalance.MAC_FORMATTER(mac);
    })
    : undefined;

  private readonly isArmCaution = MappedSubject.create(
    ([envelopeDef, weight, arm]) => {
      if (weight.isNaN() || arm.isNaN()) {
        return false;
      }

      const armIn = arm.asUnit(UnitType.INCH);
      const weightLb = weight.asUnit(UnitType.POUND);

      return weightLb < envelopeDef.minWeight || weightLb > envelopeDef.maxWeight
        || armIn < envelopeDef.getMinArm(weightLb) || armIn > envelopeDef.getMaxArm(weightLb);
    },
    this.props.weightBalanceSettingManager.activeEnvelopeDef,
    this.currentWeightValue,
    this.currentArmValue
  ).pause();

  private readonly subscriptions: Subscription[] = [
    this.zeroFuelWeightSource,
    this.fobSource,
    this.rampWeightSource,
    this.takeoffWeightSource,
    this.currentWeightSource,
    this.currentArmSource,
    this.isZeroFuelWeightCaution,
    this.isRampWeightCaution,
    this.isTakeoffWeightCaution,
    this.currentArmUnit,
    this.isArmCaution
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const sub = this.props.bus.getSubscriber<WeightFuelEvents & G3000WeightBalanceEvents>();

    this.zeroFuelWeightSource.setConsumer(sub.on('weightfuel_zero_fuel_weight'));
    this.fobSource.setConsumer(sub.on('weightfuel_fob_weight'));
    this.rampWeightSource.setConsumer(sub.on('weightfuel_ramp_weight'));
    this.takeoffWeightSource.setConsumer(sub.on('weightfuel_takeoff_weight'));
    this.currentWeightSource.setConsumer(sub.on('weightfuel_aircraft_weight'));
    this.currentArmSource.setConsumer(sub.on('weightbalance_aircraft_arm'));

    const weightPipeFunc = WeightBalancePaneViewWeightBalance.withPrecisionNullableToNaN.bind(undefined, 1);

    this.fobSource.pipe(this.fobValue, weightPipeFunc);
    this.currentWeightSource.pipe(this.currentWeightValue, weightPipeFunc);
    this.currentArmSource.pipe(this.currentArmValue, WeightBalancePaneViewWeightBalance.withPrecisionNullableToNaN.bind(undefined, 0.01));

    this.subscriptions.push(
      this.props.weightFuelSettingManager.getSetting('weightFuelBasicEmpty').pipe(this.basicEmptyWeightValue, weightPipeFunc, true),
      this.zeroFuelWeightSource.pipe(this.zeroFuelWeightValue, weightPipeFunc, true),
      this.rampWeightSource.pipe(this.rampWeightValue, weightPipeFunc, true),
      this.props.weightFuelSettingManager.getSetting('weightFuelTaxi').pipe(this.taxiFuelValue, weightPipeFunc, true),
      this.takeoffWeightSource.pipe(this.takeoffWeightValue, weightPipeFunc, true)
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
      <div
        class={{
          'weight-balance-pane-summary': true,
          'weight-balance-pane-weight-balance': true,
          'weight-balance-pane-weight-balance-mac': this.currentMacValueText !== undefined
        }}
      >
        <div class='weight-balance-pane-summary-field'>
          <div class='weight-balance-pane-summary-field-title'>Basic Empty Weight</div>
          <NumberUnitDisplay
            value={this.basicEmptyWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isZeroFuelWeightCaution
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>Zero Fuel Weight</div>
          <NumberUnitDisplay
            value={this.zeroFuelWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div class='weight-balance-pane-summary-field'>
          <div class='weight-balance-pane-summary-field-title'>Fuel On Board</div>
          <NumberUnitDisplay
            value={this.fobValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isRampWeightCaution
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>Ramp Weight</div>
          <NumberUnitDisplay
            value={this.rampWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div class='weight-balance-pane-summary-field weight-balance-pane-summary-field-cyan'>
          <div class='weight-balance-pane-summary-field-title'>Taxi Fuel</div>
          <NumberUnitDisplay
            value={this.taxiFuelValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isTakeoffWeightCaution
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>Takeoff Weight</div>
          <NumberUnitDisplay
            value={this.takeoffWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div class='weight-balance-pane-summary-field'>
          <div class='weight-balance-pane-summary-field-title'>Current Weight</div>
          <NumberUnitDisplay
            value={this.currentWeightValue}
            displayUnit={this.props.unitsSettingManager.weightUnits}
            formatter={WeightBalancePaneViewWeightBalance.WEIGHT_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        <div
          class={{
            'weight-balance-pane-summary-field': true,
            'weight-balance-pane-summary-field-caution': this.isArmCaution
          }}
        >
          <div class='weight-balance-pane-summary-field-title'>{this.props.weightBalanceConfig.armLabel}</div>
          <NumberUnitDisplay
            value={this.currentArmValue}
            displayUnit={this.currentArmUnit}
            formatter={WeightBalancePaneViewWeightBalance.ARM_FORMATTER}
            class='weight-balance-pane-summary-field-value'
          />
        </div>
        {this.currentMacValueText !== undefined && (
          <div
            class={{
              'weight-balance-pane-summary-field': true,
              'weight-balance-pane-summary-field-caution': this.isArmCaution
            }}
          >
            <div class='weight-balance-pane-summary-field-title'>MAC</div>
            <div class='weight-balance-pane-summary-field-value'>{this.currentMacValueText}%</div>
          </div>
        )}
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

  /**
   * Rounds a nullable numeric value to a given precision.
   * @param precision The precision to which to round.
   * @param value The value to round.
   * @returns The specified value rounded to the specified precision, or `NaN` if the original value was `null`.
   */
  private static withPrecisionNullableToNaN(precision: number, value: number | null): number {
    return value === null ? NaN : MathUtils.round(value, precision);
  }
}
