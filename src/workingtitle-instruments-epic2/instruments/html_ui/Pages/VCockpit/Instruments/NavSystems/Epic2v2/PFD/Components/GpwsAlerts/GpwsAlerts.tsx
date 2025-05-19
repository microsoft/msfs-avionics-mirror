import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GpwsEvents, GpwsVisualAlertType } from '@microsoft/msfs-epic2-shared';

import './GpwsAlerts.css';

/** GPWS Alert props. */
export interface GpwsAlertProps extends ComponentProps {
  /** The instrument event bus. */
  bus: EventBus;
}

/**
 * A component responsible for displaying GPWS GND PROX alerts
 */
export class GpwsGroundProxAlert extends DisplayComponent<GpwsAlertProps> {
  private readonly alertInactive = Subject.create(true);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<GpwsEvents>().on('gpws_visual_alert').handle((v) => this.alertInactive.set(v !== GpwsVisualAlertType.GroundProximity));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class={{ 'gpws-alert': true, 'ground-prox-alert': true, 'hidden': this.alertInactive }}>GND PROX</div>
    );
  }
}

/**
 * A component responsible for displaying GPWS PULL UP alerts
 */
export class GpwsPullUpAlert extends DisplayComponent<GpwsAlertProps> {
  private readonly alertInactive = Subject.create(true);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.bus.getSubscriber<GpwsEvents>().on('gpws_visual_alert').handle((v) => this.alertInactive.set(v !== GpwsVisualAlertType.PullUp));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class={{ 'gpws-alert': true, 'pull-up-alert': true, 'hidden': this.alertInactive }}>PULL UP</div>
    );
  }
}
