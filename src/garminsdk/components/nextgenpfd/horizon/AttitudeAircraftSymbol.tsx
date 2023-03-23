import { FSComponent, HorizonLayer, HorizonLayerProps, ObjectSubject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * An attitude indicator aircraft symbol color option.
 */
export type AttitudeAircraftSymbolColor = 'yellow' | 'white';

/**
 * Component props for AttitudeAircraftSymbol.
 */
export interface AttitudeAircraftSymbolProps extends HorizonLayerProps {
  /** Whether to show the aircraft symbol. */
  show: Subscribable<boolean>;

  /** The color of the aircraft symbol. */
  color: AttitudeAircraftSymbolColor;
}

/**
 * An aircraft symbol for the PFD attitude indicator.
 */
export class AttitudeAircraftSymbol extends HorizonLayer<AttitudeAircraftSymbolProps> {
  private readonly style = ObjectSubject.create({
    display: ''
  });

  private showSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.style.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.showSub = this.props.show.sub(show => { this.setVisible(show); }, true);
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <svg viewBox='0 0 414 315' class={`attitude-aircraft-symbol attitude-aircraft-symbol-${this.props.color}`} style={this.style}>
        <path
          d='M 47 204 l -3 -4 l -43 0 l 0 4 '
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-bar-stroke-width)'
        />
        <path
          d='M 47 204 l -3 4 l -43 0 l 0 -4 '
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-bar-stroke-width)'
        />
        <path
          d='M 365 204 l 3 -4 l 43 0 l 0 4 '
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-bar-stroke-width)'
        />
        <path
          d='M 365 204 l 3 4 l 43 0 l 0 -4 '
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-bar-stroke-width)'
        />
        <path
          d='M 207 204 l 0 -1 l -120 31 l 35 0 '
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-arrow-stroke-width)'
        />
        <path
          d='M 207 204 l -66 30 l -19 0 '
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-arrow-stroke-width)'
        />
        <path
          d='M 207 204 l 0 -1 l 120 31 l -35 0 '
          fill='var(--attitude-aircraft-symbol-fill-light)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-arrow-stroke-width)'
        />
        <path
          d='M 207 204 l 66 30 l 19 0 '
          fill='var(--attitude-aircraft-symbol-fill-dark)'
          stroke='var(--attitude-aircraft-symbol-stroke)'
          stroke-width='var(--attitude-aircraft-symbol-arrow-stroke-width)'
        />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
  }
}