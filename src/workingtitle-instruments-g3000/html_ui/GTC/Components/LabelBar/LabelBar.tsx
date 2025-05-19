import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, NodeReference, SetSubject, Subscribable, Subscription,
  VNode
} from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex, DisplayPaneIndex, G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import { GtcCenterKnobState, GtcDualKnobState, GtcMapKnobState } from '../../GtcService/GtcKnobStates';
import { GtcService } from '../../GtcService/GtcService';
import { GtcSidebar } from '../../GtcService/Sidebar';

import './LabelBar.css';

/**
 * A set of plugin-defined functions which return labels to apply to the GTC label bar.
 */
export type LabelBarPluginHandlers = {
  /** A function which returns a GTC dual concentric knob label, or `null` to defer label generation. */
  dualKnobLabel?: (knobState: string) => string | null;

  /** A function which returns a GTC center knob label, or `null` to defer label generation. */
  centerKnobLabel?: (knobState: string) => string | null;

  /** A function which returns a GTC map knob label, or `null` to defer label generation. */
  mapKnobLabel?: (knobState: string) => string | null;
};

/**
 * Component props for LabelBar.
 */
export interface LabelBarProps extends ComponentProps {
  /** The GtcService. */
  gtcService: GtcService;

  /**
   * An array of plugin label handlers. The array should be ordered such that the handlers appear in the order in which
   * their parent plugins were loaded.
   */
  pluginHandlers: readonly Readonly<LabelBarPluginHandlers>[];
}

/**
 * A GTC label bar which displays text describing the context-sensitive functions of the GTC knobs.
 */
export class LabelBar extends DisplayComponent<LabelBarProps> {
  private readonly selectedPaneDisplayRef = FSComponent.createRef<HTMLDivElement>();
  private readonly selectedPaneIconColorRef = FSComponent.createRef<HTMLDivElement>();
  private readonly paneBoxRefs: Record<ControllableDisplayPaneIndex, NodeReference<HTMLDivElement>> = {
    [DisplayPaneIndex.LeftPfd]: FSComponent.createRef<HTMLDivElement>(),
    [DisplayPaneIndex.LeftMfd]: FSComponent.createRef<HTMLDivElement>(),
    [DisplayPaneIndex.RightMfd]: FSComponent.createRef<HTMLDivElement>(),
    [DisplayPaneIndex.RightPfd]: FSComponent.createRef<HTMLDivElement>(),
  };

  private readonly dualKnobLabelRef = FSComponent.createRef<LabelBarLabel>();
  private readonly sidebarState = GtcSidebar.createSidebarState();
  private readonly pilotOrCopilot = this.props.gtcService.gtcThisSide === 'left' ? 'Pilot' : 'Copilot';
  private readonly isHoz = this.props.gtcService.orientation === 'horizontal';

  private readonly dualKnobPluginHandlers = this.props.pluginHandlers
    .map(handlers => handlers.dualKnobLabel)
    .filter(handler => !!handler) as ((knobState: string) => string | null)[];
  private readonly centerKnobPluginHandlers = this.props.pluginHandlers
    .map(handlers => handlers.centerKnobLabel)
    .filter(handler => !!handler) as ((knobState: string) => string | null)[];
  private readonly mapKnobPluginHandlers = this.props.pluginHandlers
    .map(handlers => handlers.mapKnobLabel)
    .filter(handler => !!handler) as ((knobState: string) => string | null)[];

