import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, InstrumentEvents, MutableSubscribable, Subject, Subscribable, SubscribableUtils, VNode
} from '@microsoft/msfs-sdk';

import './RangeNumbers.css';

/** The properties for the {@link RangeNumbers} component. */
interface RangeNumbersProps extends ComponentProps {
  /** The range to display. */
  readonly rangeString: Subscribable<string>;
  /** The radius of the range ring where the range numbers will be displayed. */
  readonly rangeRingRadius: number | Subscribable<number>;
  /** Current map range setting in NM. */
  readonly range: MutableSubscribable<number>;
  /**
   * The event bus. Required for the map to respond appropriately to the mouse leaving the virtual cockpit instrument
   * screen while the user is dragging the range numbers
   */
  bus: EventBus;
}

/**
 * Range Tier Configuration
 */
interface RangeTier {
  /**
   * Range number will be incremented by this step for the given tier
   */
  increment: number;
}

/**
 * Each key in the record represents an upper limit for a tier
 *
 * @example
 * {
 *   0: { increment: 1 },
 *   25: { increment: 5 },
 *   200: { increment: 50 }
 * }
 *
 * @type {Record<number, RangeTier>}
 */
type RangeTiers = Record<number, RangeTier>;

/** The RangeNumbers component. */
export class RangeNumbers extends DisplayComponent<RangeNumbersProps> {
  private readonly rangeRingRadius = SubscribableUtils.toSubscribable(
    this.props.rangeRingRadius,
    true,
  );
  public readonly rangeElementLeft = FSComponent.createRef<HTMLElement>();
  protected readonly instrumentMouseLeaveSub = this.props.bus?.getSubscriber<InstrumentEvents>()
    .on('vc_mouse_leave').handle(() => this.onMouseUp());
  private readonly rangeZoomActive = Subject.create('');
  private readonly tiers: RangeTiers = {
    0: { increment: 1 },
    25: { increment: 5 },
    200: { increment: 50 },
  };
  private readonly MOUSE_BUFFER = 3;
  private readonly DEFAULT_INCREMENT = 1;
  private readonly INITIAL_POINT = { y: 0 };
  private readonly startPoint = Subject.create({ y: 0 });
  private readonly endPoint = Subject.create({ y: 0 });

  /** @inheritdoc */
  public onAfterRender(): void {
    this.rangeElementLeft.instance.addEventListener(
      'mousedown',
      this.onMouseDown,
    );
  }

  public onMouseDown = (event: MouseEvent): void => {
    const currentElement = event.currentTarget as HTMLElement;
    this.startPoint.set({ y: event.clientY });
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    if (currentElement.classList.contains('range-number-left')) {
      this.rangeZoomActive.set('left');
    } else {
      this.rangeZoomActive.set('right');
    }
  };

  /**
   * Update the map radius setting
   */
  public updateMapRadius = (): void => {
    if (this.startPoint.get() && this.endPoint.get()) {
      const currentRange = this.props.range.get();
      const dy = this.endPoint.get().y - this.startPoint.get().y;

      // If the drag distance doesn't exceed the buffer, exit early
      if (Math.abs(dy) < this.MOUSE_BUFFER) {
        return;
      }

      // Direction multiplier
      const direction = dy < 0 ? 1 : -1;

      let increment = this.DEFAULT_INCREMENT;

      // Find the appropriate tier for currentRange
      for (const [limit, tier] of Object.entries(this.tiers).reverse()) {
        if (currentRange >= Number(limit)) {
          increment = tier.increment;
          break;
        }
      }

      // Calculate the new range and check within bounds
      let newRange =
        Math.round((currentRange + increment * direction) / increment) *
        increment;

      newRange = this.applyBounds(newRange);

      // Set the map range setting
      this.props.range.set(newRange);

      // reset the startPoint
      this.startPoint.set(this.endPoint.get());
    }
  };

  /**
   * Restrict upper/lower bounds of zoom
   * @param range number to check
   * @returns number
   */
  public applyBounds = (range: number): number => {
    const minRange = 1;
    const maxRange = 750;
    if (range < minRange) {
      return minRange;
    } else if (range > maxRange) {
      return maxRange;
    }
    return range;
  };

  /**
   * Update the endPoint on mousemove
   * @param event MouseCoordinates
   */
  public onMouseMove = (event: MouseEvent): void => {
    this.endPoint.set({ y: event.clientY });
    this.updateMapRadius();
  };
  /**
   * Update the range setting
   */
  public onMouseUp = (): void => {
    // Remove the listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    //reset active zoom
    this.rangeZoomActive.set('');

    // Reset points
    this.startPoint.set({ ...this.INITIAL_POINT });
    this.endPoint.set({ ...this.INITIAL_POINT });
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="map-range-numbers">
        <div
          class={{
            'range-number': true,
            'range-number-left': true,
            'range-zoom-active': this.rangeZoomActive.map(
              (handle) => handle === 'left',
            ),
          }}
          ref={this.rangeElementLeft}
          style={{
            transform: this.rangeRingRadius.map((x) => `translateX(${-x}px)`),
          }}
        >
          <span>
            <svg viewBox="0 0 15.48 18">
              <path fill="transparent" d="M11.6,3.33C10.56,2.49,9.25,2,7.89,2C4.64,2,2,4.64,2,7.89c0,2.85,2.03,5.23,4.71,5.77L6.07,12l3.16,0.58
            l3.21-6.62L9.61,5.09L11.6,3.33z"/>
              <path fill="#00FFF4" d="M6.07,12l0.65,1.66C4.03,13.12,2,10.74,2,7.89C2,4.64,4.64,2,7.89,2c1.36,0,2.67,0.49,3.71,1.33l-2,1.76
            l2.83,0.87l3.04,0.93l-1.03-6.05L13.12,2c-1.43-1.27-3.29-2-5.23-2C3.54,0,0,3.54,0,7.89c0,4.23,3.35,7.68,7.53,7.87L8.4,18
            l3.71-4.89l-2.88-0.53L6.07,12z"/>
            </svg>
          </span>
          {this.props.rangeString}
        </div>
        <div
          class="range-number range-number-right"
          style={{ transform: this.rangeRingRadius.map(x => `translateX(${x}px)`) }}
        >
          {this.props.rangeString}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public onDestroy(): void {
    document.removeEventListener('mousemove', () => null);
    document.removeEventListener('mouseup', () => null);
    this.rangeElementLeft.instance.removeEventListener('mousedown', () => null);
  }
}
