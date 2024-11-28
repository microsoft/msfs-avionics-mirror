import { ComponentProps, DisplayComponent, EventBus, FSComponent, GPSSatComputerEvents, GPSSystemState, LNavUtils, Subject, VNode } from '@microsoft/msfs-sdk';

import { CdiScaleFormatter, CDIScaleLabel, LNavDataEvents } from '@microsoft/msfs-garminsdk';

import './StatusPane.css';

/**
 * Props on the StatusPane component.
 */
interface StatusPaneProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The index of the LNAV used by the pane's parent instrument. */
  lnavIndex: number;
}
/**
 * A component that displays the current instrument and CDI scaling status.
 */
export class StatusPane extends DisplayComponent<StatusPaneProps> {
  private readonly cdiScaleFormatter = CdiScaleFormatter.create(false);
  private readonly cdiScaleLabel = Subject.create<string>(this.cdiScaleFormatter(CDIScaleLabel.Enroute));
  private readonly scaleEl = FSComponent.createRef<HTMLDivElement>();
  private readonly integEl = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.props.lnavIndex);

    this.props.bus.getSubscriber<LNavDataEvents>().on(`lnavdata_cdi_scale_label${lnavTopicSuffix}`)
      .whenChanged()
      .handle(this.onCdiScaleChanged.bind(this));

    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(s => {
      if (s === GPSSystemState.Searching || s === GPSSystemState.Acquiring) {
        this.integEl.instance.classList.remove('hide-element');
      } else {
        this.integEl.instance.classList.add('hide-element');
      }
    });
  }

  /**
   * Handles when the CDI scale changes.
   * @param cdiScale The new CDI scale.
   */
  private onCdiScaleChanged(cdiScale: CDIScaleLabel): void {
    const isRnav = cdiScale >= CDIScaleLabel.LNav && cdiScale <= CDIScaleLabel.LPV;
    if (isRnav) {
      this.scaleEl.instance.classList.add('cdi-scale-rnav');
    } else {
      this.scaleEl.instance.classList.remove('cdi-scale-rnav');
    }

    this.cdiScaleLabel.set(this.cdiScaleFormatter(cdiScale));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='status-pane'>
        <div></div>
        <div>
          <div ref={this.scaleEl}>{this.cdiScaleLabel}</div>
        </div>
        <div>
          <div class='status-pane-integ hide-element' ref={this.integEl}>INTEG</div>
        </div>
      </div>
    );
  }
}