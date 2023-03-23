import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * MCDU Menu page
 */
export class MCDUMenuPage extends FmcPage {

    /** @inheritDoc */
    public  render(): FmcRenderTemplate[] {
        return [
            [
                ['', '', 'MCDU MENU[blue]'],
                ['', ''],
                ['<FMS 1', 'GPS 1 POS>'],
                ['', ''],
                ['<DL', ''],
                ['', ''],
                ['<DBU', ''],
                ['', ''],
                ['', ''],
                ['', ''],
                ['', ''],
                ['', ''],
                ['', ''],
                ['', ''],
            ]
        ];
    }

    /** @inheritDoc */
  public async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean> {
    if (event === FmcSelectKeysEvent.LSK_1) {
      this.router.activeRouteSubject.set('/index');
      return true;
    }
    if (event === FmcSelectKeysEvent.RSK_1) {
      this.router.activeRouteSubject.set('/gnss1-pos');
      return true;
    }
    return false;
  }

}


