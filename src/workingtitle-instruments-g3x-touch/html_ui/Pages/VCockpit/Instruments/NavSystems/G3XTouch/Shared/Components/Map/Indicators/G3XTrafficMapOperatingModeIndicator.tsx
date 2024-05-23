import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, TcasOperatingMode, VNode
} from '@microsoft/msfs-sdk';

import { G3XTrafficSystemSource } from '../Modules/G3XMapTrafficModule';

/**
 * Component props for G3XTrafficMapOperatingModeIndicator.
 */
export interface G3XTrafficMapOperatingModeIndicatorProps extends ComponentProps {
  /** The current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;

  /** The current traffic data source. */
  source: Subscribable<G3XTrafficSystemSource>;

  /** Whether ADS-B is supported by the current traffic data source. */
  supportAdsb: Subscribable<boolean>;
}

/**
 * Displays a traffic system operating mode/traffic source indication.
 */
export class G3XTrafficMapOperatingModeIndicator extends DisplayComponent<G3XTrafficMapOperatingModeIndicatorProps> {
  private readonly sourceDisplay = this.props.operatingMode.map(mode => {
    switch (mode) {
      case TcasOperatingMode.TAOnly:
      case TcasOperatingMode.TA_RA:
        return '';
      default:
        return 'none';
    }
  });

  private readonly sourceText = MappedSubject.create(
    ([source, supportAdsb]) => {
      switch (source) {
        case G3XTrafficSystemSource.Gts:
          return 'GTS TAS';
        case G3XTrafficSystemSource.Gtx:
          if (supportAdsb) {
            return 'GTX ADS-B';
          } else {
            return 'GTX TIS-A';
          }
        case G3XTrafficSystemSource.Gdl:
          return 'GDL ADS-B';
        default:
          return 'Unknown';
      }
    },
    this.props.source,
    this.props.supportAdsb
  );

  private readonly modeText = this.props.operatingMode.map(mode => {
    switch (mode) {
      case TcasOperatingMode.Standby:
        return 'Standby';
      case TcasOperatingMode.Off:
      case TcasOperatingMode.Failed:
        return 'Failed';
      case TcasOperatingMode.Test:
        return 'Test';
      default:
        return 'Operating';
    }
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='traffic-map-opmode'>
        <div class='traffic-map-opmode-source' style={{ 'display': this.sourceDisplay }}>{this.sourceText}</div>
        <div class='traffic-map-opmode-mode'>{this.modeText}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.sourceDisplay.destroy();
    this.sourceText.destroy();
    this.modeText.destroy();

    super.destroy();
  }
}