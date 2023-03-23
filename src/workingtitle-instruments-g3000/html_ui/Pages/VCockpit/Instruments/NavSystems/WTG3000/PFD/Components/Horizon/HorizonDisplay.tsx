import { ComponentProps, DisplayComponent, EventBus, FSComponent, ReadonlyFloat64Array, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { ArtificialHorizonColorOptions, HorizonDisplay as BaseHorizonDisplay, UnitsNavAngleSettingMode, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { BingUtils, HorizonConfig, IauUserSettingTypes, PfdAliasedUserSettingTypes, PfdIndex } from '@microsoft/msfs-wtg3000-common';

import './ArtificialHorizon.css';
import './AttitudeAircraftSymbol.css';
import './AttitudeIndicator.css';
import './FlightDirector.css';
import './FlightPathMarker.css';
import './HorizonDisplay.css';

/**
 * Component props for HorizonDisplay.
 */
export interface HorizonDisplayProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The index of the PFD to which the horizon display belongs. */
  pfdIndex: PfdIndex;

  /** The configuration object for the display. */
  config: HorizonConfig;

  /** The projected size of the horizon display, as `[width, height]` in pixels. */
  projectedSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The projected offset of the center of the projection, as `[x, y]` in pixels. */
  projectedOffset: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The bank angle limit, in degrees, in low-bank mode. */
  lowBankAngle: number;

  /** A manager for IAU user settings. */
  iauSettingManager: UserSettingManager<IauUserSettingTypes>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether to declutter the display. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 PFD horizon display.
 */
export class HorizonDisplay extends DisplayComponent<HorizonDisplayProps> {
  /** @inheritdoc */
  public render(): VNode {
    const horizonLineOptions = {
      headingTickLength: 5,
      font: 'Roboto-Bold',
      fontSize: 18,
      labelOffset: 3
    };

    const options: ArtificialHorizonColorOptions = {
      groundColor: '#3a2400',
      skyColors: [
        [0, '#284be4'],
        [50, '#0033e6']
      ]
    };

    return (
      <BaseHorizonDisplay
        bus={this.props.bus}
        ahrsIndex={this.props.iauSettingManager.getSetting('iauAhrsIndex')}
        fmsPosIndex={this.props.pfdIndex}
        projectedSize={this.props.projectedSize}
        projectedOffset={this.props.projectedOffset}
        updateFreq={30}
        bingId={`pfd_synvis_${this.props.pfdIndex}`}
        bingDelay={BingUtils.getBindDelayForSvt(this.props.pfdIndex)}
        supportAdvancedSvt={this.props.config.advancedSvt === true}
        aircraftSymbolOptions={{
          color: this.props.config.symbolColor ?? 'yellow'
        }}
        attitudeIndicatorOptions={{
          rollScaleOptions: { showArc: true, lowBankAngle: this.props.lowBankAngle },
          slipSkidOptions: { translationFactor: 54 }
        }}
        flightDirectorOptions={{
          maxPitch: 10
        }}
        artificialHorizonOptions={{ horizonLineOptions, options }}
        svtOptions={{ horizonLineOptions }}
        useMagneticHeading={this.props.unitsSettingManager.getSetting('unitsNavAngle').map(units => units === UnitsNavAngleSettingMode.Magnetic)}
        svtSettingManager={this.props.pfdSettingManager}
        declutter={this.props.declutter}
        class={'horizon-display'}
      />
    );
  }
}