import {
  EventBus, FSComponent, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { PerformanceWeightLimits } from '../../Performance/PerformanceWeightLimits';
import { WeightBalanceConfig } from '../../Performance/WeightBalance/WeightBalanceConfig';
import { WeightBalancePaneViewUserSettings } from '../../Settings/WeightBalancePaneViewUserSettings';
import { WeightBalanceUserSettingManager } from '../../Settings/WeightBalanceUserSettings';
import { WeightFuelUserSettings } from '../../Settings/WeightFuelUserSettings';
import { DisplayPaneSizeMode } from '../DisplayPanes/DisplayPaneTypes';
import { DisplayPaneView, DisplayPaneViewProps } from '../DisplayPanes/DisplayPaneView';
import { WeightBalancePaneViewEstimatedWeight } from './WeightBalancePaneViewEstimatedWeight';
import { WeightBalancePaneViewGraph } from './WeightBalancePaneViewGraph';
import { WeightBalancePaneViewModule } from './WeightBalancePaneViewModule';
import { WeightBalancePaneViewPanel } from './WeightBalancePaneViewPanel';
import { WeightBalancePaneViewStateEvents } from './WeightBalancePaneViewStateEvents';
import { WeightBalancePaneViewMode } from './WeightBalancePaneViewTypes';
import { WeightBalancePaneViewWeightBalance } from './WeightBalancePaneViewWeightBalance';

import './WeightBalancePaneView.css';

/**
 * Component props for {@link WeightBalancePaneView}.
 */
export interface WeightBalancePaneViewProps extends DisplayPaneViewProps {
  /** The event bus. */
  bus: EventBus;

  /** Aircraft weight limits and capacities. */
  weightLimits: PerformanceWeightLimits;

  /** A weight and balance configuration object. */
  weightBalanceConfig: WeightBalanceConfig;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager: WeightBalanceUserSettingManager;

  /** A module for customizing the pane view. */
  module?: WeightBalancePaneViewModule;
}

/**
 * A display pane view which displays weight and balance information.
 */
export class WeightBalancePaneView extends DisplayPaneView<WeightBalancePaneViewProps> {
  private static readonly TITLE_TEXT: Record<WeightBalancePaneViewMode, string> = {
    [WeightBalancePaneViewMode.Full]: 'Weight and Balance',
    [WeightBalancePaneViewMode.Summary]: 'Weight and Balance – Summary',
    [WeightBalancePaneViewMode.Loading]: 'Weight and Balance – Loading',
    [WeightBalancePaneViewMode.Graph]: 'Weight and Balance – Graph'
  };

  private readonly publisher = this.props.bus.getPublisher<WeightBalancePaneViewStateEvents>();

  private readonly weightBalanceRef = FSComponent.createRef<WeightBalancePaneViewPanel>();
  private readonly estimatedWeightRef = FSComponent.createRef<WeightBalancePaneViewPanel>();
  private readonly summaryHidden = Subject.create(true);

  private readonly loadRef = FSComponent.createRef<WeightBalancePaneViewPanel>();
  private readonly loadHidden = Subject.create(true);

  private readonly graphRef = FSComponent.createRef<WeightBalancePaneViewPanel>();
  private readonly graphHidden = Subject.create(true);
  private readonly graphTitle = this.props.weightBalanceSettingManager.activeEnvelopeDef.map(def => {
    return def.useMac ? 'Percent MAC' : this.props.weightBalanceConfig.armLabel;
  }).pause();

  private size = DisplayPaneSizeMode.Hidden;
  private readonly halfModeSetting = WeightBalancePaneViewUserSettings.getDisplayPaneManager(this.props.bus, this.props.index)
    .getSetting('weightBalancePaneHalfMode');

  private mode: WeightBalancePaneViewMode | null = null;
  private readonly activePanels: WeightBalancePaneViewPanel[] = [];
  private readonly activePanelsHidden: Subject<boolean>[] = [];

  private needUpdateMode = false;

  private halfModeSettingSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.publisher.pub(`weight_balance_pane_is_half_size_${this.props.index}`, false, true, true);

    this.halfModeSettingSub = this.halfModeSetting.sub(this.onHalfModeSettingChanged.bind(this), false, true);
  }

  /** @inheritDoc */
  public onResume(size: DisplayPaneSizeMode): void {
    this.size = size;
    this.publisher.pub(`weight_balance_pane_is_half_size_${this.props.index}`, size === DisplayPaneSizeMode.Half, true, true);

    this.needUpdateMode = true;

    this.graphTitle.resume();
    this.halfModeSettingSub!.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.graphTitle.pause();
    this.halfModeSettingSub!.pause();
    this.changeMode(null);
    this.publisher.pub(`weight_balance_pane_is_half_size_${this.props.index}`, false, true, true);
  }

  /** @inheritDoc */
  public onResize(size: DisplayPaneSizeMode): void {
    this.size = size;
    this.publisher.pub(`weight_balance_pane_is_half_size_${this.props.index}`, size === DisplayPaneSizeMode.Half, true, true);
    this.needUpdateMode = true;
    this.changeMode(null);
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    if (this.needUpdateMode) {
      this.needUpdateMode = false;
      this.updateFromSizeMode(this.size);
    }

    for (let i = 0; i < this.activePanels.length; i++) {
      this.activePanels[i].onUpdate(time);
    }
  }

  /**
   * Updates this pane from a size mode.
   * @param size The pane size mode from which to update.
   */
  private updateFromSizeMode(size: DisplayPaneSizeMode): void {
    if (size === DisplayPaneSizeMode.Full) {
      this.changeMode(WeightBalancePaneViewMode.Full);
    } else if (size === DisplayPaneSizeMode.Half) {
      this.changeMode(this.halfModeSetting.value);
    }
  }

  /**
   * Changes this pane's display mode.
   * @param mode The display mode to which to change, or `null` to inhibit all display modes.
   */
  private changeMode(mode: WeightBalancePaneViewMode | null): void {
    if (mode === this.mode) {
      return;
    }

    this.mode = mode;

    if (mode !== null) {
      this._title.set(WeightBalancePaneView.TITLE_TEXT[mode]);
    }

    for (const child of this.activePanels) {
      child.onPause();
    }
    this.activePanels.length = 0;

    for (const hidden of this.activePanelsHidden) {
      hidden.set(true);
    }
    this.activePanelsHidden.length = 0;

    switch (mode) {
      case WeightBalancePaneViewMode.Full: {
        this.activePanels.push(this.weightBalanceRef.instance, this.estimatedWeightRef.instance, this.graphRef.instance);
        const loadInstance = this.loadRef.getOrDefault();
        if (loadInstance) {
          this.activePanels.push(loadInstance);
        }
        this.activePanelsHidden.push(this.summaryHidden, this.loadHidden, this.graphHidden);
        break;
      }
      case WeightBalancePaneViewMode.Summary:
        this.activePanels.push(this.weightBalanceRef.instance, this.estimatedWeightRef.instance);
        this.activePanelsHidden.push(this.summaryHidden);
        break;
      case WeightBalancePaneViewMode.Loading: {
        const instance = this.loadRef.getOrDefault();
        if (instance) {
          this.activePanels.push(instance);
        }
        this.activePanelsHidden.push(this.loadHidden);
        break;
      }
      case WeightBalancePaneViewMode.Graph:
        this.activePanels.push(this.graphRef.instance);
        this.activePanelsHidden.push(this.graphHidden);
        break;
    }

    for (const hidden of this.activePanelsHidden) {
      hidden.set(false);
    }
    for (const child of this.activePanels) {
      child.onResume(mode === WeightBalancePaneViewMode.Full);
    }
  }

  /**
   * Responds to when the selected half-size display mode changes.
   */
  private onHalfModeSettingChanged(): void {
    if (this.size === DisplayPaneSizeMode.Half) {
      this.needUpdateMode = true;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='weight-balance-pane'>

        <div
          class={{
            'pane-inset-panel': true,
            'weight-balance-pane-child-panel': true,
            'weight-balance-pane-graph-panel': true,
            'hidden': this.graphHidden
          }}
        >
          <div class='weight-balance-pane-child-container'>
            <WeightBalancePaneViewGraph
              ref={this.graphRef}
              bus={this.props.bus}
              weightBalanceConfig={this.props.weightBalanceConfig}
              weightFuelSettingManager={WeightFuelUserSettings.getManager(this.props.bus)}
              weightBalanceSettingManager={this.props.weightBalanceSettingManager}
              unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
            />
          </div>
          <div class='pane-inset-panel-title'>{this.graphTitle} vs Weight</div>
        </div>

        <div
          class={{
            'pane-inset-panel': true,
            'weight-balance-pane-child-panel': true,
            'weight-balance-pane-summary-panel': true,
            'weight-balance-pane-weight-balance-panel': true,
            'hidden': this.summaryHidden
          }}
        >
          <div class='weight-balance-pane-child-container'>
            <WeightBalancePaneViewWeightBalance
              ref={this.weightBalanceRef}
              bus={this.props.bus}
              weightBalanceConfig={this.props.weightBalanceConfig}
              weightFuelSettingManager={WeightFuelUserSettings.getManager(this.props.bus)}
              weightBalanceSettingManager={this.props.weightBalanceSettingManager}
              unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
            />
          </div>
          <div class='pane-inset-panel-title'>Aircraft Weight and Balance</div>
        </div>

        <div
          class={{
            'pane-inset-panel': true,
            'weight-balance-pane-child-panel': true,
            'weight-balance-pane-summary-panel': true,
            'weight-balance-pane-est-weight-panel': true,
            'hidden': this.summaryHidden
          }}
        >
          <div class='weight-balance-pane-child-container'>
            <WeightBalancePaneViewEstimatedWeight
              ref={this.estimatedWeightRef}
              bus={this.props.bus}
              weightBalanceConfig={this.props.weightBalanceConfig}
              weightFuelSettingManager={WeightFuelUserSettings.getManager(this.props.bus)}
              weightBalanceSettingManager={this.props.weightBalanceSettingManager}
              unitsSettingManager={UnitsUserSettings.getManager(this.props.bus)}
            />
          </div>
          <div class='pane-inset-panel-title'>Estimated Weight</div>
        </div>

        <div
          class={{
            'pane-inset-panel': true,
            'weight-balance-pane-child-panel': true,
            'weight-balance-pane-load-panel': true,
            'hidden': this.loadHidden
          }}
        >
          <div class='weight-balance-pane-child-container'>
            {
              this.props.module
                ? this.props.module.renderAircraftLoadPanel(
                  this.loadRef,
                  this.props.bus,
                  this.props.weightBalanceConfig,
                  this.props.weightBalanceSettingManager,
                  UnitsUserSettings.getManager(this.props.bus)
                )
                : null
            }
          </div>
          <div class='pane-inset-panel-title'>Aircraft Load</div>
        </div>

      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.weightBalanceRef.getOrDefault()?.destroy();
    this.estimatedWeightRef.getOrDefault()?.destroy();
    this.loadRef.getOrDefault()?.destroy();
    this.graphRef.getOrDefault()?.destroy();

    this.graphTitle.destroy();

    this.halfModeSettingSub?.destroy();

    super.destroy();
  }
}
