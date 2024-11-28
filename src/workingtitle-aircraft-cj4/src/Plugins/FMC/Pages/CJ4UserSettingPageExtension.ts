import { AbstractFmcPageExtension, FmcRenderTemplate, SwitchLabel } from '@microsoft/msfs-sdk';

import { UserSettingsPage } from '@microsoft/msfs-wt21-fmc';

import { CJ4UserSettings } from '../../Shared/CJ4UserSettings';

/**
 * CJ4 page extension for the USER SETTINGS page
 */
export class CJ4UserSettingPageExtension extends AbstractFmcPageExtension<UserSettingsPage> {
  private readonly planeUserSettings = CJ4UserSettings.getManager(this.page.bus);

  // For AUTO cabin lights, we could have them go to dim/off when thrust levers beyond 70% and airspeed above 40kts
  private readonly cabinLightsModeSwitch = new SwitchLabel(this.page, {
    optionStrings: ['OFF', 'ON', 'DIM'],
    activeStyle: 'green',
  }).bind(this.planeUserSettings.getSetting('cabinLightsMode'));

  /** @inheritDoc */
  public onPageRendered(renderedTemplates: FmcRenderTemplate[]): void {
    renderedTemplates[0][5] = [' CABIN LIGHTS[blue]'];
    renderedTemplates[0][6] = [this.cabinLightsModeSwitch];
  }
}
