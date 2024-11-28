import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { StallWarningDataProvider } from '@microsoft/msfs-epic2-shared';

import './StallAnnunciator.css';

/** The stall annunciator props. */
export interface StallAnnunciatorProps extends ComponentProps {
  /** The stall warning data provider to use. */
  stallWarningDataProvider: StallWarningDataProvider;
}

/** The stall annunciator component. */
export class StallAnnunciator extends DisplayComponent<StallAnnunciatorProps> {
  protected readonly isStallWarningActive = this.props.stallWarningDataProvider.isStallWarningActive.map((v) => !!v);

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'stall-annunciator-container': true,
          'hidden': this.isStallWarningActive.map(v => !v)
        }}
      >
        <span
          class={{
            'stall-annunciator-box': true,
            'box-animation': this.isStallWarningActive,
          }}
        >
          STALL
        </span>
        <span
          class={{
            'stall-annunciator-box': true,
            'box-animation': this.isStallWarningActive,
          }}
        >
          STALL
        </span>
      </div>
    );
  }
}
