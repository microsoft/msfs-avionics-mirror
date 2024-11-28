import {
  BitFlags, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, ObjectSubject, Subject, Subscribable,
  SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import './AttitudeAircraftSymbol.css';

/**
 * An attitude indicator aircraft symbol color option.
 */
export type AttitudeAircraftSymbolColor = 'yellow' | 'white';

/**
 * Aircraft symbol formats.
 */
export enum AttitudeAircraftSymbolFormat {
  SingleCue = 'SingleCue',
  DualCue = 'DualCue',
  FltPath = 'FltPath',
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

  private readonly singleCueHidden = Subject.create(true);
  private readonly dualCueHidden = Subject.create(true);
  private readonly fltPathHidden = Subject.create(true);

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
        this.dualCueHidden.set(format !== AttitudeAircraftSymbolFormat.DualCue);
        this.singleCueHidden.set(format !== AttitudeAircraftSymbolFormat.SingleCue);
        this.fltPathHidden.set(format !== AttitudeAircraftSymbolFormat.FltPath);
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
    const renderFltPath = isDynamicFormat || this.props.format === AttitudeAircraftSymbolFormat.FltPath;

    return (
      <div class="attitude-aircraft-symbol" style={this.style}>
        {renderSingleCue && this.renderSingleCue()}
        {renderDualCue && this.renderDualCue()}
        {renderFltPath && this.renderFltPath()}
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
        viewBox='-174 -21 348 42'
        class={{
          'attitude-aircraft-symbol-single-cue': true,
          'hidden': this.singleCueHidden,
        }}
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path d='M 0 0 l -98 31 l 68 0 l 0 -6 l 60 0 l 0 6 l 68 0 z' class='shadow' />

        <path d='M -149 -5.5 l -22 0 l 0 11 l 22 0 z' class='shadow' />

        <path d='M 149 -5.5 l 22 0 l 0 11 l -22 0 z' class='shadow' />

        <path d='M 0 0 l -98 31 l 68 0 l 0 -6 l 60 0 l 0 6 l 68 0 z' />

        <path d='M -149 -5.5 l -22 0 l 0 11 l 22 0 z' />

        <path d='M 149 -5.5 l 22 0 l 0 11 l -22 0 z' />
      </svg>
    );
  }

  /**
   * Renders the dual-cue aircraft symbol.
   * @returns The dual-cue aircraft symbol, as a VNode.
   */
  private renderDualCue(): VNode {
    return <div class={{
      'attitude-aircraft-symbol-dual-cue': true,
      'hidden': this.dualCueHidden,
    }}>
      <svg
        viewBox='-163 -23 326 46'
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '100%',
          'height': '100%',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='M -32 -5 l -54 0 l 0 10 l 44 0 l 0 10 l 10 0 z M 32 -5 l 54 0 l 0 10 l -44 0 l 0 10 l -10 0 z'
          class='shadow'
        />
        <path
          d='M -32 -5 l -54 0 l 0 10 l 44 0 l 0 10 l 10 0 z M 32 -5 l 54 0 l 0 10 l -44 0 l 0 10 l -10 0 z'
        />
      </svg>
      <svg
        viewBox='-7 -7 14 14'
        class='attitude-aircraft-symbol-top-layer'
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'height': '14px',
          'width': '14px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='M -5 -5 l 10 0 l 0 10 l -10 0 z'
          class='shadow'
        />
        <path
          d='M -5 -5 l 10 0 l 0 10 l -10 0 z'
        />
      </svg>
    </div>;
  }

  /**
   * Renders the flt-path aircraft symbol.
   * @returns The flt-path aircraft symbol, as a VNode.
   */
  private renderFltPath(): VNode {
    return <div class={{
      'attitude-aircraft-symbol-flt-pth': true,
      'hidden': this.fltPathHidden,
    }}>
      <svg
        viewBox='-163 -23 326 46'
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '100%',
          'height': '100%',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='M -104 -3 l -53 0 l 0 6 l 47 0 l 0 13 l 6 0 z M 104 -3 l 53 0 l 0 6 l -47 0 l 0 13 l -6 0 z'
          class='shadow'
        />
        <path
          d='M -104 -3 l -53 0 l 0 6 l 47 0 l 0 13 l 6 0 z M 104 -3 l 53 0 l 0 6 l -47 0 l 0 13 l -6 0 z'
        />
      </svg>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.formatSub?.destroy();

    super.destroy();
  }
}
