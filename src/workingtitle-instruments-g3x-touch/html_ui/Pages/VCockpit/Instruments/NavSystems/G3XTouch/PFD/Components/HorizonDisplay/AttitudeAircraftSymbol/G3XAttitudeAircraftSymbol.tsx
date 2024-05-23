import {
  BitFlags, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, ObjectSubject,
  ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AttitudeAircraftSymbolColor, AttitudeAircraftSymbolFormat } from '@microsoft/msfs-garminsdk';

import './G3XAttitudeAircraftSymbol.css';

/**
 * Component props for {@link G3XAttitudeAircraftSymbol}.
 */
export interface G3XAttitudeAircraftSymbolProps extends HorizonLayerProps {
  /** Whether to show the aircraft symbol. */
  show: Subscribable<boolean>;

  /** The symbol format to display. */
  format: AttitudeAircraftSymbolFormat | Subscribable<AttitudeAircraftSymbolFormat>;

  /** The color of the aircraft symbol. */
  color: AttitudeAircraftSymbolColor;

  /**
   * The span of the single cue aircraft symbol horizontal bars, as `[outerSpan, innerSpan]` in pixels. The outer and
   * inner spans are the horizontal distances from the center of the projection to the outer and inner edges of each
   * bar, respectively.
   */
  singleCueBarSpan: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}

/**
 * An aircraft symbol for the PFD attitude indicator.
 */
