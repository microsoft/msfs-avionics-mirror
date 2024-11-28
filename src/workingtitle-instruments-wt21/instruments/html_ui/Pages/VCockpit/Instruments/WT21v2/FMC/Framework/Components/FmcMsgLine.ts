import { FmcScreen, Subject, Subscribable } from '@microsoft/msfs-sdk';

/**
 * A class providing the rendering for the FMC message line and EXEC indication.
 */
export class FmcMsgLine {
  public readonly msg = Subject.create('');

  /**
   * Ctor
   * @param fmcScreen the fmc screen
   * @param planInModRef A binding to the fms's planInMod subject.
   */
  constructor(
    private readonly fmcScreen: FmcScreen<any, any>,
    private readonly planInModRef: Subscribable<boolean>,
  ) {
    this.planInModRef.sub(() => { this.render(); });
    this.msg.sub(() => { this.render(); });
  }

  /**
   * Forces a re-render of the msg line.
   */
  public readonly render = (): void => {
    const render = [this.msg.get(), this.planInModRef.get() ? 'EXEC[blackwhite]' : ''];

    this.fmcScreen.editOutputTemplate(14, [render]);
  };
}
