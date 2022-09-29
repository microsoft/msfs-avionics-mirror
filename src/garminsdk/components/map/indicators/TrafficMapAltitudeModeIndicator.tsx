import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from 'msfssdk';

import { MapTrafficAltitudeRestrictionMode } from '../modules/MapGarminTrafficModule';

/**
 * Component props for TrafficMapAltitudeModeIndicator.
 */
export interface TrafficMapAltitudeModeIndicatorProps extends ComponentProps {
  /** A subscribable which provides the current traffic altitude restriction mode. */
  altitudeRestrictionMode: Subscribable<MapTrafficAltitudeRestrictionMode>;

  /** The text to display for each altitude restriction mode. */
  text: Partial<Record<MapTrafficAltitudeRestrictionMode, string>>;
}

/**
 * Displays a traffic system altitude restriction mode indication.
 */
export class TrafficMapAltitudeModeIndicator extends DisplayComponent<TrafficMapAltitudeModeIndicatorProps> {
  private readonly text = this.props.altitudeRestrictionMode.map(mode => this.props.text[mode] ?? '');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-traffic-altmode'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.text.destroy();
  }
}