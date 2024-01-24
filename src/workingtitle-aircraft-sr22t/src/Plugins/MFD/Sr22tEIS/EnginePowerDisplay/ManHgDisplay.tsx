import { DisplayComponent, FSComponent, VNode, ComponentProps, Subscribable } from '@microsoft/msfs-sdk';
import './ManHgDisplay.css';

/** The properties for the {@link ManHgDisplay} component. */
interface ManHgDisplayProps extends ComponentProps {
  /** The value subject. */
  value: Subscribable<string>;
}

/** The ManHgDisplay component. Displays Engine's RPM number. */
export class ManHgDisplay extends DisplayComponent<ManHgDisplayProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="eis-engine-man-hg-row">
        <div class="man-hg-label">Man "Hg</div>
        <div class="man-hg-value">{this.props.value}</div>
      </div>
    );
  }
}