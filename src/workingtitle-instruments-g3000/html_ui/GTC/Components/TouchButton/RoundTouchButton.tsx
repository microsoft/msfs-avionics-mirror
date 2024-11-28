import { DisplayComponent, FSComponent, SetSubject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonProps } from '@microsoft/msfs-garminsdk';
import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

import { BgImgTouchButton } from './BgImgTouchButton';
import { GtcHorizButtonBackgroundImagePaths, GtcVertButtonBackgroundImagePaths } from './GtcButtonBackgroundImagePaths';

import './RoundTouchButton.css';

/** Component props for RoundTouchButton */
export interface RoundButtonProps extends TouchButtonProps {
  /** Whether the button is to be used in the vertical or horizontal orientation. */
  orientation: GtcOrientation;
}

const COMPONENT_CLASS = 'round-touch-button';

/** A round numpad button that uses up- and down-state background images. */
export class RoundTouchButton extends DisplayComponent<RoundButtonProps> {
  protected static readonly RESERVED_CSS_CLASSES: Set<string> = new Set([COMPONENT_CLASS]);

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();

  protected readonly cssClassSet = SetSubject.create([COMPONENT_CLASS]);

  protected cssClassSub?: Subscription;

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = RoundTouchButton.RESERVED_CSS_CLASSES;

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <BgImgTouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        onTouched={this.props.onTouched}
        onPressed={this.props.onPressed}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragThresholdPx={this.props.dragThresholdPx}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        onDestroy={this.props.onDestroy}
        class={this.cssClassSet}
        upImgSrc={
          this.props.orientation === 'horizontal'
            ? GtcHorizButtonBackgroundImagePaths.ButtonRoundUp
            : GtcVertButtonBackgroundImagePaths.ButtonRoundSmallUp
        }
        downImgSrc={
          this.props.orientation === 'horizontal'
            ? GtcHorizButtonBackgroundImagePaths.ButtonRoundDown
            : GtcVertButtonBackgroundImagePaths.ButtonRoundSmallDown
        }
      ></BgImgTouchButton>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();
    this.cssClassSub?.destroy();
    super.destroy();
  }
}
