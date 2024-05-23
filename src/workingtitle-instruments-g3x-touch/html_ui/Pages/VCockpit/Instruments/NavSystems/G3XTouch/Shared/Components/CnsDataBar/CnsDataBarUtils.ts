import { CnsDataBarItemType } from './CnsDataBarItem';

/**
 * A utility class for working with the CNS data bar.
 */
export class CnsDataBarUtils {
  /** A record that maps data bar item types to their widths, in pixels, for the GDU460 format. */
  public static readonly GDU_460_ITEM_WIDTHS: Record<CnsDataBarItemType, number> = {
    [CnsDataBarItemType.Split]: 80,
    [CnsDataBarItemType.Timer]: 100,
    [CnsDataBarItemType.Com]: 240,
    [CnsDataBarItemType.ComMinimized]: 120,
    [CnsDataBarItemType.Nav]: 240,
    [CnsDataBarItemType.NavMinimized]: 120,
    [CnsDataBarItemType.Xpdr]: 216,
    [CnsDataBarItemType.Audio]: 240,
    [CnsDataBarItemType.AudioMinimized]: 98,
    [CnsDataBarItemType.AudioOnly]: 78,
  };


  /**
   * Returns true if the given type is a communication item type.
   * @param type The type to check.
   * @returns True if the given type is a communication item type.
   */
  public static isItemTypeCom(type: CnsDataBarItemType): type is CnsDataBarItemType.Com | CnsDataBarItemType.ComMinimized {
    return type === CnsDataBarItemType.Com || type === CnsDataBarItemType.ComMinimized;
  }

  /**
   * Returns true if the given type is a navigation item type.
   * @param type The type to check.
   * @returns True if the given type is a navigation item type.
   */
  public static isItemTypeNav(type: CnsDataBarItemType): type is CnsDataBarItemType.Nav | CnsDataBarItemType.NavMinimized {
    return type === CnsDataBarItemType.Nav || type === CnsDataBarItemType.NavMinimized;
  }

  /**
   * Returns true if the given type is a radio item type.
   * @param type The type to check.
   * @returns True if the given type is a radio (communication or navigation) item type.
   */
  public static isItemTypeRadio(type: CnsDataBarItemType): type is CnsDataBarItemType.Com
    | CnsDataBarItemType.ComMinimized
    | CnsDataBarItemType.Nav
    | CnsDataBarItemType.NavMinimized {
    return CnsDataBarUtils.isItemTypeCom(type) || CnsDataBarUtils.isItemTypeNav(type);
  }

  /**
   * Returns true if the given type is an audio item type.
   * @param type The type to check.
   * @returns True if the given type is an audio item type.
   */
  public static isItemTypeAudio(type: CnsDataBarItemType): type is CnsDataBarItemType.Audio
    | CnsDataBarItemType.AudioMinimized
    | CnsDataBarItemType.AudioOnly {
    return type === CnsDataBarItemType.Audio || type === CnsDataBarItemType.AudioMinimized || type === CnsDataBarItemType.AudioOnly;
  }
}