import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MfdTextPageComponent } from './MfdTextPageComponent';

import './PosSummaryPage.css';
import './MfdPagesContainer.css';

/**
 * The Position Summary Page component.
 */
export class PosSummaryPage extends MfdTextPageComponent {
  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-main-container">

        <div class="pos-summary-title-header cyan-text">
          <div>FMS POSITION SUMMARY</div>
          <div>FMS POS: <span class="white-text">N47°49.63 E001°45.07</span></div>
        </div>

        <div class="pos-summary-grid-title cyan-text">
          <div>SENSOR</div>
          <div class="grid-center">POS DIFF</div>
          <div class="grid-right">USE</div>
        </div>

        <div class="pos-summary-grid">
          <div>VOR/DME 1  NT</div>
          <div>---°/ -.- NM</div>
          <div class="grid-right">NO</div>
          <div class="pos-summary-grid-indent">DME ONLY</div>
          <div>VOR/DME 2  NT</div>
          <div>---°/ -.- NM</div>
          <div class="grid-right">NO</div>
          <div class="pos-summary-grid-indent">DME ONLY</div>
          <div>DME/DME NAVIGATION</div>
          <div></div>
          <div class="grid-right">NO</div>
        </div>

        <div class="pos-summary-grid">
          <div>GNSS</div>
          <div>194°/ 0.0 NM</div>
          <div class="grid-right">YES</div>
        </div>

      </div>
    );
  }
}