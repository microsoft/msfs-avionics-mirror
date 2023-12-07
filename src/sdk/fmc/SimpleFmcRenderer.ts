import { ClockEvents, Consumer, EventBus } from '../index';

import { FmcColumnInformation, FmcDirection, FmcOutputRow, FmcOutputTemplate, FmcRenderer } from './FmcRenderer';
import { FmcRendererOptions } from './FmcScreenOptions';

/**
 * Options for {@link SimpleFmcRenderer}
 */
export interface SimpleFmcRendererOptions extends FmcRendererOptions {
  /**
   * Update frequency. in hertz.
   */
  updateFrequency?: number,
}

/** FMC Renderer class */
export class SimpleFmcRenderer implements FmcRenderer {
  private clockConsumer: Consumer<number>;

  private containerTemplate!: HTMLDivElement;
  private rowTemplate!: HTMLDivElement;
  private colTemplate!: HTMLDivElement;

  private currentOutput: FmcOutputTemplate = [];
  private columnData: FmcColumnInformation[][] = [];
  private prevColumnData: FmcColumnInformation[][] = [];

  private containerRef!: HTMLDivElement;

  private hasChanges = false;
  private colElArr: HTMLDivElement[][] = [];
  // HINT: Looks like thats too much but perf is better caching the text nodes
  private colElNodeArr: ChildNode[][] = [];
  private rowElArr: HTMLDivElement[] = [];

  /**
   * Ctor
   * @param eventBus The event bus.
   * @param targetElement The target element of the renderer.
   * @param options The options for the renderer.
   */
  constructor(eventBus: EventBus, readonly targetElement: HTMLDivElement, readonly options: SimpleFmcRendererOptions) {
    this.containerTemplate = this.createContainerTemplate();
    this.columnData = this.createColumnInformation();
    this.prevColumnData = this.createColumnInformation();

    this.containerRef = this.targetElement;
    this.initializeContainer();

    this.clockConsumer = eventBus.getSubscriber<ClockEvents>().on('realTime').atFrequency(this.options.updateFrequency ?? 10, false);
    this.clockConsumer.handle(this.onClockUpdate.bind(this));
  }

  /** Initializes the container we will render to. */
  private initializeContainer(): void {
    const container = this.containerTemplate.cloneNode(true);
    this.containerRef.replaceWith(container);
    // this.elecContainerRef.replaceChild(container, this.containerRef);
    this.containerRef = container as HTMLDivElement;
    // build colElArr
    for (let r = 0; r < this.options.screenCellHeight; r++) {
      const rowEl = this.containerRef.childNodes[r] as HTMLDivElement;
      this.rowElArr.push(rowEl);
      const colArr = [];
      const colNodeArr = [];
      for (let c = 0; c < this.options.screenCellWidth; c++) {
        const colEl = rowEl.childNodes[c + 1] as HTMLDivElement;
        colArr.push(colEl);
        colNodeArr.push(colEl.firstChild as ChildNode);
      }
      this.colElArr.push(colArr);
      this.colElNodeArr.push(colNodeArr);
    }
  }

