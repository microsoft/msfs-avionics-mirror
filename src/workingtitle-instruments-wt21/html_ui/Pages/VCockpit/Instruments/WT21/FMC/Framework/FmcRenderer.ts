import { ClockEvents, Consumer, EventBus } from '@microsoft/msfs-sdk';

import { FmcComponent } from './Components/FmcComponent';

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
interface FmcColumnInformation {
    /** The content of the column */
    content: string,
    /** The attached styles for the column */
    styles: string
}

/** The number of lines on the FMC screen */
export const FMC_LINE_COUNT = 15;

/** FMC Renderer class */
export class FmcRenderer {

    private clockConsumer: Consumer<number>;

    private containerTemplate!: HTMLDivElement;
    private rowTemplate!: HTMLDivElement;
    private colTemplate!: HTMLDivElement;

    private currentOutput: FmcOutputTemplate = [];
    private columnData: FmcColumnInformation[][] = [];
    private prevColumnData: FmcColumnInformation[][] = [];

    private elecContainerRef!: HTMLDivElement;
    private containerRef!: HTMLDivElement;

    private hasChanges = false;
    private colElArr: HTMLDivElement[][] = [];
    // HINT: Looks like thats too much but perf is better caching the text nodes
    private colElNodeArr: ChildNode[][] = [];
    private rowElArr: HTMLDivElement[] = [];

    /**
     * Ctor
     * @param eventBus The event bus.
     */
    constructor(eventBus: EventBus) {
        this.containerTemplate = this.createContainerTemplate();
        this.columnData = this.createColumnInformation();
        this.prevColumnData = this.createColumnInformation();

        this.elecContainerRef = document.getElementById('Electricity') as HTMLDivElement;
        this.containerRef = document.getElementById('fmc-container') as HTMLDivElement;
        this.initializeContainer();

        this.clockConsumer = eventBus.getSubscriber<ClockEvents>().on('realTime').atFrequency(10, false);
        this.clockConsumer.handle(this.clockHandler.bind(this));
    }

    /** Initializes the container we will render to. */
    private initializeContainer(): void {
        const container = this.containerTemplate.cloneNode(true);
        this.elecContainerRef.replaceChild(container, this.containerRef);
        this.containerRef = container as HTMLDivElement;
        // build colElArr
        for (let r = 0; r < FMC_LINE_COUNT; r++) {
            const rowEl = this.containerRef.childNodes[r] as HTMLDivElement;
            this.rowElArr.push(rowEl);
            const colArr = [];
            const colNodeArr = [];
            for (let c = 0; c < 24; c++) {
                const colEl = rowEl.childNodes[c] as HTMLDivElement;
                colArr.push(colEl);
                colNodeArr.push(colEl.firstChild as ChildNode);
            }
            this.colElArr.push(colArr);
            this.colElNodeArr.push(colNodeArr);
        }
    }

    /** Handles the clock update event. */
    private clockHandler(): void {
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
    public editOutputTemplate(output: FmcOutputTemplate, rowIndex: number): void {
        const rowsAvailable = (FMC_LINE_COUNT) - rowIndex;

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
        for (let index = 0; index < FMC_LINE_COUNT; index++) {
            this.buildRowInfo(this.currentOutput[index], index);
        }

        // go through all rows and columns and update the content if necessary
        for (let r = 0; r < FMC_LINE_COUNT; r++) {
            for (let c = 0; c < 24; c++) {
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
    public buildRowInfo(template: FmcOutputRow, rowIndex: number): void {
        // only content
        if (rowIndex < FMC_LINE_COUNT && template) {
            if (template[0] !== '') {
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
        charCount = Math.min(charCount, 24);

        // set start pos
        let charIndex = 0;
        if (dir === 'right') {
            charIndex = 24 - (charCount);
        } else if (dir == 'center') {
            charIndex = Math.round(((23 / 2) - (charCount / 2)));
        }

        // build data struct
        const row = this.columnData[rowIndex];
        content.forEach(x => {
            const letters = x.content.split('');
            letters.forEach((c: string) => {
                if (charIndex > 23) {
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
    public createContainerTemplate(defaultAlternatingLayout = true): HTMLDivElement {
        // create container
        const container = document.createElement('div');
        container.id = 'fmc-container';

        this.colTemplate = this.createColumnTemplate();
        this.rowTemplate = this.createRowTemplate();

        // const preRenderRows = Date.now();
        for (let r = 0; r < FMC_LINE_COUNT; r++) {
            // rows
            const row = this.rowTemplate.cloneNode(true) as HTMLDivElement;
            if (r === 0) {
                row.classList.remove('fmc-row');
                row.classList.add('fmc-header');
            }

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
        // create spans in row template
        for (let c = 0; c < 24; c++) {
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
        colEl.textContent = ' ';
        return colEl;
    }

    /**
     * Builds the data structure representing the content and looks.
     * @returns the data structure
     */
    private createColumnInformation(): FmcColumnInformation[][] {
        const columnInformation: FmcColumnInformation[][] = [];
        for (let r = 0; r < FMC_LINE_COUNT; r++) {
            const rowColumns: FmcColumnInformation[] = [];
            for (let c = 0; c < 24; c++) {
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
