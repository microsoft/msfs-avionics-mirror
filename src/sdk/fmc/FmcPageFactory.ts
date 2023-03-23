/**
 * A generic FMC page class. Only meant to be extended from in specific implementations
 */
import { AbstractFmcPage, FmcRenderCallback } from './AbstractFmcPage';
import { EventBus } from '../data';
import { FmcScreen } from './FmcScreen';

/**
 * FMC Page factory, used to instantiate pages.
 *
 * FMC Pages should be instantiated with the required data and objects (FMS instances, avionics-specific utilities, event busses)
 * in instances of subclasses of this type.
 */
export abstract class FmcPageFactory<T extends AbstractFmcPage> {
  /**
   * Creates a page of the specified subtype of {@link AbstractFmcPage}
   *
   * @param pageCtor the page constructor
   * @param bus the event bus
   * @param screen the FMC screen instance
   * @param renderCallback the render callback to give to the page
   */
  abstract createPage(pageCtor: new(...args: any[]) => T, bus: EventBus, screen: FmcScreen<T, any>, renderCallback: FmcRenderCallback): T;
}

