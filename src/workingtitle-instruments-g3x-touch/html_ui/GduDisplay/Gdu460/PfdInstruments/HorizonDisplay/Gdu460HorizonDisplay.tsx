import {
  DisplayComponent, FSComponent, Subject, UserSettingManager, VNode, Vec2Math, VecNMath
} from '@microsoft/msfs-sdk';

import {
  ArtificialHorizonOptions, FlightDirectorDualCueOptions, FlightDirectorSingleCueOptions, HorizonLineOptions
} from '@microsoft/msfs-garminsdk';

import { G3XHorizonDisplay, G3XHorizonDisplayProps, G3XHorizonPitchLadderOptions } from '../../../../PFD/Components/HorizonDisplay/G3XHorizonDisplay';
import { G3XPitchLadderStyles } from '../../../../PFD/Components/HorizonDisplay/PitchLadder/G3XPitchLadder';
import { RollIndicatorOptions } from '../../../../PFD/Components/HorizonDisplay/RollIndicator/RollIndicator';
import { HorizonConfig } from '../../../../PFD/Components/HorizonDisplay/HorizonConfig';
import { GduUserSettingTypes } from '../../../../Shared/Settings/GduUserSettings';
import { PfdUserSettingTypes } from '../../../../Shared/Settings/PfdUserSettings';

import './Gdu460HorizonDisplay.css';

/**
 * Component props for {@link Gdu460HorizonDisplay}.
 */
export interface Gdu460HorizonDisplayProps extends Omit<
  G3XHorizonDisplayProps,
  'gduFormat' | 'adcIndex' | 'ahrsIndex' | 'fmsPosIndex' | 'updateFreq' | 'bingId' | 'bingDelay'
  | 'artificialHorizonOptions' | 'horizonLineOptions' | 'pitchLadderOptions' | 'rollIndicatorOptions'
  | 'flightDirectorSingleCueOptions' | 'flightDirectorDualCueOptions'
  | 'isSvtEnabled' | 'includeUnusualAttitudeChevrons' | 'flightDirectorFormat' | 'useMagneticHeading'
  | 'svtSettingManager' | 'isSvtEnabled'
> {

  /** The index of the horizon display's parent GDU. */
  gduIndex: number;

  /** A configuration object defining options for the horizon display. */
  config: HorizonConfig;

  /** Whether to support the display of the synthetic vision layer. */
  supportSvt: boolean;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdUserSettingTypes>;
}

/**
 * A G3X Touch GDU 460 PFD horizon display.
 */
export class Gdu460HorizonDisplay extends DisplayComponent<Gdu460HorizonDisplayProps> {
  private static readonly PROJECTION_OFFSET_Y = -144;

  private readonly ref = FSComponent.createRef<G3XHorizonDisplay>();

  private readonly isSvtEnabled = Subject.create(false);

  /**
   * Wakes this horizon display. While awake, this display will be updated.
   * @throws Error if this horizon display has not been rendered or has been destroyed.
   */
  public wake(): void {
    this.ref.instance.wake();
  }

  /**
   * Puts this horizon display to sleep. While asleep, this display will not be updated.
   * @throws Error if this horizon display has not been rendered or has been destroyed.
   */
  public sleep(): void {
    this.ref.instance.sleep();
  }

