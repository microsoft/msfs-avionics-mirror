import { GtcPopupType, GtcService, GtcViewEntry, GtcViewOcclusionType } from '../../GtcService/GtcService';
import { GtcView } from '../../GtcService/GtcView';

/**
 * Utility class for working with GTC NAV/COM views.
 */
export class GtcNavComUtils {
  /**
   * Opens a view as a NAV/COM popup. For a horizontal GTC, this will open the popup in the currently selected control
   * mode. For a vertical GTC, this will open the popup in the vertical GTC NAV/COM view stack.
   * @param gtcService The GTC service.
   * @param key The key of the view to open.
   * @param popupType The type of popup to open the view as. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. Defaults to `'darken'`.
   * @param fullIfVertical Whether to open the popup as a full-screen popup for a vertical GTC. Defaults to `false`.
   * @returns The entry of the opened view.
   * @throws Error if there is no view registered under the specified key.
   */
  public static openPopup<T extends GtcView = GtcView>(
    gtcService: GtcService,
    key: string,
    popupType?: GtcPopupType,
    backgroundOcclusion?: GtcViewOcclusionType,
    fullIfVertical = false
  ): GtcViewEntry<T> {
    return gtcService.isHorizontal
      ? gtcService.openPopup(key, popupType, backgroundOcclusion)
      : gtcService.openVerticalNavComPopup(key, fullIfVertical ? 'slideout-top' : popupType, fullIfVertical ? 'none' : backgroundOcclusion);
  }

  /**
   * Attempts to close a popup in the vertical GTC NAV/COM view stack by rewinding the history state of the view stack
   * until the target popup becomes the active view and is closed or the view stack contains no more popups.
   * @param gtcService The GTC service.
   * @param key The key of the popup to close.
   * @param filter An optional filter function which takes in a popup with the specified key and returns whether it is
   * the popup to close. If not defined, any popup with the specified key will be considered to be the popup to close.
   * @returns `true` if the specified popup was found and closed, or `false` if the popup was not open in the first
   * place.
   */
  public static closeVertNavComPopup<F extends GtcView = GtcView>(
    gtcService: GtcService,
    key: string,
    filter?: (popup: F) => boolean
  ): boolean {
    while (!gtcService.isVertNavComViewStackEmpty) {
      const activeViewEntry = gtcService.activeView.get();
      if (activeViewEntry.key === key && (filter === undefined || filter(activeViewEntry.ref as F))) {
        gtcService.goBack();
        return true;
      }

      gtcService.goBack();
    }

    return false;
  }
}