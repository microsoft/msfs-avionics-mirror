import { TakeoffConfigPublisherEvents } from '@microsoft/msfs-epic2-shared';
import { ComponentProps, ConsumerSubject, DisplayComponent, FSComponent, EventBus, VNode } from '@microsoft/msfs-sdk';

import './PfdAlerts.css';

/** PFD Alerts props. */
export interface PfdAlertsProps extends ComponentProps {
  /** The instrument event bus. */
  bus: EventBus;
}

/**
 * PFD Alerts:
 * - CAB ALT
 * - GEAR
 * - OVER SPEED
 * - CAB PRESS
 * - NO TAKEOFF
 */
export class PfdAlerts extends DisplayComponent<PfdAlertsProps> {
  private readonly sub = this.props.bus.getSubscriber<TakeoffConfigPublisherEvents>();

  private readonly noTakeoff = ConsumerSubject.create(this.sub.on('takeoff_config_no_takeoff'), false).pause();
  private readonly alertText = this.noTakeoff.map((v) => v ? 'NO TAKEOFF' : '');

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.noTakeoff.resume();
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'pfd-alert': true,
          'hidden': this.alertText.map((v) => v.length <= 0),
        }}
      >
        {this.alertText}
      </div>
    );
  }
}
