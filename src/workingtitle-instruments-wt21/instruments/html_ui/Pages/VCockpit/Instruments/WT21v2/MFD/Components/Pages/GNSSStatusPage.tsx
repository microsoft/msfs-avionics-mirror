import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MfdTextPageComponent } from './MfdTextPageComponent';

import './GNSSStatusPage.css';
import './MfdPagesContainer.css';

/**
 * The GNSS Status Page component.
 */
export class GNSSStatusPage extends MfdTextPageComponent {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-main-container">

        <div class="gnss-status-title-header cyan-text">
          <span>GNSS STATUS</span>
        </div>

        <div class="gnss-status-pos cyan-text text-right">
          <div>GNSS POS: <span class="white-text">N47°53.33 E001°46.49</span></div>
        </div>

        <div class="gnss-status-grid1">
          <div>
            <span class="cyan-text">TRK/SPD</span><br />
            <span>015°/366KT</span>
          </div>
          <div class="text-right">
            <span class="cyan-text">FMS POS DIFF</span><br />
            <span>194°/0.01NM</span>
          </div>
          <div class="text-right">
            <span class="cyan-text">GNSS HT</span><br />
            <span>43285 FT</span>
          </div>
        </div>

        <div class="gnss-status-sat text-right">
          <span class="cyan-text">SAT FAULT :</span><span class="gnss-status-value min40 text-right">NO</span><br />
          <span class="cyan-text">SATELLITES:</span><span class="gnss-status-value min40 text-right">9</span>
        </div>

        <div class="gnss-status-grid2 cyan-text">
          <div>
            <span>MODE:</span>
            <span class="gnss-status-value">SBAS PA</span>
          </div>
          <div>
            <span>SVC IN USE:</span>
            <span class="gnss-status-value">EGNOS</span>
          </div>
          <div>
            <span>HAL :</span>
            <span class="gnss-status-value">3704 M/2.00NM</span>
          </div>
          <div>
            <span>HPL :</span>
            <span class="gnss-status-value min93 text-right">9 M</span>
          </div>
          <div>
            <span>HFOM:</span>
            <span class="gnss-status-value min93 text-right">3 M</span>
          </div>
          <div>
            <span>HUL :</span>
            <span class="gnss-status-value min93 text-right">8 M</span>
          </div>
          <div>
            <span>HDOP:</span>
            <span class="gnss-status-value min93 text-right">0.9</span>
          </div>
        </div>

        <div class="gnss-status-grid3 cyan-text text-right">
          <div>
            <span>VAL:</span>
            <span class="gnss-status-value min106 text-right">N/A</span>
          </div>
          <div>
            <span>VPL:</span>
            <span class="gnss-status-value min106 text-right">13 M</span>
          </div>
          <div>
            <span>VFOM:</span>
            <span class="gnss-status-value min106 text-right">5 M</span>
          </div>
          <div>
            <span>GNSS ALT:</span>
            <span class="gnss-status-value min106 text-right no-padding">43129 FT</span>
          </div>
          <div>
            <span>VDOP:</span>
            <span class="gnss-status-value min106 text-right" style="padding-right:26px">1.2</span>
          </div>
        </div>
      </div>
    );
  }
}