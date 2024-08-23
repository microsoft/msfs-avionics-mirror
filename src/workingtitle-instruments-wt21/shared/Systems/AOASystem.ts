import { AdcEvents, AvionicsSystemStateEvent, BasicAvionicsSystem, ConsumerSubject, ControlSurfacesEvents, EventBus, Subject } from '@microsoft/msfs-sdk';

/**
 * A definition of AOA limits for a given flap configuration.
 */
export interface AoAFlapsDefinition {
  /** The zero-lift angle of attack, in degrees. */
  zeroLift: number;

  /** The stall angle of attack, in degrees. */
  stall: number;

  /** The correction factor to adjust against any non-linearity in the AOA. */
  correctionFactor: number;
}

/**
 * The AOA system.
 */
export class AOASystem extends BasicAvionicsSystem<AOASystemEvents> {
  protected readonly initializationTime = 3000;
  protected readonly aoaFlapsDefinitions = new Map<number, AoAFlapsDefinition>();

  protected aoaDegrees = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('aoa').whenChanged(), 0);
  protected zeroLiftAoa = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('zero_lift_aoa').whenChanged(), 0);
  protected stallAoa = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('stall_aoa').whenChanged(), 14);
  protected flapsHandleIndex = ConsumerSubject.create(this.bus.getSubscriber<ControlSurfacesEvents>().on('flaps_handle_index').whenChanged(), 0);

  private aoaPercent = Subject.create(0);

  /**
   * Creates an instance of the AOASystem.
   * @param index The index of the system.
   * @param xmlConfig The instance of the panel.xml configuration to use.
   * @param bus The instance of the event bus for the system to use.
   */
  constructor(public readonly index: number, protected readonly xmlConfig: Document, protected readonly bus: EventBus) {
    super(index, bus, 'aoa_state');
    this.connectToPower('elec_av1_bus');

    this.readAoAConfiguration();
    this.aoaDegrees.sub(this.updateAoaPct.bind(this, false));
    this.zeroLiftAoa.sub(this.updateAoaPct.bind(this, true));
    this.stallAoa.sub(this.updateAoaPct.bind(this, true));
    this.flapsHandleIndex.sub(this.updateAoaPct.bind(this, true));

    this.aoaPercent.sub(aoaPct => {
      this.bus.getPublisher<AOASystemEvents>().pub('aoasys_aoa_pct', aoaPct);
    }, true);
  }

  /**
   * Reads the AOASystem configuration from the XML config.
   */
  protected readAoAConfiguration(): void {
    const aoaSystem = this.xmlConfig.getElementsByTagName('AOASystem');
    if (aoaSystem.length > 0) {
      const aoaSystemTag = aoaSystem[0];
      const flapsElements = aoaSystemTag.getElementsByTagName('Flaps');

      for (let i = 0; i < flapsElements.length; i++) {
        const index = flapsElements[i].getAttribute('index');
        if (index !== null) {
          const indexNum = parseInt(index);
          const stallAttr = flapsElements[i].getAttribute('stall');
          const zeroLiftAttr = flapsElements[i].getAttribute('zeroLift');
          const correctionFactorAttr = flapsElements[i].getAttribute('correctionFactor');

          if (stallAttr !== null && zeroLiftAttr !== null) {
            const stall = parseFloat(stallAttr);
            const zeroLift = parseFloat(zeroLiftAttr);
            const correctionFactor = parseFloat(correctionFactorAttr ?? '1');

            this.aoaFlapsDefinitions.set(indexNum, { stall, zeroLift, correctionFactor });
          }
        }
      }
    }
  }

  /**
   * Updates the published AOA percentage.
   * @param updateStallAndZeroLift Whether or not to update the zero-lift and stall AOAs and publish them.
   */
  protected updateAoaPct(updateStallAndZeroLift: boolean): void {
    const flapsHandleIndex = this.flapsHandleIndex.get();
    const flapsAoaDefinition = this.aoaFlapsDefinitions.get(flapsHandleIndex);
    const publisher = this.bus.getPublisher<AOASystemEvents>();

    let aoaPct = 0;
    const aoaDegrees = this.aoaDegrees.get();

    if (flapsAoaDefinition !== undefined) {
      aoaPct = (aoaDegrees - flapsAoaDefinition.zeroLift) / (flapsAoaDefinition.stall - flapsAoaDefinition.zeroLift);
      aoaPct = Math.pow(aoaPct, 1 / flapsAoaDefinition.correctionFactor);

      if (updateStallAndZeroLift) {
        publisher.pub('aoasys_stall_aoa', flapsAoaDefinition.stall);
        publisher.pub('aoasys_zero_lift_aoa', flapsAoaDefinition.zeroLift);
      }
    } else {
      aoaPct = (aoaDegrees - this.zeroLiftAoa.get()) / (this.stallAoa.get() - this.zeroLiftAoa.get());

      if (updateStallAndZeroLift) {
        publisher.pub('aoasys_stall_aoa', this.stallAoa.get());
        publisher.pub('aoasys_zero_lift_aoa', this.zeroLiftAoa.get());
      }
    }

    this.aoaPercent.set(aoaPct);
  }
}

/**
 * Events fired by the magnetometer system.
 */
export interface AOASystemEvents {
  /** An event fired when the AOA system state changes. */
  'aoa_state': AvionicsSystemStateEvent;

  /** The system calculated zero lift AOA. */
  'aoasys_zero_lift_aoa': number;

  /** The system calculated stall AOA. */
  'aoasys_stall_aoa': number;

  /** The system calculated AOA percentage. */
  'aoasys_aoa_pct': number;
}