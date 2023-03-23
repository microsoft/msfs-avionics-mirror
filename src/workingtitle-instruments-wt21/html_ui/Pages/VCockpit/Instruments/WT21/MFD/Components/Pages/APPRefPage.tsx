import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { MfdTextPageComponent } from './MfdTextPageComponent';

import './PerfRefPage.css';

/**
 * The Approach Ref Page component.
 */
export class APPRefPage extends MfdTextPageComponent {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.pageContainerDivRef} class="mfd-page-perf-ref-container">
        <div class="perf-ref-header">
          <div>KICT</div>
          <div class="cyan-text">APPROACH REFERENCE</div>
          <div class="cyan-text">2/2</div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY ID</div>
            <div>RW24</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY WIND</div>
            <div>H12 L0</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY LENGTH</div>
            <div>7600 FT</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY SLOPE</div>
            <div>D0.2%</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data1-size">RWY COND</div>
            <div class="green-text">DRY</div>
          </div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">WIND</div>
            <div>270° / 08 KT</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">OAT</div>
            <div>+01°C</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">QNH</div>
            <div>30.12 IN</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data2-size">P ALT</div>
            <div>-235 FT</div>
          </div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data3-size">LW</div>
            <div>13000 LB</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data3-size">GWT</div>
            <div>13000 LB</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data3-size">MLW</div>
            <div>13870 LB</div>
          </div>
        </div>

        <div class="perf-ref-data-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data4-size">A/I</div>
            <div class="green-text">OFF</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data4-size">LDG FACTOR</div>
            <div class="green-text">1.0</div>
          </div>
        </div>

        <div class="perf-ref-app-vspeed-container">
          <div class="perf-ref-data-row">
            <div class="cyan-text data6-size">VREF/VRF:</div>
            <div class="magenta-text">107</div>
          </div>
          <div class="perf-ref-data-row">
            <div class="cyan-text data6-size">VAPP/VAP:</div>
            <div class="magenta-text">117</div>
          </div>
        </div>

        <div class="perf-ref-field-length-container">
          <div class="cyan-text">LFL:</div>
          <div class="perf-ref-field-length-value">6499 FT</div>
        </div>

      </div>
    );
  }
}