import { APEvents, APVerticalModes, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { WT21ControlEvents } from '../../../Shared/WT21ControlEvents';

import './AirspeedSelectBox.css';

/**
 * The properties for the AirspeedSelectBox component.
 */
interface AirspeedSelectBoxProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The AirspeedSelectBox component.
 */
export class AirspeedSelectBox extends DisplayComponent<AirspeedSelectBoxProps> {
  private readonly selectedSpeedRef = FSComponent.createRef<HTMLDivElement>();

  private readonly isMach = ConsumerSubject.create(null, false);
  private readonly iasSelected = ConsumerSubject.create(null, 0);
  private readonly machSelected = ConsumerSubject.create(null, 0);

  private readonly selectedSpeedTextSub = MappedSubject.create(
    ([isMach, ias, mach]): string => {
      return isMach ? `M${mach.toFixed(2).replace(/^0+/, '')}` : `${ias.toFixed(0)}`;
    },
    this.isMach,
    this.iasSelected,
    this.machSelected
  );

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<WT21ControlEvents & APEvents>();

    this.isMach.setConsumer(sub.on('ap_selected_speed_is_mach'));
    this.iasSelected.setConsumer(sub.on('ap_ias_selected').withPrecision(0));
    this.machSelected.setConsumer(sub.on('ap_mach_selected').withPrecision(3));

    this.props.bus.getSubscriber<WT21ControlEvents>().on('fma_modes').handle((v) => {
      this.selectedSpeedRef.instance.classList.toggle('hidden', v.verticalActive != APVerticalModes.FLC);
    });
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="select-box hidden" ref={this.selectedSpeedRef}>
        <svg>
          <path d='M 4 13 l 16 -9.5 l 13 0 l 0 19 l -13 0 l -16 -9.5 z' stroke="var(--wt21-colors-cyan)" stroke-width="2px" fill="none" />
        </svg>
        <div class="select-value">{this.selectedSpeedTextSub}</div>
      </div>
    );
  }
}