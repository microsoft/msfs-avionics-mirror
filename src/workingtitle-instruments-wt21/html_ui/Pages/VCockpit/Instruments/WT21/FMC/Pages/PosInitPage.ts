import { LatLongInterface } from '@microsoft/msfs-sdk';
import { FmcSelectKeysEvent } from '../FmcEvent';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { LatLongTextFormat } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * POS INIT PAGE
 */
export class PosInitPage extends FmcPage {
  private readonly indexPageLink = PageLinkField.createLink(this, '<INDEX', '/');
  private readonly fplnLink = PageLinkField.createLink(this, 'FPLN>', '/route');

  private readonly PposFieldLabel = new DisplayField<boolean>(this, {
    formatter: {
      nullValueString: '',
      format: (value: boolean): string => {
        return value ? 'COMPLETE' : 'SET POS TO GNSS';
      },
    },
    style: '[blue]  ',
  });

  private readonly FmsPposField = new DisplayField<LatLongInterface | null>(this, {
    formatter: new LatLongTextFormat(),
  });

  private readonly PposField = new DisplayField<LatLongInterface | null>(this, {
    formatter: new LatLongTextFormat(),
    style: '>',
  });

  private readonly SetPosField = new DisplayField<LatLongInterface | null>(this, {
    formatter: new LatLongTextFormat(),
    style: ' ',
  });


  /** @inheritdoc */
  protected onInit(): void {
    this.fms.fmsPos.setPosValue.sub((value) => {
      this.SetPosField.takeValue(value);
    }, true);

    this.PposField.bind(this.fms.fmsPos.gnssPos);
    this.FmsPposField.bind(this.fms.fmsPos.fmsPos);
    this.PposFieldLabel.bind(this.fms.fmsPos.isPosInitialized);
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '1/1 [blue]', 'POS INIT[blue]'],
        [' FMS POS[blue]'],
        [this.FmsPposField],
        [' AIRPORT[blue]'],
        ['-----'],
        [' PILOT/REF WPT[blue]'],
        ['-----'],
        ['', this.PposFieldLabel],
        ['', this.PposField],
        ['', 'SET POS     [blue]'],
        ['', this.SetPosField],
        ['', '', '------------------------[blue]'],
        [this.indexPageLink, this.fplnLink]
      ]
    ];
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    if (event === FmcSelectKeysEvent.RSK_4) {
      this.fms.fmsPos.initPosWithGnss();
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

}