  private readonly dualKnobLabel = MappedSubject.create(([override, knobState]) => {
    if (override !== null) {
      return GtcSidebar.renderDualConcentricKnobLabel(override, this.props.gtcService.orientation);
    }

    for (let i = this.dualKnobPluginHandlers.length - 1; i >= 0; i--) {
      const label = this.dualKnobPluginHandlers[i](knobState);
      if (label !== null) {
        return label;
      }
    }

    switch (knobState) {
      case GtcDualKnobState.Blank: return '';
      case GtcDualKnobState.CRS:
      case GtcDualKnobState.OBS:
        return 'CRS';
      case GtcDualKnobState.DisplayPanes: return '';
      case GtcDualKnobState.DisplayPanesAndRadarControl: return 'Push:\nRadar\nControl';
      case GtcDualKnobState.NAVCOM1:
        return this.isHoz ? 'COM1\nFreq\nPush:\n1–2\nHold:↕' : 'COM1 Freq\nPush:1–2 Hold:↕';
      case GtcDualKnobState.NAVCOM2:
        return this.isHoz ? 'COM2\nFreq\nPush:\n1–2\nHold:↕' : 'COM2 Freq\nPush:1–2 Hold:↕';
      case GtcDualKnobState.MapPointerControl:
      case GtcDualKnobState.ChartsPanZoomControl:
        return this.isHoz ? 'Pan/\nPoint\nPush:\nPan Off' : '';
      case GtcDualKnobState.Checklist:
        return this.isHoz ? '' : 'Select Item\nPush: Check';
      default:
        throw new Error(`LabelBar: Unable to retrieve label for dual knob control state ${knobState}`);
    }
  }, this.sidebarState.dualConcentricKnobLabel, this.props.gtcService.gtcKnobStates.dualKnobState);

  private readonly centerKnobLabel = MappedSubject.create(([override, knobState]) => {
    if (override !== null) {
      return override;
    }

    for (let i = this.centerKnobPluginHandlers.length - 1; i >= 0; i--) {
      const label = this.centerKnobPluginHandlers[i](knobState);
      if (label !== null) {
        return label;
      }
    }

    switch (knobState) {
      case GtcCenterKnobState.Blank: return '';
      // TODO Pilot/copilot can change on the audios and radios page
      case GtcCenterKnobState.NAVCOM1: return `${this.pilotOrCopilot} COM1 Volume`;
      case GtcCenterKnobState.NAVCOM2: return `${this.pilotOrCopilot} COM2 Volume`;
      default:
        throw new Error(`LabelBar: Unable to retrieve label for center knob control state ${knobState}`);
    }
  }, this.sidebarState.centerKnobLabel, this.props.gtcService.gtcKnobStates.centerKnobState);

  private readonly mapKnobLabel = MappedSubject.create(([override, knobState]) => {
    if (override !== null) {
      return override;
    }

    for (let i = this.mapKnobPluginHandlers.length - 1; i >= 0; i--) {
      const label = this.mapKnobPluginHandlers[i](knobState);
      if (label !== null) {
        return label;
      }
    }

    switch (knobState) {
      case GtcMapKnobState.Blank: return '';
      case GtcMapKnobState.NAVCOM1: return 'Pilot\nCOM1\nVolume';
      case GtcMapKnobState.NAVCOM2: return 'Pilot\nCOM2\nVolume';
      case GtcMapKnobState.MapWithPointer:
      case GtcMapKnobState.Charts:
        return this.isHoz ? '−Range+\nPush:\nPan' : '− Range +\nPush:Pan';
      case GtcMapKnobState.MapNoPointer: return this.isHoz ? '−Range+' : '− Range +';
      case GtcMapKnobState.WeatherRadar: return this.isHoz ? '−Range+' : '− Range +'; // return this.isHoz ? 'Push:\nRadar\nControl' : '\nPush:BRG/Tilt';
      case GtcMapKnobState.MapPointerControl: return this.isHoz ? '−Range+\nPush:\nPan Off' : '− Range +\nPush:Pan';
      case GtcMapKnobState.Checklist: return this.isHoz ? 'Select\nItem\nPush:\nCheck' : '';
      default:
        throw new Error(`LabelBar: Unable to retrieve label for map knob control state ${knobState}`);
    }
  }, this.sidebarState.mapKnobLabel, this.props.gtcService.gtcKnobStates.mapKnobState);

  private subs = [] as Subscription[];

