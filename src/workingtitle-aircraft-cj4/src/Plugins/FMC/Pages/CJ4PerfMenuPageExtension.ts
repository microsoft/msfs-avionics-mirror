import { AbstractFmcPageExtension, FmcRenderTemplate, PageLinkField } from '@microsoft/msfs-sdk';

import { PerfMenuPage } from '@microsoft/msfs-wt21-fmc';

/**
 * CJ4 page extension for the PERF MENU page
 */
export class CJ4PerfMenuPageExtension extends AbstractFmcPageExtension<PerfMenuPage> {
  private readonly TakeoffPerfLink = PageLinkField.createLink(this.page, '<TAKEOFF', '/cj4/takeoff-ref');

  private readonly ApproachPerfLink = PageLinkField.createLink(this.page, 'APPROACH>', '/cj4/approach-ref');

  /** @inheritDoc */
  public onPageRendered(renderedTemplates: FmcRenderTemplate[]): void {
    renderedTemplates[0][6] = [this.TakeoffPerfLink, this.ApproachPerfLink];
  }
}
