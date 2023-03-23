import { ComponentProps, DisplayComponent, FSComponent, ObjectSubject, Subscribable, Subscription, TcasOperatingMode, VNode } from '@microsoft/msfs-sdk';

import { MapTrafficAltitudeRestrictionMode } from '../modules/MapGarminTrafficModule';

/**
 * Component props for MapTrafficStatusIndicator.
 */
export interface MapTrafficStatusIndicatorProps extends ComponentProps {
  /** A subscribable which provides whether to show the indicator. */
  show: Subscribable<boolean>;

  /** A subscribable which provides the current traffic system operating mode. */
  operatingMode: Subscribable<TcasOperatingMode>;

  /**
   * A subscribable which provides the current map traffic altitude restriction mode. If not defined, the altitude
   * restriction mode will not be displayed on the indicator.
   */
  altitudeRestrictionMode?: Subscribable<MapTrafficAltitudeRestrictionMode>;
}

/**
 * Displays a traffic operating status and optional altitude restriction mode indications.
 */
export class MapTrafficStatusIndicator extends DisplayComponent<MapTrafficStatusIndicatorProps> {
  private static readonly DISABLED_MODES = new Set([
    TcasOperatingMode.Off,
    TcasOperatingMode.Standby,
    TcasOperatingMode.Failed,
    TcasOperatingMode.Test
  ]);

  private static readonly ALT_RESTRICTION_TEXT = {
    [MapTrafficAltitudeRestrictionMode.Unrestricted]: 'UNRES',
    [MapTrafficAltitudeRestrictionMode.Above]: 'ABOVE',
    [MapTrafficAltitudeRestrictionMode.Normal]: 'NORM',
    [MapTrafficAltitudeRestrictionMode.Below]: 'BELOW'
  };

  private readonly rootStyle = ObjectSubject.create({ display: '' });
  private readonly disabledStyle = ObjectSubject.create({ display: '' });
  private readonly altModeStyle = ObjectSubject.create({ display: '' });

  private readonly altitudeRestrictionText = this.props.altitudeRestrictionMode?.map(mode => {
    return MapTrafficStatusIndicator.ALT_RESTRICTION_TEXT[mode];
  });

  private showSub?: Subscription;
  private operatingModeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      this.rootStyle.set('display', show ? '' : 'none');
    }, true);

    this.operatingModeSub = this.props.operatingMode.sub(mode => {
      const isDisabled = MapTrafficStatusIndicator.DISABLED_MODES.has(mode);
      this.disabledStyle.set('display', isDisabled ? 'inherit' : 'none');
      this.altModeStyle.set('display', isDisabled ? 'none' : 'inherit');
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.rootStyle} class='map-traffic-status'>
        {
          this.props.altitudeRestrictionMode !== undefined
            ? <div style={this.altModeStyle} class='traffic-status-alt'>{this.altitudeRestrictionText}</div>
            : null
        }
        <svg class='traffic-status-symbol' viewBox='0 0 150 100'>
          <path d='M 50 5 L 95 50 L 50 95 L 5 50 Z' />
          <path d='M 115 10 L 135 35 L 122.5 35 L 122.5 80 L 107.5 80 L 107.5 35 L 95 35 Z' />
          <g style={this.disabledStyle} class='traffic-status-disabled'>
            <path class='traffic-status-disabledcross traffic-status-disabledcross-outline' d='M 5 0 L 145 100 M 5 100 L 145 0' />
            <path class='traffic-status-disabledcross traffic-status-disabledcross-stroke' d='M 5 0 L 145 100 M 5 100 L 145 0' />
          </g>
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
    this.operatingModeSub?.destroy();
    this.altitudeRestrictionText?.destroy();
  }
}