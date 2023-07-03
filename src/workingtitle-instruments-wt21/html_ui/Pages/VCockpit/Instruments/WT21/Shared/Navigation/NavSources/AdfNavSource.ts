import { AdfRadioIndex, AhrsEvents, EventBus, NavComEvents, NavComSimVars, NavSourceType, Subject } from '@microsoft/msfs-sdk';

import { NavSourceBase } from './NavSourceBase';

/** Represents an ADF radio, subscribes to the ADF SimVars. */
export class AdfRadioSource<T extends readonly string[]> extends NavSourceBase<T> {
  private readonly heading = Subject.create(0);
  private readonly adfRadial = Subject.create<number>(0);
  private readonly adfSignal = Subject.create<number>(0);

  /** @inheritdoc */
  public constructor(bus: EventBus, name: T[number], index: AdfRadioIndex) {
    super(bus, name, index);

    const adc = this.bus.getSubscriber<AhrsEvents>();
    adc.on('hdg_deg')
      .withPrecision(2)
      .handle(this.heading.set.bind(this.heading));

    const navComSubscriber = this.bus.getSubscriber<NavComEvents>();
    navComSubscriber.on(`adf_bearing_${index}`).withPrecision(2).handle(this.adfRadial.set.bind(this.adfRadial));
    navComSubscriber.on(`adf_signal_${index}`).withPrecision(0).handle(this.adfSignal.set.bind(this.adfSignal));

    const navComSimVarsSubscriber = this.bus.getSubscriber<NavComSimVars>();
    navComSimVarsSubscriber.on(`adf_active_frequency_${index}`).whenChanged().handle(this.activeFrequency.set.bind(this.activeFrequency));

    this.heading.sub(this.updateBearing);
    this.adfRadial.sub(this.updateBearing);
    this.adfSignal.sub(this.updateBearing);
  }

  /** @inheritdoc */
  public getType(): NavSourceType {
    return NavSourceType.Adf;
  }

  private readonly updateBearing = (): void => {
    if (this.adfSignal.get() === 0) {
      this.bearing.set(null);
    } else {
      const newBearing = this.adfRadial.get() + this.heading.get();
      this.bearing.set(newBearing);
    }
  };
}