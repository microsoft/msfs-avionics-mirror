import { DefaultConfigFactory, DisplayPaneControlGtcIndex, GtcControlSetup, GtcOrientation, PfdIndex } from '@microsoft/msfs-wtg3000-common';
import { GtcControlMode } from '../GtcService/GtcService';

/**
 * A configuration object which defines options for the G3000 GTC.
 */
export class GtcConfig {
  private readonly factory = new DefaultConfigFactory();

  /** The orientation (horizontal or vertical) of the GTC. */
  public readonly orientation: GtcOrientation;

  /** The control setup defining which control modes the GTC supports. */
  public readonly controlSetup: GtcControlSetup;

  /** The default control mode of the GTC. */
  public readonly defaultControlMode: GtcControlMode;

  /** The index of the PFD controlled by the GTC. */
  public readonly pfdControlIndex: PfdIndex;

  /** The display pane controlling index of the GTC. */
  public readonly paneControlIndex: DisplayPaneControlGtcIndex;

  /** The index of the IAU used by the GTC. */
  public readonly iauIndex: number;

  /**
   * Creates a GtcConfig from an XML configuration document.
   * @param xmlConfig An XML configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to the config's
   * instrument.
   */
  public constructor(xmlConfig: Document, instrumentConfig: Element | undefined) {
    [this.orientation, this.controlSetup, this.defaultControlMode, this.pfdControlIndex, this.paneControlIndex] = this.parseGeneralOptions(instrumentConfig);
    this.iauIndex = this.parseIauIndex(instrumentConfig);
  }

  /**
   * Parses general configuration options from a configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns General configuration options, as defined by the configuration document for this config's instrument, as
   * `[orientation, control_setup, default_control_mode, pfd_control_index, display_pane_control_index]`.
   * @throws Error if `instrumentConfig` is undefined or if any configuration options are missing or malformed.
   */
  private parseGeneralOptions(instrumentConfig: Element | undefined): [GtcOrientation, GtcControlSetup, GtcControlMode, PfdIndex, DisplayPaneControlGtcIndex] {
    const options = instrumentConfig?.querySelector(':scope>GtcConfig');

    if (options === null || options === undefined) {
      throw new Error('GTC general configuration options (orientation, control setup, and control side) are not defined.');
    }

    const orientation = options.getAttribute('orientation')?.toLowerCase();
    switch (orientation) {
      case 'horizontal':
      case 'vertical':
        break;
      default:
        throw new Error(`GTC orientation was not properly defined. Expected 'horizontal' or 'vertical' but got ${orientation ?? 'NULL'}`);
    }

    let controlAllowed: boolean;
    let canControlPfd = false;
    let canControlMfd = false;
    let canControlNavCom = false;
    let canControlPanes = false;

    const controlSetup = options.getAttribute('control-setup')?.toLowerCase();
    switch (controlSetup) {
      case 'all':
        controlAllowed = orientation === 'horizontal';
        canControlPfd = true;
        canControlMfd = true;
        canControlNavCom = true;
        canControlPanes = true;
        break;
      case 'pfd-navcom':
        controlAllowed = orientation === 'horizontal';
        canControlPfd = true;
        canControlNavCom = true;
        break;
      case 'pfd':
        controlAllowed = orientation === 'vertical';
        canControlPfd = true;
        break;
      case 'mfd':
        controlAllowed = orientation === 'vertical';
        canControlMfd = true;
        canControlPanes = true;
        break;
      default:
        throw new Error(`GTC control setup was not properly defined. Expected 'all', 'pfd', 'mfd', or 'navcom', but got ${controlSetup ?? 'NULL'}`);
    }

    if (orientation === 'horizontal') {
      if (!controlAllowed) {
        throw new Error(`Horizontal GTCs do not support control setup of '${controlSetup}'. Expected 'all' or 'navcom'.`);
      }
    } else {
      if (!controlAllowed) {
        throw new Error(`Vertical GTCs do not support control setup of '${controlSetup}'. Expected 'pfd' or 'mfd'.`);
      }
    }

    let defaultControlMode: GtcControlMode | undefined;
    let isDefaultControlModeIncompatible = false;

    const defaultControlModeOpt = options.getAttribute('default-control-mode')?.toLowerCase();
    switch (defaultControlModeOpt) {
      case 'pfd':
        if (canControlPfd) {
          defaultControlMode = 'PFD';
        } else {
          isDefaultControlModeIncompatible = true;
        }
        break;
      case 'mfd':
        if (canControlMfd) {
          defaultControlMode = 'MFD';
        } else {
          isDefaultControlModeIncompatible = true;
        }
        break;
      case 'navcom':
        if (canControlNavCom) {
          defaultControlMode = 'NAV_COM';
        } else {
          isDefaultControlModeIncompatible = true;
        }
        break;
      case undefined:
        break;
      default:
        console.warn('Invalid GtcConfig definition: unrecognized default control mode (must be \'pfd\', \'mfd\', or \'navcom\').');
    }

    if (defaultControlMode === undefined) {
      switch (controlSetup) {
        case 'mfd':
          defaultControlMode = 'MFD';
          break;
        default:
          defaultControlMode = 'PFD';
      }

      if (isDefaultControlModeIncompatible) {
        console.warn(`Invalid GtcConfig definition: default control mode '${defaultControlModeOpt}' is incompatible with '${controlSetup}' control setup. Defaulting to '${defaultControlMode}'.`);
      }
    }

    let pfdControlIndex: PfdIndex;
    if (canControlPfd) {
      const index = options.getAttribute('pfd-control-index');
      switch (index) {
        case '1':
          pfdControlIndex = 1;
          break;
        case '2':
          pfdControlIndex = 2;
          break;
        default:
          throw new Error(`GTC PFD control index was not properly defined. Expected '1' or '2' but got ${index ?? 'NULL'}`);
      }
    } else {
      pfdControlIndex = 1;
    }

    let paneControlIndex: DisplayPaneControlGtcIndex;
    if (canControlPanes) {
      const controlSide = options.getAttribute('pane-control-side')?.toLowerCase();
      switch (controlSide) {
        case 'left':
          paneControlIndex = DisplayPaneControlGtcIndex.LeftGtc;
          break;
        case 'right':
          paneControlIndex = DisplayPaneControlGtcIndex.RightGtc;
          break;
        default:
          throw new Error(`GTC pane control side was not properly defined. Expected 'left' or 'right' but got ${controlSide ?? 'NULL'}`);
      }
    } else {
      paneControlIndex = DisplayPaneControlGtcIndex.LeftGtc;
    }

    return [orientation, controlSetup, defaultControlMode, pfdControlIndex, paneControlIndex];
  }

  /**
   * Parses an IAU index from a configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The IAU index defined by the configuration document for this config's instrument.
   */
  private parseIauIndex(instrumentConfig: Element | undefined): number {
    if (instrumentConfig !== undefined) {
      const iauElement = instrumentConfig.querySelector(':scope>Iau');
      if (iauElement !== null) {
        const iauIndex = Number(iauElement.textContent ?? undefined);
        if (isNaN(iauIndex) || iauIndex < 1 || Math.trunc(iauIndex) !== iauIndex) {
          console.warn('Invalid GtcConfig definition: unrecognized IAU index (must be a positive integer). Defaulting to 1.');
        } else {
          return iauIndex;
        }
      }
    }

    return 1;
  }
}