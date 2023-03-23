import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MinimumsEvents, MinimumsMode, ConsumerSubject,
  MappedSubject, Subject, VNode,
} from '@microsoft/msfs-sdk';

import { WT21ControlEvents } from '../../WT21ControlEvents';

import './MinimumsDisplay.css';

/** @inheritdoc */
interface MinimumsDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}


/** The Minimums Display component. */
export class MinimumsDisplay extends DisplayComponent<MinimumsDisplayProps> {
  private readonly minimumsRef = FSComponent.createRef<HTMLDivElement>();
  private readonly minimumsValue = Subject.create(0);
  private readonly minimumsText = Subject.create('');

  private readonly minsSubs = this.props.bus.getSubscriber<MinimumsEvents>();

  private readonly minimumsModeSub = ConsumerSubject.create(this.minsSubs.on('minimums_mode').whenChanged(), null);
  private readonly decisionHeightSub = ConsumerSubject.create(this.minsSubs.on('decision_height_feet').whenChanged(), null);
  private readonly decisionAltitudeSub = ConsumerSubject.create(this.minsSubs.on('decision_altitude_feet').whenChanged(), null);

  /** @inheritdoc */
  public onAfterRender(): void {
    MappedSubject.create(this.minimumsModeSub, this.decisionHeightSub, this.decisionAltitudeSub).sub(([mode, dh, da]) => {
      if (mode === null || dh === null || da === null) {
        this.minimumsRef.instance.classList.add('hidden');
        return;
      }

      if (mode === MinimumsMode.RA) {
        this.minimumsText.set('RA');
        this.minimumsValue.set(dh);
      } else if (mode === MinimumsMode.BARO) {
        this.minimumsText.set('BARO');
        this.minimumsValue.set(da);
      }

      this.minimumsRef.instance.classList.toggle('hidden', mode === MinimumsMode.OFF);
    }, true);

    const cp = this.props.bus.getSubscriber<WT21ControlEvents>();

    cp.on('minimums_alert').whenChanged().handle(isAlerting => {
      this.minimumsRef.instance.classList.toggle('alert', isAlerting);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="minimums-display-container hidden" ref={this.minimumsRef}>MIN <span> {this.minimumsValue} </span><span> {this.minimumsText}</span></div>
    );
  }
}