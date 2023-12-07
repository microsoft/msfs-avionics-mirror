import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, ReadonlyFloat64Array, Subject, Subscribable,
  SubscribableUtils, UserSettingManager, VNode, Vec2Math, VecNMath
} from '@microsoft/msfs-sdk';

import {
  ArtificialHorizonOptions, HorizonDisplay as BaseHorizonDisplay, FlightDirectorDualCueOptions, FlightDirectorFormat,
  FlightDirectorSingleCueOptions, HorizonLineOptions, HorizonPitchLadderOptions, PitchLadderStyles, RollIndicatorOptions,
  TcasRaCommandDataProvider, TcasRaPitchCueLayerOptions, UnitsNavAngleSettingMode, UnitsUserSettingManager
} from '@microsoft/msfs-garminsdk';

import { BingUtils, FlightDirectorFormatSettingMode, HorizonConfig, IauUserSettingTypes, PfdAliasedUserSettingTypes, PfdIndex } from '@microsoft/msfs-wtg3000-common';

import './ArtificialHorizon.css';
import './AttitudeAircraftSymbol.css';
import './FlightDirectorDualCue.css';
import './FlightDirectorSingleCue.css';
import './FlightPathMarker.css';
import './HorizonDisplay.css';
import './PitchLadder.css';
import './RollIndicator.css';
import './TcasRaPitchCueLayer.css';

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

  /** A provider of TCAS-II resolution advisory vertical speed command data. Required to display TCAS RA pitch cues. */
  tcasRaCommandDataProvider?: TcasRaCommandDataProvider;

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
  private readonly ref = FSComponent.createRef<BaseHorizonDisplay>();

  private readonly isSvtEnabled = Subject.create(false);

  private readonly flightDirectorFormat = this.props.config.directorCue === 'both'
    ? this.props.pfdSettingManager.getSetting('flightDirectorFormat').map(format => {
      return format === FlightDirectorFormatSettingMode.Dual ? FlightDirectorFormat.DualCue : FlightDirectorFormat.SingleCue;
    })
    : this.props.config.directorCue === 'dual' ? FlightDirectorFormat.DualCue : FlightDirectorFormat.SingleCue;

  /** @inheritdoc */
  public render(): VNode {
    const articialHorizonOptions: ArtificialHorizonOptions = {
      groundColors: [[0, '#a15f02'], [156, '#54350a']],
      skyColors: [[0, '#6182e8'], [156, '#0033ff']]
    };

    const horizonLineOptions: HorizonLineOptions = {
      headingPointerSize: Vec2Math.create(16, 16),
      headingTickLength: 5,
      font: 'Roboto-Bold',
      fontSize: 18,
      labelOffset: 3
    };

    const pitchLadderOptions: HorizonPitchLadderOptions = {
      clipBounds: VecNMath.create(4, -180, -150, 180, 110),
      options: {
        svtDisabledStyles: this.props.config.advancedSvt ? HorizonDisplay.getNormalFovPitchLadderStyles() : HorizonDisplay.getExtendedFovPitchLadderStyles(),
        svtEnabledStyles: HorizonDisplay.getNormalFovPitchLadderStyles()
      }
    };

    const rollIndicatorOptions: RollIndicatorOptions = {
      radius: 186,
      showArc: this.props.config.showRollArc,
      pointerStyle: this.props.config.rollPointerStyle,
      lowBankAngle: this.props.lowBankAngle,
      majorTickLength: 28,
      minorTickLength: 14,
      referencePointerSize: Vec2Math.create(20, 20),
      referencePointerOffset: 1,
      rollPointerSize: Vec2Math.create(20, 20),
      rollPointerOffset: 1,
      slipSkidIndicatorOffset: 4,
      slipSkidIndicatorHeight: 6,
      slipSkidIndicatorTranslateScale: 54
    };

    let flightDirectorSingleCueOptions: FlightDirectorSingleCueOptions | undefined;
    let flightDirectorDualCueOptions: FlightDirectorDualCueOptions | undefined;

    const renderSingleCue = this.props.config.directorCue !== 'dual';
    const renderDualDue = this.props.config.directorCue !== 'single';

    if (renderSingleCue) {
      const fdSingleCueSvtDisabledBounds = Vec2Math.create(-125, 85);
      const fdSingleCueSvtEnabledBounds = Vec2Math.create(-140, 95);
      flightDirectorSingleCueOptions = {
        conformalBounds: this.isSvtEnabled.map(isSvtEnabled => isSvtEnabled ? fdSingleCueSvtEnabledBounds : fdSingleCueSvtDisabledBounds),
        conformalBankLimit: 20
      };
    }

    if (renderDualDue) {
      const fdDualCueSvtDisabledBounds = VecNMath.create(4, -182, -125, 182, 85);
      const fdDualCueSvtEnabledBounds = VecNMath.create(4, -182, -140, 182, 95);
      flightDirectorDualCueOptions = {
        conformalBounds: this.isSvtEnabled.map(isSvtEnabled => isSvtEnabled ? fdDualCueSvtDisabledBounds : fdDualCueSvtEnabledBounds),
        pitchErrorFactor: 1,
        bankErrorConstant: 5
      };
    }

    let tcasRaPitchCueLayerOptions: TcasRaPitchCueLayerOptions | undefined;
    if (this.props.tcasRaCommandDataProvider) {
      tcasRaPitchCueLayerOptions = {
        clipBounds: VecNMath.create(4, -205, -160, 205, 160),
        conformalBounds: VecNMath.create(4, -180, -150, 180, 110)
      };
    }

    return (
      <BaseHorizonDisplay
        ref={this.ref}
        bus={this.props.bus}
        adcIndex={this.props.iauSettingManager.getSetting('iauAdcIndex')}
        ahrsIndex={this.props.iauSettingManager.getSetting('iauAhrsIndex')}
        fmsPosIndex={this.props.pfdIndex}
        projectedSize={this.props.projectedSize}
        projectedOffset={this.props.projectedOffset}
        updateFreq={30}
        bingId={`pfd_synvis_${this.props.pfdIndex}`}
        bingDelay={BingUtils.getBindDelayForSvt(this.props.pfdIndex)}
        supportAdvancedSvt={this.props.config.advancedSvt}
        artificialHorizonOptions={articialHorizonOptions}
        horizonLineOptions={horizonLineOptions}
        pitchLadderOptions={pitchLadderOptions}
        rollIndicatorOptions={rollIndicatorOptions}
        aircraftSymbolOptions={{
          color: this.props.config.symbolColor ?? 'yellow'
        }}
        flightDirectorSingleCueOptions={flightDirectorSingleCueOptions}
        flightDirectorDualCueOptions={flightDirectorDualCueOptions}
        useMagneticHeading={this.props.unitsSettingManager.getSetting('unitsNavAngle').map(units => units === UnitsNavAngleSettingMode.Magnetic)}
        flightDirectorFormat={this.flightDirectorFormat}
        tcasRaPitchCueLayerOptions={tcasRaPitchCueLayerOptions}
        tcasRaCommandDataProvider={this.props.tcasRaCommandDataProvider}
        svtSettingManager={this.props.pfdSettingManager}
        declutter={this.props.declutter}
        isSvtEnabled={this.isSvtEnabled}
        class={'horizon-display'}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    if (SubscribableUtils.isSubscribable(this.flightDirectorFormat)) {
      this.flightDirectorFormat.destroy();
    }

    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }

  /**
   * Gets pitch ladder styling options for a normal field of view.
   * @returns Pitch ladder styling options for a normal field of view.
   */
  private static getNormalFovPitchLadderStyles(): PitchLadderStyles {
    return {
      majorLineIncrement: 10,
      mediumLineFactor: 2,
      minorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineLength: 25,
      mediumLineLength: 50,
      majorLineLength: 100,
      minorLineShowNumber: false,
      mediumLineShowNumber: true,
      majorLineShowNumber: true,
      numberMargin: 18,
      numberOffsetY: 0,
      chevronThresholdPositive: 50,
      chevronThresholdNegative: 30
    };
  }

  /**
   * Gets pitch ladder styling options for an extended field of view.
   * @returns Pitch ladder styling options for an extended field of view.
   */
  private static getExtendedFovPitchLadderStyles(): PitchLadderStyles {
    return {
      majorLineIncrement: 10,
      mediumLineFactor: 2,
      minorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineLength: 25,
      mediumLineLength: 50,
      majorLineLength: 100,
      minorLineShowNumber: false,
      mediumLineShowNumber: false,
      majorLineShowNumber: true,
      numberMargin: 18,
      numberOffsetY: 0,
      chevronThresholdPositive: 50,
      chevronThresholdNegative: 30
    };
  }
}