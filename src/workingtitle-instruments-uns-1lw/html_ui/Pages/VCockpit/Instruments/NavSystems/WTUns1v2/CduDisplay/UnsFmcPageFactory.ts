import { EventBus, FmcPageFactory, FmcRenderCallback } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from './UnsFmcPage';
import { UnsFmcScreen } from './UnsFmcScreen';
import { UnsFms } from '../Fms';
import { UnsFmsConfigInterface } from '../Config/FmsConfigBuilder';

/**
 * @inheritDoc
 */
export class UnsFmcPageFactory extends FmcPageFactory<UnsFmcPage> {
  /**
   * Ctor
   *
   * @param fms the fms
   * @param fmsConfig the fms config
   * @param fmsConfigErrors A map with config name keys and boolean values indicating whether a parsing error was encountered.
   */
  constructor(
    private readonly fms: UnsFms,
    private readonly fmsConfig: UnsFmsConfigInterface,
    private readonly fmsConfigErrors: ReadonlyMap<string, boolean>,
  ) {
    super();
  }

  /** @inheritDoc */
  public createPage(
    pageCtor: typeof UnsFmcPage,
    bus: EventBus,
    screen: UnsFmcScreen,
    props: unknown,
    renderCallback: FmcRenderCallback
  ): UnsFmcPage {
    return new pageCtor(
      bus,
      screen,
      this.fms,
      this.fmsConfig,
      this.fmsConfigErrors,
      renderCallback
    );
  }
}
