import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './MenuTab.css';

/** The tab props. */
interface TabProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** label */
  tabLabel: string;
  /** assigned label class */
  tabLabelClass: string;
  /** svg image */
  tabSvg?: string | VNode;
  /** assigned SVG class */
  tabSvgClass?: string;
}

/** The TSC tab menu section container. */
export class MenuTab extends DisplayComponent<TabProps> {

  private readonly tabRootRef = FSComponent.createRef<HTMLElement>();
  private readonly tabLabelRef = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.tabLabelRef.instance.classList.add(this.props.tabLabelClass);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="tsc-menu-tab" ref={this.tabRootRef}>
      <div ref={this.tabLabelRef}>{this.props.tabLabel}</div>
      {this.props.tabSvg && <div class={this.props.tabSvgClass} >{this.props.tabSvg}</div>}
    </div>;
  }
}
