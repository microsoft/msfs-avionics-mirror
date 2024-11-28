import { AvionicsPlugin, DisplayComponentFactory, DisplayComponent, registerPlugin, FSComponent, ControlPublisher } from '@microsoft/msfs-sdk';
import { G1000PfdPluginBinder, G1000PfdAvionicsPlugin } from '@microsoft/msfs-wtg1000';
import { Sr22tFilePaths } from '../../Shared';
import { Sr22tNearestAirportFrequenciesGroup } from './Sr22tNearestAirportFrequenciesGroup';
import { Sr22tLoadFrequencyPopup } from './Sr22tLoadFrequency';

/**
 * A plugin that replaces the `'NAV' NavComRadio component on the top-left
 * of the G1000's PFD screen with the Engine Percent Power readout.
 */
export class Sr22tNearestAirportFrequenciesPlugin extends AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {
  private controlPublisher?: ControlPublisher;

  /** @inheritdoc */
  public onInstalled(): void {
    this.loadCss(`${Sr22tFilePaths.PLUGINS_PATH}/SR22TMfdPlugins.css`);
  }

  /** @inheritDoc */
  public onViewServiceInitialized(): void {
    this.binder.viewService.registerView('Sr22tLoadFrequencyPopup', () => {
      return (
        <Sr22tLoadFrequencyPopup
          viewService={this.binder.viewService}
          title={'Load Frequency'}
          showTitle={false}
        />
      );
    });
  }

  public onComponentCreating = (constructor: DisplayComponentFactory<any>, props: any): DisplayComponent<any> | undefined => {
    if (constructor.name === 'NearestAirportFrequenciesGroup') {

      return new Sr22tNearestAirportFrequenciesGroup({
        ref: props.ref,
        controlPublisher: props.controlPublisher,
        viewService: this.binder.viewService,
        isolateScroll: props.isolateScroll,
      });
    }

    return undefined;
  };
}


registerPlugin(Sr22tNearestAirportFrequenciesPlugin);
