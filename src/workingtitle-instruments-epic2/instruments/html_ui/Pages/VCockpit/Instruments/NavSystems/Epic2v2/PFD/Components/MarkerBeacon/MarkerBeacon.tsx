import { ComputedSubject, DisplayComponent, EventBus, FSComponent, MarkerBeaconState, NavComEvents, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './MarkerBeacon.css';

/**
 * The properties for the marker beacon component.
 */
interface MarkerBeaconProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/**
 * The PFD vertical deviation indicator.
 */
export class MarkerBeacon extends DisplayComponent<MarkerBeaconProps> {
  private static readonly TEXT = {
    [MarkerBeaconState.Inactive]: '',
    [MarkerBeaconState.Outer]: 'O',
    [MarkerBeaconState.Middle]: 'M',
    [MarkerBeaconState.Inner]: 'I',
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
    const nav = this.props.bus.getSubscriber<NavComEvents>();
    nav.on('marker_beacon_state').whenChanged().handle(this.onMarkerBeacon);
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
      <div class={{ 'marker-beacon-box': true, 'hidden': this.props.declutter }} ref={this.mkrBcnBoxRef}>{this.textSub}</div>
    );
  }
}
