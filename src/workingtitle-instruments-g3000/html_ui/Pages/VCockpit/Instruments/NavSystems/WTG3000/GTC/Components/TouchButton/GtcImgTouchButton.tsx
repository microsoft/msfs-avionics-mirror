import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { ImgTouchButtonProps } from '@microsoft/msfs-garminsdk';
import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

import { ImgTouchButton } from './ImgTouchButton';

/**
 * Component props for GtcImgTouchButton.
 */
export interface GtcImgTouchButtonProps extends ImgTouchButtonProps {
  /**
   * Whether the pad should focus all mouse events when dragging, preventing them from bubbling up to any ancestors
   * in the DOM tree. Defaults to `true`.
   */
  focusOnDrag?: boolean;

  /**
   * Whether the button is in a scrollable list. If `true`, will enable the inhibit on drag function unless otherwise
   * specified by the `inhibitOnDrag` prop. Defaults to `false`.
   */
  isInList?: boolean;

  /**
   * The scroll axis of the button's parent list. Ignored if `isInList` is `false`. Sets the button's inhibit on drag
   * axis unless otherwise specified by the `inhibitOnDragAxis` prop. Defaults to `y`.
   */
  listScrollAxis?: 'x' | 'y';

  /**
   * The orientation of the button's parent GTC. Used to set the button's inhibit on drag threshold unless otherwise
   * specified by the `dragThresholdPx` prop. Defaults to `'horizontal'`.
   */
  gtcOrientation?: GtcOrientation;
}

/**
 * A GTC version of {@link ImgTouchButton}. Enables focus on drag by default, and provides convenience props for
 * handling drag behavior while in a scrollable list.
 */
export class GtcImgTouchButton extends DisplayComponent<GtcImgTouchButtonProps> {
  private readonly ref = FSComponent.createRef<ImgTouchButton>();

  /** @inheritdoc */
  public render(): VNode {
    const isInList = this.props.isInList ?? false;

    return (
      <ImgTouchButton
        label={this.props.label}
        imgSrc={this.props.imgSrc}
        onPressed={this.props.onPressed}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        focusOnDrag={this.props.focusOnDrag ?? true}
        inhibitOnDrag={this.props.inhibitOnDrag ?? isInList}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis ?? (isInList ? (this.props.listScrollAxis ?? 'y') : undefined)}
        dragThresholdPx={this.props.dragThresholdPx ?? ((this.props.gtcOrientation ?? 'horizontal') === 'horizontal' ? 40 : 20)}
        class={this.props.class}
      >
        {this.props.children}
      </ImgTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }
}