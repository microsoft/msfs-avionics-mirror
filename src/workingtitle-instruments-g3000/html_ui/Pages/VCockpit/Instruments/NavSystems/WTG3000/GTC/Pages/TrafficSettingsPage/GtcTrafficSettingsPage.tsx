import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { TrafficSystemType, TrafficUserSettings } from '@microsoft/msfs-garminsdk';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { TrafficSettingsDisplay } from '../../Components/TrafficSettings/TrafficSettingsDisplay';

import './GtcTrafficSettingsPage.css';

/**
 * Component props for GtcTrafficSettingsPage.
 */
export interface GtcTrafficSettingsPageProps extends GtcViewProps {
  /** The type of traffic system installed in the airplane. */
  trafficSystemType: TrafficSystemType;

  /** Whether the installed traffic system supports ADS-B in. */
  adsb: boolean;
}

/**
 * A GTC traffic settings page.
 */
export class GtcTrafficSettingsPage extends GtcView<GtcTrafficSettingsPageProps> {
  private readonly displayRef = FSComponent.createRef<TrafficSettingsDisplay>();

  private readonly trafficSettingManager = TrafficUserSettings.getManager(this.bus);

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Traffic Settings');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='traffic-settings-page'>
        <TrafficSettingsDisplay
          ref={this.displayRef}
          gtcService={this.props.gtcService}
          trafficSystemType={this.props.trafficSystemType}
          adsb={this.props.adsb}
          trafficSettingManager={this.trafficSettingManager}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    super.destroy();
  }
}