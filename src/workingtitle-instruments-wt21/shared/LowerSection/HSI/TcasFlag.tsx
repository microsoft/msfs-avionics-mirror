import {
  AvionicsSystemState, AvionicsSystemStateEvent, ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject,
  Subject, TcasEvents, VNode
} from '@microsoft/msfs-sdk';

import { TransponderSystemEvents } from '../../Systems/TransponderSystem';

import './TcasFlag.css';

/** The properties for the {@link TcasFlag} component. */
interface TcasFlagProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** The TcasFlag component. */
export class TcasFlag extends DisplayComponent<TcasFlagProps> {
  private readonly tcasFlagRef = FSComponent.createRef<HTMLDivElement>();
  private readonly isTcasAvail = ComputedSubject.create(false, (v) => {
    return v ? 'TRAFFIC' : 'TCAS FAIL';
  });
  private readonly hasRA = Subject.create(false);

  /** @inheritdoc */
  public onAfterRender(): void {
    const tssEvents = this.props.bus.getSubscriber<TransponderSystemEvents>();
    tssEvents.on('transponder_state').whenChanged().handle(this.onTssStateChanged.bind(this));

    const tcasSub = this.props.bus.getSubscriber<TcasEvents>();
    const hasAlert = MappedSubject.create(([ta, ra]): boolean => {
      this.hasRA.set(ra > 0);
      return (ta + ra) > 0;
    },
      ConsumerSubject.create(tcasSub.on('tcas_ta_intruder_count'), 0),
      ConsumerSubject.create(tcasSub.on('tcas_ra_intruder_count'), 0)
    );

    hasAlert.sub((v) => {
      this.tcasFlagRef.instance.classList.toggle('alert', v);
    }, true);

    this.hasRA.sub((v) => {
      this.tcasFlagRef.instance.classList.toggle('ra', v);
    }, true);
  }

  /**
   * A callback called when the TSS system state changes.
   * @param state The state change event to handle.
   */
  private onTssStateChanged(state: AvionicsSystemStateEvent): void {
    this.isTcasAvail.set(state.current == AvionicsSystemState.On);
    this.tcasFlagRef.instance.classList.toggle('fail', state.current == AvionicsSystemState.Failed || state.current === AvionicsSystemState.Off);
    this.tcasFlagRef.instance.classList.toggle('align', state.current == AvionicsSystemState.Initializing);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div class="hsi-tcas-flag" ref={this.tcasFlagRef}>{this.isTcasAvail}</div>
      </>
    );
  }
}
