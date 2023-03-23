import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * GNSS Control page
 */
export class GNSSCTLPage extends FmcPage {

    /** @inheritDoc */
    public  render(): FmcRenderTemplate[] {
        return [
            [
                ['', '', 'FMS1 GNSS CONTROL[blue]'],
                ['', ''],
                ['<ENABLED> GNSS1[green]', 'STATUS>'],
                ['',''],
                ['<ENABLED> GNSS2[green]', 'STATUS>'],
                ['', ''],
                ['', ''],
                ['', ''],
                ['', ''],
                ['', '4/4 ENABLED [green]'],
                ['<NPA RAIM', 'SELECT SBAS>'],
                ['',''],
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


