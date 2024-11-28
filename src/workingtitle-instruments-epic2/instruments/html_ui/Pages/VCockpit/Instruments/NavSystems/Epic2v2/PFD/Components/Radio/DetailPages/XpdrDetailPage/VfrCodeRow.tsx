import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './VfrCodeRow.css';

/** The properties for the {@link VfrCodeRow} component. */
interface VfrCodeRowProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;

  /** The current active VFR code. */
  readonly vfrCode: Subscribable<number>;

  /** Whether the VFR CODE box is selected and highlighted. */
  readonly isSelected: Subscribable<boolean>;
}



/** The VfrCodeRow component. */
export class VfrCodeRow extends DisplayComponent<VfrCodeRowProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="epic2-xpdr-detail-page-vfr-code-row">
        <div class='epic2-xpdr-vfr-code'>
          <div class='epic2-vfr-code-label'>VFR CODE</div>
          <div class={{
            'epic2-vfr-code-value': true,
            'epic2-xpdr-vfr-code-active': this.props.isSelected,
          }}>{this.props.vfrCode.map((v) => v.toString(8).padStart(4, '0'))}</div>
        </div>

        <div class='epic2-xpdr-reply'>
          <div class='epic2-xpdr-reply-label'>REPLY</div>
          <div class='epic2-xpdr-reply-signal-circle'></div>
        </div>
      </div>
    );
  }
}
