import { ConsumerSubject, MappedSubject, NavEvents, NavSourceType, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { DisplayPaneIndex, DisplayPanesAliasedUserSettingManager, DisplayPaneViewKeys, PfdMapLayoutSettingMode, PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcService } from './GtcService';

/**
 * The control states of a GTC's hardware knobs.
 */
export interface GtcKnobStates {
  /**
   * The current state of the dual concentric knob (located at the top of horizontally oriented GTCs or at the right
   * side of vertically oriented GTCs).
   */
  readonly dualKnobState: Subscribable<string>;

  /** The current state of the center knob (only found on vertically oriented GTCs). */
  readonly centerKnobState: Subscribable<string>;

  /**
   * The current state of the map knob (located at the bottom of horizontally oriented GTCs or at the left side of
   * vertically oriented GTCs).
   */
  readonly mapKnobState: Subscribable<string>;
}

/**
 * GTC dual concentric knob control states.
 */
export enum GtcDualKnobState {
  Blank = 'Blank',
  CRS = 'CRS',
  DisplayPanes = 'DisplayPanes',
  DisplayPanesAndRadarControl = 'DisplayPanesAndRadarControl',
  NAVCOM1 = 'NAVCOM1',
  NAVCOM2 = 'NAVCOM2',
  MapPointerControl = 'MapPointerControl'
}

// For backwards compatibility.
/**
 * GTC dual concentric knob control states.
 * @deprecated Please use {@link GtcDualKnobState} instead.
 */
export const GtcDualKnobRotationState = GtcDualKnobState;
/**
 * GTC dual concentric knob control states.
 * @deprecated Please use {@link GtcDualKnobState} instead.
 */
export type GtcDualKnobRotationState = GtcDualKnobState;

/**
 * GTC map knob control states.
 */
export enum GtcMapKnobState {
  Blank = 'Blank',
  MapNoPointer = 'MapNoPointer',
  MapWithPointer = 'MapWithPointer',
  WeatherRadar = 'WeatherRadar',
  NAVCOM1 = 'NAVCOM1',
  NAVCOM2 = 'NAVCOM2',
  MapPointerControl = 'MapPointerControl'
}

/**
 * GTC center knob control states.
 */
export enum GtcCenterKnobState {
  Blank = 'Blank',
  NAVCOM1 = 'NAVCOM1',
  NAVCOM2 = 'NAVCOM2',
}

const mapRangeLabels = {
  [DisplayPaneViewKeys.NavigationMap]: GtcMapKnobState.MapWithPointer,
  [DisplayPaneViewKeys.TrafficMap]: GtcMapKnobState.MapNoPointer,
  [DisplayPaneViewKeys.WeatherMap]: GtcMapKnobState.MapWithPointer,
  [DisplayPaneViewKeys.WeatherRadar]: GtcMapKnobState.WeatherRadar,
  [DisplayPaneViewKeys.ProcedurePreview]: GtcMapKnobState.MapWithPointer,
  [DisplayPaneViewKeys.WaypointInfo]: GtcMapKnobState.MapWithPointer,
  [DisplayPaneViewKeys.Nearest]: GtcMapKnobState.MapWithPointer
} as Record<string, GtcMapKnobState>;

/**
 * A set of plugin-defined knob control state overrides.
 */
export type GtcKnobStatePluginOverrides = {
  /** The dual concentric knob control state override, or `null` if the state should not be overridden. */
  dualKnobState?: Subscribable<string | null>;

  /** The center knob control state override, or `null` if the state should not be overridden. */
  centerKnobState?: Subscribable<string | null>;

  /** The map knob control state override, or `null` if the state should not be overridden. */
  mapKnobState?: Subscribable<string | null>;
};

/**
 * A default implementation of {@link GtcKnobStates} which automatically manages knob control states.
 */
export class GtcKnobStatesManager implements GtcKnobStates {
  private readonly pfdMapLayoutSetting = PfdUserSettings.getAliasedManager(this.gtcService.bus, this.gtcService.pfdControlIndex).getSetting('pfdMapLayout');

  private readonly pfdDisplayPaneSettingManager = new DisplayPanesAliasedUserSettingManager(this.gtcService.bus);

  private readonly controlledPfdMapDisplayPaneIndex = MappedSubject.create(
    ([activeControlMode, isPfdPaneVisible, pfdMapLayout]): DisplayPaneIndex | -1 => {
      if (activeControlMode === 'PFD') {
        if (pfdMapLayout === PfdMapLayoutSettingMode.Hsi || (pfdMapLayout !== PfdMapLayoutSettingMode.Off && !isPfdPaneVisible)) {
          return this.gtcService.pfdInstrumentPaneIndex;
        } else if (isPfdPaneVisible) {
          return this.gtcService.pfdPaneIndex;
        }
      }

      return -1;
    },
    this.gtcService.activeControlMode,
    this.gtcService.pfdPaneSettings.getSetting('displayPaneVisible'),
    this.pfdMapLayoutSetting
  );

  private readonly isPfdMapPointerActive = Subject.create(false);

  private readonly pluginDualKnobStateOverride = Subject.create<string | null>(null);
  private readonly pluginCenterStateOverride = Subject.create<string | null>(null);
  private readonly pluginMapStateOverride = Subject.create<string | null>(null);

  /** @inheritdoc */
  public readonly dualKnobState: Subscribable<string> = MappedSubject.create(
    ([controlMode, pfdPaneView, cdiSource, isPfdMapPointerActive, radioBeingTuned, override]) => {
      if (override !== null) {
        return override;
      }

      if (this.gtcService.isHorizontal) {
        switch (controlMode) {
          case 'PFD':
            if (isPfdMapPointerActive && this.gtcService.isHorizontal) {
              return GtcDualKnobState.MapPointerControl;
            } else {
              return cdiSource
                ? cdiSource.type === NavSourceType.Nav ? GtcDualKnobState.CRS : GtcDualKnobState.Blank
                : GtcDualKnobState.Blank;
            }
          case 'MFD':
            // TODO Handle weather map mode
            return pfdPaneView === DisplayPaneViewKeys.WeatherMap ? GtcDualKnobState.DisplayPanesAndRadarControl : GtcDualKnobState.DisplayPanes;
          case 'NAV_COM':
            return radioBeingTuned === 'COM1' ?
              GtcDualKnobState.NAVCOM1 :
              GtcDualKnobState.NAVCOM2;
          default: throw new Error('Control Mode not handle');
        }
      } else {
        return radioBeingTuned === 'COM1' ?
          GtcDualKnobState.NAVCOM1 :
          GtcDualKnobState.NAVCOM2;
      }
    },
    this.gtcService.activeControlMode,
    this.gtcService.pfdPaneSettings.getSetting('displayPaneView'),
    ConsumerSubject.create(this.gtcService.bus.getSubscriber<NavEvents>().on('cdi_select'), null),
    this.isPfdMapPointerActive,
    this.gtcService.radioBeingTuned,
    this.pluginDualKnobStateOverride
  );

  /** @inheritdoc */
  public readonly centerKnobState: Subscribable<string> = MappedSubject.create(
    ([radio, override]) => {
      if (override !== null) {
        return override;
      }

      return radio === 'COM1' ? GtcCenterKnobState.NAVCOM1 : GtcCenterKnobState.NAVCOM2;
    },
    this.gtcService.radioBeingTuned,
    this.pluginCenterStateOverride
  );

  /** @inheritdoc */
  public readonly mapKnobState: Subscribable<string> = MappedSubject.create(
    ([controlMode, selectedPaneView, pfdPaneVisible, pfdPaneView, pfdMapLayout, isPfdMapPointerActive, radioBeingTuned, override]) => {
      if (override !== null) {
        return override;
      }

      switch (controlMode) {
        case 'PFD':
          return this.getPfdMapKnobState(pfdPaneVisible, pfdPaneView, pfdMapLayout, isPfdMapPointerActive);
        case 'MFD':
          // TODO Handle whether there is a selected pane
          return mapRangeLabels[selectedPaneView] ?? GtcMapKnobState.Blank;
        case 'NAV_COM':
          return radioBeingTuned === 'COM1' ? GtcMapKnobState.NAVCOM1 : GtcMapKnobState.NAVCOM2;
        default: throw new Error('Control Mode not handled');
      }
    },
    this.gtcService.activeControlMode,
    this.gtcService.selectedPaneSettings.getSetting('displayPaneView'),
    this.gtcService.pfdPaneSettings.getSetting('displayPaneVisible'),
    this.gtcService.pfdPaneSettings.getSetting('displayPaneView'),
    this.pfdMapLayoutSetting,
    this.isPfdMapPointerActive,
    this.gtcService.radioBeingTuned,
    this.pluginMapStateOverride
  );

  /**
   * Creates a new instance of GtcKnobStatesManager.
   * @param gtcService The GTC service instance associated with this manager's GTC.
   */
  public constructor(private readonly gtcService: GtcService) {
    const pfdMapPointerActivePipe = this.pfdDisplayPaneSettingManager.getSetting('displayPaneMapPointerActive').pipe(this.isPfdMapPointerActive, false);

    this.controlledPfdMapDisplayPaneIndex.sub(index => {
      if (index < 0) {
        pfdMapPointerActivePipe.pause();
        this.isPfdMapPointerActive.set(false);
      } else {
        this.pfdDisplayPaneSettingManager.useDisplayPaneSettings(index as DisplayPaneIndex);
        pfdMapPointerActivePipe.resume(true);
      }
    }, true);
  }

  /**
   * Attaches plugin-defined knob control state overrides.
   * @param overrides An array of plugin-defined knob control state overrides. The array should be ordered such that
   * the overrides appear in the order in which their parent plugins were loaded.
   */
  public attachPluginOverrides(overrides: readonly Readonly<GtcKnobStatePluginOverrides>[]): void {
    if (overrides.length === 0) {
      return;
    }

    const dualKnobOverrides: Subscribable<string | null>[] = [];
    const centerKnobOverrides: Subscribable<string | null>[] = [];
    const mapKnobOverrides: Subscribable<string | null>[] = [];

    for (const override of overrides) {
      override.dualKnobState && dualKnobOverrides.push(override.dualKnobState);
      override.centerKnobState && centerKnobOverrides.push(override.centerKnobState);
      override.mapKnobState && mapKnobOverrides.push(override.mapKnobState);
    }

    if (dualKnobOverrides.length > 0) {
      MappedSubject.create(
        GtcKnobStatesManager.selectPluginOverrideState,
        ...dualKnobOverrides
      ).pipe(this.pluginDualKnobStateOverride);
    }

    if (centerKnobOverrides.length > 0) {
      MappedSubject.create(
        GtcKnobStatesManager.selectPluginOverrideState,
        ...centerKnobOverrides
      ).pipe(this.pluginCenterStateOverride);
    }

    if (mapKnobOverrides.length > 0) {
      MappedSubject.create(
        GtcKnobStatesManager.selectPluginOverrideState,
        ...mapKnobOverrides
      ).pipe(this.pluginMapStateOverride);
    }
  }

  /**
   * Gets the desired PFD control mode map knob control state based on a given context.
   * @param pfdPaneVisible Whether the PFD display pane is visible.
   * @param pfdPaneView The key of the currently displayed PFD display pane view.
   * @param pfdMapLayout The current PFD map layout mode.
   * @param isPfdMapPointerActive Whether the PFD map pointer is active.
   * @returns The desired PFD control mode map knob control state based on the specified context.
   */
  private getPfdMapKnobState(pfdPaneVisible: boolean, pfdPaneView: string, pfdMapLayout: PfdMapLayoutSettingMode, isPfdMapPointerActive: boolean): GtcMapKnobState {
    if (isPfdMapPointerActive) {
      return GtcMapKnobState.MapPointerControl;
    } else if (pfdMapLayout === PfdMapLayoutSettingMode.Hsi) {
      return GtcMapKnobState.MapNoPointer;
    } else if (pfdPaneVisible) {
      return mapRangeLabels[pfdPaneView] ?? GtcMapKnobState.Blank;
    } else {
      switch (pfdMapLayout) {
        case PfdMapLayoutSettingMode.Traffic:
          return GtcMapKnobState.MapNoPointer;
        case PfdMapLayoutSettingMode.Inset:
          return GtcMapKnobState.MapWithPointer;
        default:
          return GtcMapKnobState.Blank;
      }
    }
  }

  /**
   * Selects a single plugin-defined knob control state override to apply from an array of overrides. The last
   * non-`null` override in the array will be selected. If all overrides in the array are `null`, `null` will be
   * selected.
   * @param overrides An array of plugin-defined knob control state overrides.
   * @returns The plugin-defined knob control state override to apply from the specified array of overrides.
   */
  private static selectPluginOverrideState(overrides: readonly (string | null)[]): string | null {
    for (let i = overrides.length - 1; i >= 0; i--) {
      if (overrides[i] !== null) {
        return overrides[i];
      }
    }

    return null;
  }
}