  /** @inheritDoc */
  public onAfterRender(): void {
    const { gtcService } = this.props;

    // Handles syncing the button bar state with the active gtc view
    gtcService.activeView.sub(view => {
      this.subs.forEach(sub => sub?.destroy());
      this.subs = GtcSidebar.pipeObjectOfSubs(view.ref.sidebarState, this.sidebarState);
    }, true);

    const updatePaneIndicatorVisibility = this.updatePaneIndicatorVisibility.bind(this);
    gtcService.activeControlMode.sub(updatePaneIndicatorVisibility);
    if (gtcService.isHorizontal) {
      this.dualKnobLabel.sub(updatePaneIndicatorVisibility);
    } else {
      this.mapKnobLabel.sub(updatePaneIndicatorVisibility);
    }
    updatePaneIndicatorVisibility();

    if (gtcService.orientation === 'horizontal') {
      gtcService.thisGtcSelectedPane.sub(this.onSelectedPaneChanged.bind(this), true);

      for (const paneIndex of gtcService.enabledControllablePanes) {
        const updatePaneAvailability = this.updatePaneAvailability.bind(this, paneIndex);
        gtcService.otherGtcSelectedPane.sub(updatePaneAvailability);
        gtcService.displayPaneVisibleSettings[paneIndex].sub(updatePaneAvailability);
        updatePaneAvailability();
      }
    } else {
      this.props.gtcService.selectedDisplayPane.sub(this.updateNoPaneSelected.bind(this), true);
    }
  }

  /**
   * Updates the visibility of this label bar's display pane indicators.
   */
  private updatePaneIndicatorVisibility(): void {
    const mode = this.props.gtcService.activeControlMode.get();
    const label = this.props.gtcService.isHorizontal ? this.dualKnobLabel : this.mapKnobLabel;
    const hidePaneSelector = mode !== 'MFD' || label.get().startsWith(GtcSidebar.hidePanesString);
    this.selectedPaneDisplayRef.instance.classList.toggle('hidden', hidePaneSelector);
    if (hidePaneSelector) {
      this.dualKnobLabelRef.instance.classes.add('hide-pane-selector');
    } else {
      this.dualKnobLabelRef.instance.classes.delete('hide-pane-selector');
    }
  }

  /**
   * Responds to when the display pane selected by this label bar's parent GTC changes.
   * @param selectedPaneIndex The index of the new selected display pane, or `-1` if no pane is selected.
   */
  private onSelectedPaneChanged(selectedPaneIndex: ControllableDisplayPaneIndex | -1): void {
    for (let i = 0; i < this.props.gtcService.enabledControllablePanes.length; i++) {
      const paneIndex = this.props.gtcService.enabledControllablePanes[i];
      this.paneBoxRefs[paneIndex].instance.classList.toggle('selected', selectedPaneIndex === paneIndex);
    }
  }

  /**
   * Updates one of this label bar's display pane availability indicators.
   * @param paneIndex The index of the display pane of the indicator to update.
   */
  private updatePaneAvailability(paneIndex: ControllableDisplayPaneIndex): void {
    const isNotAvailable = !this.props.gtcService.displayPaneVisibleSettings[paneIndex].value
      || this.props.gtcService.otherGtcSelectedPane.get() === paneIndex;
    this.paneBoxRefs[paneIndex].instance.classList.toggle('unselectable', isNotAvailable);
  }

