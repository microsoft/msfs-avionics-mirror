import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { Epic2Fms, TouchButton } from '@microsoft/msfs-epic2-shared';

import './ActivatePlanButtonBar.css';

/** The properties for the {@link ActivatePlanButtonBar} component. */
interface ActivatePlanButtonBarProps extends ComponentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
}

/** The ActivatePlanButtonBar component. */
export class ActivatePlanButtonBar extends DisplayComponent<ActivatePlanButtonBarProps> {
  private readonly onActivatePressed = (): void => {
    this.props.fms.activatePlan();
  };

  private readonly onRemoveWptPressed = (): void => {
    // TODO
  };

  private readonly onCancelPressed = (): void => {
    this.props.fms.cancelMod();
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'activate-plan-button-bar': true,
          'hidden': this.props.fms.planInMod.map(x => !x),
        }}
      >
        <div class="plan-bar-wrapper touch-button-bar-image-border">
          <TouchButton variant="bar" label="Activate" isHighlighted={true} onPressed={this.onActivatePressed} />
          <TouchButton variant="bar" label="Remove<br />Wpt" isEnabled={false} onPressed={this.onRemoveWptPressed} />
          <TouchButton variant="bar" label="Cancel" isHighlighted={true} onPressed={this.onCancelPressed} />
        </div>
      </div>
    );
  }
}
