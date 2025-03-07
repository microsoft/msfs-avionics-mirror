import { ComponentProps, DisplayComponent, FSComponent, IcaoValue, Subject, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import './ChartsAirportDropdownLabel.css';

/** The properties for the {@link ChartsAirportDropdownLabel} component. */
export interface ChartsAirportDropdownLabelProps extends ComponentProps {
  /** Airport icao value */
  airport: Subscribable<IcaoValue | null>
  /** Type label text */
  typeLabel: Subscribable<string> | string
}

/** A label for the charts page airport dropdown list */
export class ChartsAirportDropdownLabel extends DisplayComponent<ChartsAirportDropdownLabelProps> {
  private static readonly TYPE_LABEL_COLOUR_MAP: Record<string, string> = {
    ['Orig']: 'green',
    ['Dest']: 'green',
    ['Altn']: 'green',
    ['Search']: 'white',
  };

  private readonly colour = Subject.create('none');

  /** @inheritdoc */
  public onAfterRender(): void {
    SubscribableUtils.toSubscribable(this.props.typeLabel, true).sub((v) => this.colour.set(ChartsAirportDropdownLabel.TYPE_LABEL_COLOUR_MAP[v] ?? 'none'));
  }

  /** @inheritdoc*/
  public render(): VNode {
    return (
      <div class={this.colour.map((colour) => `airport-dropdown-label airport-dropdown-label-colour-${colour.toLowerCase()}`)}>
        <p class={'airport-identifier'}>{this.props.airport.map((airport) => airport?.ident ?? '----')}</p>
        <p>{this.props.typeLabel}</p>
      </ div>
    );
  }
}
