import {
  APConfigDirectorEntry, APValues, EventBus, GPSSystemState, LNavComputer, Subject, Value, VNavPathCalculator
} from '@microsoft/msfs-sdk';

import { Fms, GarminAPConfig, GarminGlidepathComputer, GarminNavToNavComputer, GarminVNavComputer } from '@microsoft/msfs-garminsdk';

import { AvionicsConfig, G3000AutopilotUtils } from '@microsoft/msfs-wtg3000-common';

import { G3000AutopilotPluginOptions } from './G3000AutopilotPluginOptions';

/**
 * A G3000 autopilot configuration.
 */
export class G3000APConfig extends GarminAPConfig {
  /**
   * Creates a new instance of G3000APConfig.
   * @param bus The event bus.
   * @param fms The FMS instance from which to source data.
   * @param lnavComputer The LNAV computer from which to source data.
   * @param verticalPathCalculator The vertical path calculator to use for the autopilot's internal VNAV and glidepath
   * computers.
   * @param navToNavComputer The nav-to-nav computer from which to source data.
   * @param config The avionics configuration object.
   * @param pluginOptions An array of autopilot options defined by plugins. The array should be ordered such that
   * options from plugins that were loaded earlier are positioned before options from plugins that were loaded later.
   */
  public constructor(
    bus: EventBus,
    fms: Fms,
    lnavComputer: LNavComputer,
    verticalPathCalculator: VNavPathCalculator,
    navToNavComputer: GarminNavToNavComputer,
    config: AvionicsConfig,
    private readonly pluginOptions: readonly G3000AutopilotPluginOptions[]
  ) {
    super(bus, {
      deactivateAutopilotOnGa: config.autopilot.deactivateAutopilotOnGa,
      useIndicatedMach: true,
      lnavOptions: {
        steerCommand: lnavComputer.steerCommand
      },
      internalVNavComputer: apValues => {
        return new GarminVNavComputer(0, bus, fms.flightPlanner, verticalPathCalculator, apValues, {
          enableAdvancedVNav: config.vnav.advanced,
        });
      },
      internalGlidepathComputer: () => {
        return new GarminGlidepathComputer(0, bus, fms.flightPlanner, {
          allowApproachBaroVNav: true,
          allowPlusVWithoutSbas: true,
          allowRnpAr: config.fms.approach.supportRnpAr,
          gpsSystemState: Subject.create(GPSSystemState.DiffSolutionAcquired)
        });
      },
      navToNavGuidance: {
        cdiId: Value.create(''),
        armableNavRadioIndex: navToNavComputer.armableNavRadioIndex,
        armableLateralMode: navToNavComputer.armableLateralMode,
        armableVerticalMode: navToNavComputer.armableVerticalMode,
        canSwitchCdi: navToNavComputer.canSwitchCdi,
        isExternalCdiSwitchInProgress: Value.create(false)
      },
      rollMinBankAngle: config.autopilot.rollOptions.minBankAngle,
      rollMaxBankAngle: config.autopilot.rollOptions.maxBankAngle,
      hdgMaxBankAngle: config.autopilot.hdgOptions.maxBankAngle,
      vorMaxBankAngle: config.autopilot.vorOptions.maxBankAngle,
      locMaxBankAngle: config.autopilot.locOptions.maxBankAngle,
      lnavMaxBankAngle: config.autopilot.lnavOptions.maxBankAngle,
      lowBankAngle: config.autopilot.lowBankOptions.maxBankAngle,
      toPitchAngle: config.autopilot.toOptions.targetPitchAngle,
      gaPitchAngle: config.autopilot.gaOptions.targetPitchAngle,
    });
  }

  /** @inheritDoc */
  public createLateralDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    const directors = super.createLateralDirectors(apValues);

    const additionalDirectors = new Map<number, Readonly<APConfigDirectorEntry>>();

    for (let i = this.pluginOptions.length - 1; i >= 0; i--) {
      const options = this.pluginOptions[i];
      if (options.createAdditionalLateralDirectors) {
        const pluginAdditionalDirectors = options.createAdditionalLateralDirectors();
        for (const entry of pluginAdditionalDirectors) {
          if (!G3000AutopilotUtils.RESTRICTED_LATERAL_MODES.includes(entry.mode) && !additionalDirectors.has(entry.mode)) {
            additionalDirectors.set(entry.mode, { mode: entry.mode, director: entry.directorFactory(apValues) });
          }
        }
      }
    }

    return [...directors, ...additionalDirectors.values()];
  }

  /** @inheritDoc */
  public createVerticalDirectors(apValues: APValues): Iterable<Readonly<APConfigDirectorEntry>> {
    const directors = super.createVerticalDirectors(apValues);

    const additionalDirectors = new Map<number, Readonly<APConfigDirectorEntry>>();

    for (let i = this.pluginOptions.length - 1; i >= 0; i--) {
      const options = this.pluginOptions[i];
      if (options.createAdditionalVerticalDirectors) {
        const pluginAdditionalDirectors = options.createAdditionalVerticalDirectors();
        for (const entry of pluginAdditionalDirectors) {
          if (!G3000AutopilotUtils.RESTRICTED_VERTICAL_MODES.includes(entry.mode) && !additionalDirectors.has(entry.mode)) {
            additionalDirectors.set(entry.mode, { mode: entry.mode, director: entry.directorFactory(apValues) });
          }
        }
      }
    }

    return [...directors, ...additionalDirectors.values()];
  }
}
