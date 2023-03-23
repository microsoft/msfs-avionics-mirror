import { FmcComponent } from './components';
import { FmcRendererOptions } from './FmcScreenOptions';

/** Type for FMC column rendering data */
export type FmcRenderTemplateColumn = string | FmcComponent

/** Type for FMC row output data */
export type FmcOutputRow = string[]

/** Type for FMC output data */
export type FmcOutputTemplate = FmcOutputRow[]

/** Type for FMC row rendering data */
export type FmcRenderTemplateRow = FmcRenderTemplateColumn[]

/** Type for FMC rendering data */
export type FmcRenderTemplate = FmcRenderTemplateRow[]

/** Text direction for FMC cells */
export type FmcDirection = 'left' | 'center' | 'right'

/** Structure for storing parsed column information */
export interface FmcColumnInformation {
  /** The content of the column */
  content: string,
  /** The attached styles for the column */
  styles: string
}

/**
 * An FMC renderer
 */
export interface FmcRenderer {
  /**
   * Options for this renderer
   */
  readonly options: FmcRendererOptions;

  /**
   * Edits part of the row output
   *
   * @param output the output to insert
   * @param rowIndex the row index to insert at
   *
   * @throws if `rowIndex` is too high
   */
  editOutputTemplate(output: FmcOutputTemplate, rowIndex: number): void;
}