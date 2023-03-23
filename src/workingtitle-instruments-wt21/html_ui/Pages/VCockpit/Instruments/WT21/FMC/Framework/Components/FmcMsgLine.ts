import { Subject } from '@microsoft/msfs-sdk';

import { FmcRenderer } from '../FmcRenderer';

/**
 * A class providing the rendering for the FMC message line and EXEC indication.
 */
export class FmcMsgLine {
  public readonly msg = Subject.create('');

  /**
   * Ctor
   * @param planInModRef A binding to the fms's planInMod subject.
   * @param fmcRenderer The FMC renderer.
   */
  constructor(private readonly planInModRef: Subject<boolean>, private readonly fmcRenderer: FmcRenderer) {
    this.planInModRef.sub(() => { this.render(); });
    this.msg.sub(() => { this.render(); });
  }

  /**
   * Forces a re-render of the msg line.
   */
  public readonly render = (): void => {
    this.fmcRenderer.editOutputTemplate([
      [this.msg.get(), this.planInModRef.get() ? 'EXEC[blackwhite]' : ''],
    ], 14);
  };
}