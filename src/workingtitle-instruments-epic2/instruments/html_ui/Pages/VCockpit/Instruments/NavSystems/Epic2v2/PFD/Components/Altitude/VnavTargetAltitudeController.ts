import { MappedSubject, Subscribable } from '@microsoft/msfs-sdk';

import {
  AltitudeDataProvider, AutopilotDataProvider, Epic2ApVerticalActiveMode, Epic2ApVerticalMode, Epic2ApVerticalPrimaryArmedMode
} from '@microsoft/msfs-epic2-shared';

/** Display state of the Vnav Target Altitude. */
export const VnavTargetAltitudeDisplayStyle = {
  WHITE: 'white',
  CYAN: 'cyan',
  AMBER: 'amber',
  MAGENTA: 'magenta',
  HIDDEN: 'hidden',
} as const;

/**
 * Type definition for display state of the Vnav Target Altitude
 */
type VnavTargetAltitudeDisplayStyle = typeof VnavTargetAltitudeDisplayStyle[keyof typeof VnavTargetAltitudeDisplayStyle]

/**
 * Controller for VNAV Target Altitude bug and readout.
 */
export class VnavTargetAltitudeController {
  private readonly vnavTargetAltitude: Subscribable<number>;
  private readonly verticalActive: Subscribable<Epic2ApVerticalActiveMode>;
  private readonly verticalArmedPrimary: Subscribable<Epic2ApVerticalPrimaryArmedMode>;
  private readonly selectedAltitude: Subscribable<number | null>;
  private readonly currentAltitude: Subscribable<number | null>;
  public readonly displayStyle: MappedSubject<[number, number | null, Epic2ApVerticalActiveMode, number | null, Epic2ApVerticalPrimaryArmedMode], VnavTargetAltitudeDisplayStyle>;

  // The vertical autopilot modes that allow the vnav target altitude to be displayed
  // This is only displayed in VALT, VFLC/VSPD, VSEL, or VPTH modes
  private static verticalModes = [
    Epic2ApVerticalMode.VnavFlightLevelChange,
    Epic2ApVerticalMode.VnavSpeed,
    Epic2ApVerticalMode.VnavAltitudeSelect,
    Epic2ApVerticalMode.VnavPath,
    Epic2ApVerticalMode.VnavAltitudeHold,
    Epic2ApVerticalMode.GoAround,
    Epic2ApVerticalMode.VerticalSpeed,
    Epic2ApVerticalMode.AltitudeSelect,
    Epic2ApVerticalMode.AltitudeHold,
  ];

  /**
   * Creates an instance of VnavTargetAltitudeController.
   * @param autopilotDataProvider The altitude data provider to use.
   * @param altitudeDataProvider The autopilot data provider
   */
  constructor(
    private readonly autopilotDataProvider: AutopilotDataProvider,
    private readonly altitudeDataProvider: AltitudeDataProvider,
  ) {
    this.vnavTargetAltitude = autopilotDataProvider.vnavTargetAltitude;
    this.verticalActive = autopilotDataProvider.verticalActive;
    this.verticalArmedPrimary = autopilotDataProvider.verticalArmedPrimary;
    this.selectedAltitude = autopilotDataProvider.selectedAltitude;
    this.currentAltitude = altitudeDataProvider.altitude;

    this.displayStyle = MappedSubject.create(
      ([vnavTargetAltitude, currentAlt, activeVerticalMode, selectedAlt, armedVerticalPrimary]) => {

        const altitudeWithin200 = currentAlt !== null && Math.abs(currentAlt - vnavTargetAltitude) <= 200;
        const altitudeWithin1000 = currentAlt !== null && Math.abs(currentAlt - vnavTargetAltitude) < 1000;
        const capturedBeforePreselect = selectedAlt === null || Math.abs(vnavTargetAltitude - selectedAlt) > 100;

        switch (true) {
          case vnavTargetAltitude === -1:
          case !VnavTargetAltitudeController.verticalModes.includes(activeVerticalMode):
          case selectedAlt !== null && Math.abs(vnavTargetAltitude - selectedAlt) < 101:
            return VnavTargetAltitudeDisplayStyle.HIDDEN;
          case activeVerticalMode === Epic2ApVerticalMode.GoAround:
            return VnavTargetAltitudeDisplayStyle.WHITE;
          case capturedBeforePreselect && activeVerticalMode === Epic2ApVerticalMode.VnavAltitudeSelect:
          case capturedBeforePreselect && altitudeWithin200 && activeVerticalMode === Epic2ApVerticalMode.VnavAltitudeHold:
          case altitudeWithin200 && activeVerticalMode === Epic2ApVerticalMode.AltitudeHold:
          case activeVerticalMode === Epic2ApVerticalMode.AltitudeSelect:
            return VnavTargetAltitudeDisplayStyle.MAGENTA;
          case altitudeWithin1000 && !altitudeWithin200:
            return VnavTargetAltitudeDisplayStyle.AMBER;
          case activeVerticalMode === Epic2ApVerticalMode.VnavFlightLevelChange:
          case activeVerticalMode === Epic2ApVerticalMode.VnavSpeed:
          case activeVerticalMode === Epic2ApVerticalMode.VnavPath:
          case activeVerticalMode === Epic2ApVerticalMode.VerticalSpeed && armedVerticalPrimary === Epic2ApVerticalMode.AltitudeSelect:
            return VnavTargetAltitudeDisplayStyle.CYAN;
          default:
            return VnavTargetAltitudeDisplayStyle.WHITE;
        }
      },
      this.vnavTargetAltitude,
      this.currentAltitude,
      this.verticalActive,
      this.selectedAltitude,
      this.verticalArmedPrimary,
    );
  }

}
