import {
  BitFlags, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, ObjectSubject,
  Subject, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

/**
 * An attitude indicator aircraft symbol color option.
 */
export type AttitudeAircraftSymbolColor = 'yellow' | 'white';

/**
 * Aircraft symbol formats.
 */
export enum AttitudeAircraftSymbolFormat {
  SingleCue = 'SingleCue',
  DualCue = 'DualCue'
}

/**
 * Component props for AttitudeAircraftSymbol.
 */
export interface AttitudeAircraftSymbolProps extends HorizonLayerProps {
  /** Whether to show the aircraft symbol. */
  show: Subscribable<boolean>;

  /** The symbol format to display. */
  format: AttitudeAircraftSymbolFormat | Subscribable<AttitudeAircraftSymbolFormat>;

  /** The color of the aircraft symbol. */
  color: AttitudeAircraftSymbolColor;
}

/**
 * An aircraft symbol for the PFD attitude indicator.
 */
export class AttitudeAircraftSymbol extends HorizonLayer<AttitudeAircraftSymbolProps> {
  private readonly style = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px'
  });

  private readonly singleCueDisplay = Subject.create('');
  private readonly dualCueDisplay = Subject.create('');

  private showSub?: Subscription;
  private formatSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    if (SubscribableUtils.isSubscribable(this.props.format)) {
      this.formatSub = this.props.format.sub(format => {
        if (format === AttitudeAircraftSymbolFormat.DualCue) {
          this.singleCueDisplay.set('none');
          this.dualCueDisplay.set('');
        } else {
          this.dualCueDisplay.set('none');
          this.singleCueDisplay.set('');
        }
      }, true);
    }

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.updatePosition();
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected)) {
      this.updatePosition();
    }
  }

  /**
   * Updates the position of this symbol.
   */
  private updatePosition(): void {
    const center = this.props.projection.getOffsetCenterProjected();
    this.style.set('left', `${center[0]}px`);
    this.style.set('top', `${center[1]}px`);
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
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
        viewBox='-204 -30 408 60'
        class='attitude-aircraft-symbol-single-cue'
        style={{
          'display': this.singleCueDisplay,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='M -160 0 l -3 -4 l -43 0 l 0 4'
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-bar-stroke-width)'
        />
        <path
          d='M -160 0 l -3 4 l -43 0 l 0 -4'
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-bar-stroke-width)'
        />
        <path
          d='M 158 0 l 3 -4 l 43 0 l 0 4'
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-bar-stroke-width)'
        />
        <path
          d='M 158 0 l 3 4 l 43 0 l 0 -4'
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-bar-stroke-width)'
        />
        <path
          d='M 0 0 l 0 -1 l -120 31 l 35 0'
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-arrow-stroke-width)'
        />
        <path
          d='M 0 0 l -66 30 l -19 0'
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-arrow-stroke-width)'
        />
        <path
          d='M 0 0 l 0 -1 l 120 31 l -35 0'
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-arrow-stroke-width)'
        />
        <path
          d='M 0 0 l 66 30 l 19 0'
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-single-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-single-cue-arrow-stroke-width)'
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
          d='M -6 -8 l 12 0 a 2 2 0 0 1 2 2 l 0 12 a 2 2 0 0 1 -2 2 l -12 0 a 2 2 0 0 1 -2 -2 l 0 -12 a 2 2 0 0 1 2 -2 M -161 -5 l 86 0 a 2 2 0 0 1 2 2 l 0 24 a 2 2 0 0 1 -2 2 l -6 0 a 2 2 0 0 1 -2 -2 l 0 -14 a 2 2 0 0 0 -2 -2 l -76 0 a 2 2 0 0 1 -2 -2 l 0 -6 a 2 2 0 0 1 2 -2 M 161 -5 l -86 0 a 2 2 90 0 0 -2 2 l 0 24 a 2 2 90 0 0 2 2 l 6 0 a 2 2 90 0 0 2 -2 l 0 -14 a 2 2 90 0 1 2 -2 l 76 0 a 2 2 90 0 0 2 -2 l 0 -6 a 2 2 90 0 0 -2 -2'
          fill='none'
          stroke='var(--attitude-aircraft-symbol-fill-light)'
          stroke-width='var(--attitude-aircraft-symbol-dual-cue-outline-width)'
        />
        <path
          d='M -6 -8 l 12 0 a 2 2 0 0 1 2 2 l 0 12 a 2 2 0 0 1 -2 2 l -12 0 a 2 2 0 0 1 -2 -2 l 0 -12 a 2 2 0 0 1 2 -2 M -161 -5 l 86 0 a 2 2 0 0 1 2 2 l 0 24 a 2 2 0 0 1 -2 2 l -6 0 a 2 2 0 0 1 -2 -2 l 0 -14 a 2 2 0 0 0 -2 -2 l -76 0 a 2 2 0 0 1 -2 -2 l 0 -6 a 2 2 0 0 1 2 -2 M 161 -5 l -86 0 a 2 2 90 0 0 -2 2 l 0 24 a 2 2 90 0 0 2 2 l 6 0 a 2 2 90 0 0 2 -2 l 0 -14 a 2 2 90 0 1 2 -2 l 76 0 a 2 2 90 0 0 2 -2 l 0 -6 a 2 2 90 0 0 -2 -2'
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-dual-cue-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-dual-cue-stroke-width)'
        />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.formatSub?.destroy();

    super.destroy();
  }
}