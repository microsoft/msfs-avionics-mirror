import {
  ComponentProps, ConsumerSubject, DisplayComponent, EngineEvents, EventBus, FSComponent, SubscribableMapFunctions, SubscribableUtils, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { Sr22tEngineComputerEvents } from '../../Sr22tEcu/Sr22tEngineComputer';
import { ManHgDisplay } from './ManHgDisplay';
import { PercentPowerGauge } from './PercentPowerGauge';
import { RpmDisplay } from './RpmDisplay';

/** The properties for the {@link EnginePowerDisplay} component. */
interface EnginePowerDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The EnginePowerDisplay component. Displays engine power as a percentage,
 * propeller speed, and manifold pressure to indicate engine power.
 */
export class EnginePowerDisplay extends DisplayComponent<EnginePowerDisplayProps> {
  /** Power gauge value */
  private readonly maxPower = SubscribableUtils.toSubscribable(SimVar.GetGameVarValue('AIRCRAFT MAX RATED HP', 'ft lb per second') / 550, false); // horsepower: sim returns 310, website says 315, screenshot implies 340...
  private readonly torqueSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('torque_moment_1').withPrecision(0), 0);  // ft*lbs
  private readonly rpmSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('rpm_1').withPrecision(0), 0);  // RPM

  private readonly manifoldPrecisionFunction = SubscribableMapFunctions.withPrecision(0.1);
  private readonly manifoldPressureSubject = ConsumerSubject.create(this.props.bus.getSubscriber<EngineEvents>().on('eng_manifold_pressure_1'), 0)
    .map(v => this.manifoldPrecisionFunction(UnitType.PSI.convertTo(v, UnitType.IN_HG)))
    .map(this.adjustManifoldPressure.bind(this));

  private readonly powerMappedSubject = ConsumerSubject.create(this.props.bus.getSubscriber<Sr22tEngineComputerEvents>().on('ecu-percent-power'), 0);

  private greenColor = '#00bf00';

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /**
   * Adjusts the manifold pressure display.
   * @param map The manifold pressure, in inHg.
   * @returns The manifold pressure to display.
   */
  private adjustManifoldPressure(map: number): string {
    //const scalar = MathUtils.clamp(1 - ((map - 5.3) / (36.0 - 5.3)), 0, 1);
    //return (map + (scalar * 8.2)).toFixed(1);
    return map.toFixed(1);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="eis-engine-power-display" style={{ width: '100%', height: 'auto' }}>
        <PercentPowerGauge
          bus={this.props.bus}
          gaugeLabel={'% Pwr'}
          decimals={0}
          roundTo={1}
          gaugeValueSubject={this.powerMappedSubject}
          minVal={0}
          maxVal={100}
          scaleFactor={1.5}
          colorArcs={
            [
              {
                color: this.greenColor,
                start: 0,
                stop: 100,
              },
            ]
          }
        />

        <RpmDisplay value={this.rpmSubject} />
        <ManHgDisplay value={this.manifoldPressureSubject} />
      </div>
    );
  }
}