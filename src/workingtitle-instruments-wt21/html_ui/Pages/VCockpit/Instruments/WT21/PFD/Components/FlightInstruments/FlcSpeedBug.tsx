import { AdcEvents, APEvents, APVerticalModes, ConsumerSubject, EventBus, FSComponent, MappedSubject, VNode } from '@microsoft/msfs-sdk';

import { WT21ControlEvents } from '../../../Shared/WT21ControlEvents';
import { SpeedBug, SpeedBugProps } from './SpeedBug';

/**
 * The properties for the FlcSpeedBug component.
 */
interface FlcSpeedBugProps extends SpeedBugProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The FlcSpeedBug component.
 */
export class FlcSpeedBug extends SpeedBug<FlcSpeedBugProps> {

  private readonly isMach = ConsumerSubject.create(null, false);
  private readonly iasCurrent = ConsumerSubject.create(null, 0);
  private readonly iasSelected = ConsumerSubject.create(null, 0).pause();
  private readonly machSelected = ConsumerSubject.create(null, 0).pause();
  private readonly machToKias = ConsumerSubject.create(null, 0).pause();

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.setIsVisible(true);

    const sub = this.props.bus.getSubscriber<APEvents & WT21ControlEvents & AdcEvents>();

    this.iasCurrent.setConsumer(sub.on('ias').withPrecision(0));
    this.iasSelected.setConsumer(sub.on('ap_ias_selected').withPrecision(0));
    this.machSelected.setConsumer(sub.on('ap_mach_selected').withPrecision(3));
    this.machToKias.setConsumer(sub.on('mach_to_kias_factor').withPrecision(6));

    this.isMach.setConsumer(sub.on('ap_selected_speed_is_mach'))
      .sub(isMach => {
        if (isMach) {
          this.iasSelected.pause();
          this.machSelected.resume();
          this.machToKias.resume();
        } else {
          this.machSelected.pause();
          this.machToKias.pause();
          this.iasSelected.resume();
        }
      }, true);

    MappedSubject.create(
      ([isMach, ias, mach, machToKias]): number => {
        return Math.round(isMach ? mach * machToKias : ias);
      },
      this.isMach,
      this.iasSelected,
      this.machSelected,
      this.machToKias
    ).sub((iasSelected) => {
      this.setBugSpeed(iasSelected);
      this.updateBug(this.iasCurrent.get());
    });

    sub.on('fma_modes').handle((v) => {
      this.setIsVisible(v.verticalActive == APVerticalModes.FLC);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flc-bug hidden" ref={this.bugContainerRef} >
        <svg width="33" height="25">
          <path d='M 1 14 l 14 -8 l 13 0 l 0 16 l -13 0 l -14 -8 z' stroke-width="2px" fill="none" stroke="var(--wt21-colors-cyan)" />
        </svg>
      </div>
    );
  }
}