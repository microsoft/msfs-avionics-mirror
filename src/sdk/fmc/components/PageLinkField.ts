import { RawFormatter } from '../FmcFormat';
import { AbstractFmcPage } from '../AbstractFmcPage';
import { DisplayField, DisplayFieldOptions } from './DisplayField';
import { FmcComponentOptions } from './FmcComponent';

/** Page Link options */
interface PageLinkFieldOptions extends FmcComponentOptions {
  /** The label to display. */
  label: string,
  /** The route to navigate to. */
  route: string,
  /** The params for the route */
  params?: Record<string, unknown>,
}

/**
 * A field for displaying a link to navigate to another page
 */
export class PageLinkField extends DisplayField<string> {
  /** @inheritDoc */
  protected constructor(page: AbstractFmcPage, options: PageLinkFieldOptions) {
    const opts: DisplayFieldOptions<string> = {
      formatter: RawFormatter,
      style: options.disabled ? '[disabled]' : '',
      disabled: options.disabled,
      clearScratchpadOnSelectedHandled: false,
      onSelected: options.onSelected ?? (async (): Promise<boolean> => { page.screen.navigateTo(options.route, options.params); return true; }),
    };
    super(page, opts);
    this.takeValue(options.label);
  }

  /**
   * Creates an {@link PageLinkField}
   * @param page    the parent {@link FmcPage}
   * @param label  the label to display
   * @param route the route to navigate to (will disable link when empty)
   * @param disabled whether the link is disabled
   * @param params Parameters for the route
   * @returns the {@link PageLinkField}
   */
  static createLink(page: AbstractFmcPage, label: string, route: string, disabled = false, params?: Record<string, unknown>): PageLinkField {
    if (route === '') { disabled = true; }
    return new PageLinkField(page, { label, route, disabled, params });
  }
}