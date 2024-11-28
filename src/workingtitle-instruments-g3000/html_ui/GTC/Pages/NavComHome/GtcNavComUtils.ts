import { GtcPopupType, GtcService, GtcViewEntry, GtcViewOcclusionType } from '../../GtcService/GtcService';
import { GtcView } from '../../GtcService/GtcView';

/**
 * Utility class for working with GTC NAV/COM views.
 */
export class GtcNavComUtils {
  /**
   * Opens a view as a NAV/COM popup. For a horizontal GTC, this will open the popup in the current main view stack.
   * For a vertical GTC, this will open the popup in the current overlay view stack.
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
      : gtcService.openOverlayPopup(key, fullIfVertical ? 'slideout-top' : popupType, fullIfVertical ? 'none' : backgroundOcclusion);
  }

  /**
   * Attempts to close a vertical GTC NAV/COM popup by rewinding the history state of the current overlay view stack
   * until the target popup is found and closed or until the current overlay view stack is empty.
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
    return gtcService.closeOverlayPopup<F>(entry => entry.key === key && (filter === undefined || filter(entry.ref)), true);
  }
}