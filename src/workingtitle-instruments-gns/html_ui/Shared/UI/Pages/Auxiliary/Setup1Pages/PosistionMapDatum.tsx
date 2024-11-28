import { AuxPage } from '../AuxPages';
import { FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { SelectableText } from '../../../Controls/SelectableText';
import { GNSUiControl } from '../../../GNSUiControl';
import { OptionDialog } from '../../../Controls/OptionDialog';

import './PosistionMapDatum.css';

enum positionFormat {
  hdddmmmmm = 'hddd° mm.mmm\'',
  hdddmmsss = 'hddd°mm\'ss.s"',
  MGRS = 'MGRS',
  UTMUPS = 'UTM/UPS'
}
/**
 * Position and map datum page.
 */
export class PositionMapDatum extends AuxPage {
  private readonly scrollContainerRef = FSComponent.createRef<GNSUiControl>();
  private readonly positionFormatModeRef = FSComponent.createRef<SelectableText>();
  private readonly positionFormatMode = Subject.create(positionFormat.hdddmmmmm);
  private readonly positionFormat = FSComponent.createRef<OptionDialog>();

  /**
   * Sets the position type to use.
   * @param index The option the user selects.
   */
  private setPositionFormat(index: number): void {
    if (index === 0) {
      this.positionFormatMode.set(positionFormat.hdddmmmmm);
    } else if (index === 1) {
      this.positionFormatMode.set(positionFormat.hdddmmsss);
    } else if (index === 2) {
      this.positionFormatMode.set(positionFormat.MGRS);
    } else if (index === 3) {
      this.positionFormatMode.set(positionFormat.UTMUPS);
    }

    this.positionFormat.instance.closePopout();
    this.positionFormat.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.MostRecent);
    this.scroll('forward');
  }


  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    if (this.props.gnsType === 'wt530') {
      this.positionFormatModeRef.instance.setDisabled(true);
    }
    this.positionFormat.instance.setItems([positionFormat.hdddmmmmm, positionFormat.hdddmmsss, positionFormat.MGRS, positionFormat.UTMUPS], false);
  }



  /** @inheritDoc */
  render(): VNode {
    return (
      <div class="page aux-page hide-element" ref={this.el}>
        <div class='aux-page-header'>
        </div>
        <div class='aux-table-header'>
          POSITION FORMAT / MAP DATUM
        </div>
        <div class="units-position-position-format-title">
          POSITION FORMAT
          <div class="units-position-position-format">
            <SelectableText

              ref={this.positionFormatModeRef}
              class="aux-entry com-configuration-spacing"
              data={this.positionFormatMode}
              onRightInnerInc={(): boolean => {
                this.scrollContainerRef.instance.blur();
                this.positionFormat.instance.openPopout(0);
                this.positionFormat.instance.focus(FocusPosition.First);
                return true;
              }}
              onRightInnerDec={(): boolean => {
                this.scrollContainerRef.instance.blur();
                this.positionFormat.instance.openPopout(0);
                this.positionFormat.instance.focus(FocusPosition.First);
                return true;
              }}
            />
          </div>
        </div>
        <div class="units-position-position-format-title">
          MAP DATUM
          <div class="aux-table units-position-map-datum-format">
            WGS 84
          </div>
        </div>
        <OptionDialog class='units-position-dialog-position' label='POSITION FORMAT' onSelected={(index): void => this.setPositionFormat(index)} ref={this.positionFormat} />
      </div>
    );
  }

}