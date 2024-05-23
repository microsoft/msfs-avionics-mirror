import { DisplayComponent, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import { G3XGaugeColorZoneColor, G3XGaugeProps } from '../G3XGaugesConfigFactory';

import './G3XBaseGauge.css';

/**
 * An abstract base gauge component containing the universal logic for scaling
 * and margin calculations so these don't need to be implemented in every
 * gauge type.
 */
export abstract class G3XBaseGauge<T extends Partial<G3XGaugeProps>> extends DisplayComponent<T> {
  protected readonly theDiv = FSComponent.createRef<HTMLDivElement>();

  /** The method to call to render the gauge into ourselves. */
  protected abstract renderGauge(): VNode;

  /** The method to call to perform gauge initialization. */
  protected abstract initGauge(): void;

  /**
   * make value more user-friendly to display
   * @param value to precise
   * @returns returns precised value
   */
  protected precise(value: number): string {
    if (this.props.style == undefined) {
      return value.toString();
    }
    const quantum = this.props.style.textIncrement !== undefined ? this.props.style.textIncrement : 1;
    const outputValue = Math.round(value / quantum) * quantum;
    const precision = this.props.style.valuePrecision !== undefined
      ? this.props.style.valuePrecision
      : quantum < 1
        ? quantum.toString().split('.')[1].length
        : 0;

    return outputValue.toFixed(precision);
  }

  /**
   * Maps color into isWarningZone boolean
   * @param color - The zone color
   * @returns The boolean value of isWarningZone
   */
  protected mapColorToIsWarningZoneValue(color: G3XGaugeColorZoneColor): boolean {
    switch (color) {
      case G3XGaugeColorZoneColor.Red:
      case G3XGaugeColorZoneColor.Yellow:
        return true;
      default:
        return false;
    }
  }

  /**
   * Apply the style to the gauge.
   * @param ref with the gauge to apply the style to.
   */
  protected applyStyle(ref: NodeReference<HTMLElement>): void {
    if (this.props.style?.sizePercent && this.props.style.sizePercent !== 100) {
      const factor = this.props.style.sizePercent / 100;
      ref.instance.style.transform = `scale3d(${factor}, ${factor}, ${factor})`;
      ref.instance.style.transformOrigin = 'center';
      ref.instance.style.marginTop = `-${(1 - factor) * 50}%`;
      ref.instance.style.marginBottom = `-${(1 - factor) * 50}%`;
    }

    if (this.props.style?.marginLeft) {
      ref.instance.style.marginLeft = this.props.style.marginLeft;
    }

    if (this.props.style?.marginTop) {
      ref.instance.style.marginTop = this.props.style.marginTop;
    }

    if (this.props.style?.marginRight) {
      ref.instance.style.marginRight = this.props.style.marginRight;
    }

    if (this.props.style?.marginBottom) {
      ref.instance.style.marginBottom = this.props.style.marginBottom;
    }

    if (this.props.style?.height) {
      ref.instance.style.height = this.props.style?.height;
    }

    if (this.props.dataChecklistId) {
      ref.instance.setAttribute('data-checklist', this.props.dataChecklistId);
    }
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.applyStyle(this.theDiv);
    FSComponent.render(this.renderGauge(), this.theDiv.instance);
    this.initGauge();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='abstract_gauge_container' ref={this.theDiv} />
    );
  }
}