  /**
   * Updates no pane selected.
   * @param selectedPaneIndex The index of the new selected display pane, or `-1` if no pane is selected.
   */
  private updateNoPaneSelected(selectedPaneIndex: ControllableDisplayPaneIndex | -1): void {
    this.selectedPaneIconColorRef.instance.classList.toggle('unselectable', selectedPaneIndex === -1);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='label-bar'>
        <LabelBarLabel ref={this.dualKnobLabelRef} class={['knob', 'dual-knob']}>
          {this.props.gtcService.orientation === 'horizontal' &&
            <div ref={this.selectedPaneDisplayRef} class="selected-pane-display">
              <div class="selected-pane-label">Pane</div>
              <div class="selected-pane-boxes">
                {this.props.gtcService.enabledControllablePanes.map(index => {
                  return (
                    <div ref={this.paneBoxRefs[index]} class={`pane-box pane-box-${index}`} />
                  );
                })}
              </div>
            </div>
          }
          {this.dualKnobLabel.map(x => x.replace(GtcSidebar.hidePanesString, ''))}
        </LabelBarLabel>
        <div class="divider top-left-divider" />
        {this.props.gtcService.orientation === 'horizontal' &&
          <>
            {this.props.gtcService.hasPfdMode && (
              <LabelBarLabel
                class={['soft-key', 'soft-key1', 'soft-key-active']}
                isActive={this.props.gtcService.activeControlMode.map(x => x === 'PFD')}
              >
                <div class="label-bar-label-text">PFD</div>
                <img class="label-bar-arrow label-bar-arrow-active" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_knob_pair_arrow_active.png`}></img>
                <img class="label-bar-arrow label-bar-arrow-inactive" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_knob_pair_arrow_inactive.png`}></img>
              </LabelBarLabel>
            )}
            {this.props.gtcService.hasMfdMode && (
              <LabelBarLabel
                class={['soft-key', 'soft-key2']}
                isActive={this.props.gtcService.activeControlMode.map(x => x === 'MFD')}
              >
                <div class="label-bar-label-text">MFD</div>
                <img class="label-bar-arrow label-bar-arrow-active" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_knob_pair_arrow_active.png`}></img>
                <img class="label-bar-arrow label-bar-arrow-inactive" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_knob_pair_arrow_inactive.png`}></img>
              </LabelBarLabel>
            )}
            {this.props.gtcService.hasNavComMode && (
              <LabelBarLabel
                class={['soft-key', 'soft-key3']}
                isActive={this.props.gtcService.activeControlMode.map(x => x === 'NAV_COM')}
              >
                <div class="label-bar-label-text">NAV<br />COM</div>
                <img class="label-bar-arrow label-bar-arrow-active" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_knob_pair_arrow_active.png`}></img>
                <img class="label-bar-arrow label-bar-arrow-inactive" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_knob_pair_arrow_inactive.png`}></img>
              </LabelBarLabel>
            )}
          </>
        }
        {this.props.gtcService.orientation === 'vertical' &&
          <LabelBarLabel class={['knob', 'center-knob']}>
            {this.centerKnobLabel}
          </LabelBarLabel>
        }
        <div class="divider bottom-right-divider" />
        <LabelBarLabel class={['knob', 'map-knob']}>
          {this.props.gtcService.orientation === 'vertical' &&
            <div ref={this.selectedPaneDisplayRef} class="selected-pane-display">
              <img class="selected-pane-icon" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/vertical_pane_selector_transparent.png`} />
              <div class="selected-pane-label">Pane</div>
              <div ref={this.selectedPaneIconColorRef} class="selected-pane-icon-color" />
            </div>
          }
          {this.mapKnobLabel.map(x => x.replace(GtcSidebar.hidePanesString, ''))}
        </LabelBarLabel>
      </div>
    );
  }
}

/** The properties for the LabelBar component. */
interface LabelBarLabelProps extends ComponentProps {
  /** Whether the button is or not. Defaults to `true`. */
  readonly isVisible?: Subscribable<boolean>;
  /** Extra classes. */
  readonly class: readonly string[];
  /** Whether this label is active or not, only applies to the soft key labels. */
  readonly isActive?: Subscribable<boolean>;
}

/** The LabelBarLabel component. */
export class LabelBarLabel extends DisplayComponent<LabelBarLabelProps> {
  public readonly classes = SetSubject.create(['label-bar-label', ...this.props.class]);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.isVisible && this.props.isVisible.sub(isVisible => {
      if (isVisible) {
        this.classes.delete('hidden');
      } else {
        this.classes.add('hidden');
      }
    }, true);
    this.props.isActive && this.props.isActive.sub(isActive => {
      if (isActive) {
        this.classes.add('soft-key-active');
      } else {
        this.classes.delete('soft-key-active');
      }
    }, true);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.classes}>
        {this.props.children}
      </div>
    );
  }
}
