import { DisplayComponent, FSComponent, VNode, ComponentProps, Subscribable } from '@microsoft/msfs-sdk';
import './RpmDisplay.css';

/** The properties for the {@link RpmDisplay} component. */
interface RpmDisplayProps extends ComponentProps {
  /** The value subject. */
  value: Subscribable<number>;
}

/** The RpmDisplay component. Displays Engine's RPM number. */
export class RpmDisplay extends DisplayComponent<RpmDisplayProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="eis-engine-rpm-row">
        <div class="rpm-label">RPM</div>
        <div class="rpm-value">{this.props.value}</div>
      </div>
    );
  }
}