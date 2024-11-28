/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/types" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />

import { ReadonlyFloat64Array } from '../../math';
import { Subscribable, SubscribableArray, SubscribableSet } from '../../sub';
import { BingComponent } from '../bing/BingComponent';
import { ComponentProps, DisplayComponent, FSComponent, VNode } from '../FSComponent';

/**
 * Component props for the SynVisComponent.
 */
export interface SynVisProps extends ComponentProps {
  /** The unique ID to assign to the component's bound Bing instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the component's Bing instance. Defaults to 0. */
  bingDelay?: number;

  /** Whether to skip unbinding the component's bound Bing instance when the component is destroyed. Defaults to `false`. */
  bingSkipUnbindOnDestroy?: boolean;

  /**
   * A subscribable which provides the internal resolution for the Bing component.
   */
  resolution: Subscribable<ReadonlyFloat64Array>;

  /**
   * The earth colors for the display. Index 0 defines the water color, and indexes 1 to the end of the array define
   * the terrain colors. If not defined, all colors default to black.
   */
  earthColors?: SubscribableArray<number>;

  /**
   * The elevation range over which to assign the earth terrain colors, as `[minimum, maximum]` in feet. The terrain
   * colors are assigned at regular intervals over the entire elevation range, starting with the first terrain color at
   * the minimum elevation and ending with the last terrain color at the maximum elevation. Terrain below and above the
   * minimum and maximum elevation are assigned the first and last terrain colors, respectively. Defaults to
   * `[0, 30000]`.
   */
  earthColorsElevationRange?: Subscribable<ReadonlyFloat64Array>;

  /**
   * A subscribable which provides the sky color.
   */
  skyColor: Subscribable<number>;

  /** CSS class(es) to add to the root of the component. */
  class?: string | SubscribableSet<string>;
}

/**
 * A synthetic vision display.
 */
export class SynVisComponent extends DisplayComponent<SynVisProps> {
  protected readonly bingRef = FSComponent.createRef<BingComponent>();

  protected isRendered = false;
  protected _isAwake = true;

  /**
   * A callback which is called when the Bing component is bound.
   */
  protected onBingBound = (): void => {
    // noop
  };

  /** @inheritDoc */
  public onAfterRender(): void {
    this.isRendered = true;

    if (!this._isAwake) {
      this.bingRef.instance.sleep();
    }
  }

  /**
   * Checks whether this display is awake.
   * @returns whether this display is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Wakes this display. Upon awakening, this display will synchronize its state to the Bing instance to which it is
   * bound.
   */
  public wake(): void {
    this._isAwake = true;

    if (this.isRendered) {
      this.bingRef.instance.wake();
    }
  }

  /**
   * Puts this display to sleep. While asleep, this display cannot make changes to the Bing instance to which it is
   * bound.
   */
  public sleep(): void {
    this._isAwake = false;

    if (this.isRendered) {
      this.bingRef.instance.sleep();
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <BingComponent
        ref={this.bingRef}
        id={this.props.bingId}
        mode={EBingMode.HORIZON}
        onBoundCallback={this.onBingBound}
        resolution={this.props.resolution}
        earthColors={this.props.earthColors}
        earthColorsElevationRange={this.props.earthColorsElevationRange}
        skyColor={this.props.skyColor}
        delay={this.props.bingDelay}
        skipUnbindOnDestroy={this.props.bingSkipUnbindOnDestroy}
        class={this.props.class}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.bingRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
