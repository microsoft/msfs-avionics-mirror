
import {
  ComponentProps, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent, MappedSubject, MathUtils, ReadonlyFloat64Array, Subscribable,
  SubscribableMapFunctions, SubscribableUtils, Vec2Math, VNode
} from '@microsoft/msfs-sdk';

import { RadioAltimeterDataProvider } from '@microsoft/msfs-epic2-shared';

import './RadioAltitudeDisplay.css';

/** The properties for the {@link RadioAltitudeDisplay} component. */
interface RadioAltitudeDisplayProps extends ComponentProps {
  /**
   * The displayed position of the flight path vector, as `[x, y]` in pixels using the horizon projection's projected
   * coordinate system.
   */
  fpvPosition: Subscribable<ReadonlyFloat64Array>;
  /**
   * The displayed position of the RA readout, as an offset from flight path vector `[x, y]` in pixels using the horizon
   * projection's projected coordinate system.
   */
  fpvOffset?: ReadonlyFloat64Array;
  /**
   * The position of the RA readout when not moving with FPV as `[x, y]` in pixels using the horizon projection's projected
   * coordinate system.
   */
  staticPosition?: ReadonlyFloat64Array;
  /** Whether the RA component should move with the {@link fpvPosition}. */
  shouldMoveWithFpv: boolean | Subscribable<boolean>;
  /** The index of the radio altimeter that is the source of the horizon display's data. */
  radioAltimeterDataProvider: RadioAltimeterDataProvider;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The Altimeter component. */
export class RadioAltitudeDisplay extends DisplayComponent<RadioAltitudeDisplayProps> {
  private static readonly DEFAULT_FPV_OFFSET = Vec2Math.create(0, 0);
  private static readonly DEFAULT_STATIC_POSITION = Vec2Math.create(0, 0);

  private readonly fpvOffset = this.props.fpvOffset ?? RadioAltitudeDisplay.DEFAULT_FPV_OFFSET;
  private readonly staticPosition = this.props.staticPosition ?? RadioAltitudeDisplay.DEFAULT_STATIC_POSITION;

  private readonly shouldMoveWithFpv = SubscribableUtils.toSubscribable(this.props.shouldMoveWithFpv, true);
  private readonly translateTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));

  /** above this height the RA is not displayed */
  private readonly RADIO_ALT_MAX = 2500;
  /** below this height the RA value is quantised in fives, above this it's tens */
  private readonly RADIO_ALT_TENS_THRESHOLD = 200;
  /** below this height the RA value is quantised in tens, above it's fifties */
  private readonly RADIO_ALT_FIFTIES_THRESHOLD = 1500;

  private readonly rawRadioAltitude = this.props.radioAltimeterDataProvider.radioAltitude;

  private readonly quantisedRadioAltitude = this.rawRadioAltitude.map((ra) => {
    if (ra === null) {
      return null;
    }
    if (ra >= this.RADIO_ALT_FIFTIES_THRESHOLD) {
      return MathUtils.ceil(ra, 50);
    } else if (ra >= this.RADIO_ALT_TENS_THRESHOLD) {
      return MathUtils.ceil(ra, 10);
    }
    return MathUtils.ceil(ra, 5);
  });

  private readonly isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.quantisedRadioAltitude.map<boolean>((ra, wasHidden) => (ra !== null && ra >= this.RADIO_ALT_MAX) || (ra === null && !wasHidden)),
    this.props.declutter,
  );

  private readonly radioAltitudeText = MappedSubject.create(([radioAltHidden, quantisedRadioAltitude], prevValue) => {
    if (!radioAltHidden) {
      return quantisedRadioAltitude !== null ? quantisedRadioAltitude.toFixed(0) : 'RAD';
    }
    return prevValue;
  }, this.isHidden, this.quantisedRadioAltitude);

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    if (SubscribableUtils.isSubscribable(this.props.shouldMoveWithFpv) || this.props.shouldMoveWithFpv === true) {
      const fpvPositionSub = this.props.fpvPosition.sub((fpvPosition) => {
        this.translateTransform.transform.set(fpvPosition[0] + this.fpvOffset[0], fpvPosition[1] + this.fpvOffset[1], 0, undefined, 0.1);
        this.translateTransform.resolve();
      }, false, true);

      this.shouldMoveWithFpv.sub((v) => {
        if (v) {
          fpvPositionSub.resume(true);
        } else {
          fpvPositionSub.pause();
          this.translateTransform.transform.set(this.staticPosition[0], this.staticPosition[1], 0, 0, undefined, 0.1);
          this.translateTransform.resolve();
        }
      }, true);
    }
  }

  /** @inheritdoc */
  render(): VNode | null {
    return (
      <div
        class={{
          'radio-alt': true,
          'black-box': true,
          'hidden': this.isHidden,
          'radio-alt-failed': this.rawRadioAltitude.map((ra) => ra === null),
        }}
        style={{
          'transform': this.translateTransform,
        }}
      >{this.radioAltitudeText}</div>
    );
  }
}
