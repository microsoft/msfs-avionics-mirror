import { registerPlugin } from '@microsoft/msfs-sdk';

import { G1000AvionicsPlugin } from '@microsoft/msfs-wtg1000';

// import { Sr22tAPLateralModes, Sr22tAPVerticalModes } from '../../Shared/Autopilot/Sr22tAutopilotModes';
import { Sr22tCapsCrewAlerts } from '../../Shared/Caps/Sr22tCapsCrewAlerts';
// import { Sr22tAPCapsPitchDirector } from './Sr22tAPCapsPitchDirector';
import { Sr22tCapsPlaneDirectors, Sr22tCapsSystem } from './Sr22tCapsSystem';

/**
 * An MFD plugin that configures CAPS for the Cirrus Sr22t.
 */
export class Sr22tCapsMfdPlugin extends G1000AvionicsPlugin {

  private readonly apDirectors: Sr22tCapsPlaneDirectors = {};

  private readonly capsSystem = new Sr22tCapsSystem(this.binder.bus, this.apDirectors);
  private readonly capsCrewAlerts = new Sr22tCapsCrewAlerts(this.binder.bus);

  /** @inheritDoc */
  public onInstalled(): void {
    this.capsSystem.init();
  }

  /** @inheritDoc */
  // public getAutopilotOptions(): G1000AutopilotPluginOptions {
  //   return {
  //     createAdditionalLateralDirectors: () => {
  //       return [{
  //         mode: Sr22tAPLateralModes.CAPS,
  //         directorFactory: (apValues: APValues) => this.apDirectors.lateral = new APLvlDirector(apValues, { omitWingLeveler: true })
  //       }];
  //     },

  //     createAdditionalVerticalDirectors: () => {
  //       return [{
  //         mode: Sr22tAPVerticalModes.CAPS,
  //         directorFactory: (apValues: APValues) => this.apDirectors.vertical = new Sr22tAPCapsPitchDirector(apValues)
  //       }];
  //     }
  //   };
  // }
}

registerPlugin(Sr22tCapsMfdPlugin);
