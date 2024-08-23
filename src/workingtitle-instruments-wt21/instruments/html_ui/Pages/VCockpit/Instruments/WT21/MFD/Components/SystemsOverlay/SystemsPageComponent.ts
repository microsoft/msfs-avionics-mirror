/**
 * Interface for WT21 MFD systems pages
 */
export interface SystemsPageComponent {
  /**
   * Sets the visibility of the systems page
   *
   * @param visible whether the systems page should be visible
   */
  setVisibility(visible: boolean): void;
}
