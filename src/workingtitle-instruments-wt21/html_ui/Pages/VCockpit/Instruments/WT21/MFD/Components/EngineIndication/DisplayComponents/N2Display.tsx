import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { EisValueDisplay } from '../EisValueDisplay';

import './N2Display.css';

/**
 * The N2Display component.
 */
export class N2Display extends DisplayComponent<ComponentProps> {
  private readonly leftValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(1); });
  private readonly rightValue = ComputedSubject.create<number, string>(0, (v: number): string => { return v.toFixed(1); });

  /**
   * Updates the left N2 value.
   * @param value The new value.
   */
  public updateN2Left(value: number): void {
    this.leftValue.set(value);
  }

  /**
   * Updates the right N2 value.
   * @param value The new value.
   */
  public updateN2Right(value: number): void {
    this.rightValue.set(value);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="n2display-container">
        <div class="n2display-box" data-checklist="N2"><EisValueDisplay valueSubject={this.leftValue} minValue={0} emptyText='---.-' /></div>
        <div class="n2display-title">N2 %</div>
        <div class="n2display-box" data-checklist="N2"><EisValueDisplay valueSubject={this.rightValue} minValue={0} emptyText='---.-' /></div>
      </div>
    );
  }
}