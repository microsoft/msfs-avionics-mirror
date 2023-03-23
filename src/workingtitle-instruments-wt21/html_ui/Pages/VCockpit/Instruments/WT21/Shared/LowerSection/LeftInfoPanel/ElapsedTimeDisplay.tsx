import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './ElapsedTimeDisplay.css';

/** @inheritdoc */
interface ElapsedTimeProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  elapsedTimeText: Subscribable<string>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  isVisible: Subscribable<boolean>;
}

/** The ElapsedTime which is displayed in the bottom left of the PFD when active. */
export class ElapsedTimeDisplay extends DisplayComponent<ElapsedTimeProps> {
  private readonly elapsedTimeRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.isVisible.sub(isVisible => {
      this.elapsedTimeRef.instance.classList.toggle('hidden', !isVisible);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="hsi-elapsed-time hidden" ref={this.elapsedTimeRef}>
        <div class="hsi-et-label">ET</div>
        <div class="hsi-et-value">{this.props.elapsedTimeText}</div>
      </div>
    );
  }
}