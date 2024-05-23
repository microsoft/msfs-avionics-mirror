import { CDIScaleLabel } from '../../../navigation/LNavDataEvents';

/**
 * Utility class for creating CDI scaling mode text formatters.
 */
export class CdiScaleFormatter {
  private static readonly TEXT_MAP: Record<CDIScaleLabel, string> = {
    [CDIScaleLabel.Approach]: 'APPR',
    [CDIScaleLabel.Departure]: 'DPRT',
    [CDIScaleLabel.Enroute]: 'ENR',
    [CDIScaleLabel.LNav]: 'LNAV',
    [CDIScaleLabel.LNavPlusV]: 'LNAV+V',
    [CDIScaleLabel.LNavVNav]: 'L/VNAV',
    [CDIScaleLabel.LP]: 'LP',
    [CDIScaleLabel.LPPlusV]: 'LP+V',
    [CDIScaleLabel.LPV]: 'LPV',
    [CDIScaleLabel.RNP]: 'RNP',
    [CDIScaleLabel.MissedApproach]: 'MAPR',
    [CDIScaleLabel.Oceanic]: 'OCN',
    [CDIScaleLabel.Terminal]: 'TERM',
    [CDIScaleLabel.TerminalArrival]: 'TERM',
    [CDIScaleLabel.TerminalDeparture]: 'TERM',
    [CDIScaleLabel.Visual]: 'VISUAL',
    [CDIScaleLabel.VfrEnroute]: 'VFR',
    [CDIScaleLabel.VfrTerminal]: 'VFR',
    [CDIScaleLabel.VfrApproach]: 'VFR'
  };

  private static readonly RNP_TEXT_MAP: Record<CDIScaleLabel, string> = {
    [CDIScaleLabel.Approach]: 'APPR',
    [CDIScaleLabel.Departure]: 'RNP0.30',
    [CDIScaleLabel.Enroute]: 'RNP2.00',
    [CDIScaleLabel.LNav]: 'LNAV',
    [CDIScaleLabel.LNavPlusV]: 'LNAV+V',
    [CDIScaleLabel.LNavVNav]: 'L/VNAV',
    [CDIScaleLabel.LP]: 'LP',
    [CDIScaleLabel.LPPlusV]: 'LP+V',
    [CDIScaleLabel.LPV]: 'LPV',
    [CDIScaleLabel.RNP]: 'RNP',
    [CDIScaleLabel.MissedApproach]: 'RNP0.30',
    [CDIScaleLabel.Oceanic]: 'RNP4.00',
    [CDIScaleLabel.Terminal]: 'RNP1.00',
    [CDIScaleLabel.TerminalArrival]: 'RNP1.00',
    [CDIScaleLabel.TerminalDeparture]: 'RNP1.00',
    [CDIScaleLabel.Visual]: 'VISUAL',
    [CDIScaleLabel.VfrEnroute]: 'VFR',
    [CDIScaleLabel.VfrTerminal]: 'VFR',
    [CDIScaleLabel.VfrApproach]: 'VFR'
  };

  /**
   * Creates a function which formats CDI scaling modes to text strings.
   * @param useRnp Whether the formatter should output explicit RNP values for certain scaling modes (e.g. `'RNP2.00'`
   * instead of `'ENR'`).
   * @returns A function which formats CDI scaling modes to text strings.
   */
  public static create(useRnp: boolean): (mode: CDIScaleLabel) => string {
    const textMap = useRnp ? CdiScaleFormatter.RNP_TEXT_MAP : CdiScaleFormatter.TEXT_MAP;

    return (mode: CDIScaleLabel): string => {
      return textMap[mode];
    };
  }
}