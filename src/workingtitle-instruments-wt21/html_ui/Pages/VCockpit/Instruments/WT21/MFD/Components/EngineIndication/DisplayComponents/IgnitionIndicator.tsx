import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import './IgnitionIndicator.css';

/**
 * The properties for the IgnitionIndicator component.
 */
interface IgnitionIndicatorProps extends ComponentProps {

  /** A css class to define the positioning of this indicator. */
  class: string;

}

/**
 * The IgnitionIndicator component.
 */
export class IgnitionIndicator extends DisplayComponent<IgnitionIndicatorProps> {
  private readonly ignRef = FSComponent.createRef<HTMLDivElement>();

  private isCombustionOn = false;
  private isStarterOn = false;
  private isOnGround = false;
  private timeSinceTakeoff = 0;
  private isGearDown = false;
  private isIgnitionOn = false;


  private isVisible = Subject.create<boolean>(false);

  /**
   * Updates the combustion value.
   * @param value Whether combustion is active.
   */
  public updateCombustion(value: boolean): void {
    this.isCombustionOn = value;
    this.evaluateIgnition();
  }

  /**
   * Updates the starter value.
   * @param value Whether the starter is active.
   */
  public updateStarter(value: boolean): void {
    this.isStarterOn = value;
    this.evaluateIgnition();
  }

  /**
   * Updates the on ground status.
   * @param value 1 if on ground, 0 if in-flight.
   */
  public updateOnGround(value: boolean): void {
    this.isOnGround = value;
    // need to inhibit IGN when taking off
    this.timeSinceTakeoff = this.isOnGround ? 0 : Date.now();
    this.evaluateIgnition();
  }

  /**
   * Updates the gear status.
   * @param value 1 if the gear is down, 0 if it is up.
   */
  public updateGearDown(value: number): void {
    this.isGearDown = value === 1;
    this.evaluateIgnition();
  }

  /**
   * Updates the manual ignition value.
   * @param value 2 if manual ignition is on, 1 if it is off.
   */
  public updateIgnitionOn(value: 0 | 1 | 2): void {
    this.isIgnitionOn = value === 2;
    this.evaluateIgnition();
  }

  /**
   * Evaluates the ignition state.
   */
  private evaluateIgnition(): void {
    this.isVisible.set((this.isStarterOn && this.isCombustionOn)
      || (!this.isOnGround && this.isGearDown && (Date.now() - this.timeSinceTakeoff) > 60000)
      || this.isIgnitionOn);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVisible.sub((v: boolean) => {
      this.ignRef.instance.classList.toggle('hidden', !v);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`ign-indicator ${this.props.class}`} ref={this.ignRef}>IGN</div>
    );
  }
}