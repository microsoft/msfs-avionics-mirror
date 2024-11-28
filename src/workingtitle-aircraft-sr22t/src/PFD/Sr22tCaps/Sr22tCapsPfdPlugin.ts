import { registerPlugin } from '@microsoft/msfs-sdk';

import { G1000PfdAvionicsPlugin } from '@microsoft/msfs-wtg1000';

// import { Sr22tAPLateralModes, Sr22tAPVerticalModes } from '../../Shared/Autopilot/Sr22tAutopilotModes';

/**
 * A PFD plugin that configures CAPS for the Cirrus SR22T.
 */
export class Sr22tCapsPfdPlugin extends G1000PfdAvionicsPlugin {
  /** Placeholder */
  public onInstalled(): void {
  }

  /** @inheritDoc */
  // public getAfcsStatusBoxOptions(): AfcsStatusBoxPluginOptions {
  //   return {
  //     getAdditionalLateralModeLabels: () => {
  //       return [{
  //         mode: Sr22tAPLateralModes.CAPS,
  //         activeLabel: 'CAPS',
  //         armedLabel: 'CAPS'
  //       }];
  //     },

  //     getAdditionalVerticalModeLabels: () => {
  //       return [{
  //         mode: Sr22tAPVerticalModes.CAPS,
  //         activeLabel: 'CAPS',
  //         armedLabel: 'CAPS'
  //       }];
  //     }
  //   };
  // }
}

registerPlugin(Sr22tCapsPfdPlugin);
