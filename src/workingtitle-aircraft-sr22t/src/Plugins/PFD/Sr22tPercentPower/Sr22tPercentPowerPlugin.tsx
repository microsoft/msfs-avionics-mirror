import { AvionicsPlugin, DisplayComponent, DisplayComponentFactory, EISPublisher, FSComponent, registerPlugin } from '@microsoft/msfs-sdk';
import { G1000PfdAvionicsPlugin, G1000PfdPluginBinder } from '@microsoft/msfs-wtg1000';
import { Sr22tFilePaths } from '../../Shared';
import { Sr22tPercentPowerDisplay } from './Sr22tPercentPowerDisplay';

/**
 * A plugin that replaces the `'NAV' NavComRadio component on the top-left
 * of the G1000's PFD screen with the Engine Percent Power readout.
 */
export class Sr22tPercentPowerPlugin extends AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {
  private readonly eisPublisher = new EISPublisher(this.binder.bus);

  /** @inheritdoc */
  public onInstalled(): void {
    this.loadCss(`${Sr22tFilePaths.PLUGINS_PATH}/SR22TPfdPlugins.css`);
    this.binder.backplane.addPublisher('Sr22tEIS', this.eisPublisher);
  }

  public onComponentCreating = (constructor: DisplayComponentFactory<any>, props: any): DisplayComponent<any> | undefined => {
    if (constructor.name === 'NavComRadio' && props.title === 'NAV' && props.position === 'left') {
      return new Sr22tPercentPowerDisplay({ bus: props.bus });
    }

    return undefined;
  };
}

registerPlugin(Sr22tPercentPowerPlugin);
