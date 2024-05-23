import {
  AdsbOperatingMode, ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, TcasOperatingMode, VNode
} from '@microsoft/msfs-sdk';

import { MapTrafficAltitudeRestrictionMode } from '@microsoft/msfs-garminsdk';

import { G3XTrafficSystemSource } from '../Modules/G3XMapTrafficModule';

import './TrafficMapCombinedIndicator.css';

/**
 * Component props for TrafficMapCombinedIndicator.
 */
export interface TrafficMapCombinedIndicatorProps extends ComponentProps {
  /** The current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;

  /** The current traffic data source. */
  source: Subscribable<G3XTrafficSystemSource>;

  /** Whether ADS-B is supported by the current traffic data source. */
  supportAdsb: Subscribable<boolean>;

  /** The current ADS-B operating mode. */
  adsbOperatingMode: Subscribable<AdsbOperatingMode>;

  /** The current traffic altitude restriction mode. */
  altitudeRestrictionMode: Subscribable<MapTrafficAltitudeRestrictionMode>;
}

/**
 * Displays traffic system operating mode/traffic source, ADS-B operating mode, and altitude restriction mode
 * indications.
 */
export class TrafficMapCombinedIndicator extends DisplayComponent<TrafficMapCombinedIndicatorProps> {
  private readonly bottomDisplay = this.props.operatingMode.map(mode => {
    switch (mode) {
      case TcasOperatingMode.TAOnly:
      case TcasOperatingMode.TA_RA:
        return '';
      default:
        return 'none';
    }
  });

  private readonly adsbDisplay = this.props.supportAdsb.map(support => support ? '' : 'none');

  private readonly mainText = MappedSubject.create(
    ([operatingMode, source, supportAdsb]) => {
      switch (operatingMode) {
        case TcasOperatingMode.Standby:
          return 'Standby';
        case TcasOperatingMode.Off:
        case TcasOperatingMode.Failed:
          return 'Failed';
        case TcasOperatingMode.Test:
          return 'Test';
        default:
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
      }
    },
    this.props.operatingMode,
    this.props.source,
    this.props.supportAdsb
  );

  private readonly adsbText = this.props.adsbOperatingMode.map(mode => {
    switch (mode) {
      case AdsbOperatingMode.Airborne:
      case AdsbOperatingMode.Surface:
        return 'OPER';
      case AdsbOperatingMode.Standby:
        return 'STBY';
      default:
        return '';
    }
  });

  private readonly altText = this.props.altitudeRestrictionMode.map(mode => {
    switch (mode) {
      case MapTrafficAltitudeRestrictionMode.Normal:
        return 'NORM';
      case MapTrafficAltitudeRestrictionMode.Above:
        return 'ABOVE';
      case MapTrafficAltitudeRestrictionMode.Below:
        return 'BELOW';
      case MapTrafficAltitudeRestrictionMode.Unrestricted:
        return 'UNRES';
      default:
        return '';
    }
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='traffic-map-combined-indicator'>
        <div class='traffic-map-combined-indicator-main'>{this.mainText}</div>
        <div class='traffic-map-combined-indicator-bottom' style={{ 'display': this.bottomDisplay }}>
          <div class='traffic-map-combined-indicator-divider' />
          <div class='traffic-map-combined-indicator-bottom-grid'>
            <div class='traffic-map-combined-indicator-title' style={{ 'display': this.adsbDisplay }}>ADS:</div>
            <div class='traffic-map-combined-indicator-value' style={{ 'display': this.adsbDisplay }}>{this.adsbText}</div>
            <div class='traffic-map-combined-indicator-title'>ALT:</div>
            <div class='traffic-map-combined-indicator-value'>{this.altText}</div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.bottomDisplay.destroy();
    this.adsbDisplay.destroy();
    this.mainText.destroy();
    this.adsbText.destroy();
    this.altText.destroy();

    super.destroy();
  }
}