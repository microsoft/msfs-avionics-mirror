import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './GtcSliderThumbIcon.css';

/**
 * Component props for GtcSliderThumbIcon.
 */
export interface GtcSliderThumbIconProps extends ComponentProps {
  /** The orientation of this thumb icon's parent slider. */
  sliderOrientation: 'horizontal' | 'vertical';
}

/**
 * An icon for a GTC slider thumb.
 */
export class GtcSliderThumbIcon extends DisplayComponent<GtcSliderThumbIconProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`gtc-slider-thumb-icon gtc-slider-thumb-icon-${this.props.sliderOrientation}`}>
        <div class='gtc-slider-thumb-icon-ridge' />
        <div class='gtc-slider-thumb-icon-ridge' />
        <div class='gtc-slider-thumb-icon-ridge' />
        <div class='gtc-slider-thumb-icon-ridge' />
        <div class='gtc-slider-thumb-icon-ridge' />
      </div>
    );
  }
}