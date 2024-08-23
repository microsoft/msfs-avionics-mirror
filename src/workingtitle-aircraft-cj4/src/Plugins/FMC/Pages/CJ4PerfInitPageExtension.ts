import { AbstractFmcPageExtension, FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { PerfInitPage } from '@microsoft/msfs-wt21-fmc';

/**
 * CJ4 page extension for the PERF INIT page
 */
export class CJ4PerfInitPageExtension extends AbstractFmcPageExtension<PerfInitPage> {
  private readonly TakeoffLink = PageLinkField.createLink(this.page, 'TAKEOFF>', '/cj4/takeoff-ref');

  /** @inheritDoc */
  public onPageRendered(renderedTemplates: FmcRenderTemplate[]): void {
    renderedTemplates[0][10] = ['', this.TakeoffLink];
  }
}
