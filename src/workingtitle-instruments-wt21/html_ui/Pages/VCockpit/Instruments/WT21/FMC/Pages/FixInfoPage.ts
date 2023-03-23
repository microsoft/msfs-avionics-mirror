import { FmcSelectKeysEvent } from '../FmcEvent';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * Fix Info page
 */
export class FixInfoPage extends FmcPage {

    /** @inheritDoc */
    public  render(): FmcRenderTemplate[] {
        return [
            [
                ['', '1/1[blue]', 'FIX INFO[blue]'],
                [' REF[blue]', ''],
                ['GCO', ''],
                [' RAD CROSS[blue]', 'LAT CROSS [blue]'],
                ['002°', '---°--.--'],
                [' DIS CROSS[blue]', 'LON CROSS [blue]'],
                ['15.2NM', '----°--.--'],
                ['', ''],
                [' <ABEAM REF', ''],
                ['', ''],
                ['', '', 'ABEAM REF'],
                [' CRS  DIST[blue]','ETE   FUEL[blue]'],
                ['272° 95.4NM','0:16   520']
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


