import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableSet, VNode } from '@microsoft/msfs-sdk';

import { NextGenTawsAnnunciationDefs, TerrainSystemAnnunciation, TerrainSystemOperatingMode } from '@microsoft/msfs-garminsdk';

import { TerrainSystemConfig } from '@microsoft/msfs-wtg3000-common';

import './G3000PfdTerrainSystemAnnunciation.css';

/**
 *
 */
export interface G3000PfdTerrainSystemAnnunciationProps extends ComponentProps {
  /** A terrain system config object. */
  config: TerrainSystemConfig;

  /** The terrain system's operating mode. */
  operatingMode: Subscribable<TerrainSystemOperatingMode>;

  /** The terrain system's active status flags. */
  statusFlags: SubscribableSet<string>;

  /** The terrain system's active inhibit flags. */
  inhibitFlags: SubscribableSet<string>;

  /** The terrain system's prioritized active alert. */
  prioritizedAlert: Subscribable<string | null>;
}

/**
 *
 */
export class G3000PfdTerrainSystemAnnunciation extends DisplayComponent<G3000PfdTerrainSystemAnnunciationProps> {
  /** @inheritDoc */
  public render(): VNode {
    const options = this.props.config.pfdAnnuncOptions;

    return (
      <TerrainSystemAnnunciation
        show={true}
        operatingMode={this.props.operatingMode}
        statusFlags={this.props.statusFlags}
        inhibitFlags={this.props.inhibitFlags}
        prioritizedAlert={this.props.prioritizedAlert}
        testModeDef={options.omitTestAnnunc ? undefined : NextGenTawsAnnunciationDefs.testMode()}
        statusDefs={options.omitStatusAnnunc ? undefined : NextGenTawsAnnunciationDefs.status()}
        inhibitDefs={options.omitInhibitAnnunc ? undefined : NextGenTawsAnnunciationDefs.inhibit()}
        alertDefs={NextGenTawsAnnunciationDefs.alert()}
        class='pfd-terrain-annunc'
      />
    );
  }
}