import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { LogControllerOptions } from './LogControllerTypes';

import './WaypointListHeader.css';

/** The properties for the {@link WaypointListHeader} component. */
interface WaypointListHeaderProps extends ComponentProps {
  /**
   * The selected option of LogControllerOptions
   */
  selectedOption: Subscribable<LogControllerOptions>
}

/** The WaypointListHeader component. */
export class WaypointListHeader extends DisplayComponent<WaypointListHeaderProps> {

  /** @inheritdoc */
  public render(): VNode {

    return (
      <div class="waypoint-list-header">
        <div class="waypoint-list-header-options">
          <p class='visible'>Crs</p>
          <p class='visible'>Dist</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.SpdDistTime ? 'visible' : 'hidden')}>GS</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.SpdDistTime ? 'visible' : 'hidden')}>DTG</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.SpdDistTime ? 'visible' : 'hidden')}>ETE</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.Cross ? 'visible' : 'hidden')}>Alt</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.Cross ? 'visible' : 'hidden')}>Ang</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.Cross ? 'visible' : 'hidden')}>Spd</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.Cross ? 'visible' : 'hidden')}>Time</p>
          <p class={/*this.props.selectedOption.map((v) => v === LogControllerOptions.WindTempIsa ? 'visible' :*/ 'hidden'}>Wind</p>
          <p class={/*this.props.selectedOption.map((v) => v === LogControllerOptions.WindTempIsa ? 'visible' :*/ 'hidden'}>°C</p>
          <p class={/*this.props.selectedOption.map((v) => v === LogControllerOptions.WindTempIsa ? 'visible' :*/ 'hidden'}>Dev</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.FuelWt ? 'visible' : 'hidden')}>Rem</p>
          <p class={this.props.selectedOption.map((v) => v === LogControllerOptions.FuelWt ? 'visible' : 'hidden')}>Gross</p>
        </div>
      </div>
    );
  }
}
