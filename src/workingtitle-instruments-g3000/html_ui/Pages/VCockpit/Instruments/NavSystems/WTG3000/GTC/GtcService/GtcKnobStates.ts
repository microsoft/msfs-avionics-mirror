import { ConsumerSubject, MappedSubject, NavEvents, NavSourceType, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { ComRadio, DisplayPaneIndex, DisplayPanesAliasedUserSettingManager, DisplayPaneViewKeys, PfdMapLayoutSettingMode, PfdUserSettings } from '@microsoft/msfs-wtg3000-common';

import { GtcService } from './GtcService';

export enum GtcDualKnobRotationState {
  Blank = 'Blank',
  CRS = 'CRS',
  DisplayPanes = 'DisplayPanes',
  DisplayPanesAndRadarControl = 'DisplayPanesAndRadarControl',
  NAVCOM1 = 'NAVCOM1',
  NAVCOM2 = 'NAVCOM2',
  MapPointerControl = 'MapPointerControl'
}

export enum GtcMapKnobState {
  Blank = 'Blank',
  MapNoPointer = 'MapNoPointer',
  MapWithPointer = 'MapWithPointer',
  WeatherRadar = 'WeatherRadar',
  NAVCOM1 = 'NAVCOM1',
  NAVCOM2 = 'NAVCOM2',
  MapPointerControl = 'MapPointerControl'
}

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
 * Keeps track of what state the label bar/knobs/buttons are in,
 * so that things can tell what labels to show and control what the knobs/buttons should do.
 */
export class GtcKnobStates {
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

  /**
   * Constructor.
   * @param gtcService The GTC service instance for the GTC with which this knob states object is associated.
   */
  public constructor(private readonly gtcService: GtcService) {
    const pfdMapPointerActivePipe = this.pfdDisplayPaneSettingManager.getSetting('displayPaneMapPointerActive').pipe(this.isPfdMapPointerActive, false);

    this.controlledPfdMapDisplayPaneIndex.sub(index => {
      if (index < 0) {
        pfdMapPointerActivePipe.pause();
        this.isPfdMapPointerActive.set(false);
      } else {
        this.pfdDisplayPaneSettingManager.useDisplayPaneSettings(index);
        pfdMapPointerActivePipe.resume(true);
      }
    }, true);
  }

  /** The current state of the dual knob (top/right). */
  public readonly dualKnobState: Subscribable<GtcDualKnobRotationState> = MappedSubject.create(
    ([controlMode, pfdPaneView, cdiSource, isPfdMapPointerActive, radioBeingTuned]) => {
      if (this.gtcService.isHorizontal) {
        switch (controlMode) {
          case 'PFD':
            if (isPfdMapPointerActive && this.gtcService.isHorizontal) {
              return GtcDualKnobRotationState.MapPointerControl;
            } else {
              return cdiSource
                ? cdiSource.type === NavSourceType.Nav ? GtcDualKnobRotationState.CRS : GtcDualKnobRotationState.Blank
                : GtcDualKnobRotationState.Blank;
            }
          case 'MFD':
            // TODO Handle weather map mode
            return pfdPaneView === DisplayPaneViewKeys.WeatherMap ? GtcDualKnobRotationState.DisplayPanesAndRadarControl : GtcDualKnobRotationState.DisplayPanes;
          case 'NAV_COM':
            return radioBeingTuned === 'COM1' ?
              GtcDualKnobRotationState.NAVCOM1 :
              GtcDualKnobRotationState.NAVCOM2;
          default: throw new Error('Control Mode not handle');
        }
      } else {
        return radioBeingTuned === 'COM1' ?
          GtcDualKnobRotationState.NAVCOM1 :
          GtcDualKnobRotationState.NAVCOM2;
      }
    },
    this.gtcService.activeControlMode,
    this.gtcService.pfdPaneSettings.getSetting('displayPaneView'),
    ConsumerSubject.create(this.gtcService.bus.getSubscriber<NavEvents>().on('cdi_select'), null),
    this.isPfdMapPointerActive,
    this.gtcService.radioBeingTuned,
  );

  /** The current state of the center knob (only on vertical GTC). */
  public readonly centerKnobState: Subscribable<GtcCenterKnobState> = this.gtcService.radioBeingTuned
    .map((radio: ComRadio) => radio === 'COM1' ? GtcCenterKnobState.NAVCOM1 : GtcCenterKnobState.NAVCOM2);

  /** The current state of the map knob (bottom/left). */
  public readonly mapKnobState: Subscribable<GtcMapKnobState> = MappedSubject.create(
    ([controlMode, selectedPaneView, pfdPaneVisible, pfdPaneView, pfdMapLayout, isPfdMapPointerActive, radioBeingTuned]) => {
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
  );

  /**
   * Gets the correct map knob state based on the given inputs.
   * @param pfdPaneVisible Whether the PFD display pane is visible.
   * @param pfdPaneView What view is visible on the PFD display pane.
   * @param pfdMapLayout Which map layout is shown on the PFD.
   * @param isPfdMapPointerActive Whether the map pointer is active.
   * @returns The correct map knob state.
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
}