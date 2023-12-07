import { ArrayUtils, ComponentProps, DisplayComponent, FSComponent, SimVarValueType, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { AirspeedIndicator, AirspeedIndicatorDataProvider, VSpeedBugDefinition } from '@microsoft/msfs-garminsdk';

import { AirspeedIndicatorConfig } from '../../../../Shared/Profiles/AirspeedIndicator/AirspeedIndicatorConfig';
import { VSpeedUserSettingManager } from '../../../../Shared/VSpeed/VSpeedUserSettings';

import './G1000AirspeedIndicator.css';

/**
 * Component props for {@link G1000AirspeedIndicator}.
 */
export interface G1000AirspeedIndicatorProps extends ComponentProps {
  /** A provider of airspeed indicator data. */
  dataProvider: AirspeedIndicatorDataProvider;

  /** A configuration object defining options for the airspeed indicator. */
  config: AirspeedIndicatorConfig;

  /** A manager for reference V-speed settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 airspeed indicator.
 */
export class G1000AirspeedIndicator extends DisplayComponent<G1000AirspeedIndicatorProps> {
  private readonly ref = FSComponent.createRef<AirspeedIndicator>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.dataProvider.overspeedThreshold.sub(v => {
      SimVar.SetGameVarValue('AIRCRAFT_MAXSPEED_OVERRIDE', SimVarValueType.Knots, v - 3);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    const vSpeedDefs = ArrayUtils.flatMap(Array.from(this.props.vSpeedSettingManager.vSpeedGroups.values()), group => group.vSpeedDefinitions);
    const vSpeedBugDefinitions = this.props.config.vSpeedBugConfigs
      .map(config => config.resolve()(vSpeedDefs))
      .filter(def => def !== undefined) as VSpeedBugDefinition[];

    return (
      <AirspeedIndicator
        ref={this.ref}
        dataProvider={this.props.dataProvider}
        declutter={this.props.declutter}
        tapeScaleOptions={this.props.config.tapeScaleOptions}
        colorRanges={this.props.config.colorRangeDefinitions}
        bottomDisplayOptions={this.props.config.bottomDisplayOptions}
        trendVectorOptions={{ trendThreshold: 1 }}
        airspeedAlertOptions={{
          supportOverspeed: true,
          supportTrendOverspeed: true,
          supportUnderspeed: true,
          supportTrendUnderspeed: true
        }}
        vSpeedBugOptions={{
          vSpeedSettingManager: this.props.vSpeedSettingManager,
          vSpeedBugDefinitions,
          allowZeroValue: true
        }}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }
}