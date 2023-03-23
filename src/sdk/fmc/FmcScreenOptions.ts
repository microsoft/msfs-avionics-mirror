/**
 * Base options for an FMC renderer
 */
export interface FmcRendererOptions {
  /**
   * Width of screen in pixels
   */
  screenPXWidth: number,

  /**
   * Height of screen in pixels
   */
  screenPXHeight: number,

  /**
   * Width of screen in number of characters
   */
  screenCellWidth: number,

  /**
   * Height of screen in number of lines
   */
  screenCellHeight: number,
}