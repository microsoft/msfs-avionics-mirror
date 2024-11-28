import { FSComponent, VNode, registerPlugin } from '@microsoft/msfs-sdk';
import { G1000AvionicsPlugin } from '@microsoft/msfs-wtg1000';
import { EnginePowerDisplay } from './EnginePowerDisplay/EnginePowerDisplay';
import { ElectricalGauge, EngineTempGauge, FuelGauge, OilGauge } from './Gauges';

import './Sr22tEISPlugin.css';

/** A plugin which configures the SR22T's EIS plugin. */
export class Sr22tEISPlugin extends G1000AvionicsPlugin {

  /** @inheritDoc */
  public onInstalled(): void {
    // empty
  }

  /** @inheritDoc */
  public renderEIS(): VNode {
    return (
      <>
        <EnginePowerDisplay bus={this.binder.bus} />
        <FuelGauge bus={this.binder.bus} />
        <OilGauge bus={this.binder.bus} />
        <ElectricalGauge bus={this.binder.bus} />
        <EngineTempGauge bus={this.binder.bus} />
      </>
    );
  }
}

registerPlugin(Sr22tEISPlugin);
