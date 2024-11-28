import { ComponentProps, DisplayComponent, EventBus, FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { InstrumentConfig, WT21InstrumentType } from '../../Config';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';
import { MapSettingsMfdAliased, MapUserSettings } from '../../Map';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { FormatSwitch } from './FormatSwitch';
import { MinimumsDisplay } from './MinimumsDisplay';
import { NextradInfo } from './NextradInfo';
import { TerrWxInfo } from './TerrWxInfo';
import { TfcInfo } from './TfcInfo';

import './RightInfoPanel.css';

/** @inheritdoc */
interface RightInfoPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The instrument config object */
  instrumentConfig: InstrumentConfig;

  /** The TCAS instance. */
  tcas: WT21TCAS;
}

/** The RightInfoPanel component. */
export class RightInfoPanel extends DisplayComponent<RightInfoPanelProps> {
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.props.bus, this.props.instrumentConfig.instrumentType, this.props.instrumentConfig.instrumentIndex);
  private readonly isUsingSoftkeys = this.props.instrumentConfig.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'right-info-panel': true,
        'right-info-panel-side-buttons': this.isUsingSoftkeys,
      }}>
        {this.isUsingSoftkeys ? (
          <>
            <FormatSwitch
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              format="lower"
              orientation="right"
            />
            <TerrWxInfo
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              mapSettingsManager={this.mapSettingsManager}
            />
            <TfcInfo
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              tcas={this.props.tcas}
              mapSettingsManager={this.mapSettingsManager}
            />
          </>
        ) : (
          <>
            <TfcInfo
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              tcas={this.props.tcas}
              mapSettingsManager={this.mapSettingsManager}
            />
            <TerrWxInfo
              bus={this.props.bus}
              instrumentConfig={this.props.instrumentConfig}
              mapSettingsManager={this.mapSettingsManager}
            />
          </>
        )}
        {
          this.props.instrumentConfig.instrumentType === WT21InstrumentType.Mfd ?
            <NextradInfo bus={this.props.bus} mapSettingsManager={this.mapSettingsManager as UserSettingManager<MapSettingsMfdAliased>} />
            : null
        }
        {this.props.instrumentConfig.instrumentType === WT21InstrumentType.Pfd ? <MinimumsDisplay bus={this.props.bus} /> : null}
      </div>
    );
  }
}