  /** Handles the clock update event. */
  private onClockUpdate(): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      this.renderToDom();
    }
  }

  /**
   * Edits part of the row output
   * @param output the output to insert
   * @param rowIndex the row index to insert at
   * @throws if `rowIndex` is too high
   */
  editOutputTemplate(output: FmcOutputTemplate, rowIndex: number): void {
    const rowsAvailable = (this.options.screenCellHeight) - rowIndex;

    if (rowsAvailable <= 0 || rowsAvailable < output.length) {
      throw new Error(`[FmcRenderer](editTemplate) Tried to write ${output.length - rowsAvailable} too many rows.`);
    }

    for (let i = rowIndex, c = 0; i < rowIndex + rowsAvailable && output[c]; i++, c++) {
      if (this.currentOutput[i] !== output[c]) {
        this.currentOutput[i] = output[c];
        this.hasChanges = true;
      }
    }
  }

  /** Renders the current template */
  private renderToDom(): void {
    // get a new column data structure
    this.columnData = this.createColumnInformation();

    // parse and fill in the column data
    for (let index = 0; index < this.options.screenCellHeight; index++) {
      this.buildRowInfo(this.currentOutput[index], index);
    }

    // go through all rows and columns and update the content if necessary
    for (let r = 0; r < this.options.screenCellHeight; r++) {
      for (let c = 0; c < this.options.screenCellWidth; c++) {
        const colData = this.columnData[r][c];
        const prevColData = this.prevColumnData[r][c];

        if (colData.content !== prevColData.content || colData.styles !== prevColData.styles) {
          if (colData.content !== prevColData.content) {
            const colNodeEl = this.colElNodeArr[r][c];

            colNodeEl.nodeValue = colData.content;
          }

          if (colData.styles !== prevColData.styles) {
            const colEl = this.colElArr[r][c];

            colEl.className = `fmc-letter ${colData.styles}`;
          }
        }
      }
    }

    this.prevColumnData = this.columnData;
  }

  /**
   * Parse row templates and build the column information.
   * @param template the template to parse
   * @param rowIndex the row index
   */
  private buildRowInfo(template: FmcOutputRow, rowIndex: number): void {
    // only content
    if (rowIndex < this.options.screenCellHeight && template) {
      if (template[0] && template[0] !== '') {
        // LEFT
        this.buildColumnInformation(template[0], rowIndex, 'left');
      }

      if (template[1] && template[1] !== '') {
        // RIGHT
        this.buildColumnInformation(template[1], rowIndex, 'right');
      }

      if (template[2] && template[2] !== '') {
        // CENTER
        this.buildColumnInformation(template[2], rowIndex, 'center');
      }
    }
  }

  /**
   * Builds the data struct for the row's columns.
   * @param templateRowColumn template
   * @param rowIndex the row index
   * @param dir direction
   */
  private buildColumnInformation(templateRowColumn: string, rowIndex: number, dir: FmcDirection = 'left'): void {
    const content = this.parseContent(templateRowColumn);

    let charCount = 0;
    // count all letters
    content.forEach(x => {
      charCount += x.content?.length ?? 0;
    });
    charCount = Math.min(charCount, this.options.screenCellWidth);

    // set start pos
    let charIndex = 0;
    if (dir === 'right') {
      charIndex = this.options.screenCellWidth - charCount;
    } else if (dir == 'center') {
      charIndex = Math.round((((this.options.screenCellWidth - 1) / 2) - (charCount / 2)));
    }

    // build data struct
    const row = this.columnData[rowIndex];
    content.forEach(x => {
      const letters = x.content.split('');
      letters.forEach((c: string) => {
        if (charIndex >= this.options.screenCellWidth) {
          return;
        }
        const colInfo = row[charIndex];
        colInfo.styles = x.styles;
        colInfo.content = c === '' ? ' ' : c;
        charIndex++;
      });
    });
  }

  /**
   * Parses content into intermediate information blocks
   * @param content the content to parse
   * @returns a list of information blocks
   */
  private parseContent(content: string): FmcColumnInformation[] {
    const resultInfo: FmcColumnInformation[] = [];

    // if it starts with a bracket its probably empty
    if (content.startsWith('[')) {
      return resultInfo;
    }

    // eslint-disable-next-line no-useless-escape
    const regex = /([^\[\]\n]+)(\[[^\[\]\n]+\])*/g;

    let match = regex.exec(content);
    if (match) {
      while (match != null) {
        const el: FmcColumnInformation = {
          content: match[1].replace('__LSB', '[').replace('__RSB', ']'),
          styles: ''
        };

        if (match[2]) {
          // eslint-disable-next-line no-useless-escape
          const classes = match[2].match(/[^\s\[\]]+/g);

          if (classes) {
            el.styles = classes.join(' ');
          }
        }
        resultInfo.push(el);
        match = regex.exec(content);
      }
    }
    return resultInfo;
  }

  /**
   * Builds the template for the whole container.
   * @param defaultAlternatingLayout if the rows should alternate
   * @returns the container template
   */
  private createContainerTemplate(defaultAlternatingLayout = true): HTMLDivElement {
    // create container
    const container = document.createElement('div');
    container.id = 'fmc-container';

    this.colTemplate = this.createColumnTemplate();
    this.rowTemplate = this.createRowTemplate();

    // const preRenderRows = Date.now();
    for (let r = 0; r < this.options.screenCellHeight; r++) {
      // rows
      const row = this.rowTemplate.cloneNode(true) as HTMLDivElement;

      if (defaultAlternatingLayout && r % 2 == 1) {
        row.classList.remove('d-text');
        row.classList.add('s-text');
      }

      container.appendChild(row);
    }

    return container;
  }

  /**
   * Builds the template for a single row.
   * @returns the row template
   */
  private createRowTemplate(): HTMLDivElement {
    // create row template
    const rowTemplate = document.createElement('div');
    rowTemplate.classList.add('fmc-row');
    rowTemplate.classList.add('d-text');

    const cellHeight = this.options.screenPXHeight / this.options.screenCellHeight;
    rowTemplate.style.height = `${cellHeight}px`;
    rowTemplate.style.lineHeight = `${cellHeight}px`;

    const cellWidth = this.options.screenPXWidth / this.options.screenCellWidth;
    const lostDecimalWidth = cellWidth - Math.trunc(cellWidth);

    const paddingElemLeft = document.createElement('span');
    paddingElemLeft.style.width = `${Math.ceil((lostDecimalWidth * this.options.screenCellWidth) / 2)}px`;
    paddingElemLeft.style.display = 'inline-block';

    rowTemplate.appendChild(paddingElemLeft);

    // create spans in row template
    for (let c = 0; c < this.options.screenCellWidth; c++) {
      const col = this.colTemplate.cloneNode(true) as HTMLDivElement;

      rowTemplate.appendChild(col);
    }

    return rowTemplate;
  }

  /**
   * Builds the template for a single column.
   * @returns the column template
   */
  private createColumnTemplate(): HTMLDivElement {
    // create column template
    const colEl = document.createElement('div');
    colEl.classList.add('fmc-letter');
    colEl.style.width = `${this.options.screenPXWidth / this.options.screenCellWidth}px`;
    colEl.style.height = `${this.options.screenPXHeight / this.options.screenCellHeight}px`;
    colEl.style.lineHeight = `${this.options.screenPXHeight / this.options.screenCellHeight}px`;
    colEl.textContent = ' ';
    return colEl;
  }

  /**
   * Builds the data structure representing the content and looks.
   * @returns the data structure
   */
  private createColumnInformation(): FmcColumnInformation[][] {
    const columnInformation: FmcColumnInformation[][] = [];

    for (let r = 0; r < this.options.screenCellHeight; r++) {
      const rowColumns: FmcColumnInformation[] = [];

      for (let c = 0; c < this.options.screenCellWidth; c++) {
        const colInfo: FmcColumnInformation = {
          content: ' ',
          styles: ''
        };

        rowColumns.push(colInfo);
      }
      columnInformation.push(rowColumns);
    }

    return columnInformation;
  }

}
