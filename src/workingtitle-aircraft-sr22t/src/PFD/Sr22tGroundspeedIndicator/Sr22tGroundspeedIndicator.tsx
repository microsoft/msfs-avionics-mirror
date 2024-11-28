import { ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, GNSSEvents, VNode } from '@microsoft/msfs-sdk';

import './Sr22tGroundspeedIndicator.css';

/** The properties for the {@link Sr22tGroundspeedIndicator} component. */
interface Sr22tGroundspeedIndicatorProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
}

/** The Sr22tGroundspeedIndicator component. */
export class Sr22tGroundspeedIndicator extends DisplayComponent<Sr22tGroundspeedIndicatorProps> {

  private readonly groundSpeed = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('ground_speed').withPrecision(0), 0); // knots

  /** @inheritdoc */
  public onAfterRender(): void {
    // empty
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='sr22t-gs-background'>
        <div class='sr22t-gs-line'>
          <div class='title'>GS</div>
          <div class='value-block'>
            <div class='value'>{this.groundSpeed}</div>
            <div class='unit'>KT</div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();
    this.groundSpeed.destroy();
  }
}
