/**
 * A utility class for working with G3X backlight SimVars.
 */
export class G3XBacklightUtils {
  /**
   * Gets the screen backlight level SimVar name for a GDU.
   * @param index A GDU index.
   * @returns The backlight level SimVar name for the specified GDU.
   * @throws Error if {@link index} is not a valid value.
   */
  public static getScreenLevelSimVarName(index: number): string {
    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`G3XBacklightUtils: invalid GDU index: ${index} (must be a positive integer)`);
    }

    return `L:1:WTG3X_Screen_Backlight_${index}`;
  }

  /**
   * Gets the automatic software backlight level SimVar name for a GDU.
   * @param index A GDU index.
   * @returns The automatic software backlight level SimVar name for the specified GDU.
   */
  public static getAutoLevelSimVarName(index: number): string {
    return `L:1:WTG3X_Auto_Backlight_${index}`;
  }
}
