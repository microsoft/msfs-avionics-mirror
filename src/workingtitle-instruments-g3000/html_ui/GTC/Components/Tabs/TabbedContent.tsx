import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

/** Properties for TabbedContent */
export interface TabbedContentProps extends ComponentProps {
  /** The position of the tab */
  position: number;

  /** The text to be displayed in the tab */
  label: string;

  /** Whether the tab is permanently disabled. Defaults to `false`. */
  disabled?: boolean;

  /** Optional lifecycle method called when the active tab is unselected */
  onPause?: () => void;

  /** Optional lifecycle method called when the active tab is selected */
  onResume?: () => void;

  /** Optional lifecycle method called when the tab is destroyed. */
  onDestroy?: () => void;
}

/** A TabbedContent item to be nested under a TabbedContainer */
export class TabbedContent extends DisplayComponent<TabbedContentProps> {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** Invokes the onPause lifecycle method if it was defined on the component */
  public onPause(): void {
    this.props.onPause && this.props.onPause();
  }

  /** Invokes the onResume lifecycle method if it was defined on the component */
  public onResume(): void {
    this.props.onResume && this.props.onResume();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>{this.props.children}</>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}