  /** @inheritDoc */
  public render(): VNode {
    const articialHorizonOptions: ArtificialHorizonOptions = {
      groundColors: [[0, '#a15f02'], [156, '#54350a']],
      skyColors: [[0, '#6182e8'], [156, '#0033ff']]
    };

    const horizonLineOptions: HorizonLineOptions = {
      headingPointerSize: Vec2Math.create(0, 0),
      headingTickLength: 0,
      font: 'G3X-Mono-Regular',
      fontSize: 18
    };

    const pitchLadderOptions: G3XHorizonPitchLadderOptions = {
      clipBounds: VecNMath.create(4, -100, -100, 100, 100),
      options: {
        svtDisabledStyles: Gdu460HorizonDisplay.getExtendedFovPitchLadderStyles(),
        svtEnabledStyles: Gdu460HorizonDisplay.getNormalFovPitchLadderStyles()
      }
    };

    const rollIndicatorOptions: RollIndicatorOptions = {
      radius: 126,
      showArc: this.props.config.showRollArc,
      pointerStyle: this.props.config.rollPointerStyle,
      majorTickLength: 16,
      minorTickLength: 8,
      referencePointerSize: Vec2Math.create(15, 15),
      referencePointerOffset: 1,
      rollPointerSize: Vec2Math.create(15, 15),
      rollPointerOffset: 0,
      standardRateTurnPointerSize: Vec2Math.create(14, 8),
    };

    const fdSingleCueSvtDisabledBounds = Vec2Math.create(-125, 85);
    const fdSingleCueSvtEnabledBounds = Vec2Math.create(-140, 95);
    const flightDirectorSingleCueOptions: FlightDirectorSingleCueOptions = {
      conformalBounds: this.isSvtEnabled.map(isSvtEnabled => isSvtEnabled ? fdSingleCueSvtEnabledBounds : fdSingleCueSvtDisabledBounds),
      conformalBankLimit: 20
    };

    const fdDualCueSvtDisabledBounds = VecNMath.create(4, -120, -125, 120, 85);
    const fdDualCueSvtEnabledBounds = VecNMath.create(4, -120, -140, 120, 95);
    const flightDirectorDualCueOptions: FlightDirectorDualCueOptions = {
      conformalBounds: this.isSvtEnabled.map(isSvtEnabled => isSvtEnabled ? fdDualCueSvtDisabledBounds : fdDualCueSvtEnabledBounds),
      pitchErrorFactor: 1,
      bankErrorConstant: 5
    };

    return (
      <G3XHorizonDisplay
        ref={this.ref}
        bus={this.props.bus}
        gduFormat='460'
        adcIndex={this.props.gduSettingManager.getSetting('gduAdcIndex')}
        ahrsIndex={this.props.gduSettingManager.getSetting('gduAhrsIndex')}
        fmsPosIndex={this.props.gduIndex}
        updateFreq={30}
        projectedSize={this.props.projectedSize}
        projectedOffset={Vec2Math.create(0, Gdu460HorizonDisplay.PROJECTION_OFFSET_Y)}
        bingId={this.props.supportSvt ? `g3x-${this.props.gduIndex}-synvis` : undefined}
        bingDelay={0}
        artificialHorizonOptions={articialHorizonOptions}
        horizonLineOptions={horizonLineOptions}
        pitchLadderOptions={pitchLadderOptions}
        rollIndicatorOptions={rollIndicatorOptions}
        aircraftSymbolOptions={this.props.aircraftSymbolOptions}
        includeFlightDirector={this.props.includeFlightDirector}
        flightDirectorSingleCueOptions={flightDirectorSingleCueOptions}
        flightDirectorDualCueOptions={flightDirectorDualCueOptions}
        includeUnusualAttitudeChevrons={this.props.config.includeUnusualAttitudeChevrons}
        useMagneticHeading={Subject.create(true)}
        declutter={this.props.declutter}
        pfdSettingManager={this.props.pfdSettingManager}
        isSvtEnabled={this.isSvtEnabled}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }

  /**
   * Gets pitch ladder styling options for a normal field of view.
   * @returns Pitch ladder styling options for a normal field of view.
   */
  public static getNormalFovPitchLadderStyles(): G3XPitchLadderStyles {
    return {
      majorLineIncrement: 10,
      mediumLineFactor: 2,
      minorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineLength: 25,
      mediumLineLength: 38,
      majorLineLength: 72,
      minorLineShowNumber: false,
      mediumLineShowNumber: true,
      majorLineShowNumber: true,
      numberMargin: 18,
      numberOffsetY: 0,
      chevronThresholdPositive: 50,
      chevronThresholdNegative: 30,
      majorLineHeight: 4,
    };
  }

  /**
   * Gets pitch ladder styling options for an extended field of view.
   * @returns Pitch ladder styling options for an extended field of view.
   */
  public static getExtendedFovPitchLadderStyles(): G3XPitchLadderStyles {
    return {
      majorLineIncrement: 10,
      mediumLineFactor: 2,
      minorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineLength: 25,
      mediumLineLength: 38,
      majorLineLength: 72,
      minorLineShowNumber: false,
      mediumLineShowNumber: false,
      majorLineShowNumber: true,
      numberMargin: 18,
      numberOffsetY: 0,
      chevronThresholdPositive: 50,
      chevronThresholdNegative: 30,
      majorLineHeight: 4,
    };
  }
}