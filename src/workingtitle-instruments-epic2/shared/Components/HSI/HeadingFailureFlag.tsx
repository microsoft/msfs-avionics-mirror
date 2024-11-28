import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { HeadingDataProvider } from '../../Instruments/HeadingDataProvider';

import './HeadingFailureFlag.css';

/** The properties for the heading failure component. */
interface HeadingFailureFlagProps {
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
  /** Whether this is on the MFD, defautls to false. */
  isMfd?: boolean;
}

/** The HSI heading failure flag component. */
export class HeadingFailureFlag extends DisplayComponent<HeadingFailureFlagProps> {

  /** @inheritdoc */
  public render(): VNode {
    const { isMfd = false } = this.props;

    return (
      <div class={{ 'hdg-fail-overlay': true, 'invalid': this.props.headingDataProvider.magneticHeading.map(v => v === null) }}>
        {isMfd ? 'HDG' : 'HDG FAIL'}
      </div>
    );
  }
}