export class G3XAttitudeAircraftSymbol extends HorizonLayer<G3XAttitudeAircraftSymbolProps> {
  private readonly style = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': '50%',
    'top': '0px',
    'width': '0px',
    'height': '0px'
  });

  private readonly singleCueDisplay = Subject.create('');
  private readonly dualCueDisplay = Subject.create('');

  private readonly singleCueBarSpan = SubscribableUtils.toSubscribable(this.props.singleCueBarSpan, true);

  private readonly singleCueBarOutlinePath = Subject.create('');
  private readonly singleCueBarLightPath = Subject.create('');
  private readonly singleCueBarDarkPath = Subject.create('');

  private showSub?: Subscription;
  private formatSub?: Subscription;
  private singleCueBarSpanSub?: Subscription;

  /** @inheritDoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.singleCueBarSpanSub = this.singleCueBarSpan.sub(this.updateSingleCueBarPaths.bind(this), false, true);

    if (SubscribableUtils.isSubscribable(this.props.format)) {
      this.formatSub = this.props.format.sub(format => {
        if (format === AttitudeAircraftSymbolFormat.DualCue) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.singleCueBarSpanSub!.pause();

          this.singleCueDisplay.set('none');
          this.dualCueDisplay.set('');
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.singleCueBarSpanSub!.resume(true);

          this.dualCueDisplay.set('none');
          this.singleCueDisplay.set('');
        }
      }, true);
    } else if (this.props.format === AttitudeAircraftSymbolFormat.SingleCue) {
      this.singleCueBarSpanSub.resume(true);
    }

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.updatePosition();
  }

  /** @inheritDoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected)) {
      this.updatePosition();
    }
  }

  /**
   * Updates this symbol's single cue horizontal bar SVG paths.
   * @param span The span of the single cue horizontal bars, as `[outerSpan, innerSpan]` in pixels.
   */
  private updateSingleCueBarPaths(span: ReadonlyFloat64Array): void {
    const outerSpan = Math.max(0, span[0]);
    const innerSpan = Math.min(Math.max(0, span[1]), outerSpan);
    const barRectangleWidth = Math.max(0, outerSpan - innerSpan - 5);

    this.singleCueBarOutlinePath.set(
      `M ${innerSpan} 0 l 5 -5 h ${barRectangleWidth} v 10 h ${-barRectangleWidth} Z M ${-innerSpan} 0 l -5 -5 h ${-barRectangleWidth} v 10 h ${barRectangleWidth} Z`
    );

    this.singleCueBarLightPath.set(
      `M ${innerSpan} 0 l 5 -5 h ${barRectangleWidth} v 5 Z M ${-innerSpan} 0 l -5 -5 h ${-barRectangleWidth} v 5 Z`
    );

    this.singleCueBarDarkPath.set(
      `M ${innerSpan} 0 l 5 5 h ${barRectangleWidth} v -5 Z M ${-innerSpan} 0 l -5 5 h ${-barRectangleWidth} v -5 Z`
    );
  }

  /**
   * Updates the position of this symbol.
   */
  private updatePosition(): void {
    const center = this.props.projection.getOffsetCenterProjected();
    this.style.set('top', `${center[1]}px`);
  }

  /** @inheritDoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritDoc */
  public render(): VNode {
    const isDynamicFormat = SubscribableUtils.isSubscribable(this.props.format);

    const renderSingleCue = isDynamicFormat || this.props.format === AttitudeAircraftSymbolFormat.SingleCue;
    const renderDualCue = isDynamicFormat || this.props.format === AttitudeAircraftSymbolFormat.DualCue;

    return (
      <div class={`attitude-aircraft-symbol attitude-aircraft-symbol-${this.props.color}`} style={this.style}>
        {renderSingleCue && this.renderSingleCue()}
        {renderDualCue && this.renderDualCue()}
      </div>
    );
  }

  /**
   * Renders the single-cue aircraft symbol.
   * @returns The single-cue aircraft symbol, as a VNode.
   */
  private renderSingleCue(): VNode {
    return (
      <svg
        viewBox='-170 -30 340 60'
        class='attitude-aircraft-symbol-single-cue'
        style={{
          'display': this.singleCueDisplay,
          'position': 'absolute',
          'left': '50%',
          'top': '0px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        {/* Horizontal bars */}
        <path
          d={this.singleCueBarDarkPath}
          fill='var(--attitude-aircraft-symbol-fill-dark)'
        />
        <path
          d={this.singleCueBarLightPath}
          fill='var(--attitude-aircraft-symbol-fill-light)'
        />
        <path
          d={this.singleCueBarOutlinePath}
          fill='none'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-bar-stroke-width)'
          vector-effect='non-scaling-stroke'
        />

        {/* V-bars */}
        <path
          d='M 0 0 l 64.5 30 l -15.5 0 Z M 0 0 l -64.5 30 l 15.5 0 Z'
          fill='var(--attitude-aircraft-symbol-fill-dark)'
        />
        <path
          d='M 0 0 l 89 30 l -24.5 0 Z M 0 0 l -89 30 l 24.5 0 Z'
          fill='var(--attitude-aircraft-symbol-fill-light)'
        />
        <path
          d='M 0 0 l 89 30 l -40 0 Z M 0 0 l -89 30 l 40 0 Z'
          fill='none'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-arrow-stroke-width)'
          vector-effect='non-scaling-stroke'
        />
      </svg>
    );
  }

  /**
   * Renders the dual-cue aircraft symbol.
   * @returns The dual-cue aircraft symbol, as a VNode.
   */
  private renderDualCue(): VNode {
    return (
      <svg
        viewBox='-163 -23 326 46'
        class='attitude-aircraft-symbol-dual-cue'
        style={{
          'display': this.dualCueDisplay,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='
          M -3 -5 l 5 0 a 2 2 0 0 1 2 2 l 0 5 a 2 2 0 0 1 -2 2 l -5 0 a 2 2 0 0 1 -2 -2 l 0 -5 a 2 2 0 0 1 2 -2
          M -106 -5 l 58 0 a 2 2 0 0 1 2 2 l 0 18 a 2 2 0 0 1 -2 2 l -6 0 a 2 2 0 0 1 -2 -2 l 0 -8 a 2 2 0 0 0 -2 -2 l -48 0 a 2 2 0 0 1 -2 -2 l 0 -6 a 2 2 0 0 1 2 -2
          M 106 -5 l -58 0 a 2 2 90 0 0 -2 2 l 0 18 a 2 2 90 0 0 2 2 l 6 0 a 2 2 90 0 0 2 -2 l 0 -8 a 2 2 90 0 1 2 -2 l 48 0 a 2 2 90 0 0 2 -2 l 0 -6 a 2 2 90 0 0 -2 -2
          '
          fill='none'
          stroke='var(--attitude-aircraft-symbol-fill-light)'
          stroke-width='var(--attitude-aircraft-symbol-dual-cue-outline-width)'
        />
        <path
          d='
          M -3 -5 l 5 0 a 2 2 0 0 1 2 2 l 0 5 a 2 2 0 0 1 -2 2 l -5 0 a 2 2 0 0 1 -2 -2 l 0 -5 a 2 2 0 0 1 2 -2
          M -106 -5 l 58 0 a 2 2 0 0 1 2 2 l 0 18 a 2 2 0 0 1 -2 2 l -6 0 a 2 2 0 0 1 -2 -2 l 0 -8 a 2 2 0 0 0 -2 -2 l -48 0 a 2 2 0 0 1 -2 -2 l 0 -6 a 2 2 0 0 1 2 -2
          M 106 -5 l -58 0 a 2 2 90 0 0 -2 2 l 0 18 a 2 2 90 0 0 2 2 l 6 0 a 2 2 90 0 0 2 -2 l 0 -8 a 2 2 90 0 1 2 -2 l 48 0 a 2 2 90 0 0 2 -2 l 0 -6 a 2 2 90 0 0 -2 -2
          '
          fill='var(--attitude-aircraft-symbol-fill-light)'
        />
        <path
          d='
          M -4 -1 l 7 0 l 0 3 a 2 2 0 0 1 -2 2 l -5 0 a 2 2 0 0 1 -2 -2 l 0 -3
          M -106 0 l 55 0 l 0 15 a 2 2 0 0 1 -2 2 l -1 0 a 2 2 0 0 1 -2 -2 l 0 -8 a 2 2 0 0 0 -2 -2 l -48 0 a 2 2 0 0 1 -2 -2 l 0 -1
          M 106 0 l -55 0 l 0 15 a 2 2 90 0 0 2 2 l 1 0 a 2 2 90 0 0 2 -2 l 0 -8 a 2 2 90 0 1 2 -2 l 48 0 a 2 2 90 0 0 2 -2 l 0 -1
          '
          fill='var(--attitude-aircraft-symbol-fill-dark)'
        />
        <path
          d='
          M -3 -5 l 5 0 a 2 2 0 0 1 2 2 l 0 5 a 2 2 0 0 1 -2 2 l -5 0 a 2 2 0 0 1 -2 -2 l 0 -5 a 2 2 0 0 1 2 -2
          M -106 -5 l 58 0 a 2 2 0 0 1 2 2 l 0 18 a 2 2 0 0 1 -2 2 l -6 0 a 2 2 0 0 1 -2 -2 l 0 -8 a 2 2 0 0 0 -2 -2 l -48 0 a 2 2 0 0 1 -2 -2 l 0 -6 a 2 2 0 0 1 2 -2
          M 106 -5 l -58 0 a 2 2 90 0 0 -2 2 l 0 18 a 2 2 90 0 0 2 2 l 6 0 a 2 2 90 0 0 2 -2 l 0 -8 a 2 2 90 0 1 2 -2 l 48 0 a 2 2 90 0 0 2 -2 l 0 -6 a 2 2 90 0 0 -2 -2
          '
          fill='none'
          stroke='var(--attitude-aircraft-symbol-dual-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-dual-cue-stroke-width)'
        />
      </svg>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.formatSub?.destroy();
    this.singleCueBarSpanSub?.destroy();

    super.destroy();
  }
}