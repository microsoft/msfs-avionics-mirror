import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { TerrainSystemControlEvents, TerrainSystemOperatingMode, TerrainSystemStateDataProvider } from '@microsoft/msfs-garminsdk';

import { TerrainSystemConfig, TerrainSystemSettingsPageInhibitDef } from '@microsoft/msfs-wtg3000-common';

import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcToggleTouchButton } from '../TouchButton/GtcToggleTouchButton';

import './TerrainSettingsDisplay.css';

/**
 * Component props for {@link TerrainSettingsDisplay}.
 */
export interface TerrainSettingsDisplayProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** A terrain system config object. */
  terrainConfig: TerrainSystemConfig;

  /** A provider of terrain system state data. */
  terrainSystemStateDataProvider: TerrainSystemStateDataProvider;
}

/**
 * A component displaying buttons for controlling terrain settings.
 */
export class TerrainSettingsDisplay extends DisplayComponent<TerrainSettingsDisplayProps> {
  private thisNode?: VNode;

  private readonly publisher = this.props.gtcService.bus.getPublisher<TerrainSystemControlEvents>();

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Responds to when an inhibit button is pressed.
   * @param def The definition for the inhibit toggle controlled by the button that was pressed.
   * @param button The button that was pressed.
   * @param state Whether the button's inhibit flag is active.
   */
  private onInhibitButtonPressed(def: Readonly<TerrainSystemSettingsPageInhibitDef>, button: ToggleTouchButton<any>, state: Subscribable<boolean>): void {
    const topic = state.get() ? 'terrainsys_remove_inhibit' : 'terrainsys_add_inhibit';
    for (const inhibitFlag of def.inhibitFlags) {
      if (inhibitFlag.onlyToggleWhenTriggered) {
        let canToggle = false;
        for (const alert of inhibitFlag.alerts) {
          if (this.props.terrainSystemStateDataProvider.triggeredAlerts.has(alert)) {
            canToggle = true;
            break;
          }
        }

        if (!canToggle) {
          continue;
        }
      }

      this.publisher.pub(topic, inhibitFlag.flag, true, false);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='terrain-settings-display'>
        {this.renderInhibitButtons()}
      </div>
    );
  }

  /**
   * Renders this page's inhibit buttons.
   * @returns This page's inhibit buttons, as an array of VNodes.
   */
  private renderInhibitButtons(): VNode[] {
    const rowLength = this.props.gtcService.orientation === 'horizontal' ? 3 : 2;

    return this.props.terrainConfig.settingsPageInhibitDefs.slice(0, 6).map((def): VNode => {
      const isInhibited = this.props.terrainSystemStateDataProvider.inhibitFlags.map(flags => {
        for (let i = 0; i < def.inhibitFlags.length; i++) {
          if (flags.has(def.inhibitFlags[i].flag)) {
            return true;
          }
        }
        return false;
      });

      const isEnabled = MappedSubject.create(
        ([mode, alerts]) => {
          if (mode === TerrainSystemOperatingMode.Operating) {
            for (let i = 0; i < def.inhibitFlags.length; i++) {
              const inhibitFlag = def.inhibitFlags[i];
              if (!inhibitFlag.onlyToggleWhenTriggered) {
                return true;
              } else {
                for (let j = 0; j < inhibitFlag.alerts.length; j++) {
                  if (alerts.has(inhibitFlag.alerts[j])) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        },
        this.props.terrainSystemStateDataProvider.operatingMode,
        this.props.terrainSystemStateDataProvider.triggeredAlerts
      );

      this.subscriptions.push(isInhibited);
      this.subscriptions.push(isEnabled);

      return (
        <GtcToggleTouchButton
          state={isInhibited}
          label={def.labelText}
          isEnabled={isEnabled}
          onPressed={this.onInhibitButtonPressed.bind(this, def)}
          class='terrain-settings-display-button'
        />
      );
    }).reduce((nodes, button, index, buttons): VNode[] => {
      // Group buttons into rows.
      if (index % rowLength === rowLength - 1 || index === buttons.length - 1) {
        nodes.push(
          <div class='terrain-settings-display-row'>
            {...buttons.slice(Math.floor(index / rowLength) * rowLength, index + 1)}
          </div>
        );
      }

      return nodes;
    }, [] as VNode[]);
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
