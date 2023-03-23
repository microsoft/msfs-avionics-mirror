import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * VORDME Control page
 */
export class VORDMECTLPage extends FmcPage {

    /** @inheritDoc */
    public  render(): FmcRenderTemplate[] {
        return [
            [
                ['', '', 'FMS1 VOR/DME CONTROL[blue]'],
                ['', ''],
                ['---', '---'],
                ['', '','NAVAID INHIBIT[blue]'],
                ['---', '---'],
                ['', ''],
                ['---', '---'],
                ['', ''],
                ['---', '---'],
                [' VOR USAGE[blue]', 'DME USAGE [blue]'],
                ['YES/[white s-text]NO[green d-text]', 'YES/[green d-text]NO[white s-text]'],
                ['','','------------------------[blue]'],
                ['<INDEX','']
            ]
        ];
    }

        /** @inheritDoc */
        public async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean> {
          if (event === FmcSelectKeysEvent.LSK_6) {
              this.router.activeRouteSubject.set('/index');
              return true;
          }
          return false;
      }

}


