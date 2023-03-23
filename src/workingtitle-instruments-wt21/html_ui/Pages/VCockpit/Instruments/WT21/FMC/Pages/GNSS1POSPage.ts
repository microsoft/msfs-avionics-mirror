import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * GNSS1 POS page
 */
export class GNSS1POSPage extends FmcPage {

    /** @inheritDoc */
    public  render(): FmcRenderTemplate[] {
        return [
            [
                ['--:--[yellow]', '--/--/--[yellow]', 'GPS 1[blue]'],
                ['', ''],
                [' LATITUDE[s-text]', 'LONGITUDE[s-text]'],
                ['---°--.--[yellow]','----°--.--[yellow]'],
                ['',''],
                ['   TRACK ANGLE', '---°TRUE [yellow]'],
                ['  GROUND SPEED[s-text]', '-----[yellow]'],
                ['', ''],
                ['    RAIM LIMIT[s-text]', '-.-- NM [yellow]'],
                ['PROBABLE ERROR', '-.-- NM [yellow]'],
                [' GPS MODE: [s-text]', 'ACQUISITION[green]'],
                ['SATELLITES: ','0       [green]']
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


