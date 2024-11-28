import { Subject } from '@microsoft/msfs-sdk';

import { DisplayOverlayController } from './DisplayOverlayController';

/**
 * A default implementation of {@link DisplayOverlayController}.
 */
export class DefaultDisplayOverlayController implements DisplayOverlayController {
  /** @inheritDoc */
  public readonly showOverlay = Subject.create(false);

  /** @inheritDoc */
  public readonly hideMainContent = Subject.create(false);
}
