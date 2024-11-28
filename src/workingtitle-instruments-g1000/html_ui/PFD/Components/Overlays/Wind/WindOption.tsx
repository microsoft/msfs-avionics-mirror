import { ComponentProps, DisplayComponent, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { WindData } from '../../../../Shared/UI/Controllers/WindOptionController';

/**
 * The properties on the wind option display component.
 */
export interface WindOptionProps extends ComponentProps {
  /** The wind data subject. */
  windData: Subject<WindData>;
  /** The aircraft heading subject. */
  aircraftHeading?: Subject<number>;
}

/**
 * The Wind Option Component
 */
export abstract class WindOption extends DisplayComponent<WindOptionProps> {
  protected readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    const updateHandler = this.update.bind(this);

    this.subscriptions.push(
      this.props.windData.sub(updateHandler, false, true)
    );

    if (this.props.aircraftHeading) {
      this.subscriptions.push(
        this.props.aircraftHeading.sub(updateHandler, false, true)
      );
    }
  }

  /**
   * Update the component data.
   */
  protected abstract update(): void;

  /**
   * Resume this component.
   */
  private resume(): void {
    for (const sub of this.subscriptions) {
      sub.resume();
    }

    this.update();
  }

  /**
   * Pause this component.
   */
  private pause(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /**
   * Set as visible or not.
   * @param isVisible is whether to set this visible or not.
   */
  public setVisible(isVisible: boolean): void {
    this.containerRef.instance.classList.toggle('hide-element', !isVisible);
    isVisible ? this.resume() : this.pause();
  }

  /**
   * Renders the component - to be overridden.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div />
    );
  }
}
