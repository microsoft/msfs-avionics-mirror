import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { MinimumsDisplay } from './MinimumsDisplay';
import { NextradInfo } from './NextradInfo';
import { TerrWxInfo } from './TerrWxInfo';
import { TfcInfo } from './TfcInfo';
import { WT21DisplayUnitFsInstrument, WT21DisplayUnitType } from '../../WT21DisplayUnitFsInstrument';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';
import { FormatSwitch } from './FormatSwitch';

import './RightInfoPanel.css';

/** @inheritdoc */
interface RightInfoPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The display unit */
  displayUnit: WT21DisplayUnitFsInstrument;

  /** The TCAS instance. */
  tcas: WT21TCAS;
}

/** The RightInfoPanel component. */
export class RightInfoPanel extends DisplayComponent<RightInfoPanelProps> {
  private readonly isUsingSoftkeys = this.props.displayUnit.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

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
              displayUnit={this.props.displayUnit}
              format="lower"
              orientation="right"
            />
            <TerrWxInfo
              bus={this.props.bus}
              displayUnit={this.props.displayUnit}
            />
            <TfcInfo
              bus={this.props.bus}
              displayUnit={this.props.displayUnit}
              tcas={this.props.tcas}
              pfdOrMfd={this.props.displayUnit.displayUnitType === WT21DisplayUnitType.Pfd ? 'PFD' : 'MFD'}
            />
          </>
        ) : (
          <>
            <TfcInfo
              bus={this.props.bus}
              displayUnit={this.props.displayUnit}
              tcas={this.props.tcas}
              pfdOrMfd={this.props.displayUnit.displayUnitType === WT21DisplayUnitType.Pfd ? 'PFD' : 'MFD'}
            />
            <TerrWxInfo
              bus={this.props.bus}
              displayUnit={this.props.displayUnit}
            />
          </>
        )}
        {this.props.displayUnit.displayUnitType === WT21DisplayUnitType.Mfd ? <NextradInfo bus={this.props.bus} /> : null}
        {this.props.displayUnit.displayUnitType === WT21DisplayUnitType.Pfd ? <MinimumsDisplay bus={this.props.bus} /> : null}
      </div>
    );
  }
}