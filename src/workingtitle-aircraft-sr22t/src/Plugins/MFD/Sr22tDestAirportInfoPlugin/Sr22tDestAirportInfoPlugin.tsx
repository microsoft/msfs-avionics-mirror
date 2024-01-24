import { DisplayComponent, DisplayComponentFactory, registerPlugin } from '@microsoft/msfs-sdk';
import { G1000AvionicsPlugin, G1000MfdPluginBinder } from '@microsoft/msfs-wtg1000';
import { Sr22tDestAirportInfoDisplay } from './Sr22tDestAirportInfoDisplay';

/**
 * A plugin that replaces the `'COM' NavComRadio` component on the top-right
 * of the G1000's MFD screen with the Destination Airport Information.
 */
export class Sr22tDestAirportInfoPlugin extends G1000AvionicsPlugin<G1000MfdPluginBinder> {
  /** @inheritdoc */
  public onInstalled(): void {
    // inop
  }

  public onComponentCreating = (constructor: DisplayComponentFactory<any>, props: any): DisplayComponent<any> | undefined => {
    if (constructor.name === 'NavComRadio' && props.title === 'COM' && props.position === 'right') {
      return new Sr22tDestAirportInfoDisplay({ bus: this.binder.bus, fms: this.binder.fms, updateFreq: 1 });
    }

    return undefined;
  };
}

registerPlugin(Sr22tDestAirportInfoPlugin);
