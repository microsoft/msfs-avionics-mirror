import { DisplayField, FmcRenderTemplate, LatLongInterface, LineSelectKeyEvent, PageLinkField } from '@microsoft/msfs-sdk';

import { LatLongTextFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 * POS INIT PAGE
 */
export class PosInitPage extends WT21FmcPage {
  private readonly indexPageLink = PageLinkField.createLink(this, '<INDEX', '/index');
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
        [this.indexPageLink, this.fplnLink],
      ],
    ];
  }

  /** @inheritDoc */
  async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    if (event.col === 1 && event.row === 8) {
      this.fms.fmsPos.initPosWithGnss();
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
