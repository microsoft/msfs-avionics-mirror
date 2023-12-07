import { ComponentProps, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { DisplayUnitLayout } from '../../Config/DisplayUnitConfig';

import './ElapsedTimeDisplay.css';

/** @inheritdoc */
interface ElapsedTimeProps extends ComponentProps {
  // eslint-disable-next-line jsdoc/require-jsdoc
  elapsedTimeText: Subscribable<string>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  isVisible: Subscribable<boolean>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  displayUnitLayout: DisplayUnitLayout;
}

/** The ElapsedTime which is displayed in the bottom left of the PFD when active. */
export class ElapsedTimeDisplay extends DisplayComponent<ElapsedTimeProps> {
  private readonly elapsedTimeRef = FSComponent.createRef<HTMLDivElement>();

  private readonly hidden = Subject.create(true);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.isVisible.sub(isVisible => this.hidden.set(!isVisible));
  }

  /** @inheritdoc */
  public render(): VNode {
    const isUsingSoftkeys = this.props.displayUnitLayout === DisplayUnitLayout.Softkeys;

    return (
      <div
        ref={this.elapsedTimeRef}
        class={{
          'hsi-elapsed-time': true,
          'hsi-elapsed-time-side-buttons': isUsingSoftkeys,
          'hidden': isUsingSoftkeys ? false : this.hidden,
        }}
      >
        {isUsingSoftkeys && (
          <svg class="hsi-et-arrow" viewBox="0 0 10 14">
            <path d="M 7, 2 l -4, 5 l 4, 5" stroke-width={1.5} stroke="white" />
          </svg>
        )}

        <div class="hsi-et-label">ET</div>
        <div class={{ 'hsi-et-value': true, 'hidden': isUsingSoftkeys ? this.hidden : false }}>{this.props.elapsedTimeText}</div>
      </div>
    );
  }
}