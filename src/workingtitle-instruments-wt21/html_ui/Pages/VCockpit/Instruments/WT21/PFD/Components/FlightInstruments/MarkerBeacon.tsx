import { ComputedSubject, DisplayComponent, EventBus, FSComponent, MarkerBeaconState, NavProcSimVars, VNode } from '@microsoft/msfs-sdk';

import './MarkerBeacon.css';

/**
 * The properties for the Marker Beacon component.
 */
interface MarkerBeaconProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The Marker Beacon Display Component.
 */
export class MarkerBeacon extends DisplayComponent<MarkerBeaconProps> {
  private static readonly TEXT = {
    [MarkerBeaconState.Inactive]: '',
    [MarkerBeaconState.Outer]: 'OM',
    [MarkerBeaconState.Middle]: 'MM',
    [MarkerBeaconState.Inner]: 'IM',
  };

  private readonly mkrBcnBoxRef = FSComponent.createRef<HTMLElement>();

  private readonly textSub = ComputedSubject.create<MarkerBeaconState, string>(
    MarkerBeaconState.Inactive,
    state => MarkerBeacon.TEXT[state]
  );

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const nav = this.props.bus.getSubscriber<NavProcSimVars>();
    nav.on('mkr_bcn_state_simvar').whenChanged().handle(this.onMarkerBeacon);
  }

  /**
   * A method called when the marker beacon state has changed.
   * @param state is the marker beacon state.
   */
  private onMarkerBeacon = (state: MarkerBeaconState): void => {
    this.textSub.set(state);
    switch (state) {
      case MarkerBeaconState.Inactive:
        this.mkrBcnBoxRef.instance.classList.remove('outer-animation', 'middle-animation', 'inner-animation');
        break;
      case MarkerBeaconState.Outer:
        this.mkrBcnBoxRef.instance.classList.remove('middle-animation', 'inner-animation');
        this.mkrBcnBoxRef.instance.classList.add('outer-animation');
        break;
      case MarkerBeaconState.Middle:
        this.mkrBcnBoxRef.instance.classList.remove('outer-animation', 'inner-animation');
        this.mkrBcnBoxRef.instance.classList.add('middle-animation');
        break;
      case MarkerBeaconState.Inner:
        this.mkrBcnBoxRef.instance.classList.remove('outer-animation', 'middle-animation');
        this.mkrBcnBoxRef.instance.classList.add('inner-animation');
        break;
    }
  };

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="marker-beacon-flag" ref={this.mkrBcnBoxRef}>{this.textSub}</div>
    );
  }
}
