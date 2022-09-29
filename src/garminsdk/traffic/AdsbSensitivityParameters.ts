import { MathUtils, NumberUnitInterface, TcasTcaParameters, UnitFamily, UnitType } from 'msfssdk';

import { CDIScaleLabel } from '../navigation/LNavDataEvents';

/**
 * ADS-B Conflict Situational Awareness (CSA) sensitivity parameters.
 */
export class AdsbSensitivityParameters {
  private static readonly TA_LEVELS: TcasTcaParameters[] = [
    {
      lookaheadTime: UnitType.SECOND.createNumber(20),
      protectedRadius: UnitType.NMILE.createNumber(0.2),
      protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(25),
      protectedRadius: UnitType.NMILE.createNumber(0.2),
      protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(30),
      protectedRadius: UnitType.NMILE.createNumber(0.35),
      protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(40),
      protectedRadius: UnitType.NMILE.createNumber(0.55),
      protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(45),
      protectedRadius: UnitType.NMILE.createNumber(0.8),
      protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(48),
      protectedRadius: UnitType.NMILE.createNumber(1.1),
      protectedHeight: UnitType.FOOT.createNumber(850)
    },
    {
      lookaheadTime: UnitType.SECOND.createNumber(48),
      protectedRadius: UnitType.NMILE.createNumber(1.1),
      protectedHeight: UnitType.FOOT.createNumber(1200)
    }
  ];

  /**
   * Selects a sensitivity level for a specified environment.
   * @param altitude The indicated altitude of the own airplane.
   * @param cdiScalingLabel The CDI scaling sensitivity of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   * @returns The sensitivity level for the specified environment.
   */
  public selectLevel(
    altitude: NumberUnitInterface<UnitFamily.Distance>,
    cdiScalingLabel: CDIScaleLabel,
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): number {
    const altFeet = altitude.asUnit(UnitType.FOOT);
    const radarAltFeet = radarAltitude?.asUnit(UnitType.FOOT);

    let isApproach = false;
    switch (cdiScalingLabel) {
      case CDIScaleLabel.LNav:
      case CDIScaleLabel.LNavPlusV:
      case CDIScaleLabel.LNavVNav:
      case CDIScaleLabel.LP:
      case CDIScaleLabel.LPPlusV:
      case CDIScaleLabel.LPV:
      case CDIScaleLabel.MissedApproach:
        isApproach = true;
    }

    let level: number;
    if (
      (radarAltFeet === undefined || radarAltFeet > 2350)
      && (!isApproach && cdiScalingLabel !== CDIScaleLabel.Terminal)
    ) {
      if (altFeet > 42000) {
        level = 6;
      } else if (altFeet > 20000) {
        level = 5;
      } else if (altFeet > 10000) {
        level = 4;
      } else if (altFeet > 5000) {
        level = 3;
      } else {
        level = 2;
      }
    } else if (
      cdiScalingLabel === CDIScaleLabel.Terminal
      || (radarAltFeet !== undefined && radarAltFeet > 1000)
    ) {
      level = 1;
    } else {
      level = 0;
    }

    return level;
  }

  /**
   * Selects Traffic Advisory sensitivity settings for a specified environment.
   * @param altitude The indicated altitude of the own airplane.
   * @param cdiScalingLabel The CDI scaling sensitivity of the own airplane.
   * @param radarAltitude The radar altitude of the own airplane.
   * @returns Traffic Advisory sensitivity settings for the specified environment.
   */
  public selectTA(
    altitude: NumberUnitInterface<UnitFamily.Distance>,
    cdiScalingLabel: CDIScaleLabel,
    radarAltitude?: NumberUnitInterface<UnitFamily.Distance>
  ): TcasTcaParameters {
    return AdsbSensitivityParameters.TA_LEVELS[this.selectLevel(altitude, cdiScalingLabel, radarAltitude)];
  }

  /**
   * Gets Traffic Advisory sensitivity parameters for a given sensitivity level.
   * @param level A sensitivity level.
   * @returns Traffic Advisory sensitivity parameters for the given sensitivity level.
   */
  public getTA(level: number): TcasTcaParameters {
    return AdsbSensitivityParameters.TA_LEVELS[MathUtils.clamp(level, 0, AdsbSensitivityParameters.TA_LEVELS.length - 1)];
  }
}