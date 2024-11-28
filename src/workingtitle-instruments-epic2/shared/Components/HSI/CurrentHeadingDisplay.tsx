import { DisplayComponent, FSComponent, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { HeadingDataProvider } from '../../Instruments/HeadingDataProvider';

import './CurrentHeadingDisplay.css';

/** The properties for the current heading component. */
interface CurrentHeadingDisplayProps {
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
}

/** The HSI current heading indicator. */
export class CurrentHeadingDisplay extends DisplayComponent<CurrentHeadingDisplayProps> {

  private readonly currentHeading = MappedSubject.create(
    ([magneticHeading]) => {
      return magneticHeading === null ? '---' : magneticHeading < 0.5 ? '360' : magneticHeading.toFixed(0).padStart(3, '0');
    },
    this.props.headingDataProvider.magneticHeading
  );

  /** @inheritdoc */
  public render(): VNode {
    const lubberLine = <svg viewBox="-12 -3 75 45">
      <path
        d="M 0 0 l 0 22 a 1 1 0 0 0 1 1
      l 12 0 a 3 4 0 0 1 2 1
      l 8 10 a 2 2 0 0 0 3 0
      l 8 -10 a 3 4 0 0 1 2 -1
      l 12 0 a 1 1 0 0 0 1 -1
      l 0 -22"
      />
    </svg>;

    return (
      <div class="current-heading-container">
        <div class={{
          'heading-value': true,
          'invalid': this.props.headingDataProvider.magneticHeading.map(v => v === null)
        }}>{this.currentHeading}</div>
        <div class="lubber-line">{lubberLine}</div>
      </div>
    );
  }
}
