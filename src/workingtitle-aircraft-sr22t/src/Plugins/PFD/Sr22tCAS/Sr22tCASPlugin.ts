import { AvionicsPlugin, registerPlugin } from '@microsoft/msfs-sdk';

import { G1000PfdAvionicsPlugin, G1000PfdPluginBinder } from '@microsoft/msfs-wtg1000';
import { Sr22tCAS } from './Sr22tCAS';
import { Sr22tSimvarPublisher } from '../../MFD/Sr22tSimvarPublisher/Sr22tSimvarPublisher';

/** A plugin which contains SR22T CAS logic. */
export class Sr22tCASPlugin extends AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {

  private readonly cas = new Sr22tCAS(this.binder.bus);

  /** @inheritDoc */
  public onInstalled(): void {
    this.binder.backplane.addPublisher('SR22T', new Sr22tSimvarPublisher(this.binder.bus));
  }
}

registerPlugin(Sr22tCASPlugin);
