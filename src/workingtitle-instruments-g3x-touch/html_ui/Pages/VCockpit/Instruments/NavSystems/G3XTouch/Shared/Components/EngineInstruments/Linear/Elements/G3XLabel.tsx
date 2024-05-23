import { DisplayComponent, FSComponent, VNode, XMLDoubleHorizontalGaugeProps, XMLHorizontalGaugeProps, Subscribable } from '@microsoft/msfs-sdk';

/** Properties for the gauge's title element. */
interface LabelProps {
  /** Title for header. */
  label: Subscribable<string>;
}

/** The title of a gauge, with alerting functions. */
export class G3XLabel extends DisplayComponent<(Partial<XMLHorizontalGaugeProps> | Partial<XMLDoubleHorizontalGaugeProps>) & LabelProps> {
  private readonly titleRef = FSComponent.createRef<SVGTextElement>();
  private readonly textContent = this.props.label.map((label) => {
    let content = label;
    if (this.props.unit) {
      content += ` ${this.props.unit}`;
    }
    return content;
  });

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class='horizontal-label'
        ref={this.titleRef}
      >
        {this.textContent}
      </div>
    );
  }
}