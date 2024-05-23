import { FmcComponent } from './components';
import { FmcRendererOptions } from './FmcScreenOptions';

/** Type for FMC column rendering data */
export type FmcRenderTemplateColumn = string | FmcComponent | PositionedFmcColumn;

/** A positionable FMC column. */
export type PositionedFmcColumn = [
  /** The content, either a string or an FmcComponent. */
  content: string | FmcComponent,
  /** The (zero-indexed) index on which the first character is placed (or the last, if right-aligned). */
  columnIndex: number,
  /** If 'left', the text will continue to the right of the `columnIndex`.
   * If 'right', the text will continue to the left of the `columnIndex`. */
  alignment?: 'left' | 'right',
];

/** A rendered, positionable FMC column. */
export interface RenderedPositionedFmcColumn {
  /** The rendered content string. */
  text: string,
  /** The (zero-indexed) index on which the first character is placed (or the last, if right-aligned). */
  columnIndex: number,
  /** If 'left', the text will continue to the right of the `columnIndex`.
   * If 'right', the text will continue to the left of the `columnIndex`. */
  alignment?: 'left' | 'right',
}

/** Type for FMC row output data */
export type FmcOutputRow = (string | RenderedPositionedFmcColumn)[]

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
   * @param template the template of the output
   *
   * @throws if `rowIndex` is too high
   */
  editOutputTemplate(output: FmcOutputTemplate, rowIndex: number, template: FmcRenderTemplate): void;
}
