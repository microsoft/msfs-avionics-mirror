import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * Main FMC page
 */
export class MainPage extends FmcPage {

    // eslint-disable-next-line jsdoc/require-jsdoc
    render(): FmcRenderTemplate[] {
        return [
            [
                ['', '', 'FMC MAIN[blue]'],
                [' HEADER', 'HEADER '],
                ['<TEST', 'TEST>'],
                [' HEADER', 'HEADER '],
                ['<TEST', 'TEST>'],
                [' HEADER', 'HEADER '],
                ['<TEST', 'TEST>'],
            ]
        ];
    }

}
