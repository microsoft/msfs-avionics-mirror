import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { MfdTextPageComponent } from './MfdTextPageComponent';

import './VORDMEStatusPage.css';
import './MfdPagesContainer.css';

/**
 * The VOR/DME Status Page component.
 */
export class VORDMEStatusPage extends MfdTextPageComponent {
  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-main-container">

        <div class="vordme-status-title-header cyan-text">
          <div>VOR/DME STATUS</div>
        </div>

        <div class="vordme-status-grid">
          <div class="cyan-text">SOURCE</div>
          <div class="cyan-text">ID</div>
          <div class="cyan-text">FREQ</div>
          <div class="cyan-text">BRG/DIST</div>
          <div>VOR 1</div>
          <div>---</div>
          <div>109.90</div>
          <div class="grid-right dme-inactive">
            <span class="dme-placeholder">---.-°</span>
            <span class="dme-value">145.0 NM</span>
          </div>
          <div>DME 1</div>
          <div>---</div>
          <div>109.90</div>
          <div class="grid-right">
            <span class="dme-placeholder">---.-°</span>
            <span class="dme-value">145.0 NM</span>
          </div>
          <div>VOR 2</div>
          <div>---</div>
          <div>109.90</div>
          <div class="grid-right dme-inactive">
            <span class="dme-placeholder">---.-°</span>
            <span class="dme-value">145.0 NM</span>
          </div>
          <div>DME 2</div>
          <div>---</div>
          <div>109.90</div>
          <div class="grid-right">
            <span class="dme-placeholder">---.-°</span>
            <span class="dme-value">145.0 NM</span>
          </div>
          <div>DME 3</div>
          <div>RBT</div>
          <div>114.70</div>
          <div class="grid-right">
            <span class="dme-placeholder">---.-°</span>
            <span class="dme-value">48.0 NM</span>
          </div>
        </div>

      </div>
    );
  }
}